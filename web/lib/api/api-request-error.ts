/**
 * Erreur API avec messages bruts (ex. tableau NestJS ValidationPipe).
 * Permet d’afficher des erreurs sous les champs du formulaire.
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly messages: string[] = [],
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/** Associe des messages texte du backend aux noms de champs connus. */
export function matchBackendMessagesToFields(
  messages: string[],
): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const m of messages) {
    const lower = m.toLowerCase();
    if (
      lower.includes("latitude") &&
      !out.latitude
    ) {
      out.latitude = m;
    } else if (
      lower.includes("longitude") &&
      !out.longitude
    ) {
      out.longitude = m;
    } else if (
      (lower.includes("adresse") || lower.includes("address")) &&
      !out.adresse
    ) {
      out.adresse = m;
    } else if (
      lower.includes("location_label") &&
      !out.location_label
    ) {
      out.location_label = m;
    } else if (
      lower.includes("location_type") &&
      !out.location_type
    ) {
      out.location_type = m;
    }
  }
  return out;
}
