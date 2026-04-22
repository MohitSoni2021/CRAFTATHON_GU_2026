import React from 'react';
import { FaEdit, FaTimes } from 'react-icons/fa';
import { ProfileFormData } from './types';

interface EditModalProps {
  editSection: 'personal' | 'health' | 'sos' | null;
  editingContactIndex: number | null;
  formData: ProfileFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function EditModal({
  editSection,
  editingContactIndex,
  formData,
  onInputChange,
  onSave,
  onClose
}: EditModalProps) {
  if (!editSection) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl border border-primary/10 shadow-sm">
              <FaEdit />
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low">
              <FaTimes size={18} />
            </button>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {editSection === 'personal' ? 'Identify Record' :
                editSection === 'health' ? 'Clinical Profile' :
                  editSection === 'sos' ? (editingContactIndex !== null ? 'Secure Contact' : 'New Responder') : ''}
            </h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Ensure all parameters are current for accurate diagnostics.</p>
          </div>

          <div className="space-y-6 max-h-[50vh] overflow-y-auto px-1">
            {editSection === 'personal' && (
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Full Legal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {editSection === 'health' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={onInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={onInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={onInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={onInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Blood Type</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={onInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Chronic Conditions</label>
                  <input
                    type="text"
                    name="chronicConditions"
                    value={formData.chronicConditions}
                    onChange={onInputChange}
                    placeholder="e.g. Diabetes, Hypertension"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">Separate with commas</p>
                </div>
              </div>
            )}
            
            {editSection === 'sos' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Responder Identity</label>
                  <input
                    type="text"
                    name="sosName"
                    value={formData.sosName}
                    onChange={onInputChange}
                    placeholder="Full Name"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Secure Phone</label>
                    <input
                      type="tel"
                      name="sosPhone"
                      value={formData.sosPhone}
                      onChange={onInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Relationship</label>
                    <input
                      type="text"
                      name="sosRelation"
                      value={formData.sosRelation}
                      onChange={onInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email (Vault Only)</label>
                  <input
                    type="email"
                    name="sosEmail"
                    value={formData.sosEmail}
                    onChange={onInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-outline-variant flex flex-col gap-3">
            <button
              onClick={onSave}
              className="w-full py-5 bg-gradient-primary text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Update Parameters
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 text-gray-400 hover:text-gray-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
