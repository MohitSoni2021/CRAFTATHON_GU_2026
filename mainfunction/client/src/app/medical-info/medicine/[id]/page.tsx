'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaArrowLeft, FaPills, FaNotesMedical, FaExclamationTriangle, FaPrescriptionBottle, FaIndustry } from 'react-icons/fa';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Medicine {
    _id: string;
    name: string;
    description: string;
    uses: string[];
    sideEffects: string[];
    dosageInfo: string;
    manufacturer: string;
    category: string;
}

const MedicineDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/reference`;

    useEffect(() => {
        if (token && id) {
            fetchDetails();
        }
    }, [token, id]);

    const fetchDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/medicines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMedicine(response.data.data);
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

    if (!medicine) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="text-center py-20 bg-white rounded-xl shadow-ambient border border-gray-100 max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <FaPills className="text-3xl text-red-400" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#2c3436] mb-4">Pharmacological Record Missing</h2>
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
                                    Clinical Archive • Pharmacotherapy
                                </p>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                                    {medicine.name} <span className="text-primary">Profile</span>
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
                                        {medicine.category}
                                    </span>
                                    {medicine.manufacturer && (
                                        <span className="px-3 py-1 bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-tertiary/40 border border-gray-100 rounded-lg flex items-center">
                                            <FaIndustry className="mr-2" /> {medicine.manufacturer}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-4 flex items-center border-b border-gray-50 pb-4 relative">
                                    Clinical Overview
                                </h3>
                                <p className="text-tertiary/70 text-base leading-relaxed font-medium relative">
                                    {medicine.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Indications */}
                                <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                    <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                                        <FaNotesMedical className="mr-3 text-primary/40 text-lg" /> Indications
                                    </h3>
                                    <ul className="space-y-3">
                                        {medicine.uses.map((use, i) => (
                                            <li key={i} className="flex items-start text-sm font-bold text-[#2c3436]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></div>
                                                {use}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Adverse Reactions */}
                                <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                    <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center text-red-400">
                                        <FaExclamationTriangle className="mr-3 text-red-300 text-lg" /> Adverse Effects
                                    </h3>
                                    <ul className="space-y-3">
                                        {medicine.sideEffects.map((effect, i) => (
                                            <li key={i} className="flex items-start text-sm font-bold text-tertiary/70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-300 mt-1.5 mr-3 flex-shrink-0"></div>
                                                {effect}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Administration */}
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                                    <FaPrescriptionBottle className="mr-3 text-primary/40 text-lg" /> Administration
                                </h3>
                                <div className="bg-surface-container-low p-5 rounded-xl border border-primary/10 mb-6">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Dosage Guidance</p>
                                    <p className="text-sm font-extrabold text-[#2c3436] leading-relaxed">
                                        {medicine.dosageInfo}
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                    <p className="text-[10px] text-red-500 leading-relaxed font-bold italic">
                                        * Clinical Caution: Always consult your physician before initiating or adjusting medication protocols.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-primary p-8 rounded-xl shadow-xl shadow-primary/20 text-white relative overflow-hidden group cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <h3 className="text-lg font-black mb-2 relative">Clinical Assist</h3>
                                <p className="text-white/70 text-xs font-medium leading-relaxed relative mb-6">
                                    Need clarification on this medication? Our AI health assistant can provide more context.
                                </p>
                                <button className="w-full py-3 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-colors relative">
                                    Ask AI Assistant
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default MedicineDetailsPage;
