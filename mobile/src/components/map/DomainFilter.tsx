import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import type { DomainBarItem } from '@/src/types/domain.types';

type Props = {
  domains: DomainBarItem[];
  selectedDomainId?: string;
  onDomainChange: (domainId: string | undefined) => void;
  /** Limite l’affichage pour garder la barre scrollable raisonnable. */
  maxItems?: number;
};

/**
 * Chip « tous les domaines » + domaines API.
 */
export function DomainFilter({
  domains,
  selectedDomainId,
  onDomainChange,
  maxItems = 12,
}: Props) {
  const allSelected = selectedDomainId == null;

  return (
    <>
      <Pressable
        style={[styles.chip, allSelected && styles.chipSelected]}
        onPress={() => onDomainChange(undefined)}
        accessibilityRole="button"
        accessibilityState={{ selected: allSelected }}
        accessibilityLabel="Tous les domaines"
      >
        <Text style={[styles.chipText, allSelected && styles.chipTextSelected]}>Tous domaines</Text>
      </Pressable>
      {domains.slice(0, maxItems).map((d) => {
        const selected = selectedDomainId === d.id;
        return (
          <Pressable
            key={d.id}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onDomainChange(selected ? undefined : d.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={d.label}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
              {d.label}
            </Text>
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
    maxWidth: 160,
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
