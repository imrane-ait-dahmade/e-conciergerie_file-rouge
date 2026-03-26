# Bonnes pratiques — Frontend admin (e-conciergerie)

Document interne pour le dossier `web/`. Objectif : **maintenabilité**, **cohérence** et **onboarding** rapides.  
Compléments : [`ADMIN_UI_CONVENTIONS.md`](./ADMIN_UI_CONVENTIONS.md) (choix Ant / shadcn / MUI), [`theme/README.md`](../theme/README.md) (tokens CSS).

---

## 1. Architecture des dossiers (`web/`)

| Zone | Rôle |
|------|------|
| `app/` | Routes Next.js App Router (`page.tsx`, `layout.tsx`). Peu de logique métier : composer les features. |
| `app/globals.css` | Tokens couleur / thème (source de vérité). |
| `theme/` | `token`, `getAntdTheme`, `muiTheme`, helpers `readCssVar`. |
| `admin/` | Tout le périmètre back-office : layout, providers, CRUD générique, features. |
| `admin/crud/` | Primitives réutilisables listes/modales (voir §17). |
| `admin/features/<domaine>/` | Une feature métier par dossier (villes, users, …). |
| `admin/shared/` | UI transverse admin (`AppButton`, `AppTable`, wrappers). |
| `admin/hooks/`, `admin/utils/` | Hooks et utilitaires **admin** non liés à une seule feature. |
| `components/ui/` | shadcn (présentation, dialogs). |
| `lib/` | Utilitaires globaux (`utils`, i18n). |

**Règle** : une route `app/[locale]/admin/<segment>/page.tsx` importe un composant « écran » depuis `@/admin/features/<domaine>/`.

---

## 2. Séparation composants / features / shared

- **`shared`** : réutilisable par **plusieurs** features (wrappers `App*`, patterns UI sans métier).
- **`features/<domaine>`** : tout ce qui connaît le **modèle métier** (types, colonnes, formulaire, API du domaine).
- **`crud`** : logique **générique** (liste paginée, modale, toolbar) sans nom de domaine.

Ne pas mettre de types `Ville` dans `shared`. Ne pas dupliquer `AppTable` dans chaque feature.

---

## 3. Typage

- **`strict: true`** — pas de `any` ; `unknown` + narrowing si nécessaire.
- Types métier dans **`features/<x>/types.ts`** (ou proches du domaine).
- DTO / formulaire : suffixe explicite (`VilleFormValues`, `CreatePaysPayload`).
- Réutiliser `CrudEntity`, `CrudListParams` depuis `@/admin/crud/types` pour les listes.
- Schémas Zod dans `*-form.schema.ts` quand validation structurée au submit.

---

## 4. Gestion des props

- Exporter un type **`XxxProps`** par composant public (`export type VillesCrudPageProps`).
- Grouper les props optionnelles en fin ; valeurs par défaut dans le corps ou `defaultProps` évité au profit de destructuring.
- Callbacks : préfixe `on` (`onSuccess`, `onClose`). Éviter les props « fourre-tout » ; préférer 2–3 props claires.
- Composants serveur vs client : marquer **`"use client"`** dès qu’il y a state, hooks navigateur ou événements.

---

## 5. Conventions de nommage

| Élément | Convention |
|---------|------------|
| Dossiers features | `kebab-case` (`villes`, `users`). |
| Fichiers composants | `kebab-case.tsx` (`villes-crud-page.tsx`, `ville-drawer.tsx`). |
| Composants React | `PascalCase`. |
| Hooks | `use-xxx.ts` / `useXxx` (`use-villes-list.ts` → `useVillesList`). |
| Fonctions utilitaires | `camelCase` ; préfixe `get`/`fetch`/`parse` selon le rôle. |
| Constantes | `SCREAMING_SNAKE` ou `camelCase` pour objets config exportés. |

---

## 6. Formulaires (admin CRUD)

- **Ant Design** `Form` + `Form.Item` pour les écrans métier denses (pas shadcn Form sur la même vue).
- Champs via **`AppInput` / `AppSelect`** quand un wrapper existe.
- Règles dans `rules={[...]}` ; alignement avec Zod au `onFinish` si schéma présent.
- Soumission async : try/finally ; `message.success` / `message.error` ; fermeture drawer après succès.
- Fichier dédié **`*-form.tsx`** pour les champs réutilisables (`VilleFields`).

---

## 7. Tableaux

- Listes admin : **`AppDataTable`** (qui enveloppe `AppTable`) + `columns` typées `ColumnsType<Entity>`.
- `rowKey` stable (`id`). Colonne actions : `createActionsColumn` + `RowActions`.
- `scroll={{ x: … }}` dès que beaucoup de colonnes (mobile).

---

## 8. Appels API

- **Une couche par domaine** : `features/<x>/api/<x>-api.ts` (facade) + `services/*-mock.service.ts` ou client HTTP futur.
- Signatures async claires : `fetchXxxList(params): Promise<CrudListResult<T>>`.
- Pas de `fetch` inline dans les composants de page : passer par les fonctions du module.
- Erreurs : laisser remonter ou transformer en `Error` pour l’état `error` du hook liste.

---

## 9. Hooks custom

- Un hook = **une responsabilité** (`useVillesList` = liste + filtre statut + params).
- Préfixe `use`, fichier **`use-xxx.ts`** ou **`useXxx.tsx`** si JSX.
- Dépendances `useCallback` / `useMemo` explicites ; éviter les objets inline instables dans les deps.

---

## 10. Loading / error / empty

- **Liste** : `loading` sur la table ; `error` via `AppDataTable` (Alert) ; `emptyDescription` pour 0 résultat.
- **Mutation** : `loading` sur le bouton submit ; `DeleteConfirmDialog` avec `loading`.
- Ne pas afficher la table vide et le spinner en même temps : laisser Ant gérer via `loading`.

---

## 11. Responsive

- Shell : déjà géré (`AdminLayout`, drawer mobile).
- Tables : scroll horizontal ; colonnes `responsive: ['md']` sur le secondaire.
- Toolbars : `flex-wrap`, `min-w-0`, breakpoints Tailwind (`md:`, `lg:`).

---

## 12. Accessibilité

- Boutons icône seuls : `aria-label`.
- Icônes décoratives : `aria-hidden`.
- Zones principales : `role="main"` déjà sur le content admin ; conserver les titres hiérarchiques (`Typography.Title`, `PageHeader`).

---

## 13. Réutilisation des composants

- Préférer **`@/admin/crud`** pour les écrans liste + actions + delete.
- Préférer **`@/admin/shared/ui/app`** pour les primitives bouton/table/input.
- Extraire un sous-composant dès **répétition** ou **testabilité** (ex. `VilleFields`).

---

## 14. Styling

- **Tokens** : `theme/tokens.ts` ou classes Tailwind `bg-card`, `text-muted-foreground`, `border-border`.
- Interdit : couleurs hex/rgb en dur dans les features.
- `className` : utiliser `cn()` pour fusionner variantes.

---

## 15. Gestion des icônes

- **Ant Design Icons** : navigation sidebar, boutons d’actions alignés Ant (`RowActions`).
- **Lucide** : sections marketing, cartes shadcn, illustrations légères.
- Ne pas mélanger les deux sur la **même rangée d’actions** sans nécessité ; le CRUD admin actuel utilise Ant pour la cohérence avec `Button` Ant.

---

## 16. Pagination, recherche, filtres

- Params unifiés : **`CrudListParams`** (`page`, `pageSize`, `search`, `sortField`, `sortOrder`, `filters`).
- Recherche : debounce via **`useCrudList`** (`searchDebounceMs`).
- Filtres : `filters` dans les params + UI dans `CrudToolbar` (`filterSlot`).
- Côté API Nest : mapper vers query string (`?page=&limit=&q=&sort=&order=&statut=`).

---

## 17. Organisation des modules CRUD

Structure type (référence : **villes**) :

```text
features/<domaine>/
  types.ts
  <resource>-form.schema.ts   # optionnel (Zod)
  api/<resource>-api.ts       # facade HTTP / mock
  services/<resource>-mock.service.ts
  data/<resource>-mock-store.ts
  hooks/use-<resource>-list.ts
  components/
    <resource>-columns.tsx
    <resource>-form.tsx
    <resource>-drawer.tsx
    <resources>-crud-page.tsx
  index.ts
```

- Page Next : `app/[locale]/admin/<segment>/page.tsx` → import du `*CrudPage` seulement.
- Versionner les conventions : `admin/crud/conventions.ts` (`CRUD_CONVENTIONS_VERSION`).

---

## Révision

Mettre à jour ce fichier lors d’un **nouveau pattern** (ex. React Query, nouveau wrapper). Indiquer la date en bas lors des changements majeurs.
