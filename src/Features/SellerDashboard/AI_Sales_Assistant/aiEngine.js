const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY;

export async function fetchAIResponse(systemPrompt, messages) {
  if (!OPENROUTER_KEY) throw new Error("No API key");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_KEY}` },
    body: JSON.stringify({ model: "openrouter/auto", messages: [{ role: "system", content: systemPrompt }, ...messages], max_tokens: 1500, temperature: 0.7 }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

export async function fetchInsights(systemPrompt, lead) {
  if (!OPENROUTER_KEY) throw new Error("No API key");
  const prompt = `Analyze this sales opportunity. Return ONLY valid JSON, no markdown:\nLead: ${lead.name}, ${lead.role} at ${lead.company}\nDeal: ${lead.value} | Stage: ${lead.stage} | Probability: ${lead.probability}%\nIndustry: ${lead.industry} | Size: ${lead.size}\nNotes: ${lead.notes}\n\nReturn: {"dealScore":75,"scoreLabel":"Strong","winFactors":["f1","f2","f3"],"risks":["r1","r2"],"nextActions":["a1","a2","a3"],"talkingPoints":["t1","t2","t3"],"competitorAngle":"one sentence","closingTimeline":"2-3 weeks"}`;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_KEY}` },
    body: JSON.stringify({ model: "openrouter/auto", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], max_tokens: 800, temperature: 0.3 }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}
