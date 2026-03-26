# Design tokens (e-conciergerie)

## Principe

1. **`app/globals.css`** — seule source de vérité pour les couleurs : primitives `:root`, puis sémantique **`.light`** / **`.dark`** sur `<html>`.
2. **`theme/tokens.ts`** — alias TypeScript `var(--nom)` pour le JS (Ant Design, MUI, `style={{}}`, graphiques). **Aucun hex** dans le code applicatif.
3. **Tailwind + shadcn** — `@theme inline` mappe déjà `--background`, `--primary`, etc. vers `bg-background`, `text-primary`, …
4. **Ant Design** — `getAntdTheme()` (`theme/antd-theme.ts`) injecte les mêmes `var(--*)` dans les tokens Ant.
5. **MUI** — `muiTheme` (`theme/mui-theme.ts`) : palette par défaut (MUI n’accepte pas `var(--*)` dans `palette.*.main` au moment de `createTheme`). Pour un composant MUI ponctuel, utiliser `sx={{ color: "var(--primary)" }}` ou classes Tailwind.

## Ajouter un token

1. Définir `--mon-token` sous `.light` et `.dark` dans `globals.css` (oklch recommandé).
2. Optionnel : exposer `--color-mon-token: var(--mon-token)` dans `@theme inline` si besoin d’utilitaires Tailwind.
3. Ajouter `monToken: "var(--mon-token)"` dans `theme/tokens.ts`.
4. Utiliser `token.monToken` ou `bg-[var(--mon-token)]` — pas de couleur brute.

## Dark mode

Basculer la classe sur `<html>` : `light` ↔ `dark` (déjà documenté dans `globals.css`). Les `var(--*)` se mettent à jour ; Ant/MUI/shadcn suivent sans changement de code.

## Imports

```ts
import { token, getAntdTheme, muiTheme } from "@/theme";
```

