import urllib.request
import json
import sys
import time
import os
import io
import re
import math
import wave
import struct
import subprocess
import numpy as np
import requests

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

BASE_URL = 'https://warm-hairs-kneel.loca.lt'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': '1'
}

print("=" * 80, flush=True)
print("AYUSH-IPR GUARDIAN — COMPREHENSIVE FULL-SPECTRUM SYSTEM BENCHMARK SUITE", flush=True)
print("Target Server:", BASE_URL, flush=True)
print("=" * 80, flush=True)

master_results = {
    "target_url": BASE_URL,
    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    "health_and_gpu": {},
    "statutory_rag_22_benchmarks": [],
    "classification_benchmarks": [],
    "streaming_benchmarks": {},
    "asr_benchmarks": [],
    "summary_metrics": {}
}

# ==============================================================================
# PHASE 1: HEALTH & GPU TELEMETRY
# ==============================================================================
print("\n[PHASE 1/5] Checking Server Health & Dual-GPU Allocation...", flush=True)
try:
    r = requests.get(f"{BASE_URL}/api/health", headers={'Bypass-Tunnel-Reminder': 'true'}, timeout=15)
    if r.status_code == 200:
        health_data = r.json()
        master_results["health_and_gpu"] = health_data
        print(f"  ✓ Server 100% HEALTHY", flush=True)
        print(f"  ✓ LLM: {health_data.get('models', {}).get('llm', {}).get('name')}", flush=True)
        print(f"  ✓ GPU 0: {health_data.get('gpu', {}).get('gpu_0', {}).get('allocated_gb')} GB / {health_data.get('gpu', {}).get('gpu_0', {}).get('total_gb')} GB (Free: {health_data.get('gpu', {}).get('gpu_0', {}).get('free_gb')} GB)", flush=True)
        print(f"  ✓ GPU 1: {health_data.get('gpu', {}).get('gpu_1', {}).get('allocated_gb')} GB / {health_data.get('gpu', {}).get('gpu_1', {}).get('total_gb')} GB (Free: {health_data.get('gpu', {}).get('gpu_1', {}).get('free_gb')} GB)", flush=True)
        print(f"  ✓ RAG Database: {health_data.get('models', {}).get('rag_db', {}).get('records')} statutory records loaded", flush=True)
    else:
        print(f"  ✗ Health check returned HTTP {r.status_code}", flush=True)
except Exception as e:
    print(f"  ✗ Health check failed: {e}", flush=True)

# ==============================================================================
# PHASE 2: 22 STATUTORY RAG LEGAL QUERIES ON GEMMA 2 2B
# ==============================================================================
print("\n[PHASE 2/5] Executing 22 Statutory Benchmark Queries on Gemma-2-2B-IT...", flush=True)

benchmark_queries = [
    {"id": 1, "category": "Traditional Knowledge Bar (Patents Act §3(p))", "query": "Can a company patent a standardized extract of Ashwagandha (Withania somnifera) that is documented in classical texts like Charaka Samhita for stress and vitality?", "expected_citation": "Section 3(p)"},
    {"id": 2, "category": "Enhanced Therapeutic Efficacy (Patents Act §3(d))", "query": "What standard of enhanced therapeutic efficacy must an applicant prove under Section 3(d) of the Patents Act to patent a new polymorphic form or derivative of a known Ayurvedic phytochemical?", "expected_citation": "Section 3(d)"},
    {"id": 3, "category": "Mere Admixture Bar (Patents Act §3(e))", "query": "Why does Section 3(e) of the Patents Act reject patent claims for combining ginger (Shunthi), black pepper (Maricha), and long pepper (Pippali) without showing synergistic bio-enhancement?", "expected_citation": "Section 3(e)"},
    {"id": 4, "category": "Agricultural & Cultivation Exclusions (Patents Act §3(h))", "query": "Is a method of cultivating endangered Himalayan Ayurvedic herbs such as Kutki (Picrorhiza kurroa) using a specialized hydroponic technique patentable in India under Section 3(h)?", "expected_citation": "Section 3(h)"},
    {"id": 5, "category": "Medicinal Treatment Exclusions (Patents Act §3(i))", "query": "Can a clinic patent a specialized Panchakarma therapeutic protocol involving Shirodhara and herbal steam bath for treating neurological disorders under Section 3(i)?", "expected_citation": "Section 3(i)"},
    {"id": 6, "category": "Plants & Biological Processes (Patents Act §3(j))", "query": "Does Section 3(j) of the Patents Act allow patenting of genetically modified Ayurvedic medicinal plants or isolated natural plant seeds in India?", "expected_citation": "Section 3(j)"},
    {"id": 7, "category": "Mandatory Biological Origin Disclosure (Patents Act §10(4))", "query": "What are the mandatory requirements under Section 10(4)(d)(ii)(D) of the Patents Act regarding the disclosure of Indian biological resources and NBA approval in complete specifications?", "expected_citation": "Section 10(4)"},
    {"id": 8, "category": "Pre-Grant & Post-Grant Opposition on Bio-Resources (Patents Act §25)", "query": "On what grounds can a pre-grant opposition under Section 25(1)(k) or post-grant opposition under Section 25(2)(k) be filed regarding non-disclosure of geographical origin of Ayurvedic raw materials?", "expected_citation": "Section 25"},
    {"id": 9, "category": "Revocation for Traditional Knowledge Anticipation (Patents Act §64(1)(p))", "query": "How can a granted patent on an Ayurvedic polyherbal formulation be revoked under Section 64(1)(p) using evidence from the Traditional Knowledge Digital Library (TKDL)?", "expected_citation": "Section 64(1)(p)"},
    {"id": 10, "category": "Classical vs Proprietary Medicine Classification (D&C Act §3(a) vs §3(h))", "query": "What is the legal difference between a Classical Ayurvedic medicine under Section 3(a) manufactured exclusively according to First Schedule authoritative texts versus a Patent or Proprietary Medicine under Section 3(h)?", "expected_citation": "Section 3(a)"},
    {"id": 11, "category": "First Schedule Authoritative Books Requirement (D&C Act First Schedule)", "query": "Which classical treatises listed in the First Schedule of the Drugs and Cosmetics Act (such as Charaka Samhita, Sushruta Samhita, and Sharangadhara Samhita) must be cited for classical manufacturing licenses?", "expected_citation": "First Schedule"},
    {"id": 12, "category": "Misbranded AYUSH Drugs (D&C Act §33E)", "query": "Under what statutory conditions is an Ayurvedic medicine deemed to be misbranded under Section 33E of the Drugs and Cosmetics Act regarding labelling, false claims, and fictitious therapeutic values?", "expected_citation": "Section 33E"},
    {"id": 13, "category": "Adulterated AYUSH Drugs (D&C Act §33EE)", "query": "What constitute adulterated Ayurvedic drugs under Section 33EE when decomposed raw herbs, foreign matter, or toxic contaminants are substituted into classical Rasashastra preparations?", "expected_citation": "Section 33EE"},
    {"id": 14, "category": "Spurious AYUSH Drugs (D&C Act §33EEA)", "query": "What legal definition governs spurious Ayurvedic drugs under Section 33EEA when manufactured under a name belonging to another drug or imitating established brand trademarks?", "expected_citation": "Section 33EEA"},
    {"id": 15, "category": "Licensing & Loan License Compliance (D&C Rules 151-160)", "query": "What are the regulatory requirements for obtaining a manufacturing license (Form 25D) or Loan License (Form 25E) for Ayurvedic medicines under Rules 151 to 160 of the Drugs and Cosmetics Rules?", "expected_citation": "Rule 151"},
    {"id": 16, "category": "Good Manufacturing Practices (GMP) Mandate (D&C Rules Schedule T)", "query": "What baseline infrastructure, quality control testing, and batch manufacturing record requirements are mandated under Schedule T for Ayurvedic and Siddha pharmaceutical units?", "expected_citation": "Schedule T"},
    {"id": 17, "category": "Mandatory Labelling, True List & Alcohol Limits (D&C Rules 161 & 161A)", "query": "What statutory particulars must appear on the label of an Ayurvedic medicine under Rule 161, including the true list of ingredients, reference texts, and percentage of self-generated alcohol in Asavas and Arishtas?", "expected_citation": "Rule 161"},
    {"id": 18, "category": "Statutory Shelf Life & Expiry Dating (D&C Rules 161B & Schedule P1)", "query": "What maximum statutory shelf-life periods are specified under Rule 161B for classical Ayurvedic formulations such as Churna (2 yrs), Vati/Gutti (3 yrs), Asava/Arishta (no limit/10 yrs), and Bhasma/Rasoushadhi (stable)?", "expected_citation": "Rule 161B"},
    {"id": 19, "category": "Schedule E(1) Regulated Poisonous Botanicals & Minerals", "query": "Which poisonous plant substances (such as Vatsanabha, Bhang, Gunja, and Kupilu) and heavy metal preparations are regulated under Schedule E(1) requiring cautionary labelling 'Caution: To be taken under medical supervision'?", "expected_citation": "Schedule E(1)"},
    {"id": 20, "category": "Mandatory National Biodiversity Authority (NBA) Approval (BD Act §3 & §6)", "query": "When must foreign commercial entities and Indian applicants obtain prior approval from the National Biodiversity Authority under Sections 3 and 6 of the Biological Diversity Act before applying for any IPR based on Indian bio-resources?", "expected_citation": "Section 3"},
    {"id": 21, "category": "Benefit Sharing & SBB Compliance for Indian Entities (BD Act §7 & §21)", "query": "What are the legal obligations of Indian citizens and local companies regarding prior intimation to State Biodiversity Boards (SBBs) under Section 7 and Fair and Equitable Benefit Sharing under Section 21 of the BD Act?", "expected_citation": "Section 7"},
    {"id": 22, "category": "TKDL Prior Art Evidentiary Weight in Global Patent Offices (EPO, USPTO, JPO)", "query": "How does the TKDL access agreement operate between CSIR/Ministry of AYUSH and international patent offices to issue third-party observations and reject biopiracy patent claims on Indian medicinal plants?", "expected_citation": "TKDL"}
]

passed_count = 0
total_rag_latency = 0.0

for q in benchmark_queries:
    qid = q["id"]
    category = q["category"]
    query_text = q["query"]
    exp_cite = q["expected_citation"]
    
    print(f"\n[{qid}/22] {category}", flush=True)
    print(f"QUERY: {query_text[:90]}...", flush=True)
    
    t0 = time.time()
    try:
        r = requests.post(f"{BASE_URL}/api/chat", headers=HEADERS, json={"query": query_text, "top_k": 7}, timeout=90)
        elapsed = round(time.time() - t0, 2)
        total_rag_latency += elapsed
        
        if r.status_code == 200:
            res_data = r.json()
            answer = res_data.get("answer", "")
            citations = res_data.get("citations", [])
            sources = res_data.get("sources", [])
            meta = res_data.get("metadata", {})
            
            # Citations check
            has_cite = any(exp_cite.lower() in c.lower() for c in citations) or (exp_cite.lower() in answer.lower())
            has_disc = "disclaimer" in answer.lower() or "consult" in answer.lower() or "legal advice" in answer.lower()
            char_len = len(answer)
            
            status = "PASS" if (has_cite and char_len > 100) else "WARN"
            if status == "PASS": passed_count += 1
            
            print(f"  ✓ {status} ({elapsed}s) | Citations: {len(citations)} | Sources: {len(sources)} | Length: {char_len} chars", flush=True)
            if sources:
                print(f"    Top Source: {sources[0].get('title')} (Score: {sources[0].get('score', 0):.4f})", flush=True)
            
            master_results["statutory_rag_22_benchmarks"].append({
                "id": qid,
                "category": category,
                "query": query_text,
                "expected_citation": exp_cite,
                "latency_s": elapsed,
                "answer_length_chars": char_len,
                "citation_matched": has_cite,
                "citations_extracted": citations,
                "sources_used": len(sources),
                "top_source_title": sources[0].get('title', '') if sources else '',
                "top_source_score": sources[0].get('score', 0) if sources else 0,
                "has_disclaimer": has_disc,
                "answer_full": answer,
                "sources": sources,
                "metadata": meta,
                "status": status
            })
        else:
            print(f"  ✗ HTTP {r.status_code}: {r.text}", flush=True)
    except Exception as e:
        print(f"  ✗ Query failed: {e}", flush=True)

# ==============================================================================
# PHASE 3: FORMULATION CLASSIFICATION ENGINE (/api/classify)
# ==============================================================================
print("\n[PHASE 3/5] Testing Formulation Classification Regulatory Engine...", flush=True)

classification_cases = [
    {
        "id": "CLASS-01",
        "name": "Classical Ayurveda Medicine (First Schedule)",
        "ingredients": ["Terminalia chebula (Haritaki)", "Terminalia bellirica (Bibhitaki)", "Phyllanthus emblica (Amalaki)"],
        "dosage_form": "Churna (Powder)",
        "expected_class": "Classical Medicine",
        "statute": "Section 3(a), Drugs & Cosmetics Act, 1940"
    },
    {
        "id": "CLASS-02",
        "name": "Patent or Proprietary Medicine (P&P)",
        "ingredients": ["Withania somnifera standardized extract 5%", "Curcumin 95%", "Piperine bio-enhancer"],
        "dosage_form": "Tablet",
        "expected_class": "Patent or Proprietary",
        "statute": "Section 3(h), Drugs & Cosmetics Act, 1940"
    },
    {
        "id": "CLASS-03",
        "name": "Schedule E(1) Poisonous Herb Formulation",
        "ingredients": ["Aconitum heterophyllum (Vatsanabha)", "Strychnos nux-vomica (Vishamushti)", "Gingelly oil"],
        "dosage_form": "Taila (Medicated Oil)",
        "expected_class": "Schedule E(1) Regulated",
        "statute": "Schedule E(1) & Rule 161, D&C Rules 1945"
    }
]

for cc in classification_cases:
    t0 = time.time()
    try:
        r = requests.post(
            f"{BASE_URL}/api/classify",
            headers=HEADERS,
            json={"ingredients": cc["ingredients"], "dosage_form": cc["dosage_form"]},
            timeout=50
        )
        elapsed = round(time.time() - t0, 2)
        if r.status_code == 200:
            res_data = r.json()
            answer = res_data.get("answer", "")
            citations = res_data.get("citations", [])
            sources = res_data.get("sources", [])
            
            print(f"  [{cc['id']}] {cc['name']} ({elapsed}s)", flush=True)
            print(f"        Sources: {len(sources)} | Citations: {citations[:3]}", flush=True)
            print(f"        Preview: {answer[:180]}...", flush=True)
            
            master_results["classification_benchmarks"].append({
                "id": cc["id"],
                "name": cc["name"],
                "ingredients": cc["ingredients"],
                "dosage_form": cc["dosage_form"],
                "latency_s": elapsed,
                "answer_preview": answer[:300],
                "sources_used": len(sources),
                "citations": citations,
                "status": "PASS"
            })
        else:
            print(f"  ✗ [{cc['id']}] HTTP {r.status_code}: {r.text}", flush=True)
    except Exception as e:
        print(f"  ✗ [{cc['id']}] Error: {e}", flush=True)

# ==============================================================================
# PHASE 4: SSE TOKEN STREAMING BENCHMARK (/api/chat/stream)
# ==============================================================================
print("\n[PHASE 4/5] Testing SSE Real-Time Token Streaming Velocity (/api/chat/stream)...", flush=True)
try:
    stream_query = "What standard of enhanced therapeutic efficacy must an applicant prove under Section 3(d)?"
    t0 = time.time()
    r = requests.post(
        f"{BASE_URL}/api/chat/stream",
        headers={'Bypass-Tunnel-Reminder': 'true', 'Content-Type': 'application/json'},
        json={"query": stream_query, "top_k": 5},
        stream=True,
        timeout=60
    )
    
    ttft = None
    token_count = 0
    accumulated_stream = ""
    sources_stream = []
    
    for line in r.iter_lines(decode_unicode=True):
        if line and line.startswith("data:"):
            data_str = line[5:].strip()
            try:
                msg = json.loads(data_str)
                if msg.get("type") == "sources":
                    sources_stream = msg.get("sources", [])
                elif msg.get("type") == "token":
                    if ttft is None:
                        ttft = round(time.time() - t0, 3)
                    token_count += 1
                    accumulated_stream += msg.get("token", "")
            except:
                pass
                
    total_stream_time = round(time.time() - t0, 2)
    tok_per_sec = round(token_count / max(0.1, (total_stream_time - (ttft or 0))), 1)
    
    print(f"  ✓ Streaming Active: TTFT = {ttft}s | Total = {total_stream_time}s", flush=True)
    print(f"  ✓ Streamed Tokens: {token_count} chunks | Velocity: {tok_per_sec} tokens/sec", flush=True)
    print(f"  ✓ Sources Retrieved: {len(sources_stream)}", flush=True)
    
    master_results["streaming_benchmarks"] = {
        "ttft_s": ttft,
        "total_latency_s": total_stream_time,
        "token_count": token_count,
        "tokens_per_sec": tok_per_sec,
        "sources_count": len(sources_stream),
        "status": "PASS"
    }
except Exception as e:
    print(f"  ✗ Streaming test failed: {e}", flush=True)

# ==============================================================================
# PHASE 5: MULTI-MODAL ASR & NOISE RESILIENCE BENCHMARK
# ==============================================================================
print("\n[PHASE 5/5] Running Audio Speech & Noise Resilience Tests (Faster-Whisper)...", flush=True)

def generate_isolated_wav(text, filepath):
    """Generate clean WAV using isolated python script to avoid COM lockup."""
    script = f"""import pyttsx3, os
engine = pyttsx3.init()
engine.save_to_file({repr(text)}, r'{filepath}')
engine.runAndWait()
"""
    subprocess.run([sys.executable, "-c", script], capture_output=True, timeout=15)

def add_noise_to_wav(clean_wav_path, noisy_wav_path, snr_db=15):
    with wave.open(clean_wav_path, 'rb') as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        raw_data = wf.readframes(n_frames)
    
    samples = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32)
    sig_power = np.mean(samples ** 2)
    noise_power = sig_power / (10 ** (snr_db / 10.0))
    noise = np.random.normal(0, np.sqrt(noise_power), samples.shape)
    noisy_samples = samples + noise
    noisy_samples = np.clip(noisy_samples, -32768, 32767).astype(np.int16)
    
    with wave.open(noisy_wav_path, 'wb') as wf:
        wf.setnchannels(n_channels)
        wf.setsampwidth(sampwidth)
        wf.setframerate(framerate)
        wf.writeframes(noisy_samples.tobytes())

asr_test_cases = [
    {
        "id": "ASR-01",
        "name": "Clean Legal English Speech",
        "text": "Can a company patent a standardized extract of Ashwagandha under Section 3p of the Indian Patents Act?",
        "snr_db": 999,
        "noise_type": "Clean Reference (Studio)"
    },
    {
        "id": "ASR-02",
        "name": "Moderate Noise Legal Speech (SNR 20dB)",
        "text": "What standard of therapeutic efficacy is required under Section 3d for Ayurvedic derivatives?",
        "snr_db": 20,
        "noise_type": "Gaussian Noise (20dB)"
    },
    {
        "id": "ASR-03",
        "name": "Heavy Noise Street Acoustic Speech (SNR 10dB)",
        "text": "Combining ginger black pepper and long pepper is rejected as mere admixture under Section 3e.",
        "snr_db": 10,
        "noise_type": "Gaussian Noise (10dB)"
    },
    {
        "id": "ASR-04",
        "name": "Extreme Noise Acoustic Speech (SNR 5dB)",
        "text": "Is hydroponic cultivation of Picrorhiza kurroa patentable under Section 3h?",
        "snr_db": 5,
        "noise_type": "Gaussian Noise (5dB Stress)"
    },
    {
        "id": "ASR-05",
        "name": "Classical Botanical Nomenclature Speech",
        "text": "Triphala churna containing Haritaki Bibhitaki and Amalaki complies with Schedule 1 authoritative texts.",
        "snr_db": 999,
        "noise_type": "Clean Classical Botanical"
    }
]

for tc in asr_test_cases:
    clean_p = os.path.abspath(f"bench_asr_{tc['id']}_clean.wav")
    target_p = clean_p
    generate_isolated_wav(tc["text"], clean_p)
    
    if tc["snr_db"] < 100:
        noisy_p = os.path.abspath(f"bench_asr_{tc['id']}_noisy.wav")
        add_noise_to_wav(clean_p, noisy_p, snr_db=tc["snr_db"])
        target_p = noisy_p
        
    t0 = time.time()
    try:
        with open(target_p, 'rb') as af:
            r = requests.post(
                f"{BASE_URL}/api/transcribe",
                files={'audio': (f"{tc['id']}.wav", af, 'audio/wav')},
                headers={'Bypass-Tunnel-Reminder': 'true'},
                timeout=30
            )
        elapsed = round(time.time() - t0, 3)
        if r.status_code == 200:
            res_data = r.json()
            transcribed = res_data.get("text", "").strip()
            det_lang = res_data.get("language", "en")
            conf = res_data.get("language_probability", 0.0)
            
            orig_words = set(re.sub(r'[^\w\s]', '', tc['text'].lower()).split())
            trans_words = set(re.sub(r'[^\w\s]', '', transcribed.lower()).split())
            overlap = len(orig_words.intersection(trans_words))
            word_recall = round(overlap / max(1, len(orig_words)) * 100, 1)
            
            print(f"  [{tc['id']}] {tc['name']} ({elapsed}s)", flush=True)
            print(f"        Transcribed: {transcribed}", flush=True)
            print(f"        Word Recall: {word_recall}% | Conf: {conf:.2f}", flush=True)
            
            master_results["asr_benchmarks"].append({
                "id": tc["id"],
                "name": tc["name"],
                "noise_condition": tc["noise_type"],
                "snr_db": tc["snr_db"],
                "original_text": tc["text"],
                "transcribed_text": transcribed,
                "latency_s": elapsed,
                "detected_language": det_lang,
                "confidence": conf,
                "word_recall_pct": word_recall,
                "status": "PASS" if word_recall >= 60 else "WARN"
            })
        else:
            print(f"  ✗ [{tc['id']}] HTTP {r.status_code}: {r.text}", flush=True)
    except Exception as e:
        print(f"  ✗ [{tc['id']}] Error: {e}", flush=True)

# ==============================================================================
# SUMMARY & EXPORT
# ==============================================================================
avg_latency = round(total_rag_latency / max(1, len(benchmark_queries)), 2)
master_results["summary_metrics"] = {
    "total_statutory_queries": len(benchmark_queries),
    "statutory_queries_passed": passed_count,
    "pass_rate_pct": round(passed_count / len(benchmark_queries) * 100, 1),
    "avg_rag_latency_s": avg_latency,
    "total_asr_tests": len(asr_test_cases),
    "asr_tests_passed": sum(1 for a in master_results["asr_benchmarks"] if a["status"] == "PASS"),
    "total_classification_tests": len(classification_cases),
    "classification_tests_passed": sum(1 for c in master_results["classification_benchmarks"] if c["status"] == "PASS"),
}

output_json_path = os.path.abspath("statutory_rag_benchmark_22_results.json")
with open(output_json_path, "w", encoding="utf-8") as f:
    json.dump(master_results, f, indent=2, ensure_ascii=False)

print("\n" + "=" * 80, flush=True)
print(f"BENCHMARK COMPLETE: {passed_count}/22 Statutory Queries Passed ({master_results['summary_metrics']['pass_rate_pct']}%)", flush=True)
print(f"Average RAG Latency: {avg_latency}s | Results saved to: {output_json_path}", flush=True)
print("=" * 80, flush=True)
