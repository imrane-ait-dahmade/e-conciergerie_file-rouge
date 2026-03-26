# Conventions UI — Dashboard admin (Ant Design + shadcn/ui + MUI)

Document interne pour le frontend `web/`. Objectif : **cohérence visuelle**, **pile technique prévisible**, **tokens issus de `app/globals.css`** (pas de couleurs magiques).

**Voir aussi** : [Bonnes pratiques frontend (architecture, CRUD, API, etc.)](./ADMIN_FRONTEND_PRACTICES.md).

## Table des matières (référence rapide)

- [Quand utiliser Ant Design](#1-quand-utiliser-ant-design)
- [Quand utiliser shadcn/ui](#2-quand-utiliser-shadcnui)
- [Quand utiliser MUI](#3-quand-utiliser-mui)
- [Ce qu’il faut éviter](#4-ce-quil-faut-éviter)
- [Wrappers obligatoires à créer](#5-wrappers-réutilisables-stratégie)
- [Règles CSS / thème](#7-règles-css--thème)
- [Règles accessibilité](#8-règles-daccessibilité)
- [Règles responsive](#9-règles-responsive)
- [Règles de nommage](#10-règles-de-nommage)
- [Règles pour formulaires CRUD](#11-formulaires-crud)
- [Règles pour tableaux admin](#12-tableaux-admin)

**Implémentation des wrappers** : `admin/shared/ui/app/` (`AppButton`, `AppCard`, `AppModal`, `AppTable`, `AppInput`, `AppSelect`, `AppStatusBadge`), export barrel `admin/shared/ui/app/index.ts`. `DataTable` historique = alias de `AppTable` (`admin/shared/ui/data-table.tsx`).

---

## 1. Quand utiliser Ant Design

| Cas d’usage | Composants typiques |
|-------------|---------------------|
| Structure de page admin | `Layout`, `Sider`, `Header`, `Content` |
| Navigation latérale & menus | `Menu`, `Drawer` (mobile) |
| Tableaux de données (liste, tri, pagination serveur) | `Table` → **toujours via `AppTable`** |
| Formulaires CRUD denses (multi-champs, validation) | `Form`, `Form.Item` |
| Champs de formulaire alignés avec le design system Ant | `Input`, `Input.Password`, `InputNumber`, `DatePicker`, `Select` → **via `AppInput` / `AppSelect`** |
| Modales de travail (édition, détail, étapes) | `Modal` → **via `AppModal`** |
| Pagination, Spin, Breadcrumb, message/notification globale | Composants Ant natifs (thème déjà mappé sur les CSS vars) |

**Règle** : toute surface « application métier » dense (back-office) privilégie Ant pour rester homogène avec `ConfigProvider` et le thème centralisé (`theme/antd-theme.ts` → `getAntdTheme()`).

---

## 2. Quand utiliser shadcn/ui

| Cas d’usage | Composants typiques |
|-------------|---------------------|
| Cartes de présentation, KPI, sections | `Card` → **via `AppCard`** |
| Boutons hors formulaire Ant (liens stylés, actions secondaires dans une carte) | `Button` (shadcn) — sinon **`AppButton`** (Ant) dans les écrans CRUD |
| Dialogues de confirmation courte (destructif, oui/non) | `AlertDialog` (Radix) — préféré à une `Modal` Ant lourde |
| Badges de statut légers | `Badge` — **via `AppStatusBadge`** pour les statuts métier |
| Skeletons de chargement de contenu | `Skeleton` |
| Petits patterns (Label, etc.) alignés Tailwind | Primitives sous `components/ui/` |

**Règle** : shadcn = **présentation** et **micro-interactions** ; pas de duplication d’un `Table` ou `Form` Ant déjà en place sur la même vue.

---

## 3. Quand utiliser MUI

| Cas d’usage |
|-------------|
| Composant **non disponible** ou **trop coûteux** à reproduire avec Ant + shadcn (ex. cas très spécifique) |
| Intégration ponctuelle d’un module tiers documenté en MUI |

**Règle** : MUI passe par **`MuiThemeProvider`** (déjà dans `admin/providers`) et **les mêmes variables CSS** que le reste du dashboard. **Interdiction** d’introduire une palette MUI parallèle (`theme.palette` en dur).

**Par défaut** : ne pas ajouter MUI sur une nouvelle feature sans justification dans la revue de code.

---

## 4. Ce qu’il faut éviter

- Mélanger **deux bibliothèques pour le même rôle** sur un même écran (ex. `Table` Ant + table HTML + `DataGrid` MUI).
- **Couleurs en dur** (`#fff`, `rgb()`, couleurs MUI/Ant par défaut non reliées aux tokens).
- **`style={{ color: '...' }}`** sauf cas dynamique calculé (et encore : préférer une classe ou une variable CSS).
- **Dupliquer** `Modal` / `Table` / `Button` sans passer par les wrappers `App*`.
- Importer des composants MUI **hors** du périmètre admin si le provider n’englobe pas la zone (éviter les thèmes orphelins).
- Utiliser **shadcn `Form`** en parallèle d’un **Ant `Form`** sur la même page sans règle d’architecture explicite (à éviter ; choisir Ant pour le CRUD admin).

---

## 5. Wrappers réutilisables (stratégie)

### Wrappers obligatoires (fichiers)

| Composant | Fichier | Basé sur |
|-----------|---------|----------|
| `AppButton` | `admin/shared/ui/app/app-button.tsx` | Ant `Button` |
| `AppCard` | `admin/shared/ui/app/app-card.tsx` | shadcn `Card` |
| `AppModal` | `admin/shared/ui/app/app-modal.tsx` | Ant `Modal` |
| `AppTable` | `admin/shared/ui/app/app-table.tsx` | Ant `Table` |
| `AppInput` | `admin/shared/ui/app/app-input.tsx` | Ant `Input` |
| `AppSelect` | `admin/shared/ui/app/app-select.tsx` | Ant `Select` |
| `AppStatusBadge` | `admin/shared/ui/app/app-status-badge.tsx` | Styles type badge + tokens CSS |

Import recommandé : `import { AppTable, … } from "@/admin/shared/ui/app"`.

| Wrapper | Rôle |
|---------|------|
| `AppButton` | Bouton Ant unique pour actions CRUD / barres d’outils |
| `AppCard` | Carte shadcn + API stable (titre, description, footer) |
| `AppModal` | Modal Ant avec défauts (destroyOnClose, cohérence) |
| `AppTable` | Table Ant avec pagination/scroll par défaut |
| `AppInput` | Input Ant + styles cohérents |
| `AppSelect` | Select Ant + défauts (`optionFilterProp`, `showSearch` optionnel) |
| `AppStatusBadge` | Statuts métier (`success`, `warning`, `danger`, `info`, `neutral`, `pending`) |

**Stratégie** : les features importent **`@/admin/shared/ui/app`**. Les primitives brutes (Ant/shadcn) ne sont utilisées **directement** que dans les wrappers ou cas documentés (ex. layout shell).

---

## 6. Convention de style commune

- **Couleurs** : `var(--primary)`, `var(--foreground)`, `var(--muted-foreground)`, `var(--border)`, `var(--destructive)`, `var(--sidebar-*)`, etc. Référence centralisée : `theme/tokens.ts` (`token` / `cssVar`). Guide : `theme/README.md`.
- **Rayons** : préférer `rounded-xl` / tokens `--radius` plutôt que des valeurs arbitraires multiples.
- **Espacements** : grille Tailwind cohérente (`gap-4`, `p-4 md:p-6` dans le shell).
- **Typographie** : familles déjà posées sur `body` (`globals.css`) ; pas de `font-family` inline hors cas exceptionnel.

---

## 7. Règles CSS / thème

- Les **tokens sémantiques** vivent dans `app/globals.css` (`.light` / `.dark` sur `<html>`).
- **`theme/tokens.ts`** expose les `var(--*)` pour le JS ; **`theme/antd-theme.ts`** et **`theme/mui-theme.ts`** mappent Ant/MUI sur ces variables (pas de palette dupliquée).
- **`admin/lib/css-vars.ts`** reste un réexport déprécié vers `@/theme/tokens`.
- Toute **nouvelle couleur sémantique** : d’abord `globals.css`, puis entrée dans `theme/tokens.ts` si besoin côté JS.

---

## 8. Règles d’accessibilité

- **Focus visible** : ne pas retirer `outline` sans alternative (`focus-visible:ring-*` déjà dans les boutons shadcn ; Ant hérite du thème).
- **Modales** : privilégier **`AppModal`** (Ant gère focus trap et `aria-modal`) ; pour les confirmations destructives, **`AlertDialog`** + libellés explicites.
- **Icônes décoratives** : `aria-hidden` sur l’icône si le texte visible porte le sens.
- **Tableaux** : colonnes avec titres clairs ; actions avec `aria-label` si icône seule.

---

## 9. Règles responsive

- **Shell** : sidebar desktop + `Drawer` &lt; breakpoint défini dans `admin/layout/AdminLayout.tsx` (Grid Ant).
- **Tables** : **`AppTable`** impose `scroll={{ x: 'max-content' }}` ; ne pas supprimer sans alternative mobile.
- **Grilles de cartes** : `grid` + `sm:` / `xl:` breakpoints Tailwind pour les KPI.

---

## 10. Règles de nommage

| Élément | Convention |
|---------|------------|
| Wrappers admin | Préfixe **`App`** + PascalCase : `AppTable`, `AppModal` |
| Features | Dossier `admin/features/<domaine>/` (kebab-case ou singulier métier) |
| Composants locaux à une feature | Préfixe optionnel du domaine : `UsersFilters`, `ReservationRow` |
| Fichiers | `kebab-case.tsx` pour les composants React |

---

## 11. Formulaires CRUD

- **Structure** : `Form` + `Form.Item` Ant ; labels et validation via règles Ant.
- **Champs** : **`AppInput`**, **`AppSelect`**, composants Ant spécialisés (`DatePicker`, etc.) pour rester cohérents.
- **Soumission** : `Button` / **`AppButton`** `htmlType="submit"` dans le `Form`.
- **Feedback** : `message` / `notification` Ant pour succès/erreur API ; erreurs champ via `Form.Item` `help`/`validateStatus`.

---

## 12. Tableaux admin

- **Liste** : **`AppTable`** uniquement ; `columns` typées ; `rowKey` stable (id).
- **Pagination** : côté serveur si volume important ; sinon conserver les défauts du wrapper.
- **Ligne cliquable** : `onRow` + style `cursor-pointer` ; ne pas imbriquer de boutons sans gestion du clic ligne.
- **Actions** : colonne « Actions » avec **`AppButton`** `type="link"` ou `size="small"`.

---

## Révision

Ce document doit être mis à jour lors de l’ajout d’un **nouveau wrapper** ou d’un **cas d’usage MUI** documenté.
