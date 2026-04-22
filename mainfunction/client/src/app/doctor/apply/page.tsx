"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUpload, FaUserMd, FaIdCard, FaStethoscope, FaSpinner } from "react-icons/fa";
import { useSelector } from "react-redux";
import axios from "axios";

export default function DoctorApplicationPage() {
    const router = useRouter();
    const { user, token } = useSelector((state: any) => state.auth);
    const [documents, setDocuments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            checkStatus();
        }
    }, [token]);

    const checkStatus = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/doctor-verification/status", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus(res.data.application.status);
            setFeedback(res.data.application.feedback);
        } catch (err: any) {
            // 404 means no application, which is fine
            if (err.response?.status !== 404) {
                console.error("Error checking status", err);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (documents.length === 0) return alert("Please upload at least one document.");

        setLoading(true);
        const formData = new FormData();
        documents.forEach((doc) => {
            formData.append("documents", doc);
        });

        try {
            await axios.post("http://localhost:5000/api/doctor-verification/apply", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Application submitted successfully!");
            checkStatus();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Application failed");
        } finally {
            setLoading(false);
        }
    };

    if (status === "pending") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <FaUserMd className="text-6xl text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Pending</h2>
                    <p className="text-gray-600">Your documents are under review. We will notify you once approved.</p>
                    <button
                        onClick={() => router.push("/profile")}
                        className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        Back to Profile
                    </button>
                </div>
            </div>
        );
    }

    if (status === "approved") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-2 border-green-500">
                    <FaUserMd className="text-6xl text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">You are a Doctor!</h2>
                    <p className="text-gray-600">Your application has been approved. You now have access to doctor features.</p>
                    <button
                        onClick={() => router.push("/profile")}
                        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaUserMd /> Doctor Verification
                    </h1>
                    <p className="mt-2 text-blue-100">Join our network of healthcare professionals. Verification takes 24-48 hours.</p>
                </div>

                <div className="p-8">
                    {status === "rejected" && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700">
                            <p className="font-bold">Application Rejected</p>
                            <p>{feedback || "Documents did not meet criteria. Please re-apply."}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Verification Documents
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Please upload clear photos of your Medical License, ID Proof, and Degree Certificate.
                            </p>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">Click to Upload Files</p>
                                <p className="text-gray-400 text-sm mt-1">JPG, PNG, PDF (Max 5MB)</p>
                                {documents.length > 0 && (
                                    <div className="mt-4 text-left">
                                        <p className="font-semibold text-gray-700">Selected Files:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                            {documents.map((doc, idx) => (
                                                <li key={idx}>{doc.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                            >
                                {loading ? <FaSpinner className="animate-spin" /> : "Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
