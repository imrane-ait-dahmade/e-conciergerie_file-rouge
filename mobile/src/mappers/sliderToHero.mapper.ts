import type { HeroItem } from '@/src/types/home.types';
import type { SliderApiItem } from '@/src/types/slider.types';
import { resolveEtablissementImageUrl } from '@/src/utils/resolveEtablissementImageUrl';

/**
 * Transformation **Slider API → HeroItem** pour `HeroCarousel`.
 *
 * Toute évolution de contrat backend se concentre ici (+ `SliderApiItem` dans `types/slider.types.ts`).
 *
 * | Champ backend (`SliderApiItem`) | Champ `HeroItem` | Notes |
 * |--------------------------------|-------------------|--------|
 * | `id`                           | `id`              | Identifiant Mongo (string) |
 * | `title`                        | `title`           | |
 * | `description`                  | `subtitle`        | Texte sous le titre |
 * | `badge`                        | `badge`           | Pastille (optionnelle) |
 * | `picture`                      | `image`           | URL absolue via `resolveEtablissementImageUrl` |
 * | `button_text`                  | `ctaLabel`        | Défaut : « Voir plus » |
 * | `button_link`                  | `buttonLink`      | Ouverture navigateur si `http(s)` |
 * | —                              | `badge`, `slug`, `location`, `type` | Optionnels ; non fournis par l’API actuelle |
 *
 * Slides sans image résolvable sont **exclues** (`null` → filtrées).
 */

function heroImageFromSlider(slider: SliderApiItem): string | null {
  return resolveEtablissementImageUrl(slider.picture);
}

function heroSubtitleFromSlider(slider: SliderApiItem): string {
  return slider.description?.trim() ?? '';
}

function heroCtaLabelFromSlider(slider: SliderApiItem): string | undefined {
  const t = slider.button_text?.trim();
  return t || undefined;
}

function heroButtonLinkFromSlider(slider: SliderApiItem): string | undefined {
  const t = slider.button_link?.trim();
  return t || undefined;
}

/**
 * Mappe **une** slide API vers un `HeroItem`, ou `null` si la slide ne peut pas s’afficher (pas d’image).
 */
export function mapSliderApiItemToHeroItem(slider: SliderApiItem): HeroItem | null {
  const image = heroImageFromSlider(slider);
  if (!image) {
    return null;
  }

  const cta = heroCtaLabelFromSlider(slider);
  const badgeRaw = slider.badge?.trim();

  return {
    id: slider.id,
    title: slider.title?.trim() || '—',
    subtitle: heroSubtitleFromSlider(slider),
    image,
    ctaLabel: cta ?? 'Voir plus',
    badge: badgeRaw || undefined,
    slug: undefined,
    type: 'slider',
    location: undefined,
    buttonLink: heroButtonLinkFromSlider(slider),
  };
}

/**
 * Mappe un **tableau** de slides API → tableau de `HeroItem` (entrées invalides retirées).
 */
export function mapSliderApiItemsToHeroItems(sliders: SliderApiItem[]): HeroItem[] {
  return sliders
    .map(mapSliderApiItemToHeroItem)
    .filter((item): item is HeroItem => item !== null);
}

/** @deprecated Utiliser `mapSliderApiItemToHeroItem` — alias pour compatibilité */
export const mapSliderToHeroItem = mapSliderApiItemToHeroItem;

/** @deprecated Utiliser `mapSliderApiItemsToHeroItems` — alias pour compatibilité */
export const mapSlidersToHeroItems = mapSliderApiItemsToHeroItems;

// ---------------------------------------------------------------------------
// Contrat alternatif (exemple) — si le backend ne suit pas `SliderApiItem`
// ---------------------------------------------------------------------------

/**
 * Exemple de DTO « autre API » (noms de champs différents).
 * Brancher `mapLegacyHeroSliderRowToHeroItem` dans le service à la place du mapper principal si besoin.
 *
 * | Backend (exemple) | `HeroItem` |
 * |-------------------|------------|
 * | `_id` | `id` |
 * | `name` | `title` |
 * | `coverImage` | `image` (via `resolveEtablissementImageUrl`) |
 * | `cta_text` | `ctaLabel` |
 * | `location` | `location` (sous-titre visuel séparé dans le carrousel) |
 */
export type LegacyHeroSliderRow = {
  _id: string;
  name: string;
  coverImage?: string | null;
  cta_text?: string | null;
  location?: string | null;
};

/**
 * Mappe une ligne « legacy » vers `HeroItem` (sans passer par `SliderApiItem`).
 * Ici `subtitle` reste vide ; le lieu passe dans `location` comme sur le mock historique.
 */
export function mapLegacyHeroSliderRowToHeroItem(row: LegacyHeroSliderRow): HeroItem | null {
  const image = resolveEtablissementImageUrl(row.coverImage);
  if (!image) {
    return null;
  }

  const loc = row.location?.trim();

  return {
    id: String(row._id),
    title: row.name?.trim() || '—',
    subtitle: '',
    image,
    ctaLabel: row.cta_text?.trim() || 'Voir plus',
    badge: undefined,
    slug: undefined,
    type: 'slider',
    location: loc || undefined,
    buttonLink: undefined,
  };
}

export function mapLegacyHeroSliderRowsToHeroItems(rows: LegacyHeroSliderRow[]): HeroItem[] {
  return rows
    .map(mapLegacyHeroSliderRowToHeroItem)
    .filter((item): item is HeroItem => item !== null);
}
