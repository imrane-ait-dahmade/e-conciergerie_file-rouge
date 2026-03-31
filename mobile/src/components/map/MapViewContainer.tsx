import { forwardRef, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { Colors } from '@/src/constants/theme';

type Props = {
  initialRegion: Region;
  children?: ReactNode;
  showsUserLocation?: boolean;
  onPressMap?: () => void;
};

/**
 * Carte Google Maps plein écran. Sur web, affiche un fallback (pas de react-native-maps).
 */
export const MapViewContainer = forwardRef<MapView, Props>(function MapViewContainer(
  { initialRegion, children, showsUserLocation = true, onPressMap },
  ref,
) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fill, styles.webFallback]}>
        {children}
      </View>
    );
  }

  return (
    <MapView
      ref={ref}
      style={styles.fill}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      mapType="standard"
      loadingEnabled
      onPress={onPressMap}
      userInterfaceStyle="light"
    >
      {children}
    </MapView>
  );
});

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  webFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
