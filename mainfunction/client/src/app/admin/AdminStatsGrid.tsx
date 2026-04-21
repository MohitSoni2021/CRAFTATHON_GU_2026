import React, { useMemo } from 'react';
import { FaUsers, FaUserMd, FaCrown, FaUserPlus, FaCalendarAlt, FaNewspaper } from 'react-icons/fa';
import { Stats } from './types';

interface AdminStatsGridProps {
    stats: Stats | null;
    loading: boolean;
}

export default function AdminStatsGrid({ stats, loading }: AdminStatsGridProps) {
    const statCards = useMemo(() => [
        { label: 'Total Users', value: stats?.users ?? 0, icon: <FaUsers />, color: 'text-primary bg-primary/10' },
        { label: 'Doctors', value: stats?.doctors ?? 0, icon: <FaUserMd />, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Premium', value: stats?.premiumUsers ?? 0, icon: <FaCrown />, color: 'text-amber-600 bg-amber-50' },
        { label: 'New This Month', value: stats?.newUsersThisMonth ?? 0, icon: <FaUserPlus />, color: 'text-violet-600 bg-violet-50' },
        { label: 'Appointments', value: stats?.appointments ?? 0, icon: <FaCalendarAlt />, color: 'text-rose-600 bg-rose-50' },
        { label: 'Articles', value: stats?.articles ?? 0, icon: <FaNewspaper />, color: 'text-sky-600 bg-sky-50' },
    ], [stats]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
            {statCards.map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-base mb-4 group-hover:scale-110 transition-transform`}>
                        {s.icon}
                    </div>
                    <p className="text-2xl font-black text-gray-900">{loading ? '—' : s.value.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
            ))}
        </div>
    );
}
