import React, { useMemo } from "react";
import HealthTrendChart from "@/components/dashboard/HealthTrendChart";

interface Reading {
  type: string;
  value: string | number | { systolic: number; diastolic: number };
}

interface Measurement {
  date: string | Date;
  readings: Reading[];
}

interface GlucoseTrendProps {
  measurements: Measurement[];
}

export default function GlucoseTrend({ measurements }: GlucoseTrendProps) {
  // Memoize glucose data processing to optimize re-renders
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

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
      <HealthTrendChart
        title="Glucose Trends History"
        data={glucoseData}
        dataKey="value"
        color="#006977"
      />
    </div>
  );
}
