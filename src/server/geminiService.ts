import { GoogleGenAI, Type } from '@google/genai';
import { DifficultyLevel, ConversationMode, Correction, VocabularyWord } from '../types/buddy';

// Server-side initialization per @google/genai guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface GeminiChatResponse {
  reply: string;
  hasCorrection: boolean;
  correction: Correction | null;
  vocabulary: VocabularyWord[];
  followUpQuestion?: string;
}

export async function generateBuddyReply(params: {
  userMessage: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  difficulty: DifficultyLevel;
  mode: ConversationMode;
}): Promise<GeminiChatResponse> {
  const { userMessage, history, difficulty, mode } = params;

  const modeDescriptions: Record<ConversationMode, string> = {
    casual: 'You are a warm, casual, and supportive English-speaking friend chatting about life, hobbies, movies, food, and daily happenings. Use a friendly and relaxed tone.',
    teacher: 'You are a patient, encouraging, and friendly English teacher. You guide the user with warm feedback, ask engaging follow-ups, and help them improve step-by-step.',
    daily: 'You are an English conversation partner practicing everyday practical scenarios (ordering food, shopping, asking directions, making small talk about weather).',
    interview: 'You are a friendly hiring manager and interview coach conducting realistic mock interview questions and behavioral follow-ups.',
    university: 'You are a college classmate chatting about courses, campus life, study sessions, exams, and academic projects.',
    travel: 'You are a friendly local guide helping the user practice travel English (airports, hotels, sightseeing, asking locals for tips).',
  };

  const difficultyGuidelines: Record<DifficultyLevel, string> = {
    beginner: 'Use simple everyday words (CEFR A1-A2). Keep sentences concise (5-12 words). Avoid obscure idioms or complex subordinate clauses. Speak slowly in text.',
    intermediate: 'Use natural conversational English (CEFR B1-B2) with everyday idioms, varied sentence structures, and natural connectors.',
    advanced: 'Use rich, nuanced English (CEFR C1) with professional, academic, or sophisticated vocabulary, collocations, and expressive phrasing.',
  };

  const systemInstruction = `
You are "English Buddy", a friendly English conversation partner and language coach.
Your primary mission is to help the user practice English comfortably and build confidence.

CORE BEHAVIOR:
1. UNDERSTAND IMPERFECT ENGLISH: The user might make grammar, tense, preposition, or spelling mistakes (e.g. "I am go university"). Always grasp what they mean and reply naturally to the MEANING of their message first.
2. CONVERSATIONAL PARTNER: Never act like a dry textbook. Be warm, enthusiastic, and curious. Always include a natural follow-up question or observation to keep the dialogue flowing.
3. ADAPT TO DIFFICULTY: ${difficultyGuidelines[difficulty]}
4. ADAPT TO MODE: ${modeDescriptions[mode]}
5. GENTLE CORRECTION POLICY:
   - If the user's sentence has a notable grammar, preposition, tense, or vocabulary mistake:
     Set "hasCorrection" to true.
     Provide "correction":
       - "original": the exact imperfect sentence or phrase the user wrote.
       - "better": the natural, correct English equivalent.
       - "why": a short, simple, crystal-clear explanation in English (1-2 sentences).
       - "urduExplanation": a simple, clear explanation in URDU (اردو) explaining why this correction is made and how to think about it in Urdu.
   - If the user's sentence is natural and grammatically sound, set "hasCorrection" to false and "correction" to null.
   - Do NOT nitpick every tiny punctuation mark or colloquial abbreviation. Focus on meaningful errors that improve spoken fluency.
6. VOCABULARY SELECTION:
   - Pick 1 to 2 interesting, useful, or slightly challenging words from your response or the user's topic.
   - For each word, provide:
     - "word": the word in lowercase
     - "pronunciation": phonetic guide (e.g., "KAHN-fi-duhnt")
     - "englishMeaning": simple definition in English
     - "urduMeaning": clear translation / meaning in Urdu (اردو)
     - "exampleSentence": a natural example sentence
`;

  try {
    const formattedHistory = history.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    // Call Gemini 3.8 Flash with structured JSON output schema
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Your friendly conversational response to the user.',
            },
            hasCorrection: {
              type: Type.BOOLEAN,
              description: 'Whether the user made a grammar or vocabulary error needing correction.',
            },
            correction: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                better: { type: Type.STRING },
                why: { type: Type.STRING },
                urduExplanation: { type: Type.STRING },
              },
            },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  pronunciation: { type: Type.STRING },
                  englishMeaning: { type: Type.STRING },
                  urduMeaning: { type: Type.STRING },
                  exampleSentence: { type: Type.STRING },
                },
                required: ['word', 'pronunciation', 'englishMeaning', 'urduMeaning', 'exampleSentence'],
              },
            },
            followUpQuestion: {
              type: Type.STRING,
              description: 'A follow up question to keep the chat active.',
            },
          },
          required: ['reply', 'hasCorrection', 'vocabulary'],
        },
      },
    });

    const parsed: GeminiChatResponse = JSON.parse(response.text || '{}');
    return {
      reply: parsed.reply || "That's wonderful! Tell me more about it.",
      hasCorrection: Boolean(parsed.hasCorrection && parsed.correction?.better),
      correction: parsed.hasCorrection ? parsed.correction : null,
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
      followUpQuestion: parsed.followUpQuestion,
    };
  } catch (error) {
    console.error('Gemini generateBuddyReply error:', error);
    // Graceful fallback
    return {
      reply: `I heard what you said! That is interesting. Could you tell me a little more about that?`,
      hasCorrection: false,
      correction: null,
      vocabulary: [
        {
          word: 'interesting',
          pronunciation: 'IN-tuh-res-ting',
          englishMeaning: 'holding or catching attention',
          urduMeaning: 'دلچسپ یا توجہ طلب',
          exampleSentence: 'It is an interesting idea.',
        },
      ],
    };
  }
}

export async function explainInUrdu(targetText: string, context?: string): Promise<{
  urduExplanation: string;
  keyPoints: string[];
  simpleTranslation: string;
  usageTip: string;
}> {
  const prompt = `
The user is learning English and needs this text/concept explained in simple, everyday URDU (اردو):
Target English text: "${targetText}"
Context: "${context || 'General conversation'}"

Explain it clearly in Urdu:
1. "simpleTranslation": natural, everyday Urdu translation of the sentence or concept.
2. "urduExplanation": clear explanation of what it means, why those words are used, and when to use them in Urdu.
3. "keyPoints": 2-3 bullet points in Urdu explaining grammar, prepositions, or vocabulary.
4. "usageTip": a practical tip in Urdu to remember this when speaking English.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleTranslation: { type: Type.STRING },
            urduExplanation: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            usageTip: { type: Type.STRING },
          },
          required: ['simpleTranslation', 'urduExplanation', 'keyPoints', 'usageTip'],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Gemini explainInUrdu error:', err);
    return {
      simpleTranslation: targetText,
      urduExplanation: 'اس جملے کا مفہوم عام انگلش بول چال میں بات چیت کے لیے استعمال ہوتا ہے۔',
      keyPoints: ['انگلش میں گفتگو جاری رکھنے کے لیے یہ جملہ مددگار ہے۔'],
      usageTip: 'روزمرہ بول چال میں اس کی مشق کریں تاکہ روانی آئے۔',
    };
  }
}

export async function lookupWord(word: string): Promise<VocabularyWord> {
  const prompt = `
Provide detailed dictionary details for this English word: "${word}".
Return:
- "word": "${word}"
- "pronunciation": phonetics (e.g., "ik-SPREST-shun")
- "englishMeaning": simple, easy-to-understand English definition
- "urduMeaning": clear Urdu (اردو) translation
- "exampleSentence": natural, everyday example sentence
- "difficulty": "beginner" | "intermediate" | "advanced"
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            englishMeaning: { type: Type.STRING },
            urduMeaning: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['beginner', 'intermediate', 'advanced'] },
          },
          required: ['word', 'pronunciation', 'englishMeaning', 'urduMeaning', 'exampleSentence', 'difficulty'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      word: parsed.word || word,
      pronunciation: parsed.pronunciation || word,
      englishMeaning: parsed.englishMeaning || 'A common English word',
      urduMeaning: parsed.urduMeaning || 'ایک اہم انگلش لفظ',
      exampleSentence: parsed.exampleSentence || `I learned the word ${word} today.`,
      difficulty: parsed.difficulty || 'intermediate',
    };
  } catch (err) {
    console.error('Gemini lookupWord error:', err);
    return {
      word,
      pronunciation: word,
      englishMeaning: 'English word used in daily conversation',
      urduMeaning: 'روزمرہ بول چال کا انگلش لفظ',
      exampleSentence: `Practice using "${word}" in your next sentence.`,
      difficulty: 'intermediate',
    };
  }
}
