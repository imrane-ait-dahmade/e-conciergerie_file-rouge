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

## Historique Git (reconstruction locale)

Pour régénérer un historique propre avec des dates espacées, exécuter depuis la racine du dépôt :

```bash
bash replay-full-history.sh
```

**Attention** : ce script supprime l’historique Git local (dossier `.git`) et recrée des commits datés. Sauvegarder ou pousser vos branches avant de l’exécuter.

## CI / GitHub Actions

Le fichier `.github/workflows/ci.yml` lance **trois jobs en parallèle** (backend, web, mobile) : installation `npm ci`, lint, tests (ou équivalent), puis build (ou `tsc` pour le mobile). Vous pouvez aussi déclencher la pipeline **manuellement** depuis GitHub : onglet **Actions** → workflow **CI - Validation monorepo** → **Run workflow**.

## Présentation type soutenance (résumé)

- **Historique Git** : monorepo avec commits datés et messages clairs ; reconstruction possible avec `bash replay-full-history.sh` (à n’utiliser qu’en ayant sauvegardé le dépôt).
- **`.gitignore`** : à la racine et dans chaque app — on ne versionne pas les secrets (`.env`), ni `node_modules`, ni dossiers de build.
- **CI** : contrôle automatique de la qualité à chaque push/PR ; ce n’est **pas** un déploiement en production (pas de CD dans ce fichier).
