import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = "woosho_onboarding_v2";

const DEFAULT_STATE = {
  role: null,        // 'buyer' | 'seller'
  currentStep: 1,
  completedSteps: [],
  data: {
    b1: {}, b2: { categories: [], budget: "mid", vibe: [] }, b3: {}, b4: { payMethod: "skip" },
    s1: {}, s2: {}, s3: { accentColor: "#F5A623" }, s4: { sellsWhat: [], shipRegions: [], storeType: "online", fulfillment: "self" }, s5: {},
  },
};

const loadState = () => {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? { ...DEFAULT_STATE, ...JSON.parse(r) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
};

const persistState = (s) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Onboarding can continue if storage is unavailable.
  }
};

export function useOnboarding(user, onComplete) {
  const [state, setState] = useState(loadState);
  const [isDone, setIsDone] = useState(false);

  // Sync state to localStorage on every change
  useEffect(() => {
    persistState(state);
  }, [state]);

  const handleRoleSelect = useCallback((role) => {
    setState((s) => ({ ...s, role, currentStep: 1, completedSteps: [] }));
  }, []);

  const saveStep = useCallback((stepId, data, skip = false) => {
    setState((s) => {
      const next = { ...s };
      if (!skip && data) {
        next.data[stepId] = { ...next.data[stepId], ...data };
      }
      if (!next.completedSteps.includes(stepId)) {
        next.completedSteps = [...next.completedSteps, stepId].sort();
      }
      
      const numSteps = s.role === "buyer" ? 4 : 5;
      if (next.completedSteps.length >= numSteps) {
        setIsDone(true);
        setTimeout(() => onComplete?.(next.role, next.data), 2000);
      } else {
        // Find next incomplete step
        for (let i = 1; i <= numSteps; i++) {
          const id = `${s.role.charAt(0)}${i}`;
          if (!next.completedSteps.includes(id)) {
            next.currentStep = i;
            break;
          }
        }
      }
      return next;
    });
  }, [onComplete]);

  const setCurrentStep = useCallback((stepIndex) => {
    setState(s => ({ ...s, currentStep: stepIndex }));
  }, []);

  const getStepId = useCallback((index) => {
    return state.role ? `${state.role.charAt(0)}${index}` : null;
  }, [state.role]);

  return {
    state,
    isDone,
    handleRoleSelect,
    saveStep,
    setCurrentStep,
    getStepId
  };
}
