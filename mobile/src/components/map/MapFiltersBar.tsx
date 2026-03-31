import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DomainFilter } from '@/src/components/map/DomainFilter';
import { MapPinTypeFilter as MapPinTypeChips } from '@/src/components/map/MapPinTypeFilter';
import { RadiusFilter } from '@/src/components/map/RadiusFilter';
import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import type { DomainBarItem } from '@/src/types/domain.types';
import type { MapPinTypeFilter as MapPinTypeValue, MapRadiusKm } from '@/src/types/map.types';

export type MapFiltersBarProps = {
  radiusKm: MapRadiusKm;
  onRadiusChange: (km: MapRadiusKm) => void;
  domains: DomainBarItem[];
  selectedDomainId?: string;
  onDomainChange: (domainId: string | undefined) => void;
  pinType: MapPinTypeValue;
  onPinTypeChange: (t: MapPinTypeValue) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
};

function Separator() {
  return <View style={styles.sep} accessibilityElementsHidden />;
}

/**
 * Barre de filtres carte : une rangée scrollable (rayon, domaine, type de pin) + réinitialisation.
 * Léger fond pour rester lisible sur la carte.
 */
export function MapFiltersBar({
  radiusKm,
  onRadiusChange,
  domains,
  selectedDomainId,
  onDomainChange,
  pinType,
  onPinTypeChange,
  hasActiveFilters,
  onResetFilters,
}: MapFiltersBarProps) {
  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
      >
        <RadiusFilter radiusKm={radiusKm} onRadiusChange={onRadiusChange} />
        <Separator />
        <DomainFilter
          domains={domains}
          selectedDomainId={selectedDomainId}
          onDomainChange={onDomainChange}
        />
        <Separator />
        <MapPinTypeChips value={pinType} onChange={onPinTypeChange} />
        {hasActiveFilters ? (
          <Pressable
            style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}
            onPress={onResetFilters}
            accessibilityRole="button"
            accessibilityLabel="Réinitialiser les filtres"
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
            <Text style={styles.resetLabel}>Réinit.</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.mapBarBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    pointerEvents: 'box-none',
  },
  row: {
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    flexGrow: 0,
  },
  sep: {
    width: StyleSheet.hairlineWidth * 2,
    height: 22,
    marginRight: Spacing.sm,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.filterResetBg,
    marginRight: Spacing.base,
  },
  resetBtnPressed: {
    opacity: 0.88,
  },
  resetLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
