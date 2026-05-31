const AUTH_RETURN_TO_KEY = "woosho_auth_return_to";
const REQUESTED_ACCOUNT_ROLE_KEY = "woosho_requested_account_role";
const ACCOUNT_ROLES = new Set(["buyer", "seller"]);

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

export function rememberRequestedAccountRole(role) {
  if (typeof window === "undefined") return;

  if (ACCOUNT_ROLES.has(role)) {
    window.sessionStorage.setItem(REQUESTED_ACCOUNT_ROLE_KEY, role);
  } else {
    window.sessionStorage.removeItem(REQUESTED_ACCOUNT_ROLE_KEY);
  }
}

export function consumeRequestedAccountRole() {
  if (typeof window === "undefined") return null;

  const role = window.sessionStorage.getItem(REQUESTED_ACCOUNT_ROLE_KEY);
  window.sessionStorage.removeItem(REQUESTED_ACCOUNT_ROLE_KEY);
  return ACCOUNT_ROLES.has(role) ? role : null;
}
