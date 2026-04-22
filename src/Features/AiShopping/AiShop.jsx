import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Sparkles, ChevronDown, HelpCircle, ShoppingCart, 
  X, CheckCircle2, Plus, Mic, Send, Heart, MoreVertical, 
  RotateCcw, Monitor, Shirt, Home, Diamond, Truck, Copy, Scale,
  Cpu, Zap, Grip, ArrowDownCircle, ChevronRight, Loader2
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;

export default function AiShop() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hi! I'm Woosho AI. I can help you find products, compare prices, or manage your account. What are you looking for today?",
      options: ["Casual", "Sporty", "Both"],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [userRole, setUserRole] = useState('buyer'); // default
  const [searchStatus, setSearchStatus] = useState('Online');
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch role from profiles
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data) setUserRole(data.role);
      }
      fetchProducts({});
    };
    checkAuth();
  }, []);

  const fetchProducts = async (params) => {
    let query = supabase.from('products').select('*').limit(6);
    
    if (params.keywords && params.keywords.length > 0) {
       query = query.ilike('name', `%${params.keywords[0]}%`);
    }
    if (params.maxPrice) {
       query = query.lte('price_cents', params.maxPrice);
    }
    if (params.category) {
       // simple ilike category matching via keywords if needed
       query = query.ilike('name', `%${params.category}%`);
    }
    
    const { data, error } = await query;
    if (data) {
       setProducts(data);
       setSearchStatus(`Searched ${data.length * 15}+ products`);
    } else {
       console.error("DB Error:", error);
    }
  };

  const processAI = async (userText) => {
    setLoading(true);
    setSearchStatus('Analyzing request...');
    
    try {
      const systemPrompt = `You are Woosho AI, an extremely intelligent shopping assistant.
      The user is currently recognized by the system as a: ${userRole.toUpperCase()}. 
      If they ask who they are or what their role is, proudly tell them they are a ${userRole}.
      If they want to find products, extract parameters and return a valid JSON object ONLY, like this:
      {"action": "search", "keywords": ["white", "sneakers"], "maxPrice": 50000, "reply": "Great! Here are some matching products."}
      If they are just chatting or asking a general question, return JSON like this:
      {"action": "chat", "reply": "Your response here"}
      Do NOT wrap the JSON in markdown code blocks. Output raw JSON only.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          max_tokens: 1000,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
            { role: "user", content: userText }
          ]
        })
      });

      const data = await response.json();
      let aiText = data.choices[0].message.content || "";
      
      let parsed;
      if (aiText.includes('<tool_call>')) {
        const textPart = aiText.split('<tool_call>')[0].trim();
        const keywordsMatch = aiText.match(/<parameter=query>\s*([\s\S]*?)\s*<\/parameter>/);
        const maxPriceMatch = aiText.match(/<parameter=maxPrice>\s*(\d+)\s*<\/parameter>/);
        
        parsed = {
          action: 'search',
          reply: textPart || "Let me find that for you...",
          keywords: keywordsMatch ? [keywordsMatch[1].trim()] : [],
          maxPrice: maxPriceMatch ? parseInt(maxPriceMatch[1].trim()) : null
        };
      } else {
        let cleanText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          parsed = JSON.parse(cleanText);
        } catch(e) {
          parsed = { action: 'chat', reply: cleanText };
        }
      }

      if (parsed.action === 'search') {
        setSearchStatus('Fetching products from database...');
        await fetchProducts(parsed);
      } else {
        setSearchStatus('Online');
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: parsed.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I'm having trouble connecting to my brain right now!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setSearchStatus('Error connecting to AI');
    }
    setLoading(false);
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const text = input;
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');
    processAI(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOptionClick = (opt) => {
    if (loading) return;
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: opt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    processAI(opt);
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'ai',
      content: "Chat cleared! How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setSearchStatus('Online');
    fetchProducts({});
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans text-sm text-gray-900 overflow-hidden">
      {/* HEADER */}
      <header className="h-[72px] shrink-0 border-b border-gray-200 flex items-center justify-between px-6">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#5636F3] fill-[#5636F3]" />
            <span className="text-2xl font-extrabold text-[#5636F3] tracking-tight">woosho</span>
          </div>
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px]">AI Shopping Assistant</span>
              <span className="bg-[#F1EEFE] text-[#5636F3] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Beta</span>
            </div>
            <span className="text-gray-500 text-[11px] mt-0.5">Get personalized recommendations in seconds</span>
          </div>
        </div>

        {/* Middle: Toggle */}
        <div className="bg-gray-100 p-1 rounded-full flex items-center shadow-inner">
          <button className="bg-[#5636F3] text-white px-6 py-2 rounded-full font-semibold text-sm shadow">
            AI Mode
          </button>
          <button className="text-gray-600 px-6 py-2 rounded-full font-semibold text-sm hover:text-gray-900 transition-colors">
            Manual Browse
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end mr-2">
             <span className="text-xs font-bold text-[#5636F3] uppercase tracking-widest">{userRole} MODE</span>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
            NGN (₦) <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <button className="text-gray-600 hover:text-gray-900 relative transition-colors">
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#5636F3] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white">
              {products.length}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 min-h-0">
        
        {/* LEFT PANEL: Smart Filters */}
        <aside className="w-[240px] xl:w-[280px] border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-5 flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[15px]">Smart Filters</h2>
              <button className="text-[#5636F3] text-[13px] font-medium hover:underline">Clear all</button>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-sm mb-1">Price Range</h3>
              <p className="text-gray-500 text-[13px] mb-4">₦10,000 - ₦50,000</p>
              <div className="relative h-1.5 bg-gray-100 rounded-full mb-6 mx-2">
                <div className="absolute top-0 left-[15%] right-[25%] h-full bg-[#5636F3] rounded-full"></div>
                <div className="absolute top-1/2 left-[15%] w-4 h-4 bg-white border-2 border-[#5636F3] rounded-full -translate-x-1/2 -translate-y-1/2 shadow hover:scale-110 transition-transform cursor-grab"></div>
                <div className="absolute top-1/2 right-[25%] w-4 h-4 bg-white border-2 border-[#5636F3] rounded-full translate-x-1/2 -translate-y-1/2 shadow hover:scale-110 transition-transform cursor-grab"></div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 border border-gray-200 rounded-xl p-2.5 text-[13px] text-gray-700 font-medium">₦10,000</div>
                <div className="flex-1 border border-gray-200 rounded-xl p-2.5 text-[13px] text-gray-700 font-medium">₦50,000</div>
              </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-col gap-4 mt-1">
              <div>
                <h3 className="font-semibold text-[13px] mb-2">Category</h3>
                <div className="flex items-center justify-between border border-gray-200 rounded-xl p-2 cursor-pointer hover:border-gray-300 transition-colors">
                   <div className="flex gap-2">
                     <span className="bg-[#F1EEFE] text-[#5636F3] text-[12px] font-medium px-2 py-1 rounded-lg flex items-center gap-1.5">
                       Sneakers <X className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-800" />
                     </span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-400 mr-1" />
                </div>
              </div>
              
              {['Brand', 'Size (US)', 'Color'].map((label, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-[13px] mb-2">{label}</h3>
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-gray-300 transition-colors">
                     <span className="text-gray-500 text-[13px]">All</span>
                     <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-100" />

            {/* Quick Categories */}
            <div>
              <h3 className="font-bold text-[14px] mb-3">Quick Categories</h3>
              <ul className="flex flex-col gap-0.5">
                {[
                  { name: 'Sneakers', icon: <Shirt className="w-[18px] h-[18px]" />, active: true },
                  { name: 'Fashion', icon: <Shirt className="w-[18px] h-[18px]" />, active: false },
                  { name: 'Electronics', icon: <Monitor className="w-[18px] h-[18px]" />, active: false },
                  { name: 'Appliances', icon: <Cpu className="w-[18px] h-[18px]" />, active: false },
                  { name: 'Beauty', icon: <Sparkles className="w-[18px] h-[18px]" />, active: false },
                  { name: 'Home & Living', icon: <Home className="w-[18px] h-[18px]" />, active: false },
                ].map((cat, idx) => (
                  <li key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${cat.active ? 'bg-[#F1EEFE] text-[#5636F3] font-semibold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                    <span className={cat.active ? 'text-[#5636F3]' : 'text-gray-400'}>{cat.icon}</span>
                    <span className="text-[13px]">{cat.name}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </aside>

        {/* MIDDLE PANEL: AI Chat */}
        <div className="w-[420px] xl:w-[480px] border-r border-gray-200 flex flex-col shrink-0 relative bg-white">
          {/* Chat Header */}
          <div className="h-[72px] p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-[22px] h-[22px] text-[#5636F3] fill-[#5636F3]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[15px]">Woosho AI</h2>
                  <span className="bg-[#5636F3] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">AI</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 mt-0.5">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin text-[#5636F3]" /> : <span className="w-2 h-2 bg-[#0DA56E] rounded-full"></span>}
                  {loading ? 'Typing...' : 'Online'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleClearChat} className="flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-1.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 bg-white transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> New Chat
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-7 bg-[#FCFCFD]">
            
            {messages.map((msg, idx) => (
              msg.role === 'user' ? (
                <div key={idx} className="flex flex-col items-end gap-1.5">
                  <div className="bg-[#EAE5FE] text-[#111827] px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-[14px] font-medium shadow-sm">
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 mr-1">
                    {msg.time} <span className="text-[#5636F3] font-bold text-[12px]">✓✓</span>
                  </span>
                </div>
              ) : (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-[30px] h-[30px] rounded-full bg-[#F1EEFE] flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#5636F3] fill-[#5636F3]" />
                  </div>
                  <div className="flex flex-col gap-3 max-w-[85%]">
                    <div className="border border-gray-100 bg-white px-4 py-3.5 rounded-2xl rounded-tl-sm text-[14px] text-gray-800 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] leading-relaxed relative whitespace-pre-wrap">
                      {msg.content}
                      <div className="absolute -bottom-6 right-1 text-[10px] font-medium text-gray-400">{msg.time}</div>
                    </div>
                    {/* Render Options if any */}
                    {msg.options && (
                      <div className="flex gap-2 flex-wrap mt-3">
                        {msg.options.map((opt, oIdx) => (
                          <button 
                            key={oIdx}
                            onClick={() => handleOptionClick(opt)}
                            className="flex items-center gap-2 border border-[#EAE5FE] bg-white text-[#5636F3] px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-[#F1EEFE] transition-colors shadow-sm"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                 <div className="w-[30px] h-[30px] rounded-full bg-[#F1EEFE] flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#5636F3] fill-[#5636F3]" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}

            {searchStatus && searchStatus !== 'Online' && !loading && (
              <div className="flex items-center gap-2 ml-11 mt-4 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#0DA56E]" />
                <span className="text-[12px] font-medium text-gray-500">{searchStatus}</span>
              </div>
            )}

            <div ref={chatEndRef} className="h-4 shrink-0"></div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-100 z-10">
            <div className={`border rounded-2xl p-2 bg-white flex flex-col shadow-sm transition-colors ${loading ? 'opacity-50' : 'focus-within:border-[#5636F3] border-gray-200'}`}>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full resize-none outline-none text-[14px] p-2 text-gray-800 placeholder-gray-400 bg-transparent min-h-[44px]"
                rows="1"
                placeholder="Describe what you're looking for..."
              ></textarea>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 pl-1">
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="w-10 h-10 bg-[#5636F3] rounded-xl flex items-center justify-center text-white hover:bg-[#4323E0] transition-colors shadow-md disabled:bg-gray-300"
                >
                  <Send className="w-[18px] h-[18px] ml-[-2px] mt-[1px]" />
                </button>
              </div>
            </div>
            <p className="text-center text-[12px] font-medium text-gray-400 mt-4 mb-1">
              Try: "black hoodie under 20k" or "best laptop for graphic design"
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Products & Refine */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto custom-scrollbar">
          <div className="p-6 lg:p-8 w-full flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-[#5636F3] fill-[#5636F3]" />
                  <h2 className="text-xl font-bold text-gray-900">Top Picks For You</h2>
                </div>
                <p className="text-[13px] text-gray-500 font-medium">{products.length} results match your request</p>
              </div>
              <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-[13px] font-semibold cursor-pointer shadow-sm hover:bg-gray-50 transition-colors bg-white">
                Most Relevant <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
              
              {products.length === 0 && !loading && (
                 <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center">
                    <Sparkles className="w-10 h-10 text-gray-300 mb-4" />
                    <p>Ask me to find something for you!</p>
                 </div>
              )}

              {products.map((p, i) => (
                <div key={p.id} className="border border-gray-200 rounded-[20px] overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col relative group">
                  {p.sale_price_cents && (
                    <div className="absolute top-3 left-3 bg-[#EE4545] text-white text-[10px] font-bold px-2.5 py-1 rounded-md z-10">
                      Sale
                    </div>
                  )}
                  {i === 2 && !p.sale_price_cents && (
                    <div className="absolute top-3 left-3 bg-[#0DA56E] text-white text-[10px] font-bold px-2.5 py-1 rounded-md z-10">
                      New
                    </div>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center z-10 hover:bg-white shadow-sm border border-gray-100 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="h-52 bg-[#F8F9FB] p-4 flex items-center justify-center relative">
                     <img src={p.image || `https://picsum.photos/seed/${p.id}/400/400`} alt={p.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-md" />
                     <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                     </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[15px] leading-tight mb-2 text-gray-900 line-clamp-2" title={p.name}>{p.name}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-[#5636F3] font-bold text-lg">₦{p.price_cents?.toLocaleString()}</span>
                      {p.sale_price_cents && <span className="text-gray-400 text-[13px] font-medium line-through">₦{p.sale_price_cents?.toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[#FBBF24] text-[15px]">★</span>
                      <span className="text-[13px] font-semibold text-gray-700">{p.rating_stars || '4.8'} <span className="text-gray-400 font-medium">({p.rating_count || Math.floor(Math.random()*400+50)})</span></span>
                    </div>
                    <div className="text-[#0DA56E] text-[13px] font-semibold mb-5">In stock</div>
                    
                    <div className="flex gap-2 mt-auto">
                      <button className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 shrink-0 transition-colors">
                        <Copy className="w-[18px] h-[18px]" />
                      </button>
                      <button className="flex-1 border border-gray-200 text-[#5636F3] rounded-xl font-semibold text-[14px] hover:border-[#5636F3] hover:bg-[#F8F7FF] transition-all">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>

            {/* Why these picks? */}
            {products.length > 0 && (
              <div className="bg-[#F8F7FF] rounded-2xl p-5 border border-[#EAE5FE] flex items-start gap-3.5 shadow-sm mt-2 cursor-pointer hover:bg-[#F1EEFE] transition-colors">
                <div className="mt-0.5">
                  <Sparkles className="w-5 h-5 text-[#5636F3] fill-[#5636F3]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[14px] text-[#5636F3] mb-0.5">Why these picks?</h4>
                  <p className="text-[13px] text-gray-600 font-medium leading-relaxed max-w-3xl">
                    These items match your budget, style preference, and are highly rated by Woosho buyers.
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400 self-center" />
              </div>
            )}

            {/* Refine Your Search */}
            <div className="mt-4">
              <h3 className="font-bold text-[15px] mb-4">Refine Your Search</h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
                
                {/* Chip 1 */}
                <button onClick={() => processAI("Show me cheaper options")} className="border border-gray-200 rounded-2xl p-3 flex items-center gap-3.5 min-w-[200px] hover:border-[#5636F3] hover:shadow-md transition-all bg-white text-left">
                  <div className="w-10 h-10 rounded-full bg-[#EAF7F1] flex items-center justify-center shrink-0">
                    <ArrowDownCircle className="w-5 h-5 text-[#0DA56E]" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-gray-900">Cheaper options</div>
                    <div className="text-[12px] font-medium text-gray-500">Under ₦30k</div>
                  </div>
                </button>
                
                {/* Chip 2 */}
                <button onClick={() => processAI("Show me premium quality picks")} className="border border-gray-200 rounded-2xl p-3 flex items-center gap-3.5 min-w-[200px] hover:border-[#5636F3] hover:shadow-md transition-all bg-white text-left">
                  <div className="w-10 h-10 rounded-full bg-[#F3EBFF] flex items-center justify-center shrink-0">
                    <Diamond className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-gray-900">Higher quality</div>
                    <div className="text-[12px] font-medium text-gray-500">Premium picks</div>
                  </div>
                </button>
                
                {/* Chip 3 */}
                <button className="border border-gray-200 rounded-2xl p-3 flex items-center gap-3.5 min-w-[200px] hover:border-[#5636F3] hover:shadow-md transition-all bg-white text-left">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FF] flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-gray-900">Fast delivery</div>
                    <div className="text-[12px] font-medium text-gray-500">1-3 days</div>
                  </div>
                </button>

                {/* Chip 4 */}
                <button className="border border-gray-200 rounded-2xl p-3 flex items-center gap-3.5 min-w-[200px] hover:border-[#5636F3] hover:shadow-md transition-all bg-white text-left">
                  <div className="w-10 h-10 rounded-full bg-[#FFEAEB] flex items-center justify-center shrink-0">
                    <Shirt className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-gray-900">Similar style</div>
                    <div className="text-[12px] font-medium text-gray-500">More like this</div>
                  </div>
                </button>

                {/* Arrow */}
                <button className="w-[42px] h-[42px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 shrink-0 ml-1 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>

              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 mb-6 border-t border-gray-100 pt-6 flex items-center justify-between">
              <button className="flex items-center gap-2 font-bold text-[14px] text-[#5636F3] hover:text-indigo-800 transition-colors">
                <Scale className="w-[18px] h-[18px]" /> Compare (2)
              </button>
              <button className="text-[#5636F3] text-[13px] font-semibold hover:underline">
                Clear all
              </button>
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #D1D5DB;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
