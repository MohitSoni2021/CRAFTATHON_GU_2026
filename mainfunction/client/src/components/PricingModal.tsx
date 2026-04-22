'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaCheck, FaSpinner, FaTimes, FaCrown, FaBolt, FaShieldAlt } from 'react-icons/fa';
import api from '@/utils/api';
import stripePromise from '@/utils/stripe';
import { useRouter } from 'next/navigation';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export default function PricingModal({ isOpen, onClose, message }: PricingModalProps) {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/subscription/create-checkout-session');
            const stripe = await stripePromise;
            if (stripe) {
                const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
                if (error) console.error(error);
            }
        } catch (error) {
            console.error('Subscription Error:', error);
            alert('Failed to start checkout session.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant">
                {/* Decorative Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>

                <div className="p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl shadow-sm border border-primary/10">
                            <FaCrown />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Limit Reached</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            {message || "You've hit your monthly free limit for AI interactions."}
                        </p>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant mb-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FaBolt size={80} />
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-8 relative z-10">
                            <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Per Month</span>
                        </div>

                        <ul className="space-y-4 relative z-10">
                            {[
                                'Unlimited AI Consultations',
                                'Unlimited Report Analysis',
                                'Priority Doctor Verification',
                                'Advanced Health Trends'
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                    <div className="w-5 h-5 bg-primary text-white rounded flex items-center justify-center shrink-0">
                                        <FaCheck size={10} />
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full py-5 px-6 bg-gradient-primary text-white font-extrabold rounded-xl shadow-xl shadow-primary/20 text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : (
                                <>
                                    <span>Upgrade to Concierge</span>
                                    <FaBolt size={12} className="opacity-50" />
                                </>
                            )}
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="w-full py-4 text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-outline-variant flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <FaShieldAlt className="text-primary/30" /> Secure payment via Stripe
                    </div>
                </div>
            </div>
        </div>
    );
}
