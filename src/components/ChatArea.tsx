import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  BookMarked,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  Play,
  Share2,
} from 'lucide-react';
import { useBuddy } from '../context/BuddyContext';
import { PRACTICE_MODES } from './Sidebar';
import { VocabularyWord } from '../types/buddy';

export const ChatArea: React.FC = () => {
  const {
    activeConversation,
    messages,
    isLoading,
    difficulty,
    mode,
    sendMessage,
    explainInUrdu,
    lookupWord,
    saveVocabularyWord,
    speakText,
    isSpeaking,
    stopSpeaking,
    isListening,
    voiceTranscript,
    startListening,
    stopListening,
    isSpeechSupported,
    isTtsSupported,
    settings,
    updateSettings,
    setIsSidebarOpen,
    setIsVocabModalOpen,
  } = useBuddy();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voiceTimerRef = useRef<number | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, voiceTranscript]);

  // When speech transcript updates, populate input
  useEffect(() => {
    if (voiceTranscript) {
      setInputVal(voiceTranscript);
    }
  }, [voiceTranscript]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    if (isListening) {
      stopListening();
    }

    const textToSend = inputVal.trim();
    setInputVal('');

    await sendMessage(textToSend);

    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentModeConfig = PRACTICE_MODES.find((m) => m.id === mode) || PRACTICE_MODES[0];

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-50/70 dark:bg-slate-950 overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentModeConfig.label}
              </h2>
              <span className="text-[11px] font-urdu text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/70 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                {currentModeConfig.urduLabel}
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Level: {difficulty}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {currentModeConfig.description}
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* Auto Read Aloud Toggle */}
          <button
            onClick={() => updateSettings({ auto_speak: !settings.auto_speak })}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              settings.auto_speak
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title={settings.auto_speak ? 'Auto-speak AI replies is ON' : 'Auto-speak AI replies is OFF'}
          >
            {settings.auto_speak ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline text-xs font-medium">Voice On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden md:inline text-xs">Voice Off</span>
              </>
            )}
          </button>

          {/* Stop Speaking button if active */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 animate-pulse"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Audio</span>
            </button>
          )}

          {/* Quick Notebook shortcut */}
          <button
            onClick={() => setIsVocabModalOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open Vocabulary Notebook"
          >
            <BookMarked className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl mx-auto w-full`}
            >
              {/* Message Bubble */}
              <div
                className={`group relative rounded-2xl p-4 sm:p-5 max-w-[90%] sm:max-w-[85%] shadow-xs transition-all ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                {/* Assistant Title & Audio Actions */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        English Buddy
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speakText(msg.content)}
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Listen in English"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => explainInUrdu(msg.content, 'AI Conversation response')}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-urdu font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                        title="Explain this response in Urdu"
                      >
                        <Languages className="w-3 h-3" />
                        <span>اردو میں سمجھیں</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Content Text */}
                <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap select-text">
                  {msg.content}
                </p>

                {/* User Bubble Audio Button */}
                {isUser && (
                  <div className="mt-2 flex items-center justify-end gap-2 text-indigo-200">
                    <button
                      onClick={() => speakText(msg.content)}
                      className="p-1 rounded-md hover:bg-indigo-500/50 text-indigo-100 text-xs flex items-center gap-1 transition-colors"
                      title="Hear your pronunciation"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span className="text-[10px]">Hear English</span>
                    </button>
                    <button
                      onClick={() => explainInUrdu(msg.content, 'User sentence')}
                      className="p-1 rounded-md hover:bg-indigo-500/50 text-indigo-100 text-[11px] font-urdu flex items-center gap-1 transition-colors"
                      title="Explain your sentence in Urdu"
                    >
                      <Languages className="w-3 h-3" />
                      <span>اردو مطلب</span>
                    </button>
                  </div>
                )}

                {/* Interactive Vocabulary Chips (Inside AI message) */}
                {!isUser && msg.vocabulary && msg.vocabulary.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Useful Words in This Message</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.vocabulary.map((vocab, vIdx) => (
                        <div
                          key={vIdx}
                          onClick={() => lookupWord(vocab.word)}
                          className="group/chip inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl cursor-pointer transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/chip:text-indigo-600 dark:group-hover/chip:text-indigo-400">
                            {vocab.word}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            /{vocab.pronunciation}/
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-urdu">
                            {vocab.urduMeaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Gentle Mistake Correction Card */}
              {!isUser && msg.correction && (
                <div className="mt-3 max-w-[90%] sm:max-w-[85%] w-full bg-gradient-to-br from-amber-50/90 to-orange-50/70 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-amber-200/60 dark:border-amber-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                        Language Tip & Correction
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        explainInUrdu(
                          `Grammar rule for: "${msg.correction?.original}" vs "${msg.correction?.better}". Why: ${msg.correction?.why}`,
                          'Correction explanation'
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-urdu font-medium text-amber-800 dark:text-amber-200 bg-amber-200/50 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>مکمل اردو میں سمجھیں</span>
                    </button>
                  </div>

                  {/* Original vs Better English */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0 w-24">
                        Your sentence:
                      </span>
                      <span className="line-through text-rose-600 dark:text-rose-400 font-medium">
                        "{msg.correction.original}"
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 w-24 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Better English:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          "{msg.correction.better}"
                        </span>
                        <button
                          onClick={() => speakText(msg.correction!.better)}
                          className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                          title="Listen to correct sentence"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-amber-200/40 dark:border-amber-800/40">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0 w-24">
                        Why:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {msg.correction.why}
                      </span>
                    </div>

                    {msg.correction.urduExplanation && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/40 border border-amber-200/50 dark:border-amber-800/40">
                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1">
                          <Languages className="w-3 h-3 text-amber-600" />
                          <span>اردو وضاحت (Urdu Explanation):</span>
                        </p>
                        <p className="text-xs sm:text-[13px] font-urdu text-amber-950 dark:text-amber-100 leading-loose">
                          {msg.correction.urduExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.3s]" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              English Buddy is listening and writing...
            </p>
          </div>
        )}

        {/* Empty Conversation Suggestions */}
        {messages.length <= 1 && (
          <div className="max-w-2xl mx-auto py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Suggested Conversation Starters</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentModeConfig.samplePrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => {
                    setInputVal(prompt);
                    setTimeout(() => handleSend(), 50);
                  }}
                  className="p-3 text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 hover:border-indigo-400 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-xs text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span className="line-clamp-2">"{prompt}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Listening Waveform Banner (Active when mic is listening) */}
      {isListening && (
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shrink-0 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-1 h-6">
              <span className="w-1 bg-white rounded-full animate-voice-bar-1" />
              <span className="w-1 bg-white rounded-full animate-voice-bar-2" />
              <span className="w-1 bg-white rounded-full animate-voice-bar-3" />
              <span className="w-1 bg-white rounded-full animate-voice-bar-4" />
              <span className="w-1 bg-white rounded-full animate-voice-bar-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Listening to you speak English...</p>
              <p className="text-[11px] text-indigo-100 italic line-clamp-1">
                {voiceTranscript ? `"${voiceTranscript}"` : 'Speak naturally into your microphone...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopListening();
                if (inputVal.trim()) handleSend();
              }}
              className="px-3 py-1 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-lg transition-colors"
            >
              Done & Send
            </button>
            <button
              onClick={stopListening}
              className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={handleSend}
          className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-2 border border-slate-200 dark:border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xs"
        >
          {/* Microphone button */}
          {isSpeechSupported ? (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Speak with your microphone'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          ) : (
            <span
              className="p-2.5 text-slate-300 dark:text-slate-600"
              title="Voice recognition not supported in this browser"
            >
              <MicOff className="w-5 h-5" />
            </span>
          )}

          {/* Text input area */}
          <textarea
            ref={inputRef}
            rows={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Type or speak in English (e.g. "I am go university every day")...'
            }
            className="flex-1 bg-transparent border-0 resize-none py-2 px-1 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden max-h-32 custom-scrollbar"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${
              inputVal.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 shadow-md shadow-indigo-600/30'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="max-w-3xl mx-auto flex items-center justify-between mt-2 px-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Press <strong>Enter</strong> to send</span>
            <span>•</span>
            <span className="font-urdu">غلطیوں کی فکر کیے بغیر کھل کر بولیں</span>
          </div>
          <span>English Buddy AI • v2.0</span>
        </div>
      </div>
    </main>
  );
};
