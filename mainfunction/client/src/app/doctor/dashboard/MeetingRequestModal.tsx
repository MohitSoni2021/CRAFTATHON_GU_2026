import React, { useState } from "react";
import axios from "axios";
import { FaUsers } from "react-icons/fa";

interface MeetingRequestModalProps {
  token: string | null;
}

export default function MeetingRequestModal({ token }: MeetingRequestModalProps) {
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    topic: "",
    reason: "",
    urgency: "Normal",
  });

  const handleRequestMeeting = async () => {
    if (!meetingForm.topic || !meetingForm.reason) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meetings/request`,
        meetingForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Meeting Request Sent! Admin will review it shortly.");
      setIsMeetingModalOpen(false);
      setMeetingForm({ topic: "", reason: "", urgency: "Normal" });
    } catch (error) {
      console.error("Error requesting meeting", error);
      alert("Failed to send request.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsMeetingModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gray-900 hover:bg-primary text-white px-6 py-4 rounded-xl shadow-2xl shadow-gray-400/50 flex items-center gap-3 transition-all hover:scale-105 z-50 group border border-white/10"
      >
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
          <FaUsers className="text-xl text-white" />
        </div>
        <span className="font-black text-[10px] uppercase tracking-widest pr-2">
          Board Conference
        </span>
      </button>

      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Request Emergency Conference
            </h2>
            <p className="text-gray-500 mb-8 text-sm font-medium">
              Need a second opinion from the entire medical board? Submit a priority request.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Clinical Topic
                </label>
                <input
                  type="text"
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-bold transition-all shadow-sm outline-none placeholder:text-gray-400"
                  placeholder="e.g. Rare Cardiomyopathy Case"
                  value={meetingForm.topic}
                  onChange={(e) => setMeetingForm({ ...meetingForm, topic: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Rationale
                </label>
                <textarea
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-medium transition-all shadow-sm outline-none h-28 resize-none placeholder:text-gray-400"
                  placeholder="Describe why this case needs immediate attention..."
                  value={meetingForm.reason}
                  onChange={(e) => setMeetingForm({ ...meetingForm, reason: e.target.value })}
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Triage Level
                </label>
                <div className="flex gap-3">
                  {["Normal", "Urgent", "Critical"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setMeetingForm({ ...meetingForm, urgency: level })}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all shadow-sm ${
                        meetingForm.urgency === level
                          ? level === "Critical"
                            ? "bg-red-50 border-red-200 text-red-700 shadow-red-100"
                            : "bg-primary text-white border-primary shadow-primary/20"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-50">
              <button
                onClick={() => setIsMeetingModalOpen(false)}
                className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
              >
                Discard
              </button>
              <button
                onClick={handleRequestMeeting}
                className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-gray-900 text-white hover:bg-primary shadow-xl shadow-gray-200 hover:shadow-primary/20 transition-all flex items-center gap-2"
              >
                Submit Priority Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
