import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { MdTrendingUp, MdBarChart, MdTimeline, MdPieChart } from 'react-icons/md';

const Analytics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    hemorrhage: 0,
    normal: 0,
    high: 0,
    mod: 0,
    low: 0,
    avgRisk: 0,
    avgSeverity: 0
  });

  useEffect(() => {
    fetchReports();
    setMounted(true);
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports/my-history');
      setReports(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error("Failed to load history for charts:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const hemorrhage = data.filter(r => r.prediction === 'Hemorrhage Detected').length;
    const normal = total - hemorrhage;
    const high = data.filter(r => r.risk_level === 'High').length;
    const mod = data.filter(r => r.risk_level === 'Moderate').length;
    const low = data.filter(r => r.risk_level === 'Low').length;

    let sumRisk = 0;
    let sumSeverity = 0;
    let bleedCount = 0;

    data.forEach(r => {
      sumRisk += r.stroke_risk;
      if (r.hemorrhage_percentage > 0) {
        sumSeverity += r.hemorrhage_percentage;
        bleedCount++;
      }
    });

    const avgRisk = total > 0 ? Math.round(sumRisk / total) : 0;
    const avgSeverity = bleedCount > 0 ? Math.round((sumSeverity / bleedCount) * 10) / 10 : 0.0;

    setStats({ total, hemorrhage, normal, high, mod, low, avgRisk, avgSeverity });
  };

  // Compile data structures for charts
  const chronData = [...reports].reverse().map((r, idx) => ({
    name: `Scan ${idx + 1}`,
    risk: r.stroke_risk,
    confidence: r.confidence,
    severity: r.prediction === 'Hemorrhage Detected' ? r.hemorrhage_percentage : 0
  }));

  const riskPieData = [
    { name: 'High Stroke Risk', value: stats.high || 0, color: '#ff1744' },
    { name: 'Moderate Stroke Risk', value: stats.mod || 0, color: '#fbbf24' },
    { name: 'Low Stroke Risk', value: stats.low || 0, color: '#00e676' }
  ].filter(c => c.value > 0);

  const defaultPieData = [{ name: 'No Data', value: 1, color: '#1a2642' }];

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Workspace */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">Analytics Suite</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            ADVANCED STATISTICAL PATTERNS & RISK DISTRIBUTION ANALYSIS
          </p>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-accentBlue">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs tracking-widest font-extrabold uppercase animate-pulse">Computing system stats...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Quick Summary widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Diagnostic Modalities</span>
                <span className="text-3xl font-extrabold text-white leading-none mt-1">{stats.total}</span>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider leading-none mt-2">Aggregate patient records</span>
              </div>
              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Mean Stroke Risk</span>
                <span className="text-3xl font-extrabold text-white leading-none mt-1">{stats.avgRisk}%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-2">Overall cohort probability</span>
              </div>
              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Mean Bleed Severity</span>
                <span className="text-3xl font-extrabold text-white leading-none mt-1">{stats.avgSeverity}%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-2">Hyperdensity cluster ratio</span>
              </div>
              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Hemorrhage Ratio</span>
                <span className="text-3xl font-extrabold text-accentRed leading-none mt-1">
                  {stats.total > 0 ? Math.round((stats.hemorrhage / stats.total) * 100) : 0}%
                </span>
                <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider leading-none mt-2">Positive classification rate</span>
              </div>
            </div>

            {reports.length === 0 ? (
              // Empty warning if no data
              <div className="py-24 rounded-3xl glass-panel border-panelBorder flex flex-col items-center justify-center gap-4 text-slate-500 text-left max-w-xl mx-auto">
                <MdBarChart size={48} className="text-slate-600 animate-bounce" />
                <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">No Analytics Data Found</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed text-center px-6">
                  Before plotting graphical trends, please upload brain CT/MRI scans in the "Upload Scan" control center to register diagnostic parameters in the database.
                </p>
              </div>
            ) : (
              // Interactive chart panels
              <div className="flex flex-col gap-8">
                
                {/* Row 1: Line Chart & Pie Chart */}
                <div className="grid lg:grid-cols-12 gap-6">
                  
                  {/* Line Chart: Stroke Risk over time */}
                  <div className="lg:col-span-8 p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                      <MdTimeline size={18} className="text-cyan-400 animate-pulse" />
                      Stroke Risk Progression Trend
                    </h3>
                    <div className="h-64 w-full">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <LineChart data={chronData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                            <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                            <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                            <Line type="monotone" dataKey="risk" stroke="#00e5ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Stroke Risk %" />
                            <Line type="monotone" dataKey="severity" stroke="#ff1744" strokeWidth={1.5} name="Bleed Severity %" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Pie Chart: Risk Breakdown */}
                  <div className="lg:col-span-4 p-5 rounded-2xl glass-panel border-panelBorder text-left flex flex-col justify-between">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MdPieChart size={18} className="text-indigo-400" />
                      Patient Risk Category Ratios
                    </h3>
                    <div className="h-44 w-full relative flex items-center justify-center">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <PieChart>
                            <Pie
                              data={riskPieData.length > 0 ? riskPieData : defaultPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {(riskPieData.length > 0 ? riskPieData : defaultPieData).map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      <div className="absolute flex flex-col items-center leading-none">
                        <span className="text-2xl font-black text-white">{stats.total}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">RECORDS</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      {riskPieData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-white">{item.value} Scans</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Row 2: Area Confidence & Severity Bar Charts */}
                <div className="grid lg:grid-cols-12 gap-6">
                  
                  {/* Area: confidence ratio vs risk */}
                  <div className="lg:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      AI Model Precision Map
                    </h3>
                    <div className="h-60 w-full">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <AreaChart data={chronData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontWeight="bold" />
                            <YAxis stroke="#64748b" fontSize={9} fontWeight="bold" />
                            <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                            <Area type="monotone" dataKey="confidence" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConfidence)" name="Inference Confidence %" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Bar: Bleed severity metrics */}
                  <div className="lg:col-span-6 p-5 rounded-2xl glass-panel border-panelBorder text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">
                      Hemorrhage Severity Distribution
                    </h3>
                    <div className="h-60 w-full">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <BarChart data={chronData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontWeight="bold" />
                            <YAxis stroke="#64748b" fontSize={9} fontWeight="bold" />
                            <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                            <Bar dataKey="severity" fill="#ff1744" radius={[6, 6, 0, 0]} name="Severity %">
                              {chronData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.severity > 0 ? '#ff1744' : '#1e2c4a'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                </div>

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

export default Analytics;
