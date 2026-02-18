// Section prestataires : titre, sous-titre, grille d’avantages, puis logos partenaires.
// Les logos sont listés dans lib/partner-logos.ts (facile à mettre à jour).

import type { CommonDictionary } from "@/lib/get-dictionary";
import { PARTNER_LOGOS } from "@/lib/partner-logos";

import { PartnerLogosRow } from "@/components/home/partner-logos-row";

type ProvidersSectionProps = {
  dict: Pick<CommonDictionary, "serviceProviders" | "features">;
};

export function ProvidersSection({ dict }: ProvidersSectionProps) {
  const items = [
    dict.features.findServices,
    dict.features.bookQuickly,
    dict.features.trustedProviders,
    dict.features.allInOne,
  ];

  return (
    <section aria-labelledby="providers-title">
      <div className="home-section">
        {/* Titre de section (dictionnaire) */}
        <h2 id="providers-title" className="home-section__title">
          {dict.serviceProviders.title}
        </h2>
        <p className="home-section__subtitle">{dict.serviceProviders.subtitle}</p>

        {/* Cartes « fonctionnalités » */}
        <div className="home-card-grid">
          {items.map((item) => (
            <article key={item.title} className="home-feature-card">
              <h3 className="home-feature-card__title">{item.title}</h3>
              <p className="home-feature-card__text">{item.description}</p>
            </article>
          ))}
        </div>

        {/* Logos partenaires (liste modifiable dans partner-logos.ts) */}
        <PartnerLogosRow logos={PARTNER_LOGOS} />
      </div>
    </section>
  );
}
