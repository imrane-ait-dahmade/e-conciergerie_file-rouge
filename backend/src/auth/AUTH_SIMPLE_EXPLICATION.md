# Authentification simple — Explication du code

Guide pour comprendre le système d'authentification. Adapté aux débutants venant de Laravel.

---

## 1. Vue d'ensemble

| Fonctionnalité | Route | Méthode |
|----------------|-------|---------|
| Inscription | `POST /auth/signup` | Crée un compte et retourne les tokens |
| Connexion | `POST /auth/login` | Vérifie email/password, retourne les tokens |
| Profil | `GET /users/profile` | Retourne l'utilisateur connecté (JWT requis) |
| Refresh | `POST /auth/refresh-token` | Échange le refresh token contre une nouvelle paire |
| Déconnexion | `POST /auth/logout` | Invalide le refresh token (JWT requis) |

---

## 2. Fichiers et leur rôle

### auth.service.ts

**Rôle :** Toute la logique métier d'authentification.

- **signup(dto)** : Vérifie si l'email existe → hash du mot de passe → crée l'utilisateur → retourne les tokens.
- **login(email, password)** : Trouve l'utilisateur → compare le mot de passe avec bcrypt → crée et stocke les tokens → les retourne.
- **refresh(refreshToken)** : Vérifie le token avec jwt.verify → vérifie qu'il correspond au hash en base → crée une nouvelle paire → la retourne.
- **logout(userId)** : Supprime le refreshTokenHash en base (le client ne peut plus rafraîchir).

**Laravel :** C'est l'équivalent de `Auth::attempt()`, `Auth::logout()`, `Hash::make()`, etc. regroupés dans un service.

---

### auth.controller.ts

**Rôle :** Reçoit les requêtes HTTP et délègue au service.

Chaque méthode :
1. Reçoit les données (Body)
2. Appelle le service
3. Retourne la réponse

**Laravel :** Comme un `AuthController` avec des méthodes `login()`, `register()`, etc.

---

### jwt.strategy.ts

**Rôle :** Utilisé par Passport pour **décoder et valider** le token JWT envoyé dans `Authorization: Bearer <token>`.

- Extrait le token de l'en-tête
- Vérifie la signature avec le secret
- Si valide → appelle `validate()` → met `req.user = { userId, email }`
- Si invalide → 401

**Laravel :** Équivalent du middleware qui vérifie le token Sanctum ou la session.

---

### jwt-auth.guard.ts

**Rôle :** Protège une route. Si l'utilisateur n'a pas de token valide → 401.

Utilisation :
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser('userId') userId: string) { ... }
```

**Laravel :** Comme `->middleware('auth')` sur une route.

---

### auth.module.ts

**Rôle :** Assemble tout : contrôleur, service, JwtStrategy, configuration JWT.

Importe `UsersModule` pour accéder au modèle User.

---

## 3. Flux des requêtes — Signup et Login

### Signup (POST /auth/signup)

```
Client                          Controller                    Service                     MongoDB
  |                                  |                            |                            |
  | POST { nom, prenom, email,       |                            |                            |
  |       password, ... }            |                            |                            |
  |--------------------------------->|                            |                            |
  |                                  | signup(dto)                |                            |
  |                                  |--------------------------->|                            |
  |                                  |                            | 1. findOne({ email })       |
  |                                  |                            |--------------------------->|
  |                                  |                            |<---------------------------|
  |                                  |                            | 2. bcrypt.hash(password)   |
  |                                  |                            | 3. userModel.create(...)   |
  |                                  |                            |--------------------------->|
  |                                  |                            |<---------------------------|
  |                                  |                            | 4. creerReponseLogin()     |
  |                                  |                            |    → accessToken           |
  |                                  |                            |    → refreshToken          |
  |                                  |                            |    → bcrypt.hash(refresh)  |
  |                                  |                            |    → findByIdAndUpdate()   |
  |                                  |<---------------------------|                            |
  | { accessToken, refreshToken,     |                            |                            |
  |   user: { id, nom, prenom, ... } |                            |                            |
  | }                                |                            |                            |
  |<---------------------------------|                            |                            |
```

**Étapes signup :**
1. **Vérifier email** : `findOne({ email })` → si existe → 409 Conflict
2. **Hasher password** : `bcrypt.hash(password, 10)`
3. **Sauvegarder user** : `userModel.create({ nom, prenom, email, passwordHash, ... })`
4. **Retourner tokens + user** : génère access + refresh, stocke hash du refresh, retourne réponse

---

### Login (POST /auth/login)

```
Client                          Controller                    Service                     MongoDB
  |                                  |                            |                            |
  | POST { email, password }         |                            |                            |
  |--------------------------------->|                            |                            |
  |                                  | login(dto)                 |                            |
  |                                  |--------------------------->|                            |
  |                                  |                            | 1. findOne({ email })      |
  |                                  |                            |    .select('+password')    |
  |                                  |                            |--------------------------->|
  |                                  |                            |<---------------------------|
  |                                  |                            | 2. bcrypt.compare()        |
  |                                  |                            | 3. creerReponseLogin()     |
  |                                  |                            |    → accessToken           |
  |                                  |                            |    → refreshToken          |
  |                                  |                            |    → update(refreshHash)   |
  |                                  |<---------------------------|                            |
  | { accessToken, refreshToken,     |                            |                            |
  |   user: { id, nom, prenom, ... } |                            |                            |
  | }                                |                            |                            |
  |<---------------------------------|                            |                            |
```

**Étapes login :**
1. **Trouver user** : `findOne({ email }).select('+password')` → si pas trouvé → 401
2. **Comparer password** : `bcrypt.compare(password, user.password)` → si faux → 401
3. **Générer access token** : `jwtService.sign({ sub: userId, email })`
4. **Générer refresh token** : même payload avec `type: 'refresh'`, secret différent
5. **Sauvegarder hash refresh** : `bcrypt.hash(refreshToken)` puis `findByIdAndUpdate`
6. **Retourner** : `{ accessToken, refreshToken, user }` (user via toSafeUserResponse)

---

### Données utilisateur retournées (safe user)

La fonction `toSafeUserResponse()` retire toutes les données sensibles. Le client reçoit :

```json
{
  "id": "...",
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@test.com",
  "telephone": "+33612345678",
  "adresse": "123 Rue Example",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Exclus** : `password`, `refreshTokenHash`

---

## 4. Flux détaillé : Requête protégée (ex: profile)

```
1. Client envoie GET /users/profile avec en-tête :
   Authorization: Bearer <accessToken>
2. JwtAuthGuard intercepte :
   - Extrait le token
   - Passe à JwtStrategy qui le valide
   - Si OK : req.user = { userId, email }
3. Le contrôleur reçoit la requête avec req.user
4. @CurrentUser('userId') récupère l'ID
5. UsersService.getProfile(userId) charge et retourne le profil
```

---

## 5. Pourquoi 2 tokens ?

| Token | Durée | Usage |
|-------|-------|-------|
| **Access** | 1 jour | Envoyé à chaque requête protégée |
| **Refresh** | 7 jours | Envoyé uniquement pour obtenir un nouvel access token |

- L'access token expire vite → si volé, durée d'utilisation limitée.
- Le refresh token est stocké (hash) en base → on peut le révoquer au logout.

**Laravel Sanctum :** Même idée avec les personal access tokens.

---

## 6. Équivalences Laravel ↔ NestJS

| Laravel | NestJS |
|---------|--------|
| `Auth::attempt($credentials)` | `AuthService.login(email, password)` |
| `Auth::user()` | `req.user` (rempli par JwtStrategy) |
| `Auth::id()` | `req.user.userId` ou `@CurrentUser('userId')` |
| `Hash::make($password)` | `bcrypt.hash(password, 10)` |
| `Hash::check($plain, $hash)` | `bcrypt.compare(plain, hash)` |
| Middleware `auth` | `JwtAuthGuard` |
| `Auth::logout()` | `AuthService.logout(userId)` |

---

## 7. Variables d'environnement

```env
MONGODB_URL=mongodb://localhost:27017/e-conciergerie
JWT_SECRET=votre-secret-tres-long-et-securise
JWT_REFRESH_SECRET=un-autre-secret-pour-refresh
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 8. Exemple de requêtes (cURL)

**Inscription :**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont","prenom":"Jean","email":"jean@test.com","password":"MotDePasse123!"}'
```

**Connexion :**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean@test.com","password":"MotDePasse123!"}'
```

**Profil (avec token) :**
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Refresh :**
```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"VOTRE_REFRESH_TOKEN"}'
```

**Déconnexion :**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```
