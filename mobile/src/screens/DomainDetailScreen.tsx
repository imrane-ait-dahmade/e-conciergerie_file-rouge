import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DomainEmptyState } from '@/src/components/domain/DomainEmptyState';
import { DomainErrorState } from '@/src/components/domain/DomainErrorState';
import { DomainHeader } from '@/src/components/domain/DomainHeader';
import { DomainLoadingState } from '@/src/components/domain/DomainLoadingState';
import { DomainServicesList } from '@/src/components/domain/DomainServicesList';
import { ServiceTabsBar } from '@/src/components/domain/ServiceTabsBar';
import { Colors, Spacing } from '@/src/constants/theme';
import { useDomainDetail } from '@/src/hooks/useDomainDetail';
import type { HomeStackParamList } from '@/src/navigation/navigationTypes';
import type { DomainEstablishmentServiceItem } from '@/src/types/domain.types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DomainDetail'>;

/**
 * Domaine — UX simple : titre + retour → sous-services → liste.
 * Filtre principal : onglet sous-service. Sans onglets : liste du domaine directement.
 */
export function DomainDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { domainId, domainName, domainSlug, iconKey } = route.params;

  const {
    domain,
    services,
    allItems,
    filteredItems,
    selectedServiceId,
    setSelectedServiceId,
    loading,
    error,
    refetch,
    hasNoServices,
  } = useDomainDetail(domainId, {
    mockName: domainName,
    mockSlug: domainSlug,
  });

  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const next = new Set<string>();
    for (const it of allItems) {
      if (it.isFavorite) {
        next.add(it.id);
      }
    }
    setFavorites(next);
  }, [allItems]);

  const title = domain?.name ?? domainName ?? 'Domaine';

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const onCardPress = useCallback(
    (item: DomainEstablishmentServiceItem) => {
      navigation.navigate('ServiceDetail', { serviceId: item.id });
    },
    [navigation],
  );

  /** Domaine sans aucune carte (API vide). */
  const showDomainEmpty = useMemo(() => {
    if (loading || error) return false;
    return allItems.length === 0;
  }, [allItems.length, error, loading]);

  /** Sous-services présents mais filtre sans aucune carte. */
  const showFilterEmpty = useMemo(() => {
    if (loading || error) return false;
    if (allItems.length === 0) return false;
    if (hasNoServices) return false;
    return filteredItems.length === 0;
  }, [allItems.length, error, filteredItems.length, hasNoServices, loading]);

  const showList = !loading && !error && allItems.length > 0 && filteredItems.length > 0;

  return (
    <View style={styles.root}>
      {loading ? (
        <View style={styles.flex}>
          <DomainHeader title={title} iconKey={iconKey} onBack={() => navigation.goBack()} />
          <DomainLoadingState message="Chargement des offres…" />
        </View>
      ) : error ? (
        <View style={styles.flex}>
          <DomainHeader title={title} iconKey={iconKey} onBack={() => navigation.goBack()} />
          <DomainErrorState message={error} onRetry={refetch} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.sm },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <DomainHeader title={title} iconKey={iconKey} onBack={() => navigation.goBack()} />

          <View style={styles.body}>
            {services.length > 0 ? (
              <ServiceTabsBar
                services={services}
                selectedId={selectedServiceId}
                onSelect={setSelectedServiceId}
              />
            ) : null}

            {showDomainEmpty ? <DomainEmptyState variant="domain" /> : null}

            {showFilterEmpty ? <DomainEmptyState variant="filter" /> : null}

            {showList ? (
              <DomainServicesList
                items={filteredItems}
                favoriteIds={favorites}
                onCardPress={onCardPress}
                onToggleFavorite={toggleFavorite}
              />
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: Spacing.base,
    flexGrow: 1,
  },
});
