"use client";

import { Modal, Spin, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GeographieTableToolbar } from "@/components/admin/geographie/geographie-table-toolbar";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  deleteDistrict,
  fetchDistricts,
  mapDistrictToTableRow,
  type DistrictTableRow,
} from "@/lib/api/districts";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

import { QuartiersTableBodyRow, QuartiersTableHeadRow } from "./columns";
import { DistrictFormModal, type DistrictFormInitialData } from "./district-form-modal";

type Labels = CommonDictionary["adminGeographie"];

type QuartiersTableProps = {
  labels: Labels;
  className?: string;
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function QuartiersTable({ labels, className }: QuartiersTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<DistrictTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DistrictFormInitialData | undefined>();

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetchDistricts({ page: 1, limit: 100 });
      setRows(res.data.map(mapDistrictToTableRow));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger les quartiers.";
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
        row.ville.toLowerCase().includes(q) ||
        row.pays.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const openCreate = () => {
    setSelectedItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (row: DistrictTableRow) => {
    setSelectedItem({
      id: row.id,
      name: row.nom,
      cityId: row.cityId,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(undefined);
  };

  const confirmDelete = (row: DistrictTableRow) => {
    const name = row.nom;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteDistrict(row.id);
          message.success(labels.deleteSuccess);
          await loadList();
        } catch (e) {
          message.error(e instanceof Error ? e.message : "Suppression impossible.");
        }
      },
    });
  };

  const { toolbar, quartiersColumns: columns } = labels;

  return (
    <div
      className={cn(
        "mx-2 my-4 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]",
        className,
      )}
    >
      <DistrictFormModal
        open={modalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        onSuccess={() => void loadList()}
      />

      <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
        <GeographieTableToolbar
          sectionTitle={toolbar.listQuartiers}
          searchPlaceholder={toolbar.searchPlaceholder}
          filterLabel={toolbar.filter}
          addLabel={toolbar.addQuartier}
          query={query}
          onQueryChange={setQuery}
          onAddClick={openCreate}
        />

        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background p-6 shadow-inner sm:p-8 lg:p-10">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
              <Spin size="large" />
              <p className="text-sm text-muted-foreground">Chargement des quartiers…</p>
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm text-destructive">{listError}</p>
              <Button type="button" variant="outline" onClick={() => void loadList()}>
                Réessayer
              </Button>
            </div>
          ) : (
            <Table className="min-w-[560px] border-separate border-spacing-x-0 border-spacing-y-3">
              <TableHeader>
                <QuartiersTableHeadRow columns={columns} />
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/20">
                {filtered.map((quartier) => (
                  <QuartiersTableBodyRow
                    key={quartier.id}
                    quartier={quartier}
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
