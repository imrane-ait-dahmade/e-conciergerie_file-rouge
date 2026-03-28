import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Wraps all prestataire pages: consistent width and horizontal alignment.
 */
export function ProviderDashboardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl", className)}>{children}</div>;
}

/**
 * Simple page title block for placeholder pages or lightweight routes.
 * Feature sections often render their own header instead.
 */
export function ProviderPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
