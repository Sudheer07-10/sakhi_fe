import React, { useState } from "react";
import { AlertCircle, Copy, Check, Printer, X, FileText, Info } from "lucide-react";
import { type TreatmentContext, type PathwayMode, type Language } from "@shared/schema";

interface MessageItem {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isUrgent?: boolean;
}

interface SafetySummaryModalProps {
  open: boolean;
  email: string;
  language: Language;
  mode: PathwayMode;
  treatmentContext?: TreatmentContext | null;
  messages: MessageItem[];
  urgentTriggered?: boolean;
  onClose: () => void;
}

export const SafetySummaryModal: React.FC<SafetySummaryModalProps> = ({
  open,
  email,
  language,
  mode,
  treatmentContext,
  messages,
  urgentTriggered = false,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const userQuestions = messages
    .filter((m) => m.isUser)
    .map((m) => `- ${m.text}`)
    .join("\n");

  const summaryText = `========================================================
SAKHI PATIENT-GENERATED HEALTH SUMMARY
DISCLOSURE: This summary is prepared by the patient for personal reference or self-sharing. IT HAS NOT BEEN DELIVERED OR TRANSMITTED TO ANY DOCTOR, CLINIC, OR HOSPITAL.
========================================================
Generated: ${new Date().toLocaleString()}
Contact Email: ${email || "Not Provided"}
Language Mode: ${language.toUpperCase()}
Session Pathway: ${mode === "post_care_self_reported" ? "Post-Care (Self-Reported)" : "Pre-Care (General Education)"}

${
  treatmentContext
    ? `SELF-REPORTED TREATMENT CONTEXT (NOT CLINICALLY VERIFIED):
- Category: ${treatmentContext.category}
- Stage/Timing: ${treatmentContext.stage}
- Timeframe: ${treatmentContext.timeframe || "Not specified"}
- Primary Concern: ${treatmentContext.concern || "None reported"}
- Data Provenance: Self-Reported by User`
    : `TREATMENT CONTEXT: None declared (General Pre-Care Education)`
}

${
  urgentTriggered
    ? `URGENT CARE ALERT:
POTENTIAL WARNING SIGNS WERE REPORTED DURING THIS SESSION.
IMMEDIATE PROFESSIONAL MEDICAL EVALUATION WAS STRONGLY ADVISED.
DO NOT DELAY IN-PERSON CARE WAITING FOR REPLIES.`
    : ""
}

USER INQUIRIES DISCUSSED:
${userQuestions || "- General introductory consultation"}

CLINICAL DISCLAIMER:
Sakhi is an educational AI tool developed for the Startup Buildathon India 2026. Sakhi does not diagnose, prescribe, or provide clinical clearance. Always seek the advice of your qualified healthcare provider.
========================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50/40 to-white border-b border-purple-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Clinician Hand-off Summary
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Exportable summary formatted for your personal reference or doctor visit
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Explicit 'NOT SENT' banner */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Self-Shareable Only:</strong> This summary is ready for you to copy or share with your doctor. <strong>It has NOT been sent to a clinician, clinic, or hospital.</strong> No doctor will contact you automatically.
            </div>
          </div>

          {/* Urgent Alert if red flags */}
          {urgentTriggered && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Emergency Recommendation:</strong> High-risk warning symptoms were mentioned in your chat. Please present this summary directly to an emergency department or your treating doctor immediately.
              </div>
            </div>
          )}

          {/* Pre-formatted preview */}
          <div className="relative">
            <pre className="p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72 border border-gray-800">
              {summaryText}
            </pre>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  Copy Summary
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
