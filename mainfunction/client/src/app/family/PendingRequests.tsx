import React from "react";
import { FaEnvelope, FaUser } from "react-icons/fa";
import { FamilyRequest } from "./types";

interface PendingRequestsProps {
  requests: FamilyRequest[];
  onRespond: (familyId: string, action: "accept" | "reject") => void;
}

export default function PendingRequests({ requests, onRespond }: PendingRequestsProps) {
  if (requests.length === 0) return null;

  return (
    <div className="card-editorial bg-primary/5 border border-primary/10 rounded-xl p-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <h2 className="text-sm font-black text-primary mb-6 flex items-center space-x-2 uppercase tracking-[0.2em]">
        <FaEnvelope />
        <span>Pending Network Authorizations</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div key={req.familyId} className="bg-white p-6 rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant hover:shadow-lg transition-all group">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center text-primary border border-outline-variant">
                  <FaUser />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{req.adminName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.adminEmail}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Requesting to establish connection as <span className="text-primary font-bold">{req.relationshipToAdmin}</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onRespond(req.familyId, "reject")}
                className="flex-1 py-3 text-gray-500 bg-surface-container-low hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Decline
              </button>
              <button
                onClick={() => onRespond(req.familyId, "accept")}
                className="flex-1 py-3 bg-primary hover:bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
              >
                Authorize
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
