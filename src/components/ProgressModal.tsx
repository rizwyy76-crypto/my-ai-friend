import React from 'react';
import {
  X,
  TrendingUp,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useBuddy } from '../context/BuddyContext';

export const ProgressModal: React.FC = () => {
  const { isProgressModalOpen, setIsProgressModalOpen, progress, difficulty } = useBuddy();

  if (!isProgressModalOpen) return null;

  const levelProgress = {
    beginner: { pct: 40, label: 'Beginner (CEFR A1-A2)', next: 'Intermediate' },
    intermediate: { pct: 72, label: 'Intermediate (CEFR B1-B2)', next: 'Advanced' },
    advanced: { pct: 95, label: 'Advanced (CEFR C1-C2)', next: 'Native Fluency' },
  }[difficulty || 'intermediate'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Your English Fluency Progress
                </h3>
                <span className="text-xs font-urdu text-indigo-600 dark:text-indigo-400 font-semibold">
                  آپ کی کارکردگی
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track conversations, words learned, grammar accuracy, and speaking time
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProgressModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Level Progress Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  Current Fluency Rank
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>{progress?.streak_days || 3} Day Streak</span>
                </span>
              </div>

              <h2 className="text-2xl font-black mb-1">{levelProgress.label}</h2>
              <p className="text-xs text-indigo-100 mb-4">
                You are making consistent daily progress toward {levelProgress.next}!
              </p>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1 text-indigo-200">
                  <span>Level Mastery</span>
                  <span>{levelProgress.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-1000"
                    style={{ width: `${levelProgress.pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {progress?.conversations_completed || 3}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Conversations
              </p>
              <p className="text-[10px] font-urdu text-slate-400">مکمل گفتگو</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {progress?.vocabulary_learned || 8}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Vocabulary Words
              </p>
              <p className="text-[10px] font-urdu text-slate-400">سیکھے گئے الفاظ</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {progress?.mistakes_corrected || 5}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Grammar Fixes
              </p>
              <p className="text-[10px] font-urdu text-slate-400">درست کی گئیں غلطیاں</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center mb-2">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {progress?.speaking_minutes || 14}m
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Speaking Time
              </p>
              <p className="text-[10px] font-urdu text-slate-400">بولنے کا وقت</p>
            </div>
          </div>

          {/* Common Grammar Mistakes & Improvement Focus */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Common Grammar Focus Areas • عام غلطیوں پر قابو پانا</span>
            </h4>
            <div className="space-y-2">
              {[
                {
                  rule: 'Present Simple vs Present Continuous',
                  example: 'Say "I go to university every day" instead of "I am go university"',
                  urdu: 'معمول کے کاموں کے لیے فعل کی پہلی فارم (Simple Present) استعمال کریں',
                  count: 4,
                },
                {
                  rule: 'Prepositions of Direction & Destination ("to")',
                  example: 'Say "I went to the store" instead of "I went store"',
                  urdu: 'منزل کی طرف جانے کے لیے لفظ "to" کا اضافہ ضروری ہے',
                  count: 3,
                },
                {
                  rule: 'Third-Person Singular (-s / -es)',
                  example: 'Say "He works hard" instead of "He work hard"',
                  urdu: 'واحد غائب (He/She/It) کے ساتھ فعل میں -s یا -es لگائیں',
                  count: 2,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.rule}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
                      {item.example}
                    </p>
                    <p className="text-xs font-urdu text-emerald-700 dark:text-emerald-400 mt-1">
                      {item.urdu}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-full shrink-0">
                    {item.count} Practiced
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={() => setIsProgressModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs"
          >
            Close Progress
          </button>
        </div>
      </div>
    </div>
  );
};
