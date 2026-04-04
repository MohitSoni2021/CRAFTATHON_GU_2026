"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"
import { LoginSchema } from "@hackgu/shared"
import { encryptData } from "@/lib/crypto"
import { loginUser, googleLogin } from "@/lib/api/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/constants"
import { Outfit } from "next/font/google"
import { Activity, ShieldCheck, Zap, ArrowRight, Github } from "lucide-react"

const outfit = Outfit({ subsets: ['latin'] })

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const validation = LoginSchema.safeParse({ email, password })
      if (!validation.success) {
        setError(validation.error.errors[0].message)
        setLoading(false)
        return
      }

      const response = await loginUser({ email, password })
      
      if (typeof window !== "undefined") {
        const encryptedUser = encryptData(response.user)
        localStorage.setItem("user", encryptedUser)
        localStorage.setItem("token", response.token)
      }
      
      if (response.user.role === 'doctor') {
        router.push("/doctor")
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.")
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
      if (response.user.role === 'doctor') {
        router.push("/doctor")
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Google login failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.")
  }

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-[#000000] text-white ${outfit.className}`}>
      {/* Left Decoration / Info Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-600/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)]">
            <Activity className="text-black" size={28} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white uppercase">{APP_NAME}</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
                Master your <br/>
                <span className="text-yellow-400">Medication</span> Journey.
            </h1>
            <p className="text-zinc-400 text-lg max-w-md">
              The premium companion for health tracking and real-time adherence monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 max-w-sm">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                    <ShieldCheck className="text-yellow-400" size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Secure Monitoring</h3>
                    <p className="text-xs text-zinc-500">End-to-end encrypted health data</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                    <Zap className="text-yellow-400" size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Real-time Insights</h3>
                    <p className="text-xs text-zinc-500">Live adherence score & risk analysis</p>
                </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-zinc-600 text-sm">
            &copy; 2026 {APP_NAME} Adherence System. Optimized for Gujarat Hackathon.
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative overflow-hidden">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <div className="p-2 bg-yellow-400 rounded-xl">
            <Activity className="text-black" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">{APP_NAME}</span>
        </div>

        <div className="w-full max-w-md space-y-10 z-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-zinc-400 text-lg">Enter your details to track your health.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm font-medium text-red-500 bg-red-400/10 rounded-2xl border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                </div>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 pl-1" htmlFor="email">Email address</label>
                <div className="relative group">
                    <Input
                        id="email"
                        placeholder="john@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        disabled={loading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/[0.03] border-white/10 hover:border-white/20 focus:border-yellow-400/50 focus:ring-0 rounded-2xl h-14 text-white placeholder:text-zinc-600 transition-all pl-4"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-medium text-zinc-400" htmlFor="password">Password</label>
                    <Link href="#" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-medium">Forgot password?</Link>
                </div>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/10 hover:border-white/20 focus:border-yellow-400/50 focus:ring-0 rounded-2xl h-14 text-white placeholder:text-zinc-600 transition-all pl-4"
                />
              </div>
            </div>

            <Button 
                disabled={loading} 
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black h-14 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(250,204,21,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                    <span>Account Sign in</span>
                    <ArrowRight size={20} />
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-700">
              <span className="bg-[#000000] px-4">Social integration</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-center w-full">
              <div 
                className="w-full overflow-hidden rounded-2xl border border-white/10 transition-all hover:bg-white/[0.02]"
                style={{ 
                  filter: 'invert(1) hue-rotate(180deg) brightness(1.5)',
                  opacity: 0.9
                }}
              >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    shape="square"
                    size="large"
                    width="100%"
                  />
              </div>
            </div>
          </div>

          <p className="text-center text-zinc-500 font-medium">
            New to the system?{" "}
            <Link href="/signup" className="text-white hover:text-yellow-400 font-bold transition-colors underline-offset-4 decoration-yellow-400/30 hover:decoration-yellow-400 underline">
                Create new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
