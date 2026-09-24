import React from 'react';
import {
  Bell,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  Database,
  User,
  Plus,
  Layers,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { ActiveTab } from '../types/taskflow';
import { getSavedSupabaseConfig } from '../lib/supabaseClient';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    unreadNotificationsCount,
    setIsNotifModalOpen,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setIsSupabaseModalOpen,
    isMobileFrame,
    setIsMobileFrame,
    currentProfile,
    isAuthenticated,
    logout,
  } = useTaskFlow();

  const supabaseConfig = getSavedSupabaseConfig();

  const navTabs: { id: ActiveTab; label: string }[] = [
    { id: 'board', label: 'Board' },
    { id: 'projects', label: 'Projects' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'activity', label: 'Activity' },
    { id: 'schema', label: 'Architecture & SQL' },
    { id: 'guidelines', label: 'UI Guidelines' },
    { id: 'export', label: 'Expo Code' },
  ];

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('board')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              TF
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                TaskFlow
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, 4-6 clean links) */}
        <nav className="hidden md:flex items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Mobile Simulator Frame Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? 'Switch to Full Desktop View' : 'Preview in Mobile Device Frame (Expo/iOS)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isMobileFrame
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {isMobileFrame ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMobileFrame ? 'Mobile Frame' : 'Desktop View'}</span>
          </button>

          {/* Supabase Status / Config Button */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            title="Supabase Database Connection"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden lg:inline">
              {supabaseConfig.isConfigured ? 'Supabase Live' : 'Supabase Local'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification Center Trigger */}
          <button
            onClick={() => setIsNotifModalOpen(true)}
            aria-label="Open notifications"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Quick Add Task Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-medium rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          {/* Profile / Auth Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            title="Account & Session"
          >
            <img
              src={currentProfile.avatar_url}
              alt={currentProfile.full_name}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <span className="hidden xl:inline text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
              {currentProfile.full_name}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile-only secondary tab strip when viewport is narrow and desktop mode is active */}
      {!isMobileFrame && (
        <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
