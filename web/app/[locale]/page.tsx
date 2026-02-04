import { HeroSection } from "@/components/home/hero-section";
import { ProvidersSection } from "@/components/home/providers-section";
import { SiteFooter } from "@/components/home/site-footer";
import { SubscriptionSection } from "@/components/home/subscription-section";
import { getDictionary } from "@/lib/get-dictionary";
import { isLocale } from "@/lib/i18n-config";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Page d’accueil : sections assemblées comme une vue Laravel avec partials. */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <>
      <HeroSection dict={{ appDownload: dict.appDownload }} />
      <SubscriptionSection locale={locale} dict={{ establishmentOffer: dict.establishmentOffer }} />
      <ProvidersSection
        dict={{ serviceProviders: dict.serviceProviders, features: dict.features }}
      />
      <SiteFooter dict={{ footer: dict.footer, trust: dict.trust }} />
    </>
  );
}
