import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,

      toggleTheme: () => {
        const newIsDark = !get().isDark;
        set({ isDark: newIsDark });
        document.documentElement.classList.toggle('dark', newIsDark);
      },

      setTheme: (isDark) => {
        set({ isDark });
        document.documentElement.classList.toggle('dark', isDark);
      },
    }),
    {
      name: 'ebay-feed-viewer-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.isDark);
        }
      },
    }
  )
);
