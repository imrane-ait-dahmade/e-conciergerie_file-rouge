import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { HeroItem } from '@/src/types/home.types';

const HORIZONTAL_PAD = Spacing.base;
const SLIDE_HEIGHT = 228;

type Props = {
  items: HeroItem[];
  onCtaPress?: (item: HeroItem) => void;
};

export function HeroCarousel({ items, onCtaPress }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = useMemo(
    () => Math.max(0, windowWidth - HORIZONTAL_PAD * 2),
    [windowWidth],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (slideWidth <= 0 || items.length === 0) return;
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / slideWidth);
      if (next >= 0 && next < items.length) {
        setActiveIndex(next);
      }
    },
    [items.length, slideWidth],
  );

  const renderItem: ListRenderItem<HeroItem> = useCallback(
    ({ item }) => (
      <Pressable
        style={[styles.slide, { width: slideWidth }]}
        onPress={() => onCtaPress?.(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${item.subtitle}`}
      >
        <Image
          source={{ uri: item.image }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={220}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.overlayBase} />
        <View style={styles.overlayBottom} />
        <View style={styles.slideContent}>
          {item.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {item.badge}
              </Text>
            </View>
          ) : null}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          ) : null}
          {item.location ? (
            <Text style={styles.location} numberOfLines={1}>
              {item.location}
            </Text>
          ) : null}
          <View style={styles.ctaPill}>
            <Text style={styles.ctaText}>{item.ctaLabel ?? 'Voir plus'}</Text>
          </View>
        </View>
      </Pressable>
    ),
    [onCtaPress, slideWidth],
  );

  const keyExtractor = useCallback((item: HeroItem) => item.id, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.outer}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        nestedScrollEnabled
        bounces={items.length > 1}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
      />
      {items.length > 1 ? (
        <View style={styles.dots} accessibilityRole="tablist">
          {items.map((item, i) => (
            <View
              key={item.id}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
              accessibilityLabel={i === activeIndex ? 'Slide actif' : undefined}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: Spacing.xl,
    paddingHorizontal: HORIZONTAL_PAD,
  },
  listContent: {
    alignItems: 'stretch',
  },
  slide: {
    height: SLIDE_HEIGHT,
    borderRadius: Radius.xl + 4,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
  },
  overlayBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.card,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.card,
    lineHeight: LineHeight.title,
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: LineHeight.relaxed,
    marginBottom: 4,
  },
  location: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
    marginBottom: Spacing.md,
  },
  ctaPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 1,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: Radius.md,
  },
  ctaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.card,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
});
