import { supabase } from "../supabaseClient";

const EVENT_STORE_KEY = "woosho.analytics.events";
const SESSION_KEY = "woosho.analytics.sessionId";
const VISITOR_KEY = "woosho.analytics.visitorId";
const MAX_STORED_EVENTS = 200;

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

const makeId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

export function getAnalyticsSessionId() {
  if (!canUseStorage()) return "server-session";

  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next = makeId("sess");
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

export function getAnonymousVisitorId() {
  if (!canUseStorage()) return "server-visitor";

  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const next = makeId("visitor");
  window.localStorage.setItem(VISITOR_KEY, next);
  return next;
}

function readStoredEvents() {
  if (!canUseStorage()) return [];

  try {
    return JSON.parse(window.localStorage.getItem(EVENT_STORE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeStoredEvents(events) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      EVENT_STORE_KEY,
      JSON.stringify(events.slice(-MAX_STORED_EVENTS)),
    );
  } catch {
    // Analytics must never block shopping.
  }
}

export function getStoredAnalyticsEvents() {
  return readStoredEvents();
}

export function trackEvent(type, payload = {}) {
  const event = {
    id: makeId("evt"),
    type,
    payload,
    sessionId: getAnalyticsSessionId(),
    visitorId: getAnonymousVisitorId(),
    userId: payload.userId || null,
    productId: payload.productId || payload.product_id || null,
    createdAt: new Date().toISOString(),
    path: typeof window !== "undefined" ? window.location.pathname : "",
  };

  writeStoredEvents([...readStoredEvents(), event]);

  if (event.productId) {
    persistProductSignal(event);
  }

  return event;
}

function persistProductSignal(event) {
  Promise.resolve()
    .then(async () => {
      if (event.type === "product_click") {
        await supabase.rpc("track_product_click", {
          product_id: event.productId,
        });
      }

      const sessionPayload = {
        session_id: event.sessionId,
        product_id: event.productId,
      };

      await supabase.from("user_session_events").insert(sessionPayload);

      if (event.userId) {
        await supabase.from("user_product_events").insert({
          user_id: event.userId,
          product_id: event.productId,
        });
      }
    })
    .catch(() => {
      // Tables may not exist in a local/dev Supabase yet. The local queue remains useful.
    });
}

