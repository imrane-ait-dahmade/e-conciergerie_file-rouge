// Rangée de logos partenaires — réutilisable ; la liste vient de lib/partner-logos.ts.

import Image from "next/image";

import type { PartnerLogo } from "@/lib/partner-logos";

type PartnerLogosRowProps = {
  logos: PartnerLogo[];
  /** Classe optionnelle sur le conteneur (ex. marge) */
  className?: string;
};

export function PartnerLogosRow({ logos, className }: PartnerLogosRowProps) {
  return (
    <div className={["home-partners", className].filter(Boolean).join(" ")}>
      <ul className="home-partners__row" role="list">
        {logos.map((logo) => {
          const isSvg = logo.src.endsWith(".svg");
          return (
            <li key={logo.id} className="home-partners__item">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={160}
                height={48}
                className="home-partners__logo"
                sizes="(max-width: 640px) 40vw, 140px"
                unoptimized={isSvg}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
