import { isLocale } from "@/lib/i18n-config";
import { notFound, redirect } from "next/navigation";

/** Ancienne URL : redirige vers la gestion géographique. */
export default async function AdminLocationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}/admin/geographie`);
}
