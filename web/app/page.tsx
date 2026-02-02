// Racine du site : le middleware redirige souvent déjà vers /fr — ce fichier couvre le cas direct.
import { defaultLocale } from "@/lib/i18n-config";
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
