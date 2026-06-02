import React from 'react';
import Navbar from '../components/Navbar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { MdLayers, MdModelTraining, MdLocalHospital } from 'react-icons/md';

const About = () => {
  return (
    <div className="min-h-screen bg-darkBg text-slate-200 radial-grid-bg relative overflow-hidden flex flex-col">
      <Navbar />

      <main className="grow max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* Header Block */}
        <div className="text-center flex flex-col items-center gap-4 mb-12">
          <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-accentBlue text-[10px] font-extrabold uppercase tracking-widest glow-text-cyan">
            Technical Documentation
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase">
            System Architecture & Logic
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            Learn about the software stack, diagnostic pipelines, deep-learning models, and medical equations powering the Comprehensive Brain CT Analysis System.
          </p>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col gap-10">
          
          {/* Tech Stack Card */}
          <div className="p-6 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-accentBlue">
                <MdLayers size={20} />
              </div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Modular Software Stack</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Our system is built using high-performance, modular frameworks designed to deliver fast, thread-safe, and secure operations on low-resource hardware:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder/50">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">Frontend</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-semibold">React.js, Vite, Tailwind CSS, Recharts, Framer Motion, Axios</p>
              </div>
              <div className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder/50">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">Backend Core</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-semibold">FastAPI, SQLAlchemy, Python 3.10+, SQLite, JWT Auth</p>
              </div>
              <div className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder/50">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">AI Inference</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-semibold">PyTorch, Torchvision, OpenCV, NumPy, Pillow, FPDF2</p>
              </div>
            </div>
          </div>

          {/* AI Inference Pipeline Card */}
          <div className="p-6 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <MdModelTraining size={20} />
              </div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Diagnostic & Heatmap Pipeline</h3>
            </div>
            
            <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-400">
              <p>
                To provide high clinical precision entirely on CPU networks without heavy custom model training, we engineered a hybrid, dual-stage diagnostic pipeline:
              </p>
              
              <div className="flex gap-4 items-start pl-2">
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800/40 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wide">Stage I: Skull Segmentation & Hyperdensity Scan</h4>
                  <p className="mt-1">
                    On standard CT scans, acute pooled blood is hyperdense, appearing as bright white patches. We apply global contour filters to isolate the outer skull bone perimeter, erode the mask by 17px to remove bone interference, and count pixels above a brightness threshold (&gt;210) to identify acute hematomas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start pl-2">
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800/40 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wide">Stage II: Pre-trained Deep Feature Extraction</h4>
                  <p className="mt-1">
                    The image is normalized and passed through a pre-trained <strong>MobileNetV3-Large</strong> network. We pull activation outputs from the final convolutional layers to evaluate deep spatial abnormalities and anomalies.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start pl-2">
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800/40 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wide">Stage III: Blended Grad-CAM Heatmaps</h4>
                  <p className="mt-1">
                    To render beautiful heatmaps, we register forward hooks on the convolutional blocks and extract the active feature-maps. We overlay this deep-learning spatial map (40% weight) with our segmented hyperdense blood mask (60% weight) and blur using a 45x45 Gaussian kernel, generating standard clinical Grad-CAM outputs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stroke Risk Card */}
          <div className="p-6 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                <MdLocalHospital size={20} />
              </div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Clinical Risk Logic & Equations</h3>
            </div>
            
            <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-400">
              <p>
                Stroke Risk is categorized into three levels: <strong>Low (0-30%)</strong>, <strong>Moderate (31-60%)</strong>, and <strong>High (61-100%)</strong>. Our logic computes risk indices using three parameters: Hemorrhage Severity index (blood-to-brain pixel ratio), Inference Confidence, and Image Abnormality weights.
              </p>
              
              <div className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder/50 font-mono text-[11px] text-slate-300 flex flex-col gap-2">
                <div>
                  <span className="text-cyan-400 font-bold uppercase block tracking-wider text-[9px] mb-1">If scan is normal (No bleed):</span>
                  Stroke Risk = min(30.0, 5.0 + (Abnormality_Factor * 3.5) + (Density_Variance * 2.0))
                </div>
                <div className="border-t border-panelBorder/30 pt-2 mt-1">
                  <span className="text-accentRed font-bold uppercase block tracking-wider text-[9px] mb-1">If Hemorrhage is detected:</span>
                  Stroke Risk = min(100.0, 45.0 + (Severity_Index * 2.8) + (Confidence * 0.12) + (Abnormality_Factor * 2.5))
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <MedicalDisclaimer />

        </div>
      </main>

      <footer className="border-t border-panelBorder/20 py-8 bg-darkBg text-center text-slate-500 text-xs font-semibold tracking-wider relative z-10">
        <p>&copy; {new Date().getFullYear()} COMPREHENSIVE BRAIN CT ANALYSIS SYSTEM. ALL RIGHTS RESERVED. FOR DEMONSTRATIVE SUPPORT USE ONLY.</p>
      </footer>
    </div>
  );
};

export default About;
