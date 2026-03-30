import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { SearchResultItem } from '@/src/types/search.types';

type Props = {
  item: SearchResultItem;
  onPress: () => void;
};

export function SearchResultCard({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.locationLabel}`}
    >
      <View style={styles.thumbWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumb} contentFit="cover" transition={180} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.rating != null ? (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {item.locationLabel}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            {item.domain ?? (item.type === 'establishment' ? 'Établissement' : 'Service')}
          </Text>
          {item.priceLabel ? <Text style={styles.price}>{item.priceLabel}</Text> : null}
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
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardPressed: {
    opacity: 0.95,
  },
  thumbWrap: {
    width: 96,
    minHeight: 104,
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
  body: {
    flex: 1,
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    lineHeight: LineHeight.tight,
    color: Colors.text,
    fontWeight: '700',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  location: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  metaText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  price: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
});
