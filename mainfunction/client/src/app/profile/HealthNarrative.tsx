import React from 'react';
import { FaStethoscope, FaBolt } from 'react-icons/fa';

interface HealthNarrativeProps {
  storyDesc?: string;
}

export default function HealthNarrative({ storyDesc }: HealthNarrativeProps) {
  if (!storyDesc) return null;

  return (
    <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient bg-primary/5 relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <FaStethoscope size={100} />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-lg shadow-lg shadow-primary/20">
          <FaBolt />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Health Narrative</h3>
      </div>
      <div className="p-6 bg-white/50 rounded-xl border border-primary/10 backdrop-blur-sm">
        <p className="text-gray-700 text-lg leading-relaxed font-medium italic opacity-90">
          "{storyDesc}"
        </p>
      </div>
    </div>
  );
}
