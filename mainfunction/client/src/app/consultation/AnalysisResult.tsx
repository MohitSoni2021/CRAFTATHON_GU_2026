import React from "react";
import { FaRobot, FaVolumeUp, FaChevronRight, FaUserMd } from "react-icons/fa";
import { AiResult } from "./types";

interface AnalysisResultProps {
  transcript: string;
  aiResult: AiResult | null;
  analyzing: boolean;
  onSpeakResponse: (text: string) => void;
  onRequestReview: () => void;
  onShowPricing: () => void;
}

export default function AnalysisResult({
  transcript,
  aiResult,
  analyzing,
  onSpeakResponse,
  onRequestReview,
  onShowPricing,
}: AnalysisResultProps) {
  if (!transcript && !aiResult && !analyzing) return null;

  return (
    <div className="w-full card-editorial rounded-xl p-10 shadow-ambient border border-outline-variant transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>

      <div className="flex flex-col gap-10">
        {/* User Input Log */}
        <div className="border-b border-outline-variant pb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>{" "}
              Recorded Transcript
            </h3>
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
              Audio-to-Text
            </span>
          </div>
          <p className="text-2xl text-gray-800 font-extrabold tracking-tight leading-relaxed italic">
            "{transcript || "..."}"
          </p>
        </div>

        {/* Analysis Hub */}
        <div className="relative min-h-[100px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center">
              <FaRobot className="mr-2" /> Neural Assessment
            </h3>
            {aiResult?.urgency && (
              <div
                className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                  aiResult.urgency === "High"
                    ? "bg-rose-500 text-white"
                    : aiResult.urgency === "Medium"
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-white"
                }`}
              >
                Priority: {aiResult.urgency}
              </div>
            )}
          </div>

          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce animation-delay-150"></div>
                <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce animation-delay-300"></div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Processing Bio-Signals...
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <FaRobot size={150} />
                </div>
                <p className="text-lg text-gray-900 leading-relaxed font-bold italic relative z-10">
                  "{aiResult?.summary}"
                </p>

                {aiResult?.isLimitError && (
                  <div className="mt-8 p-6 bg-white border border-amber-200 rounded-xl shadow-sm">
                    <h4 className="font-extrabold text-gray-900 text-sm mb-2 uppercase tracking-wide">
                      Usage Limit Reached
                    </h4>
                    <p className="text-gray-500 text-sm mb-6 font-medium">
                      You've exhausted your free consultations for this period. Upgrade to continue your care journey.
                    </p>
                    <button
                      onClick={onShowPricing}
                      className="btn-primary !rounded-xl px-6 py-3 text-xs w-full sm:w-auto"
                    >
                      View Pro Plans
                    </button>
                  </div>
                )}

                {aiResult?.summary && !aiResult?.isLimitError && (
                  <div className="mt-8 flex items-center space-x-4 relative z-10">
                    <button
                      onClick={() => onSpeakResponse(aiResult.summary)}
                      className="p-3 bg-white text-primary rounded-xl border border-outline-variant hover:bg-primary hover:text-white transition-all shadow-sm"
                      title="Speak Analysis"
                    >
                      <FaVolumeUp size={16} />
                    </button>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Synthetic Audio Ready
                    </span>
                  </div>
                )}
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lifestyle Advice */}
                {aiResult?.lifestyleAdvice && aiResult.lifestyleAdvice.length > 0 && (
                  <div className="p-6 bg-primary/[0.03] rounded-xl border border-primary/10">
                    <h4 className="font-extrabold text-primary text-[10px] uppercase tracking-[0.2em] mb-4">
                      🌱 Lifestyle Protocol
                    </h4>
                    <ul className="space-y-3">
                      {aiResult.lifestyleAdvice.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start text-gray-700 text-sm font-medium">
                          <FaChevronRight size={10} className="mr-3 mt-1 text-primary opacity-40 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Medicines */}
                {aiResult?.suggestedMedicines && aiResult.suggestedMedicines.length > 0 && (
                  <div className="p-6 bg-tertiary/[0.03] rounded-xl border border-tertiary/10">
                    <h4 className="font-extrabold text-tertiary text-[10px] uppercase tracking-[0.2em] mb-4">
                      💊 Care Recommendations
                    </h4>
                    <ul className="space-y-3 mb-6">
                      {aiResult.suggestedMedicines.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start text-gray-700 text-sm font-medium">
                          <div className="w-4 h-4 bg-tertiary/10 text-tertiary rounded flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-[10px] font-bold">+</span>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed opacity-80">
                      Disclaimer: These are general insights. Official verification is recommended for clinical use.
                    </p>
                  </div>
                )}
              </div>

              {/* Doctor Review Integration */}
              {aiResult?._id && (
                <div className="pt-8 border-t border-outline-variant">
                  {aiResult.reviewStatus === "reviewed" ? (
                    <div className="bg-tertiary/[0.05] p-6 rounded-xl border border-tertiary/20 flex items-start gap-4">
                      <div className="w-10 h-10 bg-tertiary text-white rounded-xl flex items-center justify-center text-xl shrink-0 shadow-lg shadow-tertiary/20">
                        <FaUserMd />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm mb-1 uppercase tracking-tight">
                          Physician Verified Assessment
                        </h4>
                        <p className="text-gray-700 text-sm font-bold italic leading-relaxed">
                          "{aiResult.doctorNotes}"
                        </p>
                      </div>
                    </div>
                  ) : aiResult.reviewStatus === "pending" ? (
                    <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-gray-900 text-xs uppercase tracking-widest">
                          Verification Pending
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400">
                        Review requested successfully
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <button
                        onClick={onRequestReview}
                        className="group flex items-center gap-3 px-8 py-4 bg-white border border-outline-variant shadow-sm hover:shadow-md text-gray-700 font-extrabold rounded-xl transition-all hover:bg-surface-container-low text-xs uppercase tracking-widest"
                      >
                        <span>Request Physician Review</span>
                        <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform opacity-30" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
