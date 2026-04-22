'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axios from 'axios';
import Link from 'next/link';
import { FaArrowLeft, FaBookmark, FaExternalLinkAlt, FaBookOpen } from 'react-icons/fa';
import DashboardLayout from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AllSavedPostsPage() {
    const { token } = useSelector((state: RootState) => state.auth);
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            if (token) {
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
                    setLoading(false);
                }
            }
        };
        fetchSavedPosts();
    }, [token]);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-8 w-full">
                    <div className="w-full space-y-8">
                        <header className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-primary/10 transition-all text-gray-400 hover:text-primary border border-gray-100">
                                    <FaArrowLeft size={14} />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        <FaBookOpen className="text-primary"/> Saved Repository
                                    </h1>
                                    <p className="text-gray-400 text-sm font-medium mt-1">Your curated collection of medical intelligence and health insights.</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-center min-w-[100px]">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Saved</p>
                                <p className="text-xl font-black text-gray-900">{savedPosts.length}</p>
                            </div>
                        </header>

                        {loading ? (
                            <div className="flex justify-center items-center py-24">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                            </div>
                        ) : savedPosts.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <FaBookmark className="text-3xl text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No Saved Intelligence</h3>
                                <p className="text-gray-500 font-medium mb-8">Browse the knowledge base to archive important articles here.</p>
                                <Link href="/insights" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl shadow-gray-200">
                                    <FaBookOpen size={12}/> Access Insights
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedPosts.map((post) => (
                                    <div key={post.savedPostId} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group hover:border-primary/20">
                                        {post.imageUrl && (
                                            <div className="h-48 overflow-hidden relative">
                                                <img
                                                    src={post.imageUrl}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-xl text-primary shadow-sm border border-white/50">
                                                    <FaBookmark size={14} />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col relative">
                                            {/* Source Tag shifted up if there's an image to overlap */}
                                            <div className={`flex items-center gap-2 mb-4 ${post.imageUrl ? '-mt-10 relative z-10' : ''}`}>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${post.imageUrl ? 'bg-primary text-white border-primary/20 shadow-lg' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                    {post.source || 'Medical News'}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-lg font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-1 font-medium leading-relaxed">
                                                {post.description || 'Detailed medical intelligence report. Access to read full analysis.'}
                                            </p>
                                            
                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {new Date(post.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <a
                                                    href={post.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors bg-primary/5 hover:bg-gray-100 px-3 py-1.5 rounded-xl"
                                                >
                                                    Access Full <FaExternalLinkAlt size={10} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
