import nigeriaStatesAndAreas from "../Data/nigeriaStatesAndAreas.json";

const normalize = (value = "") => String(value).trim().toLowerCase();
const SUPPLEMENTAL_DELIVERY_AREAS = {
  Lagos: [
    "Ipaja",
    "Ikeja",
    "Lekki",
    "Victoria Island",
    "Lagos Island",
    "Yaba",
    "Surulere",
    "Ajah",
    "Ikorodu",
    "Epe",
  ],
};

export const NIGERIA_LOCATIONS = nigeriaStatesAndAreas;

export const NIGERIA_STATE_OPTIONS = nigeriaStatesAndAreas
  .map((item) => item.state)
  .sort((a, b) => a.localeCompare(b));

export const getNigeriaAreaOptions = (state) => {
  const selected = nigeriaStatesAndAreas.find(
    (item) => normalize(item.state) === normalize(state),
  );
  return Array.from(new Set([
    ...(SUPPLEMENTAL_DELIVERY_AREAS[selected?.state] || []),
    ...(selected?.lgas || []),
  ])).sort((a, b) => a.localeCompare(b));
};

export const isNigeriaState = (state) =>
  NIGERIA_STATE_OPTIONS.some((item) => normalize(item) === normalize(state));
