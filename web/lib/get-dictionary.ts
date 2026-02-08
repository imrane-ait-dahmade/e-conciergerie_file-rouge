import { cache } from "react";
import { readFile } from "fs/promises";
import path from "path";
import type { Locale } from "./i18n-config";
import { defaultLocale, isLocale } from "./i18n-config";

/** Keys mirror public/locales/<locale>/common.json */
export type CommonDictionary = {
  brand: string;
  login: string;
  register: string;
  footer: {
    tagline: string;
    contact: string;
    privacy: string;
    terms: string;
    rights: string;
    /** Titre du bloc réseaux sociaux (ex. « Suivez-nous ») */
    socialTitle: string;
    /** Ligne du compte / handle (ex. @econciergerie) */
    socialHandle: string;
  };
  appDownload: {
    title: string;
    description: string;
    appStore: string;
    appStoreSubtitle: string;
    googlePlay: string;
    googlePlaySubtitle: string;
  };
  establishmentOffer: {
    /** Titre fort (question / accroche) */
    heading: string;
    /** Ligne avant le prix (ex. « Abonne-toi pour seulement ») */
    lead: string;
    /** Montant mis en avant (ex. « 99 dh ») */
    price: string;
    /** Précision période (ex. « par an ») */
    pricePeriod: string;
    button: string;
  };
  serviceProviders: {
    title: string;
    subtitle: string;
  };
  trust: {
    title: string;
    subtitle: string;
  };
  features: {
    title: string;
    subtitle: string;
    findServices: { title: string; description: string };
    bookQuickly: { title: string; description: string };
    trustedProviders: { title: string; description: string };
    allInOne: { title: string; description: string };
  };
  landingCta: {
    title: string;
    description: string;
  };
  /** Textes page de connexion */
  loginPage: {
    title: string;
    description: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    submitting: string;
    errorTitle: string;
    signupPrompt: string;
    signupCta: string;
  };
  /** Textes page d’inscription */
  signupPage: {
    title: string;
    description: string;
    nomLabel: string;
    prenomLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    submit: string;
    submitting: string;
    errorTitle: string;
    /** Message si mot de passe et confirmation diffèrent */
    passwordMismatch: string;
    /** Erreur générique (API) */
    signupError: string;
    successTitle: string;
    successMessage: string;
    loginPrompt: string;
    loginCta: string;
  };
};

const DEFAULT_COMMON_DICTIONARY: CommonDictionary = {
  brand: "E-conciergerie",
  login: "connexion",
  register: "Inscription",
  footer: {
    tagline: "Votre plateforme digitale pour simplifier votre quotidien au Maroc.",
    contact: "Contact",
    privacy: "Confidentialite",
    terms: "Conditions",
    rights: "{year} E-conciergerie. Tous droits reserves.",
    socialTitle: "Follow us",
    socialHandle: "@econciergerie",
  },
  appDownload: {
    title: "Votre concierge digital, partout au Maroc",
    description:
      "e_conciergerie.ma est bien plus qu'une simple plateforme - votre passerelle numerique vers le meilleur du Maroc.",
    appStore: "App Store",
    appStoreSubtitle: "Telecharger sur",
    googlePlay: "Google Play",
    googlePlaySubtitle: "Installer l'app",
  },
  establishmentOffer: {
    heading: "Do you run an establishment?",
    lead: "Subscribe for only",
    price: "99 MAD",
    pricePeriod: "per year",
    button: "Subscribe now and publish your service",
  },
  serviceProviders: {
    title: "Best Service Providers",
    subtitle: "Options les plus populaires parmi les voyageurs habitant au Maroc",
  },
  trust: {
    title: "Trusted by leading brands",
    subtitle: "Join thousands who rely on our network across Morocco.",
  },
  features: {
    title: "Built for everyday convenience",
    subtitle: "Everything you need to find, book, and enjoy trusted services.",
    findServices: {
      title: "Find services easily",
      description: "Browse categories and discover providers near you in a few taps.",
    },
    bookQuickly: {
      title: "Book quickly",
      description: "Request a slot and confirm details without the back-and-forth.",
    },
    trustedProviders: {
      title: "Trusted providers",
      description: "Work with vetted partners chosen for quality and reliability.",
    },
    allInOne: {
      title: "All in one place",
      description: "Track requests, messages, and updates from a single app.",
    },
  },
  landingCta: {
    title: "Download the app",
    description: "Get E-conciergerie on your phone and carry Morocco’s best services in your pocket.",
  },
  loginPage: {
    title: "Sign in",
    description: "Enter your email and password to access your account.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    errorTitle: "Could not sign in",
    signupPrompt: "No account yet?",
    signupCta: "Create an account",
  },
  signupPage: {
    title: "Create an account",
    description:
      "Choose a strong password: uppercase, lowercase, number, special character, at least 8 characters.",
    nomLabel: "Last name",
    prenomLabel: "First name",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    submit: "Sign up",
    submitting: "Signing up…",
    errorTitle: "Could not sign up",
    passwordMismatch: "Passwords do not match.",
    signupError: "Sign up failed",
    successTitle: "Success",
    successMessage: "Account created. Redirecting to sign in…",
    loginPrompt: "Already have an account?",
    loginCta: "Sign in",
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asFeatureItem(
  value: unknown,
  fallback: { title: string; description: string }
): { title: string; description: string } {
  const r = asRecord(value);
  return {
    title: asString(r.title, fallback.title),
    description: asString(r.description, fallback.description),
  };
}

function normalizeDictionary(value: unknown): CommonDictionary {
  const root = asRecord(value);
  const footer = asRecord(root.footer);
  const appDownload = asRecord(root.appDownload);
  const establishmentOffer = asRecord(root.establishmentOffer);
  const serviceProviders = asRecord(root.serviceProviders);
  const trust = asRecord(root.trust);
  const features = asRecord(root.features);
  const landingCta = asRecord(root.landingCta);
  const loginPage = asRecord(root.loginPage);
  const signupPage = asRecord(root.signupPage);

  return {
    brand: asString(root.brand, DEFAULT_COMMON_DICTIONARY.brand),
    login: asString(root.login, DEFAULT_COMMON_DICTIONARY.login),
    register: asString(root.register, DEFAULT_COMMON_DICTIONARY.register),
    footer: {
      tagline: asString(footer.tagline, DEFAULT_COMMON_DICTIONARY.footer.tagline),
      contact: asString(footer.contact, DEFAULT_COMMON_DICTIONARY.footer.contact),
      privacy: asString(footer.privacy, DEFAULT_COMMON_DICTIONARY.footer.privacy),
      terms: asString(footer.terms, DEFAULT_COMMON_DICTIONARY.footer.terms),
      rights: asString(footer.rights, DEFAULT_COMMON_DICTIONARY.footer.rights),
      socialTitle: asString(
        footer.socialTitle,
        DEFAULT_COMMON_DICTIONARY.footer.socialTitle
      ),
      socialHandle: asString(
        footer.socialHandle,
        DEFAULT_COMMON_DICTIONARY.footer.socialHandle
      ),
    },
    appDownload: {
      title: asString(
        appDownload.title,
        DEFAULT_COMMON_DICTIONARY.appDownload.title
      ),
      description: asString(
        appDownload.description,
        DEFAULT_COMMON_DICTIONARY.appDownload.description
      ),
      appStore: asString(
        appDownload.appStore,
        DEFAULT_COMMON_DICTIONARY.appDownload.appStore
      ),
      appStoreSubtitle: asString(
        appDownload.appStoreSubtitle,
        DEFAULT_COMMON_DICTIONARY.appDownload.appStoreSubtitle
      ),
      googlePlay: asString(
        appDownload.googlePlay,
        DEFAULT_COMMON_DICTIONARY.appDownload.googlePlay
      ),
      googlePlaySubtitle: asString(
        appDownload.googlePlaySubtitle,
        DEFAULT_COMMON_DICTIONARY.appDownload.googlePlaySubtitle
      ),
    },
    establishmentOffer: {
      heading: asString(
        establishmentOffer.heading,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.heading
      ),
      lead: asString(
        establishmentOffer.lead,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.lead
      ),
      price: asString(
        establishmentOffer.price,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.price
      ),
      pricePeriod: asString(
        establishmentOffer.pricePeriod,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.pricePeriod
      ),
      button: asString(
        establishmentOffer.button,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.button
      ),
    },
    serviceProviders: {
      title: asString(
        serviceProviders.title,
        DEFAULT_COMMON_DICTIONARY.serviceProviders.title
      ),
      subtitle: asString(
        serviceProviders.subtitle,
        DEFAULT_COMMON_DICTIONARY.serviceProviders.subtitle
      ),
    },
    trust: {
      title: asString(trust.title, DEFAULT_COMMON_DICTIONARY.trust.title),
      subtitle: asString(trust.subtitle, DEFAULT_COMMON_DICTIONARY.trust.subtitle),
    },
    features: {
      title: asString(features.title, DEFAULT_COMMON_DICTIONARY.features.title),
      subtitle: asString(features.subtitle, DEFAULT_COMMON_DICTIONARY.features.subtitle),
      findServices: asFeatureItem(
        features.findServices,
        DEFAULT_COMMON_DICTIONARY.features.findServices
      ),
      bookQuickly: asFeatureItem(
        features.bookQuickly,
        DEFAULT_COMMON_DICTIONARY.features.bookQuickly
      ),
      trustedProviders: asFeatureItem(
        features.trustedProviders,
        DEFAULT_COMMON_DICTIONARY.features.trustedProviders
      ),
      allInOne: asFeatureItem(features.allInOne, DEFAULT_COMMON_DICTIONARY.features.allInOne),
    },
    landingCta: {
      title: asString(landingCta.title, DEFAULT_COMMON_DICTIONARY.landingCta.title),
      description: asString(
        landingCta.description,
        DEFAULT_COMMON_DICTIONARY.landingCta.description
      ),
    },
    loginPage: {
      title: asString(loginPage.title, DEFAULT_COMMON_DICTIONARY.loginPage.title),
      description: asString(
        loginPage.description,
        DEFAULT_COMMON_DICTIONARY.loginPage.description
      ),
      emailLabel: asString(
        loginPage.emailLabel,
        DEFAULT_COMMON_DICTIONARY.loginPage.emailLabel
      ),
      passwordLabel: asString(
        loginPage.passwordLabel,
        DEFAULT_COMMON_DICTIONARY.loginPage.passwordLabel
      ),
      submit: asString(loginPage.submit, DEFAULT_COMMON_DICTIONARY.loginPage.submit),
      submitting: asString(
        loginPage.submitting,
        DEFAULT_COMMON_DICTIONARY.loginPage.submitting
      ),
      errorTitle: asString(
        loginPage.errorTitle,
        DEFAULT_COMMON_DICTIONARY.loginPage.errorTitle
      ),
      signupPrompt: asString(
        loginPage.signupPrompt,
        DEFAULT_COMMON_DICTIONARY.loginPage.signupPrompt
      ),
      signupCta: asString(
        loginPage.signupCta,
        DEFAULT_COMMON_DICTIONARY.loginPage.signupCta
      ),
    },
    signupPage: {
      title: asString(signupPage.title, DEFAULT_COMMON_DICTIONARY.signupPage.title),
      description: asString(
        signupPage.description,
        DEFAULT_COMMON_DICTIONARY.signupPage.description
      ),
      nomLabel: asString(
        signupPage.nomLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.nomLabel
      ),
      prenomLabel: asString(
        signupPage.prenomLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.prenomLabel
      ),
      emailLabel: asString(
        signupPage.emailLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.emailLabel
      ),
      passwordLabel: asString(
        signupPage.passwordLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.passwordLabel
      ),
      confirmPasswordLabel: asString(
        signupPage.confirmPasswordLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.confirmPasswordLabel
      ),
      submit: asString(signupPage.submit, DEFAULT_COMMON_DICTIONARY.signupPage.submit),
      submitting: asString(
        signupPage.submitting,
        DEFAULT_COMMON_DICTIONARY.signupPage.submitting
      ),
      errorTitle: asString(
        signupPage.errorTitle,
        DEFAULT_COMMON_DICTIONARY.signupPage.errorTitle
      ),
      passwordMismatch: asString(
        signupPage.passwordMismatch,
        DEFAULT_COMMON_DICTIONARY.signupPage.passwordMismatch
      ),
      signupError: asString(
        signupPage.signupError,
        DEFAULT_COMMON_DICTIONARY.signupPage.signupError
      ),
      successTitle: asString(
        signupPage.successTitle,
        DEFAULT_COMMON_DICTIONARY.signupPage.successTitle
      ),
      successMessage: asString(
        signupPage.successMessage,
        DEFAULT_COMMON_DICTIONARY.signupPage.successMessage
      ),
      loginPrompt: asString(
        signupPage.loginPrompt,
        DEFAULT_COMMON_DICTIONARY.signupPage.loginPrompt
      ),
      loginCta: asString(
        signupPage.loginCta,
        DEFAULT_COMMON_DICTIONARY.signupPage.loginCta
      ),
    },
  };
}

async function tryReadCommonFromBase(
  basePath: string,
  locale: Locale
): Promise<CommonDictionary | null> {
  try {
    const file = path.join(basePath, locale, "common.json");
    const raw = await readFile(file, "utf-8");
    return normalizeDictionary(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

async function readCommon(locale: Locale): Promise<CommonDictionary> {
  const bases = [
    path.join(process.cwd(), "public", "locales"),
    path.join(process.cwd(), "web", "public", "locales"),
  ];

  for (const base of bases) {
    const dictionary = await tryReadCommonFromBase(base, locale);
    if (dictionary) return dictionary;
  }

  if (locale !== defaultLocale) {
    return readCommon(defaultLocale);
  }

  return DEFAULT_COMMON_DICTIONARY;
}

async function loadDictionary(locale: string): Promise<CommonDictionary> {
  const safe = isLocale(locale) ? locale : defaultLocale;
  return readCommon(safe);
}

/**
 * Loads UI strings for a locale (server-only).
 * In production we cache lookups; in development we read fresh values.
 */
export const getDictionary =
  process.env.NODE_ENV === "production"
    ? cache(loadDictionary)
    : loadDictionary;
