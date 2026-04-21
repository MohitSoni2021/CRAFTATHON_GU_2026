'use client';
import { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    FaUserMd, FaUsers, FaClipboardList, FaTrash, FaShieldAlt,
    FaSearch, FaChevronLeft, FaChevronRight, FaCrown, FaUser,
    FaBolt, FaCheck, FaTimes, FaSync, FaNewspaper,
    FaCalendarAlt, FaExclamationTriangle, FaUserPlus, FaEdit, FaKey, FaEye, FaEyeSlash, FaLock
} from 'react-icons/fa';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────
interface User {
    _id: string;
    name: string;
    email: string;
    type: string;
    isVerified: boolean;
    createdAt: string;
    subscription?: { plan: string; status: string };
    usage?: { aiConsultations: number };
    profile?: { gender?: string };
}

interface Stats {
    users: number;
    doctors: number;
    admins: number;
    articles: number;
    appointments: number;
    premiumUsers: number;
    newUsersThisMonth: number;
    totalAll: number;
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
const roleBadge = (type: string) => {
    const map: Record<string, string> = {
        admin: 'bg-purple-100 text-purple-700',
        doctor: 'bg-emerald-100 text-emerald-700',
        user: 'bg-primary/10 text-primary',
    };
    return map[type] || 'bg-gray-100 text-gray-600';
};

const planBadge = (plan: string) => plan === 'premium'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-gray-100 text-gray-500';

// ────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [roleModal, setRoleModal] = useState<{ open: boolean; userId: string; currentType: string; name: string } | null>(null);
    const [resetModal, setResetModal] = useState<{ open: boolean; userId: string; name: string } | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // ── Auth Guard ──
    useEffect(() => {
        if (user && user.type !== 'admin') router.push('/dashboard');
    }, [user, router]);

    // ── Fetch ──
    const fetchUsers = useCallback(async (p = 1, s = '', t = '') => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p), limit: '15', search: s, type: t });
            const [statsRes, usersRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
            setTotalPages(usersRes.data.totalPages);
            setTotalUsers(usersRes.data.totalUsers);
        } catch (e) {
            showToast('Failed to load admin data', 'error');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (user?.type === 'admin') fetchUsers(page, search, typeFilter);
    }, [user, fetchUsers, page, typeFilter]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Actions ──
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers(1, search, typeFilter);
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast(`${name} deleted`);
            fetchUsers(page, search, typeFilter);
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Delete failed', 'error');
        }
    };

    const handleRoleChange = async (userId: string, newType: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`, { type: newType }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Role updated successfully');
            setRoleModal(null);
            fetchUsers(page, search, typeFilter);
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Role update failed', 'error');
        }
    };

    const handleSubscriptionToggle = async (userId: string, currentPlan: string) => {
        const newPlan = currentPlan === 'premium' ? 'free' : 'premium';
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/subscription`, { plan: newPlan }, { headers: { Authorization: `Bearer ${token}` } });
            showToast(`Plan switched to ${newPlan}`);
            fetchUsers(page, search, typeFilter);
        } catch (e: any) {
            showToast('Subscription update failed', 'error');
        }
    };

    const handleResetPassword = async () => {
        if (!resetModal?.userId) return;
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        setResetLoading(true);
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${resetModal.userId}/reset-password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(`Password reset for ${resetModal.name}`);
            setResetModal(null);
            setNewPassword('');
            setShowPassword(false);
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Password reset failed', 'error');
        } finally {
            setResetLoading(false);
        }
    };

    if (!user || user.type !== 'admin') return null;

    const statCards = [
        { label: 'Total Users', value: stats?.users ?? 0, icon: <FaUsers />, color: 'text-primary bg-primary/10' },
        { label: 'Doctors', value: stats?.doctors ?? 0, icon: <FaUserMd />, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Premium', value: stats?.premiumUsers ?? 0, icon: <FaCrown />, color: 'text-amber-600 bg-amber-50' },
        { label: 'New This Month', value: stats?.newUsersThisMonth ?? 0, icon: <FaUserPlus />, color: 'text-violet-600 bg-violet-50' },
        { label: 'Appointments', value: stats?.appointments ?? 0, icon: <FaCalendarAlt />, color: 'text-rose-600 bg-rose-50' },
        { label: 'Articles', value: stats?.articles ?? 0, icon: <FaNewspaper />, color: 'text-sky-600 bg-sky-50' },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#f8f9fc]">
                {/* ── Toast ── */}
                {toast && (
                    <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-black uppercase tracking-widest animate-in slide-in-from-right-5 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {toast.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />} {toast.msg}
                    </div>
                )}

                {/* ── Sidebar + Content ── */}
                <div className="flex min-h-screen">
                    {/* Sidebar */}
                    <aside className="w-64 bg-gray-900 text-white flex flex-col py-10 px-6 fixed inset-y-0 left-0 z-50 hidden lg:flex">
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <FaShieldAlt size={14} />
                                </div>
                                <span className="font-black text-base tracking-tight">Admin Panel</span>
                            </div>
                            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest ml-11">LifeDoc Control Center</p>
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

                    {/* Main */}
                    <main className="flex-1 lg:ml-64 p-6 lg:p-10">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">System Control</p>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
                            </div>
                            <button
                                onClick={() => fetchUsers(page, search, typeFilter)}
                                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                            >
                                <FaSync size={10} /> Refresh
                            </button>
                        </div>

                        {/* Stats Grid */}
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

                        {/* User Management */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Table Header */}
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">User Registry</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{totalUsers.toLocaleString()} total accounts</p>
                                </div>
                                <form onSubmit={handleSearch} className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="Search name or email..."
                                            className="w-full pl-10 pr-4 py-3 bg-[#f8f9fc] border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <select
                                        value={typeFilter}
                                        onChange={e => { setTypeFilter(e.target.value); setPage(1); fetchUsers(1, search, e.target.value); }}
                                        className="py-3 px-4 bg-[#f8f9fc] border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none pr-8"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="user">User</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button type="submit" className="bg-gray-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shrink-0">
                                        Search
                                    </button>
                                </form>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-[#f8f9fc] border-b border-gray-100">
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">AI Uses</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            [...Array(8)].map((_, i) => (
                                                <tr key={i}>
                                                    {[...Array(6)].map((_, j) => (
                                                        <td key={j} className="px-6 py-5"><div className="h-4 bg-gray-100 rounded-lg animate-pulse w-full max-w-[120px]"></div></td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : users.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                                                    <FaUsers className="text-4xl mx-auto mb-3 opacity-30" />
                                                    <p className="font-bold text-sm">No users found</p>
                                                </td>
                                            </tr>
                                        ) : users.map((u) => (
                                            <tr key={u._id} className="hover:bg-[#f8f9fc] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${u.type === 'admin' ? 'bg-purple-100 text-purple-700' : u.type === 'doctor' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                                                            {u.name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm">{u.name}</p>
                                                            <p className="text-[10px] text-gray-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${roleBadge(u.type)}`}>
                                                        {u.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleSubscriptionToggle(u._id, u.subscription?.plan || 'free')}
                                                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 ${planBadge(u.subscription?.plan || 'free')}`}
                                                        title="Click to toggle plan"
                                                    >
                                                        {u.subscription?.plan === 'premium' ? '👑 Premium' : 'Free'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-500">
                                                    {u.usage?.aiConsultations ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-gray-400 font-medium">
                                                    {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {u.type !== 'admin' && (
                                                            <button
                                                                onClick={() => setRoleModal({ open: true, userId: u._id, currentType: u.type, name: u.name })}
                                                                className="p-2 rounded-xl bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-400 transition-all"
                                                                title="Change Role"
                                                            >
                                                                <FaEdit size={12} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => { setResetModal({ open: true, userId: u._id, name: u.name }); setNewPassword(''); setShowPassword(false); }}
                                                            className="p-2 rounded-xl bg-gray-100 hover:bg-amber-50 hover:text-amber-600 text-gray-400 transition-all"
                                                            title="Reset Password"
                                                        >
                                                            <FaKey size={12} />
                                                        </button>
                                                        {u.type !== 'admin' && (
                                                            <button
                                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                                className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
                                                                title="Delete User"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        )}
                                                        {u.type === 'admin' && (
                                                            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-2">Protected</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-6 border-t border-gray-50 flex justify-between items-center">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Page {page} of {totalPages}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setPage(p => Math.max(1, p - 1)); }}
                                            disabled={page === 1}
                                            className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                        >
                                            <FaChevronLeft size={12} />
                                        </button>
                                        <button
                                            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); }}
                                            disabled={page === totalPages}
                                            className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                        >
                                            <FaChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                {/* ── Role Change Modal ── */}
                {roleModal?.open && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
                            <h2 className="text-xl font-black text-gray-900 mb-1">Change Role</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">Updating access for <span className="text-primary">{roleModal.name}</span></p>
                            <div className="space-y-3 mb-8">
                                {(['user', 'doctor', 'admin'] as const).map(role => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleChange(roleModal.userId, role)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${roleModal.currentType === role ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:border-primary/20 hover:bg-[#f8f9fc]'}`}
                                    >
                                        <span className="font-black text-sm uppercase tracking-widest">{role}</span>
                                        {roleModal.currentType === role && <FaCheck size={12} />}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setRoleModal(null)} className="w-full py-3 rounded-xl border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Reset Password Modal ── */}
                {resetModal?.open && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
                                    <FaLock />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Reset Password</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Override</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-8 mt-2">
                                Setting new password for <span className="font-black text-gray-900">{resetModal.name}</span>
                            </p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                    <div className="relative group">
                                        <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" size={12} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                                            placeholder="Min. 6 characters"
                                            className="w-full pl-10 pr-12 py-4 bg-[#f8f9fc] border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                        </button>
                                    </div>
                                    {newPassword.length > 0 && newPassword.length < 6 && (
                                        <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">⚠ Too short — minimum 6 characters</p>
                                    )}
                                    {newPassword.length >= 6 && (
                                        <p className="text-[10px] text-emerald-600 font-bold mt-2 ml-1">✓ Strength acceptable</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setResetModal(null); setNewPassword(''); setShowPassword(false); }}
                                    className="flex-1 py-3 rounded-xl border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={resetLoading || newPassword.length < 6}
                                    className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
                                >
                                    {resetLoading ? (
                                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Resetting...</>
                                    ) : (
                                        <><FaKey size={10} /> Confirm Reset</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
