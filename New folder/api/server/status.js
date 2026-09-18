const {
  setCors,
  getKaggleStatus,
  readGistRegistry,
  pollNtfyTunnels,
} = require('./_kaggle');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const [kaggleState, gistRegistry] = await Promise.all([
      getKaggleStatus(),
      readGistRegistry(),
    ]);

    const kaggleStatus = kaggleState.status || 'UNKNOWN';
    let serverUrl = gistRegistry?.server_url || '';
    let status = 'offline';
    let ready = false;
    let healthData = null;

    // Is Kaggle currently active or booting?
    const isKaggleActive = ['RUNNING', 'QUEUED', 'STARTING'].includes(kaggleStatus);

    if (serverUrl) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const healthResp = await fetch(`${serverUrl}/api/health`, {
          signal: ctrl.signal,
          headers: {
            'User-Agent': 'AYUSH-IPR-Guardian',
            'Bypass-Tunnel-Reminder': 'true',
            'bypass-tunnel-reminder': '1',
          },
        });
        clearTimeout(timer);

        if (healthResp.ok) {
          healthData = await healthResp.json();
          ready = !!healthData.ready;
          status = ready ? 'running' : 'booting';
        } else {
          serverUrl = '';
        }
      } catch (_) {
        serverUrl = '';
      }
    }

    // If serverUrl failed health or wasn't in Gist, check ntfy tunnels!
    if (!serverUrl) {
      try {
        const ntfyUrls = await pollNtfyTunnels();
        for (const candidate of ntfyUrls) {
          try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 3500);
            const resp = await fetch(`${candidate}/api/health`, {
              signal: ctrl.signal,
              headers: { 'Bypass-Tunnel-Reminder': 'true' },
            });
            clearTimeout(timer);
            if (resp.ok) {
              healthData = await resp.json();
              ready = !!healthData.ready;
              status = ready ? 'running' : 'booting';
              serverUrl = candidate;

              // Auto-sync active tunnel to Gist so frontend gets it instantly
              try {
                const { updateGistRegistry } = require('./_kaggle');
                await updateGistRegistry({
                  server_url: candidate,
                  status,
                  started_at: healthData?.started_at || new Date().toISOString(),
                  expires_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
                  last_heartbeat: new Date().toISOString(),
                  kaggle_kernel: 'vanshseth003/ayush-ipr-guardian',
                });
              } catch (_) {}
              break;
            }
          } catch (_) {}
        }
      } catch (_) {}
    }

    if (!serverUrl) {
      status = isKaggleActive || gistRegistry?.status === 'booting' ? 'booting' : 'offline';
    }

    return res.status(200).json({
      status, // 'running' | 'booting' | 'offline'
      ready,
      server_url: serverUrl,
      kaggle_status: kaggleStatus,
      kaggle_active: isKaggleActive,
      health: healthData,
      last_heartbeat: gistRegistry?.last_heartbeat || null,
      started_at: gistRegistry?.started_at || null,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
