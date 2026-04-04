'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { FaBookMedical } from 'react-icons/fa';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      if (result.payload.user.type === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#eaf4f6] via-white to-[#eaf4f6] ${jakarta.className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2">
          <FaBookMedical size={28} color="#2b7a8c" />
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">Life</span>
            <span className="text-2xl font-bold text-[#3bbdbf]">Doc</span>
          </div>
        </Link>
        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          EN ▼
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-8 lg:px-16">
          <div className="w-full max-w-md mt-10 lg:mt-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
              Welcome Back
            </h1>

            <p className="text-center text-gray-600 mb-10 text-sm leading-relaxed">
              Sign in to your account to access your medical documents and health history.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bbdbf] focus:bg-white transition text-gray-900 placeholder-gray-500"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bbdbf] focus:bg-white transition text-gray-900 placeholder-gray-500"
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#3bbdbf] rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-[#2b7a8c] hover:text-[#3bbdbf] font-medium transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2b7a8c] to-[#3bbdbf] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-md"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-8">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#2b7a8c] hover:text-[#3bbdbf] font-semibold transition">
                Sign Up
              </Link>
            </p>

            <div className="text-center text-gray-500 text-xs mt-12">
              Need help?{' '}
              <a
                href="mailto:support@lifedoc.com"
                className="text-[#2b7a8c] hover:text-[#3bbdbf] transition"
              >
                support@lifedoc.com
              </a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#2b7a8c] to-[#3bbdbf]">
          <img
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80"
            alt="LifeDoc Medical Professionals"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-12">
            <h2 className="text-4xl font-bold text-white mb-2">Your Health Matters</h2>
            <p className="text-[#eaf4f6] text-lg leading-relaxed max-w-md">
              Access your medical records, track your health history, and stay connected
              with your healthcare providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
