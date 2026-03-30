import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { ServiceDetail } from '@/src/types/service-detail.types';

type Props = {
  service: Pick<
    ServiceDetail,
    | 'title'
    | 'shortDescription'
    | 'location'
    | 'priceLabel'
    | 'rating'
    | 'reviewCount'
    | 'experienceCount'
    | 'category'
  >;
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars: ReactElement[] = [];
  for (let i = 0; i < 5; i += 1) {
    if (i < full) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#F59E0B" />);
    } else if (i === full && half) {
      stars.push(<Ionicons key={i} name="star-half" size={16} color="#F59E0B" />);
    } else {
      stars.push(<Ionicons key={i} name="star-outline" size={16} color="#CBD5E1" />);
    }
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

/**
 * Titre, extrait, localisation, prix, note et métadonnées (catégorie, avis).
 */
export function ServiceInfo({ service }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{service.category}</Text>
        </View>
      </View>

      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.short}>{service.shortDescription}</Text>

      <View style={styles.locRow}>
        <Ionicons name="location-outline" size={18} color={Colors.primary} />
        <Text style={styles.loc} numberOfLines={2}>
          {service.location}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.ratingBlock}>
          <Stars rating={Math.min(5, Math.max(0, service.rating))} />
          <Text style={styles.ratingValue}>{service.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.metaMuted}>
          {service.reviewCount} avis · {service.experienceCount} expériences
        </Text>
      </View>

      {service.priceLabel ? (
        <View style={styles.priceRow}>
          <Text style={styles.price}>{service.priceLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: LineHeight.title,
    marginBottom: Spacing.sm,
  },
  short: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.relaxed,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  loc: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.normal,
    color: Colors.text,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  ratingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  dot: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
    marginHorizontal: Spacing.xs,
  },
  metaMuted: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    flex: 1,
    minWidth: 120,
  },
  priceRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
});
