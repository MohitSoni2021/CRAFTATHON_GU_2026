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
            }
            // ... (previous regex logic for match)

            if (match) {
                // ... (existing sugar level logic)
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
                className={`fixed bottom-44 right-6 z-50 p-4 rounded-full shadow-lg transition-transform hover:scale-110 
            ${listening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'} text-white ${className || ''}`}
                title="Voice Assistant"
            >
                {/* Use FaRobot instead of FaMicrophone */}
                {listening ? <div className="w-6 h-6 flex items-center justify-center font-bold">...</div> : <FaRobot size={24} />}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-slide-up">

                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FaRobot /> {/* Updated header icon too */}
                                {view === 'listening' ? 'Voice Assistant' : 'Confirm Details'}
                            </h3>
                            <button onClick={handleClose} className="hover:bg-blue-700 p-1 rounded">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 text-center">
                            {view === 'listening' ? (
                                <>
                                    <div className="mb-4">
                                        {listening ? (
                                            <p className="text-green-600 font-medium animate-pulse">Listening...</p>
                                        ) : (
                                            <p className="text-gray-500">Microphone off</p>
                                        )}
                                    </div>
                                    <div className="min-h-[100px] bg-gray-50 rounded-lg p-4 border border-gray-200 text-left">
                                        {transcript || (
                                            <div className="text-gray-400 italic space-y-2">
                                                <p>Try saying:</p>
                                                <ul className="list-disc pl-5 text-sm">
                                                    <li>"Record sugar level is 180"</li>
                                                    <li>"Show my records"</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-left space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h4 className="font-semibold text-blue-800 mb-2">Detected Measurement</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-gray-600">Type:</span>
                                            <span className="font-medium">Glucose (Sugar)</span>

                                            <span className="text-gray-600">Value:</span>
                                            <span className="font-bold text-lg text-blue-700">{parsedData?.value} mg/dL</span>

                                            <span className="text-gray-600">Context:</span>
                                            <span className="font-medium capitalize">{parsedData?.time.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Based on: "{parsedData?.originalText}"
                                    </p>
                                </div>

                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 flex justify-center gap-3">
                            {view === 'listening' ? (
                                !listening && (
                                    <button
                                        onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        Resume Listening
                                    </button>
                                )
                            ) : (
                                <>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                    >
                                        <FaCheck /> Confirm & Save
                                    </button>
                                    <button
                                        onClick={() => { setView('listening'); setParsedData(null); resetTranscript(); SpeechRecognition.startListening({ continuous: true }); }}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        Retry
                                    </button>
                                </>
                            )}

                            {view === 'listening' && (
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default VoiceAssistant;
