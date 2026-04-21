"use client";
import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMeasurements } from "@/store/slices/measurementsSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaHeartbeat,
  FaTint,
  FaWeight,
  FaCalendarCheck,
  FaMicrophone,
  FaFileMedical,
  FaRobot,
  FaArrowRight,
} from "react-icons/fa";

// Components
import VitalsCard from "@/components/dashboard/VitalsCard";
import HealthTrendChart from "@/components/dashboard/HealthTrendChart";
import HealthNewsWidget from "@/components/dashboard/HealthNewsWidget";
import OnboardingTour from "@/components/OnboardingTour";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { measurements, loading } = useSelector(
    (state: RootState) => state.measurements,
  );
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (user?.id) {
      dispatch(fetchMeasurements(user.id));
    }
  }, [dispatch, user, router]);

  const latestGlucose = useMemo(
    () =>
      measurements
        .flatMap((m) => m.readings)
        .filter((r) => r.type === "glucose")
        .pop(),
    [measurements],
  );

  const latestBP = useMemo(
    () =>
      measurements
        .flatMap((m) => m.readings)
        .filter((r) => r.type === "bloodPressure")
        .pop(),
    [measurements],
  );

  const weightValue = "72";

  const glucoseData = useMemo(() => {
    const data = measurements
      .filter((m) => m.readings.some((r) => r.type === "glucose"))
      .map((m) => {
        const reading = m.readings.find((r) => r.type === "glucose");
        return {
          date: m.date,
          value: reading ? Number(reading.value) : 0,
        };
      })
      .slice(0, 7);
    return [...data].reverse();
  }, [measurements]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!isClient || (loading && measurements.length === 0)) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardSkeleton />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <OnboardingTour
            isNewUser={measurements.length === 0}
            userId={user?.id || ""}
          />
          <div>
            <p className="text-[#635888] text-[11px] font-bold uppercase tracking-[0.1em] mb-2 opacity-80">
              Empathetic Curator • Overview
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
              {getGreeting()},{" "}
              <span className="text-primary">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </h1>
          </div>
          <div className="bg-surface-container-low px-6 py-3 rounded-xl text-sm font-bold text-[#635888]/70 flex items-center gap-2 self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-lg bg-primary"></span>
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Hero / Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div
            id="onboarding-ai-assistant"
            className="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-primary shadow-ambient group"
          >
            {/* Glassmorphism accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-lg blur-3xl transition-transform duration-1000"></div>

            <div className="relative z-10 p-8 flex flex-col items-start h-full justify-between">
              <div>
                <div className="flex items-center space-x-3 text-on-primary/70 text-[11px] font-bold mb-6 tracking-widest uppercase">
                  <FaRobot className="text-lg" />{" "}
                  <span>Clinical AI Assistant</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight max-w-md">
                  Describe your symptoms naturally. <br /> Let our AI curate
                  your care.
                </h2>
                <p className="text-on-primary/60 text-sm max-w-lg mt-2 leading-relaxed">
                  Immediate insights derived from your medical history and
                  real-time clinical data.
                </p>
              </div>
              <Link
                href="/consultation"
                className="mt-8 bg-white text-primary px-10 py-4 rounded-lg font-bold text-sm shadow-xl flex items-center space-x-3"
              >
                <FaMicrophone /> <span>Start Voice Session</span>
              </Link>
            </div>
          </div>

          <Link
            id="onboarding-lab-reports"
            href="/lab-reports"
            className="group relative overflow-hidden rounded-xl bg-surface-container-low p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all duration-500"
          >
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="p-5 bg-white text-primary rounded-lg shadow-sm transition-transform duration-500">
                <FaFileMedical className="text-3xl" />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-[#2c3436] mb-2">
                Lab Reports
              </h3>
              <p className="text-[#635888]/70 text-xs leading-relaxed mb-8 font-medium">
                High-fidelity analysis of your clinical results.
              </p>
              <div className="text-primary font-bold text-sm flex items-center transition-transform">
                Upload and Curate <FaArrowRight className="ml-3" />
              </div>
            </div>
          </Link>
        </div>

        {/* Vitals Cards */}
        <div
          id="onboarding-vitals"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <VitalsCard
            title="Glucose"
            value={latestGlucose ? String(latestGlucose.value) : "--"}
            unit={latestGlucose?.unit || "mg/dL"}
            icon={FaTint}
            colorClass="text-primary bg-primary/5"
            trend="stable"
            trendValue="Normal"
          />
          <VitalsCard
            title="Blood Pressure"
            value={
              latestBP && typeof latestBP.value === "object"
                ? `${latestBP.value.systolic}/${latestBP.value.diastolic}`
                : "--"
            }
            unit="mmHg"
            icon={FaHeartbeat}
            colorClass="text-[#a83836] bg-[#a83836]/5"
            trend="down"
            trendValue="-2%"
          />
          <VitalsCard
            title="Weight"
            value={weightValue}
            unit="kg"
            icon={FaWeight}
            colorClass="text-tertiary bg-tertiary/5"
            trend="up"
            trendValue="+0.5kg"
          />
        </div>

        {/* Main Content Grid: Charts & News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Charts & Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
              <HealthTrendChart
                title="Glucose Trends History"
                data={glucoseData}
                dataKey="value"
                color="#006977"
              />
            </div>

            <UpcomingAppointments />

            {/* Recent Activity List */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#2c3436]">
                    Recent Activity
                  </h3>
                  <p className="text-[11px] text-[#635888]/60 font-bold uppercase tracking-widest mt-1">
                    Audit Trail
                  </p>
                </div>
                <Link
                  href="/measurements"
                  className="text-primary font-bold hover:underline text-sm uppercase tracking-widest"
                >
                  View All
                </Link>
              </div>

              {measurements.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-lg">
                  <p className="text-[#635888]/50 font-bold text-sm">
                    No recent clinical activity.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {measurements.slice(0, 3).map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-6 hover:bg-surface-container-low rounded-lg transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-surface-container-low text-primary rounded-xl flex items-center justify-center mr-6 transition-transform">
                          <FaCalendarCheck className="text-xl" />
                        </div>
                        <div>
                          <p className="font-bold text-[#2c3436] text-sm">
                            Clinical Check-in
                          </p>
                          <p className="text-xs text-[#635888]/60 font-bold mt-1 uppercase">
                            {new Date(m.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-4 py-2 bg-surface-container-high text-[#2c3436] rounded-lg tracking-widest uppercase">
                        {m.readings.length} Vitals Recorded
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: News & Status */}
          <div className="space-y-6">
            <HealthNewsWidget />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
