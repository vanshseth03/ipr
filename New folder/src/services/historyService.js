import { apiRequest } from '../api/client';
import { useHistoryStore } from '../store/historyStore';
import { useSettingsStore } from '../store/settingsStore';

export async function fetchHistory() {
  const isMock = useSettingsStore.getState().mockMode;

  if (isMock) {
    return useHistoryStore.getState().historyItems;
  }

  const serverHistory = await apiRequest('/chat/history');
  return Array.isArray(serverHistory) ? serverHistory : [];
}

export async function deleteHistoryItem(id) {
  const isMock = useSettingsStore.getState().mockMode;
  useHistoryStore.getState().deleteItem(id);

  if (!isMock) {
    await apiRequest(`/chat/history/${id}`, { method: 'DELETE' });
  }
  return { success: true, id };
}

export async function clearAllHistory() {
  const isMock = useSettingsStore.getState().mockMode;
  useHistoryStore.getState().clearHistory();

  if (!isMock) {
    await apiRequest('/chat/history', { method: 'DELETE' });
  }
  return { success: true };
}

