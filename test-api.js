

const OPENROUTER_KEY = "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";

const SYSTEM_PROMPT = `You are Woosho AI.`;
const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search the live Woosho database for products. Call this before recommending items. Returns real product IDs, names, and prices.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keywords to search for" },
          maxPrice: { type: "number", description: "Maximum price in Naira" },
          category: { type: "string", description: "Category like sneakers, fashion, electronics" },
          limit: { type: "number", description: "Max results to return (default 3)" }
        }
      }
    }
  }
];

const body = {
  model: "google/gemini-2.5-flash",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: "hi" }
  ],
  tools: TOOLS,
  tool_choice: "auto",
  temperature: 0.5,
  max_tokens: 1000,
};

async function test() {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify(body),
  });

  console.log(res.status);
  console.log(await res.text());
}
test();
