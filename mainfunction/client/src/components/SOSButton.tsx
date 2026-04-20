"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaAmbulance } from "react-icons/fa";

interface SOSButtonProps {
    className?: string;
}

const SOSButton: React.FC<SOSButtonProps> = ({ className }) => {
    const [isPressing, setIsPressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    // Configuration
    const PRESS_DURATION = 3000; // 3 seconds to trigger

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPressing && status === "idle") {
            interval = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const newProgress = Math.min((elapsed / PRESS_DURATION) * 100, 100);
                setProgress(newProgress);

                if (newProgress >= 100) {
                    triggerSOS();
                    resetPress();
                }
            }, 50);
        } else {
            setProgress(0);
        }

        return () => clearInterval(interval);
    }, [isPressing, status]);

    const resetPress = () => {
        setIsPressing(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleMouseDown = () => {
        if (status !== "idle") return;
        setIsPressing(true);
        startTimeRef.current = Date.now();
    };

    const handleMouseUp = () => {
        resetPress();
    };

    const triggerSOS = () => {
        setStatus("sending");

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        alert("You must be logged in to use SOS.");
                        setStatus("idle");
                        return;
                    }

                    await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/sos/alert`,
                        { latitude, longitude },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setStatus("sent");
                    alert("SOS Alert Sent to Emergency Contacts!");
                } catch (error) {
                    console.error("SOS Failed", error);
                    setStatus("error");
                } finally {
                    setTimeout(() => setStatus("idle"), 5000);
                }
            },
            (error) => {
                console.error("Geo Error", error);
                setStatus("error");
                alert("Unable to retrieve location.");
                setTimeout(() => setStatus("idle"), 3000);
            }
        );
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${className || ''}`}>
            {/* Status Label */}
            {isPressing && status === "idle" && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap animate-pulse">
                    KEEP HOLDING FOR SOS
                </div>
            )}

            {status === "sending" && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    SENDING ALERT...
                </div>
            )}

            {status === "sent" && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    HELP IS ON THE WAY
                </div>
            )}

            {/* Button Ripple Effect */}
            {isPressing && (
                <div className="absolute inset-0 bg-red-500 rounded-full opacity-30 animate-ping"></div>
            )}

            <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown} // Mobile support
                onTouchEnd={handleMouseUp}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform ${isPressing ? "scale-110" : "scale-100"
                    } ${status === 'sent' ? 'bg-green-500' :
                        status === 'error' ? 'bg-gray-500' :
                            'bg-red-600 hover:bg-red-700'
                    }`}
            >
                <FaAmbulance className="text-white text-2xl" />

                {/* Progress Ring Overlay */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                        cx="32"
                        cy="32"
                        r="30"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeDasharray="188"
                        strokeDashoffset={188 - (188 * progress) / 100}
                        className="transition-all duration-75 ease-linear opacity-50"
                    />
                </svg>
            </button>
        </div>
    );
};

export default SOSButton;
