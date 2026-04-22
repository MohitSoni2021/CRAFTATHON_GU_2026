import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function EmptyAppointments() {
  return (
    <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-dashed border-gray-200">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
        <FaCalendarAlt className="text-3xl text-gray-300" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">
        No Appointments Yet
      </h3>
      <p className="text-gray-500 font-medium">
        Your clinical schedule is currently empty.
      </p>
    </div>
  );
}
