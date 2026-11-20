import React, { useState } from "react";
import { AlertTriangle, CheckSquare, ShieldCheck, HeartPulse, X } from "lucide-react";
import { type TreatmentContext } from "@shared/schema";

interface PostCareIntakeModalProps {
  open: boolean;
  email: string;
  onSaveContext: (context: TreatmentContext, emailConsent: boolean, updatedEmail?: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

const CATEGORIES = [
  "IVF (In Vitro Fertilization)",
  "IUI (Intrauterine Insemination)",
  "Laparoscopy / Pelvic Surgery",
  "Ovulation Induction / Hormonal Injections",
  "Post-Op Recovery (General)",
  "Other Gynecological Care",
];

const STAGES = [
  "Pre-procedure Preparation",
  "Active Stimulation Injections",
  "Post-Egg Retrieval (Day 1 - 3)",
  "Post-Embryo Transfer (Two-Week Wait)",
  "Post-Surgical Recovery (Within 7 days)",
  "Ongoing Cycle Monitoring",
];

export const PostCareIntakeModal: React.FC<PostCareIntakeModalProps> = ({
  open,
  email,
  onSaveContext,
  onSkip,
  onClose,
}) => {
  const [currentEmail, setCurrentEmail] = useState(email);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stage, setStage] = useState(STAGES[2]);
  const [timeframe, setTimeframe] = useState("Procedure within the last 48-72 hours");
  const [concern, setConcern] = useState("");
  const [emailConsent, setEmailConsent] = useState(true);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContext(
      {
        category,
        stage,
        timeframe,
        concern: concern.trim(),
        consented: true,
        provenance: "self_reported",
      },
      emailConsent,
      currentEmail.trim() !== email ? currentEmail.trim() : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Close */}
        <div className="p-6 bg-gradient-to-br from-pink-50 via-purple-50/50 to-white border-b border-pink-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            <HeartPulse className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Post-Care Context Intake
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Voluntary Treatment & Recovery Information
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Mandatory Non-Hospital Disclosure Box */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs leading-relaxed space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900 uppercase tracking-wider text-[10px]">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Required Post-Care Disclosure
            </div>
            <p>
              Sakhi is <strong>not connected to your hospital</strong> in this version. Treatment details are based solely on what you voluntarily provide. Sakhi offers general information and guidance on seeking professional care; it <strong>cannot diagnose, confirm clinical safety, or contact your doctor automatically</strong>.
            </p>
          </div>

          {/* Contact email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
            />
            <p className="text-[11px] text-gray-400">
              This email is associated with this session only. It is not looked up in any hospital database.
            </p>
          </div>

          {/* Treatment Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Treatment / Procedure Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stage / Timing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Approximate Stage or Timing
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe & Concern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Timeframe / Days
              </label>
              <input
                type="text"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="e.g. 2 days post embryo transfer"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Current Primary Concern
              </label>
              <input
                type="text"
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="e.g. Mild cramps, resting advice"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Email Consent Checkbox */}
          <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="consentBox"
              checked={emailConsent}
              onChange={(e) => setEmailConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="consentBox" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
              I consent to storing this self-reported context for this session and agree to receive consent-based follow-up communication if implemented. <strong>I understand this does not notify my doctor.</strong>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors text-center"
            >
              Skip Context for Now
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-pink-500/20 transition-all text-center"
            >
              Save Context & Start Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
