import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Page simple après connexion (à enrichir plus tard). */
export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
      <p className="mt-2 text-muted-foreground">
        Vous êtes connecté. Cette page pourra afficher le contenu protégé de l’application.
      </p>
    </div>
  );
}
