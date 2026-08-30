import {
  classifyDocument,
  classifyIngredient,
} from '../api/endpoints/classify';

export async function classify(payload) {
  return classifyDocument(payload);
}

export async function classifySingleIngredient(payload) {
  return classifyIngredient(payload);
}
