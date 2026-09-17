"""
AYUSH-IPR GUARDIAN — Offline FAISS & BM25 Index Builder
========================================================
Runs ONCE locally to pre-compute:
  1. faiss_bge_m3.index (~19MB binary)
  2. bm25_corpus.pkl (~12MB serialized)

Eliminates the 155s cold-start embedding bottleneck on Kaggle!
"""

import os
import sys

# Force UTF-8 on Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Force 100% offline mode so transformers doesn't stall on network
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import warnings
warnings.filterwarnings("ignore")

import json
import time
import re
import pickle
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()
JSON_PATH = ROOT_DIR / "rag_database_master.json"
FAISS_OUT = ROOT_DIR / "faiss_bge_m3.index"
BM25_OUT = ROOT_DIR / "bm25_corpus.pkl"


def build_offline_index():
    print("=" * 65)
    print("  AYUSH-IPR GUARDIAN: Pre-computing FAISS & BM25 Offline Index")
    print("=" * 65, flush=True)

    if not JSON_PATH.exists():
        print(f"[ERROR] Database file not found: {JSON_PATH}", file=sys.stderr)
        sys.exit(1)

    print(f"1. Loading master database: {JSON_PATH} ...", flush=True)
    t0 = time.time()
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)
    print(f"   [OK] Loaded {len(records)} records in {time.time() - t0:.2f}s", flush=True)

    # Prepare texts and tokenized corpus
    print("2. Preprocessing texts for dense & sparse indexing ...", flush=True)
    t0 = time.time()
    texts = []
    tokenized_corpus = []
    for r in records:
        text = f"{r['title']}\n{r.get('content_plain', r.get('content', ''))}"
        truncated = text[:3000]
        texts.append(truncated)
        tokens = re.findall(r"\w+", truncated.lower())
        tokenized_corpus.append(tokens)

    print(f"   [OK] Prepared {len(texts)} text chunks in {time.time() - t0:.2f}s", flush=True)

    # Save BM25 corpus immediately
    print(f"3. Saving BM25 corpus to {BM25_OUT} ...", flush=True)
    t0 = time.time()
    with open(BM25_OUT, "wb") as f:
        pickle.dump(tokenized_corpus, f, protocol=4)
    bm25_size_mb = os.path.getsize(BM25_OUT) / (1024 * 1024)
    print(f"   [OK] BM25 corpus saved ({bm25_size_mb:.2f} MB) in {time.time() - t0:.2f}s", flush=True)

    # Load BGE-M3
    print("4. Loading BAAI/bge-m3 embedding model ...", flush=True)
    import torch
    import numpy as np
    import faiss
    from sentence_transformers import SentenceTransformer

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"   Using device: {device}", flush=True)
    if device == "cpu":
        cores = os.cpu_count() or 8
        torch.set_num_threads(cores)
        print(f"   Configured PyTorch CPU threads: {cores}", flush=True)

    t0 = time.time()
    model = SentenceTransformer("BAAI/bge-m3", device=device)
    print(f"   [OK] BGE-M3 loaded in {time.time() - t0:.2f}s", flush=True)

    # Encode embeddings
    batch_size = 32 if device == "cpu" else 64
    print(f"5. Encoding {len(texts)} documents with BGE-M3 (batch_size={batch_size})...", flush=True)
    t0 = time.time()
    with torch.inference_mode():
        embeddings = model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            normalize_embeddings=True,
        )
    encode_time = time.time() - t0
    print(f"   [OK] Embeddings shape: {embeddings.shape} generated in {encode_time:.2f}s ({len(texts)/encode_time:.1f} docs/s)", flush=True)

    # Build FAISS FlatIP Index
    print("6. Building FAISS FlatIP index ...", flush=True)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings.astype(np.float32))
    print(f"   [OK] FAISS index created with {index.ntotal} vectors (dim={dim})", flush=True)

    # Write FAISS index to file
    print(f"7. Saving FAISS index to {FAISS_OUT} ...", flush=True)
    t0 = time.time()
    faiss.write_index(index, str(FAISS_OUT))
    faiss_size_mb = os.path.getsize(FAISS_OUT) / (1024 * 1024)
    print(f"   [OK] FAISS index saved ({faiss_size_mb:.2f} MB) in {time.time() - t0:.2f}s", flush=True)

    # Verification test
    print("8. Verifying saved artifacts ...", flush=True)
    t0 = time.time()
    test_index = faiss.read_index(str(FAISS_OUT))
    with open(BM25_OUT, "rb") as f:
        test_bm25_corpus = pickle.load(f)
    from rank_bm25 import BM25Okapi
    test_bm25 = BM25Okapi(test_bm25_corpus)
    verify_time = time.time() - t0

    assert test_index.ntotal == len(records), f"Mismatch: {test_index.ntotal} vs {len(records)}"
    assert len(test_bm25_corpus) == len(records), f"BM25 mismatch"

    print(f"   [OK] Verification PASSED in {verify_time:.3f}s!")
    print(f"        FAISS Vectors: {test_index.ntotal} (dim={test_index.d})")
    print(f"        BM25 Docs:     {len(test_bm25_corpus)}")
    print("=" * 65)
    print("  SUCCESSFULLY PRE-COMPUTED INDICES!")
    print(f"  Files created:")
    print(f"    - {FAISS_OUT} ({faiss_size_mb:.2f} MB)")
    print(f"    - {BM25_OUT} ({bm25_size_mb:.2f} MB)")
    print("=" * 65, flush=True)


if __name__ == "__main__":
    build_offline_index()
