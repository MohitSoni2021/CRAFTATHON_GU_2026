import React from 'react';

const MedicationsSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-ambient border border-outline-variant">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gray-200"></div>
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 rounded-xl w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded-xl w-20"></div>
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-xl"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded-xl w-24"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-7 bg-gray-100 rounded-lg w-16"></div>
                                    <div className="h-7 bg-gray-100 rounded-lg w-16"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded-xl w-28"></div>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-xl w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MedicationsSkeleton;
