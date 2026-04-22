'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchLabReports } from '@/store/slices/labReportsSlice';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import LabReportsSkeleton from '@/components/dashboard/LabReportsSkeleton';
import Link from 'next/link';
import { FaPlus, FaFlask, FaDownload } from 'react-icons/fa';

export default function LabReportsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { reports, loading } = useSelector((state: RootState) => state.labReports);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchLabReports(user.id));
        }
    }, [dispatch, user]);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="w-full">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                        <div>
                            <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
                                Clinical Archive • Diagnostics
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                                Lab <span className="text-primary">Reports</span>
                            </h1>
                            <p className="text-tertiary/70 text-sm font-medium mt-1">Manage and track your diagnostic medical test results.</p>
                        </div>
                        <Link
                            href="/lab-reports/new"
                            className="btn-primary !rounded-xl flex items-center justify-center space-x-2 w-full md:w-auto"
                        >
                            <FaPlus />
                            <span>Upload Report</span>
                        </Link>
                    </header>

                    {loading ? (
                        <LabReportsSkeleton />
                    ) : reports.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-ambient border border-gray-100">
                            <div className="w-20 h-20 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <FaFlask className="text-3xl text-primary/40" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2c3436]">No diagnostics found</h3>
                            <p className="text-tertiary/60 mt-2 font-medium mb-8">You haven't uploaded any laboratory reports to your clinical archive yet.</p>
                            <Link
                                href="/lab-reports/new"
                                className="btn-primary !rounded-xl px-10"
                            >
                                Upload your first report
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reports.map((report) => (
                                <Link href={`/lab-reports/${report._id}`} key={report._id} className="block group">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-ambient group-hover:border-primary/20 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110"></div>
                                        
                                        <div className="flex justify-between items-start mb-6 relative">
                                            <div className="p-4 bg-primary/5 rounded-xl text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                                                <FaFlask className="text-2xl" />
                                            </div>
                                            {report.fileUrl && (
                                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-tertiary/5 text-tertiary/40 group-hover:bg-tertiary group-hover:text-white transition-all">
                                                    <FaDownload className="text-xs" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-6 relative">
                                            <h3 className="text-lg font-extrabold text-[#2c3436] group-hover:text-primary transition-colors line-clamp-1">{report.testType}</h3>
                                            <p className="text-[10px] font-black text-tertiary/40 uppercase tracking-widest mt-1">
                                                {new Date(report.reportDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="flex-grow space-y-4 relative">
                                            {report.parsedResults?.labReport ? (
                                                <div className="bg-surface-container-low rounded-xl p-4 border border-gray-50 group-hover:bg-white group-hover:border-primary/10 transition-colors">
                                                    <p className="text-[9px] font-black text-tertiary/30 uppercase tracking-widest mb-3">Diagnostic Context</p>
                                                    <div className="space-y-2">
                                                        {report.parsedResults.labReport.labName && (
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="text-tertiary/40 font-bold uppercase tracking-wider">Facility</span>
                                                                <span className="font-extrabold text-[#2c3436] text-right truncate ml-4">{report.parsedResults.labReport.labName}</span>
                                                            </div>
                                                        )}
                                                        {report.parsedResults.labReport.referredByDoctor && (
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="text-tertiary/40 font-bold uppercase tracking-wider">Clinician</span>
                                                                <span className="font-extrabold text-[#2c3436] text-right truncate ml-4">{report.parsedResults.labReport.referredByDoctor}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : report.parsedResults && Object.keys(report.parsedResults).length > 0 && (
                                                <div className="bg-surface-container-low rounded-xl p-4 border border-gray-50 group-hover:bg-white group-hover:border-primary/10 transition-colors">
                                                    <p className="text-[9px] font-black text-tertiary/30 uppercase tracking-widest mb-3">Key Indicators</p>
                                                    <div className="space-y-2">
                                                        {Object.entries(report.parsedResults).slice(0, 2).map(([key, value]) => {
                                                            if (typeof value === 'object') return null;
                                                            return (
                                                                <div key={key} className="flex justify-between items-center text-[11px]">
                                                                    <span className="text-tertiary/40 font-bold uppercase tracking-wider line-clamp-1">{key}</span>
                                                                    <span className="font-extrabold text-primary">{String(value)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            {report.notes && (
                                                <p className="text-xs text-tertiary/50 font-medium italic border-l-2 border-primary/10 pl-3 line-clamp-2">"{report.notes}"</p>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Analysis &rarr;</span>
                                            <div className="flex -space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-white"></div>
                                                <div className="w-6 h-6 rounded-full bg-tertiary/10 border-2 border-white"></div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
