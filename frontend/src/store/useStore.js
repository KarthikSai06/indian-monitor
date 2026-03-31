import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Language
      language: localStorage.getItem('bm_lang') || 'en',
      setLanguage: (lang) => set({ language: lang }),

      // Onboarding
      onboardingDone: false,
      selectedFeatures: [],
      setOnboardingDone: (done) => set({ onboardingDone: done }),
      setSelectedFeatures: (features) => set({ selectedFeatures: features }),

      // Active section
      activeSection: 'news',
      setActiveSection: (section) => set({ activeSection: section }),

      // News cache
      newsCache: {},
      setNewsCache: (category, data) => set((state) => ({
        newsCache: { ...state.newsCache, [category]: data },
      })),

      // User prefs
      theme: 'dark',
      setTheme: (t) => set({ theme: t }),
      notifications: true,
      setNotifications: (v) => set({ notifications: v }),
    }),
    {
      name: 'bharat-monitor-store',
      partialialize: (state) => ({
        onboardingDone: state.onboardingDone,
        selectedFeatures: state.selectedFeatures,
        language: state.language,
        theme: state.theme,
        notifications: state.notifications,
      }),
    }
  )
);

export default useStore;
