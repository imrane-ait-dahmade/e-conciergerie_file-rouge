import { requireApiBase, headersBearerAuth } from "@/lib/api/client";
import { throwIfNotOk } from "@/lib/api/read-json-error";
import type { AdminDashboardStats } from "@/lib/types/admin-dashboard-stats";

/**
 * Statistiques agrégées pour le tableau de bord admin.
 * `GET /admin/dashboard/stats` — JWT rôle `admin`.
 */
export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const base = requireApiBase();
  const res = await fetch(`${base}/admin/dashboard/stats`, {
    method: "GET",
    headers: headersBearerAuth(),
    cache: "no-store",
  });
  await throwIfNotOk(res);
  return res.json() as Promise<AdminDashboardStats>;
}
