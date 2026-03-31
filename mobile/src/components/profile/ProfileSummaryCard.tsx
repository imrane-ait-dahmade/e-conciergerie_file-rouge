import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, LineHeight, Radius, Spacing } from '@/src/constants/theme';
import type { ProfileIconName, UserProfile } from '@/src/types/profile.types';

const ACCOUNT_LABEL: Record<UserProfile['accountType'], string> = {
  voyageur: 'Voyageur',
  prestataire: 'Prestataire',
  admin: 'Administrateur',
};

function formatMemberSince(isoOrLabel: string): string {
  const d = new Date(isoOrLabel);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }
  return isoOrLabel;
}

type RowProps = { icon: ProfileIconName; label: string; value: string; showTopBorder?: boolean };

function SummaryRow({ icon, label, value, showTopBorder }: RowProps) {
  return (
    <View style={[styles.row, showTopBorder && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type Props = {
  profile: UserProfile;
};

/**
 * Carte résumé : ville, téléphone, type de compte, membre depuis.
 */
export function ProfileSummaryCard({ profile }: Props) {
  const rows: RowProps[] = [
    {
      icon: 'location-outline',
      label: 'Ville',
      value: profile.city ?? '—',
    },
    {
      icon: 'call-outline',
      label: 'Téléphone',
      value: profile.phone ?? '—',
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Type de compte',
      value: ACCOUNT_LABEL[profile.accountType],
    },
    {
      icon: 'calendar-outline',
      label: 'Membre depuis',
      value: formatMemberSince(profile.memberSince),
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Informations</Text>
      {rows.map((r, index) => (
        <SummaryRow key={r.label} {...r} showTopBorder={index > 0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
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
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
    paddingTop: Spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryAlpha08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: LineHeight.normal,
  },
});
