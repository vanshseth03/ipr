import { apiRequest } from '../client';

export async function uploadFile(file, token) {
  const formData = new FormData();

  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || file.type || 'application/octet-stream',
  });

  return apiRequest('/files/upload', {
    method: 'POST',
    body: formData,
    token,
    file,
  });
}

