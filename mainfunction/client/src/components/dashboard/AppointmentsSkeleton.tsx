const AppointmentsSkeleton = () => {
  return (
    <div className="animate-pulse w-full">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 rounded-xl w-64 md:w-80"></div>
          <div className="h-4 bg-gray-100 rounded-xl w-full max-w-sm"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-full md:w-48"></div>
      </header>

      <div className="grid gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div className="flex items-start space-x-4 w-full md:w-auto">
              <div className="p-4 rounded-xl bg-gray-100 w-14 h-14"></div>
              <div className="space-y-3 flex-1 md:flex-none">
                <div className="flex items-center space-x-3">
                  <div className="h-6 bg-gray-200 rounded-xl w-48"></div>
                  <div className="h-5 bg-gray-100 rounded-full w-20"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-100 rounded-xl w-32"></div>
                  <div className="h-4 bg-gray-50 rounded-xl w-20"></div>
                </div>
                <div className="h-3 bg-gray-50 rounded-xl w-3/4 max-w-xs"></div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center space-x-3 w-full md:w-auto justify-end">
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsSkeleton;
