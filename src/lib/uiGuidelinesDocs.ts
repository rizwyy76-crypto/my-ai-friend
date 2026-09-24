export const UI_GUIDELINES = {
  title: 'TaskFlow Mobile UI/UX Design System & Layout Guidelines',
  stack: 'React Native (Expo) + NativeWind v4 / Tailwind CSS + Supabase',
  colorPalette: [
    {
      name: 'Canvas Neutral (60%)',
      hexLight: '#F8FAFC (slate-50)',
      hexDark: '#020617 (slate-950)',
      usage: 'Base app screen background, subtle contrast for cards and sheets.',
    },
    {
      name: 'Card Surface (30%)',
      hexLight: '#FFFFFF (white)',
      hexDark: '#0F172A (slate-900)',
      usage: 'Kanban cards, bottom sheets, modal dialogs, segmented buttons with hairline border.',
    },
    {
      name: 'Hairline Divider / Border',
      hexLight: '#E2E8F0 (slate-200)',
      hexDark: '#1E293B (slate-800)',
      usage: '1px border to demarcate cards, column dividers, and list separators without visual noise.',
    },
    {
      name: 'Primary Brand Accent (10%)',
      hexLight: '#4F46E5 (indigo-600)',
      hexDark: '#6366F1 (indigo-500)',
      usage: 'Interactive buttons, active tab indicators, primary checkboxes, focused borders.',
    },
    {
      name: 'Status: Urgent / High',
      hexLight: '#EF4444 (red-500)',
      hexDark: '#F87171 (red-400)',
      usage: 'Overdue badges, urgent priority dots, destructive delete confirmations.',
    },
    {
      name: 'Status: In Progress / Review',
      hexLight: '#F59E0B (amber-500)',
      hexDark: '#FBBF24 (amber-400)',
      usage: 'Work in progress status markers, upcoming deadline warnings within 24h.',
    },
    {
      name: 'Status: Completed / Done',
      hexLight: '#10B981 (emerald-500)',
      hexDark: '#34D399 (emerald-400)',
      usage: 'Completed checkmarks, finished column indicators, success notifications.',
    },
  ],
  typography: [
    {
      role: 'Display & Headlines',
      family: 'Plus Jakarta Sans (SemiBold 600 / Bold 700)',
      sizes: 'Screen Title (22-26px), Section Header (16-18px)',
      lineHeight: '1.2 - 1.3',
    },
    {
      role: 'Body & Task Descriptions',
      family: 'Plus Jakarta Sans (Regular 400 / Medium 500)',
      sizes: 'Task Titles (15-16px), Description Body (14px)',
      lineHeight: '1.5 - 1.6',
    },
    {
      role: 'Metadata & Badges',
      family: 'Plus Jakarta Sans (Medium 500)',
      sizes: 'Date, Subtask count, Assignee role (12-13px)',
      lineHeight: '1.4',
    },
    {
      role: 'Tabular Numerals & Codes',
      family: 'JetBrains Mono / monospace',
      sizes: 'Progress ratio (e.g., 3/5), timestamps, file sizes (12px tabular-nums)',
      lineHeight: '1.2',
    },
  ],
  ergonomics: [
    {
      principle: 'Thumb-Zone Navigation',
      spec: 'Fixed bottom tab bar (h-16 pb-safe) houses primary views (Board, Projects, Activity, Docs). Primary "Add Task" FAB sits in bottom-right natural thumb reach.',
    },
    {
      principle: 'Minimum 44px Touch Targets',
      spec: 'All interactive elements (checkboxes, drag handles, modal triggers, back buttons) enforce min-h-[44px] min-w-[44px] with optical centering to prevent accidental taps.',
    },
    {
      principle: '15% Mobile Sticky Cap',
      spec: 'Top header bar + bottom tabs aggregate height does not exceed 15% of the viewport, preserving 85%+ screen height for content.',
    },
    {
      principle: 'Bottom Sheet Task Details',
      spec: 'Instead of full-page navigation, task editing opens in a gesture-dismissible bottom drawer (rounded-t-3xl) with smooth spring transitions.',
    },
    {
      principle: 'Zero-Pill Anti-Slop Discipline',
      spec: 'Task metadata (dates, priority, subtask counts) is formatted as clean unboxed inline text with typographic separators (·) rather than neon candy pill capsules.',
    },
  ],
  componentHierarchy: [
    'Root Screen Layout (SafeAreaView with background color token)',
    '├── Top App Bar (Project Switcher, Search trigger, Notifications Bell with unread badge)',
    '├── Board Filter Bar (Horizontal scrollable priority/assignee chips)',
    '├── Kanban Columns (Horizontal carousel with snap scrolling or multi-column grid)',
    '│    └── Column Container (Header with status dot, task count badge, quick "+")',
    '│         └── Task Card (Title, description excerpt, subtask progress bar, due date, assignee avatar)',
    '├── Floating Action Button (Quick New Task)',
    '├── Bottom Navigation Tab Bar (Board, Projects, Activity, Architecture, Profile)',
    '└── Overlay Drawers (Task Detail Sheet, Notifications Modal, Auth Modal, Supabase Config)',
  ],
};
