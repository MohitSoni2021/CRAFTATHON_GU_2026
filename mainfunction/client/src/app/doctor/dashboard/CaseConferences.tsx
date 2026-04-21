import React from "react";
import { FaVideo } from "react-icons/fa";
import { Meeting } from "./types";

interface CaseConferencesProps {
  upcomingMeetings: Meeting[];
}

export default function CaseConferences({ upcomingMeetings }: CaseConferencesProps) {
  if (upcomingMeetings.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 shadow-sm">
          <FaVideo size={16} />
        </div>
        Case Conferences
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingMeetings.map((mtg) => (
          <div
            key={mtg._id}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group hover:border-red-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                {mtg.urgency}
              </span>
              {mtg.scheduledAt ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-widest shadow-sm">
                    {new Date(mtg.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                    {new Date(mtg.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  {new Date(mtg.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2 leading-tight relative z-10">
              {mtg.topic}
            </h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 font-medium leading-relaxed relative z-10">
              "{mtg.reason}"
            </p>

            {mtg.summary && (
              <div className="mb-6 bg-[#f8f9fc] p-4 rounded-xl border border-gray-100 relative z-10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> AI Briefing
                </p>
                <p className="text-xs text-gray-600 line-clamp-3 font-medium leading-relaxed">
                  {mtg.summary}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50 relative z-10">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-black border border-gray-200">
                  {mtg.requester?.name?.[0]}
                </div>
                {mtg.requester?.name}
              </div>
              <a
                href={mtg.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
              >
                <FaVideo size={12} /> Join Sync
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
