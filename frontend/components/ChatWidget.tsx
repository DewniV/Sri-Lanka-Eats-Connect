'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Lang = 'en' | 'si' | 'ta';

const LANGUAGES: Record<Lang, { label: string; flag: string; greeting: string; placeholder: string }> = {
  en: {
    label: 'EN',
    flag: '🇬🇧',
    greeting: "Hello! I'm SL Eats Assistant 🍛\n\nI can help you discover restaurants in Sri Lanka and make reservations through conversation.\n\nTry asking: *\"Find me a romantic restaurant in Kandy\"* or *\"Book a table for 2 in Colombo tonight\"*",
    placeholder: 'Ask me about restaurants...',
  },
  si: {
    label: 'සි',
    flag: '🇱🇰',
    greeting: "ආයුබෝවන්! මම SL Eats සහායක 🍛\n\nශ්‍රී ලංකාවේ අවන්හල් සොයා ගැනීමට සහ වෙන්කරවා ගැනීමට මට ඔබට උදව් කළ හැක.\n\nඋදාහරණ: *\"කැන්ඩියේ ආදර අවන්හලක් සොයන්න\"* හෝ *\"කොළඹ 2 දෙනෙකුට මේසයක් වෙන්කරවන්න\"*",
    placeholder: 'අවන්හල් ගැන අහන්න...',
  },
  ta: {
    label: 'த',
    flag: '🇱🇰',
    greeting: "வணக்கம்! நான் SL Eats உதவியாளர் 🍛\n\nஇலங்கையில் உணவகங்களைக் கண்டுபிடிக்கவும், முன்பதிவு செய்யவும் உங்களுக்கு உதவ முடியும்.\n\nகேளுங்கள்: *\"கண்டியில் காதல் உணவகம் கண்டுபிடி\"* அல்லது *\"கொழும்பில் 2 பேருக்கு மேசை முன்பதிவு செய்\"*",
    placeholder: 'உணவகங்கள் பற்றி கேளுங்கள்...',
  },
};

const SUGGESTED: Record<Lang, string[]> = {
  en: ['Romantic restaurant in Kandy', 'Best seafood in Colombo', 'Budget food in Galle'],
  si: ['කැන්ඩියේ ආදර අවන්හලක්', 'කොළඹ හොඳම මුහුදු ආහාර', 'ගාල්ලේ අඩු මිල ආහාර'],
  ta: ['கண்டியில் காதல் உணவகம்', 'கொழும்பில் கடல் உணவு', 'காலியில் மலிவு உணவு'],
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
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
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
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
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center"
        aria-label="Open chat assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">SL Eats Assistant</h3>
              <p className="text-white/70 text-xs">Find restaurants & reserve tables</p>
            </div>

            {/* Language toggle — clear pill buttons */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-2.5 py-1"
                title="Change language"
              >
                <span className="text-sm">{LANGUAGES[lang].flag}</span>
                <span className="text-white text-xs font-bold">{LANGUAGES[lang].label}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-border overflow-hidden min-w-[150px]">
                  <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border">
                    Select language
                  </div>
                  {(Object.entries(LANGUAGES) as [Lang, typeof LANGUAGES[Lang]][]).map(([code, l]) => (
                    <button
                      key={code}
                      onClick={() => changeLang(code)}
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition flex items-center gap-2.5 ${
                        lang === code ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label === 'EN' ? 'English' : l.label === 'සි' ? 'සිංහල' : 'தமிழ்'}</span>
                      {lang === code && <span className="ml-auto text-primary text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'assistant' ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot size={14} className="text-primary" />
                    : <User size={14} className="text-gray-500" />
                  }
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-gray-100 text-foreground rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mt-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mt-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested queries */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTED[lang].map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={LANGUAGES[lang].placeholder}
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
