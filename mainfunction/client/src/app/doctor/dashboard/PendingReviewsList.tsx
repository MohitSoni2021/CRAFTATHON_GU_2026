import React from "react";
import { FaClipboardList, FaCheck } from "react-icons/fa";
import { Consultation } from "./types";

interface PendingReviewsListProps {
  pendingReviews: Consultation[];
  loading: boolean;
  selectedConsultation: Consultation | null;
  onSelectReview: (consultation: Consultation) => void;
}

export default function PendingReviewsList({ pendingReviews, loading, selectedConsultation, onSelectReview }: PendingReviewsListProps) {
  return (
    <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
          <FaClipboardList className="text-primary" /> Pending Reviews
        </h3>
        <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-black px-3 py-1 rounded-xl shadow-sm">
          {pendingReviews.length}
        </span>
      </div>
      <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Cases...</span>
          </div>
        ) : pendingReviews.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center bg-gray-50/50">
            <FaCheck className="text-emerald-400 text-3xl mb-3" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">All caught up</span>
          </div>
        ) : (
          pendingReviews.map((review) => (
            <div
              key={review._id}
              onClick={() => onSelectReview(review)}
              className={`p-5 cursor-pointer transition-all hover:bg-primary/5 group ${selectedConsultation?._id === review._id ? "bg-primary/5 border-l-4 border-primary shadow-inner" : "border-l-4 border-transparent"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-black text-sm transition-colors ${selectedConsultation?._id === review._id ? "text-primary" : "text-gray-900 group-hover:text-primary"}`}>
                  {review.user?.name || "Unknown User"}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                  {new Date(review.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium line-clamp-2 italic leading-relaxed">
                "{review.symptoms}"
              </p>
              <div className="mt-3 flex gap-2">
                <span
                  className={`text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-widest border shadow-sm ${
                    review.urgency === "High"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200"
                  }`}
                >
                  {review.urgency} Priority
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
