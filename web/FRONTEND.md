# Frontend — e-conciergerie (`web/`)

Documentation interne courte. Stack : **Next.js (App Router)**, **TypeScript**, **Tailwind**, **Ant Design** (admin), **shadcn/ui**, **MUI** (ponctuel).

## Démarrage

```bash
npm install
npm run dev
```

## Liens utiles

| Sujet | Fichier |
|--------|---------|
| **Bonnes pratiques admin (architecture, CRUD, API, a11y)** | [`docs/ADMIN_FRONTEND_PRACTICES.md`](docs/ADMIN_FRONTEND_PRACTICES.md) |
| **UI : quand Ant / shadcn / MUI** | [`docs/ADMIN_UI_CONVENTIONS.md`](docs/ADMIN_UI_CONVENTIONS.md) |
| **Design tokens & thèmes** | [`theme/README.md`](theme/README.md) |
| **Arborescence admin & features** | [`admin/README.md`](admin/README.md) |

## Règles d’or

1. Couleurs : **`app/globals.css`** + `theme/tokens.ts` — pas de hex dans les features.
2. Listes CRUD : kit **`@/admin/crud`** + module sous **`admin/features/<domaine>/`**.
3. Wrappers UI admin : **`@/admin/shared/ui/app`** (`AppTable`, `AppButton`, …).

## Structure racine (rappel)

- `app/` — routes et layouts.
- `admin/` — back-office.
- `components/ui/` — shadcn.
- `theme/` — tokens et thèmes Ant/MUI.
- `lib/` — utilitaires partagés.

Pour le détail : **`docs/ADMIN_FRONTEND_PRACTICES.md`**.
