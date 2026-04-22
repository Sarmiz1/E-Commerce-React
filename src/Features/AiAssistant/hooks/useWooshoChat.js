import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { callWooshoAI } from '../aiEngine';

export function useWooshoChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);
  const [userRole, setUserRole] = useState("buyer");

  const [messages, setMessages] = useState([{
    id: "init", role: "assistant",
    text: "Hi! I'm Woosho AI.\n\nTell me what you're looking for — a budget, style, or product — and I'll find it from our live catalog instantly.",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    productIds: [], actions: [],
  }]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);

  const addToCart = useCallback((product) => {
    setCartItems(prev => prev.some(p => p.id === product.id) ? prev : [...prev, product]);
  }, []);
  const removeFromCart = useCallback((id) => setCartItems(prev => prev.filter(p => p.id !== id)), []);

  const handleCheckout = useCallback(() => {
    setIsOpen(false);
    navigate("/checkout");
  }, [navigate]);

  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;
    setInput("");

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: Date.now(), role: "user", text, time, productIds: [], actions: [] };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    if (/\b(my cart|show cart|cart)\b/i.test(text)) {
      setIsLoading(false);
      setShowCart(true);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant",
        text: cartItems.length ? `You have ${cartItems.length} item${cartItems.length > 1 ? "s" : ""} in your cart.` : "Your cart is empty. Want me to find something?",
        time, productIds: [], actions: [],
      }]);
      return;
    }

    const nextHistory = [...apiHistory, { role: "user", content: text }];
    setApiHistory(nextHistory);

    try {
      const { text: aiText, productIds, actions } = await callWooshoAI(nextHistory, userRole);

      actions?.filter(a => a.type === "add_to_cart").forEach(a => {
        const p = window.__WOOSHO_CACHE__?.[a.productId];
        if (p) addToCart(p);
      });

      if (actions?.some(a => a.type === "checkout")) {
        setTimeout(handleCheckout, 1200);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant", text: aiText, productIds, actions, time,
      }]);
      setApiHistory(h => [...h, { role: "assistant", content: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant", isError: true,
        text: "Sorry, I couldn't connect right now. Please try again.", time, productIds: [], actions: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiHistory, userRole, cartItems, addToCart, handleCheckout]);

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return {
    isOpen, setIsOpen,
    showCart, setShowCart,
    isLoading,
    input, setInput,
    cartItems, addToCart, removeFromCart,
    messages,
    bottomRef, inputRef,
    sendMessage, handleKey, handleCheckout,
    setUserRole,
  };
}
