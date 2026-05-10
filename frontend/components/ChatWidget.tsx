'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Globe } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Lang = 'en' | 'si' | 'ta';

const LANGUAGES: Record<Lang, { label: string; flag: string; greeting: string; placeholder: string }> = {
  en: {
    label: 'EN',
    flag: '🇬🇧',
    greeting: "Hi there! I'm Nila 🍛 — your personal Sri Lanka food guide!\n\nI'd love to help you discover amazing restaurants and make reservations through conversation.\n\nTry asking: \"Find me a romantic restaurant in Kandy\" or \"Book a table for 2 in Colombo tonight\"",
    placeholder: 'Ask me about restaurants...',
  },
  si: {
    label: 'සි',
    flag: '🇱🇰',
    greeting: "ආයුබෝවන්! මම නිලා 🍛 — ඔබේ ශ්‍රී ලංකා ආහාර මාර්ගෝපදේශකයා!\n\nශ්‍රී ලංකාවේ අවන්හල් සොයා ගැනීමට සහ වෙන්කරවා ගැනීමට මට ඔබට උදව් කළ හැක.\n\nඋදාහරණ: \"කැන්ඩියේ ආදර අවන්හලක් සොයන්න\" හෝ \"කොළඹ 2 දෙනෙකුට මේසයක් වෙන්කරවන්න\"",
    placeholder: 'අවන්හල් ගැන අහන්න...',
  },
  ta: {
    label: 'த',
    flag: '🇱🇰',
    greeting: "வணக்கம்! நான் நிலா 🍛 — உங்கள் இலங்கை உணவு வழிகாட்டி!\n\nஇலங்கையில் உணவகங்களைக் கண்டுபிடிக்கவும், முன்பதிவு செய்யவும் உங்களுக்கு உதவ முடியும்.\n\nகேளுங்கள்: \"கண்டியில் காதல் உணவகம் கண்டுபிடி\" அல்லது \"கொழும்பில் 2 பேருக்கு மேசை முன்பதிவு செய்\"",
    placeholder: 'உணவகங்கள் பற்றி கேளுங்கள்...',
  },
};

const SUGGESTED: Record<Lang, string[]> = {
  en: ['Romantic restaurant in Kandy', 'Best seafood in Colombo', 'Budget food in Galle'],
  si: ['කැන්ඩියේ ආදර අවන්හලක්', 'කොළඹ හොඳම මුහුදු ආහාර', 'ගාල්ලේ අඩු මිල ආහාර'],
  ta: ['கண்டியில் காதல் உணவகம்', 'கொழும்பில் கடல் உணவு', 'காலியில் மலிவு உணவு'],
};

// Simple text renderer — splits on newlines and renders paragraphs
// No external dependencies needed
function SimpleText({ content }: { content: string }) {
  if (!content) return null;
  const paragraphs = content.split('\n').filter(line => line.trim() !== '');
  return (
    <div className="space-y-1">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-sm leading-relaxed">{para}</p>
      ))}
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: LANGUAGES.en.greeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    setMessages([{ role: 'assistant', content: LANGUAGES[newLang].greeting }]);
    setHistory([]);
    setShowLangMenu(false);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: history,
          language: lang,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get response');

      const assistantMsg: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
      setHistory(data.updatedHistory);

      if (!isOpen) setUnreadCount(c => c + 1);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}. Please try again.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating chat panel ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.25))' }}
      >
        <div
          className="rounded-2xl overflow-hidden flex flex-col border border-gray-200"
          style={{ height: '530px', background: '#fff' }}
        >
          {/* ── Header ── */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
            {/* Nila avatar */}
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0 shadow">
              <span className="text-white font-extrabold text-base">N</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm">Nila 🍛</h3>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                <p className="text-white/75 text-xs">Online · SL Eats Guide</p>
              </div>
            </div>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-2.5 py-1.5"
                title="Change language"
              >
                <Globe size={12} className="text-white/80" />
                <span className="text-white text-xs font-bold">{LANGUAGES[lang].label}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px] z-10">
                  <div className="px-3 py-2 text-xs text-gray-400 font-semibold border-b border-gray-100 uppercase tracking-wider">
                    Language
                  </div>
                  {(Object.entries(LANGUAGES) as [Lang, typeof LANGUAGES[Lang]][]).map(([code, l]) => (
                    <button
                      key={code}
                      onClick={() => changeLang(code)}
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2.5 ${
                        lang === code ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{code === 'en' ? 'English' : code === 'si' ? 'සිංහල' : 'தமிழ்'}</span>
                      {lang === code && <span className="ml-auto text-primary text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors ml-1"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                  msg.role === 'assistant' ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  {msg.role === 'assistant'
                    ? <span className="text-white font-bold text-[10px]">N</span>
                    : <User size={13} className="text-gray-500" />
                  }
                </div>
                {/* Bubble */}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                }`}>
                  {msg.role === 'assistant' ? (
                    <SimpleText content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white font-bold text-[10px]">N</span>
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Suggested queries ── */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 shrink-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED[lang].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input ── */}
          <div className="border-t border-gray-100 p-3 flex gap-2 bg-white shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={LANGUAGES[lang].placeholder}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60 bg-gray-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── FAB button ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <Bot size={24} />
        )}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold flex items-center justify-center shadow">
            {unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
