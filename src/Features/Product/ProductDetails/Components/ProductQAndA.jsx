import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";

function storageKey(productId) {
  return `WooSho-qna-${productId}`;
}

function loadQuestions(product) {
  try {
    const saved = localStorage.getItem(storageKey(product.id));
    if (saved) return JSON.parse(saved);
  } catch {
    // fall through to seeds
  }

  return [
    {
      id: "seed-q-1",
      name: "Maya",
      question: "Is this product good for everyday use?",
      answer: "Yes. The seller lists it as a daily-use item and recent buyers call out comfort and reliability.",
      helpful: 18,
    },
    {
      id: "seed-q-2",
      name: "David",
      question: "How fast does it usually ship?",
      answer: "Most orders ship within 24 hours, with delivery timing shown near checkout.",
      helpful: 11,
    },
  ];
}

export default function ProductQAndA({ product }) {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState(() => loadQuestions(product));
  const sellerName = product.seller?.store_name || "WooSho seller";

  const highlighted = useMemo(() => questions.slice(0, 4), [questions]);

  const submitQuestion = (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    const next = {
      id: `q-${Date.now()}`,
      name: "You",
      question: question.trim(),
      answer: `${sellerName} will answer this soon.`,
      helpful: 0,
      pending: true,
    };
    const updated = [next, ...questions];
    setQuestions(updated);
    setQuestion("");

    try {
      localStorage.setItem(storageKey(product.id), JSON.stringify(updated));
    } catch {
      // Keep in-memory if storage is unavailable.
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-white/5 bg-white/[0.025] p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "var(--gold)" }}>
            Buyer questions
          </p>
          <h2 className="pd-display mt-2 text-3xl font-light" style={{ color: "var(--cream)" }}>
            Q&A
          </h2>
        </div>
        <MessageCircle className="h-6 w-6" style={{ color: "var(--gold)" }} />
      </div>

      <div className="space-y-3">
        {highlighted.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-white/5 bg-black/10 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black" style={{ color: "var(--gold)" }}>
                Q
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--platinum)" }}>
                  {item.question}
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--silver)" }}>
                  {item.answer}
                </p>
                <p className="mt-2 text-[10px]" style={{ color: "var(--mist)" }}>
                  Asked by {item.name} · {item.pending ? "pending seller reply" : `${item.helpful} shoppers found this helpful`}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <form onSubmit={submitQuestion} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
          placeholder="Ask a product question"
          style={{ color: "var(--platinum)" }}
        />
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider"
          style={{ background: "var(--gold)", color: "var(--obsidian)" }}
          type="submit"
        >
          <Send className="h-4 w-4" />
          Ask
        </button>
      </form>
    </section>
  );
}

