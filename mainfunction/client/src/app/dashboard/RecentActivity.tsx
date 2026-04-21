import React from "react";
import Link from "next/link";
import { FaCalendarCheck } from "react-icons/fa";

interface Measurement {
  date: string | Date;
  readings: any[];
}

interface RecentActivityProps {
  measurements: Measurement[];
}

export default function RecentActivity({ measurements }: RecentActivityProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2c3436]">Recent Activity</h3>
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
  );
}
