# SIH AYUSH IPR Guardian — Complete Data Acquisition Checklist

> **Generated**: September 11, 2026
> **Goal**: Win SIH by having the most comprehensive, citation-grounded RAG corpus covering every angle the PS demands.
> **Current State**: 6,643 records across 15 Indian statutes. ~49% are empty/broken. Zero international, case law, pharmacopoeial, or market-access data.

---

## How to Read This Document

Each item below has:
- **✅ HAVE** — Already in your RAG database and usable
- **⚠️ BROKEN** — In database but empty/truncated, needs re-scrape
- **❌ MISSING** — Not in database at all, must acquire from scratch
- **Priority**: P0 (must have for demo) → P1 (strong differentiator) → P2 (nice to have)

---

## SECTION 1: INDIAN STATUTES & RULES (The Legal Foundation)

> The PS requires the assistant to cover "Patents Act (and the 2024 Rules), the GI, Trade Marks, Designs, Copyright and Plant-Variety regimes, the Biological Diversity Act (as amended in 2023, with the 2024 Rules) and the allied drug, advertising, labelling and food/cosmetic regimes."

### 1.1 Core IP Statutes

| # | Data Item | Status | Current State | Where to Find | How to Get |
|---|-----------|--------|---------------|---------------|------------|
| 1 | **Patents Act, 1970** (Sections 3(d), 3(e), 3(p), 10(4), 25, 64) | ⚠️ BROKEN | 562 records, **310 empty (55%)** — title-only scraping | `https://indiacode.nic.in/handle/123456789/1392` OR `https://www.ipindia.gov.in/writereaddata/Portal/ev/sections/ps-act-1970-11march2015.pdf` | **Playwright** on IndiaCode → extract each Section with full body text. Alternatively, download the official PDF from ipindia.gov.in and use **PyMuPDF** to extract + regex split by `"^\d+[A-Z]?\."` |
| 2 | **Patents Rules, 2003** (incl. **2024 Amendment** — RFE 31 months, Form 27 triennial) | ⚠️ BROKEN | 226 records, **100 empty (44%)** — rule titles without body | `https://ipindia.gov.in/writereaddata/Portal/ev/rules/Patent_Rules_2003_Updated.pdf` + Gazette GSR 203(E) for 2024 amendment | Download PDF → **PyMuPDF** → regex split by Rule number. Must reconstruct **First Schedule (Fees)** and **Second Schedule (Forms)** as structured JSON tables |
| 3 | **Patents (Amendment) Rules, 2024** | ❌ MISSING | Zero records — the PS *explicitly* names "2024 patent rules" | `https://egazette.gov.in` — search "Patents Amendment Rules 2024" Gazette No. GSR 203(E) dated March 15, 2024 | Download gazette PDF → **PyMuPDF** → extract each amended rule. Key changes: Rule 24B(1)(i) RFE=31 months, Rule 29A grace period, Rule 70A Certificate of Inventorship, Rule 131 triennial Form 27 |
| 4 | **Trade Marks Act, 1999** | ⚠️ BROKEN | 367 records, **170 empty (46%)** | `https://indiacode.nic.in/handle/123456789/1993` | Playwright on IndiaCode → full section text extraction |
| 5 | **Trade Marks Rules, 2017** | ❌ MISSING | Zero records | `https://ipindia.gov.in/writereaddata/Portal/ev/rules/TMR-2017-Updated.pdf` | PDF → PyMuPDF → split by Rule |
| 6 | **Geographical Indications of Goods Act, 1999** | ⚠️ BROKEN | 193 records, **87 empty (45%)** | `https://indiacode.nic.in/handle/123456789/1981` | Playwright → full text |
| 7 | **GI of Goods Rules, 2002** | ❌ MISSING | Zero records | `https://ipindia.gov.in/writereaddata/Portal/Images/pdf/GI_Rules_2002.pdf` | PDF → PyMuPDF |
| 8 | **Copyright Act, 1957** | ⚠️ BROKEN | 344 records, **210 empty (61%)** — worst quality | `https://indiacode.nic.in/handle/123456789/1367` | Playwright → full text. Key: Section 2(d)(vi) compilations |
| 9 | **Copyright Rules, 2013** | ❌ MISSING | Zero records | `https://copyright.gov.in/frmRulesContent.aspx` | Download PDF → PyMuPDF |
| 10 | **Designs Act, 2000** | ⚠️ BROKEN | 99 records, **35 empty (35%)** | `https://indiacode.nic.in/handle/123456789/1978` | Playwright → full text |
| 11 | **Designs Rules, 2001** | ❌ MISSING | Zero records | `https://ipindia.gov.in/writereaddata/Portal/ev/rules/Design_Rules_2001.pdf` | PDF → PyMuPDF |
| 12 | **Protection of Plant Varieties & Farmers' Rights Act, 2001** | ⚠️ BROKEN | 204 records, **88 empty (43%)** | `https://indiacode.nic.in/handle/123456789/1888` | Playwright → full text |
| 13 | **PPV&FR Rules, 2003** | ❌ MISSING | Zero records | `https://plantauthority.gov.in/content/rules-and-regulations` | PDF → PyMuPDF |

**Priority**: All = **P0** (the PS explicitly lists every one of these regimes)

---

### 1.2 Biodiversity & ABS Regime

| # | Data Item | Status | Current State | Where to Find | How to Get |
|---|-----------|--------|---------------|---------------|------------|
| 14 | **Biological Diversity Act, 2002 (Amd 2023)** | ⚠️ BROKEN | 216 records, **117 empty (53%)**. **Section 7 (SBB intimation / AYUSH exemption) is MISSING** | `https://indiacode.nic.in/handle/123456789/2046` | Re-scrape Sections 3, 6, 7, 7A, 21, 36 specifically. These are the ABS-critical sections |
| 15 | **Biological Diversity Rules, 2024** | ✅ HAVE (partial) | 110 records, 11% empty — text is in Hindi | `https://sbb.uk.gov.in` OR WIPO Lex: `https://www.wipo.int/wipolex/en/legislation/details/22421` | Download English version PDF from WIPO Lex → PyMuPDF. Currently only have Hindi version |
| 16 | **ABS Regulations, 2025** (Benefit-sharing slabs) | ❌ MISSING | Zero records — CRITICAL for the ABS compliance helper | NBA official website: `https://nbaindia.org` → Notifications section. Gazette notification for 2025 ABS regulations | Download gazette PDF → extract slab table: 0% (<₹5Cr), 0.2% (₹5-20Cr), 0.4% (₹20-100Cr), 0.6% (>₹100Cr). Also extract AYUSH practitioner exemptions |

**Priority**: All = **P0** (PS explicitly demands "ABS-compliance helper")

---

### 1.3 Drug Regulatory Framework

| # | Data Item | Status | Current State | Where to Find | How to Get |
|---|-----------|--------|---------------|---------------|------------|
| 17 | **Drugs & Cosmetics Act, 1940 & Rules, 1945** | ⚠️ BROKEN | 3,948 records but **1,989 empty (50%)**. Schedule T is truncated. Key sections exist but half empty | `https://cdsco.gov.in/opencms/opencms/en/Acts/` | **Selective re-scrape** of critical items below ↓ |
| 17a | — **Chapter IV-A** (Sections 33A-33O: ASU drug classification) | ⚠️ BROKEN | Sections present but many have empty body | Same source | Extract Sections 33A, 33B, 33C, 33D, 33E, 33EE, 33EEA, 33EEB, 33N specifically |
| 17b | — **First Schedule** (54 authoritative classical texts list) | ⚠️ BROKEN | Listed but text truncated | Same source | Extract the complete list of 54 Ayurvedic books + 30 Siddha + 14 Unani. This defines what is "classical" |
| 17c | — **Schedule T** (GMP for ASU manufacturing) | ⚠️ BROKEN | Severely truncated/linearized | Same source | Full re-extract. Must include: minimum 1200 sq ft, air handling specs, QC lab requirements, batch record format |
| 17d | — **Schedule E(1)** (21 poisonous Ayurvedic substances) | ⚠️ BROKEN | Table flattened | Same source | Reconstruct as structured table: [Name | Botanical/Source | Required Warning Label] |
| 17e | — **Rule 151-161** (ASU drug licensing) | ⚠️ BROKEN | Some present, many empty | Same source | Full re-extract of Rules 151, 154, 157, 158B, 161, 161A, 161B |
| 17f | — **Rule 161B + Schedule P1** (Shelf life: Churna 2yr, Vati 3yr, Arishta 10yr, Bhasma indefinite) | ⚠️ BROKEN | Linearized table | Same source | Reconstruct as structured lookup table |
| 17g | — **Rule 122-DAB** (Phytopharmaceutical pathway) | ❌ MISSING | Zero records | `https://cdsco.gov.in` → New Drugs and Clinical Trials Rules, 2019 | Extract Rule 122-DAB and associated schedules defining phytopharmaceutical clinical trial requirements |
| 18 | **Drugs & Magic Remedies (OA) Act, 1954** | ⚠️ BROKEN | 92 records, **65 empty (71%)** | `https://indiacode.nic.in/handle/123456789/1350` | Full re-scrape. Must have Sections 3, 4, 7 (prohibited advertising claims) and Schedule listing 54 prohibited diseases |
| 19 | **FSSAI Act, 2006** | ✅ HAVE | 102 records, 0% empty — excellent quality | — | No action needed |
| 20 | **FSSAI Ayurveda Aahar Regulations, 2022** | ⚠️ BROKEN | 117 records, **93 empty (80%)** — nearly useless | `https://www.fssai.gov.in/cms/food-safety-and-standards-regulations.php` → search "Ayurveda Aahara" | Download gazette notification PDF → PyMuPDF → extract Schedule A (traditional food categories), labelling requirements, prohibited additives |
| 21 | **Cosmetics Rules, 2020** | ❌ MISSING | Zero records — PS says "cosmetic" is a classification | `https://cdsco.gov.in` → Cosmetics Rules 2020 | PDF → PyMuPDF. Relevant for Ayurvedic cosmetics classification |
| 22 | **DRDP Act, 2023** | ✅ HAVE | 47 records, 6% empty — good quality | — | No action needed |
| 23 | **AYUSH Patent Examination Guidelines, 2025** | ✅ HAVE | 16 records, 25% empty — OK | — | Minor re-scrape of 3 empty entries |

**Priority**: Items 17-17g, 18, 20 = **P0**. Items 21, 17g = **P1**

---

### 1.4 Privacy & Data Protection

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 24 | **Digital Personal Data Protection Act, 2023** | ❌ MISSING | `https://indiacode.nic.in` — search "Digital Personal Data Protection" | Playwright → extract all 44 sections | **P1** (PS says solution must be "aligned to DPDP regime") |

---

## SECTION 2: INTERNATIONAL TREATIES & FRAMEWORKS

> The PS requires: "TRIPS, the Convention on Biological Diversity and the Nagoya Protocol, the WIPO GRATK Treaty, the PCT, the Madrid and Hague systems, the Budapest Treaty"
> **Current state: ZERO international records in database. This is a critical gap.**

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 25 | **TRIPS Agreement** (WTO) | ❌ MISSING | `https://www.wto.org/english/docs_e/legal_e/27-trips_01_e.htm` | **requests + BeautifulSoup** — HTML page, single document. Split by Article number (Art. 27.3(b), 29, 31, 33, 39 are key for AYUSH) | **P0** |
| 26 | **Convention on Biological Diversity (CBD)** | ❌ MISSING | `https://www.cbd.int/convention/text/` | requests + BS4 — HTML. Art. 8(j) TK protection, Art. 15 access to genetic resources | **P0** |
| 27 | **Nagoya Protocol on ABS** | ❌ MISSING | `https://www.cbd.int/abs/text/` | requests + BS4. Art. 5-12: PIC, MAT, benefit-sharing, checkpoint procedures | **P0** |
| 28 | **WIPO GRATK Treaty 2024** | ❌ MISSING | `https://www.wipo.int/wipolex/en/treaties/textdetails/14838` | Download PDF → **PyMuPDF** → split by Article. Landmark: mandatory patent disclosure of country of origin of genetic resources/associated TK | **P0** |
| 29 | **Patent Cooperation Treaty (PCT)** | ❌ MISSING | `https://www.wipo.int/pct/en/texts/articles/atoc.html` | requests — HTML. Split by Article and Rule | **P1** |
| 30 | **Madrid Protocol** (International TM) | ❌ MISSING | `https://www.wipo.int/wipolex/en/treaties/textdetails/12594` | PDF download → PyMuPDF | **P1** |
| 31 | **Hague Agreement** (International Designs) | ❌ MISSING | `https://www.wipo.int/wipolex/en/treaties/textdetails/12550` | PDF → PyMuPDF | **P2** |
| 32 | **Budapest Treaty** (Micro-organism deposits for biotech patents) | ❌ MISSING | `https://www.wipo.int/wipolex/en/treaties/textdetails/12220` | PDF → PyMuPDF | **P2** |
| 33 | **Paris Convention** (Industrial property priority rights) | ❌ MISSING | `https://www.wipo.int/wipolex/en/treaties/textdetails/12633` | PDF → PyMuPDF | **P2** |
| 34 | **Berne Convention** (Copyright) | ❌ MISSING | `https://www.wipo.int/wipolex/en/treaties/textdetails/12214` | PDF → PyMuPDF | **P2** |
| 35 | **UPOV Convention** (Plant variety rights) | ❌ MISSING | `https://www.upov.int/upovlex/en/conventions/1991/content.html` | HTML → extract | **P2** |

---

## SECTION 3: CASE LAW & JUDICIAL PRECEDENTS

> The PS mentions "case law" as part of the curated corpus. This is ZERO in your database and is critical for the "citation-grounded" requirement.

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 36 | **Turmeric Patent Case** (USPTO 5,401,504, 1997) | ❌ MISSING | PIB archives: `https://pib.gov.in` (search "turmeric patent"), CSIR press releases, academic papers: Google Scholar search "turmeric patent USPTO traditional knowledge" | **Manual compilation** from multiple sources into structured JSON. Extract: parties, facts, held, ratio decidendi, IP implication for AYUSH | **P0** |
| 37 | **Neem Patent Case** (EP 0436257, EPO 2000) | ❌ MISSING | EPO case database, academic papers: search "neem patent EPO biopiracy India" | Manual compilation. Key: revoked after challenge by India/ICCR | **P0** |
| 38 | **Basmati Rice/RiceTec Case** (USPTO 1997) | ❌ MISSING | Academic papers, PIB. Google Scholar: "basmati rice RiceTec patent GI traditional knowledge" | Manual compilation | **P0** |
| 39 | **Novartis v. Union of India** (2013 SC) — Section 3(d) | ❌ MISSING | `https://indiankanoon.org/doc/165776436/` | **Indian Kanoon API**: `POST /search?formInput="Novartis section 3(d) efficacy"`. Free Rs 10K credits/month | **P0** |
| 40 | **Section 3(p) judgments** (TK prior art cases) | ❌ MISSING | Indian Kanoon: search "Section 3(p) Patents Act traditional knowledge" | API query → filter top 20 most cited cases | **P0** |
| 41 | **Section 3(e) judgments** (mere admixture cases) | ❌ MISSING | Indian Kanoon: search "Section 3(e) mere admixture combination herbal" | API query | **P1** |
| 42 | **GI Registration cases** (Ayurvedic product GIs) | ❌ MISSING | Indian Kanoon + GI Registry journal: `https://ipindia.gov.in/gi-journal.htm` | Search "geographical indication ayurvedic" OR "geographical indication traditional medicine" | **P1** |
| 43 | **Hoodia Case** (San People vs Phytopharm) | ❌ MISSING | Academic papers, WIPO publications. Google Scholar: "Hoodia patent San people benefit sharing" | Manual compilation | **P1** |
| 44 | **Pre/Post-grant Opposition decisions** | ❌ MISSING | IPO Annual Reports: `https://ipindia.gov.in/annual-reports.htm`, InPASS database | Extract from annual reports → PyMuPDF. Filter AYUSH-related oppositions | **P1** |
| 45 | **HuggingFace Indian Legal Dataset** (~10K+ judgments) | ❌ MISSING | `https://huggingface.co/datasets/d-riti/Dataset-For-Indian-Legal-Knowledge-Base` | `from datasets import load_dataset; ds = load_dataset("d-riti/Dataset-For-Indian-Legal-Knowledge-Base")` → filter with keywords: patent, trademark, traditional knowledge, ayurved, section 3(p), biopiracy | **P1** |

> [!IMPORTANT]
> **Indian Kanoon API Access**: Register at `https://api.indiankanoon.org/`. Non-commercial = Rs 10,000 free credits/month. Search: Rs 0.50/query. Document: Rs 0.20/doc. Budget ~Rs 25 for 50 targeted queries.

---

## SECTION 4: PHARMACOPOEIAL & CLASSICAL TEXTS

> PS requires the formulation classifier to "determine whether the product is a classical/generic medicine (formulation and method drawn from a First-Schedule authoritative text)". This is IMPOSSIBLE without pharmacopoeial data. Currently ZERO records.

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 46 | **Ayurvedic Pharmacopoeia of India (API)** Vols I-IX | ❌ MISSING | `https://archive.org/search?query=Ayurvedic+Pharmacopoeia+of+India` AND `https://pcimh.gov.in` (Pharmacopoeia Commission for Indian Medicine & Homoeopathy) | Download PDFs from archive.org → **Surya OCR** (supports mixed Hindi/English Devanagari) for scanned volumes OR **PyMuPDF** for digital volumes → Regex parse by drug name pattern `r"^[A-Z][A-Z\s]+"` → Structure into monograph records with fields: drug name, botanical name, family, part used, identity/purity standards, dose, formulations | **P0** |
| 47 | **Ayurvedic Formulary of India (AFI)** Parts I & II | ❌ MISSING | `https://archive.org/search?query=Ayurvedic+Formulary+of+India` AND `https://pcimh.gov.in` | Same as above. Each formulation → 1 record with: name, reference text, ingredients (Sanskrit + botanical + part + proportion), method, dosage form, dose, therapeutic uses. **~1,200 classical formulations** — this IS the First Schedule content | **P0** |
| 48 | **e-Samhita** (Charaka, Sushruta, Ashtanga Hridaya) | ❌ MISSING | `https://niimh.nic.in/ebooks/` (National Institute of Indian Medical Heritage, digitized classical texts) | **Playwright** — dynamic JS pages. Navigate chapter by chapter, extract verse text + translations. Split by verse/section. Texts: Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Ashtanga Sangraha, Sarangadhara Samhita, Bhavaprakasha | **P1** |
| 49 | **WHO Monographs on Medicinal Plants** (Selected) | ❌ MISSING | `https://www.who.int/publications/i/item/9241547014` (Vol 1), search "WHO monographs selected medicinal plants" | Direct PDF download from WHO → PyMuPDF → extract by plant monograph. International validation of Ayurvedic herbs | **P1** |
| 50 | **DRAVYA Portal** (CCRAS substance database) | ❌ MISSING | `https://ccras.nic.in` → navigate to DRAVYA portal link | **Playwright** (dynamic JS) — scrape each substance record: Sanskrit name, botanical name, rasa/guna/virya/vipaka, therapeutic uses, habitat, cultivation status | **P1** |
| 51 | **Ayusoft Database** (CCRAS digital database of Ayurvedic formulations) | ❌ MISSING | `http://ayusoft.cdac.in` | Playwright → scrape formulation records | **P2** |
| 52 | **Siddha Pharmacopoeia of India** | ❌ MISSING | `https://pcimh.gov.in` | PDF download + OCR | **P2** |
| 53 | **Unani Pharmacopoeia of India** | ❌ MISSING | `https://pcimh.gov.in` | PDF download + OCR | **P2** |

---

## SECTION 5: TKDL & PRIOR ART SYSTEM

> PS explicitly demands "a TKDL / prior-art pointer". TKDL is restricted but you can build a reference layer.

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 54 | **TKDL Pointer Module** (reference records) | ❌ MISSING | **Cannot directly scrape** — TKDL (tkdl.res.in) has 500K+ formulations under restricted access agreements with 14 patent offices | Build manually: create ~50 reference records that teach the AI how TKDL works, the TKRC classification system, how to guide users to search TKDL, which patent offices have access agreements | **P0** |
| 55 | **TKDL Representative Samples** (~1,250 public) | ❌ MISSING | `https://tkdl.res.in` → look for any publicly available sample entries or published TKDL examples in WIPO/CSIR publications | Playwright → scrape any publicly accessible samples. Check CSIR publications and WIPO TKDL presentation materials for example entries | **P1** |
| 56 | **TKRC Classification System** | ❌ MISSING | Published in academic papers. Google Scholar: "Traditional Knowledge Resource Classification TKRC system CSIR" | Manual compilation from academic papers + CSIR publications. Create structured classification tree: A (Ayurveda) → Pharmaceutical → Plant-origin → Family → Genus → Species | **P1** |
| 57 | **TKDL Access Agreements** (which patent offices have agreements) | ❌ MISSING | `https://csir.res.in` (CSIR annual reports), WIPO publications on TKDL | Manual compilation: list of 14 patent offices (USPTO, EPO, JPO, UKIPO, etc.) with agreement dates | **P2** |

---

## SECTION 6: IP REGISTRY & DATABASE RECORDS

> PS says the assistant should "facilitate access to authoritative sources — free official databases directly"

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 58 | **Indian Patent Database (InPASS)** — AYUSH patent records | ❌ MISSING | `https://ipindiaservices.gov.in/PublicSearch` | **Playwright** — search by IPC codes A61K36/% (medicinal plants), A61K35/% (animal/plant origin). Extract: application no, title, abstract, filing date, status, assignee. Rate limit: 1 req/5s. ~2,000 AYUSH patents | **P1** |
| 59 | **Google Patents BigQuery** — Indian AYUSH patents bulk | ❌ MISSING | `patents-public-data.patents.publications` on Google BigQuery | BigQuery SQL query (free tier: 1TB/month): `WHERE country_code='IN' AND (LOWER(title.text) LIKE '%ayurved%' OR ipc.code LIKE 'A61K36%')`. Returns ~50K records | **P1** |
| 60 | **WIPO PATENTSCOPE** — PCT AYUSH applications | ❌ MISSING | `https://patentscope.wipo.int/search/en/search.jsf` | PATENTSCOPE API (free key): search `FP:(ayurved* OR herbal) AND IC:(A61K36/*)`. ~5K PCT applications | **P2** |
| 61 | **Trademark Registry (TMR India)** — AYUSH brand searches | ❌ MISSING | `https://ipindiaservices.gov.in/tmrpublicsearch` | Playwright → search Class 5 (pharmaceuticals) with keywords "ayurved", "herbal". Extract: TM name, class, applicant, status, filing date | **P2** |
| 62 | **GI Registry Journal** — registered Ayurvedic/medicinal GIs | ❌ MISSING | `https://ipindia.gov.in/gi-journal.htm` | Download PDF journals → PyMuPDF → filter for Class 5 (medicinal) and ayurvedic/herbal products | **P1** |
| 63 | **NBA ABS E-filing Portal** — ABS filing records | ❌ MISSING | `https://absefiling.nbaindia.in` | Playwright → scrape public filing summaries. Understand actual ABS compliance patterns | **P2** |

---

## SECTION 7: GLOBAL MARKET ACCESS & EXPORT REGIMES

> PS requires "herbal-product market-access regimes of key export markets". Currently ZERO records.

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 64 | **EU: Traditional Herbal Medicinal Products Directive (THMPD) 2004/24/EC** | ❌ MISSING | `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004L0024` | requests → HTML extract full Directive text. Key: 15-year traditional use evidence requirement, simplified registration for EU herbal list | **P0** |
| 65 | **EU: Novel Food Regulation (EC 2015/2283)** | ❌ MISSING | `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32015R2283` | requests → HTML. Many Ayurvedic ingredients classified as "novel food" needing safety dossier | **P1** |
| 66 | **EU: Novel Food Catalogue** — herb-by-herb status | ❌ MISSING | `https://ec.europa.eu/food/food-feed-portal/screen/novel-food-catalogue/search` | **Playwright** (dynamic search interface) → search common Ayurvedic herbs (Ashwagandha, Guduchi, Brahmi) → record status | **P1** |
| 67 | **US: Dietary Supplement Health and Education Act (DSHEA) 1994** | ❌ MISSING | `https://www.fda.gov/regulatory-information/laws-enforced-fda/dietary-supplement-health-and-education-act-1994-amendments-federal-food-drug-and-cosmetic-act` | requests → HTML extract. US pathway for Ayurvedic products as dietary supplements. NDI notification requirement | **P0** |
| 68 | **US: FDA Import Alerts** for Ayurvedic Products | ❌ MISSING | `https://www.fda.gov/industry/actions-enforcement/import-alerts` → search "ayurvedic" | requests + BS4. List of FDA detention/refusal actions on Ayurvedic imports. Heavy metal contamination alerts | **P1** |
| 69 | **Japan: PMD Act** (Pharmaceutical and Medical Devices Act) | ❌ MISSING | `https://www.pmda.go.jp/english/` | Manual + requests. Kampo medicine regulatory pathway as comparison | **P2** |
| 70 | **Australia: TGA** — regulatory pathway for complementary medicines | ❌ MISSING | `https://www.tga.gov.au/how-we-regulate/complementary-medicines` | requests → HTML | **P2** |
| 71 | **Canada: Natural Health Products Regulations** | ❌ MISSING | `https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/` | requests → HTML | **P2** |
| 72 | **ASEAN MRA for Traditional Medicines** | ❌ MISSING | ASEAN Secretariat → search "traditional medicine mutual recognition" | Manual + PDF download | **P2** |
| 73 | **WHO Traditional Medicine Strategy 2014-2023** (and successor) | ❌ MISSING | `https://www.who.int/publications/i/item/9789241506096` | Direct PDF download → PyMuPDF. Global policy framework for TM integration | **P1** |

---

## SECTION 8: ADVERTISING & LABELLING COMPLIANCE

> PS mentions "fast-moving advertising and regulatory landscape" and D&MR Act

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 74 | **ASCI Code for Ayurvedic advertising** | ❌ MISSING | `https://ascionline.in/index.php/code-and-guidelines` (Advertising Standards Council of India) | Download guidelines PDF → PyMuPDF → extract AYUSH-specific advertising restrictions | **P1** |
| 75 | **AYUSH Ministry advertising guidelines** | ❌ MISSING | `https://main.ayush.gov.in` → notifications section | Search for AYUSH advertising notifications, especially the 2024 updates on Rule 170 omission | **P1** |
| 76 | **Consumer Protection Act, 2019** — misleading ads | ❌ MISSING | `https://indiacode.nic.in` → Consumer Protection Act 2019, Sections 2(28), 21, 89 | Playwright → extract relevant sections on misleading advertisements for health products | **P2** |

---

## SECTION 9: KNOWLEDGE GRAPH REFERENCE DATA

> PS mentions "relational knowledge graph" — these are the cross-cutting reference datasets

| # | Data Item | Status | Where to Find | How to Get | Priority |
|---|-----------|--------|---------------|------------|----------|
| 77 | **Formulation classification decision tree** | ❌ MISSING | Build from PS description + D&C Act definitions | **Manual construction**: Classical (First Schedule text match) → Patent/Proprietary (ingredients from First Schedule, non-matching recipe) → New Drug (non-classical, needs clinical trial) → Phytopharmaceutical (Rule 122-DAB) → Ayurveda Aahar (FSSAI 2022) → Cosmetic (Cosmetics Rules 2020) | **P0** |
| 78 | **IP type routing logic** | ❌ MISSING | Build from PS description | **Manual construction**: For each formulation type, map to applicable IP regimes: Patents (3(p) bar?), GI (region-specific?), TM (brand name?), Copyright (classical text?), Design (packaging?), Trade Secret (proprietary process?), Plant Variety (new cultivar?) | **P0** |
| 79 | **Cross-reference mapping** (statute ↔ treaty ↔ case) | ❌ MISSING | Extract from statutory cross-references during scraping | Build during data ingestion: when Section 10(4)(d)(ii)(D) references "biological material", link to BDA Section 3/6, Nagoya Protocol Art. 6, CBD Art. 15 | **P1** |

---

## GRAND SUMMARY: DATA ACQUISITION SCORECARD

| Category | Total Items | ✅ Have | ⚠️ Broken | ❌ Missing | P0 Items Missing |
|----------|------------|--------|-----------|-----------|-----------------|
| **Indian Statutes & Rules** | 24 | 3 | 12 | 9 | 5 |
| **International Treaties** | 11 | 0 | 0 | 11 | 4 |
| **Case Law** | 10 | 0 | 0 | 10 | 5 |
| **Pharmacopoeia & Classical** | 8 | 0 | 0 | 8 | 2 |
| **TKDL & Prior Art** | 4 | 0 | 0 | 4 | 1 |
| **IP Registry Records** | 6 | 0 | 0 | 6 | 0 |
| **Global Market Access** | 10 | 0 | 0 | 10 | 2 |
| **Advertising & Labelling** | 3 | 0 | 0 | 3 | 0 |
| **Knowledge Graph** | 3 | 0 | 0 | 3 | 2 |
| **TOTAL** | **79** | **3** | **12** | **64** | **21** |

> [!CAUTION]
> **Only 3 out of 79 required data items are in usable condition.** 12 more exist but are broken. 64 are completely missing. The 21 P0-missing items are what stand between you and a winning demo.

---

## EXECUTION PRIORITY ORDER (What to Do First)

### 🔴 Sprint 1: Demo-Critical (Days 1-3) — Fix what's broken + add minimum international
1. Re-scrape **BD Act Section 7/7A/36** (ABS exemption) — 1 hour
2. Re-scrape **D&MR Act 1954** Sections 3,4,7 + Schedule — 1 hour  
3. Re-scrape **FSSAI Ayurveda Aahar 2022** — 1 hour
4. Scrape **TRIPS** Articles 27, 29, 31, 33, 39 — 1 hour
5. Scrape **CBD** Articles 8(j), 15 + **Nagoya Protocol** Articles 5-12 — 2 hours
6. Scrape **WIPO GRATK Treaty 2024** — 1 hour
7. Manually compile **5 landmark cases** (Turmeric, Neem, Basmati, Novartis, one 3(p) case) — 3 hours
8. Build **Formulation classification tree** + **IP routing logic** — 2 hours
9. Build **TKDL pointer module** (~50 reference records) — 2 hours
10. Scrape **Patents Amendment Rules 2024** gazette — 1 hour

**Result**: Fixes 80% of benchmark failures. Demo can answer international, classification, ABS, and case law questions.

### 🟡 Sprint 2: Full Statute Repair (Days 4-7)
11. Full re-scrape of 10 broken statutes from IndiaCode via Playwright
12. Scrape all missing Rules (TM Rules 2017, GI Rules 2002, Design Rules 2001, PPV&FR Rules 2003, Copyright Rules 2013)
13. Extract Schedule T, E(1), First Schedule, Rule 161B as structured tables
14. Scrape ABS Regulations 2025 (benefit-sharing slabs)
15. Add DPDP Act 2023

### 🟢 Sprint 3: Depth & Export (Days 8-14)
16. OCR Ayurvedic Pharmacopoeia Vols I-II (drug monographs)
17. OCR Ayurvedic Formulary Parts I-II (classical formulations — THE core data)
18. Scrape EU THMPD + US DSHEA (top 2 export markets)
19. Indian Kanoon API — 50 targeted IPR/TK case law queries
20. HuggingFace Indian Legal Dataset — filter IP/TK cases
21. Scrape remaining international treaties (PCT, Madrid, Budapest)

### 🔵 Sprint 4: Polish (Days 15-21)
22. DRAVYA Portal substance profiles
23. e-Samhita classical texts
24. InPASS patent records, TMR trademark records
25. EU Novel Food Catalogue, FDA Import Alerts
26. Japan/Australia/Canada/ASEAN pathways
27. ASCI advertising code, Consumer Protection Act
28. Build full cross-reference graph

---

## TOOLS YOU NEED

```bash
pip install playwright requests beautifulsoup4 PyMuPDF lxml
pip install surya-ocr        # For scanned Pharmacopoeia PDFs (Hindi+English mixed)
pip install datasets huggingface_hub  # For HuggingFace legal datasets
playwright install chromium

# Indian Kanoon API: register at https://api.indiankanoon.org/
# Google BigQuery: Use free tier at https://console.cloud.google.com/bigquery
```

---

> **Bottom line**: You have the Indian statute skeleton but it's 50% hollow, and you're missing 5 entire domains (international treaties, case law, pharmacopoeia, export regimes, TKDL). Sprint 1 alone transforms this from a broken demo into a competitive entry.
