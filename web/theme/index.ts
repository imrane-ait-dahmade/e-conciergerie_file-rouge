/**
 * Design tokens & thèmes — point d’entrée unique.
 * Voir `theme/README.md` pour la stratégie.
 */
export { getAntdTheme } from "@/theme/antd-theme";
export { muiTheme } from "@/theme/mui-theme";
export { token, cssVar, type CssVarKey, type TokenKey } from "@/theme/tokens";
export type { ThemeMode } from "@/theme/types";
export { getThemeModeFromDocument, readCssVar } from "@/theme/css-var-helpers";
