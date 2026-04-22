import { useState, useRef, useEffect } from 'react';
import { useBuyer } from '../context/BuyerContext';

const TYPING_MSGS = [
  '✦ Analyzing your style preferences…',
  '✦ Checking your size profile…',
  '✦ Filtering by your budget range…',
  '✦ Applying purchase history…',
  '✦ Finding best matches…',
];

export function useBuyerAIChat() {
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

  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('sneaker') || q.includes('shoe') || q.includes('footwear')) return AI_RESPONSES.sneakers;
    if (q.includes('shirt') || q.includes('fashion') || q.includes('cloth')) return AI_RESPONSES.shirts;
    if (q.includes('tech') || q.includes('gadget') || q.includes('earbu')) return AI_RESPONSES.tech;
    return AI_RESPONSES.default;
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

  return {
    messages, input, setInput,
    loading, typingMsg, results,
    chatRef, sendMessage
  };
}
