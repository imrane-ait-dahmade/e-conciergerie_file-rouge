import { ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/src/components/home/SectionHeader';
import { Colors, Radius, Spacing } from '@/src/constants/theme';

const SKELETON_COUNT = 3;

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard} accessibilityLabel="Chargement">
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineNarrow} />
        <View style={styles.skeletonLinePrice} />
      </View>
    </View>
  );
}

type Props = {
  title?: string;
};

/** Skeleton aligné sur la section « Services près de vous ». */
export function NearbySectionSkeleton({ title = 'Services près de vous' }: Props) {
  return (
    <View style={styles.block}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hRow}
        nestedScrollEnabled
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
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
