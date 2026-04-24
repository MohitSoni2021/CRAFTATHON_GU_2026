'use client';
import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaCalendarAlt, FaUserMd, FaFlask, FaPlus, FaTimes, FaTrash, FaCheckCircle, FaFileUpload, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BookingModal from '@/components/BookingModal';

import AppointmentsSkeleton from '@/components/dashboard/AppointmentsSkeleton';

interface Appointment {
    _id: string;
    providerName: string;
    type: 'Doctor' | 'Lab';
    date: string;
    time: string;
    notes: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const AppointmentsPageContent = () => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
    const [selectedDoctorName, setSelectedDoctorName] = useState<string | undefined>(undefined);

    // Use port 5000 as per previous fix
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/appointments`;

    const searchParams = useSearchParams();

    useEffect(() => {
        if (token) {
            fetchAppointments();
        }

        const doctorId = searchParams.get('doctorId');
        const doctorName = searchParams.get('doctorName');

        if (doctorId && doctorName) {
            setSelectedDoctorId(doctorId);
            setSelectedDoctorName(decodeURIComponent(doctorName));
            setShowModal(true);
        }
    }, [token, searchParams]);


    const fetchAppointments = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookingSuccess = (newAppointment: Appointment) => {
        setAppointments([...appointments, newAppointment]);
        alert('Appointment booked successfully!');
        // Reset selection
        setSelectedDoctorId(undefined);
        setSelectedDoctorName(undefined);
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAppointments(appointments.map(app => app._id === id ? { ...app, status: status as any } : app));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(appointments.filter(app => app._id !== id));
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="w-full">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
                            Clinical Management • Schedules
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                            Your <span className="text-primary">Appointments</span>
                        </h1>
                        <p className="text-tertiary/70 text-sm font-medium mt-1">Manage your doctor visits and lab tests curated for your health.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary !rounded-xl"
                    >
                        <FaPlus className="mr-2" /> <span>Book Appointment</span>
                    </button>
                </header>

                {loading ? (
                    <AppointmentsSkeleton />
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-ambient border border-gray-100">
                        <FaCalendarAlt className="mx-auto text-6xl text-gray-100 mb-6" />
                        <h3 className="text-xl font-bold text-[#2c3436]">No Appointments Scheduled</h3>
                        <p className="text-tertiary/60 mt-2 font-medium">Book your first clinical session to begin your health journey.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((app) => (
                            <div key={app._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-ambient hover:border-primary/20 transition-all duration-300 group">
                                <div className="flex items-start space-x-6">
                                    <div className={`p-5 rounded-xl transition-colors duration-300 ${app.type === 'Doctor' ? 'bg-primary/5 text-primary' : 'bg-tertiary/5 text-tertiary'}`}>
                                        {app.type === 'Doctor' ? <FaUserMd className="text-2xl" /> : <FaFlask className="text-2xl" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Link href={`/appointments/${app._id}`} className="group-hover:text-primary transition-colors">
                                                <h3 className="text-lg font-bold text-[#2c3436]">{app.providerName}</h3>
                                            </Link>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${app.status === 'Scheduled' ? 'bg-green-50 text-green-600' :
                                                app.status === 'Completed' ? 'bg-surface-container-high text-tertiary/50' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-tertiary/60 text-xs font-bold uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="mr-2 text-primary/40" />
                                                <span>{new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <span className="opacity-30">•</span>
                                            <div className="flex items-center">
                                                <FaClock className="mr-2 text-primary/40" />
                                                <span>{app.time}</span>
                                            </div>
                                        </div>
                                        {app.notes && <p className="text-tertiary/40 text-[11px] mt-3 font-medium italic">"{app.notes}"</p>}
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-0 flex items-center space-x-2">
                                    {app.status === 'Scheduled' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Completed')}
                                                className="w-10 h-10 flex items-center justify-center text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all duration-300"
                                                title="Mark as Completed"
                                            >
                                                <FaCheckCircle />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Cancelled')}
                                                className="w-10 h-10 flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white rounded-xl transition-all duration-300"
                                                title="Cancel Appointment"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    )}
                                    {app.status === 'Completed' && (
                                        <Link
                                            href={`/doctor-reports/new?date=${app.date}&doctor=${encodeURIComponent(app.providerName)}`}
                                            className="w-10 h-10 flex items-center justify-center text-primary bg-primary/5 hover:bg-primary hover:text-white rounded-xl transition-all duration-300"
                                            title="Create Report"
                                        >
                                            <FaFileUpload />
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => handleDelete(app._id)}
                                        className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <BookingModal
                        onClose={() => setShowModal(false)}
                        onSuccess={handleBookingSuccess}
                        prefilledDoctorId={selectedDoctorId}
                        prefilledDoctorName={selectedDoctorName}
                    />
                )}
            </div>
        </DashboardLayout >
    );
};

const AppointmentsPage = () => {
    return (
        <Suspense fallback={<AppointmentsSkeleton />}>
            <AppointmentsPageContent />
        </Suspense>
    );
};

export default AppointmentsPage;
