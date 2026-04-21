'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { FaBookmark, FaRegBookmark, FaImage, FaChevronRight, FaRegNewspaper, FaClock, FaGlobe, FaBolt } from 'react-icons/fa';
import PremiumLock from '@/components/PremiumLock';

interface Article {
    _id: string;
    title: string;
    description: string;
    url: string;
    imageUrl: string;
    source: string;
    publishedAt: string;
}

const ArticleImage = ({ src, alt }: { src?: string, alt: string }) => {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="h-56 bg-surface-container-low flex flex-col items-center justify-center border-b border-outline-variant relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FaImage className="text-4xl text-gray-200 mb-2 relative z-10" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest relative z-10">Image Unavailable</p>
            </div>
        );
    }

    return (
        <div className="h-56 overflow-hidden border-b border-outline-variant relative group">
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={() => setHasError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};

const InsightsPage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const token = localStorage.getItem('token');
                const [newsRes, savedRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/news`),
                    token ? axios.get(`${process.env.NEXT_PUBLIC_API_URL}/saved-posts/ids`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: { success: false, data: [] } })
                ]);

                if (newsRes.data.success) {
                    setArticles(newsRes.data.data);
                } else {
                    setError('Failed to fetch clinical insights');
                }

                if (savedRes.data && savedRes.data.success) {
                    setSavedArticleIds(new Set(savedRes.data.data));
                }
            } catch (err) {
                console.error(err);
                setError('Error connecting to clinical database');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const toggleSave = async (articleId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please login to synchronize your library.");
                return;
            }

            const isSaved = savedArticleIds.has(articleId);

            if (isSaved) {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/saved-posts/${articleId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSavedArticleIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(articleId);
                    return newSet;
                });
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/saved-posts`, { articleId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSavedArticleIds(prev => new Set(prev).add(articleId));
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            alert("Protocol failure: Failed to update bookmark.");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col min-h-screen bg-white">
                <header className="mb-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-primary/5 px-3 py-1 rounded-lg text-primary text-[10px] font-bold mb-3 border border-primary/10 uppercase tracking-widest">
                                <FaRegNewspaper /> <span>Medical Intelligence</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Health Insights
                            </h1>
                            <p className="text-gray-500 text-sm font-medium mt-1">Curated global medical breakthroughs and wellness research.</p>
                        </div>
                    </div>
                </header>

                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto pb-20">
                    <PremiumLock
                        title="Unlock Diagnostic-Grade Insights"
                        description="Access real-time clinical news, peer-reviewed summaries, and personalized AI health analysis."
                    >
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="h-96 bg-surface-container-low rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-8 rounded-xl border border-red-100 flex items-center gap-4">
                                <FaBolt className="shrink-0" />
                                <p className="font-bold uppercase tracking-widest text-xs">{error}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {articles.map((article) => (
                                    <div 
                                        key={article._id} 
                                        className="card-editorial bg-white rounded-xl border border-outline-variant shadow-ambient hover:shadow-2xl hover:border-primary/20 transition-all flex flex-col h-full group"
                                    >
                                        <div className="relative">
                                            <ArticleImage src={article.imageUrl} alt={article.title} />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-3 py-1 rounded-lg shadow-sm uppercase tracking-widest border border-primary/10">
                                                    {article.source || 'Clinical'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleSave(article._id)}
                                                className={`absolute top-4 right-4 w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-lg border backdrop-blur-md ${savedArticleIds.has(article._id) ? 'bg-primary text-white border-primary' : 'bg-white/90 text-gray-400 border-white hover:text-primary'}`}
                                                title={savedArticleIds.has(article._id) ? "Synchronized" : "Synchronize to Library"}
                                            >
                                                {savedArticleIds.has(article._id) ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                                            </button>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                                <div className="flex items-center gap-1.5">
                                                    <FaClock className="text-primary/40" />
                                                    {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <FaGlobe className="text-primary/40" />
                                                    Global Access
                                                </div>
                                            </div>

                                            <h3 className="text-base font-extrabold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tight">
                                                {article.title}
                                            </h3>
                                            
                                            <p className="text-gray-500 text-xs font-medium mb-8 line-clamp-3 flex-1 leading-relaxed opacity-80">
                                                {article.description || 'Verified clinical documentation pending overview.'}
                                            </p>
                                            
                                            <a
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-auto group/link flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary/20 transition-all"
                                            >
                                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Examine Full Report</span>
                                                <FaChevronRight size={10} className="text-primary group-hover/link:translate-x-1 transition-transform" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </PremiumLock>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InsightsPage;
