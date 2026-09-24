import React from 'react';
import {
  MessageSquarePlus,
  Compass,
  BookOpen,
  TrendingUp,
  Settings,
  Trash2,
  X,
  Sparkles,
  Bot,
  User,
  Coffee,
  GraduationCap,
  Briefcase,
  Plane,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import { useBuddy } from '../context/BuddyContext';
import { ConversationMode, DifficultyLevel, ModeConfig } from '../types/buddy';

export const PRACTICE_MODES: ModeConfig[] = [
  {
    id: 'casual',
    label: 'Casual Friend',
    urduLabel: 'بے تکلف دوست',
    description: 'Relaxed chat about hobbies, life, movies, and food.',
    icon: 'HeartHandshake',
    samplePrompts: ['How was your weekend?', 'What movies do you recommend?', 'I love cooking pasta.'],
  },
  {
    id: 'teacher',
    label: 'English Teacher',
    urduLabel: 'انگلش استاد',
    description: 'Patient language mentor focusing on clear feedback and grammar.',
    icon: 'BookOpen',
    samplePrompts: ['Can you teach me how to use "have been"?', 'Please test my grammar with 3 questions.'],
  },
  {
    id: 'daily',
    label: 'Daily Conversation',
    urduLabel: 'روزمرہ بول چال',
    description: 'Order food, ask directions, weather chat, and market phrases.',
    icon: 'Coffee',
    samplePrompts: ['Can I order a medium latte with oat milk?', 'Excuse me, where is the nearest metro station?'],
  },
  {
    id: 'interview',
    label: 'Interview Practice',
    urduLabel: 'انٹرویو کی تیاری',
    description: 'Mock job interviews with professional feedback on your answers.',
    icon: 'Briefcase',
    samplePrompts: ['Ask me a behavioral interview question.', 'How should I describe my strengths and weaknesses?'],
  },
  {
    id: 'university',
    label: 'University Chat',
    urduLabel: 'یونیورسٹی کی باتیں',
    description: 'Talk about lectures, exams, campus life, and college assignments.',
    icon: 'GraduationCap',
    samplePrompts: ['I have a big presentation tomorrow.', 'Which elective courses are you taking?'],
  },
  {
    id: 'travel',
    label: 'Travel English',
    urduLabel: 'سفر کے دوران انگلش',
    description: 'Airport check-in, hotel bookings, asking locals, and foreign trips.',
    icon: 'Plane',
    samplePrompts: ['I would like to check into my hotel room.', 'Could you recommend a good local restaurant nearby?'],
  },
];

export const Sidebar: React.FC = () => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    deleteConversation,
    createConversation,
    mode,
    setMode,
    difficulty,
    setDifficulty,
    setIsVocabModalOpen,
    setIsProgressModalOpen,
    setIsSettingsModalOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    vocabulary,
    progress,
  } = useBuddy();

  const getModeIcon = (modeId: ConversationMode) => {
    switch (modeId) {
      case 'casual':
        return <HeartHandshake className="w-4 h-4 text-pink-500" />;
      case 'teacher':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'daily':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'interview':
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case 'university':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'travel':
        return <Plane className="w-4 h-4 text-cyan-500" />;
      default:
        return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  English Buddy
                </h1>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded-full uppercase">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Speaking Friend & Teacher
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-3">
          <button
            onClick={() => createConversation(mode, difficulty)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Scrollable Center Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-4 pb-4">
          {/* Difficulty Segmented Selector */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
              <span>English Level</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono capitalize">
                {difficulty}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((lvl) => {
                const isActive = difficulty === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`py-1 rounded-lg capitalize transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lvl === 'beginner' ? 'Basic' : lvl === 'intermediate' ? 'Medium' : 'Pro'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Practice Modes List */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between">
              <span>Practice Modes</span>
              <span className="text-[10px] text-slate-400 font-urdu">طریقہ گفتگو</span>
            </h3>
            <div className="space-y-1">
              {PRACTICE_MODES.map((pm) => {
                const isSelected = mode === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => {
                      setMode(pm.id);
                      if (activeConversation && activeConversation.mode !== pm.id) {
                        createConversation(pm.id, difficulty);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800/80 dark:text-indigo-300 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {getModeIcon(pm.id)}
                      <div className="truncate">
                        <p className="text-xs truncate">{pm.label}</p>
                        <p className="text-[10px] text-slate-400 truncate font-urdu opacity-90">
                          {pm.urduLabel}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation History */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
              Recent Chats
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 p-2 italic">No conversations yet.</p>
              ) : (
                conversations.map((conv) => {
                  const isActive = activeConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`group flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getModeIcon(conv.mode)}
                        <span className="text-xs truncate">{conv.title}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions Menu (Vocabulary, Progress, Settings) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setIsVocabModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Vocabulary Notebook</span>
            </div>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
              {vocabulary.length}
            </span>
          </button>

          <button
            onClick={() => setIsProgressModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Progress & Fluency</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {progress?.speaking_minutes || 0}m
            </span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Voice & App Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
