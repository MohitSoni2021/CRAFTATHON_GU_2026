'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaUser, FaStethoscope, FaFlask, FaFileMedical, FaHeartbeat, FaCalendarAlt, FaTint, FaRulerVertical, FaWeight } from 'react-icons/fa';

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#7A8E6B]/30 border-t-[#7A8E6B] rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
                        <FaUser className="text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-gray-500">{error || "The profile you are looking for does not exist or is not available."}</p>
                </div>
            </div>
        );
    }

    const { user, labReports, doctorReports, measurements } = data;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="bg-[#7A8E6B] h-32 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg">
                                <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-4xl font-bold text-[#7A8E6B]">
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
                                <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">Patient Profile</span>
                                    {user?.age && <span className="text-gray-400">• {user.age} Years Old</span>}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {user?.profile?.bloodGroup && (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold">
                                        <FaTint /> {user.profile.bloodGroup}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Gender</p>
                                <p className="font-semibold text-gray-900 capitalize">{user?.profile?.gender || '--'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><FaRulerVertical /> Height</p>
                                <p className="font-semibold text-gray-900">{user?.profile?.height ? `${user.profile.height} cm` : '--'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><FaWeight /> Weight</p>
                                <p className="font-semibold text-gray-900">{user?.profile?.weight ? `${user.profile.weight} kg` : '--'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Conditions</p>
                                <p className="font-semibold text-gray-900 truncate" title={user?.profile?.chronicConditions?.join(', ')}>
                                    {user?.profile?.chronicConditions?.length > 0 ? user.profile.chronicConditions.join(', ') : 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Health Story */}
                {user?.profile?.storyDesc && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#7A8E6B]/10 rounded-full flex items-center justify-center text-[#7A8E6B]">
                                <FaStethoscope />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Health Summary</h2>
                        </div>
                        <div className="bg-[#7A8E6B]/5 p-6 rounded-2xl border border-[#7A8E6B]/10">
                            <p className="text-gray-800 leading-relaxed italic">"{user.profile.storyDesc}"</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Lab Reports */}
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <FaFlask />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Lab Reports</h2>
                        </div>
                        <div className="space-y-4">
                            {labReports && labReports.length > 0 ? (
                                labReports.map((report: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                                            {report.testType?.charAt(0) || 'L'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900">{report.testType || 'Lab Test'}</h4>
                                            <p className="text-sm text-gray-500">{new Date(report.reportDate).toLocaleDateString()}</p>
                                            {report.notes && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{report.notes}</p>}
                                        </div>
                                        {report.fileUrl && (
                                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-semibold hover:underline self-center">
                                                View
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No recent lab reports.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Doctor Visits */}
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                <FaFileMedical />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Doctor Visits</h2>
                        </div>
                        <div className="space-y-4">
                            {doctorReports && doctorReports.length > 0 ? (
                                doctorReports.map((report: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">
                                            Dr
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900">{report.doctorName || 'Doctor Visit'}</h4>
                                            <p className="text-sm text-gray-500">{new Date(report.visitDate).toLocaleDateString()}</p>
                                            {report.diagnosis && report.diagnosis.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {report.diagnosis.map((d: string, i: number) => (
                                                        <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">{d}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No recent doctor visits.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Measurements */}
                <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                            <FaHeartbeat />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Measurements</h2>
                    </div>

                    {measurements && measurements.length > 0 ? (
                        <div>
                            {/* Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                                {Object.keys(measurements.reduce((acc: any, m: any) => {
                                    m.readings.forEach((r: any) => acc[r.type] = true);
                                    return acc;
                                }, {})).map((type: string) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveTab(type)}
                                        className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap capitalize transition-all flex items-center gap-2 ${activeTab === type
                                            ? 'bg-[#7A8E6B] text-white shadow-md shadow-[#7A8E6B]/20'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type === 'glucose' && <FaTint className={activeTab === type ? 'text-white' : 'text-red-500'} />}
                                        {type === 'weight' && <FaWeight className={activeTab === type ? 'text-white' : 'text-blue-500'} />}
                                        {type === 'bloodPressure' && <FaHeartbeat className={activeTab === type ? 'text-white' : 'text-red-600'} />}
                                        {type.replace(/([A-Z])/g, ' $1').trim()}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                {Object.entries(measurements.reduce((acc: any, m: any) => {
                                    m.readings.forEach((r: any) => {
                                        if (!acc[r.type]) acc[r.type] = [];
                                        acc[r.type].push({ date: m.date, ...r });
                                    });
                                    return acc;
                                }, {})).filter(([type]: [string, any]) => activeTab === type)
                                    .map(([type, readings]: [string, any]) => (
                                        <div key={type} className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100">
                                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {readings.map((r: any, idx: number) => (
                                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                                    {new Date(r.date).toLocaleDateString()}
                                                                </td>
                                                                <td className="py-4 px-6 text-sm font-bold text-gray-900">
                                                                    {typeof r.value === 'object' ? `${r.value.systolic}/${r.value.diastolic}` : r.value}
                                                                </td>
                                                                <td className="py-4 px-6 text-sm text-gray-500">
                                                                    {r.unit || '-'}
                                                                </td>
                                                                <td className="py-4 px-6 text-sm text-gray-500 italic">
                                                                    {r.notes || '-'}
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
                        <p className="text-gray-500 text-center py-4">No recent measurements recorded.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
