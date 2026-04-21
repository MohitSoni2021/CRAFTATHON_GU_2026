import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaCalendarCheck, FaUserMd, FaClock, FaClipboardList } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface BookingModalProps {
    onClose: () => void;
    onSuccess: (appointment: any) => void;
    prefilledDoctorId?: string;
    prefilledDoctorName?: string;
    prefilledDate?: string;
    prefilledTime?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ onClose, onSuccess, prefilledDoctorId, prefilledDoctorName, prefilledDate, prefilledTime }) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [formData, setFormData] = useState({
        providerName: prefilledDoctorName || '',
        type: 'Doctor',
        date: prefilledDate || '',
        time: prefilledTime || '',
        mode: 'Online',
        notes: ''
    });

    interface Slot {
        time: string;
        available: boolean;
    }

    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [availabilityDays, setAvailabilityDays] = useState<string[]>([]);
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/appointments`;

    useEffect(() => {
        if (prefilledDoctorId && formData.date) {
            fetchSlots(prefilledDoctorId, formData.date);
        } else {
            setAvailableSlots([]);
        }
    }, [prefilledDoctorId, formData.date]);

    const fetchSlots = async (doctorId: string, date: string) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctors/${doctorId}/slots?date=${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAvailableSlots(response.data.data);
                if (response.data.availabilityDays) {
                    setAvailabilityDays(response.data.availabilityDays);
                }
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            setAvailableSlots([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
        if (selectedDateTime <= new Date()) {
            alert('Please select a future date and time for your appointment.');
            return;
        }

        try {
            const payload = { ...formData, doctorId: prefilledDoctorId || undefined };
            const response = await axios.post(API_URL, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                onSuccess(response.data.data);
                onClose();
            }
        } catch (error: any) {
            console.error('Error creating appointment:', error);
            alert(error.response?.data?.message || 'Failed to book appointment');
        }
    };

    return (
        <div className="fixed inset-0 bg-[#2c3436]/60 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-500 animate-in fade-in">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                <div className="p-1 bg-gradient-primary"></div>
                
                <div className="p-8 md:p-10">
                    <header className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center space-x-3 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                                <FaCalendarCheck className="text-sm" /> <span>Consultation Booking</span>
                            </div>
                            <h2 className="text-2xl font-extrabold text-[#2c3436]">Reserve your <span className="text-primary">Session</span></h2>
                            {availabilityDays.length > 0 && (
                                <p className="text-xs text-tertiary/50 mt-2 font-bold uppercase tracking-wider">Available: {availabilityDays.join(', ')}</p>
                            )}
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 flex items-center justify-center text-tertiary/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-2">Healthcare Provider</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">
                                        <FaUserMd />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        readOnly={!!prefilledDoctorName}
                                        placeholder="Provider name or clinical center"
                                        className={`w-full pl-11 pr-4 py-4 rounded-xl border border-gray-100 bg-surface-container-low text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all ${prefilledDoctorName ? 'opacity-70' : ''}`}
                                        value={formData.providerName}
                                        onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-2">Service Type</label>
                                <select
                                    className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-surface-container-low text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Doctor">Clinical Doctor</option>
                                    <option value="Lab">Lab Diagnostic</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-2">Interaction Mode</label>
                                <select
                                    className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-surface-container-low text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none"
                                    value={formData.mode}
                                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                >
                                    <option value="Online">Virtual Call</option>
                                    <option value="Offline">In-Clinic Visit</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-2">Appointment Date</label>
                                <input
                                    type="date"
                                    required
                                    readOnly={!!prefilledDate}
                                    className={`w-full px-4 py-4 rounded-xl border border-gray-100 bg-surface-container-low text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all ${prefilledDate ? 'opacity-70' : ''}`}
                                    value={formData.date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-2">Preferred Time</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">
                                        <FaClock />
                                    </div>
                                    <input
                                        type="time"
                                        required
                                        readOnly={!!prefilledDoctorId || !!prefilledTime}
                                        className={`w-full pl-11 pr-4 py-4 rounded-xl border border-gray-100 bg-surface-container-low text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all ${!!prefilledDoctorId || !!prefilledTime ? 'opacity-70' : ''}`}
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Slot Selection */}
                        {availableSlots.length > 0 && !prefilledTime && (
                            <div className="pt-2">
                                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-3">Available Time Slots</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot.time}
                                            type="button"
                                            disabled={!slot.available}
                                            onClick={() => setFormData({ ...formData, time: slot.time })}
                                            className={`
                                                py-3 px-1 text-xs rounded-xl border transition-all font-bold
                                                ${!slot.available
                                                    ? 'bg-surface-container-low text-tertiary/20 border-transparent cursor-not-allowed'
                                                    : formData.time === slot.time
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                        : 'bg-white text-[#2c3436] border-gray-100 hover:border-primary hover:text-primary'}
                                            `}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                                {(!!prefilledDoctorId && !formData.time) && (
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-2 flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
                                        Action required: Select a slot
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-2 flex items-center">
                                <FaClipboardList className="mr-2" /> Clinical Notes <span className="ml-1 opacity-50 lowercase italic">(optional)</span>
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Any specific symptoms or health history..."
                                className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-surface-container-low text-[#2c3436] font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary !rounded-xl w-full py-5 !text-sm shadow-xl shadow-primary/20"
                        >
                            Confirm Clinical Reservation
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
