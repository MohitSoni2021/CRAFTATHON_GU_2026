import React from "react";
import { FaStethoscope, FaTimes, FaCheck, FaClipboardList } from "react-icons/fa";
import { Consultation } from "./types";

interface ClinicalReviewDetailProps {
  selectedConsultation: Consultation | null;
  onClose: () => void;
  doctorNotes: string;
  setDoctorNotes: (notes: string) => void;
  onSubmit: () => void;
}

export default function ClinicalReviewDetail({
  selectedConsultation,
  onClose,
  doctorNotes,
  setDoctorNotes,
  onSubmit,
}: ClinicalReviewDetailProps) {
  if (!selectedConsultation) {
    return (
      <div className="lg:col-span-2">
        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm min-h-[500px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6 text-gray-300 border border-gray-100 shadow-inner">
            <FaClipboardList />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
            Clinical Desk Ready
          </h3>
          <p className="max-w-xs mx-auto text-sm text-gray-500 font-medium leading-relaxed">
            Select a pending consultation from the queue to provide your expert verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-right-4">
        <div className="p-6 border-b border-primary/20 bg-primary text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 pattern-dots pointer-events-none" />
          <h2 className="text-xl font-black flex items-center gap-3 relative z-10 tracking-tight">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <FaStethoscope size={18} />
            </div>
            Clinical Review
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative z-10"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Patient Symptoms */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Patient Context
            </h3>
            <div className="bg-[#f8f9fc] p-5 rounded-xl text-gray-700 italic border border-gray-100 font-medium leading-relaxed relative">
              <div className="absolute top-2 left-2 text-4xl text-gray-200 font-serif leading-none">"</div>
              <span className="relative z-10 ml-4">{selectedConsultation.symptoms}</span>
            </div>
          </div>

          {/* AI Analysis */}
          <div>
            <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> AI Sentinel Analysis
            </h3>
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
              <p className="text-gray-900 font-medium leading-relaxed mb-6 bg-white p-4 rounded-xl border border-primary/10 shadow-sm">
                {selectedConsultation.aiSummary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm">
                  <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest mb-3 pb-2 border-b border-gray-50">
                    Suggested Protocol
                  </h4>
                  <ul className="space-y-2">
                    {selectedConsultation.actions?.map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></div>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm">
                  <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest mb-3 pb-2 border-b border-gray-50">
                    OTC Therapeutics
                  </h4>
                  <ul className="space-y-2">
                    {selectedConsultation.suggestedMedicines?.map((m: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></div>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-8"></div>

          {/* Doctor Feedback Form */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Expert Verification
            </h3>
            <textarea
              className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-gray-900 font-medium resize-none bg-white"
              placeholder="Write your professional opinion here. Validate the AI advice to suggest corrections..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
              >
                Discard
              </button>
              <button
                onClick={onSubmit}
                className="px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-gray-900 text-white hover:bg-primary shadow-xl shadow-gray-200 hover:shadow-primary/20 transition-all flex items-center gap-2"
              >
                <FaCheck size={12} /> Verify & Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
