const PRIVATE_IPV4_PATTERNS = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

export const CAREER_DOCUMENT_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export const MAX_CAREER_DOCUMENT_BYTES = 5 * 1024 * 1024;

export function isSafePublicHttpsUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !["localhost", "::1", "[::1]"].includes(hostname)
      && !hostname.endsWith(".local")
      && !PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

