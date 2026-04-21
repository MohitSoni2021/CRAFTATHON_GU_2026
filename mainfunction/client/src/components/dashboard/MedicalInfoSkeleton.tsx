import React from 'react';

const MedicalInfoSkeleton = () => {
    return (
        <div className="w-full animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                            <div className="w-20 h-5 bg-gray-100 rounded-full"></div>
                        </div>
                        
                        <div className="w-3/4 h-6 bg-gray-100 rounded-lg mb-4"></div>
                        <div className="space-y-2 mb-6 flex-grow">
                            <div className="w-full h-3 bg-gray-100 rounded"></div>
                            <div className="w-full h-3 bg-gray-100 rounded"></div>
                            <div className="w-2/3 h-3 bg-gray-100 rounded"></div>
                        </div>
                        
                        <div className="w-24 h-4 bg-gray-50 rounded mt-auto"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MedicalInfoSkeleton;
