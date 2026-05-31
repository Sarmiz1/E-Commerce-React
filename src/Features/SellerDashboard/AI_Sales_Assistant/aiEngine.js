import { requestOpenRouter } from "../../../api/openrouterApi";

export async function fetchAIResponse(systemPrompt, messages) {
  const data = await requestOpenRouter({
    model: "openrouter/auto",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    max_tokens: 1500,
    temperature: 0.7,
  });
  return data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

export async function fetchInsights(systemPrompt, lead) {
  const prompt = `Analyze this sales opportunity. Return ONLY valid JSON, no markdown:\nLead: ${lead.name}, ${lead.role} at ${lead.company}\nDeal: ${lead.value} | Stage: ${lead.stage} | Probability: ${lead.probability}%\nIndustry: ${lead.industry} | Size: ${lead.size}\nNotes: ${lead.notes}\n\nReturn: {"dealScore":75,"scoreLabel":"Strong","winFactors":["f1","f2","f3"],"risks":["r1","r2"],"nextActions":["a1","a2","a3"],"talkingPoints":["t1","t2","t3"],"competitorAngle":"one sentence","closingTimeline":"2-3 weeks"}`;
  const data = await requestOpenRouter({
    model: "openrouter/auto",
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
    max_tokens: 800,
    temperature: 0.3,
  });
  const text = data.choices?.[0]?.message?.content?.replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}
