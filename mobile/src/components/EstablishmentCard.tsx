import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { EtablissementApi } from '@/src/services/api';
import { resolveEtablissementImageUrl } from '@/src/utils/resolveEtablissementImageUrl';

type Props = {
  item: EtablissementApi;
  onPress: () => void;
};

/**
 * Carte d’un établissement : image, nom, extrait de description, lien vers le détail.
 */
export function EstablishmentCard({ item, onPress }: Props) {
  const imageUri = resolveEtablissementImageUrl(item.image);
  const description =
    item.description?.trim() || item.adresse?.trim() || 'Découvrir cet établissement.';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.nom}, voir le détail`}
    >
      <View style={styles.thumbWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.thumb}
            contentFit="cover"
            transition={180}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="storefront-outline" size={36} color={Colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.nom}
        </Text>
        <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
          {description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.cta}>Voir le détail</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md + 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardPressed: {
    opacity: 0.92,
  },
  thumbWrap: {
    width: 108,
    alignSelf: 'stretch',
  },
  thumb: {
    width: '100%',
    height: '100%',
    minHeight: 112,
    backgroundColor: Colors.surfaceMuted,
  },
  thumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    padding: Spacing.md + 2,
    paddingLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm - 2,
  },
  desc: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.tight,
    color: Colors.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  cta: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
