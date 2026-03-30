import { Marker } from 'react-native-maps';

import { Brand, Colors } from '@/src/constants/colors';
import type { MapNearbyItem } from '@/src/types/map.types';

type Props = {
  item: MapNearbyItem;
  selected: boolean;
  onPress: (item: MapNearbyItem) => void;
};

/**
 * Un marqueur par point carte. Couleur différente si sélectionné.
 */
export function MapMarkerItem({ item, selected, onPress }: Props) {
  return (
    <Marker
      coordinate={{
        latitude: item.latitude,
        longitude: item.longitude,
      }}
      title={item.title}
      description={item.subtitle || undefined}
      onPress={() => onPress(item)}
      pinColor={selected ? Brand.blue : Colors.pinDefault}
      zIndex={selected ? 1000 : 1}
      tracksViewChanges={false}
    />
  );
}
