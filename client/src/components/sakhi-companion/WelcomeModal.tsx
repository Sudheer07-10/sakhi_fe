import React, { useState } from "react";
import { Shield, AlertCircle, Sparkles, HeartHandshake, BookOpen } from "lucide-react";
import { type Language, type PathwayMode } from "@shared/schema";

interface WelcomeModalProps {
  open: boolean;
  initialEmail?: string;
  initialLanguage?: Language;
  onSelectPathway: (email: string, language: Language, mode: PathwayMode) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  open,
  initialEmail = "",
  initialLanguage = "en",
  onSelectPathway,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [emailError, setEmailError] = useState("");

  if (!open) return null;

  const validateAndProceed = (mode: PathwayMode) => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address to associate with your session.");
      return;
    }
    setEmailError("");
    onSelectPathway(trimmed, language, mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-purple-50 via-pink-50/50 to-white border-b border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-500/20">
              S
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Welcome to Sakhi
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Your AI Companion for Reproductive Health & Care Navigation
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Emergency Notice:</strong> If you are experiencing sudden severe pain, heavy bleeding, or high fever, seek immediate in-person medical care or contact emergency services directly.
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center justify-between">
              <span>Contact Email <span className="text-pink-600">*</span></span>
              <span className="text-[11px] text-gray-400 font-normal">Required for session continuity</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="e.g. yourname@example.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                emailError
                  ? "border-red-300 focus:ring-red-400 bg-red-50/20"
                  : "border-gray-200 focus:border-purple-400 focus:ring-purple-200 bg-gray-50/40"
              }`}
            />
            {emailError ? (
              <p className="text-xs text-red-600 mt-1">{emailError}</p>
            ) : (
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Email associates your saved Sakhi session and supports consented follow-up. <strong>It is not hospital verification or proof of patient status.</strong>
              </p>
            )}
          </div>

          {/* Language selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Preferred Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  language === "en"
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("te")}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  language === "te"
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                తెలుగు (Telugu)
              </button>
              <button
                type="button"
                onClick={() => setLanguage("tinglish")}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  language === "tinglish"
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Tinglish (Telugu in English)
              </button>
            </div>
          </div>

          {/* Pathway Selection Cards */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Choose Your Pathway
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Option 1: Pre-Care */}
              <button
                type="button"
                onClick={() => validateAndProceed("pre_care")}
                className="group text-left p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-400 bg-white hover:bg-purple-50/30 transition-all flex flex-col justify-between shadow-sm hover:shadow"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    Explore Pre-Care
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    General education on fertility, conception, IVF concepts, and lifestyle. No treatment details required.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-purple-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Enter General Education &rarr;
                </div>
              </button>

              {/* Option 2: Post-Care */}
              <button
                type="button"
                onClick={() => validateAndProceed("post_care_self_reported")}
                className="group text-left p-4 rounded-2xl border-2 border-pink-100 hover:border-pink-400 bg-white hover:bg-pink-50/30 transition-all flex flex-col justify-between shadow-sm hover:shadow"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    I am in treatment / recovering
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Self-report voluntary treatment details for recovery navigation and symptom safety guidance.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-pink-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Provide Treatment Context &rarr;
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Privacy note */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <span>Non-clinical companion. Your data is never sold or used for automated diagnosis.</span>
        </div>
      </div>
    </div>
  );
};
