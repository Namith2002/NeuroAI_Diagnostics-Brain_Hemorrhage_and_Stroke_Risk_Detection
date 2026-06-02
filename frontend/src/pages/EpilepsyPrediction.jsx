import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MdHealing, MdInfo, MdFlashOn, MdArrowForward, MdSafetyDivider, MdRefresh } from 'react-icons/md';

const EpilepsyPrediction = () => {
  const [formData, setFormData] = useState({
    hemorrhage_type: 'Subarachnoid Hemorrhage',
    cortical_involvement: true,
    hemorrhage_volume: 35.0,
    midline_shift: 4.5,
    age: 45
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' || name === 'hemorrhage_volume' || name === 'midline_shift' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/reports/predict-epilepsy', {
        hemorrhage_type: formData.hemorrhage_type,
        cortical_involvement: formData.cortical_involvement,
        hemorrhage_volume: parseFloat(formData.hemorrhage_volume),
        midline_shift: parseFloat(formData.midline_shift),
        age: parseInt(formData.age)
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to compute prediction. Make sure you are authenticated.');
    } finally {
      setLoading(false);
    }
  };

  const getContributionData = () => {
    if (!formData) return [];
    
    let earlyBase = 0;
    let lateBase = 0;
    if (formData.hemorrhage_type !== 'None') {
      if (['Subarachnoid Hemorrhage', 'Intracerebral Hemorrhage', 'Multiple'].includes(formData.hemorrhage_type)) {
        earlyBase = 15;
        lateBase = 20;
      } else if (formData.hemorrhage_type === 'Subdural Hematoma') {
        earlyBase = 10;
        lateBase = 12;
      } else {
        earlyBase = 5;
        lateBase = 4;
      }
    }
    const baseContribution = Math.round(((earlyBase + lateBase) / 2) * 10) / 10;
    const corticalContribution = formData.cortical_involvement ? 22.5 : 0;
    const volumeContribution = Math.round(((formData.hemorrhage_volume * 0.4 + formData.hemorrhage_volume * 0.5) / 2) * 10) / 10;
    const shiftContribution = Math.round(((formData.midline_shift * 1.5 + formData.midline_shift * 2.0) / 2) * 10) / 10;
    
    let ageContribution = 0;
    if (parseInt(formData.age) > 65) ageContribution = 7.5;
    else if (parseInt(formData.age) < 18) ageContribution = 5.0;

    return [
      { name: 'Base Type', value: baseContribution, color: '#f87171' },
      { name: 'Cortical', value: corticalContribution, color: '#ec4899' },
      { name: 'Volume', value: volumeContribution, color: '#a78bfa' },
      { name: 'Midline Shift', value: shiftContribution, color: '#38bdf8' },
      { name: 'Age Factor', value: ageContribution, color: '#fbbf24' }
    ].filter(item => item.value > 0);
  };

  const chartData = getContributionData();

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Workspace */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">
            Epilepsy Risk Calculator
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            ADVANCED AI PREDICTION OF ACUTE SEIZURES AND CHRONIC POST-HEMORRHAGIC EPILEPSY (PHE)
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Panel */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-panelBg/40 border border-panelBorder flex flex-col gap-6 text-left">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <MdHealing className="text-cyan-400" />
                Clinical Parameters Input
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Specify patient physiological metrics and scan variables
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Hemorrhage Type Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Hemorrhage Type
                </label>
                <select
                  name="hemorrhage_type"
                  value={formData.hemorrhage_type}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-panelBorder rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="Epidural Hematoma">Epidural Hematoma</option>
                  <option value="Subdural Hematoma">Subdural Hematoma</option>
                  <option value="Subarachnoid Hemorrhage">Subarachnoid Hemorrhage</option>
                  <option value="Intracerebral Hemorrhage">Intracerebral Hemorrhage</option>
                  <option value="Multiple">Multiple Hemorrhages</option>
                  <option value="None">None (No Active Bleed)</option>
                </select>
              </div>

              {/* Cortical Involvement Checkbox */}
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="cortical_involvement"
                    checked={formData.cortical_involvement}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded-md border-panelBorder bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                      Cortical Involvement
                    </span>
                    <span className="text-[9px] text-slate-500 block">Check if bleed touches or invades the cerebral cortex</span>
                  </div>
                </label>
              </div>

              {/* Hemorrhage Volume Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Hemorrhage Volume (mL)</span>
                  <span className="text-rose-400 font-extrabold">{formData.hemorrhage_volume} mL</span>
                </div>
                <input
                  type="range"
                  name="hemorrhage_volume"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.hemorrhage_volume}
                  onChange={handleInputChange}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Midline Shift Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Midline Shift (mm)</span>
                  <span className="text-cyan-400 font-extrabold">{formData.midline_shift} mm</span>
                </div>
                <input
                  type="range"
                  name="midline_shift"
                  min="0"
                  max="30"
                  step="0.5"
                  value={formData.midline_shift}
                  onChange={handleInputChange}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Patient Age */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Patient Age (Years)
                </label>
                <input
                  type="number"
                  name="age"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g. 45"
                  required
                  className="w-full bg-slate-900 border border-panelBorder rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mt-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Predict Epilepsy Risk
                    <MdArrowForward size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Visualizer Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {result ? (
              <div className="flex flex-col gap-6">
                
                {/* Score Widget */}
                <div className="p-6 rounded-3xl bg-panelBg/40 border border-panelBorder flex flex-col md:flex-row gap-8 items-center">
                  
                  {/* Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="transition-all duration-1000 ease-out"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - result.epilepsy_probability / 100)}
                        stroke={
                          result.epilepsy_probability >= 50 ? '#ef4444' : 
                          result.epilepsy_probability >= 20 ? '#f97316' : '#10b981'
                        }
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center leading-none">
                      <span className="text-3xl font-black text-white">{result.epilepsy_probability}%</span>
                      <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">PROBABILITY</span>
                    </div>
                  </div>

                  {/* Summary Status */}
                  <div className="grow">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">
                        Diagnostic Assessment
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest leading-none border ${
                        result.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30 text-rose-400' :
                        result.risk_level === 'Moderate' ? 'bg-amber-500/10 border-amber-500/30 text-orange-400' :
                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {result.risk_level} Risk Level
                      </span>
                      {result.seizure_prophylaxis_recommended && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest leading-none bg-pink-500/10 border border-pink-500/30 text-pink-400">
                          Prophylaxis Indicated
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-black text-white leading-tight mb-2">
                      Clinical Seizure Propensity Report
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed pl-3 border-l border-panelBorder/70">
                      {result.clinical_explanation}
                    </p>
                  </div>
                </div>

                {/* Separate Early vs Late Risk badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-panelBorder/50 flex flex-col">
                    <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Early Seizure Risk (7 Days)</span>
                    <span className="text-xl font-black text-white mt-1">{result.early_seizure_risk}%</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-panelBorder/50 flex flex-col">
                    <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Late Epilepsy Risk (Long-term)</span>
                    <span className="text-xl font-black text-white mt-1">{result.late_epilepsy_risk}%</span>
                  </div>
                </div>

                {/* Contribution details and Recommendations Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Contribution breakdown Chart */}
                  <div className="p-5 rounded-3xl bg-panelBg/40 border border-panelBorder">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MdFlashOn className="text-amber-400 animate-pulse" />
                      Risk Driver Breakdown
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e2c4a/20" horizontal={false} />
                          <XAxis type="number" stroke="#475569" fontSize={8} fontWeight="bold" />
                          <YAxis dataKey="name" type="category" stroke="#475569" fontSize={8} fontWeight="bold" width={90} />
                          <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-5 rounded-3xl bg-panelBg/40 border border-panelBorder flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-3.5 flex items-center gap-2">
                        <MdSafetyDivider className="text-cyan-400" />
                        Clinical Recommendations
                      </h4>
                      <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {result.recommendations.map((rec, i) => (
                          <p key={i} className="text-slate-400 text-xs font-semibold leading-relaxed">
                            {rec}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="py-24 rounded-3xl bg-panelBg/30 border border-panelBorder border-dashed flex flex-col items-center justify-center gap-3 text-slate-500">
                <MdInfo size={36} className="text-slate-600 animate-pulse" />
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Awaiting Calculator Parameters</h4>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-sm text-center px-4">
                  Select hemorrhage type, cortical involvement status, volume indices, midline shift, and age to compute post-traumatic epileptogenicity indexes.
                </p>
              </div>
            )}
            
          </div>

        </div>

        {/* Disclaimer */}
        <div className="mt-8">
          <MedicalDisclaimer />
        </div>

      </main>
    </div>
  );
};

export default EpilepsyPrediction;
