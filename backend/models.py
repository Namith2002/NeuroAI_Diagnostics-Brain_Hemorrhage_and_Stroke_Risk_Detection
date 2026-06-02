import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False) # 'user' or 'admin'
    is_emergency_account = Column(Boolean, default=False, nullable=False)  # Emergency account before neurologist
    emergency_created_at = Column(DateTime, nullable=True)  # When emergency account was auto-created
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String, nullable=False)
    heatmap_path = Column(String, nullable=False)
    prediction = Column(String, nullable=False) # "Hemorrhage Detected" or "Normal (No Hemorrhage)"
    confidence = Column(Float, nullable=False) # 0.0 to 100.0
    hemorrhage_percentage = Column(Float, nullable=False) # 0.0 to 100.0 (severity)
    stroke_risk = Column(Float, nullable=False) # 0.0 to 100.0
    epilepsy_risk = Column(Float, nullable=False, default=0.0) # 0.0 to 100.0
    risk_level = Column(String, nullable=False) # "Low", "Moderate", "High"
    hemorrhage_detection_score = Column(Float, nullable=True, default=0.0) # 0.0 to 100.0
    
    # Hemorrhage Location Classification
    hemorrhage_location = Column(String, nullable=True)  # "Epidural Hematoma", "Subdural Hematoma", "Subarachnoid Hemorrhage", "Intracerebral Hemorrhage", "Multiple"
    location_confidence = Column(Float, nullable=True, default=0.0)  # Confidence in location classification
    
    # Dataset & Accuracy Tracking
    dataset_source = Column(String, default="real-time", nullable=False)  # "kaggle" or "real-time"
    model_accuracy = Column(Float, nullable=True)  # Accuracy of this specific prediction
    
    # Emergency & First-Aid
    is_emergency = Column(Boolean, default=False, nullable=False)  # Flagged for immediate attention
    first_aid_needed = Column(Boolean, default=False, nullable=False)
    first_aid_recommendations = Column(Text, nullable=True)  # Clinical first-aid suggestions
    
    # Graph & Analytics
    hemorrhage_distribution = Column(String, nullable=True)  # JSON string for pixel distribution data
    
    # Post-Hemorrhagic Epilepsy prediction metrics
    cortical_involvement = Column(Boolean, default=False, nullable=False)
    hemorrhage_volume = Column(Float, default=0.0, nullable=False) # in mL
    midline_shift = Column(Float, default=0.0, nullable=False) # in mm
    early_seizure_risk = Column(Float, default=0.0, nullable=False) # in %
    late_epilepsy_risk = Column(Float, default=0.0, nullable=False) # in %
    patient_age = Column(Integer, default=45, nullable=False)
    
    # 1. Multi-Label Hemorrhage Classification
    prob_edh = Column(Float, default=0.0, nullable=False)
    prob_sdh = Column(Float, default=0.0, nullable=False)
    prob_sah = Column(Float, default=0.0, nullable=False)
    prob_iph = Column(Float, default=0.0, nullable=False)
    prob_ivh = Column(Float, default=0.0, nullable=False)
    primary_diagnosis = Column(String, nullable=True)
    secondary_diagnosis = Column(String, nullable=True)
    multilabel_matrix = Column(Text, nullable=True) # JSON string
    
    # 2. Brain Region Localization
    affected_region = Column(String, nullable=True)
    region_confidence = Column(Float, default=0.0, nullable=False)
    region_percentage = Column(Float, default=0.0, nullable=False)
    
    # 3. Hemorrhage Segmentation
    segmentation_mask_path = Column(String, nullable=True)
    total_hemorrhage_area = Column(Float, default=0.0, nullable=False)
    
    # 4. Stroke Prediction Engine
    ischemic_stroke_risk = Column(Float, default=0.0, nullable=False)
    hemorrhagic_stroke_risk = Column(Float, default=0.0, nullable=False)
    recurrent_stroke_risk = Column(Float, default=0.0, nullable=False)
    has_diabetes = Column(Boolean, default=False, nullable=False)
    has_hypertension = Column(Boolean, default=False, nullable=False)
    has_smoking_history = Column(Boolean, default=False, nullable=False)
    blood_pressure = Column(String, default="120/80", nullable=False)
    
    # 5. Patient Survival Prediction
    survival_30d = Column(Float, default=100.0, nullable=False)
    survival_1y = Column(Float, default=100.0, nullable=False)
    gcs_score = Column(Integer, default=15, nullable=False)
    ivh_presence = Column(Boolean, default=False, nullable=False)
    time_to_treatment = Column(Integer, default=1, nullable=False)
    
    # 6. Recovery Prediction System
    recovery_score = Column(Float, default=100.0, nullable=False)
    functional_independence_prob = Column(Float, default=100.0, nullable=False)
    rehabilitation_requirement = Column(String, default="None", nullable=False)
    recovery_outcome = Column(String, default="Good Recovery", nullable=False)
    
    # 7. Hospital Triage Prioritization
    triage_priority = Column(Integer, default=4, nullable=False)
    triage_badge = Column(String, default="Low", nullable=False)
    triage_response_time = Column(String, default="Routine", nullable=False)
    
    # 8. Neurologist Validation
    doctor_approved = Column(String, default="pending", nullable=False) # 'pending', 'approved', 'rejected'
    doctor_diagnosis = Column(String, nullable=True)
    doctor_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
