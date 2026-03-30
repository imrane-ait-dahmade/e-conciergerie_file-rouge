import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { MapEmptyState } from '@/src/components/map/MapEmptyState';
import { MapFiltersBar } from '@/src/components/map/MapFiltersBar';
import { MapLoadingState } from '@/src/components/map/MapLoadingState';
import { MapMarkerItem } from '@/src/components/map/MapMarkerItem';
import { MapTopBar } from '@/src/components/map/MapTopBar';
import { MapViewContainer } from '@/src/components/map/MapViewContainer';
import { SelectedPlacePreview } from '@/src/components/map/SelectedPlacePreview';
import { Colors, FontSize, Spacing } from '@/src/constants/theme';
import { useMapNearbyItems } from '@/src/hooks/useMapNearbyItems';
import { useMobileDomains } from '@/src/hooks/useMobileDomains';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import type { MainTabParamList } from '@/src/navigation/navigationTypes';
import {
  DEFAULT_MAP_RADIUS_KM,
  DEFAULT_MAP_REGION,
  type MapNearbyItem,
  type MapPinTypeFilter,
  type MapRadiusKm,
} from '@/src/types/map.types';

function regionFromCoords(lat: number, lng: number): Region {
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };
}

/**
 * Carte Google Maps : position utilisateur, points proches (GET /map/nearby), markers + aperçu.
 */
export function MapScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const mapRef = useRef<MapView>(null);
  const { status: locationStatus, coords, error: locationError, refresh: refreshLocation } =
    useUserLocation();
  const [radiusKm, setRadiusKm] = useState<MapRadiusKm>(DEFAULT_MAP_RADIUS_KM);
  const [domainId, setDomainId] = useState<string | undefined>(undefined);
  const [pinTypeFilter, setPinTypeFilter] = useState<MapPinTypeFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { domains } = useMobileDomains();

  const { items: rawItems, loading: nearbyLoading, error: nearbyError, refetch } =
    useMapNearbyItems({
      coords: locationStatus === 'granted' ? coords : null,
      radiusKm,
      domainId,
    });

  const hasActiveFilters = useMemo(
    () =>
      domainId != null ||
      pinTypeFilter !== 'all' ||
      radiusKm !== DEFAULT_MAP_RADIUS_KM,
    [domainId, pinTypeFilter, radiusKm],
  );

  const resetFilters = useCallback(() => {
    setRadiusKm(DEFAULT_MAP_RADIUS_KM);
    setDomainId(undefined);
    setPinTypeFilter('all');
  }, []);

  const items = useMemo(() => {
    const valid = rawItems.filter(
      (i) =>
        typeof i.latitude === 'number' &&
        typeof i.longitude === 'number' &&
        !Number.isNaN(i.latitude) &&
        !Number.isNaN(i.longitude),
    );
    if (pinTypeFilter === 'all') return valid;
    return valid.filter((i) => i.type === pinTypeFilter);
  }, [rawItems, pinTypeFilter]);

  useEffect(() => {
    if (selectedId && !items.some((i) => i.id === selectedId)) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  const selectedItem = useMemo(
    () => (selectedId ? items.find((i) => i.id === selectedId) ?? null : null),
    [items, selectedId],
  );

  const initialRegion = useMemo((): Region => {
    if (coords) {
      return regionFromCoords(coords.latitude, coords.longitude);
    }
    return { ...DEFAULT_MAP_REGION };
  }, [coords]);

  useEffect(() => {
    if (!coords || Platform.OS === 'web' || !mapRef.current) return;
    mapRef.current.animateToRegion(regionFromCoords(coords.latitude, coords.longitude), 450);
  }, [coords]);

  /** Recentre légèrement au sud pour laisser le pin visible au-dessus de la preview. */
  useEffect(() => {
    if (Platform.OS === 'web' || !selectedItem || !mapRef.current) return;
    const lat = selectedItem.latitude - 0.005;
    mapRef.current.animateToRegion(
      {
        latitude: lat,
        longitude: selectedItem.longitude,
        latitudeDelta: 0.065,
        longitudeDelta: 0.065,
      },
      400,
    );
  }, [selectedItem?.id]);

  const onPressMap = useCallback(() => {
    setSelectedId(null);
  }, []);

  const recenter = useCallback(() => {
    if (coords && mapRef.current && Platform.OS !== 'web') {
      mapRef.current.animateToRegion(regionFromCoords(coords.latitude, coords.longitude), 400);
      return;
    }
    void refreshLocation();
  }, [coords, refreshLocation]);

  const onOpenDetail = useCallback(
    (item: MapNearbyItem) => {
      navigation.navigate('Home', {
        screen: 'ServiceDetail',
        params: { serviceId: item.id },
      });
    },
    [navigation],
  );

  const onSearchPress = useCallback(() => {
    navigation.navigate('Search', { screen: 'EstablishmentsList' });
  }, [navigation]);

  const showLocationLoading = locationStatus === 'loading';
  const showNearbyLoading = locationStatus === 'granted' && coords && nearbyLoading;
  const showLoadingOverlay = showLocationLoading || showNearbyLoading;

  const showLocationDenied =
    locationStatus === 'denied' || locationStatus === 'unavailable';

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.webBox}>
          <Text style={styles.webTitle}>Carte</Text>
          <Text style={styles.webBody}>
            La carte interactive est disponible sur iOS et Android (build natif avec Google Maps).
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <MapViewContainer
        ref={mapRef}
        initialRegion={initialRegion}
        showsUserLocation={locationStatus === 'granted'}
        onPressMap={onPressMap}
      >
        {items.map((item) => (
          <MapMarkerItem
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onPress={(p) => setSelectedId(p.id)}
          />
        ))}
      </MapViewContainer>

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        <MapTopBar onSearchPress={onSearchPress} />
        {locationStatus === 'granted' ? (
          <MapFiltersBar
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            domains={domains}
            selectedDomainId={domainId}
            onDomainChange={setDomainId}
            pinType={pinTypeFilter}
            onPinTypeChange={setPinTypeFilter}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        ) : null}
      </SafeAreaView>

      {showLoadingOverlay ? (
        <MapLoadingState
          message={
            showLocationLoading ? 'Localisation…' : 'Chargement des offres à proximité…'
          }
        />
      ) : null}

      {showLocationDenied ? (
        <MapEmptyState
          title="Position non disponible"
          description={
            locationError ??
            'Autorisez la localisation pour afficher les services près de vous. La carte reste centrée sur une zone par défaut.'
          }
          icon="location-outline"
          actionLabel="Réessayer"
          onAction={() => void refreshLocation()}
        />
      ) : null}

      {!nearbyError &&
      !showLocationDenied &&
      locationStatus === 'granted' &&
      coords &&
      !nearbyLoading &&
      items.length === 0 ? (
        <MapEmptyState
          title="Aucune offre dans cette zone"
          description={`Essayez d’élargir le rayon (${radiusKm} km), un autre domaine, ou « Tout » pour le type de point.`}
        />
      ) : null}

      {nearbyError && locationStatus === 'granted' && coords ? (
        <MapEmptyState
          title="Impossible de charger les offres"
          description={nearbyError}
          icon="alert-circle-outline"
          actionLabel="Réessayer"
          onAction={() => void refetch()}
        />
      ) : null}

      {locationStatus === 'granted' && coords ? (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            selectedItem != null && styles.fabWithPreview,
            pressed && styles.fabPressed,
          ]}
          onPress={recenter}
          onLongPress={() => void refetch()}
          accessibilityRole="button"
          accessibilityLabel="Recentrer sur ma position"
          accessibilityHint="Appui long pour actualiser les offres à proximité"
        >
          <Ionicons name="locate" size={22} color={Colors.primary} />
        </Pressable>
      ) : null}

      {selectedItem ? (
        <SelectedPlacePreview
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onOpenDetail={onOpenDetail}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  fabWithPreview: {
    bottom: 300,
  },
  fab: {
    position: 'absolute',
    right: Spacing.base,
    bottom: 100,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 15,
  },
  fabPressed: {
    opacity: 0.9,
  },
  webBox: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  webTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  webBody: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
