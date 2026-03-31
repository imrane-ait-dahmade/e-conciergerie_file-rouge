import { ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/src/components/home/SectionHeader';
import { ServiceCard } from '@/src/components/home/ServiceCard';
import { Colors, Radius, Spacing } from '@/src/constants/theme';
import type { ServiceItem } from '@/src/types/home.types';

const SEE_ALL_MIN = 4;

type Props = {
  title?: string;
  items: ServiceItem[];
  loading?: boolean;
  onServicePress: (serviceId: string) => void;
  onToggleFavorite: (serviceId: string) => void;
  onSeeAll?: () => void;
};

function SkeletonRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hRow}
      nestedScrollEnabled
    >
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonCard} accessibilityLabel="Chargement">
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLineNarrow} />
            <View style={styles.skeletonLinePrice} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Liste horizontale type Home — mock ou futur GET featured.
 */
export function FallbackServicesSection({
  title = 'Sélection du moment',
  items,
  loading = false,
  onServicePress,
  onToggleFavorite,
  onSeeAll,
}: Props) {
  const showSeeAll = onSeeAll != null && items.length >= SEE_ALL_MIN;

  if (loading) {
    return (
      <View style={styles.block}>
        <SectionHeader title={title} />
        <SkeletonRow />
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.block}>
      <SectionHeader
        title={title}
        onSeeAll={showSeeAll ? onSeeAll : undefined}
        seeAllLabel="Voir tout"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hRow}
        nestedScrollEnabled
      >
        {items.map((item) => (
          <ServiceCard
            key={item.id}
            item={item}
            onPress={() => onServicePress(item.id)}
            onToggleFavorite={() => onToggleFavorite(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: Spacing.sm,
  },
  hRow: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  skeletonCard: {
    width: 268,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg + 2,
    marginRight: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skeletonImage: {
    height: 132,
    backgroundColor: Colors.surfaceMuted,
  },
  skeletonBody: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  skeletonLineWide: {
    height: 14,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceMuted,
    width: '88%',
  },
  skeletonLineNarrow: {
    height: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceMuted,
    width: '55%',
  },
  skeletonLinePrice: {
    height: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceMuted,
    width: '40%',
  },
});
