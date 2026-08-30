import { APP_CONFIG, API_TIMEOUT_MS } from '../constants/config';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { createApiError } from '../models/api';
import {
  getMockChatResponse,
  getMockClassificationResult,
  getMockDocumentAnalysis,
} from './mockData';

export async function apiRequest(path, options = {}) {
  const isMock = options.mockMode ?? useSettingsStore.getState().mockMode;

  if (isMock) {
    return handleMockRequest(path, options);
  }

  const baseUrl = options.baseUrl || APP_CONFIG.apiBaseUrl;
  const url = `${baseUrl}${path}`;
  const timeoutMs = options.timeoutMs || API_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = options.token || useAuthStore.getState().accessToken;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': '1',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      useAuthStore.getState().clearAuth();
      throw createApiError({
        status: response.status,
        code: 'UNAUTHORIZED',
        message: 'Authentication session expired. Please sign in again.',
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw createApiError({
        status: response.status,
        code: `HTTP_${response.status}`,
        message: errorText || `Request failed with status ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw createApiError({
        status: 408,
        code: 'TIMEOUT',
        message: `Request timed out after ${timeoutMs / 1000}s`,
      });
    }

    if (error.status && error.code) {
      throw error;
    }

    throw createApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to backend server.',
    });
  }
}

function handleMockRequest(path, options) {
  let body = {};
  if (typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  if (path === '/chat' || path.startsWith('/chat')) {
    return getMockChatResponse(body.message || body.prompt, body.jurisdiction || 'IN');
  }

  if (path.includes('/classify')) {
    return getMockClassificationResult({
      formulationName: body.formulationName,
      classicalReference: body.classicalReference,
      ingredients: body.ingredients || [],
      jurisdiction: body.jurisdiction || 'IN',
    });
  }

  if (path.includes('/escalate')) {
    return {
      success: true,
      ticketId: `AYU-IPR-${Math.floor(100000 + Math.random() * 900000)}`,
      message: 'Your query has been escalated to an IP Attorney specializing in Ayush & Bio-patents.',
      contactEmail: 'ipr-support@ayush-patent-desk.gov.in',
    };
  }

  if (path.includes('/files/upload')) {
    return getMockDocumentAnalysis(options.file || body.file);
  }

  return { success: true, message: 'Operation completed in Mock Mode.' };
}

