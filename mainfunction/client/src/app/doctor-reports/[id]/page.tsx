'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  FaArrowLeft, 
  FaUserMd, 
  FaPrescriptionBottleAlt, 
  FaCalendarCheck, 
  FaFilePrescription, 
  FaNotesMedical, 
  FaDownload 
} from 'react-icons/fa';
import DoctorReportsSkeleton from '@/components/dashboard/DoctorReportsSkeleton';

interface Prescription {
    medicine: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
}

interface DoctorReport {
    _id: string;
    visitDate: string;
    doctorName?: string;
    diagnosis?: string[];
    prescriptions?: Prescription[];
    summary?: string;
    fileUrl?: string;
    followUpDate?: string;
}

export default function DoctorVisitDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/doctor-reports/${params.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.data.data) {
          setReport(response.data.data);
        } else {
          setError("Report not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    if (token && params.id) {
      fetchReport();
    }
  }, [token, params.id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <DoctorReportsSkeleton />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !report) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-20 bg-white rounded-xl shadow-ambient border border-gray-100 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FaNotesMedical className="text-3xl text-red-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#2c3436] mb-4">
              {error || "Clinical Record Missing"}
            </h2>
            <button
              onClick={() => router.back()}
              className="btn-primary !rounded-xl px-10"
            >
              Return to Archive
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="w-full">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center text-tertiary/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group mr-5"
              >
                <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <p className="text-tertiary text-[11px] font-bold uppercase tracking-[0.1em] opacity-80 mb-1">
                  Clinical Archive • Detailed Record
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#2c3436] leading-tight">
                  Visit <span className="text-primary">Details</span>
                </h1>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-[10px] font-black text-tertiary/40 uppercase tracking-widest mb-1">
                Date of Consultation
              </p>
              <p className="text-sm font-extrabold text-[#2c3436]">
                {new Date(report.visitDate).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Doctor & Info Header */}
              <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-center space-x-6">
                  <div className="p-5 bg-primary/5 rounded-xl text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <FaUserMd className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#2c3436]">
                      {report.doctorName || "Clinical Consultation"}
                    </h2>
                    <p className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mt-1">
                      Attending Healthcare Professional
                    </p>
                  </div>
                </div>
                {report.followUpDate && (
                  <div className="flex items-center px-5 py-3 bg-tertiary/5 text-tertiary rounded-xl text-[10px] font-black uppercase tracking-widest border border-tertiary/10">
                    <FaCalendarCheck className="mr-3 text-lg" />
                    <div>
                      <span className="block opacity-50 mb-0.5">
                        Scheduled Follow-up
                      </span>
                      <span>
                        {new Date(report.followUpDate).toLocaleDateString(
                          undefined,
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary & Diagnosis Card */}
              <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100">
                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-8 flex items-center border-b border-gray-50 pb-4">
                  <FaNotesMedical className="mr-3 text-tertiary/20 text-lg" />{" "}
                  Clinical Summary & Diagnosis
                </h3>

                {report.diagnosis && report.diagnosis.length > 0 && (
                  <div className="mb-10">
                    <span className="text-[10px] font-black text-tertiary/30 uppercase tracking-widest block mb-4">
                      Confirmed Diagnoses
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {report.diagnosis.map((d, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-100 shadow-sm"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-black text-tertiary/30 uppercase tracking-widest block mb-4">
                    Clinical Notes & Advice
                  </span>
                  <p className="text-tertiary/70 leading-relaxed italic font-medium text-lg border-l-4 border-primary/20 pl-6 py-2">
                    "
                    {report.summary ||
                      "No consultation summary provided for this visit."}
                    "
                  </p>
                </div>
              </div>

              {/* Prescriptions */}
              <div className="bg-surface-container-low p-8 rounded-xl border border-gray-100">
                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                  <FaPrescriptionBottleAlt className="mr-3 text-primary/40 text-lg" />{" "}
                  Active Prescriptions
                </h3>
                {report.prescriptions && report.prescriptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.prescriptions.map((p, i) => (
                      <div
                        key={i}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-base font-extrabold text-[#2c3436] group-hover:text-primary transition-colors">
                            {p.medicine}
                          </span>
                          <span className="text-[10px] text-tertiary/40 font-black uppercase tracking-widest mt-1">
                            {p.dosage} • {p.frequency}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/30 group-hover:bg-primary group-hover:text-white transition-all">
                          <FaPrescriptionBottleAlt className="text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center bg-white/50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-tertiary/30 text-xs font-bold uppercase tracking-widest">
                      No medications recorded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Attachment */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-xl shadow-ambient border border-gray-100 sticky top-8">
                <h3 className="text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-6 flex items-center">
                  <FaFilePrescription className="mr-3 text-primary/40 text-lg" />{" "}
                  Clinical Attachment
                </h3>
                {report.fileUrl ? (
                  <div className="space-y-6">
                    <div
                      className="rounded-xl overflow-hidden border border-gray-100 bg-surface-container-low group cursor-pointer relative"
                      onClick={() => window.open(report.fileUrl, "_blank")}
                    >
                      <img
                        src={report.fileUrl}
                        alt="Prescription"
                        className="w-full h-auto object-contain max-h-[500px] transition-all duration-500 group-hover:scale-105 group-hover:brightness-95 p-4"
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white p-3 rounded-xl shadow-xl">
                          <FaDownload className="text-primary" />
                        </div>
                      </div>
                    </div>
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary !rounded-xl w-full py-4 !text-xs flex items-center justify-center space-x-3 shadow-lg shadow-primary/20"
                    >
                      <FaDownload />
                      <span>Download Record</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-surface-container-low rounded-xl border border-dashed border-gray-200">
                    <FaFilePrescription className="text-4xl text-tertiary/10 mx-auto mb-4" />
                    <p className="text-tertiary/30 text-[10px] font-black uppercase tracking-widest">
                      No record attached
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
