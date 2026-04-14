// src/api/apiClients.js
//
// ── Fixes applied ──────────────────────────────────────────────────────────────
//  1. data default was `''` — sent an empty-string body on every GET/DELETE
//     request, confusing some servers. Changed to `undefined` so axios omits
//     the Content-Type header and body entirely for body-less methods.
//  2. GET and DELETE requests must not carry a body. Axios ignores `data` on
//     GET by spec, but some proxy/server setups choke on the header. We now
//     only attach `data` when the method actually supports a body (POST/PUT/PATCH).
//  3. Added a response interceptor that normalises the error before re-throwing
//     so callers always receive a plain Error with a readable message, not a
//     raw AxiosError object.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// ── Shared axios instance ─────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ── Response error normaliser ─────────────────────────────────────────────────
// Converts AxiosError → plain Error with a human-readable message so callers
// can `catch (err) { setError(err.message) }` without inspecting AxiosError.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error  ||
      error.message                 ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

// ── Set of HTTP methods that carry a request body ─────────────────────────────
const BODY_METHODS = new Set(["post", "put", "patch"]);

// ── Generic request handler ───────────────────────────────────────────────────
// Only attaches `data` for body-carrying methods so GET/DELETE never send a body.
const request = async (method, url, data) => {
  const config = { method, url };

  if (BODY_METHODS.has(method.toLowerCase()) && data !== undefined) {
    config.data = data;
  }

  const response = await api(config);
  return response.data;        // always return the unwrapped response body
};

// ── Named exports ─────────────────────────────────────────────────────────────
export const getData   = (url)        => request("get",    url);
export const postData  = (url, data)  => request("post",   url, data);
export const putData   = (url, data)  => request("put",    url, data);
export const patchData = (url, data)  => request("patch",  url, data);
export const deleteData = (url)       => request("delete", url);

// Export the raw instance for cases that need fine-grained control
export default api;