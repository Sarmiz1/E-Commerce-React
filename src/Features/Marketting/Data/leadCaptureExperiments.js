export function getLeadCaptureExperiments({ title, cta }) {
  return [
    { id: "control", title, cta, weight: 2 },
    { id: "early-access", title: "Get early access", cta: "Request Access" },
    { id: "drops", title: "Get launch drops first", cta: "Join The List" },
  ];
}
