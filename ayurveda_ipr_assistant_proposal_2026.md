# Ayurveda IPR and Regulatory Assistant — Full Technical Proposal

> **Comprehensive Research-Backed Implementation Blueprint**
> Generated: August 26, 2026 | Based on deep research of PS requirements

---

## Table of Contents

1. Executive Summary
2. Data Scraping — Exact Sources, Methods and Pipelines
3. Cross-Platform App — React Native (Web + iOS + Android)
4. AI LLM — Multilingual Legal Reasoning with RAG
5. Speaking Model — Text-to-Speech for Indian Languages
6. Speech Recognition Model — Indic Language ASR
7. OCR and Document Understanding — Fast Image/PDF Processing
8. RAG Database Architecture
9. Entire App Architecture — End-to-End System Design
10. Every Other Key Necessity
11. Cost Estimation and Infrastructure
12. Development Roadmap

---

## 1. Executive Summary

This proposal outlines the **complete technical blueprint** for an **Ayurveda IPR and Regulatory Assistant** — a domain-expert legal AI system that combines:

- **6 core capabilities**: Formulation Classification, IPR Advisory, ABS Compliance, TKDL/Prior Art Search, Jurisdiction Toggle (India/International), and Source-Cited Legal Answers
- **Multilingual voice-first interface** in Hindi (Devanagari), Tamil, and English
- **Cross-platform delivery** via React Native (Web + iOS + Android)
- **Open-source AI stack** with RAG, knowledge graph, OCR, and speech

> [!IMPORTANT]
> **No existing tool combines all 6 capabilities.** This is a genuine market gap. IP SAARTHI, KanoonGPT, Formulaite each cover only 1-2 aspects.

---

## 2. Data Scraping — Exact Sources, Methods and Pipelines

### 2.1 Complete Data Source Matrix (23 Sources)

#### Layer 1: Statutes and Rules (The Law Itself)

| # | Source | URL | What to Extract | Scraping Method | Format | Priority |
|---|--------|-----|-----------------|-----------------|--------|----------|
| 1 | **India Code** | indiacode.nic.in | 17+ Central Acts (Patents Act 1970, TM Act 1999, GI Act 1999, Biodiversity Act 2002, D&C Act 1940) | requests + BeautifulSoup; community Statute API on GitHub for JSON | HTML to JSON | **P0** |
| 2 | **Gazette of India** | egazette.gov.in | Patent Rules 2024, Biodiversity Rules 2024, ABS Regulations 2025, D&C Rules 1945 amendments | PDF download + PyMuPDF text extraction | PDF to Text | **P0** |
| 3 | **AYUSH Patent Guidelines 2025** | ipindia.gov.in | AYUSH-specific patent examination guidelines | Direct PDF download | PDF to Text | **P0** |
| 4 | **WIPO Lex** | wipo.int/wipolex | TRIPS, CBD, Nagoya Protocol, WIPO GRATK Treaty 2024, PCT, Madrid, Hague, Budapest | Partial REST API; bulk PDF download | PDF/HTML to Text | **P0** |
| 5 | **CBD ABSCH** | absch.cbd.int | ABS permits, Nagoya checkpoint data | REST API (JSON responses) | JSON | **P1** |

#### Layer 2: Pharmacopoeial and Classical Texts

| # | Source | URL | What to Extract | Scraping Method | Format | Priority |
|---|--------|-----|-----------------|-----------------|--------|----------|
| 6 | **Ayurvedic Pharmacopoeia of India** | archive.org, pcimh.gov.in | Drug monographs: Name, Ingredients, Method, Standards | Download PDFs, OCR with **Surya OCR** for scanned pages | PDF (scanned) to OCR to JSON | **P0** |
| 7 | **Ayurvedic Formulary of India** | archive.org, pcimh.gov.in | Classical formulations in First Schedule texts | Same as above | PDF to JSON | **P0** |
| 8 | **e-Samhita** | niimh.nic.in/ebooks | Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya | Web scraping with structured chapter/verse extraction | HTML to JSON | **P1** |
| 9 | **DRAVYA Portal (CCRAS)** | ccras.nic.in | Ayurvedic substance database — botanical names, parts used | Playwright (dynamic JS pages) | HTML to JSON | **P1** |
| 10 | **FSSAI Ayurveda Aahar** | fssai.gov.in | Schedule A — Category A product recipes | PDF extraction | PDF to JSON | **P1** |

#### Layer 3: Registry and Case Data

| # | Source | URL | What to Extract | Scraping Method | Format | Priority |
|---|--------|-----|-----------------|-----------------|--------|----------|
| 11 | **InPASS** (Patent Search) | ipindiaservices.gov.in/publicsearch | Indian AYUSH patent applications and grants | Playwright (no API) | HTML to JSON | **P1** |
| 12 | **Google Patents** | patents.google.com | Global patents including India — bulk AYUSH data | Google Patents BigQuery (official, free tier) | JSON | **P0** |
| 13 | **WIPO PATENTSCOPE** | patentscope.wipo.int | PCT applications for herbal/Ayurvedic inventions | REST API (official) | XML/JSON | **P1** |
| 14 | **Espacenet** | worldwide.espacenet.com | EPO patent database — global herbal patents | Open Patent Services (OPS) API | XML | **P2** |
| 15 | **TMR India** (Trademark) | ipindiaservices.gov.in/tmrpublicsearch | Ayurvedic brand name trademarks | Playwright | HTML to JSON | **P2** |
| 16 | **GI Registry** | ipindia.gov.in/geographical-indications.htm | Registered GIs for Ayurvedic products | PDF list downloads | PDF to JSON | **P2** |
| 17 | **IndianKanoon** | indiankanoon.org | IPR case law, Ayurveda judgments | HuggingFace dataset: d-riti/Dataset-For-Indian-Legal-Knowledge-Base | JSON/Parquet | **P1** |
| 18 | **eCourts India** | ecourts.gov.in | Official case records, orders | eCourtsIndia API (authorized) | JSON | **P2** |
| 19 | **NBA ABS Portal** | absefiling.nbaindia.in | ABS certificates, filings | Web scraping | HTML to JSON | **P2** |

#### Layer 4: TKDL (Special Handling)

| # | Source | Status | Strategy |
|---|--------|--------|----------|
| 20 | **TKDL** (tkdl.res.in) | RESTRICTED — 500K+ formulations; paid subscription | Cannot directly ingest. Build "TKDL Pointer": reference TKRC codes in KB, guide users to search TKDL, use as prior art reference in IPR routing |

#### Layer 5: Pre-Built Datasets

| # | Source | Contents | Access |
|---|--------|----------|--------|
| 21 | KanoonGPT Dataset (HuggingFace) | Cleaned Indian legal text | HuggingFace API |
| 22 | Indian Legal Corpus (HuggingFace) | Structured Indian legal docs | HuggingFace API |
| 23 | Ayusoft | Ayurvedic knowledge repository | Web access |

### 2.2 Data Ingestion Pipeline

```
COLLECTORS           PROCESSORS              STRUCTURED OUTPUT
Web Scrapers    -->  PDF Parser (PyMuPDF) --> Section-Level Chunks with:
(Playwright,         OCR (Surya OCR)          statute_name, section_number,
 BS4, requests)      HTML Parser (BS4)        jurisdiction, last_amended_date,
API Clients          Legal Section Splitter   cross_references[], chunk_hash
(WIPO, BigQuery)     (custom hierarchical)
HF Datasets                                  --> Git-Versioned Corpus (DVC)
```

### 2.3 Chunking Strategy (CRITICAL)

> [!IMPORTANT]
> NEVER use naive fixed-token splitting on legal text. It destroys section boundaries and makes citations impossible.

| Document Type | Chunking Unit | Max Chunk | Overlap | Key Metadata |
|--------------|--------------|-----------|---------|-------------|
| Statutes | Section / Sub-section | 1500 tokens | 200 | act_name, section_number, year |
| Case Law | Paragraph | 2000 tokens | 300 | case_citation, court, year |
| Pharmacopoeia | Drug Monograph | 1000 tokens | 100 | drug_name, ingredients[] |
| Treaties | Article | 1500 tokens | 200 | treaty_name, article_number |

### 2.4 Scraping Toolkit

| Tool | Use Case | Why |
|------|---------|-----|
| **Playwright** (Python) | Dynamic JS portals (InPASS, TMR, DRAVYA) | CAPTCHA, JS rendering, pagination |
| **requests + BeautifulSoup** | Static HTML (India Code, WIPO Lex) | Lightweight, fast |
| **PyMuPDF (fitz)** | PDF extraction (Gazette, rules, treaties) | Fast, complex layouts |
| **Surya OCR** | Scanned PDFs (old Pharmacopoeia) | 90+ languages, layout-aware |
| **Google BigQuery** | Bulk patent data | Free tier sufficient |
| **HuggingFace datasets** | Legal corpora (ILC, KanoonGPT) | One-line download |

---

## 3. Cross-Platform App — React Native (Web + iOS + Android)

### 3.1 Technology Stack

One codebase for Web + iOS + Android (like Claude app). Gold standard in 2026: **Expo SDK 55+ with New Architecture**.

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Framework** | React Native + Expo SDK 55+ | New Architecture (Fabric + TurboModules) |
| **Routing** | Expo Router (file-based) | Shared navigation, deep linking |
| **Runtime** | Hermes engine | AOT compilation, fast cold starts |
| **Language** | TypeScript (strict) | Non-negotiable |
| **State (Local)** | Zustand | Lightweight |
| **State (Server)** | TanStack Query v5 | Caching, background sync |
| **Styling** | NativeWind (Tailwind for RN) | Shared design system |
| **Audio Capture** | expo-audio + @mykin-ai/expo-audio-stream | Real-time PCM streaming |
| **Audio Playback** | expo-av | Streamed TTS |
| **WebSocket** | Native WebSocket API | Binary PCM streaming |
| **Camera/OCR** | expo-camera + expo-image-picker | Document scanning |
| **Build/CI** | EAS (Expo Application Services) | Cloud builds, OTA |
| **Animations** | react-native-reanimated | 60/120 FPS |

### 3.2 Project Structure

```
ayurveda-ipr-app/
app/                          # File-based routes (Expo Router)
  (tabs)/
    chat.tsx                  # Main chat interface
    scan.tsx                  # OCR document scanner
    classify.tsx              # Formulation classifier wizard
    settings.tsx              # Language, jurisdiction, profile
  _layout.tsx                 # Root layout
  index.tsx                   # Landing/onboarding
components/
  chat/
    MessageBubble.tsx         # Chat message with citation links
    CitationCard.tsx          # Expandable citation reference
    ConfidenceIndicator.tsx   # Traffic light (High/Med/Low)
    JurisdictionToggle.tsx    # [India | International] switch
    VoiceInput.tsx            # Mic button with VAD + waveform
    EscalationButton.tsx      # Connect to IP facilitator
  classifier/
    ClassificationWizard.tsx  # 5-7 step decision tree
    ResultCard.tsx            # Result + reasoning
  scanner/
    DocumentScanner.tsx       # Camera-based capture
    OCRResultView.tsx         # Extracted text with edit
  shared/
    DisclaimerBanner.tsx      # Not legal advice
    LanguageSelector.tsx      # Hindi / Tamil / English
services/
  api/ (chatService, ocrService, voiceService, classifierService)
  auth/ (authService - DPDP-compliant)
  storage/ (chatHistory - local encrypted)
hooks/ (useVoiceRecording, useChat, useJurisdiction, useLanguage)
constants/ (theme, languages, config)
types/ (chat, classification, api)
```

### 3.3 Voice Chat Flow (Low Latency)

```
User speaks Hindi
    |
expo-audio-stream (16kHz PCM, 100ms buffers)
    |
WebSocket (Binary, raw PCM - NO Base64)
    |
BACKEND:
  PCM --> IndicConformer ASR --> Hindi Text
      --> NMT (optional) --> English Text
      --> RAG Pipeline --> English Answer
      --> NMT (optional) --> Hindi Text
      --> IndicParler TTS --> Hindi Audio PCM chunks
    |
WebSocket (Binary) --> expo-av playback
    |
User hears response while LLM still generating
```

### 3.4 Key UI Features

| Feature | Implementation |
|---------|---------------|
| Chat Interface | Scrollable messages + input bar + mic (like Claude) |
| Jurisdiction Toggle | Segmented [India | International] control |
| Citation Links | Inline [Section 3(p), Patents Act 1970] tappable links |
| Confidence | Traffic light: Green High / Yellow Medium / Red Low |
| Disclaimer | Persistent "This is information, not legal advice" |
| Escalation | "Connect to IP Facilitator" button |
| Document Scanner | Camera capture, auto-crop, OCR, extract details |
| Language | Three-way: English / Hindi / Tamil |

---

## 4. AI LLM — Multilingual Legal Reasoning with RAG

### 4.1 Core Requirements

1. Reason about legal text, interpret statutes, cite sources
2. Understand Hindi (Devanagari script) and Tamil natively
3. Support RAG with grounding, never hallucinate
4. Open-source, self-hostable for DPDP compliance

### 4.2 Model Comparison

| Model | Params | Active | Context | Hindi/Tamil | Legal | License | GPU |
|-------|--------|--------|---------|-------------|-------|---------|-----|
| **Sarvam-105B** | 105B | 10B MoE | 65K | 5/5 native 22 langs | 4/5 | Apache 2.0 | 4x A100 |
| **Qwen3-235B** | 235B | 22B MoE | 128K | 4/5 strong multilingual | 5/5 dual thinking | Apache 2.0 | 8x A100 |
| **Qwen3-30B-A3B** | 30B | 3B MoE | 128K | 4/5 | 4/5 | Apache 2.0 | 1x A100 |
| **Sarvam-30B** | 32B | 2.4B MoE | 65K | 5/5 | 3/5 | Apache 2.0 | 1x A100 |
| **DeepSeek-V4-Pro** | Large | 37B | 128K+ | 3/5 | 5/5 | Open | 6x A100 |

### 4.3 Recommended: Dual-Model Strategy

> [!TIP]
> Use TWO models. This pattern wins hackathons and production deployments.

**MODEL 1: Sarvam-105B** (Sarvam-30B for MVP) = "The Indian Language Expert"
- Native Hindi/Tamil in Devanagari/Tamil script
- User-facing chat, cultural context, AYUSH terminology

**MODEL 2: Qwen3-30B-A3B** (Qwen3-235B for production) = "The Legal Reasoning Engine"
- Dual-mode thinking for complex IPR analysis
- 128K context for long statutes
- Citation extraction, classification, IPR routing

**ROUTER**: LangGraph Orchestrator decides which model handles each part.

### 4.4 Embedding Models

| Model | Purpose | Why |
|-------|---------|-----|
| **BGE-M3** | Primary embeddings | Hybrid dense+sparse; multilingual; legal RAG standard |
| **IndicBERT v2 / MuRIL** | Hindi/Tamil specific | Custom retrieval over pharmacopoeial texts |

### 4.5 RAG System Prompt

```
You are an Ayurveda IPR and Regulatory Assistant.

RULES:
1. ONLY use information from provided context documents.
2. EVERY claim MUST cite: [Section X, Act Name, Year]
3. If insufficient info: say so and recommend IP attorney. [Escalate]
4. Append: "This is information, not legal advice."
5. Confidence: HIGH (exact match) | MEDIUM (related) | LOW (limited)
6. Jurisdiction: INDIA = Indian statutes | INTERNATIONAL = Treaties
   Keep both visually separated.

CONTEXT: {retrieved_context}
QUERY (Jurisdiction: {jurisdiction}): {user_query}
```

---

## 5. Speaking Model — TTS for Indian Languages

### 5.1 Model Comparison

| Model | Languages | Quality | Latency | License |
|-------|-----------|---------|---------|---------|
| **IndicParler-TTS** (AI4Bharat) | 18-23 Indian | SOTA 5/5 | 500ms | Apache 2.0 |
| **svara-TTS** | 19 Indian | Emotional 5/5 | 600ms | Open |
| **Sooktam2** (BharatGen) | Hindi, Tamil, etc. | 4/5 | 400ms | Open |
| **XTTS v2** (Coqui) | 17+ multilingual | 4/5 | 700ms | Apache 2.0 |
| **Bhashini TTS** | 22 Indian | 3/5 | 800ms | Free (govt) |
| **Kokoro (82M)** | Limited Indic | 3/5 | 100ms ultra-fast | Open |

### 5.2 Recommended Strategy

- **PRIMARY**: IndicParler-TTS — best Hindi/Tamil quality, Apache 2.0, self-hosted
- **FALLBACK**: Bhashini TTS API — free government API, 22 languages
- **EDGE**: Kokoro (82M) — CPU-only, for short confirmations

### 5.3 Streaming Architecture

```
LLM generates tokens (streaming)
  --> Buffer to sentence boundary
  --> IndicParler-TTS generates audio chunk
  --> WebSocket streams PCM to client
  --> expo-av real-time playback
  = User hears while LLM still generating
```

---

## 6. Speech Recognition — ASR for Indic Languages

### 6.1 Model Comparison

| Model | Architecture | Languages | WER Hindi | Code-Mix | Latency | License |
|-------|-------------|-----------|-----------|----------|---------|---------|
| **IndicConformer** (AI4Bharat) | Conformer CTC-RNNT | 22 Indian | ~8% | 5/5 | <100ms streaming | MIT |
| **Shunya/Pingala V1** | Fine-tuned Whisper | Indian | ~10% | 5/5 best code-switch | ~300ms | Open |
| **faster-whisper** | Whisper+CTranslate2 | Multilingual | ~12% | 3/5 | ~200ms | MIT |
| **Saaras V3** (Sarvam) | Custom | Indian | ~9% | 5/5 | <100ms | Open |
| **Bhashini ASR** | ULCA models | 22 Indian | ~15% | 3/5 | ~500ms | Free |

### 6.2 Recommended Strategy

- **PRIMARY**: IndicConformer — gold standard, 600M params, streaming, VEXYL-STT Docker
- **SECONDARY**: Shunya/Pingala — best code-mixed Hindi+English, Tamil+English
- **FALLBACK**: Bhashini ASR API — free, zero cost, good for MVP

### 6.3 Custom Legal Vocabulary

> [!WARNING]
> Standard ASR struggles with legal terms. Add hotword boosting for: Section 3(p/d/e), Patents Act, Trademarks Act, GI Act, Biodiversity Act, FSSAI, TKDL, ABS, Nagoya Protocol, WIPO GRATK, and Hindi/Tamil equivalents.

---

## 7. OCR and Document Understanding

### 7.1 Two Use Cases

1. **Corpus Building**: OCR scanned Pharmacopoeia (batch)
2. **Real-Time**: User photographs document, extract and understand within seconds

### 7.2 Model Comparison

| Model | Use Case | Languages | Speed | Layout | License |
|-------|---------|-----------|-------|--------|---------|
| **Surya OCR 2** | Batch + Real-time | 90+ (Hindi, Tamil) | 4/5 | 5/5 | GPL-3.0 |
| **PaddleOCR** | High-throughput | Many | 5/5 fastest | 5/5 | Apache 2.0 |
| **Qwen2.5-VL 7B** | Document reasoning | Universal | 3/5 heavier | 5/5 OCR-free | Apache 2.0 |
| **InternVL3** | Document reasoning | Universal | 3/5 | 5/5 | Open |

### 7.3 Two-Tier Strategy

**TIER 1: Surya OCR 2** (Fast Text Extraction)
- Text detection + recognition in one pass
- Hindi Devanagari + Tamil native support
- ~200ms/page (GPU), ~1s/page (CPU)
- Output: Structured Markdown

**TIER 2: Qwen2.5-VL 7B** (Deep Document Understanding)
- OCR-free document reasoning
- Answers: "What ingredients?", "Classical or proprietary?"
- ~2-5s per document (GPU)

**FLOW**: User photo --> Surya OCR (fast text, display) --> Qwen2.5-VL (deep understanding) --> Auto-populate classification wizard

### 7.4 Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| OCR text extraction | < 500ms/page | Surya on GPU |
| Document understanding | < 3 seconds | Qwen2.5-VL 7B + vLLM |
| Batch processing | 100 pages/min | PaddleOCR GPU batching |
| Mobile photo to text | < 2s end-to-end | Client preprocess + server |

---

## 8. RAG Database Architecture

### 8.1 Why Hybrid RAG

Legal RAG needs multi-hop reasoning. Example: "Can I patent my Ashwagandha formulation?" touches:
1. Section 3(p) — traditional knowledge bar
2. AYUSH Guidelines 2025 — inventive step test
3. TKDL prior art — documented formulations
4. Biodiversity Act 2002 — ABS requirements
5. Section 3(e) — mere admixture bar

Simple vector search cannot traverse these. Need **Vector + Graph + BM25**.

### 8.2 Architecture Flow

```
USER QUERY
    |
Intent Parser --> Query Decomposer (sub-queries)
    |
HYBRID RETRIEVAL
  Vector Search (Qdrant + BGE-M3)  +  BM25 (Elasticsearch)
    |
  Reciprocal Rank Fusion (RRF, k=60)
    |
  Cross-Encoder Reranker (bge-reranker-v2-m3)
    |
KNOWLEDGE GRAPH (Neo4j)
  Traverse: cross-refs, amendments, interpretations, product routing
  Output: Annotated subgraph with provenance
    |
CONTEXT ASSEMBLY --> LLM --> Cited Answer + Confidence Score
```

### 8.3 Technology Choices

| Component | Technology | Why |
|-----------|-----------|-----|
| **Vector Store** | Qdrant (self-hosted) | Speed, hybrid search, payload filtering |
| **Keyword Search** | Elasticsearch (rank_bm25 for MVP) | Exact section number matching |
| **Knowledge Graph** | Neo4j Community | Cypher queries, native vector since v5.x |
| **Embeddings** | BGE-M3 | Dense+sparse+ColBERT; multilingual |
| **Reranker** | bge-reranker-v2-m3 | Highest-ROI for legal precision |
| **Cache** | Redis | Response caching, sessions |
| **Blob Storage** | MinIO (S3-compatible) | PDFs, OCR results, audit |

### 8.4 Neo4j Knowledge Graph Schema

**Node Types**: Statute, Section, SubSection, Rule, Treaty, Article, CaseLaw, DrugFormulation, Ingredient, DrugMonograph, IPCategory, Jurisdiction, PatentApplication, TKDLRecord, ABSRequirement, RegulatoryPathway

**Key Relationships**:
- Section BELONGS_TO Statute
- Section REFERS_TO Section (cross-references)
- Section AMENDED_BY Rule
- Section INTERPRETED_IN CaseLaw
- Treaty IMPLEMENTED_BY Statute (e.g., TRIPS to Patents Act)
- DrugFormulation CLASSIFIED_AS Type
- DrugFormulation CONTAINS Ingredient
- Ingredient REQUIRES_ABS_IF ABSRequirement
- Ingredient FOUND_IN_TKDL TKDLRecord
- PatentApplication SUBJECT_TO Section

### 8.5 Data Sizing

| Layer | Volume | Storage |
|-------|--------|---------|
| Statutes and Rules | ~5K chunks | ~50 MB |
| Case Law (IPR) | ~20K chunks | ~200 MB |
| Pharmacopoeia | ~8K chunks | ~80 MB |
| Treaties | ~3K chunks | ~30 MB |
| Patent Data | ~50K records | ~500 MB |
| Knowledge Graph | ~100K nodes, ~500K edges | ~2 GB |
| **Total** | **~86K chunks** | **~3 GB** |

---

## 9. Entire App Architecture — End-to-End

### 9.1 Six-Layer System Design

```
LAYER 1: CLIENT (React Native + Expo)
  Web / iOS / Android --> Expo Router (shared codebase)
       | HTTPS / WSS

LAYER 2: API GATEWAY (Nginx/Caddy)
  SSL termination, rate limiting, WebSocket upgrade
       |

LAYER 3: BACKEND (FastAPI)
  /api/chat, /api/classify, /api/ocr, /ws/voice, /api/escalate, /api/audit
       |

LAYER 4: ORCHESTRATION (LangGraph Multi-Agent)
  Intent Parser --> Query Decomposer --> Specialist Agents:
    Formulation Classifier Agent
    IPR Router Agent
    ABS Compliance Agent
    TKDL/Prior Art Agent
    Citation Grounding Agent
       |

LAYER 5: AI MODEL SERVING
  LLM Server      ASR Server       TTS Server       OCR/VLM Server
  vLLM serving    IndicConformer   IndicParler-TTS  Surya + Qwen2.5-VL
  Sarvam + Qwen3  :8001            :8002            :8003
  :8000
       |

LAYER 6: DATA and STORAGE
  Qdrant    Neo4j     Elasticsearch  Redis
  :6333     :7474     :9200          :6379
  MinIO     Postgres  Git + DVC
  :9000     :5432     (versioned corpus)
```

### 9.2 Service Communication

| From to To | Protocol | Purpose |
|------------|----------|---------|
| Client to Gateway | HTTPS/WSS | All user interactions |
| FastAPI to LangGraph | Python async | Agent orchestration |
| LangGraph to vLLM | HTTP (OpenAI-compat) | LLM inference |
| LangGraph to Qdrant | gRPC/REST | Vector search |
| LangGraph to Neo4j | Bolt (Cypher) | Graph traversal |
| LangGraph to Elasticsearch | REST | BM25 keyword search |
| FastAPI to ASR/TTS | HTTP/WebSocket | Speech I/O |
| FastAPI to OCR | HTTP | Document processing |
| FastAPI to Redis | Redis protocol | Caching, sessions |
| FastAPI to Postgres | asyncpg | Users, audit logs |

### 9.3 Docker Compose Deployment

All services containerized. Key GPU reservations:
- LLM Sarvam-105B: 4x NVIDIA GPU via vLLM
- LLM Qwen3-30B: 1x NVIDIA GPU via vLLM
- ASR/TTS/OCR: 1x NVIDIA GPU each
- Data stores: Standard containers

---

## 10. Every Other Key Necessity

### 10.1 Security and DPDP Compliance

| Requirement | Implementation |
|-------------|---------------|
| Data Consent | DPDP Act 2023 explicit opt-in |
| Data Minimization | Auto-delete configurable period |
| Encryption at Rest | AES-256 (pgcrypto, MinIO SSE) |
| Encryption in Transit | TLS 1.3 (Nginx) |
| Audit Trail | Full query/response log in PostgreSQL |
| Right to Erasure | DELETE /api/user/data endpoint |
| Access Control | JWT + refresh; RBAC (User, Admin, Facilitator) |
| Rate Limiting | Redis token bucket per user |

### 10.2 Evaluation and QA

| Framework | Measures |
|-----------|---------|
| **RAGAS** | Faithfulness, relevancy, context precision/recall |
| **DeepEval** | Hallucination detection, toxicity, bias |
| **Custom Legal Eval** | Citation correctness |

### 10.3 Confidence Scoring Algorithm

```
confidence = 0.4 * top_retrieval_score
           + 0.3 * min(graph_path_depth / 3, 1.0)
           + 0.3 * min(citation_count / 3, 1.0)

if confidence >= 0.7 and citations >= 2: HIGH (green)
elif confidence >= 0.4 and citations >= 1: MEDIUM (yellow)
else: LOW (red) — recommend IP attorney
```

### 10.4 Escalation Triggers

Auto-escalate when: confidence < 0.3, Section 3(e) admixture analysis, TKDL access needed, international filing strategy, or user requests human expert.

### 10.5 Multilingual Legal Glossary

| English | Hindi (Devanagari) | Tamil |
|---------|-------------------|-------|
| Patent | पेटेंट | காப்புரிமை |
| Trademark | व्यापार चिह्न | வணிகக் குறி |
| Geographical Indication | भौगोलिक संकेत | புவிச்சான்று |
| Prior Art | पूर्व कला | முன்னோடி கலை |
| Traditional Knowledge | पारंपरिक ज्ञान | பாரம்பரிய அறிவு |
| Formulation | सूत्रीकरण | சூத்திரம் |
| Classical Medicine | शास्त्रीय औषधि | பாரம்பரிய மருந்து |

### 10.6 Bhashini Integration

- Register at bhashini.gov.in, get ULCA API credentials
- Pipeline: ASR (hi-conformer) --> NMT (hi to en) --> RAG --> NMT (en to hi) --> TTS
- Chained ASR+NMT in single API call for reduced latency
- Use Bhashini for ASR/NMT (free), self-hosted IndicParler for TTS (better quality)

### 10.7 Corpus Versioning

```
corpus/
  .git/                     # Git versioning
  .dvc/                     # DVC for large files
  statutes/
    patents_act_1970/
    biodiversity_act_2002/
    dc_act_1940/
  treaties/
    trips/
    nagoya_protocol/
    wipo_gratk_2024/
  pharmacopoeia/
    api_vol1/
    api_vol2/
  case_law/
    ipr_judgments/
  CHANGELOG.md
  VERSION
```

### 10.8 Monitoring

| Tool | Purpose |
|------|---------|
| Prometheus + Grafana | System metrics (GPU, latency) |
| LangSmith / LangFuse | LLM tracing (tokens, prompts) |
| Sentry | Error tracking |
| Custom Dashboard | RAGAS scores, citation accuracy |

---

## 11. Cost Estimation

### Full Production

| Component | Spec | Monthly INR |
|-----------|------|-------------|
| GPU (LLM) | 4x A100 80GB | 2-3 Lakh |
| GPU (ASR/TTS/OCR) | 2x A100 40GB | 80K-1.5L |
| CPU Server | 32 vCPU, 128GB RAM | 30-50K |
| Bhashini API | Free | 0 |
| **Total** | | **3.1-5 Lakh/month** |

### MVP Optimized

| Component | Spec | Monthly INR |
|-----------|------|-------------|
| GPU | 1x A100 80GB (all models) | 70K-1L |
| CPU Server | 16 vCPU, 64GB RAM | 15-25K |
| **Total** | | **85K-1.25L/month** |

### Hackathon/Demo

| Component | How | Monthly INR |
|-----------|-----|-------------|
| LLM | Groq/Together API | ~5K |
| ASR/TTS | Bhashini (free) | 0 |
| OCR | Surya local/Colab | 0 |
| Hosting | Render/Railway | 2K |
| **Total** | | **7-15K/month** |

---

## 12. Development Roadmap (12 Weeks)

### Phase 0: Foundation (Week 1)
- [ ] Monorepo setup (Expo + FastAPI + scrapers)
- [ ] Register on Bhashini
- [ ] Docker containers (Qdrant, Neo4j, Elasticsearch)
- [ ] Begin corpus building

### Phase 1: Data Pipeline (Weeks 2-3)
- [ ] Scrape 15 core Indian statutes
- [ ] OCR Pharmacopoeia with Surya
- [ ] Structure WIPO treaties
- [ ] Hierarchical chunking to Qdrant + Elasticsearch
- [ ] Begin Neo4j graph population
- [ ] Git + DVC corpus versioning

### Phase 2: RAG Core (Weeks 4-5)
- [ ] Deploy Qwen3-30B via vLLM
- [ ] Hybrid retrieval (vector + BM25 + RRF + reranker)
- [ ] Citation enforcement prompt
- [ ] Confidence scoring
- [ ] Formulation classifier agent
- [ ] IPR router + ABS compliance agents
- [ ] RAGAS evaluation pipeline

### Phase 3: React Native App (Weeks 6-7)
- [ ] Expo SDK 55 + TypeScript project
- [ ] Chat UI (messages, citations, confidence)
- [ ] Jurisdiction toggle + classification wizard
- [ ] Voice I/O (Bhashini ASR + IndicParler TTS)
- [ ] Document scanner + OCR
- [ ] Language selector + escalation

### Phase 4: Knowledge Graph + Multi-Agent (Weeks 8-9)
- [ ] Complete Neo4j population
- [ ] GraphRAG (vector + graph traversal)
- [ ] TKDL pointer module
- [ ] Case law integration
- [ ] LangGraph multi-agent orchestration

### Phase 5: Polish and Production (Weeks 10-12)
- [ ] Deploy Sarvam-105B for production Hindi/Tamil
- [ ] DPDP compliance (consent, audit, encryption)
- [ ] Performance optimization (caching, quantization)
- [ ] User testing with AYUSH practitioners
- [ ] RAGAS benchmarks (target: >0.85 faithfulness)
- [ ] EAS builds (iOS + Android) + web deploy

---

## Quick Reference

### Model Specifications

| Component | Model | Params | Active | Context | License | GPU |
|-----------|-------|--------|--------|---------|---------|-----|
| LLM (Hindi) | Sarvam-105B | 105B | ~10B MoE | 65K | Apache 2.0 | 4xA100 |
| LLM (Legal) | Qwen3-30B-A3B | 30B | 3B MoE | 128K | Apache 2.0 | 1xA100 |
| Embeddings | BGE-M3 | 568M | 568M | 8192 | MIT | shared |
| Reranker | bge-reranker-v2 | 568M | 568M | 8192 | MIT | shared |
| ASR | IndicConformer | 600M | 600M | streaming | MIT | shared |
| TTS | IndicParler-TTS | ~1B | ~1B | - | Apache 2.0 | 1xGPU |
| OCR | Surya OCR 2 | ~300M | ~300M | - | GPL-3.0 | shared |
| VLM | Qwen2.5-VL 7B | 7B | 7B | 32K | Apache 2.0 | 1xGPU |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/chat | POST | Chat to RAG response |
| /ws/voice | WebSocket | Real-time voice I/O |
| /api/classify | POST | Formulation classification |
| /api/ocr | POST | Document image OCR |
| /api/escalate | POST | Request human facilitator |
| /api/audit | GET | Audit trail (admin) |
| /api/user/data | DELETE | DPDP: erase all data |

### The 5 Hackathon Differentiators

1. **Formulation Classifier works LIVE** — describes product, classifies, cites D&C Act
2. **Jurisdiction Toggle is REAL** — India + International answers, visually separated
3. **Citations are CLICKABLE** — [Section 3(p), Patents Act 1970] hyperlinked
4. **ABS Helper catches what people MISS** — "Under Biodiversity Amendment Act 2023, AYUSH practitioners using cultivated plants are exempt"
5. **Safe Abstention** — "This involves Section 3(e) analysis. Recommend IP attorney. [Escalate]"

---

> **Version**: 1.0 | **Date**: August 26, 2026
> **Research Sources**: 10+ web sources, model benchmarks, API documentation
