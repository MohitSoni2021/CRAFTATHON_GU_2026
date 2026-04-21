'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserProfile, uploadProfilePhoto, fetchUserProfile } from '@/store/slices/authSlice';
import { FaUser, FaEnvelope, FaBirthdayCake, FaIdCard, FaEdit, FaTimes, FaSave, FaCamera, FaStethoscope, FaCheck, FaChevronRight, FaBookmark, FaShareAlt, FaUserMd, FaCog, FaStar, FaBolt, FaShieldAlt, FaQrcode, FaChartLine, FaCrown } from 'react-icons/fa';
import axios from 'axios';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editing State (Modal)
    const [editSection, setEditSection] = useState<'personal' | 'health' | 'sos' | null>(null);
    const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        bloodGroup: '',
        chronicConditions: '',
        sosName: '',
        sosPhone: '',
        sosRelation: '',
        sosEmail: ''
    });

    // Explain Yourself State
    const [showExplainModal, setShowExplainModal] = useState(false);
    const [explainStep, setExplainStep] = useState(1);
    const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    // Saved Posts State
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const [copySuccess, setCopySuccess] = useState(false);

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const handleShareProfile = () => {
        if (!user) return;
        setShowShareModal(true);
        setShowQR(false);
    };

    const copyToClipboard = () => {
        if (!user) return;
        const userId = (user as any)._id || user.id;
        if (!userId) return;

        const shareUrl = `${window.location.origin}/share/${userId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    useEffect(() => {
        const fetchSavedPosts = async () => {
            if (token) {
                setLoadingSaved(true);
                try {
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/saved-posts`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.success) {
                        setSavedPosts(res.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching saved posts", error);
                } finally {
                    setLoadingSaved(false);
                }
            }
        };
        fetchSavedPosts();
    }, [token]);

    const [currentLanguage, setCurrentLanguage] = useState('en');

    useEffect(() => {
        const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        if (match) setCurrentLanguage(match[1]);
    }, []);

    const settingsLabels: any = {
        en: { title: 'Settings', appLang: 'App Language', appLangDesc: 'Change the language of the application interface.' },
        hi: { title: 'सेटिंग्स', appLang: 'ऐप भाषा', appLangDesc: 'एप्लीकेशन इंटरफ़ेस की भाषा बदलें।' },
        gu: { title: 'સેટિંગ્સ', appLang: 'એપ્લિકેશન ભાષા', appLangDesc: 'એપ્લિકેશન ઇન્ટરફેસની ભાષા બદલો.' },
        mr: { title: 'सेटिंग्स', appLang: 'अॅप भाषा', appLangDesc: 'अनुप्रयोग इंटरफेसची भाषा बदला.' }
    };

    const l = settingsLabels[currentLanguage] || settingsLabels.en;

    const commonDiseases = ["Diabetes", "Hypertension", "Asthma", "Arthritis", "Heart Disease", "Thyroid", "None of these"];

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                age: user.age?.toString() || '',
                gender: user.profile?.gender || '',
                height: user.profile?.height?.toString() || '',
                weight: user.profile?.weight?.toString() || '',
                bloodGroup: user.profile?.bloodGroup || '',
                chronicConditions: user.profile?.chronicConditions?.join(', ') || '',
                sosName: '',
                sosPhone: '',
                sosRelation: '',
                sosEmail: ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await dispatch(uploadProfilePhoto(e.target.files[0]));
        }
    };

    const handleSave = async () => {
        const payload: any = {};

        if (editSection === 'personal') {
            if (formData.name) payload.name = formData.name;
        }

        if (editSection === 'health') {
            if (formData.age) payload.age = formData.age;
            if (formData.gender) payload.gender = formData.gender;
            if (formData.height) payload.height = parseFloat(formData.height);
            if (formData.weight) payload.weight = parseFloat(formData.weight);
            if (formData.bloodGroup) payload.bloodGroup = formData.bloodGroup;
            if (formData.chronicConditions) {
                payload.chronicConditions = formData.chronicConditions.split(',').map((c: string) => c.trim()).filter(Boolean);
            }
        }

        if (editSection === 'sos') {
            let currentContacts = user?.sosContacts ? [...user.sosContacts] : [];
            const newContact = {
                name: formData.sosName,
                phone: formData.sosPhone,
                relationship: formData.sosRelation,
                email: formData.sosEmail
            };

            if (editingContactIndex !== null && editingContactIndex >= 0) {
                currentContacts[editingContactIndex] = { ...currentContacts[editingContactIndex], ...newContact };
            } else {
                currentContacts.push(newContact);
            }

            payload.sosContacts = currentContacts;
        }

        await dispatch(updateUserProfile(payload));
        setEditSection(null);
        setEditingContactIndex(null);
    };

    const handleDeleteContact = async (index: number) => {
        if (!user || !user.sosContacts) return;
        const updatedContacts = [...user.sosContacts];
        updatedContacts.splice(index, 1);
        await dispatch(updateUserProfile({ sosContacts: updatedContacts }));
    };

    const openEditContact = (index: number) => {
        if (!user || !user.sosContacts) return;
        const contact = user.sosContacts[index];
        setFormData(prev => ({
            ...prev,
            sosName: contact.name,
            sosPhone: contact.phone,
            sosRelation: contact.relationship || '',
            sosEmail: contact.email || ''
        }));
        setEditingContactIndex(index);
        setEditSection('sos');
    };

    const openAddContact = () => {
        setFormData(prev => ({
            ...prev,
            sosName: '',
            sosPhone: '',
            sosRelation: '',
            sosEmail: ''
        }));
        setEditingContactIndex(null);
        setEditSection('sos');
    };

    const handleCloseModal = () => {
        setEditSection(null);
        if (user) {
            setFormData({
                name: user.name || '',
                age: user.age?.toString() || '',
                gender: user.profile?.gender || '',
                height: user.profile?.height?.toString() || '',
                weight: user.profile?.weight?.toString() || '',
                bloodGroup: user.profile?.bloodGroup || '',
                chronicConditions: user.profile?.chronicConditions?.join(', ') || '',
                sosName: '',
                sosPhone: '',
                sosRelation: '',
                sosEmail: ''
            });
            setEditingContactIndex(null);
        }
    };

    const handleDiseaseToggle = (disease: string) => {
        if (disease === "None of these") {
            setSelectedDiseases(["None of these"]);
            return;
        }

        let newSelection = [...selectedDiseases];
        if (newSelection.includes("None of these")) {
            newSelection = [];
        }

        if (newSelection.includes(disease)) {
            newSelection = newSelection.filter(d => d !== disease);
        } else {
            newSelection.push(disease);
        }
        setSelectedDiseases(newSelection);
    };

    const startQuestionnaire = async () => {
        if (selectedDiseases.length === 0) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ diseases: selectedDiseases })
            });
            const data = await response.json();
            setQuestions(data);
            setExplainStep(2);
        } catch (error) {
            console.error("Error generating questions", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnswerChange = (index: number, answer: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].ans = answer;
        setQuestions(updatedQuestions);
    };

    const handleSubmitAll = () => {
        const formattedAnswers = questions.map(q => ({
            question: q.question,
            answer: q.ans
        }));
        submitAnswers(formattedAnswers);
    };

    const submitAnswers = async (finalAnswers: any[]) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/analyze-lifestyle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: finalAnswers,
                    diseases: selectedDiseases,
                    additionalDetails: additionalDetails,
                    userProfile: {
                        age: user?.age,
                        gender: user?.profile?.gender,
                        height: user?.profile?.height,
                        weight: user?.profile?.weight,
                        bloodGroup: user?.profile?.bloodGroup
                    }
                })
            });
            const data = await response.json();
            setAnalysisResult(data.summary);
            setExplainStep(3);
            dispatch(fetchUserProfile());
        } catch (error) {
            console.error("Error analyzing answers", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const closeExplainModal = () => {
        setShowExplainModal(false);
        setExplainStep(1);
        setSelectedDiseases([]);
        setQuestions([]);
        setAdditionalDetails('');
        setAnalysisResult(null);
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col min-h-screen bg-white">
                    <header className="mb-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="inline-flex items-center space-x-2 bg-primary/5 px-3 py-1 rounded-lg text-primary text-[10px] font-bold mb-3 border border-primary/10 uppercase tracking-widest">
                                    <FaUser /> <span>Account Settings</span>
                                </div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                    Profile Central
                                </h1>
                            </div>
                        </div>
                    </header>

                    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto pb-20">
                        {/* Profile Hero Card */}
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-8 mb-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                                <div className="relative group/avatar">
                                    <div className="w-40 h-40 bg-surface-container-low rounded-xl ring-4 ring-white/10 shadow-2xl flex items-center justify-center text-6xl font-bold text-primary overflow-hidden transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                                        {user?.profileImage || user?.profile?.photoUrl ? (
                                            <img 
                                                src={user.profileImage || user.profile.photoUrl} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <FaCamera className="text-white text-2xl" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-xl shadow-xl hover:scale-110 transition-all border-2 border-white/10"
                                    >
                                        <FaCamera size={14} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                        <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                                            {user?.name || 'Incomplete Profile'}
                                        </h2>
                                        <div className="flex gap-2 justify-center md:justify-start">
                                            {user?.type === 'doctor' ? (
                                                <span className="bg-blue-500 text-white px-4 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <FaUserMd /> Verified Specialist
                                                </span>
                                            ) : (
                                                <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                                    Standard Member
                                                </span>
                                            )}
                                            {user?.subscription?.plan === 'premium' && (
                                                <span className="bg-amber-500 text-white px-4 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <FaCrown /> Concierge
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-400 text-lg flex items-center justify-center md:justify-start gap-3 mb-8 font-medium">
                                        <FaEnvelope className="text-primary/60" />
                                        {user?.email || 'No email associated'}
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-white font-bold capitalize">{user?.type || 'Patient'}</p>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Age</p>
                                            <p className="text-white font-bold">{user?.age ? `${user.age} Y` : '--'}</p>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Blood</p>
                                            <p className="text-white font-bold">{user?.profile?.bloodGroup || '--'}</p>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Weight</p>
                                            <p className="text-white font-bold">{user?.profile?.weight ? `${user.profile.weight}kg` : '--'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Main Sections */}
                            <div className="lg:col-span-8 space-y-10">
                                {/* Health Profile Section */}
                                <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative overflow-hidden group">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl shadow-sm">
                                                <FaStethoscope />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Clinical Profile</h3>
                                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Medical History & Vitals</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowExplainModal(true)}
                                                className="bg-surface-container-low text-gray-600 hover:text-primary px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-outline-variant transition-all hover:scale-[1.02] flex items-center gap-2"
                                            >
                                                <FaBolt className="text-primary animate-pulse" /> AI Insight
                                            </button>
                                            <button
                                                onClick={() => setEditSection('health')}
                                                className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                Modify
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                        {[
                                            { label: 'Primary Gender', value: user?.profile?.gender || '--', icon: <FaUser /> },
                                            { label: 'Height (cm)', value: user?.profile?.height || '--', icon: <FaChartLine /> },
                                            { label: 'Weight (kg)', value: user?.profile?.weight || '--', icon: <FaChartLine /> },
                                            { label: 'Blood Group', value: user?.profile?.bloodGroup || '--', icon: <FaBolt /> },
                                            { label: 'Current Age', value: user?.age || '--', icon: <FaBirthdayCake /> }
                                        ].map((item, i) => (
                                            <div key={i} className="p-5 bg-surface-container-low rounded-xl border border-outline-variant group/item hover:border-primary/20 transition-colors">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="text-primary/40 group-hover/item:text-primary transition-colors">{item.icon}</div>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                                                </div>
                                                <p className="text-lg font-extrabold text-gray-900 capitalize">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant relative group/conditions">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Documented Chronic Conditions</p>
                                        <div className="flex flex-wrap gap-3">
                                            {user?.profile?.chronicConditions && user.profile.chronicConditions.length > 0 ? (
                                                user.profile.chronicConditions.map((condition: string, idx: number) => (
                                                    <span key={idx} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100/50 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                                        {condition}
                                                    </span>
                                                ))
                                            ) : (
                                                <div className="text-gray-400 font-bold text-xs flex items-center gap-2">
                                                    <FaCheck className="text-primary/50" /> No chronic conditions reported
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* My Health Story Section */}
                                {user?.profile?.storyDesc && (
                                    <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient bg-primary/5 relative group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <FaStethoscope size={100} />
                                        </div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-lg shadow-lg shadow-primary/20">
                                                <FaBolt />
                                            </div>
                                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Health Narrative</h3>
                                        </div>
                                        <div className="p-6 bg-white/50 rounded-xl border border-primary/10 backdrop-blur-sm">
                                            <p className="text-gray-700 text-lg leading-relaxed font-medium italic opacity-90">
                                                "{user.profile.storyDesc}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* SOS Contacts Section */}
                                <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative group">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xl shadow-sm border border-red-100">
                                                <FaShieldAlt />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Emergency Contacts</h3>
                                                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest opacity-70">Active SOS Protocol</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={openAddContact}
                                            className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-red-200 hover:scale-[1.02] transition-all"
                                        >
                                            + Secure New
                                        </button>
                                    </div>

                                    {user?.sosContacts && user.sosContacts.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {user.sosContacts.map((contact: any, idx: number) => (
                                                <div key={idx} className="p-6 bg-surface-container-low rounded-xl border border-outline-variant relative group/contact hover:border-red-200 transition-colors">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <p className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{contact.name}</p>
                                                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{contact.relationship}</p>
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover/contact:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openEditContact(idx)}
                                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-400 hover:text-primary shadow-sm border border-outline-variant"
                                                            >
                                                                <FaEdit size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteContact(idx)}
                                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-400 hover:text-red-500 shadow-sm border border-outline-variant"
                                                            >
                                                                <FaTimes size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-gray-600 font-bold flex items-center gap-2">
                                                            <FaBolt className="text-gray-300" size={10} /> {contact.phone}
                                                        </p>
                                                        {contact.email && (
                                                            <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                                                                <FaEnvelope className="text-gray-300" size={10} /> {contact.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-14 bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                                                <FaShieldAlt size={24} />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">No SOS Contacts Configured</p>
                                            <p className="text-gray-500 text-sm font-medium">Add trusted responders for critical health events.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Sections */}
                            <div className="lg:col-span-4 space-y-10">
                                {/* Actions & Sharing */}
                                <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient">
                                    <h3 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                        <FaShareAlt className="text-primary" /> Profile Sharing
                                    </h3>
                                    <div className="space-y-4">
                                        <button 
                                            onClick={handleShareProfile}
                                            className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-primary/5 rounded-xl border border-outline-variant group transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-outline-variant group-hover:scale-110 transition-transform">
                                                    <FaShareAlt size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">Public Link</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">Share with caregivers</p>
                                                </div>
                                            </div>
                                            <FaChevronRight size={10} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                        </button>

                                        <button 
                                            onClick={() => {
                                                setShowShareModal(true);
                                                setShowQR(true);
                                            }}
                                            className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-primary/5 rounded-xl border border-outline-variant group transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-outline-variant group-hover:scale-110 transition-transform">
                                                    <FaQrcode size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">Medical QR</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">Instant scan access</p>
                                                </div>
                                            </div>
                                            <FaChevronRight size={10} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>

                                {/* Subscription Summary */}
                                <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <FaCrown size={80} />
                                    </div>
                                    <h3 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                        <FaBolt className="text-amber-500" /> Subscription
                                    </h3>
                                    
                                    <div className={`p-6 rounded-xl border mb-6 ${user?.subscription?.plan === 'premium' 
                                        ? 'bg-amber-50 border-amber-100' 
                                        : 'bg-surface-container-low border-outline-variant'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <p className={`text-[10px] font-extrabold uppercase tracking-widest ${user?.subscription?.plan === 'premium' ? 'text-amber-700' : 'text-gray-500'}`}>
                                                {user?.subscription?.plan === 'premium' ? 'Concierge' : 'Essential'}
                                            </p>
                                            {user?.subscription?.plan === 'premium' && <FaCrown className="text-amber-500" size={12} />}
                                        </div>
                                        <p className="text-lg font-black text-gray-900 mb-1">
                                            {user?.subscription?.plan === 'premium' ? 'Unlimited Access' : 'Monthly Quota'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status: {user?.subscription?.status || 'Active'}</p>
                                    </div>

                                    {user?.subscription?.plan !== 'premium' && (
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                                                    <span>AI Consultations</span>
                                                    <span>{user?.usage?.aiConsultations || 0}/5</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className="bg-primary h-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(((user?.usage?.aiConsultations || 0) / 5) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <Link 
                                                href="/pricing"
                                                className="block w-full py-4 text-center bg-gray-900 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Upgrade Now
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Settings & Identity */}
                                <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <FaCog size={100} />
                                    </div>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-surface-container-low text-gray-400 rounded-xl flex items-center justify-center text-xl shadow-sm border border-outline-variant">
                                            <FaCog />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{l.title}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preference Configuration</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group/item hover:border-primary/20 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 text-sm mb-1 uppercase tracking-wider">{l.appLang}</p>
                                                <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest opacity-60">{l.appLangDesc}</p>
                                            </div>
                                            <div className="relative shrink-0 w-full sm:w-auto">
                                                <LanguageSwitcher className="!relative !flex-row !bottom-auto !right-auto" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Saved Posts / Bookmarks */}
                        <div className="mt-16">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shadow-sm border border-blue-100">
                                        <FaBookmark />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Saved Insights</h3>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Your Curated Library</p>
                                    </div>
                                </div>
                                {savedPosts.length > 4 && (
                                    <Link href="/profile/saved-posts" className="bg-surface-container-low text-gray-600 hover:text-primary px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-outline-variant transition-all hover:scale-[1.02] flex items-center gap-2">
                                        View Library <FaChevronRight size={10} />
                                    </Link>
                                )}
                            </div>

                            {loadingSaved ? (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : savedPosts.length === 0 ? (
                                <div className="text-center py-20 bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                                        <FaBookmark size={24} />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">No Saved Articles Yet</p>
                                    <Link href="/insights" className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all inline-block">
                                        Explore Insights
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {savedPosts.slice(0, 4).map((post) => (
                                        <div key={post.savedPostId} className="group bg-white rounded-xl border border-outline-variant overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all">
                                            {post.imageUrl && (
                                                <div className="h-40 overflow-hidden">
                                                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <h4 className="font-extrabold text-gray-900 text-sm mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h4>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(post.savedAt).toLocaleDateString()}</span>
                                                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] flex items-center gap-1 group/link">
                                                        Read <FaChevronRight size={8} className="group-hover/link:translate-x-1 transition-transform" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Share Modal */}
                    {showShareModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>
                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl border border-primary/10 shadow-sm">
                                            <FaShareAlt />
                                        </div>
                                        <button onClick={() => setShowShareModal(false)} className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low">
                                            <FaTimes size={18} />
                                        </button>
                                    </div>

                                    <div className="mb-10 text-center">
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Share Your Profile</h3>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed">Provide external access to your clinical record and vitals.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Identity Link</label>
                                            <div className="flex gap-2 p-2 bg-surface-container-low rounded-xl border border-outline-variant">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${(user as any)?._id || user?.id}`}
                                                    className="flex-1 bg-transparent px-3 text-gray-600 text-xs font-bold font-mono focus:outline-none truncate"
                                                />
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="bg-primary text-white px-5 py-2.5 rounded-lg font-extrabold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    {copySuccess ? <FaCheck /> : 'Copy'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-outline-variant flex flex-col items-center">
                                            {!showQR ? (
                                                <button
                                                    onClick={() => setShowQR(true)}
                                                    className="text-primary font-extrabold text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-3"
                                                >
                                                    <FaQrcode size={14} /> Generate QR Identity
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                                    <div className="p-6 bg-white rounded-xl shadow-2xl border border-outline-variant">
                                                        <QRCodeCanvas
                                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${(user as any)?._id || user?.id}`}
                                                            size={220}
                                                            level={"H"}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => setShowQR(false)}
                                                        className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest hover:text-red-500 transition-colors"
                                                    >
                                                        Hide QR Code
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {editSection && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>
                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl border border-primary/10 shadow-sm">
                                            <FaEdit />
                                        </div>
                                        <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low">
                                            <FaTimes size={18} />
                                        </button>
                                    </div>

                                    <div className="mb-10">
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                                            {editSection === 'personal' ? 'Identify Record' :
                                                editSection === 'health' ? 'Clinical Profile' :
                                                    editSection === 'sos' ? (editingContactIndex !== null ? 'Secure Contact' : 'New Responder') : ''}
                                        </h3>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed">Ensure all parameters are current for accurate diagnostics.</p>
                                    </div>

                                    <div className="space-y-6 max-h-[50vh] overflow-y-auto px-1">
                                        {editSection === 'personal' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Full Legal Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>
                                        )}

                                        {editSection === 'health' && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="col-span-1 space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Age</label>
                                                    <input
                                                        type="number"
                                                        name="age"
                                                        value={formData.age}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-1 space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Gender</label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-1 space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Height (cm)</label>
                                                    <input
                                                        type="number"
                                                        name="height"
                                                        value={formData.height}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-1 space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Weight (kg)</label>
                                                    <input
                                                        type="number"
                                                        name="weight"
                                                        value={formData.weight}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Blood Type</label>
                                                    <select
                                                        name="bloodGroup"
                                                        value={formData.bloodGroup}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                                    >
                                                        <option value="">Select</option>
                                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                            <option key={bg} value={bg}>{bg}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Chronic Conditions</label>
                                                    <input
                                                        type="text"
                                                        name="chronicConditions"
                                                        value={formData.chronicConditions}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. Diabetes, Hypertension"
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    />
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">Separate with commas</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {editSection === 'sos' && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Responder Identity</label>
                                                    <input
                                                        type="text"
                                                        name="sosName"
                                                        value={formData.sosName}
                                                        onChange={handleInputChange}
                                                        placeholder="Full Name"
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Secure Phone</label>
                                                        <input
                                                            type="tel"
                                                            name="sosPhone"
                                                            value={formData.sosPhone}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Relationship</label>
                                                        <input
                                                            type="text"
                                                            name="sosRelation"
                                                            value={formData.sosRelation}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email (Vault Only)</label>
                                                    <input
                                                        type="email"
                                                        name="sosEmail"
                                                        value={formData.sosEmail}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-outline-variant flex flex-col gap-3">
                                        <button
                                            onClick={handleSave}
                                            className="w-full py-5 bg-gradient-primary text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Update Parameters
                                        </button>
                                        <button
                                            onClick={handleCloseModal}
                                            className="w-full py-4 text-gray-400 hover:text-gray-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Explain Yourself Modal */}
                    {showExplainModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant flex flex-col max-h-[90vh]">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>
                                
                                <div className="p-8 border-b border-outline-variant flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-sm">
                                            <FaStethoscope size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">AI Diagnostic Interview</h3>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Personalized Health Narrative Engine</p>
                                        </div>
                                    </div>
                                    <button onClick={closeExplainModal} className="p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-surface-container-low">
                                        <FaTimes size={18} />
                                    </button>
                                </div>

                                <div className="p-10 overflow-y-auto flex-1">
                                    {explainStep === 1 && (
                                        <div className="space-y-10">
                                            <div className="text-center max-w-md mx-auto">
                                                <h4 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">Documented Chronic Conditions</h4>
                                                <p className="text-gray-500 font-medium leading-relaxed">Select all verified conditions to initialize the diagnostic protocol.</p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {commonDiseases.map(disease => (
                                                    <button
                                                        key={disease}
                                                        onClick={() => handleDiseaseToggle(disease)}
                                                        className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center group ${selectedDiseases.includes(disease)
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-outline-variant hover:border-primary/20 text-gray-600'
                                                            }`}
                                                    >
                                                        <div className={`mb-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedDiseases.includes(disease) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                            {selectedDiseases.includes(disease) ? <FaCheck size={12} /> : <FaBolt size={12} />}
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-widest">{disease}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex justify-end pt-10">
                                                <button
                                                    onClick={startQuestionnaire}
                                                    disabled={selectedDiseases.length === 0 || isAnalyzing}
                                                    className="bg-gradient-primary text-white px-10 py-5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                                                >
                                                    {isAnalyzing ? 'Initializing...' : 'Proceed to Interview'}
                                                    {!isAnalyzing && <FaChevronRight size={12} className="opacity-50" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {explainStep === 2 && questions.length > 0 && (
                                        <div className="space-y-12 pb-10">
                                            <div className="text-center max-w-md mx-auto">
                                                <h4 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">Contextual Assessment</h4>
                                                <p className="text-gray-500 font-medium leading-relaxed">Provide detailed responses for a high-fidelity health narrative.</p>
                                            </div>

                                            <div className="space-y-10">
                                                {questions.map((q, index) => (
                                                    <div key={index} className="space-y-6">
                                                        <div className="flex items-start gap-6">
                                                            <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black text-xs shrink-0 border border-primary/10">
                                                                {index + 1}
                                                            </div>
                                                            <h5 className="text-xl font-extrabold text-gray-900 tracking-tight leading-relaxed pt-1">
                                                                {q.question}
                                                            </h5>
                                                        </div>

                                                        {q.type === 'mcq' && q.options ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                                                                {q.options.map((option: string, optIdx: number) => (
                                                                    <button
                                                                        key={optIdx}
                                                                        onClick={() => handleAnswerChange(index, option)}
                                                                        className={`p-5 text-left rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${q.ans === option
                                                                            ? 'border-primary bg-primary/5 text-primary'
                                                                            : 'border-outline-variant hover:border-primary/20 text-gray-600'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-3 h-3 rounded-full border-2 ${q.ans === option ? 'bg-primary border-primary' : 'border-gray-200'}`}></div>
                                                                            {option}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="pl-16">
                                                                <textarea
                                                                    value={q.ans || ''}
                                                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                                    placeholder="Describe in detail..."
                                                                    className="w-full h-40 p-6 bg-surface-container-low border border-outline-variant rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                                                                ></textarea>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pl-16 space-y-6">
                                                <h5 className="text-xl font-extrabold text-gray-900 tracking-tight leading-relaxed">
                                                    Clinical Addendum
                                                </h5>
                                                <textarea
                                                    value={additionalDetails}
                                                    onChange={(e) => setAdditionalDetails(e.target.value)}
                                                    placeholder="Add any other relevant medical context or specific habits..."
                                                    className="w-full h-40 p-6 bg-surface-container-low border border-outline-variant rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                                                ></textarea>
                                            </div>

                                            <div className="flex justify-end pt-10 pl-16">
                                                <button
                                                    onClick={handleSubmitAll}
                                                    disabled={questions.some(q => !q.ans)}
                                                    className="bg-gradient-primary text-white px-10 py-5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                                                >
                                                    Finalize Analysis
                                                    <FaChevronRight size={12} className="opacity-50" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {explainStep === 3 && (
                                        <div className="text-center space-y-10 py-10 max-w-xl mx-auto">
                                            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl shadow-primary/5 animate-in zoom-in-50 duration-700">
                                                <FaCheck />
                                            </div>
                                            <div>
                                                <h4 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">Narrative Synopsized</h4>
                                                <p className="text-gray-500 font-medium leading-relaxed">The AI has generated your clinical story based on the provided parameters.</p>
                                            </div>

                                            <div className="p-10 bg-primary/5 rounded-xl border border-primary/10 text-left relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                    <FaBolt size={60} />
                                                </div>
                                                <p className="text-gray-800 text-xl leading-relaxed italic font-medium opacity-90 relative z-10">
                                                    "{analysisResult}"
                                                </p>
                                            </div>

                                            <button
                                                onClick={closeExplainModal}
                                                className="bg-gradient-primary text-white px-12 py-5 rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                Return to Profile
                                            </button>
                                        </div>
                                    )}

                                    {isAnalyzing && (
                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
                                            <div className="relative">
                                                <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                                                <FaBolt className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
                                            </div>
                                            <div className="mt-8 text-center">
                                                <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                                                    {explainStep === 1 ? 'Constructing Interview' : 'Synthesizing Narrative'}
                                                </p>
                                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">Running Clinical Models</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
