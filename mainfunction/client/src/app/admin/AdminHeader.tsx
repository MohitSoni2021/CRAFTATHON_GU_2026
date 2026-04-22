import React from 'react';
import { FaSync } from 'react-icons/fa';

interface AdminHeaderProps {
    onRefresh: () => void;
}

export default function AdminHeader({ onRefresh }: AdminHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">System Control</p>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            </div>
            <button
                onClick={onRefresh}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
            >
                <FaSync size={10} /> Refresh
            </button>
        </div>
    );
}
