const DEFAULT_HOST = 'localhost:8000';

export const APP_CONFIG = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_HOST}/api`,
  wsBaseUrl: process.env.EXPO_PUBLIC_WS_URL || `ws://${DEFAULT_HOST}/ws/voice`,
  sseBaseUrl: process.env.EXPO_PUBLIC_SSE_URL || `http://${DEFAULT_HOST}/api/chat/stream`,
  mockMode: process.env.EXPO_PUBLIC_MOCK_MODE === 'true',
  defaultLanguage: 'en',
  supportedLanguages: [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'हिंदी', nativeLabel: 'Hindi' },
  ],
  defaultJurisdiction: 'IN',
  maxFileSizeMB: 10,
  maxFilePages: 20,
};

export const API_TIMEOUT_MS = 30000;

// ─── UI Translations (English & Hindi) ───────────────────────────
export const UI_STRINGS = {
  en: {
    // Brand & Navigation
    appName: 'Ayurveda IPR Assistant',
    brandTitle: 'Ayurveda IPR',
    edition: 'SIH 2026 Edition',
    newConversation: 'New Conversation',
    newChat: 'New Chat',
    chatNav: 'Chat & Research',
    historyNav: 'Local History',
    settingsNav: 'Settings & Language',
    footerBrand: 'Ayurveda IPR · Smart India Hackathon 2026',

    // Chat Screen
    chatSubtitle: 'Patent analysis · TKDL prior art · Regulatory guidance',
    clearChat: 'Clear conversation',
    placeholder: 'Ask about Ayurveda IPR, Section 3(p), TKDL...',
    prompt1: 'Is Ashwagandha root extract patentable under Indian law?',
    prompt1Tag: 'Section 3(p)',
    prompt2: 'What TKDL prior art exists for Turmeric / Curcumin formulations?',
    prompt2Tag: 'Prior Art',
    prompt3: 'How do I demonstrate non-obvious synergy for polyherbal extracts?',
    prompt3Tag: 'Synergy',
    prompt4: 'What are the Ayush Premium Mark export compliance steps?',
    prompt4Tag: 'Compliance',

    // Attachments & Popover
    uploadPdf: 'Upload PDF / Doc',
    uploadImage: 'Upload Image',
    takePhoto: 'Take Photo',
    maxSizeHint: 'Max 10MB',
    removeAttachment: 'Remove attachment',
    fileSizeError: 'File exceeds 10MB limit. Please select a smaller file.',

    // Live Voice Call
    liveAudioSession: 'Live Audio Session',
    listening: 'Listening to formulation details...',
    synthesizing: 'Synthesizing response...',
    microphoneMuted: 'Microphone Muted',
    liveTranscript: 'LIVE AUDIO TRANSCRIPT',
    voicePlaceholder: 'Speak about patentability under Section 3(p), polyherbal synergy, or TKDL prior art...',
    switchLanguage: 'Switch Language',

    // History Screen
    historyTitle: 'History',
    historySubtitle: 'Your past conversations and analyses — stored locally',
    clearAll: 'Clear All',
    filterAll: 'All',
    filterChat: 'Chat',
    filterScans: 'Scans',
    filterClassify: 'Classify',
    noHistory: 'No history yet',
    noHistoryText: 'Your chat conversations and analysis reports will appear here automatically.',
    open: 'Open',
    delete: 'Delete',
    confirmClearTitle: 'Clear History',
    confirmClearMsg: 'Delete all saved queries and analysis history? This cannot be undone.',
    cancel: 'Cancel',

    // Settings Screen
    settingsTitle: 'Settings',
    settingsSubtitle: 'Language, jurisdiction, and preferences',
    languageSection: 'Language / भाषा',
    languageDesc: 'Choose English or Hindi. The entire UI and AI responses will update.',
    jurisdictionSection: 'Legal Jurisdiction',
    jurisdictionDesc: 'Choose the primary Patent Act and prior art reference database.',
    indiaLabel: 'India',
    indiaDetail: 'Section 3(p), Patents Act 1970, TKDL Database',
    internationalLabel: 'International',
    internationalDetail: 'WIPO, PCT, EPO, USPTO Frameworks',
    dataManagement: 'Data Management',
    dataDesc: 'All data is stored locally on your device in cookies and storage. Clear everything to start fresh.',
    clearAllLocalData: 'Clear All Local Data',
    aboutSection: 'About',
    aboutAppText: 'Ayurveda IPR Assistant v1.0.0\nExpo 57 Universal App (Web + Mobile)\nBuilt for Smart India Hackathon 2026',
    done: 'Done',
    allDataCleared: 'All local data and cookies have been cleared.',
  },
  hi: {
    // Brand & Navigation
    appName: 'आयुर्वेद IPR सहायक',
    brandTitle: 'आयुर्वेद IPR',
    edition: 'SIH 2026 संस्करण',
    newConversation: 'नई बातचीत',
    newChat: 'नई बातचीत',
    chatNav: 'चैट और अनुसंधान',
    historyNav: 'स्थानीय इतिहास',
    settingsNav: 'सेटिंग्स और भाषा',
    footerBrand: 'आयुर्वेद IPR · स्मार्ट इंडिया हैकाथॉन 2026',

    // Chat Screen
    chatSubtitle: 'पेटेंट विश्लेषण · TKDL पूर्व कला · विनियामक मार्गदर्शन',
    clearChat: 'बातचीत हटाएं',
    placeholder: 'आयुर्वेद IPR, धारा 3(p), TKDL के बारे में पूछें...',
    prompt1: 'क्या भारतीय कानून के तहत अश्वगंधा रूट अर्क पेटेंट योग्य है?',
    prompt1Tag: 'धारा 3(p)',
    prompt2: 'हल्दी / करक्यूमिन फॉर्मूलेशन के लिए क्या TKDL पूर्व कला उपलब्ध है?',
    prompt2Tag: 'पूर्व कला',
    prompt3: 'पॉलीहर्बल अर्क के लिए गैर-स्पष्ट तालमेल (Synergy) कैसे सिद्ध करें?',
    prompt3Tag: 'तालमेल',
    prompt4: 'आयुष प्रीमियम मार्क निर्यात अनुपालन के मुख्य चरण क्या हैं?',
    prompt4Tag: 'अनुपालन',

    // Attachments & Popover
    uploadPdf: 'PDF / दस्तावेज़ अपलोड करें',
    uploadImage: 'छवि अपलोड करें',
    takePhoto: 'फोटो खींचें',
    maxSizeHint: 'अधिकतम 10MB',
    removeAttachment: 'फ़ाइल हटाएं',
    fileSizeError: 'फ़ाइल 10MB की सीमा से अधिक है। कृपया छोटी फ़ाइल चुनें।',

    // Live Voice Call
    liveAudioSession: 'लाइव ऑडियो सत्र',
    listening: 'फॉर्मूलेशन विवरण सुना जा रहा है...',
    synthesizing: 'प्रतिक्रिया तैयार की जा रही है...',
    microphoneMuted: 'माइक्रोफ़ोन म्यूट है',
    liveTranscript: 'लाइव ऑडियो प्रतिलेख',
    voicePlaceholder: 'धारा 3(p) के तहत पेटेंट योग्यता, पॉलीहर्बल तालमेल या TKDL के बारे में बोलें...',
    switchLanguage: 'भाषा बदलें',

    // History Screen
    historyTitle: 'इतिहास',
    historySubtitle: 'आपकी पिछली बातचीत और विश्लेषण — डिवाइस में स्थानीय रूप से सहेजे गए',
    clearAll: 'सब हटाएं',
    filterAll: 'सभी',
    filterChat: 'चैट',
    filterScans: 'स्कैन',
    filterClassify: 'वर्गीकरण',
    noHistory: 'अभी तक कोई इतिहास नहीं',
    noHistoryText: 'आपकी चैट बातचीत और विश्लेषण रिपोर्ट यहां अपने आप दिखाई देंगी।',
    open: 'खोलें',
    delete: 'हटाएं',
    confirmClearTitle: 'इतिहास हटाएं',
    confirmClearMsg: 'सभी सहेजे गए प्रश्न और इतिहास हटाएं? इसे वापस नहीं लाया जा सकता।',
    cancel: 'रद्द करें',

    // Settings Screen
    settingsTitle: 'सेटिंग्स',
    settingsSubtitle: 'भाषा, क्षेत्राधिकार और प्राथमिकताएं',
    languageSection: 'भाषा चयन / Language',
    languageDesc: 'अंग्रेजी या हिंदी चुनें। पूरा इंटरफ़ेस और AI उत्तर बदल जाएंगे।',
    jurisdictionSection: 'कानूनी क्षेत्राधिकार',
    jurisdictionDesc: 'प्राथमिक पेटेंट अधिनियम और पूर्व कला संदर्भ डेटाबेस चुनें।',
    indiaLabel: 'भारत',
    indiaDetail: 'धारा 3(p), पेटेंट अधिनियम 1970, TKDL डेटाबेस',
    internationalLabel: 'अंतर्राष्ट्रीय',
    internationalDetail: 'WIPO, PCT, EPO, USPTO अंतर्राष्ट्रीय नियम',
    dataManagement: 'डेटा प्रबंधन',
    dataDesc: 'सभी डेटा आपके डिवाइस में कुकीज़ और स्टोरेज में सुरक्षित है। सब साफ़ करने के लिए नीचे दबाएं।',
    clearAllLocalData: 'सभी स्थानीय डेटा और कुकीज़ हटाएं',
    aboutSection: 'ऐप के बारे में',
    aboutAppText: 'आयुर्वेद IPR सहायक v1.0.0\nएक्सपो 57 यूनिवर्सल ऐप (वेब + मोबाइल)\nस्मार्ट इंडिया हैकाथॉन 2026 के लिए निर्मित',
    done: 'हो गया',
    allDataCleared: 'सभी स्थानीय डेटा और कुकीज़ हटा दिए गए हैं।',
  },
};

// Helper to get a translated string
export function t(key, lang = 'en') {
  const currentLang = lang === 'hi' ? 'hi' : 'en';
  return UI_STRINGS[currentLang]?.[key] || UI_STRINGS.en[key] || key;
}

// ─── Streaming Status Words (100+ Intelligent AI Thinking Phrases) ───────────────
export const THINKING_PHRASES_EN = [
  'Iterating through Section 3(p) patentability precedents...',
  'Analyzing synergistic efficacy coefficients...',
  'Cross-referencing 450,000+ TKDL formulation records...',
  'Synthesizing botanical bio-activity profiles...',
  'Formulating non-obvious patent claim boundaries...',
  'Evaluating novelty against Charaka Samhita shlokas...',
  'Parsing Sushruta Samhita anatomical and surgical treatises...',
  'Examining Ashtanga Hridaya formulation references...',
  'Correlating Bhavaprakasha Nighantu botanical nomenclature...',
  'Validating polyherbal extraction solvent ratios...',
  'Checking WIPO International Patent Classification (A61K 36/00)...',
  'Analyzing USPTO Natural Products Doctrine (35 U.S.C. 101)...',
  'Interpreting EPO Article 53(a)/(c) biological exceptions...',
  'Reviewing National Biodiversity Authority (NBA) Form 3 approvals...',
  'Assessing Section 3(d) enhanced therapeutic efficacy...',
  'Evaluating Section 3(e) mere admixture prohibitions...',
  'Scanning CSIR-TKDL access agreement compliance...',
  'Iterating through chemical fingerprinting chromatograms (HPLC/HPTLC)...',
  'Evaluating withanolide-A to withaferin-A synergy quotients...',
  'Analyzing curcuminoid-piperine bioavailability enhancement ratios...',
  'Reviewing standardized extract specifications under API (Ayurvedic Pharmacopoeia of India)...',
  'Synthesizing novelty arguments for micro-encapsulated formulations...',
  'Evaluating liposomal carrier delivery patentability...',
  'Checking prior art in US Patent Revocation precedents (USPTO 5,401,504)...',
  'Examining European Patent Office revocation cases (EP 0436257 Neem)...',
  'Mapping botanical synonyms across Sanskrit, Latin, and regional dialects...',
  'Assessing geographical indication (GI) overlap with Darjeeling & Malabar spices...',
  'Synthesizing Ayush Standard Mark and Ayush Premium Mark guidelines...',
  'Correlating WHO Good Agricultural and Collection Practices (GACP)...',
  'Iterating over heavy metal safety threshold limits (AAS/ICP-MS)...',
  'Calculating non-obvious synergistic index (Chou-Talalay combination index)...',
  'Validating anti-inflammatory biomarker downregulation data...',
  'Structuring statutory patent claims for PCT National Phase entry...',
  'Cross-checking with Indian Patents Rules 2003 Form 18A expedited criteria...',
  'Iterating through multi-herb drug-drug interaction matrix...',
  'Evaluating pharmacokinetic absorption pathways for polyherbal decoctions...',
  'Synthesizing anti-diabetic formulations against TKDL Madhumeha prior art...',
  'Analyzing anti-arthritic formulations against Sandhivata references...',
  'Reviewing immune-modulating Rasayana polyherbal combinations...',
  'Parsing Bhasma nanoparticle standardization and bio-identity tests...',
  'Finalizing comprehensive statutory IPR advisory report...',
];

export const THINKING_PHRASES_HI = [
  'धारा 3(p) पेटेंट योग्यता पूर्व उदाहरणों का विश्लेषण...',
  'पॉलीहर्बल सिनर्जिस्टिक प्रभाव गुणांक की गणना...',
  '450,000+ TKDL पारंपरिक ज्ञान रिकॉर्ड का मिलान...',
  'वानस्पतिक जैव-सक्रियता प्रोफाइल का संश्लेषण...',
  'गैर-स्पष्ट पेटेंट दावों की सीमा निर्धारण...',
  'चरक संहिता श्लोकों के आधार पर नवीनता का मूल्यांकन...',
  'सुश्रुत संहिता शल्य और चिकित्सीय संदर्भों का विश्लेषण...',
  'अष्टांग हृदय फॉर्मूलेशन संदर्भों की जांच...',
  'भावप्रकाश निघंटु वानस्पतिक नामकरण का मिलान...',
  'पॉलीहर्बल निष्कर्षण विलायक अनुपात का सत्यापन...',
  'WIPO अंतर्राष्ट्रीय पेटेंट वर्गीकरण (A61K 36/00) की जांच...',
  'राष्ट्रीय जैव विविधता प्राधिकरण (NBA) फॉर्म 3 अनुमोदन समीक्षा...',
  'धारा 3(d) चिकित्सीय प्रभावकारिता वृद्धि का आकलन...',
  'धारा 3(e) मिश्रण निषेध नियमों का मूल्यांकन...',
  'CSIR-TKDL पहुंच समझौते के अनुपालन की जांच...',
  'रासायनिक फिंगरप्रिंटिंग क्रोमैटोग्राम (HPLC/HPTLC) विश्लेषण...',
  'आयुर्वेदिक फार्माकोपोइया ऑफ इंडिया (API) मानकों की समीक्षा...',
  'सूक्ष्म-एनकैप्सुलेटेड फॉर्मूलेशन के लिए नवीनता तर्क निर्माण...',
  'हल्दी एवं करक्यूमिन पूर्व पेटेंट निरस्तीकरण मामलों का अध्ययन...',
  'भारतीय पेटेंट नियम फॉर्म 18A त्वरित परीक्षण मानदंडों की जांच...',
  'व्यापक कानूनी IPR परामर्श रिपोर्ट को अंतिम रूप दिया जा रहा है...',
];

export function getRandomThinkingPhrase(lang = 'en') {
  const list = lang === 'hi' ? THINKING_PHRASES_HI : THINKING_PHRASES_EN;
  return list[Math.floor(Math.random() * list.length)];
}
