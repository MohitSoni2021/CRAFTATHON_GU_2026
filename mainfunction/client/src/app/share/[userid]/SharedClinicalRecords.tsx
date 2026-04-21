import React from "react";
import { FaFlask, FaFileMedical } from "react-icons/fa";
import { SharedLabReport, SharedDoctorReport } from "./types";

interface SharedClinicalRecordsProps {
  labReports: SharedLabReport[];
  doctorReports: SharedDoctorReport[];
}

export default function SharedClinicalRecords({
  labReports,
  doctorReports,
}: SharedClinicalRecordsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Lab Reports */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
            <FaFlask />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Diagnostic Assays</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Recent Lab Reports
            </p>
          </div>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {labReports && labReports.length > 0 ? (
            labReports.map((report, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-xl hover:bg-blue-50/50 transition-colors border border-gray-100 hover:border-blue-100 group"
              >
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-600 font-black text-lg shrink-0 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                  {report.testType?.charAt(0) || "L"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                    {report.testType || "Lab Test"}
                  </h4>
                  <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {new Date(report.reportDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {report.notes && (
                    <p className="text-xs font-medium text-gray-500 mt-2 line-clamp-2">
                      {report.notes}
                    </p>
                  )}
                </div>
                {report.fileUrl && (
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors self-center"
                  >
                    View PDF
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                No laboratory records
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Doctor Visits */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
            <FaFileMedical />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Clinical Encounters</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Doctor Visits
            </p>
          </div>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {doctorReports && doctorReports.length > 0 ? (
            doctorReports.map((report, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-xl hover:bg-purple-50/50 transition-colors border border-gray-100 hover:border-purple-100 group"
              >
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-purple-600 font-black text-sm shrink-0 shadow-sm group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors">
                  MD
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                    {report.doctorName || "Doctor Visit"}
                  </h4>
                  <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {new Date(report.visitDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {report.diagnosis && report.diagnosis.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {report.diagnosis.map((d, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-black tracking-widest uppercase bg-purple-50 border border-purple-100 text-purple-700 px-2 py-1 rounded-lg"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                No clinical visits recorded
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
