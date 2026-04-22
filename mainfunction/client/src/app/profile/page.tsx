"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateUserProfile, uploadProfilePhoto, fetchUserProfile } from "@/store/slices/authSlice";
import axios from "axios";

// Clean Components
import { User, ProfileFormData, SavedPost } from "./types";
import ProfileHeader from "./ProfileHeader";
import ProfileHero from "./ProfileHero";
import ClinicalProfile from "./ClinicalProfile";
import HealthNarrative from "./HealthNarrative";
import SOSContactsSection from "./SOSContactsSection";
import Sidebar from "./Sidebar";
import SavedInsights from "./SavedInsights";
import ShareModal from "./ShareModal";
import EditModal from "./EditModal";
import ExplainYourselfModal from "./ExplainYourselfModal";

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- UI States ---
  const [editSection, setEditSection] = useState<"personal" | "health" | "sos" | null>(null);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // --- Form & Data States ---
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodGroup: "",
    chronicConditions: "",
    sosName: "",
    sosPhone: "",
    sosRelation: "",
    sosEmail: "",
  });

  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // --- AI / Explain Yourself States ---
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [explainStep, setExplainStep] = useState(1);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const commonDiseases = [
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Arthritis",
    "Heart Disease",
    "Thyroid",
    "None of these",
  ];

  // --- Language Detection ---
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match) setCurrentLanguage(match[1]);
  }, []);

  const settingsLabels: any = {
    en: {
      title: "Settings",
      appLang: "App Language",
      appLangDesc: "Change the language of the application interface.",
    },
    hi: {
      title: "सेटिंग्स",
      appLang: "ऐप भाषा",
      appLangDesc: "एप्लीकेशन इंटरफ़ेस की भाषा बदलें।",
    },
    gu: {
      title: "સેટિંગ્સ",
      appLang: "એપ્લિકેશન ભાષા",
      appLangDesc: "એપ્લિકેશન ઇન્ટરફેસની ભાષા બદલો.",
    },
    mr: {
      title: "सेटिंग्स",
      appLang: "अॅप भाषा",
      appLangDesc: "अनुप्रयोग इंटरफेसची भाषा बदला.",
    },
  };
  const l = settingsLabels[currentLanguage] || settingsLabels.en;

  // --- Sync User Data to Form ---
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        age: user.age?.toString() || "",
        gender: user.profile?.gender || "",
        height: user.profile?.height?.toString() || "",
        weight: user.profile?.weight?.toString() || "",
        bloodGroup: user.profile?.bloodGroup || "",
        chronicConditions: user.profile?.chronicConditions?.join(", ") || "",
      }));
    }
  }, [user]);

  // --- Fetch Saved Posts ---
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (token) {
        setLoadingSaved(true);
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/saved-posts`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) setSavedPosts(res.data.data);
        } catch (error) {
          console.error("Error fetching saved posts", error);
        } finally {
          setLoadingSaved(false);
        }
      }
    };
    fetchSavedPosts();
  }, [token]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await dispatch(uploadProfilePhoto(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    const payload: any = {};
    if (editSection === "personal") {
      if (formData.name) payload.name = formData.name;
    } else if (editSection === "health") {
      if (formData.age) payload.age = parseInt(formData.age);
      if (formData.gender) payload.gender = formData.gender;
      if (formData.height) payload.height = parseFloat(formData.height);
      if (formData.weight) payload.weight = parseFloat(formData.weight);
      if (formData.bloodGroup) payload.bloodGroup = formData.bloodGroup;
      if (formData.chronicConditions) {
        payload.chronicConditions = formData.chronicConditions
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }
    } else if (editSection === "sos") {
      const currentContacts = user?.sosContacts ? [...user.sosContacts] : [];
      const newContact = {
        name: formData.sosName,
        phone: formData.sosPhone,
        relationship: formData.sosRelation,
        email: formData.sosEmail,
      };
      if (editingContactIndex !== null && editingContactIndex >= 0) {
        currentContacts[editingContactIndex] = { ...currentContacts[editingContactIndex], ...newContact };
      } else {
        currentContacts.push(newContact);
      }
      payload.sosContacts = currentContacts;
    }

    await dispatch(updateUserProfile(payload));
    setEditSection(null);
    setEditingContactIndex(null);
  };

  const handleDeleteContact = async (index: number) => {
    if (!user || !user.sosContacts) return;
    const updatedContacts = [...user.sosContacts];
    updatedContacts.splice(index, 1);
    await dispatch(updateUserProfile({ sosContacts: updatedContacts }));
  };

  const openEditContact = (index: number) => {
    if (!user || !user.sosContacts) return;
    const contact = user.sosContacts[index];
    setFormData((prev) => ({
      ...prev,
      sosName: contact.name,
      sosPhone: contact.phone,
      sosRelation: contact.relationship || "",
      sosEmail: contact.email || "",
    }));
    setEditingContactIndex(index);
    setEditSection("sos");
  };

  const openAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      sosName: "",
      sosPhone: "",
      sosRelation: "",
      sosEmail: "",
    }));
    setEditingContactIndex(null);
    setEditSection("sos");
  };

  const copyToClipboard = () => {
    const userId = (user as any)?._id || user?.id;
    if (!userId) return;
    const shareUrl = `${window.location.origin}/share/${userId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // --- AI Handlers ---
  const handleDiseaseToggle = (disease: string) => {
    if (disease === "None of these") {
      setSelectedDiseases(["None of these"]);
      return;
    }
    let newSelection = [...selectedDiseases];
    if (newSelection.includes("None of these")) newSelection = [];
    if (newSelection.includes(disease)) {
      newSelection = newSelection.filter((d) => d !== disease);
    } else {
      newSelection.push(disease);
    }
    setSelectedDiseases(newSelection);
  };

  const startQuestionnaire = async () => {
    if (selectedDiseases.length === 0) return;
    setIsAnalyzing(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/generate-questions`,
        { diseases: selectedDiseases },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data);
      setExplainStep(2);
    } catch (error) {
      console.error("Error generating questions", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const updated = [...questions];
    updated[index].ans = answer;
    setQuestions(updated);
  };

  const handleSubmitAll = async () => {
    const formattedAnswers = questions.map((q) => ({
      question: q.question,
      answer: q.ans,
    }));
    setIsAnalyzing(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/analyze-lifestyle`,
        {
          answers: formattedAnswers,
          diseases: selectedDiseases,
          additionalDetails,
          userProfile: {
            age: user?.age,
            gender: user?.profile?.gender,
            height: user?.profile?.height,
            weight: user?.profile?.weight,
            bloodGroup: user?.profile?.bloodGroup,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysisResult(res.data.summary);
      setExplainStep(3);
      dispatch(fetchUserProfile());
    } catch (error) {
      console.error("Error analyzing answers", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeExplainModal = () => {
    setShowExplainModal(false);
    setExplainStep(1);
    setSelectedDiseases([]);
    setQuestions([]);
    setAdditionalDetails("");
    setAnalysisResult(null);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col min-h-screen bg-white">
          <ProfileHeader />

          <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto pb-20">
            <ProfileHero
              user={user as any}
              onPhotoClick={() => fileInputRef.current?.click()}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                <ClinicalProfile
                  user={user as any}
                  onEdit={() => setEditSection("health")}
                  onAIInsight={() => setShowExplainModal(true)}
                />

                <HealthNarrative storyDesc={user?.profile?.storyDesc} />

                <SOSContactsSection
                  contacts={user?.sosContacts || []}
                  onAdd={openAddContact}
                  onEdit={openEditContact}
                  onDelete={handleDeleteContact}
                />
              </div>

              <Sidebar
                user={user as any}
                onShareProfile={() => {
                  setShowShareModal(true);
                  setShowQR(false);
                }}
                onMedicalQR={() => {
                  setShowShareModal(true);
                  setShowQR(true);
                }}
                labels={l}
              />
            </div>

            <SavedInsights posts={savedPosts} loading={loadingSaved} />
          </div>

          {/* Modals */}
          {showShareModal && (
            <ShareModal
              user={user as any}
              onClose={() => setShowShareModal(false)}
              copySuccess={copySuccess}
              onCopy={copyToClipboard}
              showQR={showQR}
              setShowQR={setShowQR}
            />
          )}

          <EditModal
            editSection={editSection}
            editingContactIndex={editingContactIndex}
            formData={formData}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onClose={() => setEditSection(null)}
          />

          <ExplainYourselfModal
            show={showExplainModal}
            step={explainStep}
            onClose={closeExplainModal}
            selectedDiseases={selectedDiseases}
            onDiseaseToggle={handleDiseaseToggle}
            commonDiseases={commonDiseases}
            onStartQuestionnaire={startQuestionnaire}
            isAnalyzing={isAnalyzing}
            questions={questions}
            onAnswerChange={handleAnswerChange}
            additionalDetails={additionalDetails}
            setAdditionalDetails={setAdditionalDetails}
            onSubmitAll={handleSubmitAll}
            analysisResult={analysisResult}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
