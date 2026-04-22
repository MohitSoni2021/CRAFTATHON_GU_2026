import React from 'react';
import { FaCheck } from 'react-icons/fa';

interface RoleChangeModalProps {
    roleModal: { open: boolean; userId: string; currentType: string; name: string } | null;
    setRoleModal: (modal: any) => void;
    handleRoleChange: (userId: string, newType: string) => void;
}

export default function RoleChangeModal({ roleModal, setRoleModal, handleRoleChange }: RoleChangeModalProps) {
    if (!roleModal?.open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-black text-gray-900 mb-1">Change Role</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">
                    Updating access for <span className="text-primary">{roleModal.name}</span>
                </p>
                <div className="space-y-3 mb-8">
                    {(['user', 'doctor', 'admin'] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => handleRoleChange(roleModal.userId, role)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                roleModal.currentType === role 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-gray-100 hover:border-primary/20 hover:bg-[#f8f9fc]'
                            }`}
                        >
                            <span className="font-black text-sm uppercase tracking-widest">{role}</span>
                            {roleModal.currentType === role && <FaCheck size={12} />}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setRoleModal(null)} 
                    className="w-full py-3 rounded-xl border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
