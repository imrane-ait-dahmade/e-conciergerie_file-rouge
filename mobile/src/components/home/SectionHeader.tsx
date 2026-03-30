import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Spacing } from '@/src/constants/theme';

type Props = {
  title: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
};

export function SectionHeader({
  title,
  onSeeAll,
  seeAllLabel = 'Voir tout',
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={seeAllLabel}
        >
          <Text style={styles.link}>{seeAllLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
    marginRight: Spacing.md,
  },
  link: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
