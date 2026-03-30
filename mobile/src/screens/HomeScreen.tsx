import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DomainBar } from '@/src/components/home/DomainBar';
import { HeroCarousel } from '@/src/components/home/HeroCarousel';
import { SectionHeader } from '@/src/components/home/SectionHeader';
import { ServiceCard } from '@/src/components/home/ServiceCard';
import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';
import {
  MOCK_ACTIVITIES,
  MOCK_HERO_ITEMS,
  MOCK_HOTELS,
  MOCK_RESTAURANTS,
} from '@/src/data/home.mock';
import { useMobileDomains } from '@/src/hooks/useMobileDomains';
import type { HomeStackParamList } from '@/src/navigation/navigationTypes';
import type { ServiceItem } from '@/src/types/home.types';

type HomeNav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

function applyFavorites(items: ServiceItem[], fav: Set<string>): ServiceItem[] {
  return items.map((i) => ({ ...i, isFavorite: fav.has(i.id) }));
}

/**
 * Accueil conciergerie : domaines (API), hero et listes (mocks pour l’instant).
 */
export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { domains, loading: domainsLoading, error: domainsError, refetch: refetchDomains } =
    useMobileDomains();
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const x of [...MOCK_RESTAURANTS, ...MOCK_HOTELS, ...MOCK_ACTIVITIES]) {
      if (x.isFavorite) initial.add(x.id);
    }
    return initial;
  });

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const restaurants = useMemo(
    () => applyFavorites(MOCK_RESTAURANTS, favorites),
    [favorites],
  );
  const hotels = useMemo(() => applyFavorites(MOCK_HOTELS, favorites), [favorites]);
  const activities = useMemo(
    () => applyFavorites(MOCK_ACTIVITIES, favorites),
    [favorites],
  );

  const onSeeAll = (section: string) => {
    console.log(`[Home] Voir tout: ${section}`);
  };

  useEffect(() => {
    if (domains.length === 0) return;
    setSelectedDomainId((prev) => {
      if (prev && domains.some((d) => d.id === prev)) return prev;
      return domains[0].id;
    });
  }, [domains]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour</Text>
          <Text style={styles.headline}>Que souhaitez-vous organiser ?</Text>
        </View>

        <DomainBar
          loading={domainsLoading}
          error={domainsError}
          domains={domains}
          selectedDomainId={selectedDomainId}
          onSelectDomain={setSelectedDomainId}
          onRetry={refetchDomains}
        />

        <HeroCarousel
          items={MOCK_HERO_ITEMS}
          onCtaPress={(item) => {
            navigation.navigate('ServiceDetail', { serviceId: item.id });
          }}
        />

        <SectionHeader title="Restaurants recommandés" onSeeAll={() => onSeeAll('restaurants')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
          nestedScrollEnabled
        >
          {restaurants.map((item) => (
            <ServiceCard
              key={item.id}
              item={item}
              onPress={() => {
                navigation.navigate('ServiceDetail', { serviceId: item.id });
              }}
              onToggleFavorite={() => toggleFav(item.id)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Hébergements populaires" onSeeAll={() => onSeeAll('hotels')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
          nestedScrollEnabled
        >
          {hotels.map((item) => (
            <ServiceCard
              key={item.id}
              item={item}
              onPress={() => {
                navigation.navigate('ServiceDetail', { serviceId: item.id });
              }}
              onToggleFavorite={() => toggleFav(item.id)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Activités du moment" onSeeAll={() => onSeeAll('activities')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRowLast}
          nestedScrollEnabled
        >
          {activities.map((item) => (
            <ServiceCard
              key={item.id}
              item={item}
              onPress={() => {
                navigation.navigate('ServiceDetail', { serviceId: item.id });
              }}
              onToggleFavorite={() => toggleFav(item.id)}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    letterSpacing: 0.2,
  },
  headline: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: LineHeight.title,
    letterSpacing: -0.3,
  },
  hRow: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  hRowLast: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
});
