import React from "react";
import { FaClipboardList, FaCalendarCheck } from "react-icons/fa";
import { Appointment } from "./types";

interface DoctorScheduleProps {
  todayAppointments: Appointment[];
  tomorrowAppointments: Appointment[];
}

export default function DoctorSchedule({ todayAppointments, tomorrowAppointments }: DoctorScheduleProps) {
  
  const getStatusClasses = (status: string) => {
    if (status === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Cancelled") return "bg-red-50 text-red-700 border-red-200";
    return "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Today's Schedule */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 relative z-10">
          <span className="bg-primary/10 text-primary border border-primary/20 p-2.5 rounded-xl shadow-sm">
            <FaClipboardList size={16} />
          </span>
          Today's Schedule
          <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </h3>
        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Time</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 border border-dashed border-gray-200 bg-gray-50 rounded-xl mt-4 block w-full">
                    No appointments today
                  </td>
                </tr>
              ) : (
                todayAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-4 font-black text-gray-900 group-hover:text-primary transition-colors">{app.time}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {app.userId.profileImage ? (
                          <img src={app.userId.profileImage} alt="" className="w-8 h-8 rounded-xl object-cover border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm border border-gray-200">
                            {app.userId.name?.[0]}
                          </div>
                        )}
                        <div>
                          <span className="font-black text-gray-900 text-sm block">{app.userId.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{app.type} • {app.mode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusClasses(app.status)}`}>
                        {app.status || "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tomorrow's Schedule */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 relative z-10">
          <span className="bg-blue-50 text-blue-600 border border-blue-100 p-2.5 rounded-xl shadow-sm">
            <FaCalendarCheck size={16} />
          </span>
          Tomorrow's Schedule
          <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </h3>
        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Time</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {tomorrowAppointments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 border border-dashed border-gray-200 bg-gray-50 rounded-xl mt-4 block w-full">
                    No appointments tomorrow
                  </td>
                </tr>
              ) : (
                tomorrowAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-4 font-black text-gray-900 group-hover:text-blue-600 transition-colors">{app.time}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {app.userId.profileImage ? (
                          <img src={app.userId.profileImage} alt="" className="w-8 h-8 rounded-xl object-cover border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm border border-gray-200">
                            {app.userId.name?.[0]}
                          </div>
                        )}
                        <div>
                          <span className="font-black text-gray-900 text-sm block">{app.userId.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{app.type} • {app.mode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : app.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {app.status || "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
