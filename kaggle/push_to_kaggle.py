"""
Push AYUSH-IPR GUARDIAN to Kaggle with T4 x2 GPU.
Usage: python push_to_kaggle.py
"""
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent  # projectSIH/
KAGGLE_DIR = Path(__file__).parent   # projectSIH/kaggle/
USERNAME = "vanshseth003"
SLUG = "ayush-ipr-guardian"


def safe_print(text):
    try:
        print(text)
    except Exception:
        print(text.encode('ascii', errors='ignore').decode('ascii'))


def create_kernel_metadata():
    meta = {
        "id": f"{USERNAME}/{SLUG}",
        "title": SLUG,
        "code_file": "server.py",
        "language": "python",
        "kernel_type": "script",
        "is_private": True,
        "enable_gpu": True,
        "machine_shape": "NvidiaTeslaT4",
        "enable_internet": True,
        "keywords": [],
        "dataset_sources": [
            f"{USERNAME}/ayush-ipr-rag-database"
        ],
        "competition_sources": [],
        "kernel_sources": [],
        "model_sources": [
            "google/gemma-2/transformers/gemma-2-2b-it/1"
        ],
    }
    meta_path = KAGGLE_DIR / "kernel-metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    safe_print(f"  Created {meta_path}")
    return meta_path


def push_dataset():
    """Upload RAG database as Kaggle dataset."""
    import tempfile, shutil
    ds_dir = Path(tempfile.mkdtemp(prefix="ayush_rag_"))

    # Copy database file
    src = ROOT / "rag_database_master.json"
    if not src.exists():
        safe_print(f"  [ERROR] {src} not found!")
        return False
    shutil.copy2(src, ds_dir / "rag_database_master.json")

    # Copy pre-computed indices if available
    for fname in ["faiss_bge_m3.index", "bm25_corpus.pkl"]:
        fpath = ROOT / fname
        if fpath.exists():
            shutil.copy2(fpath, ds_dir / fname)
            safe_print(f"  ✓ Included {fname} ({fpath.stat().st_size / (1024*1024):.2f} MB)")

    # Create dataset metadata
    ds_meta = {
        "title": "ayush-ipr-rag-database",
        "id": f"{USERNAME}/ayush-ipr-rag-database",
        "licenses": [{"name": "CC0-1.0"}]
    }
    with open(ds_dir / "dataset-metadata.json", "w", encoding="utf-8") as f:
        json.dump(ds_meta, f, indent=2)

    safe_print(f"  Uploading dataset from {ds_dir}...")
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"

    # Try create first, then version update
    result = subprocess.run(
        ["kaggle", "datasets", "create", "-p", str(ds_dir), "--dir-mode", "zip"],
        capture_output=True, env=env,
    )
    stdout_str = result.stdout.decode('utf-8', errors='ignore') if result.stdout else ""
    if result.returncode != 0 or "already in use" in stdout_str.lower() or "error" in stdout_str.lower():
        safe_print("  Dataset exists, updating version...")
        result = subprocess.run(
            ["kaggle", "datasets", "version", "-p", str(ds_dir),
             "-m", "Updated RAG database", "--dir-mode", "zip"],
            capture_output=True, env=env,
        )
    if result.stdout:
        safe_print(result.stdout.decode('utf-8', errors='ignore').strip())
    if result.returncode != 0 and result.stderr:
        safe_print(f"  Warning: {result.stderr.decode('utf-8', errors='ignore').strip()}")

    shutil.rmtree(ds_dir, ignore_errors=True)
    return True


def push_kernel():
    """Push kernel with T4 x2 accelerator."""
    create_kernel_metadata()

    safe_print("  Pushing kernel with GPU T4 x2...")
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"

    # Push using NvidiaTeslaT4 machine shape
    result = subprocess.run(
        ["kaggle", "kernels", "push", "-p", str(KAGGLE_DIR), "--accelerator", "NvidiaTeslaT4"],
        capture_output=True, env=env,
    )
    if result.stdout:
        safe_print(result.stdout.decode('utf-8', errors='ignore').strip())
    if result.returncode != 0:
        if result.stderr:
            safe_print(f"  Error: {result.stderr.decode('utf-8', errors='ignore').strip()}")
        return False

    safe_print(f"\n  ✓ Pushed! View at: https://www.kaggle.com/code/{USERNAME}/{SLUG}")
    safe_print(f"  Monitor: kaggle kernels status {USERNAME}/{SLUG}")
    return True


def check_status():
    """Check kernel execution status."""
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    result = subprocess.run(
        ["kaggle", "kernels", "status", f"{USERNAME}/{SLUG}"],
        capture_output=True, env=env,
    )
    if result.stdout:
        safe_print(result.stdout.decode('utf-8', errors='ignore').strip())
    return result


def pull_output():
    """Pull kernel output logs."""
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    out_dir = KAGGLE_DIR / "output"
    out_dir.mkdir(exist_ok=True)
    result = subprocess.run(
        ["kaggle", "kernels", "output", f"{USERNAME}/{SLUG}", "-p", str(out_dir)],
        capture_output=True, env=env,
    )
    if result.stdout:
        safe_print(result.stdout.decode('utf-8', errors='ignore').strip())
    return out_dir


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="AYUSH-IPR GUARDIAN Kaggle Manager")
    parser.add_argument("action", choices=["push", "status", "output", "all"],
                        default="all", nargs="?",
                        help="push=push kernel, status=check status, output=pull output, all=push+status")
    args = parser.parse_args()

    print("=" * 60)
    print("  AYUSH-IPR GUARDIAN — Kaggle Manager")
    print("=" * 60)

    if args.action in ("push", "all"):
        print("\n[1/2] Uploading dataset...")
        push_dataset()
        print("\n[2/2] Pushing kernel...")
        push_kernel()

    if args.action in ("status", "all"):
        print("\n[Status]")
        check_status()

    if args.action == "output":
        print("\n[Output]")
        pull_output()
