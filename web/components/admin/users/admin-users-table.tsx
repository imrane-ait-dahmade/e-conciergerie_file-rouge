"use client";

import { Modal, Spin, Switch, message } from "antd";
import { Filter, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  deleteAdminUser,
  fetchAdminUsers,
  patchAdminUserStatus,
  type AdminUser,
} from "@/lib/api/users-admin";
import type { CommonDictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";

import { UserFormModal } from "./user-form-modal";

type Labels = CommonDictionary["adminUsers"];

type AdminUsersTableProps = {
  labels: Labels;
  filterButtonLabel: string;
  locale: string;
  className?: string;
};

const th =
  "min-h-[4rem] px-4 py-4 text-left text-sm font-semibold text-foreground first:pl-8 last:pr-8";
const td =
  "px-4 py-5 text-sm leading-relaxed first:pl-8 last:pr-8 align-middle";

const toolbarBtn =
  "inline-flex h-11 min-h-11 items-center justify-center gap-2.5 rounded-lg px-6 py-2.5 text-sm font-medium";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function roleLabel(user: AdminUser, labels: Labels): string {
  const n = user.role?.name;
  if (n === "admin") return labels.roleAdmin;
  if (n === "prestataire") return labels.rolePrestataire;
  if (n === "client") return labels.roleClient;
  return user.role?.label ?? n ?? "—";
}

function formatDate(iso: string | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "ar" ? "ar" : locale === "en" ? "en" : "fr-FR", {
      dateStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function AdminUsersTable({ labels, filterButtonLabel, locale, className }: AdminUsersTableProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editUserId, setEditUserId] = useState<string | undefined>();
  const [editInitial, setEditInitial] = useState<AdminUser | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetchAdminUsers({ page: 1, limit: 100 });
      setRows(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : labels.loadError;
      setListError(msg);
      message.error(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [labels.loadError]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return rows;
    return rows.filter((u) => {
      const blob = `${u.nom} ${u.prenom} ${u.email} ${u.role?.name ?? ""} ${u.role?.label ?? ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [query, rows]);

  const openCreate = () => {
    setModalMode("create");
    setEditUserId(undefined);
    setEditInitial(null);
    setModalOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setModalMode("edit");
    setEditUserId(u.id);
    setEditInitial(u);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditUserId(undefined);
    setEditInitial(null);
  };

  const confirmDelete = (u: AdminUser) => {
    const name = `${u.prenom} ${u.nom}`.trim() || u.email;
    Modal.confirm({
      title: labels.deleteConfirmTitle,
      content: `${labels.deleteConfirmDescription}${name ? ` « ${name} »` : ""}`,
      okText: labels.deleteConfirmOk,
      cancelText: labels.deleteConfirmCancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAdminUser(u.id);
          message.success(labels.deleteSuccess);
          await loadList();
        } catch (e) {
          message.error(e instanceof Error ? e.message : "Suppression impossible.");
        }
      },
    });
  };

  const toggleStatus = async (u: AdminUser, next: boolean) => {
    setStatusBusyId(u.id);
    try {
      await patchAdminUserStatus(u.id, next);
      message.success(labels.statusUpdated);
      setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, isActive: next } : r)));
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setStatusBusyId(null);
    }
  };

  return (
    <div
      className={cn(
        "mx-2 my-4 rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]",
        className,
      )}
    >
      <UserFormModal
        open={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        userId={editUserId}
        initialUser={editInitial}
        onSuccess={() => void loadList()}
        labels={labels}
      />

      <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 border-b border-border/60 pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-[1.125rem] -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                className="h-12 min-h-12 rounded-lg pl-12 pr-4 text-base md:h-11 md:min-h-11 md:text-sm"
                placeholder={labels.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={labels.searchPlaceholder}
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-4">
              <Button type="button" variant="outline" className={toolbarBtn}>
                <Filter className="size-4 shrink-0" aria-hidden />
                {filterButtonLabel}
              </Button>
              <Button type="button" className={toolbarBtn} onClick={openCreate}>
                <Plus className="size-4 shrink-0" aria-hidden />
                {labels.addUser}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60 bg-background p-6 shadow-inner sm:p-8 lg:p-10">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
              <Spin size="large" />
              <p className="text-sm text-muted-foreground">{labels.loading}</p>
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm text-destructive">{listError}</p>
              <Button type="button" variant="outline" onClick={() => void loadList()}>
                {labels.retry}
              </Button>
            </div>
          ) : (
            <Table className="min-w-[900px] border-separate border-spacing-x-0 border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-b border-border/70 bg-muted/50 hover:bg-muted/50">
                  <TableHead className={`${th} min-w-[7rem]`}>{labels.colNom}</TableHead>
                  <TableHead className={th}>{labels.colPrenom}</TableHead>
                  <TableHead className={`${th} min-w-[10rem]`}>{labels.colEmail}</TableHead>
                  <TableHead className={th}>{labels.colRole}</TableHead>
                  <TableHead className={th}>{labels.colStatut}</TableHead>
                  <TableHead className={th}>{labels.colDateCreation}</TableHead>
                  <TableHead className={`${th} text-right`}>{labels.colActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/20">
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className={`${td} text-center text-muted-foreground`}>
                      {labels.empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id} className="border-b border-border/50 transition-colors hover:bg-muted/35">
                      <TableCell className={`${td} font-medium text-foreground`}>{u.nom}</TableCell>
                      <TableCell className={td}>{u.prenom}</TableCell>
                      <TableCell className={`${td} text-muted-foreground`}>{u.email}</TableCell>
                      <TableCell className={td}>{roleLabel(u, labels)}</TableCell>
                      <TableCell className={td}>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={u.isActive}
                            loading={statusBusyId === u.id}
                            onChange={(checked) => void toggleStatus(u, checked)}
                            aria-label={`${labels.colStatut} ${u.email}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {u.isActive ? labels.statutActive : labels.statutInactive}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={`${td} text-muted-foreground tabular-nums`}>
                        {formatDate(u.createdAt, locale)}
                      </TableCell>
                      <TableCell className={`${td} text-right`}>
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-lg px-4 text-sm shadow-sm"
                            onClick={() => openEdit(u)}
                          >
                            {labels.actionEdit}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 px-4 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => confirmDelete(u)}
                          >
                            {labels.actionDelete}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
