# AYUSH IPR Guardian: Rigid Multi-Source Data Acquisition Engine & Full Corpus Re-Scraper

## Problem Statement & Objective
The AYUSH IPR Guardian requires an exhaustive, citation-grounded corpus covering:
1. Indian IP statutes and drug regulatory rules (including 2024 Patent Rules, 2023/2024 Biodiversity Rules, Chapter IV-A, Schedule T GMP, Schedule E(1) poisons, Rule 151-161 ASU licensing, Rule 161B shelf-life, and FSSAI Ayurveda Aahar 2022).
2. International treaties (TRIPS, CBD, Nagoya Protocol, WIPO GRATK Treaty 2024, PCT, Madrid, Budapest, UPOV).
3. Landmark bio-piracy & AYUSH case law (Turmeric, Neem, Basmati, *Novartis v. UOI*, *Divya Pharmacy v. UOI*, Section 3(p) TK prior art decisions, Section 3(e) mere admixture decisions).
4. Authoritative pharmacopoeial texts (First Schedule 54 classical treatises, Ayurvedic Formulary of India [AFI], Ayurvedic Pharmacopoeia of India [API], WHO medicinal plant monographs).
5. Official government memorandums, circulars, and regulatory notices (Ministry of AYUSH Rule 170 omission OMs, CDSCO phytopharmaceutical circulars, NBA ABS 2025 benefit-sharing slabs).
6. Global export regimes (EU THMPD 2004/24/EC, EU Novel Food 2015/2283, US DSHEA 1994, FDA Import Alert 54-15).

Currently, the existing database contains ~6,643 records, of which **49% are empty shells** (titles without body text due to Table of Contents bleed), and **zero records exist for international treaties, case law, pharmacopoeia, or export regimes**.

This project establishes a **new, dedicated, rigid data scraper and corpus vault** (`corpus_vault/`) that downloads original PDFs, extracts and cleans HTML, captures official regulatory memorandums completely, re-scrapes and repairs all broken statutes, and compiles a clean, verified, 0%-empty Universal Document Object (UDO) master database.

---

## User Review Required

> [!IMPORTANT]
> **Directory Isolation**: All new scraping code, downloaded raw documents (PDFs, HTML files), intermediate extracted texts, and structured UDO JSON records will be created inside a dedicated new directory: `c:\Users\sange\OneDrive\Desktop\random ideas\projectSIH\corpus_vault\`. The existing `data/` folder and `rag_database_master.json` will remain preserved as backups.

> [!IMPORTANT]
> **Zero Empty Record Enforcement**: Every scraper module enforces strict content validation (`len(content.strip()) >= 50` characters). Any candidate chunk failing this threshold or detected as a Table of Contents (TOC) entry is rejected. The final dataset will have **0% empty records**.

---

## Open Questions

None at this time. The required data categories, verified URLs, PDF endpoints, and UDO schema are fully established based on the Problem Statement and verified live against official endpoints (WTO, CBD, WIPO, EUR-Lex, US GovInfo, Indian Kanoon, and IndiaCode).

---

## Proposed Architecture & Directory Layout

The new `corpus_vault/` directory is structured as follows:

```
corpus_vault/
├── raw_documents/
│   ├── pdfs/
│   │   ├── statutes/          # Official gazettes & Acts (Patents Act, TM, GI, CR, Designs, BDA 2023/2024, PPV&FR, D&C, D&MR, FSSAI, DPDP)
│   │   ├── treaties/          # WIPO GRATK 2024, PCT, Madrid, Budapest, Paris, Berne, UPOV
│   │   ├── case_law/          # Judgments & patent dossiers (USPTO 5,401,504, EPO 0436257, RiceTec Basmati, etc.)
│   │   ├── pharmacopoeia/     # API drug monographs, AFI formulation PDFs, WHO plant monographs
│   │   └── memorandums/       # AYUSH OMs (Rule 170, ASU GMP standards, Ayush mark), CDSCO Phytopharmaceutical notes, NBA ABS 2025
│   └── html/
│       ├── treaties/          # WTO TRIPS, CBD Convention text, Nagoya Protocol
│       ├── case_law/          # Indian Kanoon judgments (Novartis SC 2013, Divya Pharmacy HC 2018, Section 3(p) decisions)
│       └── export_regimes/    # EUR-Lex THMPD (2004/24/EC), Novel Food (2015/2283), US DSHEA, FDA Import Alerts
├── extracted_text/            # Cleaned text extracted via PyMuPDF (fitz) and BeautifulSoup4
├── structured_udo/            # Standardized Universal Document Object JSON files (one per domain)
├── scrapers/
│   ├── __init__.py
│   ├── config.py              # Headers, timeouts, directory paths, schema definitions, validation rules
│   ├── utils.py               # Robust HTTP client (retries, rate limiting), PDF downloader, HTML parser, UDO builder
│   ├── scrape_indian_statutes.py      # Re-scrapes & repairs 15 Indian statutes with full section text
│   ├── scrape_international_treaties.py # Scrapes TRIPS, CBD, Nagoya, WIPO GRATK, PCT, Madrid, Budapest, etc.
│   ├── scrape_case_law.py             # Scrapes Indian Kanoon + curates Turmeric, Neem, Basmati, Novartis, Divya Pharmacy, 3(p), 3(e)
│   ├── scrape_pharmacopoeia.py        # First Schedule 54 texts, AFI formulations, API monographs, WHO plants
│   ├── scrape_memorandums.py          # AYUSH OMs, Rule 170 omission, CDSCO phytopharmaceuticals, NBA ABS 2025 slabs
│   ├── scrape_export_regimes.py       # EU THMPD, EU Novel Food, US DSHEA, US FDA Import Alert 54-15
│   └── run_full_pipeline.py           # Orchestrator running all scrapers, auditing records, and compiling master DB
├── corpus_audit_report.md     # Audit report verifying 0% empty records, total counts, and checksums
└── rag_database_master_v2.json # Consolidated master RAG corpus
```

---

## Proposed Changes

### Component 1: Scraping Engine Infrastructure

#### [NEW] [config.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/config.py)
- Configuration for all source URLs, target PDF links, HTML endpoints, timeout settings, polite request delays (1.5–3.0s), User-Agent headers, and UDO schema definitions.
- Defines validation thresholds: minimum text length per record (50 chars), required metadata keys, and deduplication checksums.

#### [NEW] [utils.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/utils.py)
- `RobustSession`: Requests session with retry adapter (3 retries, exponential backoff) and rate limiting.
- `download_pdf(url, save_path)`: Downloads binary PDF, verifies file signature (`%PDF-`), calculates SHA-256 hash.
- `extract_pdf_text(pdf_path)`: Extracts full text using PyMuPDF (`fitz`), cleans headers/footers, and joins hyphenated line breaks.
- `fetch_and_parse_html(url, save_path)`: Downloads raw HTML, extracts semantic content with BeautifulSoup, removing scripts, styles, and navigation chrome.
- `build_udo_record(...)`: Builds standard UDO JSON record with `doc_id`, `doc_type`, `title`, `content`, `content_plain`, `source`, `hierarchy`, `metadata`, `rag_config`, and `checksum`.

---

### Component 2: Domain-Specific Scraper Modules

#### [NEW] [scrape_indian_statutes.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/scrape_indian_statutes.py)
- **Patents Act, 1970**: Re-parses the full statutory text file and official PDF, skipping TOC pages and capturing full text of §§ 1 to 163, especially § 3(d), § 3(e), § 3(p), § 10(4), § 25, § 64, and § 84.
- **Patents Rules, 2003 & 2024 Amendment**: Re-parses Rules 1 to 138, capturing amended Rule 24B(1)(i) (RFE 31 months), Rule 29A, Rule 70A, and Rule 131 triennial Form 27.
- **Drugs & Cosmetics Act, 1940 & Rules, 1945**: Re-extracts Chapter IV-A (Sections 33A to 33O), First Schedule (all 54 authoritative classical texts), Schedule T (complete GMP requirements), Schedule E(1) (21 poisonous substances table), Rules 151-161 (ASU licensing), Rule 161B (shelf-life), and Rule 122-DAB (phytopharmaceuticals).
- **Biological Diversity Act, 2002 (as amended 2023) & Rules 2024**: Full extraction of ABS sections (§ 3, 6, 7, 7A, 21, 36) in English.
- **Drugs & Magic Remedies (OA) Act, 1954**: Complete sections 3, 4, 7 and the Schedule of 54 prohibited diseases.
- **Allied Statutes**: Trade Marks Act 1999 & Rules 2017, GI Act 1999 & Rules 2002, Copyright Act 1957 & Rules 2013, Designs Act 2000 & Rules 2001, PPV&FR Act 2001 & Rules 2003, FSSAI Act 2006 & FSSAI Ayurveda Aahar Regulations 2022, DPDP Act 2023, and AYUSH Patent Examination Guidelines 2025.

#### [NEW] [scrape_international_treaties.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/scrape_international_treaties.py)
- **WTO TRIPS**: Scrapes HTML, splits by Article (focusing on Art. 27.3(b), 29, 31, 33, 39).
- **CBD**: Scrapes HTML, extracts Art. 8(j) (traditional knowledge protection) and Art. 15 (access to genetic resources).
- **Nagoya Protocol**: Scrapes HTML, extracts Art. 5 to 12 (ABS, PIC, MAT, compliance checkpoints).
- **WIPO GRATK Treaty 2024**: Downloads official PDF (`gratk_dc_7.pdf`), extracts Articles on mandatory patent disclosure of origin for genetic resources and associated TK.
- **PCT, Madrid, Hague, Budapest, Paris, Berne, UPOV**: Extracts relevant articles governing priority, international filing, deposit of biological material, and plant variety rights.

#### [NEW] [scrape_case_law.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/scrape_case_law.py)
- **Indian Kanoon Scraper**: Extracts complete judgment texts for *Novartis AG v. Union of India* (2013 SC, § 3(d) therapeutic efficacy standard), *Divya Pharmacy v. Union of India* (Uttarakhand HC 2018, Indian entities liable for ABS), and Section 3(p) / 3(e) landmark decisions.
- **Curated Biopiracy Dossiers**: Downloads and structures complete case records for:
  - Turmeric Patent Revocation (USPTO 5,401,504, CSIR challenge based on ancient Sanskrit texts).
  - Neem Fungicidal Patent Revocation (EPO 0436257, biopiracy challenge).
  - Basmati Rice / RiceTec Patent (USPTO, geographical indication & prior art challenge).
  - Hoodia Gordonii Case (San people benefit-sharing model).

#### [NEW] [scrape_pharmacopoeia.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/scrape_pharmacopoeia.py)
- **First Schedule Treatises**: Full list and metadata of the 54 classical Ayurvedic texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Sharangadhara Samhita, Bhavaprakasha, Bhasajya Ratnavali, Sahasrayogam, etc.).
- **Ayurvedic Formulary of India (AFI)**: Core classical formulations database (classical recipes, ingredients, proportions, manufacturing methods, therapeutic indications, dosage forms).
- **Ayurvedic Pharmacopoeia of India (API)**: Core drug monographs (Sanskrit names, botanical names, plant parts used, macroscopic/microscopic identity standards, purity assays).
- **WHO Monographs on Selected Medicinal Plants**: Key international monographs for globally traded Ayurvedic botanicals (*Withania somnifera, Curcuma longa, Ocimum sanctum, Zingiber officinale*).

#### [NEW] [scrape_memorandums.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/scrape_memorandums.py)
- **Ministry of AYUSH Office Memorandums**:
  - OM regarding omission/withdrawal of Rule 170 of D&C Rules (advertising restrictions and Supreme Court directives).
  - OM on Voluntary Certification Schemes (AYUSH Standard Mark and AYUSH Premium Mark for ASU products).
  - OMs on standardization of classical ASU formulations and regulatory compliance.
- **CDSCO Circulars**: Phytopharmaceutical drug development guidance, regulatory pathways, and clinical trial requirements under New Drugs & Clinical Trials Rules 2019.
- **NBA ABS Regulations 2025**: Benefit-sharing slabs (0% for turnover < ₹5 Cr, 0.2% for ₹5–20 Cr, 0.4% for ₹20–100 Cr, 0.6% for > ₹100 Cr) and codified practitioner exemptions.

#### [NEW] [scrape_export_regimes.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/scrape_export_regimes.py)
- **EU THMPD (Directive 2004/24/EC)**: Full text HTML from EUR-Lex; extracts the 15-year/30-year traditional use evidence requirement and simplified registration procedure.
- **EU Novel Food Regulation (Regulation (EU) 2015/2283)**: Full text from EUR-Lex and status of traditional botanical ingredients.
- **US DSHEA (1994)**: Statutory text from GovInfo; extracts dietary supplement definition, safety standards, structure/function claim guidelines, and New Dietary Ingredient (NDI) 75-day premarket notification requirements.
- **US FDA Import Alert 54-15**: Detention without physical examination of Ayurvedic herbal products due to heavy metal contamination (lead, mercury, arsenic).
- **WHO Traditional Medicine Strategy**: Strategic objectives for regulatory integration and safety standards.

---

### Component 3: Pipeline Orchestration, Auditing & Master RAG Compiler

#### [NEW] [run_full_pipeline.py](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/corpus_vault/scrapers/run_full_pipeline.py)
- Master command-line orchestrator:
  - Accepts CLI flags: `--all`, `--statutes`, `--treaties`, `--cases`, `--pharmacopoeia`, `--memorandums`, `--export_regimes`.
  - Runs each scraper sequentially with real-time logging.
  - Validates every generated JSON file for schema integrity and non-emptiness.
  - Compiles `rag_database_master_v2.json` combining all domains with normalized doc_ids and citation formats.
  - Generates `corpus_vault/corpus_audit_report.md` documenting counts, quality metrics, and coverage.

---

## Verification Plan

### Automated Tests
1. **Zero Empty Record Audit**:
   - Run verification script:
     ```bash
     python -c "
     import json, glob
     for f in glob.glob('corpus_vault/structured_udo/*.json'):
         with open(f, 'r', encoding='utf-8') as fp:
             data = json.load(fp)
         empty = sum(1 for d in data if not d.get('content') or len(d.get('content').strip()) < 50)
         print(f'{f}: {len(data)} records, {empty} empty')
         assert empty == 0, f'Found empty records in {f}'
     "
     ```
2. **Key Provision Retrieval Verification**:
   - Verify presence and full content of critical sections:
     - Patents Act § 3(d), § 3(e), § 3(p), § 10(4)
     - Patents Rules 2024 Rule 24B(1)(i) (31 months)
     - D&C Act Chapter IV-A, First Schedule, Schedule T, Schedule E(1), Rule 161B
     - BDA 2002/2023 § 7, § 6
     - TRIPS Art. 27.3(b), Art. 39
     - CBD Art. 8(j), Art. 15
     - WIPO GRATK Treaty Art. 3
     - *Novartis v. UOI* (2013) & *Divya Pharmacy* (2018)
     - EU THMPD traditional use clause & US DSHEA NDI notification
3. **Master Database Integrity Check**:
   - Verify `rag_database_master_v2.json` loads cleanly, has valid JSON syntax, all entries contain required UDO keys (`doc_id`, `title`, `content`, `hierarchy`, `metadata`), and 0% empty records.

### Manual Verification
- Review generated `corpus_vault/corpus_audit_report.md` comparing record counts across all 6 domains against the SIH Data Acquisition Checklist.
