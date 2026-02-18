// Section héro de la page d’accueil.
//
// Hiérarchie HTML (de l’extérieur vers l’intérieur) :
//   section.home-hero
//     └─ div.home-section (marge + largeur max du site)
//          └─ div.home-hero__card (grande carte blanche arrondie)
//               └─ div.home-hero__card-inner (grille 2 colonnes sur écran large)
//                    ├─ div.home-hero__media (colonne gauche : image)
//                    └─ div.home-hero__copy (colonne droite : titre, texte, boutons)
//
// Les styles correspondants sont dans styles/_home.scss (préfixe home-hero__).

import Image from "next/image";
import Link from "next/link";

import type { CommonDictionary } from "@/lib/get-dictionary";

type HeroSectionProps = {
  dict: Pick<CommonDictionary, "appDownload">;
};

type AppDownloadCopy = CommonDictionary["appDownload"];

/** Petits blocs « Télécharger sur App Store / Google Play » — séparé pour lisibilité. */
function HeroStoreBadges({ copy }: { copy: AppDownloadCopy }) {
  return (
    <div className="home-hero__stores">
      <Link
        href="#"
        className="home-app-badge"
        aria-label={`${copy.appStoreSubtitle} ${copy.appStore}`}
      >
        <span className="home-app-badge__kicker">{copy.appStoreSubtitle}</span>
        <span className="home-app-badge__label">{copy.appStore}</span>
      </Link>
      <Link
        href="#"
        className="home-app-badge"
        aria-label={`${copy.googlePlaySubtitle} ${copy.googlePlay}`}
      >
        <span className="home-app-badge__kicker">{copy.googlePlaySubtitle}</span>
        <span className="home-app-badge__label">{copy.googlePlay}</span>
      </Link>
    </div>
  );
}

export function HeroSection({ dict }: HeroSectionProps) {
  const d = dict.appDownload;

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-section">
        <div className="home-hero__card">
          <div className="home-hero__card-inner">
            {/* Gauche : illustration (fichier dans /public/landing) */}
            <div className="home-hero__media">
              <div className="home-hero__media-frame">
                <div className="home-hero__visual">
                  <Image
                    src="/landing/globe.png"
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 768px) 90vw, 36vw"
                    className="home-hero__visual-img"
                  />
                </div>
              </div>
            </div>

            {/* Droite : message marketing + installation */}
            <div className="home-hero__copy">
              <h1 id="home-hero-title" className="home-hero__title">
                {d.title}
              </h1>
              <p className="home-hero__lead">{d.description}</p>
              <HeroStoreBadges copy={d} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
