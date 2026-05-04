/**
 * useBuyerUIStore — Zustand store for Buyer Dashboard UI state only.
 * Server data lives in TanStack Query hooks (useBuyerOrders, useBuyerWishlist, etc.)
 */
import { create } from 'zustand';

export const useBuyerUIStore = create((set) => ({
  // ── Navigation ──────────────────────────────────────────────────────────────
  page: 'overview',
  setPage: (page) => set({ page }),

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),

// ─── Wallet local state (optimistic updates) ──────────────────────────────────
  // Wallet logic moved entirely to the DB / BFF endpoint

  // ─── AI Credits local state ────────────────────────────────────────────────────
  // AI credits logic moved entirely to the DB / BFF endpoint

  // ─── Cart (local only) ────────────────────────────────────────────────────────
  cart: [],
  setCart: (cart) => set({ cart }),
  removeFromCart: (id) =>
    set((s) => ({ cart: s.cart.filter((item) => item.id !== id) })),
  updateCartQty: (id, qty) =>
    set((s) => ({
      cart: s.cart.map((item) => (item.id === id ? { ...item, qty } : item)),
    })),
}));
