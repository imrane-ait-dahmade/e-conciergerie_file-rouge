"use client";

import { Modal, Spin, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GeographieTableToolbar } from "@/components/admin/geographie/geographie-table-toolbar";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  deleteCountry,
  fetchCountries,
  mapCountryToTableRow,
  type CountryTableRow,
} from "@/lib/api/countries";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

import { PaysTableBodyRow, PaysTableHeadRow } from "./columns";
import { CountryFormModal, type CountryFormInitialData } from "./country-form-modal";

type Labels = CommonDictionary["adminGeographie"];

type PaysTableProps = {
  labels: Labels;
  className?: string;
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function PaysTable({ labels, className }: PaysTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<CountryTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CountryFormInitialData | undefined>();

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetchCountries({ page: 1, limit: 100 });
      setRows(res.data.map(mapCountryToTableRow));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger les pays.";
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
        row.code.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const openCreate = () => {
    setSelectedItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (row: CountryTableRow) => {
    setSelectedItem({
      id: row.id,
      name: row.nom,
      code: row.code || undefined,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(undefined);
  };

  const confirmDelete = (row: CountryTableRow) => {
    const name = row.nom;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCountry(row.id);
          message.success(labels.deleteSuccess);
          await loadList();
        } catch (e) {
          message.error(e instanceof Error ? e.message : "Suppression impossible.");
        }
      },
    });
  };

  const { toolbar, paysColumns: columns } = labels;

  return (
    <div
      className={cn(
        "mx-2 my-4 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]",
        className,
      )}
    >
      <CountryFormModal
        open={modalOpen}
        onClose={closeModal}
        initialData={selectedItem}
        onSuccess={() => void loadList()}
      />

      <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
        <GeographieTableToolbar
          sectionTitle={toolbar.listPays}
          searchPlaceholder={toolbar.searchPlaceholder}
          filterLabel={toolbar.filter}
          addLabel={toolbar.addPays}
          query={query}
          onQueryChange={setQuery}
          onAddClick={openCreate}
        />

        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background p-6 shadow-inner sm:p-8 lg:p-10">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
              <Spin size="large" />
              <p className="text-sm text-muted-foreground">Chargement des pays…</p>
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
                <PaysTableHeadRow columns={columns} />
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/20">
                {filtered.map((pays) => (
                  <PaysTableBodyRow
                    key={pays.id}
                    pays={pays}
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
