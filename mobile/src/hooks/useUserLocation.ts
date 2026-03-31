import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { UserLocationCoords } from '@/src/types/location.types';

export type { UserLocationCoords } from '@/src/types/location.types';

export type UserLocationStatus =
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unavailable';

export type UseUserLocationResult = {
  status: UserLocationStatus;
  coords: UserLocationCoords | null;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * Demande la permission foreground et lit la position une fois (MVP).
 */
export function useUserLocation(): UseUserLocationResult {
  const [status, setStatus] = useState<UserLocationStatus>('loading');
  const [coords, setCoords] = useState<UserLocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        setCoords(null);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setStatus('granted');
    } catch (e) {
      setCoords(null);
      setStatus('unavailable');
      setError(
        e instanceof Error
          ? e.message
          : 'Impossible de récupérer votre position.',
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, coords, error, refresh };
}
