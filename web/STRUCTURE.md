# Arborescence du frontend Next.js (e-conciergerie)

Vue d’ensemble pour un débutant (équivalent Laravel : `routes/` + `resources/views/` + `public/`).

```
web/
├── app/                          # App Router : une URL = un dossier (comme des routes)
│   ├── layout.tsx                # Layout racine : <html>, polices, import globals.css / globals.scss
│   ├── page.tsx                  # Route « / » : redirige vers la langue par défaut (/fr)
│   ├── globals.css               # Tailwind v4 + thème shadcn (ne pas mettre dans un .scss Sass)
│   ├── globals.scss              # Point d’entrée SCSS : @use des partials + reset léger
│   ├── favicon.ico
│   ├── login/
│   │   ├── layout.tsx            # Même header que l’accueil pour /login (sans /fr dans l’URL)
│   │   └── page.tsx              # Page connexion
│   ├── signup/
│   │   ├── layout.tsx            # Idem pour /signup
│   │   └── page.tsx              # Page inscription
│   └── [locale]/                 # Segments dynamiques : /fr, /en, /ar…
│       ├── layout.tsx            # Header + <main> pour toutes les pages sous /{locale}
│       ├── page.tsx              # Accueil (home)
│       ├── login/page.tsx        # Connexion avec préfixe de langue
│       ├── signup/page.tsx
│       └── dashboard/page.tsx    # Exemple page après login
│
├── components/
│   ├── layout/
│   │   └── header.tsx            # Barre du haut (logo, langue, liens auth) — réutilisable
│   ├── home/
│   │   ├── hero-section.tsx      # Bloc héro de la home
│   │   ├── subscription-section.tsx
│   │   ├── providers-section.tsx
│   │   └── social-section.tsx
│   ├── auth/
│   │   ├── login-form.tsx        # Formulaire client + appel API
│   │   └── signup-form.tsx
│   └── ui/                       # Composants shadcn (Button, Card, Input…)
│
├── styles/                       # SCSS partagé (design system)
│   ├── _variables.scss           # Couleurs, espacements, rayons, typo (tokens)
│   ├── _mixins.scss             # Helpers (container, media queries…)
│   ├── _home.scss               # Styles header + sections d’accueil
│   └── _auth-theme.scss         # Fond dégradé + carte login/signup
│
├── lib/                          # Code sans UI (comme app/Services ou app/Helpers)
│   ├── api.ts                    # Client HTTP vers NestJS (login, signup)
│   ├── auth-storage.ts          # localStorage token (temporaire)
│   ├── i18n-config.ts           # Locales supportées
│   ├── get-dictionary.ts        # Chaînes i18n (fichiers JSON)
│   └── utils.ts                 # cn() pour Tailwind / shadcn
│
├── public/                       # Fichiers statiques servis tels quels
│   └── locales/                # JSON par langue (fr, en, ar…)
│
├── middleware.ts                 # Redirections / locale dans l’URL
├── components.json               # Config shadcn CLI
├── next.config.ts
├── package.json
└── .env.local.example            # Modèle pour NEXT_PUBLIC_API_URL
```

## Rôles rapides

| Zone | Rôle |
|------|------|
| **`app/`** | Définit les **URLs** et les **layouts** (pages imbriquées comme des layouts Blade). |
| **`components/layout/`** | Éléments de structure (header, futur footer). |
| **`components/home/`** | **Sections** de la page d’accueil uniquement. |
| **`components/auth/`** | **Formulaires** login / signup (souvent `"use client"`). |
| **`components/ui/`** | **shadcn** : briques de base, peu modifiées à la main. |
| **`styles/`** | **Design system SCSS** : variables + blocs par zone (home, auth). |
| **`lib/`** | **Logique réutilisable** : API, i18n, utilitaires. |
| **`public/`** | Images, JSON de traduction, etc. |

## Où placer quoi ?

- **Nouvelle section sur la home** → `components/home/` + styles dans `_home.scss` si besoin.
- **Changement de couleurs globales** → `styles/_variables.scss`.
- **Nouvel appel API** → `lib/api.ts` (ou petit module dédié plus tard).
- **Page entière nouvelle** → `app/[locale]/nom-de-la-route/page.tsx`.
