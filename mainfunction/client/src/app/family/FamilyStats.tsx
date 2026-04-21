import React from "react";
import { FaUsers, FaExclamationCircle, FaEnvelope } from "react-icons/fa";
import { FamilyMember } from "./types";

interface FamilyStatsProps {
  members: FamilyMember[];
}

export default function FamilyStats({ members }: FamilyStatsProps) {
  const activeNodesCount = members.filter((m) => m.status !== "pending").length;
  const pendingInvitesCount = members.filter((m) => m.status === "pending").length;

  const stats = [
    {
      label: "Active Nodes",
      value: activeNodesCount,
      icon: <FaUsers />,
      color: "bg-primary/5 text-primary",
    },
    {
      label: "Diagnostic Alerts",
      value: "0",
      icon: <FaExclamationCircle />,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Pending Invitations",
      value: pendingInvitesCount,
      icon: <FaEnvelope />,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="card-editorial bg-white p-8 rounded-xl shadow-ambient border border-outline-variant flex items-center justify-between group"
        >
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {stat.label}
            </p>
            <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
          </div>
          <div
            className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-sm border border-current opacity-50 group-hover:opacity-100 transition-opacity`}
          >
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
