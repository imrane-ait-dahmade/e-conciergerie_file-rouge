import Ionicons from '@expo/vector-icons/Ionicons';
import { getDomainIconGlyph } from '@/src/utils/domainIconMap';

type Props = {
  /** Valeur brute du champ `icon` côté API (ex. bed, plane, map). */
  iconKey: string;
  size?: number;
  color: string;
};

/**
 * Affiche l’icône domaine à partir de la clé backend (mapping centralisé dans `domainIconMap.ts`).
 */
export function DomainGlyphIcon({ iconKey, size = 18, color }: Props) {
  return <Ionicons name={getDomainIconGlyph(iconKey)} size={size} color={color} />;
}
