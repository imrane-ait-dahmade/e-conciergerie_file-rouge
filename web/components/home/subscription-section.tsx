// Section « abonnement établissement » : carte arrondie, visuel à gauche, texte + prix + CTA à droite.
// Les couleurs et espacements viennent des variables SCSS (styles/_home.scss + _variables.scss).

import Image from "next/image";
import Link from "next/link";

import type { CommonDictionary } from "@/lib/get-dictionary";

export type EstablishmentOfferCopy = CommonDictionary["establishmentOffer"];

type SubscriptionSectionProps = {
  locale: string;
  dict: Pick<CommonDictionary, "establishmentOffer">;
};

/**
 * Affiche l’offre (textes traduits). Séparé du layout pour pouvoir réutiliser les mêmes chaînes ailleurs.
 */
function SubscriptionOfferText({ offer }: { offer: EstablishmentOfferCopy }) {
  return (
    <>
      <h2 id="subscription-title" className="home-subscription__heading">
        {offer.heading}
      </h2>
      <p className="home-subscription__lead">{offer.lead}</p>
      <div className="home-subscription__price-row" aria-label={`${offer.price} ${offer.pricePeriod}`}>
        <span className="home-subscription__price">{offer.price}</span>
        <span className="home-subscription__period">{offer.pricePeriod}</span>
      </div>
    </>
  );
}

export function SubscriptionSection({ locale, dict }: SubscriptionSectionProps) {
  const offer = dict.establishmentOffer;
  const signupHref = `/${locale}/signup`;

  return (
    <section className="home-subscription" aria-labelledby="subscription-title">
      <div className="home-section">
        <div className="home-subscription__card">
          <div className="home-subscription__card-inner">
            {/* Colonne visuelle : illustration fournie dans /public/landing */}
            <div className="home-subscription__media">
              <div className="home-subscription__visual">
                <Image
                  src="/landing/subscription.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="home-subscription__visual-img"
                />
              </div>
            </div>

            {/* Colonne texte : accroche, prix annuel mis en avant, bouton d’action */}
            <div className="home-subscription__content">
              <SubscriptionOfferText offer={offer} />
              <Link href={signupHref} className="home-subscription__cta">
                {offer.button}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
