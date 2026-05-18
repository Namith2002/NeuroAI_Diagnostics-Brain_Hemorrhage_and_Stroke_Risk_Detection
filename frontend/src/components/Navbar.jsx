import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdHealing } from 'react-icons/md';

const Navbar = () => {
  const { token } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-darkBg/60 backdrop-blur-md border-b border-panelBorder/30">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Portal branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
            <MdHealing size={21} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-md tracking-wider leading-none">NEUROAI</h2>
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1 block">DIAGNOSTICS</span>
          </div>
        </Link>

        {/* Global links */}
        <nav className="flex items-center gap-8">
          <Link 
            to="/" 
            className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors duration-300"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors duration-300"
          >
            About Project
          </Link>
          
          {token ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-darkBg font-bold text-xs uppercase tracking-wider glow-btn-cyan"
            >
              Control Center
            </Link>
          ) : (
            <div className="flex items-center gap-5">
              <Link 
                to="/login" 
                className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors duration-300"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-xl bg-panelBg border border-cyan-500/25 hover:border-cyan-500 text-accentBlue hover:text-white hover:bg-cyan-500/10 font-bold text-xs uppercase tracking-wider transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
