const LabReportsSkeleton = () => {
  return (
    <div className="animate-pulse w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-xl w-32 opacity-80"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-64 md:w-80"></div>
          <div className="h-4 bg-gray-100 rounded-xl w-full max-w-sm"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-full md:w-48"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col h-[320px]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-gray-100 rounded-xl w-12 h-12"></div>
              <div className="h-8 bg-gray-50 rounded-lg w-8"></div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="h-6 bg-gray-200 rounded-xl w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-xl w-1/2"></div>
            </div>

            <div className="flex-grow space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="h-3 bg-gray-100 rounded-md w-24"></div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 rounded-md w-16"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-24"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 rounded-md w-12"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-20"></div>
                  </div>
                </div>
              </div>
              <div className="h-4 bg-gray-50 rounded-xl w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabReportsSkeleton;
