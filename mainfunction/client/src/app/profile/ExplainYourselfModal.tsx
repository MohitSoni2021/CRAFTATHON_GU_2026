import React from 'react';
import { FaStethoscope, FaTimes, FaCheck, FaBolt, FaChevronRight } from 'react-icons/fa';

interface ExplainYourselfModalProps {
  show: boolean;
  step: number;
  onClose: () => void;
  selectedDiseases: string[];
  onDiseaseToggle: (disease: string) => void;
  commonDiseases: string[];
  onStartQuestionnaire: () => void;
  isAnalyzing: boolean;
  questions: any[];
  onAnswerChange: (index: number, answer: string) => void;
  additionalDetails: string;
  setAdditionalDetails: (details: string) => void;
  onSubmitAll: () => void;
  analysisResult: string | null;
}

export default function ExplainYourselfModal({
  show,
  step,
  onClose,
  selectedDiseases,
  onDiseaseToggle,
  commonDiseases,
  onStartQuestionnaire,
  isAnalyzing,
  questions,
  onAnswerChange,
  additionalDetails,
  setAdditionalDetails,
  onSubmitAll,
  analysisResult
}: ExplainYourselfModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>
        
        <div className="p-8 border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-sm">
              <FaStethoscope size={18} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">AI Diagnostic Interview</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Personalized Health Narrative Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-10 overflow-y-auto flex-1 relative">
          {step === 1 && (
            <div className="space-y-10">
              <div className="text-center max-w-md mx-auto">
                <h4 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">Documented Chronic Conditions</h4>
                <p className="text-gray-500 font-medium leading-relaxed">Select all verified conditions to initialize the diagnostic protocol.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {commonDiseases.map(disease => (
                  <button
                    key={disease}
                    onClick={() => onDiseaseToggle(disease)}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center group ${selectedDiseases.includes(disease)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-outline-variant hover:border-primary/20 text-gray-600'
                      }`}
                  >
                    <div className={`mb-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDiseases.includes(disease) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                      {selectedDiseases.includes(disease) ? <FaCheck size={12} /> : <FaBolt size={12} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{disease}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-10">
                <button
                  onClick={onStartQuestionnaire}
                  disabled={selectedDiseases.length === 0 || isAnalyzing}
                  className="bg-gradient-primary text-white px-10 py-5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isAnalyzing ? 'Initializing...' : 'Proceed to Interview'}
                  {!isAnalyzing && <FaChevronRight size={12} className="opacity-50" />}
                </button>
              </div>
            </div>
          )}

          {step === 2 && questions.length > 0 && (
            <div className="space-y-12 pb-10">
              <div className="text-center max-w-md mx-auto">
                <h4 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">Contextual Assessment</h4>
                <p className="text-gray-500 font-medium leading-relaxed">Provide detailed responses for a high-fidelity health narrative.</p>
              </div>

              <div className="space-y-10">
                {questions.map((q, index) => (
                  <div key={index} className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black text-xs shrink-0 border border-primary/10">
                        {index + 1}
                      </div>
                      <h5 className="text-xl font-extrabold text-gray-900 tracking-tight leading-relaxed pt-1">
                        {q.question}
                      </h5>
                    </div>

                    {q.type === 'mcq' && q.options ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                        {q.options.map((option: string, optIdx: number) => (
                          <button
                            key={optIdx}
                            onClick={() => onAnswerChange(index, option)}
                            className={`p-5 text-left rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${q.ans === option
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-outline-variant hover:border-primary/20 text-gray-600'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full border-2 ${q.ans === option ? 'bg-primary border-primary' : 'border-gray-200'}`}></div>
                              {option}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-16">
                        <textarea
                          value={q.ans || ''}
                          onChange={(e) => onAnswerChange(index, e.target.value)}
                          placeholder="Describe in detail..."
                          className="w-full h-40 p-6 bg-surface-container-low border border-outline-variant rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                        ></textarea>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pl-16 space-y-6">
                <h5 className="text-xl font-extrabold text-gray-900 tracking-tight leading-relaxed">
                  Clinical Addendum
                </h5>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Add any other relevant medical context or specific habits..."
                  className="w-full h-40 p-6 bg-surface-container-low border border-outline-variant rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="flex justify-end pt-10 pl-16">
                <button
                  onClick={onSubmitAll}
                  disabled={questions.some(q => !q.ans)}
                  className="bg-gradient-primary text-white px-10 py-5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Finalize Analysis
                  <FaChevronRight size={12} className="opacity-50" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-10 py-10 max-w-xl mx-auto">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl shadow-primary/5 animate-in zoom-in-50 duration-700">
                <FaCheck />
              </div>
              <div>
                <h4 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">Narrative Synopsized</h4>
                <p className="text-gray-500 font-medium leading-relaxed">The AI has generated your clinical story based on the provided parameters.</p>
              </div>

              <div className="p-10 bg-primary/5 rounded-xl border border-primary/10 text-left relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <FaBolt size={60} />
                </div>
                <p className="text-gray-800 text-xl leading-relaxed italic font-medium opacity-90 relative z-10">
                  "{analysisResult}"
                </p>
              </div>

              <button
                onClick={onClose}
                className="bg-gradient-primary text-white px-12 py-5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Return to Profile
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <FaBolt className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
              </div>
              <div className="mt-8 text-center">
                <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                  {step === 1 ? 'Constructing Interview' : 'Synthesizing Narrative'}
                </p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">Running Clinical Models</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
