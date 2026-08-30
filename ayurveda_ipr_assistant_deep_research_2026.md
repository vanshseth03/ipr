# Ayurveda IPR & Regulatory Assistant — Deep Research

> **Knowledge Sources, Database Access, Existing Tools, Architecture, and Competitive Landscape**
> Generated: August 25, 2026

---

## Table of Contents

1. [Problem Statement Dissection](#1-problem-statement-dissection)
2. [The Core Challenge: Where Does Knowledge Come From?](#2-knowledge-sourcing)
3. [Complete Database & Data Source Catalog](#3-database-catalog)
4. [Existing Tools & Competitors](#4-existing-tools)
5. [Regulatory Framework Map](#5-regulatory-framework)
6. [Technical Architecture for the RAG System](#6-technical-architecture)
7. [Knowledge Graph Design](#7-knowledge-graph)
8. [Multilingual & Voice Strategy](#8-multilingual)
9. [MVP vs Full Product Breakdown](#9-mvp-breakdown)
10. [What Judges Actually Want](#10-what-judges-want)
11. [Development Roadmap](#11-development-roadmap)

---

## 1. Problem Statement Dissection

### What this PS is really asking for:

This is NOT a simple chatbot. It's a **domain-expert legal assistant** with 6 distinct capabilities:

| # | Capability | Complexity | Key Challenge |
|---|-----------|------------|---------------|
| 1 | **Formulation Classifier** — Determine if product is classical / proprietary / phytopharmaceutical / nutraceutical / cosmetic | ⭐⭐⭐⭐ | Requires deep knowledge of D&C Act schedules |
| 2 | **IPR Advisor** — Route to correct IP regime (patent, GI, trademark, trade secret, etc.) | ⭐⭐⭐⭐⭐ | Multiple overlapping statutes, Section 3(p) analysis |
| 3 | **ABS Compliance Helper** — Access & Benefit Sharing under Biological Diversity Act | ⭐⭐⭐⭐ | 2023 amendment changed everything; exemptions for AYUSH |
| 4 | **TKDL / Prior Art Pointer** — Check if formulation is already documented traditional knowledge | ⭐⭐⭐⭐ | TKDL access is restricted/paid |
| 5 | **Jurisdiction Toggle** — India vs International law, kept separate | ⭐⭐⭐ | Two parallel answer streams |
| 6 | **Source Citation Engine** — Every answer traced to statute/rule/treaty | ⭐⭐⭐⭐⭐ | RAG grounding + hallucination prevention |

### Additional Requirements:
- Multilingual (Bhashini integration)
- Confidence indicator on answers
- Escalation path to human IP facilitator
- Privacy/audit/security (DPDP Act compliant)
- "Information, not legal advice" disclaimer
- Version-tracked corpus

---

## 2. The Core Challenge: Where Does Knowledge Come From?

This is your key question. The assistant needs knowledge from **5 distinct layers**:

```
Layer 1: STATUTES & RULES (the law itself)
    ├── Indian Acts (Patents, Trademarks, GI, D&C, Biodiversity, etc.)
    ├── Rules & Notifications (Patent Rules 2024, Biodiversity Rules 2024, etc.)
    └── International Treaties (TRIPS, CBD, Nagoya, WIPO GRATK, PCT, Madrid)

Layer 2: PHARMACOPOEIAL & CLASSICAL TEXTS
    ├── Ayurvedic Pharmacopoeia of India (API) — drug standards
    ├── Ayurvedic Formulary of India (AFI) — classical formulations
    ├── First Schedule texts (Charaka Samhita, Sushruta Samhita, etc.)
    └── FSSAI Ayurveda Aahar Schedule A recipes

Layer 3: REGISTRY & CASE DATA
    ├── Patent search (InPASS / IPIndia)
    ├── Trademark search (TMR India)
    ├── GI Registry
    ├── TKDL records (restricted)
    ├── Case law (IndianKanoon, eCourts)
    └── NBA / ABS filings

Layer 4: REGULATORY GUIDELINES
    ├── AYUSH Examination Guidelines for Patents (2025)
    ├── FSSAI licensing (FoSCoS portal)
    ├── CDSCO phytopharmaceutical pathway
    ├── DMR(OA) Act advertising rules
    └── Export market requirements (EU THMP, US DSHEA, etc.)

Layer 5: INTERNATIONAL INSTRUMENTS
    ├── WIPO GRATK Treaty (2024)
    ├── Convention on Biological Diversity
    ├── Nagoya Protocol
    ├── TRIPS Agreement
    ├── PCT, Madrid, Hague, Budapest systems
    └── Target market herbal regulations (EU, US, ASEAN)
```

---

## 3. Complete Database & Data Source Catalog

### 3.1 FREE / Open-Access Sources

| Source | What It Contains | Access Method | API? | Format |
|--------|-----------------|---------------|------|--------|
| **India Code** (indiacode.nic.in) | All Central Acts & Rules | Web portal | No official API; community "Statute API" exists | HTML/PDF |
| **IndianKanoon** (indiankanoon.org) | Case law, judgments, statutes | Web search | No official API; scraping possible | HTML |
| **InPASS** (ipindiaservices.gov.in/publicsearch) | Indian patent applications & grants | Web portal | No API | HTML |
| **TMR India** (ipindiaservices.gov.in/tmrpublicsearch) | Trademark registry search | Web portal | No API | HTML |
| **GI Registry** (ipindia.gov.in/geographical-indications.htm) | Registered GIs, status | Web portal + PDF lists | No API | HTML/PDF |
| **Google Patents** (patents.google.com) | Global patents incl. India | Web + API | Yes (BigQuery, SerpAPI) | JSON |
| **WIPO PATENTSCOPE** (patentscope.wipo.int) | PCT applications, global search | Web + API | Yes (REST API) | XML/JSON |
| **Espacenet** (worldwide.espacenet.com) | EPO patent database | Web + API (OPS) | Yes (Open Patent Services) | XML |
| **DRAVYA Portal** (CCRAS) | Ayurvedic substance database | Web portal | No API | HTML |
| **Ayurvedic Pharmacopoeia of India** | Drug standards, monographs | PDFs on archive.org, PCIMH site | No API | PDF |
| **FSSAI FoSCoS** (foscos.fssai.gov.in) | Food licensing portal | Web portal | No API | HTML |
| **NBA ABS Portal** (absefiling.nbaindia.in) | ABS certificates, filings | Web portal | No API | HTML |
| **WIPO Lex** (wipo.int/wipolex) | International IP treaties | Web portal + download | Partial API | PDF/HTML |
| **CBD Clearing House** (absch.cbd.int) | ABS permits, Nagoya checkpoint | Web search | REST API available | JSON |
| **HuggingFace Legal Datasets** | Indian law datasets for ML | Download | HF API | JSON/Parquet |
| **KanoonGPT Dataset** | Cleaned Indian legal text | HuggingFace | HF API | JSON |

### 3.2 RESTRICTED / Paid Access Sources

| Source | What It Contains | Access | Cost | Integration Notes |
|--------|-----------------|--------|------|-------------------|
| **TKDL** (tkdl.res.in) | 500,000+ traditional formulations | Paid subscription (phased rollout) | Subscription-based | Need formal agreement; can only reference, not reproduce |
| **Manupatra** | Case law + statutes (premium) | Paid subscription | ₹5,000-50,000/yr | API possible with enterprise license |
| **SCC Online** | Supreme Court Cases, commentary | Paid subscription | ₹10,000+/yr | No public API |
| **LexisNexis India** | Comprehensive legal database | Paid subscription | Enterprise pricing | API available |
| **Clarivate Derwent** | Enhanced patent analytics | Paid | Enterprise | REST API |

### 3.3 How to Actually Ingest This Data

```
Step 1: Statutes & Rules
  → Download from India Code (PDFs/HTML)
  → Use community "Statute API" for structured JSON
  → Parse with PyMuPDF + custom section splitter
  → Chunk by Section/Sub-section (preserve legal hierarchy)

Step 2: Case Law
  → Scrape IndianKanoon (with rate limiting)
  → Or use HuggingFace dataset: d-riti/Dataset-For-Indian-Legal-Knowledge-Base
  → Filter for IPR-related judgments (Patents Act, TM Act, etc.)

Step 3: Pharmacopoeial Data
  → Download API/AFI volumes from archive.org
  → OCR scanned pages with Tesseract
  → Structure into: Drug Name → Ingredients → Method → Reference Text

Step 4: Patent Data
  → Use Google Patents BigQuery for bulk Indian patent data
  → Or WIPO PATENTSCOPE API for PCT applications
  → Or Espacenet OPS API for global coverage

Step 5: Treaties & International Law
  → Download from WIPO Lex (all treaties in PDF)
  → CBD ABSCH API for Nagoya Protocol data
  → Structure: Treaty → Article → Obligation → India's position

Step 6: TKDL
  → Cannot directly ingest (restricted)
  → Build a "TKDL Pointer" — guide users to search TKDL themselves
  → Reference TKRC classification codes in your knowledge base
```

---

## 4. Existing Tools & Competitors

### What already exists (and what doesn't):

| Tool | What It Does | Covers Ayurveda IPR? | Gap |
|------|-------------|---------------------|-----|
| **IP SAARTHI** (DPIIT chatbot) | General IP queries, TM search | Partial — generic IP, not AYUSH-specific | No formulation classification, no ABS |
| **KanoonGPT** | Indian law chatbot | General law only | No domain specialization for AYUSH/IPR |
| **Formulaite** | AI formulation builder for AYUSH | Yes (formulation side) | No IPR/legal layer |
| **CCRAS AI Chatbot** (in development) | Ayurveda health advice | Health only | No IPR component |
| **AyUR-bot** | Personalized Ayurveda recommendations | Health only | No legal/regulatory |
| **Ayuveda AI** | Health recommendations | Health only | No IPR/regulatory |
| **India Law AI RAG** (GitHub) | Indian law RAG chatbot | General law | Not AYUSH-specific |
| **TKDL Search** | Prior art for patent offices | Yes (defensive) | Not accessible to public yet; no advisory |

### The GAP: No tool exists that combines:
1. Formulation classification (drug vs food vs cosmetic)
2. IPR routing (which IP regime applies)
3. ABS compliance checking
4. TKDL/prior art guidance
5. Source-cited legal answers
6. India + International jurisdiction toggle

**This gap IS the opportunity. The PS is asking you to build something that genuinely doesn't exist.**

---

## 5. Regulatory Framework Map

### 5.1 Product Classification Flow (The Decision Tree)

```
START: "I have an Ayurvedic product"
  │
  ├─ Is the formulation in a First Schedule text?
  │   ├─ YES → CLASSICAL / GENERIC MEDICINE
  │   │         • Licensed under D&C Act Rule 151-161
  │   │         • No clinical trial needed
  │   │         • Section 3(p) bars patenting the formulation itself
  │   │         • Defended via TKDL
  │   │         • GI may apply if region-specific
  │   │
  │   └─ NO → Is it based on Ayurvedic ingredients?
  │       │
  │       ├─ YES, new combination → PATENT/PROPRIETARY MEDICINE
  │       │         • Must disclose all ingredients
  │       │         • Can be patented IF novel + inventive step + synergistic effect
  │       │         • Section 3(e) analysis needed (mere admixture bar)
  │       │         • Trademark for brand name
  │       │         • ABS compliance if using biological resources
  │       │
  │       ├─ YES, purified extract with 4+ bioactives → PHYTOPHARMACEUTICAL
  │       │         • CDSCO approval pathway
  │       │         • Clinical trials required (Phase I-III)
  │       │         • Full patent potential
  │       │         • ABS compliance mandatory
  │       │         • Budapest Treaty deposit if microbial
  │       │
  │       ├─ YES, for dietary use / health maintenance → AYURVEDA AAHAR
  │       │         • FSSAI regulated (NOT a drug)
  │       │         • Check Schedule A Category list
  │       │         • Cannot make therapeutic claims
  │       │         • Trademark protection
  │       │         • No Section 3(p) issue (not claiming drug patent)
  │       │
  │       └─ YES, for beauty / appearance → COSMETIC
  │                 • D&C Act cosmetic provisions
  │                 • No therapeutic claims allowed
  │                 • Trademark + design protection
  │                 • Lighter regulatory burden
```

### 5.2 Statutes the System Must Know

#### NATIONAL (India)

| Statute / Rule | What It Governs | Key Sections for Ayurveda |
|---------------|-----------------|---------------------------|
| **Patents Act, 1970** | Patent grant & revocation | S.3(d), 3(e), 3(p) — bars on TK/admixtures |
| **Patents (Amendment) Rules, 2024** | Procedural changes | RFE reduced to 31 months; Form 3/27 changes |
| **AYUSH Patent Examination Guidelines, 2025** | AYUSH patent examination | Inventive step, synergistic effect, TKDL cross-check |
| **Trade Marks Act, 1999** | Brand/name protection | First-to-file; descriptive marks issues |
| **Geographical Indications Act, 1999** | Region-specific products | Registration, authorized users |
| **Copyright Act, 1957** | Classical text protection | S.2(d)(vi) — compilations |
| **Designs Act, 2000** | Product appearance | Packaging, device designs |
| **Plant Variety Protection Act, 2001** | Cultivar rights | Farmers' rights, extant varieties |
| **Biological Diversity Act, 2002** (amended 2023) | ABS obligations | AYUSH exemptions; cultivated plant exemptions |
| **Biological Diversity Rules, 2024** | ABS procedures | Digital portal, certificates of origin |
| **ABS Regulations, 2025** | Benefit-sharing slabs | Turnover-based: 0% (<₹5Cr), 0.2-0.6% (above) |
| **Drugs & Cosmetics Act, 1940** | Drug/cosmetic regulation | Ch IVA (ASU drugs); First Schedule texts |
| **D&C Rules, 1945** | Manufacturing, licensing | Rules 151-161 (ASU); Schedule T (GMP) |
| **Drugs & Magic Remedies (OA) Act, 1954** | Advertising restrictions | Prohibited claims, specified diseases |
| **Rule 170, D&C Rules** | ASU advertisement pre-approval | Currently in flux (SC stay) |
| **FSSAI Act, 2006** | Food safety | Nutraceutical/health supplement rules |
| **FSSAI Ayurveda Aahar Regulations, 2022** | Traditional food | Schedule A (Category A products) |
| **DPDP Act, 2023** | Data privacy | Consent, processing, cross-border |

#### INTERNATIONAL

| Treaty / System | What It Governs | Key for Ayurveda |
|----------------|-----------------|------------------|
| **TRIPS (WTO)** | Minimum IP standards | Art 27 (patentable subject matter), Art 29 (disclosure) |
| **CBD (1992)** | Biodiversity sovereignty | Art 15 (access), Art 8(j) (TK), Art 16 (tech transfer) |
| **Nagoya Protocol (2010)** | ABS framework | PIC, MAT, checkpoints |
| **WIPO GRATK Treaty (2024)** | GR/TK disclosure in patents | Mandatory country-of-origin disclosure; "based on" test |
| **PCT** | International patent filing | Chapter I/II, international search |
| **Madrid System** | International trademark | Single application for multiple countries |
| **Hague System** | International designs | Industrial design protection |
| **Budapest Treaty** | Micro-organism deposits | Required for biotech/micro patents |
| **EU THMPD** | EU herbal medicines | Traditional use registration; 30-year evidence |
| **US DSHEA (1994)** | US dietary supplements | Structure/function claims; NDI notification |
| **ASEAN harmonization** | SE Asian market access | ACTD format, ASEAN reference substances |

---

## 6. Technical Architecture for the RAG System

### 6.1 Core Stack

```
┌──────────────────────────────────────────────────────────┐
│                   USER INTERFACE LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Web Chat UI  │  │  Voice Input  │  │ Jurisdiction   │  │
│  │  (React/Next) │  │  (Bhashini    │  │ Toggle         │  │
│  │              │  │   ASR+TTS)    │  │ [India|Intl]   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │
│         └──────────────────┼──────────────────┘           │
│                            ▼                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              ORCHESTRATION LAYER                      │ │
│  │  LangGraph / LlamaIndex Agent                         │ │
│  │  ┌────────────┐ ┌──────────────┐ ┌────────────────┐  │ │
│  │  │ Intent     │ │ Formulation  │ │ IPR Router     │  │ │
│  │  │ Parser     │ │ Classifier   │ │ Agent          │  │ │
│  │  └─────┬──────┘ └──────┬───────┘ └───────┬────────┘  │ │
│  │        │               │                  │            │ │
│  │  ┌─────┴───────────────┴──────────────────┴────────┐  │ │
│  │  │           RETRIEVAL LAYER                        │  │ │
│  │  │  ┌─────────────┐  ┌──────────────┐              │  │ │
│  │  │  │ Vector Store │  │ BM25 Keyword │ ← Hybrid    │  │ │
│  │  │  │ (Qdrant)     │  │ Search       │   Search    │  │ │
│  │  │  └──────┬──────┘  └──────┬───────┘              │  │ │
│  │  │         └────────┬───────┘                       │  │ │
│  │  │                  ▼                               │  │ │
│  │  │  ┌───────────────────────────────────┐           │  │ │
│  │  │  │     KNOWLEDGE GRAPH (Neo4j)       │           │  │ │
│  │  │  │  Statute → Section → Subsection   │           │  │ │
│  │  │  │  Treaty → Article → Obligation    │           │  │ │
│  │  │  │  Drug → Ingredients → Text Ref    │           │  │ │
│  │  │  └───────────────────────────────────┘           │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                         │                              │ │
│  │                         ▼                              │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           GENERATION LAYER                       │  │ │
│  │  │  LLM (GPT-4o / Llama 3 / Gemini)                │  │ │
│  │  │  + Citation Enforcement                          │  │ │
│  │  │  + Confidence Scoring                            │  │ │
│  │  │  + "Not legal advice" guardrail                  │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           CURATED CORPUS (Version-Tracked)           │ │
│  │  Git-versioned document store                         │ │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │ │
│  │  │Statutes │ │Case Law  │ │Pharma-   │ │Treaties │  │ │
│  │  │& Rules  │ │& Judgments│ │copoeia   │ │& Intl   │  │ │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Technology Choices

| Component | Technology | Why |
|-----------|-----------|-----|
| **Orchestration** | LangGraph (agentic) | Multi-agent workflow: classify → route → retrieve → generate |
| **LLM** | GPT-4o or Gemini 2.5 (cloud) / Llama 3.1 70B (self-hosted) | Legal reasoning quality; self-hosted for privacy |
| **Vector DB** | Qdrant (free tier) or ChromaDB | Semantic search over legal chunks |
| **Keyword Search** | BM25 via Elasticsearch or rank_bm25 | Exact section/rule number matching |
| **Knowledge Graph** | Neo4j Community Edition | Statute cross-references, legal hierarchy |
| **Document Processing** | PyMuPDF + Docling + Tesseract OCR | PDF extraction, scanned text |
| **Embeddings** | OpenAI text-embedding-3-large or BGE-M3 | Multilingual legal embeddings |
| **Chunking** | Custom legal section splitter | Preserve Section/Sub-section boundaries |
| **Frontend** | Next.js or plain HTML/CSS/JS | Chat UI with jurisdiction toggle |
| **Multilingual** | Bhashini API (ULCA pipeline) | 22 Indian languages, ASR + NMT + TTS |
| **Evaluation** | RAGAS framework | Retrieval accuracy, faithfulness, citation correctness |
| **Version Control** | Git (corpus) + DVC (large files) | Track statute amendments over time |
| **Privacy** | DPDP-compliant consent flows | User data handling, audit logs |

---

## 7. Knowledge Graph Design

### Entity Types

```
(:Statute {name, year, ministry, last_amended})
(:Section {number, title, text, statute})
(:SubSection {number, text})
(:Rule {number, title, text, parent_rules})
(:Treaty {name, year, signatories})
(:Article {number, title, text})
(:DrugFormulation {name, type, reference_text})
(:Ingredient {name, botanical_name, part_used})
(:IPCategory {name: "Patent|GI|Trademark|Copyright|Design|TradeSecret|PlantVariety"})
(:Jurisdiction {name: "India|International|EU|US|ASEAN"})
(:CaseLaw {citation, court, year, summary})
```

### Key Relationships

```
(:Section)-[:BELONGS_TO]->(:Statute)
(:Section)-[:REFERS_TO]->(:Section)  // cross-references
(:Section)-[:AMENDED_BY]->(:Rule)
(:Section)-[:INTERPRETED_IN]->(:CaseLaw)
(:DrugFormulation)-[:CLASSIFIED_AS]->(Classical|Proprietary|Phyto|Aahar|Cosmetic)
(:DrugFormulation)-[:CONTAINS]->(:Ingredient)
(:DrugFormulation)-[:REFERENCED_IN]->(:Section)  // First Schedule text
(:IPCategory)-[:GOVERNED_BY]->(:Statute)
(:IPCategory)-[:RELEVANT_FOR]->(ProductType)
(:Treaty)-[:IMPLEMENTED_BY]->(:Statute)
(:Ingredient)-[:REQUIRES_ABS_IF]->(:Condition)
```

---

## 8. Multilingual & Voice Strategy

### Bhashini Integration

```
User speaks in Hindi/Tamil/etc.
    ↓
Bhashini ASR → Hindi text
    ↓
Bhashini NMT → English text
    ↓
RAG pipeline (in English)
    ↓
English response
    ↓
Bhashini NMT → Hindi text
    ↓
Bhashini TTS → Hindi audio
    ↓
User hears response in Hindi
```

- **Languages supported**: 22 Indian languages
- **Registration**: Free at bhashini.gov.in
- **API**: REST for text, WebSocket for real-time speech
- **Key limitation**: Legal terminology translation quality — need custom glossary

---

## 9. MVP vs Full Product Breakdown

### Stage 1: Citation-Grounded Retrieval MVP (4-6 weeks)

| Feature | What to Build |
|---------|--------------|
| Core RAG | Ingest 15-20 key statutes + rules into vector store |
| Chat UI | Simple web interface with text input |
| Jurisdiction Toggle | India / International switch |
| Citation Engine | Every answer cites Section X of Act Y |
| Confidence Score | High / Medium / Low based on retrieval similarity |
| Disclaimer | Auto-appended "information, not legal advice" |
| Formulation Classifier | Decision-tree questionnaire (5-7 questions) |

### Stage 2: Knowledge Graph + Agentic (6-10 weeks)

| Feature | What to Build |
|---------|--------------|
| Neo4j Graph | Statute → Section → cross-references |
| Multi-Agent | Classifier agent + IPR router agent + retrieval agent |
| ABS Helper | Guided flow for Biodiversity Act compliance |
| TKDL Pointer | Guide user to TKDL search + TKRC codes |
| Case Law | Add landmark IPR judgments |
| Escalation | "Connect to human IP facilitator" button |

### Stage 3: Full Product (10-16 weeks)

| Feature | What to Build |
|---------|--------------|
| Bhashini | Multilingual text + voice |
| Paid Source Connectors | Manupatra/SCC with user's credentials (logged) |
| Export Market Module | EU THMPD, US DSHEA, ASEAN pathways |
| Patent Landscape Tool | Search InPASS/Google Patents from within chat |
| Audit Trail | Full query/response logging for DPDP compliance |
| Corpus Versioning | Git-tracked statute amendments |

---

## 10. What Judges Actually Want

### The 5 Differentiators That Win

1. **The Formulation Classifier works live** — User describes their product, system classifies it and explains why, citing the exact D&C Act provisions

2. **The jurisdiction toggle is real** — Ask "Can I patent my Ashwagandha formulation?" → Get India answer (Section 3(p) analysis) AND International answer (WIPO GRATK disclosure, PCT pathway) — visually separated

3. **Citations are clickable** — Every answer has "[Section 3(p), Patents Act 1970]" as a hyperlink to the actual text

4. **The ABS helper catches what people miss** — "Your product uses Ashwagandha. Under the Biological Diversity (Amendment) Act, 2023, if you're a registered AYUSH practitioner using cultivated plants, you're exempt from ABS. Here's what you need to file: [link to NBA portal]"

5. **Safe abstention** — When the system doesn't know, it says so: "This query involves interpretation of Section 3(e) admixture analysis which depends on specific experimental data. I recommend consulting an IP attorney. [Escalate to facilitator]"

---

## 11. Development Roadmap

### Phase 1: Corpus Building (Weeks 1-2)
- [ ] Download & structure 15 core Indian statutes from India Code
- [ ] Download & structure key treaties from WIPO Lex
- [ ] Download Ayurvedic Pharmacopoeia volumes from archive.org
- [ ] Parse all into section-level chunks with metadata
- [ ] Set up Git versioning for corpus

### Phase 2: RAG Core (Weeks 3-4)
- [ ] Set up Qdrant vector store + embeddings pipeline
- [ ] Implement hybrid search (vector + BM25)
- [ ] Build citation enforcement in LLM prompt
- [ ] Implement confidence scoring
- [ ] Build formulation classifier (decision tree + LLM)
- [ ] Add "not legal advice" guardrail

### Phase 3: Chat UI (Week 5)
- [ ] Build web chat interface
- [ ] Implement jurisdiction toggle (India / International)
- [ ] Add source citation display (clickable)
- [ ] Add confidence indicator (traffic light)
- [ ] Add escalation button

### Phase 4: Knowledge Graph (Weeks 6-8)
- [ ] Design Neo4j schema (entities + relationships)
- [ ] Populate with statute cross-references
- [ ] Implement GraphRAG (hybrid vector + graph retrieval)
- [ ] Add ABS compliance flow
- [ ] Add TKDL pointer module

### Phase 5: Multilingual & Polish (Weeks 9-10)
- [ ] Integrate Bhashini API (text NMT for Hindi, Tamil, etc.)
- [ ] Add voice input/output (Bhashini ASR + TTS)
- [ ] Build audit trail / logging
- [ ] Evaluation with RAGAS framework
- [ ] User testing with AYUSH practitioners

---

## Appendix A: Key Patent Examination Points for AYUSH

| Section | What It Bars | How to Overcome |
|---------|-------------|-----------------|
| **3(d)** | New forms of known substances without enhanced efficacy | Show significantly enhanced therapeutic efficacy with clinical data |
| **3(e)** | Mere admixture / aggregation of properties | Demonstrate synergistic effect — the combination > sum of parts |
| **3(p)** | Traditional knowledge or aggregation of known TK | Show genuine novelty — new extraction, new route, new application not in any classical text |

## Appendix B: ABS Quick Reference (Post-2023 Amendment)

| User Type | Uses | ABS Required? | What to File |
|-----------|------|--------------|-------------|
| Registered AYUSH practitioner | Codified TK | **NO** (exempt) | Nothing |
| Any user | Cultivated medicinal plants | **NO** (exempt) | Certificate of Origin via NBA portal |
| Company (turnover < ₹5 Cr) | Wild biological resources | YES but **₹0** | Intimation to NBA |
| Company (turnover ₹5-50 Cr) | Wild biological resources | YES — **0.2%** of gross ex-factory | File with SBB/NBA |
| Company (turnover > ₹250 Cr) | Wild biological resources | YES — **0.6%** | File with NBA |

## Appendix C: Data Source URLs

| Source | URL |
|--------|-----|
| India Code | indiacode.nic.in |
| InPASS (Patent Search) | ipindiaservices.gov.in/publicsearch |
| TMR (Trademark Search) | ipindiaservices.gov.in/tmrpublicsearch |
| GI Registry | ipindia.gov.in/geographical-indications.htm |
| TKDL | tkdl.res.in |
| IndianKanoon | indiankanoon.org |
| DRAVYA Portal | ccras.nic.in |
| NBA ABS Portal | absefiling.nbaindia.in |
| FSSAI FoSCoS | foscos.fssai.gov.in |
| PCIMH (Pharmacopoeia) | pcimh.gov.in |
| WIPO Lex | wipo.int/wipolex |
| WIPO PATENTSCOPE | patentscope.wipo.int |
| Espacenet OPS API | developers.epo.org |
| Google Patents | patents.google.com |
| CBD ABSCH | absch.cbd.int |
| Bhashini | bhashini.gov.in |
| HF Legal Datasets | huggingface.co/KanoonGPT |
| AYUSH ANUDAN | ayushanudan.gov.in |
| Statute API (community) | Available on GitHub |
| RAGAS (Evaluation) | docs.ragas.io |
