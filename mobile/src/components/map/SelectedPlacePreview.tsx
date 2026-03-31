import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import { MAP_ITEM_TYPE_LABEL, type MapNearbyItem } from '@/src/types/map.types';

const IMAGE_HEIGHT = 128;

type Props = {
  item: MapNearbyItem;
  onClose: () => void;
  onOpenDetail: (item: MapNearbyItem) => void;
};

function locationLine(item: MapNearbyItem): string {
  const loc = item.locationLabel?.trim();
  if (loc) return loc;
  return '';
}

/**
 * Carte d’aperçu bas d’écran — style aligné sur les cartes Home (image hero, pills, CTA).
 */
export function SelectedPlacePreview({ item, onClose, onOpenDetail }: Props) {
  const insets = useSafeAreaInsets();
  const locationText = locationLine(item);
  const domainName = item.domain?.name?.trim();
  const showSubtitle =
    item.subtitle.trim().length > 0 &&
    (!domainName || item.subtitle.trim() !== domainName);

  return (
    <View
      style={[styles.screenWrap, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <Pressable
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Fermer l’aperçu"
        >
          <View style={styles.closeCircle}>
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </View>
        </Pressable>

        <View style={styles.imageHeader}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="image-outline" size={40} color={Colors.textMuted} />
            </View>
          )}
          <View style={styles.heroOverlay} />
          {item.rating != null && !Number.isNaN(item.rating) ? (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={14} color={Colors.star} />
              <Text style={styles.ratingPillText}>{item.rating.toFixed(1)}</Text>
            </View>
          ) : null}
          {item.distanceKm != null ? (
            <View style={styles.distancePill}>
              <Ionicons name="navigate-outline" size={12} color={Colors.text} />
              <Text style={styles.distancePillText}>{item.distanceKm.toFixed(1)} km</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.chipsRow}>
            <View style={styles.chipMuted}>
              <Text style={styles.chipMutedText}>{MAP_ITEM_TYPE_LABEL[item.type]}</Text>
            </View>
            {domainName ? (
              <View style={styles.chipPrimary}>
                <Text style={styles.chipPrimaryText} numberOfLines={1}>
                  {domainName}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {showSubtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          ) : null}

          {locationText ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.locationText} numberOfLines={2}>
                {locationText}
              </Text>
            </View>
          ) : null}

          {item.priceLabel ? (
            <Text style={styles.price}>{item.priceLabel}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => onOpenDetail(item)}
            accessibilityRole="button"
            accessibilityLabel="Voir le détail du service"
          >
            <Text style={styles.ctaText}>Voir le détail</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.card} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    bottom: 0,
    zIndex: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 5,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageHeader: {
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.surfaceMuted,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.imageOverlay,
  },
  ratingPill: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.overlayLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  ratingPillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  distancePill: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.overlayLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  distancePillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  chipMuted: {
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    maxWidth: '48%',
  },
  chipMutedText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  chipPrimary: {
    backgroundColor: Colors.primaryAlpha10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    maxWidth: '52%',
  },
  chipPrimaryText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: LineHeight.tight + 2,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: LineHeight.normal,
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: LineHeight.normal,
  },
  price: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  cta: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 3,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaText: {
    color: Colors.card,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
