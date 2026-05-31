const AUTH_RETURN_TO_KEY = "woosho_auth_return_to";

export function getSafeAuthReturnTo(value, fallback = null) {
  const pathname = typeof value === "string" ? value : value?.pathname;
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return fallback;
  }

  if (typeof value === "string") return pathname;
  return `${pathname}${value?.search || ""}${value?.hash || ""}`;
}

export function rememberAuthReturnTo(value) {
  if (typeof window === "undefined") return;

  const returnTo = getSafeAuthReturnTo(value);
  if (returnTo) {
    window.sessionStorage.setItem(AUTH_RETURN_TO_KEY, returnTo);
  } else {
    window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
  }
}

export function consumeAuthReturnTo() {
  if (typeof window === "undefined") return null;

  const returnTo = getSafeAuthReturnTo(
    window.sessionStorage.getItem(AUTH_RETURN_TO_KEY),
  );
  window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
  return returnTo;
}
