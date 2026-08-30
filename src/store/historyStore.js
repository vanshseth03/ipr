import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { universalStorage } from './storageHelper';

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      historyItems: [],

      addItem: (item) =>
        set((state) => ({
          historyItems: [
            {
              id: `hist-${Date.now()}`,
              timestamp: new Date().toISOString(),
              ...item,
            },
            ...state.historyItems,
          ].slice(0, 200), // Cap at 200 items
        })),

      deleteItem: (id) =>
        set((state) => ({
          historyItems: state.historyItems.filter((i) => i.id !== id),
        })),

      clearHistory: () => set({ historyItems: [] }),
    }),
    {
      name: 'ayurveda_local_history',
      storage: createJSONStorage(() => universalStorage),
    }
  )
);
