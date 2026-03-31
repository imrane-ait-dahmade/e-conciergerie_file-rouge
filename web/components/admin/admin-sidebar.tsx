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
  TeamOutlined,
  ShopOutlined,
  LinkOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

import { useAdminSidebarAccess } from "@/hooks/use-admin-sidebar-access";
import { logoutSession } from "@/lib/api";
import { cn } from "@/lib/utils";

const { Sider } = Layout;

/** Aligné sur `CommonDictionary["adminSidebar"]`. */
export type AdminSidebarLabels = {
  title: string;
  sectionGeneral: string;
  sectionLocation: string;
  sectionManagement: string;
  sectionSystem: string;
  dashboard: string;
  locationReferential: string;
  users: string;
  etablissements: string;
  etablissementServices: string;
  reservations: string;
  services: string;
  settings: string;
  logout: string;
};

export type AdminSidebarProps = {
  locale: string;
  labels: AdminSidebarLabels;
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

function adminBasePath(locale: string) {
  return `/${locale}/admin`;
}

/**
 * Barre latérale admin — sections (général, localisation, gestion, système) + tokens thème.
 */
export function AdminSidebar({
  locale,
  labels,
  collapsed: externalCollapsed,
  onCollapse,
  className,
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
  const access = useAdminSidebarAccess();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const base = adminBasePath(locale);

  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [];

    pushGroup(
      labels.sectionGeneral,
      [
        createMenuItem(
          base,
          labels.dashboard,
          <DashboardOutlined />,
          access.canViewDashboard,
        ),
      ],
      items,
    );

    pushGroup(
      labels.sectionLocation,
      [
        createMenuItem(
          `${base}/geographie`,
          labels.locationReferential,
          <EnvironmentOutlined />,
          access.canViewLocation,
        ),
      ],
      items,
    );

    pushGroup(
      labels.sectionManagement,
      [
        createMenuItem(
          `${base}/users`,
          labels.users,
          <TeamOutlined />,
          access.canViewUsers,
        ),
        createMenuItem(
          `${base}/etablissements`,
          labels.etablissements,
          <ShopOutlined />,
          access.canViewEtablissements,
        ),
        createMenuItem(
          `${base}/etablissement-services`,
          labels.etablissementServices,
          <LinkOutlined />,
          access.canViewEtablissementServices,
        ),
        createMenuItem(
          `${base}/reservations`,
          labels.reservations,
          <CalendarOutlined />,
          access.canViewReservations,
        ),
        createMenuItem(
          `${base}/services`,
          labels.services,
          <AppstoreOutlined />,
          access.canViewServices,
        ),
      ],
      items,
    );

    pushGroup(
      labels.sectionSystem,
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
    access.canViewDashboard,
    access.canViewLocation,
    access.canViewEtablissements,
    access.canViewReservations,
    access.canViewServices,
    access.canViewSettings,
    access.canViewUsers,
    base,
    labels.dashboard,
    labels.locationReferential,
    labels.etablissements,
    labels.etablissementServices,
    labels.reservations,
    labels.sectionGeneral,
    labels.sectionLocation,
    labels.sectionManagement,
    labels.sectionSystem,
    labels.services,
    labels.settings,
    labels.users,
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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutSession();
    } finally {
      setLoggingOut(false);
      router.replace(`/${locale}/login`);
      router.refresh();
    }
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
        "sidebar-glass flex min-h-0 flex-col !border-r !border-border/80 shadow-[1px_0_0_0_color-mix(in_oklch,var(--foreground)_6%,transparent)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="border-b border-border/70 p-3">
        <div className="flex items-center justify-between gap-2">
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {labels.title}
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

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className="admin-sidebar-menu !border-0 bg-transparent font-medium"
          />
        </div>
        <div className="border-t border-border/70 p-2">
          <Button
            type="text"
            danger
            block
            loading={loggingOut}
            icon={<LogoutOutlined />}
            onClick={() => void handleLogout()}
            className="justify-start text-muted-foreground hover:!text-destructive"
            title={labels.logout}
          >
            {!collapsed ? labels.logout : null}
          </Button>
        </div>
      </div>
    </Sider>
  );
}

export default AdminSidebar;
