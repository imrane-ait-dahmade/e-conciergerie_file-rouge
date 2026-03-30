import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DomainGlyphIcon } from '@/src/components/home/DomainGlyphIcon';
import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { DomainBarItem } from '@/src/types/domain.types';

export type DomainBarProps = {
  domains: DomainBarItem[];
  selectedDomainId: string;
  onSelectDomain: (domainId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Message si liste vide (hors chargement / erreur). */
  emptyMessage?: string;
};

const CHIP_MIN_WIDTH = 76;
const CHIP_MAX_LABEL_WIDTH = 92;
const FEEDBACK_MIN_HEIGHT = 72;

/**
 * Barre horizontale de domaines (Home) : chargement / erreur / vide / pastilles premium.
 * Icône au-dessus du libellé, état actif souligné par bordure + fond léger.
 */
export function DomainBar({
  domains,
  selectedDomainId,
  onSelectDomain,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'Aucun domaine disponible pour le moment.',
}: DomainBarProps) {
  if (loading) {
    return (
      <View
        style={styles.feedback}
        accessibilityRole="progressbar"
        accessibilityLabel="Chargement des domaines"
      >
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.feedbackMuted}>Chargement…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.feedback}>
        <Text style={styles.feedbackError}>{error}</Text>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Réessayer le chargement des domaines"
          >
            <Text style={styles.retryLabel}>Réessayer</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (domains.length === 0) {
    return (
      <View style={styles.feedback}>
        <Text style={styles.feedbackMuted}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
      >
        {domains.map((domain) => {
          const active = domain.id === selectedDomainId;
          return (
            <Pressable
              key={domain.id}
              onPress={() => onSelectDomain(domain.id)}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipIdle,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={domain.label}
            >
              <DomainGlyphIcon
                iconKey={domain.iconKey}
                size={22}
                color={active ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]} numberOfLines={2}>
                {domain.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const chipShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  android: { elevation: 1 },
  default: {},
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  chip: {
    minWidth: CHIP_MIN_WIDTH,
    maxWidth: CHIP_MIN_WIDTH + 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    gap: Spacing.sm,
    ...chipShadow,
  },
  chipIdle: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.09)',
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: LineHeight.tight,
    maxWidth: CHIP_MAX_LABEL_WIDTH,
  },
  chipLabelActive: {
    color: Colors.text,
  },
  pressed: {
    opacity: 0.9,
  },
  feedback: {
    minHeight: FEEDBACK_MIN_HEIGHT,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  feedbackMuted: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: LineHeight.relaxed,
  },
  feedbackError: {
    fontSize: FontSize.sm,
    color: Colors.error,
    lineHeight: LineHeight.relaxed,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
