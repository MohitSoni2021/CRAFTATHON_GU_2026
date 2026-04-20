'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { encrypt } from '@/utils/cryptoUtils';
import Link from 'next/link';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pendingResetEmail');
    if (!pendingEmail) {
      router.push('/forgot-password');
    } else {
      setEmail(pendingEmail);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    setError('');

    try {
      const encryptedData = encrypt({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        encryptedData
      });

      if (response.status === 200) {
        setMessage('Password reset successful. Redirecting to login...');
        sessionStorage.removeItem('pendingResetEmail');
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP or error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-900">Life</div>
          <div className="text-2xl font-bold text-emerald-600">Doc</div>
        </div>
        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          EN ▼
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-8 lg:px-16">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
              Reset Password
            </h1>
            <p className="text-center text-gray-600 mb-10 text-sm leading-relaxed">
              Enter the OTP sent to <strong>{email}</strong> and create a new password.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm text-center">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP Input */}
              <div>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP (6 digits)"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500 text-center tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              {/* New Password Input */}
              <div>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            {/* Back to Login Link */}
            <p className="text-center text-gray-600 text-sm mt-8">
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Back to Sign In
              </Link>
            </p>

            {/* Footer */}
            <div className="text-center text-gray-500 text-xs mt-12">
              <p>Need help? <a href="mailto:support@lifedoc.com" className="text-emerald-600 hover:text-emerald-700">support@lifedoc.com</a></p>
            </div>
          </div>
        </div>

        {/* Right Side - Content (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 to-emerald-600 flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center text-white max-w-md">
            <h2 className="text-4xl font-bold mb-4">
              New Password Secured
            </h2>
            <p className="text-emerald-50 text-lg leading-relaxed">
              Create a strong password to protect your account and health information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
