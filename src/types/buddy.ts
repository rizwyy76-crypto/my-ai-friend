export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ConversationMode =
  | 'casual'
  | 'teacher'
  | 'daily'
  | 'interview'
  | 'university'
  | 'travel';

export interface Correction {
  original: string;
  better: string;
  why: string;
  urduExplanation?: string;
}

export interface VocabularyWord {
  id?: string;
  word: string;
  pronunciation: string;
  englishMeaning: string;
  urduMeaning: string;
  exampleSentence: string;
  difficulty?: DifficultyLevel;
  saved_at?: string;
  mastered?: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  correction?: Correction | null;
  urdu_explanation?: string | null;
  vocabulary?: VocabularyWord[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  mode: ConversationMode;
  difficulty: DifficultyLevel;
  created_at: string;
  updated_at: string;
  messages_count?: number;
  last_message?: string;
}

export interface UserProgress {
  conversations_completed: number;
  vocabulary_learned: number;
  mistakes_corrected: number;
  speaking_minutes: number;
  current_level: DifficultyLevel;
  streak_days: number;
  grammar_topics: { topic: string; count: number }[];
}

export interface UserSettings {
  difficulty: DifficultyLevel;
  mode: ConversationMode;
  voice_enabled: boolean;
  voice_speed: number;
  auto_speak: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface ModeConfig {
  id: ConversationMode;
  label: string;
  urduLabel: string;
  description: string;
  icon: string;
  samplePrompts: string[];
}
