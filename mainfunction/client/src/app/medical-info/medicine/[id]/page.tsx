'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
    FaArrowLeft, FaPills, FaNotesMedical, FaExclamationTriangle, 
    FaPrescriptionBottle, FaIndustry, FaInfoCircle, FaShieldAlt, 
    FaVial, FaFileMedicalAlt, FaSyringe, FaClipboardList, FaRobot
} from 'react-icons/fa';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Medicine {
    id: string;
    name: string;
    brand: string;
    category: string;
    manufacturer: string;
    description: string;
    uses: string[];
    sideEffects: string[];
    dosageInfo: string;
    warnings: string;
    activeIngredient: string;
    inactiveIngredient: string;
}

const MedicineDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (token && id) {
            fetchDetails();
        }
    }, [token, id]);

    const fetchDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/medicines/details/${id}`, {
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
                    <div className="flex flex-col justify-center items-center h-[70vh] space-y-6">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-[6px] border-primary/5 rounded-full"></div>
                            <div className="absolute inset-0 border-[6px] border-primary rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-black text-[#1a1a1a] tracking-tight mb-2">Assembling Monograph</h2>
                            <p className="text-tertiary/40 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                Securing Data from Clinical Archives
                            </p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!medicine) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="w-full mt-20 p-16 bg-white rounded-xl border border-gray-100 shadow-2xl text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-red-50 rounded-xl flex items-center justify-center mb-8">
                            <FaExclamationTriangle className="text-4xl text-red-400" />
                        </div>
                        <h2 className="text-3xl font-black text-[#1a1a1a] mb-4">Profile Unavailable</h2>
                        <p className="text-tertiary/60 text-sm font-medium mb-10 max-w-md">
                            The requested pharmacological record could not be retrieved from the OpenFDA database.
                        </p>
                        <button 
                            onClick={() => router.back()} 
                            className="px-12 py-5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center gap-3"
                        >
                            <FaArrowLeft /> Return to Encyclopedia
                        </button>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="w-full min-h-screen">
                    {/* Sticky Header Top */}
                    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-5 flex items-center justify-between mb-8 rounded-xl shadow-sm">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.back()}
                                className="w-12 h-12 flex items-center justify-center bg-gray-50 text-tertiary/60 rounded-xl hover:text-primary hover:bg-primary/5 transition-all group border border-gray-100"
                            >
                                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-[#1a1a1a] tracking-tight leading-none">
                                    {medicine.name}
                                </h1>
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">
                                    Pharmacological Monograph
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100">
                                FDA Verified
                            </span>
                            <button className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-colors shadow-lg shadow-black/5">
                                Export Data
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT SIDEBAR: Quick Facts */}
                        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center text-2xl shadow-lg shadow-primary/20">
                                        <FaPills />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black text-tertiary/30 uppercase tracking-widest">Market Status</h3>
                                        <p className="text-sm font-black text-[#1a1a1a]">{medicine.brand ? 'Available Brand' : 'Generic Only'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="pb-6 border-b border-gray-50">
                                        <p className="text-[10px] font-black text-tertiary/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <FaIndustry className="text-primary/40" /> Manufacturer
                                        </p>
                                        <p className="text-sm font-extrabold text-[#1a1a1a]">{medicine.manufacturer}</p>
                                    </div>
                                    <div className="pb-6 border-b border-gray-50">
                                        <p className="text-[10px] font-black text-tertiary/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <FaShieldAlt className="text-primary/40" /> Class
                                        </p>
                                        <p className="text-sm font-extrabold text-[#1a1a1a]">{medicine.category}</p>
                                    </div>
                                    <div className="pb-6 border-b border-gray-50">
                                        <p className="text-[10px] font-black text-tertiary/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <FaVial className="text-primary/40" /> Active Agent
                                        </p>
                                        <p className="text-sm font-extrabold text-[#1a1a1a]">{medicine.activeIngredient}</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Health Companion */}
                            <div className="bg-gradient-to-br from-[#1a1a1a] to-gray-800 p-8 rounded-xl text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                                        <FaRobot />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight">AI Assistant</h3>
                                </div>
                                <p className="text-white/60 text-xs font-medium leading-relaxed mb-8 relative z-10">
                                    Need a simpler explanation of this monograph? Ask our medical AI to summarize it for you.
                                </p>
                                <button className="w-full py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all shadow-lg relative z-10">
                                    Consult Clinical AI
                                </button>
                            </div>
                        </div>

                        {/* RIGHT MAIN: Content Monographs */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Overview Card */}
                            <section className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <FaFileMedicalAlt className="text-primary text-xl" />
                                    <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Clinical Overview</h2>
                                </div>
                                <p className="text-tertiary/70 text-lg font-medium leading-relaxed italic border-l-4 border-primary/20 pl-8 py-2">
                                    {medicine.description}
                                </p>
                            </section>

                            {/* Indications & Usage */}
                            <section className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-10">
                                    <FaNotesMedical className="text-primary text-xl" />
                                    <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Indications & Clinical Use</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {Array.isArray(medicine.uses) ? (
                                        medicine.uses.map((use, i) => (
                                            <div key={i} className="flex items-start gap-5 p-6 bg-gray-50 rounded-xl border border-gray-100 group hover:border-primary/20 transition-all">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary font-black shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm font-bold text-tertiary/70 flex-grow pt-1.5">{use}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm font-bold text-tertiary/70">{medicine.uses}</p>
                                    )}
                                </div>
                            </section>

                            {/* Side Effects Grid */}
                            <section className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-10">
                                    <FaExclamationTriangle className="text-red-500 text-xl" />
                                    <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Adverse Reactions</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.isArray(medicine.sideEffects) ? (
                                        medicine.sideEffects.slice(0, 12).map((effect, i) => (
                                            <div key={i} className="flex items-center gap-4 p-5 bg-red-50/20 rounded-xl border border-red-100/50">
                                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                <span className="text-[11px] font-black text-red-900/60 uppercase tracking-widest">{effect}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-full p-6 bg-red-50/20 rounded-xl border border-red-100/50 text-sm font-bold text-red-900/60">{medicine.sideEffects}</p>
                                    )}
                                </div>
                            </section>

                            {/* Dosage & Administration */}
                            <section className="bg-[#1a1a1a] p-12 rounded-xl text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32"></div>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white text-xl">
                                        <FaPrescriptionBottle />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">Pharmacology & Dosage</h2>
                                        <p className="text-primary text-[10px] font-black uppercase tracking-widest">Administration Protocol</p>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-8 rounded-xl border border-white/10 mb-10">
                                    <p className="text-base font-medium text-white/80 leading-relaxed italic">
                                        "{medicine.dosageInfo}"
                                    </p>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <FaInfoCircle className="text-red-400 mt-1 shrink-0" />
                                    <p className="text-xs text-red-400 font-bold leading-relaxed">
                                        Critical: This information is for educational purposes only. Dosage must be confirmed by a licensed medical professional based on individual clinical assessment.
                                    </p>
                                </div>
                            </section>

                            {/* Safety Warnings */}
                            <section className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm mb-12">
                                <div className="flex items-center gap-3 mb-8">
                                    <FaShieldAlt className="text-primary text-xl" />
                                    <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Clinical Precautions</h2>
                                </div>
                                <div className="p-8 bg-blue-50/30 rounded-xl border border-blue-100">
                                    <p className="text-sm font-bold text-blue-900/60 leading-relaxed">
                                        {medicine.warnings}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default MedicineDetailsPage;
