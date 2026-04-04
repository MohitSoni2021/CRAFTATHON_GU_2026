import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
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

        // Validate future date/time
        // Note: For slot selection, date/time are usually strictly controlled, but explicit future check is good safe guard
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
                <div className="flex flex-col mb-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <FaTimes className="text-xl" />
                        </button>
                    </div>
                    {availabilityDays.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">Available on: <span className="font-medium text-[#3AAFA9]">{availabilityDays.join(', ')}</span></p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Provider Name</label>
                        <input
                            type="text"
                            required
                            readOnly={!!prefilledDoctorName}
                            placeholder="Dr. Smith or City Lab"
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all ${prefilledDoctorName ? 'bg-gray-50' : ''}`}
                            value={formData.providerName}
                            onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Doctor">Doctor</option>
                                <option value="Lab">Lab</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mode</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all"
                                value={formData.mode}
                                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            >
                                <option value="Online">Online Consultation</option>
                                <option value="Offline">In-Person Visit</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            readOnly={!!prefilledDate}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all ${prefilledDate ? 'bg-gray-50' : ''}`}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                        />
                    </div>

                    {/* Slot Selection - Only show if time is NOT prefilled */}
                    {availableSlots.length > 0 && !prefilledTime && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Available Slots</label>
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() => setFormData({ ...formData, time: slot.time })}
                                        className={`
                                            px-2 py-2 text-sm rounded-lg border transition-all
                                            ${!slot.available
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed decoration-slice'
                                                : formData.time === slot.time
                                                    ? 'bg-[#3AAFA9] text-white border-[#3AAFA9]'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#3AAFA9]'}
                                        `}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                        <input
                            type="time"
                            required
                            readOnly={!!prefilledDoctorId || !!prefilledTime}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none transition-all ${!!prefilledDoctorId || !!prefilledTime ? 'cursor-not-allowed opacity-70' : ''}`}
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                        {(!!prefilledDoctorId && !prefilledTime) && <p className="text-xs text-gray-500 mt-1">Please select a slot from above.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#3AAFA9] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#2B7A78] transition-colors mt-2"
                    >
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
