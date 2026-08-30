# Statutory RAG Benchmark & Latency Audit Report
**Project SIH — AYUSH-IPR AI Guardian**  
**Execution Date:** August 29, 2026  
**Total Queries Executed:** 22  
**Total Benchmark Duration:** 665.8 seconds  
**Hardware Platform:** Kaggle Dual Tesla T4 GPUs (2 × 16GB VRAM)  
**Models Wired:** Qwen2.5-7B-Instruct (4-bit GPTQ/BnB) + BGE-M3 (568M) + bge-reranker-v2-m3 + 362 UDO Statutes  

---

## 📊 Executive Latency & Performance Summary Table

| # | Legal Category / Statutory Area | Expected Citation | Latency (s) | Latency (ms) | Top Source Match | Score | Status |
| :-: | :--- | :--- | :-: | :-: | :--- | :-: | :-: |
| 1 | **Traditional Knowledge Bar (Patents Act §3(p))** | `Section 3(p)` | **95.6s** | 95601 ms | N/A | `0.0000` | ❌ FAIL |
| 2 | **Enhanced Therapeutic Efficacy (Patents Act §3(d))** | `Section 3(d)` | **114.47s** | 114474 ms | N/A | `0.0000` | ❌ FAIL |
| 3 | **Mere Admixture Bar (Patents Act §3(e))** | `Section 3(e)` | **10.9s** | 10896 ms | N/A | `0.0000` | ❌ FAIL |
| 4 | **Agricultural & Cultivation Exclusions (Patents Act §3(h))** | `Section 3(h)` | **21.09s** | 21085 ms | N/A | `0.0000` | ❌ FAIL |
| 5 | **Medicinal Treatment Exclusions (Patents Act §3(i))** | `Section 3(i)` | **24.89s** | 24892 ms | N/A | `0.0000` | ❌ FAIL |
| 6 | **Plants & Biological Processes (Patents Act §3(j))** | `Section 3(j)` | **12.4s** | 12395 ms | N/A | `0.0000` | ❌ FAIL |
| 7 | **Mandatory Biological Origin Disclosure (Patents Act §10(4))** | `Section 10(4)` | **10.86s** | 10859 ms | N/A | `0.0000` | ❌ FAIL |
| 8 | **Pre-Grant & Post-Grant Opposition on Bio-Resources (Patents Act §25)** | `Section 25` | **39.15s** | 39154 ms | N/A | `0.0000` | ❌ FAIL |
| 9 | **Traditional Knowledge Anticipation Opposition (Patents Act §25(1)(k))** | `Section 25(1)(k)` | **17.65s** | 17646 ms | N/A | `0.0000` | ❌ FAIL |
| 10 | **Patent Revocation Grounds before High Court (Patents Act §64)** | `Section 64` | **45.25s** | 45250 ms | N/A | `0.0000` | ❌ FAIL |
| 11 | **Compulsory Licensing for Public Health (Patents Act §84 & §92A)** | `Section 84` | **19.14s** | 19141 ms | N/A | `0.0000` | ❌ FAIL |
| 12 | **Amended RFE Timeline (Patent Rules 2024, Rule 24B)** | `Rule 24B` | **28.93s** | 28930 ms | N/A | `0.0000` | ❌ FAIL |
| 13 | **Certificate of Inventorship (Patent Rules 2024, Rule 70A)** | `Rule 70A` | **20.45s** | 20448 ms | N/A | `0.0000` | ❌ FAIL |
| 14 | **Grace Period Procedures (Patent Rules 2024, Rule 29A)** | `Rule 29A` | **18.58s** | 18578 ms | N/A | `0.0000` | ❌ FAIL |
| 15 | **Divisional Applications (Patent Rules 2024, Rule 13(2A))** | `Rule 13` | **25.26s** | 25264 ms | N/A | `0.0000` | ❌ FAIL |
| 16 | **Adulterated Ayurvedic Drugs (D&C Act §33EE)** | `Section 33EE` | **15.3s** | 15303 ms | N/A | `0.0000` | ❌ FAIL |
| 17 | **Spurious Ayurvedic Drugs (D&C Act §33EEA)** | `Section 33EEA` | **10.87s** | 10872 ms | N/A | `0.0000` | ❌ FAIL |
| 18 | **Poisonous Herbs & Label Warnings (D&C Rules Schedule E(1))** | `Schedule E(1)` | **35.68s** | 35681 ms | N/A | `0.0000` | ❌ FAIL |
| 19 | **Alcohol Limits in Asava & Arishta (D&C Rules Rule 161)** | `Rule 161` | **16.29s** | 16287 ms | N/A | `0.0000` | ❌ FAIL |
| 20 | **Statutory Shelf-Life Schedule (D&C Rules Rule 161B)** | `Rule 161B` | **12.24s** | 12237 ms | N/A | `0.0000` | ❌ FAIL |
| 21 | **Good Manufacturing Practices GMP (D&C Rules Schedule T)** | `Schedule T` | **10.89s** | 10890 ms | N/A | `0.0000` | ❌ FAIL |
| 22 | **ASU Technical Advisory Board (D&C Act §33C)** | `Section 33C` | **37.75s** | 37750 ms | N/A | `0.0000` | ❌ FAIL |

**Average Query Response Time:** **29.26 seconds**  
**Fastest Response Time:** **10.86s**  
**Longest Response Time:** **114.47s**  

---

## 🔬 Exhaustive Query, Exact Latency & Generated Answers

### Query 1: Traditional Knowledge Bar (Patents Act §3(p))
- **Prompt:** *"Can a company patent a standardized extract of Ashwagandha (Withania somnifera) that is documented in classical texts like Charaka Samhita for stress and vitality?"*
- **Exact Response Time:** **`95.6 seconds`** (`95601 ms`)
- **Expected Statutory Citation:** `Section 3(p)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: The read operation timed out

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 2: Enhanced Therapeutic Efficacy (Patents Act §3(d))
- **Prompt:** *"What standard of enhanced therapeutic efficacy must an applicant prove under Section 3(d) of the Patents Act to patent a new polymorphic form or derivative of a known Ayurvedic phytochemical?"*
- **Exact Response Time:** **`114.47 seconds`** (`114474 ms`)
- **Expected Statutory Citation:** `Section 3(d)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: The read operation timed out

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 3: Mere Admixture Bar (Patents Act §3(e))
- **Prompt:** *"Why does Section 3(e) of the Patents Act reject patent claims for combining ginger (Shunthi), black pepper (Maricha), and long pepper (Pippali) without showing synergistic bio-enhancement?"*
- **Exact Response Time:** **`10.9 seconds`** (`10896 ms`)
- **Expected Statutory Citation:** `Section 3(e)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 4: Agricultural & Cultivation Exclusions (Patents Act §3(h))
- **Prompt:** *"Is a method of cultivating endangered Himalayan Ayurvedic herbs such as Kutki (Picrorhiza kurroa) using a specialized hydroponic technique patentable in India under Section 3(h)?"*
- **Exact Response Time:** **`21.09 seconds`** (`21085 ms`)
- **Expected Statutory Citation:** `Section 3(h)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: <urlopen error [WinError 10060] A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond>

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 5: Medicinal Treatment Exclusions (Patents Act §3(i))
- **Prompt:** *"Can a clinic patent a specialized Panchakarma therapeutic protocol involving Shirodhara and herbal steam bath for treating neurological disorders under Section 3(i)?"*
- **Exact Response Time:** **`24.89 seconds`** (`24892 ms`)
- **Expected Statutory Citation:** `Section 3(i)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 6: Plants & Biological Processes (Patents Act §3(j))
- **Prompt:** *"Does Section 3(j) of the Patents Act allow patenting of genetically modified Ayurvedic medicinal plants or isolated natural plant seeds in India?"*
- **Exact Response Time:** **`12.4 seconds`** (`12395 ms`)
- **Expected Statutory Citation:** `Section 3(j)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 7: Mandatory Biological Origin Disclosure (Patents Act §10(4))
- **Prompt:** *"What are the mandatory requirements under Section 10(4)(d)(ii)(D) of the Patents Act regarding the disclosure of Indian biological resources and NBA approval in complete specifications?"*
- **Exact Response Time:** **`10.86 seconds`** (`10859 ms`)
- **Expected Statutory Citation:** `Section 10(4)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 8: Pre-Grant & Post-Grant Opposition on Bio-Resources (Patents Act §25)
- **Prompt:** *"Explain the grounds under Section 25(1)(j) and Section 25(2)(j) for opposing a patent based on non-disclosure or wrongful disclosure of biological source materials."*
- **Exact Response Time:** **`39.15 seconds`** (`39154 ms`)
- **Expected Statutory Citation:** `Section 25`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 9: Traditional Knowledge Anticipation Opposition (Patents Act §25(1)(k))
- **Prompt:** *"How can an Indian organization use TKDL documentation and oral community knowledge to oppose a patent application under Section 25(1)(k) and 25(2)(k)?"*
- **Exact Response Time:** **`17.65 seconds`** (`17646 ms`)
- **Expected Statutory Citation:** `Section 25(1)(k)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 10: Patent Revocation Grounds before High Court (Patents Act §64)
- **Prompt:** *"Under Section 64(1)(p) and 64(1)(q) of the Patents Act, 1970, what are the specific grounds for revoking a granted patent before the High Court in relation to biological resources?"*
- **Exact Response Time:** **`45.25 seconds`** (`45250 ms`)
- **Expected Statutory Citation:** `Section 64`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 11: Compulsory Licensing for Public Health (Patents Act §84 & §92A)
- **Prompt:** *"Under what statutory conditions can the Controller grant a compulsory licence under Section 84 or Section 92A for manufacturing and exporting critical pharmaceutical or Ayurvedic formulations?"*
- **Exact Response Time:** **`19.14 seconds`** (`19141 ms`)
- **Expected Statutory Citation:** `Section 84`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 12: Amended RFE Timeline (Patent Rules 2024, Rule 24B)
- **Prompt:** *"What is the new shortened statutory deadline for filing a Request for Examination (RFE) under Rule 24B(1)(i) as introduced by the Patents (Amendment) Rules, 2024?"*
- **Exact Response Time:** **`28.93 seconds`** (`28930 ms`)
- **Expected Statutory Citation:** `Rule 24B`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 13: Certificate of Inventorship (Patent Rules 2024, Rule 70A)
- **Prompt:** *"Explain the newly introduced Certificate of Inventorship under Rule 70A and Form 8A of the Patents Rules, 2024. Is there any statutory fee required for the certificate?"*
- **Exact Response Time:** **`20.45 seconds`** (`20448 ms`)
- **Expected Statutory Citation:** `Rule 70A`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 14: Grace Period Procedures (Patent Rules 2024, Rule 29A)
- **Prompt:** *"What is the formal procedure under Rule 29A and Form 31 of the Patent Rules for claiming the 12-month grace period under Section 31 of the Patents Act?"*
- **Exact Response Time:** **`18.58 seconds`** (`18578 ms`)
- **Expected Statutory Citation:** `Rule 29A`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 15: Divisional Applications (Patent Rules 2024, Rule 13(2A))
- **Prompt:** *"What clarification does amended Rule 13(2A) of the Patents Rules provide regarding the filing of divisional patent applications from provisional or complete specifications?"*
- **Exact Response Time:** **`25.26 seconds`** (`25264 ms`)
- **Expected Statutory Citation:** `Rule 13`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 16: Adulterated Ayurvedic Drugs (D&C Act §33EE)
- **Prompt:** *"Define an Adulterated Ayurvedic, Siddha or Unani drug under Section 33EE of the Drugs and Cosmetics Act, 1940. What circumstances render a drug adulterated?"*
- **Exact Response Time:** **`15.3 seconds`** (`15303 ms`)
- **Expected Statutory Citation:** `Section 33EE`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 17: Spurious Ayurvedic Drugs (D&C Act §33EEA)
- **Prompt:** *"What constitutes a Spurious Ayurvedic drug under Section 33EEA of the Drugs and Cosmetics Act? What are the penal consequences for manufacturing spurious AYUSH medicines?"*
- **Exact Response Time:** **`10.87 seconds`** (`10872 ms`)
- **Expected Statutory Citation:** `Section 33EEA`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 18: Poisonous Herbs & Label Warnings (D&C Rules Schedule E(1))
- **Prompt:** *"What specific plant substances are listed under Schedule E(1) of the Drugs and Cosmetics Rules, and what mandatory cautionary warning label is enforced under Rule 161?"*
- **Exact Response Time:** **`35.68 seconds`** (`35681 ms`)
- **Expected Statutory Citation:** `Schedule E(1)`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 19: Alcohol Limits in Asava & Arishta (D&C Rules Rule 161)
- **Prompt:** *"What is the maximum permissible limit of self-generated natural alcohol in Ayurvedic Asava and Arishta formulations under Rule 161 of the Drugs and Cosmetics Rules?"*
- **Exact Response Time:** **`16.29 seconds`** (`16287 ms`)
- **Expected Statutory Citation:** `Rule 161`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 20: Statutory Shelf-Life Schedule (D&C Rules Rule 161B)
- **Prompt:** *"Detail the statutory shelf-life and expiry periods under Rule 161B of the Drugs and Cosmetics Rules for Churna, Vati, Taila, Ghrita, Asava/Arishta, and Bhasma preparations."*
- **Exact Response Time:** **`12.24 seconds`** (`12237 ms`)
- **Expected Statutory Citation:** `Rule 161B`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 21: Good Manufacturing Practices GMP (D&C Rules Schedule T)
- **Prompt:** *"What are the core factory hygiene, space, raw material testing, and quality control requirements mandated under Schedule T for manufacturing Ayurvedic formulations?"*
- **Exact Response Time:** **`10.89 seconds`** (`10890 ms`)
- **Expected Statutory Citation:** `Schedule T`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---

### Query 22: ASU Technical Advisory Board (D&C Act §33C)
- **Prompt:** *"What is the composition and statutory mandate of the Ayurvedic, Siddha and Unani Drugs Technical Advisory Board (ASUDTAB) under Section 33C of the Drugs and Cosmetics Act?"*
- **Exact Response Time:** **`37.75 seconds`** (`37750 ms`)
- **Expected Statutory Citation:** `Section 33C`
- **Execution Status:** `ERROR`

#### 📝 Generated RAG Answer:
Error calling live server endpoint: HTTP Error 502: Bad Gateway

#### 📚 Retrieved Statutory Sources (Top 5 Ranked):
*No statutory sources retrieved.*

---
