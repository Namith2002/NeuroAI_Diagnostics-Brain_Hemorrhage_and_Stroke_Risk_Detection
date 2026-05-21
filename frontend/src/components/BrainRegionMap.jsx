import React from 'react';

const regionDetails = {
  Frontal: {
    name: 'Frontal Lobe',
    function: 'Controls voluntary movement, expressive language, decision-making, and high-level executive function (planning, organizing, impulse control).',
    clinicalNotes: 'Hemorrhage in this region frequently leads to contralateral hemiparesis (weakness/paralysis on one side of the body), expressive aphasia (difficulty speaking), or acute behavioral and personality changes. Motor cortex involvement carries a high seizure risk.',
    colorClass: 'from-rose-600 to-red-500'
  },
  Temporal: {
    name: 'Temporal Lobe',
    function: 'Involved in processing auditory information, memory encoding (hippocampus), and language comprehension (Wernicke\'s area).',
    clinicalNotes: 'Temporal lobe bleeds are highly correlated with complex partial seizures, receptive aphasia (difficulty understanding speech), and memory deficits. Strict seizure prophylaxis is critically indicated in this subgroup.',
    colorClass: 'from-orange-600 to-amber-500'
  },
  Parietal: {
    name: 'Parietal Lobe',
    function: 'Integrates sensory information (taste, temperature, touch) and manages spatial coordination, reading, writing, and mathematical calculations.',
    clinicalNotes: 'Bleeding here causes sensory loss or neglect on the contralateral side, hemianesthesia, spatial disorientation, or difficulty reading/writing. Monitor sensory deficits closely to prevent self-injury.',
    colorClass: 'from-amber-600 to-yellow-500'
  },
  Occipital: {
    name: 'Occipital Lobe',
    function: 'Primary visual processing center of the mammalian brain, responsible for interpreting color, shape, motion, and visual recognition.',
    clinicalNotes: 'Commonly manifests as contralateral homonymous hemianopsia (blindness in half the visual field) or visual hallucinations. Patient safety is highly compromised due to sudden loss of visual fields.',
    colorClass: 'from-purple-600 to-indigo-500'
  },
  Cerebellum: {
    name: 'Cerebellum',
    function: 'Coordinates voluntary muscle movements, posture, balance, and fine motor coordination, ensuring smooth physical movement.',
    clinicalNotes: 'Cerebellar hemorrhage is a neurosurgical emergency. Due to proximity, swelling can rapidly compress the brainstem and cause fourth ventricle obstruction, leading to acute hydrocephalus. Monitor level of consciousness closely.',
    colorClass: 'from-emerald-600 to-teal-500'
  },
  Brainstem: {
    name: 'Brainstem',
    function: 'Coordinates vital cardiac and respiratory functions, consciousness level, sleep cycles, and crucial autonomic nervous system reflexes.',
    clinicalNotes: 'CRITICAL WARNING: Brainstem hemorrhage is highly lethal. It poses an immediate threat to cardiorespiratory drive. Rapid progression to coma or decerebrate posturing is common. Immediate mechanical ventilation and ICU support are required.',
    colorClass: 'from-red-800 to-rose-700'
  },
  Multiple: {
    name: 'Multiple Lobes / Diffuse Hemorrhage',
    function: 'Widespread involvement of more than one anatomical region or lobe.',
    clinicalNotes: 'Suggests multi-focal bleeding, extensive subarachnoid hemorrhage, or large intraparenchymal hematoma spreading across boundaries. Represents a severe clinical status with compounded risk factors.',
    colorClass: 'from-red-700 via-rose-600 to-orange-500'
  },
  Unknown: {
    name: 'Unspecified Region',
    function: 'AI detected hemorrhage pixels but could not confirm a single primary lobe classification.',
    clinicalNotes: 'Coordinate with Grad-CAM heatmap visuals to inspect localized hyperdensities. Advise standard emergency protocol and follow-up clinical CT scans.',
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

  // Helper to determine path style
  const getPathProps = (regionKey) => {
    const isActive = activeKey === regionKey || (isMultiple && regionKey !== 'Unknown');
    return {
      className: `transition-all duration-700 ease-in-out cursor-pointer ${
        isActive 
          ? 'animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' 
          : 'opacity-40 hover:opacity-75'
      }`,
      fill: isActive 
        ? 'url(#activeGrad)' 
        : 'url(#inactiveGrad)',
      stroke: isActive ? '#f87171' : '#475569',
      strokeWidth: isActive ? 2.5 : 1.5,
    };
  };

  return (
    <div className="p-6 rounded-3xl bg-panelBg/40 border border-panelBorder flex flex-col lg:flex-row gap-8 items-stretch">
      {/* SVG Visualization Column */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative bg-slate-950/40 rounded-2xl border border-panelBorder/60 p-4">
        <h4 className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase absolute top-4 left-4">
          Interactive Anatomy Visualizer
        </h4>
        
        {/* Glow Definition for SVG */}
        <svg className="w-full max-w-[380px] h-auto aspect-[4/3]" viewBox="0 0 400 300">
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

          <g id="brain-lobes">
            {/* Frontal Lobe */}
            <path
              d="M 190,50 C 130,50 85,90 85,150 C 85,175 100,195 120,200 C 130,185 150,175 180,175 C 185,150 190,120 195,50 Z"
              {...getPathProps('Frontal')}
            />
            {/* Parietal Lobe */}
            <path
              d="M 195,50 C 190,120 185,150 180,175 C 215,175 250,175 265,175 C 280,150 295,130 295,95 C 295,55 255,50 195,50 Z"
              {...getPathProps('Parietal')}
            />
            {/* Occipital Lobe */}
            <path
              d="M 295,95 C 320,95 330,115 330,145 C 330,170 320,185 305,190 C 285,190 275,185 265,175 C 280,150 295,130 295,95 Z"
              {...getPathProps('Occipital')}
            />
            {/* Temporal Lobe */}
            <path
              d="M 120,200 C 120,200 135,195 180,175 C 215,175 250,175 265,175 C 260,190 250,205 235,215 C 195,220 140,220 120,200 Z"
              {...getPathProps('Temporal')}
            />
            {/* Cerebellum */}
            <path
              d="M 265,175 C 255,190 255,205 270,210 C 285,210 305,210 305,205 C 295,200 280,190 265,175 Z M 265,205 C 255,210 255,225 270,240 C 290,240 315,235 320,220 C 320,210 310,205 265,205 Z"
              {...getPathProps('Cerebellum')}
            />
            {/* Brainstem */}
            <path
              d="M 210,220 C 212,245 218,275 222,285 C 232,285 238,275 240,245 C 242,220 235,215 210,220 Z"
              {...getPathProps('Brainstem')}
            />
          </g>

          {/* Lines / Label indicators */}
          <g id="labels" className="text-[10px] fill-slate-400 font-bold uppercase tracking-wider">
            {/* Frontal Label */}
            <text x="35" y="80">Frontal</text>
            <line x1="75" y1="83" x2="115" y2="105" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

            {/* Parietal Label */}
            <text x="210" y="32">Parietal</text>
            <line x1="230" y1="38" x2="235" y2="70" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

            {/* Occipital Label */}
            <text x="325" y="80" textAnchor="start">Occipital</text>
            <line x1="320" y1="83" x2="295" y2="105" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

            {/* Temporal Label */}
            <text x="30" y="245">Temporal</text>
            <line x1="75" y1="242" x2="155" y2="205" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

            {/* Cerebellum Label */}
            <text x="315" y="260" textAnchor="start">Cerebellum</text>
            <line x1="310" y1="257" x2="290" y2="225" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

            {/* Brainstem Label */}
            <text x="140" y="285" textAnchor="end">Brainstem</text>
            <line x1="145" y1="282" x2="218" y2="255" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
          </g>
        </svg>

        {isUnknown && (
          <div className="absolute inset-0 bg-red-950/20 rounded-2xl flex items-center justify-center pointer-events-none border-2 border-dashed border-red-500/20">
            <span className="text-[11px] text-red-400 font-extrabold uppercase bg-slate-900/90 px-3 py-1.5 rounded-full border border-red-500/35 tracking-widest animate-pulse">
              Location Indeterminate
            </span>
          </div>
        )}
      </div>

      {/* Clinical Info Column */}
      <div className="flex-1 flex flex-col justify-between p-1">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
              Anatomical Localization Report
            </span>
          </div>
          
          <h3 className="text-xl font-black text-white leading-tight mb-2">
            Hemorrhage Detected: <span className="text-red-400 font-extrabold">{details.name}</span>
          </h3>

          <div className="text-slate-400 text-xs font-semibold leading-relaxed mb-4">
            <p className="mb-2.5">
              <strong className="text-slate-200">Lobe Function:</strong> {details.function}
            </p>
            <p className="border-l-2 border-l-red-500/40 pl-3 italic py-0.5 bg-red-500/5 rounded-r-lg">
              <strong className="text-red-400 not-italic uppercase font-extrabold block mb-0.5 text-[10px] tracking-wide">
                Critical Clinical Precautions
              </strong>
              {details.clinicalNotes}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-panelBorder/50 flex justify-between items-center bg-slate-900/20 p-3 rounded-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Classification Confidence</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{confidence * 100}%</p>
          </div>
          <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30">
            {activeKey} region affected
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrainRegionMap;
