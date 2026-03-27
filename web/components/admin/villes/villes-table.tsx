"use client";

import { Modal, Spin, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GeographieTableToolbar } from "@/components/admin/geographie/geographie-table-toolbar";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteCity, fetchCities, mapCityToTableRow, type CityTableRow } from "@/lib/api/cities";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

import { VillesTableBodyRow, VillesTableHeadRow } from "./columns";
import { CityFormModal, type CityFormInitialData } from "./city-form-modal";

type Labels = CommonDictionary["adminGeographie"];

type VillesTableProps = {
  labels: Labels;
  className?: string;
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function VillesTable({ labels, className }: VillesTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CityTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CityFormInitialData | undefined>();

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetchCities({ page: 1, limit: 100 });
      setRows(res.data.map(mapCityToTableRow));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger les villes.";
      setListError(msg);
      message.error(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.nom.toLowerCase().includes(q) ||
        row.pays.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const openCreate = () => {
    setSelectedItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (row: CityTableRow) => {
    setSelectedItem({
      id: row.id,
      name: row.nom,
      countryId: row.countryId,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(undefined);
  };

  const confirmDelete = (row: CityTableRow) => {
    const name = row.nom;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCity(row.id);
          message.success(labels.deleteSuccess);
          await loadList();
        } catch (e) {
          message.error(e instanceof Error ? e.message : "Suppression impossible.");
        }
      },
    });
  };

  const { toolbar, villesColumns: columns } = labels;

  return (
    <div
      className={cn(
        "mx-2 my-4 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]",
        className,
      )}
    >
      <CityFormModal
        open={modalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        onSuccess={() => void loadList()}
      />

      <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
        <GeographieTableToolbar
          sectionTitle={toolbar.listVilles}
          searchPlaceholder={toolbar.searchPlaceholder}
          filterLabel={toolbar.filter}
          addLabel={toolbar.addVille}
          query={query}
          onQueryChange={setQuery}
          onAddClick={openCreate}
        />

        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background p-6 shadow-inner sm:p-8 lg:p-10">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
              <Spin size="large" />
              <p className="text-sm text-muted-foreground">Chargement des villes…</p>
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm text-destructive">{listError}</p>
              <Button type="button" variant="outline" onClick={() => void loadList()}>
                Réessayer
              </Button>
            </div>
          ) : (
            <Table className="min-w-[480px] border-separate border-spacing-x-0 border-spacing-y-3">
              <TableHeader>
                <VillesTableHeadRow columns={columns} />
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/20">
                {filtered.map((ville) => (
                  <VillesTableBodyRow
                    key={ville.id}
                    ville={ville}
                    columns={columns}
                    onEdit={openEdit}
                    onDelete={confirmDelete}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
