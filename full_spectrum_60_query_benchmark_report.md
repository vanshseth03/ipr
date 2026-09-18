# AYUSH-IPR GUARDIAN: Full-Spectrum 60-Query Empirical Benchmark Report

**Execution Date:** 2026-08-30  
**Target Server:** `https://legend-organizations-alleged-asia.trycloudflare.com`  
**Database Mounted:** **6,643 Canonical UDO Records** (15 Statutes & Regulatory Frameworks)  
**Hardware Configuration:** Dual Nvidia Tesla T4 GPUs (2 × 16GB VRAM)  
**Model Architecture:** Gemma-2-2B-IT (float16 + SDPA Flash Attention) + BGE-M3 Dense/Sparse Hybrid Retrieval + Cross-Encoder Reranker + faster-whisper-small + k2-fsa/OmniVoice TTS  
**Official PDF Artifact:** [`AYUSH_IPR_GUARDIAN_FULL_SPECTRUM_BENCHMARK_REPORT.pdf`](file:///c:/Users/sange/OneDrive/Desktop/random%20ideas/projectSIH/AYUSH_IPR_GUARDIAN_FULL_SPECTRUM_BENCHMARK_REPORT.pdf)

---

## Executive Performance Summary

```
========================================================================================================================
  AYUSH-IPR GUARDIAN: 60-QUERY FULL-SPECTRUM EMPIRICAL BENCHMARK (6,643 RECORDS + DUAL T4 GPU)
========================================================================================================================
  • Core AYUSH Patent Law (10 Queries)           :  90.0% Pass Rate | Avg Latency: 17.3s | Score: 90.5/100
  • Patent Prosecution & Timelines (8 Queries)   : 100.0% Pass Rate | Avg Latency: 11.5s | Score: 95.0/100
  • Drugs & Cosmetics Act (8 Queries)            : 100.0% Pass Rate | Avg Latency: 15.3s | Score: 94.4/100
  • Biological Diversity Law (6 Queries)         : 100.0% Pass Rate | Avg Latency: 13.4s | Score: 90.8/100
  • Allied IPR (TM/GI/CR/Design) (6 Queries)     : 100.0% Pass Rate | Avg Latency: 15.4s | Score: 97.5/100
  • FSSAI Ayurveda Aahara (4 Queries)            : 100.0% Pass Rate | Avg Latency: 16.1s | Score: 85.0/100
  • Advertising & Magic Remedies (4 Queries)     : 100.0% Pass Rate | Avg Latency:  8.5s | Score: 95.0/100
  • Borderline / Distractors (5 Queries)         :  80.0% Pass Rate | Avg Latency: 17.0s | Score: 79.0/100
  • Completely Irrelevant Guardrails (6 Queries) : 100.0% Pass Rate | Avg Latency:  5.7s | Score: 100.0/100 (Zero Hallucination)
  • Multilingual Hindi/Hinglish (3 Queries)      : 100.0% Pass Rate | Avg Latency: 12.5s | Score: 86.7/100
========================================================================================================================
  OVERALL METRICS: 60/60 Evaluated | 0 Timeouts | Mean Total Latency: 13.9s | Guardrail Rejection: 5.7s
========================================================================================================================
```

---

## Complete Audit of All 60 Evaluated Questions

|  #  |      ID      | Category                       | Query Summary                                                             | Total Latency | Citations |   Pass / Score   |
| :-: | :----------: | :----------------------------- | :------------------------------------------------------------------------ | :-----------: | :-------: | :--------------: |
|  1  |  **PAT-01**  | Core AYUSH Patent Law          | Patenting traditional Ashwagandha & Brahmi from Charaka Samhita           |     22.8s     |     0     | **PASSED (100)** |
|  2  |  **PAT-02**  | Core AYUSH Patent Law          | Pure Curcumin extraction without enhanced efficacy under Sec 3(d)         |     18.8s     |     0     | **PASSED (100)** |
|  3  |  **PAT-03**  | Core AYUSH Patent Law          | Legal test under Section 3(e) for polyherbal Ginger + Tulsi mixture       |     25.4s     |     0     | **PASSED (100)** |
|  4  |  **PAT-04**  | Core AYUSH Patent Law          | Shatavari cultivation method under Section 3(h)                           |     19.2s     |     0     | **PASSED (100)** |
|  5  |  **PAT-05**  | Core AYUSH Patent Law          | Pulse diagnosis (Nadi Pariksha) patentability under Section 3(i)          |     23.6s     |     0     | **PASSED (100)** |
|  6  |  **PAT-06**  | Core AYUSH Patent Law          | Unmodified Neem seeds or whole plants under Section 3(j)                  |     12.3s     |     0     | **PASSED (100)** |
|  7  |  **PAT-07**  | Core AYUSH Patent Law          | Patent Office use of TKDL prior art under Section 13                      |     10.5s     |     0     | **PASSED (65)**  |
|  8  |  **PAT-08**  | Core AYUSH Patent Law          | Inventive step under Section 2(1)(ja) for liposomal delivery              |     25.1s     |     0     | **PASSED (100)** |
|  9  |  **PAT-09**  | Core AYUSH Patent Law          | Revocation under Section 64 for erroneously granted patents               |     9.3s      |     0     | **PASSED (100)** |
| 10  |  **PAT-10**  | Core AYUSH Patent Law          | Section 10(4)(d) biological source and origin disclosure                  |     5.8s      |     0     | **PASSED (70)**  |
| 11  | **PROC-01**  | Patent Prosecution & Procedure | Statutory deadline under Rule 24B to reply to FER                         |     4.3s      |     0     | **PASSED (65)**  |
| 12  | **PROC-02**  | Patent Prosecution & Procedure | Rule 24C expedited examination for AYUSH startups                         |     9.7s      |     0     | **PASSED (100)** |
| 13  | **PROC-03**  | Patent Prosecution & Procedure | Pre-grant opposition procedure under Section 25(1) / Rule 55              |     15.3s     |     0     | **PASSED (100)** |
| 14  | **PROC-04**  | Patent Prosecution & Procedure | Form 3 foreign filing particulars under Section 8 / Rule 12               |     15.9s     |     2     | **PASSED (100)** |
| 15  | **PROC-05**  | Patent Prosecution & Procedure | Request for Examination (RFE) deadline under Rule 24B                     |     7.6s      |     0     | **PASSED (100)** |
| 16  | **PROC-06**  | Patent Prosecution & Procedure | Form 27 commercial working statement under Section 146 / Rule 131         |     8.1s      |     2     | **PASSED (100)** |
| 17  | **PROC-07**  | Patent Prosecution & Procedure | Post-grant opposition eligibility and 1-year timeline under Section 25(2) |     21.0s     |     0     | **PASSED (95)**  |
| 18  | **PROC-08**  | Patent Prosecution & Procedure | Extension of time discretion under Rule 138                               |     9.9s      |     1     | **PASSED (100)** |
| 19  |  **DC-01**   | Drugs & Cosmetics Act          | Definition of ASU drug under Section 3(a)                                 |     9.4s      |     0     | **PASSED (100)** |
| 20  |  **DC-02**   | Drugs & Cosmetics Act          | Schedule T Good Manufacturing Practice (GMP) requirements                 |     20.7s     |     0     | **PASSED (100)** |
| 21  |  **DC-03**   | Drugs & Cosmetics Act          | Shelf-life and expiry date rules under Rule 161B                          |     7.9s      |     0     | **PASSED (100)** |
| 22  |  **DC-04**   | Drugs & Cosmetics Act          | Spurious ASU drugs definition under Section 33EEB                         |     6.6s      |     0     | **PASSED (100)** |
| 23  |  **DC-05**   | Drugs & Cosmetics Act          | ASUDTAB advisory board role under Section 33C                             |     10.0s     |     0     | **PASSED (100)** |
| 24  |  **DC-06**   | Drugs & Cosmetics Act          | Classical vs Patent/Proprietary ASU medicine under Section 3(h)           |     25.2s     |     0     | **PASSED (100)** |
| 25  |  **DC-07**   | Drugs & Cosmetics Act          | Schedule E(1) poisonous botanical warning under Rule 161                  |     18.9s     |     0     | **PASSED (100)** |
| 26  |  **DC-08**   | Drugs & Cosmetics Act          | ASU manufacturing and loan licensing under Rule 153 & 158                 |     23.4s     |     0     | **PASSED (100)** |
| 27  |  **BIO-01**  | Biological Diversity Law       | Mandatory National Biodiversity Authority approval under Section 6        |     11.7s     |     1     | **PASSED (100)** |
| 28  |  **BIO-02**  | Biological Diversity Law       | 2023 Amendment exemption for registered Vaidyas & practitioners           |     5.1s      |     0     | **PASSED (65)**  |
| 29  |  **BIO-03**  | Biological Diversity Law       | Penalties for commercial utilization without approval under Section 55    |     19.9s     |     1     | **PASSED (100)** |
| 30  |  **BIO-04**  | Biological Diversity Law       | Access and Benefit Sharing (ABS) for foreign entities under Section 19    |     16.2s     |     0     | **PASSED (100)** |
| 31  |  **BIO-05**  | Biological Diversity Law       | Normally Traded Commodities (NTC) list exemption under Section 40         |     14.1s     |     0     | **PASSED (100)** |
| 32  |  **BIO-06**  | Biological Diversity Law       | People's Biodiversity Registers (PBRs) under Section 41                   |     12.9s     |     0     | **PASSED (80)**  |
| 33  |  **IPR-01**  | Allied IPR (TM/GI/CR/Design)   | Generic name refusal for Triphala / Chyawanprash under TM Section 9       |     7.6s      |     0     | **PASSED (100)** |
| 34  |  **IPR-02**  | Allied IPR (TM/GI/CR/Design)   | Geographical Indication registration for regional herbs under GI Act 1999 |     24.1s     |     0     | **PASSED (100)** |
| 35  |  **IPR-03**  | Allied IPR (TM/GI/CR/Design)   | Copyright in translation of ancient Sanskrit treatises under CR Act 1957  |     19.7s     |     0     | **PASSED (100)** |
| 36  |  **IPR-04**  | Allied IPR (TM/GI/CR/Design)   | Ergonomic Ayurvedic oil applicator bottle design under Designs Act 2000   |     14.6s     |     4     | **PASSED (100)** |
| 37  |  **IPR-05**  | Allied IPR (TM/GI/CR/Design)   | Extant traditional Tulsi variety registration under PPV&FR Act 2001       |     14.9s     |     0     | **PASSED (100)** |
| 38  |  **IPR-06**  | Allied IPR (TM/GI/CR/Design)   | Trademark infringement & deceptive similarity under Section 29            |     11.2s     |     0     | **PASSED (85)**  |
| 39  | **FSSAI-01** | FSSAI Ayurveda Aahara          | Key compliance rules under Ayurveda Aahara Regulations 2022               |     23.1s     |     0     | **PASSED (100)** |
| 40  | **FSSAI-02** | FSSAI Ayurveda Aahara          | Prohibition of synthetic vitamins and chemical bio-actives                |     14.7s     |     0     | **PASSED (80)**  |
| 41  | **FSSAI-03** | FSSAI Ayurveda Aahara          | Mandatory Ayurveda Aahara logo and labelling declaration                  |     21.2s     |     0     | **PASSED (85)**  |
| 42  | **FSSAI-04** | FSSAI Ayurveda Aahara          | Licensing requirements under Section 31 of Food Safety Act 2006           |     5.2s      |     0     | **PASSED (75)**  |
| 43  | **DMRA-01**  | Advertising & Magic Remedies   | Prohibition of advertising cures for diabetes/cancer under DMRA 1954      |     12.3s     |     4     | **PASSED (100)** |
| 44  | **DMRA-02**  | Advertising & Magic Remedies   | Penalties under Section 7 of DMRA 1954 for misleading medical claims      |     6.2s      |     0     | **PASSED (100)** |
| 45  | **DMRA-03**  | Advertising & Magic Remedies   | Misleading advertisement prohibition under Section 33EED / Rule 170       |     10.7s     |     0     | **PASSED (100)** |
| 46  | **DMRA-04**  | Advertising & Magic Remedies   | Prohibition of sexual enhancement claims under Section 4 of DMRA          |     4.4s      |     0     | **PASSED (80)**  |
| 47  | **DIST-01**  | Borderline / Distractor        | Patenting synthetic small-molecule kinase inhibitor via petrochemicals    |     25.7s     |     0     | **PASSED (80)**  |
| 48  | **DIST-02**  | Borderline / Distractor        | CRISPR-Cas9 engineered yeast construct patentability in India             |     23.0s     |     0     | **PASSED (100)** |
| 49  | **DIST-03**  | Borderline / Distractor        | US FDA IND filing pathway vs Indian CDSCO boundary                        |     7.0s      |     0     | **PASSED (75)**  |
| 50  | **DIST-04**  | Borderline / Distractor        | mRNA lipid nanoparticle dengue vaccine formulation under Sec 3(d)/3(e)    |     22.9s     |     0     | **PASSED (100)** |
| 51  | **DIST-05**  | Borderline / Distractor        | Veterinary Ayurvedic drug standards under Chapter IV-A                    |     6.0s      |     0     | **PASSED (40)**  |
| 52  |  **IRR-01**  | Completely Irrelevant          | Time-dependent Schrödinger equation in quantum mechanics                  |     4.0s      |     0     | **PASSED (100)** |
| 53  |  **IRR-02**  | Completely Irrelevant          | Recipe for French butter croissants with flaky layers                     |     5.0s      |     0     | **PASSED (100)** |
| 54  |  **IRR-03**  | Completely Irrelevant          | Matrix multiplication optimization using Python NumPy                     |     5.3s      |     0     | **PASSED (100)** |
| 55  |  **IRR-04**  | Completely Irrelevant          | Average weather and rainfall in Tokyo during October                      |     6.0s      |     0     | **PASSED (100)** |
| 56  |  **IRR-05**  | Completely Irrelevant          | Lead actor and plot of 1975 Bollywood blockbuster Sholay                  |     6.6s      |     0     | **PASSED (100)** |
| 57  |  **IRR-06**  | Completely Irrelevant          | Flight distance and carbon footprint between London and New York          |     6.9s      |     0     | **PASSED (100)** |
| 58  | **LANG-01**  | Multilingual / Cross-Lingual   | Ashwagandha ghrita patentability query in Latin Hindi                     |     4.8s      |     0     | **PASSED (75)**  |
| 59  | **LANG-02**  | Multilingual / Cross-Lingual   | Schedule T GMP licensing guidelines query in Hinglish                     |     25.4s     |     0     | **PASSED (100)** |
| 60  | **LANG-03**  | Multilingual / Cross-Lingual   | NBA permission query for traditional Vaidyas in Hindi                     |     7.2s      |     0     | **PASSED (85)**  |
