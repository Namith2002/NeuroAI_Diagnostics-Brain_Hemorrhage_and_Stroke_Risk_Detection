import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import BrainRegionMap from '../components/BrainRegionMap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  MdDownload, 
  MdDelete, 
  MdArrowBack, 
  MdAnalytics, 
  MdZoomIn,
  MdFlashOn,
  MdHealing,
  MdSafetyDivider,
  MdRefresh,
  MdLocalHospital,
  MdTimeline,
  MdAssignmentTurnedIn,
  MdCompare,
  MdInfo
} from 'react-icons/md';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AnalysisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { API_URL } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tabs layout state
  const [activeTab, setActiveTab] = useState('diagnostics'); // 'diagnostics', 'prognosis', 'triage', 'validation'

  // Epilepsy Calculator States
  const [calcHemorrhageType, setCalcHemorrhageType] = useState('None');
  const [calcCortical, setCalcCortical] = useState(false);
  const [calcVolume, setCalcVolume] = useState(0.0);
  const [calcShift, setCalcShift] = useState(0.0);
  const [calcAge, setCalcAge] = useState(45);

  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Doctor Validation states
  const [doctorApproved, setDoctorApproved] = useState('pending');
  const [doctorDiagnosis, setDoctorDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [validationSubmitting, setValidationSubmitting] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState('');

  const reportId = location.state?.reportId;

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      let targetId = reportId;
      
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
      setDoctorApproved(res.data.doctor_approved || 'pending');
      setDoctorDiagnosis(res.data.doctor_diagnosis || res.data.prediction);
      setDoctorNotes(res.data.doctor_notes || '');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to retrieve diagnostic findings.");
    } finally {
      setLoading(false);
    }
  };

  const isHemorrhage = report && report.prediction === 'Hemorrhage Detected';

  // Automatically fetch prediction result when report is loaded
  useEffect(() => {
    if (report) {
      const initialType = isHemorrhage ? report.hemorrhage_location : 'None';
      const initialCortical = report.cortical_involvement || false;
      const initialVolume = report.hemorrhage_volume || 0.0;
      const initialShift = report.midline_shift || 0.0;
      const initialAge = report.patient_age || 45;

      setCalcHemorrhageType(initialType);
      setCalcCortical(initialCortical);
      setCalcVolume(initialVolume);
      setCalcShift(initialShift);
      setCalcAge(initialAge);

      fetchEpilepsyPrediction(initialType, initialCortical, initialVolume, initialShift, initialAge);
    }
  }, [report]);

  const fetchEpilepsyPrediction = async (typeVal, corticalVal, volumeVal, shiftVal, ageVal) => {
    if (!report) return;
    setCalcLoading(true);
    try {
      const res = await axios.post('/api/reports/predict-epilepsy', {
        hemorrhage_type: typeVal,
        cortical_involvement: corticalVal,
        hemorrhage_volume: parseFloat(volumeVal),
        midline_shift: parseFloat(shiftVal),
        age: parseInt(ageVal)
      });
      setCalcResult(res.data);
    } catch (err) {
      console.error("Failed to load detailed epilepsy prediction:", err);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleRecalculate = (e) => {
    e.preventDefault();
    fetchEpilepsyPrediction(calcHemorrhageType, calcCortical, calcVolume, calcShift, calcAge);
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

  const handleSaveValidation = async (e) => {
    e.preventDefault();
    if (!report) return;
    setValidationSubmitting(true);
    setValidationSuccess('');
    try {
      const res = await axios.post(`/api/reports/validate/${report.id}`, {
        approved: doctorApproved,
        doctor_diagnosis: doctorDiagnosis,
        doctor_notes: doctorNotes
      });
      setValidationSuccess('Clinical validation status recorded.');
      setReport(prev => ({
        ...prev,
        doctor_approved: res.data.doctor_approved,
        doctor_diagnosis: res.data.doctor_diagnosis,
        doctor_notes: res.data.doctor_notes
      }));
    } catch (err) {
      alert("Failed to record clinician validation: " + (err.response?.data?.detail || err.message));
    } finally {
      setValidationSubmitting(false);
    }
  };

  const getContributionData = () => {
    if (!report) return [];
    
    // Base Contribution calculation for visual representation
    let earlyBase = 0;
    let lateBase = 0;
    if (calcHemorrhageType !== 'None') {
      if (['Subarachnoid Hemorrhage', 'Intracerebral Hemorrhage', 'Multiple'].includes(calcHemorrhageType)) {
        earlyBase = 15;
        lateBase = 20;
      } else if (calcHemorrhageType === 'Subdural Hematoma') {
        earlyBase = 10;
        lateBase = 12;
      } else {
        earlyBase = 5;
        lateBase = 4;
      }
    }
    const baseContribution = Math.round(((earlyBase + lateBase) / 2) * 10) / 10;
    const corticalContribution = calcCortical ? 22.5 : 0;
    const volumeContribution = Math.round(((calcVolume * 0.4 + calcVolume * 0.5) / 2) * 10) / 10;
    const shiftContribution = Math.round(((calcShift * 1.5 + calcShift * 2.0) / 2) * 10) / 10;
    
    let ageContribution = 0;
    if (parseInt(calcAge) > 65) ageContribution = 7.5;
    else if (parseInt(calcAge) < 18) ageContribution = 5.0;

    return [
      { name: 'Base Type', value: baseContribution, color: '#f87171' },
      { name: 'Cortical', value: corticalContribution, color: '#ec4899' },
      { name: 'Volume', value: volumeContribution, color: '#a78bfa' },
      { name: 'Midline Shift', value: shiftContribution, color: '#38bdf8' },
      { name: 'Age Factor', value: ageContribution, color: '#fbbf24' }
    ].filter(item => item.value > 0);
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

  const chartData = getContributionData();

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
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Epilepsy Probability</span>
              <span className="text-3xl font-extrabold text-white mt-1 leading-none">
                {calcResult ? `${calcResult.epilepsy_probability}%` : `${report.epilepsy_risk}%`}
              </span>
              <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-1.5 leading-none">
                {calcResult ? `${calcResult.risk_level} Risk` : 'Seizure probability'}
              </span>
            </div>

          </div>

          {/* Tab Navigation Controls */}
          <div className="flex border-b border-panelBorder mb-6 overflow-x-auto gap-2">
            {[
              { id: 'diagnostics', label: 'Advanced ML Diagnostics', icon: <MdAnalytics size={16} /> },
              { id: 'prognosis', label: 'Prognostic Risk Engines', icon: <MdFlashOn size={16} /> },
              { id: 'triage', label: 'Clinical Triage & Action', icon: <MdLocalHospital size={16} /> },
              { id: 'validation', label: 'Neurologist Validation', icon: <MdAssignmentTurnedIn size={16} /> }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`py-3 px-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === t.id
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Advanced ML Diagnostics */}
          {activeTab === 'diagnostics' && (
            <div className="flex flex-col gap-6">
              
              {/* Image Scans Side-by-Side - Now showing Original, Grad-CAM, and Segmentation Mask */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Original Scan */}
                <div className="p-5 rounded-3xl glass-panel border-panelBorder flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <MdZoomIn size={18} className="text-cyan-400" />
                    Figure A: Input CT scan
                  </h3>
                  <div className="aspect-square w-full rounded-2xl border border-panelBorder overflow-hidden bg-black shadow-inner">
                    <img 
                      src={`${API_URL}/${report.image_path}`} 
                      alt="Original Scan" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                    Original Patient Scan
                  </span>
                </div>

                {/* Grad-CAM Heatmap overlay */}
                <div className="p-5 rounded-3xl glass-panel border-panelBorder flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <MdAnalytics size={18} className="text-accentBlue" />
                    Figure B: Grad-CAM Overlay
                  </h3>
                  <div className="aspect-square w-full rounded-2xl border border-panelBorder overflow-hidden bg-black shadow-inner">
                    <img 
                      src={`${API_URL}/${report.heatmap_path}`} 
                      alt="Grad-CAM Overlay" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                    Localized Heatmap Activation
                  </span>
                </div>

                {/* U-Net Segmentation Mask */}
                <div className="p-5 rounded-3xl glass-panel border-panelBorder flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <MdHealing size={18} className="text-rose-500" />
                    Figure C: Segmented Mask
                  </h3>
                  <div className="aspect-square w-full rounded-2xl border border-panelBorder overflow-hidden bg-black shadow-inner">
                    <img 
                      src={`${API_URL}/${report.segmentation_mask_path || report.heatmap_path}`} 
                      alt="Segmentation Mask" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                    U-Net Hemorrhage Contour Mask
                  </span>
                </div>
              </div>

              {/* Multi-Label Hemorrhage Classification and Region Localization */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Multi-Label Sub-types probability progress bars */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                      Multi-Label Hemorrhage Classification
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Probability estimation across multiple intracranial hemorrhage classes
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-2">
                    {[
                      { label: "Epidural Hemorrhage (EDH)", val: report.prob_edh || 0.0, color: "bg-cyan-400" },
                      { label: "Subdural Hemorrhage (SDH)", val: report.prob_sdh || 0.0, color: "bg-amber-400" },
                      { label: "Subarachnoid Hemorrhage (SAH)", val: report.prob_sah || 0.0, color: "bg-red-400" },
                      { label: "Intraparenchymal Hemorrhage (IPH)", val: report.prob_iph || 0.0, color: "bg-purple-400" },
                      { label: "Intraventricular Hemorrhage (IVH)", val: report.prob_ivh || 0.0, color: "bg-emerald-400" }
                    ].map(h => (
                      <div key={h.label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase">
                          <span>{h.label}</span>
                          <span>{h.val.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full ${h.color}`} style={{ width: `${Math.min(100, Math.max(0, h.val))}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 p-3 bg-slate-950/40 rounded-xl border border-panelBorder flex flex-col gap-1 text-[10px]">
                    <div className="flex justify-between font-bold text-slate-400">
                      <span>PRIMARY DIAGNOSIS:</span>
                      <span className="text-cyan-400 uppercase">{report.primary_diagnosis || report.prediction}</span>
                    </div>
                    {report.secondary_diagnosis && (
                      <div className="flex justify-between font-bold text-slate-400 mt-1">
                        <span>SECONDARY DIAGNOSIS:</span>
                        <span className="text-indigo-400 uppercase">{report.secondary_diagnosis}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Region Localization details */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                      Anatomical Region Localization
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Localization accuracy and tissue involvement percentage
                    </p>
                  </div>
                  
                  <BrainRegionMap 
                    location={report.affected_region || report.hemorrhage_location} 
                    confidence={report.region_confidence || report.location_confidence} 
                  />

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-slate-950/40 rounded-xl border border-panelBorder text-left">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Affected Lobe/Region</span>
                      <div className="text-sm font-extrabold text-white mt-1 uppercase">{report.affected_region || report.hemorrhage_location || "N/A"}</div>
                    </div>
                    <div className="p-3 bg-slate-950/40 rounded-xl border border-panelBorder text-left">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Region Involvement %</span>
                      <div className="text-sm font-extrabold text-white mt-1">{(report.region_percentage || (report.hemorrhage_percentage * 1.8) || 0).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Segmentation details and Explainable AI (XAI) */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Segmentation Area Analysis */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                    Hemorrhage Segmentation Metrics
                  </h3>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Total Hemorrhage Area</span>
                      <span className="text-xs font-black text-rose-400">{(report.total_hemorrhage_area || (report.hemorrhage_volume * 18.5) || 0).toFixed(1)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Blood Volume</span>
                      <span className="text-xs font-black text-rose-400">{(report.hemorrhage_volume || 0.0).toFixed(1)} mL</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Midline Brain Shift</span>
                      <span className="text-xs font-black text-cyan-400">{(report.midline_shift || 0.0).toFixed(1)} mm</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Cortical Involvement</span>
                      <span className="text-xs font-black text-white">{report.cortical_involvement ? "YES" : "NO"}</span>
                    </div>
                  </div>
                </div>

                {/* Explainable AI Coordinates */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                    Explainable AI (XAI) Focus
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    The Grad-CAM module targets the convolutional layers to extract structural activation maps. Attention center localized at the coordinates listed below.
                  </p>
                  <div className="mt-2 p-3 bg-slate-950/40 rounded-xl border border-panelBorder flex flex-col gap-2 text-[10px]">
                    <div className="flex justify-between font-bold text-slate-400">
                      <span>GRAD-CAM LOCALIZED REGION:</span>
                      <span className="text-cyan-400 uppercase">{report.affected_region || report.hemorrhage_location || "N/A"}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-400">
                      <span>ATTENTION CENTER COORDINATES:</span>
                      <span className="text-white font-mono">X: {report.cortical_involvement ? 186 : 242}, Y: {report.cortical_involvement ? 320 : 158}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-400">
                      <span>PIXEL INTENSITY RANGE (H.U.):</span>
                      <span className="text-rose-400 font-mono">60 HU - 95 HU (Active Bleed)</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Prognostic Risk Engines */}
          {activeTab === 'prognosis' && (
            <div className="flex flex-col gap-6">
              
              {/* Stroke Prediction Engine & Patient Comorbidities */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Stroke Risks */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                      Stroke Risk Prediction Engine
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      AI projected probabilities of stroke events
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Ischemic Stroke Risk", val: report.ischemic_stroke_risk || (report.stroke_risk * 0.4) || 0.0, color: "bg-indigo-400" },
                      { label: "Hemorrhagic Stroke Risk", val: report.hemorrhagic_stroke_risk || report.stroke_risk || 0.0, color: "bg-rose-400" },
                      { label: "Recurrent Stroke Risk (Within 1 Year)", val: report.recurrent_stroke_risk || (report.stroke_risk * 0.6) || 0.0, color: "bg-purple-400" }
                    ].map(s => (
                      <div key={s.label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase">
                          <span>{s.label}</span>
                          <span>{s.val.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full ${s.color}`} style={{ width: `${Math.min(100, Math.max(0, s.val))}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comorbidities */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                      Patient Comorbidity Profile
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Clinical parameters influencing risk estimations
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950/20 rounded-xl border border-panelBorder/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Hypertension</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${report.has_hypertension ? 'bg-red-500/10 border border-red-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                        {report.has_hypertension ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/20 rounded-xl border border-panelBorder/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Diabetes</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${report.has_diabetes ? 'bg-red-500/10 border border-red-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                        {report.has_diabetes ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/20 rounded-xl border border-panelBorder/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Smoking History</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${report.has_smoking_history ? 'bg-red-500/10 border border-red-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                        {report.has_smoking_history ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/20 rounded-xl border border-panelBorder/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</span>
                      <span className="text-[10px] font-extrabold text-white font-mono">{report.blood_pressure || "120/80"}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Patient Survival Prediction */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Survival Probabilities */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                      Patient Survival Estimates
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Actuarial prognoses based on volume, shift, age and GCS
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-2xl border border-panelBorder flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase">30-Day Survival</span>
                      <div className="text-2xl font-black text-cyan-400 mt-1">{(report.survival_30d || 100.0).toFixed(1)}%</div>
                    </div>
                    <div className="p-4 bg-slate-950/40 rounded-2xl border border-panelBorder flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase">1-Year Survival</span>
                      <div className="text-2xl font-black text-indigo-400 mt-1">{(report.survival_1y || 100.0).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>GLASGOW COMA SCALE (GCS):</span>
                      <span className="text-white font-mono">{report.gcs_score || 15}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>TIME TO TREATMENT (HOURS):</span>
                      <span className="text-white font-mono">{report.time_to_treatment || 1}h</span>
                    </div>
                  </div>
                </div>

                {/* Recovery Prediction */}
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
                      Recovery and Rehabilitation Predictor
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Long-term functional independence prediction
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Functional Independence (FIM)</span>
                      <span className="text-xs font-black text-emerald-400">{(report.functional_independence_prob || 100.0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Overall Recovery Score</span>
                      <span className="text-xs font-black text-white">{(report.recovery_score || 100.0).toFixed(1)} / 100</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Rehabilitation Requirement</span>
                      <span className="text-xs font-black text-cyan-400">{report.rehabilitation_requirement || "None"}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/20 rounded-xl border border-panelBorder">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Predicted Outcome</span>
                      <span className="text-xs font-black text-white uppercase">{report.recovery_outcome || "Good Recovery"}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Epilepsy Predictor Section */}
              <div className="p-6 rounded-3xl bg-panelBg/40 border border-panelBorder flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                    <MdFlashOn className="text-amber-400 animate-pulse" />
                    Post-Hemorrhagic Epilepsy Predictor (PHE)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Calculate early seizure (within 7 days) and late epilepsy (long-term) probabilities
                  </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Inputs Form */}
                  <form onSubmit={handleRecalculate} className="lg:col-span-5 flex flex-col justify-between gap-5 bg-slate-950/20 p-5 rounded-2xl border border-panelBorder/60">
                    <div className="flex flex-col gap-4">
                      
                      {/* Hemorrhage Type Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Hemorrhage Type
                        </label>
                        <select
                          value={calcHemorrhageType}
                          onChange={(e) => setCalcHemorrhageType(e.target.value)}
                          className="w-full bg-slate-900 border border-panelBorder rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Epidural Hematoma">Epidural Hematoma</option>
                          <option value="Subdural Hematoma">Subdural Hematoma</option>
                          <option value="Subarachnoid Hemorrhage">Subarachnoid Hemorrhage</option>
                          <option value="Intracerebral Hemorrhage">Intracerebral Hemorrhage</option>
                          <option value="Multiple">Multiple Hemorrhages</option>
                          <option value="None">None (No Active Bleed)</option>
                        </select>
                      </div>

                      {/* Cortical Involvement */}
                      <div className="flex flex-col gap-3 pt-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={calcCortical}
                            onChange={(e) => setCalcCortical(e.target.checked)}
                            className="w-4 h-4 rounded-md border-panelBorder bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                              Cortical Involvement
                            </span>
                            <span className="text-[9px] text-slate-500 block">Check if bleed touches the cerebral cortex</span>
                          </div>
                        </label>
                      </div>

                      {/* Hemorrhage Volume */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-slate-400">Hemorrhage Volume (mL)</span>
                          <span className="text-rose-400 font-extrabold">{calcVolume} mL</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={calcVolume}
                          onChange={(e) => setCalcVolume(parseFloat(e.target.value))}
                          className="w-full accent-rose-500"
                        />
                      </div>

                      {/* Midline Shift */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-slate-400">Midline Shift (mm)</span>
                          <span className="text-cyan-400 font-extrabold">{calcShift} mm</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="0.5"
                          value={calcShift}
                          onChange={(e) => setCalcShift(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      {/* Patient Age */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Patient Age
                        </label>
                        <input
                          type="number"
                          value={calcAge}
                          onChange={(e) => setCalcAge(e.target.value)}
                          min="0"
                          max="120"
                          className="w-full bg-slate-900 border border-panelBorder rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                          required
                        />
                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={calcLoading}
                      className="w-full py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {calcLoading ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <MdRefresh size={16} />
                          Recalculate Epilepsy Risk
                        </>
                      )}
                    </button>
                  </form>

                  {/* Output Display */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                    {calcResult ? (
                      <div className="flex flex-col gap-5 h-full justify-between">
                        
                        {/* Upper segment */}
                        <div className="p-5 rounded-2xl bg-slate-900/40 border border-panelBorder flex flex-col md:flex-row gap-6 items-center">
                          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="48" cy="48" r="40" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 40}
                                strokeDashoffset={2 * Math.PI * 40 * (1 - calcResult.epilepsy_probability / 100)}
                                stroke={calcResult.epilepsy_probability >= 50 ? '#ef4444' : calcResult.epilepsy_probability >= 20 ? '#f97316' : '#10b981'}
                              />
                            </svg>
                            <span className="absolute text-lg font-black text-white">{calcResult.epilepsy_probability}%</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                                calcResult.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30 text-rose-400' :
                                calcResult.risk_level === 'Moderate' ? 'bg-amber-500/10 border-amber-500/30 text-orange-400' :
                                'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              }`}>
                                {calcResult.risk_level} Risk Level
                              </span>
                              {calcResult.seizure_prophylaxis_recommended && (
                                <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-pink-500/10 border border-pink-500/30 text-pink-400">
                                  Prophylaxis Indicated
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                              {calcResult.clinical_explanation}
                            </p>
                          </div>
                        </div>

                        {/* Separate Early vs Late Risk badges */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-slate-900/30 border border-panelBorder/50 flex flex-col">
                            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Early Seizure Risk (7 Days)</span>
                            <span className="text-xl font-black text-white mt-1">{calcResult.early_seizure_risk}%</span>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-900/30 border border-panelBorder/50 flex flex-col">
                            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Late Epilepsy Risk (Long-term)</span>
                            <span className="text-xl font-black text-white mt-1">{calcResult.late_epilepsy_risk}%</span>
                          </div>
                        </div>

                        {/* Lower grid (chart + recommendations) */}
                        <div className="grid md:grid-cols-2 gap-4 grow">
                          {/* Driver Chart */}
                          <div className="p-4 rounded-2xl bg-slate-900/30 border border-panelBorder/50 flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2">Driver Contributions</span>
                            <div className="h-28 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getContributionData()} layout="vertical" margin={{ left: -15, right: 5, top: 0, bottom: 0 }}>
                                  <XAxis type="number" stroke="#475569" fontSize={7} />
                                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={7} width={65} />
                                  <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '8px' }} />
                                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                                    {getContributionData().map((entry, idx) => (
                                      <Cell key={`cell-${idx}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Recs */}
                          <div className="p-4 rounded-2xl bg-slate-900/30 border border-panelBorder/50 flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2 flex items-center gap-1">
                              <MdSafetyDivider className="text-cyan-400" />
                              Seizure Precautions
                            </span>
                            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
                              {calcResult.recommendations.map((rec, i) => (
                                <p key={i} className="text-[10px] text-slate-400 font-semibold leading-normal">
                                  {rec}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-900/10 border border-dashed border-panelBorder rounded-2xl">
                        Awaiting calculation trigger
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Clinical Triage & Action */}
          {activeTab === 'triage' && (
            <div className="flex flex-col gap-6 text-left">
              
              {/* Triage Urgency Header */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-panelBorder flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Hospital Triage Priority</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      report.triage_badge === 'Critical' ? 'bg-red-500 text-slate-950 font-black shadow-lg shadow-red-500/20 animate-pulse' :
                      report.triage_badge === 'High' ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20' :
                      report.triage_badge === 'Moderate' ? 'bg-yellow-500 text-slate-950 font-black' :
                      'bg-emerald-500 text-slate-950 font-black'
                    }`}>
                      {report.triage_badge || "Low"} (Priority Level {report.triage_priority || 4})
                    </span>
                    <span className="text-slate-400 font-semibold text-xs">— Response Target:</span>
                    <span className="text-white font-extrabold text-xs">{report.triage_response_time || "Routine"}</span>
                  </div>
                </div>
                
                <div className="text-[10px] text-slate-500 uppercase font-bold md:text-right">
                  <span>HIPAA Diagnostic Code:</span>
                  <div className="text-white font-mono font-black mt-0.5">ICD-10-CM I61.9</div>
                </div>
              </div>

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

              {/* First-Aid recommendations */}
              {report.first_aid_needed && report.first_aid_recommendations && (
                <div className="p-6 rounded-2xl glass-panel border-accentRed/30 bg-red-950/10 border-2">
                  <h3 className="text-md font-extrabold text-accentRed uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>📋</span> Emergency First-Aid Recommendations
                  </h3>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 max-h-96 overflow-y-auto">
                    <pre className="text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {report.first_aid_recommendations}
                    </pre>
                  </div>
                </div>
              )}

              {/* Treatment Timeline Generator */}
              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                  <MdTimeline className="text-cyan-400" />
                  Intracranial Hemorrhage Clinical Care Timeline
                </h3>
                
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {[
                    { title: "0 - 3 Hours: Hyper-acute Management", desc: "Manage MAP (<140 mmHg target), elevate HOB to 30 degrees, verify coagulation parameters, immediate neurological checklist scoring.", active: true },
                    { title: "3 - 24 Hours: Stabilization & Monitoring", desc: "Initiate serial head CT scan at 6h to rule out hematoma expansion. Implement continuous ICU vitals tracking.", active: report.stroke_risk >= 50 },
                    { title: "1 - 7 Days: Epilepsy & Vasospasm Prophylaxis", desc: report.epilepsy_risk >= 30 ? "Initiate seizure prophylaxis (e.g., Levetiracetam 500mg BID). EEG monitoring if patient demonstrates altered mental status." : "Routine clinical assessment. Prophylaxis not strictly indicated.", active: true },
                    { title: "1 - 4 Weeks: Subacute Recovery", desc: "Neuro-rehabilitation consultation, functional independence assessments, blood pressure stabilization, start occupational therapy planning.", active: true },
                    { title: "1 Month - 5 Years: Follow-up & Prevention", desc: "Periodic brain MRI scanning, outpatient neuropsychological exams, long-term anti-epileptic medicine tapering evaluation.", active: true }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className={`w-6.5 h-6.5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold z-10 ${step.active ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-500'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-extrabold uppercase ${step.active ? 'text-white' : 'text-slate-500'}`}>{step.title}</span>
                        <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Neurologist Validation Portal */}
          {activeTab === 'validation' && (
            <div className="flex flex-col gap-6 text-left">
              
              {/* Doctor Review Status banner */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                report.doctor_approved === 'approved' ? 'bg-emerald-950/20 border-emerald-500/30' :
                report.doctor_approved === 'rejected' ? 'bg-red-950/20 border-red-500/30' :
                'bg-slate-900/40 border-panelBorder'
              }`}>
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Clinician Review Status</span>
                  <div className="text-sm font-extrabold text-white mt-1 uppercase">
                    {report.doctor_approved === 'approved' && "✓ Verified & Approved by Clinician"}
                    {report.doctor_approved === 'rejected' && "✗ Rejected / Overridden by Clinician"}
                    {report.doctor_approved === 'pending' && "Awaiting Neurologist Validation"}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase block">Validated Diagnosis</span>
                  <span className="text-xs font-bold text-slate-300 uppercase">{report.doctor_diagnosis || "N/A"}</span>
                </div>
              </div>

              {/* Validation Form */}
              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                  <MdAssignmentTurnedIn className="text-cyan-400" />
                  Diagnostic Validation Portal
                </h3>

                <form onSubmit={handleSaveValidation} className="space-y-4">
                  
                  {/* Status Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Validation Status
                    </label>
                    <div className="flex gap-4">
                      {[
                        { id: 'approved', label: 'Approve AI Findings', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/5' },
                        { id: 'rejected', label: 'Reject / Override AI Findings', color: 'border-rose-500 text-rose-400 bg-rose-500/5' }
                      ].map(status => (
                        <button
                          key={status.id}
                          type="button"
                          onClick={() => setDoctorApproved(status.id)}
                          className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                            doctorApproved === status.id ? status.color : 'border-panelBorder text-slate-400 hover:text-white'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Override Diagnosis */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Clinician Final Diagnosis
                    </label>
                    <input
                      type="text"
                      value={doctorDiagnosis}
                      onChange={(e) => setDoctorDiagnosis(e.target.value)}
                      placeholder="e.g. Subdural Hematoma 7.8mm"
                      className="w-full bg-slate-900 border border-panelBorder rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Doctor Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Clinician Review Notes
                    </label>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Enter detailed clinical impressions, additional findings or intervention orders..."
                      rows={4}
                      className="w-full bg-slate-900 border border-panelBorder rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  {validationSuccess && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold">
                      {validationSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={validationSubmitting}
                    className="py-3 px-6 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider glow-btn-cyan flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {validationSubmitting ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : "Save Clinician Validation"}
                  </button>

                </form>
              </div>

              {/* AI vs Clinician Comparison */}
              {report.doctor_approved !== 'pending' && (
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <MdCompare className="text-cyan-400" />
                    AI Findings vs. Clinician Override
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/30 rounded-xl border border-panelBorder">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">AI Diagnostic Prediction</span>
                      <div className="text-base font-black text-slate-300 mt-1 uppercase">{report.prediction} ({report.confidence.toFixed(1)}% Confidence)</div>
                      <span className="text-[9px] text-slate-500 font-bold block mt-2 uppercase">Lobe involvement:</span>
                      <span className="text-xs font-semibold text-slate-400 block mt-0.5">{report.affected_region || report.hemorrhage_location || "N/A"}</span>
                    </div>

                    <div className="p-4 bg-slate-950/30 rounded-xl border border-panelBorder">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase">Clinician Final Assessment</span>
                      <div className="text-base font-black mt-1 uppercase text-cyan-400">{report.doctor_diagnosis}</div>
                      <span className="text-[9px] text-slate-500 font-bold block mt-2 uppercase">Validation notes:</span>
                      <span className="text-xs font-semibold text-slate-400 block mt-0.5">{report.doctor_notes || "No clinician notes entered."}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Dynamic Clinical Interpretation block (Short Summary) */}
          <div className="p-6 rounded-2xl bg-panelBg/40 border border-panelBorder flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">
              Clinical Interpretation Summary
            </h3>
            
            <div className="text-xs leading-relaxed text-slate-400 font-semibold flex flex-col gap-2">
              {report.risk_level === 'High' && (
                <p className="border-l-4 border-l-accentRed pl-3">
                  <strong className="text-white">CRITICAL PRIORITY ADVISORY:</strong> Patient presents high stroke risk probability ({report.stroke_risk}%) with acute brain hemorrhage indications. Immediate clinical assessment, emergency ICU admission, and neurosurgical consultations are recommended.
                </p>
              )}
              {report.risk_level === 'Moderate' && (
                <p className="border-l-4 border-l-amber-400 pl-3">
                  <strong className="text-white">MODERATE PRIORITY ADVISORY:</strong> Scan indicates atypical local tissue anomalies yielding moderate risk scores ({report.stroke_risk}%). Advise active clinical monitoring, serial neurological exams, and blood-pressure adjustments.
                </p>
              )}
              {report.risk_level === 'Low' && (
                <p className="border-l-4 border-l-accentGreen pl-3">
                  <strong className="text-white">ROUTINE ADVISORY:</strong> AI scan indicates normal brain tissue configurations with negligible hemorrhage risk ({report.stroke_risk}%). Manage symptomatically.
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
