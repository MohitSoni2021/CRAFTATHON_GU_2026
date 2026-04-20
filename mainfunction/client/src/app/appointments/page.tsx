'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaCalendarAlt, FaUserMd, FaFlask, FaPlus, FaTimes, FaTrash, FaCheckCircle, FaFileUpload } from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BookingModal from '@/components/BookingModal';

interface Appointment {
    _id: string;
    providerName: string;
    type: 'Doctor' | 'Lab';
    date: string;
    time: string;
    notes: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const AppointmentsPage = () => {
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
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-gray-600 mt-2">Manage your doctor visits and lab tests.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full md:w-auto bg-[#3AAFA9] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#2B7A78] transition-colors flex items-center justify-center space-x-2"
                    >
                        <FaPlus /> <span>Book Appointment</span>
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AAFA9]"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <FaCalendarAlt className="mx-auto text-6xl text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No Appointments Scheduled</h3>
                        <p className="text-gray-500">Book your first appointment to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((app) => (
                            <div key={app._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-4 rounded-xl ${app.type === 'Doctor' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {app.type === 'Doctor' ? <FaUserMd className="text-2xl" /> : <FaFlask className="text-2xl" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Link href={`/appointments/${app._id}`} className="hover:underline">
                                                <h3 className="text-base font-bold text-gray-900">{app.providerName}</h3>
                                            </Link>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${app.status === 'Scheduled' ? 'bg-green-100 text-green-700' :
                                                app.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm flex items-center space-x-4">
                                            <span>{new Date(app.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{app.time}</span>
                                        </p>
                                        {app.notes && <p className="text-gray-400 text-sm mt-2 italic">"{app.notes}"</p>}
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                                    {app.status === 'Scheduled' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Completed')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg tooltip"
                                                title="Mark as Completed"
                                            >
                                                <FaCheckCircle className="text-xl" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Cancelled')}
                                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg tooltip"
                                                title="Cancel Appointment"
                                            >
                                                <FaTimes className="text-xl" />
                                            </button>
                                        </>
                                    )}
                                    {app.status === 'Completed' && (
                                        <Link
                                            href={`/doctor-reports/new?date=${app.date}&doctor=${encodeURIComponent(app.providerName)}`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip"
                                            title="Create Report"
                                        >
                                            <FaFileUpload className="text-xl" />
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => handleDelete(app._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg tooltip"
                                        title="Delete"
                                    >
                                        <FaTrash className="text-xl" />
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

export default AppointmentsPage;
