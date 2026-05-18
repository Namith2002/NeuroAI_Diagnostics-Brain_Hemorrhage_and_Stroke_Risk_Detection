import React from 'react';
import { Link } from 'react-router-dom';
import { MdDownload, MdDelete, MdVisibility } from 'react-icons/md';
import { API_URL } from '../context/AuthContext';
import axios from 'axios';

const ReportCard = ({ report, onDelete }) => {
  const isHemorrhage = report.prediction === 'Hemorrhage Detected';

  // Streams down PDF document dynamically
  const downloadPDF = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`/api/reports/download/${report.id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `neuroai_report_${report.id}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to generate/stream PDF report. Please contact system support.');
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 shadow-lg ${
      isHemorrhage 
        ? 'glass-panel border-red-500/25 bg-red-950/5 hover:border-red-500/35' 
        : 'glass-panel border-panelBorder hover:border-cyan-500/30'
    }`}>
      
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
          isHemorrhage 
            ? 'bg-red-500/10 text-accentRed border border-red-500/20' 
            : 'bg-emerald-500/10 text-accentGreen border border-emerald-500/20'
        }`}>
          {report.prediction}
        </span>
        <span className="text-[9px] text-slate-500 font-extrabold tracking-wider">
          {new Date(report.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>

      {/* Info Core */}
      <div className="flex gap-4 items-center mb-5">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-panelBorder shrink-0">
          <img 
            src={`${API_URL}/${report.image_path}`} 
            alt="Scan Thumbnail" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">Confidence</span>
              <span className="text-sm font-bold text-white tracking-wide">{report.confidence}%</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">Severity</span>
              <span className="text-sm font-bold text-white tracking-wide">
                {isHemorrhage ? `${report.hemorrhage_percentage}%` : '0.0%'}
              </span>
            </div>
          </div>
          
          {/* Stroke risk slider */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              <span>Stroke Risk</span>
              <span className={report.risk_level === 'High' ? 'text-accentRed' : report.risk_level === 'Moderate' ? 'text-amber-400' : 'text-accentGreen'}>
                {report.stroke_risk}% ({report.risk_level})
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-panelBorder/30">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  report.risk_level === 'High' 
                    ? 'bg-accentRed shadow-[0_0_8px_#ff1744]' 
                    : report.risk_level === 'Moderate' 
                      ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
                      : 'bg-accentGreen shadow-[0_0_8px_#00e676]'
                }`}
                style={{ width: `${report.stroke_risk}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex items-center gap-2 border-t border-panelBorder/40 pt-4">
        <Link 
          to="/analysis-result"
          state={{ reportId: report.id }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 text-accentBlue hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all duration-300"
        >
          <MdVisibility size={14} />
          View Audit
        </Link>
        <button
          onClick={downloadPDF}
          className="p-2 rounded-xl bg-panelBg border border-panelBorder hover:border-slate-400 text-slate-400 hover:text-white transition-all duration-300"
          title="Download Clinical PDF Report"
        >
          <MdDownload size={14} />
        </button>
        <button
          onClick={() => onDelete(report.id)}
          className="p-2 rounded-xl bg-panelBg border border-panelBorder hover:border-accentRed/30 hover:bg-accentRed/5 text-slate-500 hover:text-accentRed transition-all duration-300"
          title="Remove Scan Report"
        >
          <MdDelete size={14} />
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
