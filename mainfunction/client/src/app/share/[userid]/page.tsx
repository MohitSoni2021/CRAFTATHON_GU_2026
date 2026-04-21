'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaUser, FaStethoscope, FaFlask, FaFileMedical, FaHeartbeat, FaTint, FaRulerVertical, FaWeight, FaShareAlt } from 'react-icons/fa';

export default function SharedProfile() {
    const params = useParams();
    const userId = params.userid;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('');

    useEffect(() => {
        if (data && data.measurements && data.measurements.length > 0) {
            const types = Object.keys(data.measurements.reduce((acc: any, m: any) => {
                m.readings.forEach((r: any) => acc[r.type] = true);
                return acc;
            }, {}));
            if (types.length > 0) {
                setActiveTab(types[0]);
            }
        }
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/share/${userId}`);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Failed to load profile');
                }
            } catch (err) {
                console.error("Error fetching shared profile", err);
                setError('Profile not found or server error');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Profile Matrix...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-4">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto text-red-500 mb-6 border border-red-100">
                        <FaUser className="text-2xl" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-sm font-medium text-gray-500">{error || "The requested clinical profile does not exist or access has been revoked."}</p>
                </div>
            </div>
        );
    }

    const { user, labReports, doctorReports, measurements } = data;

    return (
        <div className="min-h-screen bg-[#f8f9fc] py-12 px-4 sm:px-6 lg:px-8">
            {/* The user requested to KEEP the current width constraints, NOT full width. */}
            <div className="max-w-5xl mx-auto space-y-8">

                <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start opacity-70">
                    <FaShareAlt className="text-gray-400" size={12}/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Publicly Shared Clinical Record</span>
                </div>

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-primary to-primary/80 h-32 relative">
                        <div className="absolute inset-0 bg-white/5 pattern-dots" />
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 bg-white rounded-xl p-1.5 shadow-lg shadow-primary/10 border border-white">
                                <div className="w-full h-full rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center text-4xl font-black text-primary/40 border border-gray-100">
                                    {user?.profileImage ? (
                                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-20 pb-8 px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        Patient Profile
                                    </span>
                                    {user?.age && <span className="text-gray-400 font-bold text-sm">• {user.age} Years Old</span>}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {user?.profile?.bloodGroup && (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase">
                                        <FaTint size={10} /> {user.profile.bloodGroup}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Gender</p>
                                <p className="font-black text-gray-900 capitalize">{user?.profile?.gender || '--'}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"><FaRulerVertical /> Height</p>
                                <p className="font-black text-gray-900">{user?.profile?.height ? `${user.profile.height} cm` : '--'}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"><FaWeight /> Weight</p>
                                <p className="font-black text-gray-900">{user?.profile?.weight ? `${user.profile.weight} kg` : '--'}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Conditions</p>
                                <p className="font-black text-gray-900 truncate" title={user?.profile?.chronicConditions?.join(', ')}>
                                    {user?.profile?.chronicConditions?.length > 0 ? user.profile.chronicConditions.join(', ') : 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Health Story */}
                {user?.profile?.storyDesc && (
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                                <FaStethoscope />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Health Summary</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Patient Context</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative">
                            <div className="absolute top-4 left-4 text-4xl text-gray-200 font-serif leading-none">"</div>
                            <p className="text-gray-700 font-medium leading-relaxed italic relative z-10 pt-2 px-4">{user.profile.storyDesc}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Lab Reports */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <FaFlask />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Diagnostic Assays</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recent Lab Reports</p>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {labReports && labReports.length > 0 ? (
                                labReports.map((report: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-5 rounded-xl hover:bg-blue-50/50 transition-colors border border-gray-100 hover:border-blue-100 group">
                                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-600 font-black text-lg shrink-0 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                            {report.testType?.charAt(0) || 'L'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{report.testType || 'Lab Test'}</h4>
                                            <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                {new Date(report.reportDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                            {report.notes && <p className="text-xs font-medium text-gray-500 mt-2 line-clamp-2">{report.notes}</p>}
                                        </div>
                                        {report.fileUrl && (
                                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors self-center">
                                                View PDF
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No laboratory records</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Doctor Visits */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                                <FaFileMedical />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Clinical Encounters</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Doctor Visits</p>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {doctorReports && doctorReports.length > 0 ? (
                                doctorReports.map((report: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-5 rounded-xl hover:bg-purple-50/50 transition-colors border border-gray-100 hover:border-purple-100 group">
                                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-purple-600 font-black text-sm shrink-0 shadow-sm group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors">
                                            MD
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{report.doctorName || 'Doctor Visit'}</h4>
                                            <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                {new Date(report.visitDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                            {report.diagnosis && report.diagnosis.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {report.diagnosis.map((d: string, i: number) => (
                                                        <span key={i} className="text-[10px] font-black tracking-widest uppercase bg-purple-50 border border-purple-100 text-purple-700 px-2 py-1 rounded-lg">{d}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No clinical visits recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Measurements */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                        <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 shadow-sm">
                            <FaHeartbeat />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Biometric Tracking</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recent Measurements</p>
                        </div>
                    </div>

                    {measurements && measurements.length > 0 ? (
                        <div>
                            {/* Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
                                {Object.keys(measurements.reduce((acc: any, m: any) => {
                                    m.readings.forEach((r: any) => acc[r.type] = true);
                                    return acc;
                                }, {})).map((type: string) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveTab(type)}
                                        className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border ${activeTab === type
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                                            }`}
                                    >
                                        {type === 'glucose' && <FaTint size={12} className={activeTab === type ? 'text-white' : 'text-red-400'} />}
                                        {type === 'weight' && <FaWeight size={12} className={activeTab === type ? 'text-white' : 'text-blue-400'} />}
                                        {type === 'bloodPressure' && <FaHeartbeat size={12} className={activeTab === type ? 'text-white' : 'text-red-500'} />}
                                        {type.replace(/([A-Z])/g, ' $1').trim()}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                {Object.entries(measurements.reduce((acc: any, m: any) => {
                                    m.readings.forEach((r: any) => {
                                        if (!acc[r.type]) acc[r.type] = [];
                                        acc[r.type].push({ date: m.date, ...r });
                                    });
                                    return acc;
                                }, {})).filter(([type]: [string, any]) => activeTab === type)
                                    .map(([type, readings]: [string, any]) => (
                                        <div key={type} className="p-0">
                                            <div className="overflow-x-auto custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100">
                                                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date Recorded</th>
                                                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Value Matrix</th>
                                                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Metric</th>
                                                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Clinical Notes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {readings.map((r: any, idx: number) => (
                                                            <tr key={idx} className="hover:bg-[#f8f9fc] transition-colors group">
                                                                <td className="py-4 px-6">
                                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                                        {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-sm font-black text-gray-900">
                                                                        {typeof r.value === 'object' ? `${r.value.systolic}/${r.value.diastolic}` : r.value}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                    {r.unit || '-'}
                                                                </td>
                                                                <td className="py-4 px-6 text-sm font-medium text-gray-600 italic">
                                                                    {r.notes || <span className="text-gray-300">No context provided</span>}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <FaHeartbeat className="mx-auto text-4xl text-gray-200 mb-4" />
                            <p className="text-sm font-bold text-gray-500">No recent biometric measurements processed.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
