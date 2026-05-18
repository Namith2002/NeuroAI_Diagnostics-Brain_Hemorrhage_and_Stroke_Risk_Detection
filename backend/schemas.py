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
    risk_level: str

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
