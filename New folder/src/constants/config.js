// ─── Server Registry (GitHub Gist) ───────────────────────────
// The Kaggle server pushes its URL to this Gist on boot.
// The app reads it to auto-discover the live backend URL.
const GIST_REGISTRY_URL = 'https://api.github.com/gists/7873aa6da8f97b2b817137dd4f2df5be';
const GIST_RAW_URL = 'https://gist.githubusercontent.com/vanshseth03/7873aa6da8f97b2b817137dd4f2df5be/raw/server_registry.json';
const DAEMON_STATUS_URL = 'http://localhost:3333/status';
const GIST_FILENAME = 'server_registry.json';
const GITHUB_TOKEN = process.env.EXPO_PUBLIC_GITHUB_TOKEN || '';

export const CLOUD_API_BASE = typeof window !== 'undefined'
  ? window.location.origin
  : (process.env.EXPO_PUBLIC_CLOUD_API_URL || 'https://ipr112211.vercel.app');

export const isLocalhost = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  : true;

// Fallback URL (will be overwritten by Gist registry, custom override, or ntfy discovery)
let _resolvedBackendUrl = '';
let _serverReady = false;
let _serverStatus = 'unknown'; // 'unknown' | 'loading' | 'running' | 'offline'
let _lastRegistryCheck = 0;
const REGISTRY_CACHE_MS = 8000; // Re-check registry every 8s

/**
 * Get manually configured or custom backend URL from localStorage.
 */
export function getCustomBackendUrl() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return (window.localStorage.getItem('ayush_custom_server_url') || '').trim();
    } catch (_) {}
  }
  return '';
}

/**
 * Set custom backend URL manually from UI (e.g. from Kaggle output console).
 */
export function setCustomBackendUrl(url) {
  const clean = (url || '').trim().replace(/\/$/, '').replace(/\/api$/, '');
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (clean) {
        window.localStorage.setItem('ayush_custom_server_url', clean);
        window.localStorage.setItem('ayush_last_server_url', clean);
      } else {
        window.localStorage.removeItem('ayush_custom_server_url');
      }
    } catch (_) {}
  }
  _resolvedBackendUrl = clean;
  _lastRegistryCheck = 0;
  return clean;
}

/**
 * Clear custom backend URL and reset to automatic discovery.
 */
export function clearCustomBackendUrl() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem('ayush_custom_server_url');
    } catch (_) {}
  }
  _resolvedBackendUrl = '';
  _serverReady = false;
  _serverStatus = 'unknown';
  _lastRegistryCheck = 0;
}

/**
 * Probe a candidate URL directly against /api/health with a short timeout.
 * Returns health object if reachable, or null.
 */
export async function probeUrlHealth(candidateUrl, timeoutMs = 2500) {
  if (!candidateUrl) return null;
  const cleanUrl = candidateUrl.trim().replace(/\/$/, '').replace(/\/api$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) return null;

  try {
    const ctrl = new AbortController();
    const tId = setTimeout(() => ctrl.abort(), timeoutMs);
    const resp = await fetch(`${cleanUrl}/api/health`, {
      signal: ctrl.signal,
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'bypass-tunnel-reminder': '1',
      },
    });
    clearTimeout(tId);

    if (resp.ok) {
      const data = await resp.json();
      const isReady = !!data.ready;
      return {
        url: cleanUrl,
        ready: isReady,
        status: isReady ? 'running' : 'booting',
        step: data.step || (isReady ? 'ready' : 'loading_weights'),
        stepDisplay: data.step_display || (isReady ? 'All models ready' : 'Loading model weights into GPU...'),
        models: data.models,
        gpu: data.gpu,
      };
    }
  } catch (_) {}
  return null;
}

export async function markGitRegistryOffline() {
  try {
    // 1. Inform serverless API first (handles authentication securely)
    for (const stopPath of [`${CLOUD_API_BASE}/api/stop`, `${CLOUD_API_BASE}/api/server/stop`]) {
      try {
        const cResp = await fetch(stopPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'AYUSH-IPR-App' },
          body: JSON.stringify({ reason: 'stale_registry_detected' }),
        });
        if (cResp.ok) {
          console.log('[Registry] ✓ Stale/dead URL marked offline via cloud API');
          return;
        }
      } catch (_) {}
    }

    // 2. Direct GitHub Gist PATCH only if GITHUB_TOKEN is configured
    if (GITHUB_TOKEN) {
      const payload = JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify({
              server_url: '',
              status: 'offline',
              started_at: '',
              expires_at: '',
              last_heartbeat: new Date().toISOString(),
              kaggle_kernel: 'vanshseth003/ayush-ipr-guardian',
            }, null, 2),
          },
        },
      });
      const patchResp = await fetch(GIST_REGISTRY_URL, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AYUSH-IPR-Guardian',
        },
        body: payload,
      });
      if (patchResp.ok) {
        console.log('[Registry] ✓ Stale/dead URL cleared from Gist registry');
      }
    }
  } catch (err) {
    console.warn('[Registry] Could not nullify Gist:', err.message);
  }
}

/**
 * Fetch the live server URL from multiple robust sources:
 * 1. Local trigger daemon (port 3333) — instant, zero latency, immune to rate limits
 * 2. GitHub Gist API with Bearer token — 5,000 requests/hr
 * 3. GitHub Gist raw URL — zero rate limit
 * ALWAYS PROMPTS /api/health FIRST to acknowledge whether server is actually present!
 */
export async function fetchServerRegistry(forceFresh = false) {
  try {
    const now = Date.now();
    if (!forceFresh && _resolvedBackendUrl && _serverReady && (now - _lastRegistryCheck) < REGISTRY_CACHE_MS) {
      return { url: _resolvedBackendUrl, status: _serverStatus, ready: _serverReady };
    }

    // ── Tier 1: User-defined Custom URL, Cached Live URL, or Env URL ──
    const customUrl = getCustomBackendUrl();
    const lastCachedUrl = typeof window !== 'undefined' && window.localStorage
      ? (window.localStorage.getItem('ayush_last_server_url') || '').trim()
      : '';
    const envUrl = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/api\/?$/, '').trim();

    const priorityCandidates = [
      customUrl,
      _resolvedBackendUrl,
      lastCachedUrl,
      envUrl,
    ].filter((u) => u && (u.startsWith('http://') || u.startsWith('https://')));

    const uniquePriority = [...new Set(priorityCandidates)];
    for (const cand of uniquePriority) {
      const probe = await probeUrlHealth(cand, 2000);
      if (probe) {
        _resolvedBackendUrl = probe.url;
        _serverReady = probe.ready;
        _serverStatus = probe.status;
        _lastRegistryCheck = now;
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem('ayush_last_server_url', probe.url);
          } catch (_) {}
        }
        return probe;
      }
    }

    let registry = null;

    // ── Tier 2: Cloud Serverless API (/api/status & /api/server/status) ──
    for (const statusPath of [`${CLOUD_API_BASE}/api/status`, `${CLOUD_API_BASE}/api/server/status`]) {
      if (registry?.server_url) break;
      try {
        const cCtrl = new AbortController();
        const cTimer = setTimeout(() => cCtrl.abort(), 2500);
        const cResp = await fetch(statusPath, {
          signal: cCtrl.signal,
          headers: { 'User-Agent': 'AYUSH-IPR-Guardian' },
        });
        clearTimeout(cTimer);
        if (cResp.ok) {
          const cData = await cResp.json();
          if (cData?.server_url) {
            const probe = await probeUrlHealth(cData.server_url, 2500);
            if (probe) {
              _resolvedBackendUrl = probe.url;
              _serverReady = probe.ready;
              _serverStatus = probe.status;
              _lastRegistryCheck = now;
              return probe;
            }
          }
        }
      } catch (_) {}
    }

    // ── Tier 3: Local Daemon (port 3333, localhost only) ──
    if (isLocalhost && !registry?.server_url) {
      try {
        const dCtrl = new AbortController();
        const dTimer = setTimeout(() => dCtrl.abort(), 1200);
        const dResp = await fetch(DAEMON_STATUS_URL, {
          signal: dCtrl.signal,
          headers: { 'User-Agent': 'AYUSH-IPR-Guardian' },
        });
        clearTimeout(dTimer);
        if (dResp.ok) {
          const dData = await dResp.json();
          if (dData?.server_url) {
            const probe = await probeUrlHealth(dData.server_url, 2000);
            if (probe) {
              _resolvedBackendUrl = probe.url;
              _serverReady = probe.ready;
              _serverStatus = probe.status;
              _lastRegistryCheck = now;
              return probe;
            }
          }
        }
      } catch (_) {}
    }

    // ── Tier 4: GitHub Gist API & Raw Gist ──
    if (!registry?.server_url) {
      try {
        const gCtrl = new AbortController();
        const gTimer = setTimeout(() => gCtrl.abort(), 3000);
        const gHeaders = { 'User-Agent': 'AYUSH-IPR-Guardian' };
        if (GITHUB_TOKEN) {
          gHeaders['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
        }
        const resp = await fetch(GIST_REGISTRY_URL, {
          signal: gCtrl.signal,
          headers: gHeaders,
          cache: 'no-cache',
        });
        clearTimeout(gTimer);
        if (resp.ok) {
          const gist = await resp.json();
          const content = gist?.files?.[GIST_FILENAME]?.content;
          if (content) {
            registry = JSON.parse(content);
          }
        }
      } catch (_) {}
    }

    if (!registry?.server_url) {
      try {
        const rCtrl = new AbortController();
        const rTimer = setTimeout(() => rCtrl.abort(), 3000);
        const rawResp = await fetch(`${GIST_RAW_URL}?_t=${Date.now()}`, {
          signal: rCtrl.signal,
          cache: 'no-cache',
        });
        clearTimeout(rTimer);
        if (rawResp.ok) {
          registry = await rawResp.json();
        }
      } catch (_) {}
    }

    if (registry?.server_url) {
      const probe = await probeUrlHealth(registry.server_url, 3000);
      if (probe) {
        _resolvedBackendUrl = probe.url;
        _serverReady = probe.ready;
        _serverStatus = probe.status;
        _lastRegistryCheck = now;
        return probe;
      }
    }

    // ── Tier 5: Multi-Candidate ntfy.sh Tunnel Discovery ──
    try {
      const nCtrl = new AbortController();
      const nTimer = setTimeout(() => nCtrl.abort(), 3500);
      const nResp = await fetch('https://ntfy.sh/ayush_ipr_tunnel_sih2026/json?poll=1', {
        signal: nCtrl.signal,
        headers: { 'User-Agent': 'AYUSH-IPR-Guardian' },
        cache: 'no-cache',
      });
      clearTimeout(nTimer);

      if (nResp.ok) {
        const text = await nResp.text();
        const lines = text.split('\n').filter(Boolean);
        const candidates = [];
        const minValidTime = (now / 1000) - (4 * 3600); // within last 4 hours

        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const item = JSON.parse(lines[i]);
            const itemTime = item.time || 0;
            if (itemTime >= minValidTime) {
              const match = (item.message || '').match(/(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/i);
              if (match && !candidates.includes(match[1])) {
                candidates.push(match[1]);
              }
            }
          } catch (_) {}
        }

        // Test candidates in reverse order (newest first)
        for (const candUrl of candidates) {
          const probe = await probeUrlHealth(candUrl, 2500);
          if (probe) {
            _resolvedBackendUrl = probe.url;
            _serverReady = probe.ready;
            _serverStatus = probe.status;
            _lastRegistryCheck = now;
            if (typeof window !== 'undefined' && window.localStorage) {
              try {
                window.localStorage.setItem('ayush_last_server_url', probe.url);
              } catch (_) {}
            }
            return probe;
          }
        }
      }
    } catch (_) {}

    _lastRegistryCheck = now;
    _serverStatus = 'offline';
    _serverReady = false;
    return { url: '', status: 'offline', ready: false, needRepush: true };
  } catch (err) {
    console.warn('[Registry] Fetch failed:', err.message);
    return null;
  }
}

/**
 * Get the current backend URL. Tries Gist registry first,
 * falls back to any previously resolved URL.
 */
export async function getBackendUrl() {
  const reg = await fetchServerRegistry();
  if (reg?.url) return reg.url;
  if (_resolvedBackendUrl) return _resolvedBackendUrl;
  return ''; // No server available
}

/** Sync getter for last known URL (no await needed). */
export function getLastKnownBackendUrl() {
  return _resolvedBackendUrl;
}

/** Get current server status. */
export function getServerStatus() {
  return { status: _serverStatus, ready: _serverReady, url: _resolvedBackendUrl };
}

/** Force a re-check of the registry on next call. */
export function invalidateRegistryCache() {
  _lastRegistryCheck = 0;
}

export const APP_CONFIG = {
  get apiBaseUrl() {
    return _resolvedBackendUrl ? `${_resolvedBackendUrl}/api` : '';
  },
  get wsBaseUrl() {
    return _resolvedBackendUrl ? `${_resolvedBackendUrl.replace('https://', 'wss://')}/ws/voice` : '';
  },
  get sseBaseUrl() {
    return _resolvedBackendUrl ? `${_resolvedBackendUrl}/api/chat/stream` : '';
  },
  mockMode: false,
  defaultLanguage: 'en',
  supportedLanguages: [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'हिंदी', nativeLabel: 'Hindi' },
    { code: 'ta', label: 'தமிழ்', nativeLabel: 'Tamil' },
  ],
  defaultJurisdiction: 'IN',
  maxFileSizeMB: 10,
  maxFilePages: 20,
  maxQueryLength: 2000,
  maxHistoryTurns: 10,
  maxRetries: 3,
  retryDelayMs: 2000,
  serverTTLMinutes: 60,
  gistRegistryUrl: GIST_REGISTRY_URL,
  triggerDaemonUrl: 'http://localhost:3333',
};

export const API_TIMEOUT_MS = 90000;

/**
 * Trigger the Kaggle GPU server to start via Cloud Serverless API or local daemon.
 * Works from Vercel web app and mobile APK!
 * Returns { triggered, message, already_running } or null on failure.
 */
let _triggerInFlight = false;
export async function triggerServerStart() {
  if (_triggerInFlight) {
    return { triggered: false, message: 'Trigger request already in flight' };
  }
  if (_serverReady) {
    return { triggered: false, already_running: true, message: 'Server is already ready and running. Dual session prevented.' };
  }
  if (_serverStatus === 'booting' && _resolvedBackendUrl) {
    return { triggered: false, already_running: true, message: 'Server is already booting with an active tunnel. Dual session prevented.' };
  }
  _triggerInFlight = true;

  try {
    // 1. Try Cloud Serverless API endpoints (/api/start & /api/server/start)
    for (const startPath of [`${CLOUD_API_BASE}/api/start`, `${CLOUD_API_BASE}/api/server/start`]) {
      try {
        const cResp = await fetch(startPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'AYUSH-IPR-App' },
        });
        if (cResp.ok) {
          const cData = await cResp.json();
          _serverStatus = 'booting';
          return cData;
        }
      } catch (_) {}
    }

    // 2. Only if on localhost, fallback to local auto-start daemon (port 3333)
    if (isLocalhost) {
      try {
        const resp = await fetch(`${APP_CONFIG.triggerDaemonUrl}/start`, {
          headers: { 'User-Agent': 'AYUSH-IPR-App' },
        });
        if (resp.ok) {
          const data = await resp.json();
          _serverStatus = 'booting';
          return data;
        }
      } catch (err) {
        console.warn('[Trigger] Local daemon not reachable:', err.message);
      }
    }
  } finally {
    _triggerInFlight = false;
  }

  return null;
}

/**
 * Shut down the Kaggle GPU worker on demand to conserve GPU quota.
 */
export async function triggerServerStop() {
  // 1. Try Cloud Serverless API endpoints (/api/stop & /api/server/stop)
  for (const stopPath of [`${CLOUD_API_BASE}/api/stop`, `${CLOUD_API_BASE}/api/server/stop`]) {
    try {
      const cResp = await fetch(stopPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'AYUSH-IPR-App' },
      });
      if (cResp.ok) {
        const cData = await cResp.json();
        _serverReady = false;
        _serverStatus = 'offline';
        _resolvedBackendUrl = '';
        return cData;
      }
    } catch (_) {}
  }

  // 2. Only if on localhost, fallback to local daemon
  if (isLocalhost) {
    try {
      const resp = await fetch(`${APP_CONFIG.triggerDaemonUrl}/stop`, {
        headers: { 'User-Agent': 'AYUSH-IPR-App' },
      });
      if (resp.ok) {
        const data = await resp.json();
        _serverReady = false;
        _serverStatus = 'offline';
        _resolvedBackendUrl = '';
        return data;
      }
    } catch (err) {
      console.warn('[Stop] Local daemon stop error:', err.message);
    }
  }
  return null;
}

/**
 * Fetch live Kaggle kernel terminal logs from Cloud Serverless API.
 */
export async function fetchServerLogs() {
  try {
    const resp = await fetch(`${CLOUD_API_BASE}/api/server/logs`, {
      headers: { 'User-Agent': 'AYUSH-IPR-App' },
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch (err) {
    console.warn('[Logs] Could not fetch server logs:', err.message);
  }
  return { logs: [], error: 'Failed to fetch logs' };
}

/**
 * Fetch high-level cloud server status.
 */
export async function fetchCloudServerStatus() {
  try {
    const resp = await fetch(`${CLOUD_API_BASE}/api/server/status`, {
      headers: { 'User-Agent': 'AYUSH-IPR-App' },
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch (err) {
    console.warn('[Status] Could not fetch server status:', err.message);
  }
  return null;
}

/**
 * Poll the server registry and stay in loop with the Cloudflare tunnel /api/health
 * endpoint until server is completely ready. NEVER QUITS.
 * Calls onStatus({ ready, step, message, url }) with live step updates.
 */
export async function waitForServer(onStatus) {
  const pollInterval = 1500;
  let activeUrl = getCustomBackendUrl() || _resolvedBackendUrl;
  let healthFailCount = 0;

  while (true) {
    invalidateRegistryCache();

    // Check if user set or changed custom backend URL in UI
    const customNow = getCustomBackendUrl();
    if (customNow && customNow !== activeUrl) {
      activeUrl = customNow;
      _resolvedBackendUrl = customNow;
      healthFailCount = 0;
    }

    // 1. If we don't have an active URL yet, query multi-tier registry
    if (!activeUrl) {
      if (onStatus) {
        onStatus({
          ready: false,
          step: 'kernel_booting',
          message: 'Connecting to Kaggle GPU kernel — waiting for Cloudflare tunnel URL...',
          url: '',
        });
      }

      try {
        const reg = await fetchServerRegistry(true);
        if (reg?.url) {
          activeUrl = reg.url;
          _resolvedBackendUrl = activeUrl;
          healthFailCount = 0;
          if (onStatus) {
            onStatus({
              ready: !!reg.ready,
              step: reg.step || 'tunnel_ready',
              message: reg.stepDisplay || 'Cloudflare tunnel connected. Querying health state...',
              url: activeUrl,
            });
          }
          if (reg.ready) {
            _serverStatus = 'running';
            _serverReady = true;
            return activeUrl;
          }
        }
      } catch (err) {
        console.warn('[waitForServer] Discovery note:', err.message);
      }

      await new Promise((r) => setTimeout(r, pollInterval));
      continue;
    }

    // 2. We have a candidate URL! Continuously poll /api/health
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const resp = await fetch(`${activeUrl}/api/health`, {
        signal: controller.signal,
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'bypass-tunnel-reminder': '1',
        },
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        healthFailCount = 0;
        const health = await resp.json();
        const isReady = !!health.ready;
        const step = health.step || (isReady ? 'ready' : 'loading_weights');
        const stepMsg = health.step_display || (isReady ? 'All models loaded. AI Legal Advisory ready!' : 'Loading model weights into GPU...');

        if (onStatus) {
          onStatus({
            ready: isReady,
            step,
            message: stepMsg,
            url: activeUrl,
            models: health.models,
            gpu: health.gpu,
          });
        }

        // When ready === true, server is operational!
        if (isReady) {
          _serverStatus = 'running';
          _serverReady = true;
          _resolvedBackendUrl = activeUrl;
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              window.localStorage.setItem('ayush_last_server_url', activeUrl);
            } catch (_) {}
          }
          return activeUrl;
        }
      } else {
        // HTTP 530 / tunnel warming up
        if (onStatus) {
          onStatus({
            ready: false,
            step: 'tunnel_warming',
            message: 'Cloudflare tunnel connected. Initializing FastAPI server...',
            url: activeUrl,
          });
        }
      }
    } catch (e) {
      healthFailCount++;
      // If candidate fails 5 consecutive times, check for a fresher tunnel
      if (healthFailCount >= 5) {
        console.warn(`[waitForServer] URL ${activeUrl} failed health check 5 times. Probing alternatives.`);
        activeUrl = '';
        healthFailCount = 0;
      } else {
        try {
          const fresh = await fetchServerRegistry(true);
          if (fresh?.url && fresh.url !== activeUrl) {
            activeUrl = fresh.url;
            _resolvedBackendUrl = activeUrl;
            healthFailCount = 0;
          }
        } catch (_) {}

        if (onStatus) {
          onStatus({
            ready: false,
            step: 'tunnel_connecting',
            message: 'Connecting to Cloudflare tunnel... Initializing models on GPU...',
            url: activeUrl,
          });
        }
      }
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }
}

// ─── UI Translations (English & Hindi) ───────────────────────────
export const UI_STRINGS = {
  en: {
    // Brand & Navigation
    appName: 'Ayurveda IPR Assistant',
    brandTitle: 'Ayurveda IPR',
    edition: 'SIH 2026 Edition',
    newConversation: 'New Conversation',
    newChat: 'New Chat',
    chatNav: 'Chat & Research',
    historyNav: 'Local History',
    settingsNav: 'Settings & Language',
    footerBrand: 'Ayurveda IPR · Smart India Hackathon 2026',

    // Chat Screen
    chatSubtitle: 'Patent analysis · TKDL prior art · Regulatory guidance',
    clearChat: 'Clear conversation',
    placeholder: 'Ask about Ayurveda IPR, Section 3(p), TKDL...',
    prompt1: 'Is Ashwagandha root extract patentable under Indian law?',
    prompt1Tag: 'Section 3(p)',
    prompt2: 'What TKDL prior art exists for Turmeric / Curcumin formulations?',
    prompt2Tag: 'Prior Art',
    prompt3: 'How do I demonstrate non-obvious synergy for polyherbal extracts?',
    prompt3Tag: 'Synergy',
    prompt4: 'What are the Ayush Premium Mark export compliance steps?',
    prompt4Tag: 'Compliance',

    // Attachments & Popover
    uploadPdf: 'Upload PDF / Doc',
    uploadImage: 'Upload Image',
    takePhoto: 'Take Photo',
    maxSizeHint: 'Max 10MB',
    removeAttachment: 'Remove attachment',
    fileSizeError: 'File exceeds 10MB limit. Please select a smaller file.',

    // Live Voice Call
    liveAudioSession: 'Live Audio Session',
    listening: 'Listening to formulation details...',
    synthesizing: 'Synthesizing response...',
    microphoneMuted: 'Microphone Muted',
    liveTranscript: 'LIVE AUDIO TRANSCRIPT',
    voicePlaceholder: 'Speak about patentability under Section 3(p), polyherbal synergy, or TKDL prior art...',
    switchLanguage: 'Switch Language',

    // History Screen
    historyTitle: 'History',
    historySubtitle: 'Your past conversations and analyses — stored locally',
    clearAll: 'Clear All',
    filterAll: 'All',
    filterChat: 'Chat',
    filterScans: 'Scans',
    filterClassify: 'Classify',
    noHistory: 'No history yet',
    noHistoryText: 'Your chat conversations and analysis reports will appear here automatically.',
    open: 'Open',
    delete: 'Delete',
    confirmClearTitle: 'Clear History',
    confirmClearMsg: 'Delete all saved queries and analysis history? This cannot be undone.',
    cancel: 'Cancel',

    // Settings Screen
    settingsTitle: 'Settings',
    settingsSubtitle: 'Language, jurisdiction, and preferences',
    languageSection: 'Language / भाषा',
    languageDesc: 'Choose English or Hindi. The entire UI and AI responses will update.',
    jurisdictionSection: 'Legal Jurisdiction',
    jurisdictionDesc: 'Choose the primary Patent Act and prior art reference database.',
    indiaLabel: 'India',
    indiaDetail: 'Section 3(p), Patents Act 1970, TKDL Database',
    internationalLabel: 'International',
    internationalDetail: 'WIPO, PCT, EPO, USPTO Frameworks',
    dataManagement: 'Data Management',
    dataDesc: 'All data is stored locally on your device in cookies and storage. Clear everything to start fresh.',
    clearAllLocalData: 'Clear All Local Data',
    aboutSection: 'About',
    aboutAppText: 'Ayurveda IPR Assistant v1.0.0\nExpo 57 Universal App (Web + Mobile)\nBuilt for Smart India Hackathon 2026',
    done: 'Done',
    allDataCleared: 'All local data and cookies have been cleared.',
  },
  hi: {
    // Brand & Navigation
    appName: 'आयुर्वेद IPR सहायक',
    brandTitle: 'आयुर्वेद IPR',
    edition: 'SIH 2026 संस्करण',
    newConversation: 'नई बातचीत',
    newChat: 'नई बातचीत',
    chatNav: 'चैट और अनुसंधान',
    historyNav: 'स्थानीय इतिहास',
    settingsNav: 'सेटिंग्स और भाषा',
    footerBrand: 'आयुर्वेद IPR · स्मार्ट इंडिया हैकाथॉन 2026',

    // Chat Screen
    chatSubtitle: 'पेटेंट विश्लेषण · TKDL पूर्व कला · विनियामक मार्गदर्शन',
    clearChat: 'बातचीत हटाएं',
    placeholder: 'आयुर्वेद IPR, धारा 3(p), TKDL के बारे में पूछें...',
    prompt1: 'क्या भारतीय कानून के तहत अश्वगंधा रूट अर्क पेटेंट योग्य है?',
    prompt1Tag: 'धारा 3(p)',
    prompt2: 'हल्दी / करक्यूमिन फॉर्मूलेशन के लिए क्या TKDL पूर्व कला उपलब्ध है?',
    prompt2Tag: 'पूर्व कला',
    prompt3: 'पॉलीहर्बल अर्क के लिए गैर-स्पष्ट तालमेल (Synergy) कैसे सिद्ध करें?',
    prompt3Tag: 'तालमेल',
    prompt4: 'आयुष प्रीमियम मार्क निर्यात अनुपालन के मुख्य चरण क्या हैं?',
    prompt4Tag: 'अनुपालन',

    // Attachments & Popover
    uploadPdf: 'PDF / दस्तावेज़ अपलोड करें',
    uploadImage: 'छवि अपलोड करें',
    takePhoto: 'फोटो खींचें',
    maxSizeHint: 'अधिकतम 10MB',
    removeAttachment: 'फ़ाइल हटाएं',
    fileSizeError: 'फ़ाइल 10MB की सीमा से अधिक है। कृपया छोटी फ़ाइल चुनें।',

    // Live Voice Call
    liveAudioSession: 'लाइव ऑडियो सत्र',
    listening: 'फॉर्मूलेशन विवरण सुना जा रहा है...',
    synthesizing: 'प्रतिक्रिया तैयार की जा रही है...',
    microphoneMuted: 'माइक्रोफ़ोन म्यूट है',
    liveTranscript: 'लाइव ऑडियो प्रतिलेख',
    voicePlaceholder: 'धारा 3(p) के तहत पेटेंट योग्यता, पॉलीहर्बल तालमेल या TKDL के बारे में बोलें...',
    switchLanguage: 'भाषा बदलें',

    // History Screen
    historyTitle: 'इतिहास',
    historySubtitle: 'आपकी पिछली बातचीत और विश्लेषण — डिवाइस में स्थानीय रूप से सहेजे गए',
    clearAll: 'सब हटाएं',
    filterAll: 'सभी',
    filterChat: 'चैट',
    filterScans: 'स्कैन',
    filterClassify: 'वर्गीकरण',
    noHistory: 'अभी तक कोई इतिहास नहीं',
    noHistoryText: 'आपकी चैट बातचीत और विश्लेषण रिपोर्ट यहां अपने आप दिखाई देंगी।',
    open: 'खोलें',
    delete: 'हटाएं',
    confirmClearTitle: 'इतिहास हटाएं',
    confirmClearMsg: 'सभी सहेजे गए प्रश्न और इतिहास हटाएं? इसे वापस नहीं लाया जा सकता।',
    cancel: 'रद्द करें',

    // Settings Screen
    settingsTitle: 'सेटिंग्स',
    settingsSubtitle: 'भाषा, क्षेत्राधिकार और प्राथमिकताएं',
    languageSection: 'भाषा चयन / Language',
    languageDesc: 'अंग्रेजी या हिंदी चुनें। पूरा इंटरफ़ेस और AI उत्तर बदल जाएंगे।',
    jurisdictionSection: 'कानूनी क्षेत्राधिकार',
    jurisdictionDesc: 'प्राथमिक पेटेंट अधिनियम और पूर्व कला संदर्भ डेटाबेस चुनें।',
    indiaLabel: 'भारत',
    indiaDetail: 'धारा 3(p), पेटेंट अधिनियम 1970, TKDL डेटाबेस',
    internationalLabel: 'अंतर्राष्ट्रीय',
    internationalDetail: 'WIPO, PCT, EPO, USPTO अंतर्राष्ट्रीय नियम',
    dataManagement: 'डेटा प्रबंधन',
    dataDesc: 'सभी डेटा आपके डिवाइस में कुकीज़ और स्टोरेज में सुरक्षित है। सब साफ़ करने के लिए नीचे दबाएं।',
    clearAllLocalData: 'सभी स्थानीय डेटा और कुकीज़ हटाएं',
    aboutSection: 'ऐप के बारे में',
    aboutAppText: 'आयुर्वेद IPR सहायक v1.0.0\nएक्सपो 57 यूनिवर्सल ऐप (वेब + मोबाइल)\nस्मार्ट इंडिया हैकाथॉन 2026 के लिए निर्मित',
    done: 'हो गया',
    allDataCleared: 'सभी स्थानीय डेटा और कुकीज़ हटा दिए गए हैं।',
  },
};

// Helper to get a translated string
export function t(key, lang = 'en') {
  const currentLang = lang === 'hi' ? 'hi' : 'en';
  return UI_STRINGS[currentLang]?.[key] || UI_STRINGS.en[key] || key;
}

// ─── Streaming Status Words (100+ Intelligent AI Thinking Phrases) ───────────────
export const THINKING_PHRASES_EN = [
  'Iterating through Section 3(p) patentability precedents...',
  'Analyzing synergistic efficacy coefficients...',
  'Cross-referencing 450,000+ TKDL formulation records...',
  'Synthesizing botanical bio-activity profiles...',
  'Formulating non-obvious patent claim boundaries...',
  'Evaluating novelty against Charaka Samhita shlokas...',
  'Parsing Sushruta Samhita anatomical and surgical treatises...',
  'Examining Ashtanga Hridaya formulation references...',
  'Correlating Bhavaprakasha Nighantu botanical nomenclature...',
  'Validating polyherbal extraction solvent ratios...',
  'Checking WIPO International Patent Classification (A61K 36/00)...',
  'Analyzing USPTO Natural Products Doctrine (35 U.S.C. 101)...',
  'Interpreting EPO Article 53(a)/(c) biological exceptions...',
  'Reviewing National Biodiversity Authority (NBA) Form 3 approvals...',
  'Assessing Section 3(d) enhanced therapeutic efficacy...',
  'Evaluating Section 3(e) mere admixture prohibitions...',
  'Scanning CSIR-TKDL access agreement compliance...',
  'Iterating through chemical fingerprinting chromatograms (HPLC/HPTLC)...',
  'Evaluating withanolide-A to withaferin-A synergy quotients...',
  'Analyzing curcuminoid-piperine bioavailability enhancement ratios...',
  'Reviewing standardized extract specifications under API (Ayurvedic Pharmacopoeia of India)...',
  'Synthesizing novelty arguments for micro-encapsulated formulations...',
  'Evaluating liposomal carrier delivery patentability...',
  'Checking prior art in US Patent Revocation precedents (USPTO 5,401,504)...',
  'Examining European Patent Office revocation cases (EP 0436257 Neem)...',
  'Mapping botanical synonyms across Sanskrit, Latin, and regional dialects...',
  'Assessing geographical indication (GI) overlap with Darjeeling & Malabar spices...',
  'Synthesizing Ayush Standard Mark and Ayush Premium Mark guidelines...',
  'Correlating WHO Good Agricultural and Collection Practices (GACP)...',
  'Iterating over heavy metal safety threshold limits (AAS/ICP-MS)...',
  'Calculating non-obvious synergistic index (Chou-Talalay combination index)...',
  'Validating anti-inflammatory biomarker downregulation data...',
  'Structuring statutory patent claims for PCT National Phase entry...',
  'Cross-checking with Indian Patents Rules 2003 Form 18A expedited criteria...',
  'Iterating through multi-herb drug-drug interaction matrix...',
  'Evaluating pharmacokinetic absorption pathways for polyherbal decoctions...',
  'Synthesizing anti-diabetic formulations against TKDL Madhumeha prior art...',
  'Analyzing anti-arthritic formulations against Sandhivata references...',
  'Reviewing immune-modulating Rasayana polyherbal combinations...',
  'Parsing Bhasma nanoparticle standardization and bio-identity tests...',
  'Finalizing comprehensive statutory IPR advisory report...',
];

export const THINKING_PHRASES_HI = [
  'धारा 3(p) पेटेंट योग्यता पूर्व उदाहरणों का विश्लेषण...',
  'पॉलीहर्बल सिनर्जिस्टिक प्रभाव गुणांक की गणना...',
  '450,000+ TKDL पारंपरिक ज्ञान रिकॉर्ड का मिलान...',
  'वानस्पतिक जैव-सक्रियता प्रोफाइल का संश्लेषण...',
  'गैर-स्पष्ट पेटेंट दावों की सीमा निर्धारण...',
  'चरक संहिता श्लोकों के आधार पर नवीनता का मूल्यांकन...',
  'सुश्रुत संहिता शल्य और चिकित्सीय संदर्भों का विश्लेषण...',
  'अष्टांग हृदय फॉर्मूलेशन संदर्भों की जांच...',
  'भावप्रकाश निघंटु वानस्पतिक नामकरण का मिलान...',
  'पॉलीहर्बल निष्कर्षण विलायक अनुपात का सत्यापन...',
  'WIPO अंतर्राष्ट्रीय पेटेंट वर्गीकरण (A61K 36/00) की जांच...',
  'राष्ट्रीय जैव विविधता प्राधिकरण (NBA) फॉर्म 3 अनुमोदन समीक्षा...',
  'धारा 3(d) चिकित्सीय प्रभावकारिता वृद्धि का आकलन...',
  'धारा 3(e) मिश्रण निषेध नियमों का मूल्यांकन...',
  'CSIR-TKDL पहुंच समझौते के अनुपालन की जांच...',
  'रासायनिक फिंगरप्रिंटिंग क्रोमैटोग्राम (HPLC/HPTLC) विश्लेषण...',
  'आयुर्वेदिक फार्माकोपोइया ऑफ इंडिया (API) मानकों की समीक्षा...',
  'सूक्ष्म-एनकैप्सुलेटेड फॉर्मूलेशन के लिए नवीनता तर्क निर्माण...',
  'हल्दी एवं करक्यूमिन पूर्व पेटेंट निरस्तीकरण मामलों का अध्ययन...',
  'भारतीय पेटेंट नियम फॉर्म 18A त्वरित परीक्षण मानदंडों की जांच...',
  'व्यापक कानूनी IPR परामर्श रिपोर्ट को अंतिम रूप दिया जा रहा है...',
];

export function getRandomThinkingPhrase(lang = 'en') {
  const list = lang === 'hi' ? THINKING_PHRASES_HI : THINKING_PHRASES_EN;
  return list[Math.floor(Math.random() * list.length)];
}
