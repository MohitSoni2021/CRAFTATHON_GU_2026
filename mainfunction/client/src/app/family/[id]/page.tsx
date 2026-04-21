"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

import { MemberHealthData } from "./types";
import MemberHeader from "./MemberHeader";
import LogVitalModal from "./LogVitalModal";
import AiSentinelAnalysis from "./AiSentinelAnalysis";
import HealthTrendsChart from "./HealthTrendsChart";
import ClinicalRecords from "./ClinicalRecords";

export default function MemberHealthPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<MemberHealthData>({
    prescriptions: [],
    labReports: [],
    doctorReports: [],
    analysis: null,
    healthTrends: { bp: [], weight: [], glucose: [] },
  });
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchHealthData = useCallback(async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/family/member/${id}/health`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching health data", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  const generateAnalysis = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/family/member/${id}/analyze`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setData((prev) => ({ ...prev, analysis: res.data.analysis }));
      }
    } catch (error) {
      console.error("AI Analysis failed", error);
      alert("Failed to analyze health data.");
    } finally {
      setAnalyzing(false);
    }
  };

  const speakSummary = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1920px] mx-auto space-y-8 bg-[#f8f9fc] min-h-screen">
        <MemberHeader
          onBack={() => router.back()}
          onLogVital={() => setShowAddModal(true)}
        />

        {showAddModal && (
          <LogVitalModal
            memberId={id}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchHealthData();
            }}
          />
        )}

        <AiSentinelAnalysis
          analysis={data.analysis}
          analyzing={analyzing}
          onGenerate={generateAnalysis}
        />

        <HealthTrendsChart trends={data.healthTrends} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <ClinicalRecords
            doctorReports={data.doctorReports}
            prescriptions={data.prescriptions}
            labReports={data.labReports}
            onSpeak={speakSummary}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
