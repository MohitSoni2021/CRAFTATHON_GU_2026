import React, { useState } from "react";
import axios from "axios";
import { FaHeartbeat } from "react-icons/fa";
import { NewVitalForm } from "./types";

interface LogVitalModalProps {
  memberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogVitalModal({ memberId, onClose, onSuccess }: LogVitalModalProps) {
  const [newVital, setNewVital] = useState<NewVitalForm>({
    type: "glucose",
    value: "",
    systolic: "",
    diastolic: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleAddVital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let payload: any = { type: newVital.type, date: newVital.date };
      if (newVital.type === "bloodPressure") {
        payload.readings = [
          {
            type: "bloodPressure",
            value: { systolic: Number(newVital.systolic), diastolic: Number(newVital.diastolic) },
          },
        ];
      } else {
        payload.readings = [{ type: newVital.type, value: Number(newVital.value) }];
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/family/member/${memberId}/measurement`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSuccess();
      alert("Health record added successfully!");
    } catch (error) {
      console.error("Error adding vital", error);
      alert("Failed to add record.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md relative animate-in zoom-in-95 duration-200 border border-gray-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
        >
          &times;
        </button>
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <FaHeartbeat className="text-primary" /> Log Vital Record
        </h3>
        <form onSubmit={handleAddVital} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Metric Type
            </label>
            <div className="relative">
              <select
                value={newVital.type}
                onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium appearance-none transition-all"
              >
                <option value="glucose">Glucose Level</option>
                <option value="weight">Body Weight</option>
                <option value="bloodPressure">Blood Pressure</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Date Recorded
            </label>
            <input
              type="date"
              value={newVital.date}
              onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium transition-all"
              required
            />
          </div>

          {newVital.type === "bloodPressure" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Systolic (mmHg)
                </label>
                <input
                  type="number"
                  required
                  value={newVital.systolic}
                  onChange={(e) => setNewVital({ ...newVital, systolic: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium placeholder-gray-400 transition-all"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  required
                  value={newVital.diastolic}
                  onChange={(e) => setNewVital({ ...newVital, diastolic: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium placeholder-gray-400 transition-all"
                  placeholder="80"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Value ({newVital.type === "weight" ? "kg" : "mg/dL"})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newVital.value}
                onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium placeholder-gray-400 transition-all"
                placeholder={`Enter ${newVital.type} value`}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-6"
          >
            Commit Record to System
          </button>
        </form>
      </div>
    </div>
  );
}
