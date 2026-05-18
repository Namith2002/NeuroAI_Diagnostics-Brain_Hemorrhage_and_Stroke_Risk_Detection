import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MdErrorOutline } from 'react-icons/md';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-darkBg text-slate-200 radial-grid-bg relative overflow-hidden flex flex-col justify-center items-center px-6 py-12">
      <Navbar />

      <div className="w-full max-w-md relative z-10 text-center flex flex-col items-center gap-6">
        
        {/* Glow backdrop decorative bubbles */}
        <div className="absolute top-0 w-40 h-40 bg-accentRed/5 rounded-full blur-3xl"></div>

        {/* 404 Glass Card */}
        <div className="glass-panel border border-panelBorder p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5 relative">
          
          <div className="w-16 h-16 rounded-2xl bg-accentRed/10 flex items-center justify-center text-accentRed shadow-inner">
            <MdErrorOutline size={36} className="animate-bounce" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-5xl font-black text-white tracking-tight leading-none">404</h1>
            <span className="text-[10px] text-accentRed font-extrabold uppercase tracking-widest leading-none mt-2">
              DIAGNOSTIC INDEX UNRESOLVED
            </span>
          </div>

          <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
            The scanner was unable to map the requested pathway. This address does not correspond to a registered patient module or clinical workspace.
          </p>

          <Link 
            to="/dashboard"
            className="w-full mt-4 py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan shadow-lg"
          >
            Return to Dashboard
          </Link>

        </div>
      </div>
    </div>
  );
};

export default NotFound;
