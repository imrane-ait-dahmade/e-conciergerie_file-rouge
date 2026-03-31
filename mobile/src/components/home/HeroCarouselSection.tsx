import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroCarousel } from '@/src/components/home/HeroCarousel';
import { Colors, FontSize, Spacing } from '@/src/constants/theme';
import type { HeroItem } from '@/src/types/home.types';

type Props = {
  items: HeroItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCtaPress?: (item: HeroItem) => void;
};

const MIN_HEIGHT = 280;

/**
 * Enveloppe réseau : loading / erreur / vide / carrousel — le design du slide reste dans `HeroCarousel`.
 */
export function HeroCarouselSection({
  items,
  loading,
  error,
  onRetry,
  onCtaPress,
}: Props) {
  if (loading) {
    return (
      <View style={styles.center} accessibilityLabel="Chargement du carrousel">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.box}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onRetry} style={styles.retry} accessibilityRole="button">
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.box}>
        <Text style={styles.emptyText}>Aucune bannière pour le moment.</Text>
      </View>
    );
  }

  return <HeroCarousel items={items} onCtaPress={onCtaPress} />;
}

const styles = StyleSheet.create({
  center: {
    minHeight: MIN_HEIGHT,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    minHeight: MIN_HEIGHT,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retry: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  retryText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
});
