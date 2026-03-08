import { API_BASE_URL } from '@/src/constants/config';

/**
 * Construit une URL d’image affichable par le téléphone.
 * Si l’API renvoie un chemin relatif (/uploads/...), on le préfixe avec l’URL du serveur.
 */
export function resolveEtablissementImageUrl(image?: string | null): string | null {
  if (!image?.trim()) {
    return null;
  }
  const u = image.trim();
  if (u.startsWith('http://') || u.startsWith('https://')) {
    return u;
  }
  return `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}
