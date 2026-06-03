import { ADDRESS_COUNTRIES } from "../../../utils/addressCountries";

export const OTHER_CITY_VALUE = "other";

export const CAREER_COUNTRY_OPTIONS = ADDRESS_COUNTRIES.map((country) => ({
  label: country.label,
  value: country.code,
}));

const CITIES_BY_COUNTRY = {
  AE: ["Abu Dhabi", "Dubai", "Sharjah"],
  AU: ["Brisbane", "Melbourne", "Perth", "Sydney"],
  CA: ["Calgary", "Montreal", "Ottawa", "Toronto", "Vancouver"],
  DE: ["Berlin", "Cologne", "Frankfurt", "Hamburg", "Munich"],
  FR: ["Bordeaux", "Lille", "Lyon", "Marseille", "Paris"],
  GB: ["Birmingham", "Edinburgh", "Leeds", "London", "Manchester"],
  GH: ["Accra", "Kumasi", "Takoradi", "Tamale"],
  IN: ["Bengaluru", "Chennai", "Delhi", "Hyderabad", "Mumbai"],
  JP: ["Fukuoka", "Kyoto", "Osaka", "Tokyo", "Yokohama"],
  KE: ["Eldoret", "Kisumu", "Mombasa", "Nairobi"],
  NG: ["Abuja", "Benin City", "Enugu", "Ibadan", "Kano", "Lagos", "Port Harcourt"],
  US: ["Atlanta", "Chicago", "Houston", "Los Angeles", "New York", "San Francisco", "Seattle"],
  ZA: ["Cape Town", "Durban", "Johannesburg", "Pretoria"],
};

export const getCareerCityOptions = (countryCode) => [
  { label: "Select a city", value: "" },
  ...(CITIES_BY_COUNTRY[countryCode] || []).map((city) => ({ label: city, value: city })),
  { label: "Other city", value: OTHER_CITY_VALUE },
];

export const SHARED_APPLICATION_QUESTIONS = [
  {
    id: "shared-why-woosho",
    key: "why_woosho",
    label: "Why do you want to work at WooSho?",
    placeholder: "Tell us what caught your attention and how you would contribute.",
    required: true,
    type: "textarea",
  },
  {
    id: "shared-start-timeline",
    key: "start_timeline",
    label: "When would you be available to start?",
    placeholder: "Immediately, two weeks notice, or a specific date",
    required: true,
    type: "text",
  },
  {
    id: "shared-employment-preference",
    key: "employment_preference",
    label: "Preferred engagement type",
    options: ["Full-time", "Part-time", "Contract", "Internship"],
    required: true,
    type: "select",
  },
  {
    id: "shared-initiative-example",
    key: "initiative_example",
    label: "Describe a time you solved an important problem without being asked.",
    placeholder: "Keep the example concrete: the situation, your action, and the result.",
    required: true,
    type: "textarea",
  },
];

export const TALENT_POOL_QUESTIONS = [
  {
    id: "talent-position",
    key: "talent_position",
    label: "Which talent position best matches the work you would like to do at WooSho?",
    options: [
      "Software Engineering",
      "Product Management",
      "Product Design",
      "Data and AI",
      "Operations",
      "Sales and Partnerships",
      "Marketing and Growth",
      "Customer Experience",
      "Finance and Administration",
      "Other",
    ],
    required: true,
    type: "select",
  },
  {
    id: "talent-experience-level",
    key: "experience_level",
    label: "What best describes your current experience level?",
    options: ["Student or intern", "Entry level", "Early career", "Mid level", "Senior", "Lead or manager", "Executive", "Career switcher"],
    required: true,
    type: "select",
  },
  {
    id: "talent-skills-summary",
    key: "skills_summary",
    label: "What skills, tools, or domain knowledge would you bring to WooSho?",
    placeholder: "Focus on the capabilities you would want the hiring team to remember.",
    required: true,
    type: "textarea",
  },
  {
    id: "talent-opportunity-direction",
    key: "opportunity_direction",
    label: "What kind of opportunity or problem would you be most interested in working on?",
    placeholder: "Describe the work where you think you could make a strong contribution.",
    required: true,
    type: "textarea",
  },
  {
    id: "talent-work-arrangement",
    key: "work_arrangement",
    label: "Which working arrangement would you prefer?",
    options: ["Remote", "Hybrid", "On-site", "Flexible"],
    required: true,
    type: "select",
  },
  {
    id: "talent-consent",
    key: "talent_pool_consent",
    label: "I agree that WooSho may retain my talent-pool profile and contact me about relevant opportunities.",
    required: true,
    type: "checkbox",
  },
];

export const getFallbackCareerForm = (jobId) => ({
  job: null,
  questions: jobId
    ? SHARED_APPLICATION_QUESTIONS
    : [...SHARED_APPLICATION_QUESTIONS, ...TALENT_POOL_QUESTIONS],
});
