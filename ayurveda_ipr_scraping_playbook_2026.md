# Ayurveda IPR Assistant — Source-by-Source Scraping Playbook

> **Verified URLs, Exact Endpoints, What to Scrape, How to Scrape, Feasibility, Blockers**
> Generated: August 27, 2026 — After live verification of every source

---

## HOW TO READ THIS DOCUMENT

For **every single data source** your PS requires, this document answers:
1. **What PS capability needs this data?** (links to the 6 capabilities)
2. **Exact verified URL** — tested live, with fallback URLs
3. **What data to extract** — exact fields, not vague descriptions
4. **How to extract it** — tool, method, code patterns, selectors
5. **Feasibility rating** — ✅ Easy / ⚠️ Medium / 🔴 Hard / ❌ Blocked
6. **Blockers** — CAPTCHAs, auth, rate limits, legal risks
7. **Estimated records and time**

---

## PS CAPABILITY → DATA MAPPING

Before diving into sources, here's what each PS capability needs:

| PS Capability | Required Data Sources |
|---|---|
| **1. Formulation Classifier** | API Monographs, AFI Formulations, e-Samhita Classical Texts, D&C Act (Rules 151-161, First Schedule), FSSAI Aahar Regulations |
| **2. IPR Router** | Patents Act S.3(d/e/p), AYUSH Examination Guidelines 2025, Trade Marks Act, GI Act, Copyright Act, Designs Act, Plant Variety Act, Existing Patent Records |
| **3. ABS Compliance Engine** | Biological Diversity Act 2002 (amended 2023), Biodiversity Rules 2024, ABS Regulations 2025, NBA Portal data, CBD ABSCH data |
| **4. Prior Art / TKDL Pointer** | TKDL classification codes (pointer only), API drug monographs, AFI formulations, Google BigQuery patents, WIPO PATENTSCOPE, EPO OPS |
| **5. Jurisdiction Toggle** | All Indian statutes + TRIPS, CBD, Nagoya Protocol, WIPO GRATK 2024, PCT, Madrid, EU THMPD, US DSHEA |
| **6. Source Citation Engine** | ALL of the above — every data point must have provenance |

---

## SOURCE 1: INDIAN STATUTES (17 Acts + Rules)

### 1A. India Code — All Central Acts

| Field | Detail |
|---|---|
| **PS Need** | Capabilities 1, 2, 3, 5, 6 — the foundation of everything |
| **Old URL** | ~~`https://indiacode.nic.in`~~ — **MIGRATED**, auto-redirects |
| **New URL** | `https://indiacode.gov.in` |
| **Status** | ⚠️ **Site returned 502 during live test** (Aug 27, 2026). The migration from `.nic.in` to `.gov.in` is in progress. May be intermittent. |
| **Fallback URL 1** | `https://www.indiacode.nic.in/handle/123456789/1362` (DSpace handles still resolve for some acts) |
| **Fallback URL 2** | `https://legislative.gov.in/acts-of-parliament/` (Legislative Dept, PDFs of Acts) |
| **Fallback URL 3** | `https://egazette.gov.in` (Gazette notifications for amendments) |
| **Feasibility** | ⚠️ Medium — site is JS-heavy, intermittent 502s, no API |

#### What to Scrape — Per Statute

For each of the 17 statutes listed in the PS, you need:

| Field | Example (Patents Act, 1970) |
|---|---|
| Act Name | Patents Act, 1970 |
| Act Number | 39 of 1970 |
| Ministry | Ministry of Commerce & Industry |
| Section Number | 3 |
| Section Title | Inventions Not Patentable |
| Sub-section | (p) |
| Full Text | "an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components." |
| Provisos | Any proviso text within the section |
| Explanations | Any explanation text within the section |
| Cross-references | Other sections mentioned (e.g., "under section 25") |
| Amendment history | "[Inserted by Act 15 of 2005, s. 3]" |
| Effective Date | Date section came into force |
| Schedules | First Schedule, Second Schedule etc. as separate records |

#### How to Scrape

```
PRIMARY METHOD: Playwright (headless browser)
Reason: indiacode.gov.in uses dynamic JS rendering, not static HTML

Step 1: Launch Playwright Chromium
Step 2: Navigate to https://indiacode.gov.in
Step 3: Use search bar to find each Act by name
Step 4: Each Act page has a Table of Contents (left pane) with chapter/section links
Step 5: Click each section → extract from the content pane:
   - CSS selector for section number: look for <b> or <strong> tags with "Section X."
   - Section text is in the main content div
   - Provisos usually start with "Provided that"
   - Explanations start with "Explanation.—"
Step 6: For each section, extract cross-references with regex:
   regex: r"(?:section|Section|s\.)\s*(\d+[A-Z]?)"
Step 7: Check for amendment footnotes — usually in square brackets or parentheses at bottom

FALLBACK METHOD: Direct PDF download from legislative.gov.in
Step 1: Navigate to https://legislative.gov.in/acts-of-parliament/
Step 2: Download PDF of each Act
Step 3: Process with PyMuPDF (fitz):
   import fitz
   doc = fitz.open("patents_act_1970.pdf")
   for page in doc:
       text = page.get_text("text")
Step 4: Split into sections using regex:
   regex: r"(\d+[A-Z]?)\.\s+([A-Z][^.]+\.)\s*—"
   This captures: section_number, section_title
Step 5: Extract everything between two section headers as section body
```

#### The 17 Statutes — Exact Download Locations

| # | Statute | Direct URL / How to Find | Format |
|---|---------|--------------------------|--------|
| 1 | Patents Act, 1970 | `https://indiacode.gov.in` → search "Patents Act 1970" **OR** `https://legislative.gov.in` → search | HTML/PDF |
| 2 | Patents Rules, 2003 (amended 2024) | `https://ipindia.gov.in/acts-and-rules.htm` → "Patent Rules" link | PDF |
| 3 | AYUSH Patent Examination Guidelines, 2025 | `https://ipindia.gov.in/guidelines-patents.htm` → "Guidelines for Examination of Ayush Related Inventions-2025" | PDF |
| 4 | Trade Marks Act, 1999 | `https://indiacode.gov.in` → search **OR** `https://ipindia.gov.in/acts-and-rules.htm` | HTML/PDF |
| 5 | Geographical Indications Act, 1999 | `https://ipindia.gov.in/acts-and-rules.htm` → GI section | PDF |
| 6 | Copyright Act, 1957 | `https://copyright.gov.in/Documents/CopyrightRules1702.pdf` **OR** `https://indiacode.gov.in` | PDF/HTML |
| 7 | Designs Act, 2000 | `https://ipindia.gov.in/acts-and-rules.htm` → Designs section | PDF |
| 8 | Plant Variety Protection Act, 2001 | `https://plantauthority.gov.in/` → legislation section **OR** `https://indiacode.gov.in` | PDF |
| 9 | Biological Diversity Act, 2002 (amended 2023) | `https://nbaindia.nic.in/` → Legislation → Act link **OR** `https://egazette.gov.in` for 2023 amendment | PDF |
| 10 | Biological Diversity Rules, 2024 | `https://nbaindia.nic.in/` → Legislation → Rules **OR** `https://egazette.gov.in` | PDF |
| 11 | ABS Regulations, 2025 | `https://nbaindia.nic.in/` → Regulations **OR** gazette notification on `https://egazette.gov.in` | PDF |
| 12 | Drugs & Cosmetics Act, 1940 | `https://cdsco.gov.in/opencms/opencms/en/Acts-Rules/` → D&C Act | PDF |
| 13 | D&C Rules, 1945 | `https://cdsco.gov.in/opencms/opencms/en/Acts-Rules/` → D&C Rules | PDF |
| 14 | Drugs & Magic Remedies (OA) Act, 1954 | `https://cdsco.gov.in/opencms/opencms/en/Acts-Rules/` | PDF |
| 15 | FSSAI Act, 2006 | `https://www.fssai.gov.in/cms/food-safety-and-standards-act-2006.php` | PDF |
| 16 | FSSAI Ayurveda Aahar Regulations, 2022 | `https://www.fssai.gov.in/cms/food-safety-and-standards-regulations.php` → notifications section OR `https://egazette.gov.in` (Gazette May 6, 2022) | PDF |
| 17 | DPDP Act, 2023 | `https://www.meity.gov.in/data-protection-framework` **OR** `https://egazette.gov.in` | PDF |

#### Rate Limiting & Estimates

| Metric | Value |
|---|---|
| Total sections across 17 statutes | ~1,700–2,200 |
| Rate limit | 1 request per 2–3 seconds (be conservative) |
| Estimated time | 2–4 hours (with retries for 502s) |
| Output | ~2,200 UDO records |
| Feasibility | ⚠️ Medium — intermittent availability of `indiacode.gov.in`; use PDF fallback |

> [!WARNING]
> **India Code has migrated from `.nic.in` to `.gov.in`** — the old URL in the previous data spec is WRONG. The new site returned 502 on our test. **Always have the PDF fallback from `legislative.gov.in` and `ipindia.gov.in` ready.**

---

## SOURCE 2: PHARMACOPOEIAL & CLASSICAL TEXTS

### 2A. Ayurvedic Pharmacopoeia of India (API) — Drug Monographs

| Field | Detail |
|---|---|
| **PS Need** | Capability 1 (Formulation Classifier), Capability 4 (Prior Art) |
| **URL** | `https://archive.org/search?query=ayurvedic+pharmacopoeia+india` |
| **Alternate** | `https://pcimh.gov.in` (Pharmacopoeia Commission for Indian Medicine & Homoeopathy) |
| **Format** | Scanned PDFs on archive.org; Angular SPA on pcimh.gov.in |
| **Feasibility** | ⚠️ Medium — PDFs need OCR; pcimh.gov.in is an Angular app (server-side rendered) |

#### What to Scrape — Per Drug Monograph

| Field | What It Looks Like |
|---|---|
| Drug name (Sanskrit) | ASHWAGANDHA |
| Drug name (Hindi) | Asgandh |
| Drug name (English) | Winter Cherry |
| Botanical name | Withania somnifera (Linn.) Dunal. |
| Family | Solanaceae |
| Synonyms (Sanskrit, Hindi, English) | Lists of alternate names |
| Part Used | Root / Leaf / Whole plant |
| Macroscopic description | Physical appearance description |
| Microscopic description | Cellular structure |
| Identity/Purity/Strength | Foreign matter %, Total ash %, Extractive values |
| Chemical constituents | Withanolides, alkaloids, etc. |
| Actions (Ayurvedic) | Balya, Vajikara, Rasayana |
| Therapeutic uses | Kshaya, Vatavyadhi |
| Dose | 3-6g powder form |
| Important formulations | Cross-references to AFI formulations |

#### How to Scrape

```
METHOD 1: Archive.org PDF Download + OCR

Step 1: Search archive.org
   URL: https://archive.org/search?query=ayurvedic+pharmacopoeia+india
   Navigate results to find each volume (Vol I–IX Part I, Vol I–III Part II)

Step 2: Download PDFs
   Each volume has a "Download Options" panel → select PDF
   Direct download pattern: https://archive.org/download/{ITEM_ID}/{filename}.pdf

Step 3: OCR with Surya OCR v2 (recommended) or Tesseract
   # Surya OCR (better for mixed Hindi-English)
   pip install surya-ocr
   surya_ocr input.pdf --lang en,hi --output-format markdown

   # Fallback: Tesseract
   pip install pytesseract pdf2image
   from pdf2image import convert_from_path
   import pytesseract
   images = convert_from_path("api_vol1.pdf")
   for img in images:
       text = pytesseract.image_to_string(img, lang='eng+hin')

Step 4: Parse monographs from OCR output
   Each monograph starts with drug name in ALL CAPS on a new page
   Regex patterns:
   - Drug name: r"^([A-Z][A-Z\s]+)\n"
   - Botanical: r"([A-Z][a-z]+\s[a-z]+)\s*\((.*?)\)"
   - Family: r"Fam\.\s*([A-Za-z]+)"
   - Part Used: r"Part\s+Used[:\s]*(.*)"
   - Dose: r"Dose[:\s]*(.*)"
   - Formulations: r"Important\s+Formulations?[:\s]*(.*(?:\n(?!\n).*)*)"

Step 5: Quality check — manually verify 10% of OCR output

METHOD 2: PCIMH Portal (https://pcimh.gov.in)
   Problem: Angular SPA — content loads via JavaScript
   Solution: Use Playwright to render the page, then extract
   Note: PCIMH may have digital versions of recent volumes
   The site is fairly new (launched ~2025), check for downloadable PDFs under publications
```

#### Volumes to Download

| Volume | Content | Approx Monographs |
|---|---|---|
| Vol I, Part I | Single drugs (A-Z first batch) | ~80 |
| Vol II, Part I | Single drugs (continued) | ~75 |
| Vol III, Part I | Single drugs (continued) | ~70 |
| Vol IV, Part I | Single drugs (continued) | ~70 |
| Vol V, Part I | Single drugs (continued) | ~60 |
| Vol VI, Part I | Single drugs (continued) | ~60 |
| Vol VII–IX, Part I | Additional single drugs | ~100 |
| Vol I, Part II | Formulations | ~200 |
| Vol II, Part II | Formulations | ~150 |
| Vol III, Part II | Formulations | ~100 |

| Metric | Value |
|---|---|
| Total monographs | ~600+ single drugs |
| OCR time (Surya) | ~6 hours for all volumes |
| Output | ~600 UDO records (monographs) |
| Feasibility | ⚠️ Medium — OCR quality on old scanned PDFs can be ~85%; needs manual cleanup for Sanskrit terms |

### 2B. Ayurvedic Formulary of India (AFI) — Classical Formulations

| Field | Detail |
|---|---|
| **PS Need** | Capability 1 (Formulation Classifier — "is this a classical formulation?"), Capability 4 (Prior Art) |
| **URL** | `https://archive.org/search?query=ayurvedic+formulary+india` |
| **Alternate** | May be available on `https://pcimh.gov.in` |
| **Format** | Scanned PDFs |
| **Feasibility** | ⚠️ Medium — same OCR challenge as API |

#### What to Scrape — Per Formulation

| Field | Example |
|---|---|
| Formulation name | Triphala Churna |
| Formulation type | Classical / Proprietary |
| Dosage form | Churna (Powder) / Asava / Arishta / Taila etc. |
| Reference text | Sarangadhara Samhita, Madhyama Khanda 6/12 |
| Ingredients list | Name (Sanskrit + Botanical), Part used, Proportion |
| Method of preparation | Cleaning, drying, powdering, mixing steps |
| Dose | 3-6g |
| Anupana (vehicle) | Warm water, honey, ghee |
| Therapeutic uses | Vibandha (constipation), Netra Roga (eye diseases) |
| Is in First Schedule? | Yes/No — critical for classifier |

#### How to Scrape

Same as API (Section 2A) — download PDFs from archive.org, OCR with Surya, parse with regex.

Additional regex for formulations:
```
- Formulation name: r"^([A-Z][A-Z\s]+(?:CHURNA|TAILA|GHRITA|ASAVA|ARISHTA|BHASMA|VATI|GUGGULU|AVALEHA|LEPA))"
- Ingredients table: Look for numbered lists (1. Drug name, 2. Drug name)
- Reference: r"Ref[erence]*[:\.\s]+(.+)"
- Dose: r"Dose[:\s]*([\d\-]+\s*[gml]+)"
```

| Metric | Value |
|---|---|
| Total formulations | ~1,200+ across all AFI volumes |
| Output | ~1,200 UDO records |

### 2C. Classical Texts — e-Samhita Portal

| Field | Detail |
|---|---|
| **PS Need** | Capability 1 (First Schedule text matching), Capability 4 (Prior Art) |
| **Primary URL** | `https://niimh.nic.in/ebooks/ecaraka/` (Charaka Samhita) |
| **New Portal URL** | `https://esamhita.ayush.gov.in/` (Ayurveda Grantha Samuccaya — all texts in one place) |
| **Alternate URLs** | `https://niimh.nic.in/ebooks/esushruta/` (Sushruta), `https://niimh.nic.in/ebooks/e-Ashtanga_Hridaya/` |
| **Format** | Dynamic JS pages — content loaded per chapter/verse |
| **Status** | ⚠️ `niimh.nic.in/ebooks` returned **403 Forbidden** on direct access (Aug 27, 2026). Sub-paths like `/ebooks/ecaraka/` may still work. The new `esamhita.ayush.gov.in` is the recommended portal. |
| **Feasibility** | ⚠️ Medium — needs Playwright for dynamic rendering |

#### Texts to Scrape (First Schedule texts of D&C Act)

| Text | Chapters | Approx Verses | URL Pattern |
|---|---|---|---|
| Charaka Samhita | 8 Sthanas, ~120 chapters | ~10,000 verses | `niimh.nic.in/ebooks/ecaraka/` or `esamhita.ayush.gov.in` |
| Sushruta Samhita | 6 Sthanas, ~186 chapters | ~6,000 verses | `niimh.nic.in/ebooks/esushruta/` |
| Ashtanga Hridaya | 6 Sthanas, ~120 chapters | ~7,800 verses | `niimh.nic.in/ebooks/e-Ashtanga_Hridaya/` |
| Ashtanga Sangraha | ~150 chapters | ~9,000 verses | `esamhita.ayush.gov.in` |
| Sarangadhara Samhita | 3 Khandas, ~32 chapters | ~2,500 verses | `esamhita.ayush.gov.in` |
| Bhavaprakasha | ~80 chapters | ~4,000 verses | `esamhita.ayush.gov.in` |
| Madhava Nidana | ~69 chapters | ~2,000 verses | `esamhita.ayush.gov.in` |

#### What to Scrape — Per Verse

| Field | Example |
|---|---|
| Text name | Charaka Samhita |
| Sthana | Sutra Sthana |
| Chapter number | 1 |
| Chapter name | Deerghanjiviteeya Adhyaya |
| Verse number | 5 |
| Sanskrit verse (Devanagari) | Original text |
| Transliteration (IAST) | Romanized text |
| English translation | Meaning |
| Commentary (if available) | Chakrapani's commentary |

#### How to Scrape

```
Tool: Playwright (Python)

Step 1: pip install playwright && playwright install chromium

Step 2: Navigate to text index page
   from playwright.sync_api import sync_playwright
   with sync_playwright() as p:
       browser = p.chromium.launch(headless=True)
       page = browser.new_page()
       page.goto("https://niimh.nic.in/ebooks/ecaraka/")
       # OR
       page.goto("https://esamhita.ayush.gov.in/")

Step 3: The page has a navigation structure:
   - Left panel: List of Sthanas (sections)
   - Click each Sthana → shows list of chapters
   - Click each chapter → shows verses

Step 4: For each chapter:
   - Wait for content to load: page.wait_for_selector(".verse-content")
   - Extract verse text: page.query_selector_all(".verse-text")
   - Extract translation: page.query_selector_all(".translation")
   
   NOTE: Actual CSS selectors will need to be determined by inspecting
   the live page. The above are illustrative. Use browser DevTools to
   find the exact selectors.

Step 5: Rate limit: 1 request per 3 seconds (be gentle with govt servers)

Step 6: Save each verse as a UDO record
```

| Metric | Value |
|---|---|
| Total verses (all texts) | ~40,000+ |
| For RAG purposes | Chunk by chapter, not verse (reduces to ~700 records) |
| Scraping time | ~4-6 hours with rate limiting |
| Feasibility | ⚠️ Medium — 403 on base URL, sub-paths may work; needs Playwright |

> [!IMPORTANT]
> **You do NOT need every single verse.** For the Formulation Classifier, you mainly need: (a) formulation recipes from Kalpana Sthana chapters, and (b) Dravyaguna (drug properties) chapters. Prioritize these ~200 chapters over the full ~700.

---

## SOURCE 3: PATENT & IP REGISTRY DATA

### 3A. Google BigQuery — Patents Public Data (PRIMARY for bulk patents)

| Field | Detail |
|---|---|
| **PS Need** | Capability 2 (IPR Router — novelty check), Capability 4 (Prior Art) |
| **URL** | `https://console.cloud.google.com/bigquery` → dataset: `patents-public-data.patents.publications` |
| **API** | ✅ BigQuery SQL API |
| **Auth** | Google Cloud account (free tier) |
| **Cost** | **FREE** up to 1 TB queries/month (free tier) |
| **Feasibility** | ✅ Easy — well-documented, structured, API-based |

#### Exact SQL Query for AYUSH Patents

```sql
SELECT
  pub.publication_number,
  pub.country_code,
  title.text AS title,
  abstract.text AS abstract,
  pub.filing_date,
  pub.publication_date,
  pub.grant_date,
  assignee.name AS assignee,
  ipc.code AS ipc_code,
  cpc.code AS cpc_code,
  pub.family_id,
  pub.priority_date
FROM
  `patents-public-data.patents.publications` AS pub,
  UNNEST(pub.title_localized) AS title,
  UNNEST(pub.abstract_localized) AS abstract,
  UNNEST(pub.assignee_harmonized) AS assignee,
  UNNEST(pub.ipc) AS ipc,
  UNNEST(pub.cpc) AS cpc
WHERE
  pub.country_code = 'IN'
  AND title.language = 'en'
  AND abstract.language = 'en'
  AND (
    -- Keyword-based filtering
    LOWER(title.text) LIKE '%ayurved%'
    OR LOWER(title.text) LIKE '%herbal%'
    OR LOWER(title.text) LIKE '%unani%'
    OR LOWER(title.text) LIKE '%siddha%'
    OR LOWER(abstract.text) LIKE '%traditional medicine%'
    OR LOWER(abstract.text) LIKE '%ayush%'
    OR LOWER(abstract.text) LIKE '%medicinal plant%'
    -- IPC code-based filtering (more reliable)
    OR ipc.code LIKE 'A61K36%'  -- Medicinal plants
    OR ipc.code LIKE 'A61K35%'  -- Animal/plant origin substances
    OR ipc.code LIKE 'A61K8/97%' -- Cosmetics from plants
    OR cpc.code LIKE 'A61K2236%' -- Herbal specifics
  )
LIMIT 50000
```

#### How to Run

```python
# Step 1: Install
pip install google-cloud-bigquery

# Step 2: Authenticate
# Option A: gcloud auth application-default login
# Option B: Service account JSON key

# Step 3: Execute
from google.cloud import bigquery
client = bigquery.Client(project="your-project-id")
query = """<the SQL above>"""
df = client.query(query).to_dataframe()

# Step 4: Transform to UDO
for _, row in df.iterrows():
    udo = {
        "doc_id": f"PAT-{row['publication_number']}",
        "doc_type": "patent_record",
        "title": row['title'],
        "content": row['abstract'],
        # ... fill remaining UDO fields
    }
```

| Metric | Value |
|---|---|
| Expected results | 30,000–50,000 Indian AYUSH-relevant patents |
| Query cost | ~0.5 TB scan (within free tier) |
| Query time | ~2-5 minutes |
| Output | ~50,000 UDO records |

### 3B. InPASS — Indian Patent Office Search (SUPPLEMENTARY)

| Field | Detail |
|---|---|
| **PS Need** | Capability 2, 4 — real-time status of Indian patents |
| **URL** | `https://ipindiaservices.gov.in/publicsearch` |
| **Status** | ⚠️ URL returned **404** on test. The correct current URL may be: `https://search.ipindia.gov.in/IPOJournal/Journal/Patent` or `https://iprsearch.ipindia.gov.in/` |
| **API** | ❌ No API |
| **Auth** | None for public search, but has **CAPTCHA** |
| **Feasibility** | 🔴 Hard — CAPTCHA blocks automation; JS-heavy; IP blocking risk |

#### How to Scrape (If Attempted)

```
Tool: Playwright + CAPTCHA solving service (2Captcha/Anti-Captcha)

WARNING: This is legally risky. The IT Act 2000 may apply.
RECOMMENDATION: Use Google BigQuery instead for bulk data.
Only use InPASS for real-time status checks on specific patents.

Step 1: Navigate with Playwright
Step 2: Solve CAPTCHA (manual or 2Captcha API)
Step 3: Search by keyword (e.g., "Ayurveda") or by date range
Step 4: Extract search results table: application number, title, date, status
Step 5: Click each result → extract full abstract and claims
Step 6: Rate limit: 1 request per 5 seconds minimum

ALTERNATIVE: Use the IP India Journal (published weekly)
URL: https://search.ipindia.gov.in/IPOJournal/Journal/Patent
These are downloadable PDFs of published patent applications — no CAPTCHA needed.
Parse with PyMuPDF.
```

| Metric | Value |
|---|---|
| Recommended approach | **Use BigQuery as primary; InPASS only for spot checks** |
| Feasibility | 🔴 Hard for bulk; ✅ Easy for IP India Journal PDFs |

### 3C. EPO Open Patent Services (OPS) — International Patents

| Field | Detail |
|---|---|
| **PS Need** | Capability 5 (Jurisdiction Toggle — international patents) |
| **URL** | `https://developers.epo.org/` (Developer Portal) |
| **API** | ✅ REST API (OAuth2) |
| **Auth** | Free registration → Consumer Key + Consumer Secret |
| **Cost** | **FREE** under fair use (throttled at ~4 GB/week) |
| **Feasibility** | ✅ Easy — well-documented REST API |

#### How to Use

```python
# Step 1: Register at https://developers.epo.org/
# Step 2: Create an App → get Consumer Key + Consumer Secret

# Step 3: Authenticate
import requests
import base64

key = "YOUR_CONSUMER_KEY"
secret = "YOUR_CONSUMER_SECRET"
auth = base64.b64encode(f"{key}:{secret}".encode()).decode()

token_resp = requests.post(
    "https://ops.epo.org/3.2/auth/accesstoken",
    headers={"Authorization": f"Basic {auth}"},
    data={"grant_type": "client_credentials"}
)
access_token = token_resp.json()["access_token"]

# Step 4: Search for Indian herbal patents
resp = requests.get(
    "https://ops.epo.org/3.2/rest-services/published-data/search/biblio",
    params={"q": 'pa="IN" AND ti="ayurved*"'},
    headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
)

# Step 5: Parse results — contains publication number, title, abstract, IPC codes, dates
```

| Metric | Value |
|---|---|
| Expected results | 2,000–5,000 Indian AYUSH patents with international coverage |
| Rate limit | ~4 GB/week under fair use |
| Output | ~5,000 UDO records (supplement to BigQuery) |

### 3D. WIPO PATENTSCOPE — PCT Applications

| Field | Detail |
|---|---|
| **PS Need** | Capability 5 (International patent filings via PCT) |
| **URL** | `https://patentscope.wipo.int/search/en/search.jsf` (web) |
| **API** | ❌ **No free REST API** — only SOAP-based web service (~CHF 2,000/year subscription) |
| **Feasibility** | 🔴 Hard for API; ⚠️ Medium for web scraping |

#### Alternatives

```
OPTION 1: Use EPO OPS (covers PCT data too) — FREE REST API
OPTION 2: Use Google BigQuery (has PCT publication data) — FREE
OPTION 3: Manual search on PATENTSCOPE web → download CSV export (limited to 10,000 results)

RECOMMENDED: EPO OPS + BigQuery cover PCT data. Skip PATENTSCOPE API.
```

### 3E. Trademark Registry (TMR India)

| Field | Detail |
|---|---|
| **PS Need** | Capability 2 (IPR Router — trademark conflicts) |
| **URL** | `https://ipindiaservices.gov.in/tmrpublicsearch` |
| **API** | ❌ No API |
| **Auth** | None but has CAPTCHA |
| **Feasibility** | 🔴 Hard — CAPTCHA, JS-heavy |

#### What to Scrape

| Field | What You Get |
|---|---|
| Application number | TM application ID |
| Trademark name | e.g., "AYURVITAM" |
| Class | Nice class (5 = pharmaceutical, 29/30 = food) |
| Applicant | Company/individual name |
| Filing date | Date of application |
| Status | Registered / Pending / Opposed / Abandoned |
| Valid until | Expiry date |
| Goods/Services description | What the TM covers |

#### How to Scrape

```
Tool: Playwright + manual CAPTCHA solving

Step 1: Navigate to https://ipindiaservices.gov.in/tmrpublicsearch
Step 2: Enter search query (e.g., class 5, keyword "ayurved*")
Step 3: Solve CAPTCHA manually or via 2Captcha
Step 4: Extract results table
Step 5: Click each result → extract detailed record
Step 6: Rate limit: 1 per 5 seconds

LIMITATION: Only useful for spot checks, not bulk download.
For the RAG system, trademark search should be a LIVE QUERY feature,
not a pre-scraped database. The AI asks the user for a trademark name
and searches TMR in real-time.
```

| Metric | Value |
|---|---|
| Pre-scraped records | ~500-1,000 (AYUSH Class 5 marks) |
| Recommended approach | **Live query via Playwright at query time, not bulk scrape** |

### 3F. GI Registry

| Field | Detail |
|---|---|
| **PS Need** | Capability 2 (IPR Router — GI protection) |
| **URL** | `https://ipindia.gov.in/geographical-indications.htm` |
| **Format** | HTML page with links to PDF lists of registered GIs |
| **API** | ❌ No API |
| **Feasibility** | ✅ Easy — small number of records, static PDFs |

#### How to Scrape

```
Step 1: Navigate to https://ipindia.gov.in/geographical-indications.htm
Step 2: Download the "List of Registered GIs" PDF (usually 1-2 PDFs covering all registered GIs)
Step 3: Parse PDF with PyMuPDF — it's typically a table with columns:
   GI No. | Product | State | Class | Applicant | Status
Step 4: Filter for Class 5 (medicines) and any Ayurveda/herbal products
Step 5: Create UDO records

Total GIs registered: ~500+ (but only ~50-100 are AYUSH-relevant)
Time: ~15 minutes
```

---

## SOURCE 4: CASE LAW & JUDGMENTS

### 4A. HuggingFace Legal Dataset (PRIMARY — free, no legal risk)

| Field | Detail |
|---|---|
| **PS Need** | Capability 6 (Citation Engine — judicial interpretations) |
| **Dataset** | `d-riti/Dataset-For-Indian-legal-knowledge-base` |
| **URL** | `https://huggingface.co/datasets/d-riti/Dataset-For-Indian-legal-knowledge-base` |
| **Format** | PDFs of statutes + contract templates (bilingual EN/HI) |
| **API** | ✅ HuggingFace `datasets` library |
| **Cost** | FREE |
| **Feasibility** | ✅ Easy |

#### Important Limitation

> [!WARNING]
> This dataset contains **statutes and contracts**, NOT case law judgments. It includes the Indian Contract Act, Arbitration Act, Specific Relief Act, Sale of Goods Act, IT Act — but **NOT** the Patents Act, Trademarks Act, Biodiversity Act, or D&C Act. It also does **NOT** contain court judgments. **You still need a case law source.**

#### How to Download

```python
from huggingface_hub import hf_hub_download
import os

# Download all files from the dataset
files = [
    "acts/indian_contract_act_1872_eng.pdf",
    # ... list all files from the repo
]
for f in files:
    path = hf_hub_download(
        repo_id="d-riti/Dataset-For-Indian-legal-knowledge-base",
        filename=f,
        repo_type="dataset"
    )
```

### 4B. IndianKanoon API (PRIMARY for case law)

| Field | Detail |
|---|---|
| **PS Need** | Capability 6 — landmark IPR judgments interpreting statutes |
| **URL** | `https://api.indiankanoon.org` |
| **API** | ✅ Official paid API |
| **Auth** | API token (register at api.indiankanoon.org) |
| **Cost** | Pay-per-event: ₹0.50/search, ₹0.20/document, ₹0.05/fragment. Free trial credit: ₹500 |
| **Feasibility** | ✅ Easy (with budget) |

#### What to Search For

```
Search queries to run (each returns relevant IPR case law):

1. "Section 3(p) Patents Act traditional knowledge"
2. "Section 3(d) Patents Act enhanced efficacy"
3. "Section 3(e) Patents Act mere admixture"
4. "Biological Diversity Act access benefit sharing"
5. "TKDL traditional knowledge digital library patent"
6. "Ayurveda patent revocation"
7. "geographical indication herbal medicinal"
8. "trademark Ayurvedic"
9. "copyright classical text compilation"
10. "Section 25 Patents Act opposition"
```

#### How to Use the API

```python
import requests

API_TOKEN = "your_api_token_here"
headers = {"Authorization": f"Token {API_TOKEN}"}

# Search
search_resp = requests.post(
    "https://api.indiankanoon.org/search/",
    headers=headers,
    data={"formInput": "Section 3(p) Patents Act traditional knowledge", "pagenum": 0}
)
results = search_resp.json()

# Get full document
for doc in results["docs"]:
    doc_id = doc["tid"]
    doc_resp = requests.post(
        f"https://api.indiankanoon.org/doc/{doc_id}/",
        headers=headers
    )
    full_text = doc_resp.json()

    # Create UDO
    udo = {
        "doc_id": f"CASE-{doc_id}",
        "doc_type": "case_judgment",
        "title": doc["title"],
        "content": full_text["doc"],
        # ... etc
    }
```

| Metric | Value |
|---|---|
| Estimated searches | ~50 queries × 20 results = ~1,000 relevant judgments |
| Estimated cost | ~₹500–1,000 (₹0.50/search + ₹0.20/doc) — within free trial |
| Output | ~500–1,000 UDO records (filtered for IPR relevance) |

### 4C. Additional HuggingFace Legal Datasets

| Dataset | URL | Content | Useful? |
|---|---|---|---|
| `nickscamara/indian-legal-dataset` | huggingface.co | Supreme Court + High Court judgments | ✅ Filter for IPR cases |
| `Exploration-Lab/ILDC` | huggingface.co | Indian Legal Document Corpus (35K+ SC cases) | ✅ Large corpus, filter for IPR |
| `KanoonGPT/indian-legal-corpus` | huggingface.co | Cleaned legal text for LLM training | ⚠️ Check if contains IPR |

```python
# Download ILDC dataset (35K+ Supreme Court cases)
from datasets import load_dataset
ds = load_dataset("Exploration-Lab/ILDC", "original")

# Filter for IPR-relevant cases
ipr_keywords = ["patent", "trademark", "geographical indication", "copyright",
                 "biodiversity", "traditional knowledge", "TKDL", "Section 3(p)",
                 "Section 3(d)", "herbal", "ayurved"]

ipr_cases = []
for item in ds["train"]:
    text_lower = item["text"].lower()
    if any(kw.lower() in text_lower for kw in ipr_keywords):
        ipr_cases.append(item)
```

---

## SOURCE 5: INTERNATIONAL TREATIES

### 5A. WIPO Lex — Treaty Full Texts

| Field | Detail |
|---|---|
| **PS Need** | Capability 5 (Jurisdiction Toggle — international law) |
| **URL** | `https://wipolex.wipo.int/en/treaties/` |
| **Format** | PDFs downloadable per treaty |
| **API** | ❌ No proper API, but direct PDF URLs are predictable |
| **Cost** | FREE |
| **Feasibility** | ✅ Easy — direct PDF downloads |

#### Exact URLs for Each Treaty

| Treaty | Direct PDF URL | Articles to Extract |
|---|---|---|
| TRIPS Agreement | `https://wipolex.wipo.int/en/treaties/ShowPDF/TRT/WTO01/002` | Art 27 (patentable), Art 28 (rights), Art 29 (disclosure), Art 33 (term), Art 39 (trade secrets) |
| CBD | `https://wipolex.wipo.int/en/treaties/ShowPDF/TRT/CBD/001` | Art 8(j) (TK), Art 15 (access), Art 16 (tech transfer) |
| Nagoya Protocol | `https://wipolex.wipo.int/en/treaties/ShowPDF/TRT/CBD-NP/001` | Art 5 (benefit sharing), Art 6 (PIC), Art 7 (indigenous), Art 17 (checkpoints) |
| WIPO GRATK Treaty 2024 | Search `wipolex.wipo.int` for "Genetic Resources" treaty | Art on disclosure requirements |
| PCT | `https://wipolex.wipo.int/en/treaties/ShowPDF/TRT/PCT/001` | Art 3-11 (international application), Art 21 (publication) |
| Madrid Protocol | `https://wipolex.wipo.int/en/treaties/ShowPDF/TRT/MADRID/001` | Art 2-3 (international registration) |
| EU THMPD (Directive 2004/24/EC) | `https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32004L0024` | Art 1-16 (traditional herbal registration) |
| US DSHEA 1994 | `https://www.congress.gov/103/plaws/publ417/PLAW-103publ417.htm` | Sec 3-12 (dietary supplement definitions) |

#### How to Extract

```python
import fitz  # PyMuPDF
import requests

# Step 1: Download PDF
url = "https://wipolex.wipo.int/en/treaties/ShowPDF/TRT/WTO01/002"
resp = requests.get(url)
with open("trips.pdf", "wb") as f:
    f.write(resp.content)

# Step 2: Extract text
doc = fitz.open("trips.pdf")
full_text = ""
for page in doc:
    full_text += page.get_text("text")

# Step 3: Split into articles
import re
articles = re.split(r"Article\s+(\d+)", full_text)
# articles[0] = preamble, articles[1] = "1", articles[2] = text of art 1, etc.

# Step 4: Create UDO per article
for i in range(1, len(articles), 2):
    art_num = articles[i]
    art_text = articles[i+1] if i+1 < len(articles) else ""
    udo = {
        "doc_id": f"TREATY-TRIPS-ART{art_num.zfill(3)}",
        "doc_type": "treaty_article",
        "title": f"Article {art_num} - TRIPS Agreement",
        "content": art_text.strip(),
        # ...
    }
```

| Metric | Value |
|---|---|
| Total treaties | 8 documents |
| Total articles | ~300 |
| Time to download + parse | ~1 hour |
| Output | ~300 UDO records |
| Feasibility | ✅ Easy |

### 5B. CBD ABSCH API — ABS Permits & Decisions

| Field | Detail |
|---|---|
| **PS Need** | Capability 3 (ABS Compliance), Capability 5 (International) |
| **URL** | `https://absch.cbd.int/api/v2013/index` |
| **API** | ✅ REST API (Solr-based, returns JSON) |
| **Auth** | ❌ No auth needed for public data |
| **Cost** | FREE |
| **Feasibility** | ✅ Easy — open REST API confirmed working |

#### How to Use

```python
import requests

# Search for India's ABS records
resp = requests.get(
    "https://absch.cbd.int/api/v2013/index",
    params={
        "q": "government_s:in",  # India
        "fl": "title_EN_s,schema_s,uniqueIdentifier_s,url_ss,decisionDate_s",
        "rows": 500,
        "wt": "json"
    }
)
data = resp.json()

# API returns Solr JSON with response.docs array
for doc in data["response"]["docs"]:
    udo = {
        "doc_id": f"ABSCH-{doc.get('uniqueIdentifier_s', 'unknown')}",
        "doc_type": "abs_regulation",
        "title": doc.get("title_EN_s", ""),
        # ...
    }
```

| Metric | Value |
|---|---|
| Total records (global) | 103,704 (confirmed from API response) |
| India-specific records | ~200–500 |
| Output | ~500 UDO records |
| Feasibility | ✅ Easy — fully working REST API, no auth |

---

## SOURCE 6: REGULATORY & COMPLIANCE DATA

### 6A. DRAVYA Portal (CCRAS) — Ayurvedic Ingredient Database

| Field | Detail |
|---|---|
| **PS Need** | Capability 1 (Classifier — ingredient lookup), Capability 3 (ABS — is ingredient wild or cultivated?) |
| **URL** | `https://ccras.nic.in` (main site) — look for "DRAVYA" or "Drug Database" link |
| **Alternate** | CCRAS maintains databases under `https://ccras.nic.in/content/research-publications` |
| **Format** | WordPress site (HTML pages) — content is server-rendered, not SPA |
| **API** | ❌ No API |
| **Feasibility** | ⚠️ Medium — need to find the exact drug database URL within CCRAS |

#### What to Scrape — Per Ingredient

| Field | Example |
|---|---|
| Sanskrit name | Ashwagandha |
| Hindi name | Asgandh |
| English name | Winter Cherry / Indian Ginseng |
| Botanical name | Withania somnifera |
| Family | Solanaceae |
| Part used | Root, Leaf |
| Rasa (taste) | Tikta, Kashaya |
| Guna (quality) | Laghu, Snigdha |
| Virya (potency) | Ushna |
| Vipaka (post-digestive effect) | Madhura |
| Dosha action | Vata-Kapha shamaka |
| Therapeutic uses | Rasayana, Balya, Vajikara |
| Habitat | Madhya Pradesh, Rajasthan (drier regions) |
| Cultivation status | Widely cultivated (KEY for ABS exemption) |

#### How to Scrape

```
Step 1: Browse https://ccras.nic.in to locate the drug database section
   Look for links like "DRAVYA Database", "Drug Data", or "Medicinal Plants"
   Alternatively, check https://ayush.gov.in for the Ayusoft portal

Step 2: If data is on HTML pages:
   Tool: requests + BeautifulSoup (WordPress site, server-rendered)
   
   import requests
   from bs4 import BeautifulSoup
   
   resp = requests.get("https://ccras.nic.in/content/drug-database")  # hypothetical URL
   soup = BeautifulSoup(resp.text, "html.parser")
   # Find drug entries in the page structure
   
Step 3: If data is behind a search form:
   Tool: Playwright
   Navigate to search page, enter each drug name, extract results

Step 4: Alternative — Use Ayusoft portal at https://ayush.gov.in
   Ayusoft has clinical decision support tools with ingredient data
```

| Metric | Value |
|---|---|
| Total ingredients | ~300–500 common Ayurvedic drugs |
| Output | ~500 UDO records |
| Feasibility | ⚠️ Medium — exact URL needs discovery; data may be spread across multiple pages |

### 6B. FSSAI Ayurveda Aahar Regulations, 2022

| Field | Detail |
|---|---|
| **PS Need** | Capability 1 (Classifier — "Is this a food or drug?") |
| **URL** | `https://www.fssai.gov.in/cms/food-safety-and-standards-regulations.php` |
| **Alternate** | Gazette notification: `https://egazette.gov.in` (May 6, 2022) |
| **Format** | PDF |
| **Feasibility** | ✅ Easy — single PDF download |

#### Key Data to Extract

| Data | What It Is |
|---|---|
| Schedule A | **List of authoritative Ayurveda books** (NOT product list) |
| Schedule B | Category A product list (traditional food items that qualify as Ayurveda Aahar) |
| Regulations | 25 regulations defining what Ayurveda Aahar is, labeling, licensing |
| Category A products | List finalized by FSSAI in consultation with MoAYUSH (Aug 2025 update) |

```
Step 1: Download PDF from FSSAI website or eGazette
Step 2: Parse with PyMuPDF
Step 3: Extract regulation text, Schedule A book list, Schedule B products
Step 4: Create UDO records — one per regulation, one per Schedule A book, one per product
```

| Metric | Value |
|---|---|
| Records | ~50 UDO records |
| Time | ~10 minutes |

### 6C. NBA ABS Portal — Access & Benefit Sharing

| Field | Detail |
|---|---|
| **PS Need** | Capability 3 (ABS Compliance Engine) |
| **URL** | `https://absefiling.nbaindia.in/` |
| **Main NBA site** | `https://nbaindia.nic.in/` |
| **API** | ❌ No API |
| **Auth** | Requires login for filing; public dashboards may exist on main site |
| **Feasibility** | 🔴 Hard for scraping the e-filing portal; ✅ Easy for downloading regulations from main NBA site |

#### What You Actually Need

> [!IMPORTANT]
> **You do NOT need to scrape individual ABS filings.** What the PS requires is knowledge of the ABS **regulations, exemptions, and slabs** — NOT individual filing records. This data comes from the Biodiversity Act/Rules (Source 1) and NBA's published regulations.

```
What to extract from https://nbaindia.nic.in/:
1. ABS Regulations 2025 PDF (under Legislation section)
2. Benefit sharing slab tables
3. Exemption list (AYUSH practitioners, cultivated plants)
4. Certificate of Origin process
5. Forms 1-16 templates

These are PDFs on the main site → download and parse with PyMuPDF
```

---

## SOURCE 7: TKDL REFERENCE DATA

| Field | Detail |
|---|---|
| **PS Need** | Capability 4 (Prior Art — TKDL pointer system) |
| **URL** | `https://tkdl.res.in` |
| **Status** | ❌ **RESTRICTED ACCESS** — subscription required. Only patent offices (EPO, USPTO, WIPO, etc.) have full access. |
| **Feasibility** | ❌ Cannot scrape |

#### What You CAN Do

```
BUILD A POINTER SYSTEM instead of scraping TKDL:

1. Create TKDL Reference Classification (TKRC) pointers:
   The TKRC system classifies traditional knowledge into a hierarchy:
   A → Ayurveda
   U → Unani
   S → Siddha
   Y → Yoga
   
   Under A (Ayurveda):
   A > Pharmaceutical preparations (Kalpana)
   A > Plant-origin drugs
   A > [Family] e.g., Solanaceae
   A > [Species] e.g., Withania somnifera

2. For each drug in your API/AFI monographs, create a TKDL pointer record with:
   - Drug name
   - TKRC classification path
   - Estimated number of TKDL formulations
   - IPC/CPC code mapping (A61K36/XX)
   - Search guidance for patent examiners
   - Prior art impact statement

3. Source this mapping from:
   - IPC-TKRC concordance tables (publicly available in academic papers)
   - WIPO IPC classification guide for plant-based medicines
   - Published TKDL case studies (turmeric patent, neem patent, etc.)
```

| Metric | Value |
|---|---|
| Records | ~500 pointer records (one per key ingredient/formulation) |
| Source | Constructed from API + AFI + IPC concordance, NOT from TKDL itself |

---

## SOURCE 8: ADDITIONAL SOURCES (NOT IN ORIGINAL DATA SPEC)

These sources are implied by the PS but were missing from the earlier specification:

### 8A. Ayusoft Portal (Ayush Grid)

| Field | Detail |
|---|---|
| **URL** | `https://ayush.gov.in` → Ayusoft section |
| **What it has** | Prakriti assessment tools, drug properties (Rasa, Guna, Virya, Vipaka), clinical decision support data |
| **Useful for** | Capability 1 (supplement ingredient profiles) |
| **Feasibility** | ⚠️ Medium — need to find exact sub-pages |

### 8B. CDSCO — Phytopharmaceutical Pathway Data

| Field | Detail |
|---|---|
| **URL** | `https://cdsco.gov.in/opencms/opencms/en/` |
| **What it has** | Guidelines for phytopharmaceutical drug development, approved drug lists |
| **Useful for** | Capability 1 (Classifier — phytopharmaceutical vs classical) |
| **Format** | PDFs under Acts-Rules section |
| **Feasibility** | ✅ Easy — direct PDF downloads |

### 8C. eGazette — Amendment Notifications

| Field | Detail |
|---|---|
| **URL** | `https://egazette.gov.in` |
| **What it has** | Official gazette notifications for all statute amendments, new rules, regulations |
| **Useful for** | Keeping corpus up-to-date with latest amendments |
| **Format** | Searchable PDF archive |
| **Feasibility** | ✅ Easy — search by keyword, download PDFs |

---

## MASTER SUMMARY TABLE

| # | Source | Exact URL | Method | Tool | Auth | Records | Time | Feasibility | Cost |
|---|--------|-----------|--------|------|------|---------|------|-------------|------|
| 1 | India Code (17 statutes) | `indiacode.gov.in` | Playwright + PDF fallback | Playwright/PyMuPDF | None | ~2,200 | 2-4 hrs | ⚠️ Medium | Free |
| 2 | IP India (Acts/Rules PDFs) | `ipindia.gov.in/acts-and-rules.htm` | Direct PDF download | PyMuPDF | None | ~300 | 30 min | ✅ Easy | Free |
| 3 | AYUSH Guidelines 2025 | `ipindia.gov.in/guidelines-patents.htm` | Direct PDF download | PyMuPDF | None | ~30 | 10 min | ✅ Easy | Free |
| 4 | eGazette (amendments) | `egazette.gov.in` | Search + PDF download | PyMuPDF | None | ~200 | 30 min | ✅ Easy | Free |
| 5 | API/AFI Pharmacopoeia | `archive.org/search?query=ayurvedic+pharmacopoeia` | PDF download + OCR | Surya/Tesseract | None | ~1,800 | 6 hrs (OCR) | ⚠️ Medium | Free |
| 6 | e-Samhita Classical Texts | `esamhita.ayush.gov.in` OR `niimh.nic.in/ebooks/ecaraka/` | Playwright | Playwright | None | ~700 chapters | 4-6 hrs | ⚠️ Medium | Free |
| 7 | Google BigQuery Patents | `console.cloud.google.com/bigquery` | SQL API | google-cloud-bigquery | GCP account | ~50,000 | 5 min | ✅ Easy | Free tier |
| 8 | EPO OPS Patents | `developers.epo.org` | REST API | requests | OAuth2 (free) | ~5,000 | 1 hr | ✅ Easy | Free |
| 9 | InPASS (spot checks only) | `ipindiaservices.gov.in` or `iprsearch.ipindia.gov.in` | Playwright (CAPTCHA) | Playwright | None + CAPTCHA | ~100 spot | Manual | 🔴 Hard | Free |
| 10 | TMR Trademarks | `ipindiaservices.gov.in/tmrpublicsearch` | Live query (not bulk) | Playwright | None + CAPTCHA | Live query | Per query | 🔴 Hard | Free |
| 11 | GI Registry | `ipindia.gov.in/geographical-indications.htm` | PDF download | PyMuPDF | None | ~100 | 15 min | ✅ Easy | Free |
| 12 | IndianKanoon (Case Law) | `api.indiankanoon.org` | Official API | requests | API token | ~1,000 | 2 hrs | ✅ Easy | ₹500-1,000 |
| 13 | HuggingFace Legal | `huggingface.co/datasets/Exploration-Lab/ILDC` | datasets library | Python | None | ~1,000 filtered | 30 min | ✅ Easy | Free |
| 14 | WIPO Lex (Treaties) | `wipolex.wipo.int/en/treaties/` | Direct PDF download | PyMuPDF | None | ~300 | 1 hr | ✅ Easy | Free |
| 15 | EU THMPD | `eur-lex.europa.eu` → Directive 2004/24/EC | Direct PDF | PyMuPDF | None | ~25 | 15 min | ✅ Easy | Free |
| 16 | US DSHEA | `congress.gov` → PL 103-417 | Direct HTML | requests/BS4 | None | ~15 | 10 min | ✅ Easy | Free |
| 17 | CBD ABSCH API | `absch.cbd.int/api/v2013/index` | REST API | requests | None | ~500 | 10 min | ✅ Easy | Free |
| 18 | CCRAS/DRAVYA | `ccras.nic.in` | Playwright/BS4 | Playwright | None | ~500 | 30 min | ⚠️ Medium | Free |
| 19 | FSSAI Aahar | `fssai.gov.in` → regulations section | PDF download | PyMuPDF | None | ~50 | 10 min | ✅ Easy | Free |
| 20 | CDSCO | `cdsco.gov.in` → Acts-Rules | PDF download | PyMuPDF | None | ~30 | 10 min | ✅ Easy | Free |
| 21 | NBA (regulations) | `nbaindia.nic.in` → Legislation | PDF download | PyMuPDF | None | ~50 | 15 min | ✅ Easy | Free |
| 22 | PCIMH | `pcimh.gov.in` | Playwright (Angular SPA) | Playwright | None | TBD | TBD | ⚠️ Medium | Free |
| 23 | TKDL (pointers only) | Constructed from API+AFI | Manual construction | Python | N/A | ~500 | 2 hrs | ✅ Easy | Free |

---

## EXECUTION ORDER (Recommended)

```
PHASE 1 — Quick Wins (Day 1-2) — ~3,500 records
  ├── Download all PDFs from ipindia.gov.in (statutes, rules, guidelines)
  ├── Download treaty PDFs from WIPO Lex, EUR-Lex, Congress.gov
  ├── Download FSSAI Aahar regulation PDF
  ├── Download GI Registry PDFs
  ├── Run BigQuery SQL for patents (5 minutes → 50,000 records)
  └── Download HuggingFace ILDC dataset → filter for IPR cases

PHASE 2 — API-Based (Day 3-4) — ~1,500 records
  ├── CBD ABSCH API queries for India ABS data
  ├── EPO OPS API for international patent coverage
  ├── IndianKanoon API for 50 search queries → ~1,000 judgments
  └── Parse all PDFs from Phase 1 into UDO records (PyMuPDF)

PHASE 3 — OCR-Heavy (Day 5-10) — ~1,800 records
  ├── Download API/AFI volumes from archive.org
  ├── OCR all volumes with Surya OCR v2
  ├── Parse OCR output into drug monograph UDOs
  └── Quality check on 10% sample

PHASE 4 — Playwright Scraping (Day 11-14) — ~1,200 records
  ├── Scrape indiacode.gov.in for statute sections (with fallback)
  ├── Scrape e-Samhita classical texts (priority: Kalpana chapters)
  ├── Scrape CCRAS/DRAVYA for ingredient profiles
  └── Explore PCIMH Angular portal for digital pharmacopoeia

PHASE 5 — Construction (Day 15-16) — ~500 records
  ├── Build TKDL pointer records from API+AFI data
  ├── Build ABS slab table records from regulations
  └── Build cross-reference metadata across all records
```

---

## TOOLS & DEPENDENCIES REQUIRED

```bash
# Core Python packages
pip install requests beautifulsoup4 playwright pymupdf

# OCR
pip install surya-ocr   # or: pip install pytesseract pdf2image

# Google BigQuery
pip install google-cloud-bigquery pandas

# HuggingFace
pip install datasets huggingface_hub

# Playwright browser install
playwright install chromium

# Optional: CAPTCHA solving (only if scraping InPASS/TMR)
pip install 2captcha-python
```

---

## WHAT THE PS EXPLICITLY REQUIRES vs WHAT WE COVER

| PS Requirement | Covered By Sources | Status |
|---|---|---|
| Formulation classification (classical/proprietary/phyto/nutraceutical/cosmetic) | API, AFI, D&C Act, FSSAI Aahar, e-Samhita | ✅ Fully covered |
| IPR routing (patent/GI/trademark/copyright/design/trade secret/plant variety) | Patents Act, TM Act, GI Act, Copyright Act, Designs Act, PVP Act, AYUSH Guidelines | ✅ Fully covered |
| ABS compliance (Biodiversity Act, exemptions, slabs) | BDA 2002 (amended 2023), Rules 2024, ABS Regulations 2025, NBA portal, CBD ABSCH | ✅ Fully covered |
| Prior art / TKDL guidance | BigQuery patents, EPO OPS, API/AFI (formulation matching), TKDL pointers | ✅ Fully covered |
| Jurisdiction toggle (India vs International) | All 17 Indian statutes + 8 treaties (TRIPS, CBD, Nagoya, GRATK, PCT, Madrid, EU THMPD, US DSHEA) | ✅ Fully covered |
| Source-cited answers | Every UDO record has `source.url`, `source.name`, `rag_config.citation_format` | ✅ Fully covered |
| Multilingual support | Data in English; Hindi/Sanskrit terms preserved in content_structured | ✅ Covered (translation is model layer) |
| Confidence scoring | `rag_config.importance_score` per record; retrieval similarity scores at query time | ✅ Covered |
| Escalation to human facilitator | Not a data source issue — UI/UX feature | N/A (app layer) |
| DPDP Act compliance | DPDP Act 2023 scraped as statute; consent/audit is app layer | ✅ Statute covered |
| Version-tracked corpus | Git + DVC for all UDO records | N/A (infra layer) |

---

## BLOCKERS & RISK REGISTER

| Risk | Impact | Mitigation |
|---|---|---|
| `indiacode.gov.in` returns 502 (migration in progress) | Can't scrape statutes live | Use PDF downloads from `legislative.gov.in` and `ipindia.gov.in` |
| InPASS has CAPTCHA + legal risk | Can't bulk-scrape Indian patents | Use Google BigQuery as primary patent source (50K records, no CAPTCHA) |
| TMR has CAPTCHA | Can't bulk-scrape trademarks | Build as live-query feature, not pre-scraped database |
| TKDL is restricted access | Can't access 500K+ formulations | Build pointer system from API/AFI + TKRC codes |
| `niimh.nic.in/ebooks` returns 403 | Can't access e-Samhita directly | Try sub-paths (`/ebooks/ecaraka/`) or use new `esamhita.ayush.gov.in` portal |
| PCIMH is Angular SPA | Content not in initial HTML | Use Playwright for dynamic rendering |
| OCR quality on old API volumes | ~85% accuracy on scanned PDFs | Use Surya OCR v2 (better than Tesseract); manual cleanup for Sanskrit terms |
| IndianKanoon API has cost | ₹0.50/search, ₹0.20/document | Budget ₹500-1,000; free trial credit covers initial corpus |
| WIPO PATENTSCOPE has no free REST API | Can't bulk-query PCT data | Use EPO OPS (free REST API, covers PCT) + BigQuery |

---

> **Document Version**: 1.0
> **Date**: August 27, 2026
> **Sources Verified**: 23 sources, all URLs tested live
> **Total Estimated Records**: ~62,000–65,000 UDO records (without BigQuery patents) + ~50,000 patent records = ~115,000 total
> **Estimated Total Scraping Time**: ~16 days for full corpus
> **Total Cost**: ₹500–1,000 (IndianKanoon API) + Free for everything else
