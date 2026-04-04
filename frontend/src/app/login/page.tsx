"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"
import { LoginSchema } from "@hackgu/shared"
import { encryptData } from "@/lib/crypto"
import { loginUser, googleLogin } from "@/lib/api/routes"
import { Merriweather, Plus_Jakarta_Sans, Poppins } from "next/font/google"
import { Activity, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react"
import styles from './login.module.css'

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      setError(err.response?.data?.message || "Invalid credentials. Manual entry required.")
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
      
      {/* Left Panel: Clinical Branding */}
      <div className={styles.leftPanel}>
        <img 
          src="/login-bg.png" 
          alt="Medical Background" 
          className={styles.bgImage}
        />
        <div className={styles.leftContent}>
            <div className="flex items-center gap-3 mb-10 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 w-fit">
               <ShieldCheck size={20} className="text-[#3bbdbf]" />
               <span className="text-xs font-black uppercase tracking-[2px]">Clinical Access Level 1</span>
            </div>
            <h1 className={merriweather.className}>
               Advanced Health <br /> 
               <span className="text-[#3bbdbf]">Monitoring </span> Hub
            </h1>
            <p>
              Access the clinical medication adherence engine. Your session is protected by state-of-the-art pharmacological encryption and HIPAA compliance.
            </p>
        </div>
      </div>

      {/* Right Panel: Identity Verification */}
      <div className={styles.rightPanel}>
        <Link href="/" className={styles.logo}>
            <Activity size={32} className={styles.logoIcon} />
            <span className={merriweather.className}>MedTrack</span>
        </Link>
        
        <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
                <h2 className={merriweather.className}>Sign In</h2>
                <p>Verify your medical identity to continue</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
                
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="email">Email identifier</label>
                    <input
                        id="email"
                        className={styles.input}
                        placeholder="doctor@medtrack.org"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        disabled={loading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                        <label className={styles.inputLabel} htmlFor="password">Passphrase</label>
                        <Link href="#" className={styles.forgotLink}>Reset Access</Link>
                    </div>
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
                        <span>Validating Hub Access...</span>
                    ) : (
                        <>
                            <span>Establish Session</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>OAuth Gateway</span>
            </div>

            <div className={styles.googleBtnWrap}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    shape="square"
                    size="large"
                    width="100%"
                    logo_alignment="center"
                />
            </div>

            <p className={styles.prompt}>
                Not registered in the network? 
                <Link href="/signup" className={styles.promptLink}>
                    Initialize Profile
                </Link>
            </p>
        </div>
      </div>
    </div>
  )
}
