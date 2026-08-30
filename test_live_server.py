import urllib.request
import json
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://twelve-pigs-fix.loca.lt'
headers = {
    'Bypass-Tunnel-Reminder': 'true',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

def send_chat(query):
    print('\n' + '=' * 60)
    print(f'QUERY: {query}')
    print('=' * 60)
    payload = json.dumps({'query': query, 'top_k': 5}).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/api/chat', data=payload, headers=headers, method='POST')
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            elapsed = time.time() - t0
            print(f'Response Time: {elapsed:.2f}s')
            print('\n--- GENERATED ANSWER ---')
            print(res_data.get('answer', ''))
            print(f'\n--- CITATIONS & SOURCES ({len(res_data.get("sources", []))}) ---')
            for i, s in enumerate(res_data.get('sources', [])):
                title = s.get('title', s.get('doc_id', ''))
                score = s.get('rerank_score', s.get('score', 0))
                print(f"[{i+1}] {title} (Score: {score:.4f})")
                print(f"    Excerpt: {s.get('text', '')[:140]}...\n")
            if 'meta' in res_data:
                print('--- PERFORMANCE METRICS ---')
                print(json.dumps(res_data['meta'], indent=2))
            return res_data
    except Exception as e:
        print('Error calling endpoint:', e)
        return None

def send_classify(ingredients, dosage_form):
    print('\n' + '=' * 60)
    print(f'CLASSIFICATION: Ingredients={ingredients}, Form={dosage_form}')
    print('=' * 60)
    payload = json.dumps({'ingredients': ingredients, 'dosage_form': dosage_form}).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/api/classify', data=payload, headers=headers, method='POST')
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            elapsed = time.time() - t0
            print(f'Response Time: {elapsed:.2f}s')
            print('\n--- CLASSIFICATION & REGULATORY GUIDANCE ---')
            print(res_data.get('answer', ''))
            return res_data
    except Exception as e:
        print('Error calling classify endpoint:', e)
        return None

if __name__ == '__main__':
    send_chat('Can I patent a traditional Ashwagandha formulation that is documented in Charaka Samhita under Indian patent law?')
    send_chat('What are the statutory requirements under Schedule T of Drugs and Cosmetics Rules for Good Manufacturing Practices in Ayurveda?')
    send_classify(['Ashwagandha', 'Brahmi', 'Shankhpushpi'], 'Syrup')
