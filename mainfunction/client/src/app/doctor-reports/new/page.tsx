"use client";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { createDoctorReport } from "@/store/slices/doctorReportsSlice";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaUserMd,
  FaPrescriptionBottleAlt,
  FaPlus,
  FaTrash,
  FaCalendarCheck,
} from "react-icons/fa";

import { Suspense } from "react";

function NewDoctorReportContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.doctorReports);

  const [visitDate, setVisitDate] = useState(
    searchParams.get("date")?.split("T")[0] ||
      new Date().toISOString().split("T")[0],
  );
  const [doctorName, setDoctorName] = useState(
    searchParams.get("doctor") || "",
  );
  const [summary, setSummary] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [diagnoses, setDiagnoses] = useState<string[]>([""]);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<
    { medicine: string; dosage: string; frequency: string }[]
  >([{ medicine: "", dosage: "", frequency: "" }]);

  // File Upload
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAddDiagnosis = () => setDiagnoses([...diagnoses, ""]);
  const handleDiagnosisChange = (index: number, value: string) => {
    const newDiagnoses = [...diagnoses];
    newDiagnoses[index] = value;
    setDiagnoses(newDiagnoses);
  };

  const handleAddPrescription = () =>
    setPrescriptions([
      ...prescriptions,
      { medicine: "", dosage: "", frequency: "" },
    ]);
  const handlePrescriptionChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newPrescriptions = [...prescriptions];
    (newPrescriptions[index] as any)[field] = value;
    setPrescriptions(newPrescriptions);
  };
  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFileUrl(data.url);
      } else {
        console.error("Upload failed:", data);
        alert(
          `Upload failed: ${data.message}\nDetails: ${data.error || "Check console for logs"}`,
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error uploading image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Filter out empty entries
    const cleanDiagnoses = diagnoses.filter((d) => d.trim() !== "");
    const cleanPrescriptions = prescriptions.filter(
      (p) => p.medicine.trim() !== "",
    );

    const result = await dispatch(
      createDoctorReport({
        userId: user.id,
        visitDate,
        doctorName,
        summary,
        diagnosis: cleanDiagnoses,
        prescriptions: cleanPrescriptions,
        followUpDate: followUpDate || undefined,
        fileUrl,
      }),
    );

    if (createDoctorReport.fulfilled.match(result)) {
      router.push("/doctor-reports");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="w-full">
          <header className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center text-tertiary/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group mr-4"
            >
              <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">
                New Entry
              </p>
              <h1 className="text-2xl font-extrabold text-[#2c3436]">
                Record Doctor <span className="text-primary">Visit</span>
              </h1>
            </div>
          </header>

          <div className="max-w-4xl bg-white p-8 md:p-12 rounded-xl shadow-ambient border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-3">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-5 py-4 bg-surface-container-low border border-gray-100 rounded-xl text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-3">
                    Healthcare Provider
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">
                      <FaUserMd />
                    </div>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. Alexander Pierce"
                      className="w-full pl-11 pr-5 py-4 bg-surface-container-low border border-gray-100 rounded-xl text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-4">
                  Clinical Diagnoses
                </label>
                <div className="space-y-4">
                  {diagnoses.map((diagnosis, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) =>
                          handleDiagnosisChange(index, e.target.value)
                        }
                        placeholder="e.g. Chronic Hypertension"
                        className="w-full px-5 py-3 bg-surface-container-low border border-gray-100 rounded-xl text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddDiagnosis}
                    className="flex items-center text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/70 transition-colors pl-1"
                  >
                    <FaPlus className="mr-2 text-xs" /> Add Another Diagnosis
                  </button>
                </div>
              </div>

              {/* Prescription Upload */}
              <div>
                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-4">
                  Prescription & Report Upload
                </label>
                <div className="bg-primary/5 p-8 rounded-xl border border-dashed border-primary/20">
                  {fileUrl ? (
                    <div className="relative w-full max-h-[400px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <img
                        src={fileUrl}
                        alt="Prescription"
                        className="w-full h-full object-contain p-4"
                      />
                      <button
                        type="button"
                        onClick={() => setFileUrl("")}
                        className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 flex items-center justify-center rounded-xl shadow-lg hover:bg-red-600 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploading ? (
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                          ) : (
                            <>
                              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                                <FaPlus className="text-xl" />
                              </div>
                              <p className="text-sm font-bold text-[#2c3436]">
                                Click to upload clinical record
                              </p>
                              <p className="text-[10px] text-tertiary/40 font-black uppercase tracking-widest mt-1">
                                Supports PNG, JPG (Max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-3">
                  Consultation Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Doctor's clinical advice, recovery path, or specific lifestyle adjustments..."
                  className="w-full px-5 py-5 bg-surface-container-low border border-gray-100 rounded-xl text-[#2c3436] font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all h-32 resize-none"
                />
              </div>

              {/* Follow Up */}
              <div>
                <label className="block text-[11px] font-black text-tertiary/40 uppercase tracking-widest mb-3">
                  Scheduled Follow-up
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">
                    <FaCalendarCheck />
                  </div>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full pl-11 pr-5 py-4 bg-surface-container-low border border-gray-100 rounded-xl text-[#2c3436] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary !rounded-xl w-full py-5 !text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              >
                {loading ? "Committing Record..." : "Archive Visit Record"}
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function NewDoctorReportPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="animate-pulse w-full">
            <div className="h-10 bg-gray-200 rounded-xl w-64 mb-8"></div>
            <div className="max-w-4xl h-[600px] bg-white rounded-xl border border-gray-100 p-12">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                </div>
                <div className="h-32 bg-gray-50 rounded-xl"></div>
                <div className="h-40 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <NewDoctorReportContent />
    </Suspense>
  );
}
