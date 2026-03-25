# E-conciergerie — monorepo

Projet de fin d’études : **API NestJS**, **site Next.js** et **application React Native (Expo)** pour une plateforme de conciergerie et d’établissements.

## Structure

| Dossier    | Rôle                                      |
|-----------|--------------------------------------------|
| `backend` | API REST NestJS, MongoDB, JWT              |
| `web`     | Frontend Next.js (App Router), i18n       |
| `mobile`  | Client Expo (navigation, auth, listes)   |

## Démarrage rapide

1. **Backend** : copier `backend/.env.example` vers `backend/.env`, puis `npm install` et `npm run start:dev`.
2. **Web** : copier `web/.env.local.example` vers `web/.env.local`, puis `npm install` et `npm run dev`.
3. **Mobile** : définir `EXPO_PUBLIC_API_URL` (voir `mobile/.env.example`), puis `npm install` et `npm run start`.


## CI / GitHub Actions

Le fichier `.github/workflows/ci.yml` lance **trois jobs en parallèle** (backend, web, mobile) : installation `npm ci`, lint, tests (ou équivalent), puis build (ou `tsc` pour le mobile). Vous pouvez aussi déclencher la pipeline **manuellement** depuis GitHub : onglet **Actions** → workflow **CI - Validation monorepo** → **Run workflow**.
