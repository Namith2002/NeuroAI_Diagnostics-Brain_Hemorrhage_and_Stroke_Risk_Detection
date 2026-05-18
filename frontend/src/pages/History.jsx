import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import ReportCard from '../components/ReportCard';
import axios from 'axios';
import { MdSearch, MdHistory, MdLocalHospital } from 'react-icons/md';

const History = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/reports/my-history');
      setReports(res.data);
      setFilteredReports(res.data);
    } catch (err) {
      console.error("Failed to load user scan history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run filtering on search query or sort order changes
  useEffect(() => {
    let result = [...reports];

    // Filter by query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.prediction.toLowerCase().includes(q) ||
        r.risk_level.toLowerCase().includes(q) ||
        r.stroke_risk.toString().includes(q)
      );
    }

    // Sort order
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredReports(result);
  }, [searchQuery, sortOrder, reports]);

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this diagnostic scan report? This action is irreversible.")) {
      return;
    }
    try {
      await axios.delete(`/api/reports/${id}`);
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 flex">
      <Sidebar />

      {/* Main Workspace */}
      <main className="grow p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">Scan History Ledger</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            COMPLETE ARCHIVE OF ALL AUTOMATED SCAN DIAGNOSES
          </p>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-accentBlue">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs tracking-widest font-extrabold uppercase animate-pulse">Retrieving scan ledgers...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Filter controls panel */}
            <div className="p-4 rounded-2xl glass-panel border-panelBorder flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MdSearch size={18} />
                </span>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by diagnosis or risk level..."
                  className="w-full bg-slate-950 border border-panelBorder focus:border-cyan-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>

              {/* Sorting triggers */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-slate-950 border border-panelBorder focus:border-cyan-500 text-slate-300 rounded-xl py-2 px-4 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="newest">Newest Scans First</option>
                  <option value="oldest">Oldest Scans First</option>
                </select>
              </div>

            </div>

            {/* Reports list grid */}
            {filteredReports.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {filteredReports.map((r) => (
                  <ReportCard key={r.id} report={r} onDelete={handleDeleteReport} />
                ))}
              </div>
            ) : (
              // Empty search result warnings
              <div className="py-20 rounded-3xl glass-panel border-panelBorder flex flex-col items-center justify-center gap-3 text-slate-500 text-left max-w-lg mx-auto">
                <MdHistory size={36} className="text-slate-600 animate-pulse" />
                <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">No matching logs</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed text-center px-6">
                  {reports.length === 0 
                    ? "Your scan archive is completely empty. Head to the 'Upload Scan' control center to run an analysis."
                    : "No scan reports match your current search queries. Verify spellings or search keywords."}
                </p>
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

export default History;
