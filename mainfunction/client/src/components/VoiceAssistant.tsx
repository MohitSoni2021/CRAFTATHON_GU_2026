'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import 'regenerator-runtime/runtime';
import { FaMicrophone, FaTimes, FaCheck, FaSave, FaRobot } from 'react-icons/fa';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createMeasurement } from '@/store/slices/measurementsSlice';

// Dynamically wrap the component
const VoiceAssistant = dynamic(
    () => Promise.resolve(VoiceAssistantComponent),
    { ssr: false }
);

interface ParsedData {
    type: 'sugar_level';
    value: number;
    time: string;
    originalText: string;
}

interface VoiceAssistantProps {
    className?: string;
}

function VoiceAssistantComponent({ className }: VoiceAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'listening' | 'confirm'>('listening');
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);

    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const {
        transcript,
        finalTranscript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    // Parse transcript
    useEffect(() => {
        if (finalTranscript && view === 'listening') {
            const lowerTranscript = finalTranscript.toLowerCase();

            // 1. Navigation Command: "Show records", "View measurements", etc.
            if (
                lowerTranscript.includes('show') ||
                lowerTranscript.includes('view') ||
                lowerTranscript.includes('open') ||
                lowerTranscript.includes('go to')
            ) {
                if (
                    lowerTranscript.includes('record') ||
                    lowerTranscript.includes('measurement') ||
                    lowerTranscript.includes('history')
                ) {
                    SpeechRecognition.stopListening();
                    router.push('/measurements');
                    handleClose();
                    return;
                }

                if (lowerTranscript.includes('diary') || lowerTranscript.includes('journal')) {
                    SpeechRecognition.stopListening();
                    router.push('/diary');
                    handleClose();
                    return;
                }

                if (lowerTranscript.includes('appointment')) {
                    SpeechRecognition.stopListening();
                    router.push('/appointments');
                    handleClose();
                    return;
                }
            }

            // 2. Recording Command: "Record sugar level...", "My sugar level..."
            // Regex flexible: allows optional "record", then "sugar level", optional "before/after...", and value
            // Matches: "Sugar level before lunch is 120", "Record sugar 140", "My sugar level was 90 fasting"
            const sugarRegex = /(?:record|log)?.*sugar.*?(?:level)?.*?(?:is|was)?\s*(\d+)/i;
            const match = lowerTranscript.match(sugarRegex);

            if (match) {
                const sugarValue = parseInt(match[1], 10);

                // Try to extract time context
                let timeContext = 'random';
                if (lowerTranscript.includes('fasting')) timeContext = 'fasting';
                else if (lowerTranscript.includes('before breakfast')) timeContext = 'before_breakfast';
                else if (lowerTranscript.includes('after breakfast')) timeContext = 'after_breakfast';
                else if (lowerTranscript.includes('before lunch')) timeContext = 'before_lunch';
                else if (lowerTranscript.includes('after lunch')) timeContext = 'after_lunch';
                else if (lowerTranscript.includes('before dinner')) timeContext = 'before_dinner';
                else if (lowerTranscript.includes('after dinner')) timeContext = 'after_dinner';
                else if (lowerTranscript.includes('bedtime') || lowerTranscript.includes('before sleep')) timeContext = 'bedtime';

                const data: ParsedData = {
                    type: 'sugar_level',
                    time: timeContext,
                    value: sugarValue,
                    originalText: finalTranscript
                };
                console.log('✅ Voice Data Captured:', data);
                setParsedData(data);
                setView('confirm');
                SpeechRecognition.stopListening();
            } else {
                // 3. Fallback: Ask AI Guide
                handleAIGuide(finalTranscript);
                SpeechRecognition.stopListening();
            }
        }
    }, [finalTranscript, view, router]);

    const handleAIGuide = async (text: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // Silent fail if not logged in

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/guide`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            const data = await res.json();

            if (data.message) {
                console.log("🤖 AI Guide:", data.message);
                speak(data.message);

                // Handle optional actions
                if (data.action === "NAVIGATE_HOME") router.push('/');
                // Add more actions as needed
            }
        } catch (err) {
            console.error("AI Guide Error", err);
        }
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slower for elderly
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Apply polyfill
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            if (!window.SpeechRecognition && window.webkitSpeechRecognition) {
                // @ts-ignore
                SpeechRecognition.applyPolyfill(window.webkitSpeechRecognition);
            }
        }
    }, []);

    const handleToggle = () => {
        if (isOpen) {
            handleClose();
        } else {
            resetTranscript();
            setView('listening');
            setIsOpen(true);
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        }
    };

    const handleClose = () => {
        SpeechRecognition.stopListening();
        setIsOpen(false);
        setView('listening');
        setParsedData(null);
    };

    const handleConfirm = async () => {
        if (!parsedData || !user) return;

        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            await dispatch(createMeasurement({
                userId: user.id,
                date: today,
                readings: [{
                    type: 'glucose',
                    value: parsedData.value,
                    unit: 'mg/dL',
                    notes: `Captured via Voice: ${parsedData.time.replace('_', ' ')}`,
                    timestamp: new Date().toISOString()
                }]
            })).unwrap();

            alert('Measurement saved successfully!');
            handleClose();
        } catch (error) {
            alert('Failed to save measurement: ' + error);
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

    return (
        <>
            <button
                onClick={handleToggle}
                className={`fixed bottom-44 right-6 z-50 p-4 rounded-xl shadow-xl transition-all hover:scale-105 border 
            ${listening ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-primary text-white border-primary/20'} ${className || ''}`}
                title="Voice Assistant"
            >
                {/* Use FaRobot instead of FaMicrophone */}
                {listening ? (
                    <div className="relative w-6 h-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                        <FaRobot size={24} className="relative z-10 text-red-600" />
                    </div>
                ) : (
                    <div className="relative">
                        <FaRobot size={24} />
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200 border border-gray-100">
                        {/* Header */}
                        <div className="bg-[#f8f9fc] p-6 border-b border-gray-100 flex justify-between items-center relative overflow-hidden">
                            {listening && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 animate-pulse" />
                            )}
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${listening ? 'bg-red-50 text-red-600 border-red-100' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                    <FaRobot size={18} />
                                </div>
                                {view === 'listening' ? 'AI Voice Assistant' : 'Confirm Details'}
                            </h3>
                            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div className="p-8 text-center space-y-6">
                            {view === 'listening' ? (
                                <>
                                    <div className="flex flex-col items-center gap-2">
                                        {listening ? (
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 animate-pulse bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                                                <div className="w-2 h-2 rounded-full bg-red-500" /> Listening to you...
                                            </div>
                                        ) : (
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                Microphone off
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-h-[120px] bg-[#f8f9fc] rounded-xl p-6 border border-gray-100 text-left relative overflow-hidden shadow-inner">
                                        {transcript ? (
                                            <p className="text-gray-900 font-medium leading-relaxed italic relative z-10">
                                                "{transcript}"
                                            </p>
                                        ) : (
                                            <div className="text-gray-400 space-y-3 relative z-10">
                                                <p className="text-[10px] font-black uppercase tracking-widest">Try saying:</p>
                                                <ul className="space-y-2 text-sm font-medium">
                                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>"Record sugar level is 180"</li>
                                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>"Show my records"</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-left space-y-6">
                                    <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Detected Measurement
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 relative z-10">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Type</p>
                                                <p className="font-black text-gray-900 text-sm">Glucose (Sugar)</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Context</p>
                                                <p className="font-black text-gray-900 text-sm capitalize">{parsedData?.time.replace(/_/g, ' ')}</p>
                                            </div>
                                            <div className="col-span-2 bg-white p-3 rounded-lg border border-primary/10 shadow-sm flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Value</span>
                                                <span className="font-black text-2xl text-primary tracking-tight">{parsedData?.value} <span className="text-xs font-bold text-gray-400 tracking-widest ml-1">MG/DL</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-start">
                                        <div className="mt-0.5 text-gray-400">
                                            <FaMicrophone size={14} />
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                                            "{parsedData?.originalText}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-[#f8f9fc] flex justify-end gap-3">
                            {view === 'listening' ? (
                                <>
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2.5 bg-white text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    {!listening && (
                                        <button
                                            onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })}
                                            className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                                        >
                                            <FaMicrophone size={12} /> Resume Listening
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setView('listening'); setParsedData(null); resetTranscript(); SpeechRecognition.startListening({ continuous: true }); }}
                                        className="px-6 py-2.5 bg-white text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                                    >
                                        Retry
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary shadow-xl shadow-gray-300 hover:shadow-primary/20 transition-all"
                                    >
                                        <FaCheck size={12} /> Confirm & Save
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default VoiceAssistant;
