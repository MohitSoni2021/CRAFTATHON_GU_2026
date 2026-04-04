'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserMd, FaEnvelope, FaCalendarCheck, FaClock, FaMapMarkerAlt, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import BookingModal from '@/components/BookingModal';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    profile?: {
        gender?: string;
        specialization?: string;
        qualifications?: string[];
        experience?: number;
        bio?: string;
    };
    availability?: {
        days: string[];
        workingHours: { start: string; end: string };
        slotDuration?: number;
    };
}

const DoctorDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    interface Slot {
        time: string;
        available: boolean;
    }
    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctors/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setDoctor(response.data.data);
                    // Set default date to today
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                } else {
                    setError('Doctor not found');
                }
            } catch (err: any) {
                console.error('Error fetching doctor details:', err);
                setError('Failed to load doctor details.');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchDoctor();
        }
    }, [params.id]);

    useEffect(() => {
        if (doctor && selectedDate) {
            fetchSlots(doctor._id, selectedDate);
        }
    }, [selectedDate, doctor]);

    const fetchSlots = async (doctorId: string, date: string) => {
        setSlotsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctors/${doctorId}/slots?date=${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSlots(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            setSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleSlotClick = (slot: string) => {
        setSelectedSlot(slot);
        setShowBookingModal(true);
    };

    const handleBookingSuccess = () => {
        alert('Appointment booked successfully!');
        // Refresh slots to remove the booked one
        if (doctor && selectedDate) {
            fetchSlots(doctor._id, selectedDate);
        }
        setShowBookingModal(false);
        setSelectedSlot(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
                <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
                <p className="text-gray-600">{error || 'Doctor not found'}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-emerald-600 mb-6 transition-colors"
                >
                    <FaChevronLeft className="mr-2" /> Back to Doctors
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Doctor Profile */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                            <div className="h-32 bg-emerald-50"></div>
                            <div className="px-6 relative">
                                <div className="absolute -top-16 left-6 w-32 h-32 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-md">
                                    {doctor.profileImage ? (
                                        <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-300">
                                            <FaUserMd className="text-5xl" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-20 px-6 pb-6">
                                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                                <p className="text-emerald-600 font-medium">{doctor.profile?.specialization || 'General Practitioner'}</p>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center text-gray-600">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mr-3">
                                            <FaEnvelope className="text-sm" />
                                        </div>
                                        <span className="text-sm">{doctor.email}</span>
                                    </div>
                                    {doctor.availability?.workingHours && (
                                        <div className="flex items-center text-gray-600">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mr-3">
                                                <FaClock className="text-sm" />
                                            </div>
                                            <span className="text-sm">
                                                {doctor.availability.workingHours.start} - {doctor.availability.workingHours.end}
                                            </span>
                                        </div>
                                    )}
                                    {doctor.availability?.days && (
                                        <div className="flex items-center text-gray-600">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 mr-3">
                                                <FaCalendarCheck className="text-sm" />
                                            </div>
                                            <span className="text-sm">{doctor.availability.days.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                {doctor.profile?.bio && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{doctor.profile.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Slots */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <FaCalendarCheck className="mr-3 text-emerald-500" />
                                Book an Appointment
                            </h2>

                            {/* Date Picker */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            {/* Slots Grid */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Available Slots</h3>

                                {slotsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                disabled={!slot.available}
                                                onClick={() => handleSlotClick(slot.time)}
                                                className={`group relative flex items-center justify-center py-3 px-4 rounded-xl border transition-all duration-200 shadow-sm 
                                                    ${!slot.available
                                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white border-emerald-200 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white hover:shadow-md'
                                                    }`}
                                            >
                                                <span className="font-medium">{slot.time}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500">No slots available for this date.</p>
                                        {!doctor.availability?.days.includes(new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })) && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                (Doctor is usually available on: {doctor.availability?.days.join(', ')})
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showBookingModal && (
                    <BookingModal
                        onClose={() => setShowBookingModal(false)}
                        onSuccess={handleBookingSuccess}
                        prefilledDoctorId={doctor._id}
                        prefilledDoctorName={doctor.name}
                        prefilledDate={selectedDate}
                        prefilledTime={selectedSlot || undefined}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default DoctorDetailsPage;
