"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import axios from "axios";
import {
  FaUserMd,
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaStethoscope,
  FaUsers,
  FaVideo,
  FaCalendarCheck,
} from "react-icons/fa";

export default function DoctorDashboard() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [doctorNotes, setDoctorNotes] = useState("");

  // Meeting Modal State
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    topic: "",
    reason: "",
    urgency: "Normal",
  });

  useEffect(() => {
    if (user && user.type !== "doctor" && user.type !== "admin") {
      router.push("/dashboard");
    } else {
      fetchDashboardData();
    }
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel fetching
      const [reviewsRes, meetingsRes, appointmentsRes] =
        await Promise.allSettled([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/consultation/pending-reviews`,
            { headers },
          ),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/meetings/upcoming`, {
            headers,
          }),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor-appointments`,
            { headers },
          ),
        ]);

      if (reviewsRes.status === "fulfilled")
        setPendingReviews(reviewsRes.value.data.data);
      if (meetingsRes.status === "fulfilled")
        setUpcomingMeetings(meetingsRes.value.data.data);
      if (appointmentsRes.status === "fulfilled")
        setAppointments(appointmentsRes.value.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = (dateOffset: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dateOffset);
    const dateString = targetDate.toISOString().split("T")[0];

    return appointments.filter((app) => app.date === dateString);
  };

  const todayAppointments = getFilteredAppointments(0);
  const tomorrowAppointments = getFilteredAppointments(1);

  const handleOpenReview = (consultation: any) => {
    setSelectedConsultation(consultation);
    setDoctorNotes("");
  };

  const handleSubmitReview = async () => {
    if (!doctorNotes.trim()) {
      alert("Please add your expert notes before verifying.");
      return;
    }
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${selectedConsultation._id}/review`,
        { doctorNotes },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Review submitted successfully!");
      setSelectedConsultation(null);
      fetchDashboardData();
    } catch (error) {
      console.error("Error submitting review", error);
      alert("Failed to submit review.");
    }
  };

  const handleRequestMeeting = async () => {
    if (!meetingForm.topic || !meetingForm.reason) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meetings/request`,
        meetingForm,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Meeting Request Sent! Admin will review it shortly.");
      setIsMeetingModalOpen(false);
      setMeetingForm({ topic: "", reason: "", urgency: "Normal" });
    } catch (error) {
      console.error("Error requesting meeting", error);
      alert("Failed to send request.");
    }
  };

  if (!user || (user.type !== "doctor" && user.type !== "admin")) return null;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="w-full space-y-8 bg-[#f8f9fc] min-h-screen">
          <header className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-3xl shadow-sm">
                <FaUserMd />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Doctor Dashboard
                </h1>
                <p className="text-gray-400 text-sm font-medium mt-1">
                  Review patient consultations and manage clinical schedule.
                </p>
              </div>
            </div>
          </header>

          {/* Appointments Schedule Section */}
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
                      <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Time
                      </th>
                      <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Patient
                      </th>
                      <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {todayAppointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 border border-dashed border-gray-200 bg-gray-50 rounded-xl mt-4 block w-full"
                        >
                          No appointments today
                        </td>
                      </tr>
                    ) : (
                      todayAppointments.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="py-4 px-4 font-black text-gray-900 group-hover:text-primary transition-colors">
                            {app.time}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {app.userId.profileImage ? (
                                <img
                                  src={app.userId.profileImage}
                                  alt=""
                                  className="w-8 h-8 rounded-xl object-cover border border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm border border-gray-200">
                                  {app.userId.name?.[0]}
                                </div>
                              )}
                              <div>
                                <span className="font-black text-gray-900 text-sm block">
                                  {app.userId.name}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                                  {app.type} • {app.mode}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm
                                                            ${
                                                              app.status ===
                                                              "Completed"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : app.status ===
                                                                    "Cancelled"
                                                                  ? "bg-red-50 text-red-700 border-red-200"
                                                                  : "bg-primary/10 text-primary border-primary/20"
                                                            }`}
                            >
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
                  {new Date(
                    new Date().setDate(new Date().getDate() + 1),
                  ).toLocaleDateString(undefined, {
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
                      <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Time
                      </th>
                      <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Patient
                      </th>
                      <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {tomorrowAppointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 border border-dashed border-gray-200 bg-gray-50 rounded-xl mt-4 block w-full"
                        >
                          No appointments tomorrow
                        </td>
                      </tr>
                    ) : (
                      tomorrowAppointments.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="py-4 px-4 font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                            {app.time}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {app.userId.profileImage ? (
                                <img
                                  src={app.userId.profileImage}
                                  alt=""
                                  className="w-8 h-8 rounded-xl object-cover border border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm border border-gray-200">
                                  {app.userId.name?.[0]}
                                </div>
                              )}
                              <div>
                                <span className="font-black text-gray-900 text-sm block">
                                  {app.userId.name}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                                  {app.type} • {app.mode}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm
                                                            ${
                                                              app.status ===
                                                              "Completed"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : app.status ===
                                                                    "Cancelled"
                                                                  ? "bg-red-50 text-red-700 border-red-200"
                                                                  : "bg-blue-50 text-blue-700 border-blue-200"
                                                            }`}
                            >
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List of Pending Reviews */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                  <FaClipboardList className="text-primary" /> Pending Reviews
                </h3>
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-black px-3 py-1 rounded-xl shadow-sm">
                  {pendingReviews.length}
                </span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Loading Cases...
                    </span>
                  </div>
                ) : pendingReviews.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center bg-gray-50/50">
                    <FaCheck className="text-emerald-400 text-3xl mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      All caught up
                    </span>
                  </div>
                ) : (
                  pendingReviews.map((review) => (
                    <div
                      key={review._id}
                      onClick={() => handleOpenReview(review)}
                      className={`p-5 cursor-pointer transition-all hover:bg-primary/5 group ${selectedConsultation?._id === review._id ? "bg-primary/5 border-l-4 border-primary shadow-inner" : "border-l-4 border-transparent"}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4
                          className={`font-black text-sm transition-colors ${selectedConsultation?._id === review._id ? "text-primary" : "text-gray-900 group-hover:text-primary"}`}
                        >
                          {review.user?.name || "Unknown User"}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                          {new Date(review.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2 italic leading-relaxed">
                        "{review.symptoms}"
                      </p>
                      <div className="mt-3 flex gap-2">
                        <span
                          className={`text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-widest border shadow-sm ${
                            review.urgency === "High"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          }`}
                        >
                          {review.urgency} Priority
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Review Detail View */}
            <div className="lg:col-span-2">
              {selectedConsultation ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-right-4">
                  <div className="p-6 border-b border-primary/20 bg-primary text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 pattern-dots pointer-events-none" />
                    <h2 className="text-xl font-black flex items-center gap-3 relative z-10 tracking-tight">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <FaStethoscope size={18} />
                      </div>
                      Clinical Review
                    </h2>
                    <button
                      onClick={() => setSelectedConsultation(null)}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative z-10"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Patient Symptoms */}
                    <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{" "}
                        Patient Context
                      </h3>
                      <div className="bg-[#f8f9fc] p-5 rounded-xl text-gray-700 italic border border-gray-100 font-medium leading-relaxed relative">
                        <div className="absolute top-2 left-2 text-4xl text-gray-200 font-serif leading-none">
                          "
                        </div>
                        <span className="relative z-10 ml-4">
                          {selectedConsultation.symptoms}
                        </span>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div>
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>{" "}
                        AI Sentinel Analysis
                      </h3>
                      <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                        <p className="text-gray-900 font-medium leading-relaxed mb-6 bg-white p-4 rounded-xl border border-primary/10 shadow-sm">
                          {selectedConsultation.aiSummary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm">
                            <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest mb-3 pb-2 border-b border-gray-50">
                              Suggested Protocol
                            </h4>
                            <ul className="space-y-2">
                              {selectedConsultation.actions?.map(
                                (a: string, i: number) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-gray-600 font-medium"
                                  >
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></div>
                                    <span>{a}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm">
                            <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest mb-3 pb-2 border-b border-gray-50">
                              OTC Therapeutics
                            </h4>
                            <ul className="space-y-2">
                              {selectedConsultation.suggestedMedicines?.map(
                                (m: string, i: number) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-gray-600 font-medium"
                                  >
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></div>
                                    <span>{m}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-8"></div>

                    {/* Doctor Feedback Form */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                        Expert Verification
                      </h3>
                      <textarea
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm text-gray-900 font-medium resize-none bg-white"
                        placeholder="Write your professional opinion here. Validate the AI advice to suggest corrections..."
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                      ></textarea>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          onClick={() => setSelectedConsultation(null)}
                          className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                        >
                          Discard
                        </button>
                        <button
                          onClick={handleSubmitReview}
                          className="px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-gray-900 text-white hover:bg-primary shadow-xl shadow-gray-200 hover:shadow-primary/20 transition-all flex items-center gap-2"
                        >
                          <FaCheck size={12} /> Verify & Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm min-h-[500px]">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6 text-gray-300 border border-gray-100 shadow-inner">
                    <FaClipboardList />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                    Clinical Desk Ready
                  </h3>
                  <p className="max-w-xs mx-auto text-sm text-gray-500 font-medium leading-relaxed">
                    Select a pending consultation from the queue to provide your
                    expert verification.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings Section */}
          {upcomingMeetings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 shadow-sm">
                  <FaVideo size={16} />
                </div>
                Case Conferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMeetings.map((mtg) => (
                  <div
                    key={mtg._id}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group hover:border-red-200 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                        {mtg.urgency}
                      </span>
                      {mtg.scheduledAt ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-widest shadow-sm">
                            {new Date(mtg.scheduledAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                            {new Date(mtg.scheduledAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          {new Date(mtg.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-2 leading-tight relative z-10">
                      {mtg.topic}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 font-medium leading-relaxed relative z-10">
                      "{mtg.reason}"
                    </p>

                    {mtg.summary && (
                      <div className="mb-6 bg-[#f8f9fc] p-4 rounded-xl border border-gray-100 relative z-10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>{" "}
                          AI Briefing
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-3 font-medium leading-relaxed">
                          {mtg.summary}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50 relative z-10">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-black border border-gray-200">
                          {mtg.requester?.name?.[0]}
                        </div>
                        {mtg.requester?.name}
                      </div>
                      <a
                        href={mtg.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                      >
                        <FaVideo size={12} /> Join Sync
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Meeting Button (Fixed at bottom right) */}
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

          {/* Meeting Request Modal */}
          {isMeetingModalOpen && (
            <div className="fixed inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                  Request Emergency Conference
                </h2>
                <p className="text-gray-500 mb-8 text-sm font-medium">
                  Need a second opinion from the entire medical board? Submit a
                  priority request.
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
                      onChange={(e) =>
                        setMeetingForm({
                          ...meetingForm,
                          topic: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setMeetingForm({
                          ...meetingForm,
                          reason: e.target.value,
                        })
                      }
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
                          onClick={() =>
                            setMeetingForm({ ...meetingForm, urgency: level })
                          }
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
