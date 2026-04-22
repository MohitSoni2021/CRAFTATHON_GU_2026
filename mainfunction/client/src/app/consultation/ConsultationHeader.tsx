import React from "react";
import Link from "next/link";
import { FaWaveSquare } from "react-icons/fa";

export default function ConsultationHeader() {
  return (
    <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          AI Consultation
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Describe your symptoms via voice for an immediate health assessment.
        </p>
      </div>
      <Link
        href="/consultation/history"
        className="btn-primary !rounded-xl gap-2 bg-white text-primary border border-outline-variant hover:!bg-surface-container-low shadow-sm"
      >
        <FaWaveSquare size={14} className="opacity-50" />
        <span>View History</span>
      </Link>
    </header>
  );
}
