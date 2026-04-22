'use client';

import Link from "next/link";
import {
  FaHeartbeat,
  FaFileMedicalAlt,
  FaBookMedical,
  FaShieldAlt,
  FaChartLine,
  FaMobileAlt,
  FaRobot,
  FaUsers,
  FaBell,
  FaMicroscope,
  FaShareAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCircle,
} from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-md">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Swasthya<span className="text-primary">Saathi</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block px-6 py-2.5 rounded-xl font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="btn-primary !py-2.5 !px-6 !text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden px-6">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-xl blur-3xl -z-10 animate-pulse" />

          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary font-semibold text-sm mb-4 shadow-sm animate-fade-in-up">
              ✨ The future of personalized healthcare management
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
              Your Health Journey, <br />
              <span className="text-primary">AI-Powered & Unified</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              SwasthyaSaathi is more than a records vault. It's an intelligent health companion that analyzes your reports, tracks family well-being, and provides life-saving alerts when you need them most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="btn-primary text-lg !px-10 !py-4 w-full sm:w-auto min-w-[200px]"
              >
                Start Your Journey
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 rounded-xl font-semibold text-primary border border-primary/20 hover:bg-primary/5 transition-all w-full sm:w-auto min-w-[200px] text-center"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Core Pillars / Stats */}
        <section className="py-12 border-y border-primary/5 bg-white/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl font-extrabold text-primary">99.9%</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Data Accuracy</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary">24/7</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">AI Monitoring</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary">AES-256</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Encryption</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary">Zero</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Paper Hassle</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 relative bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                A Comprehensive <span className="text-primary">Clinical Ecosystem</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover the tools designed to modernize your healthcare experience and keep you ahead of your health.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass p-8 rounded-xl card-hover space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                  <FaRobot />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  AI Symptom Analysis
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Leverage Google Gemini Pro to analyze your symptoms, cross-reference your history, and receive clinical-grade guidance on next steps.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass p-8 rounded-xl card-hover space-y-4 border-primary/20 shadow-md transform md:-translate-y-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-2xl shadow-lg">
                  <FaMicroscope />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Lab Report Intelligence
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Upload your PDFs or photos of lab reports. Our AI extracts values, identifies abnormalities, and translates medical jargon into plain English.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass p-8 rounded-xl card-hover space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                  <FaUsers />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Family Health Hub
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Manage medical profiles for your children or elderly parents. Track their medications, appointments, and vitals from a single dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                How <span className="text-primary">SwasthyaSaathi</span> Works
              </h2>
              <div className="w-20 h-1.5 bg-primary mx-auto rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-primary/10 text-primary font-bold text-xl">1</div>
                <h4 className="font-bold text-slate-900">Secure Capture</h4>
                <p className="text-sm text-slate-500 italic">Upload reports or log vitals</p>
              </div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-primary/10 text-primary font-bold text-xl">2</div>
                <h4 className="font-bold text-slate-900">AI Processing</h4>
                <p className="text-sm text-slate-500 italic">Data is parsed and analyzed</p>
              </div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-primary/10 text-primary font-bold text-xl">3</div>
                <h4 className="font-bold text-slate-900">Unified Insights</h4>
                <p className="text-sm text-slate-500 italic">View trends and clinical summaries</p>
              </div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-primary/10 text-primary font-bold text-xl">4</div>
                <h4 className="font-bold text-slate-900">Instant Doctor Handoff</h4>
                <p className="text-sm text-slate-500 italic">Share your profile with a single click</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Carousel Section */}
        <section className="py-24 px-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                Feature <span className="text-primary">Spotlight</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Explore the powerful tools designed to unify your healthcare journey and empower your clinical decisions.
              </p>
            </div>

            <div className="relative group">
              {/* This is a simple implementation of a carousel using CSS and minimal JS logic */}
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar pb-8" id="feature-carousel">
                {[
                  {
                    icon: <FaShareAlt />,
                    title: "1-Click Clinical Handoff",
                    desc: "Instantly share your entire medical history, AI summaries, and lab reports with your doctor via a secure, one-click link.",
                    tag: "NEW"
                  },
                  {
                    icon: <FaRobot />,
                    title: "AI Symptom Analysis",
                    desc: "Our Gemini-powered engine analyzes your symptoms in the context of your medical history for more accurate guidance.",
                    tag: "AI"
                  },
                  {
                    icon: <FaMicroscope />,
                    title: "Lab Report Intelligence",
                    desc: "Upload any PDF or photo of a lab report and receive a plain-English clinical summary within seconds.",
                    tag: "VISION"
                  },
                  {
                    icon: <FaUsers />,
                    title: "Family Health Hub",
                    desc: "Manage and monitor the health vitals of your children and elderly family members from a single unified dashboard.",
                    tag: "FAMILY"
                  },
                  {
                    icon: <FaBell />,
                    title: "Emergency SOS",
                    desc: "Critical vitals automatically trigger SOS alerts to your saved emergency contacts and doctors with your location.",
                    tag: "PROACTIVE"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="min-w-[320px] md:min-w-[450px] snap-center py-4">
                    <div className="glass p-10 rounded-xl h-full border-primary/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col justify-between group/card hover:-translate-y-2">
                      <div>
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-3xl group-hover/card:bg-primary group-hover/card:text-white transition-colors duration-500">
                            {feature.icon}
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-primary/5 text-primary text-[10px] font-black tracking-widest">{feature.tag}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover/card:text-primary transition-colors">{feature.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                      </div>
                      <div className="mt-10 pt-6 border-t border-slate-100 flex items-center gap-2 text-primary font-bold text-sm opacity-60 group-hover/card:opacity-100 transition-opacity">
                        Explore Feature <FaArrowRight className="text-xs group-hover/card:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-6 mt-8">
                <button 
                  onClick={() => {
                    document.getElementById('feature-carousel')?.scrollBy({ left: -400, behavior: 'smooth' });
                  }}
                  className="w-12 h-12 rounded-xl border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <FaArrowLeft />
                </button>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-xl bg-slate-200" />
                  ))}
                </div>
                <button 
                  onClick={() => {
                    document.getElementById('feature-carousel')?.scrollBy({ left: 400, behavior: 'smooth' });
                  }}
                  className="w-12 h-12 rounded-xl border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6 overflow-hidden bg-white/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Proactive Protection for <br />
                  <span className="text-primary">What Matters Most</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                      <FaBell />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                        Emergency SOS Alerts
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Instantly notify family and doctors when vitals cross critical thresholds. One-tap SOS sharing provides your location and medical ID to responders.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                      <FaBookMedical />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                        Prescription OCR
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Don't struggle with doctor's handwriting. Our vision AI reads prescriptions, schedules your dosages, and sets reminders automatically.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                      <FaChartLine />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                        Trend Predictive Analysis
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Go beyond simple tracking. Our platform identifies patterns in your vitals to predict potential health risks before they become emergencies.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                      <FaShareAlt />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">
                        1-Click Medical Handoff
                      </h4>
                      <p className="text-slate-600 text-sm">
                        Share your entire medical history, AI summaries, and lab reports with your doctor instantly via a secure, one-click sharing system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-xl transform rotate-12"></div>
                <div className="glass p-8 rounded-xl relative z-10 border-white/50 shadow-ambient">
                  {/* Mock UI Element */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Clinical Summary</p>
                        <p className="text-2xl font-bold text-slate-900">
                          AI Analysis
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                          High Confidence
                        </div>
                        <div className="px-2 py-0.5 rounded-xl bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                          <FaShareAlt className="text-[10px]" /> Shared with Dr. Smith
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-surface rounded-xl border border-primary/5">
                        <p className="text-xs font-bold text-primary mb-1">💡 KEY OBSERVATION</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Fasting glucose shows a 15% upward trend over 30 days. Consider reducing glycemic intake and scheduling a consultation.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                          <p className="text-[10px] font-bold text-red-600 uppercase">Warning</p>
                          <p className="text-sm font-bold text-slate-900">HbA1c High</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">Stable</p>
                          <p className="text-sm font-bold text-slate-900">Blood Pressure</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Link
                        href="/signup"
                        className="block w-full text-center py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest transition-transform hover:scale-[1.02]"
                      >
                        Unlock Full Analysis
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto glass p-12 rounded-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent -z-10"></div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Ready to prioritize your health?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Join thousands of users who are already experiencing the peace of
              mind that comes with AI-powered, clinical health management.
            </p>
            <Link
              href="/signup"
              className="btn-primary inline-flex text-lg !px-12 !py-5 shadow-xl hover:shadow-2xl"
            >
              Create Free Account
            </Link>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No credit card required • Secure & Private
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-primary/10 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <span className="text-xl font-bold text-slate-900">
                  Swasthya<span className="text-primary">Saathi</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering individuals to take control of their health data with
                clinical precision and AI intelligence.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">Platform</h4>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    AI Symptom Checker
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Report Analyzer
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Family Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Emergency SOS
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">Support</h4>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">Contact</h4>
              <p className="text-slate-600 mb-4 text-sm">
                Questions? Our clinical team is here to help.
              </p>
              <a
                href="mailto:support@swasthyasaathi.com"
                className="text-primary font-bold hover:underline text-sm"
              >
                support@swasthyasaathi.com
              </a>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} SwasthyaSaathi. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
