import os
import uuid
import shutil
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
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
    patient_id: str = Form(None),
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
        search_filename = filename
        if patient_id and patient_id != "none":
            search_filename = f"{patient_id}_{filename}"
        metrics = analyze_brain_scan(original_img_path, heatmap_img_path, original_filename=search_filename)
    except Exception as inference_err:
        # Cleanup uploaded scan on failure
        if os.path.exists(original_img_path):
            os.remove(original_img_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI inference pipeline failure: {str(inference_err)}"
        )

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
        hemorrhage_distribution=metrics.get("hemorrhage_distribution", "{}"),
        cortical_involvement=metrics.get("cortical_involvement", False),
        hemorrhage_volume=metrics.get("hemorrhage_volume", 0.0),
        midline_shift=metrics.get("midline_shift", 0.0),
        early_seizure_risk=metrics.get("early_seizure_risk", 0.0),
        late_epilepsy_risk=metrics.get("late_epilepsy_risk", 0.0),
        patient_age=metrics.get("patient_age", 45),
        
        # New multi-task columns
        prob_hemorrhage=metrics.get("prob_hemorrhage", 0.0),
        prob_edh=metrics.get("prob_edh", 0.0),
        prob_sdh=metrics.get("prob_sdh", 0.0),
        prob_sah=metrics.get("prob_sah", 0.0),
        prob_iph=metrics.get("prob_iph", 0.0),
        prob_ivh=metrics.get("prob_ivh", 0.0),
        prob_fracture=metrics.get("prob_fracture", 0.0),
        
        # Clinical Assessment Engine Columns
        idi=metrics.get("idi", 0.0),
        her=metrics.get("her", 0.0),
        srs=metrics.get("srs", 0.0),
        treatment_recommendation=metrics.get("treatment_recommendation", "Routine (>24 hours)"),
        esi=metrics.get("esi", 0.0),
        rcf=metrics.get("rcf", 0.0),
        hi=metrics.get("hi", 0.0),
        sfs=metrics.get("sfs", 0.0),
        ev=metrics.get("ev", 0.0),
        cp=metrics.get("cp", 0.0),
        
        primary_diagnosis=metrics.get("primary_diagnosis"),
        secondary_diagnosis=metrics.get("secondary_diagnosis"),
        multilabel_matrix=metrics.get("multilabel_matrix"),
        affected_region=metrics.get("affected_region"),
        region_confidence=metrics.get("region_confidence", 0.0),
        region_percentage=metrics.get("region_percentage", 0.0),
        segmentation_mask_path=metrics.get("segmentation_mask_path"),
        total_hemorrhage_area=metrics.get("total_hemorrhage_area", 0.0),
        ischemic_stroke_risk=metrics.get("ischemic_stroke_risk", 0.0),
        hemorrhagic_stroke_risk=metrics.get("hemorrhagic_stroke_risk", 0.0),
        recurrent_stroke_risk=metrics.get("recurrent_stroke_risk", 0.0),
        has_diabetes=metrics.get("has_diabetes", False),
        has_hypertension=metrics.get("has_hypertension", False),
        has_smoking_history=metrics.get("has_smoking_history", False),
        blood_pressure=metrics.get("blood_pressure", "120/80"),
        survival_30d=metrics.get("survival_30d", 100.0),
        survival_1y=metrics.get("survival_1y", 100.0),
        gcs_score=metrics.get("gcs_score", 15),
        ivh_presence=metrics.get("ivh_presence", False),
        time_to_treatment=metrics.get("time_to_treatment", 1),
        recovery_score=metrics.get("recovery_score", 100.0),
        functional_independence_prob=metrics.get("functional_independence_prob", 100.0),
        rehabilitation_requirement=metrics.get("rehabilitation_requirement", "None"),
        recovery_outcome=metrics.get("recovery_outcome", "Good Recovery"),
        triage_priority=metrics.get("triage_priority", 4),
        triage_badge=metrics.get("triage_badge", "Low"),
        triage_response_time=metrics.get("triage_response_time", "Routine"),
        doctor_approved=metrics.get("doctor_approved", "pending")
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

@router.post("/predict-epilepsy", response_model=schemas.EpilepsyPredictionResponse)
def predict_epilepsy_risk_endpoint(
    req: schemas.EpilepsyPredictionRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Predicts early seizure risk and late epilepsy risk based on clinical findings:
    Hemorrhage Type, Cortical Involvement, Hemorrhage Volume (mL), Midline Shift (mm), and Patient Age.
    """
    has_bleed = req.hemorrhage_type != "None"
    
    # --- 1. Early Seizure Risk (within 7 days) ---
    early_base = 0.0
    if has_bleed:
        if req.hemorrhage_type in ["Subarachnoid Hemorrhage", "Intracerebral Hemorrhage", "Multiple"]:
            early_base = 15.0
        elif req.hemorrhage_type == "Subdural Hematoma":
            early_base = 10.0
        else: # Epidural Hematoma
            early_base = 5.0
            
    early_risk = early_base
    if req.cortical_involvement:
        early_risk += 20.0
        
    early_risk += min(25.0, req.hemorrhage_volume * 0.4)
    early_risk += min(15.0, req.midline_shift * 1.5)
    
    if req.age < 18:
        early_risk += 10.0
    elif req.age > 65:
        early_risk += 5.0
        
    early_seizure_risk = round(min(90.0, max(0.0, early_risk)), 2)
    
    # --- 2. Late Epilepsy Risk (after 7 days / long-term) ---
    late_base = 0.0
    if has_bleed:
        if req.hemorrhage_type in ["Subarachnoid Hemorrhage", "Intracerebral Hemorrhage", "Multiple"]:
            late_base = 20.0
        elif req.hemorrhage_type == "Subdural Hematoma":
            late_base = 12.0
        else: # Epidural Hematoma
            late_base = 4.0
            
    late_risk = late_base
    if req.cortical_involvement:
        late_risk += 25.0
        
    late_risk += min(30.0, req.hemorrhage_volume * 0.5)
    late_risk += min(20.0, req.midline_shift * 2.0)
    
    if req.age > 65:
        late_risk += 10.0
        
    late_epilepsy_risk = round(min(95.0, max(0.0, late_risk)), 2)
    
    # --- 3. Combined Epilepsy Probability ---
    # Combined probability P(A or B) = P(A) + P(B) - P(A)*P(B)
    p_early = early_seizure_risk / 100.0
    p_late = late_epilepsy_risk / 100.0
    p_combined = p_early + p_late - (p_early * p_late)
    epilepsy_probability = round(p_combined * 100.0, 2)
    
    # --- 4. Risk Level ---
    if epilepsy_probability >= 50.0:
        risk_level = "High"
    elif epilepsy_probability >= 20.0:
        risk_level = "Moderate"
    else:
        risk_level = "Low"
        
    # Seizure prophylaxis recommended
    seizure_prophylaxis = epilepsy_probability >= 35.0 or (req.cortical_involvement and has_bleed)
    
    # --- 5. Clinical Explanation ---
    exp_parts = []
    exp_parts.append(
        f"The patient (Age: {req.age}) presents with a calculated overall epilepsy propensity of {epilepsy_probability}%."
    )
    if has_bleed:
        exp_parts.append(
            f"This is driven by a {req.hemorrhage_type} with an estimated volume of {req.hemorrhage_volume} mL and a midline shift of {req.midline_shift} mm."
        )
        if req.cortical_involvement:
            exp_parts.append(
                "Direct cortical involvement significantly elevates the threshold for both early spikes and late focal gliosis."
            )
        else:
            exp_parts.append(
                "No direct cortical involvement is reported, reducing the likelihood of immediate contact-driven seizure focal points."
            )
    else:
        exp_parts.append("In the absence of an active intracranial bleed, the seizure probability remains low.")
        
    if req.midline_shift > 5.0:
        exp_parts.append(
            f"Significant midline shift ({req.midline_shift} mm) indicates mechanical brain herniation/shear stresses, compounding late epilepsy risks."
        )
    clinical_explanation = " ".join(exp_parts)
    
    # --- 6. Recommendations ---
    recs = []
    if risk_level == "High":
        recs.append("• Initiate continuous video EEG monitoring in an ICU environment.")
        recs.append("• Consult neuro-critical care immediately for therapeutic anti-seizure drug dosing.")
        recs.append("• Implement comprehensive seizure safety precautions (padded rails, accessible suction).")
    elif risk_level == "Moderate":
        recs.append("• Recommend routine 24-hour spot EEG follow-ups.")
        recs.append("• Active bedside observation for subclinical seizure signs (focal twitching, sudden gaze deviaton).")
        recs.append("• Baseline neurology consultation within 24 hours.")
    else:
        recs.append("• Standard clinical checks. Routine anti-epileptic drug prophylaxis is not indicated.")
        
    if seizure_prophylaxis:
        recs.append("• Indicated for short-term seizure prophylaxis (e.g. Levetiracetam 500mg BID for 7 days).")
        
    recs.append("• Maintain normothermia, normal pO2, and strict electrolyte balance (especially Na+) to optimize seizure threshold.")
    
    return schemas.EpilepsyPredictionResponse(
        early_seizure_risk=early_seizure_risk,
        late_epilepsy_risk=late_epilepsy_risk,
        epilepsy_probability=epilepsy_probability,
        risk_level=risk_level,
        clinical_explanation=clinical_explanation,
        seizure_prophylaxis_recommended=seizure_prophylaxis,
        recommendations=recs
    )

@router.post("/validate/{report_id}")
def validate_report(
    report_id: int,
    data: dict,  # Expecting approved (str: 'approved'/'rejected'), doctor_diagnosis (str), doctor_notes (str)
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Neurologist validation of automated AI diagnosis report.
    Allows approval/rejection and editing/overriding diagnosis.
    """
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.doctor_approved = data.get("approved", "approved")
    report.doctor_diagnosis = data.get("doctor_diagnosis", report.prediction)
    report.doctor_notes = data.get("doctor_notes", "")
    
    db.commit()
    db.refresh(report)
    return {
        "status": "success",
        "message": "Report validation updated",
        "report_id": report_id,
        "doctor_approved": report.doctor_approved,
        "doctor_diagnosis": report.doctor_diagnosis,
        "doctor_notes": report.doctor_notes
    }