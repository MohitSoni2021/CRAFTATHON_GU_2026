import React from "react";
import { FaRobot, FaStop, FaMicrophone } from "react-icons/fa";
import { Language } from "./types";

interface InteractionAreaProps {
  listening: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  onStartListening: () => void;
  onStopListening: () => void;
}

export default function InteractionArea({
  listening,
  language,
  setLanguage,
  onStartListening,
  onStopListening,
}: InteractionAreaProps) {
  return (
    <div className="w-full z-10 flex flex-col items-center">
      {/* Status Chip */}
      <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-xl text-primary text-[10px] font-bold mb-10 border border-outline-variant shadow-sm uppercase tracking-[0.2em]">
        <FaRobot /> <span>Advanced Neural Diagnostic Engine</span>
      </div>

      {/* Main Title */}
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
          How are you <span className="text-primary bg-clip-text">feeling?</span>
        </h2>
        <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed font-medium opacity-80">
          Our AI listens to your symptoms in real-time to provide clinical-grade insights.
        </p>
      </div>

      {/* Interaction Area */}
      <div className="relative mb-20 group">
        {/* Visualizer Rings */}
        {listening && (
          <>
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-10 scale-[2.5]"></div>
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20 scale-150 animation-delay-200"></div>
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-pulse scale-[1.2]"></div>
          </>
        )}

        <button
          onClick={listening ? onStopListening : onStartListening}
          className={`relative z-20 w-32 h-32 rounded-xl flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] ${
            listening
              ? "bg-rose-500 text-white shadow-rose-200"
              : "bg-gradient-primary text-white shadow-primary/30"
          }`}
        >
          {listening ? <FaStop className="text-4xl" /> : <FaMicrophone />}
        </button>

        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-64 text-center">
          <p
            className={`font-extrabold uppercase tracking-[0.3em] text-[10px] transition-colors duration-300 ${
              listening ? "text-rose-500 animate-pulse" : "text-gray-400"
            }`}
          >
            {listening ? "Recording Audio..." : "Click to begin"}
          </p>
        </div>
      </div>

      {/* Language & Settings */}
      <div className="flex items-center space-x-4 mb-16 p-1.5 bg-surface-container-low rounded-xl border border-outline-variant shadow-sm">
        {(["en", "hi", "gu"] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
              language === lang
                ? "bg-white text-primary shadow-sm border border-outline-variant"
                : "text-gray-500 hover:text-primary hover:bg-white/50"
            }`}
          >
            {lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Gujarati"}
          </button>
        ))}
      </div>
    </div>
  );
}
