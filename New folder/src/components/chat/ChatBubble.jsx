import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing, Platform, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Leaf, Cpu, Clock, Info, Zap, Link2, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { setCustomBackendUrl, probeUrlHealth } from '../../constants/config';

/**
 * Server Boot & Model Loading Card
 * Displays animated loading spinner with live state text,
 * dynamic phase-aware seconds counter, progress bar,
 * transparent notice explaining the free Kaggle instance vs production,
 * and a direct "Paste Tunnel URL" override for running Kaggle instances.
 */
function ServerBootCard({ step, stepDisplay, url }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const [seconds, setSeconds] = useState(0);
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isConnectingCustom, setIsConnectingCustom] = useState(false);
  const [customMessage, setCustomMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 750, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [pulseAnim]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Interpret boot phase and dynamic time estimation
  let TOTAL_ESTIMATED_SECS = 250;
  let phaseTitle = 'Connecting to AI Server';
  let phaseBadge = 'Booting';

  if (step === 'loading_llm' || step?.includes('llm') || step?.includes('weight')) {
    phaseTitle = 'Kaggle GPU Active — Loading LLM Weights';
    phaseBadge = 'Gemma-2-2B-IT';
    TOTAL_ESTIMATED_SECS = 45;
  } else if (step === 'loading_reranker') {
    phaseTitle = 'Kaggle GPU Active — Loading Cross-Encoder';
    phaseBadge = 'BGE-Reranker-V2';
    TOTAL_ESTIMATED_SECS = 30;
  } else if (step === 'building_index') {
    phaseTitle = 'Kaggle GPU Active — Building Vector Index';
    phaseBadge = 'FAISS + BM25';
    TOTAL_ESTIMATED_SECS = 35;
  } else if (step === 'loading_embeddings') {
    phaseTitle = 'Kaggle GPU Active — Loading Embedding Model';
    phaseBadge = 'BGE-M3';
    TOTAL_ESTIMATED_SECS = 50;
  } else if (step === 'loading_rag_db') {
    phaseTitle = 'Kaggle GPU Active — Loading Statutory Database';
    phaseBadge = '4,678 Records';
    TOTAL_ESTIMATED_SECS = 20;
  } else if (step === 'tunnel_pending' || step === 'tunnel_warming' || step === 'tunnel_connecting') {
    phaseTitle = 'Cloudflare Tunnel Handshake';
    phaseBadge = 'trycloudflare.com';
    TOTAL_ESTIMATED_SECS = 40;
  } else if (step === 'kernel_booting' || step === 'pushing') {
    phaseTitle = 'Connecting to Kaggle T4 GPU';
    phaseBadge = 'Tesla T4 Dual';
    TOTAL_ESTIMATED_SECS = 250;
  } else if (step === 'ready') {
    phaseTitle = 'Server Ready! Answering Question...';
    phaseBadge = 'Connected';
    TOTAL_ESTIMATED_SECS = 5;
  }

  const progressPercent = Math.min(Math.round((seconds / TOTAL_ESTIMATED_SECS) * 100), 98);
  const remainingSecs = Math.max(0, TOTAL_ESTIMATED_SECS - seconds);
  const currentDisplay = stepDisplay || 'Loading model weights into GPU...';

  const handleConnectCustom = async () => {
    const raw = customInput.trim();
    if (!raw) return;
    setIsConnectingCustom(true);
    setCustomMessage({ text: 'Validating server endpoint...', isError: false });

    const probe = await probeUrlHealth(raw, 4000);
    if (probe) {
      setCustomBackendUrl(probe.url);
      setCustomMessage({ text: '✓ Connected! Syncing chat stream...', isError: false });
    } else {
      setCustomMessage({
        text: '✗ Could not reach /api/health at this URL. Ensure Kaggle cell printed the trycloudflare URL.',
        isError: true,
      });
    }
    setIsConnectingCustom(false);
  };

  return (
    <View style={styles.bootCard}>
      {/* Real-time Seconds Timer & Progress Section */}
      <View style={styles.bootTimerSection}>
        <View style={styles.bootTimerHeader}>
          <View style={styles.bootTimerBadge}>
            <Clock size={13} color={colors.brand} strokeWidth={2.5} />
            <Text style={styles.bootTimerCount}>{seconds}s</Text>
            <Text style={styles.bootTimerTotal}>/ ~{TOTAL_ESTIMATED_SECS}s estimated</Text>
          </View>
          <Text style={styles.bootRemainingText}>
            {remainingSecs > 0 ? `~${remainingSecs}s remaining` : 'Finalizing connection...'}
          </Text>
        </View>

        {/* Visual Progress Bar Track */}
        <View style={styles.bootProgressBarTrack}>
          <View style={[styles.bootProgressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Centered Loading Icon with Glowing Ring */}
      <View style={styles.bootIconContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>

      {/* State Beneath Loading Icon */}
      <View style={styles.bootTextContainer}>
        <Text style={styles.bootPhaseTitle}>{phaseTitle}</Text>
        <Text style={styles.bootStateBeneath}>{currentDisplay}</Text>
      </View>

      {/* Progress pill indicators */}
      <View style={styles.bootPillsRow}>
        <Animated.View style={[styles.bootLiveBadge, { opacity: pulseAnim }]}>
          <View style={styles.bootLiveDot} />
          <Text style={styles.bootLiveText}>{phaseBadge}</Text>
        </Animated.View>

        <View style={styles.bootChip}>
          <Cpu size={12} color={colors.brand} strokeWidth={2} />
          <Text style={styles.bootChipText}>Kaggle Dual T4 (32GB VRAM)</Text>
        </View>
      </View>

      {/* Direct Connect Quick Action (Bypasses wait if Kaggle is already running) */}
      <View style={styles.bootDirectBox}>
        <TouchableOpacity
          style={styles.bootDirectToggle}
          onPress={() => setShowDirectInput((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Link2 size={13} color={colors.brand} strokeWidth={2} />
          <Text style={styles.bootDirectToggleText}>
            {showDirectInput ? 'Hide manual URL input' : 'Already running on Kaggle? Paste Tunnel URL'}
          </Text>
        </TouchableOpacity>

        {showDirectInput && (
          <View style={styles.bootDirectInputRow}>
            <TextInput
              style={styles.bootDirectTextInput}
              placeholder="https://xxx-xxx.trycloudflare.com"
              placeholderTextColor={colors.textMuted}
              value={customInput}
              onChangeText={setCustomInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.bootDirectBtn, isConnectingCustom && styles.bootDirectBtnDisabled]}
              onPress={handleConnectCustom}
              disabled={isConnectingCustom}
            >
              {isConnectingCustom ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.bootDirectBtnText}>Connect</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {customMessage.text ? (
          <Text style={[styles.bootDirectMsg, customMessage.isError ? styles.bootDirectMsgError : styles.bootDirectMsgSuccess]}>
            {customMessage.text}
          </Text>
        ) : null}
      </View>

      {/* Free Kaggle Instance vs Production Explanation */}
      <View style={styles.bootExplanationBox}>
        <View style={styles.bootExplanationHeader}>
          <Info size={13} color={colors.brand} strokeWidth={2} />
          <Text style={styles.bootExplanationTitle}>
            Why does startup take ~250 seconds?
          </Text>
        </View>
        <Text style={styles.bootExplanationBody}>
          To avoid 24/7 idle hosting costs, this application runs on a <Text style={styles.bootBoldText}>free on-demand Kaggle GPU instance (Dual Tesla T4)</Text>. Kaggle allocates a fresh container, downloads model weights (Gemma-2 & BGE), and establishes the secure tunnel from scratch each time.
        </Text>
        <View style={styles.bootProductionBadge}>
          <Zap size={13} color={colors.accent || '#10b981'} strokeWidth={2.5} />
          <Text style={styles.bootProductionText}>
            <Text style={styles.bootBoldText}>In Production:</Text> Dedicated warm GPU servers run 24/7 with zero startup delay—this wait does not happen in production.
          </Text>
        </View>
      </View>

      {/* Explanatory lock-in notice */}
      <Text style={styles.bootLockNotice}>
        Locked into live loop with server health. Response will stream automatically once models finish loading.
      </Text>
    </View>
  );
}

/**
 * Render inline **bold** and *italic* from markdown.
 * Intentionally simple — covers the most common patterns.
 */
function renderInline(text, baseStyle) {
  // Split on **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, idx) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <Text key={idx} style={[baseStyle, styles.bold]}>
          {boldMatch[1]}
        </Text>
      );
    }
    const italicMatch = part.match(/^\*([^*]+)\*$/);
    if (italicMatch) {
      return (
        <Text key={idx} style={[baseStyle, styles.italic]}>
          {italicMatch[1]}
        </Text>
      );
    }
    return (
      <Text key={idx} style={baseStyle}>
        {part}
      </Text>
    );
  });
}

/**
 * Parse text into paragraphs and bullet points.
 */
function renderContent(text, baseStyle) {
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<View key={key++} style={styles.paragraphGap} />);
      continue;
    }

    // Horizontal divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<View key={key++} style={styles.divider} />);
      continue;
    }

    // Markdown headers (## Header, ### Header, # Header)
    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const headerStyle = level <= 2 ? styles.headerH2 : styles.headerH3;
      elements.push(
        <Text key={key++} style={[baseStyle, headerStyle]}>
          {renderInline(headerText, [baseStyle, headerStyle])}
        </Text>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-•*]\s+/, '');
      elements.push(
        <View key={key++} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={baseStyle}>{renderInline(bulletText, baseStyle)}</Text>
        </View>
      );
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <View key={key++} style={styles.bulletRow}>
          <Text style={[baseStyle, styles.bulletNum]}>{numMatch[1]}.</Text>
          <Text style={baseStyle}>{renderInline(numMatch[2], baseStyle)}</Text>
        </View>
      );
      continue;
    }

    // Normal text
    elements.push(
      <Text key={key++} style={baseStyle}>
        {renderInline(trimmed, baseStyle)}
      </Text>
    );
  }

  return elements;
}

export default function ChatBubble({ message, isUser = false }) {
  const text =
    typeof message === 'string'
      ? message
      : message?.content ?? message?.text ?? '';

  if (isUser) {
    return (
      <View style={styles.userWrapper}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{text}</Text>
        </View>
      </View>
    );
  }

  // Assistant — document-style with avatar
  const isBooting = message?.isBooting && !text;

  return (
    <View style={styles.assistantWrapper}>
      <View style={styles.avatarCol}>
        <View style={styles.avatar}>
          <Leaf size={14} color={colors.accent} strokeWidth={2.5} />
        </View>
      </View>
      <View style={styles.assistantContent}>
        {isBooting ? (
          <ServerBootCard
            step={message?.bootStep}
            stepDisplay={message?.bootStepDisplay}
            url={message?.bootUrl}
          />
        ) : text ? (
          renderContent(text, styles.assistantText)
        ) : (
          <View style={styles.typingRow}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // User bubble
  userWrapper: {
    alignItems: 'flex-end',
    width: '100%',
  },
  userBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    borderBottomRightRadius: radii.xs,
    backgroundColor: colors.userBubble,
  },
  userText: {
    ...typography.body,
    color: colors.userBubbleText,
  },

  // Assistant
  assistantWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: spacing.sm,
  },
  avatarCol: {
    paddingTop: 2,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  assistantContent: {
    flex: 1,
    paddingTop: 2,
  },
  assistantText: {
    ...typography.body,
    color: colors.textPrimary,
  },

  // Formatting
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  headerH2: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brand,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerH3: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.sm,
    width: '100%',
  },
  paragraphGap: {
    height: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
    marginVertical: 1,
  },
  bulletDot: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '700',
    lineHeight: 24,
  },
  bulletNum: {
    fontWeight: '600',
    color: colors.textMuted,
    minWidth: 18,
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brandLight,
    opacity: 0.5,
  },
  typingDot1: {},
  typingDot2: {},
  typingDot3: {},

  // Server Boot Loading Card styles
  bootCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    alignItems: 'center',
    maxWidth: 520,
    width: '100%',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bootIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1.5,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  bootSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootTextContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  bootPhaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand,
    marginBottom: 4,
    textAlign: 'center',
  },
  bootStateBeneath: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  bootPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bootLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.brandSubtle,
  },
  bootLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  bootLiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
    textTransform: 'uppercase',
  },
  bootChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bootChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  bootLockNotice: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 15,
    marginTop: spacing.xs,
  },
  bootTimerSection: {
    width: '100%',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bootTimerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bootTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bootTimerCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
  bootTimerTotal: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  bootRemainingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brandLight || colors.brand,
  },
  bootProgressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bootProgressBarFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 3,
  },
  bootExplanationBox: {
    width: '100%',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  bootExplanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bootExplanationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary || colors.text,
  },
  bootExplanationBody: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  bootProductionBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    backgroundColor: colors.surfaceRaised || colors.surface,
    padding: 6,
    borderRadius: radii.sm,
  },
  bootProductionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  bootBoldText: {
    fontWeight: '700',
    color: colors.textPrimary || colors.text,
  },
  bootDirectBox: {
    width: '100%',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bootDirectToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  bootDirectToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },
  bootDirectInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  bootDirectTextInput: {
    flex: 1,
    height: 36,
    backgroundColor: colors.surfaceRaised || '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    fontSize: 12,
    color: colors.textPrimary,
  },
  bootDirectBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bootDirectBtnDisabled: {
    opacity: 0.6,
  },
  bootDirectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bootDirectMsg: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  bootDirectMsgSuccess: {
    color: colors.accent || '#10b981',
    fontWeight: '600',
  },
  bootDirectMsgError: {
    color: colors.danger || '#ef4444',
  },
});
