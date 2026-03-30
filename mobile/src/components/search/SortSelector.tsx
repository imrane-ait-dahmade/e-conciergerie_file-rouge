import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import type { SearchSortOption } from '@/src/types/search.types';

const SORT_OPTIONS: Array<{ value: SearchSortOption; label: string }> = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'rating_desc', label: 'Mieux notés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

type Props = {
  value: SearchSortOption;
  onChange: (next: SearchSortOption) => void;
};

export function SortSelector({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.label}>Trier par</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
      >
        {SORT_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  row: {
    paddingRight: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#DBEAFE',
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.primary,
  },
});
