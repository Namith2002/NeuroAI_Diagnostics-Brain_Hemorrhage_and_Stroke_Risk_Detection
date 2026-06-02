import React from 'react';

const regionDetails = {
  "Epidural Hematoma": {
    name: 'Epidural Hematoma',
    function: 'The outermost intracranial space situated between the inner table of the skull and the dura mater.',
    clinicalNotes: 'Epidural hematomas are commonly arterial in origin (e.g., middle meningeal artery tear) associated with skull fractures. They frequently feature a clinical "lucid interval" followed by rapid neurological deterioration due to mass effect. Emergency surgical evacuation is often critical.',
    colorClass: 'from-rose-600 to-red-500'
  },
  "Subdural Hematoma": {
    name: 'Subdural Hematoma',
    function: 'The potential space between the dura mater and the arachnoid mater.',
    clinicalNotes: 'Subdural hematomas typically result from venous bleeding, especially bridging veins. They may present as acute, subacute, or chronic. Symptoms can accumulate gradually and include headache, progressive cognitive decline, or focal neurological deficits. Manage intracranial pressure (ICP) carefully.',
    colorClass: 'from-orange-600 to-amber-500'
  },
  "Subarachnoid Hemorrhage": {
    name: 'Subarachnoid Hemorrhage',
    function: 'The cerebrospinal fluid (CSF)-filled space between the arachnoid mater and the pia mater, housing major cerebral arteries.',
    clinicalNotes: 'Subarachnoid hemorrhage classical presentation is a sudden, excruciating "thunderclap" headache. Most commonly caused by ruptured aneurysms. Carries high risk for secondary cerebral vasospasm, hydrocephalus, and post-hemorrhage seizures. Strict blood pressure control is paramount.',
    colorClass: 'from-amber-600 to-yellow-500'
  },
  "Intracerebral Hemorrhage": {
    name: 'Intracerebral Hemorrhage',
    function: 'The functional brain parenchyma comprising deep white matter, basal ganglia, and cortical lobes.',
    clinicalNotes: 'Intracerebral hemorrhage occurs directly within the brain tissue itself. Frequently associated with hypertension, cerebral amyloid angiopathy, or vascular malformations. Neurological deficits correspond directly to the focal location. Elevate the head of the bed to 30 degrees and maintain seizure precautions.',
    colorClass: 'from-purple-600 to-indigo-500'
  },
  Multiple: {
    name: 'Multiple Hemorrhages',
    function: 'Widespread hemorrhage involving more than one anatomical space or diffuse subarachnoid spread.',
    clinicalNotes: 'Suggests high-impact trauma or advanced coagulopathy. Represents highly compromised patient status with compounded risk factors requiring comprehensive critical care monitoring.',
    colorClass: 'from-red-700 via-rose-600 to-orange-500'
  },
  Unknown: {
    name: 'Unspecified Hemorrhage',
    function: 'AI identified hyperdensity pixels but could not confirm a single primary anatomical space classification.',
    clinicalNotes: 'Inspect the hybrid Grad-CAM overlay to localize the hyperdense hemorrhage region and initiate standard clinical protocols.',
    colorClass: 'from-slate-600 to-slate-500'
  }
};

const BrainRegionMap = ({ location, confidence }) => {
  // Normalize the input location to match keys
  const activeKey = Object.keys(regionDetails).find(
    (key) => key.toLowerCase() === (location || '').toLowerCase()
  ) || 'Unknown';

  const details = regionDetails[activeKey];
  const isMultiple = activeKey === 'Multiple';
  const isUnknown = activeKey === 'Unknown';

  // Helper to determine path style for interactive overlay bleeds
  const getBleedProps = (regionKey, activeColor, inactiveColor = '#334155') => {
    const isActive = activeKey === regionKey || (isMultiple && regionKey !== 'Unknown');
    return {
      className: `transition-all duration-700 ease-in-out ${
        isActive 
          ? 'animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] opacity-100' 
          : 'opacity-10'
      }`,
      fill: isActive ? activeColor : 'none',
      stroke: isActive ? '#ef4444' : inactiveColor,
      strokeWidth: isActive ? 2.5 : 1,
      strokeDasharray: isActive ? 'none' : '3,3'
    };
  };

  return (
    <div className="p-5 rounded-2xl bg-panelBg/20 border border-panelBorder flex flex-col gap-6">
      
      {/* SVG Visualization Row: Wide Landscape Alignment */}
      <div className="w-full flex flex-col items-center justify-center min-h-[220px] relative bg-slate-950/40 rounded-xl border border-panelBorder/60 p-4 overflow-hidden">
        <h4 className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase absolute top-3 left-4">
          Anatomical Spaces Visualizer (Axial Skull Slice)
        </h4>
        
        {/* Widescreen Landscape SVG */}
        <svg className="w-full max-w-[480px] h-auto aspect-[480/220] my-2" viewBox="0 0 480 220">
          <defs>
            {/* Active glowing red/orange gradient */}
            <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            
            {/* Normal / Inactive slate gradient */}
            <linearGradient id="inactiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Base Anatomical Structure (Always visible in background) */}
          <g id="base-anatomy">
            {/* Skull Bone Outer ring */}
            <ellipse cx="240" cy="110" rx="160" ry="100" fill="#0f172a" stroke="#334155" strokeWidth="4" className="opacity-90" />
            
            {/* Dura Mater Layer */}
            <ellipse cx="240" cy="110" rx="153" ry="93" fill="none" stroke="#475569" strokeWidth="1" className="opacity-60" />
            
            {/* Brain Parenchyma (Wavy hemispheres) */}
            <path
              d="M 240,44 C 220,44 215,48 205,48 C 195,48 190,44 180,46 C 170,48 165,54 158,58 C 151,62 145,62 140,68 C 135,74 136,82 132,90 C 128,98 124,102 124,110 C 124,118 128,122 132,130 C 136,138 135,146 140,152 C 145,158 151,158 158,162 C 165,166 170,172 180,174 C 190,176 195,172 205,172 C 215,172 220,176 240,176 C 260,176 265,172 275,172 C 285,172 290,176 300,174 C 310,172 315,166 322,162 C 329,158 335,158 340,152 C 345,146 344,138 348,130 C 352,122 356,118 356,110 C 356,102 352,98 348,90 C 344,82 345,74 340,68 C 335,62 329,62 322,58 C 315,54 310,48 300,46 C 290,44 285,48 275,48 C 265,48 260,44 240,44 Z"
              fill="#1e293b"
              fillOpacity="0.4"
              stroke="#475569"
              strokeWidth="1.5"
              className="opacity-70"
            />
            
            {/* Longitudinal Fissure Divider */}
            <line x1="240" y1="44" x2="240" y2="176" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" className="opacity-55" />
            
            {/* Ventricles (Symmetric lateral ventricles in center) */}
            <path 
              d="M 230,110 C 220,100 220,85 235,90 C 235,98 238,105 238,110 C 238,115 235,122 235,130 C 220,135 220,120 230,110 Z M 250,110 C 260,100 260,85 245,90 C 245,98 242,105 242,110 C 242,115 245,122 245,130 C 260,135 260,120 250,110 Z" 
              fill="#0f172a" 
              stroke="#334155" 
              strokeWidth="1" 
              className="opacity-80" 
            />
          </g>

          {/* Pathological Bleeds (Interactive overlays) */}
          <g id="pathology-layers">
            {/* Epidural Hematoma (Biconvex lens shape on the right edge) */}
            <path
              d="M 368,80 C 390,110 390,120 368,150 C 352,130 352,100 368,80 Z"
              {...getBleedProps('Epidural Hematoma', 'url(#activeGrad)')}
            />
            
            {/* Subdural Hematoma (Crescent shape on the left edge) */}
            <path
              d="M 112,65 C 80,95 80,135 112,165 C 100,145 100,85 112,65 Z"
              {...getBleedProps('Subdural Hematoma', 'url(#activeGrad)')}
            />
            
            {/* Subarachnoid Hemorrhage (CSF-space sulcal and cistern bleed lines) */}
            <path
              d="M 240,44 L 240,90 M 240,130 L 240,176 M 205,48 C 210,65 200,80 220,95 M 275,48 C 270,65 280,80 260,95 M 132,110 L 175,110 M 348,110 L 305,110"
              {...getBleedProps('Subarachnoid Hemorrhage', 'none', '#eab308')}
              stroke={activeKey === 'Subarachnoid Hemorrhage' ? '#f59e0b' : '#334155'}
              strokeWidth={activeKey === 'Subarachnoid Hemorrhage' ? 3.0 : 1}
            />
            
            {/* Intracerebral Hemorrhage (Focal lobulated intraparenchymal bleed) */}
            <path
              d="M 270,125 C 265,115 280,105 290,112 C 300,110 305,125 295,135 C 290,145 275,140 270,125 Z"
              {...getBleedProps('Intracerebral Hemorrhage', 'url(#activeGrad)')}
            />
          </g>

          {/* Landscape indicator lines & labels pointing to specific anatomical bleed locations */}
          <g id="labels" className="text-[8px] fill-slate-400 font-extrabold uppercase tracking-wider">
            {/* Epidural Space (top left - points to right edge hematoma) */}
            <text x="460" y="45" textAnchor="end">1. Epidural Space (Biconvex)</text>
            <line x1="340" y1="45" x2="370" y2="105" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" className="opacity-50" />
            <circle cx="370" cy="105" r="2" fill="#ef4444" />

            {/* Subdural Space (top right - points to left edge hematoma) */}
            <text x="20" y="45" textAnchor="start">2. Subdural Space (Crescent)</text>
            <line x1="140" y1="45" x2="105" y2="105" stroke="#f97316" strokeWidth="1" strokeDasharray="2,2" className="opacity-50" />
            <circle cx="105" cy="105" r="2" fill="#f97316" />

            {/* Subarachnoid Space (bottom left - points to central cistern / sulcal lines) */}
            <text x="20" y="185" textAnchor="start">3. Subarachnoid Space (CSF)</text>
            <line x1="150" y1="185" x2="210" y2="140" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2" className="opacity-50" />
            <circle cx="210" cy="140" r="2" fill="#fbbf24" />

            {/* Intracerebral Space (bottom right - points to inner parenchyma hematoma) */}
            <text x="460" y="185" textAnchor="end">4. Intracerebral Tissue</text>
            <line x1="340" y1="185" x2="285" y2="125" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2,2" className="opacity-50" />
            <circle cx="285" cy="125" r="2" fill="#a78bfa" />
          </g>
        </svg>

        {isUnknown && (
          <div className="absolute inset-0 bg-red-950/20 rounded-2xl flex items-center justify-center pointer-events-none border border-dashed border-red-500/25">
            <span className="text-[10px] text-red-400 font-extrabold uppercase bg-slate-900/90 px-3 py-1.5 rounded-full border border-red-500/35 tracking-widest animate-pulse">
              Location Indeterminate
            </span>
          </div>
        )}
      </div>

      {/* Clinical Info Section: Side-by-Side details inside landscape block */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-panelBorder pb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                Anatomical Localization Report
              </span>
            </div>
            <h3 className="text-lg font-black text-white leading-tight">
              Hemorrhage Detected: <span className="text-red-400 font-extrabold">{details.name}</span>
            </h3>
            <p className="text-slate-400 text-xs font-semibold mt-2 leading-relaxed">
              <strong className="text-slate-200">Space Details:</strong> {details.function}
            </p>
          </div>

          <div className="flex-1">
            <p className="border-l-2 border-l-red-500/40 pl-3 italic py-1 bg-red-500/5 rounded-r-lg text-slate-400 text-xs font-semibold leading-relaxed">
              <strong className="text-red-400 not-italic uppercase font-extrabold block mb-0.5 text-[9px] tracking-wide">
                Critical Clinical Precautions
              </strong>
              {details.clinicalNotes}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-900/20 p-3 rounded-xl">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Classification Confidence</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {Number(confidence > 1.0 ? confidence : confidence * 100).toFixed(1)}%
            </p>
          </div>
          <span className="text-[9px] font-extrabold text-rose-400 uppercase tracking-widest px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30">
            {activeKey}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrainRegionMap;
