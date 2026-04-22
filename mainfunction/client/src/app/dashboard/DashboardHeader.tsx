import React, { useMemo } from "react";
import OnboardingTour from "@/components/OnboardingTour";
import { User } from "@/store/slices/authSlice"; // assuming this is the type, if not we'll use any or appropriate type. Let's not assume type if not sure.

interface DashboardHeaderProps {
  user: any;
  isNewUser: boolean;
}

export default function DashboardHeader({ user, isNewUser }: DashboardHeaderProps) {
  // Memoize greeting to prevent recalculation on every render unless hour changes (practically stable per session)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Format current date
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <OnboardingTour isNewUser={isNewUser} userId={user?.id || ""} />
      <div>
        <p className="text-[#635888] text-[11px] font-bold uppercase tracking-[0.1em] mb-2 opacity-80">
          Empathetic Curator • Overview
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
          {greeting},{" "}
          <span className="text-primary">{user?.name?.split(" ")[0] || "User"}</span>
        </h1>
      </div>
      <div className="bg-surface-container-low px-6 py-3 rounded-xl text-sm font-bold text-[#635888]/70 flex items-center gap-2 self-start md:self-auto">
        <span className="w-1.5 h-1.5 rounded-lg bg-primary"></span>
        {currentDate}
      </div>
    </header>
  );
}
