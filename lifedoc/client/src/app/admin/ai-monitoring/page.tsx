'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaRobot, FaCoins, FaHistory, FaSearch, FaEye } from 'react-icons/fa';

export default function AIMonitoring() {
    const { token } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/ai/logs`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setStats(statsRes.data);
                setLogs(logsRes.data);
            } catch (error) {
                console.error("Error fetching AI data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">AI Usage Monitor</h1>
                    <p className="text-gray-500">Track token consumption and consultation quality.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 p-3 rounded-lg"><FaRobot className="text-2xl" /></div>
                            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Total</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1">{stats?.totalConsultations || 0}</h3>
                        <p className="text-indigo-100">Consultations Processed</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 p-3 rounded-lg"><FaCoins className="text-2xl" /></div>
                            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">Usage</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1">{stats?.totalTokens?.toLocaleString() || 0}</h3>
                        <p className="text-emerald-100">Total Tokens Consumed</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg"><FaHistory className="text-2xl" /></div>
                            <span className="text-sm font-medium text-gray-400">Est. Cost</span>
                        </div>
                        <h3 className="text-4xl font-bold mb-1 text-gray-800">₹{stats?.estimatedCostINR || '0.00'}</h3>
                        <p className="text-gray-500 text-sm">(${stats?.estimatedCostUSD || '0.00'} USD)</p>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Recent Consultations</h3>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500 animate-pulse">Loading AI Data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Query</th>
                                        <th className="px-6 py-4">Urgency</th>
                                        <th className="px-6 py-4">Tokens</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log: any) => (
                                        <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {log.user?.email || 'Unknown User'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-xs" title={log.symptoms}>
                                                {log.symptoms}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.urgency === 'High' ? 'bg-red-100 text-red-600' :
                                                    log.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                    {log.urgency}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {log.tokenUsage?.totalTokens || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(log.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-fade-in-up">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white">
                                <div>
                                    <h3 className="font-bold text-xl">Consultation Details</h3>
                                    <p className="text-gray-500 text-sm">{new Date(selectedLog.date).toLocaleString()}</p>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">User Query</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg text-gray-800">{selectedLog.symptoms}</div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-indigo-600 mb-2">AI Summary</h4>
                                    <div className="bg-indigo-50 p-4 rounded-lg text-indigo-900 leading-relaxed">{selectedLog.aiSummary}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-bold text-gray-700 mb-2">Action Items</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            {selectedLog.actions?.map((act: string, i: number) => <li key={i}>{act}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-700 mb-2">Lifestyle Advice</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            {selectedLog.lifestyleAdvice?.map((adv: string, i: number) => <li key={i}>{adv}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
