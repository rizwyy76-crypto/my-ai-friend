import React from 'react';
import { X, Languages, Volume2, Sparkles, CheckCircle2, Lightbulb, BookOpen } from 'lucide-react';
import { useBuddy } from '../context/BuddyContext';

export const UrduModal: React.FC = () => {
  const { isUrduModalOpen, setIsUrduModalOpen, urduData, isUrduLoading, speakText } = useBuddy();

  if (!isUrduModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Urdu Explanation</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-urdu text-sm font-normal">
                  اردو میں وضاحت
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simple breakdown in clear, everyday Urdu
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUrduModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          {isUrduLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                AI is translating and preparing a clear Urdu explanation...
              </p>
              <p className="text-xs font-urdu text-emerald-600 dark:text-emerald-400">
                برائے مہربانی ایک لمحہ انتظار فرمائیں...
              </p>
            </div>
          ) : urduData ? (
            <>
              {/* Target English phrase */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    English Text
                  </span>
                  <button
                    onClick={() => speakText(urduData.sourceText)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-xs"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  "{urduData.sourceText}"
                </p>
              </div>

              {/* Simple Urdu Translation */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                  Urdu Translation • اردو ترجمہ
                </span>
                <p className="text-base sm:text-lg font-urdu text-emerald-950 dark:text-emerald-100 text-right leading-loose">
                  {urduData.simpleTranslation}
                </p>
              </div>

              {/* Detailed Explanation in Urdu */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Grammar & Meaning Breakdown • آسان فہم وضاحت</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                  <p className="text-sm sm:text-[15px] font-urdu text-slate-800 dark:text-slate-200 text-right leading-loose">
                    {urduData.urduExplanation}
                  </p>
                </div>
              </div>

              {/* Key Bullet Points in Urdu */}
              {urduData.keyPoints && urduData.keyPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Important Points • ضروری باتیں</span>
                  </h4>
                  <div className="space-y-2">
                    {urduData.keyPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-end gap-2.5 p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-right"
                      >
                        <p className="text-xs sm:text-sm font-urdu text-amber-950 dark:text-amber-100 leading-relaxed">
                          {point}
                        </p>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Usage Tip */}
              {urduData.usageTip && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="text-right flex-1">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                      Pro Tip for Daily Speaking • بول چال کا گر
                    </span>
                    <p className="text-xs sm:text-sm font-urdu text-indigo-950 dark:text-indigo-100 leading-relaxed">
                      {urduData.usageTip}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              No explanation available right now.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={() => setIsUrduModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            Got it • سمجھ گیا
          </button>
        </div>
      </div>
    </div>
  );
};
