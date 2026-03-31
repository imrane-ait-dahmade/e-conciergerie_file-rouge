import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { DomainEstablishmentServiceItem } from '@/src/types/domain.types';
import { resolveEtablissementImageUrl } from '@/src/utils/resolveEtablissementImageUrl';

export type DomainServiceCardProps = {
  item: DomainEstablishmentServiceItem;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

const THUMB_W = 104;

/**
 * Carte liste domaine : image + infos + note + favori (aligné Home / recherche).
 */
export function DomainServiceCard({
  item,
  isFavorite,
  onPress,
  onToggleFavorite,
}: DomainServiceCardProps) {
  const uri = resolveEtablissementImageUrl(item.image ?? undefined);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.locationLabel}`}
    >
      <View style={styles.thumbWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.thumb} contentFit="cover" transition={180} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
          </View>
        )}
        <Pressable
          style={styles.favBtn}
          onPress={onToggleFavorite}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? Colors.favorite : Colors.card}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={12} color={Colors.star} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>

        {item.establishmentName ? (
          <Text style={styles.establishment} numberOfLines={1}>
            {item.establishmentName}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {item.locationLabel}
          </Text>
        </View>

        {item.priceLabel ? <Text style={styles.price}>{item.priceLabel}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  thumbWrap: {
    width: THUMB_W,
    minHeight: 112,
    backgroundColor: Colors.surfaceMuted,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: LineHeight.tight,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: Colors.badgeWarmBg,
    borderWidth: 1,
    borderColor: Colors.premiumBorder,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.premiumIcon,
  },
  establishment: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  metaRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  price: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
