'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchLabReportById, deleteLabReport } from '@/store/slices/labReportsSlice';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import LabReportsSkeleton from '@/components/dashboard/LabReportsSkeleton';
import { FaArrowLeft, FaFlask, FaDownload, FaMagic, FaCalendarAlt, FaNotesMedical, FaTrash } from 'react-icons/fa';

export default function LabReportDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const { currentReport, loading, error } = useSelector((state: RootState) => state.labReports);

    useEffect(() => {
        if (id) {
            dispatch(fetchLabReportById(id as string));
        }
    }, [dispatch, id]);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this lab report? This action cannot be undone.")) {
            if (id) {
                const result = await dispatch(deleteLabReport(id as string));
                if (deleteLabReport.fulfilled.match(result)) {
                    router.push('/lab-reports');
                } else {
                    alert("Failed to delete report.");
                }
            }
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <LabReportsSkeleton />
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (error || !currentReport) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="text-center py-20 bg-white rounded-xl shadow-ambient border border-gray-100 max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <FaFlask className="text-3xl text-red-400" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#2c3436] mb-4">{error || 'Diagnostic Record Missing'}</h2>
                        <button 
                            onClick={() => router.back()} 
                            className="btn-primary !rounded-xl px-10"
                        >
                            Return to Archive
                        </button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="w-full">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.back()}
                                className="w-10 h-10 flex items-center justify-center text-tertiary/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group mr-5"
                            >
                                <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <div>
                                <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
                                    Clinical Archive • Diagnostic Analysis
                                </p>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                                    {currentReport.testType} <span className="text-primary">Analysis</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 w-full md:w-auto">
                            {currentReport.fileUrl && (
                                <a
                                    href={currentReport.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary !rounded-xl flex items-center justify-center space-x-2 flex-1 md:flex-none"
                                >
                                    <FaDownload />
                                    <span>Original File</span>
                                </a>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Delete Record"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Analysis Content */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Summary & Metadata Card */}
                            <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-8 flex items-center border-b border-gray-50 pb-4 relative">
                                    <FaFlask className="mr-3 text-tertiary/20 text-lg" /> Diagnostic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                    <div>
                                        <p className="text-[10px] font-black text-tertiary/30 uppercase tracking-widest mb-4">Consultation Details</p>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                                    <FaCalendarAlt />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-tertiary/40 uppercase tracking-widest">Report Date</p>
                                                    <p className="text-sm font-extrabold text-[#2c3436]">
                                                        {new Date(currentReport.reportDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {currentReport.parsedResults?.summary && (
                                        <div className="bg-surface-container-low p-5 rounded-xl border border-primary/10">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center">
                                                <FaMagic className="mr-2" /> AI Clinical Pulse
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="text-tertiary/60 font-bold">Total Parameters</span>
                                                    <span className="font-extrabold text-[#2c3436]">{currentReport.parsedResults.summary.totalTests}</span>
                                                </div>
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="text-tertiary/60 font-bold">Anomalous Findings</span>
                                                    <span className={`font-extrabold ${currentReport.parsedResults.summary.abnormalTests > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {currentReport.parsedResults.summary.abnormalTests}
                                                    </span>
                                                </div>
                                                {currentReport.parsedResults.summary.criticalFindings && (
                                                    <div className="mt-3 py-1 px-3 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg text-center animate-pulse">
                                                        Critical Action Required
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Results Table */}
                            <div className="bg-white rounded-xl shadow-ambient border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-surface-container-low">
                                    <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest flex items-center">
                                        <FaFlask className="mr-3 text-primary/40 text-lg" /> Clinical Parameters
                                    </h3>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    {currentReport.parsedResults?.tests ? (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-tertiary/30 uppercase tracking-[0.2em] border-b border-gray-50 bg-gray-50/30">
                                                    <th className="py-5 px-8">Test Description</th>
                                                    <th className="py-5 px-4">Value</th>
                                                    <th className="py-5 px-4">Reference</th>
                                                    <th className="py-5 px-8 text-right">Interpretation</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {currentReport.parsedResults.tests.map((test: any, index: number) => {
                                                    const isAbnormal = test.interpretation === 'Abnormal' || test.interpretation === 'High' || test.interpretation === 'Low';
                                                    return (
                                                        <tr key={index} className="group hover:bg-primary/[0.02] transition-colors">
                                                            <td className="py-6 px-8">
                                                                <span className="text-sm font-extrabold text-[#2c3436] group-hover:text-primary transition-colors">{test.testName || 'Unknown'}</span>
                                                                <span className="block text-[10px] text-tertiary/40 font-bold uppercase tracking-widest mt-1">Laboratory Metric</span>
                                                            </td>
                                                            <td className="py-6 px-4">
                                                                <span className={`text-base font-black ${isAbnormal ? 'text-red-500' : 'text-[#2c3436]'}`}>
                                                                    {test.resultValue || '-'} <span className="text-[10px] font-bold text-tertiary/30 ml-1">{test.unit}</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-6 px-4">
                                                                <span className="text-xs font-bold text-tertiary/50">{test.referenceRange || 'N/A'}</span>
                                                            </td>
                                                            <td className="py-6 px-8 text-right">
                                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                                                    isAbnormal ? 'bg-red-50 text-red-500 border-red-100 shadow-sm shadow-red-100/50' : 'bg-green-50 text-green-600 border-green-100'
                                                                }`}>
                                                                    {test.interpretation || 'Normal'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-12 text-center bg-gray-50/50">
                                            <p className="text-tertiary/30 text-xs font-black uppercase tracking-widest">No detailed parameters available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Context & Notes */}
                        <div className="space-y-8">
                            {/* Patient Context */}
                            {currentReport.parsedResults?.patientDetails && (
                                <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                    <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6">Patient Context</h3>
                                    <div className="space-y-4">
                                        {Object.entries(currentReport.parsedResults.patientDetails).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center text-[11px] border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                                <span className="text-tertiary/40 font-bold uppercase tracking-wider capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="font-extrabold text-[#2c3436]">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clinical Notes */}
                            <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                                    <FaNotesMedical className="mr-3 text-primary/40 text-lg" /> Clinical Notes
                                </h3>
                                <p className="text-tertiary/70 leading-relaxed italic font-medium text-sm border-l-4 border-primary/20 pl-6 py-2">
                                    "{currentReport.notes || "No clinician notes available for this diagnostic report."}"
                                </p>
                            </div>

                            {/* Document Preview */}
                            {currentReport.fileUrl && (
                                <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                    <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6">Original Document</h3>
                                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-surface-container-low group cursor-pointer relative" onClick={() => window.open(currentReport.fileUrl, '_blank')}>
                                        <img
                                            src={currentReport.fileUrl}
                                            alt="Lab Report"
                                            className="w-full h-auto object-contain max-h-[300px] transition-all duration-500 group-hover:scale-105 p-4"
                                        />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white p-3 rounded-xl shadow-xl">
                                                <FaDownload className="text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
