import { Platform, StyleSheet, Text, View } from 'react-native';

import { ProfileMenuItem } from '@/src/components/profile/ProfileMenuItem';
import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import type { ProfileMenuItem as ProfileMenuItemModel } from '@/src/types/profile.types';

type Props = {
  title: string;
  items: ProfileMenuItemModel[];
  onItemPress: (item: ProfileMenuItemModel) => void;
};

/**
 * Bloc titre + liste de lignes menu dans une carte blanche.
 */
export function ProfileMenuSection({ title, items, onItemPress }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View key={item.id}>
            <ProfileMenuItem item={item} onPress={() => onItemPress(item)} />
            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  heading: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 40 + Spacing.md,
  },
});
