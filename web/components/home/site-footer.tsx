// Pied de page de la page d’accueil : confiance, bloc réseaux sociaux (titre + icônes + handle), liens, copyright.
// Les icônes viennent de lucide-react (simple : un composant par réseau).

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, type LucideIcon } from "lucide-react";

import type { CommonDictionary } from "@/lib/get-dictionary";

type SiteFooterProps = {
  dict: Pick<CommonDictionary, "footer" | "trust">;
};

// Liste des liens sociaux : remplace href="#" par les vraies URLs des profils.
const SOCIAL_LINKS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "#", label: "Facebook", Icon: Facebook },
  { href: "#", label: "Instagram", Icon: Instagram },
  { href: "#", label: "X (Twitter)", Icon: Twitter },
];

export function SiteFooter({ dict }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const rights = dict.footer.rights.replace("{year}", String(year));
  const f = dict.footer;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {/* Bloc confiance : textes + logos partenaires */}
        <div className="site-footer__trust">
          <h2 className="home-section__title home-section__title--center">{dict.trust.title}</h2>
          <p className="home-section__subtitle home-section__subtitle--center">{dict.trust.subtitle}</p>
          <div className="site-footer__trust-logos">
            <Image
              src="/landing/marjane.png"
              alt="Marjane"
              width={160}
              height={48}
              className="site-footer__trust-logo"
            />
            <div className="home-trust-placeholder" aria-hidden />
            <div className="home-trust-placeholder" aria-hidden />
            <div className="home-trust-placeholder" aria-hidden />
          </div>
        </div>

        {/* Bloc réseaux sociaux : titre + rangée d’icônes + @ du compte */}
        <section
          className="site-footer__social-section"
          aria-labelledby="footer-social-heading"
        >
          <h2 id="footer-social-heading" className="site-footer__social-title">
            {f.socialTitle}
          </h2>
          <ul className="site-footer__social-links">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} className="site-footer__social-btn" aria-label={label}>
                  <Icon className="size-5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="site-footer__social-handle">{f.socialHandle}</p>
        </section>

        <p className="site-footer__tagline">{f.tagline}</p>

        <nav className="site-footer__links" aria-label="Liens pied de page">
          <Link href="#" className="site-footer__link">
            {f.contact}
          </Link>
          <Link href="#" className="site-footer__link">
            {f.privacy}
          </Link>
          <Link href="#" className="site-footer__link">
            {f.terms}
          </Link>
        </nav>

        <p className="site-footer__rights">{rights}</p>
      </div>
    </footer>
  );
}
