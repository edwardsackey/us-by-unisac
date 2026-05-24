import { create } from "zustand";

// 1. Define the interface for your state and actions
interface AppState {
  filter: string;
  isOpen: boolean;
  setFilter: (text: string) => void;
  toggleOpen: () => void;
}

// 2. Create the store
export const useAppStore = create<AppState>((set) => ({
  filter: "",
  isOpen: false,

  // Actions to update state
  setFilter: (text) => set({ filter: text }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
