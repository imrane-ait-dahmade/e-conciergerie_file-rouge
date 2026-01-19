# Etablissements Authorization

## Route Protection Summary

| Endpoint | Auth | Who can access |
|----------|------|----------------|
| `POST /etablissements` | JwtAuthGuard | Any authenticated user |
| `GET /etablissements` | Public | Anyone |
| `GET /etablissements/:id` | Public | Anyone |
| `PUT /etablissements/:id` | JwtAuthGuard | Owner (prestataire) or admin |
| `DELETE /etablissements/:id` | JwtAuthGuard | Owner (prestataire) or admin |

## Authorization Decisions

### Create (POST)
- **Protected**: Yes. Must be authenticated.
- **prestataire**: Set automatically from `req.user.userId`. The client cannot supply it.
- **Rationale**: Only logged-in users (providers) can create establishments. The creator becomes the owner.

### Read (GET list, GET by id)
- **Protected**: No. Public.
- **Rationale**: Establishments are typically browsable (directory, search). No sensitive data in the listing. If needed later, can add optional auth for personalized results.

### Update (PUT)
- **Protected**: Yes. Must be authenticated.
- **Who can update**: Only the owner (`prestataire === userId`) or a user with role `admin`.
- **prestataire in payload**: Stripped. Cannot change the owner via update.
- **Rationale**: Prevents users from modifying establishments they don't own. Admins can moderate.

### Delete (DELETE)
- **Protected**: Yes. Must be authenticated.
- **Who can delete**: Only the owner or admin.
- **Rationale**: Same as update. Prevents accidental or malicious deletion by others.

## Implementation

- `canModify(etablissementId, userId)`: Fetches establishment, compares `prestataire` with `userId`. If not owner, fetches user's role; if `admin`, allows. Otherwise throws `ForbiddenException`.
- `403 Forbidden`: Returned when a non-owner, non-admin tries to update or delete.
- `404 Not Found`: Returned when the establishment does not exist (in `canModify`).
