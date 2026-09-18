"""
AYUSH-IPR Guardian — Auto-Start Daemon
========================================
Runs in background on your machine. Does THREE things:
1. Monitors Gist for offline status → auto-pushes Kaggle kernel
2. Polls ntfy for tunnel URL → pushes discovered URL to Gist
3. Provides a tiny HTTP API (port 3333) for the app to trigger starts

The Expo app calls http://localhost:3333/start to trigger everything.
"""
import sys
import os
import json
import time
import re
import threading
import subprocess
import urllib.request
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from datetime import datetime, timezone, timedelta

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent
GIST_ID = "7873aa6da8f97b2b817137dd4f2df5be"
GIST_FILENAME = "server_registry.json"
GITHUB_TOKEN = ""
KAGGLE_DIR = ROOT / "kaggle"
SERVER_TTL_MINUTES = 60

# ─── Discover GitHub Token ────────────────────────────────────
def _find_github_token():
    global GITHUB_TOKEN
    if os.environ.get("GITHUB_TOKEN"):
        GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
        return
    # Try git credential helper
    try:
        result = subprocess.run(
            ["git", "credential", "fill"],
            input="protocol=https\nhost=github.com\n",
            capture_output=True, text=True, timeout=5
        )
        for line in result.stdout.strip().split("\n"):
            if line.startswith("password="):
                GITHUB_TOKEN = line.split("=", 1)[1]
                return
    except Exception:
        pass

_find_github_token()
print(f"  GitHub token: {'found' if GITHUB_TOKEN else 'MISSING'}")

# ─── State ────────────────────────────────────────────────────
_kernel_pushing = False
_last_push_time = 0
_discovered_url = ""
_server_status = "unknown"


# ─── Gist Operations ─────────────────────────────────────────

def gist_read():
    """Read current registry from Gist."""
    try:
        headers = {"User-Agent": "AYUSH-IPR-Guardian"}
        if GITHUB_TOKEN:
            headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
        req = urllib.request.Request(
            f"https://api.github.com/gists/{GIST_ID}", headers=headers
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            gist = json.loads(resp.read().decode("utf-8"))
            content = gist["files"][GIST_FILENAME]["content"]
            return json.loads(content)
    except Exception as e:
        print(f"  [Gist] Read error: {e}")
        return None


def gist_push(url, status="running"):
    """Push URL and status to Gist."""
    if not GITHUB_TOKEN:
        print("  [Gist] No token — cannot push")
        return False
    try:
        now = datetime.now(timezone.utc)
        expires = now + timedelta(minutes=SERVER_TTL_MINUTES)
        registry = {
            "server_url": url,
            "status": status,
            "started_at": now.isoformat(),
            "expires_at": expires.isoformat(),
            "last_heartbeat": now.isoformat(),
            "kaggle_kernel": "vanshseth003/ayush-ipr-guardian",
        }
        payload = json.dumps({
            "files": {GIST_FILENAME: {"content": json.dumps(registry, indent=2)}}
        }).encode("utf-8")
        req = urllib.request.Request(
            f"https://api.github.com/gists/{GIST_ID}",
            data=payload, method="PATCH",
            headers={
                "Authorization": f"Bearer {GITHUB_TOKEN}",
                "Content-Type": "application/json",
                "User-Agent": "AYUSH-IPR-Guardian",
            },
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print(f"  [Gist] ✓ Pushed: {url} ({status})")
                return True
    except Exception as e:
        print(f"  [Gist] Push error: {e}")
    return False


# ─── URL Discovery (ntfy + health check) ─────────────────────

def poll_ntfy():
    """Poll ntfy for tunnel URLs."""
    candidates = []
    try:
        min_time = time.time() - 600  # Last 10 minutes
        url = "https://ntfy.sh/ayush_ipr_tunnel_sih2026/json?poll=1"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            content = resp.read().decode("utf-8")
        for line in content.strip().split("\n"):
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                msg = data.get("message", "")
                msg_time = data.get("time", 0)
                if msg_time >= min_time and ("loca.lt" in msg or "trycloudflare.com" in msg or msg.startswith("http")):
                    match = re.search(r"(https://[^\s]+)", msg)
                    if match:
                        u = match.group(1).rstrip("/")
                        if u not in candidates:
                            candidates.append(u)
            except Exception:
                continue
    except Exception:
        pass
    return candidates


def verify_health(base_url):
    """Health check a server URL. Returns health data or None."""
    try:
        req = urllib.request.Request(
            f"{base_url}/api/health",
            headers={
                "User-Agent": "Mozilla/5.0",
                "Bypass-Tunnel-Reminder": "true",
                "bypass-tunnel-reminder": "1",
            },
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("status") in ("ok", "healthy", "loading"):
                return data
    except Exception:
        pass
    return None


# ─── Dual-Session Guard & Kaggle Status ────────────────────────

def check_kaggle_kernel_active():
    """Query Kaggle API to verify if a kernel worker is already RUNNING or QUEUED.
    Prevents duplicate / dual sessions from ever launching!"""
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        status_obj = api.kernels_status("vanshseth003/ayush-ipr-guardian")
        status = str(status_obj.get("status", "")).upper()
        if "RUNNING" in status or "QUEUED" in status or "STARTING" in status:
            return True, status
        return False, status
    except Exception:
        # Fallback to CLI
        try:
            r = subprocess.run(
                'kaggle kernels status vanshseth003/ayush-ipr-guardian',
                shell=True, capture_output=True, text=True, timeout=10
            )
            out = (r.stdout or "").upper()
            if "RUNNING" in out or "QUEUED" in out:
                return True, "RUNNING"
            return False, "NOT_RUNNING"
        except Exception:
            pass
    return False, "UNKNOWN"


# ─── Kaggle Push ──────────────────────────────────────────────

def push_kaggle_kernel():
    """Push the Kaggle kernel to start the server.
    STRICT DUAL-SESSION GUARD: Never pushes if a kernel is already active!"""
    global _kernel_pushing, _last_push_time

    # 1. Local push-in-progress lock
    if _kernel_pushing:
        print("  [Dual-Session Guard] BLOCKED: Push already in progress locally.")
        return True

    # 2. Remote verification: is a worker already RUNNING or QUEUED on Kaggle?
    is_active, remote_status = check_kaggle_kernel_active()
    if is_active:
        print(f"  [Dual-Session Guard] BLOCKED: Kaggle kernel is already {remote_status}! Dual session prevented.")
        return True

    # 3. Check Gist status: is it already in booting grace period?
    reg = gist_read()
    if reg and reg.get("status") == "booting":
        started = reg.get("started_at")
        if started:
            try:
                dt = datetime.fromisoformat(started.replace("Z", "+00:00"))
                age = (datetime.now(timezone.utc) - dt).total_seconds()
                if age < 480:  # 8 min grace period
                    print(f"  [Dual-Session Guard] BLOCKED: Server booting for {age:.0f}s. Waiting for tunnel, dual session prevented.")
                    return True
            except Exception:
                pass

    # 4. Enforce minimum cooldown between pushes (3 minutes)
    if time.time() - _last_push_time < 180:
        print("  [Dual-Session Guard] BLOCKED: Kernel was pushed less than 3 minutes ago. Dual session prevented.")
        return True

    if not (KAGGLE_DIR / "kernel-metadata.json").exists():
        print("  [Kaggle] kernel-metadata.json not found!")
        return False

    _kernel_pushing = True
    _last_push_time = time.time()

    try:
        env = os.environ.copy()
        env["PYTHONUTF8"] = "1"
        print("  [Kaggle] Pushing single kernel instance...", flush=True)
        result = subprocess.run(
            f'kaggle kernels push -p "{KAGGLE_DIR}"',
            shell=True,
            capture_output=True,
            timeout=40,
            env=env,
        )
        output = (result.stdout or b"").decode("utf-8", errors="ignore")
        stderr = (result.stderr or b"").decode("utf-8", errors="ignore")

        if "successfully pushed" in output.lower() or "successfully pushed" in stderr.lower():
            print(f"  [Kaggle] ✓ Kernel pushed! {output.strip()}")
            gist_push("", status="booting")
            return True
        else:
            print(f"  [Kaggle] Push output: {output} {stderr}")
            return result.returncode == 0
    except Exception as e:
        print(f"  [Kaggle] Push error: {e}")
        return False
    finally:
        _kernel_pushing = False


# ─── Discovery Loop (runs in background thread) ──────────────

def discovery_loop():
    """Continuously poll for tunnel URL and push to Gist when found."""
    global _discovered_url, _server_status

    print("  [Discovery] Starting URL discovery loop...")
    while True:
        try:
            # 1. Check Gist first: prompt health to acknowledge whether server is actually present
            reg = gist_read()
            if reg and reg.get("status") in ("running", "booting") and reg.get("server_url"):
                url = reg["server_url"].rstrip("/")
                health = verify_health(url)
                if health:
                    _discovered_url = url
                    _server_status = "running" if health.get("ready") else "booting"
                    time.sleep(20)  # Recheck in 20s
                    continue
                elif reg.get("status") == "running":
                    # Server showed running/not expired, but failed health check! Nullify Gist!
                    print(f"  [Discovery] Server {url} failed health check. Nullifying Gist to offline.")
                    _discovered_url = ""
                    _server_status = "offline"
                    gist_push("", status="offline")

            # 2. Poll ntfy for candidates
            candidates = poll_ntfy()
            for url in candidates:
                health = verify_health(url)
                if health:
                    _discovered_url = url
                    _server_status = health.get("status", "running")
                    print(f"  [Discovery] ✓ Found live server: {url}")
                    # Push to Gist so the app can discover it
                    gist_push(url, status="running")
                    time.sleep(30)
                    break
            else:
                if _server_status == "running":
                    _server_status = "offline"
                    _discovered_url = ""

        except Exception as e:
            print(f"  [Discovery] Error: {e}")

        time.sleep(10)  # Poll every 10s


# ─── HTTP Trigger API (for the Expo app) ──────────────────────

class TriggerHandler(BaseHTTPRequestHandler):
    """Tiny HTTP API so the Expo app can trigger server start & stop."""

    def do_GET(self):
        # CORS headers for browser requests
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

        if self.path == "/start":
            # 1. Check if live server is ALREADY healthy
            reg = gist_read()
            if reg and reg.get("server_url") and reg.get("status") == "running":
                health = verify_health(reg["server_url"].rstrip("/"))
                if health and health.get("ready"):
                    response = {
                        "triggered": False,
                        "already_running": True,
                        "server_url": reg["server_url"],
                        "message": "Server is already online and healthy. Dual session prevented.",
                    }
                    self.wfile.write(json.dumps(response).encode("utf-8"))
                    return

            # 2. Strict remote verification: is a worker already RUNNING or QUEUED on Kaggle?
            is_active, remote_status = check_kaggle_kernel_active()
            if is_active:
                response = {
                    "triggered": False,
                    "already_running": True,
                    "kaggle_status": remote_status,
                    "message": f"Kaggle kernel is already {remote_status}. Waiting for tunnel — dual session prevented.",
                }
                self.wfile.write(json.dumps(response).encode("utf-8"))
                return

            # 3. No active session found — trigger push safely
            threading.Thread(target=push_kaggle_kernel, daemon=True).start()
            response = {
                "triggered": True,
                "message": "No active session on Kaggle. Single kernel push triggered.",
                "poll_gist": f"https://api.github.com/gists/{GIST_ID}",
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))
        elif self.path == "/stop":
            # Gracefully shut down active Kaggle server instance
            reg = gist_read()
            target_url = reg.get("server_url") if reg else ""
            if target_url:
                try:
                    req = urllib.request.Request(
                        f"{target_url.rstrip('/')}/api/shutdown",
                        data=b"{}",
                        headers={"Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true"},
                        method="POST",
                    )
                    urllib.request.urlopen(req, timeout=5)
                except Exception as e:
                    print(f"  [Stop] Shutdown ping note: {e}")
            gist_push("", status="offline")
            response = {
                "stopped": True,
                "message": "Kaggle instance termination requested and Gist marked offline.",
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))
        elif self.path == "/status":
            is_active, remote_status = check_kaggle_kernel_active()
            response = {
                "server_url": _discovered_url,
                "status": _server_status,
                "kaggle_worker_status": remote_status,
                "kernel_pushing": _kernel_pushing,
                "last_push": _last_push_time,
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))
        elif self.path == "/health":
            response = {"status": "ok", "service": "ayush-ipr-trigger-daemon"}
            self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            response = {"error": "Unknown endpoint. Use /start, /stop, /status, or /health"}
            self.wfile.write(json.dumps(response).encode("utf-8"))

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def log_message(self, format, *args):
        """Suppress default logging."""
        pass


def main():
    TRIGGER_PORT = 3333

    print("\n" + "=" * 60)
    print("  AYUSH-IPR GUARDIAN — Auto-Start Daemon")
    print("=" * 60)
    print(f"  Trigger API: http://localhost:{TRIGGER_PORT}")
    print(f"  Endpoints:   /start  /status  /health")
    print(f"  Gist ID:     {GIST_ID}")
    print("=" * 60 + "\n", flush=True)

    # Start discovery loop in background
    threading.Thread(target=discovery_loop, daemon=True).start()

    # Start HTTP trigger server
    server = ThreadingHTTPServer(("0.0.0.0", TRIGGER_PORT), TriggerHandler)
    print(f"  [Trigger] Listening on port {TRIGGER_PORT}...\n", flush=True)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down daemon...")
        server.server_close()


if __name__ == "__main__":
    main()
