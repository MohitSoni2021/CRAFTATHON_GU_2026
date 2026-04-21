"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { FaUser, FaShareAlt } from "react-icons/fa";

import { SharedData } from "./types";
import SharedProfileHeader from "./SharedProfileHeader";
import HealthStory from "./HealthStory";
import SharedClinicalRecords from "./SharedClinicalRecords";
import SharedMeasurements from "./SharedMeasurements";

export default function SharedProfile() {
  const params = useParams();
  const userId = params?.userid as string;

  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (data && data.measurements && data.measurements.length > 0) {
      const types = Object.keys(
        data.measurements.reduce((acc: any, m) => {
          m.readings.forEach((r) => (acc[r.type] = true));
          return acc;
        }, {})
      );
      if (types.length > 0) {
        setActiveTab(types[0]);
      }
    }
  }, [data]);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/share/${userId}`);
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching shared profile", err);
      setError("Profile not found or server error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            Loading Profile Matrix...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto text-red-500 mb-6 border border-red-100">
            <FaUser className="text-2xl" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-sm font-medium text-gray-500">
            {error || "The requested clinical profile does not exist or access has been revoked."}
          </p>
        </div>
      </div>
    );
  }

  const { user, labReports, doctorReports, measurements } = data;

  return (
    <div className="min-h-screen bg-[#f8f9fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start opacity-70">
          <FaShareAlt className="text-gray-400" size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Publicly Shared Clinical Record
          </span>
        </div>

        <SharedProfileHeader user={user} />

        <HealthStory storyDesc={user?.profile?.storyDesc} />

        <SharedClinicalRecords labReports={labReports} doctorReports={doctorReports} />

        <SharedMeasurements
          measurements={measurements}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}
