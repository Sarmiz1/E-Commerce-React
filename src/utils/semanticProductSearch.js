const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "for",
  "from",
  "in",
  "me",
  "of",
  "on",
  "show",
  "the",
  "to",
  "under",
  "with",
]);

const INTENT_SYNONYMS = {
  comfy: ["comfortable", "soft", "cozy", "relaxed"],
  comfortable: ["comfy", "soft", "cozy", "relaxed"],
  work: ["office", "professional", "formal", "clean"],
  party: ["evening", "dress", "fashion", "statement"],
  gym: ["athletic", "sport", "training", "sneakers"],
  cheap: ["deal", "sale", "budget", "affordable"],
  premium: ["luxury", "elegant", "high", "quality"],
};

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function getSearchCorpus(product) {
  return [
    product.name,
    product.category,
    product.description,
    product.seller?.store_name,
    ...(Array.isArray(product.keywords) ? product.keywords : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function parseBudget(query) {
  const match = String(query || "").match(/(?:under|below|less than|<)\s*\$?\s*(\d+)/i);
  return match ? Number(match[1]) * 100 : null;
}

export function rankProductsBySemanticQuery(products, query) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return products;

  const tokens = tokenize(trimmed);
  const budget = parseBudget(trimmed);

  return [...products]
    .map((product) => {
      const corpus = getSearchCorpus(product);
      let score = 0;

      tokens.forEach((token) => {
        if (corpus.includes(token)) score += 8;

        const synonyms = INTENT_SYNONYMS[token] || [];
        synonyms.forEach((synonym) => {
          if (corpus.includes(synonym)) score += 4;
        });
      });

      if (budget && (product.price_cents || 0) <= budget) score += 10;
      if (product.rating_stars >= 4.5) score += 3;
      if (product.rating_count >= 100) score += 2;
      if (product.seller?.is_verified_store) score += 2;

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
}

export function getSemanticSearchHint(query) {
  const budget = parseBudget(query);
  if (budget) return `Matched natural-language intent under $${budget / 100}`;
  return "Matched natural-language intent across names, tags, sellers, and ratings";
}

