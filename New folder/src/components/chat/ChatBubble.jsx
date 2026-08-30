import { StyleSheet, Text, View } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../../constants/theme';

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
  return (
    <View style={styles.assistantWrapper}>
      <View style={styles.avatarCol}>
        <View style={styles.avatar}>
          <Leaf size={14} color={colors.accent} strokeWidth={2.5} />
        </View>
      </View>
      <View style={styles.assistantContent}>
        {text ? (
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
});
