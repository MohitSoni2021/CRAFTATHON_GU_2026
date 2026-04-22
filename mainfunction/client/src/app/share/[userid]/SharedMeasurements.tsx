import React from "react";
import { FaHeartbeat, FaTint, FaWeight } from "react-icons/fa";
import { SharedMeasurement } from "./types";

interface SharedMeasurementsProps {
  measurements: SharedMeasurement[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SharedMeasurements({
  measurements,
  activeTab,
  setActiveTab,
}: SharedMeasurementsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
        <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 shadow-sm">
          <FaHeartbeat />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Biometric Tracking</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Recent Measurements
          </p>
        </div>
      </div>

      {measurements && measurements.length > 0 ? (
        <div>
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
            {Object.keys(
              measurements.reduce((acc: any, m) => {
                m.readings.forEach((r) => (acc[r.type] = true));
                return acc;
              }, {})
            ).map((type: string) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border ${
                  activeTab === type
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {type === "glucose" && (
                  <FaTint size={12} className={activeTab === type ? "text-white" : "text-red-400"} />
                )}
                {type === "weight" && (
                  <FaWeight size={12} className={activeTab === type ? "text-white" : "text-blue-400"} />
                )}
                {type === "bloodPressure" && (
                  <FaHeartbeat
                    size={12}
                    className={activeTab === type ? "text-white" : "text-red-500"}
                  />
                )}
                {type.replace(/([A-Z])/g, " $1").trim()}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            {Object.entries(
              measurements.reduce((acc: any, m) => {
                m.readings.forEach((r) => {
                  if (!acc[r.type]) acc[r.type] = [];
                  acc[r.type].push({ date: m.date, ...r });
                });
                return acc;
              }, {})
            )
              .filter(([type]) => activeTab === type)
              .map(([type, readings]: [string, any]) => (
                <div key={type} className="p-0">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Date Recorded
                          </th>
                          <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Value Matrix
                          </th>
                          <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Unit Metric
                          </th>
                          <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Clinical Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {readings.map((r: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#f8f9fc] transition-colors group">
                            <td className="py-4 px-6">
                              <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                {new Date(r.date).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm font-black text-gray-900">
                                {typeof r.value === "object"
                                  ? `${r.value.systolic}/${r.value.diastolic}`
                                  : r.value}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {r.unit || "-"}
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-600 italic">
                              {r.notes || (
                                <span className="text-gray-300">No context provided</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FaHeartbeat className="mx-auto text-4xl text-gray-200 mb-4" />
          <p className="text-sm font-bold text-gray-500">
            No recent biometric measurements processed.
          </p>
        </div>
      )}
    </div>
  );
}
