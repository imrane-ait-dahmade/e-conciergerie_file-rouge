import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import type { DomainBarItem } from '@/src/types/domain.types';
import type { SearchFilterState } from '@/src/types/search.types';

const CITIES = ['Marrakech', 'Casablanca', 'Rabat'] as const;

type Props = {
  domains: DomainBarItem[];
  filters: SearchFilterState;
  onDomainChange: (domainId?: string) => void;
  onCityChange: (city?: string) => void;
  onToggleMinRating: () => void;
  onResetFilters: () => void;
};

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function FilterChips({
  domains,
  filters,
  onDomainChange,
  onCityChange,
  onToggleMinRating,
  onResetFilters,
}: Props) {
  const hasFilters = Boolean(filters.domainId || filters.city || filters.minRating != null);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
      >
        <Chip
          label={filters.city ? `Ville: ${filters.city}` : 'Toutes villes'}
          selected={Boolean(filters.city)}
          onPress={() => {
            const current = filters.city;
            if (!current) {
              onCityChange(CITIES[0]);
              return;
            }
            const index = CITIES.indexOf(current as (typeof CITIES)[number]);
            if (index === -1 || index === CITIES.length - 1) {
              onCityChange(undefined);
              return;
            }
            onCityChange(CITIES[index + 1]);
          }}
        />
        <Chip
          label="Note 4+"
          selected={filters.minRating != null}
          onPress={onToggleMinRating}
        />
        {domains.slice(0, 6).map((domain) => (
          <Chip
            key={domain.id}
            label={domain.label}
            selected={filters.domainId === domain.id}
            onPress={() => onDomainChange(filters.domainId === domain.id ? undefined : domain.id)}
          />
        ))}
      </ScrollView>
      {hasFilters ? (
        <Pressable onPress={onResetFilters} accessibilityRole="button" style={styles.resetButton}>
          <Text style={styles.resetText}>Effacer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
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
    backgroundColor: Colors.chipSelectedBg,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  chipTextSelected: {
    color: Colors.primary,
  },
  resetButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs,
  },
  resetText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
