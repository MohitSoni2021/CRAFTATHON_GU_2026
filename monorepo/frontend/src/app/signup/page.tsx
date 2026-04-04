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
import { Outfit } from "next/font/google"
import { Activity, HeartPulse, Stethoscope, ArrowRight, UserPlus, Sparkles, CheckCircle2 } from "lucide-react"

const outfit = Outfit({ subsets: ['latin'] })

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const validation = RegisterSchema.safeParse({ name, email, password, role })
      if (!validation.success) {
        setError(validation.error.errors[0].message)
        setLoading(false)
        return
      }

      await registerUser({ name, email, password, role })
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
    <div className={`min-h-screen flex flex-col lg:flex-row bg-[#000000] text-white ${outfit.className}`}>
      {/* Left Decoration / Info Section */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[45%] p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-yellow-600/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 rounded-2xl">
            <Activity className="text-black" size={28} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white uppercase">{APP_NAME}</span>
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold tracking-wider uppercase">
                <Sparkles size={14} />
                Healthcare Reimagined
            </div>
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
                Start your <br/>
                <span className="text-yellow-400">Healthier</span> Life.
            </h1>
          </div>

          <div className="space-y-6 pt-4">
               {[
                   { title: "Personalized Tracking", desc: "Tailored to your specific medications." },
                   { title: "Caregiver Network", desc: "Keep your loved ones in the loop." },
                   { title: "Advanced Analytics", desc: "Visualize your progress with ease." }
               ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                       <CheckCircle2 className="text-yellow-400 shrink-0 mt-1" size={20} />
                       <div>
                           <h4 className="font-semibold text-white">{item.title}</h4>
                           <p className="text-zinc-500 text-sm">{item.desc}</p>
                       </div>
                   </div>
               ))}
          </div>
        </div>

        <div className="relative z-10 text-zinc-600 text-sm">
            Join thousands of users improving their health outcome.
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="w-full max-w-xl space-y-8 z-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Create your account</h2>
            <p className="text-zinc-400">Enter your details to join the {APP_NAME} network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm font-medium text-red-500 bg-red-400/10 rounded-2xl border border-red-500/20 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-400 pl-1">Select Your Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'patient', label: 'Patient', icon: Activity },
                      { id: 'caregiver', label: 'Caregiver', icon: HeartPulse },
                      { id: 'doctor', label: 'Doctor', icon: Stethoscope }
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                          role === r.id 
                            ? 'border-yellow-400 bg-yellow-400/5 text-yellow-400' 
                            : 'border-white/5 bg-white/[0.02] text-zinc-600 hover:border-white/10 hover:text-zinc-400'
                        }`}
                      >
                        <r.icon size={24} className={role === r.id ? "mb-2 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "mb-2"} />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400 pl-1" htmlFor="name">Full Name</label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        type="text"
                        disabled={loading}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-white/[0.02] border-white/10 hover:border-white/20 focus:border-yellow-400/50 focus:ring-0 rounded-2xl h-14 text-white placeholder:text-zinc-700 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 pl-1" htmlFor="email">Email address</label>
                        <Input
                          id="email"
                          placeholder="john@example.com"
                          type="email"
                          disabled={loading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-white/[0.02] border-white/10 hover:border-white/20 focus:border-yellow-400/50 focus:ring-0 rounded-2xl h-14 text-white placeholder:text-zinc-700 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 pl-1" htmlFor="password">Password</label>
                    <Input
                      id="password"
                      placeholder="Min. 6 characters"
                      type="password"
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/[0.02] border-white/10 hover:border-white/20 focus:border-yellow-400/50 focus:ring-0 rounded-2xl h-14 text-white placeholder:text-zinc-700 transition-all"
                    />
                </div>
            </div>

            <Button 
                disabled={loading} 
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black h-14 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(250,204,21,0.15)] transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Creating your profile...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                    <UserPlus size={20} />
                    <span>Create Free Account</span>
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-700">
              <span className="bg-[#000000] px-4">Instant Access</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
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

          <p className="text-center text-zinc-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-yellow-400 font-bold transition-colors underline-offset-4 decoration-yellow-400/30 hover:decoration-yellow-400 underline">
                Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
