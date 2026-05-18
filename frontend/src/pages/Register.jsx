import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { MdPerson, MdEmail, MdLock, MdAssignmentTurnedIn } from 'react-icons/md';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Password matching validation
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password is too short. Choose a password with at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      setSuccess("Account successfully created! Redirecting to login terminal...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
        
        {/* Glow backdrop bubbles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

        {/* Card Form */}
        <div className="glass-panel border border-panelBorder p-8 rounded-3xl shadow-2xl relative">
          
          <div className="text-center flex flex-col items-center gap-2 mb-6">
            <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase">User Register</h2>
            <p className="text-slate-400 text-xs font-semibold">INITIALIZE NEW CLINICAL PROFILE</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-accentRed/10 border border-accentRed/35 text-accentRed font-bold text-xs text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-accentGreen/10 border border-accentGreen/35 text-accentGreen font-bold text-xs text-center animate-pulse">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            
            {/* Full Name Field */}
            <div className="flex flex-col gap-1 pl-1 text-left">
              <label className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest pl-0.5">Researcher Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MdPerson size={18} />
                </span>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Doe"
                  className="w-full bg-slate-950 border border-panelBorder focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1 pl-1 text-left">
              <label className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest pl-0.5">Work Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MdEmail size={18} />
                </span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@hospital.com"
                  className="w-full bg-slate-950 border border-panelBorder focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1 pl-1 text-left">
              <label className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest pl-0.5">Account Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MdLock size={18} />
                </span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950 border border-panelBorder focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1 pl-1 text-left">
              <label className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest pl-0.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <MdLock size={18} />
                </span>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat account password"
                  className="w-full bg-slate-950 border border-panelBorder focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Register CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3 rounded-xl bg-cyan-500 text-darkBg font-extrabold text-xs uppercase tracking-wider glow-btn-cyan flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-darkBg border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <MdAssignmentTurnedIn size={16} />
                  Initialize Profile
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500 font-semibold">Registered staff? </span>
            <Link to="/login" className="text-accentBlue font-bold hover:underline">
              Login to workspace
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
