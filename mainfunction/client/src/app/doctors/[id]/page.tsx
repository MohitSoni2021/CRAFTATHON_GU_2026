'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserMd, FaEnvelope, FaCalendarCheck, FaClock, FaMapMarkerAlt, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import BookingModal from '@/components/BookingModal';
import DoctorDetailsSkeleton from '@/components/dashboard/DoctorDetailsSkeleton';

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
            <DashboardLayout>
                <DoctorDetailsSkeleton />
            </DashboardLayout>
        );
    }

    if (error || !doctor) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-surface p-4">
                <div className="text-primary text-xl font-extrabold mb-2 uppercase tracking-widest">Error</div>
                <p className="text-tertiary/70 font-medium mb-6">{error || 'Doctor not found'}</p>
                <button
                    onClick={() => router.back()}
                    className="btn-primary !rounded-xl"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="w-full">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-tertiary/60 hover:text-primary mb-8 transition-all font-bold text-xs uppercase tracking-widest group"
                >
                    <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors">
                        <FaChevronLeft className="text-sm" />
                    </div>
                    Back to Care Network
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Doctor Profile */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-ambient border border-gray-100 overflow-hidden sticky top-8">
                            <div className="h-32 bg-primary/5"></div>
                            <div className="px-8 relative">
                                <div className="absolute -top-16 left-8 w-32 h-32 rounded-xl border-4 border-white overflow-hidden bg-white shadow-ambient">
                                    {doctor.profileImage ? (
                                        <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                                            <FaUserMd className="text-5xl" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-20 px-8 pb-8">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-extrabold text-[#2c3436]">{doctor.name}</h1>
                                    <p className="text-primary font-black text-xs uppercase tracking-widest mt-1">
                                        {doctor.profile?.specialization || 'General Practitioner'}
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center text-tertiary/70">
                                        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary/60 mr-4">
                                            <FaEnvelope className="text-sm" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Email</span>
                                            <span className="text-sm font-bold">{doctor.email}</span>
                                        </div>
                                    </div>
                                    {doctor.availability?.workingHours && (
                                        <div className="flex items-center text-tertiary/70">
                                            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary/60 mr-4">
                                                <FaClock className="text-sm" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Hours</span>
                                                <span className="text-sm font-bold">
                                                    {doctor.availability.workingHours.start} - {doctor.availability.workingHours.end}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {doctor.availability?.days && (
                                        <div className="flex items-center text-tertiary/70">
                                            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary/60 mr-4">
                                                <FaCalendarCheck className="text-sm" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Availability</span>
                                                <span className="text-sm font-bold">{doctor.availability.days.join(', ')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {doctor.profile?.bio && (
                                    <div className="mt-8 pt-8 border-t border-gray-50">
                                        <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-[0.2em] mb-3">Clinical Biography</h3>
                                        <p className="text-tertiary/70 text-sm leading-relaxed font-medium">{doctor.profile.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Slots */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-ambient border border-gray-100 p-8 md:p-10">
                            <header className="mb-10">
                                <div className="flex items-center space-x-4 text-primary text-[11px] font-black tracking-widest uppercase mb-4">
                                    <FaCalendarCheck className="text-lg" /> <span>Appointment Scheduling</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-[#2c3436]">
                                    Book your <span className="text-primary">Consultation</span>
                                </h2>
                                <p className="text-tertiary/60 text-sm mt-2 font-medium">Select a date and time slot that fits your schedule.</p>
                            </header>

                            {/* Date Picker */}
                            <div className="mb-10">
                                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-3">Select Consultation Date</label>
                                <input
                                    type="date"
                                    className="w-full md:w-auto px-6 py-4 rounded-xl border border-gray-100 bg-surface-container-low text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            {/* Slots Grid */}
                            <div>
                                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6">Available Time Slots</h3>

                                {slotsLoading ? (
                                    <div className="flex justify-center py-16">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                disabled={!slot.available}
                                                onClick={() => handleSlotClick(slot.time)}
                                                className={`group relative flex items-center justify-center py-5 px-6 rounded-xl border transition-all duration-300
                                                    ${!slot.available
                                                        ? 'bg-surface-container-low border-transparent text-tertiary/30 cursor-not-allowed opacity-50'
                                                        : 'bg-white border-gray-100 text-[#2c3436] hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/5 font-bold'
                                                    }`}
                                            >
                                                <span className="text-sm">{slot.time}</span>
                                                {slot.available && (
                                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-surface-container-low rounded-xl border border-dashed border-gray-200">
                                        <FaClock className="mx-auto h-12 w-12 text-tertiary/20 mb-4" />
                                        <p className="text-tertiary/60 font-bold">No slots available for this date.</p>
                                        {!doctor.availability?.days.includes(new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })) && (
                                            <p className="text-xs text-tertiary/40 mt-2 font-medium uppercase tracking-wider">
                                                Doctor availability: {doctor.availability?.days.join(', ')}
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
