// src/Features/Orders/Tracking/hooks/useTrackingSearch.js
// ─── All search input state and actions ───────────────────────────────────────

import { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useTrackingSearch() {
  const [params] = useSearchParams();

  const initialId = params.get('id') || sessionStorage.getItem('tr-last-id') || '';
  const [inputVal, setInputVal]   = useState(initialId);
  const [trackedId, setTrackedId] = useState(initialId || null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  const doSearch = useCallback((idOverride) => {
    const id = (idOverride ?? inputVal).trim();
    if (!id) return;
    setIsSearching(true);
    setTrackedId(id);
    sessionStorage.setItem('tr-last-id', id);
    setTimeout(() => setIsSearching(false), 800);
  }, [inputVal]);

  const doClear = useCallback(() => {
    setTrackedId(null);
    setInputVal('');
    sessionStorage.removeItem('tr-last-id');
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  return {
    inputVal,
    setInputVal,
    trackedId,
    isSearching,
    doSearch,
    doClear,
    inputRef,
  };
}
