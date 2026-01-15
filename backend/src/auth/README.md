# JWT Authentication Layer

## Overview

The JWT auth layer consists of three components that work together:

```
Request with "Authorization: Bearer <token>"
        │
        ▼
┌───────────────────┐
│   JwtAuthGuard    │  ← Applied via @UseGuards(JwtAuthGuard)
│                   │     Extracts Bearer token, delegates to Passport
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   JwtStrategy     │  ← Validates signature, parses payload
│   (Passport)       │     Ensures payload has sub, email; rejects refresh tokens
└─────────┬─────────┘
          │
          ▼  validate() returns { userId, email }
          │
┌───────────────────┐
│   req.user        │  ← Attached by Passport after successful validation
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  @CurrentUser()   │  ← Extracts req.user into controller parameter
└───────────────────┘
```

## 1. JwtStrategy (`jwt.strategy.ts`)

**Role:** Validates the JWT and shapes the payload for `req.user`.

- **Token extraction:** `ExtractJwt.fromAuthHeaderAsBearerToken()` reads `Authorization: Bearer <token>`
- **Verification:** Passport verifies signature and expiration before calling `validate()`
- **Payload validation:** Rejects refresh tokens (`type === 'refresh'`), ensures `sub` and `email` exist
- **Output:** Returns `{ userId, email }` → attached to `req.user`

## 2. JwtAuthGuard (`guards/jwt-auth.guard.ts`)

**Role:** Protects routes by requiring a valid JWT.

- **@Public():** Bypasses auth when the route is marked with `@Public()`
- **Delegation:** Uses Passport's `AuthGuard('jwt')` which invokes `JwtStrategy`
- **Error handling:** `handleRequest()` turns missing/invalid tokens into `401 Unauthorized`

**Usage:**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: RequestUser) {
  return user;
}
```

## 3. @CurrentUser() (`decorators/current-user.decorator.ts`)

**Role:** Injects `req.user` into controller parameters.

- **Full user:** `@CurrentUser() user` → `{ userId, email }`
- **Single property:** `@CurrentUser('userId') id` → `string`

**Usage:**
```typescript
@UseGuards(JwtAuthGuard)
getMe(@CurrentUser('userId') userId: string) {
  return { id: userId };
}
```

## 4. @Public() (`decorators/public.decorator.ts`)

Marks routes as public when using a global `JwtAuthGuard`. Those routes skip JWT validation.

## Files

| File | Purpose |
|------|---------|
| `jwt.strategy.ts` | Passport strategy, validates payload |
| `guards/jwt-auth.guard.ts` | Route guard |
| `decorators/current-user.decorator.ts` | Injects req.user |
| `decorators/public.decorator.ts` | Bypass guard |
| `interfaces/jwt-payload.interface.ts` | Payload shape |
