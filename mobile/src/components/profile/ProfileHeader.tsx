import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { UserProfile } from '@/src/types/profile.types';

type Props = {
  profile: UserProfile;
  onEditPress?: () => void;
};

/**
 * En-tête profil : avatar, nom, email, action modifier.
 */
export function ProfileHeader({ profile, onEditPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatarWrap}>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={40} color={Colors.textMuted} />
          </View>
        )}
        <Pressable
          style={({ pressed }) => [styles.editFab, pressed && styles.editFabPressed]}
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Modifier le profil"
          hitSlop={8}
        >
          <Ionicons name="pencil" size={16} color={Colors.card} />
        </Pressable>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {profile.fullName}
      </Text>
      <Text style={styles.email} numberOfLines={1}>
        {profile.email}
      </Text>
    </View>
  );
}

const AVATAR = 96;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  avatarWrap: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Colors.surfaceMuted,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editFab: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  editFabPressed: {
    opacity: 0.9,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: LineHeight.title,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
