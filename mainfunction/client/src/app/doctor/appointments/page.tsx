"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaVideo,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface Patient {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Appointment {
  _id: string;
  userId: Patient;
  date: string;
  time: string;
  mode: "Online" | "Offline";
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

const DoctorAppointmentsPage = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor-appointments`;

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const fetchAppointments = async () => {
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "text-primary bg-primary/10 border border-primary/20";
      case "Completed":
        return "text-emerald-700 bg-emerald-50 border border-emerald-200";
      case "Cancelled":
        return "text-red-700 bg-red-50 border border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <FaHourglassHalf />;
      case "Completed":
        return <FaCheckCircle />;
      case "Cancelled":
        return <FaTimesCircle />;
      default:
        return <FaHourglassHalf />;
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full p-2 md:p-2 space-y-8 bg-[#f8f9fc] min-h-screen">
        <header className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Patient Engagements
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1">
              Reviewing your upcoming clinical consultations and schedule.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100 text-center min-w-[100px]">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Total
              </p>
              <p className="text-xl font-black text-gray-900">
                {appointments.length}
              </p>
            </div>
            <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 text-center min-w-[100px]">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">
                Scheduled
              </p>
              <p className="text-xl font-black text-primary">
                {appointments.filter((a) => a.status === "Scheduled").length}
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FaCalendarAlt className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              No Appointments Yet
            </h3>
            <p className="text-gray-500 font-medium">
              Your clinical schedule is currently empty.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Patient Profile
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Time slot
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Consultation Mode
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-1/4">
                      Clinical Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-[#f8f9fc] transition-colors group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            {app.userId?.profileImage ? (
                              <img
                                className="h-full w-full object-cover"
                                src={app.userId.profileImage}
                                alt=""
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center text-gray-400">
                                <FaUser size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">
                              {app.userId?.name || "Unknown Patient"}
                            </div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">
                              {app.userId?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <FaCalendarAlt
                              className="text-primary/70"
                              size={12}
                            />
                            {new Date(app.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                            <FaClock className="text-gray-400" size={12} />
                            {app.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide ${
                            app.mode === "Online"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : "bg-orange-50 text-orange-700 border border-orange-100"
                          }`}
                        >
                          {app.mode === "Online" ? (
                            <FaVideo size={10} />
                          ) : (
                            <FaMapMarkerAlt size={10} />
                          )}
                          {app.mode}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${getStatusColor(app.status)}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p
                          className="text-sm font-medium text-gray-600 truncate max-w-xs"
                          title={app.notes}
                        >
                          {app.notes || (
                            <span className="text-gray-300 italic">
                              No notes provided
                            </span>
                          )}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
