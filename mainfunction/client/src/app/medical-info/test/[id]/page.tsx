'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaArrowLeft, FaVial, FaNotesMedical, FaInfoCircle, FaClipboardCheck, FaMicroscope, FaFlask, FaClipboardList } from 'react-icons/fa';

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
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-0 md:ml-72 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AAFA9]"></div>
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-0 md:ml-72 p-8 text-center text-gray-500">
                    Test not found.
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-0 md:ml-72 p-8 transition-all duration-300">
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-[#3AAFA9] mb-6 flex items-center transition-colors font-medium"
                >
                    <FaArrowLeft className="mr-2" /> Back
                </button>

                <div className="bg-white rounded-3xl">
                    {/* Header Section */}
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">
                                {test.category}
                            </span>
                            {test.source === 'MedlinePlus' && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full">
                                    MedlinePlus
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{test.name}</h1>

                        <div className="prose prose-lg max-w-none text-gray-700">
                            <div dangerouslySetInnerHTML={{ __html: test.description }} />
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-8 grid md:grid-cols-2 gap-10">
                        {/* Clinical Significance */}
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                                <FaNotesMedical className="mr-3 text-[#3AAFA9]" />
                                Clinical Significance
                            </h3>
                            <div className="text-gray-700 leading-relaxed text-lg">
                                {test.clinicalSignificance}
                            </div>
                        </div>

                        {/* Normal Range */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                                <FaFlask className="mr-3 text-[#3AAFA9]" />
                                Normal Range
                            </h3>
                            <div className="mt-4">
                                <p className="text-gray-800 font-medium text-lg">
                                    {test.normalRange || 'Reference ranges vary by laboratory. Consult your doctor.'}
                                </p>
                            </div>
                        </div>

                        {/* Preparation */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                                <FaClipboardList className="mr-3 text-[#3AAFA9]" />
                                Preparation
                            </h3>
                            <div className="mt-4">
                                <p className="text-gray-800 font-medium text-lg">
                                    {test.preparation || 'Follow specific instructions provided by your healthcare provider.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestDetailsPage;
