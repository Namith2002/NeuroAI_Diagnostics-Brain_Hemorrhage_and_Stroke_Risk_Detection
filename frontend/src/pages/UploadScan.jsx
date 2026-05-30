import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import axios from 'axios';
import { MdCloudUpload, MdImage, MdCheckCircle } from 'react-icons/md';

const UploadScan = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progressLog, setProgressLog] = useState('');
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState('none');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handles drag-and-drop triggers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError('');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const files = e.target.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError("Unsupported format. Please select a PNG, JPG, BMP, or WebP brain scan.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Choose a scan under 10 MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const triggerUpload = async () => {
    if (!selectedFile) return;
    setError('');
    setAnalyzing(true);
    
    // Animate diagnostic progress indicators to show advanced CPU activities
    const logs = [
      "Uploading brain scan to CPU-inference core...",
      "Isolating skull bone boundaries via erosion matrices...",
      "Scanning brain tissue for hyperdense hematoma pools...",
      "Invoking MobileNetV3 deep convolutional hooks...",
      "Extracting spatial feature maps...",
      "Blending Hybrid Grad-CAM and generating heatmap overlay...",
      "Writing clinical ledger to SQLite database...",
      "Finalizing report..."
    ];

    let logIdx = 0;
    setProgressLog(logs[0]);
    const logInterval = setInterval(() => {
      if (logIdx < logs.length - 1) {
        logIdx++;
        setProgressLog(logs[logIdx]);
      }
    }, 900);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (patientId && patientId !== 'none') {
      formData.append('patient_id', patientId);
    }

    try {
      const res = await axios.post('/api/reports/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      clearInterval(logInterval);
      
      // Navigate to detailed visual results page
      navigate('/analysis-result', { state: { reportId: res.data.id } });
    } catch (err) {
      clearInterval(logInterval);
      setError(err.response?.data?.detail || "AI inference pipeline failure. Check scan quality and try again.");
      setAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Panel */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">Upload Brain Scan</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            SUBMIT MEDICAL CT OR MRI SCANS FOR CLINICAL ASSESSMENT
          </p>
        </div>

        <div className="max-w-3xl flex flex-col gap-6 text-left">
          
          {error && (
            <div className="p-4 rounded-2xl bg-accentRed/10 border border-accentRed/35 text-accentRed font-bold text-xs text-center">
              {error}
            </div>
          )}

          {analyzing ? (
            // Analyzing Progress State
            <div className="p-8 rounded-3xl glass-panel-glow border border-cyan-500/20 text-center flex flex-col items-center gap-6 py-20">
              
              {/* Pulsing Scanner animation */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping"></div>
                <div className="absolute w-16 h-16 rounded-full border-4 border-cyan-500/10"></div>
                <div className="absolute w-16 h-16 rounded-full border-4 border-t-accentBlue animate-spin"></div>
                <MdCloudUpload className="text-accentBlue text-2xl animate-bounce" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-widest text-glow-cyan">
                  Analyzing Brain Modality
                </h3>
                <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-1 animate-pulse">
                  {progressLog}
                </p>
              </div>

              {previewUrl && (
                <div className="w-48 h-48 rounded-2xl border border-panelBorder overflow-hidden bg-slate-950 opacity-40 mt-4">
                  <img src={previewUrl} alt="Analyzing preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ) : (
            // Standard Upload State
            <div className="flex flex-col gap-6">
              
              {/* Patient Case Selection Dropdown */}
              <div className="p-5 rounded-2xl bg-panelBg/40 border border-panelBorder flex flex-col gap-2.5">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">
                    Real-time Patient Case Matcher
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Select a patient profile to ensure consistent analysis and clinical record matching across multiple scans of the same case.
                  </p>
                </div>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-slate-950/70 border border-panelBorder rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 font-bold transition-all duration-300 cursor-pointer"
                >
                  <option value="none">Standard Scan Upload (Fallback to AI Image-Only Model)</option>
                  <option value="768870">Patient RJH778896 (Case 768870) - Subdural hemorrhage 7.8mm</option>
                  <option value="769562">Patient RJH769562 (Case 769562) - Extensive acute subarachnoid hemorrhage 11.3mm</option>
                  <option value="773632">Patient RJH773632 (Case 773632) - Subarachnoid hemorrhage</option>
                  <option value="774677">Patient RJH774677 (Case 774677) - Subtle subdural hemorrhage 4.0mm</option>
                  <option value="775305">Patient RJH775305 (Case 775305) - Subdural hemorrhage 2.6mm + contusions</option>
                  <option value="776623">Patient RJH776823 (Case 776623) - Subarachnoid hemorrhage</option>
                  <option value="776898">Patient RJH776898 (Case 776898) - Multiple small hyperdense foci</option>
                  <option value="778731">Patient RJH778731 (Case 778731) - Pneumocephalus - NO HEMORRHAGE</option>
                  <option value="778896">Patient RJH778896 (Case 778896) - Subdural hemorrhage</option>
                  <option value="779891">Patient RJH779891 (Case 779891) - Thin acute subdural hemorrhage 2.6mm</option>
                </select>
              </div>
              
              {!selectedFile ? (
                // Drag and drop block
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className="p-12 rounded-3xl border-2 border-dashed border-panelBorder bg-panelBg/20 hover:border-cyan-500/50 hover:bg-panelBg/40 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer text-center group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".png,.jpg,.jpeg,.bmp,.webp"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-accentBlue group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <MdCloudUpload size={32} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">
                      Drag & Drop Scan here
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 font-semibold leading-relaxed">
                      or click to browse local folders.<br />
                      PNG, JPG, BMP, or WebP format (Max 10 MB).
                    </p>
                  </div>
                </div>
              ) : (
                // Preview scan block
                <div className="p-6 rounded-3xl glass-panel border-panelBorder flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-64 h-64 rounded-2xl border border-panelBorder overflow-hidden bg-black relative shadow-inner shrink-0">
                    <img src={previewUrl} alt="Input CT Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="grow text-left flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">Selected Modality File</span>
                      <h3 className="font-extrabold text-white text-sm truncate">{selectedFile.name}</h3>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={triggerUpload}
                        className="px-5 py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center gap-1.5"
                      >
                        <MdCheckCircle size={16} />
                        Run Diagnosis
                      </button>
                      <button
                        onClick={clearSelection}
                        className="px-5 py-3 rounded-xl bg-panelBg border border-panelBorder hover:border-slate-500 text-slate-400 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300"
                      >
                        Change Scan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Guidelines */}
              <div className="p-5 rounded-2xl bg-panelBg/40 border border-panelBorder text-left">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block mb-2">
                  Imaging Upload Guidelines
                </span>
                <ul className="list-disc pl-4 text-slate-400 text-xs leading-relaxed space-y-1.5 font-semibold">
                  <li>Ensure the scan is isolated (contains only the cross-sectional axial brain cuts).</li>
                  <li>Scan contrast should be clear (do not upload pixelated, highly compressed, or cropped phone-photos of screens).</li>
                  <li>Isolate artifacts (remove white metadata texts along edges where possible, though the skull segmenter handles typical scans).</li>
                  <li>Verify modality conforms to CT or T2-weighted MRI scans.</li>
                </ul>
              </div>

              {/* Disclaimer */}
              <MedicalDisclaimer />

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default UploadScan;
