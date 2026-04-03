"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"
import { RegisterSchema } from "@hackgu/shared"
import { registerUser, googleLogin } from "@/lib/api/routes"
import { encryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/constants"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Activity } from "lucide-react"

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const validation = RegisterSchema.safeParse({ name, email, password })
      if (!validation.success) {
        setError(validation.error.errors[0].message)
        setLoading(false)
        return
      }

      await registerUser({ name, email, password })
      router.push("/login")
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true)
    setError("")
    try {
      const response = await googleLogin(credentialResponse.credential)
      if (typeof window !== "undefined") {
        const encryptedUser = encryptData(response.user)
        localStorage.setItem("user", encryptedUser)
        localStorage.setItem("token", response.token)
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Google signup failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google signup failed. Please try again.")
  }

  return (
    <div className={`min-h-screen flex text-[#2b3654] ${jakarta.className}`}>
      {/* Left pane - Visual Theme */}
      <div className="hidden lg:flex flex-col relative w-1/2 p-12 overflow-hidden justify-between" style={{ background: 'linear-gradient(135deg, #4a7ae6 0%, #3bbdbf 100%)' }}>
        {/* Subtle background overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1582750433449-348eb71d2bcf?auto=format&fit=crop&w=2000&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        
        <div className="relative z-10 flex items-center gap-2 text-white font-bold text-2xl">
          <Activity size={32} />
          {APP_NAME}
        </div>
        
        <div className="relative z-10">
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 p-8 rounded-3xl text-white shadow-2xl">
             <h2 className="text-3xl font-bold mb-4 leading-tight">Join the adherence revolution.</h2>
             <p className="text-lg opacity-90">Create an account to seamlessly track doses and enable real-time coordination with your caregivers.</p>
          </div>
        </div>
      </div>

      {/* Right pane - Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#fcfdfd]">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center items-center gap-2 text-[#4a7ae6] font-bold text-2xl mb-8">
            <Activity size={32} />
            {APP_NAME}
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#2b3654]">Create an account</h1>
            <p className="text-[#7b8ea6]">Enter your details below to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            {error && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2b3654]" htmlFor="name">Full Name</label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-[#4a7ae6] focus:ring-[#4a7ae6] py-6"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2b3654]" htmlFor="email">Email</label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-[#4a7ae6] focus:ring-[#4a7ae6] py-6"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2b3654]" htmlFor="password">Password</label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-[#4a7ae6] focus:ring-[#4a7ae6] py-6"
                />
              </div>
            </div>

            <Button 
              disabled={loading} 
              className="w-full bg-[#4a7ae6] hover:bg-[#3965ca] text-white py-6 rounded-xl font-bold text-md shadow-lg shadow-[#4a7ae6]/20 transition-all hover:-translate-y-0.5"
            >
              {loading && (
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Create Account
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold">
              <span className="bg-[#fcfdfd] px-4 text-[#7b8ea6]">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signup_with"
              context="signup"
              shape="pill"
              size="large"
              width="100%"
            />
          </div>

          <p className="text-center text-sm font-medium text-[#7b8ea6] mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4a7ae6] font-bold hover:underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
