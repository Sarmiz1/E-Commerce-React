import { useCallback, useEffect, useRef } from "react";

export function useDebounceCallback(callback, delay = 500) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  const argsRef = useRef([]);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (!timeoutRef.current) return;

    cancel();
    callbackRef.current(...argsRef.current);
  }, [cancel]);

  const run = useCallback(
    (...args) => {
      argsRef.current = args;

      cancel();

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...argsRef.current);
      }, delay);
    },
    [cancel, delay],
  );

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { run, cancel, flush };
}