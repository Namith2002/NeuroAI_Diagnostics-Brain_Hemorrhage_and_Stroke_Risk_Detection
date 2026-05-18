import React from 'react';
import { IoWarning } from 'react-icons/io5';

const MedicalDisclaimer = () => {
  return (
    <div className="glass-panel border border-red-500/20 bg-red-950/10 p-4 rounded-xl flex items-start gap-4 shadow-lg hover:border-red-500/30 transition-all duration-300">
      <IoWarning className="text-accentRed text-3xl shrink-0 mt-0.5 animate-pulse" />
      <div>
        <h4 className="text-accentRed font-bold text-sm tracking-wider uppercase">
          Clinical Decision Support Notice & Disclaimer
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed mt-1">
          This system is an automated AI diagnostic decision support system running lightweight convolutional deep-learning feature assessments (MobileNetV3). It is not FDA-approved for formal primary diagnosis. All classifications, confidence ratios, and risk profiles generated here are for research and reference assistance. Final diagnosis, radiological audits, and clinical correlation must be conducted by a board-certified radiologist or licensed medical professional.
        </p>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
