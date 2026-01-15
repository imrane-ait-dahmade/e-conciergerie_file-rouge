# Explication simple du module Auth — Pour débutants NestJS

Document pour développeurs venant de PHP/Laravel. Ce guide explique le code d'authentification en termes simples.

---

## 1. Vue d'ensemble

| Là où vous êtes (Laravel) | Ici (NestJS) |
|--------------------------|---------------|
| `Auth::attempt()` | `AuthService.login()` |
| `Auth::user()` | `@CurrentUser()` ou `req.user` |
| Middleware `auth` | `JwtAuthGuard` |
| `Hash::make()` | `bcrypt.hash()` |
| `Password::sendResetLink()` | `AuthService.forgotPassword()` |
| `Auth::logout()` | `AuthService.logout()` |

---

## 2. Structure des fichiers

```
auth/
├── auth.controller.ts    ← Routes HTTP (comme routes/auth.php + AuthController)
├── auth.service.ts       ← Logique métier (comme AuthService ou trait)
├── auth.module.ts        ← Agrégation (comme config/auth.php)
├── jwt.strategy.ts       ← Vérifie le token JWT (comme Passport/Sanctum)
├── guards/
│   ├── jwt-auth.guard.ts ← "Est-il connecté ?" (comme middleware auth)
│   └── roles.guard.ts    ← "A-t-il le bon rôle ?" (comme Gate ou middleware admin)
└── decorators/
    ├── current-user.decorator.ts  ← Récupère req.user facilement
    ├── roles.decorator.ts        ← Déclare les rôles requis sur une route
    └── public.decorator.ts       ← Route accessible sans token
```

---

## 3. Déroulement d'une requête authentifiée

**Exemple : GET /users/profile**

1. La requête arrive avec `Authorization: Bearer <token>`
2. `JwtAuthGuard` intercepte : "Y a-t-il un token ? Est-il valide ?"
3. Si oui → `JwtStrategy` décode le JWT et met `req.user = { userId, email }`
4. Le contrôleur reçoit la requête et utilise `@CurrentUser('userId')` pour récupérer l'ID
5. Le service charge le profil et le retourne

**Laravel équivalent :**
- Route protégée par `auth` middleware
- `Auth::id()` dans le contrôleur

---

## 4. Les Guards expliqués simplement

### JwtAuthGuard

- **Rôle :** Vérifier que le token JWT est présent et valide.
- **Si OK :** Continue vers le contrôleur. `req.user` est rempli.
- **Si KO :** Lance 401 Unauthorized.

**Utilisation :**
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser('userId') userId: string) {
  return this.usersService.getProfile(userId);
}
```

**Laravel :** `Route::get('profile')->middleware('auth')`

---

### RolesGuard

- **Rôle :** Vérifier que l'utilisateur a un des rôles requis (ex. admin).
- **À mettre APRÈS** JwtAuthGuard (car il a besoin de `req.user.userId`).
- Lit les rôles avec `@Roles('admin')` sur la route.

**Utilisation :**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
deleteUser(@Param('id') id: string) {
  return this.usersService.delete(id);
}
```

**Laravel :** `Route::delete(...)->middleware(['auth', 'role:admin'])` ou `Gate::authorize('admin')`

---

## 5. Le décorateur @CurrentUser

Permet de récupérer l'utilisateur connecté sans toucher à `req` manuellement.

```typescript
// Tout l'objet user (userId + email)
@CurrentUser() user: RequestUser

// Une propriété seule
@CurrentUser('userId') userId: string
```

**Laravel :** `Auth::user()` ou `Auth::id()`

---

## 6. Flux Login en bref

1. Client envoie `POST /auth/login` avec `{ email, password }`
2. `AuthController.login()` appelle `AuthService.login()`
3. Le service :
   - Cherche l'utilisateur par email
   - Vérifie le mot de passe avec `bcrypt.compare()`
   - Génère un access token (court) et un refresh token (long)
   - Stocke le hash du refresh token en base
   - Retourne les 2 tokens + infos utilisateur
4. Le client stocke les tokens et envoie l'access token en `Authorization: Bearer ...` sur les routes protégées

---

## 7. Pourquoi 2 tokens (access + refresh) ?

- **Access token :** Valide 1 jour. Serv à chaque requête protégée. Pas stocké côté serveur.
- **Refresh token :** Valide 7 jours. Stocké (hash) en base. Serv uniquement à obtenir une nouvelle paire de tokens sans redemander le mot de passe.

**Laravel Sanctum :** Même idée avec les token abilities.

---

## 8. Résumé des équivalences

| Concept NestJS | Concept Laravel |
|----------------|-----------------|
| Controller | Controller |
| Service | Service / Logique dans le Controller |
| Guard | Middleware |
| Decorator | Helper (Auth::user()) |
| Module | Config + Service Provider |
| `@UseGuards(JwtAuthGuard)` | `->middleware('auth')` |
| `@CurrentUser()` | `Auth::user()` ou `auth()->user()` |

---

## 9. Ordre des Guards

Quand vous utilisez plusieurs guards : **d'abord JwtAuthGuard, ensuite RolesGuard**.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // JWT d'abord !
@Roles('admin')
```

Sinon, `req.user` n'existe pas quand RolesGuard s'exécute.
