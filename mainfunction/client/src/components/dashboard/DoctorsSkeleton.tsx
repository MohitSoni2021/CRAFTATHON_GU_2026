const DoctorsSkeleton = () => {
  return (
    <div className="animate-pulse w-full">
      <header className="mb-8">
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-200 rounded-xl w-32 opacity-80"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-64 md:w-80"></div>
          <div className="h-4 bg-gray-100 rounded-xl w-full max-w-lg"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="aspect-video bg-gray-100"></div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-5">
                <div className="h-6 bg-gray-200 rounded-xl w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-xl w-1/2"></div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded-full mr-3"></div>
                  <div className="h-3 bg-gray-100 rounded-xl w-3/4"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded-full mr-3"></div>
                  <div className="h-3 bg-gray-100 rounded-xl w-1/2"></div>
                </div>
              </div>

              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsSkeleton;
