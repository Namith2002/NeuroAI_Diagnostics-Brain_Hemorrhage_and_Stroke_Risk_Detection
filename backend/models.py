import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False) # 'user' or 'admin'
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
    risk_level = Column(String, nullable=False) # "Low", "Moderate", "High"
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
