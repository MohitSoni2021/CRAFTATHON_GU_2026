'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getDiaryEntryById, updateDiaryEntry } from '@/store/slices/diarySlice';
import { useRouter, useParams } from 'next/navigation';
import { FaArrowLeft, FaMagic, FaSmile, FaMeh, FaFrown, FaBolt, FaCloudRain, FaSave, FaCalendarAlt } from 'react-icons/fa';

export default function EditDiaryEntryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const { currentEntry, loading } = useSelector((state: RootState) => state.diary);

    const [date, setDate] = useState('');
    const [text, setText] = useState('');
    const [mood, setMood] = useState('neutral');
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (params.id) {
            dispatch(getDiaryEntryById(params.id as string));
        }
    }, [dispatch, params.id]);

    useEffect(() => {
        if (currentEntry) {
            setDate(new Date(currentEntry.date).toISOString().split('T')[0]);
            setText(currentEntry.rawText || '');
            setMood(currentEntry.mood || 'neutral');
            setSummary(currentEntry.summary);
        }
    }, [currentEntry]);

    // Generate AI Summary
    const generateSummary = async () => {
        if (!text) return;
        setIsGenerating(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/ai/summerizer?prompt=diarySummerizer`,
                { text, date },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { summary: aiSummary, feeling } = response.data;
            setSummary(aiSummary);

            if (feeling) {
                const moodLower = feeling.toLowerCase();
                if (moods.some(m => m.id === moodLower)) {
                    setMood(moodLower);
                }
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Failed to generate summary. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !params.id) return;

        const finalSummary = summary || text.slice(0, 100) + (text.length > 100 ? '...' : '');

        const result = await dispatch(updateDiaryEntry({
            id: params.id as string,
            data: {
                date: date,
                rawText: text,
                summary: finalSummary,
                mood: mood as any,
                tags: ['daily', mood]
            }
        }));

        if (updateDiaryEntry.fulfilled.match(result)) {
            router.push('/diary');
        }
    };

    const moods = [
        { id: 'happy', icon: FaSmile, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
        { id: 'energetic', icon: FaBolt, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'neutral', icon: FaMeh, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
        { id: 'sad', icon: FaCloudRain, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
        { id: 'stressed', icon: FaFrown, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    ];

    if (loading && !currentEntry) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Journal Entry...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

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
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Journal Entry</h1>
                        <p className="text-gray-500 font-medium mt-1">Review or update your thoughts from {new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Input Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="card-editorial p-8 shadow-ambient border border-outline-variant">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Date of Entry</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FaCalendarAlt className="text-primary/50" />
                                        </div>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="input-editorial pl-11 !bg-surface-container-low font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">How were you feeling?</label>
                                <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                                    {moods.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setMood(m.id)}
                                            className={`flex flex-col items-center p-5 rounded-xl border min-w-[100px] transition-all duration-300 ${mood === m.id
                                                ? `${m.bg} ${m.border} ring-4 ring-primary/5 shadow-inner translate-y-[-2px]`
                                                : 'bg-white border-outline-variant hover:bg-surface-container-low hover:border-primary/20'
                                                }`}
                                        >
                                            <m.icon className={`text-3xl mb-3 ${mood === m.id ? m.color : 'text-slate-300'}`} />
                                            <span className={`text-xs font-bold capitalize ${mood === m.id ? 'text-gray-900' : 'text-slate-500'}`}>{m.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Journal Entry</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Update your notes for the day..."
                                    className="input-editorial !bg-surface-container-low h-80 resize-none leading-relaxed font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AI Summary Side */}
                    <div className="space-y-8">
                        <div className="bg-gradient-primary p-8 rounded-xl shadow-xl text-white relative overflow-hidden group">
                            {/* Decorative Sparkles */}
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <FaMagic size={120} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                        <FaMagic className="text-yellow-300 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-bold">AI Companion</h3>
                                </div>
                                <p className="text-on-primary/80 text-sm mb-8 leading-relaxed font-medium">
                                    I've analyzed your entry. You can regenerate the summary if you've made significant changes.
                                </p>

                                {summary ? (
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 mb-8 border border-white/10">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-3">Current AI Summary</h4>
                                        <p className="text-sm leading-relaxed font-medium italic">"{summary}"</p>
                                    </div>
                                ) : (
                                    <div className="border border-white/20 border-dashed rounded-2xl p-10 text-center text-white/40 text-sm mb-8 font-medium">
                                        No summary available yet.
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={generateSummary}
                                    disabled={!text || isGenerating}
                                    className="w-full py-4 bg-white text-primary rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
                                >
                                    {isGenerating ? (
                                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    ) : (
                                        <FaMagic size={14} />
                                    )}
                                    <span>{isGenerating ? 'Analyzing...' : 'Regenerate Summary'}</span>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !text}
                            className="btn-primary !rounded-xl w-full py-5 text-lg shadow-ambient flex items-center justify-center space-x-3"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaSave size={18} />
                                    <span>Update Journal Entry</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
