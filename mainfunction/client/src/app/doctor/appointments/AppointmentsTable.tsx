import React from "react";
import { FaUser, FaCalendarAlt, FaClock, FaVideo, FaMapMarkerAlt } from "react-icons/fa";
import { Appointment } from "./types";
import { getStatusColor, getStatusIcon } from "./utils";

interface AppointmentsTableProps {
  appointments: Appointment[];
}

export default function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Patient Profile
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Time slot
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Consultation Mode
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-1/4">
                Clinical Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map((app) => (
              <tr
                key={app._id}
                className="hover:bg-[#f8f9fc] transition-colors group"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                      {app.userId?.profileImage ? (
                        <img
                          className="h-full w-full object-cover"
                          src={app.userId.profileImage}
                          alt=""
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center text-gray-400">
                          <FaUser size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">
                        {app.userId?.name || "Unknown Patient"}
                      </div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">
                        {app.userId?.email || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FaCalendarAlt className="text-primary/70" size={12} />
                      {new Date(app.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                      <FaClock className="text-gray-400" size={12} />
                      {app.time}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide ${
                      app.mode === "Online"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "bg-orange-50 text-orange-700 border border-orange-100"
                    }`}
                  >
                    {app.mode === "Online" ? (
                      <FaVideo size={10} />
                    ) : (
                      <FaMapMarkerAlt size={10} />
                    )}
                    {app.mode}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {getStatusIcon(app.status)}
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p
                    className="text-sm font-medium text-gray-600 truncate max-w-xs"
                    title={app.notes}
                  >
                    {app.notes || (
                      <span className="text-gray-300 italic">
                        No notes provided
                      </span>
                    )}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
