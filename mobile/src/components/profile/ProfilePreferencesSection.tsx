import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { PreferenceItem } from '@/src/types/profile.types';

type Props = {
  items: PreferenceItem[];
  onItemPress?: (item: PreferenceItem) => void;
};

/**
 * Préférences : lignes avec interrupteurs (état local MVP) ou chevron pour langue.
 */
export function ProfilePreferencesSection({ items, onItemPress }: Props) {
  const [notifOn, setNotifOn] = useState(true);
  const [locOn, setLocOn] = useState(true);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Préférences</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View key={item.id}>
            <PrefRow
              item={item}
              notifOn={notifOn}
              locOn={locOn}
              onNotifChange={setNotifOn}
              onLocChange={setLocOn}
              onPress={() => onItemPress?.(item)}
            />
            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  item: PreferenceItem;
  notifOn: boolean;
  locOn: boolean;
  onNotifChange: (v: boolean) => void;
  onLocChange: (v: boolean) => void;
  onPress: () => void;
};

function PrefRow({
  item,
  notifOn,
  locOn,
  onNotifChange,
  onLocChange,
  onPress,
}: RowProps) {
  const isSwitch = item.preferenceKey === 'notifications' || item.preferenceKey === 'location';
  const value =
    item.preferenceKey === 'notifications'
      ? notifOn
      : item.preferenceKey === 'location'
        ? locOn
        : false;

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={item.icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.sub}>{item.subtitle}</Text> : null}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={
            item.preferenceKey === 'notifications' ? onNotifChange : onLocChange
          }
          trackColor={{ false: Colors.border, true: Colors.switchTrackOn }}
          thumbColor={value ? Colors.primary : Colors.surfaceMuted}
        />
      ) : (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => pressed && styles.chevronPressed}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  heading: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryAlpha08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: LineHeight.tight,
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chevronPressed: {
    opacity: 0.7,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 40 + Spacing.md,
  },
});
