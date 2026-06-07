from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: str
    is_emergency_account: bool
    emergency_created_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Report Schemas
class ReportBase(BaseModel):
    prediction: str
    confidence: float
    hemorrhage_percentage: float
    stroke_risk: float
    epilepsy_risk: float
    risk_level: str
    hemorrhage_detection_score: Optional[float] = 0.0
    hemorrhage_location: Optional[str] = None
    location_confidence: Optional[float] = None
    dataset_source: str = "real-time"
    model_accuracy: Optional[float] = None
    is_emergency: bool = False
    first_aid_needed: bool = False
    first_aid_recommendations: Optional[str] = None
    hemorrhage_distribution: Optional[str] = None
    cortical_involvement: Optional[bool] = False
    hemorrhage_volume: Optional[float] = 0.0
    midline_shift: Optional[float] = 0.0
    early_seizure_risk: Optional[float] = 0.0
    late_epilepsy_risk: Optional[float] = 0.0
    patient_age: Optional[int] = 45
    
    # 1. Multi-Label Hemorrhage Classification
    prob_hemorrhage: float = 0.0
    prob_edh: float = 0.0
    prob_sdh: float = 0.0
    prob_sah: float = 0.0
    prob_iph: float = 0.0
    prob_ivh: float = 0.0
    prob_fracture: float = 0.0
    
    # Clinical Assessment Engine Metrics
    idi: float = 0.0
    her: float = 0.0
    srs: float = 0.0
    treatment_recommendation: str = "Routine (>24 hours)"
    esi: float = 0.0
    rcf: float = 0.0
    hi: float = 0.0
    sfs: float = 0.0
    ev: float = 0.0
    cp: float = 0.0
    
    primary_diagnosis: Optional[str] = None
    secondary_diagnosis: Optional[str] = None
    multilabel_matrix: Optional[str] = None
    
    # 2. Brain Region Localization
    affected_region: Optional[str] = None
    region_confidence: float = 0.0
    region_percentage: float = 0.0
    
    # 3. Hemorrhage Segmentation
    segmentation_mask_path: Optional[str] = None
    total_hemorrhage_area: float = 0.0
    
    # 4. Stroke Prediction Engine
    ischemic_stroke_risk: float = 0.0
    hemorrhagic_stroke_risk: float = 0.0
    recurrent_stroke_risk: float = 0.0
    has_diabetes: bool = False
    has_hypertension: bool = False
    has_smoking_history: bool = False
    blood_pressure: str = "120/80"
    
    # 5. Patient Survival Prediction
    survival_30d: float = 100.0
    survival_1y: float = 100.0
    gcs_score: int = 15
    ivh_presence: bool = False
    time_to_treatment: int = 1
    
    # 6. Recovery Prediction System
    recovery_score: float = 100.0
    functional_independence_prob: float = 100.0
    rehabilitation_requirement: str = "None"
    recovery_outcome: str = "Good Recovery"
    
    # 7. Hospital Triage Prioritization
    triage_priority: int = 4
    triage_badge: str = "Low"
    triage_response_time: str = "Routine"
    
    # 8. Neurologist Validation
    doctor_approved: str = "pending"
    doctor_diagnosis: Optional[str] = None
    doctor_notes: Optional[str] = None

class ReportCreate(ReportBase):
    user_id: int
    image_path: str
    heatmap_path: str

class ReportOut(ReportBase):
    id: int
    user_id: int
    image_path: str
    heatmap_path: str
    created_at: datetime

    class Config:
        from_attributes = True

# System Statistics Schema
class SystemStats(BaseModel):
    total_users: int
    total_scans: int
    hemorrhage_count: int
    normal_count: int
    low_risk_count: int
    moderate_risk_count: int
    high_risk_count: int
    average_confidence: float
    average_severity: float
    emergency_scans_count: int
    stroke_epilepsy_correlation: float

# Epilepsy Prediction Schemas
class EpilepsyPredictionRequest(BaseModel):
    hemorrhage_type: str  # "Epidural Hematoma", "Subdural Hematoma", "Subarachnoid Hemorrhage", "Intracerebral Hemorrhage", "Multiple", "None"
    cortical_involvement: bool
    hemorrhage_volume: float  # in mL
    midline_shift: float  # in mm
    age: int

class EpilepsyPredictionResponse(BaseModel):
    early_seizure_risk: float
    late_epilepsy_risk: float
    epilepsy_probability: float
    risk_level: str
    clinical_explanation: str
    seizure_prophylaxis_recommended: bool
    recommendations: List[str]