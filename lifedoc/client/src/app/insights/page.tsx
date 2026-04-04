'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { FaBookmark, FaRegBookmark, FaImage } from 'react-icons/fa';
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
            <div className="h-48 bg-gray-200 flex items-center justify-center">
                <FaImage className="text-4xl text-gray-400" />
            </div>
        );
    }

    return (
        <div className="h-48 overflow-hidden">
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={() => setHasError(true)}
            />
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
                    setError('Failed to fetch news');
                }

                if (savedRes.data && savedRes.data.success) {
                    setSavedArticleIds(new Set(savedRes.data.data));
                }
            } catch (err) {
                console.error(err);
                setError('Error connecting to server');
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
                alert("Please login to save articles.");
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
            alert("Failed to update bookmark.");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Health Insights</h1>
                    <p className="text-gray-600 mt-2">Latest news and articles to keep you informed.</p>
                </header>

                <PremiumLock
                    title="Unlock Daily Health Insights"
                    description="Get access to curated latest medical news, research summaries, and personalized wellness articles."
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <div key={article._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
                                    <ArticleImage src={article.imageUrl} alt={article.title} />
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                    {article.source || 'News'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(article.publishedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleSave(article._id)}
                                                className={`p-2 rounded-full transition-colors ${savedArticleIds.has(article._id) ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50'}`}
                                                title={savedArticleIds.has(article._id) ? "Unsave" : "Save"}
                                            >
                                                {savedArticleIds.has(article._id) ? <FaBookmark /> : <FaRegBookmark />}
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                            {article.description || 'No description available.'}
                                        </p>
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-auto text-blue-600 font-medium text-sm hover:underline flex items-center"
                                        >
                                            Read full article &rarr;
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </PremiumLock>
            </div>
        </DashboardLayout>
    );
};

export default InsightsPage;
