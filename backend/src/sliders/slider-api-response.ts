/** Enveloppe JSON commune pour l’API admin sliders (consommation web/mobile). */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function apiSuccess<T>(message: string, data: T) {
  return { success: true as const, message, data };
}

export function apiListSuccess<T>(message: string, data: T[], meta: PaginationMeta) {
  return { success: true as const, message, data, meta };
}
