# 🧠 Comprehensive Brain CT Analysis System: Automated Detection and Classification of Intracranial Hemorrhages with Integrated Clinical Risk Assessment

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0--Enhanced--Diagnostics-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)
![Backend](https://img.shields.io/badge/backend-FastAPI--Python-orange.svg)
![Frontend](https://img.shields.io/badge/frontend-React--Vite--Tailwind-blue.svg)

**Advanced Clinical Decision Support System Powered by Deep Learning**

An enterprise-grade diagnostic platform that processes brain CT & MRI scans instantly on low-resource CPU devices. Features deep-learning feature activations, high-resolution Grad-CAM heatmaps, quantitative risk scoring, interactive analytics, and professional PDF reports.

[Features](#-key-features) • [What's New in v2.0.0](#-whats-new-in-v200-enhanced-diagnostics-release) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Documentation](#-api-endpoints) • [Disclaimer](#-medical-disclaimer)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [🚀 What's New in v2.0.0 (Enhanced Diagnostics Release)](#whats-new-in-v200-enhanced-diagnostics-release)
- [✨ Key Features](#key-features)
- [💻 System Requirements](#system-requirements)
- [⚡ Quick Start](#quick-start)
- [🏗️ Architecture](#architecture)
- [📁 Project Structure](#project-structure)
- [🛠️ Technology Stack](#technology-stack)
- [⚙️ Configuration](#configuration)
- [🔌 API Endpoints](#api-endpoints)
- [🤝 Contributing](#contributing)
- [⚠️ Medical Disclaimer](#medical-disclaimer)
- [📄 License & Acknowledgments](#license--acknowledgments)

---

## Overview

**NeuroAI Diagnostics** is a cutting-edge clinical decision support system designed to assist neurologists, radiographers, and emergency medical personnel. Built with lightweight deep learning backbones, it delivers rapid scan analysis, patient risk stratification, and explainable AI insights without requiring expensive GPU infrastructure.

The system processes standard cross-sectional brain scans (DICOM, NIfTI, PNG) and immediately yields classification results, localization of hemorrhagic regions, stroke/epilepsy risk factors, and formatted clinical documentation.

---

## 🚀 What's New in v2.0.0 (Enhanced Diagnostics Release)

This release elevates the platform from a simple scan-processing API to a comprehensive clinical workflow suite:

*   **Brain Hemorrhage Location Classification**: Identifies specific anatomical regions (Frontal, Temporal, Parietal, Occipital, Cerebellum, Brainstem) using spatial center-of-mass analysis of detected blood pixels.
*   **Stroke & Epilepsy Correlation**: Estimates secondary epilepsy risks using localized hemorrhage multipliers combined with quantitative stroke risk profiles.
*   **Emergency Intake System**: A streamlined "One-Click Emergency Registration" that generates temporary medical credentials and bypasses standard intake pipelines to prioritize critical scans.
*   **Interactive Graph Analytics**: Rich visualization dashboards for clinical administrators, displaying hemorrhage location distributions, risk scatter plots, and stroke-epilepsy correlations.
*   **Dataset Performance Validation**: Side-by-side performance benchmarks comparing baseline **Kaggle** datasets with **Real-Time** clinical scans.
*   **Clinical Knowledge Hub**: Interactive patient education and recovery resources directly accessible within the portal, including options to download guides as text files.
*   **Enhanced PDF Export Engine**: Fully reconstructed PDF report styling, incorporating color-coded emergency alerts, detailed metrics grids, and first-aid checklists.

---

## ✨ Key Features

### 🧠 Pre-Trained CPU Inference
Optimized MobileNetV3 deep learning architectures run predictions in under **1 second** on standard desktop CPUs, bypassing the need for dedicated CUDA cores or tensor-processing hardware.

### 📊 Focal Grad-CAM Heatmaps
Superimposes hybrid activation maps over brain scans, visually highlighting exact areas of high activation to provide explainable AI reasoning for diagnostic verification.

### 🚨 Emergency Triage & First-Aid Protocol
Automatically flags high-risk scans (`is_emergency=True`) based on risk severity, stroke probability (>75%), or epilepsy risk (>70%), immediately displaying specialized first-aid guidelines (e.g., airway protection, seizure precautions, position management).

### 📈 Clinical Administration Dashboard
Provides high-level graph analytics utilizing **Recharts** for clinical audit and operations:
*   *Location Distribution*: Pie charts indicating spatial frequencies.
*   *Stroke-Epilepsy Correlation*: Bar graphs of risk ranges.
*   *Risk vs. Severity*: Detailed scatter plots of individual patient cases.
*   *Dataset Comparison*: Accuracy comparisons between training models and live test samples.

### 🔐 HIPAA-Compliant Security & Controls
*   Encrypted SQLite Database with AES-compatible encryption for protected health information (PHI).
*   Role-Based Access Control (RBAC) separating `user` (clinician) and `admin` (director) accounts.
*   JWT token-based authentication with auto-expiring secure sessions.
*   Default administrator seed account (`admin@brainai.com` / `admin123`) created on first run.

---

## 💻 System Requirements

### Minimum Requirements
*   **CPU**: Dual-core processor (2.0 GHz+)
*   **RAM**: 4 GB
*   **Storage**: 2 GB free space
*   **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
*   **Runtime**: Python 3.9+, Node.js 18+

### Recommended Requirements
*   **CPU**: Quad-core processor (2.5 GHz+)
*   **RAM**: 8 GB+ (for smoother local model execution)
*   **Storage**: 5 GB SSD
*   **Browser**: Google Chrome 100+, Firefox 95+, Safari 15+

---

## ⚡ Quick Start

### Prerequisites
Make sure you have **Python 3.9+** and **Node.js 18+** installed on your workstation.

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Namith2002/NeuroAI_Diagnostics-Brain_Hemorrhage_and_Stroke_Risk_Detection.git
cd NeuroAI_Diagnostics-Brain_Hemorrhage_and_Stroke_Risk_Detection
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env   # On macOS/Linux: cp .env.example .env
# Edit .env and supply your custom configurations (optional)

# Start Backend Server
python main.py
```
> [!NOTE]
> Database tables and database column migrations (such as adding new emergency flags or epilepsy risks) are **automatically applied at server startup** via the FastAPI lifespan startup event. A default admin user `admin@brainai.com` with password `admin123` is also automatically seeded if not already present.

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at:
*   **Frontend**: `http://localhost:5173`
*   **Backend Swagger Docs**: `http://localhost:8000/docs`

### 🐳 Deployment with Docker (Production-Ready Stack)

For production deployment, the entire system (Frontend with Nginx, Backend with FastAPI, and dynamic media/SQLite databases) is containerized using Docker and Docker Compose. Nginx serves as the reverse-proxy.

#### 1. Build and Launch the Stack
From the root workspace directory, run:
```bash
docker-compose up --build -d
```

#### 2. Access Portals
Once the containers are active:
*   **Frontend & Application Gateway**: `http://localhost` (Port 80)
*   **Backend REST API Swagger Docs**: `http://localhost:8000/docs`

#### 3. Data Persistence
All uploaded patient CT scans, Grad-CAM heatmaps, and SQLite databases are securely persisted locally on the host machine via mapped Docker volumes:
*   `backend_uploads`: Mapped to `/app/uploads` (CT scans)
*   `backend_heatmaps`: Mapped to `/app/heatmaps` (Grad-CAM results)
*   `backend_database`: Mapped to `/app/database` (SQLite logs)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React/Vite)              │
│  - User Interface & Visualization (Tailwind CSS v4) │
│  - Interactive Graph Dashboards (Recharts)           │
│  - Patient Intake, History, and Clinical Knowledge  │
└──────────────────┬──────────────────────────────────┘
                   │ REST API (JSON / Multipart Upload)
                   ▼
┌─────────────────────────────────────────────────────┐
│              Backend (FastAPI/Python)               │
│  - Lifespan Hook: Auto Schema Migration & Seeding    │
│  - JWT & RBAC Authentication Module                 │
│  - Deep Learning Pipeline (MobileNetV3 on PyTorch)  │
│  - FPDF2 Report Generation Engine                   │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────┐
        ▼                     ▼              ▼
   ┌─────────┐           ┌────────┐    ┌────────────┐
   │ PyTorch │           │ SQLite │    │Local static│
   │ Model   │           │   DB   │    │directories │
   │ Engine  │           │ (Enc)  │    │(Heatmaps)  │
   └─────────┘           └────────┘    └────────────┘
```

---

## 📁 Project Structure

```
NeuroAI_Diagnostics-Brain_Hemorrhage_and_Stroke_Risk_Detection/
├── backend/                           # FastAPI Python Backend
│   ├── main.py                        # Entry point & lifespan configuration
│   ├── auth.py                        # Authentication & password hashing
│   ├── database.py                    # SQLAlchemy engine and session setup
│   ├── models.py                      # Database models (User, Report)
│   ├── schemas.py                     # Pydantic schemas for data validation
│   ├── requirements.txt               # Backend Python dependencies
│   ├── scripts/                       # ML Evaluation & Comparison Scripts
│   │   └── train_models.py            # Evaluates and plots EfficientNet-B3, ResNet50, DenseNet121, ConvNeXt, ViT
│   ├── routes/                        # API route routers
│   │   ├── admin.py                   # Analytics, dataset comparison, emergency scans
│   │   ├── auth.py                    # Login, registration, emergency credentials
│   │   └── reports.py                 # Report downloads, patient education guides
│   └── services/                      # Core business logic
│       ├── ai_inference.py            # PyTorch inference, location detection, risk formulas
│       ├── documentation.py           # Educational resources and patient guides
│       ├── heatmap_generator.py       # Grad-CAM overlay engine
│       └── pdf_generator.py           # FPDF2 clinical PDF compiler
│
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.jsx                    # Root routing and navigation
│   │   ├── components/                # Modular React UI components
│   │   │   ├── BrainRegionMap.jsx     # Anatomical location indicator
│   │   │   ├── EmergencyAccountModal.jsx # Emergency clinician registration
│   │   │   ├── Sidebar.jsx            # Dynamic navigation sidebar
│   │   │   └── ProtectedRoute.jsx     # Auth guards
│   │   ├── pages/                     # Application views
│   │   │   ├── Landing.jsx            # Introduction landing page
│   │   │   ├── Dashboard.jsx          # Doctor's worklist
│   │   │   ├── UploadScan.jsx         # Image uploading portal
│   │   │   ├── AnalysisResult.jsx     # AI output, Grad-CAM, & first-aid guidelines
│   │   │   ├── GraphAnalytics.jsx     # Recharts charts and datasets (Admin-only)
│   │   │   ├── AwarenessDocumentation.jsx # Educational hub
│   │   │   └── Profile.jsx            # User credentials manager
│   │   └── styles/                    # Global CSS styles
│   ├── tailwind.config.js             # Styling configurations
│   ├── package.json                   # NPM dependencies
│   └── vite.config.js                 # Vite server bundler
│
├── IMPLEMENTATION_SUMMARY.md          # Technical summary of v2.0.0 enhancements
├── PROJECT_GUIDE.md                   # System configuration guide
└── README.md                          # This file
```

---

## 🛠️ Technology Stack

### Backend
*   **Framework**: FastAPI (Python 3.9+)
*   **Model Execution**: PyTorch (CPU-optimized)
*   **Computer Vision**: OpenCV (headless), Pillow (PIL)
*   **Database ORM**: SQLAlchemy 2.0
*   **Report Generation**: FPDF2
*   **Cryptography**: Bcrypt & Python-Jose JWT

### Frontend
*   **Base Engine**: React 19 + Vite
*   **Styling**: Tailwind CSS v4 + Framer Motion
*   **Dashboard Visuals**: Recharts
*   **Icons**: React Icons
*   **HTTP Layer**: Axios

---

## ⚙️ Configuration

### Environment Variables

**Backend (`backend/.env`)**
```env
SECRET_KEY=your_secure_hexadecimal_key_for_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./database/brain_hemorrhage.db
UPLOAD_DIR=./uploads
HEATMAP_DIR=./heatmaps
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🔌 API Endpoints

### 🔑 Authentication (`/api/auth`)
*   `POST /register` — Register a standard clinical user account.
*   `POST /login` — Standard login generating JWT token.
*   `POST /emergency-account` — (**v2.0.0**) Creates a priority emergency clinician session with generated password credentials for instant access.

### 📋 Reports & Education (`/api/reports`)
*   `GET /` — Fetch reports belonging to the authenticated clinician.
*   `POST /upload` — Upload a scan and trigger the AI evaluation pipeline.
*   `GET /{id}` — Fetch detailed classification results.
*   `GET /{id}/pdf` — Download a clinical PDF report of the scan results.
*   `GET /documentation/available` — (**v2.0.0**) Lists titles of education materials.
*   `GET /documentation/{doc_type}` — (**v2.0.0**) Reads specific documentation content (e.g., *recovery*, *basics*, *emergency*, *stroke-epilepsy*).
*   `GET /documentation/{doc_type}/download` — (**v2.0.0**) Downloads the selected guide in flat `.txt` format.
*   `GET /documentation/quick-reference/first-aid` — (**v2.0.0**) Fetch immediate first-aid checklist.

### 📊 Admin Control & Operations (`/api/admin`)
*   `GET /users` — List registered clinic accounts.
*   `GET /emergency-scans` — (**v2.0.0**) Live worklist of unresolved high-risk patient records.
*   `GET /graph-analysis/location-distribution` — (**v2.0.0**) Hemorrhage location spatial frequency data.
*   `GET /graph-analysis/stroke-epilepsy-correlation` — (**v2.0.0**) Risk multipliers dataset.
*   `GET /graph-analysis/risk-severity-scatter` — (**v2.0.0**) Scatter matrix coordinates mapping severity against risk.
*   `GET /graph-analysis/dataset-accuracy-comparison` — (**v2.0.0**) Kaggle training vs Live scan verification metrics.

---

## 🤝 Contributing

### Code Standards
*   **Python**: PEP 8 compliance, clear docstrings, type annotations where possible.
*   **React**: Modular UI components, strict Tailwind classes, clean JSX styling.
*   **Version Control**: Commit messages in standard conventional formats.

### Development Flow
1. Check existing issues or create one to describe a feature.
2. Form a development branch (`feature/your-addition` or `bugfix/your-fix`).
3. Make changes and confirm local tests.
4. Open a Pull Request referencing the issue.

---

## ⚠️ Medical Disclaimer

> [!WARNING]
> **NOT FDA APPROVED FOR PRIMARY DIAGNOSIS**
>
> This platform is a **clinical decision support system (CDSS)** intended for research, training, and supplemental clinical review only.
> *   All machine learning predictions, localization indexes, and risk calculations must be reviewed by a board-certified radiologist, neurologist, or attending physician.
> *   Do not use this system as a standalone diagnostic device or as a replacement for professional radiological review.
> *   Clinical decisions should prioritize standardized hospital protocols.

---

## 📄 License & Acknowledgments

Licensed under the [MIT License](LICENSE).

### Acknowledgments
*   MobileNetV3 backbone architecture from the PyTorch Torchvision models.
*   Medical imaging spatial coordinates references from clinical guidelines.
*   FastAPI development team for high-performance python API serving.
*   Recharts team for modular React charting components.

---
<div align="center">
  <sub>Developed with ❤️ by the NeuroAI Diagnostics Team</sub>
</div>
