/** Extrait `_id` ou `id` d’une réponse JSON Nest/Mongoose. */
export function extractDocumentId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as { _id?: unknown; id?: unknown };
  const id = o._id ?? o.id;
  if (typeof id === "string" && id.length > 0) return id;
  return null;
}
