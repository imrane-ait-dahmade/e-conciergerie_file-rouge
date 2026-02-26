# Historique Git proposé — frontend (e-conciergerie)

Suite logique après le backend (dernier commit **2026-02-11**).  
Commits **conventionnels**, **un commit tous les 2 jours** à partir du **2026-02-13**.

---

## 1. Chronologie (du plus ancien au plus récent)

| # | Date       | Commit |
|---|------------|--------|
| 1 | 2026-02-13 | `chore(web): scaffold Next.js App Router with locale middleware` |
| 2 | 2026-02-15 | `feat(styles): add shadcn/ui, globals and SCSS design tokens` |
| 3 | 2026-02-17 | `feat(home): implement homepage sections from Figma layout` |
| 4 | 2026-02-19 | `feat(auth): add login and signup pages with shared auth shell` |
| 5 | 2026-02-21 | `feat(api): add fetch client and NEXT_PUBLIC_API_URL wiring` |
| 6 | 2026-02-23 | `feat(auth): wire login and signup to NestJS /auth endpoints` |
| 7 | 2026-02-25 | `feat(auth): store access token in localStorage after login` |
| 8 | 2026-02-27 | `fix(ui): responsive layout for header, hero, and auth cards` |
| 9 | 2026-03-01 | `fix(ui): extract button-variants for server-safe header links` |
| 10 | 2026-03-03 | `chore(web): document local API URL in .env.local.example` |

---

## 2. Commandes Git (`GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE`)

À lancer **depuis la racine du dépôt** (ou adapter le chemin).  
Chaque ligne crée un commit **vide** dans l’ordre chronologique — utile pour **simuler** un historique sur une branche dédiée, ou à adapter si tu préfères des commits avec fichiers réels.

```bash
# Optionnel : branche dédiée
# git checkout -b chore/frontend-history-replay

commit_at() {
  local date="$1"
  shift
  GIT_AUTHOR_DATE="${date}T14:00:00" GIT_COMMITTER_DATE="${date}T14:00:00" git commit --allow-empty -m "$*"
}

commit_at 2026-02-13 "chore(web): scaffold Next.js App Router with locale middleware"
commit_at 2026-02-15 "feat(styles): add shadcn/ui, globals and SCSS design tokens"
commit_at 2026-02-17 "feat(home): implement homepage sections from Figma layout"
commit_at 2026-02-19 "feat(auth): add login and signup pages with shared auth shell"
commit_at 2026-02-21 "feat(api): add fetch client and NEXT_PUBLIC_API_URL wiring"
commit_at 2026-02-23 "feat(auth): wire login and signup to NestJS /auth endpoints"
commit_at 2026-02-25 "feat(auth): store access token in localStorage after login"
commit_at 2026-02-27 "fix(ui): responsive layout for header, hero, and auth cards"
commit_at 2026-03-01 "fix(ui): extract button-variants for server-safe header links"
commit_at 2026-03-03 "chore(web): document local API URL in .env.local.example"
```

**Note :** si ton dépôt est **mono-repo** et le frontend est dans `web/`, exécute ces commandes **à la racine du repo** ; les commits s’appliquent au dépôt entier. Pour n’historiser que le dossier `web/`, utilise plutôt un sous-module ou un dépôt `web` séparé, ou réécris l’historique avec des commits réels sur ces fichiers.

---

## 3. Variante : une commande par commit (copier-coller)

```bash
GIT_AUTHOR_DATE="2026-02-13T14:00:00" GIT_COMMITTER_DATE="2026-02-13T14:00:00" git commit --allow-empty -m "chore(web): scaffold Next.js App Router with locale middleware"
GIT_AUTHOR_DATE="2026-02-15T14:00:00" GIT_COMMITTER_DATE="2026-02-15T14:00:00" git commit --allow-empty -m "feat(styles): add shadcn/ui, globals and SCSS design tokens"
GIT_AUTHOR_DATE="2026-02-17T14:00:00" GIT_COMMITTER_DATE="2026-02-17T14:00:00" git commit --allow-empty -m "feat(home): implement homepage sections from Figma layout"
GIT_AUTHOR_DATE="2026-02-19T14:00:00" GIT_COMMITTER_DATE="2026-02-19T14:00:00" git commit --allow-empty -m "feat(auth): add login and signup pages with shared auth shell"
GIT_AUTHOR_DATE="2026-02-21T14:00:00" GIT_COMMITTER_DATE="2026-02-21T14:00:00" git commit --allow-empty -m "feat(api): add fetch client and NEXT_PUBLIC_API_URL wiring"
GIT_AUTHOR_DATE="2026-02-23T14:00:00" GIT_COMMITTER_DATE="2026-02-23T14:00:00" git commit --allow-empty -m "feat(auth): wire login and signup to NestJS /auth endpoints"
GIT_AUTHOR_DATE="2026-02-25T14:00:00" GIT_COMMITTER_DATE="2026-02-25T14:00:00" git commit --allow-empty -m "feat(auth): store access token in localStorage after login"
GIT_AUTHOR_DATE="2026-02-27T14:00:00" GIT_COMMITTER_DATE="2026-02-27T14:00:00" git commit --allow-empty -m "fix(ui): responsive layout for header, hero, and auth cards"
GIT_AUTHOR_DATE="2026-03-01T14:00:00" GIT_COMMITTER_DATE="2026-03-01T14:00:00" git commit --allow-empty -m "fix(ui): extract button-variants for server-safe header links"
GIT_AUTHOR_DATE="2026-03-03T14:00:00" GIT_COMMITTER_DATE="2026-03-03T14:00:00" git commit --allow-empty -m "chore(web): document local API URL in .env.local.example"
```

---

*Les heures `14:00:00` sont arbitraires ; ajuste le fuseau si besoin (ex. suffixe `+01:00`).*
