export const POSTGRESQL_SCHEMA_SQL = `-- ==========================================================
-- TaskFlow: Production PostgreSQL & Supabase Database Schema
-- Multi-tenant, RLS-hardened, real-time subscription ready
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('admin', 'project_manager', 'developer', 'designer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT NOT NULL DEFAULT 'Folder',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Project Members (Many-to-Many with Roles)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE (project_id, user_id)
);

-- 5. Tasks Table (Kanban Items)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Sub-Tasks Table (Checklists)
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Task Attachments Table (Supabase Storage metadata)
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Notifications Table (Push & In-App Alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deadline', 'status_change', 'assignment', 'system')),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles; users can update only their own
CREATE POLICY "Public profiles are readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Projects: Users can view projects they are members of
CREATE POLICY "Members can view their projects"
ON public.projects FOR SELECT TO authenticated
USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid())
);

CREATE POLICY "Users can create projects"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Tasks: Project members can view and manage tasks
CREATE POLICY "Project members can read tasks"
ON public.tasks FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = tasks.project_id AND (
        projects.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = tasks.project_id AND user_id = auth.uid())
    ))
);

CREATE POLICY "Project members can mutate tasks"
ON public.tasks FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = tasks.project_id AND (
        projects.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = tasks.project_id AND user_id = auth.uid())
    ))
);

-- Notifications: Only target user can view and update their notifications
CREATE POLICY "Users manage their own notifications"
ON public.notifications FOR ALL TO authenticated
USING (user_id = auth.uid());

-- ==========================================================
-- AUTOMATIC TIMESTAMPS TRIGGER
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tasks_updated
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================
-- REALTIME SUBSCRIPTIONS ENABLING
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
`;

export interface TableRelation {
  table: string;
  column: string;
  foreignTable: string;
  foreignColumn: string;
  onDelete: string;
  purpose: string;
}

export const SCHEMA_RELATIONS: TableRelation[] = [
  { table: 'profiles', column: 'id', foreignTable: 'auth.users', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Syncs app profile data with Supabase Auth identities' },
  { table: 'projects', column: 'owner_id', foreignTable: 'profiles', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Designates the creator and owner of the workspace' },
  { table: 'project_members', column: 'project_id', foreignTable: 'projects', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Multi-tenant membership linkage for RBAC' },
  { table: 'project_members', column: 'user_id', foreignTable: 'profiles', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Identifies team member access tier' },
  { table: 'tasks', column: 'project_id', foreignTable: 'projects', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Scopes Kanban items inside a specific project board' },
  { table: 'tasks', column: 'assignee_id', foreignTable: 'profiles', foreignColumn: 'id', onDelete: 'SET NULL', purpose: 'Assigns task to a team member' },
  { table: 'tasks', column: 'created_by', foreignTable: 'profiles', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Tracks task author for activity and audit logs' },
  { table: 'subtasks', column: 'task_id', foreignTable: 'tasks', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Checklist items tied directly to parent task' },
  { table: 'task_attachments', column: 'task_id', foreignTable: 'tasks', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'File metadata stored in Supabase Storage' },
  { table: 'notifications', column: 'user_id', foreignTable: 'profiles', foreignColumn: 'id', onDelete: 'CASCADE', purpose: 'Direct push/in-app alert delivery to specific user' },
  { table: 'activity_logs', column: 'task_id', foreignTable: 'tasks', foreignColumn: 'id', onDelete: 'SET NULL', purpose: 'Immutable chronological audit feed of project events' },
];
