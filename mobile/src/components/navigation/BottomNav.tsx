import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontSize, Spacing } from '@/src/constants/theme';

const TAB_ICONS: Record<string, 'home' | 'search' | 'map-outline' | 'person-outline'> = {
  Home: 'home',
  Search: 'search',
  Map: 'map-outline',
  Profile: 'person-outline',
};

/**
 * Tab bar personnalisée : Accueil, Recherche, Carte, Profil.
 * À brancher via `tabBar={(props) => <BottomNav {...props} />}` sur le Tab.Navigator.
 */
export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Spacing.sm);

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title !== undefined
                ? String(options.title)
                : route.name;

          const isFocused = state.index === index;
          const iconName = TAB_ICONS[route.name] ?? 'ellipse';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.label, isFocused && styles.labelFocused]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  labelFocused: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
