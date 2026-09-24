import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DifficultyLevel,
  ConversationMode,
  ChatMessage,
  Conversation,
  UserProgress,
  UserSettings,
  VocabularyWord,
  Correction,
} from '../types/buddy';

interface UrduExplanationResult {
  simpleTranslation: string;
  urduExplanation: string;
  keyPoints: string[];
  usageTip: string;
  sourceText: string;
}

interface BuddyContextType {
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSendingVoice: boolean;

  // Configuration
  difficulty: DifficultyLevel;
  mode: ConversationMode;
  settings: UserSettings;
  progress: UserProgress | null;
  vocabulary: VocabularyWord[];

  // Navigation & Modals
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isUrduModalOpen: boolean;
  setIsUrduModalOpen: (open: boolean) => void;
  urduData: UrduExplanationResult | null;
  isUrduLoading: boolean;

  isWordModalOpen: boolean;
  setIsWordModalOpen: (open: boolean) => void;
  selectedWordData: VocabularyWord | null;
  isWordLoading: boolean;

  isVocabModalOpen: boolean;
  setIsVocabModalOpen: (open: boolean) => void;

  isProgressModalOpen: boolean;
  setIsProgressModalOpen: (open: boolean) => void;

  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  // Voice Interaction
  isListening: boolean;
  voiceTranscript: string;
  isSpeechSupported: boolean;
  isTtsSupported: boolean;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;

  // Actions
  sendMessage: (text: string, voiceDurationSeconds?: number) => Promise<void>;
  createConversation: (newMode?: ConversationMode, newDiff?: DifficultyLevel) => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  explainInUrdu: (text: string, context?: string) => Promise<void>;
  lookupWord: (word: string) => Promise<void>;
  saveVocabularyWord: (word: VocabularyWord) => Promise<void>;
  toggleMastered: (id: string) => Promise<void>;
  deleteVocabularyWord: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  setDifficulty: (diff: DifficultyLevel) => Promise<void>;
  setMode: (mode: ConversationMode) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const BuddyContext = createContext<BuddyContextType | undefined>(undefined);

export const BuddyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingVoice, setIsSendingVoice] = useState<boolean>(false);

  const [difficulty, setDifficultyState] = useState<DifficultyLevel>('intermediate');
  const [mode, setModeState] = useState<ConversationMode>('casual');

  const [settings, setSettings] = useState<UserSettings>({
    difficulty: 'intermediate',
    mode: 'casual',
    voice_enabled: true,
    voice_speed: 1.0,
    auto_speak: true,
    theme: 'system',
  });

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);

  // Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUrduModalOpen, setIsUrduModalOpen] = useState(false);
  const [urduData, setUrduData] = useState<UrduExplanationResult | null>(null);
  const [isUrduLoading, setIsUrduLoading] = useState(false);

  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState<VocabularyWord | null>(null);
  const [isWordLoading, setIsWordLoading] = useState(false);

  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Speech Recognition & TTS
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const voiceStartTimeRef = useRef<number>(0);

  const isSpeechSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const isTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          voiceStartTimeRef.current = Date.now();
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setVoiceTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-To-Speech function
  const speakText = useCallback(
    (text: string) => {
      if (!isTtsSupported) return;
      window.speechSynthesis.cancel();

      // Clean text of emojis or special markdown if any
      const clean = text.replace(/[*_~`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = settings.voice_speed || 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isTtsSupported, settings.voice_speed]
  );

  const stopSpeaking = useCallback(() => {
    if (isTtsSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isTtsSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setVoiceTranscript('');
    stopSpeaking();
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Could not start recognition:', err);
    }
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Could not stop recognition:', err);
    }
  }, []);

  // Load initial settings, progress, vocabulary, conversations
  const loadInitialData = useCallback(async () => {
    try {
      // 1. Settings
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData);
        setDifficultyState(setData.difficulty || 'intermediate');
        setModeState(setData.mode || 'casual');
      }

      // 2. Progress
      const progRes = await fetch('/api/progress');
      if (progRes.ok) {
        const progData = await progRes.json();
        setProgress(progData);
      }

      // 3. Vocabulary
      const vocabRes = await fetch('/api/vocabulary');
      if (vocabRes.ok) {
        const vocabData = await vocabRes.json();
        setVocabulary(vocabData);
      }

      // 4. Conversations
      const convRes = await fetch('/api/conversations');
      if (convRes.ok) {
        const convList: Conversation[] = await convRes.json();
        setConversations(convList);
        if (convList.length > 0) {
          await loadConversationDetails(convList[0].id);
        } else {
          await createConversation();
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadConversationDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConversation(data.conversation);
        setMessages(data.messages || []);
        if (data.conversation?.difficulty) {
          setDifficultyState(data.conversation.difficulty);
        }
        if (data.conversation?.mode) {
          setModeState(data.conversation.mode);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversation details:', err);
    }
  };

  const selectConversation = async (id: string) => {
    setIsLoading(true);
    await loadConversationDetails(id);
    setIsLoading(false);
    setIsSidebarOpen(false);
  };

  const createConversation = async (newMode?: ConversationMode, newDiff?: DifficultyLevel) => {
    setIsLoading(true);
    try {
      const m = newMode || mode;
      const d = newDiff || difficulty;
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: m, difficulty: d }),
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation(newConv);
        setMessages([newConv.initialMessage]);
        setModeState(m);
        setDifficultyState(d);

        // Auto speak welcome greeting if enabled
        if (settings.auto_speak && newConv.initialMessage?.content) {
          speakText(newConv.initialMessage.content);
        }
      }
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    } finally {
      setIsLoading(false);
      setIsSidebarOpen(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const filtered = conversations.filter((c) => c.id !== id);
        setConversations(filtered);
        if (activeConversation?.id === id) {
          if (filtered.length > 0) {
            await selectConversation(filtered[0].id);
          } else {
            await createConversation();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const sendMessage = async (text: string, voiceDurationSeconds?: number) => {
    if (!text.trim() || !activeConversation) return;

    const userText = text.trim();
    const tempId = `temp_user_${Date.now()}`;
    const optimisticUserMsg: ChatMessage = {
      id: tempId,
      conversation_id: activeConversation.id,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          message: userText,
          speakingMinutes: voiceDurationSeconds ? parseFloat((voiceDurationSeconds / 60).toFixed(2)) : 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.userMessage : m)).concat(data.assistantMessage)
        );

        // Auto read response aloud if enabled
        if (settings.auto_speak && data.assistantMessage?.content) {
          speakText(data.assistantMessage.content);
        }

        // Refresh progress and vocabulary in background
        refreshProgress();
        refreshVocabulary();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const explainInUrdu = async (text: string, context?: string) => {
    setIsUrduModalOpen(true);
    setIsUrduLoading(true);
    try {
      const res = await fetch('/api/explain-urdu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context }),
      });
      if (res.ok) {
        const data = await res.json();
        setUrduData({ ...data, sourceText: text });
      }
    } catch (err) {
      console.error('Failed to get Urdu explanation:', err);
    } finally {
      setIsUrduLoading(false);
    }
  };

  const lookupWord = async (word: string) => {
    setIsWordModalOpen(true);
    setIsWordLoading(true);
    try {
      const res = await fetch('/api/word-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedWordData(data);
      }
    } catch (err) {
      console.error('Failed to lookup word:', err);
    } finally {
      setIsWordLoading(false);
    }
  };

  const saveVocabularyWord = async (word: VocabularyWord) => {
    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(word),
      });
      if (res.ok) {
        const saved = await res.json();
        setVocabulary((prev) => [saved, ...prev.filter((w) => w.word !== saved.word)]);
        refreshProgress();
      }
    } catch (err) {
      console.error('Failed to save word:', err);
    }
  };

  const toggleMastered = async (id: string) => {
    try {
      const res = await fetch(`/api/vocabulary/${id}/toggle-mastered`, { method: 'PATCH' });
      if (res.ok) {
        setVocabulary((prev) =>
          prev.map((w) => (w.id === id ? { ...w, mastered: !w.mastered } : w))
        );
      }
    } catch (err) {
      console.error('Failed to toggle mastered:', err);
    }
  };

  const deleteVocabularyWord = async (id: string) => {
    try {
      const res = await fetch(`/api/vocabulary/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVocabulary((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete word:', err);
    }
  };

  const updateSettings = async (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const setDifficulty = async (diff: DifficultyLevel) => {
    setDifficultyState(diff);
    await updateSettings({ difficulty: diff });
    if (activeConversation) {
      setActiveConversation({ ...activeConversation, difficulty: diff });
    }
  };

  const setMode = async (m: ConversationMode) => {
    setModeState(m);
    await updateSettings({ mode: m });
    if (activeConversation) {
      setActiveConversation({ ...activeConversation, mode: m });
    }
  };

  const refreshProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      if (res.ok) {
        const p = await res.json();
        setProgress(p);
      }
    } catch (err) {
      console.error('Failed to refresh progress:', err);
    }
  };

  const refreshVocabulary = async () => {
    try {
      const res = await fetch('/api/vocabulary');
      if (res.ok) {
        const v = await res.json();
        setVocabulary(v);
      }
    } catch (err) {
      console.error('Failed to refresh vocabulary:', err);
    }
  };

  return (
    <BuddyContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoading,
        isSendingVoice,
        difficulty,
        mode,
        settings,
        progress,
        vocabulary,
        isSidebarOpen,
        setIsSidebarOpen,
        isUrduModalOpen,
        setIsUrduModalOpen,
        urduData,
        isUrduLoading,
        isWordModalOpen,
        setIsWordModalOpen,
        selectedWordData,
        isWordLoading,
        isVocabModalOpen,
        setIsVocabModalOpen,
        isProgressModalOpen,
        setIsProgressModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isListening,
        voiceTranscript,
        isSpeechSupported,
        isTtsSupported,
        isSpeaking,
        startListening,
        stopListening,
        speakText,
        stopSpeaking,
        sendMessage,
        createConversation,
        selectConversation,
        deleteConversation,
        explainInUrdu,
        lookupWord,
        saveVocabularyWord,
        toggleMastered,
        deleteVocabularyWord,
        updateSettings,
        setDifficulty,
        setMode,
        refreshProgress,
      }}
    >
      {children}
    </BuddyContext.Provider>
  );
};

export const useBuddy = () => {
  const context = useContext(BuddyContext);
  if (!context) {
    throw new Error('useBuddy must be used within a BuddyProvider');
  }
  return context;
};
