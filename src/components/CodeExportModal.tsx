import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, FileCode, Smartphone } from 'lucide-react';
import { EXPO_APP_CODE, EXPO_SUPABASE_CLIENT_CODE, ZUSTAND_STORE_CODE } from '../lib/nativeCodeExport';

export const CodeExportModal: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'app' | 'supabase' | 'store'>('app');
  const [copied, setCopied] = useState<string | null>(null);

  const getCode = () => {
    switch (activeCodeTab) {
      case 'app':
        return { filename: 'App.tsx', code: EXPO_APP_CODE };
      case 'supabase':
        return { filename: 'lib/supabase.ts', code: EXPO_SUPABASE_CLIENT_CODE };
      case 'store':
        return { filename: 'store/useTaskStore.ts', code: ZUSTAND_STORE_CODE };
    }
  };

  const current = getCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(activeCodeTab);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                React Native (Expo) & Supabase Code Export
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modular, production-ready source code for Expo + NativeWind + Supabase + Zustand.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            {copied === activeCodeTab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied === activeCodeTab ? 'Copied File!' : `Copy ${current.filename}`}</span>
          </button>
        </div>

        {/* Quick Expo Setup CLI bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>npx expo install @supabase/supabase-js @react-native-async-storage/async-storage nativewind zustand lucide-react-native</span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveCodeTab('app')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeCodeTab === 'app'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>App.tsx (Mobile Dashboard)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('supabase')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeCodeTab === 'supabase'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>lib/supabase.ts (Client)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('store')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeCodeTab === 'store'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>store/useTaskStore.ts (Zustand)</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6">
          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[600px] custom-scrollbar leading-relaxed">
            {current.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
