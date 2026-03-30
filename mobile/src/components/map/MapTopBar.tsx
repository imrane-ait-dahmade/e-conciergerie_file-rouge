import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';

type Props = {
  onSearchPress?: () => void;
};

/**
 * Barre supérieure légère : titre + accès recherche (onglet Recherche).
 */
export function MapTopBar({ onSearchPress }: Props) {
  return (
    <View style={[styles.wrap, { paddingTop: Spacing.sm, paddingBottom: Spacing.sm }]}>
      <View style={styles.row}>
        <Text style={styles.title}>Carte</Text>
        {onSearchPress ? (
          <Pressable
            onPress={onSearchPress}
            style={({ pressed }) => [styles.searchBtn, pressed && styles.searchBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Rechercher"
          >
            <Ionicons name="search" size={20} color={Colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.base,
    pointerEvents: 'box-none',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
    lineHeight: LineHeight.title,
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBtnPressed: {
    opacity: 0.92,
  },
});
