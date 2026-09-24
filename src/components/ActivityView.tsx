import React from 'react';
import { History, Clock, ArrowRight, User } from 'lucide-react';
import { useTaskFlow } from '../context/TaskFlowContext';

export const ActivityView: React.FC = () => {
  const { activityLogs, tasks, setActiveTask } = useTaskFlow();

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Project Activity & Audit Log
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time chronological events recorded across projects, tasks, and team interactions.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  src={log.user_avatar}
                  alt={log.user_name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-slate-900 dark:text-white">{log.user_name}</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{log.action}</span>
                  </p>
                  {log.task_title && (
                    <button
                      onClick={() => {
                        if (log.task_id) {
                          const t = tasks.find((item) => item.id === log.task_id);
                          if (t) setActiveTask(t);
                        }
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mt-0.5 block text-left"
                    >
                      {log.task_title}
                    </button>
                  )}
                  <span className="text-[11px] font-mono tabular-nums text-slate-400 mt-1 block">
                    {log.timestamp}
                  </span>
                </div>
              </div>

              {log.task_id && (
                <button
                  onClick={() => {
                    const t = tasks.find((item) => item.id === log.task_id);
                    if (t) setActiveTask(t);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors shrink-0"
                  title="View Task Details"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
