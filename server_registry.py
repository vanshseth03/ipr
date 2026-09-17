"""
AYUSH-IPR Guardian — Server Registry (GitHub Gist + Kaggle Auto-Start)
======================================================================
Central module for server URL discovery, registration, and auto-start.

Architecture:
  - GitHub Gist stores the current server URL, status, and expiry
  - Kaggle server pushes URL to Gist on boot
  - App reads URL from Gist to connect
  - If server is offline, triggers Kaggle kernel push via API
"""

import json
import os
import time
import subprocess
import sys
from datetime import datetime, timezone, timedelta

sys.stdout.reconfigure(encoding="utf-8")

# ─── Configuration ────────────────────────────────────────────────
GIST_ID = "7873aa6da8f97b2b817137dd4f2df5be"
GIST_FILENAME = "server_registry.json"
GITHUB_USERNAME = "vanshseth03"
KAGGLE_USERNAME = "vanshseth003"
KAGGLE_SLUG = "ayush-ipr-guardian"
DEFAULT_TTL_MINUTES = 60

# GitHub token — read from env or Kaggle secrets
def _get_github_token():
    token = os.environ.get("GITHUB_TOKEN", "")
    if not token:
        try:
            from kaggle_secrets import UserSecretsClient
            token = UserSecretsClient().get_secret("GITHUB_TOKEN")
        except Exception:
            pass
    return token or ""


# ─── Gist Operations ─────────────────────────────────────────────

def push_server_url(url: str, ttl_minutes: int = DEFAULT_TTL_MINUTES) -> bool:
    """Push server URL + expiry to GitHub Gist. Called by Kaggle server on boot."""
    import urllib.request

    token = _get_github_token()
    if not token:
        print("[REGISTRY] No GITHUB_TOKEN — cannot push to Gist", flush=True)
        return False

    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=ttl_minutes)

    registry_data = {
        "server_url": url.rstrip("/"),
        "status": "running",
        "started_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "last_heartbeat": now.isoformat(),
        "kaggle_kernel": f"{KAGGLE_USERNAME}/{KAGGLE_SLUG}",
    }

    payload = json.dumps({
        "files": {
            GIST_FILENAME: {
                "content": json.dumps(registry_data, indent=2)
            }
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.github.com/gists/{GIST_ID}",
        data=payload,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "AYUSH-IPR-Guardian",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print(f"[REGISTRY] ✓ Pushed URL to Gist: {url} (expires in {ttl_minutes}min)", flush=True)
                return True
    except Exception as e:
        print(f"[REGISTRY] Gist push failed: {e}", flush=True)
    return False


def heartbeat(url: str, extend_minutes: int = DEFAULT_TTL_MINUTES) -> bool:
    """Update heartbeat timestamp and extend expiry. Called every 5 min by server."""
    import urllib.request

    token = _get_github_token()
    if not token:
        return False

    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=extend_minutes)

    # Read current registry first
    current = get_server_status()
    if current:
        current["last_heartbeat"] = now.isoformat()
        current["expires_at"] = expires.isoformat()
        current["status"] = "running"
        current["server_url"] = url.rstrip("/")
    else:
        current = {
            "server_url": url.rstrip("/"),
            "status": "running",
            "started_at": now.isoformat(),
            "expires_at": expires.isoformat(),
            "last_heartbeat": now.isoformat(),
            "kaggle_kernel": f"{KAGGLE_USERNAME}/{KAGGLE_SLUG}",
        }

    payload = json.dumps({
        "files": {
            GIST_FILENAME: {
                "content": json.dumps(current, indent=2)
            }
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.github.com/gists/{GIST_ID}",
        data=payload,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "AYUSH-IPR-Guardian",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception:
        return False


def mark_offline() -> bool:
    """Mark server as offline in Gist. Called on shutdown."""
    import urllib.request

    token = _get_github_token()
    if not token:
        return False

    now = datetime.now(timezone.utc)
    registry_data = {
        "server_url": "",
        "status": "offline",
        "started_at": "",
        "expires_at": "",
        "last_heartbeat": now.isoformat(),
        "kaggle_kernel": f"{KAGGLE_USERNAME}/{KAGGLE_SLUG}",
    }

    payload = json.dumps({
        "files": {
            GIST_FILENAME: {
                "content": json.dumps(registry_data, indent=2)
            }
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.github.com/gists/{GIST_ID}",
        data=payload,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "AYUSH-IPR-Guardian",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print("[REGISTRY] ✓ Marked server as offline", flush=True)
                return True
    except Exception as e:
        print(f"[REGISTRY] Mark offline failed: {e}", flush=True)
    return False


def get_server_status() -> dict:
    """Read current server status from Gist. Works without auth (public raw URL)."""
    import urllib.request

    # Use the API with auth for reliability (secret gists need auth)
    token = _get_github_token()
    headers = {"User-Agent": "AYUSH-IPR-Guardian"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        f"https://api.github.com/gists/{GIST_ID}",
        headers=headers,
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            gist = json.loads(resp.read().decode("utf-8"))
            content = gist["files"][GIST_FILENAME]["content"]
            return json.loads(content)
    except Exception as e:
        print(f"[REGISTRY] Read failed: {e}", flush=True)
        return None


def get_live_server_url() -> str:
    """Get the live server URL if server is running and not expired. Returns '' if offline."""
    status = get_server_status()
    if not status:
        return ""

    if status.get("status") != "running":
        return ""

    url = status.get("server_url", "")
    if not url:
        return ""

    # Check expiry
    expires_str = status.get("expires_at", "")
    if expires_str:
        try:
            expires = datetime.fromisoformat(expires_str)
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > expires:
                return ""  # Expired
        except Exception:
            pass

    return url


def is_server_alive(url: str) -> bool:
    """Health check a server URL."""
    import urllib.request

    if not url:
        return False

    try:
        req = urllib.request.Request(
            f"{url.rstrip('/')}/api/health",
            headers={
                "User-Agent": "Mozilla/5.0",
                "Bypass-Tunnel-Reminder": "true",
            },
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("status") in ("ok", "healthy")
    except Exception:
        return False


# ─── Kaggle Auto-Start ────────────────────────────────────────────

def trigger_kaggle_start() -> bool:
    """Push the Kaggle kernel to start the server. Called when server is offline."""
    print("[REGISTRY] Triggering Kaggle kernel push...", flush=True)

    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"

    # Ensure Kaggle API credentials
    kaggle_json = os.path.expanduser("~/.kaggle/kaggle.json")
    if not os.path.exists(kaggle_json):
        print("[REGISTRY] No Kaggle credentials found at ~/.kaggle/kaggle.json", flush=True)
        return False

    try:
        # Find the kaggle directory (where server.py and kernel-metadata.json are)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        kaggle_dir = os.path.join(script_dir, "kaggle")

        if not os.path.exists(os.path.join(kaggle_dir, "kernel-metadata.json")):
            print(f"[REGISTRY] kernel-metadata.json not found in {kaggle_dir}", flush=True)
            return False

        result = subprocess.run(
            ["kaggle", "kernels", "push", "-p", kaggle_dir],
            capture_output=True,
            env=env,
            timeout=60,
        )

        stdout = result.stdout.decode("utf-8", errors="ignore") if result.stdout else ""
        stderr = result.stderr.decode("utf-8", errors="ignore") if result.stderr else ""

        if result.returncode == 0:
            print(f"[REGISTRY] ✓ Kaggle kernel pushed! {stdout.strip()}", flush=True)
            return True
        else:
            print(f"[REGISTRY] Kaggle push failed: {stdout} {stderr}", flush=True)
            return False

    except FileNotFoundError:
        print("[REGISTRY] 'kaggle' CLI not found. Install with: pip install kaggle", flush=True)
        return False
    except subprocess.TimeoutExpired:
        print("[REGISTRY] Kaggle push timed out after 60s", flush=True)
        return False
    except Exception as e:
        print(f"[REGISTRY] Kaggle push error: {e}", flush=True)
        return False


def ensure_server_running() -> str:
    """Check if server is running. If not, trigger Kaggle push and wait.
    Returns the live URL or empty string on failure."""

    # 1. Check Gist for existing URL
    url = get_live_server_url()
    if url and is_server_alive(url):
        print(f"[REGISTRY] Server already running at {url}", flush=True)
        return url

    # 2. Server is offline — trigger start
    print("[REGISTRY] Server is offline. Starting Kaggle kernel...", flush=True)
    pushed = trigger_kaggle_start()
    if not pushed:
        return ""

    # 3. Poll for URL (max 15 minutes)
    max_wait = 900  # 15 minutes
    poll_interval = 10
    elapsed = 0

    while elapsed < max_wait:
        time.sleep(poll_interval)
        elapsed += poll_interval

        url = get_live_server_url()
        if url and is_server_alive(url):
            print(f"[REGISTRY] ✓ Server is live at {url} (waited {elapsed}s)", flush=True)
            return url

        if elapsed % 60 == 0:
            print(f"[REGISTRY] Waiting for server... ({elapsed}s / {max_wait}s)", flush=True)

    print("[REGISTRY] Timeout waiting for server to start", flush=True)
    return ""


# ─── CLI ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="AYUSH-IPR Server Registry")
    parser.add_argument("action", choices=["status", "start", "stop", "url"],
                        help="status=check, start=trigger kaggle, stop=mark offline, url=get live URL")
    args = parser.parse_args()

    if args.action == "status":
        s = get_server_status()
        if s:
            print(json.dumps(s, indent=2))
        else:
            print("Could not read registry")
    elif args.action == "url":
        url = get_live_server_url()
        print(url or "OFFLINE")
    elif args.action == "start":
        url = ensure_server_running()
        print(url or "FAILED")
    elif args.action == "stop":
        mark_offline()
