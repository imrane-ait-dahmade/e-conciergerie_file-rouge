import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';
import type { EstablishmentsStackParamList } from '@/src/navigation/navigationTypes';
import { ApiError, getEtablissementById, type EtablissementApi } from '@/src/services/api';

type Props = NativeStackScreenProps<EstablishmentsStackParamList, 'EstablishmentDetails'>;

/**
 * Détail d’un établissement (GET /etablissements/:id).
 */
export function EstablishmentDetailsScreen({ route }: Props) {
  const { id } = route.params;
  const [item, setItem] = useState<EtablissementApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEtablissementById(id);
      setItem(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Établissement introuvable';
      setError(msg);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? 'Introuvable'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{item.nom}</Text>
      {item.description ? <Text style={styles.body}>{item.description}</Text> : null}
      {item.adresse ? (
        <Text style={styles.row}>
          <Text style={styles.label}>Adresse : </Text>
          {item.adresse}
        </Text>
      ) : null}
      {item.telephone ? (
        <Text style={styles.row}>
          <Text style={styles.label}>Tél. : </Text>
          {item.telephone}
        </Text>
      ) : null}
      {item.email ? (
        <Text style={styles.row}>
          <Text style={styles.label}>Email : </Text>
          {item.email}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + Spacing.sm,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xl + 2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: FontSize.sm + 1,
    color: Colors.textMuted,
    lineHeight: LineHeight.normal,
    marginBottom: Spacing.base,
  },
  row: {
    fontSize: FontSize.sm + 1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  label: {
    fontWeight: '600',
  },
  error: {
    color: Colors.error,
    textAlign: 'center',
  },
});
