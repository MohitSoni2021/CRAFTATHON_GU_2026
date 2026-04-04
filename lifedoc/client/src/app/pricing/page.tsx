'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { FaCheck, FaTimes, FaStar, FaShieldAlt, FaBolt, FaSpinner } from 'react-icons/fa';
import api from '@/utils/api';
import stripePromise from '@/utils/stripe';

export default function PricingPage() {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

    const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 sm:text-4xl">
                    Simple, Transparent Pricing
                </h2>
                <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                    Unlock the full power of LifeDoc with our Premium plan.
                </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
                {/* Free Plan */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h3>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Essential health tracking for individuals.</p>
                        <p className="mt-8">
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
                            <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mo</span>
                        </p>
                        <ul className="mt-8 space-y-4">
                            <li className="flex items-center">
                                <FaCheck className="h-5 w-5 text-green-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400">5 AI Consultations per month</span>
                            </li>
                            <li className="flex items-center">
                                <FaCheck className="h-5 w-5 text-green-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400">5 Prescription/Report Scans per month</span>
                            </li>
                            <li className="flex items-center">
                                <FaCheck className="h-5 w-5 text-green-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400">Basic Health Tracking</span>
                            </li>
                            <li className="flex items-center">
                                <FaTimes className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                                <span className="ml-3 text-gray-400">Priority Doctor Review</span>
                            </li>
                        </ul>
                        <div className="mt-8">
                            <button
                                disabled
                                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg px-4 py-3 font-semibold cursor-not-allowed"
                            >
                                Current Plan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Premium Plan */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-blue-600 relative">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        RECOMMENDED
                    </div>
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Premium</h3>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Unlimited access for your entire family.</p>
                        <p className="mt-8">
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$9.99</span>
                            <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mo</span>
                        </p>
                        <ul className="mt-8 space-y-4">
                            <li className="flex items-center">
                                <FaCheck className="h-5 w-5 text-green-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400"><strong>Unlimited</strong> AI Consultations</span>
                            </li>
                            <li className="flex items-center">
                                <FaCheck className="h-5 w-5 text-green-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400"><strong>Unlimited</strong> Scans & Reports</span>
                            </li>
                            <li className="flex items-center">
                                <FaCheck className="h-5 w-5 text-green-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400">Advanced Health Analytics</span>
                            </li>
                            <li className="flex items-center">
                                <FaCheck className="h-5 w-5 text-green-500" />
                                <span className="ml-3 text-gray-500 dark:text-gray-400">Priority Support</span>
                            </li>
                        </ul>
                        <div className="mt-8">
                            {isPremium ? (
                                <button
                                    disabled
                                    className="w-full bg-green-100 text-green-700 rounded-lg px-4 py-3 font-semibold cursor-default"
                                >
                                    Active Plan
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-4 py-3 font-semibold shadow-md transition-all flex justify-center items-center"
                                >
                                    {loading ? <FaSpinner className="animate-spin h-5 w-5" /> : 'Upgrade Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
