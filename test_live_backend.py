import urllib.request
import json
import time

base_url = 'https://anti-dvds-knee-filename.trycloudflare.com'

# 1. Health check
print('--- 1. Testing /api/health ---')
try:
    req = urllib.request.Request(f'{base_url}/api/health', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print('Health Response:', json.dumps(data, indent=2))
except Exception as e:
    print('Health Error:', e)

# 2. Test chat query
print('\n--- 2. Testing /api/chat (Detailed Quality & Citations) ---')
query = 'Explain Section 3(p) of the Patents Act, 1970 and its relationship with AYUSH traditional knowledge and TKDL.'
payload = json.dumps({'query': query, 'top_k': 7}).encode('utf-8')
req = urllib.request.Request(
    f'{base_url}/api/chat',
    data=payload,
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)

t0 = time.time()
try:
    with urllib.request.urlopen(req, timeout=90) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        elapsed = time.time() - t0
        print(f'Chat Status: SUCCESS (Roundtrip: {elapsed:.2f}s)')
        meta = res.get('metadata', {})
        print(f'Model used: {meta.get("model")}')
        print(f'Sources returned: {len(res.get("sources", []))}')
        print(f'Citations extracted: {res.get("citations", [])}')
        ans = res.get('answer', '')
        print(f'Answer Length: {len(ans)} chars')
        print('\n--- Full Answer ---')
        print(ans)
except Exception as e:
    print('Chat Error:', e)
