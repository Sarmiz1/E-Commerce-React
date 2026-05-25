import { create } from "zustand";

export const useSellerUIStore = create((set) => ({
  page: "overview",
  setPage: (page) => set({ page }),
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (val) => set((state) => ({ 
    sidebarCollapsed: typeof val === "function" ? val(state.sidebarCollapsed) : val 
  })),
  
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (val) => set((state) => ({ 
    mobileSidebarOpen: typeof val === "function" ? val(state.mobileSidebarOpen) : val 
  })),
}));
