'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout'; // Use specific Admin Layout
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaUserMd, FaUsers, FaNewspaper, FaClipboardList, FaTrash } from 'react-icons/fa';

import VitalsCard from '@/components/dashboard/VitalsCard'; // Reusing for stats cards

export default function AdminDashboard() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifications, setVerifications] = useState<any[]>([]);
    const [meetingRequests, setMeetingRequests] = useState<any[]>([]);
    const [approvedMeetings, setApprovedMeetings] = useState<any[]>([]);
    const [approvalModal, setApprovalModal] = useState<{ isOpen: boolean, requestId: string | null, requestTopic: string }>({ isOpen: false, requestId: null, requestTopic: '' });
    const [approvalForm, setApprovalForm] = useState({ meetingLink: 'https://meet.google.com/new', scheduledAt: '', duration: 60 });

    useEffect(() => {
        if (user && user.type !== 'admin') {
            router.push('/dashboard');
        } else if (user) {
            fetchData();
        }
    }, [user, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch pending verifications (catch error silently if route not ready)
            try {
                const verifyRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctor-verification/admin/pending`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVerifications(verifyRes.data.applications);
            } catch (err) { console.error("Verification fetch error", err); }

            try {
                const meetingsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/meetings/pending`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMeetingRequests(meetingsRes.data.data);

                // Fetch Approved/Upcoming for Summarization
                const approvedRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/meetings/upcoming`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApprovedMeetings(approvedRes.data.data);

            } catch (err) { console.error("Meetings fetch error", err); }

            setStats(statsRes.data);
            setUsers(usersRes.data.users);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete user ${name}? This cannot be undone.`)) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData(); // Refresh
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    const handleOpenApproveModal = (id: string, topic: string) => {
        setApprovalModal({ isOpen: true, requestId: id, requestTopic: topic });
        // Default to now + 1 hour nicely formatted for datetime-local? 
        // HTML datetime-local expects YYYY-MM-DDTHH:mm
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

        setApprovalForm({ meetingLink: "https://meet.google.com/new", scheduledAt: localIso, duration: 60 });
    };

    const handleConfirmApprove = async () => {
        if (!approvalModal.requestId) return;

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/meetings/approve/${approvalModal.requestId}`,
                {
                    meetingLink: approvalForm.meetingLink,
                    scheduledAt: approvalForm.scheduledAt,
                    duration: approvalForm.duration
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Meeting Approved and Notifications Sent! 📧");
            setApprovalModal({ isOpen: false, requestId: null, requestTopic: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to approve meeting.");
        }
    };

    const openGoogleCalendar = () => {
        if (!approvalForm.scheduledAt) {
            alert("Please select a time first.");
            return;
        }

        const startTime = new Date(approvalForm.scheduledAt);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Case Conference: " + approvalModal.requestTopic)}&dates=${formatTime(startTime)}/${formatTime(endTime)}&details=${encodeURIComponent("Emergency Case Conference via LifeDoc System.")}&location=${encodeURIComponent("Google Meet")}`;

        window.open(url, '_blank');
    };

    const handleReview = async (id: string, status: string, name: string) => {
        let feedback = "";
        if (status === 'rejected') {
            feedback = prompt("Enter reason for rejection:") || "";
            if (!feedback && status === 'rejected') return;
        }

        if (confirm(`Are you sure you want to ${status} ${name}'s application?`)) {
            try {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/doctor-verification/admin/review/${id}`,
                    { status, feedback },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert(`Application ${status} successfully.`);
                fetchData();
            } catch (error) {
                console.error(error);
                alert("Failed to update process.");
            }
        }
    };

    const handleUploadRecording = async (id: string, event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
            alert("Please upload an audio or video file.");
            return;
        }

        // Optional: Ask for recording link
        const recordingLink = prompt("Optional: Paste the Google Drive Share Link for this video (so doctors can watch it later):", "");

        const formData = new FormData();
        formData.append('recording', file);
        if (recordingLink) formData.append('recordingLink', recordingLink);

        if (confirm("Upload recording to generate AI Summary? This may take a minute.")) {
            try {
                // Show some loading indicator ideally, but alert for now
                alert("Uploading and analyzing... Please wait. ⏳");

                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/meetings/summarize/${id}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert("Summary Generated Successfully! ✅");
                fetchData();
            } catch (error) {
                console.error(error);
                alert("Failed to generate summary. Ensure file is under 20MB for this demo.");
            }
        }
    };

    if (!user || user.type !== 'admin') return null;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Manage users, approve doctors, and view system statistics.</p>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading Admin Data...</div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <VitalsCard title="Total Users" value={stats?.users || 0} unit="" icon={FaUsers} colorClass="text-blue-600 bg-blue-50" trend="stable" trendValue="" />
                            <VitalsCard title="Doctors" value={stats?.doctors || 0} unit="" icon={FaUserMd} colorClass="text-green-600 bg-green-50" trend="stable" trendValue="" />
                            <VitalsCard title="Appointments" value={stats?.appointments || 0} unit="" icon={FaClipboardList} colorClass="text-purple-600 bg-purple-50" trend="stable" trendValue="" />
                            <VitalsCard title="Pending Verifications" value={verifications.length} unit="" icon={FaUserMd} colorClass="text-orange-600 bg-orange-50" trend={verifications.length > 0 ? "up" : "stable"} trendValue={verifications.length > 0 ? "Action Needed" : "All Clear"} />
                        </div>

                        {/* Meeting Requests Table */}
                        {meetingRequests.length > 0 && (
                            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden mb-10">
                                <div className="p-6 border-b border-red-100 bg-red-50/30 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <FaUsers className="text-red-500" />
                                        Case Conference Requests
                                    </h3>
                                    <span className="text-sm text-red-600 font-semibold">{meetingRequests.length} Requests</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                            <tr>
                                                <th className="px-6 py-4">Requester</th>
                                                <th className="px-6 py-4">Topic</th>
                                                <th className="px-6 py-4">Reason</th>
                                                <th className="px-6 py-4">Urgency</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {meetingRequests.map((req) => (
                                                <tr key={req._id} className="hover:bg-red-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900">{req.requester?.name || "Dr. Unknown"}</td>
                                                    <td className="px-6 py-4">{req.topic}</td>
                                                    <td className="px-6 py-4 italic max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                                                            req.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {req.urgency}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleOpenApproveModal(req._id, req.topic)}
                                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-xs font-bold shadow-lg shadow-red-200 transition"
                                                        >
                                                            Approve & Schedule
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Approved Meetings / Summarization Table */}
                        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden mb-10">
                            <div className="p-6 border-b border-blue-100 bg-blue-50/30 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaClipboardList className="text-blue-500" />
                                    Active Conferences & Summaries
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                        <tr>
                                            <th className="px-6 py-4">Topic</th>
                                            <th className="px-6 py-4">Scheduled</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">AI Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {approvedMeetings.map((mtg) => (
                                            <tr key={mtg._id} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{mtg.topic}</td>
                                                <td className="px-6 py-4">
                                                    {mtg.scheduledAt ? new Date(mtg.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date Not Set'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {mtg.summary ? (
                                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Summary Ready</span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Pending Summary</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative overflow-hidden inline-block">
                                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-xs font-bold transition flex items-center gap-2 m-auto">
                                                            Upload Rec 🎙️
                                                        </button>
                                                        <input
                                                            type="file"
                                                            accept="audio/*,video/*"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => handleUploadRecording(mtg._id, e)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {approvedMeetings.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No approved meetings found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pending Verifications Table */}
                        {verifications.length > 0 && (
                            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden mb-10">
                                <div className="p-6 border-b border-orange-100 bg-orange-50/30 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <FaUserMd className="text-orange-500" />
                                        Pending Doctor Verifications
                                    </h3>
                                    <span className="text-sm text-orange-600 font-semibold">{verifications.length} Pending</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                            <tr>
                                                <th className="px-6 py-4">Applicant</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Documents</th>
                                                <th className="px-6 py-4">Applied On</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {verifications.map((app) => (
                                                <tr key={app._id} className="hover:bg-orange-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                                        {app.userId.profileImage ? (
                                                            <img src={app.userId.profileImage} className="w-8 h-8 rounded-full" alt="" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                                        )}
                                                        {app.userId.name}
                                                    </td>
                                                    <td className="px-6 py-4">{app.userId.email}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            {app.documents.map((doc: string, idx: number) => (
                                                                <a key={idx} href={doc} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline border border-blue-200 px-2 py-1 rounded bg-blue-50 text-xs">
                                                                    View Doc {idx + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleReview(app._id, 'approved', app.userId.name)}
                                                            className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 text-xs font-bold transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReview(app._id, 'rejected', app.userId.name)}
                                                            className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 text-xs font-bold transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* User Management Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800">User Management</h3>
                                <span className="text-sm text-gray-500">Showing last 50 users</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                                                <td className="px-6 py-4">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.type === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        u.type === 'doctor' ? 'bg-green-100 text-green-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {u.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {u.type !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id, u.name)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Approval Modal */}
                {approvalModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                            <h2 className="text-xl font-extrabold text-gray-800 mb-2">Approve Conference</h2>
                            <p className="text-gray-500 mb-6 text-sm">Set the time and link for: <span className="font-bold">{approvalModal.requestTopic}</span></p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meeting Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 text-gray-700"
                                            placeholder="Paste Google Meet Link here..."
                                            value={approvalForm.meetingLink}
                                            onChange={(e) => setApprovalForm({ ...approvalForm, meetingLink: e.target.value })}
                                        />
                                        <button
                                            onClick={openGoogleCalendar}
                                            className="shrink-0 bg-blue-50 text-blue-600 px-3 rounded-xl font-bold text-xs hover:bg-blue-100 transition border border-blue-200"
                                            title="Open Google Calendar to create event"
                                        >
                                            📅 Generate<br />Event
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Tip: Click "Generate Event", create it in Google Calendar, then copy/paste the Meet link here.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scheduled Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 text-gray-700"
                                        value={approvalForm.scheduledAt}
                                        onChange={(e) => setApprovalForm({ ...approvalForm, scheduledAt: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 text-gray-700"
                                        value={approvalForm.duration}
                                        onChange={(e) => setApprovalForm({ ...approvalForm, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}
                                    className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmApprove}
                                    className="px-6 py-2 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition"
                                >
                                    Confirm & Notify
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
