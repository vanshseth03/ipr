export const FILE_TYPES = {
  DOCUMENT: 'document',
  IMAGE: 'image',
};

export function createFileModel(file = {}) {
  const mime = file.mimeType || file.type || '';
  const isImg = mime.startsWith('image/') || (file.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name));

  return {
    uri: file.uri ?? null,
    name: file.name ?? 'Untitled_File',
    mimeType: mime || (isImg ? 'image/jpeg' : 'application/pdf'),
    size: typeof file.size === 'number' ? file.size : null,
    type: isImg ? FILE_TYPES.IMAGE : FILE_TYPES.DOCUMENT,
  };
}
