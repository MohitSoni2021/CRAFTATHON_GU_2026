"use client";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import axios from 'axios';
import { FaUserMd, FaClipboardList, FaCheck, FaTimes, FaStethoscope, FaUsers, FaVideo, FaCalendarCheck } from 'react-icons/fa';

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
        topic: '',
        reason: '',
        urgency: 'Normal'
    });

    useEffect(() => {
        if (user && user.type !== 'doctor' && user.type !== 'admin') {
            router.push('/dashboard');
        } else {
            fetchDashboardData();
        }
    }, [user, router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };

            // Parallel fetching
            const [reviewsRes, meetingsRes, appointmentsRes] = await Promise.allSettled([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/consultation/pending-reviews`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/meetings/upcoming`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor-appointments`, { headers })
            ]);

            if (reviewsRes.status === 'fulfilled') setPendingReviews(reviewsRes.value.data.data);
            if (meetingsRes.status === 'fulfilled') setUpcomingMeetings(meetingsRes.value.data.data);
            if (appointmentsRes.status === 'fulfilled') setAppointments(appointmentsRes.value.data.data);

        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredAppointments = (dateOffset: number) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dateOffset);
        const dateString = targetDate.toISOString().split('T')[0];

        return appointments.filter(app => app.date === dateString);
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
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/consultation/${selectedConsultation._id}/review`,
                { doctorNotes },
                { headers: { Authorization: `Bearer ${token}` } }
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
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/meetings/request`,
                meetingForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Meeting Request Sent! Admin will review it shortly.");
            setIsMeetingModalOpen(false);
            setMeetingForm({ topic: '', reason: '', urgency: 'Normal' });
        } catch (error) {
            console.error("Error requesting meeting", error);
            alert("Failed to send request.");
        }
    };

    if (!user || (user.type !== 'doctor' && user.type !== 'admin')) return null;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                            <FaUserMd />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">Doctor Dashboard</h1>
                            <p className="text-gray-500">Review patient consultations and provide second opinions.</p>
                        </div>
                    </div>

                    {/* Appointments Schedule Section */}
                    <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Today's Schedule */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><FaClipboardList /></span>
                                Today's Schedule
                                <span className="ml-auto text-sm font-normal text-gray-500">{new Date().toLocaleDateString()}</span>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-gray-400 text-xs uppercase border-b border-gray-100">
                                            <th className="py-3 font-semibold">Time</th>
                                            <th className="py-3 font-semibold">Patient</th>
                                            <th className="py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {todayAppointments.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-gray-400 italic">No appointments for today.</td>
                                            </tr>
                                        ) : (
                                            todayAppointments.map((app) => (
                                                <tr key={app._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                    <td className="py-3 font-bold text-gray-700">{app.time}</td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            {app.userId.profileImage ? (
                                                                <img src={app.userId.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">{app.userId.name?.[0]}</div>
                                                            )}
                                                            <span className="font-medium text-gray-800">{app.userId.name}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{app.type} • {app.mode}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                            ${app.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                                app.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                                                    'bg-blue-100 text-blue-600'}`}>
                                                            {app.status || 'Scheduled'}
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
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-90">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FaCalendarCheck /></span>
                                Tomorrow's Schedule
                                <span className="ml-auto text-sm font-normal text-gray-500">
                                    {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}
                                </span>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-gray-400 text-xs uppercase border-b border-gray-100">
                                            <th className="py-3 font-semibold">Time</th>
                                            <th className="py-3 font-semibold">Patient</th>
                                            <th className="py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {tomorrowAppointments.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-gray-400 italic">No appointments for tomorrow.</td>
                                            </tr>
                                        ) : (
                                            tomorrowAppointments.map((app) => (
                                                <tr key={app._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                    <td className="py-3 font-bold text-gray-700">{app.time}</td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            {app.userId.profileImage ? (
                                                                <img src={app.userId.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">{app.userId.name?.[0]}</div>
                                                            )}
                                                            <span className="font-medium text-gray-800">{app.userId.name}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{app.type} • {app.mode}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                            ${app.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                                app.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                                                    'bg-blue-100 text-blue-600'}`}>
                                                            {app.status || 'Scheduled'}
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
                        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
                            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <FaClipboardList /> Pending Reviews
                                </h3>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{pendingReviews.length}</span>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-400">Loading...</div>
                                ) : pendingReviews.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">No pending reviews. Good job!</div>
                                ) : (
                                    pendingReviews.map((review) => (
                                        <div
                                            key={review._id}
                                            onClick={() => handleOpenReview(review)}
                                            className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 ${selectedConsultation?._id === review._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-800 text-sm">{review.user?.name || "Unknown User"}</h4>
                                                <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 italic">"{review.symptoms}"</p>
                                            <div className="mt-2 flex gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${review.urgency === 'High' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {review.urgency}
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
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4">
                                    <div className="p-6 border-b border-gray-100 bg-blue-600 text-white flex justify-between items-center">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <FaStethoscope /> Reviewing Case
                                        </h2>
                                        <button onClick={() => setSelectedConsultation(null)} className="text-white/80 hover:text-white">
                                            <FaTimes />
                                        </button>
                                    </div>

                                    <div className="p-8">
                                        {/* Patient Symptoms */}
                                        <div className="mb-8">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Patient Reported Symptoms</h3>
                                            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 italic border border-gray-100">
                                                "{selectedConsultation.symptoms}"
                                            </div>
                                        </div>

                                        {/* AI Analysis */}
                                        <div className="mb-8">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">AI Initial Analysis</h3>
                                            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                                                <p className="text-gray-800 mb-4">{selectedConsultation.aiSummary}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-700 text-xs uppercase mb-1">Actions Suggested</h4>
                                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                                            {selectedConsultation.actions?.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-700 text-xs uppercase mb-1">Meds Suggested (OTC)</h4>
                                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                                            {selectedConsultation.suggestedMedicines?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Doctor Feedback Form */}
                                        <div>
                                            <h3 className="text-sm font-bold text-purple-600 uppercase mb-2">Your Expert Verification</h3>
                                            <textarea
                                                className="w-full h-32 p-4 rounded-xl border-2 border-purple-100 focus:border-purple-500 focus:ring-0 transition-colors text-gray-700"
                                                placeholder="Write your professional opinion here. Validate the AI advice to suggest corrections..."
                                                value={doctorNotes}
                                                onChange={(e) => setDoctorNotes(e.target.value)}
                                            ></textarea>

                                            <div className="flex justify-end gap-3 mt-4">
                                                <button
                                                    onClick={() => setSelectedConsultation(null)}
                                                    className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSubmitReview}
                                                    className="px-8 py-2 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 transition flex items-center gap-2"
                                                >
                                                    <FaCheck /> Submit Verification
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4 text-gray-300">
                                        <FaClipboardList />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-500">Select a consultation to review</h3>
                                    <p className="max-w-xs mx-auto mt-2">Click on any pending request from the list on the left to view details and provide your expert opinion.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Meetings Section */}
                    {upcomingMeetings.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaVideo className="text-red-500" /> Upcoming Case Conferences
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingMeetings.map((mtg) => (
                                    <div key={mtg._id} className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                {mtg.urgency}
                                            </span>
                                            {mtg.scheduledAt ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 mb-1">
                                                        📅 {new Date(mtg.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        ⏰ {new Date(mtg.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(new Date(mtg.scheduledAt).getTime() + (mtg.duration || 60) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">({mtg.duration || 60} mins)</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    {new Date(mtg.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">{mtg.topic}</h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">"{mtg.reason}"</p>

                                        {mtg.summary && (
                                            <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                <p className="text-xs font-bold text-yellow-700 uppercase mb-1">AI Summary Available</p>
                                                <p className="text-xs text-gray-600 line-clamp-3 italic">
                                                    {mtg.summary}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                            <div className="text-xs text-gray-400">
                                                By: <span className="font-semibold text-gray-600">{mtg.requester?.name}</span>
                                            </div>
                                            <a
                                                href={mtg.meetingLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition flex items-center gap-2"
                                            >
                                                <FaVideo /> Join
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
                        className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 z-50 group"
                    >
                        <div className="bg-white/20 p-2 rounded-full">
                            <FaUsers className="text-xl" />
                        </div>
                        <span className="font-bold pr-2">Request Case Conference</span>
                    </button>

                    {/* Meeting Request Modal */}
                    {isMeetingModalOpen && (
                        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Request Emergency Conference</h2>
                                <p className="text-gray-500 mb-6 text-sm">Need a second opinion from the entire board? Submit a request.</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic / Case Title</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 text-gray-700 font-bold"
                                            placeholder="e.g. Rare Cardiomyopathy Case"
                                            value={meetingForm.topic}
                                            onChange={(e) => setMeetingForm({ ...meetingForm, topic: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason for Meeting</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 text-gray-700 h-24"
                                            placeholder="Describe why this case needs immediate attention..."
                                            value={meetingForm.reason}
                                            onChange={(e) => setMeetingForm({ ...meetingForm, reason: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Urgency Level</label>
                                        <div className="flex gap-2">
                                            {['Normal', 'Urgent', 'Critical'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setMeetingForm({ ...meetingForm, urgency: level })}
                                                    className={`flex-1 py-3 rounded-xl font-bold border transition-colors ${meetingForm.urgency === level
                                                        ? level === 'Critical' ? 'bg-red-100 border-red-500 text-red-600' : 'bg-gray-800 text-white border-gray-800'
                                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setIsMeetingModalOpen(false)}
                                        className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestMeeting}
                                        className="px-6 py-2 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition"
                                    >
                                        Submit Request
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
