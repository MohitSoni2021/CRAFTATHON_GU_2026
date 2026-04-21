'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaClock, FaCalendarDay, FaUtensils, FaSave, FaCog } from 'react-icons/fa';

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
            <div className="w-full p-4 md:p-8 space-y-8 bg-[#f8f9fc] min-h-screen">
                <header className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <FaCog className="text-primary"/> Clinical Setup
                        </h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">Configure your working schedule, availability, and appointment slots.</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSave} className="space-y-10">

                        {/* Working Days */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                    <FaCalendarDay className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Working Days</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Active Schedule</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {availableDays.map(day => (
                                    <label key={day} className={`
                                        flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm
                                        ${days.includes(day)
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'}
                                    `}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={days.includes(day)}
                                            onChange={() => handleDayToggle(day)}
                                        />
                                        <span className="text-xs font-black uppercase tracking-widest mb-1">{day.substring(0,3)}</span>
                                        <span className={`text-[10px] font-bold ${days.includes(day) ? 'text-primary/70' : 'text-gray-400'}`}>
                                            {days.includes(day) ? 'Active' : 'Off'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Working Hours */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                                    <FaClock className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Operational Hours</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Set Daily Window</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Commencement Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-bold text-gray-900 transition-all shadow-sm"
                                        value={workingHours.start}
                                        onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Conclusion Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-bold text-gray-900 transition-all shadow-sm"
                                        value={workingHours.end}
                                        onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Lunch Break */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
                                    <FaUtensils className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Intermission</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Schedule Breaks</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Break Start</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-gray-900 transition-all shadow-sm"
                                        value={lunchBreak.start}
                                        onChange={(e) => setLunchBreak({ ...lunchBreak, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Break End</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-gray-900 transition-all shadow-sm"
                                        value={lunchBreak.end}
                                        onChange={(e) => setLunchBreak({ ...lunchBreak, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Slot Duration */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <FaClock className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Consultation Duration</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Time per Patient</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {slotOptions.map(duration => (
                                    <button
                                        key={duration}
                                        type="button"
                                        onClick={() => setSlotDuration(duration)}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all shadow-sm flex flex-col items-center justify-center
                                            ${slotDuration === duration
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white hover:text-gray-600'}
                                        `}
                                    >
                                        <span className="font-black text-xl mb-1">{duration}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Minutes</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 ml-1 font-medium bg-gray-50 p-3 rounded-xl inline-block border border-gray-100">
                                <strong className="text-gray-700">Example Matrix:</strong> A {slotDuration}-minute duration allocates time slots logically starting from {workingHours.start} (e.g., {workingHours.start}, {
                                    (() => {
                                        let [h, m] = workingHours.start.split(':').map(Number);
                                        m += slotDuration;
                                        if (m >= 60) { h += Math.floor(m / 60); m %= 60; }
                                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    })()
                                }...)
                            </p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Syncing Database...</>
                                ) : (
                                    <><FaSave size={16} /> Finalize Configuration</>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DoctorSetupPage;
