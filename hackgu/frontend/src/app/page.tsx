"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { APP_NAME } from "@/constants"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const encryptedUser = localStorage.getItem("user")
      console.log("Encrypted user on dashboard:", encryptedUser)
      
      if (!encryptedUser) {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        if (!decryptedUser) {
          console.error("Failed to decrypt user data")
          localStorage.removeItem("user")
          router.push("/login")
        } else {
          setUser(decryptedUser)
          setLoading(false)
        }
      }
    }
  }, [router])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-zinc-500 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8 border-zinc-200">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">{APP_NAME}</h1>
            <p className="text-zinc-500 mt-1 text-lg">
              Welcome back, <span className="text-zinc-900 font-semibold">{user?.name || "User"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-zinc-300 hover:bg-zinc-100" onClick={handleLogout}>
              Logout
            </Button>
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
              Settings
            </Button>
          </div>
        </header>

        {/* Info Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white border-zinc-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Account ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-zinc-100 p-2 rounded border border-zinc-200 text-zinc-700 break-all">
                {user?.id || "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-zinc-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Full Name</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{user?.name || "Guest User"}</div>
              <p className="text-xs text-green-600 font-medium mt-1">Verified Member</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-zinc-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Email Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-zinc-800 truncate">{user?.email || "not@available.com"}</div>
              <p className="text-xs text-zinc-400 mt-1">Primary Login Email</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white border-zinc-200 shadow-lg overflow-hidden">
          <div className="bg-zinc-900 h-2" />
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-bold">System Status</CardTitle>
            <CardDescription className="text-zinc-500">
              Overview of your current account status and system connectivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">Database Connectivity</h4>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-zinc-600">Successfully connected to Hackathon Cluster</span>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">Authentication Service</h4>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-zinc-600">Zod Validation Layer Active</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-100 flex flex-wrap gap-3">
              <Button size="sm" className="bg-zinc-900 text-zinc-50">View Documentation</Button>
              <Button size="sm" variant="outline" className="border-zinc-300">Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
