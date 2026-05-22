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
        print("[Lifespan Startup] SQLite schema verification/migration complete.")
    except Exception as mig_err:
        print(f"[Lifespan Startup] Warning: Database schema migration encountered an error: {mig_err}")
    
    # 2. Seed default admin account
    db = database.SessionLocal()
    try:
        admin_email = "admin@brainai.com"
        admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin:
            print("[Lifespan Startup] Admin account not found. Seeding default administrator...")
            hashed_pwd = auth.get_password_hash("admin123")
            default_admin = models.User(
                name="Default Administrator",
                email=admin_email,
                password=hashed_pwd,
                role="admin"
            )
            db.add(default_admin)
            db.commit()
            print("[Lifespan Startup] Admin account seeded successfully (admin@brainai.com / admin123).")
        else:
            print("[Lifespan Startup] Admin account verified.")
    except Exception as seed_err:
        print(f"[Lifespan Startup] Warning: Database seeding encountered an error: {seed_err}")
    finally:
        db.close()
        
    yield
    print("[Lifespan Shutdown] Closing application processes...")

# Create the FastAPI instance
app = FastAPI(
    title="NeuroAI Diagnostic Suite API",
    description="Full-stack AI Brain Hemorrhage Detection and Stroke Risk Prediction backend",
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
