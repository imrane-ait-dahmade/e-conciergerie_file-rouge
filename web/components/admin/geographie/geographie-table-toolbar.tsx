"use client";

import { Filter, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type GeographieTableToolbarProps = {
  sectionTitle: string;
  searchPlaceholder: string;
  filterLabel: string;
  addLabel: string;
  query: string;
  onQueryChange: (value: string) => void;
  onAddClick?: () => void;
};

const toolbarBtn =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2.5 rounded-lg px-6 py-2.5 text-sm font-medium";

/**
 * Barre titre + recherche + actions — même structure pour Pays / Villes / Quartiers.
 */
export function GeographieTableToolbar({
  sectionTitle,
  searchPlaceholder,
  filterLabel,
  addLabel,
  query,
  onQueryChange,
  onAddClick,
}: GeographieTableToolbarProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-border/60 pb-8">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem]">{sectionTitle}</h2>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-[1.125rem] -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="h-12 min-h-12 rounded-lg pl-12 pr-4 text-base md:h-11 md:min-h-11 md:text-sm"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label={searchPlaceholder}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-4">
          <Button type="button" variant="outline" className={toolbarBtn}>
            <Filter className="size-4 shrink-0" aria-hidden />
            {filterLabel}
          </Button>
          <Button type="button" className={toolbarBtn} onClick={onAddClick}>
            <Plus className="size-4 shrink-0" aria-hidden />
            {addLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
