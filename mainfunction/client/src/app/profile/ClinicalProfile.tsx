import React from 'react';
import { FaStethoscope, FaBolt, FaUser, FaChartLine, FaBirthdayCake, FaCheck } from 'react-icons/fa';
import { User } from './types';

interface ClinicalProfileProps {
  user: User | null;
  onEdit: () => void;
  onAIInsight: () => void;
}

export default function ClinicalProfile({ user, onEdit, onAIInsight }: ClinicalProfileProps) {
  const stats = [
    { label: 'Primary Gender', value: user?.profile?.gender || '--', icon: <FaUser /> },
    { label: 'Height (cm)', value: user?.profile?.height || '--', icon: <FaChartLine /> },
    { label: 'Weight (kg)', value: user?.profile?.weight || '--', icon: <FaChartLine /> },
    { label: 'Blood Group', value: user?.profile?.bloodGroup || '--', icon: <FaBolt /> },
    { label: 'Current Age', value: user?.age || '--', icon: <FaBirthdayCake /> }
  ];

  return (
    <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative overflow-hidden group">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl shadow-sm">
            <FaStethoscope />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Clinical Profile</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Medical History & Vitals</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAIInsight}
            className="bg-surface-container-low text-gray-600 hover:text-primary px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-outline-variant transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <FaBolt className="text-primary animate-pulse" /> AI Insight
          </button>
          <button
            onClick={onEdit}
            className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Modify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((item, i) => (
          <div key={i} className="p-5 bg-surface-container-low rounded-xl border border-outline-variant group/item hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-primary/40 group-hover/item:text-primary transition-colors">{item.icon}</div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
            </div>
            <p className="text-lg font-extrabold text-gray-900 capitalize">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant relative group/conditions">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Documented Chronic Conditions</p>
        <div className="flex flex-wrap gap-3">
          {user?.profile?.chronicConditions && user.profile.chronicConditions.length > 0 ? (
            user.profile.chronicConditions.map((condition, idx) => (
              <span key={idx} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                {condition}
              </span>
            ))
          ) : (
            <div className="text-gray-400 font-bold text-xs flex items-center gap-2">
              <FaCheck className="text-primary/50" /> No chronic conditions reported
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
