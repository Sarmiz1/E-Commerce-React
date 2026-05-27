import { useState, useEffect } from "react";

export function useTimeContext() {
  const [context, setContext] = useState({
    greeting: "Discover",
    sub: "Products",
    theme: "from-blue-600 via-indigo-700 to-violet-800",
    glow: "bg-blue-400/25"
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setContext({
        greeting: "Good Morning.",
        sub: "Start Your Day",
        theme: "from-amber-500 via-orange-600 to-rose-600",
        glow: "bg-amber-400/30",
      });
    } else if (hour >= 12 && hour < 17) {
      setContext({
        greeting: "Good Afternoon.",
        sub: "Midday Finds",
        theme: "from-blue-500 via-indigo-600 to-purple-700",
        glow: "bg-blue-400/30",
      });
    } else if (hour >= 17 && hour < 21) {
      setContext({
        greeting: "Good Evening.",
        sub: "Evening Luxury",
        theme: "from-violet-700 via-purple-900 to-indigo-950",
        glow: "bg-violet-500/30",
      });
    } else {
      setContext({
        greeting: "Late Night Finds.",
        sub: "Midnight Drops",
        theme: "from-gray-900 via-indigo-950 to-slate-900",
        glow: "bg-indigo-500/20",
      });
    }
  }, []);

  return context;
}
