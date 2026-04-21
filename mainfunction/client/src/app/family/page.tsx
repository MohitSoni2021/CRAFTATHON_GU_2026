'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaUser, FaHeartbeat, FaChevronRight, FaEnvelope, FaExclamationCircle, FaShieldAlt, FaUsers, FaArrowRight, FaTimes, FaCheck, FaInfoCircle, FaUserMd } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import HealthSparkline from '@/components/HealthSparkline';
import PremiumLock from '@/components/PremiumLock';

export default function FamilyDashboard() {
    const [members, setMembers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dependent'); // 'dependent' | 'invite'
    const router = useRouter();

    // Form state
    const [newMember, setNewMember] = useState({
        name: '',
        relation: '',
        age: '',
        gender: 'male',
        chronicConditions: '',
        accessLevel: 'child'
    });

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRelation, setInviteRelation] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [membersRes, requestsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/family/members`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/family/requests`, { headers }).catch(() => ({ data: { requests: [] } }))
            ]);

            if (membersRes.data.success) {
                setMembers(membersRes.data.members);
            }
            if (requestsRes.data && requestsRes.data.success) {
                setRequests(requestsRes.data.requests);
            }
        } catch (error) {
            console.error("Error fetching family data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const conditionsArray = newMember.chronicConditions.split(',').map(c => c.trim()).filter(Boolean);

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/family/add-member`, {
                ...newMember,
                chronicConditions: conditionsArray
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowAddModal(false);
            setNewMember({ name: '', relation: '', age: '', gender: 'male', chronicConditions: '', accessLevel: 'child' });
            fetchData();
        } catch (error) {
            console.error("Error adding member", error);
            alert("Protocol failure: Failed to add member");
        }
    };

    const [inviteStatus, setInviteStatus] = useState({ type: '', message: '' });

    const handleInviteWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteStatus({ type: 'loading', message: 'Initiating digital handshake...' });

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/family/invite`, {
                email: inviteEmail,
                relation: inviteRelation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInviteStatus({ type: 'success', message: 'Invitation transmitted successfully.' });
            setTimeout(() => {
                setShowAddModal(false);
                setInviteEmail('');
                setInviteRelation('');
                setInviteStatus({ type: '', message: '' });
                fetchData();
            }, 2000);

        } catch (error: any) {
            console.error("Error sending invite", error);
            const msg = error.response?.data?.message || "Protocol rejection: Failed to invite user.";
            setInviteStatus({ type: 'error', message: msg });
        }
    }

    const handleRespond = async (familyId: string, action: 'accept' | 'reject') => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/family/respond`, { familyId, action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error("Error responding", error);
            alert("Action failed: Response could not be transmitted.");
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col min-h-screen bg-white">
                <header className="mb-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-primary/5 px-3 py-1 rounded-lg text-primary text-[10px] font-bold mb-3 border border-primary/10 uppercase tracking-widest">
                                <FaUsers /> <span>Network Management</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Family Health</h1>
                            <p className="text-gray-500 text-sm font-medium mt-1">Unified diagnostic monitoring for your shared medical circle.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full md:w-auto bg-gray-900 hover:bg-primary text-white px-8 py-4 rounded-xl flex items-center justify-center space-x-3 transition-all shadow-xl shadow-gray-200 active:scale-95 group"
                        >
                            <FaUserPlus className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Add New Node</span>
                        </button>
                    </div>
                </header>

                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto pb-20 space-y-12">
                    <PremiumLock
                        title="Family Health Ecosystem"
                        description="Monitor real-time vitals, historical clinical trends, and receive high-priority health alerts for your dependents."
                    >
                        {/* Incoming Requests */}
                        {requests.length > 0 && (
                            <div className="card-editorial bg-primary/5 border border-primary/10 rounded-xl p-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h2 className="text-sm font-black text-primary mb-6 flex items-center space-x-2 uppercase tracking-[0.2em]">
                                    <FaEnvelope />
                                    <span>Pending Network Authorizations</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {requests.map((req: any) => (
                                        <div key={req.familyId} className="bg-white p-6 rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant hover:shadow-lg transition-all group">
                                            <div className="mb-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center text-primary border border-outline-variant">
                                                        <FaUser />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm">{req.adminName}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.adminEmail}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                    Requesting to establish connection as <span className="text-primary font-bold">{req.relationshipToAdmin}</span>.
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleRespond(req.familyId, 'reject')}
                                                    className="flex-1 py-3 text-gray-500 bg-surface-container-low hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(req.familyId, 'accept')}
                                                    className="flex-1 py-3 bg-primary hover:bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                                                >
                                                    Authorize
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats / Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Active Nodes', value: members.filter((m: any) => m.status !== 'pending').length, icon: <FaUsers />, color: 'bg-primary/5 text-primary' },
                                { label: 'Diagnostic Alerts', value: '0', icon: <FaExclamationCircle />, color: 'bg-red-50 text-red-600' },
                                { label: 'Pending Invitations', value: members.filter((m: any) => m.status === 'pending').length, icon: <FaEnvelope />, color: 'bg-amber-50 text-amber-600' }
                            ].map((stat, idx) => (
                                <div key={idx} className="card-editorial bg-white p-8 rounded-xl shadow-ambient border border-outline-variant flex items-center justify-between group">
                                    <div>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                                        <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-sm border border-current opacity-50 group-hover:opacity-100 transition-opacity`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Members Grid */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-outline-variant flex-1"></div>
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Family Health Network</h2>
                                <div className="h-px bg-outline-variant flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {loading ? (
                                    [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-surface-container-low rounded-xl animate-pulse"></div>)
                                ) : members.map((member: any) => {
                                    const bpData = member.healthData?.bp?.map((d: any) => ({ value: d.value.systolic })) || [];
                                    const weightData = member.healthData?.weight?.map((d: any) => ({ value: d.value })) || [];
                                    const glucoseData = member.healthData?.glucose?.map((d: any) => ({ value: d.value })) || [];

                                    const latestBp = member.healthData?.bp?.length ? `${member.healthData.bp[member.healthData.bp.length - 1].value.systolic}/${member.healthData.bp[member.healthData.bp.length - 1].value.diastolic}` : '--';
                                    const latestWeight = member.healthData?.weight?.length ? member.healthData.weight[member.healthData.weight.length - 1].value : '--';
                                    const latestGlucose = member.healthData?.glucose?.length ? member.healthData.glucose[member.healthData.glucose.length - 1].value : '--';

                                    return (
                                        <div key={member._id} className="card-editorial bg-white rounded-xl shadow-ambient border border-outline-variant overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all group relative">
                                            {member.status === 'pending' && (
                                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-4 py-2 rounded-bl-xl uppercase tracking-widest z-10 shadow-lg">
                                                    Pending Authorization
                                                </div>
                                            )}
                                            <div className="p-8">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-black uppercase shadow-xl transition-transform group-hover:scale-105 duration-500 ${member.status === 'pending' ? 'bg-surface-container-low text-gray-300 border border-outline-variant' : 'bg-gray-900 text-white shadow-gray-200'}`}>
                                                            {member.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{member.name}</h3>
                                                                <span className="bg-primary/5 text-primary text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-primary/10">
                                                                    {member.relationship}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                <span className="flex items-center gap-1.5"><FaUser size={10} className="text-primary/40" /> {member.userId?.age || member.age || 'N/A'} YRS</span>
                                                                <span className="flex items-center gap-1.5"><FaShieldAlt size={10} className="text-primary/40" /> {member.accessLevel || 'Member'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {member.status === 'active' && (
                                                        <Link 
                                                            href={`/family/${member.userId?._id}`} 
                                                            className="w-full sm:w-auto bg-surface-container-low hover:bg-gray-900 hover:text-white text-gray-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-outline-variant group/btn"
                                                        >
                                                            <span>Access Terminal</span>
                                                            <FaChevronRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                    {[
                                                        { data: bpData, color: '#ef4444', label: 'BP', unit: 'mmHg', value: latestBp },
                                                        { data: weightData, color: '#3b82f6', label: 'Weight', unit: 'kg', value: latestWeight },
                                                        { data: glucoseData, color: '#10b981', label: 'Glucose', unit: 'mg/dL', value: latestGlucose }
                                                    ].map((trend, i) => (
                                                        <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50 hover:border-primary/20 transition-colors">
                                                            <HealthSparkline
                                                                data={trend.data}
                                                                dataKey="value"
                                                                color={trend.color}
                                                                label={trend.label}
                                                                unit={trend.unit}
                                                                latestValue={trend.value}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {members.length === 0 && !loading && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant text-center px-6">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 text-3xl mb-6 shadow-sm">
                                            <FaUsers />
                                        </div>
                                        <p className="text-gray-900 font-extrabold text-lg tracking-tight">Isolated Ecosystem</p>
                                        <p className="text-gray-500 text-sm max-w-sm mt-2">No network nodes detected. Start by adding a family member or sending a secure invitation.</p>
                                        <button 
                                            onClick={() => setShowAddModal(true)}
                                            className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                                        >
                                            Establish Node
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </PremiumLock>
                </div>

                {/* Add Member Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-outline-variant relative animate-in zoom-in-95 duration-300">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors z-10 p-2 hover:bg-surface-container-low rounded-xl"
                            >
                                <FaTimes size={18} />
                            </button>
                            
                            <div className="p-8 pb-4">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
                                        <FaUserPlus />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Network Expansion</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connect New Family Profile</p>
                                    </div>
                                </div>

                                <div className="flex bg-surface-container-low p-1 rounded-xl mb-8">
                                    <button
                                        onClick={() => setActiveTab('dependent')}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'dependent' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        New Dependent
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('invite')}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'invite' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Secure Invitation
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 pt-0">
                                {activeTab === 'dependent' ? (
                                    <form onSubmit={handleAddMember} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="col-span-full">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Legal Name</label>
                                                <div className="relative group">
                                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={newMember.name}
                                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm"
                                                        placeholder="Jane Doe"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Relation</label>
                                                <select
                                                    value={newMember.relation}
                                                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                                                    className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm appearance-none"
                                                    required
                                                >
                                                    <option value="">Select Protocol...</option>
                                                    <option value="Father">Father</option>
                                                    <option value="Mother">Mother</option>
                                                    <option value="Spouse">Spouse</option>
                                                    <option value="Child">Child</option>
                                                    <option value="Grandparent">Grandparent</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Age</label>
                                                <input
                                                    type="number"
                                                    value={newMember.age}
                                                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                                    className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Gender Specification</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['male', 'female', 'other'].map(g => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => setNewMember({ ...newMember, gender: g })}
                                                        className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${newMember.gender === g ? 'bg-primary border-primary text-white' : 'bg-surface-container-low border-outline-variant text-gray-500 hover:border-primary/30'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-outline-variant">
                                            <button
                                                type="submit"
                                                className="w-full bg-gray-900 hover:bg-primary text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-gray-200 active:scale-95"
                                            >
                                                Generate Dependent Profile
                                            </button>
                                            <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
                                                <FaInfoCircle size={10} className="text-gray-400" />
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Local encryption applied to all health data.</p>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleInviteWrapper} className="space-y-6">
                                        {inviteStatus.message && (
                                            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${inviteStatus.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : inviteStatus.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-primary/5 border-primary/10 text-primary'}`}>
                                                {inviteStatus.type === 'loading' ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : inviteStatus.type === 'success' ? <FaCheck /> : <FaExclamationCircle />}
                                                <p className="text-xs font-black uppercase tracking-widest">{inviteStatus.message}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Network Identity (Email)</label>
                                            <div className="relative group">
                                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm"
                                                    placeholder="identity@clinical.network"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Proposed Relation</label>
                                            <select
                                                value={inviteRelation}
                                                onChange={(e) => setInviteRelation(e.target.value)}
                                                className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-gray-900 text-sm appearance-none"
                                                required
                                            >
                                                <option value="">Select Connection...</option>
                                                <option value="Father">Father</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Spouse">Spouse</option>
                                                <option value="Child">Child</option>
                                                <option value="Friend">Friend</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="pt-4 border-t border-outline-variant">
                                            <button
                                                type="submit"
                                                disabled={inviteStatus.type === 'loading'}
                                                className={`w-full font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${inviteStatus.type === 'loading' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-outline-variant' : 'bg-gray-900 hover:bg-primary text-white shadow-gray-200'}`}
                                            >
                                                {inviteStatus.type === 'loading' ? 'Transmitting...' : 'Transmit Invitation'}
                                                <FaArrowRight size={10} />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
