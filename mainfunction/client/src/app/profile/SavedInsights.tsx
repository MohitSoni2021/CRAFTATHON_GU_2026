import React from 'react';
import { FaBookmark, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { SavedPost } from './types';

interface SavedInsightsProps {
  posts: SavedPost[];
  loading: boolean;
}

export default function SavedInsights({ posts, loading }: SavedInsightsProps) {
  return (
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
        {posts.length > 4 && (
          <Link href="/profile/saved-posts" className="bg-surface-container-low text-gray-600 hover:text-primary px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-outline-variant transition-all hover:scale-[1.02] flex items-center gap-2">
            View Library <FaChevronRight size={10} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
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
          {posts.slice(0, 4).map((post) => (
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
  );
}
