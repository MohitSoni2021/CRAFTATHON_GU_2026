import React, { useMemo } from "react";
import VitalsCard from "@/components/dashboard/VitalsCard";
import { FaHeartbeat, FaTint, FaWeight } from "react-icons/fa";

interface Reading {
  type: string;
  value: string | number | { systolic: number; diastolic: number };
  unit?: string;
}

interface Measurement {
  readings: Reading[];
}

interface VitalsOverviewProps {
  measurements: Measurement[];
}

export default function VitalsOverview({ measurements }: VitalsOverviewProps) {
  // Memoize latest glucose reading
  const latestGlucose = useMemo(
    () =>
      measurements
        .flatMap((m) => m.readings)
        .filter((r) => r.type === "glucose")
        .pop(),
    [measurements]
  );

  // Memoize latest blood pressure reading
  const latestBP = useMemo(
    () =>
      measurements
        .flatMap((m) => m.readings)
        .filter((r) => r.type === "bloodPressure")
        .pop(),
    [measurements]
  );

  // Hardcoded for now as per original logic; ideally derived from data if available
  const weightValue = "72";

  return (
    <div id="onboarding-vitals" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
  );
}
