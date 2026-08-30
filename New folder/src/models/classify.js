export const CLASSIFICATION_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export function createClassificationResult(data = {}) {
  const rawConfidence = data.confidence;
  const normalizedConfidence = typeof rawConfidence === 'number'
    ? (rawConfidence <= 1 ? Math.round(rawConfidence * 100) : rawConfidence)
    : 75;

  return {
    status: data.status ?? CLASSIFICATION_STATUS.COMPLETE,
    formulationName: data.formulationName ?? 'Ayurvedic Formulation',
    classicalReference: data.classicalReference ?? 'Classical Texts',
    jurisdiction: data.jurisdiction ?? 'IN',
    category: data.category ?? 'Traditional Knowledge',
    confidence: normalizedConfidence,
    priorArtStatus: data.priorArtStatus ?? 'Analyzed against TKDL records',
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    error: data.error ?? null,
  };
}
