export const MOCK_KNOWLEDGE_BASE = [
  {
    keywords: ['ashwagandha', 'withania', 'stress', 'anxiety', 'root'],
    title: 'Ashwagandha (Withania Somnifera) Formulation Prior Art',
    confidence: 94,
    response: `**Ashwagandha (Withania somnifera)** is documented extensively in classical Ayurvedic texts (e.g., *Charaka Samhita*, *Sushruta Samhita*) and the Traditional Knowledge Digital Library (TKDL).

### IPR & Patent Status:
- **India Jurisdiction (Section 3(p) Patent Act 1970)**: Traditional use of Ashwagandha powder or aqueous extract for anti-stress/rejuvenation is non-patentable prior art.
- **Novelty Exception**: Synergistic extracts combined with novel non-obvious bio-enhancers or specific standardized chemical fractions (e.g., purified Withanolide-A combinations with modified solubility carriers) may be patentable if non-obviousness and enhanced efficacy over prior art are proven.
- **TKDL Citation**: TKDL Accession No. **AK/1420** & **AK/2890** (Classical preparation *Ashwagandharishta*).`,
    citations: [
      {
        title: 'TKDL Entry: Ashwagandharishta (AK/1420)',
        details: 'Traditional Knowledge Digital Library, CSIR-AYUSH, Govt of India.',
      },
      {
        title: 'Indian Patent Act 1970 - Section 3(p)',
        details: 'Inventions which are in effect traditional knowledge or an aggregation of known properties of traditionally known components.',
      },
    ],
  },
  {
    keywords: ['turmeric', 'curcumin', 'haridra', 'inflammation', 'wound'],
    title: 'Turmeric (Curcuma longa) Patentability & TKDL',
    confidence: 96,
    response: `**Turmeric (Haridra / Curcuma longa)** is a landmark case in Indian IPR history (USPTO Patent No. 5,401,504 revoked via CSIR TKDL challenge).

### Key Patentability Guidelines:
- **Prior Art Status**: Any claim covering raw turmeric powder or simple extract for wound healing, anti-inflammatory, or topical application is completely invalid due to TKDL prior art.
- **Allowed Claims**: Target delivery systems (e.g., liposomal nano-curcumin formulations, specific synthetic derivatives, or synergistic non-obvious co-formulations with piperine proving unexpected bio-availability ratios).
- **TKDL Citation**: TKDL Reference **RG/3091** (Formulation *Haridra Khanda*).`,
    citations: [
      {
        title: 'US Patent Revocation Case: USPTO 5401504',
        details: 'Revoked following submission of prior art from ancient Ayurvedic literature by CSIR India.',
      },
      {
        title: 'Ayurvedic Pharmacopoeia of India (API) Vol. 1',
        details: 'Standardized specifications for Curcuma longa rhizome.',
      },
    ],
  },
  {
    keywords: ['giloy', 'guduchi', 'tinospora', 'immunity', 'fever'],
    title: 'Guduchi / Giloy (Tinospora cordifolia) Formulations',
    confidence: 91,
    response: `**Guduchi (Tinospora cordifolia)** is widely referenced in *Bhavaprakasha Nighantu* for immunomodulation (*Rasayana*) and anti-pyretic (*Jwarahara*) actions.

### Legal & IPR Considerations:
- **Section 3(p) Compliance**: Standalone extracts for fever or immunity booster drinks fall under traditional knowledge aggregation.
- **Geographical Indication (GI) & Ayush Mark**: Premium certified extracts can apply for Ayush Premium Mark certification for international exports.
- **TKDL Citation**: TKDL Entry **JK/4412** (*Guduchi Satva* preparation).`,
    citations: [
      {
        title: 'TKDL Entry: Guduchi Satva (JK/4412)',
        details: 'Starch extract of Tinospora cordifolia stems.',
      },
      {
        title: 'Ayush Premium Mark Certification Scheme',
        details: 'Quality & compliance certification by Quality Council of India (QCI).',
      },
    ],
  },
];

export function getMockChatResponse(userPrompt = '', jurisdiction = 'IN') {
  const promptLower = userPrompt.toLowerCase();
  
  const match = MOCK_KNOWLEDGE_BASE.find((item) =>
    item.keywords.some((kw) => promptLower.includes(kw))
  );

  if (match) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: match.response,
      confidence: match.confidence,
      citations: match.citations,
      jurisdiction,
    };
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: `Based on **${jurisdiction === 'IN' ? 'Indian Patent Law & TKDL Guidelines' : 'Global WIPO & PCT Patent Framework'}**:

1. **Traditional Knowledge Check**: Any formulation derived directly from classical text sources (*Charaka Samhita*, *Sushruta Samhita*, *Sarangadhara Samhita*) is cataloged in the TKDL and constitutes established prior art.
2. **Section 3(p) Requirement**: In India, inventions involving aggregation or traditional medicinal plant combinations must demonstrate **synergistic non-obvious technical effect** beyond the individual known properties of the botanical components.
3. **Recommended Steps**:
   - Conduct a preliminary TKDL prior art search.
   - Run a formulation novelty & synergy ratio calculation in the **Classify** tab.
   - Prepare analytical HPLC fingerprinting & bio-efficacy test data before filing a patent application.`,
    confidence: 88,
    citations: [
      {
        title: jurisdiction === 'IN' ? 'Indian Patent Office Guidelines for Biological Inventions' : 'WIPO Patenting Inventions Related to Traditional Knowledge',
        details: 'Official regulatory guidelines for traditional medicine patents.',
      },
      {
        title: 'Traditional Knowledge Digital Library (TKDL)',
        details: 'Database containing over 450,000 formulation transcripts.',
      },
    ],
    jurisdiction,
  };
}

export function getMockClassificationResult({ formulationName, classicalReference, ingredients = [], jurisdiction = 'IN' }) {
  const processedIngredients = ingredients.map((ing) => {
    const name = typeof ing === 'string' ? ing : ing?.name || 'Herb';
    const lower = name.toLowerCase();
    
    let classification = 'Classical Herb (TKDL Listed)';
    let confidence = 0.92;

    if (lower.includes('extract') || lower.includes('nano') || lower.includes('fraction')) {
      classification = 'Modified Extract (Potential Novelty)';
      confidence = 0.85;
    } else if (lower.includes('excipient') || lower.includes('carrier') || lower.includes('polymer')) {
      classification = 'Novel Delivery Matrix Component';
      confidence = 0.95;
    }

    return {
      name,
      classification,
      confidence,
    };
  });

  const hasNovelComponent = processedIngredients.some((i) =>
    i.classification.includes('Novel') || i.classification.includes('Modified')
  );

  const overallScore = hasNovelComponent ? 78 : 42;
  const category = hasNovelComponent
    ? 'Potential Patentable Formulation (Synergistic / Novel Matrix)'
    : 'Traditional Knowledge (TKDL Prior Art - Non-Patentable Under Sec 3(p))';

  return {
    status: 'complete',
    formulationName: formulationName || 'Ayurvedic Polyherbal Blend',
    classicalReference: classicalReference || 'Classical Ayurvedic Texts',
    jurisdiction,
    category,
    confidence: overallScore,
    ingredients: processedIngredients,
    priorArtStatus: hasNovelComponent ? 'Moderate Prior Art Overlap (Modification Required)' : 'High Prior Art Overlap (Direct TKDL Match)',
    recommendations: [
      hasNovelComponent
        ? 'Perform synergistic comparative testing against individual herbal extracts.'
        : 'File under Ayush Brand / Proprietary Product license instead of Patent application.',
      'Ensure compliance with Biological Diversity Act (NBA approval in India).',
    ],
  };
}

export function getMockDocumentAnalysis(file) {
  const filename = file?.name || 'Document.pdf';
  return {
    filename,
    size: file?.size || 1024 * 350,
    extractedText: `DOCUMENT ANALYSIS REPORT: ${filename}
Title: Polyherbal Formulation for Inflammatory Disorders
Botanical Ingredients Identified:
1. Withania somnifera (Ashwagandha root extract - 250mg)
2. Curcuma longa (Curcuminoid extract - 150mg)
3. Zingiber officinale (Shunti rhizome - 100mg)

IPR Assessment:
- Prior Art Overlap: 82% match with TKDL Accession #AK/881.
- Patent Eligibility: High risk under Section 3(p) of Indian Patent Act unless synergy ratio is established.`,
    priorArtScore: 82,
    patentabilityScore: 48,
    detectedHerbs: ['Withania somnifera', 'Curcuma longa', 'Zingiber officinale'],
    keyClaims: [
      'Method of preparing aqueous-alcoholic polyherbal extract',
      'Synergistic ratio for anti-inflammatory biomarkers',
    ],
  };
}
