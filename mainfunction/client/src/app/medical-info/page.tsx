'use client';
import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FaSearch, FaPills, FaVial, FaBookMedical, FaChevronRight, FaTimes, FaStethoscope } from 'react-icons/fa';
import Link from 'next/link';
import MedicalInfoSkeleton from '@/components/dashboard/MedicalInfoSkeleton';

interface MedicalItem {
    id?: string;
    _id?: string;
    name: string;
    brand: string;
    uses: string;
    warnings?: string;
    category?: string;
    type?: 'medicine' | 'test';
}

const MedicalInfoPage = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'medicine' | 'test'>('medicine');
    const [searchQuery, setSearchQuery] = useState('');
    const [topMedicines, setTopMedicines] = useState<MedicalItem[]>([]);
    const [labTests, setLabTests] = useState<MedicalItem[]>([]);
    const [searchResults, setSearchResults] = useState<MedicalItem[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    
    const searchRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // Fetch data on load
    useEffect(() => {
        if (token) {
            if (activeTab === 'medicine') {
                fetchTopMedicines();
            } else {
                fetchLabTests();
            }
        }
    }, [token, activeTab]);

    // Handle clicks outside suggestions dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced autocomplete suggestions
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 1 && activeTab === 'medicine') {
                fetchSuggestions();
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, activeTab]);

    const fetchTopMedicines = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/medicines/top`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTopMedicines(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching top medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const response = await axios.get(`${API_URL}/medicines/suggest`, {
                params: { q: searchQuery },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSuggestions(response.data.data);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const fetchLabTests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/reference/tests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setLabTests(response.data.data.map((t: any) => ({
                    ...t,
                    brand: t.category || 'Diagnostic',
                    uses: t.description
                })));
            }
        } catch (error) {
            console.error('Error fetching lab tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (queryOverride?: string) => {
        const query = queryOverride || searchQuery;
        if (!query) return;

        setSearchLoading(true);
        setShowSuggestions(false);
        try {
            const response = await axios.get(`${API_URL}/medicines/search`, {
                params: { q: query },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        handleSearch(suggestion);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSuggestions(false);
    };

    const displayItems = searchQuery.length > 1 && searchResults.length > 0 
        ? searchResults 
        : (activeTab === 'medicine' ? topMedicines : labTests);

    return (
        <DashboardLayout>
            <div className="w-full px-4 py-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1 w-12 bg-primary rounded-full"></span>
                            <p className="text-primary text-[11px] font-black uppercase tracking-[0.2em]">
                                Medical Intelligence Systems
                            </p>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight leading-none">
                            Clinical <span className="text-primary">Encyclopedia</span>
                        </h1>
                        <p className="text-tertiary/60 text-sm font-medium">
                            Access verified pharmacological data and diagnostic references powered by OpenFDA.
                        </p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-xl border border-gray-100 shadow-sm flex gap-1">
                        <button
                            onClick={() => setActiveTab('medicine')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'medicine'
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                                : 'text-tertiary/50 hover:text-primary hover:bg-white'
                                }`}
                        >
                            <FaPills className={activeTab === 'medicine' ? 'animate-bounce' : ''} /> Medicines
                        </button>
                        <button
                            onClick={() => setActiveTab('test')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'test'
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                                : 'text-tertiary/50 hover:text-primary hover:bg-white'
                                }`}
                        >
                            <FaVial /> Lab Tests
                        </button>
                    </div>
                </header>

                {/* Advanced Search Bar */}
                <div className="mb-12 relative" ref={searchRef}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <FaSearch className={`transition-colors duration-300 ${searchLoading ? 'text-primary animate-pulse' : 'text-tertiary/30 group-focus-within:text-primary'}`} />
                        </div>
                        <input
                            type="text"
                            placeholder={`Search over 100,000+ ${activeTab === 'medicine' ? 'medicines and drug labels' : 'diagnostic tests'}...`}
                            className="w-full pl-14 pr-16 py-6 rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-base font-semibold text-[#2c3436] placeholder:text-tertiary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-6 flex items-center text-tertiary/30 hover:text-red-500 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-3 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-gray-50">
                                <p className="text-[10px] font-black text-tertiary/30 uppercase tracking-widest">Suggestions</p>
                            </div>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-6 py-4 hover:bg-primary/5 flex items-center gap-4 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-tertiary/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <FaSearch className="text-xs" />
                                    </div>
                                    <span className="text-sm font-bold text-tertiary/70 group-hover:text-[#1a1a1a]">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-[#1a1a1a] flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary/20 rounded-full"></span>
                        {searchQuery.length > 1 ? (
                            <>Search Results <span className="text-sm font-medium text-tertiary/40">({searchResults.length} found)</span></>
                        ) : (
                            <>Recommended <span className="text-primary italic">Reference Cards</span></>
                        )}
                    </h2>
                </div>

                {/* Main Content Grid */}
                {loading || searchLoading ? (
                    <MedicalInfoSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayItems.length > 0 ? (
                            displayItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={activeTab === 'medicine' ? `/medical-info/medicine/${item.id}` : `/medical-info/test/${item._id}`}
                                    className="group bg-white p-7 rounded-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-primary/20 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                                >
                                    {/* Glass Decor */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500"></div>
                                    
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className={`p-4 rounded-xl transition-all duration-500 shadow-sm ${
                                            activeTab === 'medicine' 
                                                ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6' 
                                                : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6'
                                        }`}>
                                            {activeTab === 'medicine' ? <FaPills className="text-xl" /> : <FaVial className="text-xl" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full bg-gray-50 text-tertiary/40 border border-gray-100 group-hover:border-primary/10 transition-colors">
                                            {item.brand || 'Clinical Grade'}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-[#1a1a1a] group-hover:text-primary transition-colors mb-2 relative z-10">
                                        {item.name}
                                    </h3>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaStethoscope className="text-primary/30 text-xs" />
                                        <p className="text-[10px] font-bold text-tertiary/30 uppercase tracking-widest">{item.brand ? `Brand: ${item.brand}` : 'Generic Formula'}</p>
                                    </div>
                                    
                                    <p className="text-tertiary/60 text-sm font-medium leading-relaxed line-clamp-3 mb-8 flex-grow relative z-10">
                                        {item.uses}
                                    </p>
                                    
                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                        <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-primary/80 transition-all group-hover:text-primary group-hover:translate-x-1">
                                            View Monograph <FaChevronRight className="ml-2 text-[8px]" />
                                        </div>
                                        <div className="flex -space-x-2">
                                            {[1,2].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100"></div>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-32 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                                <div className="w-20 h-20 bg-white shadow-xl rounded-xl flex items-center justify-center mx-auto mb-6 text-gray-200 text-3xl">
                                    <FaSearch className="animate-pulse" />
                                </div>
                                <h3 className="text-lg font-black text-[#1a1a1a] mb-2">No Clinical Matches Found</h3>
                                <p className="text-tertiary/40 text-sm font-medium max-w-xs mx-auto">Try searching for generic names like "Ibuprofen" or "Metformin" for better results.</p>
                                <button 
                                    onClick={clearSearch}
                                    className="mt-6 px-8 py-3 bg-white text-primary text-[11px] font-black uppercase tracking-widest rounded-xl border border-gray-100 hover:shadow-lg transition-all"
                                >
                                    Reset Discovery
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MedicalInfoPage;
