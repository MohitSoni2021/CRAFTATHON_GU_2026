"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Clock, Bell, X, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react"
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google"
import { AlertInstance } from "@/lib/reminders"
import { format, parseISO } from "date-fns"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function AlertBanner({ alerts }: { alerts: AlertInstance[] }) {
  const [visible, setVisible] = useState<string[]>([])
  
  // Track visibility for individual dismissals
  useEffect(() => {
    setVisible(alerts.map(a => a.id))
  }, [alerts])

  const dismiss = (id: string) => setVisible(prev => prev.filter(v => v !== id))

  const activeAlerts = alerts.filter(a => visible.includes(a.id))
  if (activeAlerts.length === 0) return null;

  return (
    <div className={`space-y-4 mb-10 ${jakarta.className}`}>
      {activeAlerts.map(alert => {
        const config = {
          upcoming: { 
            bg: 'bg-teal-50/80 border-teal-200 text-teal-700', 
            icon: <Clock size={20} className="text-teal-600" />,
            label: 'Upcoming Regimen'
          },
          due: { 
            bg: 'bg-[#008080] border-[#008080] text-white', 
            icon: <Sparkles size={20} className="text-white animate-pulse" />,
            label: 'Action Required Now'
          },
          missed: { 
            bg: 'bg-red-50/80 border-red-200 text-red-700', 
            icon: <AlertTriangle size={20} className="text-red-600 animate-bounce" />,
            label: 'Missed Dose Hub Protocol'
          },
          escalation: { 
            bg: 'bg-[#1a2233] border-[#1a2233] text-[#3bbdbf]', 
            icon: <ShieldAlert size={20} className="text-[#3bbdbf] animate-pulse" />,
            label: 'Clinical Variance System'
          }
        }[alert.type]

        return (
          <div 
            key={alert.id}
            className={`relative flex items-center justify-between p-6 rounded-[2rem] border backdrop-blur-md shadow-lg animate-in slide-in-from-top-4 duration-500 ${config.bg}`}
          >
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-2xl shadow-inner backdrop-blur-sm">
                 {config.icon}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[3px] opacity-70 mb-1">{config.label}</p>
                 <h4 className={`${merriweather.className} text-xl font-bold leading-tight`}>{alert.message}</h4>
                 <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                    <Clock size={12} /> Scheduled Protocol: {format(parseISO(alert.scheduledTime), 'h:mm a')}
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => dismiss(alert.id)}
              className="p-3 hover:bg-black/10 rounded-xl transition-all h-fit"
            >
              <X size={20} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
