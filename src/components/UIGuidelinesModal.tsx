import React from 'react';
import { Palette, Type, Smartphone, Layers, CheckCircle } from 'lucide-react';
import { UI_GUIDELINES } from '../lib/uiGuidelinesDocs';

export const UIGuidelinesModal: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {UI_GUIDELINES.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stack: {UI_GUIDELINES.stack} · Anti-AI slop discipline, zero-pill metadata, and thumb-zone touch ergonomics.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Color System & 60-30-10 Budget */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Color System & 60-30-10 Distribution</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {UI_GUIDELINES.colorPalette.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {item.name}
                  </p>
                  <div className="text-[11px] font-mono space-y-0.5 text-slate-500 dark:text-slate-400 mb-2">
                    <p>Light: {item.hexLight}</p>
                    <p>Dark: {item.hexDark}</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.usage}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Typography Scale */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-600" />
              <span>Typography & Tabular Numerals</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Font Family & Weight</th>
                    <th className="py-2.5 px-3">Size Range</th>
                    <th className="py-2.5 px-3">Line Height</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {UI_GUIDELINES.typography.map((typo, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {typo.role}
                      </td>
                      <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400">
                        {typo.family}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {typo.sizes}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {typo.lineHeight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Mobile Touch Ergonomics */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Mobile Touch Ergonomics & Thumb Zones</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UI_GUIDELINES.ergonomics.map((ergo, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {ergo.principle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ergo.spec}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Component Structure Tree */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Component Hierarchy Tree</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1">
              {UI_GUIDELINES.componentHierarchy.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
