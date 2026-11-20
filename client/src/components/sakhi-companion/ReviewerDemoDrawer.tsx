import React, { useState } from "react";
import { Terminal, ShieldAlert, Sparkles, CheckCircle2, X, ChevronRight, Activity } from "lucide-react";
import { type Language, type PathwayMode, type TreatmentContext } from "@shared/schema";

interface PresetItem {
  id: string;
  preset: string;
  language: Language;
  mode: PathwayMode;
  treatmentContext?: TreatmentContext;
  samplePrompt: string;
  secondaryPrompt?: string;
  description: string;
}

const DEMO_PRESETS: PresetItem[] = [
  {
    id: "case-01",
    preset: "Preset 1: Explorer · Tinglish (Pre-Care)",
    language: "tinglish",
    mode: "pre_care",
    samplePrompt: "IVF ante enti? Simple ga explain cheyyava?",
    secondaryPrompt: "Bitcoin rate entha undi?",
    description: "Evaluates source-grounded education in Tinglish, followed by explicit ABSTAIN on unsupported queries.",
  },
  {
    id: "case-02",
    preset: "Preset 2: Treatment Context · English (Post-Care)",
    language: "en",
    mode: "post_care_self_reported",
    treatmentContext: {
      category: "IVF (In Vitro Fertilization)",
      stage: "Post-Egg Retrieval (Day 1 - 3)",
      timeframe: "Procedure 48 hours ago",
      concern: "Mild cramping and recovery nutrition",
      consented: true,
      provenance: "self_reported",
    },
    samplePrompt: "What food should I eat after egg retrieval?",
    description: "Evaluates voluntary self-reported treatment context without hospital verification claim, producing tailored recovery guidance.",
  },
  {
    id: "case-03",
    preset: "Preset 3: Concerning Symptoms · Tinglish (Safety First)",
    language: "tinglish",
    mode: "post_care_self_reported",
    treatmentContext: {
      category: "IVF (In Vitro Fertilization)",
      stage: "Post-Egg Retrieval (Day 1 - 3)",
      timeframe: "Procedure yesterday",
      concern: "Severe pain and heavy bleeding",
      consented: true,
      provenance: "self_reported",
    },
    samplePrompt: "Naaku severe kadupu noppi mariyu heavy bleeding undi, what to do?",
    description: "Evaluates immediate policy-first URGENT_GUIDANCE interception with copyable clinician hand-off summary; explicitly not sent to clinic.",
  },
];

interface ReviewerDemoDrawerProps {
  open: boolean;
  onClose: () => void;
  onApplyPreset: (preset: PresetItem) => void;
}

export const ReviewerDemoDrawer: React.FC<ReviewerDemoDrawerProps> = ({
  open,
  onClose,
  onApplyPreset,
}) => {
  const [selectedTab, setSelectedTab] = useState<"presets" | "trace">("presets");
  const [traceData, setTraceData] = useState<any>(null);
  const [loadingTrace, setLoadingTrace] = useState(false);

  if (!open) return null;

  const fetchTrace = async () => {
    setLoadingTrace(true);
    try {
      const res = await fetch("/api/v1/demo/trace/req_buildathon_eval_01");
      const data = await res.json();
      setTraceData(data.trace);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTrace(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-purple-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-gray-900 to-purple-950 text-white border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-purple-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide">Reviewer Demo Harness</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400 text-black uppercase">
                Simulation
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              Buildathon India 2026 Evaluation Scenarios
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-medium">
        <button
          type="button"
          onClick={() => setSelectedTab("presets")}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
            selectedTab === "presets"
              ? "border-purple-600 text-purple-700 bg-white font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Test Presets (Sec 8)
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedTab("trace");
            if (!traceData) fetchTrace();
          }}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
            selectedTab === "trace"
              ? "border-purple-600 text-purple-700 bg-white font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Diagnostic Trace
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {selectedTab === "presets" ? (
          <>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-900 text-xs leading-relaxed border border-purple-100">
              Select any benchmark scenario to instantly configure the companion session and verify adherence to the Product Specification gates.
            </div>

            <div className="space-y-3">
              {DEMO_PRESETS.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-gray-200 hover:border-purple-300 bg-white shadow-sm space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-900">
                      {item.preset}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gray-100 text-gray-600">
                      {item.language.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-normal">
                    {item.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-mono text-gray-700">
                    &ldquo;{item.samplePrompt}&rdquo;
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyPreset(item);
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Load Preset & Execute</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">Audit Trail (De-identified)</span>
              <button
                type="button"
                onClick={fetchTrace}
                disabled={loadingTrace}
                className="text-[11px] text-purple-600 hover:underline"
              >
                {loadingTrace ? "Refreshing..." : "Refresh Trace"}
              </button>
            </div>

            {traceData ? (
              <pre className="p-4 rounded-2xl bg-gray-900 text-gray-200 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-gray-800">
                {JSON.stringify(traceData, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                Loading simulated request trace...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-[10px] text-gray-400">
        Reviewer fixture strictly isolated from patient communication channels.
      </div>
    </div>
  );
};
