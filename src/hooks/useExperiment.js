import { useEffect, useState } from "react";
import { trackEvent } from "../Utils/analytics";

const STORAGE_PREFIX = "woosho.experiment.";

function pickVariant(variants) {
  const total = variants.reduce((sum, variant) => sum + (variant.weight || 1), 0);
  let cursor = Math.random() * total;

  for (const variant of variants) {
    cursor -= variant.weight || 1;
    if (cursor <= 0) return variant;
  }

  return variants[0];
}

export function useExperiment(key, variants) {
  const safeVariants = variants?.length ? variants : [{ id: "control" }];

  const [assignment] = useState(() => {
    if (typeof window === "undefined") return safeVariants[0];

    const storageKey = `${STORAGE_PREFIX}${key}`;
    const existing = window.localStorage.getItem(storageKey);
    const matched = safeVariants.find((variant) => variant.id === existing);
    if (matched) return matched;

    const next = pickVariant(safeVariants);
    window.localStorage.setItem(storageKey, next.id);
    return next;
  });

  useEffect(() => {
    trackEvent("experiment_viewed", {
      experimentKey: key,
      variantId: assignment.id,
    });
  }, [assignment.id, key]);

  return assignment;
}
