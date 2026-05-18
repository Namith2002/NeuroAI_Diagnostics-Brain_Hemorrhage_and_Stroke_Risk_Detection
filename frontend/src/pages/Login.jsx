import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 radial-grid-bg relative overflow-hidden flex flex-col justify-center items-center px-6 py-12">
      <Navbar />

      <div className="w-full max-w-md relative z-10">
        
        {/* Glow backdrop decorative bubbles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

        {/* Card Form */}
        <div className="glass-panel-glow border border-panelBorder p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <div className="text-center flex flex-col items-center gap-2 mb-6">
            <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase">System Login</h2>
            <p className="text-slate-400 text-xs font-semibold">ACCESS CLINICAL DIAGNOSTIC CORE</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-accentRed/10 border border-accentRed/35 text-accentRed font-bold text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MdEmail size={18} />
                </span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full bg-slate-950 border border-panelBorder focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest pl-1">Access Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MdLock size={18} />
                </span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-panelBorder focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-darkBg border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <MdLogin size={16} />
                  Authorize Access
                </>
              )}
            </button>
          </form>

          {/* Seed Admin Help Card */}
          <div className="mt-6 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-left">
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block mb-1">
              Demonstration Accounts
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              <strong className="text-white">Admin Account:</strong> admin@brainai.com<br />
              <strong className="text-white">Password:</strong> admin123
            </p>
          </div>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500 font-semibold">New researcher? </span>
            <Link to="/register" className="text-accentBlue font-bold hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
