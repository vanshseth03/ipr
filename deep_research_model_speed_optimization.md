# Deep Research: Model Speed & Quality Optimization for AYUSH-IPR RAG
**Date:** August 29, 2026  
**Hardware:** Kaggle Dual Tesla T4 (2 × 16GB VRAM = 32GB)  
**Use Case:** Legal RAG for Indian Patent Law / D&C Act — SIH Hackathon Demo

---

## 1. Root Cause Analysis: Why Qwen2.5-7B Was Slow

### The Bottleneck
99% of per-query latency was in LLM token generation, NOT retrieval:
- **FAISS + Cross-Encoder reranking:** ~180ms (0.5% of time)
- **LLM token generation:** ~35-65s (99.5% of time)

### Why bitsandbytes 4-bit is slow for inference
1. **Training-focused kernels:** bitsandbytes (BnB) was designed for QLoRA fine-tuning, NOT production inference. Its dequantization happens at compute time with generic CUDA kernels.
2. **No KV-cache optimization:** HuggingFace `transformers.generate()` uses sequential token generation without PagedAttention or KV-cache paging.
3. **No continuous batching:** Each request is processed sequentially without the optimizations that vLLM/SGLang provide.
4. **T4 hardware limitation:** Tesla T4 has only ~320 GB/s memory bandwidth and compute capability 7.5 (no FlashAttention 2, no bfloat16, no FP8).

---

## 2. AWQ vs BitsAndBytes: Why AWQ Wins for Inference

| Feature | AWQ (Activation-Aware Weight Quantization) | bitsandbytes (NF4) |
|:---|:---|:---|
| **Design goal** | Fast inference | Memory-efficient training |
| **Quantization time** | Pre-computed (offline) | Runtime (on load) |
| **CUDA kernels** | Inference-optimized | Generic |
| **Speed on T4** | ~15-25 tok/s (standalone), ~35-45 tok/s (vLLM) | ~10-15 tok/s |
| **vLLM support** | ✅ Native | ❌ Not supported |
| **Quality loss** | Minimal (calibration-aware) | Minimal (normal form) |
| **HuggingFace model** | `Qwen/Qwen2.5-7B-Instruct-AWQ` | `Qwen/Qwen2.5-7B-Instruct` + config |

**Key insight:** AWQ pre-quantizes weights offline using calibration data, so the model ships with optimized 4-bit weights. bitsandbytes quantizes at load time without calibration, resulting in suboptimal weight selection.

---

## 3. vLLM vs HuggingFace Transformers on T4

| Feature | vLLM | HF Transformers |
|:---|:---|:---|
| **Throughput** | 2-4× higher | Baseline |
| **Memory management** | PagedAttention (KV-cache paging) | Linear allocation (fragmentation) |
| **Batching** | Continuous batching | Sequential |
| **AWQ support** | Native (optimized kernels) | Via AutoAWQ library |
| **T4 compatibility** | ✅ with `enforce_eager=True`, `dtype="float16"` | ✅ Always works |
| **Installation** | Complex on Kaggle (may need pre-built wheels) | Always available |

### vLLM on Kaggle T4 — Configuration

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="Qwen/Qwen2.5-7B-Instruct-AWQ",
    dtype="float16",              # MANDATORY for T4 (no bfloat16 support)
    gpu_memory_utilization=0.80,  # Leave 20% for KV-cache overhead
    enforce_eager=True,           # T4 CUDA graph compilation is unreliable
    max_model_len=4096,           # Cap context to save KV-cache VRAM
    quantization="awq",
    trust_remote_code=True,
    tensor_parallel_size=1,       # Single GPU for LLM
)
```

### Important T4 Gotchas
- **FlashAttention 2** does NOT work on T4 (Turing, compute 7.5). Need Ampere+ (8.0+).
- **bfloat16** NOT supported. Always use `float16`.
- **CUDA graphs** unreliable. Always set `enforce_eager=True`.
- **vLLM install** may fail via standard pip. May need pre-compiled wheels from Kaggle datasets.

---

## 4. BM25 Hybrid Retrieval — Why It Matters for Legal RAG

### Problem
Dense embeddings (BGE-M3) capture semantic meaning but miss exact legal terms:
- Query: "Section 3(p) of Patents Act" → Dense search returns generic "What are not inventions" (low score 0.03)
- Query: "Vatsanabha" → Dense search returns unrelated Schedule T docs

### Solution: Hybrid Dense + Sparse with RRF

**Reciprocal Rank Fusion (RRF):**
```
RRF_score(doc) = Σ 1/(k + rank_i(doc))
```
Where `k=60` (standard constant) and `rank_i` is the document's rank in retriever i.

RRF is preferred over weighted score summation because:
1. Rank-based (not score-based) → immune to scale differences between BM25 and cosine similarity
2. No hyperparameter tuning needed for score normalization
3. Handles documents that appear in only one retriever gracefully

### Expected Impact on Weak Queries

| Query | Old Reranker Score | Expected Improvement |
|:---|:---|:---|
| Q1: Traditional Knowledge (Ashwagandha) | 0.0324 | BM25 catches "Charaka Samhita", "traditional knowledge" |
| Q2: Enhanced Efficacy (Section 3(d)) | 0.3484 | BM25 boosts exact "Section 3(d)" match |
| Q3: Trikatu Admixture (Section 3(e)) | 0.0529 | BM25 catches "admixture", "synergistic" |
| Q4: Hydroponic Cultivation (Section 3(h)) | 0.0975 | BM25 catches "agriculture", "horticulture" |
| Q5: Panchakarma (Section 3(i)) | 0.0618 | BM25 catches "medical treatment", "curative" |

---

## 5. SIH Demo Optimization Strategy

### What SIH Judges Look For
1. **Problem Understanding** — Deep domain expertise in AYUSH-IPR law
2. **Novelty & Innovation** — Hybrid RAG with statutory precision (not generic chatbot)
3. **Technical Depth** — Architecture diagram showing Dense+BM25+RRF+CrossEncoder pipeline
4. **Performance** — Response time matters! Target < 15s for live demo
5. **Accuracy** — Citations must be verifiable. Hallucinated section numbers = instant credibility loss

### Demo Tips
- If a query takes time, explain: "The system is cross-referencing retrieved statutory provisions with the Patents Act, 1970..."
- Show the retrieval pipeline visualization (FAISS + BM25 → RRF → Cross-Encoder → LLM)
- Highlight the hybrid retrieval as a **differentiator** — most competitors use dense-only search
- Demonstrate bilingual capability (Hindi transliteration)

---

## 6. Alternative Models Considered (Kept 7B per user directive)

| Model | Params | T4 Speed (AWQ) | Legal Quality | Decision |
|:---|:---|:---|:---|:---|
| **Qwen2.5-7B-Instruct-AWQ** | 7B | ~35-45 tok/s (vLLM) | ⭐⭐⭐⭐⭐ Best | ✅ Selected |
| Qwen3-4B-Instruct | 4B | ~50-70 tok/s | ⭐⭐⭐⭐ Good (thinking mode) | Backup option |
| Phi-4-mini | 3.8B | ~60-80 tok/s | ⭐⭐⭐ Good (reasoning) | Too small for legal depth |
| Gemma-4-E4B | 4B | ~50-65 tok/s | ⭐⭐⭐ Good | Multimodal overkill |
| Qwen2.5-3B-Instruct | 3B | ~80-100 tok/s | ⭐⭐⭐ Acceptable | Emergency fallback |

---

## 7. Final Architecture (Post-Optimization)

```
GPU 0 (16GB):
├── Qwen2.5-7B-Instruct-AWQ (~5GB) via vLLM engine
└── faster-whisper-small (~0.5GB)

GPU 1 (16GB):
├── BGE-M3 embeddings (~1.2GB)
├── bge-reranker-v2-m3 cross-encoder (~2.3GB)
├── FAISS index (in CPU RAM, queries on GPU)
└── BM25 index (CPU RAM only)

Pipeline: Query → [Dense(FAISS) + Sparse(BM25)] → RRF Fusion → CrossEncoder Rerank → vLLM Generate → Citation Extract
```
