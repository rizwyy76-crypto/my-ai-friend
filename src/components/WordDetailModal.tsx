import React from 'react';
import { X, Volume2, Bookmark, Check, Sparkles, Languages, BookOpen } from 'lucide-react';
import { useBuddy } from '../context/BuddyContext';

export const WordDetailModal: React.FC = () => {
  const {
    isWordModalOpen,
    setIsWordModalOpen,
    selectedWordData,
    isWordLoading,
    saveVocabularyWord,
    vocabulary,
    speakText,
  } = useBuddy();

  if (!isWordModalOpen) return null;

  const isAlreadySaved = vocabulary.some(
    (w) => w.word.toLowerCase() === selectedWordData?.word.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Word Explorer • لفظ کی تفصیل
            </h3>
          </div>

          <button
            onClick={() => setIsWordModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isWordLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Looking up word meanings...</p>
            </div>
          ) : selectedWordData ? (
            <>
              {/* Word Title & Pronunciation */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                    {selectedWordData.word}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      /{selectedWordData.pronunciation}/
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {selectedWordData.difficulty || 'intermediate'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => speakText(selectedWordData.word)}
                  className="w-10 h-10 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Urdu Translation */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-right">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-0.5">
                  اردو معنی (Urdu Meaning)
                </span>
                <p className="text-base font-urdu text-emerald-950 dark:text-emerald-100 font-semibold">
                  {selectedWordData.urduMeaning}
                </p>
              </div>

              {/* English Meaning */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  English Definition
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedWordData.englishMeaning}
                </p>
              </div>

              {/* Example Sentence */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Example Sentence
                  </span>
                  <button
                    onClick={() => speakText(selectedWordData.exampleSentence)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600"
                    title="Listen to example sentence"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                  "{selectedWordData.exampleSentence}"
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Action Button */}
        {selectedWordData && !isWordLoading && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
            <button
              onClick={() => setIsWordModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Close
            </button>

            <button
              onClick={() => {
                saveVocabularyWord(selectedWordData);
              }}
              disabled={isAlreadySaved}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isAlreadySaved
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-98'
              }`}
            >
              {isAlreadySaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved in Notebook</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save to Notebook</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
