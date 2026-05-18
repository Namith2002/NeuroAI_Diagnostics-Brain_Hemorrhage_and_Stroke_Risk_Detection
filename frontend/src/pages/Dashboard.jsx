import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import ReportCard from '../components/ReportCard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { MdTrendingUp, MdCloudUpload, MdHistory, MdLocalHospital } from 'react-icons/md';

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    hemorrhage: 0,
    normal: 0,
    highRisk: 0,
    avgConfidence: 0
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fetch reports on component mount
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
      console.error('Failed to retrieve user history:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const hemorrhage = data.filter(r => r.prediction === 'Hemorrhage Detected').length;
    const normal = total - hemorrhage;
    const highRisk = data.filter(r => r.risk_level === 'High').length;
    const modRisk = data.filter(r => r.risk_level === 'Moderate').length;
    const lowRisk = data.filter(r => r.risk_level === 'Low').length;
    
    let sumConf = 0;
    data.forEach(r => sumConf += r.confidence);
    const avgConfidence = total > 0 ? Math.round(sumConf / total) : 0;

    setStats({ total, hemorrhage, normal, highRisk, modRisk, lowRisk, avgConfidence });
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this diagnostic scan report? This action is irreversible.")) {
      return;
    }
    try {
      await axios.delete(`/api/reports/${id}`);
      const updated = reports.filter(r => r.id !== id);
      setReports(updated);
      calculateStats(updated);
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  // Compile data formats for Recharts area trends
  const areaChartData = [...reports]
    .reverse()
    .slice(-7) // take last 7 scans
    .map((r, i) => ({
      name: `Scan ${i + 1}`,
      risk: r.stroke_risk,
      confidence: r.confidence
    }));

  // Compile data formats for Recharts risk pie
  const pieChartData = [
    { name: 'High Risk', value: stats.highRisk || 0, color: '#ff1744' },
    { name: 'Mod Risk', value: stats.modRisk || 0, color: '#fbbf24' },
    { name: 'Low Risk', value: stats.lowRisk || 0, color: '#00e676' },
  ].filter(c => c.value > 0);

  // Default pie if no data exists
  const defaultPieData = [{ name: 'No Data', value: 1, color: '#1e2c4a' }];

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Workspace */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">Workspace Dashboard</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              WELCOME BACK, {user?.name?.toUpperCase()} &bull; CLINICAL ACCOUNT
            </p>
          </div>
          <Link 
            to="/upload-scan"
            className="px-5 py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center gap-2 shadow-lg"
          >
            <MdCloudUpload size={18} />
            Analyze New Scan
          </Link>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-accentBlue">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs tracking-widest font-extrabold uppercase animate-pulse">Loading Workspace Core...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Stats grid widget */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5 text-left">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Total Scans Run</span>
                <span className="text-3xl font-extrabold text-white mt-1 leading-none">{stats.total}</span>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Clinical registry active</span>
              </div>

              <div className="p-5 rounded-2xl glass-panel border-panelBorder border-l-4 border-l-red-500 flex flex-col gap-1.5 text-left">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Hemorrhages Detected</span>
                <span className="text-3xl font-extrabold text-accentRed mt-1 leading-none">{stats.hemorrhage}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Requires diagnostic audit</span>
              </div>

              <div className="p-5 rounded-2xl glass-panel border-panelBorder border-l-4 border-l-emerald-500 flex flex-col gap-1.5 text-left">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Safe/Normal Scans</span>
                <span className="text-3xl font-extrabold text-accentGreen mt-1 leading-none">{stats.normal}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 leading-none">No bleed detected</span>
              </div>

              <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5 text-left">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Average Confidence</span>
                <span className="text-3xl font-extrabold text-white mt-1 leading-none">{stats.avgConfidence}%</span>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-1.5 leading-none">Deep learning factor</span>
              </div>

            </div>

            {/* Graphics Charts Grid */}
            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* Area Chart: Stroke Risk Trends */}
              <div className="lg:col-span-8 p-5 rounded-2xl glass-panel border-panelBorder text-left">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-6">Patient Stroke Risk History & Confidence</h3>
                <div className="h-64 w-full">
                  {reports.length > 0 && mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#131b2e" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="semibold" />
                        <YAxis stroke="#64748b" fontSize={10} fontWeight="semibold" />
                        <Tooltip contentStyle={{ backgroundColor: '#131b2e', borderColor: '#222f4d', borderRadius: '10px' }} />
                        <Area type="monotone" dataKey="risk" stroke="#00e5ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" name="Stroke Risk %" />
                        <Area type="monotone" dataKey="confidence" stroke="#818cf8" strokeWidth={1} fillOpacity={1} fill="url(#colorConf)" name="Model Confidence %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      Execute scan diagnoses to plot history trends
                    </div>
                  )}
                </div>
              </div>

              {/* Pie Chart: Risk Ratios */}
              <div className="lg:col-span-4 p-5 rounded-2xl glass-panel border-panelBorder text-left flex flex-col justify-between">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Risk Level Ratios</h3>
                
                <div className="h-44 w-full relative flex items-center justify-center">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={pieChartData.length > 0 ? pieChartData : defaultPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {(pieChartData.length > 0 ? pieChartData : defaultPieData).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {/* Centered value details */}
                  <div className="absolute flex flex-col items-center leading-none">
                    <span className="text-2xl font-black text-white">{stats.total}</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">TOTAL SCANS</span>
                  </div>
                </div>

                {/* Pie legend details */}
                <div className="flex flex-col gap-1.5 mt-2">
                  {pieChartData.length > 0 ? (
                    pieChartData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span>{item.name}</span>
                        </div>
                        <span className="text-white">{item.value} Scans ({Math.round((item.value / stats.total) * 100)}%)</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-2">
                      Registry clear - No ratios
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Recent Uploads Section */}
            <div className="text-left flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Recent Activity Ledger</h3>
                <Link to="/history" className="text-[10px] text-accentBlue font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <MdHistory size={14} />
                  See Full Ledger
                </Link>
              </div>

              {reports.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.slice(0, 3).map((r) => (
                    <ReportCard key={r.id} report={r} onDelete={handleDeleteReport} />
                  ))}
                </div>
              ) : (
                <div className="py-12 rounded-2xl glass-panel border-panelBorder flex flex-col items-center justify-center gap-3 text-slate-500">
                  <MdLocalHospital size={36} className="text-slate-600 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider">No brain scans uploaded in your active profile.</p>
                  <Link to="/upload-scan" className="text-xs text-accentBlue font-bold uppercase tracking-wider hover:underline mt-1">
                    Upload your first brain scan
                  </Link>
                </div>
              )}
            </div>

            {/* Regulatory Notice */}
            <MedicalDisclaimer />

          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
