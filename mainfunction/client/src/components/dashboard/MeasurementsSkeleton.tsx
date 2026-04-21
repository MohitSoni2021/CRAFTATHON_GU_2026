const MeasurementsSkeleton = () => {
    return (
        <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-3">
                    <div className="h-8 bg-gray-200 rounded-xl w-48"></div>
                    <div className="h-4 bg-gray-200 rounded-xl w-32"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-xl w-full md:w-40"></div>
            </div>

            {/* Chart Section Skeleton */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded-full w-32 flex-shrink-0"></div>
                    ))}
                </div>
                <div className="h-[350px] bg-gray-100 rounded-xl w-full"></div>
            </div>

            {/* History List Skeleton */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
                <div className="h-7 bg-gray-200 rounded-xl w-40 mb-8"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-xl border border-gray-50">
                            <div className="flex items-center space-x-6">
                                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 rounded-xl w-48"></div>
                                    <div className="h-4 bg-gray-200 rounded-xl w-32"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-xl w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MeasurementsSkeleton;
