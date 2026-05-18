import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MdPerson, MdEmail, MdSecurity, MdFileDownload } from 'react-icons/md';

const Profile = () => {
  const { user } = useAuth();
  const [scansCount, setScansCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchScansCount();
  }, []);

  const fetchScansCount = async () => {
    try {
      const res = await axios.get('/api/reports/my-history');
      setScansCount(res.data.length);
    } catch (err) {
      console.error("Failed to load profile scans history:", err);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await axios.get('/api/reports/export', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `neuroai_export_patient_${user.id}.json`;
      link.click();
    } catch (err) {
      alert("Failed to export your diagnostic files.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Workspace */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">Profile Account</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            MANAGE YOUR CLINICAL IDENTITY & RECORD EXPORTS
          </p>
        </div>

        <div className="max-w-xl flex flex-col gap-6 text-left">
          
          {/* User Profile Card */}
          <div className="p-6 rounded-3xl glass-panel-glow border border-panelBorder flex flex-col gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-800/40 flex items-center justify-center font-bold text-cyan-400 text-2xl shadow-md shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white leading-tight">{user?.name}</h2>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1.5 block">
                  {user?.role} Access Profile
                </span>
              </div>
            </div>

            {/* Grid of Credentials */}
            <div className="flex flex-col gap-3.5 border-t border-panelBorder/40 pt-6">
              
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-wide">
                  <MdPerson size={18} className="text-slate-500" />
                  <span>Full Identity Name</span>
                </div>
                <span className="font-extrabold text-white">{user?.name}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-panelBorder/20 pt-3">
                <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-wide">
                  <MdEmail size={18} className="text-slate-500" />
                  <span>Email Coordinates</span>
                </div>
                <span className="font-semibold text-slate-300">{user?.email}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-panelBorder/20 pt-3">
                <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-wide">
                  <MdSecurity size={18} className="text-slate-500" />
                  <span>Security Role Status</span>
                </div>
                <span className="font-extrabold text-cyan-400 uppercase tracking-wider">{user?.role}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-panelBorder/20 pt-3">
                <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-wide">
                  <MdFileDownload size={18} className="text-slate-500" />
                  <span>Cohort Contributions</span>
                </div>
                <span className="font-extrabold text-white">{scansCount} Scans uploaded</span>
              </div>

            </div>

          </div>

          {/* Records export card */}
          <div className="p-6 rounded-2xl glass-panel border-panelBorder flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">Clinical Data Backup & Portability</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-semibold">
                Download a fully structured, standard JSON database containing all your uploaded brain scans, classification confidences, severity scores, stroke risk percentages, and analysis timestamps.
              </p>
            </div>
            
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="px-5 py-3.5 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center justify-center gap-2 self-start shadow-md disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-5 h-5 border-2 border-darkBg border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <MdFileDownload size={16} />
                  Export All Scan Records
                </>
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <MedicalDisclaimer />

        </div>
      </main>
    </div>
  );
};

export default Profile;
