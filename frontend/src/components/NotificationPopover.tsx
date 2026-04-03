"use client"

import React, { useState, useEffect } from "react"
import { Bell, Check, CheckAll, Loader2, Clock, Info, AlertTriangle, X } from "lucide-react"
import { 
  getUnreadNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from "@/lib/api/routes"
import { format } from "date-fns"
import { Button } from "./ui/button"

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifs = async () => {
    try {
      setLoading(true)
      const res = await getUnreadNotifications()
      if (res.success) setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      const res = await markNotificationRead(id)
      if (res.success) {
        setNotifications(notifications.filter(n => n._id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllNotificationsRead()
      if (res.success) {
        setNotifications([])
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-[#2b3654] transition-colors relative"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden font-poppins">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-sm text-[#2b3654] flex items-center gap-2">
                 <Bell size={16} className="text-[#3bbdbf]" />
                 Alert Center
                 <span className="px-2 py-0.5 bg-[#e6fcfa] text-[#3bbdbf] text-[10px] rounded-full">{notifications.length}</span>
              </h3>
              {notifications.length > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-[#3bbdbf] hover:underline flex items-center gap-1"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="animate-spin text-gray-200" size={24} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Check className="text-gray-200" size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className="p-4 hover:bg-gray-50 transition-colors relative group"
                    >
                      <div className="flex gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                           n.type === 'missed' ? 'bg-red-50 text-red-500' : 
                           n.type === 'delayed' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-50'
                         }`}>
                           {n.type === 'missed' ? <AlertTriangle size={18} /> : 
                            n.type === 'info' ? <Info size={18} /> : 
                            <Clock size={18} />}
                         </div>
                         <div className="flex-1 min-w-0 pr-6">
                            <p className="text-xs font-bold text-[#2b3654] mb-0.5 leading-tight">{n.title}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mb-1">{n.message}</p>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                               {format(new Date(n.scheduledAt || n.createdAt), 'hh:mm a • MMM dd')}
                            </p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleMarkRead(n._id)}
                        className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-green-500 transition-all bg-white rounded-full shadow-sm"
                      >
                         <Check size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-50 text-center">
                 <Button variant="ghost" className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest py-2 h-auto rounded-xl hover:bg-gray-50">
                    View Alert History
                 </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
