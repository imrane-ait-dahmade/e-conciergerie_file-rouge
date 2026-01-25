# Rapport Backend – E-Conciergerie

## Vue d’ensemble

- **Stack** : NestJS 11, MongoDB (Mongoose), JWT (Passport)
- **Port** : 3000 (ou `process.env.PORT`)
- **Lancement** : `npm run start:dev`

---

## Modules

| Module           | Rôle                          |
|------------------|-------------------------------|
| **App**          | Point d’entrée, santé API     |
| **Users**        | Inscription, login, profil    |
| **Auth**         | JWT, guards, stratégie       |
| **Roles**        | Rôles (contrôleur vide)      |
| **Etablissements** | CRUD établissements        |
| **Pays**         | Référentiel pays (prévu)     |
| **Villes**       | Référentiel villes (prévu)   |
| **Quartiers**    | Référentiel quartiers (prévu)|

---

## API exposées

### Racine
- `GET /` — Message de bienvenue

### Utilisateurs (`/users`)
- `POST /users/create` — Créer un utilisateur
- `POST /users/login` — Connexion (retourne `access_token`)
- `GET /users/profile` — Profil (protégé JWT)

### Établissements (`/etablissements`)
- `POST /etablissements` — Créer
- `GET /etablissements` — Liste
- `GET /etablissements/:id` — Détail
- `PUT /etablissements/:id` — Modifier
- `DELETE /etablissements/:id` — Supprimer

### Autres
- `/auth` — Préfixe (aucune route)
- `/roles` — Préfixe (aucune route)
- `/pays`, `/villes`, `/quartiers` — Préfixes (aucune route pour l’instant)

---

## Modèles (MongoDB)

- **User** : utilisateurs (hash mot de passe, etc.)
- **Role** : rôles
- **Etablissement** : nom, adresse, coordonnées, prestataire, pays, ville, quartier, description, image, téléphone, email, isActive
- **Pays** : nom, code
- **Ville** : nom, ref. pays
- **Quartier** : nom, ref. ville

Les champs `pays`, `ville`, `quartier` d’un établissement acceptent **soit** un ObjectId **soit** un nom (résolution côté service).

---

## Sécurité

- **Validation** : `ValidationPipe` global
- **Auth** : JWT (Passport), `JwtAuthGuard` sur `/users/profile`
- **Mots de passe** : bcrypt

---

## Variables d’environnement

- `MONGODB_URL` — Chaîne de connexion MongoDB
- `PORT` — Port du serveur (défaut : 3000)
- (JWT : à définir selon la config Auth)

---

## Fichiers clés

```
src/
├── main.ts                 # Bootstrap, ValidationPipe
├── app.module.ts          # Imports des modules
├── users/                 # Inscription, login, profil
├── auth/                  # JWT, guards
├── etablissements/       # CRUD + résolution pays/ville/quartier
├── pays/
├── villes/
└── quartiers/
```

Rapport généré rapidement – à compléter selon les besoins du projet.
