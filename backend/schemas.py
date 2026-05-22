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
