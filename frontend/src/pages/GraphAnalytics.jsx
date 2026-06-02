import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  MdShowChart, MdAnalytics, MdSettingsInputAntenna, MdLayers, 
  MdAssessment, MdShield, MdCloudUpload, MdTrackChanges 
} from 'react-icons/md';

const GraphAnalytics = () => {
  // Analytical data states
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [accuracyData, setAccuracyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('clinical'); // 'clinical' or 'ai-models'

  // Model comparison metadata loaded from python outputs
  const [modelStats, setModelStats] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes, accuracyRes] = await Promise.all([
        axios.get('/api/admin/reports'),
        axios.get('/api/admin/statistics'),
        axios.get('/api/admin/graph-analysis/dataset-accuracy-comparison')
      ]);

      setReports(reportsRes.data || []);
      setStats(statsRes.data);
      setAccuracyData(accuracyRes.data);

      // Attempt to load generated model stats
      try {
        const modelRes = await axios.get('/uploads/training_results/model_comparison_stats.json');
        setModelStats(modelRes.data);
      } catch (e) {
        console.warn("Model comparison stats file not available yet:", e);
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#00e5ff', '#ff1744', '#fbbf24', '#818cf8', '#ec4899', '#10b981', '#f59e0b'];

  // Data processing for clinical charts
  // 1. Hemorrhage Probability Chart & 7. Historical Progress Tracking
  const historicalData = [...reports].reverse().map((r, idx) => ({
    name: `Scan #${r.id}`,
    probability: r.prediction === 'Hemorrhage Detected' ? r.confidence : (100 - r.confidence),
    strokeRisk: r.stroke_risk,
    epilepsyRisk: r.epilepsy_risk,
    volume: r.hemorrhage_percentage * 2.5, // Mock volume mapping based on percentage
    date: new Date(r.created_at).toLocaleDateString()
  }));

  // 2. Stroke Risk Category counts
  const strokeRiskCounts = [
    { name: 'Critical Risk (>75%)', value: reports.filter(r => r.stroke_risk >= 75).length, color: '#ff1744' },
    { name: 'High Risk (50-75%)', value: reports.filter(r => r.stroke_risk >= 50 && r.stroke_risk < 75).length, color: '#f97316' },
    { name: 'Moderate (25-50%)', value: reports.filter(r => r.stroke_risk >= 25 && r.stroke_risk < 50).length, color: '#fbbf24' },
    { name: 'Low Risk (<25%)', value: reports.filter(r => r.stroke_risk < 25).length, color: '#10b981' }
  ].filter(c => c.value > 0);

  // 3. Epilepsy Risk Category counts
  const epilepsyRiskCounts = [
    { name: 'High Seizure Risk', value: reports.filter(r => r.epilepsy_risk >= 60).length, color: '#ec4899' },
    { name: 'Moderate Seizure Risk', value: reports.filter(r => r.epilepsy_risk >= 30 && r.epilepsy_risk < 60).length, color: '#818cf8' },
    { name: 'Low Risk', value: reports.filter(r => r.epilepsy_risk < 30).length, color: '#10b981' }
  ].filter(c => c.value > 0);

  // 4. Treatment Urgency Gauge (Triage levels)
  const triageLevels = [
    { name: 'Immediate Emergency', value: reports.filter(r => r.is_emergency && r.stroke_risk >= 75).length, color: '#ff1744' },
    { name: 'Urgent Intervention', value: reports.filter(r => r.prediction === 'Hemorrhage Detected' && !r.is_emergency).length, color: '#f97316' },
    { name: 'Monitor Closely', value: reports.filter(r => r.prediction !== 'Hemorrhage Detected' && r.stroke_risk > 40).length, color: '#fbbf24' },
    { name: 'Routine Follow-up', value: reports.filter(r => r.prediction !== 'Hemorrhage Detected' && r.stroke_risk <= 40).length, color: '#10b981' }
  ].filter(t => t.value > 0);

  // 5. Hemorrhage Volume Scatter
  const volumeScatter = reports
    .filter(r => r.prediction === 'Hemorrhage Detected')
    .map(r => ({
      volume: parseFloat((r.hemorrhage_percentage * 3.2).toFixed(2)), // Bleed volume representation
      strokeRisk: r.stroke_risk,
      name: `Scan #${r.id}`
    }));

  // 6. Brain Region Involvement mapping
  const regionMapping = {};
  reports.forEach(r => {
    if (r.hemorrhage_location && r.hemorrhage_location !== 'N/A') {
      regionMapping[r.hemorrhage_location] = (regionMapping[r.hemorrhage_location] || 0) + 1;
    }
  });
  const brainRegionData = Object.entries(regionMapping).map(([name, count]) => ({
    name,
    count
  }));

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Workspace */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
              <MdAnalytics className="text-cyan-400" />
              Graph Analytics & Insights
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              CLINICAL POPULATION STATS & NEURAL ARCHITECTURE BENCHMARKS
            </p>
          </div>
          
          {/* View Toggles */}
          <div className="bg-panelBg/80 p-1.5 rounded-xl border border-panelBorder flex items-center gap-2">
            <button
              onClick={() => setActiveView('clinical')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeView === 'clinical' 
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-accentBlue' 
                  : 'text-slate-500 hover:text-white border border-transparent'
              }`}
            >
              Clinical Diagnostics
            </button>
            <button
              onClick={() => setActiveView('ai-models')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeView === 'ai-models' 
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-accentBlue' 
                  : 'text-slate-500 hover:text-white border border-transparent'
              }`}
            >
              AI Neural Models
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950 border border-red-800 text-red-300 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-96 flex items-center justify-center text-accentBlue">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs tracking-widest font-extrabold uppercase animate-pulse">Loading analytics matrix...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {activeView === 'clinical' ? (
              // Clinical Metrics Section (7 charts)
              reports.length === 0 ? (
                <div className="py-24 rounded-3xl glass-panel border-panelBorder flex flex-col items-center justify-center gap-4 text-slate-500 text-left max-w-xl mx-auto">
                  <MdTrackChanges size={48} className="text-slate-600 animate-pulse" />
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">No Cohort Scans Registered</h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed text-center px-6">
                    Clinical graphs compile statistics dynamically across all patient database entries. Please upload brain CT scans to populate the chart records.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-12 gap-6">
                  
                  {/* Chart 1: Hemorrhage Probability over history */}
                  <div className="md:col-span-8 p-5 rounded-2xl glass-panel border-panelBorder">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      1. Hemorrhage Detection Probability Graph
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                          <Area type="monotone" dataKey="probability" stroke="#00e5ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProb)" name="Detection Score %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 4: Treatment Urgency Gauge */}
                  <div className="md:col-span-4 p-5 rounded-2xl glass-panel border-panelBorder flex flex-col justify-between">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">
                      4. Clinical Triage Urgency Distribution
                    </h3>
                    <div className="h-44 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={triageLevels}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {triageLevels.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center leading-none">
                        <span className="text-xl font-black text-white">{reports.length}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">TOTAL CASES</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {triageLevels.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-white">{item.value} patients</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart 2: Stroke Risk Assessment Chart */}
                  <div className="md:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      2. Stroke Risk Category Metrics
                    </h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={strokeRiskCounts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Patient Count">
                            {strokeRiskCounts.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Epilepsy Risk Assessment Chart */}
                  <div className="md:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      3. Seizure/Epilepsy Risk Spectrum
                    </h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={epilepsyRiskCounts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                          <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} name="Patient Count">
                            {epilepsyRiskCounts.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 5: Hemorrhage Volume Distribution */}
                  <div className="md:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      5. Hemorrhage Volume (ml) vs. Stroke Risk (%)
                    </h3>
                    <div className="h-60">
                      {volumeScatter.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                            <XAxis type="number" dataKey="volume" name="Bleed Volume" unit=" ml" stroke="#64748b" fontSize={9} />
                            <YAxis type="number" dataKey="strokeRisk" name="Stroke Risk" unit="%" stroke="#64748b" fontSize={9} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                            <Scatter name="Bleeds" data={volumeScatter} fill="#ff1744" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500 text-[11px] uppercase font-bold">
                          No active bleeds diagnosed to plot volume.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chart 6: Brain Region Involvement Chart */}
                  <div className="md:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      6. Anatomical Hemorrhage Locations (Cohort Frequency)
                    </h3>
                    <div className="h-60">
                      {brainRegionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={brainRegionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                            <YAxis stroke="#64748b" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                              {brainRegionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500 text-[11px] uppercase font-bold">
                          No hemorrhage location scans registered yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chart 7: Historical Progress Tracking */}
                  <div className="md:col-span-12 p-5 rounded-2xl glass-panel border-panelBorder">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      7. Historical Risk Progression Tracking (Stroke vs. Epilepsy Correlation)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                          <YAxis stroke="#64748b" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                          <Line type="monotone" dataKey="strokeRisk" stroke="#00e5ff" strokeWidth={2.5} name="Stroke Risk %" />
                          <Line type="monotone" dataKey="epilepsyRisk" stroke="#ec4899" strokeWidth={2.5} name="Epilepsy Risk %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )
            ) : (
              // AI Models & Benchmarks view (Deep learning output visualizer)
              <div className="flex flex-col gap-8">
                
                {/* Accuracy comparison table between Kaggle and hospital dataset */}
                {accuracyData && (
                  <div className="p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">
                      Dataset Benchmarking Comparison (RSNA Kaggle vs. Hospital Scans)
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder">
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase">Kaggle Training Cohort</span>
                        <div className="text-2xl font-extrabold text-white mt-1">{accuracyData.kaggle.avg_accuracy}%</div>
                        <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block mt-1">Accuracy / {accuracyData.kaggle.avg_precision}% Precision</span>
                      </div>
                      <div className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder">
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase">Clinical Real-Time Scans</span>
                        <div className="text-2xl font-extrabold text-white mt-1">{accuracyData.realtime.avg_accuracy}%</div>
                        <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block mt-1">Accuracy / {accuracyData.realtime.avg_precision}% Precision</span>
                      </div>
                      <div className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder">
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase">Performance Difference</span>
                        <div className={`text-2xl font-extrabold mt-1 ${accuracyData.comparison.accuracy_difference >= 0 ? 'text-accentGreen' : 'text-accentRed'}`}>
                          {accuracyData.comparison.accuracy_difference >= 0 ? '+' : ''}{accuracyData.comparison.accuracy_difference}%
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Generalization delta</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid for generated PNG charts */}
                <div className="grid lg:grid-cols-12 gap-8">
                  
                  {/* Confusion Matrix Panel */}
                  <div className="lg:col-span-12 p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 flex justify-between items-center">
                      <span>Neural Classifier Confusion Matrices (EfficientNet, ResNet, DenseNet, ConvNeXt, ViT)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-extrabold">GENERATED BY PYTORCH</span>
                    </h3>
                    <div className="bg-slate-950 p-2 rounded-xl border border-panelBorder flex justify-center items-center overflow-hidden">
                      <img 
                        src="/uploads/training_results/confusion_matrices.png" 
                        alt="Neural Networks Confusion Matrices" 
                        className="max-w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/1200x300/0f172a/ffffff?text=Generating+Confusion+Matrices...";
                        }}
                      />
                    </div>
                  </div>

                  {/* ROC Curves */}
                  <div className="lg:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 flex justify-between items-center">
                      <span>Receiver Operating Curves (ROC)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-extrabold">AUC STATS</span>
                    </h3>
                    <div className="bg-slate-950 p-2 rounded-xl border border-panelBorder flex justify-center items-center overflow-hidden h-[340px]">
                      <img 
                        src="/uploads/training_results/roc_comparison.png" 
                        alt="ROC Comparison Curve" 
                        className="max-h-full max-w-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/500x300/0f172a/ffffff?text=Generating+ROC+Curves...";
                        }}
                      />
                    </div>
                  </div>

                  {/* Loss and Accuracy Training Curves */}
                  <div className="lg:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 flex justify-between items-center">
                      <span>Neural Classifier Training Curves</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-accentGreen text-[8px] font-extrabold">EPOCH PROGRESSION</span>
                    </h3>
                    <div className="bg-slate-950 p-2 rounded-xl border border-panelBorder flex justify-center items-center overflow-hidden h-[340px]">
                      <img 
                        src="/uploads/training_results/training_curves.png" 
                        alt="Loss & Accuracy curves" 
                        className="max-h-full max-w-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/500x300/0f172a/ffffff?text=Generating+Training+Curves...";
                        }}
                      />
                    </div>
                  </div>

                </div>

                {/* Model architecture performance statistics cards */}
                {modelStats && (
                  <div className="p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">
                      Model Backbone Architectures Parameter Comparison
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {Object.entries(modelStats.models || {}).map(([name, val]) => (
                        <div key={name} className="p-4 rounded-xl bg-darkBg/60 border border-panelBorder flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold text-white uppercase block">{name}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Backbone Classifier</span>
                          </div>
                          <div className="mt-4 space-y-1">
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-400">ACCURACY:</span>
                              <span className="text-white">{Math.round(val.accuracy * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-400">PRECISION:</span>
                              <span className="text-white">{Math.round(val.precision * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-400">RECALL:</span>
                              <span className="text-white">{Math.round(val.recall * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-400">F1 SCORE:</span>
                              <span className="text-white">{Math.round(val.f1 * 100)}%</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-400">ROC-AUC:</span>
                              <span className="text-cyan-400">{val.auc.toFixed(3)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Disclaimer */}
            <MedicalDisclaimer />

          </div>
        )}
      </main>
    </div>
  );
};

export default GraphAnalytics;
