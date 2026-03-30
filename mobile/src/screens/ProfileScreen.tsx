import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoutButton } from '@/src/components/profile/LogoutButton';
import { ProfileHeader } from '@/src/components/profile/ProfileHeader';
import { ProfileMenuSection } from '@/src/components/profile/ProfileMenuSection';
import { ProfilePreferencesSection } from '@/src/components/profile/ProfilePreferencesSection';
import { ProfileSummaryCard } from '@/src/components/profile/ProfileSummaryCard';
import { Colors, FontSize, LineHeight, Spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import {
  MOCK_USER_PROFILE,
  PROFILE_MAIN_MENU_ITEMS,
  PROFILE_PREFERENCE_ITEMS,
} from '@/src/data/profile.mock';
import type { MainTabParamList } from '@/src/navigation/navigationTypes';
import { ApiError, getProfile, type SafeUserResponse } from '@/src/services/api';
import type { PreferenceItem, ProfileMenuItem, UserProfile } from '@/src/types/profile.types';

function mapApiUserToProfile(api: SafeUserResponse, base: UserProfile): UserProfile {
  const fullName = `${api.prenom} ${api.nom}`.trim();
  const cityFromAddress = api.adresse?.split(',')[0]?.trim() ?? null;
  return {
    ...base,
    id: api.id,
    firstName: api.prenom,
    lastName: api.nom,
    fullName: fullName || base.fullName,
    email: api.email,
    phone: api.telephone ?? base.phone,
    city: cityFromAddress ?? base.city,
  };
}

const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

/**
 * Profil : header, résumé, menus, préférences, déconnexion — aligné design Home (cartes blanches, tons bleu).
 */
export function ProfileScreen() {
  const { token, signOut } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [apiUser, setApiUser] = useState<SafeUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!token) {
        setLoading(false);
        setApiUser(null);
        return () => {
          cancelled = true;
        };
      }
      (async () => {
        setLoading(true);
        setLoadError(null);
        try {
          const p = await getProfile(token);
          if (!cancelled) setApiUser(p);
        } catch (e) {
          if (!cancelled) {
            setApiUser(null);
            setLoadError(e instanceof ApiError ? e.message : 'Profil indisponible');
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  const displayProfile: UserProfile = useMemo(() => {
    if (apiUser) {
      return mapApiUserToProfile(apiUser, MOCK_USER_PROFILE);
    }
    return MOCK_USER_PROFILE;
  }, [apiUser]);

  const onEditProfile = useCallback(() => {
    console.log('[Profile] Modifier le profil — brancher écran dédié ou formulaire');
    Alert.alert('Profil', 'Édition du profil : à brancher (MVP).');
  }, []);

  const onMenuItemPress = useCallback(
    (item: ProfileMenuItem) => {
      switch (item.routeKey) {
        case 'favorites':
          navigation.navigate('Home', { screen: 'HomeMain' });
          console.log('[Profile] Mes favoris — ouvrir section favoris quand prête');
          break;
        case 'addresses':
          navigation.navigate('Map');
          break;
        case 'settings':
          console.log('[Profile] Paramètres — stack à ajouter');
          Alert.alert('Paramètres', 'Écran en construction.');
          break;
        case 'help':
        case 'about':
          Alert.alert(item.title, 'Contenu à venir dans une prochaine version.');
          break;
        default:
          console.log(`[Profile] Menu: ${item.routeKey}`, item.title);
          Alert.alert(item.title, 'Fonctionnalité à venir.');
      }
    },
    [navigation],
  );

  const onPreferencePress = useCallback((item: PreferenceItem) => {
    if (item.preferenceKey === 'language') {
      Alert.alert('Langue', 'Choix de langue : à brancher (i18n).');
      return;
    }
    if (item.preferenceKey === 'theme') {
      Alert.alert('Thème', 'Thème sombre : prévu plus tard.');
    }
  }, []);

  const onLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Profil</Text>
          <Text style={styles.screenSub}>Votre espace personnel</Text>
        </View>

        {loadError ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{loadError}</Text>
            <Text style={styles.bannerHint}>Affichage des informations de démonstration.</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Chargement du profil…</Text>
          </View>
        ) : null}

        <ProfileHeader profile={displayProfile} onEditPress={onEditProfile} />
        <ProfileSummaryCard profile={displayProfile} />

        <ProfileMenuSection
          title="Mon compte"
          items={PROFILE_MAIN_MENU_ITEMS}
          onItemPress={onMenuItemPress}
        />

        <ProfilePreferencesSection
          items={PROFILE_PREFERENCE_ITEMS}
          onItemPress={onPreferencePress}
        />

        {token ? <LogoutButton onPress={onLogout} /> : null}

        <View style={styles.footer}>
          <Text style={styles.footerApp}>E-conciergerie</Text>
          <Text style={styles.footerVer}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  screenHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
    lineHeight: LineHeight.title,
    marginBottom: Spacing.xs,
  },
  screenSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  banner: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  bannerText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  bannerHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 4,
  },
  footerApp: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  footerVer: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    opacity: 0.85,
  },
});
