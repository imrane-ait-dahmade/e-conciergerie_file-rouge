import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/src/constants/theme';

type Props = {
  onPress: () => void;
  disabled?: boolean;
};

/**
 * Déconnexion : bouton discret mais visible (contour rouge léger).
 */
export function LogoutButton({ onPress, disabled }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          pressed && styles.btnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Se déconnecter"
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.label}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  btnPressed: {
    opacity: 0.88,
    backgroundColor: '#FEF2F2',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error,
  },
});
