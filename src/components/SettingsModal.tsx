import React from 'react';
import { X, Settings, Volume2, Globe, Sliders, ShieldCheck, HelpCircle, Bot } from 'lucide-react';
import { useBuddy } from '../context/BuddyContext';
import { DifficultyLevel, ConversationMode } from '../types/buddy';
import { PRACTICE_MODES } from './Sidebar';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    updateSettings,
    difficulty,
    setDifficulty,
    mode,
    setMode,
    speakText,
    isTtsSupported,
  } = useBuddy();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Settings & Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your voice, language level, and tutor behavior
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>English Speaking Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'beginner', label: 'Beginner', desc: 'Simple words & short sentences' },
                { id: 'intermediate', label: 'Intermediate', desc: 'Everyday idioms & natural flow' },
                { id: 'advanced', label: 'Advanced', desc: 'Complex topics & rich vocabulary' },
              ].map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setDifficulty(lvl.id as DifficultyLevel)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold">{lvl.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Speech Settings */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice & Pronunciation Settings</span>
            </label>

            {/* Auto speak toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Auto-Read AI Replies Aloud
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hear the AI's natural pronunciation whenever it replies
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.auto_speak}
                onChange={(e) => updateSettings({ auto_speak: e.target.checked })}
                className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Speech speed slider */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Speaking Speed</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {settings.voice_speed || 1.0}x{' '}
                  {settings.voice_speed < 1 ? '(Slower for learners)' : settings.voice_speed === 1 ? '(Normal)' : '(Fast)'}
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={settings.voice_speed || 1.0}
                onChange={(e) => updateSettings({ voice_speed: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.75x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>1.25x (Fast)</span>
              </div>
            </div>

            {/* Test Voice button */}
            {isTtsSupported && (
              <button
                type="button"
                onClick={() =>
                  speakText(
                    "Hello! This is English Buddy speaking. I'm excited to practice English with you today!"
                  )
                }
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>Test Voice Pronunciation</span>
              </button>
            )}
          </div>

          {/* Urdu Language Support Info */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Urdu Language Assistance
              </h4>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-urdu">
              کسی بھی جملے یا لفظ کو اردو میں سمجھنے کے لیے "اردو میں سمجھیں" بٹن دبائیں تاکہ آپ کو مکمل وضاحت اور مثالیں مل سکیں۔
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
