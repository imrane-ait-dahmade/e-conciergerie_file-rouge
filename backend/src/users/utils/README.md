# Safe User Mapper

Central utility for transforming User documents into safe API responses.

## Usage

```typescript
import { toSafeUserResponse } from './utils/safe-user.mapper';
import type { SafeUserResponse } from './utils/safe-user.types';

// After fetching a user (any shape: lean, hydrated, etc.)
const safeUser = toSafeUserResponse(user);
```

## Excluded fields (never in response)

- password
- refreshTokenHash
- emailVerificationToken
- emailVerificationExpires
- passwordResetToken
- passwordResetExpires

## Where it's used

| Endpoint   | Usage                                             |
|-----------|----------------------------------------------------|
| POST /auth/signup | `{ ...toSafeUserResponse(user), message }`       |
| POST /auth/login  | `{ accessToken, refreshToken, user: toSafeUserResponse(user) }` |
| GET /users/profile | `toSafeUserResponse(user)`                      |

## Type

`SafeUserResponse` – canonical shape with all safe fields (id, nom, prenom, email, role, etc.).
