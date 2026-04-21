"use client";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaUserMd,
  FaFlask,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaChevronRight,
} from "react-icons/fa";
import axios from "axios";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface Appointment {
  _id: string;
  providerName: string;
  type: "Doctor" | "Lab";
  date: string;
  time: string;
  notes: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

const UpcomingAppointments = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;
      try {
        const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/appointments`;
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const appointments: Appointment[] = response.data.data;
          const now = new Date();
          const upcoming = appointments
            .filter((app) => app.status === "Scheduled")
            .filter((app) => {
              const appDate = new Date(app.date);
              appDate.setHours(23, 59, 59, 999);
              return appDate >= now;
            })
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

          if (upcoming.length > 0) {
            setNextAppointment(upcoming[0]);
          } else {
            setNextAppointment(null);
          }
        }
      } catch (err) {
        console.error("Error fetching appointments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient">
        <div className="h-6 bg-surface-container-low rounded-xl w-1/2 mb-8"></div>
        <div className="h-24 bg-surface-container-low rounded-lg w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient relative overflow-hidden group">
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-[#2c3436] font-jakarta flex items-center gap-3">
            Upcoming Session
          </h3>
          <p className="text-[11px] text-[#635888]/60 font-black uppercase tracking-[0.2em] mt-1">
            Care Schedule
          </p>
        </div>
        <Link
          href="/appointments"
          className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
        >
          Manage All
        </Link>
      </div>

      {nextAppointment ? (
        <div className="relative z-10">
          <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/10 transition-all duration-500">
            <div className="flex items-center space-x-6">
              <div
                className={`p-4 rounded-xl shadow-sm ${nextAppointment.type === "Doctor" ? "bg-white text-primary" : "bg-white text-tertiary"}`}
              >
                {nextAppointment.type === "Doctor" ? (
                  <FaUserMd className="text-2xl" />
                ) : (
                  <FaFlask className="text-2xl" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-[#2c3436] text-lg leading-tight">
                  {nextAppointment.providerName}
                </h4>
                <div className="flex items-center text-xs text-[#635888]/70 font-bold mt-2 space-x-4 uppercase tracking-wider">
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-primary/40" />{" "}
                    {new Date(nextAppointment.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <FaClock className="mr-2 text-primary/40" />{" "}
                    {nextAppointment.time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm transition-transform cursor-pointer">
                <FaVideo />
              </div>
              <FaChevronRight className="text-primary/20 transition-transform" />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-surface-container-low rounded-lg relative z-10">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-6 text-[#635888]/20 shadow-sm">
            <FaCalendarAlt className="text-2xl" />
          </div>
          <p className="text-[#635888]/60 font-bold text-sm">
            No clinical sessions scheduled.
          </p>
          <Link
            href="/appointments"
            className="text-primary text-[10px] font-black mt-4 inline-block hover:underline uppercase tracking-widest"
          >
            Book Appointment
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;
