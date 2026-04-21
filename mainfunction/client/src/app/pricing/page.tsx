"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  FaCheck,
  FaTimes,
  FaStar,
  FaShieldAlt,
  FaBolt,
  FaSpinner,
  FaRocket,
  FaCrown,
  FaUserShield,
  FaChartLine,
} from "react-icons/fa";
import api from "@/utils/api";
import stripePromise from "@/utils/stripe";

export default function PricingPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/subscription/create-checkout-session");
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        if (error) console.error(error);
      }
    } catch (error) {
      console.error("Subscription Error:", error);
      alert("Failed to start checkout session.");
    } finally {
      setLoading(false);
    }
  };

  const isPremium =
    user?.subscription?.plan === "premium" &&
    user?.subscription?.status === "active";

  return (
    <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Immersive Background Decorations */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-tertiary/[0.03] rounded-full blur-[120px] pointer-events-none translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-primary/5 px-4 py-2 rounded-xl text-primary text-[10px] font-bold mb-6 border border-primary/10 uppercase tracking-[0.2em]">
            <FaBolt className="animate-pulse" />{" "}
            <span>Choose Your Health Partner</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Simple,{" "}
            <span className="text-primary bg-clip-text ">Transparent</span>{" "}
            Pricing
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
            Invest in your well-being with precision AI diagnostics and
            unlimited expert insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="card-editorial rounded-xl p-10 border border-outline-variant shadow-ambient relative group hover:border-primary/20 transition-all flex flex-col">
            <div className="mb-10">
              <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center mb-6 border border-outline-variant shadow-sm text-gray-400 group-hover:text-primary/50 transition-colors">
                <FaRocket size={24} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                Essential
              </h3>
              <p className="text-gray-500 text-sm font-medium">
                Core health monitoring for individuals.
              </p>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                  $0
                </span>
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  Per Month
                </span>
              </div>
            </div>

            <ul className="space-y-6 mb-12 flex-1">
              {[
                { text: "5 AI Consultations / Month", active: true },
                { text: "5 Report Scans / Month", active: true },
                { text: "Basic Health Analytics", active: true },
                { text: "Community Support", active: true },
                { text: "Priority Physician Review", active: false },
                { text: "Family Account Access", active: false },
              ].map((feature, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-4 text-sm font-medium ${feature.active ? "text-gray-700" : "text-gray-300"}`}
                >
                  {feature.active ? (
                    <div className="w-5 h-5 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0">
                      <FaCheck size={10} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-50 text-gray-200 rounded-md flex items-center justify-center shrink-0">
                      <FaTimes size={10} />
                    </div>
                  )}
                  {feature.text}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-4 px-6 bg-surface-container-low text-gray-400 font-extrabold rounded-xl border border-outline-variant text-xs uppercase tracking-widest cursor-default"
            >
              Your Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="card-editorial rounded-xl p-10 border-2 border-primary shadow-2xl relative overflow-hidden flex flex-col scale-105 z-20">
            {/* Featured Tag */}
            <div className="absolute top-0 right-0">
              <div className="bg-primary text-white text-[10px] font-bold px-6 py-2 rounded-bl-xl uppercase tracking-widest">
                Most Popular
              </div>
            </div>

            <div className="mb-10">
              <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <FaCrown size={24} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                Concierge
              </h3>
              <p className="text-gray-500 text-sm font-medium">
                Unrestricted clinical-grade intelligence.
              </p>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                  $9.99
                </span>
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  Per Month
                </span>
              </div>
            </div>

            <ul className="space-y-6 mb-12 flex-1">
              {[
                { text: "Unlimited AI Consultations", icon: <FaBolt /> },
                {
                  text: "Unlimited Report & Lab Scans",
                  icon: <FaUserShield />,
                },
                { text: "Advanced Trend Analytics", icon: <FaChartLine /> },
                { text: "Priority Physician Review", icon: <FaCrown /> },
                { text: "Family Medical Records", icon: <FaShieldAlt /> },
                { text: "24/7 Premium Concierge", icon: <FaStar /> },
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 text-sm font-bold text-gray-900"
                >
                  <div className="w-5 h-5 bg-primary text-white rounded-md flex items-center justify-center shrink-0 shadow-sm">
                    <FaCheck size={10} />
                  </div>
                  {feature.text}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div className="w-full py-4 px-6 bg-tertiary/[0.05] text-tertiary border border-tertiary/20 font-extrabold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <FaShieldAlt /> Plan Active
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-5 px-6 bg-gradient-primary text-white font-extrabold rounded-xl shadow-xl shadow-primary/30 text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <span>Upgrade to Concierge</span>
                    <FaBolt size={12} className="opacity-50" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <FaShieldAlt className="text-primary/40" /> Enterprise-Grade
            Security & HIPAA Compliant Data Storage
          </p>
        </div>
      </div>
    </div>
  );
}
