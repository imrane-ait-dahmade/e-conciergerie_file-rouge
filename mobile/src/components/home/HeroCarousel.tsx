import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { HeroItem } from '@/src/types/home.types';

const HORIZONTAL_PAD = Spacing.base;
/** Entre 20 et 24 px — carte premium */
const HERO_CARD_RADIUS = 22;

/** Hauteur slide et typo : s’adaptent à la largeur d’écran (petits / grands téléphones). */
function useSlideMetrics(windowWidth: number) {
  return useMemo(() => {
    const slideWidth = Math.max(0, windowWidth - HORIZONTAL_PAD * 2);
    const height = Math.min(292, Math.max(248, Math.round(slideWidth * 0.62)));
    const contentPad = Math.min(26, Math.max(16, Math.round(windowWidth * 0.055)));
    const titleSize = windowWidth < 360 ? FontSize.xl + 1 : FontSize.xxl;
    const titleLineHeight = Math.round(titleSize * 1.28);
    return { slideWidth, slideHeight: height, contentPad, titleSize, titleLineHeight };
  }, [windowWidth]);
}

type Props = {
  items: HeroItem[];
  onCtaPress?: (item: HeroItem) => void;
};

export function HeroCarousel({ items, onCtaPress }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const { slideWidth, slideHeight, contentPad, titleSize, titleLineHeight } =
    useSlideMetrics(windowWidth);
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
      <View style={[styles.cardWrap, { width: slideWidth }]}>
        <Pressable
          style={[styles.slide, { height: slideHeight }]}
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
          <View style={styles.overlayVignette} />
          <View style={styles.overlayBottom} />
          <View style={[styles.slideContent, { paddingHorizontal: contentPad }]}>
            <View style={styles.textBlock}>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text
                    style={styles.badgeText}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.15}
                  >
                    {item.badge}
                  </Text>
                </View>
              ) : null}
              <Text
                style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}
                numberOfLines={2}
                maxFontSizeMultiplier={1.2}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                  {item.subtitle}
                </Text>
              ) : null}
              {item.location ? (
                <Text style={styles.location} numberOfLines={1} maxFontSizeMultiplier={1.15}>
                  {item.location}
                </Text>
              ) : null}
            </View>
            <View style={styles.ctaPill}>
              <Text style={styles.ctaText} maxFontSizeMultiplier={1.15}>
                {item.ctaLabel ?? 'Voir plus'}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    ),
    [onCtaPress, slideWidth, slideHeight, contentPad, titleSize, titleLineHeight],
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
        <View style={styles.dotsOuter} accessibilityRole="tablist">
          <View style={styles.dotsTrack}>
            {items.map((item, i) => (
              <View
                key={item.id}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
                accessibilityLabel={i === activeIndex ? 'Slide actif' : undefined}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

const styles = StyleSheet.create({
  outer: {
    marginBottom: Spacing.xl,
    paddingHorizontal: HORIZONTAL_PAD,
    paddingBottom: Spacing.sm,
  },
  listContent: {
    alignItems: 'stretch',
  },
  cardWrap: {
    borderRadius: HERO_CARD_RADIUS,
    backgroundColor: Colors.surfaceMuted,
    ...cardShadow,
  },
  slide: {
    borderRadius: HERO_CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
  },
  overlayBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.34)',
  },
  overlayVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '78%',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl + 8,
    paddingTop: Spacing.xxl + 4,
    gap: Spacing.lg,
  },
  textBlock: {
    gap: Spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.35,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 14,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: LineHeight.relaxed + 2,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  location: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  ctaPill: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: Spacing.xl + 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  ctaText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.35,
  },
  dotsOuter: {
    alignItems: 'center',
    marginTop: Spacing.lg + 6,
    paddingBottom: Spacing.xs,
  },
  dotsTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(100, 116, 139, 0.4)',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
});
