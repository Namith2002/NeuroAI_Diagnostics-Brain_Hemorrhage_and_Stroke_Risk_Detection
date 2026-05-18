import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import axios from 'axios';
import { 
  MdPeople, MdPhotoSizeSelectActual, MdHealing, MdShield, MdDelete, 
  MdSupervisedUserCircle, MdFileDownload
} from 'react-icons/md';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scans'); // 'scans' or 'users'

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, reportsRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/reports'),
        axios.get('/api/admin/statistics')
      ]);

      setUsers(usersRes.data);
      setReports(reportsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load administrative records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this patient scan and diagnostic report? This will delete all local images on disk and SQLite logs.")) {
      return;
    }
    try {
      await axios.delete(`/api/reports/${id}`);
      
      // Update UI state locally
      setReports(reports.filter(r => r.id !== id));
      
      // Re-trigger stats fetch to update widget figures
      const statsRes = await axios.get('/api/admin/statistics');
      setStats(statsRes.data);
    } catch (err) {
      alert("Failed to delete patient scan.");
    }
  };

  // Helper to map patient details onto reports
  const getPatientDetails = (userId) => {
    const found = users.find(u => u.id === userId);
    return found ? { name: found.name, email: found.email } : { name: "Unknown", email: "N/A" };
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Workspace */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="text-left mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">Admin Dashboard</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              SYSTEM CONSOLE & Cohort MONITORING
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-accentRed/10 border border-accentRed/30 text-accentRed text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
            <MdShield size={14} className="animate-pulse" />
            ADMINISTRATOR PRIVILEGES ARMED
          </span>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-accentBlue">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs tracking-widest font-extrabold uppercase animate-pulse">Synchronizing admin core...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Aggregate Stats Widgets */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                
                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none flex items-center gap-1.5">
                    <MdPeople size={16} className="text-cyan-400" />
                    Registered Clinicians
                  </span>
                  <span className="text-3xl font-extrabold text-white mt-1 leading-none">{stats.total_users}</span>
                  <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider leading-none mt-1.5">Authorized accounts</span>
                </div>

                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none flex items-center gap-1.5">
                    <MdPhotoSizeSelectActual size={16} className="text-indigo-400" />
                    Total Patient Scans
                  </span>
                  <span className="text-3xl font-extrabold text-white mt-1 leading-none">{stats.total_scans}</span>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider leading-none mt-1.5">CPU analyses performed</span>
                </div>

                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5 border-l-4 border-l-red-500">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none flex items-center gap-1.5">
                    <MdHealing size={16} className="text-accentRed" />
                    Hemorrhages Diagnosed
                  </span>
                  <span className="text-3xl font-extrabold text-accentRed mt-1 leading-none">{stats.hemorrhage_count}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-1.5">Positive bleed rate: {stats.total_scans > 0 ? Math.round((stats.hemorrhage_count / stats.total_scans) * 100) : 0}%</span>
                </div>

                <div className="p-5 rounded-2xl glass-panel border-panelBorder flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Mean precision score</span>
                  <span className="text-3xl font-extrabold text-white mt-1 leading-none">{stats.average_confidence}%</span>
                  <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider leading-none mt-1.5">Inference confidence index</span>
                </div>

              </div>
            )}

            {/* Toggle Tabs */}
            <div className="border-b border-panelBorder/40 flex items-center gap-6">
              <button
                onClick={() => setActiveTab('scans')}
                className={`pb-3 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 border-b-2 ${
                  activeTab === 'scans' ? 'border-cyan-500 text-accentBlue text-glow-cyan' : 'border-transparent text-slate-500 hover:text-white'
                }`}
              >
                Diagnostic Ledgers ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-3 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 border-b-2 ${
                  activeTab === 'users' ? 'border-cyan-500 text-accentBlue text-glow-cyan' : 'border-transparent text-slate-500 hover:text-white'
                }`}
              >
                Registered Clinicians ({users.length})
              </button>
            </div>

            {/* Tab: Diagnostic Ledgers */}
            {activeTab === 'scans' && (
              <div className="p-5 rounded-3xl glass-panel border-panelBorder text-left overflow-hidden">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Master Diagnostic Register</h3>
                
                {reports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-400 leading-normal border-collapse">
                      <thead>
                        <tr className="border-b border-panelBorder/60 text-slate-500 uppercase tracking-widest text-[9px]">
                          <th className="py-3 px-4 font-extrabold text-left">Case ID</th>
                          <th className="py-3 px-4 font-extrabold text-left">Patient Details</th>
                          <th className="py-3 px-4 font-extrabold text-left">Timestamp</th>
                          <th className="py-3 px-4 font-extrabold text-left">AI Diagnosis</th>
                          <th className="py-3 px-4 font-extrabold text-center">Stroke Risk</th>
                          <th className="py-3 px-4 font-extrabold text-center">Severity</th>
                          <th className="py-3 px-4 font-extrabold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((r) => {
                          const patient = getPatientDetails(r.user_id);
                          const isBleed = r.prediction === 'Hemorrhage Detected';
                          return (
                            <tr key={r.id} className="border-b border-panelBorder/30 hover:bg-white/5 transition-colors duration-300">
                              <td className="py-3.5 px-4 font-extrabold text-white">#BHD-{r.id.toString().padStart(5, '0')}</td>
                              <td className="py-3.5 px-4 text-left">
                                <div className="font-extrabold text-slate-300 leading-tight">{patient.name}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 leading-none">{patient.email}</div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">
                                {new Date(r.created_at).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                  isBleed ? 'bg-red-500/10 text-accentRed border border-red-500/20' : 'bg-emerald-500/10 text-accentGreen border border-emerald-500/20'
                                }`}>
                                  {r.prediction}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-extrabold text-white">
                                <span className={r.risk_level === 'High' ? 'text-accentRed' : r.risk_level === 'Moderate' ? 'text-amber-400' : 'text-accentGreen'}>
                                  {r.stroke_risk}% ({r.risk_level})
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-extrabold text-slate-300">
                                {isBleed ? `${r.hemorrhage_percentage}%` : '0.00%'}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => handleDeleteReport(r.id)}
                                  className="p-2 rounded-xl bg-panelBg border border-panelBorder hover:border-accentRed/30 hover:bg-accentRed/5 text-slate-500 hover:text-accentRed transition-all duration-300"
                                  title="Delete patient scan report"
                                >
                                  <MdDelete size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 font-bold uppercase tracking-wider">
                    Diagnostic Register Empty. No brain scans run in system.
                  </div>
                )}
              </div>
            )}

            {/* Tab: Registered Clinicians */}
            {activeTab === 'users' && (
              <div className="p-5 rounded-3xl glass-panel border-panelBorder text-left overflow-hidden">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Registered Clinical Accounts</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-400 leading-normal border-collapse">
                    <thead>
                      <tr className="border-b border-panelBorder/60 text-slate-500 uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-4 font-extrabold text-left">User ID</th>
                        <th className="py-3 px-4 font-extrabold text-left">Clinician Name</th>
                        <th className="py-3 px-4 font-extrabold text-left">Email Address</th>
                        <th className="py-3 px-4 font-extrabold text-left">Access Role</th>
                        <th className="py-3 px-4 font-extrabold text-left">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-panelBorder/30 hover:bg-white/5 transition-colors duration-300">
                          <td className="py-3.5 px-4 font-extrabold text-white">#{u.id.toString().padStart(4, '0')}</td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-300">{u.name}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              u.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-semibold">
                            {new Date(u.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default AdminDashboard;
