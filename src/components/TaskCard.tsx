import React from 'react';
import {
  CheckSquare,
  Paperclip,
  Clock,
  AlertCircle,
  MoreVertical,
  Calendar,
  GripVertical,
} from 'lucide-react';
import { Task, Priority } from '../types/taskflow';
import { useTaskFlow } from '../context/TaskFlowContext';

interface TaskCardProps {
  task: Task;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const { setActiveTask, moveTask } = useTaskFlow();

  const completedSubtasks = task.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Due date formatting & urgency check
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0;

    const formatted = isToday
      ? 'Today'
      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return { text: formatted, isOverdue, isToday };
  };

  const dueInfo = formatDueDate(task.due_date);

  const priorityMeta: Record<Priority, { label: string; dotClass: string; textClass: string }> = {
    urgent: {
      label: 'Urgent',
      dotClass: 'bg-red-500',
      textClass: 'text-red-600 dark:text-red-400',
    },
    high: {
      label: 'High',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-600 dark:text-amber-400',
    },
    medium: {
      label: 'Medium',
      dotClass: 'bg-indigo-500',
      textClass: 'text-indigo-600 dark:text-indigo-400',
    },
    low: {
      label: 'Low',
      dotClass: 'bg-slate-400',
      textClass: 'text-slate-500 dark:text-slate-400',
    },
  };

  const pConfig = priorityMeta[task.priority] || priorityMeta.medium;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onClick={() => setActiveTask(task)}
      className="group relative bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all cursor-pointer select-none active:scale-[0.99]"
    >
      {/* Top Metadata Row (Zero-Pill discipline: unboxed text with typographic separators) */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 font-medium">
          <span className={`w-2 h-2 rounded-full ${pConfig.dotClass}`} />
          <span className={pConfig.textClass}>{pConfig.label}</span>
          {dueInfo && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span
                className={`flex items-center gap-1 ${
                  dueInfo.isOverdue
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : dueInfo.isToday
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{dueInfo.text}</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3.5 h-3.5 cursor-grab" />
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Description Snippet if available */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar (if task has subtasks) */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-indigo-500" />
              <span>
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            </span>
            <span>{subtaskPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                subtaskPercent === 100
                  ? 'bg-emerald-500'
                  : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
              style={{ width: `${subtaskPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Footer: Attachments & Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignee ? (
          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.full_name}`}>
            <img
              src={task.assignee.avatar_url}
              alt={task.assignee.full_name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[80px]">
              {task.assignee.full_name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
};
