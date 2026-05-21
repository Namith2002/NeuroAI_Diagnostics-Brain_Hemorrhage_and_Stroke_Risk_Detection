from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

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
    emergency_scans_count = db.query(models.Report).filter(models.Report.is_emergency == True).count()
    
    if total_scans > 0:
        confidences = [r.confidence for r in db.query(models.Report.confidence).all()]
        avg_confidence = sum(confidences) / len(confidences)
        
        # Severity average on acute hemorrhages
        severities = [r.hemorrhage_percentage for r in db.query(models.Report.hemorrhage_percentage).filter(models.Report.hemorrhage_percentage > 0).all()]
        if severities:
            avg_severity = sum(severities) / len(severities)
    
    # Calculate stroke-epilepsy correlation
    stroke_epilepsy_correlation = 0.0
    high_stroke_count = db.query(models.Report).filter(models.Report.stroke_risk > 70).count()
    high_epilepsy_count = db.query(models.Report).filter(models.Report.epilepsy_risk > 60).count()
    
    if high_stroke_count > 0 and high_epilepsy_count > 0:
        both_high = db.query(models.Report).filter(
            models.Report.stroke_risk > 70,
            models.Report.epilepsy_risk > 60
        ).count()
        stroke_epilepsy_correlation = (both_high / max(high_stroke_count, high_epilepsy_count)) * 100

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "hemorrhage_count": hemorrhage_count,
        "normal_count": normal_count,
        "low_risk_count": low_risk_count,
        "moderate_risk_count": moderate_risk_count,
        "high_risk_count": high_risk_count,
        "average_confidence": round(avg_confidence, 2),
        "average_severity": round(avg_severity, 2),
        "emergency_scans_count": emergency_scans_count,
        "stroke_epilepsy_correlation": round(stroke_epilepsy_correlation, 2)
    }

@router.get("/graph-analysis/location-distribution")
def get_hemorrhage_location_distribution(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
) -> Dict[str, Any]:
    """
    Returns hemorrhage location distribution for graph visualization.
    Analyzes all scans to show which brain regions are most frequently affected.
    """
    locations = {}
    reports = db.query(models.Report).filter(models.Report.hemorrhage_location != "N/A").all()
    
    for report in reports:
        loc = report.hemorrhage_location
        locations[loc] = locations.get(loc, 0) + 1
    
    total = sum(locations.values())
    if total > 0:
        locations = {k: round((v / total) * 100, 2) for k, v in locations.items()}
    
    return {"location_distribution": locations, "total_hemorrhages": total}

@router.get("/graph-analysis/stroke-epilepsy-correlation")
def get_stroke_epilepsy_correlation(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
) -> Dict[str, Any]:
    """
    Returns stroke and epilepsy risk correlation data for trend analysis.
    Shows how stroke risk and epilepsy risk are correlated in detected hemorrhages.
    """
    reports = db.query(models.Report).filter(models.Report.prediction == "Hemorrhage Detected").all()
    
    stroke_ranges = {"0-25": 0, "25-50": 0, "50-75": 0, "75-100": 0}
    epilepsy_by_stroke = {}
    
    for report in reports:
        # Categorize stroke risk
        if report.stroke_risk < 25:
            stroke_ranges["0-25"] += 1
            key = "0-25"
        elif report.stroke_risk < 50:
            stroke_ranges["25-50"] += 1
            key = "25-50"
        elif report.stroke_risk < 75:
            stroke_ranges["50-75"] += 1
            key = "50-75"
        else:
            stroke_ranges["75-100"] += 1
            key = "75-100"
        
        # Track average epilepsy risk for each stroke category
        if key not in epilepsy_by_stroke:
            epilepsy_by_stroke[key] = []
        epilepsy_by_stroke[key].append(report.epilepsy_risk)
    
    # Calculate averages
    avg_epilepsy_by_stroke = {k: round(sum(v) / len(v), 2) if v else 0 
                               for k, v in epilepsy_by_stroke.items()}
    
    return {
        "stroke_ranges": stroke_ranges,
        "avg_epilepsy_by_stroke": avg_epilepsy_by_stroke,
        "total_hemorrhages": len(reports)
    }

@router.get("/graph-analysis/risk-severity-scatter")
def get_risk_severity_scatter(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
) -> Dict[str, Any]:
    """
    Returns data points for risk vs severity scatter plot visualization.
    Each point represents a hemorrhage case with stroke risk and severity.
    """
    reports = db.query(models.Report).filter(models.Report.prediction == "Hemorrhage Detected").all()
    
    data_points = []
    for report in reports:
        data_points.append({
            "id": report.id,
            "severity": report.hemorrhage_percentage,
            "stroke_risk": report.stroke_risk,
            "epilepsy_risk": report.epilepsy_risk,
            "location": report.hemorrhage_location,
            "risk_level": report.risk_level,
            "date": report.created_at.isoformat()
        })
    
    return {"data_points": data_points, "total": len(data_points)}

@router.get("/graph-analysis/dataset-accuracy-comparison")
def get_dataset_accuracy_comparison(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
) -> Dict[str, Any]:
    """
    Compares accuracy metrics between Kaggle dataset and real-time scans.
    Shows how model performs on different data sources.
    """
    # Get Kaggle dataset stats
    kaggle_reports = db.query(models.Report).filter(
        models.Report.dataset_source == "kaggle"
    ).all()
    kaggle_accuracy = []
    kaggle_precision = []
    
    for report in kaggle_reports:
        kaggle_accuracy.append(report.model_accuracy)
        # Precision = correct hemorrhage detections / all hemorrhage predictions
        if report.prediction == "Hemorrhage Detected":
            kaggle_precision.append(report.confidence)
    
    # Get Real-time dataset stats
    realtime_reports = db.query(models.Report).filter(
        models.Report.dataset_source == "real-time"
    ).all()
    realtime_accuracy = []
    realtime_precision = []
    
    for report in realtime_reports:
        realtime_accuracy.append(report.model_accuracy)
        if report.prediction == "Hemorrhage Detected":
            realtime_precision.append(report.confidence)
    
    # Calculate averages
    kaggle_avg_accuracy = round(sum(kaggle_accuracy) / len(kaggle_accuracy), 2) if kaggle_accuracy else 0
    kaggle_avg_precision = round(sum(kaggle_precision) / len(kaggle_precision), 2) if kaggle_precision else 0
    
    realtime_avg_accuracy = round(sum(realtime_accuracy) / len(realtime_accuracy), 2) if realtime_accuracy else 0
    realtime_avg_precision = round(sum(realtime_precision) / len(realtime_precision), 2) if realtime_precision else 0
    
    return {
        "kaggle": {
            "total_scans": len(kaggle_reports),
            "avg_accuracy": kaggle_avg_accuracy,
            "avg_precision": kaggle_avg_precision
        },
        "realtime": {
            "total_scans": len(realtime_reports),
            "avg_accuracy": realtime_avg_accuracy,
            "avg_precision": realtime_avg_precision
        },
        "comparison": {
            "accuracy_difference": round(realtime_avg_accuracy - kaggle_avg_accuracy, 2),
            "precision_difference": round(realtime_avg_precision - kaggle_avg_precision, 2)
        }
    }

@router.get("/emergency-scans")
def get_emergency_scans(
    current_admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(database.get_db)
) -> Dict[str, Any]:
    """
    Returns all scans marked as requiring immediate emergency intervention.
    Sorted by severity for prioritized medical review.
    """
    emergency_reports = db.query(models.Report).filter(
        models.Report.is_emergency == True
    ).order_by(models.Report.stroke_risk.desc()).all()
    
    emergency_data = []
    for report in emergency_reports:
        emergency_data.append({
            "report_id": report.id,
            "patient_name": report.user.name,
            "patient_email": report.user.email,
            "hemorrhage_location": report.hemorrhage_location,
            "stroke_risk": report.stroke_risk,
            "epilepsy_risk": report.epilepsy_risk,
            "severity": report.hemorrhage_percentage,
            "first_aid_needed": report.first_aid_needed,
            "timestamp": report.created_at.isoformat()
        })
    
    return {"emergency_scans": emergency_data, "total": len(emergency_data)}
