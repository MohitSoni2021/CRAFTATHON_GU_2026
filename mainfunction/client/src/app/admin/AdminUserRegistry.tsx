import React from 'react';
import { FaSearch, FaUsers, FaChevronLeft, FaChevronRight, FaEdit, FaKey, FaTrash } from 'react-icons/fa';
import { User } from './types';
import { roleBadge, planBadge } from './utils';

interface AdminUserRegistryProps {
    users: User[];
    loading: boolean;
    totalUsers: number;
    search: string;
    setSearch: (s: string) => void;
    typeFilter: string;
    setTypeFilter: (t: string) => void;
    page: number;
    setPage: (p: number | ((prev: number) => number)) => void;
    totalPages: number;
    handleSearch: (e: React.FormEvent) => void;
    fetchUsers: (page: number, search: string, type: string) => void;
    handleSubscriptionToggle: (id: string, plan: string) => void;
    setRoleModal: (modal: any) => void;
    setResetModal: (modal: any) => void;
    handleDeleteUser: (id: string, name: string) => void;
}

export default function AdminUserRegistry({
    users,
    loading,
    totalUsers,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    page,
    setPage,
    totalPages,
    handleSearch,
    fetchUsers,
    handleSubscriptionToggle,
    setRoleModal,
    setResetModal,
    handleDeleteUser
}: AdminUserRegistryProps) {
    return (
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
                        onChange={e => { 
                            setTypeFilter(e.target.value); 
                            setPage(1); 
                            fetchUsers(1, search, e.target.value); 
                        }}
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
                                            onClick={() => { setResetModal({ open: true, userId: u._id, name: u.name }); }}
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
                            onClick={() => { setPage((p: number) => Math.max(1, p - 1)); }}
                            disabled={page === 1}
                            className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        <button
                            onClick={() => { setPage((p: number) => Math.min(totalPages, p + 1)); }}
                            disabled={page === totalPages}
                            className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
