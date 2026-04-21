import React from "react";
import { FaBrain, FaHeartbeat, FaExclamationTriangle } from "react-icons/fa";
import { AIAnalysis } from "./types";

interface AiSentinelAnalysisProps {
  analysis: AIAnalysis | null;
  analyzing: boolean;
  onGenerate: () => void;
}

export default function AiSentinelAnalysis({
  analysis,
  analyzing,
  onGenerate,
}: AiSentinelAnalysisProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3">
              <FaBrain className="text-primary" /> AI Sentinel Analysis
            </h2>
            <p className="text-gray-400 mt-2 font-medium">
              Algorithmic risk evaluation based on recent biometric trends.
            </p>
          </div>
          {!analysis ? (
            <button
              onClick={onGenerate}
              disabled={analyzing}
              className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-3"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  Processing Matrix...
                </>
              ) : (
                <>
                  <FaBrain /> Initiate Scan
                </>
              )}
            </button>
          ) : (
            <div
              className={`px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-inner border ${
                analysis.riskLevel === "High"
                  ? "text-red-400 bg-red-900/30 border-red-800/50"
                  : "text-emerald-400 bg-emerald-900/30 border-emerald-800/50"
              }`}
            >
              {analysis.riskLevel === "High" ? <FaExclamationTriangle /> : <FaHeartbeat />}
              Risk Status: {analysis.riskLevel}
            </div>
          )}
        </div>

        {analysis && (
          <div className="mt-8 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-lg leading-relaxed font-medium text-gray-200 border-l-4 border-primary pl-4 py-1">
              "{analysis.summary}"
            </p>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                <h3 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Clinical Recommendations
                </h3>
                <ul className="space-y-3">
                  {analysis.actionItems?.map((action, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300 items-start">
                      <span className="text-primary mt-1">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                <h3 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Consultation Queries
                </h3>
                <ul className="space-y-3">
                  {analysis.doctorQuestions?.map((q, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300 items-start">
                      <span className="text-amber-500 mt-1">?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
