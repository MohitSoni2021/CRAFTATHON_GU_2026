import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaUserPlus, FaUser, FaInfoCircle, FaCheck, FaExclamationCircle, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { NewMemberForm } from "./types";

interface AddMemberModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ onClose, onSuccess }: AddMemberModalProps) {
  const [activeTab, setActiveTab] = useState<"dependent" | "invite">("dependent");
  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: "",
    relation: "",
    age: "",
    gender: "male",
    chronicConditions: "",
    accessLevel: "child",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelation, setInviteRelation] = useState("");
  const [inviteStatus, setInviteStatus] = useState({ type: "", message: "" });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const conditionsArray = newMember.chronicConditions.split(",").map((c) => c.trim()).filter(Boolean);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/family/add-member`,
        { ...newMember, chronicConditions: conditionsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (error) {
      console.error("Error adding member", error);
      alert("Protocol failure: Failed to add member");
    }
  };

  const handleInviteWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus({ type: "loading", message: "Initiating digital handshake..." });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/family/invite`,
        { email: inviteEmail, relation: inviteRelation },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInviteStatus({ type: "success", message: "Invitation transmitted successfully." });
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error("Error sending invite", error);
      const msg = error.response?.data?.message || "Protocol rejection: Failed to invite user.";
      setInviteStatus({ type: "error", message: msg });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-outline-variant relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors z-10 p-2 hover:bg-surface-container-low rounded-xl"
        >
          <FaTimes size={18} />
        </button>

        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
              <FaUserPlus />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Network Expansion</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connect New Family Profile</p>
            </div>
          </div>

          <div className="flex bg-surface-container-low p-1 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab("dependent")}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === "dependent" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              New Dependent
            </button>
            <button
              onClick={() => setActiveTab("invite")}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === "invite" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Secure Invitation
            </button>
          </div>
        </div>

        <div className="p-8 pt-0">
          {activeTab === "dependent" ? (
            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Legal Name</label>
                  <div className="relative group">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Relation</label>
                  <select
                    value={newMember.relation}
                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                    className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm appearance-none"
                    required
                  >
                    <option value="">Select Protocol...</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Age</label>
                  <input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Gender Specification</label>
                <div className="grid grid-cols-3 gap-3">
                  {["male", "female", "other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewMember({ ...newMember, gender: g })}
                      className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        newMember.gender === g
                          ? "bg-primary border-primary text-white"
                          : "bg-surface-container-low border-outline-variant text-gray-500 hover:border-primary/30"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant">
                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                  Generate Dependent Profile
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
                  <FaInfoCircle size={10} className="text-gray-400" />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    Local encryption applied to all health data.
                  </p>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleInviteWrapper} className="space-y-6">
              {inviteStatus.message && (
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                    inviteStatus.type === "error"
                      ? "bg-red-50 border-red-100 text-red-700"
                      : inviteStatus.type === "success"
                      ? "bg-green-50 border-green-100 text-green-700"
                      : "bg-primary/5 border-primary/10 text-primary"
                  }`}
                >
                  {inviteStatus.type === "loading" ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : inviteStatus.type === "success" ? (
                    <FaCheck />
                  ) : (
                    <FaExclamationCircle />
                  )}
                  <p className="text-xs font-black uppercase tracking-widest">{inviteStatus.message}</p>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Network Identity (Email)
                </label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm"
                    placeholder="identity@clinical.network"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Proposed Relation</label>
                <select
                  value={inviteRelation}
                  onChange={(e) => setInviteRelation(e.target.value)}
                  className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm appearance-none"
                  required
                >
                  <option value="">Select Connection...</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <button
                  type="submit"
                  disabled={inviteStatus.type === "loading"}
                  className={`w-full font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                    inviteStatus.type === "loading"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-outline-variant"
                      : "bg-gray-900 hover:bg-primary text-white shadow-gray-200"
                  }`}
                >
                  {inviteStatus.type === "loading" ? "Transmitting..." : "Transmit Invitation"}
                  <FaArrowRight size={10} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
