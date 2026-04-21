'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaSearch, FaPills, FaVial, FaBookMedical, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import MedicalInfoSkeleton from '@/components/dashboard/MedicalInfoSkeleton';

interface MedicalItem {
    _id: string;
    name: string;
    description: string;
    category?: string;
    type?: 'medicine' | 'test'; // For mixed search results
}

const MedicalInfoPage = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'medicine' | 'test'>('medicine');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<MedicalItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<MedicalItem[]>([]);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/reference`;

    useEffect(() => {
        if (token) {
            fetchInitialData();
        }
    }, [token, activeTab]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 1) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'medicine' ? '/medicines' : '/tests';
            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: { query: searchQuery, type: activeTab },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayItems = searchQuery.length > 1 ? searchResults : items;

    return (
        <DashboardLayout>
            <div className="w-full">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
                            Clinical Archive • Medical Encyclopedia
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                            Medical <span className="text-primary">Reference</span>
                        </h1>
                        <p className="text-tertiary/70 text-sm font-medium mt-1 italic border-l-2 border-primary/20 pl-4">
                            "Empowering clinicians with trusted pharmacotherapy and diagnostic insights."
                        </p>
                    </div>
                    <div className="bg-surface-container-low p-1 rounded-xl border border-gray-100 flex space-x-1">
                        <button
                            onClick={() => setActiveTab('medicine')}
                            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'medicine'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-tertiary/40 hover:text-primary hover:bg-white'
                                }`}
                        >
                            <FaPills className="inline mr-2" /> Medicines
                        </button>
                        <button
                            onClick={() => setActiveTab('test')}
                            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'test'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-tertiary/40 hover:text-primary hover:bg-white'
                                }`}
                        >
                            <FaVial className="inline mr-2" /> Lab Tests
                        </button>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="mb-10 relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                        <FaSearch className="text-tertiary/20 group-focus-within:text-primary" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'medicine' ? 'pharmacopoeia' : 'diagnostic tests'}...`}
                        className="w-full pl-14 pr-6 py-5 rounded-xl border border-gray-100 shadow-sm focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-bold text-[#2c3436] placeholder:text-tertiary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Content Grid */}
                {loading ? (
                    <MedicalInfoSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayItems.length > 0 ? (
                            displayItems.map((item) => (
                                <Link
                                    key={item._id}
                                    href={`/medical-info/${activeTab}/${item._id}`}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-ambient hover:border-primary/20 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110"></div>
                                    
                                    <div className="flex justify-between items-start mb-6 relative">
                                        <div className={`p-4 rounded-xl transition-all duration-300 ${
                                            activeTab === 'medicine' 
                                                ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' 
                                                : 'bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white'
                                        }`}>
                                            {activeTab === 'medicine' ? <FaPills className="text-2xl" /> : <FaVial className="text-2xl" />}
                                        </div>
                                        {item.category && (
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-lg bg-surface-container-low text-tertiary/40 border border-gray-50">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-lg font-extrabold text-[#2c3436] group-hover:text-primary transition-colors mb-2 relative">
                                        {item.name}
                                    </h3>
                                    
                                    <p className="text-tertiary/60 text-xs font-medium leading-relaxed line-clamp-3 mb-6 flex-grow relative">
                                        {item.description}
                                    </p>
                                    
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary transition-all group-hover:translate-x-1 relative">
                                        Reference Guide <FaChevronRight className="ml-2 text-[8px]" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-24 bg-white rounded-xl border-2 border-dashed border-gray-100">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-200 text-2xl">
                                    <FaSearch />
                                </div>
                                <p className="text-tertiary/30 text-sm font-black uppercase tracking-widest">No clinical references match your query</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MedicalInfoPage;
