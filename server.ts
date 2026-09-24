import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, saveDatabase } from './src/server/db.js';
import { generateBuddyReply, explainInUrdu, lookupWord } from './src/server/geminiService.js';
import { DifficultyLevel, ConversationMode } from './src/types/buddy.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Endpoints

// 1. Get or Create active conversation
app.get('/api/conversations', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec(`
      SELECT c.*, 
             COUNT(m.id) as messages_count,
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `);

    if (!result.length) return res.json([]);
    const columns = result[0].columns;
    const conversations = result[0].values.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.post('/api/conversations', async (req, res) => {
  try {
    const db = await getDatabase();
    const { title, mode = 'casual', difficulty = 'intermediate' } = req.body;
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    const modeOpenings: Record<ConversationMode, string> = {
      casual: `Hey there! 😊 What's on your mind today? Tell me about your day or anything you feel like talking about!`,
      teacher: `Hello! Welcome to our English practice session. 📚 What topic would you like to explore today? Don't worry about making mistakes—I'm here to support you!`,
      daily: `Hi! Let's practice daily English. ☕ Imagine we just bumped into each other at a coffee shop or market. How has your morning been?`,
      interview: `Welcome to your interview prep session! 💼 Let's start with a classic: "Could you please introduce yourself and tell me a bit about your background?"`,
      university: `Hey! Good to see you on campus. 🎓 How are your classes going this semester? Are you working on any interesting assignments?`,
      travel: `Welcome! ✈️ Let's practice travel English. Imagine you just landed in London or New York. Where are you heading first?`,
    };

    const openingContent = modeOpenings[mode as ConversationMode] || modeOpenings.casual;

    db.run(
      `INSERT INTO conversations (id, title, mode, difficulty, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title || 'New Conversation', mode, difficulty, now, now]
    );

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    db.run(
      `INSERT INTO messages (id, conversation_id, role, content, correction, urdu_explanation, vocabulary, created_at)
       VALUES (?, ?, 'assistant', ?, NULL, NULL, NULL, ?)`,
      [msgId, id, openingContent, now]
    );

    saveDatabase(db);

    res.json({
      id,
      title: title || 'New Conversation',
      mode,
      difficulty,
      created_at: now,
      updated_at: now,
      initialMessage: {
        id: msgId,
        conversation_id: id,
        role: 'assistant',
        content: openingContent,
        created_at: now,
      },
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    const convResult = db.exec(`SELECT * FROM conversations WHERE id = '${id.replace(/'/g, "''")}'`);
    if (!convResult.length || !convResult[0].values.length) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const convColumns = convResult[0].columns;
    const conversation: Record<string, any> = {};
    convColumns.forEach((col, idx) => {
      conversation[col] = convResult[0].values[0][idx];
    });

    const msgResult = db.exec(`SELECT * FROM messages WHERE conversation_id = '${id.replace(/'/g, "''")}' ORDER BY created_at ASC`);
    const messages = msgResult.length
      ? msgResult[0].values.map((row) => {
          const obj: Record<string, any> = {};
          msgResult[0].columns.forEach((col, idx) => {
            obj[col] = row[idx];
          });
          if (obj.correction) {
            try { obj.correction = JSON.parse(obj.correction); } catch (e) {}
          }
          if (obj.vocabulary) {
            try { obj.vocabulary = JSON.parse(obj.vocabulary); } catch (e) {}
          }
          return obj;
        })
      : [];

    res.json({ conversation, messages });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    db.run(`DELETE FROM messages WHERE conversation_id = ?`, [id]);
    db.run(`DELETE FROM conversations WHERE id = ?`, [id]);
    saveDatabase(db);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// 2. Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const db = await getDatabase();
    const { conversationId, message, speakingMinutes = 0 } = req.body;

    if (!conversationId || !message?.trim()) {
      return res.status(400).json({ error: 'Conversation ID and message are required' });
    }

    // Get conversation details
    const convResult = db.exec(`SELECT * FROM conversations WHERE id = '${conversationId.replace(/'/g, "''")}'`);
    if (!convResult.length || !convResult[0].values.length) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const convCols = convResult[0].columns;
    const convRow = convResult[0].values[0];
    const difficultyIdx = convCols.indexOf('difficulty');
    const modeIdx = convCols.indexOf('mode');
    const difficulty = (convRow[difficultyIdx] as DifficultyLevel) || 'intermediate';
    const mode = (convRow[modeIdx] as ConversationMode) || 'casual';

    const now = new Date().toISOString();

    // 1. Save user message
    const userMsgId = `msg_user_${Date.now()}`;
    db.run(
      `INSERT INTO messages (id, conversation_id, role, content, correction, urdu_explanation, vocabulary, created_at)
       VALUES (?, ?, 'user', ?, NULL, NULL, NULL, ?)`,
      [userMsgId, conversationId, message.trim(), now]
    );

    // 2. Fetch recent conversation history
    const historyResult = db.exec(`SELECT role, content FROM messages WHERE conversation_id = '${conversationId.replace(/'/g, "''")}' ORDER BY created_at DESC LIMIT 6`);
    const history: { role: 'user' | 'assistant'; content: string }[] = historyResult.length
      ? historyResult[0].values.reverse().map((row) => ({
          role: row[0] as 'user' | 'assistant',
          content: row[1] as string,
        }))
      : [];

    // 3. Call Gemini service
    const buddyResponse = await generateBuddyReply({
      userMessage: message.trim(),
      history,
      difficulty,
      mode,
    });

    // 4. Save assistant reply
    const assistantMsgId = `msg_ai_${Date.now()}`;
    const correctionJson = buddyResponse.correction ? JSON.stringify(buddyResponse.correction) : null;
    const vocabJson = buddyResponse.vocabulary?.length ? JSON.stringify(buddyResponse.vocabulary) : null;

    db.run(
      `INSERT INTO messages (id, conversation_id, role, content, correction, urdu_explanation, vocabulary, created_at)
       VALUES (?, ?, 'assistant', ?, ?, NULL, ?, ?)`,
      [assistantMsgId, conversationId, buddyResponse.reply, correctionJson, vocabJson, now]
    );

    // 5. Update conversation timestamp and title if first message
    db.run(`UPDATE conversations SET updated_at = ? WHERE id = ?`, [now, conversationId]);

    // 6. Update user progress stats
    const hadCorrection = buddyResponse.hasCorrection ? 1 : 0;
    const addedSpeaking = typeof speakingMinutes === 'number' && speakingMinutes > 0 ? speakingMinutes : 0.2;

    db.run(
      `UPDATE progress SET 
         mistakes_corrected = mistakes_corrected + ?,
         speaking_minutes = speaking_minutes + ?,
         updated_at = ?
       WHERE id = 'default'`,
      [hadCorrection, addedSpeaking, now]
    );

    // Save any new vocabulary to database for convenient retrieval
    if (buddyResponse.vocabulary && buddyResponse.vocabulary.length > 0) {
      for (const v of buddyResponse.vocabulary) {
        db.run(
          `INSERT OR IGNORE INTO vocabulary (id, word, pronunciation, english_meaning, urdu_meaning, example_sentence, difficulty, saved_at, mastered)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            `vocab_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            v.word.toLowerCase(),
            v.pronunciation,
            v.englishMeaning,
            v.urduMeaning,
            v.exampleSentence,
            difficulty,
            now,
          ]
        );
      }
    }

    saveDatabase(db);

    res.json({
      userMessage: {
        id: userMsgId,
        conversation_id: conversationId,
        role: 'user',
        content: message.trim(),
        created_at: now,
      },
      assistantMessage: {
        id: assistantMsgId,
        conversation_id: conversationId,
        role: 'assistant',
        content: buddyResponse.reply,
        correction: buddyResponse.correction,
        vocabulary: buddyResponse.vocabulary,
        created_at: now,
      },
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Chat processing failed' });
  }
});

// 3. Explain in Urdu endpoint
app.post('/api/explain-urdu', async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Text is required to explain' });
    }

    const explanation = await explainInUrdu(text.trim(), context);
    res.json(explanation);
  } catch (error) {
    console.error('Error in /api/explain-urdu:', error);
    res.status(500).json({ error: 'Failed to generate Urdu explanation' });
  }
});

// 4. Word Lookup endpoint
app.post('/api/word-lookup', async (req, res) => {
  try {
    const { word } = req.body;
    if (!word?.trim()) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const cleanWord = word.trim().toLowerCase().replace(/[^a-z]/g, '');
    const db = await getDatabase();

    // Check if in database
    const existing = db.exec(`SELECT * FROM vocabulary WHERE word = '${cleanWord.replace(/'/g, "''")}'`);
    if (existing.length && existing[0].values.length) {
      const row = existing[0].values[0];
      const cols = existing[0].columns;
      const vocab: Record<string, any> = {};
      cols.forEach((col, idx) => { vocab[col] = row[idx]; });
      return res.json({
        id: vocab.id,
        word: vocab.word,
        pronunciation: vocab.pronunciation,
        englishMeaning: vocab.english_meaning,
        urduMeaning: vocab.urdu_meaning,
        exampleSentence: vocab.example_sentence,
        difficulty: vocab.difficulty,
        mastered: Boolean(vocab.mastered),
      });
    }

    // Otherwise lookup with Gemini
    const freshVocab = await lookupWord(cleanWord);
    res.json(freshVocab);
  } catch (error) {
    console.error('Error in /api/word-lookup:', error);
    res.status(500).json({ error: 'Failed to look up word' });
  }
});

// 5. Vocabulary management endpoints
app.get('/api/vocabulary', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec(`SELECT * FROM vocabulary ORDER BY saved_at DESC`);
    if (!result.length) return res.json([]);
    const cols = result[0].columns;
    const words = result[0].values.map((row) => {
      const obj: Record<string, any> = {};
      cols.forEach((col, idx) => { obj[col] = row[idx]; });
      return {
        id: obj.id,
        word: obj.word,
        pronunciation: obj.pronunciation,
        englishMeaning: obj.english_meaning,
        urduMeaning: obj.urdu_meaning,
        exampleSentence: obj.example_sentence,
        difficulty: obj.difficulty,
        saved_at: obj.saved_at,
        mastered: Boolean(obj.mastered),
      };
    });
    res.json(words);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
});

app.post('/api/vocabulary', async (req, res) => {
  try {
    const db = await getDatabase();
    const { word, pronunciation, englishMeaning, urduMeaning, exampleSentence, difficulty = 'intermediate' } = req.body;
    if (!word?.trim()) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const id = `vocab_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    db.run(
      `INSERT OR REPLACE INTO vocabulary (id, word, pronunciation, english_meaning, urdu_meaning, example_sentence, difficulty, saved_at, mastered)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, word.trim().toLowerCase(), pronunciation || word, englishMeaning || '', urduMeaning || '', exampleSentence || '', difficulty, now]
    );

    // Update vocabulary learned count in progress
    db.run(`UPDATE progress SET vocabulary_learned = vocabulary_learned + 1 WHERE id = 'default'`);
    saveDatabase(db);

    res.json({ id, word, pronunciation, englishMeaning, urduMeaning, exampleSentence, difficulty, saved_at: now, mastered: false });
  } catch (error) {
    console.error('Error saving vocabulary:', error);
    res.status(500).json({ error: 'Failed to save vocabulary' });
  }
});

app.patch('/api/vocabulary/:id/toggle-mastered', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    db.run(`UPDATE vocabulary SET mastered = CASE WHEN mastered = 1 THEN 0 ELSE 1 END WHERE id = ?`, [id]);
    saveDatabase(db);
    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling mastered status:', error);
    res.status(500).json({ error: 'Failed to update vocabulary' });
  }
});

app.delete('/api/vocabulary/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    db.run(`DELETE FROM vocabulary WHERE id = ?`, [id]);
    saveDatabase(db);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vocabulary word:', error);
    res.status(500).json({ error: 'Failed to delete word' });
  }
});

// 6. User Progress & Settings
app.get('/api/progress', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec(`SELECT * FROM progress WHERE id = 'default'`);
    const vocabCountResult = db.exec(`SELECT COUNT(*) FROM vocabulary`);
    const convCountResult = db.exec(`SELECT COUNT(*) FROM conversations`);

    const vocabCount = (vocabCountResult[0]?.values[0]?.[0] as number) || 8;
    const convCount = (convCountResult[0]?.values[0]?.[0] as number) || 2;

    if (!result.length || !result[0].values.length) {
      return res.json({
        conversations_completed: convCount,
        vocabulary_learned: vocabCount,
        mistakes_corrected: 6,
        speaking_minutes: 15.0,
        current_level: 'intermediate',
        streak_days: 4,
        grammar_topics: [
          { topic: 'Simple Present vs Continuous', count: 3 },
          { topic: 'Prepositions of Place & Time (in, on, at)', count: 2 },
          { topic: 'Subject-Verb Agreement', count: 1 },
        ],
      });
    }

    const row = result[0].values[0];
    const cols = result[0].columns;
    const progressObj: Record<string, any> = {};
    cols.forEach((col, idx) => { progressObj[col] = row[idx]; });

    res.json({
      conversations_completed: Math.max(convCount, progressObj.conversations_completed || 1),
      vocabulary_learned: Math.max(vocabCount, progressObj.vocabulary_learned || 1),
      mistakes_corrected: progressObj.mistakes_corrected || 5,
      speaking_minutes: parseFloat((progressObj.speaking_minutes || 10).toFixed(1)),
      current_level: progressObj.current_level || 'intermediate',
      streak_days: progressObj.streak_days || 3,
      grammar_topics: [
        { topic: 'Simple Present vs Continuous', count: 3 },
        { topic: 'Prepositions of Direction (to vs at)', count: 2 },
        { topic: 'Third-person singular -s', count: 2 },
        { topic: 'Past Simple regular/irregular verbs', count: 1 },
      ],
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec(`SELECT * FROM settings WHERE id = 'default'`);
    if (!result.length || !result[0].values.length) {
      return res.json({
        difficulty: 'intermediate',
        mode: 'casual',
        voice_enabled: true,
        voice_speed: 1.0,
        auto_speak: true,
        theme: 'system',
      });
    }

    const row = result[0].values[0];
    const cols = result[0].columns;
    const settings: Record<string, any> = {};
    cols.forEach((col, idx) => { settings[col] = row[idx]; });

    res.json({
      difficulty: settings.difficulty,
      mode: settings.mode,
      voice_enabled: Boolean(settings.voice_enabled),
      voice_speed: Number(settings.voice_speed) || 1.0,
      auto_speak: Boolean(settings.auto_speak),
      theme: settings.theme || 'system',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const db = await getDatabase();
    const { difficulty, mode, voice_enabled, voice_speed, auto_speak, theme } = req.body;
    const now = new Date().toISOString();

    db.run(
      `UPDATE settings SET 
         difficulty = COALESCE(?, difficulty),
         mode = COALESCE(?, mode),
         voice_enabled = COALESCE(?, voice_enabled),
         voice_speed = COALESCE(?, voice_speed),
         auto_speak = COALESCE(?, auto_speak),
         theme = COALESCE(?, theme),
         updated_at = ?
       WHERE id = 'default'`,
      [
        difficulty,
        mode,
        typeof voice_enabled === 'boolean' ? (voice_enabled ? 1 : 0) : null,
        typeof voice_speed === 'number' ? voice_speed : null,
        typeof auto_speak === 'boolean' ? (auto_speak ? 1 : 0) : null,
        theme,
        now,
      ]
    );

    saveDatabase(db);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Mount Vite in dev mode or serve static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`English Buddy AI server running at http://localhost:${PORT}`);
  });
}

startServer();
