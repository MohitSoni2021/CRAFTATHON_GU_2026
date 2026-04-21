'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchDiaryEntries, fetchMoodStatistics, deleteDiaryEntry, fetchDiaryEntriesByMood } from '@/store/slices/diarySlice';
import Link from 'next/link';
import { FaPlus, FaPenFancy, FaSmile, FaMeh, FaFrown, FaBolt, FaCloudRain, FaTrash, FaEdit, FaChartPie, FaCalendarAlt, FaHashtag } from 'react-icons/fa';

export default function DiaryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { entries, loading, stats } = useSelector((state: RootState) => state.diary);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchDiaryEntries(user.id));
            dispatch(fetchMoodStatistics(user.id));
        }
    }, [dispatch, user]);

    const handleFilterMood = (mood: string | null) => {
        if (!user?.id) return;
        setSelectedMood(mood);
        if (mood) {
            dispatch(fetchDiaryEntriesByMood({ userId: user.id, mood }));
        } else {
            dispatch(fetchDiaryEntries(user.id));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            await dispatch(deleteDiaryEntry(id));
            if (user?.id) dispatch(fetchMoodStatistics(user.id)); // Refresh stats
        }
    };

    const getMoodIcon = (mood?: string) => {
        switch (mood) {
            case 'happy': return <FaSmile className="text-amber-500 text-xl" />;
            case 'energetic': return <FaBolt className="text-orange-500 text-xl" />;
            case 'neutral': return <FaMeh className="text-slate-500 text-xl" />;
            case 'sad': return <FaCloudRain className="text-sky-500 text-xl" />;
            case 'stressed': return <FaFrown className="text-rose-500 text-xl" />;
            default: return <FaSmile className="text-slate-400 text-xl" />;
        }
    };

    const moods = [
        { id: 'happy', icon: FaSmile, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'energetic', icon: FaBolt, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'neutral', icon: FaMeh, color: 'text-slate-500', bg: 'bg-slate-50' },
        { id: 'sad', icon: FaCloudRain, color: 'text-sky-500', bg: 'bg-sky-50' },
        { id: 'stressed', icon: FaFrown, color: 'text-rose-500', bg: 'bg-red-50' },
    ];

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Health Diary</h1>
                        <p className="text-gray-500 mt-2 font-medium">Journal your thoughts and track your emotional well-being.</p>
                    </div>
                    <Link
                        href="/diary/new"
                        className="btn-primary !rounded-xl gap-2"
                    >
                        <FaPlus size={14} />
                        <span>New Journal Entry</span>
                    </Link>
                </header>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card-editorial p-6 shadow-ambient border border-outline-variant flex items-center space-x-5">
                        <div className="p-4 bg-primary/5 rounded-xl">
                            <FaPenFancy className="text-2xl text-primary" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Entries</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{entries.length}</h3>
                        </div>
                    </div>

                    <div className="card-editorial p-6 shadow-ambient border border-outline-variant flex items-center space-x-5">
                        <div className="p-4 bg-tertiary/5 rounded-xl">
                            <FaChartPie className="text-2xl text-tertiary" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Dominant Mood</p>
                            <h3 className="text-2xl font-bold text-gray-900 capitalize mt-0.5">
                                {stats.length > 0 ? stats[0]._id : 'N/A'}
                            </h3>
                        </div>
                    </div>

                    <div className="card-editorial p-6 shadow-ambient border border-outline-variant">
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Mood Distribution</p>
                        <div className="flex items-end space-x-3 h-10">
                            {moods.map((m) => {
                                const stat = stats.find(s => s._id === m.id);
                                const percentage = stat ? (stat.count / Math.max(entries.length, 1)) * 100 : 0;
                                return (
                                    <div key={m.id} className="flex-1 group relative">
                                        <div className="h-10 w-full bg-surface-container-low rounded-md overflow-hidden flex flex-col justify-end">
                                            <div
                                                className={`w-full transition-all duration-500 ease-out ${
                                                    m.id === 'happy' ? 'bg-amber-400' :
                                                    m.id === 'energetic' ? 'bg-orange-400' :
                                                    m.id === 'sad' ? 'bg-sky-400' :
                                                    m.id === 'stressed' ? 'bg-rose-400' : 'bg-slate-300'
                                                }`}
                                                style={{ height: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            {m.id}: {Math.round(percentage)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
                    <button
                        onClick={() => handleFilterMood(null)}
                        className={`px-6 py-2.5 !rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedMood === null
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white text-gray-600 border border-outline-variant hover:bg-gray-50'
                            }`}
                    >
                        All Entries
                    </button>
                    {moods.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => handleFilterMood(m.id)}
                            className={`px-5 py-2.5 !rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap ${selectedMood === m.id
                                ? `${m.bg} ${m.color} border border-current shadow-sm`
                                : 'bg-white text-gray-600 border border-outline-variant hover:bg-gray-50'
                                }`}
                        >
                            <m.icon className={selectedMood === m.id ? m.color : 'text-gray-400'} />
                            <span className="capitalize">{m.id}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card-editorial p-6 border border-outline-variant animate-pulse">
                                <div className="flex justify-between mb-6">
                                    <div className="h-4 w-24 bg-gray-100 rounded"></div>
                                    <div className="h-10 w-10 bg-gray-100 rounded-xl"></div>
                                </div>
                                <div className="h-6 w-3/4 bg-gray-100 rounded mb-4"></div>
                                <div className="space-y-2 mb-6">
                                    <div className="h-3 w-full bg-gray-100 rounded"></div>
                                    <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-gray-100 rounded"></div>
                                    <div className="h-6 w-16 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-20 card-editorial border border-dashed border-primary/30 bg-primary/5 shadow-none">
                        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-ambient">
                            <FaPenFancy className="text-3xl text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No entries found</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            {selectedMood ? `It looks like you haven't recorded any "${selectedMood}" entries yet.` : "Your health journal is empty. Start documenting your wellness journey today."}
                        </p>
                        <Link
                            href="/diary/new"
                            className="btn-primary !rounded-xl inline-flex gap-2"
                        >
                            <FaPlus size={14} />
                            <span>Create Your First Entry</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {entries.map((entry) => (
                            <div key={entry._id} className="card-editorial p-7 shadow-ambient border border-outline-variant hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
                                {/* Decorator Gradient */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none transition-all duration-300 group-hover:from-primary/10"></div>
                                
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2 translate-y-1 group-hover:translate-y-0">
                                    <Link
                                        href={`/diary/${entry._id}`}
                                        className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-primary hover:text-white shadow-sm border border-outline-variant transition-colors"
                                        title="Edit Entry"
                                    >
                                        <FaEdit size={14} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(entry._id)}
                                        className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-rose-500 hover:text-white shadow-sm border border-outline-variant transition-colors"
                                        title="Delete Entry"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center text-slate-500 text-sm font-bold bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant">
                                        <FaCalendarAlt className="mr-2 text-primary/70" size={12} />
                                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-outline-variant z-10">
                                        {getMoodIcon(entry.mood)}
                                    </div>
                                </div>

                                <Link href={`/diary/${entry._id}`} className="block flex-grow group/link">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover/link:text-primary transition-colors leading-tight">{entry.summary}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 leading-relaxed font-medium opacity-80">
                                        {entry.rawText || "No additional text details available for this entry."}
                                    </p>
                                </Link>

                                <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-outline-variant">
                                    {entry.tags?.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center px-3 py-1 bg-surface-container-low text-primary text-[11px] rounded-full font-bold uppercase tracking-wider border border-primary/10">
                                            <FaHashtag size={8} className="mr-1 opacity-50" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
