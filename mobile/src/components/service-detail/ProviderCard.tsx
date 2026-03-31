import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { ProviderInfo } from '@/src/types/service-detail.types';

type Props = {
  provider: ProviderInfo;
  onPress?: () => void;
};

/**
 * Ligne / carte prestataire — prête pour une navigation future (onPress).
 */
export function ProviderCard({ provider, onPress }: Props) {
  const content = (
    <>
      <View style={styles.avatarWrap}>
        {provider.avatarUrl ? (
          <Image
            source={{ uri: provider.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="business-outline" size={26} color={Colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.textCol}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {provider.name}
          </Text>
          {provider.verified ? (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.badgeText}>Vérifié</Text>
            </View>
          ) : null}
          {provider.premium ? (
            <View style={[styles.badge, styles.badgePremium]}>
              <Ionicons name="diamond-outline" size={14} color={Colors.premiumIcon} />
              <Text style={styles.badgePremiumText}>Premium</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.sub}>Prestataire partenaire</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Prestataire ${provider.name}`}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  pressed: {
    opacity: 0.94,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceMuted,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: LineHeight.tight,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.infoSurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.infoBorder,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  badgePremium: {
    backgroundColor: Colors.premiumSurface,
    borderColor: Colors.premiumBorder,
  },
  badgePremiumText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.premiumIcon,
  },
});
