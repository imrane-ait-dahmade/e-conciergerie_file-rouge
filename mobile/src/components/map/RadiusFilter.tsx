import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import { MAP_RADIUS_OPTIONS, type MapRadiusKm } from '@/src/types/map.types';

type Props = {
  radiusKm: MapRadiusKm;
  onRadiusChange: (km: MapRadiusKm) => void;
};

/**
 * Chips rayon de recherche (km).
 */
export function RadiusFilter({ radiusKm, onRadiusChange }: Props) {
  return (
    <>
      {MAP_RADIUS_OPTIONS.map((km) => {
        const selected = radiusKm === km;
        return (
          <Pressable
            key={km}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onRadiusChange(km)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Rayon ${km} kilomètres`}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{km} km</Text>
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#DBEAFE',
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.primary,
  },
});
