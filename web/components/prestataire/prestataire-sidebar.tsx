"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MenuProps } from "antd";
import { Layout, Menu, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShopOutlined,
  LinkOutlined,
  CheckSquareOutlined,
  PictureOutlined,
  LineChartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

import { useProviderSidebarAccess } from "@/hooks/use-provider-sidebar-access";
import { logoutSession } from "@/lib/api";
import { cn } from "@/lib/utils";

const { Sider } = Layout;

/** Aligné sur `CommonDictionary["providerSidebar"]`. */
export type PrestataireSidebarLabels = {
  title: string;
  sectionGeneral: string;
  sectionBusiness: string;
  dashboard: string;
  establishments: string;
  establishmentServices: string;
  caracteristiques: string;
  medias: string;
  statistics: string;
  profile: string;
  logout: string;
};

type MenuClickInfo = Parameters<NonNullable<MenuProps["onClick"]>>[0];

function prestataireBase(locale: string) {
  return `/${locale}/prestataire`;
}

/**
 * Barre latérale prestataire — même principe visuel que l’admin : Sider « glass » + Menu Ant Design.
 */
export function PrestataireSidebar({
  locale,
  labels,
  className,
}: {
  locale: string;
  labels: PrestataireSidebarLabels;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const base = prestataireBase(locale);
  const access = useProviderSidebarAccess();

  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  const menuItems = useMemo<MenuProps["items"]>(() => {
    const general: NonNullable<MenuProps["items"]>[number][] = [];
    if (access.canViewDashboard) {
      general.push({
        key: base,
        icon: <DashboardOutlined />,
        label: labels.dashboard,
      });
    }

    const business: NonNullable<MenuProps["items"]>[number][] = [];
    if (access.canViewEstablishments) {
      business.push({
        key: `${base}/etablissements`,
        icon: <ShopOutlined />,
        label: labels.establishments,
      });
    }
    if (access.canViewEstablishmentServices) {
      business.push({
        key: `${base}/services`,
        icon: <LinkOutlined />,
        label: labels.establishmentServices,
      });
    }
    if (access.canViewCaracteristiques) {
      business.push({
        key: `${base}/caracteristiques`,
        icon: <CheckSquareOutlined />,
        label: labels.caracteristiques,
      });
    }
    if (access.canViewMedias) {
      business.push({
        key: `${base}/medias`,
        icon: <PictureOutlined />,
        label: labels.medias,
      });
    }
    if (access.canViewStatistics) {
      business.push({
        key: `${base}/statistiques`,
        icon: <LineChartOutlined />,
        label: labels.statistics,
      });
    }
    if (access.canViewProfile) {
      business.push({
        key: `${base}/profil`,
        icon: <UserOutlined />,
        label: labels.profile,
      });
    }

    const items: MenuProps["items"] = [];
    if (general.length > 0) {
      items.push({
        type: "group",
        label: labels.sectionGeneral,
        children: general,
      });
    }
    if (business.length > 0) {
      items.push({
        type: "group",
        label: labels.sectionBusiness,
        children: business,
      });
    }
    return items;
  }, [
    access.canViewCaracteristiques,
    access.canViewDashboard,
    access.canViewEstablishmentServices,
    access.canViewEstablishments,
    access.canViewMedias,
    access.canViewProfile,
    access.canViewStatistics,
    base,
    labels,
  ]);

  const handleMenuClick = useCallback(
    (info: MenuClickInfo) => {
      const key = String(info.key);
      setSelectedKeys([key]);
      router.push(key);
    },
    [router],
  );

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
            onClick={() => setCollapsed((c) => !c)}
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
