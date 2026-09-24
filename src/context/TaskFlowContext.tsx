import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  Subtask,
  TaskAttachment,
  Project,
  Profile,
  NotificationItem,
  ActivityLog,
  TaskStatus,
  Priority,
  ThemeMode,
  ActiveTab,
} from '../types/taskflow';
import {
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  INITIAL_PROFILES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY,
} from '../lib/mockData';

interface TaskFlowContextType {
  // State
  tasks: Task[];
  projects: Project[];
  profiles: Profile[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  currentProfile: Profile;
  setCurrentProfile: (p: Profile) => void;
  isAuthenticated: boolean;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  activityLogs: ActivityLog[];
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isNotifModalOpen: boolean;
  setIsNotifModalOpen: (open: boolean) => void;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  mobileActiveStatus: TaskStatus;
  setMobileActiveStatus: (status: TaskStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: Priority | 'all';
  setPriorityFilter: (p: Priority | 'all') => void;
  assigneeFilter: string | 'all';
  setAssigneeFilter: (a: string | 'all') => void;

  // Actions
  moveTask: (taskId: string, targetStatus: TaskStatus, targetIndex?: number) => void;
  createTask: (data: {
    title: string;
    description: string;
    priority: Priority;
    status?: TaskStatus;
    due_date?: string | null;
    assignee_id?: string | null;
    subtasks?: string[];
  }) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addAttachment: (taskId: string, file: { name: string; size: number; type: string; url: string }) => void;
  deleteAttachment: (taskId: string, attachmentId: string) => void;
  addComment: (taskId: string, content: string) => void;
  createProject: (name: string, description: string, color: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  loginWithEmail: (email: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  triggerPushNotification: (title: string, message: string, taskId?: string) => void;
  resetToSampleData: () => void;
}

const TaskFlowContext = createContext<TaskFlowContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'taskflow_v2_';

export const TaskFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'theme') as ThemeMode;
    return saved || 'system';
  });

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'theme', mode);
  };

  // Profiles
  const [profiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'current_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_PROFILES[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_PREFIX + 'is_auth') === 'true';
  });

  // Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_PROJECTS;
  });
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_PREFIX + 'active_project') || INITIAL_PROJECTS[0].id;
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TASKS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'activity');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ACTIVITY;
  });

  // View UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('board');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [mobileActiveStatus, setMobileActiveStatus] = useState<TaskStatus>('todo');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');

  // Keep local storage in sync
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'active_project', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'activity', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'current_profile', JSON.stringify(currentProfile));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'is_auth', String(isAuthenticated));
  }, [currentProfile, isAuthenticated]);

  // Keep activeTask reference updated when tasks change
  useEffect(() => {
    if (activeTask) {
      const refreshed = tasks.find((t) => t.id === activeTask.id);
      if (refreshed) {
        setActiveTask(refreshed);
      }
    }
  }, [tasks]);

  const addActivity = useCallback((action: string, task?: Task) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      task_id: task?.id,
      task_title: task?.title,
      user_name: currentProfile.full_name,
      user_avatar: currentProfile.avatar_url,
      action,
      timestamp: 'Just now',
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  }, [currentProfile]);

  const triggerPushNotification = useCallback((title: string, message: string, taskId?: string) => {
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      user_id: currentProfile.id,
      title,
      message,
      type: 'status_change',
      task_id: taskId,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Try browser notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
  }, [currentProfile]);

  // Move task (Drag and Drop)
  const moveTask = useCallback((taskId: string, targetStatus: TaskStatus, targetIndex?: number) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;
      const task = prev[taskIndex];
      const prevStatus = task.status;

      if (prevStatus === targetStatus && targetIndex === undefined) return prev;

      const updatedTask: Task = {
        ...task,
        status: targetStatus,
        updated_at: new Date().toISOString(),
      };

      const rest = prev.filter((t) => t.id !== taskId);
      const targetColumnTasks = rest.filter((t) => t.status === targetStatus && t.project_id === task.project_id);
      const otherTasks = rest.filter((t) => !(t.status === targetStatus && t.project_id === task.project_id));

      let insertionIdx = targetIndex ?? targetColumnTasks.length;
      if (insertionIdx < 0) insertionIdx = 0;
      if (insertionIdx > targetColumnTasks.length) insertionIdx = targetColumnTasks.length;

      targetColumnTasks.splice(insertionIdx, 0, updatedTask);

      // Re-index positions
      const reindexed = targetColumnTasks.map((t, idx) => ({ ...t, position: idx }));

      const finalTasks = [...otherTasks, ...reindexed];

      // If moved to Done, trigger subtle confetti celebratory feedback
      if (targetStatus === 'done' && prevStatus !== 'done') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#10b981', '#38bdf8'],
        });
        triggerPushNotification('Task Completed! 🎉', `"${task.title}" has been moved to Done.`);
        addActivity(`completed task "${task.title}"`, updatedTask);
      } else if (prevStatus !== targetStatus) {
        const formattedStatus = targetStatus.replace('_', ' ');
        addActivity(`moved task "${task.title}" to ${formattedStatus}`, updatedTask);
      }

      return finalTasks;
    });
  }, [triggerPushNotification, addActivity]);

  // Create task
  const createTask = useCallback((data: {
    title: string;
    description: string;
    priority: Priority;
    status?: TaskStatus;
    due_date?: string | null;
    assignee_id?: string | null;
    subtasks?: string[];
  }) => {
    const assignee = profiles.find((p) => p.id === data.assignee_id);
    const taskId = 'task-' + Date.now();

    const subtasksList: Subtask[] = (data.subtasks || []).map((stTitle, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      task_id: taskId,
      title: stTitle,
      is_completed: false,
      position: idx,
      created_at: new Date().toISOString(),
    }));

    const newTask: Task = {
      id: taskId,
      project_id: activeProjectId,
      title: data.title.trim(),
      description: data.description.trim(),
      status: data.status || 'todo',
      priority: data.priority,
      due_date: data.due_date || null,
      assignee_id: data.assignee_id || null,
      assignee,
      created_by: currentProfile.id,
      position: 0,
      subtasks: subtasksList,
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    addActivity(`created task "${newTask.title}"`, newTask);
    triggerPushNotification('New Task Added', `"${newTask.title}" was created in ${projects.find((p) => p.id === activeProjectId)?.name || 'project'}.`, newTask.id);
  }, [activeProjectId, currentProfile, profiles, projects, addActivity, triggerPushNotification]);

  // Update task
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updated_at: new Date().toISOString() };
          if (updates.assignee_id) {
            updated.assignee = profiles.find((p) => p.id === updates.assignee_id);
          }
          return updated;
        }
        return t;
      })
    );
  }, [profiles]);

  // Delete task
  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (task) {
        addActivity(`deleted task "${task.title}"`);
      }
      return prev.filter((t) => t.id !== taskId);
    });
    if (activeTask?.id === taskId) {
      setActiveTask(null);
    }
  }, [activeTask, addActivity]);

  // Subtasks
  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      task_id: taskId,
      title: title.trim(),
      is_completed: false,
      position: 99,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), newSub] } : t))
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = (t.subtasks || []).map((st) =>
            st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
          );
          const toggled = updatedSubtasks.find((s) => s.id === subtaskId);
          if (toggled?.is_completed) {
            addActivity(`completed subtask "${toggled.title}" in "${t.title}"`, t);
          }
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  }, [addActivity]);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: (t.subtasks || []).filter((st) => st.id !== subtaskId) }
          : t
      )
    );
  }, []);

  // Attachments
  const addAttachment = useCallback((taskId: string, file: { name: string; size: number; type: string; url: string }) => {
    const newAtt: TaskAttachment = {
      id: `att-${Date.now()}`,
      task_id: taskId,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: file.url,
      uploaded_by: currentProfile.full_name,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, attachments: [...(t.attachments || []), newAtt] } : t
      )
    );
    addActivity(`attached file "${file.name}" to task`);
  }, [currentProfile, addActivity]);

  const deleteAttachment = useCallback((taskId: string, attachmentId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, attachments: (t.attachments || []).filter((a) => a.id !== attachmentId) }
          : t
      )
    );
  }, []);

  // Comments
  const addComment = useCallback((taskId: string, content: string) => {
    if (!content.trim()) return;
    const newComment = {
      id: `com-${Date.now()}`,
      task_id: taskId,
      user_id: currentProfile.id,
      user_name: currentProfile.full_name,
      user_avatar: currentProfile.avatar_url,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
      )
    );
  }, [currentProfile]);

  // Projects
  const createProject = useCallback((name: string, description: string, color: string) => {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      name: name.trim(),
      description: description.trim(),
      color: color || '#6366f1',
      icon: 'FolderKanban',
      owner_id: currentProfile.id,
      created_at: new Date().toISOString(),
      members_count: 1,
    };
    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    addActivity(`created new project "${newProj.name}"`);
  }, [currentProfile, addActivity]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  // Auth
  const loginWithEmail = useCallback((email: string) => {
    const namePart = email.split('@')[0] || 'User';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const profile: Profile = {
      id: 'user-' + Date.now(),
      email,
      full_name: formattedName,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      role: 'developer',
      created_at: new Date().toISOString(),
    };
    setCurrentProfile(profile);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    triggerPushNotification('Welcome to TaskFlow', `Logged in as ${email}`);
  }, [triggerPushNotification]);

  const loginWithGoogle = useCallback(() => {
    const profile: Profile = {
      id: 'user-google-1',
      email: 'alex.rivera@taskflow.dev',
      full_name: 'Alex Rivera (Google)',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'project_manager',
      created_at: new Date().toISOString(),
    };
    setCurrentProfile(profile);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    triggerPushNotification('Google Sign-In Successful', 'Authenticated via Google OAuth 2.0 with session tokens.');
  }, [triggerPushNotification]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    triggerPushNotification('Signed Out', 'You have been logged out of TaskFlow.');
  }, [triggerPushNotification]);

  const resetToSampleData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId(INITIAL_PROJECTS[0].id);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY);
  }, []);

  return (
    <TaskFlowContext.Provider
      value={{
        tasks,
        projects,
        profiles,
        activeProjectId,
        setActiveProjectId,
        currentProfile,
        setCurrentProfile,
        isAuthenticated,
        notifications,
        unreadNotificationsCount,
        activityLogs,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        activeTask,
        setActiveTask,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isNotifModalOpen,
        setIsNotifModalOpen,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        isMobileFrame,
        setIsMobileFrame,
        mobileActiveStatus,
        setMobileActiveStatus,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        assigneeFilter,
        setAssigneeFilter,
        moveTask,
        createTask,
        updateTask,
        deleteTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addAttachment,
        deleteAttachment,
        addComment,
        createProject,
        markNotificationRead,
        markAllNotificationsRead,
        loginWithEmail,
        loginWithGoogle,
        logout,
        triggerPushNotification,
        resetToSampleData,
      }}
    >
      {children}
    </TaskFlowContext.Provider>
  );
};

export const useTaskFlow = () => {
  const context = useContext(TaskFlowContext);
  if (!context) {
    throw new Error('useTaskFlow must be used within a TaskFlowProvider');
  }
  return context;
};
