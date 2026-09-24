import React, { useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  Volume2,
  CheckCircle,
  Plus,
  Trash2,
  RotateCw,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useBuddy } from '../context/BuddyContext';
import { DifficultyLevel, VocabularyWord } from '../types/buddy';

export const VocabularyModal: React.FC = () => {
  const {
    isVocabModalOpen,
    setIsVocabModalOpen,
    vocabulary,
    toggleMastered,
    deleteVocabularyWord,
    lookupWord,
    speakText,
  } = useBuddy();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'flashcard'>('grid');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [customWordInput, setCustomWordInput] = useState('');

  if (!isVocabModalOpen) return null;

  const filteredWords = vocabulary.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.urduMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.englishMeaning.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiff = filterDifficulty === 'all' || w.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  const handleAddCustomWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWordInput.trim()) return;
    const word = customWordInput.trim();
    setCustomWordInput('');
    await lookupWord(word);
  };

  const currentFlashcard = filteredWords[flashcardIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Vocabulary Notebook
                </h3>
                <span className="text-xs font-urdu text-emerald-700 dark:text-emerald-300 font-semibold">
                  الفاظ کا ذخیرہ
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  {vocabulary.length} Words
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review words, listen to pronunciation, and practice with flashcards
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVocabModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Quick Add + Flashcard Toggle */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search words in English or Urdu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Quick Look Up / Add Word Form */}
          <form onSubmit={handleAddCustomWord} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Look up word..."
              value={customWordInput}
              onChange={(e) => setCustomWordInput(e.target.value)}
              className="w-32 sm:w-40 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lookup</span>
            </button>
          </form>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              List
            </button>
            <button
              onClick={() => {
                setViewMode('flashcard');
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'flashcard'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              Flashcards
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {filteredWords.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No vocabulary words found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Chat with English Buddy or lookup a word above to build your notebook!
              </p>
            </div>
          ) : viewMode === 'flashcard' ? (
            /* Flashcard Practice Mode */
            <div className="max-w-md mx-auto py-6 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-400">
                <span>
                  Card {flashcardIndex + 1} of {filteredWords.length}
                </span>
                <span>Click card to flip</span>
              </div>

              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[260px] p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all hover:scale-[1.01]"
              >
                {!isFlipped ? (
                  /* Front: English */
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      English Word
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize">
                      {currentFlashcard.word}
                    </h2>
                    <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
                      /{currentFlashcard.pronunciation}/
                    </p>
                    <p className="text-xs text-slate-400 pt-3">
                      Tap anywhere to reveal Urdu meaning & example
                    </p>
                  </div>
                ) : (
                  /* Back: Urdu & Example */
                  <div className="space-y-3 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      Urdu Meaning & Example
                    </span>
                    <p className="text-2xl font-urdu font-bold text-emerald-800 dark:text-emerald-300">
                      {currentFlashcard.urduMeaning}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {currentFlashcard.englishMeaning}
                    </p>
                    <p className="text-xs italic text-slate-500 dark:text-slate-400 pt-1">
                      "{currentFlashcard.exampleSentence}"
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : filteredWords.length - 1));
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Previous
                </button>

                <button
                  onClick={() => speakText(currentFlashcard.word)}
                  className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) => (prev < filteredWords.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Next Card
                </button>
              </div>
            </div>
          ) : (
            /* Grid / List Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWords.map((vocab) => (
                <div
                  key={vocab.id || vocab.word}
                  className={`p-4 rounded-2xl border transition-all ${
                    vocab.mastered
                      ? 'bg-emerald-50/40 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                          {vocab.word}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">
                          /{vocab.pronunciation}/
                        </span>
                      </div>
                      <p className="text-sm font-urdu font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {vocab.urduMeaning}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speakText(vocab.word)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => vocab.id && toggleMastered(vocab.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          vocab.mastered
                            ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950'
                            : 'text-slate-400 hover:text-emerald-600'
                        }`}
                        title={vocab.mastered ? 'Mastered!' : 'Mark as mastered'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      {vocab.id && (
                        <button
                          onClick={() => deleteVocabularyWord(vocab.id!)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete word"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {vocab.englishMeaning}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="italic line-clamp-1">"{vocab.exampleSentence}"</span>
                    <span className="capitalize px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">
                      {vocab.difficulty || 'intermediate'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
          <span>Click any word in chat to automatically add to this notebook</span>
          <button
            onClick={() => setIsVocabModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
