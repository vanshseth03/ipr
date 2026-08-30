# Ayurveda IPR Assistant — Complete Data Specification Guide

> **What to Scrape, How to Scrape, Exact Data Fields, Unified Schema for RAG**
> Generated: August 26, 2026

---

## Table of Contents

1. Unified Data Format (The Master Schema)
2. Data Category A: Statutes and Rules
3. Data Category B: Pharmacopoeial and Classical Texts
4. Data Category C: Patent and IP Registry Data
5. Data Category D: Case Law and Judgments
6. Data Category E: Treaty and International Law
7. Data Category F: Regulatory and Compliance Data
8. Data Category G: TKDL Reference Data
9. Scraping Methodology Per Source
10. Complete Field Reference

---

## 1. UNIFIED DATA FORMAT — The Master Schema

> [!IMPORTANT]
> Every piece of scraped data, regardless of source, MUST be converted into this unified JSON format before entering the RAG pipeline. This ensures consistent chunking, embedding, retrieval, and citation.

### 1.1 The Universal Document Object (UDO)

Every scraped item becomes one or more UDO records. This is the ONLY format your RAG system reads.

```json
{
  "doc_id": "IND-PAT-1970-S003P",
  "doc_type": "statute_section",
  "title": "Section 3(p) - Inventions relating to traditional knowledge",
  "content": "The full text of this section goes here. An invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components.",
  "content_plain": "Same as above but stripped of all formatting",

  "source": {
    "name": "Patents Act, 1970",
    "url": "https://indiacode.nic.in/handle/123456789/1392",
    "access_date": "2026-08-15",
    "version": "2024-amendment",
    "page_number": null,
    "volume": null
  },

  "hierarchy": {
    "level_1": "Patents Act, 1970",
    "level_2": "Chapter II - Inventions Not Patentable",
    "level_3": "Section 3",
    "level_4": "Clause (p)",
    "level_5": null
  },

  "metadata": {
    "jurisdiction": "India",
    "language": "en",
    "category": "statute",
    "sub_category": "patent_law",
    "effective_date": "2005-01-01",
    "last_amended": "2024-03-15",
    "is_current": true,
    "tags": ["patent_bar", "traditional_knowledge", "section_3p", "AYUSH"],
    "cross_references": [
      "IND-PAT-1970-S003D",
      "IND-PAT-1970-S003E",
      "IND-TKDL-POINTER"
    ],
    "related_statutes": ["Biological Diversity Act, 2002", "D&C Act, 1940"]
  },

  "rag_config": {
    "chunk_strategy": "section_boundary",
    "max_tokens": 1500,
    "overlap_tokens": 200,
    "embedding_model": "BGE-M3",
    "importance_score": 0.95,
    "citation_format": "[Section 3(p), Patents Act, 1970]"
  },

  "checksum": "sha256:a1b2c3d4e5f6..."
}
```

### 1.2 Document Types (doc_type values)

| doc_type | What It Represents | Source Category |
|----------|-------------------|----------------|
| `statute_section` | A section/sub-section of an Indian Act | Statutes |
| `rule` | A rule under a statutory instrument | Statutes |
| `notification` | Government notification/gazette entry | Statutes |
| `drug_monograph` | Single drug entry from Pharmacopoeia | Pharmacopoeia |
| `formulation` | Classical formulation from AFI | Pharmacopoeia |
| `classical_text_verse` | Verse/chapter from Charaka/Sushruta/etc. | Classical Texts |
| `patent_record` | Patent application/grant record | Patents |
| `trademark_record` | Trademark registry entry | IP Registry |
| `gi_record` | Geographical Indication entry | IP Registry |
| `case_judgment` | Court judgment or order | Case Law |
| `treaty_article` | Article from international treaty | Treaties |
| `abs_regulation` | ABS rule/regulation/slab | Compliance |
| `regulatory_pathway` | Product approval pathway steps | Compliance |
| `tkdl_pointer` | Reference to TKDL classification code | TKDL |
| `ingredient_profile` | Botanical/mineral substance profile | DRAVYA |
| `food_standard` | FSSAI Ayurveda Aahar standard | Regulatory |

### 1.3 Why This Format Works for RAG

```
UDO Record
    |
    |--> "content" field --> BGE-M3 embeddings --> Qdrant vector store
    |
    |--> "hierarchy" fields --> Neo4j graph nodes and edges
    |
    |--> "content" + "title" --> Elasticsearch BM25 index
    |
    |--> "metadata.citation_format" --> LLM citation enforcement
    |
    |--> "source" fields --> Audit trail and provenance tracking
```

---

## 2. DATA CATEGORY A: Statutes and Rules

### 2.1 What Exactly Is This Data?

Indian laws (Acts passed by Parliament) and their subordinate rules. These are the PRIMARY knowledge source. The AI must cite these when answering any legal question.

### 2.2 Exact Statutes to Scrape (17 documents)

| # | Statute | Year | Ministry | Why We Need It | Total Sections (approx) |
|---|---------|------|----------|---------------|------------------------|
| 1 | **Patents Act** | 1970 | Commerce | Core patent law. Sections 3(d), 3(e), 3(p) bar many AYUSH patents | ~162 sections |
| 2 | **Patents Rules** | 2003 (amended 2024) | Commerce | Procedural rules for filing. RFE timelines, Form 3/27 | ~195 rules |
| 3 | **AYUSH Patent Examination Guidelines** | 2025 | AYUSH/IPO | How patent office examines AYUSH applications. Inventive step, synergistic effect, TKDL cross-check | ~50 pages |
| 4 | **Trade Marks Act** | 1999 | Commerce | Brand protection for Ayurvedic product names | ~175 sections |
| 5 | **Geographical Indications Act** | 1999 | Commerce | Region-specific Ayurvedic products (like Darjeeling Tea) | ~87 sections |
| 6 | **Copyright Act** | 1957 | Education | Classical text compilations, Section 2(d)(vi) | ~79 sections |
| 7 | **Designs Act** | 2000 | Commerce | Product packaging protection | ~48 sections |
| 8 | **Plant Variety Protection Act** | 2001 | Agriculture | Cultivar rights, farmers rights | ~99 sections |
| 9 | **Biological Diversity Act** | 2002 (amended 2023) | Environment | ABS obligations. AYUSH exemptions. Cultivated plant exemptions | ~65 sections |
| 10 | **Biological Diversity Rules** | 2024 | Environment | ABS procedures, digital portal, certificates | ~30 rules |
| 11 | **ABS Regulations** | 2025 | NBA | Benefit-sharing slabs: 0% (<5Cr), 0.2-0.6% (above) | ~15 regulations |
| 12 | **Drugs and Cosmetics Act** | 1940 | Health | Drug/cosmetic regulation. Chapter IVA (ASU drugs). First Schedule texts | ~33 sections |
| 13 | **D&C Rules** | 1945 | Health | Manufacturing, licensing. Rules 151-161 (ASU). Schedule T (GMP) | ~200+ rules |
| 14 | **Drugs and Magic Remedies (OA) Act** | 1954 | Health | Advertising restrictions, prohibited claims | ~17 sections |
| 15 | **FSSAI Act** | 2006 | Health | Food safety for nutraceuticals/health supplements | ~101 sections |
| 16 | **FSSAI Ayurveda Aahar Regulations** | 2022 | FSSAI | Schedule A traditional food categories | ~25 regulations |
| 17 | **DPDP Act** | 2023 | IT | Data privacy for user interactions | ~44 sections |

### 2.3 Exact Data Structure Per Section

Each section of each statute becomes ONE UDO record. Here is exactly what each record looks like:

```json
{
  "doc_id": "IND-BDA-2002-S003-SS1",
  "doc_type": "statute_section",
  "title": "Section 3(1) - National Biodiversity Authority",

  "content": "3. National Biodiversity Authority.—(1) With effect from such date as the Central Government may, by notification in the Official Gazette, appoint, there shall be established by the Central Government for the purposes of this Act, a body to be called the National Biodiversity Authority.\n\nProvided that till such time as the National Biodiversity Authority is established, the Central Government shall be competent to take any action or exercise any power under this Act.\n\nExplanation.—For the purposes of this sub-section, \"established\" means established under sub-section (1).",

  "content_plain": "Section 3 Sub-section 1 establishes the National Biodiversity Authority. Until NBA is established the Central Government can exercise powers under this Act.",

  "source": {
    "name": "Biological Diversity Act, 2002",
    "url": "https://indiacode.nic.in/handle/123456789/2046",
    "access_date": "2026-08-15",
    "version": "2023-amendment"
  },

  "hierarchy": {
    "level_1": "Biological Diversity Act, 2002",
    "level_2": "Chapter II - Regulation of Access to Biological Diversity",
    "level_3": "Section 3",
    "level_4": "Sub-section (1)",
    "level_5": null
  },

  "metadata": {
    "jurisdiction": "India",
    "language": "en",
    "category": "statute",
    "sub_category": "biodiversity_law",
    "effective_date": "2004-07-01",
    "last_amended": "2023-08-09",
    "is_current": true,
    "tags": ["NBA", "biodiversity", "ABS", "authority_establishment"],
    "cross_references": ["IND-BDA-2002-S007", "IND-BDA-2002-S038"],
    "provisos": ["Proviso: Central Govt competent until NBA established"],
    "explanations": ["Explanation: 'established' means under sub-section (1)"],
    "keywords_legal": ["shall be established", "Central Government", "notification", "Official Gazette"]
  },

  "rag_config": {
    "chunk_strategy": "section_boundary",
    "max_tokens": 1500,
    "overlap_tokens": 200,
    "embedding_model": "BGE-M3",
    "importance_score": 0.85,
    "citation_format": "[Section 3(1), Biological Diversity Act, 2002]"
  }
}
```

### 2.4 How to Scrape Statutes

**Source**: indiacode.nic.in

**Method**: Step by step

```
Step 1: Navigate to indiacode.nic.in
Step 2: Search by Act name (e.g., "Patents Act, 1970")
Step 3: The site renders HTML with sections in nested div/table structure
Step 4: Use requests + BeautifulSoup to:
  - Extract the Act title, year, ministry
  - For each section:
    - Extract section number (regex: r"^(\d+[A-Z]?)\.")
    - Extract section title (bold text after number)
    - Extract full text including provisos and explanations
    - Detect cross-references (regex: r"section\s+(\d+[A-Z]?)")
    - Detect amendment notes (usually in footnotes or brackets)
Step 5: For each section, create one UDO record
Step 6: Handle special structures:
  - Schedules: Separate UDO per schedule item
  - Provisos: Keep with parent section, tag in metadata
  - Explanations: Keep with parent section, tag in metadata
  - Definitions (usually Section 2): One UDO per defined term
```

**Alternate method**: Community "Statute API" on GitHub provides pre-structured JSON. Download and transform to UDO format.

**Tools needed**: requests, beautifulsoup4, re (regex), json

**Rate limiting**: 1 request per 2 seconds. Total ~17 statutes x ~100 sections = ~1700 records. Takes ~1 hour.

---

## 3. DATA CATEGORY B: Pharmacopoeial and Classical Texts

### 3.1 What Exactly Is This Data?

Official drug standards and classical formulations that define what IS an Ayurvedic medicine. Critical for the Formulation Classifier — the AI needs to know if a product matches a classical text or is proprietary.

### 3.2 Sub-Category B1: Ayurvedic Pharmacopoeia of India (API) — Drug Monographs

**What it looks like in the PDF**: Each drug gets 2-5 pages with structured sections. The text is a mix of printed and some handwritten annotations in older volumes. Hindi/Sanskrit names in Devanagari script appear alongside English.

**Exact fields to extract per drug monograph**:

```json
{
  "doc_id": "API-VOL1-ASHWAGANDHA-001",
  "doc_type": "drug_monograph",
  "title": "Ashwagandha (Withania somnifera)",

  "content": "ASHWAGANDHA\nWithania somnifera (Linn.) Dunal.\nFam. Solanaceae\n\nSyns: Sanskrit: Ashwagandha, Varahakarni, Hayagandha\nHindi: Asgandh, Punir\nEnglish: Winter Cherry\n\nPart Used: Root\n\nMacroscopic: Roots are straight, unbranched, varying in length and thickness bearing fibre-like secondary rootlets. Roots are 10-17 cm in length and 6-12 mm in thickness. External surface is buff to grey-yellow with longitudinal wrinkles...\n\nMicroscopic: Transverse section of root shows...\n\nIdentity, Purity and Strength:\nForeign matter: Not more than 2 percent\nTotal Ash: Not more than 7 percent\nAcid-insoluble ash: Not more than 1 percent\nAlcohol-soluble extractive: Not less than 15 percent\nWater-soluble extractive: Not less than 20 percent\n\nChemical Constituents: Withanolides (withaferin A, withanolide D), alkaloids, steroidal lactones\n\nActions: Balya, Vajikara, Rasayana\nTherapeutic Uses: Kshaya, Balakshaya, Vatavyadhi\nDose: 3-6g of the drug in powder form\n\nImportant Formulations: Ashwagandhadi Churna, Ashwagandharishta, Ashwagandha Ghrita",

  "content_structured": {
    "drug_name_sanskrit": "Ashwagandha",
    "drug_name_hindi": "Asgandh",
    "drug_name_english": "Winter Cherry",
    "botanical_name": "Withania somnifera (Linn.) Dunal.",
    "family": "Solanaceae",
    "synonyms": {
      "sanskrit": ["Ashwagandha", "Varahakarni", "Hayagandha"],
      "hindi": ["Asgandh", "Punir"],
      "english": ["Winter Cherry"]
    },
    "part_used": "Root",
    "description_macroscopic": "Roots are straight, unbranched...",
    "description_microscopic": "Transverse section shows...",
    "identity_purity_strength": {
      "foreign_matter": "Not more than 2%",
      "total_ash": "Not more than 7%",
      "acid_insoluble_ash": "Not more than 1%",
      "alcohol_extractive": "Not less than 15%",
      "water_extractive": "Not less than 20%"
    },
    "chemical_constituents": ["Withanolides", "withaferin A", "withanolide D", "alkaloids", "steroidal lactones"],
    "actions_ayurvedic": ["Balya", "Vajikara", "Rasayana"],
    "therapeutic_uses": ["Kshaya", "Balakshaya", "Vatavyadhi"],
    "dose": "3-6g of the drug in powder form",
    "important_formulations": ["Ashwagandhadi Churna", "Ashwagandharishta", "Ashwagandha Ghrita"]
  },

  "source": {
    "name": "Ayurvedic Pharmacopoeia of India, Volume I",
    "url": "https://archive.org/details/ayurvedic-pharmacopoeia-vol1",
    "access_date": "2026-08-15",
    "page_number": "16-18",
    "volume": "Volume I, Part I"
  },

  "hierarchy": {
    "level_1": "Ayurvedic Pharmacopoeia of India",
    "level_2": "Volume I, Part I (Single Drugs)",
    "level_3": "Ashwagandha",
    "level_4": null,
    "level_5": null
  },

  "metadata": {
    "jurisdiction": "India",
    "language": "en",
    "category": "pharmacopoeia",
    "sub_category": "single_drug_monograph",
    "is_current": true,
    "tags": ["ashwagandha", "withania_somnifera", "solanaceae", "root", "rasayana", "adaptogen"],
    "cross_references": ["AFI-ASHWAGANDHADI-CHURNA", "AFI-ASHWAGANDHARISHTA"],
    "is_in_first_schedule": true,
    "abs_relevance": "Cultivated plant - may be exempt under Biodiversity Amendment 2023",
    "patent_relevance": "Section 3(p) applies if formulation matches classical text"
  },

  "rag_config": {
    "chunk_strategy": "monograph_boundary",
    "max_tokens": 1000,
    "overlap_tokens": 100,
    "embedding_model": "BGE-M3",
    "importance_score": 0.90,
    "citation_format": "[Ashwagandha Monograph, Ayurvedic Pharmacopoeia of India, Vol I]"
  }
}
```

**How to scrape this data**:

```
Step 1: Download PDF volumes from archive.org
  - Search: "Ayurvedic Pharmacopoeia of India"
  - Volumes: Vol I-IX (Part I: Single Drugs), Vol I-III (Part II: Formulations)
  - Download as PDF

Step 2: OCR Processing (for scanned volumes)
  - Tool: Surya OCR 2 (supports Hindi Devanagari + English mixed text)
  - Command: surya_ocr input.pdf --lang en,hi --output-format markdown
  - This gives you layout-preserving markdown per page

Step 3: Parse OCR output into structured fields
  - Each drug monograph starts with the drug name in CAPS
  - Regex patterns:
    - Drug name: r"^([A-Z][A-Z\s]+)\n"
    - Botanical: r"([A-Z][a-z]+\s[a-z]+)\s*\((.*?)\)"
    - Family: r"Fam\.\s*([A-Za-z]+)"
    - Synonyms: r"Syn[s]?:\s*(.*?)(?=Part Used|$)"
    - Part Used: r"Part\s+Used:\s*(.*)"
    - Dose: r"Dose:\s*(.*)"
  - For each monograph, create one UDO record

Step 4: Quality check
  - Verify OCR accuracy on 10% sample
  - Manual correction of Sanskrit/Hindi terms
  - Cross-check against PCIMH digital versions if available
```

**Volume count**: ~600+ drug monographs across all volumes. Each becomes 1 UDO record.

### 3.3 Sub-Category B2: Ayurvedic Formulary of India (AFI) — Classical Formulations

**What it looks like**: Each formulation gets 0.5-2 pages listing ingredients, proportions, method, and indications.

**Exact fields per formulation**:

```json
{
  "doc_id": "AFI-PART1-CHURNA-TRIPHALA-001",
  "doc_type": "formulation",
  "title": "Triphala Churna",

  "content": "TRIPHALA CHURNA\nReference: Sarangadhara Samhita, Madhyama Khanda 6/12\n\nIngredients:\n1. Haritaki (Terminalia chebula) - Pericarp - 1 part\n2. Vibhitaki (Terminalia bellirica) - Pericarp - 1 part\n3. Amalaki (Emblica officinalis) - Pericarp - 1 part\n\nMethod: The ingredients are cleaned, dried, powdered individually and then mixed together in equal proportions.\n\nDosage Form: Churna (Powder)\nDose: 3-6g\nAnupana: Warm water, honey, ghee\nTherapeutic Uses: Constipation (Vibandha), Eye diseases (Netra Roga), Obesity (Sthaulya), Rasayana",

  "content_structured": {
    "formulation_name": "Triphala Churna",
    "formulation_type": "Classical",
    "dosage_form": "Churna (Powder)",
    "reference_text": "Sarangadhara Samhita, Madhyama Khanda 6/12",
    "ingredients": [
      {
        "name_sanskrit": "Haritaki",
        "botanical_name": "Terminalia chebula",
        "part_used": "Pericarp",
        "proportion": "1 part"
      },
      {
        "name_sanskrit": "Vibhitaki",
        "botanical_name": "Terminalia bellirica",
        "part_used": "Pericarp",
        "proportion": "1 part"
      },
      {
        "name_sanskrit": "Amalaki",
        "botanical_name": "Emblica officinalis",
        "part_used": "Pericarp",
        "proportion": "1 part"
      }
    ],
    "method_of_preparation": "Cleaned, dried, powdered individually, mixed in equal proportions",
    "dose": "3-6g",
    "anupana": ["Warm water", "honey", "ghee"],
    "therapeutic_uses": ["Constipation (Vibandha)", "Eye diseases (Netra Roga)", "Obesity (Sthaulya)", "Rasayana"]
  },

  "source": {
    "name": "Ayurvedic Formulary of India, Part I",
    "url": "https://archive.org/details/afi-part1",
    "page_number": "45",
    "volume": "Part I, Churna Section"
  },

  "metadata": {
    "jurisdiction": "India",
    "language": "en",
    "category": "pharmacopoeia",
    "sub_category": "classical_formulation",
    "is_in_first_schedule": true,
    "classification": "Classical Medicine (Rule 151-161, D&C Rules)",
    "patent_relevance": "Section 3(p) BARS patenting this exact formulation",
    "regulatory_pathway": "No clinical trial needed for classical formulation"
  },

  "rag_config": {
    "chunk_strategy": "formulation_boundary",
    "max_tokens": 1000,
    "citation_format": "[Triphala Churna, AFI Part I, Ref: Sarangadhara Samhita]"
  }
}
```

**Total records**: ~1200+ classical formulations across all AFI volumes.

### 3.4 Sub-Category B3: Classical Texts (e-Samhita)

**Source**: niimh.nic.in/ebooks (digitized classical texts)

**Texts to scrape**: Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Ashtanga Sangraha, Sarangadhara Samhita, Bhavaprakasha, Madhava Nidana

**Format per verse/section**:

```json
{
  "doc_id": "CS-SUTRA-001-005",
  "doc_type": "classical_text_verse",
  "title": "Charaka Samhita, Sutra Sthana, Chapter 1, Verse 5",
  "content": "Original Sanskrit verse in Devanagari + English translation",
  "content_structured": {
    "text_name": "Charaka Samhita",
    "sthana": "Sutra Sthana",
    "chapter_number": 1,
    "chapter_name": "Deerghanjiviteeya Adhyaya",
    "verse_number": 5,
    "verse_sanskrit": "... (Devanagari text) ...",
    "verse_transliteration": "... (IAST romanization) ...",
    "verse_translation_english": "... (English meaning) ...",
    "commentary": "... (if available) ..."
  },
  "metadata": {
    "category": "classical_text",
    "is_first_schedule_text": true,
    "tags": ["charaka_samhita", "sutra_sthana", "longevity"]
  }
}
```

**How to scrape**: Playwright (dynamic JS pages) on niimh.nic.in/ebooks. Navigate chapter by chapter, extract verse text and translations.

---

## 4. DATA CATEGORY C: Patent and IP Registry Data

### 4.1 Patent Records (Google BigQuery)

**Purpose**: Know what AYUSH patents already exist. Helps the IPR Router Agent determine novelty.

**BigQuery SQL to get Indian AYUSH patents**:

```sql
SELECT
  pub.publication_number,
  title.text AS title,
  abstract.text AS abstract,
  pub.filing_date,
  pub.publication_date,
  pub.grant_date,
  assignee.name AS assignee,
  ipc.code AS ipc_code,
  cpc.code AS cpc_code,
  pub.family_id
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
    LOWER(title.text) LIKE '%ayurved%'
    OR LOWER(title.text) LIKE '%herbal%'
    OR LOWER(abstract.text) LIKE '%traditional medicine%'
    OR LOWER(abstract.text) LIKE '%ayush%'
    OR ipc.code LIKE 'A61K36%'  -- Medicinal plants
    OR ipc.code LIKE 'A61K35%'  -- Animal/plant origin
    OR ipc.code LIKE 'A61P%'    -- Therapeutic activity
  )
LIMIT 50000
```

**UDO format for each patent**:

```json
{
  "doc_id": "PAT-IN-202011001234",
  "doc_type": "patent_record",
  "title": "A novel Ayurvedic composition for management of diabetes",
  "content": "Abstract: The present invention relates to a polyherbal Ayurvedic composition comprising extracts of Gymnema sylvestre, Tinospora cordifolia, and Pterocarpus marsupium in specific ratios...",
  "content_structured": {
    "publication_number": "IN-202011001234-A",
    "filing_date": "2020-01-15",
    "publication_date": "2021-07-23",
    "grant_date": null,
    "status": "Published",
    "assignee": "XYZ Pharmaceuticals Pvt Ltd",
    "inventors": ["Dr. A Kumar", "Dr. B Sharma"],
    "ipc_codes": ["A61K36/48", "A61P3/10"],
    "cpc_codes": ["A61K36/48"],
    "family_id": "72345678",
    "claims_count": 12,
    "key_ingredients": ["Gymnema sylvestre", "Tinospora cordifolia", "Pterocarpus marsupium"]
  },
  "metadata": {
    "category": "patent",
    "sub_category": "ayush_patent",
    "jurisdiction": "India",
    "tags": ["herbal", "diabetes", "polyherbal", "novel_composition"],
    "section_3p_relevant": true,
    "section_3e_relevant": true
  },
  "rag_config": {
    "chunk_strategy": "full_record",
    "citation_format": "[Patent IN-202011001234-A, filed 2020-01-15]"
  }
}
```

### 4.2 Trademark Records

**Source**: ipindiaservices.gov.in/tmrpublicsearch (scraped with Playwright)

```json
{
  "doc_id": "TM-IN-5678901",
  "doc_type": "trademark_record",
  "content_structured": {
    "application_number": "5678901",
    "trademark_name": "AYURVITAM",
    "class": 5,
    "applicant": "ABC Ayurveda Ltd",
    "filing_date": "2022-03-10",
    "status": "Registered",
    "valid_until": "2032-03-10",
    "goods_services": "Ayurvedic medicines, herbal preparations"
  }
}
```

### 4.3 Geographical Indication Records

**Source**: ipindia.gov.in/geographical-indications.htm (PDF lists)

```json
{
  "doc_id": "GI-IN-436",
  "doc_type": "gi_record",
  "content_structured": {
    "gi_number": 436,
    "product_name": "Thanjavur Netti",
    "product_type": "Medicinal Product",
    "state": "Tamil Nadu",
    "applicant": "Thanjavur Traditional Healers Association",
    "status": "Registered",
    "class": 5,
    "description": "Traditional Siddha preparation from Thanjavur..."
  }
}
```

---

## 5. DATA CATEGORY D: Case Law and Judgments

**Source**: HuggingFace dataset (d-riti/Dataset-For-Indian-Legal-Knowledge-Base) or IndianKanoon

**Filter**: Only IPR-related cases — Patents Act, Trademarks Act, GI Act, Biodiversity Act, cases mentioning "Ayurved", "traditional knowledge", "herbal"

```json
{
  "doc_id": "CASE-SC-2014-BISWAMOHAN",
  "doc_type": "case_judgment",
  "title": "Biswamohan Mahapatra v. Union of India (2014)",
  "content": "Full text of judgment paragraphs related to traditional knowledge and patent validity...",
  "content_structured": {
    "citation": "AIR 2014 SC 1234",
    "court": "Supreme Court of India",
    "bench": ["Justice X", "Justice Y"],
    "date": "2014-05-15",
    "parties": {
      "petitioner": "Biswamohan Mahapatra",
      "respondent": "Union of India"
    },
    "statutes_cited": ["Patents Act, 1970", "Section 3(p)", "Section 64"],
    "key_issues": ["Whether traditional knowledge can be patented", "Prior art from TKDL"],
    "held": "Patent revoked — formulation found in TKDL as prior art",
    "ratio_decidendi": "A formulation documented in classical texts constitutes prior art under Section 3(p)"
  },
  "metadata": {
    "category": "case_law",
    "sub_category": "patent_ipr",
    "tags": ["section_3p", "TKDL", "prior_art", "patent_revocation"],
    "precedent_value": "High"
  },
  "rag_config": {
    "chunk_strategy": "paragraph_boundary",
    "max_tokens": 2000,
    "overlap_tokens": 300,
    "citation_format": "[Biswamohan v. UOI, AIR 2014 SC 1234]"
  }
}
```

---

## 6. DATA CATEGORY E: Treaties and International Law

**Source**: WIPO Lex (wipo.int/wipolex), CBD ABSCH API

**Exact treaties to scrape (8 documents)**:

| Treaty | Articles | Key for AYUSH |
|--------|----------|---------------|
| TRIPS Agreement | ~73 articles | Art 27 (patentable), Art 29 (disclosure) |
| Convention on Biological Diversity | ~42 articles | Art 8(j) (TK), Art 15 (access) |
| Nagoya Protocol | ~36 articles | PIC, MAT, checkpoints |
| WIPO GRATK Treaty 2024 | ~20 articles | Mandatory disclosure of country-of-origin |
| PCT (Patent Cooperation Treaty) | ~69 articles | International patent filing |
| Madrid Protocol | ~18 articles | International trademark |
| EU THMPD | ~25 articles | EU herbal medicines pathway |
| US DSHEA 1994 | ~15 sections | US dietary supplement rules |

**UDO format per treaty article**:

```json
{
  "doc_id": "TREATY-TRIPS-ART027",
  "doc_type": "treaty_article",
  "title": "Article 27 - Patentable Subject Matter (TRIPS)",
  "content": "1. Subject to the provisions of paragraphs 2 and 3, patents shall be available for any inventions, whether products or processes, in all fields of technology, provided that they are new, involve an inventive step and are capable of industrial application...",
  "content_structured": {
    "treaty_name": "TRIPS Agreement",
    "article_number": 27,
    "article_title": "Patentable Subject Matter",
    "paragraphs": [
      {"number": 1, "text": "...patents shall be available..."},
      {"number": 2, "text": "Members may exclude from patentability..."},
      {"number": 3, "text": "Members may also exclude from patentability..."}
    ],
    "india_position": "India implements via Patents Act 1970, with broader exclusions under Section 3"
  },
  "metadata": {
    "jurisdiction": "International",
    "category": "treaty",
    "signatories_count": 164,
    "india_ratified": true,
    "tags": ["patentability", "inventive_step", "industrial_application"]
  },
  "rag_config": {
    "citation_format": "[Article 27, TRIPS Agreement (WTO)]"
  }
}
```

---

## 7. DATA CATEGORY F: Regulatory and Compliance Data

### 7.1 ABS Slabs (Biological Diversity Regulations)

```json
{
  "doc_id": "ABS-SLAB-2025-001",
  "doc_type": "abs_regulation",
  "title": "ABS Benefit Sharing Rate - Turnover below Rs 5 Crore",
  "content": "Under the ABS Regulations 2025, companies with annual turnover below Rs 5 Crore using wild biological resources are required to intimate the NBA but the benefit sharing rate is 0% (nil).",
  "content_structured": {
    "user_type": "Company",
    "turnover_slab": "Below Rs 5 Crore",
    "resource_type": "Wild biological resources",
    "abs_rate": "0%",
    "filing_requirement": "Intimation to NBA",
    "portal": "absefiling.nbaindia.in",
    "exemptions": [
      "Registered AYUSH practitioners using codified TK - FULLY EXEMPT",
      "Cultivated medicinal plants - EXEMPT (Certificate of Origin needed)"
    ]
  },
  "metadata": {
    "category": "compliance",
    "sub_category": "abs_regulation",
    "tags": ["ABS", "benefit_sharing", "biodiversity", "turnover_slab"]
  },
  "rag_config": {
    "citation_format": "[ABS Regulations, 2025 - Turnover Slab <5Cr]"
  }
}
```

### 7.2 DRAVYA Ingredient Profiles

**Source**: ccras.nic.in (Playwright scraping)

```json
{
  "doc_id": "DRAVYA-WITHANIA-001",
  "doc_type": "ingredient_profile",
  "title": "Ashwagandha - Ingredient Profile",
  "content_structured": {
    "name_sanskrit": "Ashwagandha",
    "name_hindi": "Asgandh",
    "name_english": "Indian Ginseng / Winter Cherry",
    "botanical_name": "Withania somnifera",
    "family": "Solanaceae",
    "part_used": ["Root", "Leaf"],
    "rasa": "Tikta (Bitter), Kashaya (Astringent)",
    "guna": "Laghu (Light), Snigdha (Unctuous)",
    "virya": "Ushna (Hot)",
    "vipaka": "Madhura (Sweet)",
    "dosha_action": "Vata-Kapha shamaka",
    "therapeutic_uses": ["Rasayana", "Balya", "Vajikara", "Nidrajanana"],
    "habitat": "Drier regions of India, Madhya Pradesh, Rajasthan",
    "cultivation_status": "Widely cultivated",
    "abs_status": "Cultivated - likely exempt under BDA 2023 Amendment",
    "schedule_status": "Listed in First Schedule texts",
    "tkdl_code_hint": "TKRC A/pharmaceutical/plant-origin/solanaceae"
  }
}
```

---

## 8. DATA CATEGORY G: TKDL Reference Data

**CANNOT directly scrape TKDL** (restricted). But we CAN build a pointer system.

```json
{
  "doc_id": "TKDL-POINTER-ASHWAGANDHA",
  "doc_type": "tkdl_pointer",
  "title": "TKDL Reference - Ashwagandha Formulations",
  "content": "The Traditional Knowledge Digital Library contains documented formulations using Ashwagandha from classical Ayurvedic texts. These serve as prior art for patent examination. To search: visit tkdl.res.in, use TKRC classification code A (Ayurveda), navigate to pharmaceutical preparations containing Withania somnifera.",
  "content_structured": {
    "ingredient": "Ashwagandha (Withania somnifera)",
    "tkrc_section": "A (Ayurveda)",
    "tkrc_class": "Pharmaceutical preparations (Kalpana)",
    "estimated_formulations": "50+",
    "search_guidance": "Navigate TKRC: A > Pharmaceutical > Plant-origin > Solanaceae > Withania somnifera",
    "ipc_mapping": "A61K36/81 (Solanaceae)",
    "prior_art_impact": "Any formulation matching TKDL entry cannot be patented under Section 3(p)",
    "access_instructions": "TKDL access requires subscription. Contact tkdl.res.in for institutional access."
  },
  "metadata": {
    "category": "tkdl_reference",
    "tags": ["TKDL", "prior_art", "ashwagandha", "section_3p"]
  }
}
```

---

## 9. Scraping Methodology — Step by Step Per Source

### 9.1 Source-by-Source Scraping Playbook

| Source | Tool | Authentication | Rate Limit | Pages/Records | Time Estimate | Output |
|--------|------|---------------|------------|---------------|--------------|--------|
| India Code | requests + BS4 | None | 1 req/2s | ~1700 sections | ~1 hour | 1700 UDOs |
| Gazette PDFs | Direct download + PyMuPDF | None | N/A | ~50 PDFs | ~30 min | ~500 UDOs |
| AYUSH Guidelines PDF | Direct download + PyMuPDF | None | N/A | 1 PDF (~50 pages) | ~10 min | ~30 UDOs |
| WIPO Lex | Partial API + PDF download | None | N/A | ~8 treaties | ~1 hour | ~300 UDOs |
| CBD ABSCH | REST API | API key (free) | 100 req/min | ~500 records | ~10 min | ~500 UDOs |
| API/AFI PDFs | archive.org download + Surya OCR | None | N/A | ~12 volumes, ~3000 pages | ~6 hours OCR | ~1800 UDOs |
| e-Samhita | Playwright | None | 1 req/3s | ~5000 verses | ~4 hours | ~5000 UDOs |
| DRAVYA Portal | Playwright | None | 1 req/3s | ~500 entries | ~30 min | ~500 UDOs |
| FSSAI Aahar | PDF download + PyMuPDF | None | N/A | 1 regulation | ~10 min | ~50 UDOs |
| Google Patents BigQuery | BigQuery SQL | Google Cloud (free tier) | 1TB/month free | ~50K patents | ~5 min query | ~50K UDOs |
| WIPO PATENTSCOPE | REST API | API key (free) | 100 req/min | ~5K PCT apps | ~1 hour | ~5K UDOs |
| InPASS | Playwright | None | 1 req/5s (careful) | ~2K patents | ~3 hours | ~2K UDOs |
| TMR India | Playwright | None | 1 req/5s | ~1K marks | ~1.5 hours | ~1K UDOs |
| GI Registry | PDF download | None | N/A | ~10 PDF lists | ~15 min | ~100 UDOs |
| IndianKanoon/HF | HuggingFace datasets library | None | N/A | ~20K judgments (filtered) | ~10 min download | ~20K UDOs |
| NBA ABS Portal | Playwright | None | 1 req/5s | ~200 filings | ~20 min | ~200 UDOs |
| KanoonGPT HF | HuggingFace datasets | None | N/A | Bulk download | ~5 min | Supplement |
| Ayusoft | Playwright | None | 1 req/3s | ~300 entries | ~15 min | ~300 UDOs |

### 9.2 Total Data Volume

| Metric | Value |
|--------|-------|
| **Total UDO Records** | ~89,000 |
| **Total Raw Data** | ~5-8 GB (PDFs, HTML, JSON) |
| **Total Processed Data** | ~3 GB (UDO JSON + embeddings) |
| **Vector Store (Qdrant)** | ~860 MB (89K x 1024-dim vectors) |
| **BM25 Index (Elasticsearch)** | ~500 MB |
| **Knowledge Graph (Neo4j)** | ~2 GB (100K nodes, 500K edges) |

---

## 10. Complete Field Reference

### 10.1 All UDO Fields — Master Dictionary

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `doc_id` | string | YES | Unique ID: SOURCE-TYPE-IDENTIFIER |
| `doc_type` | enum | YES | One of 16 document types (see Section 1.2) |
| `title` | string | YES | Human-readable title for display |
| `content` | string | YES | Full text content (for embedding and BM25) |
| `content_plain` | string | NO | Stripped/simplified version |
| `content_structured` | object | RECOMMENDED | Parsed fields specific to doc_type |
| `source.name` | string | YES | Name of source document/database |
| `source.url` | string | YES | URL where data was obtained |
| `source.access_date` | date | YES | When data was scraped |
| `source.version` | string | NO | Amendment/edition version |
| `source.page_number` | string | NO | Page in original document |
| `source.volume` | string | NO | Volume/part number |
| `hierarchy.level_1` | string | YES | Top-level grouping (Act name, Book name) |
| `hierarchy.level_2` | string | NO | Chapter/Part |
| `hierarchy.level_3` | string | NO | Section/Article |
| `hierarchy.level_4` | string | NO | Sub-section/Clause |
| `hierarchy.level_5` | string | NO | Proviso/Explanation |
| `metadata.jurisdiction` | enum | YES | "India" or "International" or specific country |
| `metadata.language` | string | YES | ISO 639-1 code (en, hi, ta) |
| `metadata.category` | enum | YES | statute, pharmacopoeia, patent, case_law, treaty, compliance, tkdl_reference |
| `metadata.sub_category` | string | YES | Specific type within category |
| `metadata.effective_date` | date | NO | When provision took effect |
| `metadata.last_amended` | date | NO | Last amendment date |
| `metadata.is_current` | boolean | YES | Whether this is the current version |
| `metadata.tags` | array[string] | YES | Searchable tags and keywords |
| `metadata.cross_references` | array[string] | NO | doc_ids of related records |
| `rag_config.chunk_strategy` | string | YES | How to chunk this record |
| `rag_config.max_tokens` | int | YES | Maximum chunk size |
| `rag_config.overlap_tokens` | int | YES | Overlap for continuity |
| `rag_config.importance_score` | float | NO | 0-1, how critical this is (for ranking boost) |
| `rag_config.citation_format` | string | YES | Exact citation string for LLM to use |
| `checksum` | string | NO | SHA-256 hash for deduplication and change detection |

### 10.2 Data Flow: Raw Source to RAG-Ready

```
RAW SOURCE (PDF/HTML/JSON/API)
    |
    v
COLLECTOR (Playwright/BS4/BigQuery/HF)
    |
    v
PROCESSOR (PyMuPDF/Surya OCR/HTML Parser)
    |
    v
PARSER (Regex + Custom Section Splitter)
    |
    v
UDO BUILDER (Python script creates JSON records)
    |
    v
VALIDATOR (JSON Schema validation, dedup check)
    |
    v
GIT COMMIT (corpus/ directory, version tracked)
    |
    v
EMBEDDING PIPELINE
    |--- content field --> BGE-M3 --> Qdrant (vector search)
    |--- content + title --> Elasticsearch (BM25 keyword search)
    |--- hierarchy + cross_references --> Neo4j (graph relations)
    |--- rag_config.citation_format --> stored for LLM prompt injection
```

---

> **Document Version**: 1.0
> **Date**: August 26, 2026
> **Total Sources**: 23 data sources
> **Total Records**: ~89,000 UDO records
> **Unified Format**: Universal Document Object (UDO) JSON
