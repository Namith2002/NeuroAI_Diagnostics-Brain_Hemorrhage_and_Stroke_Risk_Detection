import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

import database
import models
import auth
from routes import auth as auth_routes, reports as reports_routes, admin as admin_routes

# Ensure directories for static asset serving exist before application startup
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
HEATMAP_DIR = os.getenv("HEATMAP_DIR", "./heatmaps")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(HEATMAP_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles critical initialization steps on application startup,
    such as auto-building SQLite tables and seeding the default admin user.
    """
    # 1. Automatically build tables in the SQLite database
    print("[Lifespan Startup] Compiling SQLite schemas...")
    database.Base.metadata.create_all(bind=database.engine)
    
    # Migrate existing tables if they lack columns (e.g. from older schema versions)
    from sqlalchemy import inspect, text
    try:
        inspector = inspect(database.engine)
        if inspector.has_table('users'):
            columns = [col['name'] for col in inspector.get_columns('users')]
            with database.engine.begin() as conn:
                if 'is_emergency_account' not in columns:
                    print("[Lifespan Startup] Migration: Adding is_emergency_account column to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_emergency_account BOOLEAN DEFAULT 0 NOT NULL"))
                if 'emergency_created_at' not in columns:
                    print("[Lifespan Startup] Migration: Adding emergency_created_at column to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN emergency_created_at DATETIME"))
        if inspector.has_table('reports'):
            columns = [col['name'] for col in inspector.get_columns('reports')]
            with database.engine.begin() as conn:
                if 'hemorrhage_detection_score' not in columns:
                    print("[Lifespan Startup] Migration: Adding hemorrhage_detection_score column to reports table...")
                    conn.execute(text("ALTER TABLE reports ADD COLUMN hemorrhage_detection_score FLOAT DEFAULT 0.0"))
                if 'cortical_involvement' not in columns:
                    print("[Lifespan Startup] Migration: Adding cortical_involvement column to reports table...")
                    conn.execute(text("ALTER TABLE reports ADD COLUMN cortical_involvement BOOLEAN DEFAULT 0 NOT NULL"))
                if 'hemorrhage_volume' not in columns:
                    print("[Lifespan Startup] Migration: Adding hemorrhage_volume column to reports table...")
                    conn.execute(text("ALTER TABLE reports ADD COLUMN hemorrhage_volume FLOAT DEFAULT 0.0 NOT NULL"))
                if 'midline_shift' not in columns:
                    print("[Lifespan Startup] Migration: Adding midline_shift column to reports table...")
                    conn.execute(text("ALTER TABLE reports ADD COLUMN midline_shift FLOAT DEFAULT 0.0 NOT NULL"))
                if 'early_seizure_risk' not in columns:
                    print("[Lifespan Startup] Migration: Adding early_seizure_risk column to reports table...")
                    conn.execute(text("ALTER TABLE reports ADD COLUMN early_seizure_risk FLOAT DEFAULT 0.0 NOT NULL"))
                if 'late_epilepsy_risk' not in columns:
                    print("[Lifespan Startup] Migration: Adding late_epilepsy_risk column to reports table...")
                    conn.execute(text("ALTER TABLE reports ADD COLUMN late_epilepsy_risk FLOAT DEFAULT 0.0 NOT NULL"))
                if 'patient_age' not in columns:
                    print("[Lifespan Startup] Migration: Adding patient_age column to reports table...")
                    conn.execute(text("ALTER TABLE reports ADD COLUMN patient_age INTEGER DEFAULT 45 NOT NULL"))
                
                # Multi-Label
                if 'prob_hemorrhage' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN prob_hemorrhage FLOAT DEFAULT 0.0 NOT NULL"))
                if 'prob_edh' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN prob_edh FLOAT DEFAULT 0.0 NOT NULL"))
                if 'prob_sdh' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN prob_sdh FLOAT DEFAULT 0.0 NOT NULL"))
                if 'prob_sah' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN prob_sah FLOAT DEFAULT 0.0 NOT NULL"))
                if 'prob_iph' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN prob_iph FLOAT DEFAULT 0.0 NOT NULL"))
                if 'prob_ivh' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN prob_ivh FLOAT DEFAULT 0.0 NOT NULL"))
                if 'prob_fracture' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN prob_fracture FLOAT DEFAULT 0.0 NOT NULL"))
                
                # Clinical Assessment Engine Metrics
                if 'idi' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN idi FLOAT DEFAULT 0.0 NOT NULL"))
                if 'her' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN her FLOAT DEFAULT 0.0 NOT NULL"))
                if 'srs' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN srs FLOAT DEFAULT 0.0 NOT NULL"))
                if 'treatment_recommendation' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN treatment_recommendation VARCHAR(100) DEFAULT 'Routine (>24 hours)' NOT NULL"))
                if 'esi' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN esi FLOAT DEFAULT 0.0 NOT NULL"))
                if 'rcf' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN rcf FLOAT DEFAULT 0.0 NOT NULL"))
                if 'hi' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN hi FLOAT DEFAULT 0.0 NOT NULL"))
                if 'sfs' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN sfs FLOAT DEFAULT 0.0 NOT NULL"))
                if 'ev' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN ev FLOAT DEFAULT 0.0 NOT NULL"))
                if 'cp' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN cp FLOAT DEFAULT 0.0 NOT NULL"))
                
                if 'primary_diagnosis' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN primary_diagnosis VARCHAR(100)"))
                if 'secondary_diagnosis' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN secondary_diagnosis VARCHAR(100)"))
                if 'multilabel_matrix' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN multilabel_matrix TEXT"))
                
                # Region Localization
                if 'affected_region' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN affected_region VARCHAR(100)"))
                if 'region_confidence' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN region_confidence FLOAT DEFAULT 0.0 NOT NULL"))
                if 'region_percentage' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN region_percentage FLOAT DEFAULT 0.0 NOT NULL"))
                
                # Segmentation
                if 'segmentation_mask_path' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN segmentation_mask_path VARCHAR(255)"))
                if 'total_hemorrhage_area' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN total_hemorrhage_area FLOAT DEFAULT 0.0 NOT NULL"))
                
                # Stroke Engine
                if 'ischemic_stroke_risk' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN ischemic_stroke_risk FLOAT DEFAULT 0.0 NOT NULL"))
                if 'hemorrhagic_stroke_risk' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN hemorrhagic_stroke_risk FLOAT DEFAULT 0.0 NOT NULL"))
                if 'recurrent_stroke_risk' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN recurrent_stroke_risk FLOAT DEFAULT 0.0 NOT NULL"))
                if 'has_diabetes' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN has_diabetes BOOLEAN DEFAULT 0 NOT NULL"))
                if 'has_hypertension' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN has_hypertension BOOLEAN DEFAULT 0 NOT NULL"))
                if 'has_smoking_history' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN has_smoking_history BOOLEAN DEFAULT 0 NOT NULL"))
                if 'blood_pressure' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN blood_pressure VARCHAR(50) DEFAULT '120/80' NOT NULL"))
                
                # Patient Survival
                if 'survival_30d' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN survival_30d FLOAT DEFAULT 100.0 NOT NULL"))
                if 'survival_1y' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN survival_1y FLOAT DEFAULT 100.0 NOT NULL"))
                if 'gcs_score' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN gcs_score INTEGER DEFAULT 15 NOT NULL"))
                if 'ivh_presence' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN ivh_presence BOOLEAN DEFAULT 0 NOT NULL"))
                if 'time_to_treatment' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN time_to_treatment INTEGER DEFAULT 1 NOT NULL"))
                
                # Recovery
                if 'recovery_score' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN recovery_score FLOAT DEFAULT 100.0 NOT NULL"))
                if 'functional_independence_prob' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN functional_independence_prob FLOAT DEFAULT 100.0 NOT NULL"))
                if 'rehabilitation_requirement' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN rehabilitation_requirement VARCHAR(100) DEFAULT 'None' NOT NULL"))
                if 'recovery_outcome' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN recovery_outcome VARCHAR(100) DEFAULT 'Good Recovery' NOT NULL"))
                
                # Triage
                if 'triage_priority' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN triage_priority INTEGER DEFAULT 4 NOT NULL"))
                if 'triage_badge' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN triage_badge VARCHAR(50) DEFAULT 'Low' NOT NULL"))
                if 'triage_response_time' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN triage_response_time VARCHAR(100) DEFAULT 'Routine' NOT NULL"))
                
                # Neurologist Validation
                if 'doctor_approved' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN doctor_approved VARCHAR(50) DEFAULT 'pending' NOT NULL"))
                if 'doctor_diagnosis' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN doctor_diagnosis VARCHAR(255)"))
                if 'doctor_notes' not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN doctor_notes TEXT"))
        print("[Lifespan Startup] SQLite schema verification/migration complete.")
    except Exception as mig_err:
        print(f"[Lifespan Startup] Warning: Database schema migration encountered an error: {mig_err}")
    
    # 2. Seed default admin account
    db = database.SessionLocal()
    try:
        # Seed user-specified admin account
        admin_email = "admin@brainct.com"
        admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin:
            print("[Lifespan Startup] Seeding default administrator (admin@brainct.com / Admin@123)...")
            hashed_pwd = auth.get_password_hash("Admin@123")
            default_admin = models.User(
                name="System Administrator",
                email=admin_email,
                password=hashed_pwd,
                role="admin"
            )
            db.add(default_admin)
            db.commit()
            print("[Lifespan Startup] Default admin seeded.")
        else:
            print("[Lifespan Startup] Default admin verified.")

        # Keep legacy admin for backwards compatibility
        legacy_email = "admin@brainai.com"
        legacy_admin = db.query(models.User).filter(models.User.email == legacy_email).first()
        if not legacy_admin:
            print("[Lifespan Startup] Seeding legacy administrator...")
            hashed_pwd_legacy = auth.get_password_hash("admin123")
            legacy_admin_user = models.User(
                name="Default Administrator",
                email=legacy_email,
                password=hashed_pwd_legacy,
                role="admin"
            )
            db.add(legacy_admin_user)
            db.commit()
    except Exception as seed_err:
        print(f"[Lifespan Startup] Warning: Database seeding encountered an error: {seed_err}")
    finally:
        db.close()

        
    yield
    print("[Lifespan Shutdown] Closing application processes...")

# Create the FastAPI instance
app = FastAPI(
    title="Comprehensive Brain CT Analysis System API",
    description="Full-stack Automated Detection and Classification of Intracranial Hemorrhages with Integrated Clinical Risk Assessment API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
# Allows the React frontend running on Vite/default ports to make API requests
# We must specify explicit origins since allow_credentials=True is enabled.
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount asset directories for direct static HTTP serving
# Frontend can access images as http://localhost:8000/uploads/file.png
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/heatmaps", StaticFiles(directory=HEATMAP_DIR), name="heatmaps")

# Register modular routes
app.include_router(auth_routes.router)
app.include_router(reports_routes.router)
app.include_router(admin_routes.router)

@app.get("/")
def get_root_status():
    """
    Health check endpoint to verify system status and server state.
    """
    return {
        "status": "healthy",
        "service": "NeuroAI Diagnostic Suite API",
        "modality": "Brain CT / MRI Scans",
        "inference_engine": "CPU PyTorch (MobileNetV3)"
    }