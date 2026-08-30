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

test_queries = [
    {
        "category": "Biological Origin & Biodiversity Opposition",
        "query": "What happens if a patent applicant conceals or wrongly discloses the geographical origin of an Indian medicinal plant in their specification? Under which section can an opposition or revocation be filed?",
        "focus": "Section 10(4), Section 25(1)(j)/(2)(j), Section 64(1)(p)"
    },
    {
        "category": "Poisonous Herbs & Labeling Compliance",
        "query": "If an Ayurvedic medicine contains Vatsanabha (Aconitum ferox) or Gunja (Abrus precatorius), what statutory label warnings and Schedule E(1) requirements must the manufacturer follow under Drugs and Cosmetics Rules?",
        "focus": "Schedule E(1), Rule 161, Cautionary Warnings"
    },
    {
        "category": "2024 Patent Rules Amendments",
        "query": "Under the amended Patents Rules 2024, what is the exact timeline for filing a Request for Examination (RFE) under Rule 24B, and what new provision governs the Certificate of Inventorship under Rule 70A?",
        "focus": "Rule 24B (31 months), Rule 70A (Form 8A)"
    },
    {
        "category": "Adulterated vs Misbranded ASU Drugs",
        "query": "Distinguish between an Adulterated Ayurvedic drug under Section 33EE and a Spurious Ayurvedic drug under Section 33EEA. What are the legal consequences?",
        "focus": "Section 33EE, Section 33EEA, Chapter IV-A penalties"
    },
    {
        "category": "Alcohol Limit in Asava & Arishta",
        "query": "What is the maximum limit of self-generated alcohol permitted in Ayurvedic Asava and Arishta preparations under Rule 161, and how must it be declared on the label?",
        "focus": "Rule 161, Self-generated alcohol declaration"
    },
    {
        "category": "Patentability of Synergistic Herbal Extracts",
        "query": "Can a pharmaceutical company patent a combination of Curcumin and Piperine if they demonstrate a 300% synergistic increase in bioavailability, or does Section 3(e) and 3(d) bar it as a mere admixture?",
        "focus": "Section 3(d) efficacy enhancement vs Section 3(e) mere admixture"
    },
    {
        "category": "ASU Technical Advisory Board (ASUDTAB)",
        "query": "What is the composition and statutory mandate of the Ayurvedic, Siddha and Unani Drugs Technical Advisory Board under Section 33C of the Drugs and Cosmetics Act?",
        "focus": "Section 33C, ASUDTAB constitution & advisory role"
    },
    {
        "category": "Shelf Life of Medicated Taila & Ghrita",
        "query": "According to Rule 161B and its statutory schedule, what is the prescribed shelf life and expiry period for Medicated Oils (Taila) and Medicated Clarified Butter (Ghrita)?",
        "focus": "Rule 161B shelf-life table for Taila and Ghrita"
    }
]

classification_tests = [
    {
        "category": "Classical vs Proprietary Multi-Herb Formulation",
        "ingredients": ["Aconitum ferox (Vatsanabha)", "Piper nigrum (Maricha)", "Zingiber officinale (Shunthi)", "Sulphur (Shuddha Gandhak)"],
        "dosage_form": "Vati / Gutika (Tablet)",
        "note": "Schedule E(1) toxic herb combination"
    },
    {
        "category": "Novel Delivery System of Classical Plant",
        "ingredients": ["Withania somnifera standardized withanolide nanoparticles", "Phospholipid carrier matrix", "Bio-piperine"],
        "dosage_form": "Capsule / Novel Delivery",
        "note": "Section 3(d) novel efficacy vs Section 3(p) TK challenge"
    }
]

def run_chat_query(t):
    q = t["query"]
    print(f"\n{'='*75}")
    print(f"[{t['category'].upper()}]")
    print(f"QUERY: {q}")
    print(f"{'='*75}")
    payload = json.dumps({'query': q, 'top_k': 5}).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/api/chat', data=payload, headers=headers, method='POST')
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            elapsed = time.time() - t0
            print(f"⏱️ Turnaround Latency: {elapsed:.2f}s")
            print(f"\n--- GENERATED ANSWER ---")
            print(data.get("answer", ""))
            print(f"\n--- RETRIEVED SOURCES ({len(data.get('sources', []))}) ---")
            for i, s in enumerate(data.get("sources", [])):
                title = s.get("title", s.get("doc_id", ""))
                score = s.get("score", 0)
                print(f"  [{i+1}] {title} | Rerank Score: {score:.4f}")
            return {
                "category": t["category"],
                "query": q,
                "latency_s": round(elapsed, 2),
                "answer": data.get("answer", ""),
                "sources": data.get("sources", []),
                "metadata": data.get("metadata", {})
            }
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"category": t["category"], "query": q, "error": str(e)}

def run_classify_query(c):
    print(f"\n{'='*75}")
    print(f"[CLASSIFICATION TEST: {c['category'].upper()}]")
    print(f"Ingredients: {c['ingredients']} | Form: {c['dosage_form']}")
    print(f"{'='*75}")
    payload = json.dumps({'ingredients': c['ingredients'], 'dosage_form': c['dosage_form']}).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/api/classify', data=payload, headers=headers, method='POST')
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            elapsed = time.time() - t0
            print(f"⏱️ Turnaround Latency: {elapsed:.2f}s")
            print(f"\n--- CLASSIFICATION GUIDANCE ---")
            print(data.get("answer", ""))
            return {
                "category": c["category"],
                "ingredients": c["ingredients"],
                "dosage_form": c["dosage_form"],
                "latency_s": round(elapsed, 2),
                "answer": data.get("answer", ""),
                "sources": data.get("sources", [])
            }
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"category": c["category"], "error": str(e)}

if __name__ == '__main__':
    all_results = []
    print("🚀 Firing 8 Diverse Statutory RAG Queries to Live Server...")
    for t in test_queries:
        res = run_chat_query(t)
        all_results.append(res)
        time.sleep(1) # Brief pause between requests

    print("\n🚀 Firing 2 Formulation Classifier Queries...")
    for c in classification_tests:
        res = run_classify_query(c)
        all_results.append(res)
        time.sleep(1)

    # Save all output to a json log file
    with open('deviated_prompts_results.json', 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    print("\n✅ All queries completed! Results saved to deviated_prompts_results.json")
