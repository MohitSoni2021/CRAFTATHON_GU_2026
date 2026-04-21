import React from "react";
import Link from "next/link";
import { FaNotesMedical, FaMicrophone, FaFilePrescription, FaVial, FaExclamationTriangle } from "react-icons/fa";
import { DoctorReport, Prescription, LabReport } from "./types";

interface ClinicalRecordsProps {
  doctorReports: DoctorReport[];
  prescriptions: Prescription[];
  labReports: LabReport[];
  onSpeak: (text: string) => void;
}

export default function ClinicalRecords({
  doctorReports,
  prescriptions,
  labReports,
  onSpeak,
}: ClinicalRecordsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Doctor Reports */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <FaNotesMedical />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Clinical Encounters</h2>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Physician Notes
            </p>
          </div>
        </div>
        {doctorReports.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <FaNotesMedical className="mx-auto text-gray-300 text-2xl mb-2" />
            <p className="text-gray-500 font-medium text-sm">No clinical encounters recorded.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {doctorReports.map((report) => (
              <div
                key={report._id}
                className="p-5 border border-gray-100 rounded-xl bg-white hover:border-indigo-200 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">
                      {report.doctorName}
                    </h3>
                    <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {new Date(report.visitDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      onSpeak(`Doctor visit with ${report.doctorName}. Diagnosis: ${report.diagnosis}`)
                    }
                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center transition-colors"
                  >
                    <FaMicrophone size={12} />
                  </button>
                </div>
                <p className="text-gray-600 text-sm font-medium leading-relaxed">
                  {report.diagnosis}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescriptions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <FaFilePrescription />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Active Regimens</h2>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Pharmacology
            </p>
          </div>
        </div>
        {prescriptions.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <FaFilePrescription className="mx-auto text-gray-300 text-2xl mb-2" />
            <p className="text-gray-500 font-medium text-sm">No active prescriptions.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {prescriptions.map((script) => (
              <div
                key={script._id}
                className="p-5 border border-gray-100 rounded-xl bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="mb-3">
                  <h3 className="font-black text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                    {script.doctorName || "Attending Physician"}
                  </h3>
                  <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {new Date(script.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {script.medicines?.map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      {typeof m === "string" ? m : m.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Reports */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <FaVial />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Diagnostic Assays</h2>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Laboratory Results
            </p>
          </div>
        </div>
        {labReports.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <FaVial className="mx-auto text-gray-300 text-2xl mb-2" />
            <p className="text-gray-500 font-medium text-sm">No laboratory results processed.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {labReports.map((report) => {
              let displayResult = "View Full Matrix";
              let isAbnormal = false;
              if (report.parsedResults) {
                if (report.parsedResults.summary && report.parsedResults.summary.abnormalTests > 0) {
                  displayResult = `${report.parsedResults.summary.abnormalTests} Flagged Markers`;
                  isAbnormal = true;
                } else if (report.parsedResults.tests && report.parsedResults.tests.length > 0) {
                  displayResult = report.parsedResults.tests[0].resultValue || "Available";
                } else if (Object.keys(report.parsedResults).length > 0) {
                  const firstKey = Object.keys(report.parsedResults)[0];
                  if (typeof report.parsedResults[firstKey] !== "object") {
                    displayResult = String(report.parsedResults[firstKey]);
                  }
                }
              }

              return (
                <Link
                  href={`/lab-reports/${report._id}`}
                  key={report._id}
                  className="block p-5 border border-gray-100 rounded-xl bg-white hover:border-purple-200 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                        {report.testType || "Comprehensive Panel"}
                      </h3>
                      <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {new Date(report.reportDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isAbnormal
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-50 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600"
                      }`}
                    >
                      {isAbnormal ? <FaExclamationTriangle size={12} /> : <FaVial size={12} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Status:
                    </span>
                    <span className={`text-xs font-black ${isAbnormal ? "text-red-600" : "text-gray-900"}`}>
                      {displayResult}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
