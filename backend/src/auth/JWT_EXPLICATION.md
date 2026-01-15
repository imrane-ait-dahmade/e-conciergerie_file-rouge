# JWT Authentication — Explication simple

---

## 1. Vue d'ensemble

Deux fichiers principaux :
- **jwt.strategy.ts** : décode et valide le token, remplit `req.user`
- **jwt-auth.guard.ts** : bloque l'accès si pas de token valide

---

## 2. jwt.strategy.ts

**Rôle :** Valider le token JWT et produire l'objet mis dans `req.user`.

```
Requête avec Authorization: Bearer <token>
        ↓
Passport extrait le token
        ↓
Vérifie la signature avec JWT_SECRET
        ↓
Appelle validate(payload) avec les données décodées
        ↓
validate() retourne { userId, email }
        ↓
req.user = { userId, email }
```

**Paramètres :**
- `jwtFromRequest` : lit le token depuis l'en-tête `Authorization: Bearer ...`
- `secretOrKey` : clé secrète pour vérifier la signature (doit être la même qu'à la création)

**validate() :** Reçoit le payload décodé (`{ sub, email, type }`) et retourne ce qui sera mis dans `req.user`.

---

## 3. jwt-auth.guard.ts

**Rôle :** Protéger une route. Si pas de token ou token invalide → 401.

### Comparaison avec Laravel

| NestJS | Laravel |
|--------|---------|
| `@UseGuards(JwtAuthGuard)` | `->middleware('auth')` ou `->middleware('auth:sanctum')` |
| Guard vérifie le token | Middleware vérifie la session / le token |
| Si KO → 401 Unauthorized | Si KO → redirection vers login ou 401 |
| `req.user` rempli après validation | `$request->user()` ou `Auth::user()` |

**Exemple Laravel :**
```php
// Route protégée
Route::get('profile', [ProfileController::class, 'show'])
    ->middleware('auth');
```

**Exemple NestJS :**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Req() req: { user: RequestUser }) {
  return this.usersService.getProfile(req.user.userId);
}
```

---

## 4. Flux complet : GET /users/profile

```
1. Client envoie : GET /users/profile
   Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

2. JwtAuthGuard s'exécute avant le contrôleur
   → Appelle la stratégie "jwt" (JwtStrategy)

3. JwtStrategy :
   - Extrait le token de l'en-tête
   - jwt.verify(token, JWT_SECRET)
   - Si OK : appelle validate(payload)
   - validate() retourne { userId, email }

4. Passport met ce retour dans req.user

5. JwtAuthGuard.handleRequest() :
   - Si user existe → laisse passer
   - Si pas de user → lance 401

6. Le contrôleur reçoit la requête
   - req.user = { userId, email }
   - getProfile(req) utilise req.user.userId

7. UsersService.getProfile(userId) charge et retourne le profil
```

---

## 5. Utiliser req.user dans un contrôleur

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Req() req: { user: RequestUser }) {
  // req.user est rempli par JwtStrategy
  const userId = req.user.userId;
  return this.usersService.getProfile(userId);
}
```

**Laravel équivalent :**
```php
public function show(Request $request) {
  $userId = $request->user()->id;
  return $this->userService->getProfile($userId);
}
```

---

## 6. Résumé

| Fichier | Rôle |
|---------|------|
| **jwt.strategy.ts** | Valide le token, remplit `req.user` |
| **jwt-auth.guard.ts** | Bloque si pas de token valide (comme middleware auth) |
| **@UseGuards(JwtAuthGuard)** | Applique la protection sur une route |
| **req.user** | Contient `{ userId, email }` après validation |
