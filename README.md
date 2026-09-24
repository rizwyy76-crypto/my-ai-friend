# English Buddy AI 🌟
**Your English-Speaking AI Friend & Teacher**

An intelligent, friendly conversational companion designed to help English learners practice daily English, build fluency, overcome grammar hesitations, and receive gentle real-time corrections with English + Urdu explanations.

---

## 🚀 Key Features

1. **Natural AI Conversation Partner**
   - Natural, conversational responses using Google's **Gemini 3.8 Flash** (`@google/genai`).
   - Understands imperfect English (e.g., *"I am go university every day"*), responds to the meaning first, and keeps the conversation flowing with natural follow-up questions.
   - Topics include daily life, campus/university, hobbies, travel, job interviews, and technology.

2. **Gentle Grammar Mistake Correction**
   - Non-intrusive correction cards showing:
     - **Your sentence** (what you said)
     - **Better English** (natural phrasing + audio pronunciation button)
     - **Why** (concise explanation of grammar/preposition rules)
     - **اردو وضاحت** (clear explanation in Urdu)

3. **English + Urdu Bilingual Assistance**
   - **"Explain in Urdu" (اردو میں سمجھیں)** button on every message, sentence, and correction.
   - Beautiful Urdu typography styled with Noto Nastaliq Urdu.
   - Breaks down difficult sentences, idiomatic expressions, and grammar rules into simple everyday Urdu with practical speaking tips.

4. **Voice Conversation (Web Speech API)**
   - **Microphone speech-to-text**: Real-time voice recognition with live soundwave animation.
   - **Text-to-Speech (TTS)**: Listen to AI responses and hear correct pronunciation of your own sentences.
   - **Adjustable Speech Speed**: Practice at 0.75x (slow learner), 1.0x (normal), or 1.25x (fast).
   - Auto-read toggle for a true hands-free voice conversation experience.

5. **Interactive Vocabulary Notebook & Flashcards**
   - Click any useful word in chat to view English definition, pronunciation guide (`/voh-KAB-yuh-lair-ee/`), Urdu meaning (اردو معنی), and example sentences.
   - Save words to your personal notebook with search, filtering by level, mastery toggles, and interactive flashcard flip mode.

6. **3 Difficulty Levels & 6 Conversation Modes**
   - **Levels**: Beginner (CEFR A1-A2), Intermediate (CEFR B1-B2), Advanced (CEFR C1).
   - **Modes**:
     - 🤝 Casual Friend
     - 📚 English Teacher
     - ☕ Daily Conversation
     - 💼 Interview Practice
     - 🎓 University Life
     - ✈️ Travel English

7. **Progress & Fluency Analytics**
   - Conversations completed, words learned, grammar mistakes overcome, and speaking practice minutes.
   - CEFR Fluency Level tracker and daily streak counter.

---

## 📁 Project Architecture & Folder Structure

```text
├── data/
│   └── english_buddy.sqlite     # SQLite database file (sql.js)
├── src/
│   ├── context/
│   │   └── BuddyContext.tsx     # Global state: chats, voice, speech, modals
│   ├── components/
│   │   ├── Sidebar.tsx          # Practice modes, difficulty, chat history
│   │   ├── ChatArea.tsx         # Message stream, voice wave, correction cards
│   │   ├── UrduModal.tsx        # In-depth Urdu explanations & tips
│   │   ├── WordDetailModal.tsx  # Word lookup popup with audio & Urdu
│   │   ├── VocabularyModal.tsx  # Vocabulary notebook & interactive flashcards
│   │   ├── ProgressModal.tsx    # Fluency stats & grammar improvement areas
│   │   └── SettingsModal.tsx    # Voice speed, auto-read, level preferences
│   ├── server/
│   │   ├── db.ts                # sql.js WebAssembly SQLite layer & migrations
│   │   └── geminiService.ts     # Server-side Gemini API (gemini-3.8-flash)
│   ├── types/
│   │   └── buddy.ts             # TypeScript interfaces for chats, vocab, stats
│   ├── App.tsx                  # Root application layout
│   ├── main.tsx                 # React DOM bootstrap
│   └── index.css                # Tailwind CSS + Urdu fonts & voice animations
├── server.ts                    # Full-stack Express server with Vite middlewares
├── index.html                   # HTML entry point with Noto Nastaliq Urdu
├── metadata.json                # AI Studio application metadata
├── package.json                 # Scripts and dependencies
└── .env.example                 # Environment variables specification
```

---

## 🛠️ Installation & Setup Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `GEMINI_API_KEY` is present:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Runs the full-stack server on `http://localhost:3000` (Express backend + Vite middleware).

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing Instructions

1. **Test Broken English Correction**:
   - Send: `"I am go university every day."`
   - Verify that the AI warmly responds to what you study, while providing a gentle correction card:
     - Better English: *"I go to university every day."*
     - Why: *We use the simple present for regular habits.*
     - Urdu explanation: *جب ہم روزمرہ کی عادت یا معمول بتاتے ہیں تو simple present استعمال کرتے ہیں۔*
2. **Test Urdu Explanation**:
   - Click the **"اردو میں سمجھیں"** button on any message or correction.
   - Confirm the modal opens with Urdu translation, grammar breakdown, and speaking tips.
3. **Test Voice Recognition & Pronunciation**:
   - Click the **Microphone** button and speak into your mic.
   - Confirm the live waveform appears and the transcript populates.
   - Click the **Speaker icon** to hear natural speech pronunciation.
4. **Test Vocabulary Notebook**:
   - Click any highlighted vocabulary chip inside an AI response (or search/lookup a word).
   - Click **Save to Notebook**. Open the notebook and test the **Flashcards** flip mode.
5. **Test Practice Modes & Difficulty**:
   - Switch between **Casual Friend**, **English Teacher**, and **Interview Practice**.
   - Notice how the AI's tone, questions, and sentence complexity adapt to the selected level.

---

## 🔍 Common Errors & Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| Microphone button disabled or silent | Browser permissions or HTTP origin | Ensure microphone permission is granted in the browser. In Chrome/Brave, microphone requires `localhost` or HTTPS. |
| Voice not speaking aloud | SpeechSynthesis voices loading asynchronously | Check that volume is on and audio is not muted. If on mobile, browser policies require a user tap before first audio playback. |
| AI API key missing error | `GEMINI_API_KEY` not set in `.env` | Ensure `GEMINI_API_KEY` is set in your `.env` file (or injected via AI Studio secrets). |
| Port 3000 in use | Another service is using port 3000 | Set `PORT=3001` in `.env` or terminate the conflicting process. |
