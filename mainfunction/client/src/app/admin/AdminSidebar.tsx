import React from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaBolt, FaUsers, FaClipboardList, FaNewspaper, FaChevronLeft } from 'react-icons/fa';

interface AdminSidebarProps {
    user: any; // using any for simplicity since we get user from Redux auth state which might be typed differently
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
    const router = useRouter();

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col py-10 px-6 fixed inset-y-0 left-0 z-50 hidden lg:flex">
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <FaShieldAlt size={14} />
                    </div>
                    <span className="font-black text-base tracking-tight">Admin Panel</span>
                </div>
                <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest ml-11">SwasthyaSaathi Control Center</p>
            </div>

            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center text-lg font-black mb-3">
                    {user?.name?.[0] || 'A'}
                </div>
                <p className="font-bold text-sm">{user?.name}</p>
                <p className="text-gray-400 text-[10px]">{user?.email}</p>
                <span className="mt-2 inline-block bg-purple-500/20 text-purple-300 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Super Admin</span>
            </div>

            <nav className="space-y-1 flex-1">
                {[
                    { label: 'Dashboard', icon: <FaBolt />, active: true },
                    { label: 'User Registry', icon: <FaUsers />, active: false },
                    { label: 'Medical DB', icon: <FaClipboardList />, active: false, href: '/admin/medical-database' },
                    { label: 'AI Monitoring', icon: <FaNewspaper />, active: false, href: '/admin/ai-monitoring' },
                ].map((item, i) => (
                    <button
                        key={i}
                        onClick={() => item.href && router.push(item.href)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${item.active ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <span className="text-base">{item.icon}</span> {item.label}
                    </button>
                ))}
            </nav>

            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 text-[11px] font-black uppercase tracking-widest transition-all mt-4">
                <FaChevronLeft /> Back to App
            </button>
        </aside>
    );
}
