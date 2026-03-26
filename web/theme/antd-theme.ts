import type { ThemeConfig } from "antd";

import { token } from "@/theme/tokens";

/**
 * Thème Ant Design : toutes les couleurs passent par `var(--*)` résolu au runtime depuis `globals.css`.
 * Le mode clair/sombre suit la classe sur `<html>` (`.light` / `.dark`).
 */
export function getAntdTheme(): ThemeConfig {
  return {
    token: {
      borderRadius: 8,
      colorPrimary: token.primary,
      colorInfo: token.primary,
      colorSuccess: token.stateSuccess,
      colorWarning: token.warning,
      colorError: token.destructive,
      colorBgBase: token.background,
      colorBgContainer: token.card,
      colorBgElevated: token.popover,
      colorBgLayout: token.background,
      colorText: token.foreground,
      colorTextSecondary: token.mutedForeground,
      colorTextDescription: token.mutedForeground,
      colorTextHeading: token.foreground,
      colorBorder: token.border,
      colorBorderSecondary: token.border,
      colorSplit: token.border,
      controlItemBgHover: token.muted,
      controlOutline: token.ring,
    },
    components: {
      Layout: {
        bodyBg: token.background,
        headerBg: token.card,
        headerHeight: 56,
        headerPadding: "0 16px",
        siderBg: token.sidebar,
        triggerBg: token.sidebar,
        triggerColor: token.sidebarForeground,
      },
      Menu: {
        itemBg: token.sidebar,
        itemColor: token.sidebarForeground,
        itemHoverBg: token.muted,
        itemHoverColor: token.foreground,
        itemSelectedBg: token.accent,
        itemSelectedColor: token.accentForeground,
        subMenuItemBg: token.sidebar,
      },
      Table: {
        headerBg: token.muted,
        headerColor: token.foreground,
        rowHoverBg: token.muted,
        borderColor: token.border,
      },
      Card: {
        colorBgContainer: token.card,
      },
      Modal: {
        contentBg: token.popover,
        headerBg: token.popover,
        titleColor: token.foreground,
      },
      Drawer: {
        colorBgElevated: token.popover,
        colorText: token.foreground,
      },
      Pagination: {
        itemActiveBg: token.accent,
      },
    },
  };
}
