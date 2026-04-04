'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axios from 'axios';
import Link from 'next/link';
import { FaArrowLeft, FaBookmark, FaExternalLinkAlt } from 'react-icons/fa';
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
                <div className="min-h-screen bg-gray-50 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-blue-600">
                                <FaArrowLeft />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Saved Articles</h1>
                                <p className="text-gray-500">Your personal collection of health insights</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : savedPosts.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                                    <FaBookmark className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No saved articles yet</h3>
                                <p className="text-gray-500 mb-6">Browse our insights to find articles worth keeping.</p>
                                <Link href="/insights" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    Browse Insights
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedPosts.map((post) => (
                                    <div key={post.savedPostId} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 flex flex-col h-full group">
                                        {post.imageUrl && (
                                            <div className="h-48 overflow-hidden relative">
                                                <img
                                                    src={post.imageUrl}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-blue-600 shadow-sm">
                                                    <FaBookmark />
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                    {post.source || 'News'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Saved on {new Date(post.savedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                                {post.description || 'No description available.'}
                                            </p>
                                            <a
                                                href={post.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-auto flex items-center gap-2 text-blue-600 font-medium text-sm hover:underline"
                                            >
                                                Read full article <FaExternalLinkAlt className="text-xs" />
                                            </a>
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
