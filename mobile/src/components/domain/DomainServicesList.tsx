import { StyleSheet, View } from 'react-native';

import { DomainServiceCard } from '@/src/components/domain/DomainServiceCard';
import { Spacing } from '@/src/constants/theme';
import type { DomainEstablishmentServiceItem } from '@/src/types/domain.types';

export type DomainServicesListProps = {
  items: DomainEstablishmentServiceItem[];
  favoriteIds: Set<string>;
  onCardPress: (item: DomainEstablishmentServiceItem) => void;
  onToggleFavorite: (id: string) => void;
};

/**
 * Liste verticale de cartes (ScrollView parent recommandé — MVP).
 */
export function DomainServicesList({
  items,
  favoriteIds,
  onCardPress,
  onToggleFavorite,
}: DomainServicesListProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <DomainServiceCard
          key={item.id}
          item={item}
          isFavorite={favoriteIds.has(item.id) || Boolean(item.isFavorite)}
          onPress={() => onCardPress(item)}
          onToggleFavorite={() => onToggleFavorite(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: Spacing.lg,
  },
});
