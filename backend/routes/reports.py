import os
import uuid
import shutil
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

import database
import models
import schemas
import auth
from services.ai_inference import analyze_brain_scan
from services.pdf_generator import generate_pdf_report
from services.documentation import get_awareness_document, get_all_available_documents, generate_first_aid_quick_reference

router = APIRouter(prefix="/api/reports", tags=["Reports & Diagnostics"])

# Setup directories from env or default
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
HEATMAP_DIR = os.getenv("HEATMAP_DIR", "./heatmaps")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(HEATMAP_DIR, exist_ok=True)

# Image upload validation rules
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB

@router.post("/analyze", response_model=schemas.ReportOut)
def analyze_scan(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Uploads a brain CT/MRI scan, runs lightweight deep learning and digital image density
    analysis, generates a Grad-CAM heatmap, saves records in SQLite, and returns diagnostic results.
    Uses normal def to offload CPU-bound inference to FastAPI's background thread-pool.
    """
    # 1. File validation
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Please upload standard scan formats: PNG, JPG, JPEG, BMP, or WebP."
        )
        
    # Check file size (Read chunk)
    try:
        content = file.file.read(MAX_FILE_SIZE + 1)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Uploaded scan file is too large. Keep file size under 10 MB."
            )
        file.file.seek(0) # Reset pointer
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error reading uploaded scan file."
        )

    # 2. Assign unique filenames to avoid naming collisions
    unique_id = uuid.uuid4().hex
    stored_img_name = f"scan_{unique_id}{ext}"
    stored_heatmap_name = f"heatmap_{unique_id}{ext}"
    
    original_img_path = os.path.join(UPLOAD_DIR, stored_img_name)
    heatmap_img_path = os.path.join(HEATMAP_DIR, stored_heatmap_name)

    # 3. Save uploaded scan file
    try:
        with open(original_img_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to securely save upload image on CPU disk: {str(e)}"
        )

    # 4. Trigger Hybrid AI diagnostic module
    try:
        metrics = analyze_brain_scan(original_img_path, heatmap_img_path)
    except Exception as inference_err:
        # Cleanup uploaded scan on failure
        if os.path.exists(original_img_path):
            os.remove(original_img_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI inference pipeline failure: {str(inference_err)}"
        )

    # 5. Save report data to database using relative serving paths
    new_report = models.Report(
        user_id=current_user.id,
        image_path=f"uploads/{stored_img_name}",
        heatmap_path=f"heatmaps/{stored_heatmap_name}",
        prediction=metrics["prediction"],
        confidence=metrics["confidence"],
        hemorrhage_percentage=metrics["hemorrhage_percentage"],
        stroke_risk=metrics["stroke_risk"],
        epilepsy_risk=metrics["epilepsy_risk"],
        risk_level=metrics["risk_level"],
        hemorrhage_detection_score=metrics.get("hemorrhage_detection_score", 0.0),
        hemorrhage_location=metrics.get("hemorrhage_location", "N/A"),
        location_confidence=metrics.get("location_confidence", 0.0),
        dataset_source=metrics.get("dataset_source", "real-time"),
        model_accuracy=metrics.get("model_accuracy", metrics["confidence"]),
        is_emergency=metrics.get("is_emergency", False),
        first_aid_needed=metrics.get("first_aid_needed", False),
        first_aid_recommendations=metrics.get("first_aid_recommendations", ""),
        hemorrhage_distribution=metrics.get("hemorrhage_distribution", "{}")
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report

@router.get("/my-history", response_model=List[schemas.ReportOut])
def get_user_scan_history(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Fetches the scan history of the logged-in patient, sorted chronologically by most recent.
    """
    reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id
    ).order_by(models.Report.created_at.desc()).all()
    
    return reports

@router.get("/view/{report_id}", response_model=schemas.ReportOut)
def view_single_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Retrieves the details of a single report, checking user ownership.
    Admins are authorized to view any patient scan report.
    """
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested brain scan report not found."
        )
        
    if report.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation denied. You do not own this diagnostic record."
        )
        
    return report

@router.delete("/{report_id}")
def delete_user_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Deletes an existing scan report. Cleans up stored image files.
    Allows owners and admins to perform deletions.
    """
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brain scan report not found for deletion."
        )
        
    if report.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation denied. You are not authorized to delete this record."
        )
        
    # Attempt files deletion
    for path in [report.image_path, report.heatmap_path]:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception as io_err:
                print(f"[File cleanup warning] Failed to remove {path}: {io_err}")

    # Remove from database
    db.delete(report)
    db.commit()
    
    return {"status": "success", "message": "Diagnostic report and images successfully deleted."}

@router.get("/download/{report_id}")
def download_pdf_diagnostic_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Compiles patient metadata, scan findings, and imaging heatmaps into
    a customized PDF file, returning it as a streamed binary download.
    """
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target report not found to generate PDF."
        )
        
    # Check user mapping ownership
    if report.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation denied. You do not own this diagnostic record."
        )

    # Fetch patient object
    patient = db.query(models.User).filter(models.User.id == report.user_id).first()
    
    # Path setup for PDF write
    pdf_filename = f"neuroai_report_{report.id}_{uuid.uuid4().hex[:6]}.pdf"
    temp_pdf_path = os.path.join(UPLOAD_DIR, pdf_filename)
    
    try:
        generate_pdf_report(report, patient, temp_pdf_path)
        
        # Read the file to bytes and cleanup immediate file on disk
        with open(temp_pdf_path, "rb") as f:
            pdf_bytes = f.read()
            
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
            
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={pdf_filename}"}
        )
        
    except Exception as pdf_err:
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate clinical PDF document: {str(pdf_err)}"
        )

@router.get("/export")
def export_user_history_data(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Assembles a JSON dump of the user's complete scan history for clinical migrations.
    """
    reports = db.query(models.Report).filter(models.Report.user_id == current_user.id).all()
    
    records = []
    for r in reports:
        records.append({
            "id": r.id,
            "prediction": r.prediction,
            "confidence_score": r.confidence,
            "hemorrhage_severity_index": r.hemorrhage_percentage,
            "stroke_risk_percentage": r.stroke_risk,
            "epilepsy_risk_percentage": r.epilepsy_risk,
            "hemorrhage_location": r.hemorrhage_location,
            "risk_level": r.risk_level,
            "hemorrhage_detection_score": r.hemorrhage_detection_score,
            "analysis_timestamp": r.created_at.strftime('%Y-%m-%d %H:%M:%S UTC'),
            "image_uri": r.image_path,
            "heatmap_uri": r.heatmap_path
        })
        
    json_data = json.dumps(records, indent=2)
    
    return StreamingResponse(
        BytesIO(json_data.encode()),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=neuroai_export_{current_user.id}.json"}
    )

# ============================================================================
# AWARENESS DOCUMENTATION & EDUCATION ENDPOINTS
# ============================================================================

@router.get("/documentation/available")
def get_available_awareness_documents():
    """
    Returns list of all available awareness and educational documents.
    """
    documents = get_all_available_documents()
    return {
        "available_documents": documents,
        "total": len(documents),
        "description": "Educational materials for patient and clinician awareness"
    }

@router.get("/documentation/{doc_type}")
def get_awareness_document_content(doc_type: str):
    """
    Retrieves full content of a specific awareness document.
    Available types: brain_hemorrhage_basics, stroke_epilepsy_connection, 
                   emergency_care_guide, patient_recovery_guide
    """
    doc = get_awareness_document(doc_type)
    if doc.get("title") == "Document Not Found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document type '{doc_type}' not found. Available types: brain_hemorrhage_basics, stroke_epilepsy_connection, emergency_care_guide, patient_recovery_guide"
        )
    return doc

@router.get("/documentation/{doc_type}/download")
def download_awareness_document(doc_type: str):
    """
    Downloads awareness document as a text file (.txt).
    """
    doc = get_awareness_document(doc_type)
    if doc.get("title") == "Document Not Found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document type '{doc_type}' not found."
        )
    
    # Create text content
    content = f"{doc['title']}\n" + "="*60 + "\n\n" + doc['content']
    
    filename = f"NeuroAI_{doc_type}_{uuid.uuid4().hex[:6]}.txt"
    
    return StreamingResponse(
        BytesIO(content.encode()),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/documentation/quick-reference/first-aid")
def get_first_aid_quick_reference():
    """
    Returns a quick reference card for first-aid emergency response.
    Includes F.A.S.T. protocol and immediate action steps.
    """
    reference = generate_first_aid_quick_reference()
    return {
        "title": "Emergency First-Aid Quick Reference",
        "content": reference,
        "format": "text"
    }

@router.get("/documentation/quick-reference/first-aid/download")
def download_first_aid_quick_reference():
    """
    Downloads quick reference card as a text file.
    """
    reference = generate_first_aid_quick_reference()
    filename = f"FirstAid_QuickReference_{uuid.uuid4().hex[:6]}.txt"
    
    return StreamingResponse(
        BytesIO(reference.encode()),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
