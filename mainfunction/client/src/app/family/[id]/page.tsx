'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaFilePrescription, FaNotesMedical, FaVial, FaMicrophone, FaHeartbeat, FaBrain, FaExclamationTriangle } from 'react-icons/fa';

import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MemberHealthPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [data, setData] = useState<any>({ prescriptions: [], labReports: [], doctorReports: [], analysis: null, healthTrends: { bp: [], weight: [], glucose: [] } });
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const generateAnalysis = async () => {
        setAnalyzing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/family/member/${id}/analyze`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setData((prev: any) => ({ ...prev, analysis: res.data.analysis }));
            }
        } catch (error) {
            console.error("AI Analysis failed", error);
            alert("Failed to analyze health data.");
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        if (id) fetchHealthData();
    }, [id]);

    const fetchHealthData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/family/member/${id}/health`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching health data", error);
        } finally {
            setLoading(false);
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newVital, setNewVital] = useState({ type: 'glucose', value: '', systolic: '', diastolic: '', date: new Date().toISOString().split('T')[0] });

    const handleAddVital = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let payload: any = { type: newVital.type, date: newVital.date };
            if (newVital.type === 'bloodPressure') {
                payload.readings = [{ type: 'bloodPressure', value: { systolic: Number(newVital.systolic), diastolic: Number(newVital.diastolic) } }];
            } else {
                payload.readings = [{ type: newVital.type, value: Number(newVital.value) }];
            }

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/family/member/${id}/measurement`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowAddModal(false);
            setNewVital({ type: 'glucose', value: '', systolic: '', diastolic: '', date: new Date().toISOString().split('T')[0] });
            fetchHealthData();
            alert("Health record added successfully!");
        } catch (error) {
            console.error("Error adding vital", error);
            alert("Failed to add record.");
        }
    };

    const speakSummary = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-[1920px] mx-auto space-y-8 bg-[#f8f9fc] min-h-screen">
                <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors font-semibold text-sm">
                    <FaArrowLeft />
                    <span>Return to Network</span>
                </button>

                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Profile</h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">Reviewing member health intelligence and diagnostics.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl flex items-center space-x-3 text-sm font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
                    >
                        <FaHeartbeat size={16} />
                        <span>Log Vital Sign</span>
                    </button>
                </div>

                {/* Add Vitals Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-8 w-full max-w-md relative animate-in zoom-in-95 duration-200 border border-gray-100 shadow-2xl">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-xl flex items-center justify-center transition-colors">
                                &times;
                            </button>
                            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2"><FaHeartbeat className="text-primary"/> Log Vital Record</h3>
                            <form onSubmit={handleAddVital} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Metric Type</label>
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date Recorded</label>
                                    <input
                                        type="date"
                                        value={newVital.date}
                                        onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium transition-all"
                                        required
                                    />
                                </div>

                                {newVital.type === 'bloodPressure' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Systolic (mmHg)</label>
                                            <input type="number" required value={newVital.systolic} onChange={e => setNewVital({ ...newVital, systolic: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium placeholder-gray-400 transition-all" placeholder="120" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Diastolic (mmHg)</label>
                                            <input type="number" required value={newVital.diastolic} onChange={e => setNewVital({ ...newVital, diastolic: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium placeholder-gray-400 transition-all" placeholder="80" />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Value ({newVital.type === 'weight' ? 'kg' : 'mg/dL'})</label>
                                        <input type="number" step="0.1" required value={newVital.value} onChange={e => setNewVital({ ...newVital, value: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 font-medium placeholder-gray-400 transition-all" placeholder={`Enter ${newVital.type} value`} />
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-6">
                                    Commit Record to System
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* AI Health Guardian Section */}
                <div className="bg-gray-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h2 className="text-3xl font-black flex items-center gap-3">
                                    <FaBrain className="text-primary"/> AI Sentinel Analysis
                                </h2>
                                <p className="text-gray-400 mt-2 font-medium">Algorithmic risk evaluation based on recent biometric trends.</p>
                            </div>
                            {!data.analysis ? (
                                <button
                                    onClick={generateAnalysis}
                                    disabled={analyzing}
                                    className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-3"
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                            Processing Matrix...
                                        </>
                                    ) : (
                                        <>
                                            <FaBrain /> Initiate Scan
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className={`px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-inner border ${data.analysis.riskLevel === 'High' ? 'text-red-400 bg-red-900/30 border-red-800/50' : 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50'}`}>
                                    {data.analysis.riskLevel === 'High' ? <FaExclamationTriangle /> : <FaHeartbeat />}
                                    Risk Status: {data.analysis.riskLevel}
                                </div>
                            )}
                        </div>

                        {data.analysis && (
                            <div className="mt-8 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <p className="text-lg leading-relaxed font-medium text-gray-200 border-l-4 border-primary pl-4 py-1">"{data.analysis.summary}"</p>

                                <div className="mt-6 grid md:grid-cols-2 gap-6">
                                    <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                                        <h3 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Clinical Recommendations
                                        </h3>
                                        <ul className="space-y-3">
                                            {data.analysis.actionItems?.map((action: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-300 items-start">
                                                    <span className="text-primary mt-1">✓</span>
                                                    <span>{action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                                        <h3 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Consultation Queries
                                        </h3>
                                        <ul className="space-y-3">
                                            {data.analysis.doctorQuestions?.map((q: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-300 items-start">
                                                    <span className="text-amber-500 mt-1">?</span>
                                                    <span>{q}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Health Trends Graphs */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <FaNotesMedical className="text-primary" /> Longitudinal Biometrics
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Weight Graph */}
                        <div className="h-72 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Body Mass Index (kg)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.healthTrends?.weight || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis domain={['auto', 'auto']} fontSize={10} axisLine={false} tickLine={false} dx={-10} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelFormatter={(d) => new Date(d).toLocaleDateString()} 
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Glucose Graph */}
                        <div className="h-72 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Metabolic Glucose (mg/dL)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.healthTrends?.glucose || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis domain={['auto', 'auto']} fontSize={10} axisLine={false} tickLine={false} dx={-10} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelFormatter={(d) => new Date(d).toLocaleDateString()} 
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {/* BP Graph */}
                        <div className="h-72 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Vascular Pressure</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.healthTrends?.bp || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis domain={['auto', 'auto']} fontSize={10} axisLine={false} tickLine={false} dx={-10} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelFormatter={(d) => new Date(d).toLocaleDateString()} 
                                    />
                                    <Line type="monotone" dataKey="value.systolic" name="SYS" stroke="#ef4444" strokeWidth={3} dot={{ r: 3, fill: '#fff' }} />
                                    <Line type="monotone" dataKey="value.diastolic" name="DIA" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3, fill: '#fff' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Doctor Reports */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-50">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FaNotesMedical />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Clinical Encounters</h2>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Physician Notes</p>
                                </div>
                            </div>
                            {data.doctorReports.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <FaNotesMedical className="mx-auto text-gray-300 text-2xl mb-2" />
                                    <p className="text-gray-500 font-medium text-sm">No clinical encounters recorded.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.doctorReports.map((report: any) => (
                                        <div key={report._id} className="p-5 border border-gray-100 rounded-xl bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{report.doctorName}</h3>
                                                    <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                        {new Date(report.visitDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <button onClick={() => speakSummary(`Doctor visit with ${report.doctorName}. Diagnosis: ${report.diagnosis}`)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center transition-colors">
                                                    <FaMicrophone size={12}/>
                                                </button>
                                            </div>
                                            <p className="text-gray-600 text-sm font-medium leading-relaxed">{report.diagnosis}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Prescriptions */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-50">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FaFilePrescription />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Active Regimens</h2>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pharmacology</p>
                                </div>
                            </div>
                            {data.prescriptions.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <FaFilePrescription className="mx-auto text-gray-300 text-2xl mb-2" />
                                    <p className="text-gray-500 font-medium text-sm">No active prescriptions.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.prescriptions.map((script: any) => (
                                        <div key={script._id} className="p-5 border border-gray-100 rounded-xl bg-white hover:border-emerald-200 hover:shadow-md transition-all group">
                                            <div className="mb-3">
                                                <h3 className="font-black text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{script.doctorName || 'Attending Physician'}</h3>
                                                <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    {new Date(script.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {script.medicines?.map((m: any, i: number) => (
                                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        {typeof m === 'string' ? m : m.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lab Reports */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-50">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FaVial />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Diagnostic Assays</h2>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Laboratory Results</p>
                                </div>
                            </div>
                            {data.labReports.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <FaVial className="mx-auto text-gray-300 text-2xl mb-2" />
                                    <p className="text-gray-500 font-medium text-sm">No laboratory results processed.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.labReports.map((report: any) => {
                                        let displayResult = 'View Full Matrix';
                                        let isAbnormal = false;
                                        if (report.parsedResults) {
                                            if (report.parsedResults.summary && report.parsedResults.summary.abnormalTests > 0) {
                                                displayResult = `${report.parsedResults.summary.abnormalTests} Flagged Markers`;
                                                isAbnormal = true;
                                            } else if (report.parsedResults.tests && report.parsedResults.tests.length > 0) {
                                                displayResult = report.parsedResults.tests[0].resultValue || 'Available';
                                            } else if (Object.keys(report.parsedResults).length > 0) {
                                                const firstKey = Object.keys(report.parsedResults)[0];
                                                if (typeof report.parsedResults[firstKey] !== 'object') {
                                                    displayResult = String(report.parsedResults[firstKey]);
                                                }
                                            }
                                        }

                                        return (
                                            <Link href={`/lab-reports/${report._id}`} key={report._id} className="block p-5 border border-gray-100 rounded-xl bg-white hover:border-purple-200 hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{report.testType || 'Comprehensive Panel'}</h3>
                                                        <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                            {new Date(report.reportDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isAbnormal ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600'}`}>
                                                        {isAbnormal ? <FaExclamationTriangle size={12} /> : <FaVial size={12}/>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status:</span>
                                                    <span className={`text-xs font-black ${isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>{displayResult}</span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
