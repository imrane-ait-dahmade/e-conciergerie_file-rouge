import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptySearchState } from '@/src/components/search/EmptySearchState';
import { FilterChips } from '@/src/components/search/FilterChips';
import { LoadingSearchState } from '@/src/components/search/LoadingSearchState';
import { SearchBar } from '@/src/components/search/SearchBar';
import { SearchResultCard } from '@/src/components/search/SearchResultCard';
import { SortSelector } from '@/src/components/search/SortSelector';
import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';
import { useMobileDomains } from '@/src/hooks/useMobileDomains';
import type { EstablishmentsStackParamList } from '@/src/navigation/navigationTypes';
import { fetchSearchResults } from '@/src/services/search.service';
import { ApiError } from '@/src/services/api';
import type { SearchFilterState, SearchResultItem, SearchSortOption } from '@/src/types/search.types';

type SearchNav = NativeStackNavigationProp<EstablishmentsStackParamList, 'EstablishmentsList'>;

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Impossible de charger les résultats pour le moment.';
}

export function SearchScreen() {
  const navigation = useNavigation<SearchNav>();
  const { domains } = useMobileDomains();

  const [inputValue, setInputValue] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [sort, setSort] = useState<SearchSortOption>('relevance');
  const [filters, setFilters] = useState<SearchFilterState>({});

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const canSearch = useMemo(() => submittedQuery.trim().length >= 2, [submittedQuery]);

  const runSearch = useCallback(
    async (isRefresh = false) => {
      if (!canSearch) {
        setResults([]);
        setTotal(0);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const response = await fetchSearchResults({
          q: submittedQuery,
          sort,
          ...filters,
          page: 1,
          limit: 20,
        });
        setResults(response.items);
        setTotal(response.total);
      } catch (e) {
        setError(messageFromError(e));
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canSearch, filters, sort, submittedQuery],
  );

  const submitSearch = useCallback(() => {
    const next = inputValue.trim();
    setHasSearched(true);
    setSubmittedQuery(next);
    if (next.length < 2) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }
  }, [inputValue]);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    if (!hasSearched || !canSearch) return;
    void runSearch(false);
  }, [canSearch, hasSearched, runSearch]);

  const onPressResult = useCallback(
    (item: SearchResultItem) => {
      if (item.type === 'establishment') {
        navigation.navigate('EstablishmentDetails', { id: item.id });
        return;
      }
      navigation.navigate('ServiceDetail', { serviceId: item.id });
    },
    [navigation],
  );

  const renderBody = () => {
    if (!hasSearched) {
      return (
        <EmptySearchState
          title="Lancez votre recherche"
          description="Tapez un mot-clé pour trouver un service, un hôtel ou une activité."
          iconName="search-outline"
        />
      );
    }
    if (loading && results.length === 0) {
      return <LoadingSearchState />;
    }
    if (error) {
      return (
        <EmptySearchState
          title="Recherche indisponible"
          description={error}
          actionLabel="Réessayer"
          onActionPress={() => void runSearch(false)}
          iconName="alert-circle-outline"
        />
      );
    }
    if (canSearch && results.length === 0) {
      return (
        <EmptySearchState
          title="Aucun résultat"
          description="Essayez un autre mot-clé ou allégez les filtres."
          actionLabel="Effacer les filtres"
          onActionPress={resetFilters}
          iconName="file-tray-outline"
        />
      );
    }

    return (
      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void runSearch(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.resultsCount}>
            {total} {total > 1 ? 'résultats' : 'résultat'}
          </Text>
        }
        renderItem={({ item }) => <SearchResultCard item={item} onPress={() => onPressResult(item)} />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Recherche</Text>
        <Text style={styles.subtitle}>Trouvez rapidement une offre qui vous correspond.</Text>
      </View>

      <View style={styles.controls}>
        <SearchBar
          value={inputValue}
          onChangeText={setInputValue}
          onSubmit={submitSearch}
          onClear={() => {
            setInputValue('');
            setSubmittedQuery('');
            setHasSearched(false);
            setResults([]);
            setError(null);
            setTotal(0);
          }}
        />
        <FilterChips
          domains={domains}
          filters={filters}
          onDomainChange={(domainId) => setFilters((prev) => ({ ...prev, domainId }))}
          onCityChange={(city) => setFilters((prev) => ({ ...prev, city }))}
          onToggleMinRating={() =>
            setFilters((prev) => ({
              ...prev,
              minRating: prev.minRating != null ? undefined : 4,
            }))
          }
          onToggleActiveOnly={() =>
            setFilters((prev) => ({
              ...prev,
              activeOnly: prev.activeOnly ? undefined : true,
            }))
          }
          onResetFilters={resetFilters}
        />
        <SortSelector value={sort} onChange={setSort} />
      </View>

      <View style={styles.content}>{renderBody()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: LineHeight.normal,
  },
  controls: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  resultsCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
});
