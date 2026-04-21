import React from "react";

interface AppointmentsHeaderProps {
  totalCount: number;
  scheduledCount: number;
}

export default function AppointmentsHeader({ totalCount, scheduledCount }: AppointmentsHeaderProps) {
  return (
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
          <p className="text-xl font-black text-gray-900">{totalCount}</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 text-center min-w-[100px]">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">
            Scheduled
          </p>
          <p className="text-xl font-black text-primary">{scheduledCount}</p>
        </div>
      </div>
    </header>
  );
}
