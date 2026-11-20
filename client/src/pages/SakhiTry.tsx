import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Send,
  Heart,
  Shield,
  AlertTriangle,
  BookOpen,
  HeartPulse,
  Globe,
  FileText,
  RotateCcw,
  Sparkles,
  Terminal,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "../components/SEO";
import { sendChatMessage } from "@/utils/api";
import { detectScript } from "@/utils/language";

import { WelcomeModal } from "@/components/sakhi-companion/WelcomeModal";
import { PostCareIntakeModal } from "@/components/sakhi-companion/PostCareIntakeModal";
import { SafetySummaryModal } from "@/components/sakhi-companion/SafetySummaryModal";
import { SourceDrawer } from "@/components/sakhi-companion/SourceDrawer";
import { ReviewerDemoDrawer } from "@/components/sakhi-companion/ReviewerDemoDrawer";

import {
  type Language,
  type PathwayMode,
  type TreatmentContext,
  type SourceCitation,
  type ResponseState,
} from "@shared/schema";

interface ChatMessageItem {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  language?: Language;
  responseState?: ResponseState;
  sources?: SourceCitation[];
  followUps?: string[];
  isUrgent?: boolean;
}

const DEFAULT_SOURCES: SourceCitation[] = [
  {
    id: "SRC-FOGSI-01",
    title: "FOGSI Clinical Guidelines on Infertility & Assisted Reproduction",
    evidenceStatus: "Peer-reviewed national clinical guideline",
    limits: "General clinical consensus only; not individual prescription",
  },
  {
    id: "SRC-ICMR-02",
    title: "ICMR National Guidelines for Accreditation, Supervision & Regulation of ART Clinics in India",
    evidenceStatus: "Statutory national regulatory framework",
    limits: "Governs clinic standards, patient rights, and procedural consent",
  },
];

export default function SakhiTry() {
  const [, setLocation] = useLocation();

  // Session & User States
  const [sessionId, setSessionId] = useState<string>(() => localStorage.getItem("sakhi_session_id") || "");
  const [email, setEmail] = useState<string>(() => localStorage.getItem("sakhi_email") || "");
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("sakhi_lang") as Language) || "en");
  const [mode, setMode] = useState<PathwayMode>(() => (localStorage.getItem("sakhi_mode") as PathwayMode) || "pre_care");
  const [treatmentContext, setTreatmentContext] = useState<TreatmentContext | null>(() => {
    try {
      const stored = localStorage.getItem("sakhi_treatment_context");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Modal Dialog States
  const [showWelcome, setShowWelcome] = useState<boolean>(!email);
  const [showPostCareIntake, setShowPostCareIntake] = useState<boolean>(false);
  const [showSafetySummary, setShowSafetySummary] = useState<boolean>(false);
  const [showSourceDrawer, setShowSourceDrawer] = useState<boolean>(false);
  const [showReviewerDemo, setShowReviewerDemo] = useState<boolean>(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSources, setActiveSources] = useState<SourceCitation[]>(DEFAULT_SOURCES);
  const [urgentTriggered, setUrgentTriggered] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initial welcome message generator
  const getInitialGreeting = (lang: Language, pMode: PathwayMode, ctx: TreatmentContext | null) => {
    if (pMode === "post_care_self_reported") {
      const category = ctx?.category || "treatment";
      if (lang === "te") {
        return `నమస్కారం! నేను సఖి, మీ రికవరీ మరియు సంరక్షణ సహాయకురాలిని. మీరు స్వచ్ఛందంగా అందించిన ${category} సందర్భం ఆధారంగా సురక్షితమైన సమాచారం ఇవ్వడానికి నేను ఇక్కడ ఉన్నాను. గుర్తుంచుకోండి, నేను మీ ఆసుపత్రికి అనుసంధానించబడలేదు. మీరు ప్రస్తుతం ఎలా భావిస్తున్నారు?`;
      } else if (lang === "tinglish") {
        return `Namaskaram! Nenu Sakhi, mee recovery guidance companion. Meeru voluntarily provide chesina ${category} context prakaram general recovery information ivvadaniki nenu ready ga unna. Gurthunchukondi, idi hospital verified record kaadu. Ippudu mee symptoms or questions em unnayi?`;
      }
      return `Hello! I am Sakhi, your recovery support companion. Based on your voluntarily self-reported ${category} context, I am here to provide safe post-care information and answer your questions. Please remember this is not an official hospital record. How are you feeling today?`;
    }

    // Pre-care greeting
    if (lang === "te") {
      return `నమస్కారం! నేను సఖి. సంతానోత్పత్తి, గర్భధారణ, IVF ప్రక్రియలు మరియు జీవనశైలి గురించిన మీ సందేహాలకు ఆధారాలతో కూడిన సమాధానాలు ఇవ్వడానికి నేను ఇక్కడ ఉన్నాను. మీరు దేని గురించి తెలుసుకోవాలనుకుంటున్నారు?`;
    } else if (lang === "tinglish") {
      return `Namaskaram! Nenu Sakhi. Fertility, pregnancy, IVF procedures mariyu reproductive health gurinchi general education ivvadaniki nenu ready ga unna. Ee roju mee question enti?`;
    }
    return `Hello! I am Sakhi, your reproductive health education companion. I provide source-grounded guidance on fertility, IVF procedures, and wellness. No hospital login or treatment details are required. What questions can I answer for you today?`;
  };

  // Seed initial greeting when session initializes
  useEffect(() => {
    if (email && messages.length === 0) {
      const greetingText = getInitialGreeting(language, mode, treatmentContext);
      setMessages([
        {
          id: "msg_init",
          text: greetingText,
          isUser: false,
          timestamp: new Date(),
          language,
          responseState: "EDUCATE",
          sources: DEFAULT_SOURCES,
          followUps:
            mode === "pre_care"
              ? [
                  "IVF process step-by-step",
                  "What is PCOD / PCOS?",
                  "Diet tips for fertility",
                ]
              : [
                  "Normal recovery timeline",
                  "Warning signs to watch for",
                  "Safe resting activities",
                ],
        },
      ]);
    }
  }, [email, mode, language]);

  // Handle Pathway Selection from Welcome Modal (S1)
  const handleSelectPathway = async (userEmail: string, selectedLang: Language, selectedMode: PathwayMode) => {
    setEmail(userEmail);
    setLanguage(selectedLang);
    setMode(selectedMode);

    localStorage.setItem("sakhi_email", userEmail);
    localStorage.setItem("sakhi_lang", selectedLang);
    localStorage.setItem("sakhi_mode", selectedMode);

    // Call backend to create/register server session
    try {
      const res = await fetch("/api/v1/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          language: selectedLang,
          mode: selectedMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session?.sessionId) {
          setSessionId(data.session.sessionId);
          localStorage.setItem("sakhi_session_id", data.session.sessionId);
        }
      }
    } catch (e) {
      console.warn("Session registered locally:", e);
    }

    setShowWelcome(false);

    if (selectedMode === "post_care_self_reported") {
      setShowPostCareIntake(true);
    } else {
      // Clear previous messages to restart cleanly
      setMessages([]);
    }
  };

  // Handle Saving Context from Post-Care Intake (S4)
  const handleSavePostCareContext = async (
    ctx: TreatmentContext,
    consent: boolean,
    updatedEmail?: string
  ) => {
    setTreatmentContext(ctx);
    localStorage.setItem("sakhi_treatment_context", JSON.stringify(ctx));

    const finalEmail = updatedEmail || email;
    if (updatedEmail) {
      setEmail(updatedEmail);
      localStorage.setItem("sakhi_email", updatedEmail);
    }

    setShowPostCareIntake(false);

    // Sync context update to backend
    if (sessionId) {
      try {
        await fetch("/api/v1/session/context", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            treatmentContext: ctx,
            postCareEmailConsent: consent,
            email: finalEmail,
            mode: "post_care_self_reported",
          }),
        });
      } catch (e) {
        console.warn("Context synced locally:", e);
      }
    }

    // Reset messages for post-care context
    setMessages([]);
  };

  // Handle skipping Post-Care context
  const handleSkipPostCareContext = () => {
    setTreatmentContext(null);
    localStorage.removeItem("sakhi_treatment_context");
    setShowPostCareIntake(false);
    setMessages([]);
  };

  // Change Language handler
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem("sakhi_lang", newLang);
    setLangMenuOpen(false);

    if (sessionId) {
      fetch("/api/v1/session/context", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, language: newLang }),
      }).catch(() => {});
    }
  };

  // Reset Session handler
  const handleStartNewSession = () => {
    localStorage.removeItem("sakhi_treatment_context");
    setTreatmentContext(null);
    setMessages([]);
    setUrgentTriggered(false);
    setShowWelcome(true);
  };

  // Send message submission
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText("");

    // Auto-detect script so if user writes in Tinglish or Telugu, it adapts immediately
    const detected = detectScript(text);
    const effectiveLang = detected !== "en" ? detected : language;
    if (detected !== "en" && detected !== language) {
      setLanguage(detected);
      localStorage.setItem("sakhi_lang", detected);
    }

    const userMessage: ChatMessageItem = {
      id: "usr_" + Date.now(),
      text,
      isUser: true,
      timestamp: new Date(),
      language: effectiveLang,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(
        email || "guest",
        text,
        effectiveLang,
        mode,
        treatmentContext,
        sessionId
      );

      const isUrgent = data.is_urgent || data.response_state === "URGENT_GUIDANCE";
      if (isUrgent) {
        setUrgentTriggered(true);
      }

      const botMessage: ChatMessageItem = {
        id: "bot_" + Date.now(),
        text: data.reply || data.botResponse || "I am here to guide you with medically grounded information.",
        isUser: false,
        timestamp: new Date(),
        language: effectiveLang,
        responseState: data.response_state || data.responseState || "EDUCATE",
        sources: data.sources && data.sources.length > 0 ? data.sources : DEFAULT_SOURCES,
        followUps: data.follow_ups || data.followUps || [],
        isUrgent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessageItem = {
        id: "err_" + Date.now(),
        text: "I am having temporary difficulty accessing approved knowledge sources. If you have immediate symptom concerns, please contact your doctor or hospital immediately.",
        isUser: false,
        timestamp: new Date(),
        language,
        responseState: "ABSTAIN",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply Reviewer Demo Preset
  const handleApplyPreset = (preset: any) => {
    setLanguage(preset.language);
    setMode(preset.mode);
    localStorage.setItem("sakhi_lang", preset.language);
    localStorage.setItem("sakhi_mode", preset.mode);

    if (preset.treatmentContext) {
      setTreatmentContext(preset.treatmentContext);
      localStorage.setItem("sakhi_treatment_context", JSON.stringify(preset.treatmentContext));
    } else {
      setTreatmentContext(null);
      localStorage.removeItem("sakhi_treatment_context");
    }

    setShowWelcome(false);
    setShowPostCareIntake(false);
    setMessages([]);

    // Automatically execute the sample prompt after brief delay
    setTimeout(() => {
      handleSendMessage(preset.samplePrompt);
    }, 200);
  };

  return (
    <>
      <SEO
        title="Sakhi - Care Navigation & Reproductive Health Companion"
        description="Source-grounded general reproductive education and self-reported treatment navigation."
      />

      <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50/60 via-purple-50/40 to-white overflow-hidden font-sans">
        {/* ========================================================= */}
        {/* TOP BAR / HEADER                                          */}
        {/* ========================================================= */}
        <header className="bg-white/90 backdrop-blur-md border-b border-purple-100 flex-shrink-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            {/* Identity & Mode Badge */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                  S
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base font-bold text-gray-900 leading-none">Sakhi</h1>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    {mode === "post_care_self_reported" ? "Post-Care Navigation" : "Pre-Care Education"}
                  </span>
                </div>
              </Link>

              {/* Mode indicator pill */}
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  mode === "post_care_self_reported"
                    ? "bg-pink-50 text-pink-700 border-pink-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}
              >
                {mode === "post_care_self_reported" ? (
                  <>
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Post-Care (Self-Reported)</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Pre-Care (General Education)</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2">
              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    {language === "en" ? "EN" : language === "te" ? "తెలుగు" : "Tinglish"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-gray-200/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("en")}
                      className={`w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center justify-between ${
                        language === "en" ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>English</span>
                      {language === "en" && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("te")}
                      className={`w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center justify-between ${
                        language === "te" ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>తెలుగు (Telugu)</span>
                      {language === "te" && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("tinglish")}
                      className={`w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center justify-between ${
                        language === "tinglish" ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>Tinglish</span>
                      {language === "tinglish" && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Clinician Summary Button */}
              <button
                type="button"
                onClick={() => setShowSafetySummary(true)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                  urgentTriggered
                    ? "bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                }`}
                title="Prepare summary to share with doctor"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clinician Summary</span>
              </button>

              {/* Reviewer Demo Trigger */}
              <button
                type="button"
                onClick={() => setShowReviewerDemo(true)}
                className="px-2.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Open Reviewer Evaluation Fixtures"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Reviewer Demo</span>
              </button>

              {/* New Session Button */}
              <button
                type="button"
                onClick={handleStartNewSession}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 text-xs transition-colors"
                title="Start New Session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERSISTENT SUB-BANNERS (S2 Pre-Care & S5 Post-Care)        */}
          {/* ========================================================= */}
          {mode === "post_care_self_reported" ? (
            <div className="bg-pink-50/90 border-t border-pink-200 px-4 sm:px-6 py-2 text-xs text-pink-950 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span>
                  <strong>Self-Reported Treatment Context (Not Hospital Verified):</strong>{" "}
                  {treatmentContext ? (
                    <span>
                      {treatmentContext.category} &bull; {treatmentContext.stage}
                      {treatmentContext.concern && ` &bull; Concern: ${treatmentContext.concern}`}
                    </span>
                  ) : (
                    <span className="italic text-pink-800">No specific treatment details declared.</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostCareIntake(true)}
                  className="px-2.5 py-0.5 rounded-md bg-white border border-pink-300 hover:bg-pink-100 text-[11px] font-semibold text-pink-800 transition-colors"
                >
                  {treatmentContext ? "Edit Context" : "Provide Context"}
                </button>
                {treatmentContext && (
                  <button
                    type="button"
                    onClick={() => {
                      setTreatmentContext(null);
                      localStorage.removeItem("sakhi_treatment_context");
                    }}
                    className="px-2 py-0.5 rounded-md hover:bg-pink-100 text-[11px] text-pink-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMode("pre_care");
                    localStorage.setItem("sakhi_mode", "pre_care");
                    setMessages([]);
                  }}
                  className="text-[11px] text-purple-700 underline font-medium hover:text-purple-900"
                >
                  Switch to Pre-Care
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50/70 border-t border-purple-100 px-4 sm:px-6 py-1.5 text-[11px] text-purple-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>General reproductive health education. Source-grounded answers. No hospital login or treatment details required.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode("post_care_self_reported");
                  localStorage.setItem("sakhi_mode", "post_care_self_reported");
                  setShowPostCareIntake(true);
                }}
                className="text-pink-700 font-semibold underline hover:text-pink-900 shrink-0 ml-2"
              >
                In treatment? Switch to Post-Care &rarr;
              </button>
            </div>
          )}
        </header>

        {/* ========================================================= */}
        {/* MAIN CHAT CANVAS                                          */}
        {/* ========================================================= */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"} animate-in fade-in duration-150`}
            >
              {/* Sender label & timestamp */}
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-gray-400">
                <span>{msg.isUser ? email || "You" : "Sakhi AI"}</span>
                <span>&bull;</span>
                <span>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              {/* Message Bubble */}
              {msg.isUser ? (
                <div className="max-w-[85%] sm:max-w-xl rounded-2xl rounded-tr-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-sm text-sm leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[92%] sm:max-w-2xl space-y-2">
                  {/* Urgent Guidance Card (S6) */}
                  {msg.isUrgent ? (
                    <div className="rounded-2xl rounded-tl-xs bg-red-50 border-2 border-red-400 text-red-950 p-5 shadow-md space-y-3">
                      <div className="flex items-center gap-2.5 text-red-700 font-bold text-sm">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span>URGENT CARE GUIDANCE &bull; IMMEDIATE ACTION ADVISED</span>
                      </div>
                      <p className="text-sm font-semibold leading-relaxed text-red-900">
                        {msg.text}
                      </p>
                      <div className="pt-2 border-t border-red-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-red-700">
                          Do not delay in-person medical care waiting for replies.
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSafetySummary(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Generate Clinician Summary</span>
                        </button>
                      </div>
                    </div>
                  ) : msg.responseState === "ABSTAIN" ? (
                    /* Abstention Card */
                    <div className="rounded-2xl rounded-tl-xs bg-amber-50/80 border border-amber-300 text-amber-950 p-4 shadow-xs space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Verified Evidence Limitation (Abstained)</span>
                      </div>
                      <p className="text-xs leading-relaxed text-amber-900">
                        {msg.text}
                      </p>
                    </div>
                  ) : (
                    /* Standard Educate / Clarify Bubble */
                    <div className="rounded-2xl rounded-tl-xs bg-white border border-purple-100 text-gray-800 p-4 sm:p-5 shadow-xs space-y-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* Expandable Evidence Sources Pill (S3) */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSources(msg.sources || DEFAULT_SOURCES);
                              setShowSourceDrawer(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>View Evidence Sources ({msg.sources.length})</span>
                          </button>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Not individual prescription
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up question chips */}
                  {msg.followUps && msg.followUps.length > 0 && !msg.isUrgent && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.followUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 transition-colors shadow-2xs text-left"
                        >
                          {chip} &rarr;
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]"></div>
              <span className="ml-1 text-[11px] text-gray-400">Finding verified clinical information...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* ========================================================= */}
        {/* INPUT TRAY                                                */}
        {/* ========================================================= */}
        <footer className="bg-white/90 backdrop-blur-md border-t border-purple-100 p-3 sm:p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === "te"
                    ? "సఖిని ఏదైనా ప్రశ్న అడగండి..."
                    : language === "tinglish"
                    ? "Sakhi ni edaina doubt adagandi (e.g. IVF process enti?)..."
                    : "Ask Sakhi a question or report a symptom..."
                }
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 text-sm bg-gray-50/60 focus:bg-white transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-gray-400" />
              <span>
                Sakhi provides general education only and cannot replace your fertility doctor. In emergency, call hospital directly.
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* MODALS & DRAWERS (S1, S3, S4, S6, S7)                     */}
      {/* ========================================================= */}

      {/* S1: Welcome Modal */}
      <WelcomeModal
        open={showWelcome}
        initialEmail={email}
        initialLanguage={language}
        onSelectPathway={handleSelectPathway}
      />

      {/* S4: Post-Care Intake Modal */}
      <PostCareIntakeModal
        open={showPostCareIntake}
        email={email}
        onSaveContext={handleSavePostCareContext}
        onSkip={handleSkipPostCareContext}
        onClose={() => setShowPostCareIntake(false)}
      />

      {/* S6: Clinician Hand-off & Urgent Summary Modal */}
      <SafetySummaryModal
        open={showSafetySummary}
        email={email}
        language={language}
        mode={mode}
        treatmentContext={treatmentContext}
        messages={messages}
        urgentTriggered={urgentTriggered}
        onClose={() => setShowSafetySummary(false)}
      />

      {/* S3: Source Drawer */}
      <SourceDrawer
        open={showSourceDrawer}
        sources={activeSources}
        onClose={() => setShowSourceDrawer(false)}
      />

      {/* S7: Reviewer Demo Drawer */}
      <ReviewerDemoDrawer
        open={showReviewerDemo}
        onClose={() => setShowReviewerDemo(false)}
        onApplyPreset={handleApplyPreset}
      />
    </>
  );
}
