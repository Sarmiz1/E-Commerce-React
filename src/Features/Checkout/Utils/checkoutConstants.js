export const VALID_COUPONS = {
  SAVE10: { type: "percent", value: 10, label: "10% off" },
  WELCOME20: { type: "percent", value: 20, label: "20% off" },
  FLAT5: { type: "flat", value: 500, label: "$5 off" },
  FREESHIP: { type: "ship", value: 0, label: "Free shipping" },
};

export const SHIPPING_TIERS = [
  { label: "Standard (5-7 days)", price: 499, id: "standard" },
  { label: "Express (2-3 days)", price: 999, id: "express" },
  { label: "Overnight (next day)", price: 1999, id: "overnight" },
];

export const TAX_RATE = 0.085;

export const CARD_PATTERNS = {
  visa: /^4/,
  mastercard: /^5[1-5]/,
  amex: /^3[47]/,
  discover: /^6(?:011|5)/,
};

export const EMPTY_ERRORS = () => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  country: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  cardName: "",
});

export const EMPTY_FORM = () => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  country: "Nigeria",
  cardNumber: "",
  expiry: "",
  cvv: "",
  cardName: "",
});

export const COUNTRY_OPTIONS = [
  "Nigeria",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Ghana",
  "South Africa",
  "Kenya",
  "India",
  "UAE",
];

export const CHECKOUT_STEPS = ["Cart", "Details", "Done"];

export const TRUST_BADGES = [
  {
    title: "Encrypted",
    sub: "256-bit SSL security on all transactions",
  },
  {
    title: "Fast Delivery",
    sub: "Same-day dispatch on orders before 2pm",
  },
  {
    title: "Easy Returns",
    sub: "30-day hassle-free return policy",
  },
  {
    title: "Award Winning",
    sub: "#1 customer satisfaction 3 years running",
  },
];

export const CONFIRMATION_STEPS = [
  { label: "Email sent", sub: "Check your inbox" },
  { label: "Being packed", sub: "Within 2-4 hours" },
  { label: "On its way", sub: "Track in My Orders" },
];

export const CO_STYLES = `
  @keyframes co-orb{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(24px,-28px)scale(1.05)}66%{transform:translate(-18px,20px)scale(0.96)}}
  .co-orb{animation:co-orb linear infinite}

  @keyframes co-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .co-shimmer{
    background:linear-gradient(90deg,#fff 0%,#a5b4fc 35%,#fff 60%,#818cf8 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:co-shimmer 4s linear infinite;
  }

  @keyframes co-success-ring{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
  .co-success-ring{animation:co-success-ring 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards}

  @keyframes co-check{0%{stroke-dashoffset:40}100%{stroke-dashoffset:0}}
  .co-check-path{stroke-dasharray:40;stroke-dashoffset:40;animation:co-check 0.5s 0.55s ease forwards}

  @keyframes co-confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-80px) rotate(720deg);opacity:0}}

  @keyframes co-bounce-in{0%{transform:scale(0);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
  .co-bounce-in{animation:co-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards}

  .co-input:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
  .co-input{transition:border-color .2s,box-shadow .2s}
  .co-input.error{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,0.12)}
`;
