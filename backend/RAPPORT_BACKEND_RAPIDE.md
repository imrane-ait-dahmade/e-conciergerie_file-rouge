# Rapport Backend E-Conciergerie — Vue rapide

**Date :** 24 mars 2025  
**Projet :** e-conciergerie_file-rouge  
**Dernière mise à jour :** Révision complète de l'existant

---

## 1. Stack technique

| Technologie | Version |
|-------------|---------|
| **Framework** | NestJS 11 |
| **Langage** | TypeScript 5.7 |
| **Base de données** | MongoDB (Mongoose 9.x) |
| **Auth** | JWT (access + refresh) via Passport.js |
| **Validation** | class-validator + Joi (config) |
| **Documentation** | Swagger @ `/api/docs` |
| **Sécurité** | Helmet, Throttler (rate limiting), CORS |

---

## 2. Modules actifs

| Module | État | Description |
|--------|------|-------------|
| **Auth** | Complet | Signup, login, refresh, logout, forgot/reset password, verify email |
| **Users** | Actif | Création, login (legacy), profil protégé JWT |
| **Etablissements** | Complet | CRUD avec auth (création/modif/suppression protégées) |
| **Roles** | Squelette | Contrôleur vide |
| **Pays** | Squelette | Contrôleur vide |
| **Villes** | Squelette | Contrôleur vide |
| **Quartiers** | Squelette | Contrôleur vide |
| **Mail** | Actif | Envoi d’emails (vérification, reset mot de passe) |
| **Config** | Actif | Variables d’environnement (Joi validation) |

---

## 3. API REST — Endpoints principaux

### Auth (`/auth`)

| Méthode | Chemin | Auth | Description |
|---------|--------|------|-------------|
| POST | `/auth/login` | Non | Connexion → `access_token` + `refresh_token` |
| POST | `/auth/signup` | Non | Inscription + email de vérification |
| POST | `/auth/verify-email` | Non | Vérification email (token) |
| POST | `/auth/forgot-password` | Non | Envoi lien reset |
| POST | `/auth/reset-password` | Non | Réinitialisation mot de passe |
| POST | `/auth/refresh-token` | Non | Nouvelle paire de tokens |
| POST | `/auth/logout` | **JWT** | Invalide refresh token |

### Users (`/users`)

| Méthode | Chemin | Auth | Description |
|---------|--------|------|-------------|
| POST | `/users/create` | Non | Création utilisateur (legacy) |
| POST | `/users/login` | Non | Login simple (legacy) |
| GET | `/users/profile` | **JWT** | Profil utilisateur complet |

### Établissements (`/etablissements`)

| Méthode | Chemin | Auth | Description |
|---------|--------|------|-------------|
| POST | `/etablissements` | **JWT** | Création (prestataire = current user) |
| GET | `/etablissements` | Non | Liste publique |
| GET | `/etablissements/:id` | Non | Détail public |
| PUT | `/etablissements/:id` | **JWT** | Mise à jour (owner ou admin) |
| DELETE | `/etablissements/:id` | **JWT** | Suppression (owner ou admin) |

---

## 4. Sécurité

- **JWT** : access token + refresh token avec rotation
- **Rate limiting** : 100 req/min par défaut, 10 req/min sur les endpoints Auth
- **Helmet** : en-têtes HTTP sécurisés
- **Validation** : `whitelist`, `forbidNonWhitelisted`, `transform` sur les DTOs

---

## 5. Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `MONGODB_URI` | Oui | Chaîne de connexion MongoDB |
| `JWT_ACCESS_SECRET` | Oui | Secret pour les access tokens |
| `JWT_REFRESH_SECRET` | Oui | Secret pour les refresh tokens |
| `PORT` | Non | Port serveur (défaut : 3000) |
| `FRONTEND_URL` | Non | Origine CORS autorisée |

---

## 6. Commandes NPM

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Serveur en mode watch |
| `npm run build` | Compilation TypeScript |
| `npm run start:prod` | Production |
| `npm run test` | Tests unitaires Jest |
| `npm run test:e2e` | Tests E2E |

---

## 7. Points d’attention

- **Doublon auth** : `/users/login` vs `/auth/login` — préférer Auth
- **Référentiels** : Pays, Villes, Quartiers non implémentés (CRUD vides)
- **Swagger** : Documentation disponible sur `/api/docs`

---

## 8. Résumé

Backend NestJS 11 opérationnel avec authentification JWT complète (signup, login, refresh, email verification, reset password), CRUD établissements protégé, documentation Swagger et sécurisation (Helmet, Throttler). Les référentiels géographiques et le module Roles restent à implémenter.
