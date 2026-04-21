'use client';
import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchDoctorReports } from '@/store/slices/doctorReportsSlice';
import Link from 'next/link';
import { FaPlus, FaUserMd, FaPrescriptionBottleAlt, FaCalendarCheck } from 'react-icons/fa';

import DoctorReportsSkeleton from '@/components/dashboard/DoctorReportsSkeleton';

export default function DoctorReportsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { reports, loading } = useSelector((state: RootState) => state.doctorReports);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchDoctorReports(user.id));
        }
    }, [dispatch, user]);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="w-full">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                        <div>
                            <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
                                Clinical Archive • Medical Records
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                                Doctor <span className="text-primary">Visits</span>
                            </h1>
                            <p className="text-tertiary/70 text-sm font-medium mt-1">Keep track of your clinical appointments and active prescriptions.</p>
                        </div>
                        <Link
                            href="/doctor-reports/new"
                            className="btn-primary !rounded-xl flex items-center justify-center space-x-2 w-full md:w-auto"
                        >
                            <FaPlus />
                            <span>Record Visit</span>
                        </Link>
                    </header>

                    {loading ? (
                        <DoctorReportsSkeleton />
                    ) : reports.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-ambient border border-gray-100">
                            <div className="w-20 h-20 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <FaUserMd className="text-3xl text-primary/40" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2c3436]">No records found</h3>
                            <p className="text-tertiary/60 mt-2 font-medium mb-8">You haven't recorded any clinical visits in your archive yet.</p>
                            <Link
                                href="/doctor-reports/new"
                                className="btn-primary !rounded-xl px-10"
                            >
                                Record your first visit
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reports.map((report) => (
                                <div key={report._id} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-ambient hover:border-primary/20 transition-all duration-300 group">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-50 gap-4">
                                        <div className="flex items-center space-x-5">
                                            <div className="p-4 bg-primary/5 rounded-xl text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                                                <FaUserMd className="text-2xl" />
                                            </div>
                                            <div>
                                                <Link href={`/doctor-reports/${report._id}`} className="group-hover:text-primary transition-colors">
                                                    <h3 className="text-lg font-extrabold text-[#2c3436]">{report.doctorName || 'Clinical Consultation'}</h3>
                                                </Link>
                                                <p className="text-xs font-bold text-tertiary/50 uppercase tracking-wider mt-1">
                                                    {new Date(report.visitDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        {report.followUpDate && (
                                            <div className="flex items-center px-4 py-2 bg-tertiary/5 text-tertiary rounded-xl text-[10px] font-black uppercase tracking-widest border border-tertiary/10">
                                                <FaCalendarCheck className="mr-2 text-sm" />
                                                <span>Follow-up: {new Date(report.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div>
                                            <h4 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-4">Diagnosis & Summary</h4>
                                            {report.diagnosis && report.diagnosis.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {report.diagnosis.map((d, i) => (
                                                        <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-100">{d}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-tertiary/70 text-sm leading-relaxed font-medium italic">
                                                "{report.summary || "No consultation summary provided."}"
                                            </p>
                                        </div>

                                        <div className="bg-surface-container-low rounded-xl p-5 border border-gray-50">
                                            <h4 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-4 flex items-center">
                                                <FaPrescriptionBottleAlt className="mr-2 text-primary/40" /> Active Prescriptions
                                            </h4>
                                            {report.prescriptions && report.prescriptions.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {report.prescriptions.map((p, i) => (
                                                        <li key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-extrabold text-[#2c3436]">{p.medicine}</span>
                                                                <span className="text-[10px] text-tertiary/40 font-black uppercase tracking-widest">{p.dosage} • {p.frequency}</span>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/40">
                                                                <FaPrescriptionBottleAlt className="text-xs" />
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="py-4 text-center">
                                                    <p className="text-tertiary/30 text-xs font-bold uppercase tracking-widest">No medications prescribed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
