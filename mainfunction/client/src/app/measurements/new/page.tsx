'use client';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createMeasurement, MeasurementReading } from '@/store/slices/measurementsSlice';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTint, FaHeartbeat, FaWeight, FaStopwatch, FaCalendarAlt, FaInfoCircle, FaChevronRight } from 'react-icons/fa';

export default function NewMeasurementPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.measurements);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedType, setSelectedType] = useState('glucose');

    // Form states
    const [reading, setReading] = useState<any>({
        value: '',
        systolic: '',
        diastolic: '',
        unit: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        let finalValue;
        let finalUnit = reading.unit;

        if (selectedType === 'bloodPressure') {
            finalValue = {
                systolic: Number(reading.systolic),
                diastolic: Number(reading.diastolic)
            };
            finalUnit = 'mmHg';
        } else {
            finalValue = Number(reading.value);
            if (!finalUnit) {
                if (selectedType === 'glucose') finalUnit = 'mg/dL';
                if (selectedType === 'weight') finalUnit = 'kg';
                if (selectedType === 'heartRate') finalUnit = 'bpm';
                if (selectedType === 'spo2') finalUnit = '%';
            }
        }

        const payload: MeasurementReading = {
            type: selectedType as any,
            value: finalValue,
            unit: finalUnit,
            notes: reading.notes,
            timestamp: new Date().toISOString()
        };

        const result = await dispatch(createMeasurement({
            userId: user.id,
            date: date,
            readings: [payload]
        }));

        if (createMeasurement.fulfilled.match(result)) {
            router.push('/measurements');
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="flex items-center mb-10">
                    <button
                        onClick={() => router.back()}
                        className="mr-6 p-3 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-outline-variant text-slate-600"
                    >
                        <FaArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add Measurement</h1>
                        <p className="text-gray-500 font-medium mt-1">Record your latest health vitals and measurements.</p>
                    </div>
                </header>

                <div className="w-full">
                    <div className="card-editorial p-8 md:p-10 shadow-ambient border border-outline-variant">
                        <form onSubmit={handleSubmit} className="space-y-10">

                            {/* Date Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Reading Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/50">
                                            <FaCalendarAlt size={14} />
                                        </div>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="input-editorial pl-11 !bg-surface-container-low font-bold text-gray-900 !rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Measurement Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest text-center md:text-left">What are you measuring?</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { id: 'glucose', icon: FaTint, label: 'Glucose' },
                                        { id: 'bloodPressure', icon: FaHeartbeat, label: 'BP' },
                                        { id: 'weight', icon: FaWeight, label: 'Weight' },
                                        { id: 'heartRate', icon: FaStopwatch, label: 'Heart Rate' },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setSelectedType(type.id)}
                                            className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center space-y-3 transition-all duration-300 ${selectedType === type.id
                                                ? 'border-primary bg-primary/[0.03] text-primary shadow-sm scale-[1.02]'
                                                : 'border-outline-variant hover:border-primary/20 hover:bg-gray-50 text-gray-400'
                                                }`}
                                        >
                                            <type.icon size={24} className={selectedType === type.id ? "text-primary" : "text-gray-300"} />
                                            <span className="text-xs font-extrabold uppercase tracking-widest">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Data Input Section */}
                            <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant space-y-8">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FaInfoCircle className="text-primary/50" size={14} />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Details</span>
                                </div>

                                {selectedType === 'bloodPressure' ? (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Systolic (mmHg)</label>
                                            <input
                                                type="number"
                                                placeholder="120"
                                                value={reading.systolic}
                                                onChange={(e) => setReading({ ...reading, systolic: e.target.value })}
                                                className="input-editorial text-xl font-extrabold !rounded-xl !bg-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Diastolic (mmHg)</label>
                                            <input
                                                type="number"
                                                placeholder="80"
                                                value={reading.diastolic}
                                                onChange={(e) => setReading({ ...reading, diastolic: e.target.value })}
                                                className="input-editorial text-xl font-extrabold !rounded-xl !bg-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
                                            Recorded Value ({selectedType === 'glucose' ? 'mg/dL' : selectedType === 'weight' ? 'kg' : 'bpm'})
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="0.0"
                                                value={reading.value}
                                                onChange={(e) => setReading({ ...reading, value: e.target.value })}
                                                className="input-editorial text-2xl font-extrabold !rounded-xl !bg-white pr-16"
                                                required
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm uppercase tracking-widest pointer-events-none">
                                                {selectedType === 'glucose' ? 'mg/dL' : selectedType === 'weight' ? 'kg' : selectedType === 'heartRate' ? 'bpm' : ''}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Notes & Context (Optional)</label>
                                    <textarea
                                        value={reading.notes}
                                        onChange={(e) => setReading({ ...reading, notes: e.target.value })}
                                        placeholder="Add any relevant information (e.g. after morning workout, following 12h fast...)"
                                        className="input-editorial h-32 resize-none leading-relaxed font-medium !rounded-xl !bg-white p-5"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary !rounded-xl w-full py-5 text-lg shadow-ambient group"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>Complete Entry</span>
                                        <FaChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
