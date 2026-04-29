import { supabase } from "../supabaseClient";

const EVENT_STORE_KEY = "woosho.analytics.events";
const SESSION_KEY = "woosho.analytics.sessionId";
const VISITOR_KEY = "woosho.analytics.visitorId";
const MAX_STORED_EVENTS = 200;

const RESERVED_PAYLOAD_KEYS = new Set([
  "eventType",
  "event_type",
  "type",
  "productId",
  "product_id",
  "variantId",
  "variant_id",
  "quantity",
  "userId",
  "user_id",
  "sessionId",
  "session_id",
  "metadata",
]);

const canUseStorage = () =>
  typeof window !== "undefined" && window.localStorage && window.sessionStorage;

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

function getPageContext() {
  if (typeof window === "undefined") return {};

  return {
    path: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    href: window.location.href,
    title: typeof document !== "undefined" ? document.title : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
  };
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
    // Tracking must never interrupt the shopping flow.
  }
}

export function getStoredAnalyticsEvents() {
  return readStoredEvents();
}

function metadataFrom(payload = {}) {
  return Object.entries(payload).reduce(
    (metadata, [key, value]) => {
      if (!RESERVED_PAYLOAD_KEYS.has(key) && value !== undefined) {
        metadata[key] = value;
      }
      return metadata;
    },
    { ...(payload.metadata || {}) },
  );
}

function normalizeEventArgs(eventOrType, payload = {}) {
  const source =
    typeof eventOrType === "string"
      ? { ...payload, eventType: eventOrType }
      : { ...(eventOrType || {}) };

  const eventType = source.eventType || source.event_type || source.type;
  const metadata = {
    ...getPageContext(),
    ...metadataFrom(source),
  };

  return {
    eventType,
    productId: source.productId ?? source.product_id ?? null,
    variantId: source.variantId ?? source.variant_id ?? null,
    quantity: source.quantity ?? null,
    userId: source.userId ?? source.user_id ?? null,
    sessionId: source.sessionId ?? source.session_id ?? getAnalyticsSessionId(),
    visitorId: getAnonymousVisitorId(),
    metadata,
  };
}

async function sendTrackedEvent(event) {
  try {
    const { error } = await supabase.functions.invoke("track-event", {
      body: {
        event_type: event.eventType,
        product_id: event.productId,
        variant_id: event.variantId,
        quantity: event.quantity,
        user_id: event.userId,
        session_id: event.sessionId,
        metadata: {
          ...event.metadata,
          visitor_id: event.visitorId,
        },
      },
    });

    if (error) throw error;
  } catch (err) {
    const response = err?.context;
    let details = null;

    if (response?.text) {
      try {
        const text = await response.text();
        details = text ? JSON.parse(text) : null;
      } catch {
        details = null;
      }
    }

    console.error("Track event failed:", details || err);
  }
}

export function trackEvent(eventOrType, payload) {
  const normalized = normalizeEventArgs(eventOrType, payload);
  if (!normalized.eventType) return null;

  const event = {
    id: makeId("evt"),
    type: normalized.eventType,
    payload: normalized.metadata,
    sessionId: normalized.sessionId,
    visitorId: normalized.visitorId,
    userId: normalized.userId,
    productId: normalized.productId,
    variantId: normalized.variantId,
    quantity: normalized.quantity,
    createdAt: new Date().toISOString(),
    path: normalized.metadata.path || "",
  };

  writeStoredEvents([...readStoredEvents(), event]);
  void sendTrackedEvent(normalized);

  return event;
};
