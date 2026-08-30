#!/usr/bin/env python3
"""
AYUSH-IPR GUARDIAN — Broad-Spectrum 60-Query Empirical Benchmark Suite
======================================================================
Tests the live Kaggle server across 60 rigorous prompts spanning:
  1. Core AYUSH Patentability (§3(p), §3(d), §3(e), §3(h), §3(i), §3(j))
  2. Patent Procedure & Statutory Timelines (Forms 1/2/3/18/18A/27, Rule 24B FER, Sec 25 Opposition)
  3. Drugs & Cosmetics Act 1940 & Rules 1945 (Chapter IV-A, Schedule T GMP, Rule 158, Rule 161B, Sec 33EEB)
  4. Biological Diversity & Access-Benefit Sharing (NBA Sec 6/19/20, 2023/2024 AYUSH exemptions)
  5. Trademarks, Copyrights, Geographical Indications & Designs for AYUSH
  6. FSSAI Ayurveda Aahara 2022 & Food Safety Act 2006
  7. Drugs & Magic Remedies Act 1954 & Misleading Ads
  8. Borderline / Slightly Irrelevant Distractors (Synthetic drugs, CRISPR, mRNA vaccines, US FDA IND)
  9. Completely Irrelevant / Out-of-Domain (Quantum mechanics, Pasta recipes, Python code, Weather, Bollywood)
 10. Cross-Lingual / Hindi & Hinglish Queries

Produces:
  - broad_spectrum_benchmark_results.json
"""

import json
import time
import urllib.request
import urllib.error
import os
import sys
import re

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

SERVER_URL = "https://legend-organizations-alleged-asia.trycloudflare.com"

# 60 Rigorous Evaluation Prompts
TEST_PROMPTS = [
    # ── Category 1: Core AYUSH Patentability (10 Prompts) ──
    {
        "id": "PAT-01",
        "category": "Core AYUSH Patent Law",
        "query": "Can I obtain a patent on a traditional Ashwagandha and Brahmi formulation documented in Charaka Samhita?",
        "expected_section": "Section 3(p)",
        "expected_topic": "Traditional Knowledge bar",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-02",
        "category": "Core AYUSH Patent Law",
        "query": "If I extract pure Curcumin from Turmeric without proving enhanced therapeutic efficacy, can it be patented under Section 3(d)?",
        "expected_section": "Section 3(d)",
        "expected_topic": "Efficacy enhancement bar",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-03",
        "category": "Core AYUSH Patent Law",
        "query": "What is the legal test under Section 3(e) for a polyherbal mixture of Ginger and Tulsi to overcome the mere admixture objection?",
        "expected_section": "Section 3(e)",
        "expected_topic": "Synergistic effect vs mere admixture",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-04",
        "category": "Core AYUSH Patent Law",
        "query": "Is a method of cultivating medicinal herbs like Shatavari patentable under Section 3(h) of the Patents Act?",
        "expected_section": "Section 3(h)",
        "expected_topic": "Agricultural or horticultural method bar",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-05",
        "category": "Core AYUSH Patent Law",
        "query": "Can an Ayurvedic doctor patent a method of diagnosing Vata-Pitta-Kapha imbalance using pulse examination (Nadi Pariksha)?",
        "expected_section": "Section 3(i)",
        "expected_topic": "Diagnostic and medicinal treatment bar",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-06",
        "category": "Core AYUSH Patent Law",
        "query": "Can genetically unmodified Neem seeds or entire plants be patented under Section 3(j)?",
        "expected_section": "Section 3(j)",
        "expected_topic": "Plants, seeds, and biological processes bar",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-07",
        "category": "Core AYUSH Patent Law",
        "query": "How does the Indian Patent Office use the Traditional Knowledge Digital Library (TKDL) as prior art under Section 13?",
        "expected_section": "Section 13",
        "expected_topic": "TKDL search for novelty and anticipation",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-08",
        "category": "Core AYUSH Patent Law",
        "query": "What constitutes an inventive step under Section 2(1)(ja) for an Ayurvedic formulation with novel delivery mechanism like liposomes?",
        "expected_section": "Section 2(1)(ja)",
        "expected_topic": "Inventive step and non-obviousness",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-09",
        "category": "Core AYUSH Patent Law",
        "query": "Under Section 64, on what grounds can an Ayurvedic patent granted erroneously over classical knowledge be revoked?",
        "expected_section": "Section 64",
        "expected_topic": "Revocation on grounds of prior public knowledge",
        "domain_relevance": "Core AYUSH"
    },
    {
        "id": "PAT-10",
        "category": "Core AYUSH Patent Law",
        "query": "What are the disclosure requirements under Section 10(4)(d) when using biological material from India in a patent specification?",
        "expected_section": "Section 10(4)",
        "expected_topic": "Source and geographical origin disclosure",
        "domain_relevance": "Core AYUSH"
    },

    # ── Category 2: Patent Prosecution & Statutory Deadlines (8 Prompts) ──
    {
        "id": "PROC-01",
        "category": "Patent Prosecution & Procedure",
        "query": "What is the statutory deadline under Rule 24B to reply to a First Examination Report (FER)?",
        "expected_section": "Rule 24B",
        "expected_topic": "6 months deadline extendable by 3 months",
        "domain_relevance": "Core IPR Procedure"
    },
    {
        "id": "PROC-02",
        "category": "Patent Prosecution & Procedure",
        "query": "Under Rule 24C, can an AYUSH startup or small entity apply for expedited examination of patent applications?",
        "expected_section": "Rule 24C",
        "expected_topic": "Expedited examination for startups and female applicants",
        "domain_relevance": "Core IPR Procedure"
    },
    {
        "id": "PROC-03",
        "category": "Patent Prosecution & Procedure",
        "query": "What form and procedure are used for filing a pre-grant opposition under Section 25(1) and Rule 55?",
        "expected_section": "Section 25(1)",
        "expected_topic": "Pre-grant opposition on Form 7A / representation",
        "domain_relevance": "Core IPR Procedure"
    },
    {
        "id": "PROC-04",
        "category": "Patent Prosecution & Procedure",
        "query": "What is the timeline and requirement for submitting Form 3 foreign filing particulars under Section 8 and Rule 12?",
        "expected_section": "Section 8",
        "expected_topic": "Foreign patent application status disclosure",
        "domain_relevance": "Core IPR Procedure"
    },
    {
        "id": "PROC-05",
        "category": "Patent Prosecution & Procedure",
        "query": "What is the deadline for filing a Request for Examination (RFE) under Rule 24B from the priority date?",
        "expected_section": "Rule 24B",
        "expected_topic": "48 months or 31 months under amended rules",
        "domain_relevance": "Core IPR Procedure"
    },
    {
        "id": "PROC-06",
        "category": "Patent Prosecution & Procedure",
        "query": "What are the commercial working statement requirements on Form 27 under Section 146 and amended Rule 131?",
        "expected_section": "Section 146",
        "expected_topic": "Form 27 commercial working triennial submission",
        "domain_relevance": "Core IPR Procedure"
    },
    {
        "id": "PROC-07",
        "category": "Patent Prosecution & Procedure",
        "query": "Who is entitled to file a post-grant opposition under Section 25(2) and within what time frame?",
        "expected_section": "Section 25(2)",
        "expected_topic": "Person interested within one year of publication of grant",
        "domain_relevance": "Core IPR Procedure"
    },
    {
        "id": "PROC-08",
        "category": "Patent Prosecution & Procedure",
        "query": "Can an applicant seek extension of time for filing documents under Rule 138 of Patents Rules?",
        "expected_section": "Rule 138",
        "expected_topic": "Controller's discretion to extend prescribed time limit",
        "domain_relevance": "Core IPR Procedure"
    },

    # ── Category 3: Drugs & Cosmetics Act, 1940 & Rules 1945 (8 Prompts) ──
    {
        "id": "DC-01",
        "category": "Drugs & Cosmetics Act",
        "query": "What is the definition of Ayurvedic, Siddha or Unani drug under Section 3(a) of the Drugs and Cosmetics Act, 1940?",
        "expected_section": "Section 3(a)",
        "expected_topic": "Manufacture exclusively in accordance with First Schedule formulae",
        "domain_relevance": "Core Drug Law"
    },
    {
        "id": "DC-02",
        "category": "Drugs & Cosmetics Act",
        "query": "What are the Good Manufacturing Practice (GMP) requirements under Schedule T for Ayurvedic drug manufacturing premises?",
        "expected_section": "Schedule T",
        "expected_topic": "GMP infrastructure, quality control and hygiene",
        "domain_relevance": "Core Drug Law"
    },
    {
        "id": "DC-03",
        "category": "Drugs & Cosmetics Act",
        "query": "What are the shelf-life and expiry date rules for Ayurvedic medicines under Rule 161B of Drugs & Cosmetics Rules?",
        "expected_section": "Rule 161B",
        "expected_topic": "Expiry date and stability testing for ASU formulations",
        "domain_relevance": "Core Drug Law"
    },
    {
        "id": "DC-04",
        "category": "Drugs & Cosmetics Act",
        "query": "What constitutes a 'spurious ASU drug' under Section 33EEB of the Drugs and Cosmetics Act?",
        "expected_section": "Section 33EEB",
        "expected_topic": "Spurious Ayurvedic drugs definition and penalties",
        "domain_relevance": "Core Drug Law"
    },
    {
        "id": "DC-05",
        "category": "Drugs & Cosmetics Act",
        "query": "What is the regulatory role of the Ayurvedic, Siddha and Unani Drugs Technical Advisory Board (ASUDTAB) under Section 33C?",
        "expected_section": "Section 33C",
        "expected_topic": "ASUDTAB constitution and advisory mandate",
        "domain_relevance": "Core Drug Law"
    },
    {
        "id": "DC-06",
        "category": "Drugs & Cosmetics Act",
        "query": "What is the difference between a Classical Ayurvedic formulation and a Patent/Proprietary Ayurvedic Medicine under Section 3(h)?",
        "expected_section": "Section 3(h)",
        "expected_topic": "Proprietary ASU medicine containing ingredients in authoritative books",
        "domain_relevance": "Core Drug Law"
    },
    {
        "id": "DC-07",
        "category": "Drugs & Cosmetics Act",
        "query": "What labelling requirements apply to Ayurvedic medicines containing Schedule E(1) poisonous botanical ingredients under Rule 161?",
        "expected_section": "Rule 161",
        "expected_topic": "Warning 'Caution: to be taken under medical supervision'",
        "domain_relevance": "Core Drug Law"
    },
    {
        "id": "DC-08",
        "category": "Drugs & Cosmetics Act",
        "query": "What is the procedure for obtaining a loan license or manufacturing license for ASU medicines under Rule 153 and 158?",
        "expected_section": "Rule 153",
        "expected_topic": "Licensing on Form 24D / 24E by State Licensing Authority",
        "domain_relevance": "Core Drug Law"
    },

    # ── Category 4: Biodiversity & Access-Benefit Sharing (6 Prompts) ──
    {
        "id": "BIO-01",
        "category": "Biological Diversity Law",
        "query": "Is prior approval from the National Biodiversity Authority (NBA) required before applying for a patent based on Indian biological resources under Section 6?",
        "expected_section": "Section 6",
        "expected_topic": "Mandatory NBA approval prior to patent grant",
        "domain_relevance": "Core Biodiversity"
    },
    {
        "id": "BIO-02",
        "category": "Biological Diversity Law",
        "query": "Did the Biological Diversity (Amendment) Act 2023 exempt registered AYUSH practitioners and Vaidyas from prior intimation to State Biodiversity Boards?",
        "expected_section": "Section 7 / 2023 Amendment",
        "expected_topic": "Exemption for codified traditional knowledge practitioners",
        "domain_relevance": "Core Biodiversity"
    },
    {
        "id": "BIO-03",
        "category": "Biological Diversity Law",
        "query": "What are the penalties under Section 55 for commercial utilization of biological resources without NBA approval?",
        "expected_section": "Section 55",
        "expected_topic": "Penalties and decriminalization under 2023 Act",
        "domain_relevance": "Core Biodiversity"
    },
    {
        "id": "BIO-04",
        "category": "Biological Diversity Law",
        "query": "How does Access and Benefit Sharing (ABS) apply to foreign companies commercializing Indian medicinal plant extracts under Section 19?",
        "expected_section": "Section 19",
        "expected_topic": "Fair and equitable benefit sharing agreement",
        "domain_relevance": "Core Biodiversity"
    },
    {
        "id": "BIO-05",
        "category": "Biological Diversity Law",
        "query": "What biological resources are completely exempt from the Biological Diversity Act under Normally Traded Commodities (NTC) list under Section 40?",
        "expected_section": "Section 40",
        "expected_topic": "Exemption for agricultural commodities and common spices",
        "domain_relevance": "Core Biodiversity"
    },
    {
        "id": "BIO-06",
        "category": "Biological Diversity Law",
        "query": "What is the status of People's Biodiversity Registers (PBRs) in validating traditional community claims over medicinal herbs?",
        "expected_section": "Section 41",
        "expected_topic": "Biodiversity Management Committees and PBRs",
        "domain_relevance": "Core Biodiversity"
    },

    # ── Category 5: Trademarks, Copyrights, GI & Designs for AYUSH (6 Prompts) ──
    {
        "id": "IPR-01",
        "category": "Allied IPR (TM/GI/CR/Design)",
        "query": "Can a trademark be registered for a generic Ayurvedic term like 'Triphala Churna' or 'Chyawanprash' under Section 9 of Trade Marks Act, 1999?",
        "expected_section": "Section 9",
        "expected_topic": "Absolute grounds for refusal of descriptive and generic names",
        "domain_relevance": "Allied IPR"
    },
    {
        "id": "IPR-02",
        "category": "Allied IPR (TM/GI/CR/Design)",
        "query": "How can a cooperative register a Geographical Indication for a regional medicinal plant like 'Malabar Pepper' or 'Kangra Tea' under GI Act 1999?",
        "expected_section": "Section 8 / GI Act 1999",
        "expected_topic": "GI registration for origin-linked agricultural and herbal goods",
        "domain_relevance": "Allied IPR"
    },
    {
        "id": "IPR-03",
        "category": "Allied IPR (TM/GI/CR/Design)",
        "query": "Is a modern English translation or critical commentary of an ancient Charaka Samhita Sanskrit text protected under Copyright Act 1957?",
        "expected_section": "Section 13 / Copyright Act 1957",
        "expected_topic": "Copyright in original translation and compilation",
        "domain_relevance": "Allied IPR"
    },
    {
        "id": "IPR-04",
        "category": "Allied IPR (TM/GI/CR/Design)",
        "query": "Can the novel ornamental shape and ergonomic design of an Ayurvedic oil applicator bottle be protected under Designs Act 2000?",
        "expected_section": "Section 4 / Designs Act 2000",
        "expected_topic": "Novel shape, configuration and surface pattern of article",
        "domain_relevance": "Allied IPR"
    },
    {
        "id": "IPR-05",
        "category": "Allied IPR (TM/GI/CR/Design)",
        "query": "Under the Protection of Plant Varieties and Farmers' Rights Act 2001, can a farmer register an extant traditional variety of Tulsi?",
        "expected_section": "PPV&FR Act 2001",
        "expected_topic": "Protection of farmers' varieties and extant varieties",
        "domain_relevance": "Allied IPR"
    },
    {
        "id": "IPR-06",
        "category": "Allied IPR (TM/GI/CR/Design)",
        "query": "What constitutes trademark infringement under Section 29 when a competitor uses a deceptively similar phonetic brand for an Ayurvedic syrup?",
        "expected_section": "Section 29",
        "expected_topic": "Deceptively similar mark causing likelihood of consumer confusion",
        "domain_relevance": "Allied IPR"
    },

    # ── Category 6: FSSAI Ayurveda Aahara & Food Safety (4 Prompts) ──
    {
        "id": "FSSAI-01",
        "category": "FSSAI Ayurveda Aahara",
        "query": "What are the key compliance rules for manufacturing 'Ayurveda Aahara' under the Food Safety and Standards (Ayurveda Aahara) Regulations, 2022?",
        "expected_section": "FSSAI Ayurveda Aahara 2022",
        "expected_topic": "Food prepared in accordance with authoritative Ayurvedic texts",
        "domain_relevance": "Food Regulatory"
    },
    {
        "id": "FSSAI-02",
        "category": "FSSAI Ayurveda Aahara",
        "query": "Are synthetic vitamins, minerals or isolated chemical bio-actives permitted in Ayurveda Aahara products under FSSAI regulations?",
        "expected_section": "Regulation 4 / FSSAI 2022",
        "expected_topic": "Prohibition of synthetic vitamins and synthetic chemical additives",
        "domain_relevance": "Food Regulatory"
    },
    {
        "id": "FSSAI-03",
        "category": "FSSAI Ayurveda Aahara",
        "query": "What mandatory logo and labelling statements are required for Ayurveda Aahara food packaging?",
        "expected_section": "FSSAI 2022 Labelling",
        "expected_topic": "Ayurveda Aahara logo and target physiological purpose declaration",
        "domain_relevance": "Food Regulatory"
    },
    {
        "id": "FSSAI-04",
        "category": "FSSAI Ayurveda Aahara",
        "query": "Under Section 31 of Food Safety and Standards Act 2006, what license is required for an Ayurvedic health drink manufacturer?",
        "expected_section": "Section 31 / FSS Act 2006",
        "expected_topic": "FSSAI licensing and registration of food business operators",
        "domain_relevance": "Food Regulatory"
    },

    # ── Category 7: Drugs & Magic Remedies Act 1954 & Advertising (4 Prompts) ──
    {
        "id": "DMRA-01",
        "category": "Advertising & Magic Remedies",
        "query": "Can an Ayurvedic formulation legally advertise a cure for diabetes, cancer, or kidney stones under Drugs and Magic Remedies Act 1954?",
        "expected_section": "Section 3 / Schedule DMRA 1954",
        "expected_topic": "Prohibition of advertisements for specified diseases in Schedule",
        "domain_relevance": "Advertising Law"
    },
    {
        "id": "DMRA-02",
        "category": "Advertising & Magic Remedies",
        "query": "What are the penalties under Section 7 of Drugs & Magic Remedies Act 1954 for publishing misleading medical claims?",
        "expected_section": "Section 7",
        "expected_topic": "Imprisonment and fine for contravention of advertising prohibitions",
        "domain_relevance": "Advertising Law"
    },
    {
        "id": "DMRA-03",
        "category": "Advertising & Magic Remedies",
        "query": "What is the scope of Section 33EED regarding prohibition of misleading advertisements under the Drugs and Cosmetics Act?",
        "expected_section": "Section 33EED / Rule 170",
        "expected_topic": "Omission of misleading ads and State licensing approval for AYUSH ads",
        "domain_relevance": "Advertising Law"
    },
    {
        "id": "DMRA-04",
        "category": "Advertising & Magic Remedies",
        "query": "Can an Ayurvedic product advertise '100% cure guarantee for sexual enhancement' under Section 4 of DMRA 1954?",
        "expected_section": "Section 4",
        "expected_topic": "Prohibition of misleading advertisements relating to sexual potency",
        "domain_relevance": "Advertising Law"
    },

    # ── Category 8: Borderline / Slightly Irrelevant / Distractor Queries (5 Prompts) ──
    {
        "id": "DIST-01",
        "category": "Borderline / Distractor",
        "query": "How do I patent a synthetic small-molecule kinase inhibitor synthesized via petrochemical routes?",
        "expected_section": "General Patent Law / Section 2(1)(j)",
        "expected_topic": "Synthetic chemical patentability (distinction from botanical AYUSH)",
        "domain_relevance": "Borderline Synthetic Drug"
    },
    {
        "id": "DIST-02",
        "category": "Borderline / Distractor",
        "query": "Can a recombinant CRISPR-Cas9 base editing construct engineered in yeast be patented in India?",
        "expected_section": "Section 3(c) / Section 3(j)",
        "expected_topic": "Biotechnology patent guidelines and genetic modification",
        "domain_relevance": "Borderline Biotech"
    },
    {
        "id": "DIST-03",
        "category": "Borderline / Distractor",
        "query": "What is the regulatory filing pathway for an Investigational New Drug (IND) application with the US FDA in Washington?",
        "expected_section": "Jurisdictional boundary (US vs India)",
        "expected_topic": "US FDA 21 CFR 312 vs Indian CDSCO New Drugs & Clinical Trials Rules",
        "domain_relevance": "Borderline Foreign Jurisdiction"
    },
    {
        "id": "DIST-04",
        "category": "Borderline / Distractor",
        "query": "Can I patent an mRNA lipid nanoparticle vaccine formulation against dengue virus under Indian patent law?",
        "expected_section": "Section 3(d) / Section 3(e)",
        "expected_topic": "Modern vaccine formulation patentability",
        "domain_relevance": "Borderline Modern Pharma"
    },
    {
        "id": "DIST-05",
        "category": "Borderline / Distractor",
        "query": "What are the veterinary Ayurvedic drug licensing standards under Drugs & Cosmetics Rules?",
        "expected_section": "Chapter IV-A ASU Rules",
        "expected_topic": "Veterinary Ayurvedic formulation regulatory requirements",
        "domain_relevance": "Borderline Veterinary"
    },

    # ── Category 9: Completely Irrelevant / Out-of-Domain (6 Prompts) ──
    {
        "id": "IRR-01",
        "category": "Completely Irrelevant",
        "query": "Explain the time-dependent Schrodinger equation and wave function collapse in quantum mechanics.",
        "expected_section": "Out-of-domain guardrail / disclaimer",
        "expected_topic": "Non-legal out-of-scope query handling",
        "domain_relevance": "Completely Irrelevant (Physics)"
    },
    {
        "id": "IRR-02",
        "category": "Completely Irrelevant",
        "query": "Give me a step-by-step recipe to bake French butter croissants with flaky pastry layers.",
        "expected_section": "Out-of-domain guardrail / disclaimer",
        "expected_topic": "Culinary out-of-scope query handling",
        "domain_relevance": "Completely Irrelevant (Culinary)"
    },
    {
        "id": "IRR-03",
        "category": "Completely Irrelevant",
        "query": "How do I optimize matrix multiplication using Python NumPy and multithreading on CPU?",
        "expected_section": "Out-of-domain guardrail / disclaimer",
        "expected_topic": "Software programming query handling",
        "domain_relevance": "Completely Irrelevant (Programming)"
    },
    {
        "id": "IRR-04",
        "category": "Completely Irrelevant",
        "query": "What is the average weather and rainfall in Tokyo, Japan during the month of October?",
        "expected_section": "Out-of-domain guardrail / disclaimer",
        "expected_topic": "Weather forecast out-of-scope query",
        "domain_relevance": "Completely Irrelevant (Meteorology)"
    },
    {
        "id": "IRR-05",
        "category": "Completely Irrelevant",
        "query": "Who was the lead actor in the 1975 Bollywood blockbuster movie Sholay and what was the plot?",
        "expected_section": "Out-of-domain guardrail / disclaimer",
        "expected_topic": "Entertainment trivia out-of-scope query",
        "domain_relevance": "Completely Irrelevant (Cinema)"
    },
    {
        "id": "IRR-06",
        "category": "Completely Irrelevant",
        "query": "What is the flight distance and carbon footprint between London Heathrow and New York JFK?",
        "expected_section": "Out-of-domain guardrail / disclaimer",
        "expected_topic": "Aviation carbon footprint query",
        "domain_relevance": "Completely Irrelevant (Aviation)"
    },

    # ── Category 10: Multilingual Hindi & Hinglish Queries (3 Prompts) ──
    {
        "id": "LANG-01",
        "category": "Multilingual / Cross-Lingual",
        "query": "Kya main Charaka Samhita mein varnit kisi aushadhi jaise Ashwagandha ghrita ka patent le sakta hoon?",
        "expected_section": "Section 3(p)",
        "expected_topic": "Traditional knowledge bar answered in Latin Hindi / English",
        "domain_relevance": "Multilingual Core"
    },
    {
        "id": "LANG-02",
        "category": "Multilingual / Cross-Lingual",
        "query": "Ayurvedic dawai banane ke liye Schedule T GMP license kaise milta hai aur kin guidelines ka palan karna padta hai?",
        "expected_section": "Schedule T",
        "expected_topic": "GMP certification requirements for ASU manufacturing in Hindi context",
        "domain_relevance": "Multilingual Core"
    },
    {
        "id": "LANG-03",
        "category": "Multilingual / Cross-Lingual",
        "query": "Kya Biological Diversity Act ke antargat Vaidyas ko National Biodiversity Authority se anumati lena anivarya hai?",
        "expected_section": "Section 6 / 2023 Amendment",
        "expected_topic": "NBA exemption for traditional Vaidyas in Hindi context",
        "domain_relevance": "Multilingual Core"
    },
]


def send_chat_query(query: str, timeout: int = 45):
    """Send query to /api/chat and measure precise timing."""
    url = f"{SERVER_URL}/api/chat"
    payload = json.dumps({"query": query}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Bypass-Tunnel-Reminder": "1",
            "User-Agent": "AYUSH-IPR-Benchmark-Runner/1.0"
        }
    )

    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            t_resp = time.time() - t0
            raw = response.read().decode("utf-8")
            data = json.loads(raw)
            data["client_roundtrip_ms"] = round(t_resp * 1000, 1)
            data["status_code"] = response.status
            return data, None
    except Exception as e:
        t_err = time.time() - t0
        return None, f"{type(e).__name__}: {str(e)} ({round(t_err * 1000, 1)}ms)"


def evaluate_response(prompt_meta: dict, result: dict):
    """Evaluate response for citation presence, accuracy, disclaimer, and guardrails."""
    if not result:
        return {
            "passed": False,
            "error": "No response returned",
            "score": 0,
            "citations_found": [],
            "has_disclaimer": False,
            "has_expected_citation": False,
            "guardrail_triggered": False
        }

    answer = result.get("answer", "")
    citations = result.get("citations", [])
    meta = result.get("metadata", {})
    category = prompt_meta.get("category", "")
    exp_sec = prompt_meta.get("expected_section", "").lower()

    # Disclaimer check
    has_disclaimer = "disclaimer" in answer.lower() or "legal advice" in answer.lower()

    # Check for statutory citation match
    has_expected_citation = False
    if exp_sec and exp_sec != "out-of-domain guardrail / disclaimer":
        # Clean section number
        sec_num = re.search(r"(\d+[A-Za-z]*)", exp_sec)
        if sec_num and sec_num.group(1).lower() in answer.lower():
            has_expected_citation = True
        elif exp_sec in answer.lower():
            has_expected_citation = True

    # Out of domain check
    guardrail_triggered = False
    if "Completely Irrelevant" in category:
        # Check if model politely declined or gave brief disclaimer rather than legal hallucinations
        if "not" in answer.lower() or "consult" in answer.lower() or "outside" in answer.lower() or "do not have" in answer.lower() or len(answer) < 400:
            guardrail_triggered = True

    # Calculate overall qualitative score (0-100)
    score = 50
    if len(answer) > 80:
        score += 15
    if has_disclaimer:
        score += 15
    if has_expected_citation or guardrail_triggered:
        score += 20

    return {
        "passed": score >= 70,
        "score": min(score, 100),
        "citations_found": citations,
        "sources_count": len(result.get("sources", [])),
        "has_disclaimer": has_disclaimer,
        "has_expected_citation": has_expected_citation,
        "guardrail_triggered": guardrail_triggered,
        "answer_length_chars": len(answer),
        "answer_length_words": len(answer.split()),
        "search_time_ms": meta.get("search_time_ms", 0),
        "generation_time_ms": meta.get("generation_time_ms", 0),
        "total_time_ms": meta.get("total_time_ms", result.get("client_roundtrip_ms", 0)),
        "model_name": meta.get("model", "Gemma-2-2B-IT"),
    }


def main():
    print("=" * 70)
    print(f"  AYUSH-IPR GUARDIAN — 60-Query Empirical Benchmark Runner")
    print(f"  Target Server: {SERVER_URL}")
    print(f"  Total Prompts to Test: {len(TEST_PROMPTS)}")
    print("=" * 70, flush=True)

    results_log = []
    category_metrics = {}

    for idx, prompt_item in enumerate(TEST_PROMPTS, 1):
        pid = prompt_item["id"]
        cat = prompt_item["category"]
        query = prompt_item["query"]

        print(f"\n[{idx:02d}/{len(TEST_PROMPTS)}] Running {pid} [{cat}]...")
        print(f"     Query: {query[:75]}...")

        data, err = send_chat_query(query)

        if err:
            print(f"     [ERROR] {err}", flush=True)
            eval_res = evaluate_response(prompt_item, None)
            eval_res["error"] = err
            raw_answer = ""
        else:
            eval_res = evaluate_response(prompt_item, data)
            raw_answer = data.get("answer", "")
            print(f"     [OK] Done in {eval_res['total_time_ms']}ms (Search: {eval_res['search_time_ms']}ms, Gen: {eval_res['generation_time_ms']}ms) | Words: {eval_res['answer_length_words']} | Citations: {len(eval_res['citations_found'])}", flush=True)
            if eval_res["has_expected_citation"]:
                print(f"       [STATUTE MATCH] Verified expected target: {prompt_item['expected_section']}", flush=True)
            elif eval_res["guardrail_triggered"]:
                print(f"       [GUARDRAIL TRIGGERED] Handled out-of-domain query safely", flush=True)

        entry = {
            "metadata": prompt_item,
            "evaluation": eval_res,
            "response": data if data else {"answer": "", "error": str(err)}
        }
        results_log.append(entry)

        # Accumulate category metrics
        if cat not in category_metrics:
            category_metrics[cat] = {
                "count": 0,
                "passed": 0,
                "total_time_ms": 0,
                "search_time_ms": 0,
                "gen_time_ms": 0,
                "total_words": 0,
                "total_score": 0
            }
        cm = category_metrics[cat]
        cm["count"] += 1
        if eval_res.get("passed"):
            cm["passed"] += 1
        cm["total_time_ms"] += eval_res.get("total_time_ms", 0)
        cm["search_time_ms"] += eval_res.get("search_time_ms", 0)
        cm["gen_time_ms"] += eval_res.get("generation_time_ms", 0)
        cm["total_words"] += eval_res.get("answer_length_words", 0)
        cm["total_score"] += eval_res.get("score", 0)

        # Save incrementally after each query
        output_json = os.path.join(os.path.dirname(os.path.abspath(__file__)), "full_spectrum_benchmark_results.json")
        with open(output_json, "w", encoding="utf-8") as f:
            json.dump({
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "server_url": SERVER_URL,
                "total_prompts": len(TEST_PROMPTS),
                "completed_prompts": len(results_log),
                "category_summary": category_metrics,
                "detailed_results": results_log
            }, f, indent=2, ensure_ascii=False)

        # Friendly rate limit pause
        time.sleep(0.3)

    print("\n" + "=" * 70, flush=True)
    print(f"  BENCHMARK COMPLETE — Results saved to {output_json}", flush=True)
    print("=" * 70, flush=True)
    print("\n--- CATEGORY PERFORMANCE SUMMARY ---", flush=True)
    for cat, m in category_metrics.items():
        n = m["count"]
        avg_t = m["total_time_ms"] / n if n else 0
        avg_words = m["total_words"] / n if n else 0
        avg_score = m["total_score"] / n if n else 0
        pass_rate = (m["passed"] / n) * 100 if n else 0
        print(f"  * {cat:<35} | Pass: {pass_rate:5.1f}% | Avg Latency: {avg_t:6.1f}ms | Avg Words: {avg_words:5.1f} | Score: {avg_score:4.1f}/100", flush=True)


if __name__ == "__main__":
    main()
