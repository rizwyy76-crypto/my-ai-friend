import React from 'react';
import {
  Wifi,
  Battery,
  Layers,
  FolderKanban,
  TrendingUp,
  History,
  Database,
  User,
  Plus,
  ArrowLeft,
  X,
  Smartphone,
} from 'lucide-react';
import { useTaskFlow } from '../context/TaskFlowContext';
import { ActiveTab } from '../types/taskflow';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    unreadNotificationsCount,
    setIsNotifModalOpen,
    setIsMobileFrame,
  } = useTaskFlow();

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'board', label: 'Board', icon: Layers },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: History },
    { id: 'schema', label: 'Schema', icon: Database },
  ];

  return (
    <div className="py-6 px-2 sm:px-4 flex flex-col items-center justify-center min-h-screen bg-slate-200/70 dark:bg-slate-950 transition-colors">
      {/* Frame Top Bar Info for Developer */}
      <div className="flex items-center justify-between w-full max-w-[420px] mb-3 px-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-4 h-4 text-indigo-600" />
          <span>React Native (Expo) Frame Preview</span>
        </div>
        <button
          onClick={() => setIsMobileFrame(false)}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          Exit to Desktop View →
        </button>
      </div>

      {/* iPhone Outer Device Body */}
      <div className="relative w-full max-w-[410px] h-[830px] max-h-[92vh] bg-slate-900 dark:bg-black rounded-[46px] p-3 shadow-2xl border-4 border-slate-700/60 dark:border-slate-800 flex flex-col overflow-hidden ring-1 ring-black/20">
        {/* Device Speaker & Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center">
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          </div>
        </div>

        {/* Screen Container with iOS corner radius */}
        <div className="relative flex-1 w-full bg-slate-50 dark:bg-slate-950 rounded-[36px] overflow-hidden flex flex-col">
          {/* iOS Status Bar */}
          <div className="h-10 px-6 pt-1 flex items-center justify-between text-[12px] font-semibold text-slate-900 dark:text-white z-30 shrink-0 select-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Inner Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col pb-20">
            {children}
          </div>

          {/* Floating Action Button (Thumb Zone: Bottom Right) */}
          {activeTab === 'board' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="absolute bottom-20 right-5 z-30 w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform"
              title="Add Task"
              aria-label="Add Task"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

          {/* Fixed Bottom Tab Navigation Bar (Pattern 1 from Mobile Guidelines) */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 px-3 flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[10px] font-medium tracking-tight mt-1">
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* Profile Tab */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <User className="w-5 h-5 stroke-[1.75]" />
              <span className="text-[10px] font-medium tracking-tight mt-1">Profile</span>
            </button>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full z-40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
