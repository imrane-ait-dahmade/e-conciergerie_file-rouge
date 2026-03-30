import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { FeatureItem } from '@/src/types/service-detail.types';

type Props = {
  title?: string;
  items: FeatureItem[];
};

/**
 * Liste d’équipements dans une carte blanche, avec icônes et séparateurs discrets.
 */
export function FeaturesList({ title = 'Équipements & services', items }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={item.id}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={item.icon as ComponentProps<typeof Ionicons>['name']}
                size={20}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
          {index < items.length - 1 ? <View style={styles.sep} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.infoSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.infoBorder,
  },
  label: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: LineHeight.normal,
    color: Colors.text,
    fontWeight: '500',
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },
});
