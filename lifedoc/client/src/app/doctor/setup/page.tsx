'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaClock, FaCalendarDay, FaUtensils, FaSave } from 'react-icons/fa';

const DoctorSetupPage = () => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);

    const [days, setDays] = useState<string[]>([]);
    const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' });
    const [lunchBreak, setLunchBreak] = useState({ start: '13:00', end: '14:00' });
    const [slotDuration, setSlotDuration] = useState(30);

    const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const slotOptions = [15, 30, 45, 60];

    useEffect(() => {
        if (user?.availability) {
            setDays(user.availability.days || []);
            setWorkingHours(user.availability.workingHours || { start: '09:00', end: '17:00' });
            setLunchBreak(user.availability.lunchBreak || { start: '13:00', end: '14:00' });
            setSlotDuration(user.availability.slotDuration || 30);
        }
    }, [user]);

    const handleDayToggle = (day: string) => {
        if (days.includes(day)) {
            setDays(days.filter(d => d !== day));
        } else {
            setDays([...days, day]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/doctors/availability`,
                { days, workingHours, lunchBreak },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Availability updated successfully!');
            }
        } catch (error) {
            console.error('Error updating availability:', error);
            alert('Failed to update availability.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Availability Setup</h1>
                    <p className="text-gray-600 mt-2">Configure your working days, hours, and lunch breaks.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSave} className="space-y-8">

                        {/* Working Days */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FaCalendarDay className="text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Working Days</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {availableDays.map(day => (
                                    <label key={day} className={`
                                        flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${days.includes(day)
                                            ? 'border-[#3AAFA9] bg-[#3AAFA9]/10 text-[#2B7A78] font-bold'
                                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}
                                    `}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={days.includes(day)}
                                            onChange={() => handleDayToggle(day)}
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-8"></div>

                        {/* Working Hours */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <FaClock className="text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Working Hours</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                        value={workingHours.start}
                                        onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                        value={workingHours.end}
                                        onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-8"></div>

                        {/* Lunch Break */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                    <FaUtensils className="text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Lunch Break</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                        value={lunchBreak.start}
                                        onChange={(e) => setLunchBreak({ ...lunchBreak, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                        value={lunchBreak.end}
                                        onChange={(e) => setLunchBreak({ ...lunchBreak, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-8"></div>

                        {/* Slot Duration */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <FaClock className="text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Appointment Duration</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {slotOptions.map(duration => (
                                    <button
                                        key={duration}
                                        type="button"
                                        onClick={() => setSlotDuration(duration)}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all font-bold text-lg
                                            ${slotDuration === duration
                                                ? 'border-[#3AAFA9] bg-[#3AAFA9]/10 text-[#2B7A78]'
                                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}
                                        `}
                                    >
                                        {duration} min
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2 ml-1">Example: A {slotDuration} minute duration creates slots like 09:00, 09:{slotDuration}...</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaSave /> Save Settings
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DoctorSetupPage;
