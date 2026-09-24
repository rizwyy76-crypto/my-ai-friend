import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { Task, TaskStatus, Priority } from '../types/taskflow';
import { TaskCard } from './TaskCard';

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    projects,
    activeProjectId,
    setActiveProjectId,
    profiles,
    moveTask,
    setIsCreateModalOpen,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    isMobileFrame,
    mobileActiveStatus,
    setMobileActiveStatus,
  } = useTaskFlow();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Column definitions
  const columns: { id: TaskStatus; label: string; dotClass: string }[] = [
    { id: 'todo', label: 'To Do', dotClass: 'bg-slate-400' },
    { id: 'in_progress', label: 'In Progress', dotClass: 'bg-amber-500' },
    { id: 'review', label: 'In Review', dotClass: 'bg-indigo-500' },
    { id: 'done', label: 'Done', dotClass: 'bg-emerald-500' },
  ];

  // Filter tasks
  const projectTasks = tasks.filter((task) => {
    // Project matching
    if (task.project_id !== activeProjectId) return false;

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = task.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc) return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    // Assignee filter
    if (assigneeFilter !== 'all' && task.assignee_id !== assigneeFilter) {
      return false;
    }

    return true;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if leaving the main column bounds
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      moveTask(taskId, status);
    }
  };

  // Quick stats
  const totalTasksCount = projectTasks.length;
  const inProgressCount = projectTasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = projectTasks.filter((t) => t.status === 'done').length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      {/* Project Banner & Stats Bar */}
      <div className="px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* Project selector dropdown */}
              <div className="relative inline-block">
                <select
                  value={activeProjectId}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="appearance-none text-base sm:text-lg font-bold text-slate-900 dark:text-white bg-transparent pr-7 cursor-pointer hover:text-indigo-600 focus:outline-none"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="text-slate-900 dark:bg-slate-900 dark:text-white">
                      {proj.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▼
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              {activeProject?.description}
            </p>
          </div>

          {/* Quick Metrics & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="py-1.5 px-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Assignees</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-Frame Specific Status Tabs */}
      {isMobileFrame && (
        <div className="flex items-center justify-around px-2 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          {columns.map((col) => {
            const count = projectTasks.filter((t) => t.status === col.id).length;
            const isActive = mobileActiveStatus === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setMobileActiveStatus(col.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${col.dotClass}`} />
                <span>{col.label}</span>
                <span className="text-[11px] font-mono opacity-80 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Kanban Columns Grid / Container */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-auto custom-scrollbar">
        <div
          className={`grid gap-4 h-full min-h-[500px] ${
            isMobileFrame
              ? 'grid-cols-1 max-w-md mx-auto'
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto'
          }`}
        >
          {columns
            .filter((col) => !isMobileFrame || col.id === mobileActiveStatus)
            .map((column) => {
              const columnTasks = projectTasks
                .filter((t) => t.status === column.id)
                .sort((a, b) => a.position - b.position);

              const isDropTarget = dragOverColumn === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl p-3 border transition-colors ${
                    isDropTarget
                      ? 'border-indigo-500 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                      : 'border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${column.dotClass}`} />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {column.label}
                      </h3>
                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title={`Add task to ${column.label}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-0.5">
                    {columnTasks.length === 0 ? (
                      <div
                        className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 transition-colors ${
                          isDropTarget
                            ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="text-xs font-medium">
                          {isDropTarget ? 'Release to drop task' : 'No tasks in this stage'}
                        </p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          + Create first
                        </button>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onDragStart={handleDragStart}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
