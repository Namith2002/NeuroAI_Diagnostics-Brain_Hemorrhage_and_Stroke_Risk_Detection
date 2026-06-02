import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MdHealing, MdAnalytics, MdPictureAsPdf, MdOutlineSpeed, MdCheckCircle } from 'react-icons/md';
import { IoShieldCheckmark, IoArrowForward } from 'react-icons/io5';

const Landing = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-darkBg text-slate-200 relative overflow-hidden flex flex-col">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>
      <Navbar />

      {/* Hero Section */}
      <main className="grow max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left Copy Column */}
        <div className="lg:col-span-6 flex flex-col gap-8 text-left">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 w-fit transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="w-2 h-2 rounded-full bg-accentBlue animate-pulse"></div>
            <span className="text-accentBlue text-xs font-extrabold uppercase tracking-widest">Clinical Decision Support System</span>
          </div>

          {/* Main Headline */}
          <div>
            <h1 className={`text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight uppercase transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              AI-Powered <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Brain Diagnostics</span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className={`text-lg text-slate-300 leading-relaxed font-medium max-w-lg transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Instantly detect hemorrhage and stroke risk using lightweight AI. Processes brain CT & MRI scans on CPU-only devices with hospital-grade accuracy and explainable Grad-CAM heatmaps.
          </p>

          {/* Key Metrics */}
          <div className={`grid grid-cols-3 gap-4 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-2xl font-extrabold text-cyan-400">Sub-1s</p>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Scan Time</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <p className="text-2xl font-extrabold text-indigo-400">98%+</p>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Accuracy</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <p className="text-2xl font-extrabold text-purple-400">CPU</p>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Only</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`flex items-center gap-4 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link 
              to="/login" 
              className="group px-8 py-4 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-darkBg font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all duration-300 hover:scale-105"
            >
              Access Portal
              <IoArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/about" 
              className="px-8 py-4 rounded-xl bg-panelBg/60 border border-panelBorder/60 text-slate-300 hover:text-white hover:border-cyan-500/50 font-extrabold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-panelBg/80"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right 3D Animated Visualizer */}
        <div className="lg:col-span-6 flex justify-center relative h-full min-h-[500px] items-center">
          
          {/* Glass Diagnostic Canvas - Enhanced */}
          <div className="relative w-full max-w-sm aspect-square">
            
            {/* Animated Outer Rings */}
            <div className="absolute inset-0 rounded-2xl">
              <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-2xl border border-cyan-500/10 animate-[spin_-20s_linear_infinite]"></div>
              <div className="absolute inset-8 rounded-2xl border border-indigo-500/10 animate-pulse"></div>
            </div>

            {/* Main Scanner Container */}
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/30 bg-linear-to-br from-panelBg/40 to-panelBg/20 backdrop-blur-xl shadow-2xl overflow-hidden">
              
              {/* Scanning Laser Line */}
              <div className="absolute inset-0 top-0">
                <div className="absolute left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00e5ff] top-1/3 animate-[slide_4s_ease-in-out_infinite]"></div>
              </div>

              {/* Brain Scan Image Container */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <div className="w-full h-full bg-black rounded-xl border border-cyan-500/20 overflow-hidden relative shadow-inner">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-screen" 
                    style={{ 
                      backgroundImage: "url('https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600')"
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-linear-to-t from-darkBg/80 via-transparent to-transparent"></div>
                  
                  {/* Status Badges */}
                  <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1">
                    <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest">Scanning Modality</span>
                    <span className="text-xs text-white font-bold">CT Brain Axis</span>
                  </div>
                  
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-accentRed animate-pulse"></div>
                    <span className="text-[9px] text-accentRed font-extrabold uppercase tracking-widest">Live</span>
                  </div>
                </div>
              </div>

              {/* Floating Data Points */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full border border-cyan-500/20 animate-[float_6s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full border-2 border-indigo-500/20 animate-[float_8s_ease-in-out_infinite]" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative py-24 overflow-hidden z-10">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 229, 255, .05) 25%, rgba(0, 229, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 229, 255, .05) 75%, rgba(0, 229, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 229, 255, .05) 25%, rgba(0, 229, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 229, 255, .05) 75%, rgba(0, 229, 255, .05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 uppercase">
              Powered by <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Advanced Technology</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Cutting-edge AI architecture built for real-world clinical deployment
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="group h-full p-8 rounded-2xl bg-linear-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-cyan-500/30 to-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <MdHealing size={28} />
              </div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-3">
                Lightweight AI Models
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                MobileNetV3-based architectures optimized for instant diagnosis on CPU-only devices without GPU overhead.
              </p>
              <div className="mt-4 flex items-center text-cyan-400 text-xs font-bold group-hover:translate-x-2 transition-transform duration-300">
                Learn More <IoArrowForward className="ml-2" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="group h-full p-8 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500/30 to-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <MdAnalytics size={28} />
              </div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-3">
                Grad-CAM Heatmaps
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Explainable AI with visual saliency maps pinpointing exactly where the model detected hemorrhage patterns.
              </p>
              <div className="mt-4 flex items-center text-indigo-400 text-xs font-bold group-hover:translate-x-2 transition-transform duration-300">
                Learn More <IoArrowForward className="ml-2" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="group h-full p-8 rounded-2xl bg-linear-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500/30 to-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <MdPictureAsPdf size={28} />
              </div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-3">
                Medical PDF Reports
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hospital-ready reports with patient metrics, risk scores, and high-res side-by-side scan comparisons.
              </p>
              <div className="mt-4 flex items-center text-purple-400 text-xs font-bold group-hover:translate-x-2 transition-transform duration-300">
                Learn More <IoArrowForward className="ml-2" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="group h-full p-8 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <IoShieldCheckmark size={28} />
              </div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-3">
                Enterprise Security
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                HIPAA-compliant encrypted database with JWT authentication and role-based access control.
              </p>
              <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold group-hover:translate-x-2 transition-transform duration-300">
                Learn More <IoArrowForward className="ml-2" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 rounded-2xl border border-cyan-500/30 bg-linear-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 uppercase">
              Ready to Transform <span className="text-cyan-400">Diagnostics?</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join clinical teams worldwide who are revolutionizing brain scan analysis with AI-powered decision support.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-darkBg font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)] transition-all duration-300 hover:scale-105"
            >
              Get Started Now
              <IoArrowForward />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-panelBorder/20 py-12 bg-darkBg/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">HIPAA</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4">Connect</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-panelBorder/20 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-500 text-[10px] font-semibold tracking-wider">&copy; {new Date().getFullYear()} COMPREHENSIVE BRAIN CT ANALYSIS SYSTEM. ALL RIGHTS RESERVED.</p>
            <p className="text-slate-500 text-xs mt-4 md:mt-0">FOR RESEARCH AND DEMONSTRATIVE SUPPORT USE ONLY. NOT FDA-APPROVED FOR PRIMARY DIAGNOSIS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
