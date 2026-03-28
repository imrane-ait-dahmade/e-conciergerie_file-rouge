import type { MongoRef } from "@/lib/types/catalog";

/** Affiche un nom lisible pour une référence peuplée ou un id brut. */
export function displayRefName(ref: MongoRef | string | null | undefined): string {
  if (ref == null) return "—";
  if (typeof ref === "string") return ref;
  return ref.nom ?? ref._id;
}
