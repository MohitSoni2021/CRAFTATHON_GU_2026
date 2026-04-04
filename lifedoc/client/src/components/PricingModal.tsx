'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                    >
                        <FaTimes size={20} />
                    </button>
                    <h2 className="text-3xl font-extrabold mb-2">Limit Reached</h2>
                    <p className="text-blue-100 text-lg">
                        {message || "You've hit your monthly free limit."}
                    </p>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-gray-500 mb-4">Upgrade to <strong>Premium</strong> for unexpected power.</p>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="text-5xl font-extrabold text-blue-900">$9.99</span>
                            <span className="text-gray-400 font-medium">/ month</span>
                        </div>

                        <ul className="space-y-3 text-left max-w-xs mx-auto text-gray-600">
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-green-100 rounded-full text-green-600">
                                    <FaCheck size={14} />
                                </div>
                                <span className="font-medium">Unlimited AI Consultations</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-green-100 rounded-full text-green-600">
                                    <FaCheck size={14} />
                                </div>
                                <span className="font-medium">Unlimited Prescription Scans</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-green-100 rounded-full text-green-600">
                                    <FaCheck size={14} />
                                </div>
                                <span className="font-medium">Priority Support</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] flex justify-center items-center"
                    >
                        {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Unlock Unlimited Access'}
                    </button>

                    <p className="text-center mt-4 text-xs text-gray-400">
                        Secure payment powered by Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
