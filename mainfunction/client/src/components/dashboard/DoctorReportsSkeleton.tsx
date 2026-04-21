const DoctorReportsSkeleton = () => {
  return (
    <div className="animate-pulse w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-xl w-32 opacity-80"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-64 md:w-80"></div>
          <div className="h-4 bg-gray-100 rounded-xl w-full max-w-sm"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-full md:w-48"></div>
      </header>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-100"
          >
            <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gray-100 rounded-xl w-12 h-12"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded-xl w-48"></div>
                  <div className="h-4 bg-gray-100 rounded-xl w-64"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg w-32"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded-xl w-32"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded-md w-16"></div>
                  <div className="h-6 bg-gray-100 rounded-md w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-50 rounded-xl w-full"></div>
                  <div className="h-4 bg-gray-50 rounded-xl w-5/6"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded-xl w-32"></div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
                  <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorReportsSkeleton;
