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
    hemorrhage_location = Column(String, nullable=True)  # "Frontal", "Temporal", "Parietal", "Occipital", "Cerebellum", "Brainstem", "Multiple"
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
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
