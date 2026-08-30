#!/usr/bin/env python3
"""
Merge & Backup RAG Database
=============================
1. Backs up current rag_database_master.json
2. Loads all 15 JSON files from data/ folder
3. Normalizes each record to UDO schema (adds doc_id, rag_config, checksum)
4. Deduplicates by (source_name + level_3) — replaces old partial records with new expanded ones
5. Writes merged master
"""

import json
import hashlib
import os
import shutil
from datetime import date

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MASTER_PATH = os.path.join(BASE_DIR, "rag_database_master.json")
TODAY = date.today().isoformat()

# Source name normalization map — maps data/ filenames to canonical source names
SOURCE_MAP = {
    "patent act 1970.json": "Patents Act, 1970",
    "patents-rules2003.json": "Patents Rules, 2003",
    "2016DrugsandCosmeticsAct1940Rules1945.json": "Drugs and Cosmetics Act, 1940 & Rules, 1945",
    "copyright act 1957.json": "Copyright Act, 1957",
    "trademarks act 1999.json": "Trade Marks Act, 1999",
    "geoAct 1999.json": "Geographical Indications Act, 1999",
    "bioDivAct 2002-(amd)2023.json": "Biological Diversity Act, 2002 (Amd 2023)",
    "biologicalDivAct 2024.json": "Biological Diversity Act, 2024",
    "plantprotection act 2001.json": "Protection of Plant Varieties Act, 2001",
    "designAct 2000.json": "Designs Act, 2000",
    "FSSAI ayur 2022.json": "FSSAI Ayurveda Regulations, 2022",
    "The_Food_Safety_And_Standards_Act_2006.json": "Food Safety and Standards Act, 2006",
    "drdp act 2023.json": "Drugs and Remedies (Objectionable Advertisements) Act, 2023",
    "drugs&MagicRem act 1954.json": "Drugs and Magic Remedies Act, 1954",
    "guidelines-for-examination-of-ayush-related-inventions_-23-september-2025-A1azr2vrlpi52xqN.json": "AYUSH Patent Examination Guidelines, 2025",
}

# Category sub-category map
CATEGORY_MAP = {
    "Patents Act, 1970": ("statute", "patent_law"),
    "Patents Rules, 2003": ("regulation", "patent_rules"),
    "Drugs and Cosmetics Act, 1940 & Rules, 1945": ("statute", "drug_regulation"),
    "Copyright Act, 1957": ("statute", "copyright_law"),
    "Trade Marks Act, 1999": ("statute", "trademark_law"),
    "Geographical Indications Act, 1999": ("statute", "geographical_indications"),
    "Biological Diversity Act, 2002 (Amd 2023)": ("statute", "biodiversity_law"),
    "Biological Diversity Act, 2024": ("statute", "biodiversity_law"),
    "Protection of Plant Varieties Act, 2001": ("statute", "plant_variety_protection"),
    "Designs Act, 2000": ("statute", "design_law"),
    "FSSAI Ayurveda Regulations, 2022": ("regulation", "food_safety_ayurveda"),
    "Food Safety and Standards Act, 2006": ("statute", "food_safety"),
    "Drugs and Remedies (Objectionable Advertisements) Act, 2023": ("statute", "drug_advertising"),
    "Drugs and Magic Remedies Act, 1954": ("statute", "drug_magic_remedies"),
    "AYUSH Patent Examination Guidelines, 2025": ("guideline", "ayush_patent_examination"),
}

# Ensure UTF-8 output on Windows
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Old sources that should be REPLACED by new expanded data
OLD_SOURCES_TO_REPLACE = set(SOURCE_MAP.values()).union({
    "Drugs and Cosmetics Act, 1940",
    "Drugs and Cosmetics Rules, 1945",
})


def make_doc_id(source_name, title):
    """Generate a deterministic doc_id from source + title."""
    raw = f"{source_name}::{title}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def make_checksum(record):
    """Generate content checksum for dedup."""
    content = record.get("content_plain", record.get("content", ""))
    return hashlib.md5(content.encode("utf-8")).hexdigest()


def make_citation(source_name, title):
    """Generate citation_format from source and title."""
    # Extract section/rule number from title
    import re
    sec_match = re.search(r"(Section|Rule|Regulation|Article|Chapter|Schedule|Form|Appendix)\s+(\d+[A-Za-z]*)", title, re.IGNORECASE)
    if sec_match:
        return f"[{sec_match.group(1)} {sec_match.group(2)}, {source_name}]"
    return f"[{title[:60]}, {source_name}]"


def normalize_record(record, source_name, filename):
    """Ensure record has all UDO fields the server expects."""
    # Already has doc_id? Keep it. Otherwise generate.
    if not record.get("doc_id"):
        record["doc_id"] = make_doc_id(source_name, record.get("title", ""))

    # Ensure doc_type
    if not record.get("doc_type"):
        record["doc_type"] = "statute_section"

    # Ensure content_plain reflects content
    record["content_plain"] = record.get("content", "")

    # Ensure source block
    if not record.get("source"):
        record["source"] = {}
    record["source"]["name"] = source_name
    if not record["source"].get("url"):
        record["source"]["url"] = ""
    if not record["source"].get("access_date"):
        record["source"]["access_date"] = TODAY
    if not record["source"].get("version"):
        record["source"]["version"] = ""

    # Ensure hierarchy
    if not record.get("hierarchy"):
        record["hierarchy"] = {}
    if not record["hierarchy"].get("level_1"):
        record["hierarchy"]["level_1"] = source_name

    # Ensure metadata
    if not record.get("metadata"):
        record["metadata"] = {}
    record["metadata"]["jurisdiction"] = record["metadata"].get("jurisdiction", "India")
    record["metadata"]["language"] = record["metadata"].get("language", "en")

    cat, subcat = CATEGORY_MAP.get(source_name, ("statute", "general"))
    record["metadata"]["category"] = record["metadata"].get("category", cat)
    record["metadata"]["sub_category"] = record["metadata"].get("sub_category", subcat)
    record["metadata"]["is_current"] = record["metadata"].get("is_current", True)
    if not record["metadata"].get("tags"):
        record["metadata"]["tags"] = []

    # Ensure rag_config (the server reads this for citation_format and importance_score)
    if not record.get("rag_config"):
        record["rag_config"] = {}
    if not record["rag_config"].get("citation_format"):
        record["rag_config"]["citation_format"] = make_citation(source_name, record.get("title", ""))
    if "importance_score" not in record["rag_config"]:
        # Higher importance for patent/AYUSH-related sources
        if "patent" in source_name.lower() or "ayush" in source_name.lower():
            record["rag_config"]["importance_score"] = 8
        elif "drug" in source_name.lower() or "cosmetic" in source_name.lower():
            record["rag_config"]["importance_score"] = 7
        else:
            record["rag_config"]["importance_score"] = 5

    # Ensure checksum
    if not record.get("checksum"):
        record["checksum"] = make_checksum(record)

    return record


def main():
    print("=" * 60)
    print("  AYUSH-IPR GUARDIAN — Database Merge & Backup")
    print("=" * 60)

    # ── Step 1: Backup current master ──
    if os.path.exists(MASTER_PATH):
        backup_name = f"rag_database_master_backup_{TODAY}.json"
        backup_path = os.path.join(BASE_DIR, backup_name)
        shutil.copy2(MASTER_PATH, backup_path)
        print(f"\n[1/4] ✓ Backed up current master → {backup_name}")

        with open(MASTER_PATH, "r", encoding="utf-8") as f:
            old_records = json.load(f)
        print(f"       Old master: {len(old_records)} records")
    else:
        old_records = []
        print(f"\n[1/4] No existing master found. Starting fresh.")

    # ── Step 2: Filter out old sources that will be replaced ──
    kept_records = []
    removed_count = 0
    for r in old_records:
        src = r.get("source", {}).get("name", "")
        if src in OLD_SOURCES_TO_REPLACE:
            removed_count += 1
        else:
            kept_records.append(r)
    print(f"\n[2/4] Removed {removed_count} old records from replaced sources")
    print(f"       Kept {len(kept_records)} records from non-overlapping sources")

    # ── Step 3: Load and normalize all new data ──
    print(f"\n[3/4] Loading new data from {DATA_DIR}...")
    new_records = []
    for filename in sorted(os.listdir(DATA_DIR)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(DATA_DIR, filename)
        source_name = SOURCE_MAP.get(filename, filename.replace(".json", ""))

        with open(filepath, "r", encoding="utf-8") as f:
            records = json.load(f)

        normalized = []
        for r in records:
            normalized.append(normalize_record(r, source_name, filename))

        new_records.extend(normalized)
        print(f"  ✓ {filename}: {len(records)} records → source: {source_name}")

    print(f"\n  Total new records loaded: {len(new_records)}")

    # ── Step 4: Merge + Deduplicate ──
    print(f"\n[4/4] Merging and deduplicating...")
    all_records = kept_records + new_records

    # Deduplicate by (source_name + level_3 + title)
    seen = set()
    unique_records = []
    dup_count = 0
    for r in all_records:
        src = r.get("source", {}).get("name", "")
        lvl3 = r.get("hierarchy", {}).get("level_3", "")
        title = r.get("title", "")
        key = f"{src}||{lvl3}||{title}"
        if key in seen:
            dup_count += 1
            continue
        seen.add(key)
        unique_records.append(r)

    print(f"  Duplicates removed: {dup_count}")
    print(f"  Final unique records: {len(unique_records)}")

    # ── Write merged master ──
    with open(MASTER_PATH, "w", encoding="utf-8") as f:
        json.dump(unique_records, f, ensure_ascii=False, indent=2)

    file_size_mb = os.path.getsize(MASTER_PATH) / (1024 * 1024)
    print(f"\n{'=' * 60}")
    print(f"  ✓ Merged master written: {MASTER_PATH}")
    print(f"  ✓ Records: {len(unique_records)}")
    print(f"  ✓ File size: {file_size_mb:.1f} MB")
    print(f"{'=' * 60}")

    # Summary by source
    print(f"\n  Records by source:")
    source_counts = {}
    for r in unique_records:
        src = r.get("source", {}).get("name", "Unknown")
        source_counts[src] = source_counts.get(src, 0) + 1
    for src, count in sorted(source_counts.items(), key=lambda x: -x[1]):
        print(f"    {count:5d}  {src}")


if __name__ == "__main__":
    main()
