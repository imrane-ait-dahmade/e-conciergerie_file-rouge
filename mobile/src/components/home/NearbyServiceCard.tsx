import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { NearbyService } from '@/src/types/nearby.types';

const CARD_WIDTH = 268;
const CARD_IMAGE_HEIGHT = 132;

type Props = {
  item: NearbyService;
  onPress: () => void;
};

function displayLocation(item: NearbyService): string {
  const label = item.locationLabel?.trim();
  if (label) {
    return label;
  }
  const name = item.establishmentName?.trim();
  if (name) {
    return name;
  }
  return '—';
}

export function NearbyServiceCard({ item, onPress }: Props) {
  const locationText = displayLocation(item);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${locationText}`}
    >
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="cover"
            transition={180}
          />
        ) : (
          <View style={styles.imagePlaceholder} accessibilityLabel="Pas d’image">
            <Ionicons name="image-outline" size={40} color={Colors.textMuted} />
          </View>
        )}
        <View style={styles.imageOverlay} />
        {item.rating != null && !Number.isNaN(item.rating) ? (
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        ) : null}
        <View style={styles.distancePill}>
          <Ionicons name="navigate-outline" size={12} color={Colors.text} />
          <Text style={styles.distanceText}>{item.distanceKm.toFixed(1)} km</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
        {item.priceLabel ? (
          <Text style={styles.price}>{item.priceLabel}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg + 2,
    marginRight: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: Colors.surfaceMuted,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  ratingPill: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  distancePill: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  distanceText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  body: {
    padding: Spacing.md,
    paddingTop: Spacing.md - 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: LineHeight.normal + 2,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  location: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  price: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
