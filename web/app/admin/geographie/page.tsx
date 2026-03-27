import { defaultLocale } from "@/lib/i18n-config";
import { redirect } from "next/navigation";

/** Redirection vers la route localisée réelle (`/[locale]/admin/geographie`). */
export default function AdminGeographieRootRedirect() {
  redirect(`/${defaultLocale}/admin/geographie`);
}
