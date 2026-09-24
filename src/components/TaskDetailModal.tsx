import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Trash2,
  Paperclip,
  Plus,
  Send,
  User,
  AlertCircle,
  FileText,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { TaskStatus, Priority } from '../types/taskflow';

export const TaskDetailModal: React.FC = () => {
  const {
    activeTask,
    setActiveTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addAttachment,
    deleteAttachment,
    addComment,
    profiles,
  } = useTaskFlow();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState('');

  if (!activeTask) return null;

  const totalSubtasks = activeTask.subtasks?.length || 0;
  const completedSubtasks = activeTask.subtasks?.filter((s) => s.is_completed).length || 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(activeTask.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeUrl = URL.createObjectURL(file);
    addAttachment(activeTask.id, {
      name: file.name,
      size: file.size,
      type: file.type,
      url: fakeUrl,
    });
    // Reset file input
    e.target.value = '';
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(activeTask.id, newCommentText);
    setNewCommentText('');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Drag Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400">
              {activeTask.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Updated {new Date(activeTask.updated_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  deleteTask(activeTask.id);
                }
              }}
              title="Delete task"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTask(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Title Row */}
          <div>
            {isEditingTitle ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 text-lg font-bold text-slate-900 dark:text-white px-3 py-1.5 border border-indigo-500 rounded-lg bg-transparent focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (editedTitle.trim()) {
                      updateTask(activeTask.id, { title: editedTitle.trim() });
                    }
                    setIsEditingTitle(false);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h2
                onClick={() => {
                  setEditedTitle(activeTask.title);
                  setIsEditingTitle(true);
                }}
                className="text-xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 transition-colors"
                title="Click to edit title"
              >
                {activeTask.title}
              </h2>
            )}
          </div>

          {/* Properties Meta Grid: Status, Priority, Due Date, Assignee */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            {/* Status */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status</label>
              <select
                value={activeTask.status}
                onChange={(e) => updateTask(activeTask.id, { status: e.target.value as TaskStatus })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Priority</label>
              <select
                value={activeTask.priority}
                onChange={(e) => updateTask(activeTask.id, { priority: e.target.value as Priority })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={activeTask.due_date ? activeTask.due_date.substring(0, 10) : ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateTask(activeTask.id, { due_date: val });
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Assignee</label>
              <select
                value={activeTask.assignee_id || ''}
                onChange={(e) => updateTask(activeTask.id, { assignee_id: e.target.value || null })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Description
              </h3>
              {!isEditingDesc && (
                <button
                  onClick={() => {
                    setEditedDesc(activeTask.description || '');
                    setIsEditingDesc(true);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="space-y-2">
                <textarea
                  value={editedDesc}
                  onChange={(e) => setEditedDesc(e.target.value)}
                  rows={4}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-indigo-500 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  placeholder="Add details, acceptance criteria, context..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsEditingDesc(false)}
                    className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateTask(activeTask.id, { description: editedDesc.trim() });
                      setIsEditingDesc(false);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg"
                  >
                    Save Description
                  </button>
                </div>
              </div>
            ) : (
              <p
                onClick={() => {
                  setEditedDesc(activeTask.description || '');
                  setIsEditingDesc(true);
                }}
                className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 cursor-pointer min-h-[60px]"
              >
                {activeTask.description || <span className="text-slate-400 italic">No description provided. Click to add details.</span>}
              </p>
            )}
          </div>

          {/* Sub-tasks Checklist with Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Sub-tasks Checklist
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {completedSubtasks}/{totalSubtasks} ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Subtask list */}
            <div className="space-y-1.5 mb-3">
              {activeTask.subtasks?.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <button
                    onClick={() => toggleSubtask(activeTask.id, st.id)}
                    className="flex items-center gap-2.5 text-left flex-1"
                  >
                    {st.is_completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        st.is_completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>

                  <button
                    onClick={() => deleteSubtask(activeTask.id, st.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity"
                    title="Delete subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a new checklist step..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {/* File Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Attachments
                </h3>
              </div>

              {/* Upload Trigger */}
              <label className="cursor-pointer text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Attachments List */}
            {activeTask.attachments && activeTask.attachments.length > 0 ? (
              <div className="space-y-2">
                {activeTask.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          {att.file_name}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-slate-400">
                          {formatBytes(att.file_size)} · Uploaded by {att.uploaded_by}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {att.file_url && (
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteAttachment(activeTask.id, att.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400">No attachments yet. Drop files or click upload.</p>
              </div>
            )}
          </div>

          {/* Comments / Discussion */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              Activity & Comments
            </h3>

            {/* Comment Feed */}
            <div className="space-y-2.5 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
              {activeTask.comments && activeTask.comments.length > 0 ? (
                activeTask.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 text-xs">
                    <img
                      src={comment.user_avatar}
                      alt={comment.user_name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {comment.user_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No comments yet. Start a discussion.</p>
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center w-8 h-8"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
