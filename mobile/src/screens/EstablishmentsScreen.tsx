import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EstablishmentCard } from '@/src/components/EstablishmentCard';
import { Colors } from '@/src/constants/theme';
import type { EstablishmentsStackParamList } from '@/src/navigation/navigationTypes';
import { ApiError, getEtablissements, type EtablissementApi } from '@/src/services/api';

type EstNav = NativeStackNavigationProp<EstablishmentsStackParamList, 'EstablishmentsList'>;

/**
 * Liste des établissements (GET /etablissements).
 * Chaque ligne est une carte (image, nom, description courte) ; appui → écran détail.
 */
export function EstablishmentsScreen() {
  const navigation = useNavigation<EstNav>();
  const [items, setItems] = useState<EtablissementApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getEtablissements();
      setItems(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Impossible de charger la liste';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.muted}>Chargement des établissements…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Text style={styles.screenTitle}>Établissements</Text>
      <Text style={styles.screenSub}>Appuie sur une carte pour voir plus d’infos.</Text>
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item._id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={<Text style={styles.muted}>Aucun établissement pour le moment.</Text>}
        renderItem={({ item }) => (
          <EstablishmentCard
            item={item}
            onPress={() => navigation.navigate('EstablishmentDetails', { id: String(item._id) })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  screenSub: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginTop: 4,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { color: Colors.textMuted, marginTop: 8, textAlign: 'center' },
  errorBanner: {
    backgroundColor: Colors.errorListBg,
    color: Colors.error,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
  },
});
