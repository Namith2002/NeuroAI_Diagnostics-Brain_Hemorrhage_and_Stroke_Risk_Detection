from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database
import models
import schemas
import auth
import datetime
import uuid

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Registers a new standard user on the platform.
    Hashes the password securely and ensures email uniqueness.
    """
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered. Please login or use a different email."
        )
    
    # Hash password
    hashed_pwd = auth.get_password_hash(user.password)
    
    # Create user and save to SQLite
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_pwd,
        role="user" # Default role for self-registration is user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """
    Authenticates a user, validates their hashed password, and
    issues a JWT security access token for session management.
    """
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid email or password. Please check your credentials and try again."
        )
    
    if not auth.verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid email or password. Please check your credentials and try again."
        )
        
    # Generate access token containing standard subject and user role claims
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "email": user.email
    }

@router.get("/profile", response_model=schemas.UserOut)
def get_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    """
    Retrieves the authenticated profile information of the current logged-in user.
    """
    return current_user

@router.post("/emergency-account", response_model=schemas.Token)
def create_emergency_account(patient_name: str, patient_email: str, db: Session = Depends(database.get_db)):
    """
    Creates an emergency account for rapid patient registration before neurologist assistance.
    This account is marked as emergency and allows immediate scan upload.
    Returns temporary credentials for emergency use.
    """
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == patient_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login with existing credentials."
        )
    
    # Generate temporary password for emergency account
    temp_password = str(uuid.uuid4())[:12]
    hashed_pwd = auth.get_password_hash(temp_password)
    
    # Create emergency account
    emergency_user = models.User(
        name=patient_name,
        email=patient_email,
        password=hashed_pwd,
        role="user",
        is_emergency_account=True,
        emergency_created_at=datetime.datetime.utcnow()
    )
    
    db.add(emergency_user)
    db.commit()
    db.refresh(emergency_user)
    
    # Generate access token
    access_token = auth.create_access_token(data={"sub": emergency_user.email, "role": emergency_user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": emergency_user.role,
        "name": emergency_user.name,
        "email": emergency_user.email
    }
