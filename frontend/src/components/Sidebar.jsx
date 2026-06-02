import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdDashboard, 
  MdCloudUpload, 
  MdHistory, 
  MdAnalytics, 
  MdPerson, 
  MdAdminPanelSettings, 
  MdLogout,
  MdHealing,
  MdBook,
  MdShowChart,
  MdFlashOn
} from 'react-icons/md';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigations directory
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={19} /> },
    { name: 'Upload Scan', path: '/upload-scan', icon: <MdCloudUpload size={19} /> },
    { name: 'Scan History', path: '/history', icon: <MdHistory size={19} /> },
    { name: 'Analytics Suite', path: '/analytics', icon: <MdAnalytics size={19} /> },
    { name: 'Epilepsy Predictor', path: '/epilepsy-prediction', icon: <MdFlashOn size={19} /> },
    { name: 'Educational Hub', path: '/documentation', icon: <MdBook size={19} /> },
    { name: 'Profile Account', path: '/profile', icon: <MdPerson size={19} /> },
  ];

  // Dynamically inject Admin controls if roles match
  if (user?.role === 'admin') {
    navItems.push({ 
      name: 'Admin Dashboard', 
      path: '/admin', 
      icon: <MdAdminPanelSettings size={19} className="text-cyan-400" /> 
    });
    navItems.push({ 
      name: 'Graph Analytics', 
      path: '/graph-analytics', 
      icon: <MdShowChart size={19} className="text-cyan-400" /> 
    });
  }


  return (
    <aside className="w-64 min-h-screen bg-panelBg border-r border-panelBorder flex flex-col justify-between p-6 shrink-0 relative z-10">
      <div className="flex flex-col gap-8">
        
        {/* Clinical branding logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <MdHealing size={21} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-xs tracking-wider leading-none">COMPREHENSIVE BRAIN CT</h2>
            <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1 block">ANALYSIS SYSTEM</span>
          </div>
        </div>

        {/* User Mini Card */}
        <div className="p-3 rounded-xl bg-darkBg/60 border border-panelBorder/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-800/40 flex items-center justify-center font-bold text-cyan-400 text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate leading-none">{user?.name}</h4>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">{user?.role} Account</span>
          </div>
        </div>

        {/* Navigation block */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all duration-300 group border ${
                  isActive 
                    ? 'bg-cyan-500/10 border-cyan-500/25 text-accentBlue glow-text-cyan' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`
              }
            >
              <span className="group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-accentRed hover:bg-accentRed/5 border border-transparent hover:border-accentRed/25 transition-all duration-300"
      >
        <MdLogout size={19} />
        System Logout
      </button>
    </aside>
  );
};

export default Sidebar;
