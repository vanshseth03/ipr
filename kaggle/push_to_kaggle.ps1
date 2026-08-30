# AYUSH-IPR GUARDIAN — Push to Kaggle
# ====================================
# Step 1: Upload RAG database as a Kaggle dataset
# Step 2: Push the kernel (server.py)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $PSScriptRoot
$KaggleDir = $PSScriptRoot

Write-Host "=" * 60
Write-Host "  AYUSH-IPR GUARDIAN — Kaggle Push Script"
Write-Host "=" * 60
Write-Host ""

# ─── Verify kaggle CLI ───
try {
    kaggle --version | Out-Null
    Write-Host "[OK] Kaggle CLI found"
} catch {
    Write-Host "[ERROR] Kaggle CLI not found. Install with: pip install kaggle"
    Write-Host "  Also set KAGGLE_USERNAME and KAGGLE_KEY environment variables."
    exit 1
}

# ─── Step 1: Create/Update Dataset ───
Write-Host ""
Write-Host "[1/2] Uploading RAG database as Kaggle dataset..."

$DatasetDir = Join-Path $env:TEMP "ayush-ipr-rag-dataset"
New-Item -ItemType Directory -Path $DatasetDir -Force | Out-Null

# Copy the master JSON
Copy-Item (Join-Path $ProjectDir "rag_database_master.json") (Join-Path $DatasetDir "rag_database_master.json")

# Create dataset metadata
$DatasetMeta = @{
    title = "ayush-ipr-rag-database"
    id = "vanshseth003/ayush-ipr-rag-database"
    licenses = @(@{name = "CC0-1.0"})
} | ConvertTo-Json
$DatasetMeta | Out-File (Join-Path $DatasetDir "dataset-metadata.json") -Encoding utf8

try {
    kaggle datasets create -p $DatasetDir --dir-mode zip
    Write-Host "[OK] Dataset created/updated"
} catch {
    Write-Host "[WARN] Dataset create failed (may already exist). Trying version update..."
    try {
        kaggle datasets version -p $DatasetDir -m "Updated RAG database" --dir-mode zip
        Write-Host "[OK] Dataset version updated"
    } catch {
        Write-Host "[ERROR] Dataset upload failed: $_"
        Write-Host "  You may need to create the dataset manually on kaggle.com first."
    }
}

# ─── Step 2: Push Kernel ───
Write-Host ""
Write-Host "[2/2] Pushing kernel to Kaggle..."

try {
    kaggle kernels push -p $KaggleDir
    Write-Host "[OK] Kernel pushed successfully!"
    Write-Host ""
    Write-Host "  Monitor at: https://www.kaggle.com/vanshseth003/ayush-ipr-guardian"
    Write-Host "  The kernel will:"
    Write-Host "    1. Install dependencies (incl. omnivoice)"
    Write-Host "    2. Load RAG database (6643 records)"
    Write-Host "    3. Load BGE-M3 + reranker on GPU 1"
    Write-Host "    4. Load Gemma 2 2B-IT (float16) on GPU 0"
    Write-Host "    5. Load faster-whisper ASR on GPU 0"
    Write-Host "    6. Load OmniVoice TTS (~2.5GB) on GPU 0"
    Write-Host "    7. Run auto-tests"
    Write-Host "    8. Start localtunnel and print URL"
    Write-Host ""
    Write-Host "  Check output for TUNNEL URL to access the API."
} catch {
    Write-Host "[ERROR] Kernel push failed: $_"
}

Write-Host ""
Write-Host "Done."
