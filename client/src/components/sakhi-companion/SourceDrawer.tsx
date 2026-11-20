import React from "react";
import { BookOpen, ShieldCheck, ExternalLink, X, Info } from "lucide-react";
import { type SourceCitation } from "@shared/schema";

interface SourceDrawerProps {
  open: boolean;
  sources: SourceCitation[];
  onClose: () => void;
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({
  open,
  sources,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-purple-50 via-white to-white border-b border-purple-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Approved Evidence Sources & Limits
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Source-grounded healthcare citations referenced in this conversation
          </p>
        </div>

        {/* Source Items */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-purple-900 text-xs leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              Sakhi answers are strictly grounded in published medical guidelines. When verified evidence is not available, Sakhi explicitly abstains rather than generating unverified advice.
            </span>
          </div>

          {sources.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No specific external citation was needed for this message.
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono text-[10px] font-bold">
                      {src.id}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Source
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900 leading-snug">
                    {src.title}
                  </h4>
                  <div className="text-[11px] text-gray-600 space-y-1 pt-1 border-t border-gray-100">
                    <div>
                      <strong className="text-gray-700">Evidence Status:</strong>{" "}
                      {src.evidenceStatus}
                    </div>
                    <div>
                      <strong className="text-gray-700">Clinical Limits:</strong>{" "}
                      {src.limits}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
