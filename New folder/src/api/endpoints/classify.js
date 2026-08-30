import { apiRequest } from '../client';

export function classifyDocument(payload) {
  const formattedIngredients = Array.isArray(payload.ingredients)
    ? payload.ingredients.map((i) => (typeof i === 'string' ? i : i.name || ''))
    : [];
  return apiRequest('/classify', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      ingredients: formattedIngredients,
      dosage_form: payload.dosage_form || payload.dosageForm || 'Classical Extract',
    }),
  });
}

export function classifyIngredient(payload) {
  return apiRequest('/classify/ingredient', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
