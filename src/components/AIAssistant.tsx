import React from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Scale, FileText, Trash2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '⚖️', label: 'Bail Application', prompt: 'IPC Section 302 के case में bail application ke liye kya grounds hote hain? Hindi mein batayein.' },
  { icon: '📋', label: 'Section Explain', prompt: 'IPC Section 498A aur Section 304B mein kya antar hai? Punishment aur bail ke saath explain karein.' },
  { icon: '🏛️', label: 'Anticipatory Bail', prompt: 'Anticipatory bail ke liye BNSS Section 438 ke under kya conditions hain? Draft grounds bhi batayein.' },
  { icon: '📝', label: 'Legal Notice', prompt: 'Cheque bounce ke case mein NI Act Section 138 ke under legal notice ka draft banayein.' },
  { icon: '⏱️', label: 'Limitation', prompt: 'Civil suit file karne ki limitation period kya hai aur kab se count hoti hai?' },
  { icon: '🔍', label: 'Evidence Rules', prompt: 'Criminal case mein circumstantial evidence ko accept karne ke liye Supreme Court ne kya rules diye hain?' },
  { icon: '👨‍⚖️', label: 'Maintenance', prompt: 'CrPC Section 125 ya BNSS ke under maintenance case mein kya prove karna hota hai? Important cases bhi batayein.' },
  { icon: '🛡️', label: 'Quashing FIR', prompt: 'High Court mein FIR quash karne ke grounds kya hain? Important Supreme Court cases ke saath batayein.' },
];

const callGemini = async (messages: Message[], userMessage: string): Promise<string> => {
  const apiKey = (window as any).__GEMINI_KEY__ || import.meta.env?.VITE_GEMINI_API_KEY || '';

  const systemPrompt = `You are an expert Indian legal assistant helping advocates in India. You have deep knowledge of:
- Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS) 2023
- Code of Criminal Procedure (CrPC) and Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
- Indian Evidence Act and Bharatiya Sakshya Adhiniyam (BSA) 2023
- Code of Civil Procedure (CPC)
- Constitution of India with latest amendments
- Supreme Court and High Court landmark judgments
- POCSO Act, Domestic Violence Act, Dowry Prohibition Act
- Hindu Marriage Act, Muslim Personal Law
- Motor Vehicles Act, Negotiable Instruments Act

Rules:
- Respond in the same language the user asks (Hindi or English or Hinglish)
- Always cite relevant sections and landmark cases
- Be specific and practical - this is for court use
- For legal notice drafts, provide actual draft content
- Mention punishment, bail status, compoundability for criminal sections
- Keep responses structured with headings when needed`;

  const history = messages.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });

  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, response generate nahi ho paya. Please try again.';
};

export const AIAssistant = () => {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '🙏 Namaskar! Main aapka AI Legal Assistant hoon.\n\nMain aapki help kar sakta hoon:\n• **IPC/BNSS sections** explain karne mein\n• **Bail application** ke grounds\n• **Legal notices** draft karne mein\n• **Case strategy** suggest karne mein\n• **Landmark judgments** batane mein\n\nKuch bhi poochein — Hindi ya English mein!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await callGemini(messages, msg);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ Network error. Please check internet connection and try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative overflow-hidden p-6 shrink-0"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1035 100%)' }}>
        <div className="absolute top-2 right-4 opacity-10">
          <Sparkles size={80} className="text-purple-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-purple-400">Powered by Gemini AI</p>
              <h2 className="text-2xl font-display font-bold text-white">Legal AI Assistant</h2>
            </div>
          </div>
          <p className="text-zinc-400 text-sm mt-2">IPC, BNSS, BSA, CPC — sab kuch poochein</p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-3 bg-white border-b overflow-x-auto shrink-0">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p.label} onClick={() => send(p.prompt)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all whitespace-nowrap">
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
        {messages.map(m => (
          <motion.div key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
              m.role === 'user' ? 'bg-legal-green' : 'bg-gradient-to-br from-purple-500 to-indigo-600')}>
              {m.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            <div className={cn('max-w-[80%] group', m.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                m.role === 'user'
                  ? 'bg-legal-green text-white rounded-tr-sm'
                  : 'bg-white text-zinc-800 rounded-tl-sm border border-zinc-100')}>
                <div dangerouslySetInnerHTML={{ __html: formatContent(m.content) }} />
              </div>
              {m.role === 'assistant' && (
                <button onClick={() => handleCopy(m.id, m.content)}
                  className="mt-1 flex items-center gap-1 px-2 py-1 text-[10px] text-zinc-400 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-all">
                  {copied === m.id ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-zinc-100 shadow-sm">
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
                <span className="text-xs text-zinc-400 ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t shrink-0">
        <div className="flex gap-3 items-end">
          <button onClick={() => setMessages([messages[0]])}
            className="p-3 text-zinc-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all shrink-0">
            <Trash2 size={18} />
          </button>
          <div className="flex-1 flex items-end gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-purple-400 transition-colors">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Legal question poochein... (Enter to send)"
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none resize-none max-h-32"
              style={{ lineHeight: '1.5' }}
            />
          </div>
          <button onClick={() => send()}
            disabled={!input.trim() || loading}
            className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:opacity-90 disabled:opacity-40 transition-all shrink-0">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
