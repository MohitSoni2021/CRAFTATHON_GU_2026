"use client";
import { useState, useEffect } from "react";
import {
  FaLightbulb,
  FaNewspaper,
  FaChevronRight,
  FaExclamationCircle,
  FaArrowRight,
} from "react-icons/fa";
import axios from "axios";
import Link from "next/link";

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
}

const TIPS_MOCK = [
  "Take a 5-minute stretch break every hour.",
  "Replace soda with sparkling water and lemon.",
  "Practice deep breathing for 2 minutes to reduce stress.",
  "Eat a rainbow of vegetables daily.",
  "Aim for 30 minutes of moderate activity.",
];

const HealthNewsWidget = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS_MOCK.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/news`);
        if (response.data.success) {
          setNews(response.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error("News Fetch Error", err);
        setError("Unable to load latest news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleNewsClick = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      {/* Daily Tip Card - Tertiary Accent */}
      <div className="bg-[#635888]/5 p-8 rounded-lg relative overflow-hidden transition-all duration-500 hover:bg-[#635888]/10 group">
        <div className="absolute top-0 right-0 p-6 opacity-5 transition-transform duration-700">
          <FaLightbulb className="text-7xl text-tertiary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-tertiary font-black text-[10px] mb-4 uppercase tracking-[0.2em]">
            <FaLightbulb /> <span>Wellness Insight</span>
          </div>
          <p className="text-[#2c3436] font-bold text-base leading-relaxed">
            "{TIPS_MOCK[tipIndex]}"
          </p>
        </div>
      </div>

      {/* News Feed */}
      <div className="bg-surface-container-lowest rounded-lg p-8 shadow-ambient min-h-[300px] flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-bold text-[#2c3436] font-display flex items-center gap-3">
              The Clinical Feed
            </h3>
            <p className="text-[11px] text-[#635888]/60 font-black uppercase tracking-[0.2em] mt-1">
              Global Medical News
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span className="text-[10px] font-black text-[#635888]/70 uppercase tracking-widest">
              Live
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8 flex-1">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-5 bg-surface-container-low rounded-xl w-3/4 mb-3"></div>
                <div className="h-3 bg-surface-container-low rounded-xl w-full mb-2"></div>
                <div className="h-3 bg-surface-container-low rounded-xl w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-[#635888]/40 flex-1">
            <FaExclamationCircle className="mx-auto text-3xl mb-4 opacity-20" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : (
          <div className="space-y-10 flex-1">
            {news.map((newsItem) => (
              <div
                key={newsItem._id}
                onClick={() => handleNewsClick(newsItem.url)}
                className="group cursor-pointer"
              >
                <h4 className="font-bold text-[#2c3436] text-sm group-hover:text-primary transition-colors mb-2 leading-tight">
                  {newsItem.title}
                </h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-black bg-surface-container-low px-3 py-1.5 rounded-lg text-[#635888]/70 uppercase tracking-widest">
                    {newsItem.source}
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#635888]/40 uppercase tracking-widest">
                    {new Date(newsItem.publishedAt).toLocaleDateString()}
                    <FaChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-primary -ml-2 group-hover:ml-0 duration-300" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-10 mt-10 border-t border-surface-container-low">
          <Link
            href="/insights"
            className="w-full flex items-center justify-center space-x-3 text-primary py-1 font-black text-[10px] hover:underline uppercase tracking-[0.2em] transition-all"
          >
            <span>Curated Insights</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthNewsWidget;
