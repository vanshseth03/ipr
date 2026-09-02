# AYUSH-IPR GUARDIAN — PPT Slide Content
### Smart India Hackathon | Team of 6

---

## SLIDE 1 — Title + Problem Statement

**Title:** AYUSH-IPR GUARDIAN  
**Tagline:** AI-Powered Ayurveda IPR & Regulatory Assistant

**Problem:**
- Ayurveda practitioners lose IPR battles — zero legal tech support exists
- Traditional knowledge gets patented abroad — biopiracy costs India ₹1000s Cr/year
- No tool unifies: Formulation Classification + IPR Advisory + Voice + Legal Citations

**Our Solution:**
- Voice-first multilingual AI (Hindi, Tamil, English)
- Cites exact legal sections — never hallucinates
- Cross-platform: Web + iOS + Android — one codebase
- 100% open-source AI stack, ₹0 licensing

**Team:** 6 Members

---

## SLIDE 2 — Tech Stack (ACTUAL — from codebase)

| Layer | Technology | Role |
|-------|-----------|------|
| **LLM** | Gemma-2-2B-IT (Google) → Qwen-2.5-3B fallback | Legal reasoning & citation generation |
| **Embeddings** | BAAI/BGE-M3 (568M params) | Dense + Sparse hybrid vector encoding |
| **Reranker** | BAAI/bge-reranker-v2-m3 | Cross-encoder precision re-scoring |
| **ASR** | faster-whisper-small | Speech-to-text (Hindi, Tamil, English) |
| **TTS** | OmniVoice (k2-fsa) | Cross-lingual text-to-speech |
| **Vector DB** | FAISS + BM25 (rank_bm25) | Dense + Sparse retrieval with RRF fusion |
| **Backend** | FastAPI + uvicorn | REST + SSE streaming APIs |
| **Frontend (App)** | React Native + Expo SDK 57 | Cross-platform (Web/iOS/Android) |
| **Frontend (Tester)** | Vanilla HTML/CSS/JS | Debug & benchmark studio |
| **GPU** | Kaggle T4×2 (2×16GB VRAM) | Free dual-GPU inference |
| **Tunnel** | localtunnel + cloudflared | HTTPS public URL |

**VRAM Budget:**
- GPU 0: Gemma-2-2B LLM (~4GB) + Whisper ASR (~0.5GB)
- GPU 1: BGE-M3 (~1.2GB) + Reranker (~1.2GB) + OmniVoice TTS (~2.5GB)
- Remaining: ~22GB free for future models

---

## SLIDE 3 — System Architecture

```
USER (Voice / Text / Document Scan)
        │
   ┌────▼──────────┐
   │ React Native   │  Expo SDK 57 — Web + iOS + Android
   │ + Tester UI    │  TypeScript, Zustand, TanStack Query
   └────┬──────────┘
        │ HTTPS / SSE Streaming
   ┌────▼──────────┐
   │ FastAPI Server │  Kaggle T4×2 GPU
   │ (uvicorn)     │  localtunnel + cloudflared
   └────┬──────────┘
        │
  ┌─────┼─────────┬──────────────┐
  │     │         │              │
  ▼     ▼         ▼              ▼
┌────┐ ┌────┐  ┌──────────┐  ┌──────┐
│ASR │ │TTS │  │ RAG      │  │ LLM  │
│    │ │    │  │ Pipeline │  │      │
│Whi-│ │Omni│  │          │  │Gemma │
│sper│ │Voi-│  │BGE-M3    │  │2-2B  │
│Sml │ │ce  │  │→FAISS    │  │ IT   │
│    │ │    │  │+BM25     │  │      │
│GPU1│ │GPU1│  │→RRF      │  │GPU 0 │
│    │ │    │  │→Reranker │  │      │
└────┘ └────┘  └──────────┘  └──┬───┘
                                │
                    ┌───────────▼──────────┐
                    │ Cited Legal Answer   │
                    │ + Confidence Score   │
                    │ + Audio Response     │
                    └─────────────────────┘
```

**Pipeline:** Query → BGE-M3 Embed → FAISS Dense + BM25 Sparse → RRF Fusion (k=60) → Cross-Encoder Rerank → Top-7 Context → Gemma-2-2B → Cited Answer

---

## SLIDE 4 — RAG Database & Data Pipeline

**6,643 UDO Records | 3 Statutory Corpora**

| Corpus | Source File | Content |
|--------|-----------|---------|
| **Patents Act, 1970** | patent act 1970.txt | Sections 1-163 — patentability, §3(p) TK bar, opposition |
| **Patents Rules, 2003** | patents-rules2003.txt | Rules 1-190 — filing, forms, deadlines |
| **D&C Act 1940 + Rules 1945** | 2016DrugsAndCosmetics... | Ch IV-A AYUSH drugs, Schedule T GMP, Rule 161B shelf-life |

**Data Pipeline (build_rag_database.py — Pure Python, zero deps):**
```
Raw .txt statutory files
  → Line-by-line regex parsing
  → Section/Rule boundary detection
  → Hierarchical chunking (section-level, NOT naive token splits)
  → UDO JSON schema: {doc_id, title, content, content_plain, rag_config{}}
  → Per-record metadata: act_name, section_no, chapter, citation_format
  → BGE-M3 embedding (1024-dim dense + sparse BM25 tokens)
  → FAISS IndexFlatIP + BM25Okapi index
  → 6,643 searchable records
```

**Retrieval Pipeline:**
1. **Dense Search** — FAISS cosine similarity (top-40)
2. **Sparse Search** — BM25 keyword match (top-40)
3. **RRF Fusion** — Reciprocal Rank Fusion (k=60)
4. **Cross-Encoder Rerank** — bge-reranker-v2-m3 (top-7)
5. **Context Assembly** — 4000 chars/doc, 7 docs → LLM

---

## SLIDE 5 — App Features & UI

**Cross-Platform — React Native + Expo SDK 57**

| Feature | Implementation |
|---------|---------------|
| 💬 **RAG Chat** | Streaming SSE responses, markdown rendering, citation extraction |
| 🎙️ **Voice Input** | faster-whisper ASR → Hindi/Tamil/English transcription |
| 🔊 **Voice Output** | OmniVoice TTS — cross-lingual speech synthesis |
| 📋 **Formulation Classifier** | /api/classify — ingredients → regulatory pathway |
| 📜 **Legal Citations** | Auto-extracted [Section X, Act Y] from every response |
| 🟢🟡🔴 **Confidence Score** | HIGH / MEDIUM / LOW based on retrieval + citation quality |
| ⚠️ **Safe Abstention** | "Insufficient info → consult IP attorney" + escalation |
| 🧪 **Testing Studio** | Full debug UI — VRAM telemetry, latency metrics, source explorer |

**Frontend Stack:**
- React Native 0.86 + Expo SDK 57 (New Architecture — Fabric + TurboModules)
- TypeScript, Zustand state, TanStack Query v5, Lucide icons
- expo-camera, expo-speech, expo-image-picker, react-native-reanimated
- Tester: Vanilla HTML/CSS/JS — Feather icons, JetBrains Mono, marked.js

---

## SLIDE 6 — Benchmarks, Impact & Team

**Performance (Auto-Test Suite — 5 core prompts)**

| Test Case | Expected | Result |
|-----------|----------|--------|
| Ashwagandha patentability | Section 3(p) | ✓ Citation found |
| Spurious AYUSH drug | Section 33EEA | ✓ Citation found |
| Churna shelf life | Rule 161B | ✓ Citation found |
| Bhasma GMP requirements | Schedule T | ✓ Citation found |
| First Schedule books | First Schedule | ✓ Citation found |

**System Metrics:**
- 6,643 RAG records indexed (FAISS + BM25)
- Hybrid retrieval: Dense + Sparse + RRF + Cross-Encoder
- Streaming responses via SSE (real-time token output)
- Dual-GPU placement (GPU 0: LLM, GPU 1: Embeddings + ASR + TTS)

**Impact:**
- AYUSH practitioners get instant, cited IPR guidance
- Prevents biopiracy of traditional formulations
- Voice-first — accessible to non-English speakers
- 100% open-source — zero licensing cost

**Team (6 Members):**

| # | Role |
|---|------|
| 1 | ML/AI — LLM integration, RAG pipeline, benchmarking |
| 2 | Backend — FastAPI, Kaggle deployment, GPU management |
| 3 | Frontend — React Native app, Expo, UI/UX |
| 4 | Data — Statutory parsing, chunking, RAG database |
| 5 | Speech — ASR (Whisper), TTS (OmniVoice), multilingual |
| 6 | Research — Legal domain expertise, test cases, evaluation |
