import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState, useRef } from 'react';
import {
  ArrowUp,
  FileText,
  Image as ImageIcon,
  Camera,
  Mic,
  Paperclip,
  Square,
  X,
} from 'lucide-react-native';

import FileCard from '../upload/FileCard';
import { createFileModel } from '../../models/files';
import { t } from '../../constants/config';
import { colors, radii, spacing, shadow } from '../../constants/theme';

// Max file size 10MB
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function InputBar({
  onSend,
  onPickDocument,
  onPickImage,
  onCameraCapture,
  onFileSelected,
  onMicPress,
  onStopStreaming,
  attachedFile,
  onRemoveAttachment,
  disabled = false,
  isStreaming = false,
  language = 'en',
  placeholder = 'Ask about Ayurveda IPR, Section 3(p), TKDL...',
}) {
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);

  // Hidden native web file inputs for 100% reliable browser clicks
  const webDocInputRef = useRef(null);
  const webImgInputRef = useRef(null);
  const webCamInputRef = useRef(null);

  const trimmedText = text.trim();
  const hasText = trimmedText.length > 0;
  const canSend = !disabled && !isStreaming && (hasText || !!attachedFile);

  const handleSend = () => {
    if (!canSend) return;
    onSend?.(trimmedText);
    setText('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleStop = () => {
    onStopStreaming?.();
  };

  // Enter to send (web), Shift+Enter for newline
  const handleKeyPress = (e) => {
    if (Platform.OS !== 'web') return;
    const nativeEvent = e.nativeEvent || e;
    if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      e.preventDefault?.();
      handleSend();
    }
  };

  const handleWebFileChange = (e, isImage = false) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`Selected file exceeds maximum allowed size of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      e.target.value = '';
      return;
    }

    const model = createFileModel({
      uri: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      mimeType: file.type || (isImage ? 'image/jpeg' : 'application/pdf'),
      file,
    });

    onFileSelected?.(model);
    e.target.value = '';
  };

  const handlePickDoc = () => {
    setMenuOpen(false);
    if (Platform.OS === 'web' && webDocInputRef.current) {
      webDocInputRef.current.click();
    } else {
      onPickDocument?.();
    }
  };

  const handlePickImage = () => {
    setMenuOpen(false);
    if (Platform.OS === 'web' && webImgInputRef.current) {
      webImgInputRef.current.click();
    } else {
      onPickImage?.();
    }
  };

  const handleCamera = () => {
    setMenuOpen(false);
    if (Platform.OS === 'web' && webCamInputRef.current) {
      webCamInputRef.current.click();
    } else {
      onCameraCapture?.();
    }
  };

  const renderActionButton = () => {
    if (isStreaming) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop generating"
          onPress={handleStop}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.stopBtn,
            pressed && styles.pressed,
          ]}
        >
          <Square size={14} strokeWidth={3} color="#FFFFFF" />
        </Pressable>
      );
    }

    if (hasText || attachedFile) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.sendBtn,
            !canSend && styles.sendBtnDisabled,
            pressed && canSend && styles.pressed,
          ]}
        >
          <ArrowUp size={16} strokeWidth={2.5} color="#FFFFFF" />
        </Pressable>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voice input"
        onPress={onMicPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.actionBtn,
          styles.micBtn,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Mic size={16} strokeWidth={2} color={colors.brand} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hidden Web Native File Inputs */}
      {Platform.OS === 'web' && (
        <View style={styles.hiddenInputs}>
          <input
            ref={webDocInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleWebFileChange(e, false)}
          />
          <input
            ref={webImgInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleWebFileChange(e, true)}
          />
          <input
            ref={webCamInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleWebFileChange(e, true)}
          />
        </View>
      )}

      {attachedFile ? (
        <View style={styles.attachmentPreview}>
          <FileCard file={attachedFile} onRemove={onRemoveAttachment} compact />
          {attachedFile.size > MAX_FILE_SIZE_BYTES && (
            <Text style={styles.fileSizeWarning}>
              File exceeds {MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.
            </Text>
          )}
        </View>
      ) : null}

      <View style={styles.pill}>
        {/* Attach button with inline popover */}
        <View style={styles.attachWrapper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach file"
            onPress={() => setMenuOpen(!menuOpen)}
            disabled={disabled || isStreaming}
            style={({ pressed }) => [
              styles.attachBtn,
              pressed && !disabled && styles.pressed,
              (disabled || isStreaming) && styles.disabled,
            ]}
          >
            <Paperclip size={17} strokeWidth={2} color={colors.textMuted} />
          </Pressable>

          {/* Compact popover menu — Claude-style */}
          {menuOpen && (
            <>
              <Pressable
                style={styles.menuBackdrop}
                onPress={() => setMenuOpen(false)}
              />
              <View style={styles.popoverMenu}>
                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                  onPress={handlePickDoc}
                  accessibilityRole="button"
                  accessibilityLabel={t('uploadPdf', language)}
                >
                  <FileText size={16} color={colors.brand} strokeWidth={2.2} />
                  <Text style={styles.menuLabel}>{t('uploadPdf', language)}</Text>
                  <Text style={styles.menuHint}>{t('maxSizeHint', language)}</Text>
                </Pressable>

                <View style={styles.menuDivider} />

                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                  onPress={handlePickImage}
                  accessibilityRole="button"
                  accessibilityLabel={t('uploadImage', language)}
                >
                  <ImageIcon size={16} color={colors.brand} strokeWidth={2.2} />
                  <Text style={styles.menuLabel}>{t('uploadImage', language)}</Text>
                </Pressable>

                <View style={styles.menuDivider} />

                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                  onPress={handleCamera}
                  accessibilityRole="button"
                  accessibilityLabel={t('takePhoto', language)}
                >
                  <Camera size={16} color={colors.brand} strokeWidth={2.2} />
                  <Text style={styles.menuLabel}>{t('takePhoto', language)}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={!disabled && !isStreaming}
          multiline
          style={styles.input}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          onKeyPress={handleKeyPress}
        />

        {renderActionButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 100,
    position: 'relative',
  },
  hiddenInputs: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
  attachmentPreview: {
    marginBottom: spacing.sm,
  },
  fileSizeWarning: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    padding: spacing.xs + 2,
    paddingLeft: spacing.sm,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    ...shadow.sm,
  },
  attachWrapper: {
    position: 'relative',
    zIndex: 200,
  },
  attachBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: colors.textPrimary,
    minHeight: 32,
    maxHeight: 120,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  sendBtn: {
    backgroundColor: colors.brand,
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
  stopBtn: {
    backgroundColor: colors.danger,
  },
  micBtn: {
    backgroundColor: colors.bgMuted,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.4,
  },

  // Popover menu — 100% Solid Opaque Card
  menuBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  popoverMenu: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    minWidth: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 1000,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  menuItemPressed: {
    backgroundColor: colors.bgSubtle,
  },
  menuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuHint: {
    fontSize: 11,
    color: colors.textMuted,
    backgroundColor: colors.bgMuted,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
