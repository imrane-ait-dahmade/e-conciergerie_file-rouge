import { createTheme } from "@mui/material/styles";

/**
 * Thème MUI minimal pour les usages ponctuels (admin).
 *
 * **Important** : `createTheme()` exige des couleurs au format `#`, `rgb()`, etc. pour `palette.*.main`.
 * Les chaînes `var(--token)` ne sont **pas** acceptées — d’où la palette MUI par défaut (mode clair).
 * L’alignement visuel global reste assuré par **Ant Design** + **shadcn** + `globals.css`.
 *
 * Pour styler un composant MUI avec les tokens du projet : `sx={{ color: "var(--primary)" }}` ou `className`.
 */
export const muiTheme = createTheme({
  palette: {
    mode: "light",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "var(--font-sans)",
    h1: { fontFamily: "var(--font-heading)" },
    h2: { fontFamily: "var(--font-heading)" },
    h3: { fontFamily: "var(--font-heading)" },
    h4: { fontFamily: "var(--font-heading)" },
    h5: { fontFamily: "var(--font-heading)" },
    h6: { fontFamily: "var(--font-heading)" },
  },
});
