import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';
import type { DomainServiceItem } from '@/src/types/domain.types';

export type ServiceTabsBarProps = {
  services: DomainServiceItem[];
  selectedId: string | null;
  onSelect: (serviceId: string) => void;
};

const chipShadow = Platform.select({
  ios: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  android: { elevation: 1 },
  default: {},
});

/**
 * Barre horizontale de sous-services (pills). Réutilisable hors écran domaine.
 */
export function ServiceTabsBar({ services, selectedId, onSelect }: ServiceTabsBarProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
      >
        {services.map((s) => {
          const active = s.id === selectedId;
          return (
            <Pressable
              key={s.id}
              onPress={() => onSelect(s.id)}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipIdle,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {s.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 9999,
    borderWidth: 1.5,
    ...chipShadow,
  },
  chipIdle: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.chipSelectedBg,
    borderColor: Colors.chipSelectedBorder,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    lineHeight: LineHeight.tight,
    maxWidth: 200,
  },
  labelActive: {
    color: Colors.text,
  },
  pressed: {
    opacity: 0.9,
  },
});
