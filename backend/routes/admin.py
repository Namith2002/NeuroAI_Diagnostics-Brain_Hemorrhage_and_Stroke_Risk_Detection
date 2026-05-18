from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import database
import models
import schemas
import auth

router = APIRouter(prefix="/api/admin", tags=["Administrative Controls"])

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    """
    Returns a complete directory of all registered system users.
    Restricted to Admin accounts.
    """
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return users

@router.get("/reports", response_model=List[schemas.ReportOut])
def get_all_patient_reports(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    """
    Returns a unified ledger of all uploaded brain scans across all users.
    Restricted to Admin accounts.
    """
    reports = db.query(models.Report).order_by(models.Report.created_at.desc()).all()
    return reports

@router.get("/statistics", response_model=schemas.SystemStats)
def get_system_wide_statistics(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
):
    """
    Computes global metrics and risk distributions across the entire network,
    feeding active statistics widgets in the Admin Dashboard.
    Restricted to Admin accounts.
    """
    total_users = db.query(models.User).count()
    total_scans = db.query(models.Report).count()
    
    hemorrhage_count = db.query(models.Report).filter(
        models.Report.prediction == "Hemorrhage Detected"
    ).count()
    
    normal_count = db.query(models.Report).filter(
        models.Report.prediction == "Normal (No Hemorrhage)"
    ).count()
    
    low_risk_count = db.query(models.Report).filter(
        models.Report.risk_level == "Low"
    ).count()
    
    moderate_risk_count = db.query(models.Report).filter(
        models.Report.risk_level == "Moderate"
    ).count()
    
    high_risk_count = db.query(models.Report).filter(
        models.Report.risk_level == "High"
    ).count()

    # Calculate average confidence across all predictions
    avg_confidence = 0.0
    avg_severity = 0.0
    
    if total_scans > 0:
        confidences = [r.confidence for r in db.query(models.Report.confidence).all()]
        avg_confidence = sum(confidences) / len(confidences)
        
        # Severity average on acute hemorrhages
        severities = [r.hemorrhage_percentage for r in db.query(models.Report.hemorrhage_percentage).filter(models.Report.hemorrhage_percentage > 0).all()]
        if severities:
            avg_severity = sum(severities) / len(severities)

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "hemorrhage_count": hemorrhage_count,
        "normal_count": normal_count,
        "low_risk_count": low_risk_count,
        "moderate_risk_count": moderate_risk_count,
        "high_risk_count": high_risk_count,
        "average_confidence": round(avg_confidence, 2),
        "average_severity": round(avg_severity, 2)
    }
