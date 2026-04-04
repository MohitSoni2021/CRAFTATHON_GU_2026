'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaCalendarAlt, FaUser, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

interface Patient {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
}

interface Appointment {
    _id: string;
    userId: Patient;
    date: string;
    time: string;
    mode: 'Online' | 'Offline';
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
}

const DoctorAppointmentsPage = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor-appointments`;

    useEffect(() => {
        if (token) {
            fetchAppointments();
        }
    }, [token]);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'text-blue-600 bg-blue-50';
            case 'Completed': return 'text-green-600 bg-green-50';
            case 'Cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Scheduled': return <FaHourglassHalf />;
            case 'Completed': return <FaCheckCircle />;
            case 'Cancelled': return <FaTimesCircle />;
            default: return <FaHourglassHalf />;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Patient Appointments</h1>
                    <p className="text-gray-600 mt-2">View and manage your upcoming patient consultations.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AAFA9]"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <FaCalendarAlt className="mx-auto text-6xl text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Appointments Yet</h3>
                        <p className="text-gray-500">You don't have any appointments scheduled.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((app) => (
                                        <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {app.userId.profileImage ? (
                                                            <img className="h-10 w-10 rounded-full object-cover" src={app.userId.profileImage} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                                <FaUser />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{app.userId.name}</div>
                                                        <div className="text-sm text-gray-500">{app.userId.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        {new Date(app.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                        <FaClock className="text-gray-400" />
                                                        {app.time}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${app.mode === 'Online' ? 'bg-cyan-50 text-cyan-700' : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full ${app.mode === 'Online' ? 'bg-cyan-500' : 'bg-orange-500'
                                                        }`}></span>
                                                    {app.mode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                                                    <span className="mr-1">{getStatusIcon(app.status)}</span>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-500 truncate max-w-xs" title={app.notes}>
                                                    {app.notes || '-'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DoctorAppointmentsPage;
