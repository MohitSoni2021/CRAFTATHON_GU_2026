const DoctorDetailsSkeleton = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Back Button Skeleton */}
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 rounded-xl bg-gray-200 mr-3"></div>
        <div className="h-4 bg-gray-200 rounded-xl w-32"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gray-100"></div>
            <div className="px-8 relative">
              <div className="absolute -top-16 left-8 w-32 h-32 rounded-xl border-4 border-white bg-gray-200 shadow-sm"></div>
            </div>
            <div className="mt-20 px-8 pb-8 space-y-6">
              <div>
                <div className="h-8 bg-gray-200 rounded-xl w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-xl w-32"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 mr-4"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-100 rounded-xl w-16"></div>
                      <div className="h-4 bg-gray-200 rounded-xl w-40"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-10">
            <div className="space-y-4 mb-10">
              <div className="h-4 bg-gray-200 rounded-xl w-40"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-64 md:w-96"></div>
              <div className="h-4 bg-gray-100 rounded-xl w-full max-w-lg"></div>
            </div>

            {/* Date Picker Skeleton */}
            <div className="mb-10">
              <div className="h-4 bg-gray-100 rounded-xl w-32 mb-3"></div>
              <div className="h-14 bg-gray-100 rounded-xl w-48"></div>
            </div>

            {/* Slots Skeleton */}
            <div>
              <div className="h-4 bg-gray-100 rounded-xl w-40 mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl border border-gray-50"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsSkeleton;
