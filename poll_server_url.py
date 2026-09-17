"""
AYUSH-IPR Guardian — Cloudflare Tunnel Auto-Start & Connect
============================================================
Workflow:
1. Check is server on (read Gist & ping /api/health)
2. If not on -> automatically push Kaggle kernel
3. Wait for URL on git to be updated
4. When updated -> connect to Cloudflare tunnel URL and sync all configs
"""
import sys
import os
import time
import json
import re
import urllib.request
import subprocess
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent
sys.stdout.reconfigure(encoding='utf-8')
START_TIME = time.time() - 300

GIST_ID = "7873aa6da8f97b2b817137dd4f2df5be"
GIST_FILENAME = "server_registry.json"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")


def read_gist():
    """Read current registry from GitHub Gist. Returns (url, status, full_dict) or (None, 'offline', None)."""
    try:
        headers = {"User-Agent": "AYUSH-IPR-Guardian"}
        if GITHUB_TOKEN:
            headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
        req = urllib.request.Request(
            f"https://api.github.com/gists/{GIST_ID}",
            headers=headers
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            gist = json.loads(resp.read().decode("utf-8"))
            content = gist["files"][GIST_FILENAME]["content"]
            registry = json.loads(content)
            url = registry.get("server_url", "").rstrip("/")
            status = registry.get("status", "offline")
            return url, status, registry
    except Exception as e:
        return None, f"read_error: {e}", None


def mark_gist_booting():
    """Mark status as 'booting' in Gist immediately after push."""
    if not GITHUB_TOKEN:
        return
    try:
        now = datetime.now(timezone.utc).isoformat()
        payload = json.dumps({
            "files": {
                GIST_FILENAME: {
                    "content": json.dumps({
                        "server_url": "",
                        "status": "booting",
                        "started_at": now,
                        "expires_at": "",
                        "last_heartbeat": now,
                        "kaggle_kernel": "vanshseth003/ayush-ipr-guardian"
                    }, indent=2)
                }
            }
        }).encode("utf-8")
        req = urllib.request.Request(
            f"https://api.github.com/gists/{GIST_ID}",
            data=payload,
            method="PATCH",
            headers={
                "Authorization": f"Bearer {GITHUB_TOKEN}",
                "Content-Type": "application/json",
                "User-Agent": "AYUSH-IPR-Guardian",
            }
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print("  [Gist] Registry marked as 'booting'", flush=True)
    except Exception as e:
        print(f"  [Gist] Update note: {e}", flush=True)


def poll_ntfy(min_time):
    """Fallback tunnel URL discovery via ntfy.sh."""
    candidates = []
    try:
        url = "https://ntfy.sh/ayush_ipr_tunnel_sih2026/json?poll=1"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            content = resp.read().decode("utf-8")
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        for line in reversed(lines):
            try:
                data = json.loads(line)
                msg = data.get("message", "")
                msg_time = data.get("time", 0)
                if msg_time >= min_time and ("trycloudflare.com" in msg or "loca.lt" in msg or msg.startswith("http")):
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
    """Pings /api/health to check if server is responsive and models are ready."""
    health_url = f"{base_url.rstrip('/')}/api/health"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Bypass-Tunnel-Reminder": "true",
        "bypass-tunnel-reminder": "1"
    }
    req = urllib.request.Request(health_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except Exception:
        return None


def trigger_kaggle_push():
    """Push Kaggle kernel to start the server."""
    kaggle_dir = ROOT / "kaggle"
    if not (kaggle_dir / "kernel-metadata.json").exists():
        print("  [ERROR] kernel-metadata.json not found in kaggle/")
        return False
    print("  Triggering Kaggle kernel push (T4 GPU)...", flush=True)
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    result = subprocess.run(
        ["kaggle", "kernels", "push", "-p", str(kaggle_dir)],
        capture_output=True, timeout=60, env=env
    )
    stdout = result.stdout.decode("utf-8", errors="ignore") if result.stdout else ""
    stderr = result.stderr.decode("utf-8", errors="ignore") if result.stderr else ""
    if result.returncode == 0:
        print(f"  ✓ Kaggle kernel pushed! {stdout.strip()}")
        return True
    else:
        print(f"  ✗ Push output: {stdout} {stderr}")
        return result.returncode == 0


def sync_all_configs(live_url):
    """Sync the live Cloudflare tunnel URL across all client configurations."""
    print(f"\n  ✓ Syncing live URL across all project configs: {live_url}")

    # 1. Update New folder/.env
    env_path = ROOT / "New folder" / ".env"
    if env_path.exists():
        env_content = f"""EXPO_PUBLIC_API_URL={live_url}/api
EXPO_PUBLIC_SSE_URL={live_url}/api/chat/stream
EXPO_PUBLIC_WS_URL={live_url.replace('https://', 'wss://')}/ws/voice
EXPO_PUBLIC_MOCK_MODE=false
EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1
"""
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(env_content)
        print("  ✓ Updated New folder/.env")

    # 2. Update test_live_server.py
    tls_path = ROOT / "test_live_server.py"
    if tls_path.exists():
        content = tls_path.read_text(encoding="utf-8")
        content = re.sub(r"base_url\s*=\s*'https://[^']+'", f"base_url = '{live_url}'", content)
        tls_path.write_text(content, encoding="utf-8")
        print("  ✓ Updated test_live_server.py")

    # 3. Update test_live_backend.py
    tlb_path = ROOT / "test_live_backend.py"
    if tlb_path.exists():
        content = tlb_path.read_text(encoding="utf-8")
        content = re.sub(r"base_url\s*=\s*'https://[^']+'", f"base_url = '{live_url}'", content)
        tlb_path.write_text(content, encoding="utf-8")
        print("  ✓ Updated test_live_backend.py")

    # 4. Update test_stream.py
    ts_path = ROOT / "test_stream.py"
    if ts_path.exists():
        content = ts_path.read_text(encoding="utf-8")
        content = re.sub(r"base_url\s*=\s*'https://[^']+'", f"base_url = '{live_url}'", content)
        ts_path.write_text(content, encoding="utf-8")
        print("  ✓ Updated test_stream.py")

    # 5. Update tester/app.js
    appjs_path = ROOT / "tester" / "app.js"
    if appjs_path.exists():
        content = appjs_path.read_text(encoding="utf-8")
        content = re.sub(r"baseUrl:\s*'https://[^']+'", f"baseUrl: '{live_url}'", content)
        appjs_path.write_text(content, encoding="utf-8")
        print("  ✓ Updated tester/app.js")

    # 6. Update tester/index.html
    index_path = ROOT / "tester" / "index.html"
    if index_path.exists():
        content = index_path.read_text(encoding="utf-8")
        content = re.sub(r'value="https://[^"]+"', f'value="{live_url}"', content)
        content = re.sub(r'placeholder="https://[^"]+"', f'placeholder="{live_url}"', content)
        index_path.write_text(content, encoding="utf-8")
        print("  ✓ Updated tester/index.html")


def main():
    print("=" * 60)
    print("  AYUSH-IPR GUARDIAN — Cloudflare Tunnel Auto-Start & Connect")
    print("=" * 60)

    # ─── STEP 1: CHECK IS SERVER ON ──────────────────────────────
    print("\n[Step 1/4] Checking if server is already on...")
    url, status, reg = read_gist()

    if url and status in ("running", "booting"):
        print(f"  Found registered URL: {url} (status: {status})")
        health = verify_health(url)
        if health and (health.get("ready", False) or health.get("status") in ("ok", "healthy")):
            print("\n" + "=" * 60)
            print("  ✓ SERVER IS ALREADY ON AND READY!")
            print(f"  URL: {url}")
            print("=" * 60 + "\n")
            sync_all_configs(url)
            return url
        elif health:
            print(f"  Tunnel is open! Server is booting ({health.get('status')}). Proceeding to connect...")
            live_url = url
        else:
            print("  Registered URL is not responding. Server is offline.")
            url = None
    else:
        print(f"  Registry status: {status}. Server is offline.")

    # ─── STEP 2: IF NOT PUSH KERNEL ──────────────────────────────
    if not url:
        print("\n[Step 2/4] Server is not on. Automatically pushing Kaggle kernel...")
        pushed = trigger_kaggle_push()
        if not pushed:
            print("  ✗ Failed to push Kaggle kernel. Check kaggle credentials.")
            return None
        mark_gist_booting()
        live_url = None
    else:
        print("\n[Step 2/4] Kernel already running on Kaggle. Skipping push.")

    # ─── STEP 3: WAIT FOR URL ON GIT TO BE UPDATED ──────────────
    if not live_url:
        print("\n[Step 3/4] Waiting for URL on Git registry to be updated...")
        max_wait = 900  # 15 minutes
        poll_interval = 6
        elapsed = 0

        while elapsed < max_wait:
            url, status, reg = read_gist()
            if url and ("trycloudflare.com" in url or "loca.lt" in url or url.startswith("http")):
                print(f"\n  ✓ Discovered URL on Git registry: {url} (status: {status})")
                live_url = url
                break

            # Check ntfy fallback
            candidates = poll_ntfy(START_TIME)
            if candidates:
                live_url = candidates[0]
                print(f"\n  ✓ Discovered URL via ntfy: {live_url}")
                break

            elapsed += poll_interval
            sys.stdout.write(f"\r  Waiting for Git update... ({elapsed}s / {max_wait}s)")
            sys.stdout.flush()
            time.sleep(poll_interval)

    if not live_url:
        print("\n  ✗ Timed out waiting for URL on Git.")
        return None

    # ─── STEP 4: CONNECT TO CLOUDTUNNEL URL ──────────────────────
    print(f"\n[Step 4/4] Connecting to Cloudflare Tunnel: {live_url}")
    print("  Verifying server health & model readiness (Gemma 2B + RAG)...")

    model_wait = 0
    max_model_wait = 600
    is_ready = False

    while model_wait < max_model_wait:
        health = verify_health(live_url)
        if health:
            ready = health.get("ready", False)
            h_status = health.get("status", "")
            if ready or h_status in ("ok", "healthy"):
                is_ready = True
                break
            else:
                models = health.get("models", {})
                llm_st = models.get("llm", {}).get("loaded", False)
                rag_st = models.get("rag_db", {}).get("loaded", False)
                sys.stdout.write(f"\r  Loading models: LLM={'READY' if llm_st else 'loading'} | RAG={'READY' if rag_st else 'loading'} ({model_wait}s)")
                sys.stdout.flush()
        else:
            sys.stdout.write(f"\r  Waiting for tunnel endpoint to respond... ({model_wait}s)")
            sys.stdout.flush()

        time.sleep(5)
        model_wait += 5

    print("\n\n" + "=" * 60)
    if is_ready:
        print("  ✓ SERVER IS FULLY ONLINE & READY!")
    else:
        print("  ℹ Tunnel connected (models still initializing in background)")
    print(f"  Cloudflare Tunnel URL: {live_url}")
    print("=" * 60 + "\n")

    # Sync all configurations
    sync_all_configs(live_url)
    return live_url


if __name__ == "__main__":
    url = main()
    if not url:
        sys.exit(1)
