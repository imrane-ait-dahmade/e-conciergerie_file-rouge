import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';

export type DomainEmptyVariant = 'domain' | 'filter';

export type DomainEmptyStateProps = {
  variant?: DomainEmptyVariant;
  /** Surcharge du titre si besoin */
  title?: string;
  description?: string;
};

const COPY: Record<
  DomainEmptyVariant,
  { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }
> = {
  domain: {
    icon: 'sparkles-outline',
    title: 'Aucune offre pour ce domaine',
    description:
      'Les établissements et services apparaîtront ici dès qu’ils seront disponibles. En attendant, explorez les autres domaines depuis l’accueil.',
  },
  filter: {
    icon: 'options-outline',
    title: 'Aucun résultat pour ce sous-service',
    description:
      'Essayez un autre onglet ci-dessus pour parcourir les autres catégories de ce domaine.',
  },
};

/**
 * État vide lisible : message utile + encart léger (pas de surcharge).
 */
export function DomainEmptyState({
  variant = 'domain',
  title: titleOverride,
  description: descriptionOverride,
}: DomainEmptyStateProps) {
  const c = COPY[variant];
  const title = titleOverride ?? c.title;
  const description = descriptionOverride ?? c.description;

  return (
    <View style={styles.outer} accessibilityRole="text">
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name={c.icon} size={22} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.chipSelectedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: LineHeight.tight,
    letterSpacing: -0.15,
  },
  desc: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: LineHeight.relaxed,
    maxWidth: 300,
  },
});
