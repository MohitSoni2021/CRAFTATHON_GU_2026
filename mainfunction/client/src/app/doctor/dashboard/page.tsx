"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import axios from "axios";

import { Consultation, Meeting, Appointment } from "./types";
import DoctorDashboardHeader from "./DoctorDashboardHeader";
import DoctorSchedule from "./DoctorSchedule";
import PendingReviewsList from "./PendingReviewsList";
import ClinicalReviewDetail from "./ClinicalReviewDetail";
import CaseConferences from "./CaseConferences";
import MeetingRequestModal from "./MeetingRequestModal";

export default function DoctorDashboard() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  
  const [pendingReviews, setPendingReviews] = useState<Consultation[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Clinical Review State
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [doctorNotes, setDoctorNotes] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel fetching for performance
      const [reviewsRes, meetingsRes, appointmentsRes] = await Promise.allSettled([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/consultation/pending-reviews`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/meetings/upcoming`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor-appointments`, { headers }),
      ]);

      if (reviewsRes.status === "fulfilled") setPendingReviews(reviewsRes.value.data.data);
      if (meetingsRes.status === "fulfilled") setUpcomingMeetings(meetingsRes.value.data.data);
      if (appointmentsRes.status === "fulfilled") setAppointments(appointmentsRes.value.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && user.type !== "doctor" && user.type !== "admin") {
      router.push("/dashboard");
    } else {
      fetchDashboardData();
    }
  }, [user, router, fetchDashboardData]);

  const { todayAppointments, tomorrowAppointments } = useMemo(() => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split("T")[0];

    return {
      todayAppointments: appointments.filter((app) => app.date === todayString),
      tomorrowAppointments: appointments.filter((app) => app.date === tomorrowString),
    };
  }, [appointments]);

  const handleOpenReview = useCallback((consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDoctorNotes("");
  }, []);

  const handleSubmitReview = async () => {
    if (!doctorNotes.trim()) {
      alert("Please add your expert notes before verifying.");
      return;
    }
    if (!selectedConsultation) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${selectedConsultation._id}/review`,
        { doctorNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted successfully!");
      setSelectedConsultation(null);
      fetchDashboardData();
    } catch (error) {
      console.error("Error submitting review", error);
      alert("Failed to submit review.");
    }
  };

  if (!user || (user.type !== "doctor" && user.type !== "admin")) return null;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="w-full space-y-8 bg-[#f8f9fc] min-h-screen">
          <DoctorDashboardHeader />

          <DoctorSchedule 
            todayAppointments={todayAppointments} 
            tomorrowAppointments={tomorrowAppointments} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PendingReviewsList 
              pendingReviews={pendingReviews} 
              loading={loading}
              selectedConsultation={selectedConsultation}
              onSelectReview={handleOpenReview}
            />

            <ClinicalReviewDetail 
              selectedConsultation={selectedConsultation}
              onClose={() => setSelectedConsultation(null)}
              doctorNotes={doctorNotes}
              setDoctorNotes={setDoctorNotes}
              onSubmit={handleSubmitReview}
            />
          </div>

          <CaseConferences upcomingMeetings={upcomingMeetings} />

          <MeetingRequestModal token={token} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
