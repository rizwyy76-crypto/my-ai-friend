export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: 'admin' | 'project_manager' | 'developer' | 'designer';
  created_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  assignee_id: string | null;
  assignee?: Profile;
  created_by: string;
  position: number;
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  comments?: TaskComment[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  owner_id: string;
  created_at: string;
  members_count: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'deadline' | 'status_change' | 'assignment' | 'system';
  task_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  task_id?: string;
  task_title?: string;
  user_name: string;
  user_avatar: string;
  action: string;
  timestamp: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ActiveTab = 'board' | 'projects' | 'analytics' | 'activity' | 'schema' | 'guidelines' | 'export';
