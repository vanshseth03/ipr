import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../api/endpoints/files';
import { createFileModel } from '../models/files';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit as requested

// ─── Web Fallback Native File Pickers ─────────────────────────────
// Directly triggers HTML5 input file picker on Web to guarantee 100% reliability
function pickFileOnWeb(accept = '.pdf,.doc,.docx,.txt,application/pdf', capture = null) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) {
      input.capture = capture;
    }

    input.onchange = (e) => {
      const file = e.target?.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`Selected file exceeds maximum allowed size of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        resolve(null);
        return;
      }

      const model = createFileModel({
        uri: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        mimeType: file.type || (accept.includes('image') ? 'image/jpeg' : 'application/pdf'),
        file,
      });

      resolve(model);
    };

    // Trigger file chooser directly in response to user click
    input.click();
  });
}

export async function pickDocument() {
  if (Platform.OS === 'web') {
    return pickFileOnWeb('.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`Selected document exceeds maximum allowed size of 10MB (${(asset.size / (1024 * 1024)).toFixed(1)}MB).`);
    }

    return createFileModel(asset);
  } catch (error) {
    if (error.message?.includes('exceeds maximum')) {
      throw error;
    }
    console.warn('[FileService] Document pick error:', error.message);
    return null;
  }
}

export async function pickImage() {
  if (Platform.OS === 'web') {
    return pickFileOnWeb('image/*');
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new Error(`Selected image exceeds maximum allowed size of 10MB (${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB).`);
    }

    return createFileModel({
      ...asset,
      name: asset.fileName || 'scanned_herbal_spec.jpg',
      size: asset.fileSize,
      mimeType: asset.mimeType || 'image/jpeg',
    });
  } catch (error) {
    if (error.message?.includes('exceeds maximum')) {
      throw error;
    }
    console.warn('[FileService] Image pick error:', error.message);
    return null;
  }
}

export async function capturePhoto() {
  if (Platform.OS === 'web') {
    return pickFileOnWeb('image/*', 'environment');
  }

  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Camera access permission is required to capture formulation photos.');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new Error(`Captured photo exceeds maximum allowed size of 10MB.`);
    }

    return createFileModel({
      ...asset,
      name: asset.fileName || `capture_${Date.now()}.jpg`,
      size: asset.fileSize,
      mimeType: asset.mimeType || 'image/jpeg',
    });
  } catch (error) {
    if (error.message?.includes('exceeds maximum') || error.message?.includes('permission')) {
      throw error;
    }
    console.warn('[FileService] Camera capture error:', error.message);
    return null;
  }
}

export async function uploadSelectedFile(file, token) {
  if (!file) {
    throw new Error('No file selected for upload.');
  }

  return uploadFile(file, token);
}
