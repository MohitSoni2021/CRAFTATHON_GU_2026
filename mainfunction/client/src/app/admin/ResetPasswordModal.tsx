import React, { useState } from 'react';
import { FaLock, FaKey, FaEyeSlash, FaEye } from 'react-icons/fa';
import axios from 'axios';

interface ResetPasswordModalProps {
    resetModal: { open: boolean; userId: string; name: string } | null;
    setResetModal: (modal: any) => void;
    token: string | null;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function ResetPasswordModal({ resetModal, setResetModal, token, showToast }: ResetPasswordModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    if (!resetModal?.open) return null;

    const handleResetPassword = async () => {
        if (!resetModal?.userId) return;
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        setResetLoading(true);
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${resetModal.userId}/reset-password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(`Password reset for ${resetModal.name}`, 'success');
            handleClose();
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Password reset failed', 'error');
        } finally {
            setResetLoading(false);
        }
    };

    const handleClose = () => {
        setResetModal(null);
        setNewPassword('');
        setShowPassword(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
                        <FaLock />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Reset Password</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Override</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-8 mt-2">
                    Setting new password for <span className="font-black text-gray-900">{resetModal.name}</span>
                </p>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                        <div className="relative group">
                            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" size={12} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                                placeholder="Min. 6 characters"
                                className="w-full pl-10 pr-12 py-4 bg-[#f8f9fc] border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                        {newPassword.length > 0 && newPassword.length < 6 && (
                            <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">⚠ Too short — minimum 6 characters</p>
                        )}
                        {newPassword.length >= 6 && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-2 ml-1">✓ Strength acceptable</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-xl border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleResetPassword}
                        disabled={resetLoading || newPassword.length < 6}
                        className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
                    >
                        {resetLoading ? (
                            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Resetting...</>
                        ) : (
                            <><FaKey size={10} /> Confirm Reset</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
