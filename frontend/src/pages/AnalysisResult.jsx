import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import BrainRegionMap from '../components/BrainRegionMap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MdDownload, MdDelete, MdArrowBack, MdAnalytics, MdZoomIn } from 'react-icons/md';

const AnalysisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { API_URL } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reportId = location.state?.reportId;

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      let targetId = reportId;
      
      // Fallback: If no reportId is passed in routing state, fetch user's most recent scan
      if (!targetId) {
        const historyRes = await axios.get('/api/reports/my-history');
        if (historyRes.data.length > 0) {
          targetId = historyRes.data[0].id;
        } else {
          setError("No diagnostic scan reports found. Run an AI analysis first.");
          setLoading(false);
          return;
        }
      }

      const res = await axios.get(`/api/reports/view/${targetId}`);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to retrieve diagnostic findings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    try {
      const response = await axios.get(`/api/reports/download/${report.id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `neuroai_report_BHD_${report.id}.pdf`;
      link.click();
    } catch (err) {
      alert("Failed to compile/stream clinical PDF document.");
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    if (!window.confirm("Are you sure you want to permanently delete this diagnostic scan report? This action is irreversible.")) {
      return;
    }
    try {
      await axios.delete(`/api/reports/${report.id}`);
      navigate('/dashboard');
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-slate-200 flex">
        <Sidebar />
        <main className="grow flex items-center justify-center text-accentBlue">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs tracking-widest font-extrabold uppercase animate-pulse">Running scan diagnostics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkBg text-slate-200 flex">
        <Sidebar />
        <main className="grow p-8 text-left">
          <div className="max-w-xl glass-panel p-6 rounded-2xl border border-panelBorder flex flex-col gap-4">
            <h2 className="text-lg font-bold text-accentRed uppercase">Diagnostic Audit Blocked</h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">{error}</p>
            <Link to="/upload-scan" className="px-5 py-2.5 rounded-xl bg-cyan-500 text-darkBg font-bold text-xs uppercase tracking-wider glow-btn-cyan self-start mt-2">
              Go to Upload Scan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isHemorrhage = report.prediction === 'Hemorrhage Detected';

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Panel */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Nav actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl bg-panelBg border border-panelBorder hover:border-slate-500 text-slate-400 hover:text-white transition-all duration-300"
            >
              <MdArrowBack size={18} />
            </button>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-wide uppercase">Inference Report Audit</h1>
              <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                REPORT ID: BHD-#{report.id.toString().padStart(6, '0')} &bull; CLINICAL CASE STUDY
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center gap-1.5"
            >
              <MdDownload size={16} />
              Print PDF report
            </button>
            <button
              onClick={handleDeleteReport}
              className="px-4 py-3 rounded-xl bg-panelBg border border-panelBorder hover:border-accentRed/35 hover:bg-accentRed/5 text-slate-400 hover:text-accentRed font-extrabold text-xs uppercase tracking-wider transition-all duration-300"
            >
              <MdDelete size={16} />
              Delete scan
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 text-left">
          
          {/* Diagnostic status block */}
          <div className={`p-6 rounded-3xl border ${
            isHemorrhage 
              ? 'glass-panel-danger border-accentRed/25 bg-red-950/5' 
              : 'glass-panel border-emerald-500/25 bg-emerald-950/5'
          }`}>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Diagnostic Finding</span>
            <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight mt-1.5 uppercase ${
              isHemorrhage ? 'text-accentRed glow-text-red' : 'text-accentGreen'
            }`}>
              {isHemorrhage ? 'Critical: Brain Hemorrhage Detected' : 'Normal Scan: No Hemorrhage Detected'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mt-2">
              Automated image assessment processes completed on CPU. Evaluated via pre-trained MobileNetV3 deep learning feature activations blended with local pixel hyperdensity segmented maps.
            </p>
          </div>

          {/* Enhanced Metrics summary grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5 col-span-2 md:col-span-1">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Hemorrhage Detection Score</span>
              <span className="text-3xl font-extrabold text-white mt-1 leading-none">
                {report.hemorrhage_detection_score !== undefined && report.hemorrhage_detection_score !== null ? `${report.hemorrhage_detection_score}%` : '0.00%'}
              </span>
              <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Hemorrhage Probability</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">AI Confidence Score</span>
              <span className="text-3xl font-extrabold text-white mt-1 leading-none">{report.confidence}%</span>
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Statistical precision</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Hemorrhage Severity</span>
              <span className="text-3xl font-extrabold text-white mt-1 leading-none">
                {isHemorrhage ? `${report.hemorrhage_percentage}%` : '0.00%'}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Affected tissue ratio</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Stroke Risk</span>
              <span className="text-3xl font-extrabold text-white mt-1 leading-none">{report.stroke_risk}%</span>
              <span className={`text-[9px] font-extrabold uppercase ${
                report.risk_level === 'High' ? 'text-accentRed' : report.risk_level === 'Moderate' ? 'text-amber-400' : 'text-accentGreen'
              }`}>
                {report.risk_level} Risk Level
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Epilepsy Risk</span>
              <span className="text-3xl font-extrabold text-white mt-1 leading-none">{report.epilepsy_risk}%</span>
              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Seizure probability</span>
            </div>

          </div>

          {/* Hemorrhage Location and Details */}
          {isHemorrhage && (
            <div className="flex flex-col gap-6">
              <BrainRegionMap 
                location={report.hemorrhage_location} 
                confidence={report.location_confidence} 
              />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl glass-panel border-panelBorder">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-3">Hemorrhage Location Analysis Summary</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-extrabold text-blue-400">{report.hemorrhage_location}</p>
                      <p className="text-[9px] text-slate-400 mt-1">Brain region affected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-300">{report.location_confidence * 100}%</p>
                      <p className="text-[9px] text-slate-400 mt-1">Classification confidence</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl glass-panel border-panelBorder">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-3">Dataset & Accuracy</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-slate-300 capitalize">{report.dataset_source}</p>
                      <p className="text-[9px] text-slate-400 mt-1">Data source</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">{report.model_accuracy}%</p>
                      <p className="text-[9px] text-slate-400 mt-1">Model accuracy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Alert Banner */}
          {report.is_emergency && (
            <div className="p-6 rounded-2xl bg-red-950/20 border border-accentRed/50 shadow-lg shadow-accentRed/10">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">🚨</span>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-accentRed uppercase tracking-wide">EMERGENCY - IMMEDIATE INTERVENTION REQUIRED</h3>
                  <p className="text-slate-300 text-sm mt-2">
                    This patient requires immediate medical attention. Critical symptoms and high-risk indicators are present.
                    Contact emergency services immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* First-Aid Recommendations Section */}
          {report.first_aid_needed && report.first_aid_recommendations && (
            <div className="p-6 rounded-2xl glass-panel border-accentRed/30 bg-red-950/10 border-2">
              <h3 className="text-lg font-extrabold text-accentRed uppercase tracking-wide mb-4 flex items-center gap-2">
                <span>📋</span> Emergency First-Aid Recommendations
              </h3>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 max-h-96 overflow-y-auto">
                <pre className="text-slate-200 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                  {report.first_aid_recommendations}
                </pre>
              </div>
              <p className="text-[9px] text-slate-400 mt-3 font-semibold">
                ℹ️ These recommendations are automated alerts. Always follow your medical institution's emergency protocols and consult with senior clinicians.
              </p>
            </div>
          )}

          {/* Visual Scans Display Side-by-Side */}
          <div className="grid md:grid-cols-2 gap-8 mt-2">
            
            {/* Original Input scan */}
            <div className="p-5 rounded-3xl glass-panel border-panelBorder flex flex-col gap-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                <MdZoomIn size={18} className="text-cyan-400" />
                Figure A: Input CT/MRI scan
              </h3>
              <div className="aspect-square w-full rounded-2xl border border-panelBorder overflow-hidden bg-black shadow-inner">
                <img 
                  src={`${API_URL}/${report.image_path}`} 
                  alt="Original Scan" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                Original Patient Modality File
              </span>
            </div>

            {/* Grad-CAM Heatmap overlay */}
            <div className="p-5 rounded-3xl glass-panel border-panelBorder flex flex-col gap-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                <MdAnalytics size={18} className="text-accentBlue" />
                Figure B: Hybrid Grad-CAM overlay
              </h3>
              <div className="aspect-square w-full rounded-2xl border border-panelBorder overflow-hidden bg-black shadow-inner">
                <img 
                  src={`${API_URL}/${report.heatmap_path}`} 
                  alt="Grad-CAM Overlay" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                Grad-CAM convolutional feature localized heatmap
              </span>
            </div>

          </div>

          {/* Dynamic Clinical Interpretation block */}
          <div className="p-6 rounded-2xl bg-panelBg/40 border border-panelBorder flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
              Clinical Interpretation & Patient Care Advice
            </h3>
            
            <div className="text-xs leading-relaxed text-slate-400 font-semibold flex flex-col gap-2">
              {report.risk_level === 'High' && (
                <p className="border-l-4 border-l-accentRed pl-3">
                  <strong className="text-white">CRITICAL PRIORITY ADVISORY:</strong> Patient presents high stroke risk probability ({report.stroke_risk}%) with acute brain hemorrhage indications. Immediate clinical assessment, emergency ICU admission, and neurosurgical consultations are recommended. Institute hyperventilation controls, maintain tight mean arterial pressure (MAP) controls, and prepare for serial cranial CT scans to evaluate hematoma expansion.
                </p>
              )}
              {report.risk_level === 'Moderate' && (
                <p className="border-l-4 border-l-amber-400 pl-3">
                  <strong className="text-white">MODERATE PRIORITY ADVISORY:</strong> Scan indicates atypical local tissue anomalies yielding moderate risk scores ({report.stroke_risk}%). Advise active clinical monitoring, serial neurological exams, and blood-pressure adjustments. Keep patient in a quiet setting and rule out underlying vascular malformations, ischemic infarct conversions, or minor microbleeds.
                </p>
              )}
              {report.risk_level === 'Low' && (
                <p className="border-l-4 border-l-accentGreen pl-3">
                  <strong className="text-white">ROUTINE ADVISORY:</strong> AI scan indicates normal brain tissue configurations with negligible hemorrhage risk ({report.stroke_risk}%). Patient presents low risk indices. Manage symptomatically (e.g., tension headache controls, migraine therapy) and verify there are no new acute focal neurological deficits.
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-2">
                * Note: Diagnostics calculated completely using transfer-learning compatible, CPU-optimized layers. Review findings alongside patient symptom history.
              </p>
            </div>
          </div>

          {/* Safety Disclaimer */}
          <MedicalDisclaimer />

        </div>
      </main>
    </div>
  );
};

export default AnalysisResult;
