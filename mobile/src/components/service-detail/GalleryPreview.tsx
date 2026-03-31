import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';
import type { GalleryItem } from '@/src/types/service-detail.types';

const THUMB = 112;

type Props = {
  title?: string;
  items: GalleryItem[];
  onPressItem?: (item: GalleryItem) => void;
};

/**
 * Galerie horizontale (miniatures) — données mockées pour le MVP.
 */
export function GalleryPreview({
  title = 'Aperçu',
  items,
  onPressItem,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => {
          const inner = (
            <Image
              source={{ uri: item.uri }}
              style={styles.thumb}
              contentFit="cover"
              transition={150}
            />
          );
          return onPressItem ? (
            <Pressable
              key={item.id}
              onPress={() => onPressItem(item)}
              style={({ pressed }) => [styles.thumbWrap, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Agrandir l’image"
            >
              {inner}
            </Pressable>
          ) : (
            <View key={item.id} style={styles.thumbWrap}>
              {inner}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingHorizontal: 2,
  },
  scrollContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  thumbWrap: {
    width: THUMB,
    height: THUMB * 0.72,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.92,
  },
});
