import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/src/constants/theme';

type Props = {
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function SearchBar({
  value,
  placeholder = 'Hôtel, restaurant, activité...',
  onChangeText,
  onSubmit,
  onClear,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={Colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
      />
      {value.trim().length > 0 ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
});
