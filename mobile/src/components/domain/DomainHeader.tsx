import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DomainGlyphIcon } from '@/src/components/home/DomainGlyphIcon';
import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';

export type DomainHeaderProps = {
  title: string;
  onBack: () => void;
  /** Même clé que la barre d’accueil (`DomainBarItem.iconKey`) — glyphe optionnel à côté du titre. */
  iconKey?: string;
};

/**
 * En-tête minimal : retour + titre (écran domaine — pas de bandeau ni sous-titre).
 */
export function DomainHeader({ title, onBack, iconKey }: DomainHeaderProps) {
  const insets = useSafeAreaInsets();
  const showIcon = Boolean(iconKey?.trim());

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={14}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </Pressable>
        <View style={styles.titleCluster}>
          {showIcon ? (
            <DomainGlyphIcon iconKey={iconKey ?? ''} size={22} color={Colors.iconPrimary} />
          ) : null}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
        <View style={styles.backSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  back: {
    width: 44,
    height: 44,
    marginLeft: -Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: {
    width: 44,
    height: 44,
  },
  pressed: {
    opacity: 0.55,
  },
  titleCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.25,
    lineHeight: LineHeight.normal + 4,
  },
});
