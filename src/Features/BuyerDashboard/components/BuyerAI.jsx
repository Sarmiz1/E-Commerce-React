import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { useBuyer } from '../context/BuyerContext';
import { RECOMMENDATIONS , AI_CHAT_SUGGESTIONS } from '../data/buyerData';
import { fmtFull } from '../utils/fmt';
import { BIcon } from './BuyerIcon';

const AI_RESPONSES = {
  default: {
    text: "I found some great matches for you! Here are my top picks based on your preferences and budget.",
    products: RECOMMENDATIONS,
  },
  sneakers: {
    text: "Based on your EU 42 size and past Nike purchases, here are the best sneakers under your budget:",
    products: RECOMMENDATIONS.filter(r => r.category === 'Footwear'),
  },
  shirts: {
    text: "You prefer M-size shirts and have bought similar items before. Here are the best work shirts:",
    products: RECOMMENDATIONS.filter(r => r.category === 'Fashion'),
  },
  tech: {
    text: "Based on your Wireless Earbuds purchase, here are compatible tech products you'll love:",
    products: RECOMMENDATIONS.filter(r => r.category === 'Tech'),
  },
};

const TYPING_MSGS = [
  '✦ Analyzing your style preferences…',
  '✦ Checking your size profile…',
  '✦ Filtering by your budget range…',
  '✦ Applying purchase history…',
  '✦ Finding best matches…',
];

function getAIResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('sneaker') || q.includes('shoe') || q.includes('footwear')) return AI_RESPONSES.sneakers;
  if (q.includes('shirt') || q.includes('fashion') || q.includes('cloth')) return AI_RESPONSES.shirts;
  if (q.includes('tech') || q.includes('gadget') || q.includes('earbu')) return AI_RESPONSES.tech;
  return AI_RESPONSES.default;
}

function ProductResult({ item, delay }) {
  const { colors, isDark } = useTheme();
  const [added, setAdded] = useState(false);
  const hue = item.name.charCodeAt(0) * 7 % 360;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.35 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-opacity"
      style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.subtle}` }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: `hsl(${hue}, 45%, ${isDark ? '15%' : '94%'})` }}>
        {item.category === 'Footwear' ? '👟' : item.category === 'Tech' ? '🎧' : '👕'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: colors.text.primary }}>{item.name}</p>
        <p className="text-[10px] mt-0.5 truncate" style={{ color: colors.text.tertiary }}>{item.reason}</p>
        <p className="text-sm font-black mt-0.5" style={{ color: '#667eea' }}>{fmtFull(item.price)}</p>
      </div>
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
        onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1600); }}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: added ? 'rgba(5,150,105,0.12)' : 'linear-gradient(135deg,#667eea,#764ba2)', color: added ? '#059669' : '#fff' }}>
        <BIcon name={added ? 'check' : 'plus'} size={14} />
      </motion.button>
    </motion.div>
  );
}

export default function BuyerAI() {
  const { colors, isDark } = useTheme();
  const { recommendations: RECOMMENDATIONS } = useBuyer();

  const AI_RESPONSES = {
    default: {
      text: "I found some great matches for you! Here are my top picks based on your preferences and budget.",
      products: RECOMMENDATIONS || [],
    },
    sneakers: {
      text: "Based on your EU 42 size and past Nike purchases, here are the best sneakers under your budget:",
      products: (RECOMMENDATIONS || []).filter(r => r.category === 'Footwear'),
    },
    shirts: {
      text: "You prefer M-size shirts and have bought similar items before. Here are the best work shirts:",
      products: (RECOMMENDATIONS || []).filter(r => r.category === 'Fashion'),
    },
    tech: {
      text: "Based on your Wireless Earbuds purchase, here are compatible tech products you'll love:",
      products: (RECOMMENDATIONS || []).filter(r => r.category === 'Tech'),
    },
  };

  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi Samuel! I'm your personal shopping AI. Tell me what you're looking for — I already know your size, budget preferences, and what you love. 🎯" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingMsg, setTypingMsg] = useState('');
  const [results, setResults] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    setResults(null);

    // Simulate AI typing sequence
    for (let i = 0; i < TYPING_MSGS.length; i++) {
      await new Promise(r => setTimeout(r, 380));
      setTypingMsg(TYPING_MSGS[i]);
    }

    const response = getAIResponse(msg);
    await new Promise(r => setTimeout(r, 400));

    setLoading(false);
    setTypingMsg('');
    setMessages(prev => [...prev, { role: 'ai', text: response.text }]);
    setResults(response.products);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          <BIcon name="sparkle" size={18} style={{ color: '#fff' }} />
        </div>
        <div>
          <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>My AI Shopping Assistant</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
              className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>Active · Knows your preferences</p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-[520px]">
        {/* Chat panel */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden shadow-sm"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          {/* Messages */}
          <div ref={chatRef} className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 400 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-xl mr-2 flex-shrink-0 flex items-center justify-center text-xs"
                      style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 900 }}>✦</div>
                  )}
                  <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'user' ? 'linear-gradient(135deg,#667eea,#764ba2)' : (isDark ? colors.surface.tertiary : '#F3F4F6'),
                      color: msg.role === 'user' ? '#fff' : colors.text.primary,
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 900 }}>✦</div>
                <div className="px-3.5 py-2.5 rounded-2xl text-xs font-semibold" style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', color: '#667eea', borderRadius: '18px 18px 18px 4px' }}>
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>{typingMsg || '…'}</motion.span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggestions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
            {AI_CHAT_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-colors hover:opacity-80"
                style={{ background: isDark ? 'rgba(102,126,234,0.12)' : 'rgba(102,126,234,0.08)', color: '#667eea' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 pt-2">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{ background: isDark ? colors.surface.tertiary : '#F3F4F6', border: `1.5px solid ${colors.border.default}` }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: colors.text.primary }}
              />
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() && !loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: input.trim() ? 'linear-gradient(135deg,#667eea,#764ba2)' : colors.surface.tertiary, color: '#fff' }}>
                <BIcon name="send" size={14} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
            <span className="text-sm">✦</span>
            <p className="font-bold text-sm" style={{ color: colors.text.primary }}>
              {results ? `${results.length} Smart Picks` : 'Ask me to find products'}
            </p>
            {results && (
              <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>AI Curated</span>
            )}
          </div>

          <div className="flex-1 p-4">
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
                <motion.div animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#667eea20,#764ba220)' }}>
                  <BIcon name="sparkle" size={28} style={{ color: '#667eea' }} />
                </motion.div>
                <p className="text-sm font-semibold text-center" style={{ color: colors.text.tertiary }}>
                  Start a conversation and I'll find the perfect products for you in real time.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {AI_CHAT_SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-opacity"
                      style={{ background: 'rgba(102,126,234,0.08)', color: '#667eea', border: '1px solid rgba(102,126,234,0.2)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {results.map((item, i) => <ProductResult key={item.id} item={item} delay={i * 0.1} />)}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
