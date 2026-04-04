"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"
import { RegisterSchema } from "@hackgu/shared"
import { registerUser, googleLogin } from "@/lib/api/routes"
import { encryptData } from "@/lib/crypto"
import { Merriweather, Plus_Jakarta_Sans, Poppins } from "next/font/google"
import { Activity, HeartPulse, Stethoscope, UserPlus, ShieldCheck, UserCircle, ArrowRight } from "lucide-react"
import styles from '../login/login.module.css'

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

export default function SignupPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

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
      setError(err.response?.data?.message || "Profile initialization failed.")
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
      setError(err.response?.data?.message || "Google handshake failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google authentication service down.")
  }

  if (!mounted) return null;

  return (
    <div className={`${styles.container} ${poppins.className}`}>
      
      {/* Left Panel: Healthcare Network Branding */}
      <div className={styles.leftPanel}>
        <img 
          src="/login-bg.png" 
          alt="Healthcare Network" 
          className={styles.bgImage}
        />
        <div className={styles.leftContent}>
            <div className="flex items-center gap-3 mb-10 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 w-fit">
               <HeartPulse size={20} className="text-[#3bbdbf] animate-pulse" />
               <span className="text-xs font-black uppercase tracking-[2px]">Clinical Enrollment Active</span>
            </div>
            <h1 className={merriweather.className}>
               Empowering <br /> 
               <span className="text-[#3bbdbf]">Patient </span> Outcomes
            </h1>
            <p>
              Join the MedTrack healthcare network to manage medication adherence with clinical precision. Whether you are a patient, caregiver, or doctor, our platform provides the tools you need for optimal health tracking.
            </p>
        </div>
      </div>

      {/* Right Panel: Identity Creation */}
      <div className={styles.rightPanel}>
        <Link href="/" className={styles.logo}>
            <Activity size={32} className={styles.logoIcon} />
            <span className={merriweather.className}>MedTrack</span>
        </Link>
        
        <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
                <h2 className={merriweather.className}>Create Profile</h2>
                <p>Join the medication adherence network</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
                
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Network Node Role</label>
                    <div className={styles.roleGrid}>
                      {[
                        { id: 'patient', label: 'Patient', icon: Activity },
                        { id: 'caregiver', label: 'Caregiver', icon: HeartPulse },
                        { id: 'doctor', label: 'Doctor', icon: Stethoscope }
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`${styles.roleBtn} ${role === r.id ? styles.roleActive : ''}`}
                        >
                          <r.icon size={22} className={styles.roleIcon} />
                          <span className={styles.roleLabel}>{r.label}</span>
                        </button>
                      ))}
                    </div>
                </div>

                <div className={styles.inputRow}>
                   <div className={styles.inputGroup}>
                       <label className={styles.inputLabel} htmlFor="name">Full identifier</label>
                       <input
                           id="name"
                           className={styles.input}
                           placeholder="John Doe"
                           type="text"
                           disabled={loading}
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           required
                       />
                   </div>
                   <div className={styles.inputGroup}>
                       <label className={styles.inputLabel} htmlFor="email">Email address</label>
                       <input
                           id="email"
                           className={styles.input}
                           placeholder="john@example.com"
                           type="email"
                           disabled={loading}
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                       />
                   </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="password">Passphrase</label>
                    <input
                        id="password"
                        className={styles.input}
                        placeholder="••••••••"
                        type="password"
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button disabled={loading} className={styles.submitBtn}>
                    {loading ? (
                        <span>Initializing Node...</span>
                    ) : (
                        <>
                            <span>Compute Account</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>Social Handshake</span>
            </div>

            <div className={styles.googleBtnWrap}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    shape="square"
                    size="large"
                    width="100%"
                />
            </div>

            <p className={styles.prompt}>
                Already in the network? 
                <Link href="/login" className={styles.promptLink}>
                    Sign In
                </Link>
            </p>
        </div>
      </div>
    </div>
  )
}
