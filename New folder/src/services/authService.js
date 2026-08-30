import { login, register, logout } from '../api/endpoints/auth';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

export async function loginUser(credentials) {
  const store = useAuthStore.getState();
  const isMock = useSettingsStore.getState().mockMode;
  const response = await login(credentials);

  const token = response?.accessToken || response?.token || (isMock ? 'mock-access-token' : null);
  const user = response?.user || (isMock ? { email: credentials.email || 'user@ayurveda-ipr.org' } : null);

  if (!token) {
    throw new Error('Authentication failed: Backend response did not contain an access token.');
  }

  await store.setAuth({ user, accessToken: token });
  return response;
}

export async function registerUser(payload) {
  const store = useAuthStore.getState();
  const isMock = useSettingsStore.getState().mockMode;
  const response = await register(payload);

  const token = response?.accessToken || response?.token || (isMock ? 'mock-access-token' : null);
  const user = response?.user || (isMock ? { email: payload.email || 'user@ayurveda-ipr.org' } : null);

  if (!token) {
    throw new Error('Registration failed: Backend response did not contain an access token.');
  }

  await store.setAuth({ user, accessToken: token });
  return response;
}

export async function logoutUser() {
  const store = useAuthStore.getState();
  try {
    await logout();
  } catch (err) {
    console.warn('[AuthService] Backend logout notice:', err.message);
  } finally {
    await store.clearAuth();
  }
}

