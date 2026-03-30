import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';

export type LocationPermissionCardVariant =
  | 'permission_denied'
  | 'gps_unavailable'
  | 'nearby_error'
  | 'empty_nearby';

type Props = {
  variant: LocationPermissionCardVariant;
  /** Message détail (ex. erreur API ou GPS) */
  detailMessage?: string;
  onPrimaryPress?: () => void;
  primaryLabel?: string;
};

function copyForVariant(
  variant: LocationPermissionCardVariant,
  detailMessage?: string,
): { title: string; body: string } {
  switch (variant) {
    case 'permission_denied':
      return {
        title: 'Voir les services proches',
        body:
          'Activez votre position pour afficher les offres autour de vous. Notre sélection du moment vous attend juste en dessous.',
      };
    case 'gps_unavailable':
      return {
        title: 'Position indisponible',
        body:
          'Nous n’avons pas pu déterminer votre position. Réessayez ou explorez la sélection ci-dessous.',
      };
    case 'nearby_error':
      return {
        title: 'Services proches indisponibles',
        body:
          detailMessage?.trim() ||
          'Une erreur est survenue. Réessayez ou parcourez la sélection du moment.',
      };
    case 'empty_nearby':
      return {
        title: 'Aucun service proche pour le moment',
        body: 'Élargissez votre recherche plus tard ou découvrez nos suggestions ci-dessous.',
      };
    default:
      return { title: '', body: '' };
  }
}

/**
 * Bannière discrète (localisation refusée, GPS, erreur réseau, liste vide nearby).
 */
export function LocationPermissionCard({
  variant,
  detailMessage,
  onPrimaryPress,
  primaryLabel,
}: Props) {
  const { title, body } = copyForVariant(variant, detailMessage);
  const compact = variant === 'empty_nearby';
  const showCta =
    variant !== 'empty_nearby' && onPrimaryPress != null && primaryLabel != null;

  return (
    <View
      style={[styles.wrap, compact && styles.wrapCompact]}
      accessibilityRole="summary"
    >
      <View style={styles.iconRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={variant === 'empty_nearby' ? 'navigate-outline' : 'location-outline'}
            size={compact ? 20 : 22}
            color={Colors.primary}
          />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
          <Text style={[styles.body, compact && styles.bodyCompact]}>{body}</Text>
        </View>
      </View>
      {showCta ? (
        <Pressable
          onPress={onPrimaryPress}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
        >
          <Text style={styles.ctaText}>{primaryLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wrapCompact: {
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: LineHeight.normal + 4,
  },
  bodyCompact: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.35)',
  },
  ctaPressed: {
    opacity: 0.88,
  },
  ctaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
