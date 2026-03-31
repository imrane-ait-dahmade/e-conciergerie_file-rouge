import { ScrollView, StyleSheet, View } from 'react-native';

import { NearbyServiceCard } from '@/src/components/home/NearbyServiceCard';
import { SectionHeader } from '@/src/components/home/SectionHeader';
import { Spacing } from '@/src/constants/theme';
import type { NearbyService } from '@/src/types/nearby.types';

const SEE_ALL_MIN = 4;

type Props = {
  items: NearbyService[];
  onServicePress: (serviceId: string) => void;
  onSeeAll?: () => void;
};

/**
 * Carrousel « Services près de vous » — données déjà chargées (permission accordée + API OK).
 */
export function NearbyServicesSection({ items, onServicePress, onSeeAll }: Props) {
  const showSeeAll = onSeeAll != null && items.length >= SEE_ALL_MIN;

  return (
    <View style={styles.block}>
      <SectionHeader
        title="Services près de vous"
        onSeeAll={showSeeAll ? onSeeAll : undefined}
        seeAllLabel="Voir tout"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hRow}
        nestedScrollEnabled
      >
        {items.map((item) => (
          <NearbyServiceCard
            key={item.id}
            item={item}
            onPress={() => onServicePress(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: Spacing.sm,
  },
  hRow: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
});
