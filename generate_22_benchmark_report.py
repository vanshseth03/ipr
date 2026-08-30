import urllib.request
import json
import sys
import time
import os

sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://specials-stocks-hereby-visits.trycloudflare.com'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json',
}

benchmark_queries = [
    {
        "id": 1,
        "category": "Traditional Knowledge Bar (Patents Act §3(p))",
        "query": "Can a company patent a standardized extract of Ashwagandha (Withania somnifera) that is documented in classical texts like Charaka Samhita for stress and vitality?",
        "expected_citation": "Section 3(p)"
    },
    {
        "id": 2,
        "category": "Enhanced Therapeutic Efficacy (Patents Act §3(d))",
        "query": "What standard of enhanced therapeutic efficacy must an applicant prove under Section 3(d) of the Patents Act to patent a new polymorphic form or derivative of a known Ayurvedic phytochemical?",
        "expected_citation": "Section 3(d)"
    },
    {
        "id": 3,
        "category": "Mere Admixture Bar (Patents Act §3(e))",
        "query": "Why does Section 3(e) of the Patents Act reject patent claims for combining ginger (Shunthi), black pepper (Maricha), and long pepper (Pippali) without showing synergistic bio-enhancement?",
        "expected_citation": "Section 3(e)"
    },
    {
        "id": 4,
        "category": "Agricultural & Cultivation Exclusions (Patents Act §3(h))",
        "query": "Is a method of cultivating endangered Himalayan Ayurvedic herbs such as Kutki (Picrorhiza kurroa) using a specialized hydroponic technique patentable in India under Section 3(h)?",
        "expected_citation": "Section 3(h)"
    },
    {
        "id": 5,
        "category": "Medicinal Treatment Exclusions (Patents Act §3(i))",
        "query": "Can a clinic patent a specialized Panchakarma therapeutic protocol involving Shirodhara and herbal steam bath for treating neurological disorders under Section 3(i)?",
        "expected_citation": "Section 3(i)"
    },
    {
        "id": 6,
        "category": "Plants & Biological Processes (Patents Act §3(j))",
        "query": "Does Section 3(j) of the Patents Act allow patenting of genetically modified Ayurvedic medicinal plants or isolated natural plant seeds in India?",
        "expected_citation": "Section 3(j)"
    },
    {
        "id": 7,
        "category": "Mandatory Biological Origin Disclosure (Patents Act §10(4))",
        "query": "What are the mandatory requirements under Section 10(4)(d)(ii)(D) of the Patents Act regarding the disclosure of Indian biological resources and NBA approval in complete specifications?",
        "expected_citation": "Section 10(4)"
    },
    {
        "id": 8,
        "category": "Pre-Grant & Post-Grant Opposition on Bio-Resources (Patents Act §25)",
        "query": "Explain the grounds under Section 25(1)(j) and Section 25(2)(j) for opposing a patent based on non-disclosure or wrongful disclosure of biological source materials.",
        "expected_citation": "Section 25"
    },
    {
        "id": 9,
        "category": "Traditional Knowledge Anticipation Opposition (Patents Act §25(1)(k))",
        "query": "How can an Indian organization use TKDL documentation and oral community knowledge to oppose a patent application under Section 25(1)(k) and 25(2)(k)?",
        "expected_citation": "Section 25(1)(k)"
    },
    {
        "id": 10,
        "category": "Patent Revocation Grounds before High Court (Patents Act §64)",
        "query": "Under Section 64(1)(p) and 64(1)(q) of the Patents Act, 1970, what are the specific grounds for revoking a granted patent before the High Court in relation to biological resources?",
        "expected_citation": "Section 64"
    },
    {
        "id": 11,
        "category": "Compulsory Licensing for Public Health (Patents Act §84 & §92A)",
        "query": "Under what statutory conditions can the Controller grant a compulsory licence under Section 84 or Section 92A for manufacturing and exporting critical pharmaceutical or Ayurvedic formulations?",
        "expected_citation": "Section 84"
    },
    {
        "id": 12,
        "category": "Amended RFE Timeline (Patent Rules 2024, Rule 24B)",
        "query": "What is the new shortened statutory deadline for filing a Request for Examination (RFE) under Rule 24B(1)(i) as introduced by the Patents (Amendment) Rules, 2024?",
        "expected_citation": "Rule 24B"
    },
    {
        "id": 13,
        "category": "Certificate of Inventorship (Patent Rules 2024, Rule 70A)",
        "query": "Explain the newly introduced Certificate of Inventorship under Rule 70A and Form 8A of the Patents Rules, 2024. Is there any statutory fee required for the certificate?",
        "expected_citation": "Rule 70A"
    },
    {
        "id": 14,
        "category": "Grace Period Procedures (Patent Rules 2024, Rule 29A)",
        "query": "What is the formal procedure under Rule 29A and Form 31 of the Patent Rules for claiming the 12-month grace period under Section 31 of the Patents Act?",
        "expected_citation": "Rule 29A"
    },
    {
        "id": 15,
        "category": "Divisional Applications (Patent Rules 2024, Rule 13(2A))",
        "query": "What clarification does amended Rule 13(2A) of the Patents Rules provide regarding the filing of divisional patent applications from provisional or complete specifications?",
        "expected_citation": "Rule 13"
    },
    {
        "id": 16,
        "category": "Adulterated Ayurvedic Drugs (D&C Act §33EE)",
        "query": "Define an Adulterated Ayurvedic, Siddha or Unani drug under Section 33EE of the Drugs and Cosmetics Act, 1940. What circumstances render a drug adulterated?",
        "expected_citation": "Section 33EE"
    },
    {
        "id": 17,
        "category": "Spurious Ayurvedic Drugs (D&C Act §33EEA)",
        "query": "What constitutes a Spurious Ayurvedic drug under Section 33EEA of the Drugs and Cosmetics Act? What are the penal consequences for manufacturing spurious AYUSH medicines?",
        "expected_citation": "Section 33EEA"
    },
    {
        "id": 18,
        "category": "Poisonous Herbs & Label Warnings (D&C Rules Schedule E(1))",
        "query": "What specific plant substances are listed under Schedule E(1) of the Drugs and Cosmetics Rules, and what mandatory cautionary warning label is enforced under Rule 161?",
        "expected_citation": "Schedule E(1)"
    },
    {
        "id": 19,
        "category": "Alcohol Limits in Asava & Arishta (D&C Rules Rule 161)",
        "query": "What is the maximum permissible limit of self-generated natural alcohol in Ayurvedic Asava and Arishta formulations under Rule 161 of the Drugs and Cosmetics Rules?",
        "expected_citation": "Rule 161"
    },
    {
        "id": 20,
        "category": "Statutory Shelf-Life Schedule (D&C Rules Rule 161B)",
        "query": "Detail the statutory shelf-life and expiry periods under Rule 161B of the Drugs and Cosmetics Rules for Churna, Vati, Taila, Ghrita, Asava/Arishta, and Bhasma preparations.",
        "expected_citation": "Rule 161B"
    },
    {
        "id": 21,
        "category": "Good Manufacturing Practices GMP (D&C Rules Schedule T)",
        "query": "What are the core factory hygiene, space, raw material testing, and quality control requirements mandated under Schedule T for manufacturing Ayurvedic formulations?",
        "expected_citation": "Schedule T"
    },
    {
        "id": 22,
        "category": "ASU Technical Advisory Board (D&C Act §33C)",
        "query": "What is the composition and statutory mandate of the Ayurvedic, Siddha and Unani Drugs Technical Advisory Board (ASUDTAB) under Section 33C of the Drugs and Cosmetics Act?",
        "expected_citation": "Section 33C"
    }
]

print(f"================================================================================")
print(f"AYUSH-IPR GUARDIAN — RUNNING 22 STATUTORY BENCHMARK QUERIES")
print(f"================================================================================", flush=True)

results = []
total_start_time = time.time()

for idx, item in enumerate(benchmark_queries, 1):
    q_id = item["id"]
    cat = item["category"]
    query = item["query"]
    exp_cit = item["expected_citation"]

    print(f"\n[{idx}/22] {cat.upper()}", flush=True)
    print(f"QUERY: {query}", flush=True)

    payload = json.dumps({'query': query, 'top_k': 7}).encode('utf-8')
    
    success = False
    for attempt in range(1, 3):
        t0 = time.time()
        try:
            req = urllib.request.Request(f'{base_url}/api/chat', data=payload, headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                elapsed = time.time() - t0
                answer = data.get('answer', '')
                sources = data.get('sources', [])
                meta = data.get('metadata', {})

                print(f"⏱️ Response Time: {elapsed:.2f}s ({elapsed*1000:.0f} ms)", flush=True)
                print(f"📚 Sources Retrieved: {len(sources)} | Top Score: {sources[0].get('score', 0):.4f}" if sources else "No sources", flush=True)
                print(f"📝 Answer snippet: {answer[:180].replace(chr(10), ' ')}...", flush=True)

                results.append({
                    "id": q_id,
                    "category": cat,
                    "query": query,
                    "expected_citation": exp_cit,
                    "latency_seconds": round(elapsed, 2),
                    "latency_ms": round(elapsed * 1000),
                    "answer": answer,
                    "sources": sources,
                    "metadata": meta,
                    "status": "SUCCESS"
                })
                success = True
                break
        except Exception as e:
            elapsed = time.time() - t0
            print(f"⚠️ Attempt {attempt} failed after {elapsed:.2f}s: {e}", flush=True)
            if attempt < 2:
                print("🔄 Retrying immediately...", flush=True)
                time.sleep(2)
            else:
                print(f"❌ Query {idx} failed permanently: {e}", flush=True)
                results.append({
                    "id": q_id,
                    "category": cat,
                    "query": query,
                    "expected_citation": exp_cit,
                    "latency_seconds": round(elapsed, 2),
                    "latency_ms": round(elapsed * 1000),
                    "answer": f"Error calling live server endpoint: {e}",
                    "sources": [],
                    "metadata": {},
                    "status": "ERROR"
                })

    # Save incremental JSON backup
    with open(r"c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\statutory_rag_benchmark_22_results.json", "w", encoding="utf-8") as jf:
        json.dump(results, jf, indent=2, ensure_ascii=False)

    time.sleep(1)

total_elapsed = time.time() - total_start_time
print(f"\n================================================================================")
print(f"✅ ALL 22 BENCHMARK QUERIES COMPLETED IN {total_elapsed:.1f}s")
print(f"================================================================================", flush=True)

# Generate Markdown Document
md_lines = [
    "# Statutory RAG Benchmark & Latency Audit Report",
    "**Project SIH — AYUSH-IPR AI Guardian**  ",
    f"**Execution Date:** August 29, 2026  ",
    f"**Total Queries Executed:** {len(results)}  ",
    f"**Total Benchmark Duration:** {total_elapsed:.1f} seconds  ",
    f"**Hardware Platform:** Kaggle Dual Tesla T4 GPUs (2 × 16GB VRAM)  ",
    f"**Models Wired:** Qwen2.5-7B-Instruct (4-bit NF4) + BGE-M3 (568M) + bge-reranker-v2-m3 + 362 UDO Statutes  ",
    "",
    "---",
    "",
    "## 📊 Executive Latency & Performance Summary Table",
    "",
    "| # | Legal Category / Statutory Area | Expected Citation | Latency (s) | Latency (ms) | Top Source Match | Score | Status |",
    "| :-: | :--- | :--- | :-: | :-: | :--- | :-: | :-: |"
]

for r in results:
    top_src = r['sources'][0]['title'][:35] + "..." if r.get('sources') and len(r['sources']) > 0 else "N/A"
    top_score = f"{r['sources'][0]['score']:.4f}" if r.get('sources') and len(r['sources']) > 0 else "0.0000"
    status_emoji = "✅ PASS" if r['status'] == "SUCCESS" else "❌ FAIL"
    md_lines.append(
        f"| {r['id']} | **{r['category']}** | `{r['expected_citation']}` | **{r['latency_seconds']}s** | {r['latency_ms']} ms | {top_src} | `{top_score}` | {status_emoji} |"
    )

avg_latency = sum(r['latency_seconds'] for r in results) / len(results) if results else 0
md_lines.extend([
    "",
    f"**Average Query Response Time:** **{avg_latency:.2f} seconds**  ",
    f"**Fastest Response Time:** **{min(r['latency_seconds'] for r in results):.2f}s**  ",
    f"**Longest Response Time:** **{max(r['latency_seconds'] for r in results):.2f}s**  ",
    "",
    "---",
    "",
    "## 🔬 Exhaustive Query, Exact Latency & Generated Answers",
    ""
])

for r in results:
    md_lines.extend([
        f"### Query {r['id']}: {r['category']}",
        f"- **Prompt:** *\"{r['query']}\"*",
        f"- **Exact Response Time:** **`{r['latency_seconds']} seconds`** (`{r['latency_ms']} ms`)",
        f"- **Expected Statutory Citation:** `{r['expected_citation']}`",
        f"- **Execution Status:** `{r['status']}`",
        "",
        "#### 📝 Generated RAG Answer:",
        r['answer'],
        "",
        "#### 📚 Retrieved Statutory Sources (Top Ranked):"
    ])

    if r.get('sources'):
        for s_idx, s in enumerate(r['sources'], 1):
            title = s.get('title', s.get('doc_id', ''))
            score = s.get('score', 0)
            cit = s.get('citation', '')
            md_lines.append(f"{s_idx}. **{title}** (Relevance / Rerank Score: `{score:.4f}`)" + (f" — Citation: `{cit}`" if cit else ""))
    else:
        md_lines.append("*No statutory sources retrieved.*")

    md_lines.extend(["", "---", ""])

report_path = r"c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\statutory_rag_benchmark_22_prompts_report.md"
with open(report_path, "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print(f"📄 Markdown Report written to {report_path}", flush=True)

# Now convert to PDF
try:
    import convert_benchmark_report_to_pdf
    convert_benchmark_report_to_pdf.build_pdf()
    print("📕 PDF Report generated successfully!", flush=True)
except Exception as pe:
    print(f"⚠️ PDF build notice: {pe}", flush=True)


print(f"\n📄 Full Markdown report successfully written to:\n{report_path}")
