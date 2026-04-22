"use client";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMeasurements } from "@/store/slices/measurementsSlice";
import Link from "next/link";
import { FaPlus, FaHeartbeat, FaWeight, FaTint, FaCalendarAlt, FaChevronRight, FaClock } from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import MeasurementsSkeleton from "@/components/dashboard/MeasurementsSkeleton";

export default function MeasurementsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { measurements, loading } = useSelector(
    (state: RootState) => state.measurements,
  );
  const [selectedType, setSelectedType] = useState<"glucose" | "bp" | "weight">(
    "glucose",
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMeasurements(user.id));
    }
  }, [dispatch, user]);

  // Prepare Data for Charts
  const chartData = measurements
    .map((m) => {
      const reading = m.readings.find((r) =>
        selectedType === "bp"
          ? r.type === "bloodPressure"
          : r.type === selectedType,
      );
      if (!reading) return null;

      return {
        date: new Date(m.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        value:
          selectedType === "bp"
            ? (reading.value as any).systolic
            : Number(reading.value),
        value2: selectedType === "bp" ? (reading.value as any).diastolic : null,
      };
    })
    .filter(Boolean)
    .reverse() // Show chronological order
    .slice(-7); // Last 7 readings

  const getThemeColor = () => {
    switch (selectedType) {
      case "glucose":
        return "#006977"; // Primary Teal
      case "bp":
        return "#635888"; // Tertiary Purple
      case "weight":
        return "#005c68"; // Primary Dim
      default:
        return "#006977";
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {loading && measurements.length === 0 ? (
          <MeasurementsSkeleton />
        ) : (
          <div className="w-full">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Health Measurements</h1>
                <p className="text-gray-500 mt-2 font-medium">Monitor and track your vital health statistics over time.</p>
              </div>
              <Link
                href="/measurements/new"
                className="btn-primary !rounded-xl gap-2 shadow-ambient"
              >
                <FaPlus size={14} />
                <span>New Measurement</span>
              </Link>
            </header>

            {/* Chart & Control Section */}
            <div className="card-editorial border border-outline-variant shadow-ambient p-8 mb-10 overflow-hidden relative">
              {/* Decorator */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant w-fit">
                  {[
                    { id: "glucose", label: "Glucose", icon: FaTint },
                    { id: "bp", label: "BP", icon: FaHeartbeat },
                    { id: "weight", label: "Weight", icon: FaWeight },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id as any)}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        selectedType === type.id
                          ? "bg-white text-primary shadow-sm border border-outline-variant"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <type.icon size={14} className={selectedType === type.id ? "text-primary" : "text-gray-400"} />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <FaCalendarAlt size={12} className="text-primary/50" />
                  <span>Last 7 Readings</span>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getThemeColor()} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={getThemeColor()} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                      dy={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid rgba(0, 105, 119, 0.1)",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        padding: "12px 16px",
                      }}
                      itemStyle={{ fontWeight: 700, fontSize: "14px" }}
                      labelStyle={{ fontWeight: 800, color: "#64748b", marginBottom: "4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={getThemeColor()}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      animationDuration={1500}
                    />
                    {selectedType === "bp" && (
                      <Area
                        type="monotone"
                        dataKey="value2"
                        stroke={getThemeColor()}
                        strokeWidth={3}
                        strokeDasharray="6 6"
                        fill="none"
                        animationDuration={1500}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History Section */}
            <div className="card-editorial border border-outline-variant shadow-ambient p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Recent History</h3>
                <Link href="/measurements/new" className="text-primary text-sm font-bold hover:underline flex items-center">
                  View Full Logs <FaChevronRight size={10} className="ml-1" />
                </Link>
              </div>

              {measurements.length === 0 ? (
                <div className="text-center py-24 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FaHeartbeat className="text-2xl text-primary/30" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No data recorded yet</h4>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto">Start tracking your health journey by adding your first vital reading today.</p>
                  <Link
                    href="/measurements/new"
                    className="btn-primary !rounded-xl inline-flex gap-2"
                  >
                    <FaPlus size={14} />
                    <span>Add First Reading</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {measurements.map((measurement) => (
                    <div
                      key={measurement._id}
                      className="group p-6 rounded-xl border border-outline-variant hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-outline-variant shadow-sm group-hover:border-primary/20 transition-colors">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {new Date(measurement.date).toLocaleDateString(undefined, { month: "short" })}
                            </span>
                            <span className="text-lg font-extrabold text-gray-900 leading-none">
                              {new Date(measurement.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <FaClock size={10} className="mr-1 opacity-50" />
                              {new Date(measurement.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {measurement.readings.map((reading: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-outline-variant/50">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  reading.type === "glucose"
                                    ? "bg-teal-500"
                                    : reading.type === "bloodPressure"
                                      ? "bg-purple-500"
                                      : "bg-blue-500"
                                }`}
                              ></div>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {reading.type === "bloodPressure" ? "BP" : reading.type}
                              </span>
                            </div>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-lg font-extrabold text-gray-900">
                                {reading.type === "bloodPressure"
                                  ? `${reading.value.systolic}/${reading.value.diastolic}`
                                  : reading.value}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {reading.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
