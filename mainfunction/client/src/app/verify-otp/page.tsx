'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyOTP, clearError } from '@/store/slices/authSlice';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const pendingEmail = sessionStorage.getItem('pendingEmail');
      if (!pendingEmail) {
        router.push('/signup');
      } else {
        setEmail(pendingEmail);
      }
    }
  }, [router]);

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(verifyOTP({ email, otp }));

    if (verifyOTP.fulfilled.match(result)) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Email</h2>
        <p className="text-gray-600 mb-4 text-center">
          Please enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-3 py-2 border rounded text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
