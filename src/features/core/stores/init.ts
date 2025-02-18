import { create } from "zustand";
import { devtools } from "zustand/middleware";

type States = {
  isDarkMode: boolean;
}

type Actions = {
  toggleDarkMode: () => void;
}

export const useInitStore = create<States & Actions>()(
  devtools((set) => ({
    isDarkMode: false,
    toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  }))
);