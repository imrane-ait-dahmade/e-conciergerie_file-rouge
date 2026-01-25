# Rapport détaillé – Backend E-Conciergerie

**Date :** 24 mars 2025  
**Projet :** e-conciergerie_file-rouge  
**Répertoire :** `backend/`

---

## 1. Vue d'ensemble

| Élément | Détail |
|---------|--------|
| **Framework** | NestJS 11 |
| **Langage** | TypeScript 5.7 |
| **Base de données** | MongoDB (Mongoose 9.x) |
| **Authentification** | JWT via Passport.js |
| **Validation** | class-validator |
| **Port par défaut** | 3000 |

### Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Serveur en mode watch (développement) |
| `npm run start` | Serveur standard |
| `npm run start:prod` | Production (exécution de `dist/main`) |
| `npm run build` | Compilation TypeScript |
| `npm run test` | Tests unitaires Jest |
| `npm run test:e2e` | Tests end-to-end |

---

## 2. Structure des modules

```
backend/src/
├── main.ts                 # Point d'entrée, ValidationPipe global
├── app.module.ts           # Agrégation des modules
├── app.controller.ts       # Route racine GET /
├── app.service.ts         # Service racine (getHello)
│
├── users/                  # Gestion utilisateurs
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── login_user.dto.ts
│   └── schemas/
│       └── user.schema.ts
│
├── auth/                   # Authentification JWT
│   ├── auth.controller.ts  # Vide
│   ├── auth.service.ts     # Vide
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── roles.decorator.ts
│   └── roles.guard.ts
│
├── roles/                  # Rôles (module squelette)
│   ├── roles.controller.ts # Vide
│   ├── roles.service.ts    # Vide
│   └── schemas/
│       └── role.schema.ts
│
├── etablissements/        # CRUD établissements
│   ├── etablissements.controller.ts
│   ├── etablissements.service.ts
│   ├── etablissements.module.ts
│   ├── dto/
│   │   ├── create-etablissement.dto.ts
│   │   └── update-etablissement.dto.ts
│   └── schemas/
│       └── etablissement.schema.ts
│
├── pays/                   # Référentiel pays (squelette)
├── villes/                 # Référentiel villes (squelette)
└── quartiers/             # Référentiel quartiers (squelette)
```

---

## 3. API REST exposée

### 3.1 Racine

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `/` | Message de bienvenue (AppService.getHello) |

### 3.2 Utilisateurs (`/users`)

| Méthode | Chemin | Auth | Description |
|---------|--------|------|-------------|
| POST | `/users/create` | Non | Inscription d'un utilisateur |
| POST | `/users/login` | Non | Connexion → `{ access_token: string }` |
| GET | `/users/profile` | **JWT** | Profil utilisateur (données JWT uniquement) |

### 3.3 Établissements (`/etablissements`)

| Méthode | Chemin | Auth | Description |
|---------|--------|------|-------------|
| POST | `/etablissements` | Non | Création d'un établissement |
| GET | `/etablissements` | Non | Liste de tous les établissements |
| GET | `/etablissements/:id` | Non | Détail d'un établissement |
| PUT | `/etablissements/:id` | Non | Mise à jour |
| DELETE | `/etablissements/:id` | Non | Suppression |

### 3.4 Préfixes sans routes

- `/auth` — contrôleur vide
- `/roles` — contrôleur vide
- `/pays` — contrôleur vide
- `/villes` — contrôleur vide
- `/quartiers` — contrôleur vide

---

## 4. Modèles MongoDB (Schémas)

### 4.1 User

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| nom | string | ✓ | Nom de famille |
| prenom | string | ✓ | Prénom |
| email | string | ✓ (unique) | Adresse email |
| password | string | ✓ | Mot de passe (hashé bcrypt) |
| role | ObjectId | - | Référence vers Role |
| telephone | string | - | Numéro de téléphone |
| adresse | string | - | Adresse postale |
| lantitude | number | - | Faute de frappe : « latitude » |
| longitude | number | - | Coordonnée |
| isActive | boolean | - | Compte actif |
| profilePicture | string | - | URL avatar |
| createdAt | Date | - | Date de création |
| updatedAt | Date | - | Date de mise à jour |

### 4.2 Role

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| name | string | ✓ (unique) | Nom du rôle |
| createdAt | Date | - | Date de création |
| updatedAt | Date | - | Date de mise à jour |

**Note :** Le schéma `Role` n’est pas exporté correctement (`RoleSchema` manquant) et n’est pas enregistré dans `MongooseModule`.

### 4.3 Etablissement

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| nom | string | ✓ | Nom de l’établissement |
| adresse | string | - | Adresse |
| latitude | number | - | Latitude |
| longitude | number | - | Longitude |
| prestataire | ObjectId | ✓ | Référence vers User |
| pays | ObjectId | - | Référence vers Pays |
| ville | ObjectId | - | Référence vers Ville |
| quartier | ObjectId | - | Référence vers Quartier |
| description | string | - | Description |
| image | string | - | URL image |
| telephone | string | - | Téléphone |
| email | string | - | Email |
| isActive | boolean | - | Actif/inactif |
| createdAt | Date | - | Date de création |
| updatedAt | Date | - | Date de mise à jour |

**Résolution flexible :** Les champs `pays`, `ville`, `quartier` acceptent soit un ObjectId MongoDB (24 caractères hex), soit un nom (résolution par lookup).

### 4.4 Pays

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| nom | string | ✓ (unique) | Nom du pays |
| code | string | - | Code ISO |
| createdAt | Date | - | Date de création |
| updatedAt | Date | - | Date de mise à jour |

### 4.5 Ville

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| nom | string | ✓ | Nom de la ville |
| pays | ObjectId | ✓ | Référence vers Pays |
| createdAt | Date | - | Date de création |
| updatedAt | Date | - | Date de mise à jour |

### 4.6 Quartier

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| nom | string | ✓ | Nom du quartier |
| ville | ObjectId | ✓ | Référence vers Ville |
| createdAt | Date | - | Date de création |
| updatedAt | Date | - | Date de mise à jour |

---

## 5. DTOs et validation

### CreateUserDto

- `nom`, `prenom`, `email`, `password` : requis (IsNotEmpty, IsEmail)
- `role`, `telephone`, `adresse`, `lantitude`, `longitude`, `isActive` : optionnels

### LoginUserDto

- `email` : requis, format email
- `password` : requis, string

### CreateEtablissementDto

- Tous les champs sont marqués `@IsNotEmpty()` (inadapté pour des champs optionnels)
- `nom`, `prestataire`, `pays`, `ville`, `quartier`, `description`, `image`, `telephone`, `email`, `isActive` : actuellement obligatoires

### UpdateEtablissementDto

- Tous les champs sont `@IsOptional()` — adapté pour les mises à jour partielles

---

## 6. Sécurité

### 6.1 Authentification JWT

- **Algorithme :** JWT (HS256 par défaut)
- **Secret :** `process.env.JWT_SECRET` ou `"default-secret-change-in-production"`
- **Durée :** 1 jour (`expiresIn: '1d'`)
- **Extraction :** `Authorization: Bearer <token>`

### 6.2 Flux de connexion

1. `POST /users/login` avec `email` et `password`
2. Vérification email + comparaison bcrypt du mot de passe
3. Si OK : `{ access_token: "<jwt>" }`
4. Les routes protégées utilisent `JwtAuthGuard` et lisent `req.user`

### 6.3 Mots de passe

- Hashage : **bcryptjs** (10 rounds)
- Aucun salt exposé

### 6.4 Guards et décorateurs

- **JwtAuthGuard** : protège les routes nécessitant un token valide (ex. `/users/profile`)
- **RolesGuard** : vérifie `user.role === 'admin'` (non utilisé actuellement)
- **@Roles(...)** : décorateur pour restreindre par rôle (non utilisé)

### 6.5 Lacunes de sécurité

1. **CRUD Établissements** : aucun guard — création/modification/suppression sans authentification
2. **Profile** : `req.user` contient seulement `{ userId, email }` (données JWT), pas le User complet — typage `Promise<User>` trompeur
3. **PassportModule** : non importé dans `AuthModule` — peut causer des erreurs selon la version NestJS

---

## 7. Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| @nestjs/common, core, platform-express | 11.0.1 | Framework NestJS |
| @nestjs/mongoose | 11.0.4 | Intégration MongoDB |
| @nestjs/jwt | 11.0.0 | Signing/vérification JWT |
| @nestjs/passport | 11.0.5 | Stratégies Passport |
| mongoose | 9.2.4 | ODM MongoDB |
| bcryptjs | 3.0.3 | Hashage des mots de passe |
| passport-jwt | 4.0.1 | Stratégie JWT pour Passport |
| class-validator | 0.15.1 | Validation des DTOs |
| class-transformer | 0.5.1 | Transformation d’objets |
| dotenv | 17.3.1 | Variables d’environnement |

---

## 8. Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `MONGODB_URL` | Oui | Chaîne de connexion MongoDB |
| `PORT` | Non | Port du serveur (défaut : 3000) |
| `JWT_SECRET` | Recommandé | Secret pour signer les JWT |

---

## 9. Tests

- **Unitaires :** Jest (`*.spec.ts`)
- **E2E :** `test/app.e2e-spec.ts`, config `test/jest-e2e.json`
- **Coverage :** `npm run test:cov` → sortie dans `coverage/`

---

## 10. Points d'attention et recommandations

### Bugs / Incohérences

1. **User.lantitude** : typo — devrait être `latitude`
2. **Role.schema.ts** : `RoleSchema` non exporté ; schéma non enregistré dans Mongoose
3. **GET /users/profile** : retourne `{ userId, email }` au lieu du profil User complet
4. **CreateEtablissementDto** : trop de champs marqués `@IsNotEmpty()` alors que le schéma les accepte optionnels

### Améliorations proposées

| Priorité | Action |
|----------|--------|
| Haute | Protéger les routes CRUD Établissements par `JwtAuthGuard` (au minimum création/modification/suppression) |
| Haute | Exposer `JWT_SECRET` via `.env` et ne jamais utiliser de secret par défaut en production |
| Moyenne | Corriger `RoleSchema` et enregistrer le modèle Role dans `RolesModule` ou `UsersModule` |
| Moyenne | Implémenter `getProfile` dans `UsersService` pour retourner le User complet dans `/users/profile` |
| Moyenne | Implémenter CRUD pour Pays, Villes, Quartiers (ou seed de données de référence) |
| Basse | Corriger la typo `lantitude` → `latitude` dans User |
| Basse | Assouplir `CreateEtablissementDto` avec `@IsOptional()` pour les champs non obligatoires |

---

## 11. Résumé

Le backend E-Conciergerie repose sur **NestJS 11** et **MongoDB**. Les modules **Users** et **Etablissements** sont opérationnels. L’authentification JWT fonctionne pour la connexion et le profil, mais le CRUD des établissements est entièrement public et la gestion des rôles ainsi que les référentiels (pays, villes, quartiers) ne sont pas encore implémentés. Les correctifs proposés permettraient d’améliorer la sécurité et la cohérence du modèle de données.
