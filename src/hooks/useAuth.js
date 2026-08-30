import { useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser, logoutUser } from '../services/authService';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      return await loginUser(credentials);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      return await registerUser(payload);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutUser();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    accessToken,
    isAuthenticated,
    isBootstrapping,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
  };
}
