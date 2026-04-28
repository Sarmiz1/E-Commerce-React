import { useState, useCallback } from "react";

export function useCompare() {
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = useCallback((product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  }, []);

  const removeCompare = useCallback((id) => {
    setCompareList((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return {
    compareList,
    showCompare,
    setShowCompare,
    toggleCompare,
    removeCompare,
    clearCompare
  };
}
