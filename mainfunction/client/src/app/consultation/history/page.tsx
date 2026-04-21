'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axios from 'axios';
import { FaHistory, FaRobot, FaUserMd, FaChevronRight, FaCalendarAlt, FaInfoCircle, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

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
            if (res.data.data.length > 0) {
                setSelectedConsultation(res.data.data[0]);
            }
        } catch (error) {
            console.error("Error fetching history", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="w-full min-h-screen">
                    {/* Header */}
                    <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <FaHistory className="text-primary text-2xl" />
                                </div>
                                Consultation History
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">Detailed logs of your past AI interactions and clinical reviews.</p>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            <span>Live Updates Enabled</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* List Column */}
                        <div className="lg:col-span-4 flex flex-col space-y-4">
                            <div className="card-editorial shadow-ambient border border-outline-variant flex flex-col h-[750px] overflow-hidden">
                                <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Logs</h3>
                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">{consultations.length} total</span>
                                </div>
                                <div className="overflow-y-auto flex-1 p-4 space-y-4 no-scrollbar">
                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="p-4 rounded-xl border border-outline-variant animate-pulse bg-gray-50/50">
                                                    <div className="h-3 w-24 bg-gray-200 rounded-md mb-3"></div>
                                                    <div className="h-4 w-full bg-gray-200 rounded-md"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : consultations.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 bg-surface-container-low rounded-xl flex items-center justify-center mx-auto mb-4 border border-outline-variant">
                                                <FaHistory className="text-gray-300 text-xl" />
                                            </div>
                                            <p className="text-gray-500 font-medium text-sm">No consultations found.</p>
                                            <a href="/consultation" className="text-primary font-bold text-xs mt-4 block hover:underline uppercase tracking-wider">Start Consultation</a>
                                        </div>
                                    ) : (
                                        consultations.map((item) => (
                                            <button
                                                key={item._id}
                                                onClick={() => setSelectedConsultation(item)}
                                                className={`w-full text-left p-5 rounded-xl transition-all border ${selectedConsultation?._id === item._id
                                                    ? 'bg-primary/[0.03] border-primary shadow-sm'
                                                    : 'bg-white border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        <FaCalendarAlt className="mr-1.5 text-primary/50" /> 
                                                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    {item.reviewStatus === 'reviewed' ? (
                                                        <span className="bg-tertiary/10 text-tertiary text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-widest border border-tertiary/20">
                                                            <FaUserMd /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-widest border border-orange-100">
                                                            <FaClock /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1 mb-1 leading-tight">
                                                    {item.symptoms}
                                                </p>
                                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                                    {item.aiSummary || "Reviewing recorded symptoms..."}
                                                </p>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detail Column */}
                        <div className="lg:col-span-8">
                            {selectedConsultation ? (
                                <div className="card-editorial shadow-ambient border border-outline-variant overflow-hidden animate-in fade-in slide-in-from-right-4 relative">
                                    {/* Decorator line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>

                                    <div className="p-8 md:p-10 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface-container-low/30">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10">Case Log #{selectedConsultation._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                                    <FaClock className="mr-1" /> {new Date(selectedConsultation.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Clinical Report Summary</h2>
                                        </div>
                                        <div className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm ${selectedConsultation.urgency === 'High' ? 'bg-rose-500 text-white shadow-rose-200' :
                                            selectedConsultation.urgency === 'Medium' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-primary text-white shadow-primary/20'
                                            }`}>
                                            {selectedConsultation.urgency === 'High' ? <FaExclamationCircle /> : <FaInfoCircle />}
                                            {selectedConsultation.urgency} Urgency Level
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-10 space-y-10 max-h-[650px] overflow-y-auto no-scrollbar">
                                        {/* Symptoms Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                            <div className="md:col-span-1">
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subjective</h3>
                                                <p className="text-[10px] font-medium text-gray-400">Patient Reported</p>
                                            </div>
                                            <div className="md:col-span-3">
                                                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant italic font-medium text-gray-800 leading-relaxed relative">
                                                    <span className="absolute -top-3 left-4 px-2 bg-white text-[10px] font-bold text-primary uppercase tracking-widest border border-outline-variant rounded-full">Symptom Log</span>
                                                    "{selectedConsultation.symptoms}"
                                                </div>
                                            </div>
                                        </div>

                                        {/* Doctor Review Section */}
                                        {selectedConsultation.reviewStatus === 'reviewed' && (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                <div className="md:col-span-1">
                                                    <h3 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">Assessment</h3>
                                                    <p className="text-[10px] font-medium text-tertiary/60">Verified Review</p>
                                                </div>
                                                <div className="md:col-span-3">
                                                    <div className="bg-tertiary/[0.03] rounded-xl p-8 border border-tertiary/20 shadow-sm relative group overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <FaUserMd size={100} />
                                                        </div>
                                                        <div className="flex items-center gap-4 mb-6 relative z-10">
                                                            <div className="w-12 h-12 bg-tertiary text-white rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-tertiary/20">
                                                                <FaUserMd />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-extrabold text-gray-900 text-lg">Doctor Verification</h4>
                                                                <div className="flex items-center text-[10px] font-bold text-tertiary uppercase tracking-widest">
                                                                    <FaCheckCircle className="mr-1" /> Licensed Practitioner Review
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-900 font-bold leading-relaxed text-base relative z-10">
                                                            "{selectedConsultation.doctorNotes}"
                                                        </p>
                                                        <div className="mt-8 pt-6 border-t border-tertiary/10 flex justify-between items-center relative z-10">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Digital Signature Verified</span>
                                                            <span className="text-[10px] font-bold text-gray-500">
                                                                {new Date(selectedConsultation.reviewDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Insights Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
                                            <div className="md:col-span-1">
                                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">AI Analysis</h3>
                                                <p className="text-[10px] font-medium text-primary/60">Automated Insights</p>
                                            </div>
                                            <div className="md:col-span-3">
                                                <div className={`p-8 rounded-xl border-2 transition-all duration-300 ${selectedConsultation.reviewStatus === 'reviewed' ? 'bg-gray-50/50 border-outline-variant opacity-70 grayscale-[0.3]' : 'bg-primary/[0.01] border-primary/10 shadow-sm'}`}>
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <FaRobot className="text-primary" size={18} />
                                                        <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest">Neural Summary</h4>
                                                    </div>
                                                    <p className="text-gray-800 mb-10 leading-relaxed font-medium text-base italic">"{selectedConsultation.aiSummary}"</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div>
                                                            <h4 className="font-extrabold text-gray-900 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center">
                                                                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                                                                Suggested Protocol
                                                            </h4>
                                                            <ul className="space-y-3">
                                                                {selectedConsultation.actions?.map((action: string, i: number) => (
                                                                    <li key={i} className="text-[13px] text-gray-600 flex items-start gap-3 font-medium">
                                                                        <FaChevronRight size={10} className="text-primary/40 mt-1 shrink-0" />
                                                                        {action}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-extrabold text-gray-900 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center">
                                                                <span className="w-1.5 h-1.5 bg-tertiary rounded-full mr-2"></span>
                                                                Care Recommendations
                                                            </h4>
                                                            <ul className="space-y-3">
                                                                {selectedConsultation.suggestedMedicines?.map((med: string, i: number) => (
                                                                    <li key={i} className="text-[13px] text-gray-600 flex items-start gap-3 font-medium">
                                                                        <div className="w-4 h-4 bg-tertiary/10 text-tertiary rounded-md flex items-center justify-center shrink-0 mt-0.5">
                                                                            <span className="text-[8px]">+</span>
                                                                        </div>
                                                                        {med}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[750px] flex flex-col items-center justify-center text-center p-12 card-editorial border-2 border-dashed border-outline-variant bg-surface-container-low shadow-none">
                                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center mb-6 shadow-ambient">
                                        <FaHistory className="text-4xl text-gray-100" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Consultation</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto font-medium">Choose a record from the history panel to view detailed AI analysis and verified doctor reviews.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
