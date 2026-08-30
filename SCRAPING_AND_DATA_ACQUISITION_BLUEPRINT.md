# AYUSH IPR Guardian — Scraping &amp; Data Acquisition Blueprint

> **Generated**: August 30, 2026
> **Purpose**: Identify every data gap in the current RAG database vs. the Problem Statement requirements, and provide exact sources, methods, and formats to fill them.

---

## Current Database Status

| Statute/Source | Records | Empty/Truncated | Quality Rating |
|---|---|---|---|
| Patents Act, 1970 | 562 | 310 empty (60%) | POOR — needs re-scrape |
| Patents Rules, 2003 | 226 | 100 empty (58%) | POOR — needs re-scrape |
| Trade Marks Act, 1999 | 367 | 170 empty (50%) | POOR |
| Copyright Act, 1957 | 344 | 210 empty (67%) | BAD |
| Designs Act, 2000 | 99 | 35 empty (39%) | MODERATE |
| GI Act, 1999 | 193 | 87 empty (48%) | POOR |
| Biological Diversity Act, 2002 (Amd 2023) | 216 | 117 empty (58%) | BAD — Section 7 missing |
| Biological Diversity Act, 2024 | 110 | 8 empty (11%) | OK (but in Hindi) |
| Plant Varieties Act, 2001 | 204 | 88 empty (46%) | POOR |
| D&amp;C Act 1940 &amp; Rules 1945 | 3948 | 1989 empty (57%) | Huge but half empty |
| Drugs &amp; Magic Remedies Act, 1954 | 92 | 65 empty (73%) | BAD |
| DRDP Act, 2023 | 47 | 3 empty (6%) | GOOD |
| FSSAI Ayurveda, 2022 | 117 | 93 empty (88%) | TERRIBLE |
| Food Safety Act, 2006 | 102 | 0 empty (0%) | EXCELLENT |
| AYUSH Patent Guidelines, 2025 | 16 | 3 empty (25%) | OK |
| **TOTAL** | **6,643** | **~3,275 empty** | **49% of records are useless** |

> [!CAUTION]
> **49% of all database records are empty or have less than 5 characters of content.** The LLM correctly refuses to answer many questions because it literally has no data, not because the retriever failed.

---

## GAP ANALYSIS: What We Have vs. What the PS Requires

### CATEGORY 1: COMPLETELY MISSING DATA (Never Scraped)

These are entire corpora the Problem Statement demands that we have **zero data** for.

---

#### 1.1 International Treaties &amp; Frameworks

| # | Document | Why Needed (PS Requirement) | Source URL | Scraping Method | Format | Priority |
|---|---|---|---|---|---|---|
| T1 | **TRIPS Agreement** (WTO) | Art. 27.3(b) — patentability exclusions for plants/biological processes; Art. 31 compulsory licensing; Art. 39 trade secrets | `https://www.wto.org/english/docs_e/legal_e/27-trips_01_e.htm` | requests + BeautifulSoup — HTML page, split by Article number | HTML to JSON | **P0** |
| T2 | **Convention on Biological Diversity (CBD)** | Art. 8(j) — TK protection; Art. 15 — access to genetic resources; sovereign rights framework | `https://www.cbd.int/convention/text/` | requests — HTML; split by Article | HTML to JSON | **P0** |
| T3 | **Nagoya Protocol on ABS** | Art. 5-12 — access and benefit-sharing; prior informed consent; mutually agreed terms; India is a Party | `https://www.cbd.int/abs/text/` | requests — HTML; split by Article | HTML to JSON | **P0** |
| T4 | **WIPO GRATK Treaty 2024** | Landmark treaty requiring patent applicants to disclose country of origin of genetic resources / associated TK | `https://www.wipo.int/wipolex/en/treaties/textdetails/14838` | Download PDF then PyMuPDF extract then split by Article | PDF to JSON | **P0** |
| T5 | **Patent Cooperation Treaty (PCT)** | International patent filing; relevant for AYUSH products going global | `https://www.wipo.int/pct/en/texts/articles/atoc.html` | requests — HTML by Article and Rule | HTML to JSON | **P1** |
| T6 | **Madrid Protocol** (International TM Registration) | Ayurvedic brand global trademark protection | `https://www.wipo.int/wipolex/en/treaties/textdetails/12594` | PDF download then extract | PDF to JSON | **P1** |
| T7 | **Paris Convention for Industrial Property** | Art. 10bis — unfair competition; priority rights | `https://www.wipo.int/wipolex/en/treaties/textdetails/12633` | PDF then extract | PDF to JSON | **P2** |
| T8 | **Berne Convention for Copyright** | Copyright protection for classical text compilations | `https://www.wipo.int/wipolex/en/treaties/textdetails/12214` | PDF then extract | PDF to JSON | **P2** |
| T9 | **Budapest Treaty** | Micro-organism deposits for biotech patents | `https://www.wipo.int/wipolex/en/treaties/textdetails/12220` | PDF then extract | PDF to JSON | **P2** |
| T10 | **UPOV Convention** | Plant variety rights — overlaps with PPV&amp;FR Act | `https://www.upov.int/upovlex/en/conventions/1991/content.html` | HTML then extract | HTML to JSON | **P2** |

**Chunking Strategy**: Split by Article number. Each Article = 1 chunk. Metadata: `{treaty_name, article_number, article_title, year, jurisdiction: "International"}`.

---

#### 1.2 Case Law &amp; Judicial Precedents

| # | Case/Category | Why Critical | Source | Method | Priority |
|---|---|---|---|---|---|
| C1 | **Turmeric Patent Case** (USPTO 5,401,504, 1997) | Landmark — first TK patent revoked; prior art from ancient texts | PIB, CSIR archives, academic papers | Manual compilation from pib.gov.in, legal databases | **P0** |
| C2 | **Neem Patent Case** (EP 0436257, EPO 2000) | Fungicidal properties of neem — biopiracy challenge | EPO case records, academic papers | requests from open-access legal journals | **P0** |
| C3 | **Basmati Rice Patent** (RiceTec, USPTO 1997) | GI + plant variety + TK intersect | Academic papers, PIB | Manual + web scrape | **P0** |
| C4 | **Hoodia Case** (San People vs Phytopharm) | ABS and benefit sharing with indigenous communities | Academic papers | Manual compilation | **P1** |
| C5 | **Section 3(p) Cases** — TK as prior art | Direct relevance to AYUSH patent rejections | indiankanoon.org (search: "Section 3(p) Patents Act traditional knowledge") | Indian Kanoon API (Rs 0.50/search, Rs 0.20/doc, free Rs 10K/month for non-commercial) | **P0** |
| C6 | **Section 3(d) Cases** — known substance new form | Novartis v. Union of India (Glivec) — directly impacts AYUSH formulation patents | Indian Kanoon API | API query: "Section 3(d) known substance" | **P0** |
| C7 | **Section 3(e) Cases** — mere admixture | Crucial for multi-herb Ayurvedic formulations | Indian Kanoon API | API query: "Section 3(e) mere admixture" | **P0** |
| C8 | **GI Registration Cases** — Ayurvedic products | Darjeeling Tea GI, Kerala Ayurveda GI attempts | Indian Kanoon + GI Registry | Search: "geographical indication ayurvedic" | **P1** |
| C9 | **Pre-grant/Post-grant Opposition Decisions** | Real examples of AYUSH patent challenges | IPO Annual Reports, InPASS | Manual from ipindia.gov.in annual reports | **P1** |
| C10 | **HuggingFace Indian Legal Dataset** | Bulk Indian legal corpus — 10K+ judgments | huggingface.co/datasets/d-riti/Dataset-For-Indian-Legal-Knowledge-Base | huggingface_hub Python library, filter for IP/TK cases | **P1** |

**Indian Kanoon API Access**:
```
Endpoint: https://api.indiankanoon.org/
Auth: Public-private key pair (register at https://api.indiankanoon.org/)
Rate: Non-commercial = Rs 10,000 free credits/month
Search: POST /search?formInput="Section 3(p) traditional knowledge"
Document: GET /doc/{docid}
Cost: ~Rs 0.50/search + Rs 0.20/document
```

---

#### 1.3 Pharmacopoeial &amp; Classical Texts

| # | Document | Why Needed | Source | Method | Priority |
|---|---|---|---|---|---|
| PH1 | **Ayurvedic Pharmacopoeia of India (API)** Vols I-IX | Drug monographs — name, ingredients, method, standards; defines "classical" formulations | archive.org (search "Ayurvedic Pharmacopoeia of India"), pcimh.gov.in | Download PDFs then Surya OCR (scanned) then Structure by monograph | **P0** |
| PH2 | **Ayurvedic Formulary of India (AFI)** Parts I &amp; II | The "First Schedule" — lists all classical formulations; defines what is Classical vs Proprietary | archive.org, pcimh.gov.in | Same as PH1 | **P0** |
| PH3 | **e-Samhita** (Charaka, Sushruta, Ashtanga Hridaya) | Ancient authoritative texts — prior art for patent challenges | niimh.nic.in/ebooks/ | Playwright — dynamic JS pages, extract chapter/verse structure | **P1** |
| PH4 | **Siddha Pharmacopoeia of India** | Siddha system formulations | pcimh.gov.in | PDF download + OCR | **P2** |
| PH5 | **Unani Pharmacopoeia of India** | Unani system formulations | pcimh.gov.in | PDF download + OCR | **P2** |
| PH6 | **WHO Monographs on Medicinal Plants** | International recognition of Ayurvedic herbs | who.int/publications (search "medicinal plants") | Direct PDF download then extract | **P1** |
| PH7 | **DRAVYA Portal (CCRAS)** | Ayurvedic substance database — botanical names, parts used, therapeutic uses | ccras.nic.in then DRAVYA portal link | Playwright (dynamic JS) — scrape substance records | **P1** |

---

#### 1.4 Regulatory Frameworks &amp; Guidelines (MISSING)

| # | Document | Why Critical | Source | Method | Priority |
|---|---|---|---|---|---|
| R1 | **Biological Diversity Rules, 2024** | New rules implementing BD Amendment Act 2023; ABS procedures | wipo.int/wipolex/en/legislation/details/22421 OR sbb.uk.gov.in | Download PDF then PyMuPDF then split by Rule number | **P0** |
| R2 | **Patents (Amendment) Rules, 2024** | RFE timeline reduced to 31 months; Form 3/27 changes | ipindia.gov.in then Rules section | Download PDF then extract | **P0** |
| R3 | **Trade Marks Rules, 2017** | Current TM procedure/forms | ipindia.gov.in then TM Rules | PDF then extract | **P1** |
| R4 | **GI of Goods Rules, 2002** | GI registration procedure for Ayurvedic products | ipindia.gov.in then GI Rules | PDF then extract | **P1** |
| R5 | **Designs Rules, 2001** | Design registration for Ayurvedic packaging/devices | ipindia.gov.in then Design Rules | PDF then extract | **P2** |
| R6 | **Copyright Rules, 2013** | Copyright for compilations/classical texts | copyright.gov.in | PDF then extract | **P2** |
| R7 | **PPV&amp;FR Rules, 2003** | Plant variety registration procedure | plantauthority.gov.in | PDF then extract | **P2** |
| R8 | **Schedule T** (D&amp;C Rules 1945) | GMP for ASU drug manufacturing — mandatory compliance | cdsco.gov.in | Already in D&amp;C data but heavily truncated; need full re-scrape | **P0** |
| R9 | **Schedule E(1)** — Poisonous Substances List | List of restricted Ayurvedic ingredients requiring special handling | cdsco.gov.in | Part of D&amp;C Rules; extract specifically | **P1** |
| R10 | **First Schedule** (D&amp;C Act) — Authoritative Texts | Official list of 57 classical texts recognized as authoritative | Same source | Part of D&amp;C Act; re-extract this specific schedule | **P0** |
| R11 | **AYUSH Premium Mark Guidelines** | Quality certification for AYUSH products | main.ayush.gov.in | PDF then extract | **P1** |
| R12 | **Phytopharmaceutical Drug Pathway** (Rule 122-DAB) | New drug approval pathway for plant-based drugs | cdsco.gov.in | Part of D&amp;C Rules; extract specifically | **P1** |
| R13 | **Cosmetics Rules, 2020** | Ayurvedic cosmetics regulation | cdsco.gov.in | PDF then extract | **P2** |
| R14 | **Digital Personal Data Protection Act, 2023** | DPDP compliance for the app itself | indiacode.nic.in | requests + BS4 then split by Section | **P1** |

---

#### 1.5 Global Market Access &amp; Export Compliance (COMPLETELY MISSING)

| # | Topic | Why Needed | Source | Method | Priority |
|---|---|---|---|---|---|
| E1 | **EU: THMPD 2004/24/EC** | EU market access for Ayurvedic medicines | eur-lex.europa.eu | requests then extract full Directive text | **P0** |
| E2 | **EU: Novel Food Regulation** (EC 2015/2283) | Many Ayurvedic ingredients classified as "novel food" in EU | eur-lex.europa.eu | requests then extract | **P1** |
| E3 | **EU: Novel Food Catalogue** — Herb entries | Specific status of Ayurvedic herbs | ec.europa.eu/food/food-feed-portal | Playwright (dynamic search) | **P1** |
| E4 | **US: DSHEA** (1994) | US market — Ayurvedic products as dietary supplements | fda.gov | requests then extract | **P0** |
| E5 | **US: FDA Import Alerts** for Ayurvedic Products | FDA seizure/detention history | fda.gov/industry/actions-enforcement/import-alerts | requests + BS4 | **P1** |
| E6 | **Japan: PMD Act** | Japanese market access for herbal medicines | pmda.go.jp/english/ | Manual + requests | **P2** |
| E7 | **Australia: TGA** | Australian regulatory pathway for AYUSH | tga.gov.au | Manual + requests | **P2** |
| E8 | **Canada: Natural Health Products Regulations** | Canadian pathway | laws-lois.justice.gc.ca | requests then extract | **P2** |
| E9 | **ASEAN: MRA** for Traditional Medicines | Southeast Asian market access | ASEAN Secretariat website | Manual + PDF | **P2** |
| E10 | **WHO: Traditional Medicine Strategy** (2014-2023) | Global policy framework | who.int/publications | PDF download | **P1** |

---

#### 1.6 TKDL &amp; Prior Art References

| # | Source | Status | Strategy |
|---|---|---|---|
| TK1 | **TKDL** (tkdl.res.in) | RESTRICTED — 500K+ formulations | Cannot directly ingest. Build a TKDL Pointer Module with reference records |
| TK2 | **TKDL Representative Database** | ~1,250 public samples | Playwright then scrape sample entries |
| TK3 | **TKRC Classification System** | Published in academic papers | Manual compilation |
| TK4 | **TKDL Access Agreements** | csir.res.in, WIPO publications | Manual |

---

### CATEGORY 2: EXISTING BUT HEAVILY TRUNCATED (Needs Re-Scrape)

| # | Source | Current State | Problem | Fix |
|---|---|---|---|---|
| FIX1 | **Patents Act, 1970** | 562 records, 310 empty (60%) | Scraper captured title but not body | Re-scrape from India Code using Playwright |
| FIX2 | **Patents Rules, 2003** | 226 records, 100 empty (58%) | Rule titles without content | Re-scrape; include all Rules + Forms |
| FIX3 | **Copyright Act, 1957** | 344 records, 210 empty (67%) | Worst quality among existing statutes | Full re-scrape from India Code |
| FIX4 | **Drugs &amp; Magic Remedies Act, 1954** | 92 records, 65 empty (73%) | Critical for Ayurvedic advertising; almost entirely empty | Full re-scrape |
| FIX5 | **FSSAI Ayurveda Regulations, 2022** | 117 records, 93 empty (88%) | 68 avg chars/record — blank | Full re-scrape from FSSAI portal |
| FIX6 | **Biological Diversity Act, 2002 (Amd 2023)** | 216 records, 117 empty (58%) | Section 7 (ABS exemption for AYUSH) is MISSING | Re-scrape Sections 3, 7, 7A, 36 |
| FIX7 | **D&amp;C Act 1940 &amp; Rules 1945** | 3948 records, 1989 empty (57%) | Half empty; Schedule T truncated | Selective re-scrape of key Schedules |
| FIX8 | **Trade Marks Act, 1999** | 367 records, 170 empty (50%) | Half the sections have no body | Re-scrape from India Code |
| FIX9 | **GI Act, 1999** | 193 records, 87 empty (48%) | Half empty | Re-scrape |
| FIX10 | **Plant Varieties Act, 2001** | 204 records, 88 empty (46%) | Half empty | Re-scrape |

> [!IMPORTANT]
> **Re-scraping all 10 broken statutes from India Code is the single highest-ROI action.** It would upgrade 3,275 empty records into usable content and immediately improve benchmark scores by 30-40%.

---

### CATEGORY 3: ADEQUATE (No Action Needed Now)

| Source | Records | Quality | Notes |
|---|---|---|---|
| Food Safety Act, 2006 | 102 | Excellent (0% empty) | Best quality in DB |
| DRDP Act, 2023 | 47 | Good (6% empty) | Solid |
| AYUSH Patent Guidelines, 2025 | 16 | OK (25% empty) | Usable |
| Biological Diversity Act, 2024 | 110 | OK (11% empty) | Hindi version — add English too |

---

## SCRAPING METHODOLOGY — HOW TO SCRAPE EACH SOURCE

### Method 1: India Code (indiacode.nic.in) — For All Indian Statutes

```python
from playwright.sync_api import sync_playwright

def scrape_india_code(act_id, output_path):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"https://www.indiacode.nic.in/handle/123456789/{act_id}")
        page.wait_for_load_state("networkidle")
        sections = page.query_selector_all(".section-link")
        results = []
        for sec in sections:
            sec.click()
            page.wait_for_selector(".section-content")
            title = page.inner_text(".section-title")
            content = page.inner_text(".section-content")
            results.append({
                "title": title, "content": content,
                "source": {"name": "Act Name", "type": "central_act"},
                "metadata": {"jurisdiction": "India"}
            })
```

### Method 2: E-Gazette — For Rules &amp; Amendments

```python
import fitz, requests, re

def scrape_gazette_pdf(pdf_url, output_path, rule_prefix="Rule"):
    resp = requests.get(pdf_url, headers={"User-Agent": "Mozilla/5.0"})
    with open("temp.pdf", "wb") as f:
        f.write(resp.content)
    doc = fitz.open("temp.pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + "\n"
    chunks = re.split(r'\n(?=\d+\.\s)', full_text)
    # Process chunks into JSON records...
```

### Method 3: WIPO Lex — For International Treaties

```python
import requests
from bs4 import BeautifulSoup

WIPO_TREATIES = {
    "TRIPS": "https://www.wto.org/english/docs_e/legal_e/27-trips_01_e.htm",
    "CBD": "https://www.cbd.int/convention/text/",
    "Nagoya": "https://www.cbd.int/abs/text/",
}

def scrape_treaty_html(name, url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    articles = []
    for heading in soup.find_all(['h2', 'h3', 'h4']):
        if 'Article' in heading.get_text():
            content = []
            sibling = heading.find_next_sibling()
            while sibling and sibling.name not in ['h2', 'h3', 'h4']:
                content.append(sibling.get_text(strip=True))
                sibling = sibling.find_next_sibling()
            articles.append({
                "title": heading.get_text(strip=True),
                "content": "\n".join(content),
                "source": {"name": name, "type": "international_treaty"},
            })
    return articles
```

### Method 4: Indian Kanoon API — For Case Law

```python
API_BASE = "https://api.indiankanoon.org"
SEARCH_QUERIES = [
    "Section 3(p) Patents Act traditional knowledge",
    "Section 3(d) known substance new form ayurvedic",
    "Section 3(e) mere admixture combination",
    "biopiracy traditional knowledge India",
    "TKDL prior art patent",
    "ayurvedic patent opposition",
    "herbal formulation patentability inventive step",
]
# Budget: Rs 25 total (within free Rs 10K/month credit)
```

### Method 5: Archive.org + Surya OCR — For Pharmacopoeia

```python
from surya.ocr import run_ocr
import fitz

def ocr_pharmacopoeia(pdf_path):
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(dpi=300)
        # OCR with Surya for Hindi+English...
```

### Method 6: HuggingFace Datasets

```python
from datasets import load_dataset
ds = load_dataset("d-riti/Dataset-For-Indian-Legal-Knowledge-Base")
ip_cases = [row for row in ds['train']
    if any(t in row['text'].lower() for t in [
        'patent', 'trademark', 'traditional knowledge', 'ayurved',
        'section 3(p)', 'section 3(d)', 'biopiracy'
    ])]
```

---

## SPECIFIC BENCHMARK FAILURES — Root Causes

| Gap | Failed Question | Root Cause | Fix |
|---|---|---|---|
| Gap 1 | "Did 2023 Amendment exempt AYUSH practitioners from SBB intimation?" | bioDivAct 2002-(amd)2023.json Section 7 has no body content | Re-scrape Sections 7, 7A, 36 |
| Gap 2 | Anything about TRIPS, Nagoya, WIPO GRATK, CBD | Zero treaty records in database | Scrape treaties T1-T10 |
| Gap 3 | "Turmeric Patent case?", "Section 3(p) application?" | Zero case law records | Scrape cases C1-C10 |
| Gap 4 | EU/US/Japan export requirements | Zero international regulatory data | Scrape sources E1-E10 |
| Gap 5 | "Is Ashokarishta classical?", "First Schedule contents?" | No pharmacopoeial data | OCR pharmacopoeia PH1-PH7 |

---

## PRIORITIZED EXECUTION PLAN (21 Days)

### Phase 1: Critical Fixes (Day 1-2)

| Task | Method | Records | Time |
|---|---|---|---|
| Re-scrape BioDiversity Act Sec 7/7A/36 | Manual from Gazette PDF | 5-10 | 1 hour |
| Re-scrape worst statutes (Copyright, Drugs&amp;Magic, FSSAI) | Playwright | ~500 | 4 hours |
| Write TRIPS Agreement (Arts 27, 28, 29, 31, 33, 39) | requests + BS4 | 10-15 | 1 hour |
| Write CBD + Nagoya Protocol key articles | requests | 15-20 | 1 hour |
| Manually compile 5 landmark cases | Manual from PIB | 5-15 | 3 hours |

**Result**: +550 quality records. Fixes 80% of benchmark failures.

### Phase 2: Statute Repair (Day 3-5)

| Task | Method | Records | Time |
|---|---|---|---|
| Re-scrape Patents Act 1970 | Playwright | 200+ | 3 hours |
| Re-scrape Trade Marks Act 1999 | Playwright | 180+ | 3 hours |
| Re-scrape GI Act 1999 | Playwright | 100+ | 2 hours |
| Scrape Patents Rules 2024 | PDF + PyMuPDF | 80+ | 2 hours |
| Scrape Biodiversity Rules 2024 | PDF + PyMuPDF | 60+ | 2 hours |
| Extract Schedule T, E(1), First Schedule | Re-process PDF | 100+ | 3 hours |

**Result**: +720 quality records.

### Phase 3: International Coverage (Day 6-8)

| Task | Method | Records |
|---|---|---|
| WIPO GRATK Treaty 2024 | PDF from WIPO Lex | 20-30 |
| PCT key articles | HTML from WIPO | 20-30 |
| Madrid Protocol | PDF from WIPO Lex | 15-20 |
| EU THMPD | EUR-Lex HTML | 30-40 |
| US DSHEA | FDA website | 20-30 |
| WHO Traditional Medicine Strategy | WHO PDF | 10-15 |

**Result**: +130 records.

### Phase 4: Case Law &amp; Pharmacopoeia (Day 9-14)

| Task | Method | Records |
|---|---|---|
| Indian Kanoon API — 50 IPR/TK cases | API (Rs 25 budget) | 50-100 |
| HuggingFace Indian Legal Dataset | datasets library | 100-200 |
| OCR Ayurvedic Pharmacopoeia Vol I-II | Surya OCR / PyMuPDF | 200-300 |
| OCR Ayurvedic Formulary Parts I-II | Same | 300-500 |
| Scrape DRAVYA Portal (CCRAS) | Playwright | 100-200 |

**Result**: +750-1300 records.

### Phase 5: TKDL &amp; Enrichment (Day 15-21)

| Task | Method | Records |
|---|---|---|
| Build TKDL Pointer Module | Manual knowledge engineering | 20-30 |
| Scrape e-Samhita (Charaka, Sushruta) | Playwright on NIIMH | 100-200 |
| Compile TKRC Classification System | Academic papers | 10-15 |
| Scrape InPASS for AYUSH patents | Playwright | 50-100 |
| Scrape GI Registry records | PDF lists | 30-50 |

**Result**: +210-395 records.

---

## OUTPUT FORMAT SPECIFICATION

Every scraped record MUST conform to this schema:

```json
{
  "title": "Section 3(p) — Inventions relating to traditional knowledge",
  "content": "Full text of the section. Minimum 50 characters. Must contain actual substantive content.",
  "source": {
    "name": "Patents Act, 1970",
    "type": "central_act | subordinate_legislation | international_treaty | case_law | pharmacopoeia | guideline",
    "url": "https://source-url.com/exact-page"
  },
  "metadata": {
    "section_number": "3(p)",
    "jurisdiction": "India | International | EU | US | Japan",
    "year": "1970",
    "last_amended": "2024",
    "cross_references": ["Section 25(1)(k)", "TKDL"],
    "keywords": ["traditional knowledge", "prior art", "patent bar"],
    "language": "en"
  }
}
```

> [!WARNING]
> **NEVER save a record with empty or less-than-30-character content.** This is the root cause of 49% of current database being useless.

---

## ESTIMATED FINAL DATABASE SIZE

| Category | Current Records | After Scraping | Quality |
|---|---|---|---|
| Indian Statutes and Rules | 6,643 (49% empty) | ~5,000 (0% empty) | Full text |
| International Treaties | 0 | ~250 | Article-level |
| Case Law and Precedents | 0 | ~300-500 | Structured |
| Pharmacopoeia and Classical | 0 | ~500-800 | Monograph-level |
| Export/Market Access | 0 | ~150 | Per-jurisdiction |
| TKDL Pointers | 0 | ~50 | Reference |
| **TOTAL** | **6,643 (3,275 usable)** | **~6,250-6,750 (all usable)** | **100% quality** |

> [!IMPORTANT]
> The target database doubles usable content from ~3,275 to ~6,750 records, covering 5 entirely new domains.

---

## TOOLS AND DEPENDENCIES

```bash
pip install playwright requests beautifulsoup4 PyMuPDF lxml
pip install surya-ocr  # For scanned Pharmacopoeia PDFs
pip install datasets huggingface_hub  # For HuggingFace datasets
playwright install chromium
# Indian Kanoon API: register at https://api.indiankanoon.org/
```

---

## QUALITY ASSURANCE CHECKLIST

- [ ] Every content field has 50+ characters of meaningful text
- [ ] Every source.name matches an existing source or creates a new valid one
- [ ] Every source.type is one of the enum values above
- [ ] metadata.jurisdiction is set correctly
- [ ] Section numbers extracted and stored
- [ ] Cross-references captured
- [ ] No duplicate records
- [ ] Records sorted logically
- [ ] UTF-8 encoding throughout
- [ ] Master database JSON valid and parseable after merge

---

> **Document Version**: 1.0 | **For Project**: AYUSH IPR Guardian (SIH 2026)
