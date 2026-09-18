import re
from pathlib import Path

LIVE_URL = 'https://least-tall-continent-display.trycloudflare.com'
root = Path(__file__).parent

# 1. New folder/.env
env_path = root / 'New folder' / '.env'
if env_path.exists():
    env_text = f"""EXPO_PUBLIC_API_URL={LIVE_URL}/api
EXPO_PUBLIC_SSE_URL={LIVE_URL}/api/chat/stream
EXPO_PUBLIC_WS_URL={LIVE_URL.replace('https://', 'wss://')}/ws/voice
EXPO_PUBLIC_MOCK_MODE=false
EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1
"""
    env_path.write_text(env_text, encoding='utf-8')
    print('Updated New folder/.env')

# 2. test_live_server.py
tls = root / 'test_live_server.py'
if tls.exists():
    tls.write_text(re.sub(r"base_url\s*=\s*'https://[^']+'", f"base_url = '{LIVE_URL}'", tls.read_text(encoding='utf-8')), encoding='utf-8')
    print('Updated test_live_server.py')

# 3. test_live_backend.py
tlb = root / 'test_live_backend.py'
if tlb.exists():
    tlb.write_text(re.sub(r"base_url\s*=\s*'https://[^']+'", f"base_url = '{LIVE_URL}'", tlb.read_text(encoding='utf-8')), encoding='utf-8')
    print('Updated test_live_backend.py')

# 4. test_stream.py
ts = root / 'test_stream.py'
if ts.exists():
    ts.write_text(re.sub(r"base_url\s*=\s*'https://[^']+'", f"base_url = '{LIVE_URL}'", ts.read_text(encoding='utf-8')), encoding='utf-8')
    print('Updated test_stream.py')

# 5. tester/app.js
taj = root / 'tester' / 'app.js'
if taj.exists():
    taj.write_text(re.sub(r"baseUrl:\s*'https://[^']+'", f"baseUrl: '{LIVE_URL}'", taj.read_text(encoding='utf-8')), encoding='utf-8')
    print('Updated tester/app.js')

# 6. tester/index.html
ti = root / 'tester' / 'index.html'
if ti.exists():
    t = ti.read_text(encoding='utf-8')
    t = re.sub(r'value="https://[^"]+"', f'value="{LIVE_URL}"', t)
    t = re.sub(r'placeholder="https://[^"]+"', f'placeholder="{LIVE_URL}"', t)
    ti.write_text(t, encoding='utf-8')
    print('Updated tester/index.html')

# 7. show_app_guide.py
sag = root / 'New folder' / 'show_app_guide.py'
if sag.exists():
    sag.write_text(re.sub(r'https://[a-zA-Z0-9-]+\.(?:loca\.lt|trycloudflare\.com)', LIVE_URL, sag.read_text(encoding='utf-8')), encoding='utf-8')
    print('Updated show_app_guide.py')

print('ALL CONFIGS SYNCHRONIZED SUCCESSFULLY!')
