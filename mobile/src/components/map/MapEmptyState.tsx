import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';

type Props = {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Bandeau discret : aucune offre dans la zone ou permission refusée (message adapté par l’écran).
 */
export function MapEmptyState({
  title,
  description,
  icon = 'map-outline',
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={[styles.wrap, onAction && styles.wrapTouchable]} pointerEvents={onAction ? 'auto' : 'none'}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={Colors.textMuted} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
        {actionLabel && onAction ? (
          <Pressable style={({ pressed }) => [styles.action, pressed && styles.actionPressed]} onPress={onAction}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 4,
  },
  wrapTouchable: {
    pointerEvents: 'auto',
  },
  card: {
    backgroundColor: Colors.overlayLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 320,
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: LineHeight.relaxed,
  },
  action: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
  },
  actionPressed: {
    opacity: 0.9,
  },
  actionText: {
    color: Colors.card,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
