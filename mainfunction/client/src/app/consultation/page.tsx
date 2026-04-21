"use client";
import "regenerator-runtime/runtime";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import PricingModal from "@/components/PricingModal";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  FaMicrophone,
  FaStop,
  FaRobot,
  FaVolumeUp,
  FaLanguage,
  FaFileUpload,
  FaChevronRight,
  FaHeartbeat,
  FaWaveSquare,
  FaPlus,
} from "react-icons/fa";
import { fetchUserProfile } from "@/store/slices/authSlice";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function ConsultationPage() {
  const [isClient, setIsClient] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [language, setLanguage] = useState<"en" | "hi" | "gu">("en");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  // Speech Recognition Hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-red-500">
            Your browser does not support speech recognition.
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  const handleStartListening = () => {
    resetTranscript();
    setAiResult(null);
    SpeechRecognition.startListening({
      continuous: true,
      language:
        language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "gu-IN",
    });
  };

  const handleStopListening = async () => {
    SpeechRecognition.stopListening();
    if (transcript.trim().length > 0) {
      await analyzeSymptoms(transcript);
    }
  };

  const analyzeSymptoms = async (text: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, language }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.isLimitReached) {
          setLimitMessage(data.message);
          setShowPricingModal(true);
          setAiResult({
            summary:
              "You have reached your free monthly limit for AI consultations.",
            urgency: "Limit Reached",
            isLimitError: true, // Custom flag for UI
            upgradeUrl: "/pricing",
          });
          return;
        }
        throw new Error(data.message || "Analysis failed");
      }

      if (data.summary) {
        setAiResult(data);
        speakResponse(data.summary);
        // Refresh user profile to update usage stats in Sidebar
        dispatch(fetchUserProfile());
      } else {
        setAiResult({
          summary:
            "I'm sorry, I couldn't understand that. Could you please try again?",
        });
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      setAiResult({
        summary:
          "Sorry, I am having trouble connecting to the brain. Please try again later.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const speakResponse = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "gu-IN";
    window.speechSynthesis.speak(utterance);
  };

  const handleRequestReview = async () => {
    if (!aiResult?._id) return; // Should have ID from backend
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${aiResult._id}/request-review`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAiResult({ ...aiResult, reviewStatus: "pending" });
      alert("Review requested! A doctor will look at this shortly.");
    } catch (error) {
      console.error("Review Request Error", error);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          message={limitMessage}
        />

        <div className="w-full flex flex-col min-h-[85vh]">
          {/* Upper Header Section */}
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                AI Consultation
              </h1>
              <p className="text-gray-500 mt-2 font-medium">
                Describe your symptoms via voice for an immediate health
                assessment.
              </p>
            </div>
            <Link
              href="/consultation/history"
              className="btn-primary !rounded-xl gap-2 bg-white text-primary border border-outline-variant hover:!bg-surface-container-low shadow-sm"
            >
              <FaWaveSquare size={14} className="opacity-50" />
              <span>View History</span>
            </Link>
          </header>

          <div className="flex flex-col items-center justify-center flex-1 relative py-10">
            {/* Immersive Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-tertiary/[0.03] rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

            <div className="w-full z-10 flex flex-col items-center">
              {/* Status Chip */}
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-xl text-primary text-[10px] font-bold mb-10 border border-outline-variant shadow-sm uppercase tracking-[0.2em]">
                <FaRobot /> <span>Advanced Neural Diagnostic Engine</span>
              </div>

              {/* Main Title */}
              <div className="text-center mb-16">
                <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                  How are you{" "}
                  <span className="text-primary bg-clip-text">feeling?</span>
                </h2>
                <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed font-medium opacity-80">
                  Our AI listens to your symptoms in real-time to provide
                  clinical-grade insights.
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
                  onClick={
                    listening ? handleStopListening : handleStartListening
                  }
                  className={`relative z-20 w-32 h-32 rounded-xl flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] ${
                    listening
                      ? "bg-rose-500 text-white shadow-rose-200"
                      : "bg-gradient-primary text-white shadow-primary/30"
                  }`}
                >
                  {listening ? (
                    <FaStop className="text-4xl" />
                  ) : (
                    <FaMicrophone />
                  )}
                </button>

                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-64 text-center">
                  <p
                    className={`font-extrabold uppercase tracking-[0.3em] text-[10px] transition-colors duration-300 ${listening ? "text-rose-500 animate-pulse" : "text-gray-400"}`}
                  >
                    {listening ? "Recording Audio..." : "Click to begin"}
                  </p>
                </div>
              </div>

              {/* Language & Settings */}
              <div className="flex items-center space-x-4 mb-16 p-1.5 bg-surface-container-low rounded-xl border border-outline-variant shadow-sm">
                {["en", "hi", "gu"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang as any)}
                    className={`px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                      language === lang
                        ? "bg-white text-primary shadow-sm border border-outline-variant"
                        : "text-gray-500 hover:text-primary hover:bg-white/50"
                    }`}
                  >
                    {lang === "en"
                      ? "English"
                      : lang === "hi"
                        ? "Hindi"
                        : "Gujarati"}
                  </button>
                ))}
              </div>

              {/* Results Area */}
              {(transcript || aiResult || analyzing) && (
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
                                  You've exhausted your free consultations for
                                  this period. Upgrade to continue your care
                                  journey.
                                </p>
                                <button
                                  onClick={() => setShowPricingModal(true)}
                                  className="btn-primary !rounded-xl px-6 py-3 text-xs w-full sm:w-auto"
                                >
                                  View Pro Plans
                                </button>
                              </div>
                            )}

                            {aiResult?.summary && !aiResult?.isLimitError && (
                              <div className="mt-8 flex items-center space-x-4 relative z-10">
                                <button
                                  onClick={() =>
                                    speakResponse(aiResult.summary)
                                  }
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
                            {aiResult?.lifestyleAdvice &&
                              aiResult.lifestyleAdvice.length > 0 && (
                                <div className="p-6 bg-primary/[0.03] rounded-xl border border-primary/10">
                                  <h4 className="font-extrabold text-primary text-[10px] uppercase tracking-[0.2em] mb-4">
                                    🌱 Lifestyle Protocol
                                  </h4>
                                  <ul className="space-y-3">
                                    {aiResult.lifestyleAdvice.map(
                                      (item: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex items-start text-gray-700 text-sm font-medium"
                                        >
                                          <FaChevronRight
                                            size={10}
                                            className="mr-3 mt-1 text-primary opacity-40 shrink-0"
                                          />
                                          {item}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Suggested Medicines */}
                            {aiResult?.suggestedMedicines &&
                              aiResult.suggestedMedicines.length > 0 && (
                                <div className="p-6 bg-tertiary/[0.03] rounded-xl border border-tertiary/10">
                                  <h4 className="font-extrabold text-tertiary text-[10px] uppercase tracking-[0.2em] mb-4">
                                    💊 Care Recommendations
                                  </h4>
                                  <ul className="space-y-3 mb-6">
                                    {aiResult.suggestedMedicines.map(
                                      (item: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex items-start text-gray-700 text-sm font-medium"
                                        >
                                          <div className="w-4 h-4 bg-tertiary/10 text-tertiary rounded flex items-center justify-center mr-3 mt-0.5 shrink-0">
                                            <span className="text-[10px] font-bold">
                                              +
                                            </span>
                                          </div>
                                          {item}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                  <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed opacity-80">
                                    Disclaimer: These are general insights.
                                    Official verification is recommended for
                                    clinical use.
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
                                    onClick={handleRequestReview}
                                    className="group flex items-center gap-3 px-8 py-4 bg-white border border-outline-variant shadow-sm hover:shadow-md text-gray-700 font-extrabold rounded-xl transition-all hover:bg-surface-container-low text-xs uppercase tracking-widest"
                                  >
                                    <span>Request Physician Review</span>
                                    <FaChevronRight
                                      size={10}
                                      className="group-hover:translate-x-1 transition-transform opacity-30"
                                    />
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
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
