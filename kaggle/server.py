"""
AYUSH-IPR GUARDIAN — Kaggle RAG Server
=======================================
Run on Kaggle with T4 x2 GPU (2 × 16GB VRAM).

Wires:
  - LLM: Qwen3-30B-A3B (4-bit) → fallback Qwen2.5-7B → fallback Qwen3-4B
  - Embeddings: BGE-M3 (568M, dense+sparse)
  - Reranker: bge-reranker-v2-m3
  - ASR: faster-whisper-small
  - RAG DB: 362 UDO records (Patents Act + Patents Rules + D&C Act/Rules)
  - Tunnel: localtunnel (HTTPS public URL)

VRAM Budget (T4 x2 = 32GB):
  GPU 0: LLM (4-8GB) + Whisper (0.5GB)
  GPU 1: BGE-M3 (1.2GB) + Reranker (1.2GB)
  Remaining: ~20GB for future TTS/VLM models

Reference: gemma+omnivoice/kaggle/server.py pattern
"""

# ============================================================
# CELL 1: INSTALL DEPENDENCIES
# ============================================================
import subprocess, sys, os, time

def install(packages):
    for p in packages:
        print(f"  Installing {p}...", flush=True)
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", p],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("=" * 60)
print("  AYUSH-IPR GUARDIAN — Installing dependencies")
print("=" * 60, flush=True)

install([
    "transformers>=4.51.0",    # Gemma 2 2B supported by released transformers
    "accelerate",
    "sentence-transformers",  # BGE-M3 embeddings + reranker
    "faiss-cpu",              # Vector search
    "rank-bm25",              # BM25 sparse retrieval
    "faster-whisper",         # ASR
    "omnivoice",              # TTS — cross-lingual speech synthesis
    "soundfile",              # WAV I/O for TTS
    "fastapi",
    "uvicorn",
    "nest-asyncio",
    "python-multipart",
    "pydantic",
    "hf_transfer",
    "torch",
])

# Enable fast HF downloads
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
os.environ["HF_HUB_DOWNLOAD_TIMEOUT"] = "120"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# HuggingFace authentication (Gemma is a gated model)
HF_TOKEN = os.environ.get("HF_TOKEN", os.environ.get("HUGGING_FACE_HUB_TOKEN", ""))
if not HF_TOKEN:
    try:
        from kaggle_secrets import UserSecretsClient
        user_secrets = UserSecretsClient()
        HF_TOKEN = user_secrets.get_secret("HF_TOKEN")
    except Exception:
        pass

if HF_TOKEN:
    try:
        from huggingface_hub import login
        login(token=HF_TOKEN, add_to_git_credential=False)
        print("✓ Logged into HuggingFace Hub with HF_TOKEN", flush=True)
    except Exception as e:
        print(f"HF login warning: {e}", flush=True)
else:
    print("ℹ No HF_TOKEN detected — ungated model fallbacks will be used if needed", flush=True)

# Install localtunnel
os.system("npm install -g localtunnel 2>/dev/null || true")

# Install ffmpeg for audio
os.system("apt-get update -qq && apt-get install -y ffmpeg >/dev/null 2>&1 || true")

print("✓ All dependencies installed", flush=True)

# ============================================================
# CELL 2: IMPORTS
# ============================================================
import torch
import numpy as np
import json
import re
import threading
import tempfile
import hashlib
import io
import queue
from datetime import datetime
from typing import Optional, List, Dict
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import nest_asyncio

print("✓ All imports successful", flush=True)

# ============================================================
# CELL 3: VRAM MONITOR
# ============================================================

def vram_report(label=""):
    """Print detailed VRAM usage for all GPUs."""
    if not torch.cuda.is_available():
        print(f"  [{label}] No CUDA available — running on CPU", flush=True)
        return {}
    report = {}
    for i in range(torch.cuda.device_count()):
        alloc = torch.cuda.memory_allocated(i) / 1e9
        reserved = torch.cuda.memory_reserved(i) / 1e9
        total = torch.cuda.get_device_properties(i).total_memory / 1e9
        free = total - alloc
        report[i] = {"allocated": alloc, "reserved": reserved, "total": total, "free": free}
        print(f"  [{label}] GPU {i} ({torch.cuda.get_device_name(i)}): "
              f"{alloc:.2f}GB alloc / {free:.2f}GB free / {total:.1f}GB total", flush=True)
    return report


def vram_free(gpu_id=0):
    """Return free VRAM in GB for a given GPU."""
    if not torch.cuda.is_available():
        return 0
    total = torch.cuda.get_device_properties(gpu_id).total_memory / 1e9
    alloc = torch.cuda.memory_allocated(gpu_id) / 1e9
    return total - alloc


# Enable PyTorch expandable segments to avoid memory fragmentation
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"


def cleanup_gpu(gpu_id=None):
    """Force cleanup GPU memory thoroughly."""
    import gc
    gc.collect()
    if torch.cuda.is_available():
        if gpu_id is not None:
            with torch.cuda.device(gpu_id):
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()
        else:
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()


# ============================================================
# CELL 4: RAG DATABASE LOADER
# ============================================================

class RAGDatabase:
    """Loads UDO JSON records and builds a FAISS vector index + BM25 sparse index."""

    def __init__(self):
        self.records = []
        self.embeddings = None
        self.index = None
        self.embed_model = None
        self.reranker = None
        self.bm25 = None            # BM25 sparse retriever
        self.bm25_corpus = None     # Tokenized corpus for BM25
        self.loaded = False

    def load_database(self, json_path: str):
        """Load UDO records from JSON file."""
        print(f"  Loading RAG database from: {json_path}", flush=True)
        with open(json_path, 'r', encoding='utf-8') as f:
            self.records = json.load(f)
        print(f"  ✓ Loaded {len(self.records)} UDO records", flush=True)

    def load_embeddings_model(self, device="cuda:1"):
        """Load BGE-M3 embedding model."""
        print(f"  Loading BGE-M3 embeddings on {device}...", flush=True)
        vram_report("pre-BGE-M3")

        from sentence_transformers import SentenceTransformer
        self.embed_model = SentenceTransformer(
            "BAAI/bge-m3",
            device=device,
            model_kwargs={"torch_dtype": torch.float16}
        )
        print(f"  ✓ BGE-M3 loaded", flush=True)
        vram_report("post-BGE-M3")

    def load_reranker(self, device="cuda:1"):
        """Load bge-reranker-v2-m3 cross-encoder."""
        print(f"  Loading bge-reranker-v2-m3 on {device}...", flush=True)
        vram_report("pre-reranker")

        from sentence_transformers import CrossEncoder
        self.reranker = CrossEncoder(
            "BAAI/bge-reranker-v2-m3",
            device=device,
            max_length=512,
        )
        print(f"  ✓ Reranker loaded", flush=True)
        vram_report("post-reranker")

    def build_index(self):
        """Embed all records and build FAISS vector index + BM25 sparse index."""
        import faiss
        from rank_bm25 import BM25Okapi

        print(f"  Building FAISS + BM25 hybrid index for {len(self.records)} records...", flush=True)

        # Prepare texts for embedding
        texts = []
        tokenized_corpus = []
        for r in self.records:
            # Combine title + content for richer embedding
            text = f"{r['title']}\n{r.get('content_plain', r.get('content', ''))}"
            # Truncate to ~750 tokens worth (~3000 chars) — BGE-M3 supports 8192 tokens
            texts.append(text[:3000])
            # Tokenize for BM25 (lowercase, split on whitespace + punctuation)
            tokens = re.findall(r'\w+', text[:3000].lower())
            tokenized_corpus.append(tokens)

        # --- Dense: FAISS ---
        # Batch encode
        self.embeddings = self.embed_model.encode(
            texts,
            batch_size=32,
            show_progress_bar=True,
            normalize_embeddings=True,
        )

        # Build FAISS index (inner product for normalized vectors = cosine)
        dim = self.embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(self.embeddings.astype(np.float32))

        # --- Sparse: BM25 ---
        self.bm25 = BM25Okapi(tokenized_corpus)
        self.bm25_corpus = tokenized_corpus

        self.loaded = True
        print(f"  ✓ Hybrid index built: {self.index.ntotal} vectors (dim={dim}) + BM25 ({len(tokenized_corpus)} docs)", flush=True)

    def search_dense(self, query: str, top_k: int = 20) -> List[Dict]:
        """Search for relevant records using dense vector similarity."""
        if not self.loaded or self.index is None:
            return []

        # Encode query
        q_emb = self.embed_model.encode(
            [query],
            normalize_embeddings=True,
        ).astype(np.float32)

        # FAISS search
        scores, indices = self.index.search(q_emb, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.records):
                record = self.records[idx].copy()
                record["similarity_score"] = float(score)
                record["_idx"] = int(idx)  # Track original index for RRF
                results.append(record)

        return results

    def search_sparse(self, query: str, top_k: int = 20) -> List[Dict]:
        """Search for relevant records using BM25 keyword matching."""
        if not self.loaded or self.bm25 is None:
            return []

        query_tokens = re.findall(r'\w+', query.lower())
        bm25_scores = self.bm25.get_scores(query_tokens)

        # Get top-k indices by BM25 score
        top_indices = np.argsort(bm25_scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            if bm25_scores[idx] > 0 and idx < len(self.records):
                record = self.records[idx].copy()
                record["bm25_score"] = float(bm25_scores[idx])
                record["_idx"] = int(idx)
                results.append(record)

        return results

    def search(self, query: str, top_k: int = 25) -> List[Dict]:
        """Hybrid search: Dense (FAISS) + Sparse (BM25) with Reciprocal Rank Fusion."""
        if not self.loaded:
            return []

        # Get results from both retrievers
        dense_results = self.search_dense(query, top_k=top_k)
        sparse_results = self.search_sparse(query, top_k=top_k)

        # --- Reciprocal Rank Fusion (RRF) ---
        k = 60  # RRF constant
        rrf_scores = {}  # idx -> cumulative RRF score
        idx_to_record = {}  # idx -> record dict

        for rank, r in enumerate(dense_results):
            idx = r["_idx"]
            rrf_scores[idx] = rrf_scores.get(idx, 0) + 1.0 / (k + rank + 1)
            idx_to_record[idx] = r

        for rank, r in enumerate(sparse_results):
            idx = r["_idx"]
            rrf_scores[idx] = rrf_scores.get(idx, 0) + 1.0 / (k + rank + 1)
            if idx not in idx_to_record:
                idx_to_record[idx] = r

        # Sort by RRF score (descending) and return top results
        sorted_indices = sorted(rrf_scores.keys(), key=lambda i: rrf_scores[i], reverse=True)

        results = []
        for idx in sorted_indices[:top_k]:
            record = idx_to_record[idx]
            record["rrf_score"] = rrf_scores[idx]
            record["similarity_score"] = record.get("similarity_score", 0)
            results.append(record)

        return results

    def rerank(self, query: str, results: List[Dict], top_k: int = 7) -> List[Dict]:
        """Rerank results using cross-encoder. Expanded from top-5 to top-7 for better coverage."""
        if not self.reranker or not results:
            return results[:top_k]

        # Prepare pairs for cross-encoder
        pairs = []
        for r in results:
            text = f"{r['title']}\n{r.get('content_plain', r.get('content', ''))}"
            pairs.append([query, text[:3000]])

        # Score
        scores = self.reranker.predict(pairs)

        # Attach scores and sort
        for i, r in enumerate(results):
            r["rerank_score"] = float(scores[i])
        results.sort(key=lambda x: x["rerank_score"], reverse=True)

        return results[:top_k]

    def hybrid_search(self, query: str, top_k: int = 7) -> List[Dict]:
        """Full hybrid search: Dense+Sparse(RRF) retrieval → cross-encoder reranking → top-k."""
        # Step 1: Hybrid search with RRF (top-40 candidates from FAISS + BM25 for better coverage)
        candidates = self.search(query, top_k=40)

        # Step 2: Rerank with cross-encoder (top-7 for broader statutory coverage)
        reranked = self.rerank(query, candidates, top_k=top_k)

        return reranked

    def cleanup(self):
        """Release all GPU memory."""
        print("  Cleaning up RAG models...", flush=True)
        if self.embed_model is not None:
            del self.embed_model
            self.embed_model = None
        if self.reranker is not None:
            del self.reranker
            self.reranker = None
        cleanup_gpu()
        print("  ✓ RAG models cleaned up", flush=True)


# ============================================================
# CELL 5: LLM MANAGER — GEMMA 2 2B-IT (FLOAT16, FAST)
# ============================================================

class LLMManager:
    """Manages LLM loading in float16 on GPU 0 with multi-tiered fallback:
    1. Local pre-cached Gemma 2 2B (/kaggle/input/...)
    2. Hugging Face Hub Gemma 2 2B-IT (if gated access/token available)
    3. Qwen 2.5 3B-Instruct (100% ungated, top-tier legal reasoning, 32k context)
    4. Qwen 2.5 1.5B-Instruct (100% ungated fast fallback)
    """

    KAGGLE_MODEL_PATH = "/kaggle/input/gemma-2/transformers/gemma-2-2b-it/1"

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_name = None
        self.model_id = None
        self.engine_type = "fp16"
        self.device = "cuda:0"
        self.loaded = False

    def load(self, device="cuda:0"):
        """Load LLM in float16 with robust multi-tiered fallback."""
        from transformers import AutoTokenizer, AutoModelForCausalLM

        self.device = device
        gpu_idx = int(device.split(":")[-1]) if ":" in device else 0
        free = vram_free(gpu_idx)
        print(f"\n  LLM Loading — Available VRAM on {device}: {free:.1f}GB", flush=True)

        # Build prioritized list of model candidates to try
        candidates = []

        # 1. Kaggle pre-cached path
        if os.path.isdir(self.KAGGLE_MODEL_PATH):
            candidates.append(("Gemma-2-2B-IT (Kaggle Pre-cached)", self.KAGGLE_MODEL_PATH, False))

        # 2. Any auto-discovered model in /kaggle/input
        if os.path.exists("/kaggle/input"):
            for root, dirs, files in os.walk("/kaggle/input"):
                if "config.json" in files:
                    if "gemma" in root.lower():
                        candidates.append(("Gemma (Auto-discovered)", root, False))
                        break
                    elif "qwen" in root.lower():
                        candidates.append(("Qwen (Auto-discovered)", root, False))
                        break

        # 3. Gemma 2 2B from HF Hub (if token available or tried first)
        candidates.append(("Gemma-2-2B-IT (HF Hub)", "google/gemma-2-2b-it", True))

        # 4. Qwen 2.5 3B-Instruct (UNGATED, top-tier quality, fast)
        candidates.append(("Qwen-2.5-3B-Instruct (Ungated)", "Qwen/Qwen2.5-3B-Instruct", False))

        # 5. Qwen 2.5 1.5B-Instruct (UNGATED compact fallback)
        candidates.append(("Qwen-2.5-1.5B-Instruct (Ungated Fallback)", "Qwen/Qwen2.5-1.5B-Instruct", False))

        for display_name, model_path, is_gated in candidates:
            print(f"\n  → Attempting to load: {display_name} [{model_path}]...", flush=True)
            load_kwargs = {"trust_remote_code": True}
            if is_gated and HF_TOKEN:
                load_kwargs["token"] = HF_TOKEN

            try:
                vram_report(f"pre-{display_name[:10]}")
                self.tokenizer = AutoTokenizer.from_pretrained(model_path, **load_kwargs)

                # Ensure pad_token is defined
                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token

                self.model = AutoModelForCausalLM.from_pretrained(
                    model_path,
                    device_map={"": device},
                    torch_dtype=torch.float16,
                    attn_implementation="sdpa",
                    **load_kwargs,
                )
                self.model.eval()

                # Attempt torch.compile acceleration
                try:
                    print(f"  Compiling {display_name} with torch.compile...", flush=True)
                    self.model = torch.compile(self.model, mode="reduce-overhead")
                    print(f"  ✓ {display_name} compiled successfully!", flush=True)
                except Exception as comp_err:
                    print(f"  Note: torch.compile skipped ({comp_err})", flush=True)

                self.model_name = display_name
                self.model_id = model_path
                self.engine_type = "fp16-sdpa"
                self.loaded = True
                print(f"  ✓ SUCCESS: {display_name} loaded on {device}!", flush=True)
                vram_report("post-llm")
                return True

            except Exception as e:
                print(f"  ✗ Failed to load {display_name}: {e}", flush=True)
                if self.model is not None:
                    del self.model
                    self.model = None
                if self.tokenizer is not None:
                    del self.tokenizer
                    self.tokenizer = None
                cleanup_gpu(gpu_idx)
                continue

        print("  ✗ FATAL: All LLM candidates failed to load.", flush=True)
        return False

    def prepare_inputs(self, system_prompt: str, user_message: str):
        """Prepare chat template token inputs according to model family."""
        if not self.loaded or self.tokenizer is None:
            return None

        # Gemma format (merged context in user message) vs standard system/user format (Qwen/Llama)
        if "gemma" in str(self.model_name).lower() or "gemma" in str(self.model_id).lower():
            combined = f"[CONTEXT]\n{system_prompt}\n[/CONTEXT]\n\n{user_message}"
            messages = [{"role": "user", "content": combined}]
        else:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ]

        inputs = self.tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_tensors="pt",
            return_dict=True,
        ).to(self.model.device)

        return inputs

    def generate(self, system_prompt: str, user_message: str, max_tokens: int = 1024) -> str:
        """Generate response with loaded LLM."""
        if not self.loaded:
            return "Error: LLM not loaded."

        inputs = self.prepare_inputs(system_prompt, user_message)
        input_len = inputs["input_ids"].shape[1]

        with torch.inference_mode():
            output = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=0.3,
                top_p=0.92,
                repetition_penalty=1.15,
                do_sample=True,
                use_cache=True,
            )

        response = self.tokenizer.decode(
            output[0][input_len:], skip_special_tokens=True
        )
        return response.strip()

    def cleanup(self):
        """Release LLM from GPU."""
        print("  Cleaning up LLM...", flush=True)
        if self.model is not None:
            del self.model
            self.model = None
        if self.tokenizer is not None:
            del self.tokenizer
            self.tokenizer = None
        cleanup_gpu()
        self.loaded = False
        print("  ✓ LLM cleaned up", flush=True)


# ============================================================
# CELL 6: ASR MANAGER
# ============================================================

class ASRManager:
    """Manages faster-whisper for speech-to-text."""

    def __init__(self):
        self.whisper = None
        self.loaded = False

    def load(self, device="cuda:0"):
        """Load faster-whisper-small."""
        print(f"  Loading faster-whisper-small on {device}...", flush=True)
        vram_report("pre-whisper")

        from faster_whisper import WhisperModel
        compute_type = "float16" if "cuda" in device else "int8"
        self.whisper = WhisperModel(
            "small",
            device=device.split(":")[0],  # "cuda" not "cuda:0"
            device_index=int(device.split(":")[-1]) if ":" in device else 0,
            compute_type=compute_type,
        )
        self.loaded = True
        print(f"  ✓ Whisper loaded", flush=True)
        vram_report("post-whisper")

    def transcribe(self, audio_bytes: bytes, language: str = None) -> dict:
        """Transcribe audio. Returns {text, language, duration}."""
        if not self.loaded:
            return {"text": "", "language": "unknown", "error": "ASR not loaded"}

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name

        try:
            segments, info = self.whisper.transcribe(
                tmp_path,
                language=language,
                beam_size=5,
                vad_filter=True,
            )
            full_text = " ".join(seg.text.strip() for seg in segments)
            return {
                "text": full_text,
                "language": info.language,
                "language_probability": round(info.language_probability, 3),
                "duration": round(info.duration, 2),
            }
        finally:
            os.unlink(tmp_path)

    def cleanup(self):
        """Release Whisper from GPU."""
        print("  Cleaning up Whisper...", flush=True)
        if self.whisper is not None:
            del self.whisper
            self.whisper = None
        cleanup_gpu()
        self.loaded = False
        print("  ✓ Whisper cleaned up", flush=True)


# ============================================================
# CELL 6B: OMNIVOICE TTS MANAGER
# ============================================================

class OmniVoiceTTSManager:
    """Manages k2-fsa/OmniVoice for text-to-speech.
    ~2.5GB VRAM, cross-lingual (Hindi+English), ~2s latency.
    Adapted from gemma+omnivoice reference project.
    """

    def __init__(self):
        self.model = None
        self.loaded = False
        self.device = "cuda:0"
        self.nfe_steps = 16           # Sweet spot for speed vs quality
        self.generation_speed = 1.0
        self.cfg_strength = 2.0
        self.t_shift = 0.1
        self.instruct = "female, young adult, moderate pitch, Indian accent"

    def load(self, device="cuda:0"):
        """Load OmniVoice model."""
        from omnivoice import OmniVoice as OVModel
        import wave

        self.device = device
        gpu_idx = int(device.split(":")[-1]) if ":" in device else 0
        print(f"  Loading OmniVoice TTS on {device}...", flush=True)
        vram_report("pre-omnivoice")

        # Download model files with wget (bypasses HF library hang on Kaggle)
        ov_dir = "/kaggle/working/omnivoice_model"
        ov_audio_dir = os.path.join(ov_dir, "audio_tokenizer")
        os.makedirs(ov_audio_dir, exist_ok=True)

        HF_BASE = "https://huggingface.co/k2-fsa/OmniVoice/resolve/main"
        files_to_download = [
            ("config.json", ov_dir),
            ("model.safetensors", ov_dir),
            ("tokenizer.json", ov_dir),
            ("tokenizer_config.json", ov_dir),
            ("chat_template.jinja", ov_dir),
            ("audio_tokenizer/config.json", ov_audio_dir),
            ("audio_tokenizer/model.safetensors", ov_audio_dir),
            ("audio_tokenizer/preprocessor_config.json", ov_audio_dir),
        ]

        hf_header = f"Authorization: Bearer {HF_TOKEN}" if HF_TOKEN else ""
        for fname, dest_dir in files_to_download:
            basename = fname.split("/")[-1]
            dest_path = os.path.join(dest_dir, basename)
            if os.path.exists(dest_path):
                print(f"    [cached] {fname}", flush=True)
                continue
            url = f"{HF_BASE}/{fname}"
            print(f"    [downloading] {fname}...", flush=True)
            header_arg = f'--header="{hf_header}"' if hf_header else ""
            ret = os.system(f'wget -q --timeout=60 --tries=3 {header_arg} -O "{dest_path}" "{url}"')
            if ret != 0:
                os.system(f'wget --timeout=60 --tries=3 {header_arg} -O "{dest_path}" "{url}"')

        # Heartbeat during model load
        _done = threading.Event()
        t_start = time.time()
        def _heartbeat():
            while not _done.is_set():
                _done.wait(15)
                if not _done.is_set():
                    elapsed = time.time() - t_start
                    print(f"    ... OmniVoice loading ({elapsed:.0f}s)", flush=True)
        hb = threading.Thread(target=_heartbeat, daemon=True)
        hb.start()

        try:
            self.model = OVModel.from_pretrained(
                ov_dir,
                device_map=device,
                dtype=torch.float16
            )
            # Try torch.compile for kernel fusion speedup
            try:
                self.model = torch.compile(self.model, mode="reduce-overhead")
                print("    OmniVoice: torch.compile applied", flush=True)
            except Exception as comp_e:
                print(f"    OmniVoice: torch.compile skipped ({comp_e})", flush=True)

            self.loaded = True
            elapsed = time.time() - t_start
            print(f"  OmniVoice loaded in {elapsed:.1f}s", flush=True)
            vram_report("post-omnivoice")

            # Warm-up pass to trigger CUDA kernel compilation
            try:
                from omnivoice import OmniVoiceGenerationConfig
                warmup_config = OmniVoiceGenerationConfig(
                    num_step=8, guidance_scale=1.0,
                    denoise=False, preprocess_prompt=False, postprocess_output=False,
                )
                with torch.inference_mode():
                    _ = self.model.generate(text="Hello.", generation_config=warmup_config)
                print("    OmniVoice warm-up done", flush=True)
            except Exception as e:
                print(f"    OmniVoice warm-up skipped: {e}", flush=True)

            return True
        except Exception as e:
            print(f"  OmniVoice FAILED: {e}", flush=True)
            import traceback
            traceback.print_exc()
            self.model = None
            self.loaded = False
            cleanup_gpu(gpu_idx)
            return False
        finally:
            _done.set()
            hb.join(timeout=2)

    @torch.inference_mode()
    def synthesize(self, text: str) -> bytes:
        """Convert text to speech. Returns WAV bytes."""
        import wave as _wave
        from omnivoice import OmniVoiceGenerationConfig

        if not self.loaded or not self.model:
            raise RuntimeError("OmniVoice not loaded")

        gen_config = OmniVoiceGenerationConfig(
            num_step=self.nfe_steps,
            guidance_scale=self.cfg_strength,
            t_shift=self.t_shift,
            denoise=True,
            preprocess_prompt=True,
            postprocess_output=True,
        )

        audio_result = self.model.generate(
            text=text,
            generation_config=gen_config,
            speed=self.generation_speed,
        )

        # Convert to numpy
        if isinstance(audio_result, torch.Tensor):
            audio_np = audio_result.detach().cpu().float().numpy()
        elif isinstance(audio_result, np.ndarray):
            audio_np = audio_result
        else:
            audio_np = np.array(audio_result, dtype=np.float32)

        if audio_np.ndim > 1:
            audio_np = audio_np.squeeze()
        if audio_np.ndim > 1:
            audio_np = audio_np[0]

        # Get sample rate
        try:
            sr = self.model.sampling_rate
        except AttributeError:
            sr = 24000

        # Float [-1,1] -> int16 WAV
        audio_int16 = np.clip(audio_np, -1.0, 1.0)
        audio_int16 = (audio_int16 * 32767).astype(np.int16)
        buf = io.BytesIO()
        with _wave.open(buf, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sr)
            wf.writeframes(audio_int16.tobytes())
        buf.seek(0)
        return buf.read()

    def cleanup(self):
        """Release OmniVoice from GPU."""
        print("  Cleaning up OmniVoice...", flush=True)
        if self.model is not None:
            del self.model
            self.model = None
        cleanup_gpu()
        self.loaded = False
        print("  OmniVoice cleaned up", flush=True)



# ============================================================
# CELL 7: RAG PIPELINE (WIRES EVERYTHING)
# ============================================================

# System prompt — enforces citations, comprehensive answers, and Latin-script Hindi
SYSTEM_PROMPT = """You are AYUSH-IPR GUARDIAN, an expert AI-powered Ayurveda IPR and Regulatory Assistant specialized in Indian Patent Law (Patents Act, 1970), Patent Rules (2003, as amended 2024), and the Drugs & Cosmetics Act, 1940 (Chapter IV-A for AYUSH drugs).

CORE IDENTITY:
You are a thorough, knowledgeable legal research assistant. Your goal is to provide COMPREHENSIVE, DETAILED, and WELL-STRUCTURED answers that fully address the user's question. Think of yourself as a senior IP attorney drafting a legal opinion memo.

STRICT RULES:
1. ONLY use information from the provided CONTEXT documents below. Do NOT hallucinate or invent section numbers.
2. EVERY legal claim MUST cite the exact source: [Section X, Act Name, Year] or [Rule X, Rules Name, Year].
3. If the CONTEXT does not contain sufficient information, say: "I do not have sufficient information to answer this. Please consult a registered IP attorney."
4. ALWAYS end your response with: "Disclaimer: This is information, not legal advice. For specific cases, consult a registered IP attorney."
5. When asked about patentability of traditional formulations, systematically check:
   - Section 3(p): Traditional knowledge bar
   - Section 3(d): Known substance / efficacy enhancement bar
   - Section 3(e): Mere admixture bar
   - Section 3(h): Agricultural method bar
   - Section 3(i): Medical treatment bar
   - Section 3(j): Plants, seeds, biological processes bar
6. For formulation classification, check D&C Act Chapter IV-A (Sections 33A-33O) and First Schedule.
7. For AYUSH drug manufacturing, check Schedule T (GMP) and Rules 151-170.
8. For shelf-life, check Rule 161B.
9. Confidence: HIGH (direct match in context) | MEDIUM (related provision) | LOW (limited evidence).
10. LANGUAGE RULE: When writing Hindi, Tamil, or any Indian language, ALWAYS use Latin/Roman script (transliteration). Keep legal terms in English.

MANDATORY RESPONSE FORMAT:
- Provide THOROUGH, DETAILED answers. DO NOT be brief or terse. Elaborate fully on each point.
- For legal questions, write at least 3-5 paragraphs covering: (a) the direct answer, (b) relevant statutory provisions with exact quotes, (c) practical implications, (d) related cross-references.
- Structure your answer with numbered points, sub-sections, and bullet points when appropriate.
- Quote the EXACT statutory text from the CONTEXT wherever possible — reproduce the relevant portions verbatim.
- Cross-reference related sections (e.g., linking Section 25 opposition to Section 64 revocation).
- Cite EVERY relevant section with full format: [Section X, Patents Act, 1970].
- Explain the legal significance and practical impact of each provision you cite.
- If multiple CONTEXT documents are relevant, synthesize information from ALL of them.

CONTEXT (Retrieved from verified statutory database):
{context}

USER QUERY:
{query}"""


def build_context_string(results: List[Dict]) -> str:
    """Build formatted context string from search results.
    Expanded content cap to 4000 chars for full statutory text coverage."""
    context_parts = []
    for i, r in enumerate(results, 1):
        citation = r.get("rag_config", {}).get("citation_format", r.get("doc_id", ""))
        title = r.get("title", "")
        content = r.get("content", "")[:4000]  # 4000 chars — captures full statutory sections with provisos
        importance = r.get("rag_config", {}).get("importance_score", 0)
        rerank = r.get("rerank_score", r.get("similarity_score", 0))

        context_parts.append(
            f"--- DOCUMENT {i} ---\n"
            f"Citation: {citation}\n"
            f"Title: {title}\n"
            f"Relevance: {rerank:.3f} | Importance: {importance}\n"
            f"Content:\n{content}\n"
        )
    return "\n".join(context_parts)


def is_simple_greeting(query: str) -> bool:
    """Detect simple greetings/non-legal queries that don't need the full RAG pipeline."""
    q = query.strip().lower()
    greetings = ['hi', 'hello', 'hey', 'thanks', 'thank you', 'bye', 'ok', 'okay',
                 'good morning', 'good evening', 'good night', 'namaste', 'namaskar',
                 'how are you', 'what are you', 'who are you', 'what can you do']
    return q in greetings or len(q) < 5


def rag_query(query: str, rag_db: RAGDatabase, llm: LLMManager) -> dict:
    """Full RAG pipeline: hybrid search (Dense+BM25+RRF) → cross-encoder rerank → generate → cite."""
    t0 = time.time()

    # Shortcut for greetings — skip RAG, respond directly with small token budget
    if is_simple_greeting(query):
        t1 = time.time()
        answer = llm.generate(
            "You are AYUSH-IPR GUARDIAN, an AI assistant for Indian traditional medicine intellectual property law. Respond briefly and warmly.",
            query,
            max_tokens=100
        )
        gen_time = time.time() - t1
        return {
            "query": query, "answer": answer, "citations": [], "sources": [],
            "metadata": {
                "model": llm.model_name, "engine": getattr(llm, 'engine_type', 'gemma-4b-nf4'),
                "search_time_ms": 0, "generation_time_ms": round(gen_time * 1000),
                "total_time_ms": round(gen_time * 1000), "sources_used": 0,
                "retrieval_method": "none (greeting)",
            }
        }

    # Step 1: Hybrid search (Dense FAISS + Sparse BM25 with RRF fusion) → rerank with cross-encoder
    results = rag_db.hybrid_search(query, top_k=7)  # Top-7 reranked documents for comprehensive statutory coverage
    search_time = time.time() - t0

    # Step 1.5: Filter out empty/near-empty results that waste context slots
    results = [r for r in results if len(r.get('content', '')) > 50]
    if not results:
        # Fallback: if all results were empty, use originals (title-only)
        results = rag_db.hybrid_search(query, top_k=7)

    # Step 2: Build context from reranked results (up to 7 docs)
    context = build_context_string(results)

    # Step 3: Generate with LLM — 1024 tokens allows detailed, comprehensive legal analysis
    t1 = time.time()
    prompt = SYSTEM_PROMPT.format(context=context, query=query)
    answer = llm.generate(prompt, query, max_tokens=1024)
    gen_time = time.time() - t1

    # Step 4: Extract citations from answer
    citations = re.findall(r'\[([^\]]+)\]', answer)

    total_time = time.time() - t0

    return {
        "query": query,
        "answer": answer,
        "citations": citations,
        "sources": [
            {
                "doc_id": r.get("doc_id"),
                "title": r.get("title"),
                "citation": r.get("rag_config", {}).get("citation_format", ""),
                "score": r.get("rerank_score", r.get("similarity_score", 0)),
            }
            for r in results
        ],
        "metadata": {
            "model": llm.model_name,
            "engine": getattr(llm, 'engine_type', 'transformers-nf4'),
            "search_time_ms": round(search_time * 1000),
            "generation_time_ms": round(gen_time * 1000),
            "total_time_ms": round(total_time * 1000),
            "sources_used": len(results),
            "retrieval_method": "Dense(FAISS)+Sparse(BM25)+RRF→CrossEncoder",
        }
    }


# ============================================================
# CELL 8: FASTAPI APPLICATION
# ============================================================

app = FastAPI(title="AYUSH-IPR GUARDIAN", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
rag_db = RAGDatabase()
llm = LLMManager()
asr = ASRManager()
tts = OmniVoiceTTSManager()
server_start_time = datetime.now().isoformat()


class ChatRequest(BaseModel):
    query: str
    top_k: int = 5


class ClassifyRequest(BaseModel):
    ingredients: List[str]
    dosage_form: Optional[str] = None


@app.get("/api/health")
async def health():
    """Health check with VRAM report."""
    gpu_info = {}
    if torch.cuda.is_available():
        for i in range(torch.cuda.device_count()):
            alloc = torch.cuda.memory_allocated(i) / 1e9
            total = torch.cuda.get_device_properties(i).total_memory / 1e9
            gpu_info[f"gpu_{i}"] = {
                "name": torch.cuda.get_device_name(i),
                "allocated_gb": round(alloc, 2),
                "total_gb": round(total, 1),
                "free_gb": round(total - alloc, 2),
            }

    return {
        "status": "healthy",
        "models": {
            "llm": {"loaded": llm.loaded, "name": llm.model_name},
            "embeddings": {"loaded": rag_db.embed_model is not None},
            "reranker": {"loaded": rag_db.reranker is not None},
            "asr": {"loaded": asr.loaded},
            "tts": {"loaded": tts.loaded},
            "rag_db": {"loaded": rag_db.loaded, "records": len(rag_db.records)},
        },
        "gpu": gpu_info,
        "started_at": server_start_time,
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Main RAG chat endpoint."""
    if not llm.loaded or not rag_db.loaded:
        raise HTTPException(500, "Models not fully loaded")

    result = rag_query(req.query, rag_db, llm)
    return result


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    """Streaming RAG chat endpoint — SSE (Server-Sent Events).
    Streams tokens as they're generated for real-time display in the app.
    """
    from transformers import TextIteratorStreamer
    import threading

    if not llm.loaded or not rag_db.loaded:
        raise HTTPException(500, "Models not fully loaded")

    # Shortcut for greetings — stream instant friendly greeting
    if is_simple_greeting(req.query):
        def stream_greeting():
            import json as _json
            import time as _time
            greeting_ans = (
                "Hello! I am **AYUSH-IPR GUARDIAN**, your specialized legal AI assistant for Indian Traditional Medicine "
                "(Ayurveda, Siddha, Unani, Homeopathy) and Intellectual Property Law.\n\n"
                "I can assist you with:\n"
                "- **Patentability Assessments** under Patents Act, 1970 (§3(p) TK bar, §3(d) efficacy, §3(e) admixtures)\n"
                "- **Formulation Regulatory Classification** (Classical vs Patent/Proprietary under D&C Act First Schedule)\n"
                "- **Schedule T (GMP) & Rule 161B Shelf-life Compliance**\n"
                "- **TKDL Prior Art & Section 25 Pre-grant / Post-grant Oppositions**\n\n"
                "What traditional formulation or legal provision would you like to examine today?"
            )
            yield f"data: {_json.dumps({'type': 'sources', 'sources': [], 'search_time_ms': 0})}\n\n"
            words = greeting_ans.split(" ")
            for w in words:
                _time.sleep(0.015)
                yield f"data: {_json.dumps({'type': 'token', 'token': w + ' '})}\n\n"
            yield f"data: {_json.dumps({'type': 'done'})}\n\n"

        return StreamingResponse(stream_greeting(), media_type="text/event-stream")

    # Step 1: Hybrid search + rerank (same as non-streaming)
    t0 = time.time()
    results = rag_db.hybrid_search(req.query, top_k=7)
    # Filter out empty/near-empty results that waste context slots
    results = [r for r in results if len(r.get('content', '')) > 50]
    if not results:
        results = rag_db.hybrid_search(req.query, top_k=7)
    search_time = time.time() - t0
    context = build_context_string(results)

    # Step 2: Prepare prompt
    prompt = SYSTEM_PROMPT.format(context=context, query=req.query)
    inputs = llm.prepare_inputs(prompt, req.query)

    # Step 3: Stream tokens via TextIteratorStreamer
    streamer = TextIteratorStreamer(llm.tokenizer, skip_prompt=True, skip_special_tokens=True)

    gen_kwargs = {
        **{k: v for k, v in inputs.items()},
        "max_new_tokens": 1024,
        "temperature": 0.3,
        "top_p": 0.92,
        "repetition_penalty": 1.15,
        "do_sample": True,
        "use_cache": True,
        "streamer": streamer,
    }

    # Run generation in background thread
    gen_thread = threading.Thread(target=llm.model.generate, kwargs=gen_kwargs)
    gen_thread.start()

    def generate_sse():
        """Yield SSE events as tokens arrive."""
        import json as _json
        # Send sources first
        sources = []
        for r in results:
            sources.append({
                "title": r.get("title", ""),
                "citation": r.get("rag_config", {}).get("citation_format", r.get("doc_id", "")),
                "score": round(r.get("rerank_score", r.get("similarity_score", 0)), 4),
            })
        yield f"data: {_json.dumps({'type': 'sources', 'sources': sources, 'search_time_ms': round(search_time * 1000)})}\n\n"

        # Stream tokens
        for text in streamer:
            if text:
                yield f"data: {_json.dumps({'type': 'token', 'token': text})}\n\n"

        # Done
        yield f"data: {_json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(generate_sse(), media_type="text/event-stream")


@app.post("/api/classify")
async def classify(req: ClassifyRequest):
    """Formulation classification endpoint."""
    if not llm.loaded or not rag_db.loaded:
        raise HTTPException(500, "Models not fully loaded")

    # Build classification query
    ingredients_str = ", ".join(req.ingredients)
    query = (
        f"Classify this AYUSH formulation: Ingredients: {ingredients_str}. "
        f"Dosage form: {req.dosage_form or 'not specified'}. "
        f"Is it a Classical Medicine (First Schedule), Proprietary Medicine, "
        f"or Patent Medicine? What regulatory pathway applies?"
    )
    result = rag_query(query, rag_db, llm)
    return result


@app.post("/api/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = Form(None)):
    """Transcribe audio to text."""
    if not asr.loaded:
        raise HTTPException(500, "ASR not loaded")

    audio_bytes = await audio.read()
    result = asr.transcribe(audio_bytes, language=language)
    return result


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


@app.post("/api/tts")
async def text_to_speech(req: TTSRequest):
    """Convert text to speech using OmniVoice. Returns WAV audio."""
    if not tts.loaded:
        raise HTTPException(503, "OmniVoice TTS not loaded")

    if not req.text or not req.text.strip():
        raise HTTPException(400, "Text is required")

    # Truncate very long text to prevent GPU OOM
    text = req.text.strip()[:2000]

    try:
        t0 = time.time()
        wav_bytes = tts.synthesize(text)
        gen_time = time.time() - t0
        print(f"  TTS: {len(text)} chars -> {len(wav_bytes)} bytes in {gen_time:.2f}s", flush=True)

        return Response(
            content=wav_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "inline; filename=speech.wav",
                "X-TTS-Generation-Time-Ms": str(round(gen_time * 1000)),
            }
        )
    except Exception as e:
        print(f"  TTS error: {e}", flush=True)
        raise HTTPException(500, f"TTS generation failed: {str(e)}")


@app.get("/api/vram")
async def vram():
    """Get current VRAM usage."""
    gpu_info = {}
    if torch.cuda.is_available():
        for i in range(torch.cuda.device_count()):
            alloc = torch.cuda.memory_allocated(i) / 1e9
            reserved = torch.cuda.memory_reserved(i) / 1e9
            total = torch.cuda.get_device_properties(i).total_memory / 1e9
            gpu_info[f"gpu_{i}"] = {
                "name": torch.cuda.get_device_name(i),
                "allocated_gb": round(alloc, 2),
                "reserved_gb": round(reserved, 2),
                "total_gb": round(total, 1),
                "free_gb": round(total - alloc, 2),
            }
    return gpu_info


# ============================================================
# CELL 9: TUNNEL SETUP
# ============================================================

def start_localtunnel(port: int) -> str:
    """Start localtunnel and return public HTTPS URL."""
    print("\n  Starting localtunnel...", flush=True)

    proc = subprocess.Popen(
        ["lt", "--port", str(port)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    for _ in range(30):
        line = proc.stdout.readline()
        if "url" in line.lower() or "https://" in line:
            match = re.search(r"(https://[^\s]+)", line)
            if match:
                url = match.group(1)
                for _ in range(3):
                    print(f"\n{'=' * 60}", flush=True)
                    print(f"  TUNNEL URL: {url}", flush=True)
                    print(f"{'=' * 60}\n", flush=True)
                print(f"  Health: {url}/api/health", flush=True)
                print(f"  Chat:   POST {url}/api/chat", flush=True)
                return url
        time.sleep(1)

    print("  ✗ localtunnel failed. Trying cloudflared fallback...", flush=True)
    return start_cloudflared_fallback(port)


def start_cloudflared_fallback(port: int) -> str:
    """Fallback: cloudflared tunnel."""
    if not os.path.exists("/usr/local/bin/cloudflared"):
        os.system("wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared")

    proc = subprocess.Popen(
        ["/usr/local/bin/cloudflared", "tunnel", "--url", f"http://localhost:{port}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    q = queue.Queue()
    def enqueue_output(out, q):
        for line in iter(out.readline, ''):
            q.put(line)
        out.close()

    t = threading.Thread(target=enqueue_output, args=(proc.stderr, q), daemon=True)
    t.start()

    for _ in range(600):
        try:
            line = q.get(timeout=0.1)
            match = re.search(r"(https://[a-z0-9-]+\.trycloudflare\.com)", line)
            if match:
                url = match.group(1)
                for _ in range(3):
                    print(f"\n{'=' * 60}", flush=True)
                    print(f"  TUNNEL URL: {url}", flush=True)
                    print(f"{'=' * 60}\n", flush=True)
                return url
        except queue.Empty:
            continue
    return "TUNNEL_FAILED"


# ============================================================
# CELL 10: AUTO-TEST SUITE
# ============================================================

TEST_PROMPTS = [
    {
        "id": 1,
        "query": "Can I patent a traditional Ashwagandha formulation that is documented in Charaka Samhita?",
        "expected_citation": "Section 3",
        "expected_topic": "traditional knowledge",
    },
    {
        "id": 2,
        "query": "What is considered a spurious AYUSH drug under Indian law?",
        "expected_citation": "Section 33EEA",
        "expected_topic": "spurious",
    },
    {
        "id": 3,
        "query": "What is the shelf life of Churna (powder) preparations in Ayurveda?",
        "expected_citation": "Rule 161B",
        "expected_topic": "shelf life",
    },
    {
        "id": 4,
        "query": "What are the GMP requirements for manufacturing Bhasma and calcined preparations?",
        "expected_citation": "Schedule T",
        "expected_topic": "GMP",
    },
    {
        "id": 5,
        "query": "List the authoritative books recognized for the Ayurvedic system in the First Schedule.",
        "expected_citation": "First Schedule",
        "expected_topic": "authoritative",
    },
]


def run_tests():
    """Run all test prompts and validate results."""
    print("\n" + "=" * 60)
    print("  RUNNING AUTO-TEST SUITE (5 prompts)")
    print("=" * 60 + "\n", flush=True)

    results = []
    passed = 0
    failed = 0

    for test in TEST_PROMPTS:
        print(f"  TEST {test['id']}: {test['query'][:80]}...", flush=True)
        t0 = time.time()

        try:
            result = rag_query(test["query"], rag_db, llm)
            elapsed = time.time() - t0

            answer = result["answer"]
            has_citation = test["expected_citation"].lower() in answer.lower()
            has_topic = test["expected_topic"].lower() in answer.lower()
            has_disclaimer = "not legal advice" in answer.lower() or "disclaimer" in answer.lower()
            is_not_empty = len(answer) > 50

            test_passed = has_citation and has_topic and is_not_empty
            if test_passed:
                passed += 1
                status = "✓ PASS"
            else:
                failed += 1
                status = "✗ FAIL"

            print(f"    {status} ({elapsed:.1f}s)")
            print(f"    Citation found: {'✓' if has_citation else '✗'} (looking for: {test['expected_citation']})")
            print(f"    Topic found:    {'✓' if has_topic else '✗'} (looking for: {test['expected_topic']})")
            print(f"    Has disclaimer: {'✓' if has_disclaimer else '✗'}")
            print(f"    Answer length:  {len(answer)} chars")
            print(f"    Sources used:   {len(result['sources'])}")
            print(f"    Answer preview: {answer[:200]}...")
            print("", flush=True)

            results.append({
                "test_id": test["id"],
                "status": "PASS" if test_passed else "FAIL",
                "time_ms": round(elapsed * 1000),
                "citation_found": has_citation,
                "topic_found": has_topic,
                "answer_length": len(answer),
            })

        except Exception as e:
            failed += 1
            print(f"    ✗ ERROR: {e}", flush=True)
            results.append({
                "test_id": test["id"],
                "status": "ERROR",
                "error": str(e),
            })

    # VRAM after tests
    print("\n  VRAM after all tests:", flush=True)
    vram_report("post-tests")

    # Summary
    print(f"\n{'=' * 60}")
    print(f"  TEST RESULTS: {passed}/{len(TEST_PROMPTS)} PASSED, {failed} FAILED")
    print(f"  LLM Model: {llm.model_name}")
    print(f"  RAG Records: {len(rag_db.records)}")
    print(f"{'=' * 60}\n", flush=True)

    # Save results
    try:
        with open("/kaggle/working/test_results.json", "w") as f:
            json.dump(results, f, indent=2)
        print("  Test results saved to /kaggle/working/test_results.json", flush=True)
    except Exception:
        pass

    return results


# ============================================================
# CELL 11: MAIN ENTRY POINT
# ============================================================

def main():
    PORT = 8000

    print("\n" + "=" * 60)
    print("  AYUSH-IPR GUARDIAN — Kaggle RAG Server")
    print("  Starting up on T4 x2...")
    print("=" * 60 + "\n", flush=True)

    # ── Initial VRAM report ──
    num_gpus = torch.cuda.device_count() if torch.cuda.is_available() else 0
    print(f"  Device: {'CUDA' if torch.cuda.is_available() else 'CPU'} | GPUs: {num_gpus}", flush=True)
    vram_report("INITIAL")

    # ── Determine GPU placement ──
    if num_gpus >= 2:
        llm_gpu = "cuda:0"     # GPU 0: Exclusively dedicated to Gemma 2 2B LLM
        rag_gpu = "cuda:1"     # GPU 1: BGE-M3 + Reranker
        asr_gpu = "cuda:1"     # GPU 1: faster-whisper ASR
        tts_gpu = "cuda:1"     # GPU 1: OmniVoice TTS
    elif num_gpus == 1:
        llm_gpu = "cuda:0"
        rag_gpu = "cuda:0"
        asr_gpu = "cuda:0"
        tts_gpu = "cuda:0"
    else:
        llm_gpu = "cpu"
        rag_gpu = "cpu"
        asr_gpu = "cpu"
        tts_gpu = "cpu"

    # ── Step 1: Load RAG database ──
    print("\n[1/6] Loading RAG database...", flush=True)
    db_path = None
    # Search all possible locations
    search_paths = [
        "/kaggle/working/rag_database_master.json",
        "/kaggle/input/ayush-ipr-rag-database/rag_database_master.json",
        "/kaggle/input/ayush-ipr-rag-database/ayush-ipr-rag-database/rag_database_master.json",
    ]
    # Also scan /kaggle/input/ recursively for the file
    if os.path.exists("/kaggle/input"):
        for root, dirs, files in os.walk("/kaggle/input"):
            for fname in files:
                if fname == "rag_database_master.json":
                    search_paths.append(os.path.join(root, fname))

    for p in search_paths:
        if os.path.exists(p):
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    recs = json.load(f)
                if len(recs) > 1000:
                    db_path = p
                    print(f"  ✓ Found fresh expanded database ({len(recs)} records) at: {db_path}", flush=True)
                    break
            except Exception:
                pass

    # If not found or stale (less than 1000 records), download latest version from Kaggle
    if db_path is None:
        print("  Downloading latest 6643-record dataset from Kaggle Hub...", flush=True)
        os.system('kaggle datasets download vanshseth003/ayush-ipr-rag-database -p /kaggle/working/ --unzip --force 2>&1 || true')
        for root, dirs, files in os.walk("/kaggle/working"):
            for fname in files:
                if fname == "rag_database_master.json":
                    db_path = os.path.join(root, fname)
                    break

    if not db_path or not os.path.exists(db_path):
        print("  FATAL: Cannot find rag_database_master.json anywhere!", flush=True)
        return

    rag_db.load_database(db_path)

    # ── Step 2: Load embedding model + build index ──
    print(f"\n[2/6] Loading BGE-M3 + building FAISS index on {rag_gpu}...", flush=True)
    rag_db.load_embeddings_model(device=rag_gpu)
    rag_db.build_index()
    vram_report("after-index")

    # ── Step 3: Load reranker ──
    print(f"\n[3/6] Loading reranker on {rag_gpu}...", flush=True)
    rag_db.load_reranker(device=rag_gpu)
    vram_report("after-reranker")

    # ── Step 4: Load LLM (with auto-fallback) ──
    print(f"\n[4/6] Loading LLM on {llm_gpu}...", flush=True)
    llm_success = llm.load(device=llm_gpu)
    if not llm_success:
        print("  ✗ FATAL: No LLM could be loaded. Exiting.", flush=True)
        return
    vram_report("after-LLM")

    # ── Step 5: Load ASR ──
    print(f"\n[5/6] Loading faster-whisper ASR on {asr_gpu}...", flush=True)
    asr.load(device=asr_gpu)
    vram_report("after-ASR")

    # ── Step 6: Load OmniVoice TTS ──
    print(f"\n[6/6] Loading OmniVoice TTS on {tts_gpu}...", flush=True)
    tts_success = tts.load(device=tts_gpu)
    if not tts_success:
        print("  WARNING: OmniVoice TTS failed to load. /api/tts will return 503.", flush=True)
    vram_report("after-TTS")

    # ── Final VRAM report ──
    print("\n" + "=" * 60)
    print("  ALL MODELS LOADED — Final VRAM:")
    print("=" * 60, flush=True)
    vram_report("FINAL")

    # ── Start tunnel (both localtunnel & cloudflared) ──
    tunnel_url = None
    def run_tunnel():
        nonlocal tunnel_url
        tunnel_url = start_localtunnel(PORT)
    tunnel_thread = threading.Thread(target=run_tunnel, daemon=True)
    tunnel_thread.start()

    # Also start cloudflared in background for dual redundancy
    threading.Thread(target=lambda: start_cloudflared_fallback(PORT), daemon=True).start()

    # Run auto-tests in background after a brief delay so server starts immediately
    def background_tests():
        time.sleep(10)
        run_tests()
    threading.Thread(target=background_tests, daemon=True).start()

    # ── Start FastAPI ──
    print(f"\n  Starting FastAPI server on port {PORT}...", flush=True)
    nest_asyncio.apply()
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")


if __name__ == "__main__":
    main()
