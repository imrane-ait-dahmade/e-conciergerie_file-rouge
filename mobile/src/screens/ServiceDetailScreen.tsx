import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookingBar } from '@/src/components/service-detail/BookingBar';
import { DescriptionBlock } from '@/src/components/service-detail/DescriptionBlock';
import { FeaturesList } from '@/src/components/service-detail/FeaturesList';
import { GalleryPreview } from '@/src/components/service-detail/GalleryPreview';
import { ProviderCard } from '@/src/components/service-detail/ProviderCard';
import { ServiceHeader } from '@/src/components/service-detail/ServiceHeader';
import { ServiceInfo } from '@/src/components/service-detail/ServiceInfo';
import { Colors, Spacing } from '@/src/constants/theme';
import { getMockServiceDetail } from '@/src/data/service-detail.mock';
import type { HomeStackParamList } from '@/src/navigation/navigationTypes';

const SCROLL_BOTTOM_EXTRA = 108;

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceDetail'>;

/**
 * Détail d’un service (données mockées — branchement API ultérieur).
 */
export function ServiceDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const serviceId = route.params?.serviceId;

  const base = useMemo(() => getMockServiceDetail(serviceId), [serviceId]);
  const [isFavorite, setIsFavorite] = useState(base.isFavorite);

  useEffect(() => {
    setIsFavorite(base.isFavorite);
  }, [base.id, base.isFavorite]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBook = useCallback(() => {
    Alert.alert('Réserver', 'Flux de réservation à connecter à l’API.');
  }, []);

  const bottomPad = SCROLL_BOTTOM_EXTRA + insets.bottom;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
      >
        <ServiceHeader
          imageUri={base.image}
          onBack={handleBack}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite((v) => !v)}
        />

        <View style={styles.body}>
          <ServiceInfo
            service={{
              title: base.title,
              shortDescription: base.shortDescription,
              location: base.location,
              priceLabel: base.priceLabel,
              rating: base.rating,
              reviewCount: base.reviewCount,
              experienceCount: base.experienceCount,
              category: base.category,
            }}
          />
          <ProviderCard provider={base.provider} />
          <FeaturesList items={base.features} />
          <DescriptionBlock text={base.longDescription} />
          <GalleryPreview items={base.gallery} />
        </View>
      </ScrollView>

      <BookingBar priceLabel={base.priceLabel} ctaLabel="Réserver" onPress={handleBook} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
