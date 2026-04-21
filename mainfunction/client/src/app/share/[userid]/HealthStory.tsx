import React from "react";
import { FaStethoscope } from "react-icons/fa";

interface HealthStoryProps {
  storyDesc?: string;
}

export default function HealthStory({ storyDesc }: HealthStoryProps) {
  if (!storyDesc) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
          <FaStethoscope />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Health Summary</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Patient Context
          </p>
        </div>
      </div>
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative">
        <div className="absolute top-4 left-4 text-4xl text-gray-200 font-serif leading-none">
          "
        </div>
        <p className="text-gray-700 font-medium leading-relaxed italic relative z-10 pt-2 px-4">
          {storyDesc}
        </p>
      </div>
    </div>
  );
}
