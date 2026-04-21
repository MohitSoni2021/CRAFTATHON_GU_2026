"use client";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMeasurements } from "@/store/slices/measurementsSlice";

// Dashboard Components
import DashboardHeader from "./DashboardHeader";
import DashboardHero from "./DashboardHero";
import VitalsOverview from "./VitalsOverview";
import GlucoseTrend from "./GlucoseTrend";
import RecentActivity from "./RecentActivity";

// Shared/Global Components
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import HealthNewsWidget from "@/components/dashboard/HealthNewsWidget";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { measurements, loading } = useSelector(
    (state: RootState) => state.measurements
  );
  
  // State to track client mounting for hydration mismatch prevention
  const [isClient, setIsClient] = useState(false);

  // Fetch measurements on client mount if user is available
  useEffect(() => {
    setIsClient(true);
    if (user?.id) {
      dispatch(fetchMeasurements(user.id));
    }
  }, [dispatch, user?.id]); // Minimal and accurate dependency array

  // Early return for loading state or SSR mismatch prevention
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
        {/* Header Section: User Info and Date */}
        <DashboardHeader user={user} isNewUser={measurements.length === 0} />

        {/* Hero Section: Quick Actions and Banners */}
        <DashboardHero />

        {/* Vitals Section: Key Metrics Overview */}
        <VitalsOverview measurements={measurements} />

        {/* Main Content Grid: Charts, Activity, & News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Analytics and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <GlucoseTrend measurements={measurements} />
            <UpcomingAppointments />
            <RecentActivity measurements={measurements} />
          </div>

          {/* Right Column: News and Additional Widgets */}
          <div className="space-y-6">
            <HealthNewsWidget />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
