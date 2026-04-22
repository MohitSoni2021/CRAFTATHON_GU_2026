"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { Appointment } from "./types";
import AppointmentsHeader from "./AppointmentsHeader";
import AppointmentsTable from "./AppointmentsTable";
import EmptyAppointments from "./EmptyAppointments";

const DoctorAppointmentsPage = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor-appointments`;

  // Wrap fetch logic in useCallback to keep dependencies stable
  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  // Fetch appointments when token is available
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Memoize counts to avoid redundant processing on re-renders
  const scheduledCount = useMemo(() => {
    return appointments.filter((a) => a.status === "Scheduled").length;
  }, [appointments]);

  return (
    <DashboardLayout>
      <div className="w-full p-2 md:p-2 space-y-8 bg-[#f8f9fc] min-h-screen">
        {/* Extracted Header logic into a modular component */}
        <AppointmentsHeader 
          totalCount={appointments.length} 
          scheduledCount={scheduledCount} 
        />

        {/* Clear and simple conditional rendering logic */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : appointments.length === 0 ? (
          <EmptyAppointments />
        ) : (
          <AppointmentsTable appointments={appointments} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
