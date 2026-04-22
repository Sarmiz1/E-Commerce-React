import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../Context/theme/ThemeContext';
import { BIcon } from './BuyerIcon';
import { ProductResult } from './ProductResult';
import { useBuyerAIChat } from '../hooks/useBuyerAIChat';
import { AI_CHAT_SUGGESTIONS } from '../data/buyerData';

function ChatHeader({ colors }) {
  return (
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
  );
}

function ChatInput({ input, setInput, sendMessage, loading, colors, isDark }) {
  return (
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
  );
}

function ChatPanel({ messages, loading, typingMsg, sendMessage, input, setInput, chatRef, colors, isDark }) {
  return (
    <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden shadow-sm"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
      
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

      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {AI_CHAT_SUGGESTIONS.map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            className="text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-colors hover:opacity-80"
            style={{ background: isDark ? 'rgba(102,126,234,0.12)' : 'rgba(102,126,234,0.08)', color: '#667eea' }}>
            {s}
          </button>
        ))}
      </div>

      <ChatInput input={input} setInput={setInput} sendMessage={sendMessage} loading={loading} colors={colors} isDark={isDark} />
    </div>
  );
}

function ResultsPanel({ results, sendMessage, colors }) {
  return (
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
  );
}

export default function BuyerAI() {
  const { colors, isDark } = useTheme();
  const {
    messages, input, setInput,
    loading, typingMsg, results,
    chatRef, sendMessage
  } = useBuyerAIChat();

  return (
    <div className="space-y-4">
      <ChatHeader colors={colors} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-[520px]">
        <ChatPanel 
          messages={messages} loading={loading} typingMsg={typingMsg} 
          sendMessage={sendMessage} input={input} setInput={setInput} 
          chatRef={chatRef} colors={colors} isDark={isDark} 
        />
        <ResultsPanel results={results} sendMessage={sendMessage} colors={colors} />
      </div>
    </div>
  );
}
