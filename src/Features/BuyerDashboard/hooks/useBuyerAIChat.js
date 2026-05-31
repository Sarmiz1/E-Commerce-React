import { useEffect, useRef, useState } from "react";
import { useBuyer } from "../context/BuyerContext";

const TYPING_MSGS = [
  "Analyzing available products...",
  "Checking matching categories...",
  "Filtering search results...",
  "Comparing recommendations...",
  "Finding best matches...",
];

export function useBuyerAIChat() {
  const { profile, recommendations = [] } = useBuyer();
  const firstName = profile?.firstName ? ` ${profile.firstName}` : "";

  const responses = {
    default: {
      text: "I found some products that match your search. Here are the current recommendations.",
      products: recommendations,
    },
    sneakers: {
      text: "Here are the footwear recommendations matching your search:",
      products: recommendations.filter((item) => item.category === "Footwear"),
    },
    shirts: {
      text: "Here are the fashion recommendations matching your search:",
      products: recommendations.filter((item) => item.category === "Fashion"),
    },
    tech: {
      text: "Here are the tech recommendations matching your search:",
      products: recommendations.filter((item) => item.category === "Tech"),
    },
  };

  const getResponse = (query) => {
    const normalizedQuery = query.toLowerCase();
    if (
      normalizedQuery.includes("sneaker") ||
      normalizedQuery.includes("shoe") ||
      normalizedQuery.includes("footwear")
    ) {
      return responses.sneakers;
    }
    if (
      normalizedQuery.includes("shirt") ||
      normalizedQuery.includes("fashion") ||
      normalizedQuery.includes("cloth")
    ) {
      return responses.shirts;
    }
    if (
      normalizedQuery.includes("tech") ||
      normalizedQuery.includes("gadget") ||
      normalizedQuery.includes("earbu")
    ) {
      return responses.tech;
    }
    return responses.default;
  };

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hi${firstName}! Tell me what you are looking for and I will search the available recommendations.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMsg, setTypingMsg] = useState("");
  const [results, setResults] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message) return;
    setInput("");

    setMessages((previous) => [...previous, { role: "user", text: message }]);
    setLoading(true);
    setResults(null);

    for (const typingMessage of TYPING_MSGS) {
      await new Promise((resolve) => setTimeout(resolve, 380));
      setTypingMsg(typingMessage);
    }

    const response = getResponse(message);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setLoading(false);
    setTypingMsg("");
    setMessages((previous) => [...previous, { role: "ai", text: response.text }]);
    setResults(response.products);
  };

  return {
    messages,
    input,
    setInput,
    loading,
    typingMsg,
    results,
    chatRef,
    sendMessage,
  };
}
