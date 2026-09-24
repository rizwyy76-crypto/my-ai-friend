import React from 'react';
import { BuddyProvider } from './context/BuddyContext';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { UrduModal } from './components/UrduModal';
import { WordDetailModal } from './components/WordDetailModal';
import { VocabularyModal } from './components/VocabularyModal';
import { ProgressModal } from './components/ProgressModal';
import { SettingsModal } from './components/SettingsModal';

const MainLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full lg:pl-72 overflow-hidden">
        <ChatArea />
      </div>

      {/* Modals & Dialogs */}
      <UrduModal />
      <WordDetailModal />
      <VocabularyModal />
      <ProgressModal />
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <BuddyProvider>
      <MainLayout />
    </BuddyProvider>
  );
}
