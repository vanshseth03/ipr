import { create } from 'zustand';
import { getSecureItem, setSecureItem, deleteSecureItem } from '../utils/secureStore';

const TOKEN_KEY = 'ayurveda_access_token';
const USER_KEY = 'ayurveda_user_data';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapping: true,

  setAuth: async ({ user, accessToken }) => {
    if (accessToken) {
      await setSecureItem(TOKEN_KEY, accessToken);
    }
    if (user) {
      await setSecureItem(USER_KEY, JSON.stringify(user));
    }
    set({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
    });
  },

  setUser: (user) => set({ user }),

  setAccessToken: async (accessToken) => {
    if (accessToken) {
      await setSecureItem(TOKEN_KEY, accessToken);
    }
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    });
  },

  clearAuth: async () => {
    await deleteSecureItem(TOKEN_KEY);
    await deleteSecureItem(USER_KEY);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  bootstrapAuth: async () => {
    try {
      const storedToken = await getSecureItem(TOKEN_KEY);
      const storedUserRaw = await getSecureItem(USER_KEY);
      const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

      if (storedToken) {
        set({
          accessToken: storedToken,
          user: storedUser,
          isAuthenticated: true,
          isBootstrapping: false,
        });
        return;
      }
    } catch (err) {
      console.warn('[AuthStore] Bootstrap failed:', err.message);
    } finally {
      set({ isBootstrapping: false });
    }
  },
}));
