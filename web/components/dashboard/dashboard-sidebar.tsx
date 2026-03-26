"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MenuProps } from "antd";
import { Layout, Menu, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  CalendarOutlined,
  HeartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

import { useDashboardSidebarAccess } from "@/hooks/use-dashboard-sidebar-access";
import { cn } from "@/lib/utils";

const { Sider } = Layout;

/** Aligné sur `CommonDictionary["dashboardSidebar"]`. */
export type DashboardSidebarLabels = {
  management: string;
  sectionGeneral: string;
  sectionLocation: string;
  sectionActivity: string;
  sectionAccount: string;
  locationExplorer: string;
  placeholderLead: string;
  overview: string;
  activity: string;
  reservations: string;
  favorites: string;
  settings: string;
};

export type DashboardSidebarProps = {
  locale: string;
  labels: DashboardSidebarLabels;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
};

type MenuItem = NonNullable<MenuProps["items"]>[number];
type MenuClickInfo = Parameters<NonNullable<MenuProps["onClick"]>>[0];

function createMenuItem(
  key: string,
  label: string,
  icon: React.ReactNode,
  condition: boolean,
): MenuItem | null {
  if (!condition) return null;
  return { key, icon, label };
}

function pushGroup(label: string, children: MenuItem[], acc: MenuItem[]) {
  const filtered = children.filter(Boolean) as MenuItem[];
  if (filtered.length === 0) return;
  acc.push({ type: "group", label, children: filtered });
}

function dashboardBasePath(locale: string) {
  return `/${locale}/dashboard`;
}

/**
 * Barre latérale espace connecté — Ant Design Sider + Menu (repli), sections groupées.
 */
export function DashboardSidebar({
  locale,
  labels,
  collapsed: externalCollapsed,
  onCollapse,
  className,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
  const access = useDashboardSidebarAccess();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const base = dashboardBasePath(locale);

  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [];

    pushGroup(
      labels.sectionGeneral,
      [createMenuItem(base, labels.overview, <DashboardOutlined />, access.canViewOverview)],
      items,
    );

    pushGroup(
      labels.sectionLocation,
      [
        createMenuItem(
          `${base}/location`,
          labels.locationExplorer,
          <EnvironmentOutlined />,
          access.canViewLocation,
        ),
      ],
      items,
    );

    pushGroup(
      labels.sectionActivity,
      [
        createMenuItem(
          `${base}/activity`,
          labels.activity,
          <LineChartOutlined />,
          access.canViewActivity,
        ),
        createMenuItem(
          `${base}/reservations`,
          labels.reservations,
          <CalendarOutlined />,
          access.canViewReservations,
        ),
        createMenuItem(
          `${base}/favorites`,
          labels.favorites,
          <HeartOutlined />,
          access.canViewFavorites,
        ),
      ],
      items,
    );

    pushGroup(
      labels.sectionAccount,
      [
        createMenuItem(
          `${base}/settings`,
          labels.settings,
          <SettingOutlined />,
          access.canViewSettings,
        ),
      ],
      items,
    );

    return items;
  }, [
    access.canViewActivity,
    access.canViewFavorites,
    access.canViewLocation,
    access.canViewOverview,
    access.canViewReservations,
    access.canViewSettings,
    base,
    labels.activity,
    labels.favorites,
    labels.locationExplorer,
    labels.overview,
    labels.reservations,
    labels.sectionAccount,
    labels.sectionActivity,
    labels.sectionGeneral,
    labels.sectionLocation,
    labels.settings,
  ]);

  const handleMenuClick: MenuProps["onClick"] = useCallback(
    (info: MenuClickInfo) => {
      const key = String(info.key);
      setSelectedKeys([key]);
      router.push(key);
    },
    [router],
  );

  const handleCollapse = () => {
    const next = !collapsed;
    if (onCollapse) onCollapse(next);
    else setInternalCollapsed(next);
  };

  return (
    <Sider
      data-glass-sidebar
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      collapsedWidth={72}
      className={cn(
        "sidebar-glass min-h-0 !border-r !border-border/80 shadow-[1px_0_0_0_color-mix(in_oklch,var(--foreground)_6%,transparent)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="border-b border-border/70 p-3">
        <div className="flex items-center justify-between gap-2">
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {labels.management}
              </span>
            </div>
          ) : null}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleCollapse}
            className="sidebar-collapse-trigger shrink-0 text-muted-foreground hover:!bg-muted hover:!text-foreground"
            aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          />
        </div>
      </div>

      <div className="flex max-h-[calc(100vh-8rem)] flex-1 flex-col overflow-hidden">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          className="dashboard-sidebar-menu !border-0 bg-transparent font-medium"
        />
      </div>
    </Sider>
  );
}

export default DashboardSidebar;
