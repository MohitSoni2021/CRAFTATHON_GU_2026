import React from 'react';
import { FaShieldAlt, FaEdit, FaTimes, FaBolt, FaEnvelope } from 'react-icons/fa';
import { SOSContact } from './types';

interface SOSContactsSectionProps {
  contacts: SOSContact[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function SOSContactsSection({ contacts, onAdd, onEdit, onDelete }: SOSContactsSectionProps) {
  return (
    <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative group">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xl shadow-sm border border-red-100">
            <FaShieldAlt />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Emergency Contacts</h3>
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest opacity-70">Active SOS Protocol</p>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-red-200 hover:scale-[1.02] transition-all"
        >
          + Secure New
        </button>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact, idx) => (
            <div key={idx} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant relative group/contact hover:border-red-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{contact.name}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{contact.relationship}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover/contact:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(idx)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-400 hover:text-primary shadow-sm border border-outline-variant"
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    onClick={() => onDelete(idx)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-400 hover:text-red-500 shadow-sm border border-outline-variant"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-bold flex items-center gap-2">
                  <FaBolt className="text-gray-300" size={10} /> {contact.phone}
                </p>
                {contact.email && (
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                    <FaEnvelope className="text-gray-300" size={10} /> {contact.email}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
            <FaShieldAlt size={24} />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">No SOS Contacts Configured</p>
          <p className="text-gray-500 text-sm font-medium">Add trusted responders for critical health events.</p>
        </div>
      )}
    </div>
  );
}
