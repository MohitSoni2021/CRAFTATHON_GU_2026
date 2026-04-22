'use client';
import { useEffect, useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';

import { User, Stats } from './types';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminStatsGrid from './AdminStatsGrid';
import AdminUserRegistry from './AdminUserRegistry';
import RoleChangeModal from './RoleChangeModal';
import ResetPasswordModal from './ResetPasswordModal';

export default function AdminDashboard() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // User Registry Filters & Pagination
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Modals
    const [roleModal, setRoleModal] = useState<{ open: boolean; userId: string; currentType: string; name: string } | null>(null);
    const [resetModal, setResetModal] = useState<{ open: boolean; userId: string; name: string } | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // ── Auth Guard ──
    useEffect(() => {
        if (user && user.type !== 'admin') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Fetch Data ──
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
    }, [token, showToast]);

    useEffect(() => {
        if (user?.type === 'admin') fetchUsers(page, search, typeFilter);
    }, [user?.type, fetchUsers, page, typeFilter]);

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

    if (!user || user.type !== 'admin') return null;

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
                    <AdminSidebar user={user} />

                    {/* Main Content */}
                    <main className="flex-1 lg:ml-64 p-6 lg:p-10">
                        {/* Header */}
                        <AdminHeader onRefresh={() => fetchUsers(page, search, typeFilter)} />

                        {/* Stats Grid */}
                        <AdminStatsGrid stats={stats} loading={loading} />

                        {/* User Management */}
                        <AdminUserRegistry 
                            users={users}
                            loading={loading}
                            totalUsers={totalUsers}
                            search={search}
                            setSearch={setSearch}
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            page={page}
                            setPage={setPage}
                            totalPages={totalPages}
                            handleSearch={handleSearch}
                            fetchUsers={fetchUsers}
                            handleSubscriptionToggle={handleSubscriptionToggle}
                            setRoleModal={setRoleModal}
                            setResetModal={setResetModal}
                            handleDeleteUser={handleDeleteUser}
                        />
                    </main>
                </div>

                {/* ── Modals ── */}
                <RoleChangeModal 
                    roleModal={roleModal} 
                    setRoleModal={setRoleModal} 
                    handleRoleChange={handleRoleChange} 
                />

                <ResetPasswordModal 
                    resetModal={resetModal} 
                    setResetModal={setResetModal} 
                    token={token} 
                    showToast={showToast} 
                />
            </div>
        </ProtectedRoute>
    );
}
