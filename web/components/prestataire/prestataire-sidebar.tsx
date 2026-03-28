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
  LineChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

const { Sider } = Layout;

/** Aligné sur `CommonDictionary["providerSidebar"]` (sans entrée Médias dans le menu). */
export type PrestataireSidebarLabels = {
  title: string;
  sectionGeneral: string;
  sectionBusiness: string;
  dashboard: string;
  establishments: string;
  establishmentServices: string;
  caracteristiques: string;
  statistics: string;
  profile: string;
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

  const base = prestataireBase(locale);

  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        type: "group",
        label: labels.sectionGeneral,
        children: [
          {
            key: base,
            icon: <DashboardOutlined />,
            label: labels.dashboard,
          },
        ],
      },
      {
        type: "group",
        label: labels.sectionBusiness,
        children: [
          {
            key: `${base}/etablissements`,
            icon: <ShopOutlined />,
            label: labels.establishments,
          },
          {
            key: `${base}/services`,
            icon: <LinkOutlined />,
            label: labels.establishmentServices,
          },
          {
            key: `${base}/caracteristiques`,
            icon: <CheckSquareOutlined />,
            label: labels.caracteristiques,
          },
          {
            key: `${base}/statistiques`,
            icon: <LineChartOutlined />,
            label: labels.statistics,
          },
          {
            key: `${base}/profil`,
            icon: <UserOutlined />,
            label: labels.profile,
          },
        ],
      },
    ],
    [base, labels],
  );

  const handleMenuClick = useCallback(
    (info: MenuClickInfo) => {
      const key = String(info.key);
      setSelectedKeys([key]);
      router.push(key);
    },
    [router],
  );

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

      <div className="flex max-h-[calc(100vh-8rem)] flex-1 flex-col overflow-hidden overflow-y-auto">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-sidebar-menu !border-0 bg-transparent font-medium"
        />
      </div>
    </Sider>
  );
}
