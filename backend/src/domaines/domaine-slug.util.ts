/**
 * Slug URL-safe pour un domaine (aligné sur la logique mobile de catégorie).
 */
export function slugifyDomainNom(nom: string): string {
  const s = nom
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'domaine';
}
