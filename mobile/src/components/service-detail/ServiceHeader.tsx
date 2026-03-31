import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/src/constants/theme';

const HEADER_HEIGHT = 300;

type Props = {
  imageUri: string;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

/**
 * Image hero avec contrôles flottants (retour, favori) et léger overlay pour le contraste.
 */
export function ServiceHeader({
  imageUri,
  onBack,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.wrap}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.overlay} pointerEvents="none" />
      <View style={[styles.toolbar, { top: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Pressable
          onPress={onToggleFavorite}
          style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? Colors.favorite : Colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.imageOverlay,
  },
  toolbar: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  pressed: {
    opacity: 0.9,
  },
});
