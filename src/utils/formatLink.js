export const formatLink = (text) => {
  if (!text || typeof text !== "string") return "";

  return text
    .trim()                               // remove extra spaces
    .replace(/^#/, "")                    // remove starting #
    .replace(/([a-z])([A-Z])/g, "$1-$2")   // split camelCase
    .replace(/\s+/g, "-")                 // replace spaces with dash
    .replace(/[^a-zA-Z0-9-]/g, "")        // remove special characters
    .toLowerCase();
};