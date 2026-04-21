"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserMd, FaEnvelope, FaCalendarCheck } from "react-icons/fa";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorsSkeleton from "@/components/dashboard/DoctorsSkeleton";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  profile?: {
    gender?: string;
    specialization?: string;
  };
  availability?: {
    days: string[];
    workingHours: { start: string; end: string };
  };
}

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/doctors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctors(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DoctorsSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface p-4">
        <div className="text-primary text-xl font-extrabold mb-2 uppercase tracking-widest">
          Error
        </div>
        <p className="text-tertiary/70 font-medium mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary !rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <header className="mb-8">
          <div className="flex flex-col gap-1">
            <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80">
              Care Network • Medical Professionals
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
              Find a <span className="text-primary">Doctor</span>
            </h1>
            <p className="text-tertiary/70 text-sm font-medium">
              Connect with our experienced medical professionals curated for
              your health needs.
            </p>
          </div>
        </header>

        {doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-ambient border border-gray-100">
            <FaUserMd className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-[#2c3436]">
              No Doctors Found
            </h3>
            <p className="text-tertiary/60 mt-2 font-medium">
              There are currently no doctors registered in our clinical network.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-ambient transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col"
              >
                <div className="aspect-video bg-surface-container-low relative flex items-center justify-center overflow-hidden">
                  {doctor.profileImage ? (
                    <img
                      src={doctor.profileImage}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                      <FaUserMd className="text-7xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-[#2c3436] group-hover:text-primary transition-colors truncate">
                      {doctor.name}
                    </h3>
                    <p className="text-[11px] text-primary font-black uppercase tracking-widest mt-1">
                      {doctor.profile?.specialization || "General Practitioner"}
                    </p>
                  </div>

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center text-tertiary/70 text-xs font-bold uppercase tracking-wider">
                      <FaEnvelope className="mr-3 text-primary/40" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    {doctor.availability?.days &&
                      doctor.availability.days.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start text-tertiary/70 text-xs font-bold uppercase tracking-wider">
                            <FaCalendarCheck className="mr-3 text-primary/40 mt-0.5" />
                            <span>
                              {doctor.availability.days.slice(0, 3).join(", ")}
                              {doctor.availability.days.length > 3 ? "..." : ""}
                            </span>
                          </div>
                          {doctor.availability?.workingHours && (
                            <div className="pl-7 text-[10px] text-tertiary/50 font-black uppercase tracking-widest">
                              {doctor.availability.workingHours.start} -{" "}
                              {doctor.availability.workingHours.end}
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  <Link
                    href={`/doctors/${doctor._id}`}
                    className="flex items-center justify-center w-full px-6 py-4 bg-gradient-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/20"
                  >
                    <FaCalendarCheck className="mr-2" />
                    Details & Booking
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorsPage;
