import React from "react";
import { FaNotesMedical } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HealthTrends } from "./types";

interface HealthTrendsChartProps {
  trends: HealthTrends;
}

export default function HealthTrendsChart({ trends }: HealthTrendsChartProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
        <FaNotesMedical className="text-primary" /> Longitudinal Biometrics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weight Graph */}
        <div className="h-72 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            Body Mass Index (kg)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends?.weight || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                fontSize={10}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis domain={["auto", "auto"]} fontSize={10} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Glucose Graph */}
        <div className="h-72 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            Metabolic Glucose (mg/dL)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends?.glucose || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                fontSize={10}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis domain={["auto", "auto"]} fontSize={10} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* BP Graph */}
        <div className="h-72 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            Vascular Pressure
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends?.bp || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                fontSize={10}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis domain={["auto", "auto"]} fontSize={10} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="value.systolic"
                name="SYS"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 3, fill: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="value.diastolic"
                name="DIA"
                stroke="#f43f5e"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#fff" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
