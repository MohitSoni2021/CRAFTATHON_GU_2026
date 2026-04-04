"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import SOSButton from "@/components/SOSButton";
import VoiceAssistant from "@/components/VoiceAssistant";

export default function ActionDock() {
    const pathname = usePathname();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Hide on Landing page (/), Login, and Register
    const isExcludedPage = ["/", "/login", "/register", "/forgot-password"].includes(pathname);

    if (!isAuthenticated || isExcludedPage) return null;

    return (
        <div id="onboarding-action-dock" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 print:hidden">

            {/* SOS Button */}
            <div className="relative group">
                <SOSButton className="!static !transform-none !bottom-auto !right-auto" />
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-600/95 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl whitespace-nowrap border border-white/20 -translate-y-2 group-hover:translate-y-0">
                    Emergency SOS (Hold 3s)
                </div>
            </div>

            {/* AI Assistant (Brain/Robot Icon) */}
            <div className="relative group">
                <VoiceAssistant className="!static !transform-none !bottom-auto !right-auto" />
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600/95 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl whitespace-nowrap border border-white/20 -translate-y-2 group-hover:translate-y-0">
                    Health AI Insight
                </div>
            </div>

        </div>
    );
}