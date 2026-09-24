import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory for SQLite file
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'english_buddy.sqlite');

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not read existing SQLite file, creating fresh database:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  initTables(dbInstance);
  saveDatabase(dbInstance);
  return dbInstance;
}

export function saveDatabase(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

function initTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      mode TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      correction TEXT,
      urdu_explanation TEXT,
      vocabulary TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vocabulary (
      id TEXT PRIMARY KEY,
      word TEXT UNIQUE NOT NULL,
      pronunciation TEXT NOT NULL,
      english_meaning TEXT NOT NULL,
      urdu_meaning TEXT NOT NULL,
      example_sentence TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      saved_at TEXT NOT NULL,
      mastered INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      conversations_completed INTEGER DEFAULT 1,
      vocabulary_learned INTEGER DEFAULT 6,
      mistakes_corrected INTEGER DEFAULT 4,
      speaking_minutes REAL DEFAULT 12.5,
      current_level TEXT DEFAULT 'intermediate',
      streak_days INTEGER DEFAULT 3,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      difficulty TEXT DEFAULT 'intermediate',
      mode TEXT DEFAULT 'casual',
      voice_enabled INTEGER DEFAULT 1,
      voice_speed REAL DEFAULT 1.0,
      auto_speak INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'system',
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default settings and progress if empty
  const progressCheck = db.exec("SELECT count(*) as count FROM progress");
  const count = progressCheck[0]?.values[0]?.[0] as number;
  if (!count) {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO progress (id, conversations_completed, vocabulary_learned, mistakes_corrected, speaking_minutes, current_level, streak_days, updated_at)
       VALUES ('default', 3, 8, 5, 18.0, 'intermediate', 4, ?)`,
      [now]
    );

    db.run(
      `INSERT INTO settings (id, difficulty, mode, voice_enabled, voice_speed, auto_speak, theme, updated_at)
       VALUES ('default', 'intermediate', 'casual', 1, 1.0, 1, 'system', ?)`,
      [now]
    );

    // Seed useful vocabulary starter kit with Urdu meanings
    const seedWords = [
      ['habit', 'HAB-it', 'a settled or regular practice', 'عادت یا معمول', 'Reading before sleeping is a wonderful habit.', 'beginner', now, 1],
      ['fluent', 'FLOO-uhnt', 'able to speak or write smoothly and easily', 'روانی سے بولنے والا', 'With daily practice, you will become fluent in English.', 'intermediate', now, 0],
      ['hesitate', 'HEZ-i-tayt', 'pause before saying or doing something', 'جھجکنا یا ہچکچانا', 'Do not hesitate to ask if you do not understand.', 'intermediate', now, 0],
      ['vocabulary', 'voh-KAB-yuh-lair-ee', 'the body of words used in a language', 'الفاظ کا ذخیرہ', 'Learning five words a day expands your vocabulary quickly.', 'beginner', now, 1],
      ['articulate', 'ar-TIK-yuh-lit', 'express ideas clearly and effectively', 'صاف اور واضح انداز میں بیان کرنا', 'She is very articulate during presentations.', 'advanced', now, 0],
      ['perseverance', 'pur-suh-VEER-uhns', 'continued effort despite difficulties', 'ثابت قدمی اور ہمت', 'Learning a new language requires patience and perseverance.', 'advanced', now, 0],
    ];

    for (const w of seedWords) {
      db.run(
        `INSERT OR IGNORE INTO vocabulary (id, word, pronunciation, english_meaning, urdu_meaning, example_sentence, difficulty, saved_at, mastered)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`vocab_${Date.now()}_${Math.random().toString(36).substring(7)}`, ...w]
      );
    }

    // Seed default welcome conversation
    const convId = 'conv_welcome';
    db.run(
      `INSERT INTO conversations (id, title, mode, difficulty, created_at, updated_at)
       VALUES (?, ?, 'casual', 'intermediate', ?, ?)`,
      [convId, 'Getting to know each other', now, now]
    );

    const welcomeMsg = `Hello! I'm your English Buddy. 👋 I'm here to chat with you in English every day, help you speak naturally, and kindly fix any small grammar mistakes along the way. How was your day today?`;
    db.run(
      `INSERT INTO messages (id, conversation_id, role, content, correction, urdu_explanation, vocabulary, created_at)
       VALUES (?, ?, 'assistant', ?, NULL, ?, ?, ?)`,
      [
        'msg_welcome',
        convId,
        welcomeMsg,
        'سلام! میں آپ کا انگلش بڈی ہوں۔ میں یہاں ہر روز آپ سے انگلش میں گفتگو کرنے، آپ کو روانی سے بولنے میں مدد دینے، اور چھوٹی موٹی گرامر کی غلطیوں کو نرمی سے درست کرنے کے لیے ہوں۔',
        JSON.stringify([
          {
            word: 'naturally',
            pronunciation: 'NATCH-er-uh-lee',
            englishMeaning: 'in a normal, easy, or relaxed way',
            urduMeaning: 'قدرتی یا روانی کے انداز میں',
            example: 'Try to speak naturally without worrying about mistakes.',
          },
        ]),
        now,
      ]
    );
  }
}
