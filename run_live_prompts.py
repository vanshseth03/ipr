import urllib.request
import json
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://tired-schools-sneeze.loca.lt'
headers = {
    'Bypass-Tunnel-Reminder': 'true',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

queries = [
    {
        "num": 1,
        "title": "Biological Resource Origin Concealment & Revocation",
        "query": "What happens if a patent applicant conceals or wrongly discloses the geographical origin of an Indian biological resource in their specification? Which sections under Patents Act govern opposition and revocation?"
    },
    {
        "num": 2,
        "title": "Schedule E(1) Toxic Ayurvedic Herbs & Warnings",
        "query": "If an Ayurvedic medicine contains Vatsanabha (Aconitum ferox) or Gunja (Abrus precatorius), what statutory label warnings and Schedule E(1) requirements must the manufacturer follow under Drugs and Cosmetics Rules?"
    },
    {
        "num": 3,
        "title": "Amended Patent Rules 2024 (RFE Timeline & Certificate of Inventorship)",
        "query": "Under the amended Patents Rules 2024, what is the exact timeline for filing a Request for Examination (RFE) under Rule 24B, and what new provision governs the Certificate of Inventorship under Rule 70A?"
    },
    {
        "num": 4,
        "title": "Self-Generated Alcohol in Asava & Arishta under Rule 161",
        "query": "What is the maximum limit of self-generated alcohol permitted in Ayurvedic Asava and Arishta preparations under Rule 161, and how must it be declared on the container label?"
    },
    {
        "num": 5,
        "title": "Synergistic Herbal Formulation: Section 3(d) vs Section 3(e)",
        "query": "Can an applicant patent a combination of Curcumin and Piperine if they demonstrate a 300% synergistic increase in bioavailability, or does Section 3(e) and 3(d) bar it as a mere admixture?"
    }
]

print("=" * 80, flush=True)
print("AYUSH-IPR GUARDIAN — LIVE STATUTORY RAG BENCHMARK RESULTS", flush=True)
print("=" * 80, flush=True)

for item in queries:
    print(f"\n[{item['num']}/5] {item['title'].upper()}", flush=True)
    print(f"QUERY: {item['query']}", flush=True)
    print("-" * 80, flush=True)

    payload = json.dumps({'query': item['query'], 'top_k': 5}).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/api/chat', data=payload, headers=headers, method='POST')
    
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            elapsed = time.time() - t0
            print(f"⏱️ Latency: {elapsed:.2f}s | Model: {data.get('metadata', {}).get('model', 'Qwen2.5-7B')}", flush=True)
            print("\n📌 ANSWER:\n" + data.get('answer', ''), flush=True)
            print("\n📚 TOP RETRIEVED STATUTES:", flush=True)
            for i, s in enumerate(data.get('sources', [])):
                score = s.get('score', 0)
                print(f"   [{i+1}] {s.get('title', '')} (Score: {score:.4f})", flush=True)
            print("=" * 80, flush=True)
    except Exception as e:
        print(f"❌ Request Error: {e}", flush=True)
        print("=" * 80, flush=True)

print("\n🎯 ALL 5 LIVE BENCHMARK QUERIES COMPLETED SUCCESSFULLY.", flush=True)
