# Propriété des données prestataire (ownership)

## Où valider ?

| Couche | Rôle |
|--------|------|
| **Guards** (`JwtAuthGuard`, `RolesGuard`, `@ProviderOnly()`) | **Qui** est connecté ? **Quel rôle** (admin / prestataire / client) ? Ils ne connaissent **pas** les ids de documents dans l’URL (`:id` établissement, `:id` assignation, etc.). |
| **Helpers partagés** (`prestataire-ownership.util.ts`) | Fonctions **réutilisables** : « cet établissement / cette offre / cette ligne ESC appartient-elle au `userId` du JWT ? » → sinon **404** (anti-IDOR). |
| **Services** | **Orchestration** : appeler les helpers au bon moment, puis **règles métier** propres à la ressource (unicité, catalogue, doublons, etc.). La logique **spécifique** reste ici car elle dépend des champs et des cas d’usage. |

**Pourquoi pas un guard par ressource ?** Un guard ne peut pas proprement charger le document et vérifier la chaîne parente sans dupliquer la logique métier et sans injecter beaucoup de modèles. Les **guards** restent pour **auth + rôle** ; l’**ownership** document par document = **service + helpers**.

## Chaîne de propriété (transitive)

```
EtablissementServiceCaracteristique
  → etablissementService → EtablissementService
    → etablissement → Etablissement.prestataire === userId (JWT)
```

Les fonctions dans `prestataire-ownership.util.ts` implémentent cette chaîne :

- `ensurePrestataireOwnsEtablissement` — accès direct à un établissement.
- `ensurePrestataireOwnsEtablissementService` — une ligne `etablissement_services`.
- `ensurePrestataireOwnsEtablissementServiceCaracteristique` — une ligne de caractéristique d’offre.

**Médias (plus tard)** : même idée — charger le `Media`, lire le parent (`etablissement`, `etablissementService`, etc.), puis réutiliser la fonction appropriée sur l’id parent ou enchaîner jusqu’à `Etablissement.prestataire`.

## Listes « seulement les miennes »

Ne pas se fier au front : la requête MongoDB doit filtrer par **`prestataire: userId`** ou par **`etablissement: { $in: idsDesMesEtablissements }`** obtenu via le même `userId`.

## Source de vérité

Toute règle d’accès doit être **réexécutée côté serveur** pour chaque requête. Le front ne fait qu’UX.
