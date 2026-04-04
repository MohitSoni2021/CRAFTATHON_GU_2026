'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserMd, FaEnvelope, FaCalendarCheck } from 'react-icons/fa';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    profile?: {
        gender?: string;
        specialization?: string;
    };
    availability?: {
        days: string[];
        workingHours: { start: string; end: string };
    };
}

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5002/api/doctors', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setDoctors(response.data);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching doctors:', err);
                setError('Failed to load doctors. Please try again later.');
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
                <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
                <p className="text-gray-600">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
                    <p className="text-gray-600">Connect with our experienced medical professionals.</p>
                </div>

                {doctors.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <FaUserMd className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Doctors Found</h3>
                        <p className="text-gray-500 mt-2">There are currently no doctors registered in the system.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {doctors.map((doctor) => (
                            <div
                                key={doctor._id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group flex flex-col"
                            >
                                <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative h-48 flex items-center justify-center overflow-hidden">
                                    {doctor.profileImage ? (
                                        <img
                                            src={doctor.profileImage}
                                            alt={doctor.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200">
                                            <FaUserMd className="text-6xl" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                                            {doctor.name}
                                        </h3>
                                        <p className="text-sm text-emerald-600 font-medium">
                                            {doctor.profile?.specialization || 'General Practitioner'}
                                        </p>
                                    </div>

                                    <div className="space-y-2 mb-6 flex-1">
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <FaEnvelope className="mr-2 text-gray-400 min-w-[16px]" />
                                            <span className="truncate">{doctor.email}</span>
                                        </div>
                                        {doctor.availability?.days && doctor.availability.days.length > 0 && (
                                            <div className="flex items-start text-gray-500 text-sm">
                                                <FaCalendarCheck className="mr-2 text-gray-400 mt-0.5 min-w-[16px]" />
                                                <span className="text-xs">{doctor.availability.days.join(', ')}</span>
                                            </div>
                                        )}
                                        {doctor.availability?.workingHours && (
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <span className="pl-6 text-xs text-gray-400">
                                                    {doctor.availability.workingHours.start} - {doctor.availability.workingHours.end}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={`/doctors/${doctor._id}`}
                                        className="flex items-center justify-center w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                                    >
                                        <FaCalendarCheck className="mr-2" />
                                        View Details & Book
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


            </div>
        </DashboardLayout>
    );
};

export default DoctorsPage;
