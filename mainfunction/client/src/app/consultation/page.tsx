"use client";
import "regenerator-runtime/runtime";
import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import PricingModal from "@/components/PricingModal";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchUserProfile } from "@/store/slices/authSlice";

import { AiResult, Language } from "./types";
import ConsultationHeader from "./ConsultationHeader";
import InteractionArea from "./InteractionArea";
import AnalysisResult from "./AnalysisResult";

export default function ConsultationPage() {
  const [isClient, setIsClient] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [language, setLanguage] = useState<Language>("en");
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

  const speakResponse = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "gu-IN";
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const analyzeSymptoms = useCallback(async (text: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.isLimitReached) {
          setLimitMessage(data.message);
          setShowPricingModal(true);
          setAiResult({
            summary: "You have reached your free monthly limit for AI consultations.",
            urgency: "Limit Reached",
            isLimitError: true,
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
          summary: "I'm sorry, I couldn't understand that. Could you please try again?",
        });
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      setAiResult({
        summary: "Sorry, I am having trouble connecting to the brain. Please try again later.",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [token, language, speakResponse, dispatch]);

  const handleStartListening = () => {
    resetTranscript();
    setAiResult(null);
    SpeechRecognition.startListening({
      continuous: true,
      language: language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "gu-IN",
    });
  };

  const handleStopListening = async () => {
    SpeechRecognition.stopListening();
    if (transcript.trim().length > 0) {
      await analyzeSymptoms(transcript);
    }
  };

  const handleRequestReview = async () => {
    if (!aiResult?._id) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${aiResult._id}/request-review`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAiResult({ ...aiResult, reviewStatus: "pending" });
      alert("Review requested! A doctor will look at this shortly.");
    } catch (error) {
      console.error("Review Request Error", error);
    }
  };

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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          message={limitMessage}
        />

        <div className="w-full flex flex-col min-h-[85vh]">
          <ConsultationHeader />

          <div className="flex flex-col items-center justify-center flex-1 relative py-10">
            {/* Immersive Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-tertiary/[0.03] rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

            <InteractionArea
              listening={listening}
              language={language}
              setLanguage={setLanguage}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
            />

            <AnalysisResult
              transcript={transcript}
              aiResult={aiResult}
              analyzing={analyzing}
              onSpeakResponse={speakResponse}
              onRequestReview={handleRequestReview}
              onShowPricing={() => setShowPricingModal(true)}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
