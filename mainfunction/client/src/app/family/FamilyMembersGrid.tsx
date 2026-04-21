import React from "react";
import Link from "next/link";
import { FaUser, FaShieldAlt, FaChevronRight, FaUsers } from "react-icons/fa";
import HealthSparkline from "@/components/HealthSparkline";
import { FamilyMember } from "./types";

interface FamilyMembersGridProps {
  members: FamilyMember[];
  loading: boolean;
  onAddMember: () => void;
}

export default function FamilyMembersGrid({ members, loading, onAddMember }: FamilyMembersGridProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-px bg-outline-variant flex-1"></div>
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
          Family Health Network
        </h2>
        <div className="h-px bg-outline-variant flex-1"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-surface-container-low rounded-xl animate-pulse"></div>
          ))
        ) : members.map((member) => {
          const bpData = member.healthData?.bp?.map((d) => ({ value: d.value.systolic })) || [];
          const weightData = member.healthData?.weight?.map((d) => ({ value: d.value })) || [];
          const glucoseData = member.healthData?.glucose?.map((d) => ({ value: d.value })) || [];

          const latestBp = member.healthData?.bp?.length
            ? `${member.healthData.bp[member.healthData.bp.length - 1].value.systolic}/${
                member.healthData.bp[member.healthData.bp.length - 1].value.diastolic
              }`
            : "--";
          const latestWeight = member.healthData?.weight?.length
            ? member.healthData.weight[member.healthData.weight.length - 1].value
            : "--";
          const latestGlucose = member.healthData?.glucose?.length
            ? member.healthData.glucose[member.healthData.glucose.length - 1].value
            : "--";

          return (
            <div
              key={member._id}
              className="card-editorial bg-white rounded-xl shadow-ambient border border-outline-variant overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all group relative"
            >
              {member.status === "pending" && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-4 py-2 rounded-bl-xl uppercase tracking-widest z-10 shadow-lg">
                  Pending Authorization
                </div>
              )}
              <div className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-black uppercase shadow-xl transition-transform group-hover:scale-105 duration-500 ${
                        member.status === "pending"
                          ? "bg-surface-container-low text-gray-300 border border-outline-variant"
                          : "bg-gray-900 text-white shadow-gray-200"
                      }`}
                    >
                      {member.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                          {member.name}
                        </h3>
                        <span className="bg-primary/5 text-primary text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-primary/10">
                          {member.relationship}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <FaUser size={10} className="text-primary/40" />{" "}
                          {member.userId?.age || member.age || "N/A"} YRS
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaShieldAlt size={10} className="text-primary/40" />{" "}
                          {member.accessLevel || "Member"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {member.status === "active" && (
                    <Link
                      href={`/family/${member.userId?._id}`}
                      className="w-full sm:w-auto bg-surface-container-low hover:bg-gray-900 hover:text-white text-gray-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-outline-variant group/btn"
                    >
                      <span>Access Terminal</span>
                      <FaChevronRight
                        size={10}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { data: bpData, color: "#ef4444", label: "BP", unit: "mmHg", value: latestBp },
                    { data: weightData, color: "#3b82f6", label: "Weight", unit: "kg", value: latestWeight },
                    { data: glucoseData, color: "#10b981", label: "Glucose", unit: "mg/dL", value: latestGlucose },
                  ].map((trend, i) => (
                    <div
                      key={i}
                      className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50 hover:border-primary/20 transition-colors"
                    >
                      <HealthSparkline
                        data={trend.data}
                        dataKey="value"
                        color={trend.color}
                        label={trend.label}
                        unit={trend.unit}
                        latestValue={trend.value}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {members.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant text-center px-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 text-3xl mb-6 shadow-sm">
              <FaUsers />
            </div>
            <p className="text-gray-900 font-extrabold text-lg tracking-tight">Isolated Ecosystem</p>
            <p className="text-gray-500 text-sm max-w-sm mt-2">
              No network nodes detected. Start by adding a family member or sending a secure invitation.
            </p>
            <button
              onClick={onAddMember}
              className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
            >
              Establish Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
