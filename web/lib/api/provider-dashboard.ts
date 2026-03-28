import { getAccessToken } from "@/lib/auth-storage";
import { MOCK_PROVIDER_DASHBOARD_OVERVIEW } from "@/lib/mock/provider-dashboard-overview";
import type { ProviderDashboardOverview } from "@/lib/types/provider-dashboard-overview";

/**
 * Charge la vue d’ensemble prestataire.
 * 1. Si `NEXT_PUBLIC_API_URL` + JWT : GET /provider/dashboard/overview
 * 2. Sinon : données mock (démo / hors ligne)
 */
export async function fetchProviderDashboardOverview(): Promise<ProviderDashboardOverview> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) {
    return { ...MOCK_PROVIDER_DASHBOARD_OVERVIEW, generatedAt: new Date().toISOString() };
  }

  const token = getAccessToken();
  if (!token) {
    return { ...MOCK_PROVIDER_DASHBOARD_OVERVIEW, generatedAt: new Date().toISOString() };
  }

  try {
    const res = await fetch(`${base}/provider/dashboard/overview`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return { ...MOCK_PROVIDER_DASHBOARD_OVERVIEW, generatedAt: new Date().toISOString() };
    }
    return res.json() as Promise<ProviderDashboardOverview>;
  } catch {
    return { ...MOCK_PROVIDER_DASHBOARD_OVERVIEW, generatedAt: new Date().toISOString() };
  }
}
