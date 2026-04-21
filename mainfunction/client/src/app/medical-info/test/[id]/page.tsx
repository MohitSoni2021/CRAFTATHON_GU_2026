'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaArrowLeft, FaVial, FaNotesMedical, FaInfoCircle, FaClipboardCheck, FaMicroscope, FaFlask, FaClipboardList, FaSearch } from 'react-icons/fa';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface LabTest {
    _id: string;
    name: string;
    description: string;
    normalRange: string;
    preparation: string;
    clinicalSignificance: string;
    category: string;
    source?: string;
}

const TestDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [test, setTest] = useState<LabTest | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/reference`;

    useEffect(() => {
        if (token && id) {
            fetchDetails();
        }
    }, [token, id]);

    const fetchDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/tests/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTest(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!test) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="text-center py-20 bg-white rounded-xl shadow-ambient border border-gray-100 max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <FaVial className="text-3xl text-red-400" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#2c3436] mb-4">Diagnostic Record Missing</h2>
                        <button 
                            onClick={() => router.back()} 
                            className="btn-primary !rounded-xl px-10"
                        >
                            Return to Reference
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
                                    Clinical Archive • Diagnostic Reference
                                </p>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                                    {test.name} <span className="text-primary">Analysis</span>
                                </h1>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                                
                                <div className="flex flex-wrap gap-2 mb-6 relative">
                                    <span className="px-3 py-1 bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-lg">
                                        {test.category}
                                    </span>
                                    {test.source && (
                                        <span className="px-3 py-1 bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-tertiary/40 border border-gray-100 rounded-lg flex items-center">
                                            <FaSearch className="mr-2" /> {test.source}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-4 flex items-center border-b border-gray-50 pb-4 relative">
                                    Diagnostic Overview
                                </h3>
                                <div className="text-tertiary/70 text-base leading-relaxed font-medium relative prose prose-sm max-w-none prose-p:text-tertiary/70 prose-strong:text-primary">
                                    <div dangerouslySetInnerHTML={{ __html: test.description }} />
                                </div>
                            </div>

                            {/* Clinical Significance */}
                            <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                                    <FaNotesMedical className="mr-3 text-primary/40 text-lg" /> Clinical Significance
                                </h3>
                                <p className="text-tertiary/70 text-base leading-relaxed font-medium">
                                    {test.clinicalSignificance}
                                </p>
                            </div>
                        </div>

                        {/* Sidebar: Lab Details */}
                        <div className="space-y-8">
                            {/* Normal Range */}
                            <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                                    <FaFlask className="mr-3 text-primary/40 text-lg" /> Normal Range
                                </h3>
                                <div className="bg-surface-container-low p-5 rounded-xl border border-primary/10 mb-2">
                                    <p className="text-sm font-extrabold text-[#2c3436] leading-relaxed">
                                        {test.normalRange || 'Reference ranges vary by laboratory. Consult your doctor for interpretation.'}
                                    </p>
                                </div>
                                <p className="text-[10px] text-tertiary/40 font-bold italic">
                                    * Laboratory metrics may vary based on equipment and methodology.
                                </p>
                            </div>

                            {/* Preparation */}
                            <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                                    <FaClipboardList className="mr-3 text-primary/40 text-lg" /> Preparation
                                </h3>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                                        <FaClipboardCheck />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-[#2c3436] leading-relaxed">
                                            {test.preparation || 'Follow specific instructions provided by your healthcare provider.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary p-8 rounded-xl shadow-xl shadow-primary/20 text-white relative overflow-hidden group cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <h3 className="text-lg font-black mb-2 relative">Diagnostic AI</h3>
                                <p className="text-white/70 text-xs font-medium leading-relaxed relative mb-6">
                                    Need help understanding your results for this test? Upload your report for an AI summary.
                                </p>
                                <button 
                                    onClick={() => router.push('/lab-reports/new')}
                                    className="w-full py-3 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-colors relative"
                                >
                                    Upload Lab Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default TestDetailsPage;
