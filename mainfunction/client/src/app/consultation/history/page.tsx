'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axios from 'axios';
import { FaHistory, FaRobot, FaUserMd, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

export default function ConsultationHistoryPage() {
    const { token } = useSelector((state: RootState) => state.auth);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);

    useEffect(() => {
        if (token) {
            fetchHistory();
        }
    }, [token]);

    const fetchHistory = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/consultation/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConsultations(res.data.data);
        } catch (error) {
            console.error("Error fetching history", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="w-full max-w-[1920px] mx-auto min-h-screen">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
                            <FaHistory className="text-[#7A8E6B]" /> My Health History
                        </h1>
                        <p className="text-gray-500 mt-2">View your past AI consultations and doctor reviews.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* List Column */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
                                Recent Consultations
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                {loading ? (
                                    <div className="p-4 text-center text-gray-400">Loading history...</div>
                                ) : consultations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        No consultations found. <br />
                                        <a href="/consultation" className="text-[#7A8E6B] font-bold mt-2 block hover:underline">Start a new one</a>
                                    </div>
                                ) : (
                                    consultations.map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => setSelectedConsultation(item)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedConsultation?._id === item._id
                                                ? 'bg-[#7A8E6B]/10 border-[#7A8E6B] shadow-md'
                                                : 'bg-white border-gray-100 hover:border-[#7A8E6B]/50 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <FaCalendarAlt /> {new Date(item.date).toLocaleDateString()}
                                                </span>
                                                {item.reviewStatus === 'reviewed' && (
                                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <FaUserMd /> Verified
                                                    </span>
                                                )}
                                                {item.reviewStatus === 'pending' && (
                                                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-gray-800 line-clamp-2 italic">
                                                "{item.symptoms}"
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Detail Column */}
                        <div className="lg:col-span-2">
                            {selectedConsultation ? (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-800">Consultation Details</h2>
                                            <p className="text-sm text-gray-500">{new Date(selectedConsultation.date).toLocaleString()}</p>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${selectedConsultation.urgency === 'High' ? 'bg-red-100 text-red-600' :
                                            selectedConsultation.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {selectedConsultation.urgency} Urgency
                                        </span>
                                    </div>

                                    <div className="p-8 space-y-8 h-[630px] overflow-y-auto">
                                        {/* Symptoms */}
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">You Reported</h3>
                                            <p className="text-gray-700 text-base italic">"{selectedConsultation.symptoms}"</p>
                                        </div>

                                        {/* Doctor Review Section - Prominent if exists */}
                                        {selectedConsultation.reviewStatus === 'reviewed' && (
                                            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl">
                                                        <FaUserMd />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-purple-900 text-base">Doctor Verification</h3>
                                                        <p className="text-purple-700 text-xs">Official Medical Review</p>
                                                    </div>
                                                </div>
                                                <p className="text-purple-900 font-medium leading-relaxed">
                                                    "{selectedConsultation.doctorNotes}"
                                                </p>
                                                <p className="text-xs text-purple-400 mt-4 text-right">
                                                    Reviewed on {new Date(selectedConsultation.reviewDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}

                                        {/* AI Analysis */}
                                        <div className={`p-6 rounded-2xl border ${selectedConsultation.reviewStatus === 'reviewed' ? 'bg-gray-50 border-gray-100 opacity-80' : 'bg-blue-50/50 border-blue-100'}`}>
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase mb-4">
                                                <FaRobot /> AI Analysis
                                            </h3>
                                            <p className="text-gray-800 mb-6 leading-relaxed">{selectedConsultation.aiSummary}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-bold text-gray-700 text-xs uppercase mb-2">Suggested Actions</h4>
                                                    <ul className="space-y-1">
                                                        {selectedConsultation.actions?.map((action: string, i: number) => (
                                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></span>
                                                                {action}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-700 text-xs uppercase mb-2">Potential Medicines (OTC)</h4>
                                                    <ul className="space-y-1">
                                                        {selectedConsultation.suggestedMedicines?.map((med: string, i: number) => (
                                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></span>
                                                                {med}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                                    <FaHistory className="text-6xl text-gray-200 mb-4" />
                                    <h3 className="text-base font-bold text-gray-500">Select a Consultation</h3>
                                    <p>Click on any item from the list to view full details and doctor reviews.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
