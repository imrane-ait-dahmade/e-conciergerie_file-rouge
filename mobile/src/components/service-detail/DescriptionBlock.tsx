import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';

const PREVIEW_LINES = 5;

type Props = {
  title?: string;
  text: string;
};

/**
 * Description longue avec repli « Voir plus » pour le MVP.
 */
export function DescriptionBlock({ title = 'Description', text }: Props) {
  const [expanded, setExpanded] = useState(false);
  const needsToggle = text.length > 280;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text
        style={styles.body}
        numberOfLines={expanded || !needsToggle ? undefined : PREVIEW_LINES}
      >
        {text}
      </Text>
      {needsToggle ? (
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Voir moins' : 'Voir plus'}
        >
          <Text style={styles.moreText}>{expanded ? 'Voir moins' : 'Voir plus'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.relaxed + 2,
    color: Colors.textMuted,
  },
  moreBtn: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  moreText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
