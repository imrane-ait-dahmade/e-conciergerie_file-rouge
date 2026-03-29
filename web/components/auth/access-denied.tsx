"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type AccessDeniedReason = "forbidden" | "session-required";

type AccessDeniedProps = {
  locale: string;
  /** Titre court (tu peux brancher i18n plus tard). */
  title?: string;
  description?: string;
  /**
   * `forbidden` : connecté mais mauvais rôle pour cette zone.
   * `session-required` : pas de jeton (rare si pas de redirection login).
   */
  reason?: AccessDeniedReason;
};

const COPY: Record<
  AccessDeniedReason,
  { title: string; description: string }
> = {
  forbidden: {
    title: "Espace réservé",
    description:
      "Ce compte n’a pas accès à cette section. Utilisez un compte adapté (administrateur ou prestataire) ou revenez à l’accueil.",
  },
  "session-required": {
    title: "Connexion requise",
    description:
      "Vous devez être connecté pour accéder à cette page.",
  },
};

/**
 * Page / bloc « accès refusé » — l’API a toujours le dernier mot sur les droits réels.
 */
export function AccessDenied({
  locale,
  title,
  description,
  reason = "forbidden",
}: AccessDeniedProps) {
  const preset = COPY[reason];
  const finalTitle = title ?? preset.title;
  const finalDescription = description ?? preset.description;
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="max-w-md border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>{finalTitle}</CardTitle>
          <CardDescription>{finalDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Les droits affichés dans l’interface ne remplacent pas la sécurité du serveur :
            chaque action est revérifiée côté API.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}`}
            className={buttonVariants({ variant: "default" })}
          >
            Accueil
          </Link>
          <Link
            href={`/${locale}/login`}
            className={buttonVariants({ variant: "outline" })}
          >
            Connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
