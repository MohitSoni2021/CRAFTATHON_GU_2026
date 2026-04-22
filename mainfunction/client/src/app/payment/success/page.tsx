'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchUserProfile } from '@/store/slices/authSlice';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [seconds, setSeconds] = useState(5);

    useEffect(() => {
        // Refresh user profile to get updated subscription status
        dispatch(fetchUserProfile());

        // Countdown for auto-redirect
        const timer = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [dispatch]);

    useEffect(() => {
        if (seconds === 0) {
            router.push('/dashboard');
        }
    }, [seconds, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    <FaCheckCircle />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for upgrading to Premium. Your account has been updated with unlimited access to all features.
                </p>

                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-1">Premium Features Unlocked</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>Running AI analysis...</li>
                        <li>Detailed Medical Insights</li>
                        <li>Unlimited OCR Scans</li>
                        <li>Priority Support</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/dashboard"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                        Go to Dashboard
                    </Link>

                    <div className="flex items-center justify-center text-sm text-gray-500 space-x-2">
                        <FaSpinner className="animate-spin" />
                        <span>Redirecting in {seconds} seconds...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
