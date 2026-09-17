import sys
import urllib.request
import json
import time

sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://lock-innovative-regional-viii.trycloudflare.com'
query = 'apko international patent law kebarein me ky lagta hai'
payload = json.dumps({'query': query, 'top_k': 5, 'language': 'hi'}).encode('utf-8')
req = urllib.request.Request(
    f'{base_url}/api/chat/stream',
    data=payload,
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', 'Bypass-Tunnel-Reminder': '1', 'bypass-tunnel-reminder': 'true'}
)

print('--- STREAMING RESPONSE ---')
t0 = time.time()
with urllib.request.urlopen(req, timeout=120) as resp:
    for line in resp:
        decoded = line.decode('utf-8', errors='ignore').strip()
        if decoded.startswith('data: '):
            data_str = decoded[6:]
            try:
                evt = json.loads(data_str)
                if evt.get('type') == 'token':
                    sys.stdout.write(evt.get('token', ''))
                    sys.stdout.flush()
                elif evt.get('type') == 'sources':
                    srcs = evt.get('sources', [])
                    st = evt.get('search_time_ms', 0)
                    print(f'Retrieved {len(srcs)} sources in {st}ms\n')
                elif evt.get('type') == 'done':
                    print(f'\n\n[STREAM COMPLETED in {time.time()-t0:.2f}s]')
            except Exception:
                pass
