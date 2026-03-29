# Autorisation backend (NestJS)

## Rôles des briques

| Brique | Rôle |
|--------|------|
| **Middleware** | Concerns transverses (CORS, logging, parsing brut). **Pas** la logique métier d’autorisation (pas de « est-ce mon établissement ? »). |
| **JwtAuthGuard** | **Authentification** : token présent, valide, non expiré → remplit `req.user`. |
| **RolesGuard** + **`@Roles(...)`** | **Autorisation par rôle** : l’utilisateur a-t-il un des rôles requis ? (lecture du rôle en base après le JWT.) |
| **Decorators** (`@ProviderOnly()`, `@AdminOnly()`, `@CurrentUser()`) | **Confort** : appliquent les guards + métadonnées en une ligne. La sécurité réelle est dans les guards et les services. |
| **Services** | **Règles métier et ownership** : « ce prestataire ne peut modifier que **ses** établissements / offres » via requêtes `prestataire: userId` ou `ensurePrestataireOwnsEtablissement(...)`. |

## Fichiers clés

- `constants/role-names.ts` — constantes `RoleName` alignées sur `roles.name` en MongoDB (`voyageur` = valeur technique `client`).
- `ownership/prestataire-ownership.util.ts` — `ensurePrestataireOwnsEtablissement` pour factoriser les contrôles d’appartenance côté prestataire.
- `decorators/provider-only.decorator.ts` — `@ProviderOnly()` = JWT + rôle prestataire.
- `decorators/admin-only.decorator.ts` — `@AdminOnly()` = JWT + rôle admin.
- `decorators/admin-or-prestataire.decorator.ts` — les deux rôles acceptés ; le filtrage fin se fait dans le service.
- `decorators/voyageur-only.decorator.ts` — JWT + rôle client / voyageur.

## Ordre des guards

Toujours **`JwtAuthGuard` avant `RolesGuard`** (d’abord identité, puis rôle). Les décorateurs composites appliquent déjà cet ordre.

## Exemples de contrôleurs

```ts
// Admin uniquement
@ApiBearerAuth()
@AdminOnly()
@Controller('admin/etablissements')
export class AdminEtablissementsController { ... }

// Prestataire uniquement (+ ownership dans les services)
@ApiBearerAuth()
@ProviderOnly()
@Controller('provider/etablissements')
export class ProviderEtablissementsController { ... }

// Admin ou prestataire (logique conditionnelle dans le service)
@ApiBearerAuth()
@AdminOrPrestataire()
@Get('reports/summary')
getSummary() { ... }
```

Les **voyageurs** n’ont pas accès aux routes `@AdminOnly()` ni `@ProviderOnly()` : ils reçoivent **403** si le rôle en base n’est pas dans la liste.
