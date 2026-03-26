/**
 * Références **uniquement** vers les variables CSS définies dans `app/globals.css`
 * (blocs `.light` / `.dark` + primitives `:root`).
 *
 * Usage : `style={{ color: token.foreground }}`, thèmes Ant/MUI, ou `className="bg-background"`.
 * Ne pas y mettre de couleurs littérales — ajouter d’abord le token sémantique dans `globals.css`.
 */
export const token = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  warning: "var(--warning)",
  warningForeground: "var(--warning-foreground)",
  popover: "var(--popover)",
  popoverForeground: "var(--popover-foreground)",
  sidebar: "var(--sidebar)",
  sidebarForeground: "var(--sidebar-foreground)",
  sidebarPrimary: "var(--sidebar-primary)",
  sidebarBorder: "var(--sidebar-border)",
  radius: "var(--radius)",
  chart1: "var(--chart-1)",
  chart2: "var(--chart-2)",
  chart3: "var(--chart-3)",
  chart4: "var(--chart-4)",
  chart5: "var(--chart-5)",
  /** Tokens SCSS miroir (`globals.scss` :root) — alignement zones auth / marketing */
  dsBrandPrimary: "var(--ds-brand-primary)",
  dsTextMuted: "var(--ds-text-muted)",
  dsBorderDefault: "var(--ds-border-default)",
  stateSuccess: "var(--ds-state-success)",
  stateDanger: "var(--ds-state-danger)",
} as const;

export type TokenKey = keyof typeof token;

/**
 * @deprecated Utilisez `token` — alias historique pour imports existants.
 */
export const cssVar = token;

export type CssVarKey = keyof typeof token;
