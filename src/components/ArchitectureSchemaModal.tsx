import React, { useState } from 'react';
import { Database, Copy, Check, Table, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { POSTGRESQL_SCHEMA_SQL, SCHEMA_RELATIONS } from '../lib/schemaDocs';

export const ArchitectureSchemaModal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSubtab, setActiveSubtab] = useState<'sql' | 'relations' | 'rls'>('relations');

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRESQL_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                System Architecture & PostgreSQL Database Schema
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supabase multi-tenant schema with Foreign Keys, Row Level Security (RLS), and Realtime Subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveSubtab('relations')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeSubtab === 'relations'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Relations & Foreign Keys ({SCHEMA_RELATIONS.length})
          </button>
          <button
            onClick={() => setActiveSubtab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeSubtab === 'sql'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Full DDL Script (SQL)
          </button>
          <button
            onClick={() => setActiveSubtab('rls')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeSubtab === 'rls'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Security & RLS Policies
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeSubtab === 'relations' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono">
                    <th className="py-2.5 px-3">Source Table</th>
                    <th className="py-2.5 px-3">Foreign Key</th>
                    <th className="py-2.5 px-3">References</th>
                    <th className="py-2.5 px-3">On Delete</th>
                    <th className="py-2.5 px-3">Architectural Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {SCHEMA_RELATIONS.map((rel, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                        {rel.table}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {rel.column}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {rel.foreignTable}({rel.foreignColumn})
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                          {rel.onDelete}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {rel.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSubtab === 'sql' && (
            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[600px] custom-scrollbar leading-relaxed">
                {POSTGRESQL_SCHEMA_SQL}
              </pre>
            </div>
          )}

          {activeSubtab === 'rls' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Row Level Security (RLS) Multi-Tenant Guarantee</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every table has RLS enabled (<code className="text-indigo-500">ALTER TABLE ... ENABLE ROW LEVEL SECURITY</code>). Users can only read and mutate tasks, attachments, and subtasks within projects where they are registered as members in <code className="text-indigo-500">project_members</code> or as the project owner.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Project Isolation Rule
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed font-mono bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg">
                    USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid()))
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Realtime WebSocket Subscriptions
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Subscribed via Supabase Realtime channel <code className="text-indigo-500">supabase_realtime</code>. When any collaborator drags a task or checks off a subtask, all connected Expo clients update without polling.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
