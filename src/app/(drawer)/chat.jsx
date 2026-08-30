import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Pressable,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf, Plus, Trash2, ArrowRight } from 'lucide-react-native';

import MessageList from '../../components/chat/MessageList';
import InputBar from '../../components/chat/InputBar';
import VoiceOverlay from '../../components/voice/VoiceOverlay';

import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useHistoryStore } from '../../store/historyStore';
import { useLanguagePref } from '../../hooks/useLanguagePref';
import { useSpeak } from '../../hooks/useSpeak';
import { useVoiceSession } from '../../hooks/useVoiceSession';
import { useFileUpload } from '../../hooks/useFileUpload';

import { sendMessage, streamChatMessage } from '../../services/chatService';
import { createChatMessage, CHAT_ROLES } from '../../models/chat';
import { getRandomThinkingPhrase, t } from '../../constants/config';
import { colors, spacing, typography, radii, shadow } from '../../constants/theme';

const SUGGESTED_PROMPTS = [
  { text: 'Is Ashwagandha root extract patentable under Indian law?', tag: 'Section 3(p)' },
  { text: 'What TKDL prior art exists for Turmeric / Curcumin formulations?', tag: 'Prior Art' },
  { text: 'How do I demonstrate non-obvious synergy for polyherbal extracts?', tag: 'Synergy' },
  { text: 'What are the Ayush Premium Mark export compliance steps?', tag: 'Compliance' },
];

// ─── Floating leaf particle (decorative animation) ───────────────
function FloatingLeaf({ delay = 0 }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startX = Math.random() * 320;
    translateX.setValue(startX);

    const animate = () => {
      opacity.setValue(0);
      translateY.setValue(-20);
      rotate.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 620,
            duration: 9000 + Math.random() * 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.18,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 9000 + Math.random() * 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, [delay, opacity, rotate, translateX, translateY]);

  const rotateInterp = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingLeaf,
        {
          transform: [
            { translateY },
            { translateX },
            { rotate: rotateInterp },
          ],
          opacity,
        },
      ]}
    >
      <Leaf size={16} color={colors.brand} strokeWidth={1.5} />
    </Animated.View>
  );
}

// ─── Thinking status bar during streaming ────────────────────────
function ThinkingBar({ visible, language = 'en' }) {
  const [phrase, setPhrase] = useState(getRandomThinkingPhrase(language));
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!visible) return;
    setPhrase(getRandomThinkingPhrase(language));
    const interval = setInterval(() => {
      setPhrase(getRandomThinkingPhrase(language));
    }, 2800);
    return () => clearInterval(interval);
  }, [visible, language]);

  useEffect(() => {
    if (!visible) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [visible, pulse]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.thinkingBar, { opacity: pulse }]}>
      <View style={styles.thinkingDot} />
      <Text style={styles.thinkingText}>{phrase}</Text>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    newConversation,
    isStreaming,
    setIsStreaming,
    setSseConnection,
    stopStreaming,
  } = useChatStore();
  const { jurisdiction } = useSettingsStore();
  const { language } = useLanguagePref();
  const { addItem: addHistoryItem } = useHistoryStore();
  const { speak, stop: stopSpeak, isSpeaking, isLoadingTTS, speakingMessageId } = useSpeak();
  const {
    isConnected,
    isListening,
    transcript: voiceTranscript,
    connect: connectVoice,
    disconnect: disconnectVoice,
  } = useVoiceSession();
  const {
    file: attachedFile,
    setFile: setAttachedFile,
    selectDocument,
    selectImage,
    captureCameraPhoto,
    clearFile: clearAttachedFile,
  } = useFileUpload();

  const [voiceOverlayVisible, setVoiceOverlayVisible] = useState(false);

  useEffect(() => {
    // Only seed welcome message if there are no messages after initial tick
    const timer = setTimeout(() => {
      const currentMessages = useChatStore.getState().messages;
      if (!currentMessages || currentMessages.length === 0) {
        addMessage(
          createChatMessage({
            role: CHAT_ROLES.ASSISTANT,
            content:
              'Welcome to the **Ayurveda IPR Assistant**.\n\nI can help you evaluate **patentability under Section 3(p)**, check **Traditional Knowledge Digital Library (TKDL)** prior art, analyze polyherbal synergy, and guide Ayush certification.\n\nHow may I assist your formulation research today?',
          })
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [addMessage]);

  const handleSend = async (text) => {
    const trimmed = text?.trim() || '';
    if ((!trimmed && !attachedFile) || isStreaming) return;

    let fullPrompt = trimmed;
    if (attachedFile) {
      const fileHeader = `[Attached ${attachedFile.type === 'image' ? 'Image' : 'Document'}: ${attachedFile.name}${attachedFile.size ? ` (${(attachedFile.size / (1024 * 1024)).toFixed(1)}MB)` : ''}]`;
      fullPrompt = trimmed ? `${fileHeader}\n\n${trimmed}` : `${fileHeader}\nPlease analyze this formulation document for TKDL prior art overlap and Section 3(p) patentability.`;
    }

    const userMsg = createChatMessage({ role: CHAT_ROLES.USER, content: fullPrompt });
    addMessage(userMsg);
    clearAttachedFile();

    const assistantMsgId = `msg-${Date.now()}`;
    addMessage(createChatMessage({ id: assistantMsgId, role: CHAT_ROLES.ASSISTANT, content: '' }));

    setIsStreaming(true);
    let accumulatedText = '';

    try {
      const connection = streamChatMessage(fullPrompt, {
        jurisdiction,
        language,
        onToken: (token) => {
          accumulatedText += token;
          updateMessage(assistantMsgId, { content: accumulatedText });
        },
        onSources: () => {},
        onComplete: () => {
          setIsStreaming(false);
          setSseConnection(null);
          addHistoryItem({
            type: 'chat',
            title: fullPrompt.length > 35 ? `${fullPrompt.slice(0, 35)}...` : fullPrompt,
            summary: accumulatedText.slice(0, 80) + '...',
            data: { query: fullPrompt, response: accumulatedText, jurisdiction },
          });
        },
        onError: async (err) => {
          console.warn('[SSE fallback]:', err);
          if (!accumulatedText) {
            try {
              const res = await sendMessage(fullPrompt, { jurisdiction, language });
              updateMessage(assistantMsgId, { content: res.answer || res.content || 'Analysis completed.' });
            } catch (fallbackErr) {
              updateMessage(assistantMsgId, { content: `Unable to complete query: ${fallbackErr.message || err.message}` });
            }
          }
          setIsStreaming(false);
          setSseConnection(null);
        },
      });
      setSseConnection(connection);
    } catch (err) {
      updateMessage(assistantMsgId, { content: `Error: ${err.message}` });
      setIsStreaming(false);
      setSseConnection(null);
    }
  };

  const handleSpeakMessage = useCallback(
    (message) => {
      if (speakingMessageId === message.id) {
        stopSpeak();
        return;
      }
      const plainText = message.content.replace(/[*#_]/g, '');
      speak(plainText, {
        language: language === 'hi' ? 'hi-IN' : 'en-IN',
      }, message.id);
    },
    [language, speak, speakingMessageId, stopSpeak]
  );

  const toggleVoice = () => {
    if (voiceOverlayVisible) {
      disconnectVoice();
      setVoiceOverlayVisible(false);
    } else {
      setVoiceOverlayVisible(true);
      connectVoice();
    }
  };

  const handleNewChat = () => {
    if (isStreaming) stopStreaming();
    newConversation();
  };

  const showWelcome = messages.length <= 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {/* Decorative floating leaves */}
      <View style={styles.particleContainer} pointerEvents="none">
        <FloatingLeaf delay={0} />
        <FloatingLeaf delay={2000} />
        <FloatingLeaf delay={4500} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.newChatBtn, pressed && styles.pressed]}
          onPress={handleNewChat}
          accessibilityRole="button"
          accessibilityLabel="New conversation"
        >
          <Plus size={14} color={colors.brand} strokeWidth={2.5} />
          <Text style={styles.newChatText}>{t('newChat', language)}</Text>
        </Pressable>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={clearMessages}
          accessibilityRole="button"
          accessibilityLabel="Clear conversation"
        >
          <Trash2 size={16} color={colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Thinking indicator */}
      <ThinkingBar visible={isStreaming} language={language} />

      {/* Chat area */}
      <View style={styles.chatContainer}>
        {showWelcome && (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeBrand}>
              <View style={styles.welcomeIcon}>
                <Leaf size={24} color={colors.accent} strokeWidth={2} />
              </View>
              <Text style={styles.welcomeTitle}>{t('appName', language)}</Text>
              <Text style={styles.welcomeSubtitle}>
                {t('chatSubtitle', language)}
              </Text>
            </View>
            <View style={styles.promptGrid}>
              {[
                { text: t('prompt1', language), tag: t('prompt1Tag', language) },
                { text: t('prompt2', language), tag: t('prompt2Tag', language) },
                { text: t('prompt3', language), tag: t('prompt3Tag', language) },
                { text: t('prompt4', language), tag: t('prompt4Tag', language) },
              ].map((prompt, idx) => (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [styles.promptCard, pressed && styles.promptCardPressed]}
                  onPress={() => handleSend(prompt.text)}
                  accessibilityRole="button"
                  accessibilityLabel={prompt.text}
                >
                  <Text style={styles.promptTag}>{prompt.tag}</Text>
                  <Text style={styles.promptText} numberOfLines={2}>{prompt.text}</Text>
                  <ArrowRight size={14} color={colors.brandLight} strokeWidth={2} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <MessageList
          messages={messages}
          onSpeak={handleSpeakMessage}
          speakingMessageId={speakingMessageId}
          isLoadingTTS={isLoadingTTS}
        />
      </View>

      {/* Input */}
      <InputBar
        onSend={handleSend}
        onMicPress={toggleVoice}
        onStopStreaming={stopStreaming}
        onPickDocument={selectDocument}
        onPickImage={selectImage}
        onCameraCapture={captureCameraPhoto}
        onFileSelected={setAttachedFile}
        attachedFile={attachedFile}
        onRemoveAttachment={clearAttachedFile}
        isStreaming={isStreaming}
        language={language}
        placeholder={t('placeholder', language)}
      />

      <VoiceOverlay
        visible={voiceOverlayVisible}
        isListening={isListening || isConnected}
        transcript={voiceTranscript}
        onClose={() => { disconnectVoice(); setVoiceOverlayVisible(false); }}
        onStop={() => { disconnectVoice(); setVoiceOverlayVisible(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },

  // Floating leaf particles
  particleContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  floatingLeaf: {
    position: 'absolute',
    top: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  newChatText: { fontSize: 13, fontWeight: '600', color: colors.brand },
  clearBtn: { padding: spacing.sm, borderRadius: radii.md },
  pressed: { opacity: 0.7 },

  // Thinking bar
  thinkingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSunken,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAccent,
    zIndex: 1,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  thinkingText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  // Chat container
  chatContainer: { flex: 1, backgroundColor: 'transparent', zIndex: 1 },

  // Welcome
  welcomeSection: { padding: spacing.xl, paddingTop: spacing.xxxl, alignItems: 'center' },
  welcomeBrand: { alignItems: 'center', marginBottom: spacing.xl },
  welcomeIcon: {
    width: 52, height: 52, borderRadius: radii.lg,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1, borderColor: colors.borderAccent,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  welcomeTitle: {
    fontSize: 22, fontWeight: '700', color: colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    ...typography.bodySmall, textAlign: 'center',
    marginTop: spacing.xs, maxWidth: 320, color: colors.textMuted,
  },
  promptGrid: { width: '100%', maxWidth: 600, gap: spacing.sm },
  promptCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surfaceRaised, ...shadow.sm,
  },
  promptCardPressed: { backgroundColor: colors.bgSubtle, borderColor: colors.brandLight },
  promptTag: {
    fontSize: 10, fontWeight: '700', color: colors.brand,
    backgroundColor: colors.brandSubtle,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radii.xs, overflow: 'hidden',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  promptText: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.textPrimary, lineHeight: 18 },
});
