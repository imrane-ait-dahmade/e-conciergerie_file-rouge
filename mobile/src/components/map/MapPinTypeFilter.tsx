import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import { MAP_PIN_TYPE_FILTER_OPTIONS, type MapPinTypeFilter } from '@/src/types/map.types';

type Props = {
  value: MapPinTypeFilter;
  onChange: (next: MapPinTypeFilter) => void;
};

/**
 * Filtre local sur le type de point carte (établissement vs offre / siège).
 */
export function MapPinTypeFilter({ value, onChange }: Props) {
  return (
    <>
      {MAP_PIN_TYPE_FILTER_OPTIONS.map(({ value: v, label }) => {
        const selected = value === v;
        return (
          <Pressable
            key={v}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(v)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
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
