"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { getErrorMessage } from "@/lib/errors";

import type { ListResult, PaginationParams, PaginationMeta } from "@/types/api";

import type { UserRole } from "@/lib/roles";

import DataTable, { type ColumnDef } from "@/components/common/DataTable";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Modal from "@/components/common/Modal";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import DashboardShell from "@/components/DashboardShell";

export type CrudFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "select"
  | "textarea";

export interface CrudField {
  name: string;
  label: string;
  type?: CrudFieldType;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  full?: boolean;
  step?: string;
}

export interface CrudResource<T> {
  list: (params?: PaginationParams) => Promise<ListResult<T>>;
  /** Use `resourceMutator`/`resourceUpdater` to adapt typed API methods. */
  create?: (input: Record<string, unknown>) => Promise<unknown>;
  update?: (id: string, input: Record<string, unknown>) => Promise<unknown>;
  remove?: (id: string) => Promise<unknown>;
}

/** Adapt a typed `create(input)` API method to CrudPage's loose form values. */
export function resourceMutator<I, O>(
  fn: (input: I) => Promise<O>,
): (input: Record<string, unknown>) => Promise<unknown> {
  return (input) => fn(input as I);
}

/** Adapt a typed `update(id, input)` API method to CrudPage's loose form values. */
export function resourceUpdater<Id extends string, I, O>(
  fn: (id: Id, input: I) => Promise<O>,
): (id: string, input: Record<string, unknown>) => Promise<unknown> {
  return (id, input) => fn(id as Id, input as I);
}

export interface CrudPageProps<T> {
  title: string;
  description?: string;
  /** When provided, renders the page inside a DashboardShell for this role. */
  role?: UserRole;
  resource: CrudResource<T>;
  columns: ColumnDef<T>[];
  fields: CrudField[];
  rowKey: (row: T) => string;
  searchKey?: string;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  createTitle?: string;
  editTitle?: string;
  defaultPageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Async-loaded select options merged over static field options, keyed by field name. */
  selectOptions?: Record<string, Array<{ label: string; value: string }>>;
  /** Map a row into form initial values; when omitted, the raw row is used. */
  toFormValues?: (row: T) => Record<string, unknown>;
  /** Transform submitted values before sending to the API. */
  toPayload?: (
    values: Record<string, unknown>,
    editing?: T | null,
  ) => Record<string, unknown>;
}

export default function CrudPage<T>({
  title,
  description,
  role,
  resource,
  columns,
  fields,
  rowKey,
  searchKey,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  createTitle = "Create",
  editTitle = "Edit",
  defaultPageSize = 10,
  emptyTitle,
  emptyDescription,
  selectOptions,
  toFormValues,
  toPayload,
}: CrudPageProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);

  const [deleting, setDeleting] = useState<T | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(
    async (nextPage = page, nextSearch = search) => {
      setLoading(true);
      setError(null);

      try {
        const params: PaginationParams = { page: nextPage, limit: defaultPageSize };

        if (searchKey && nextSearch.trim()) {
          params[searchKey] = nextSearch.trim();
        }

        const result = await resource.list(params);
        setRows(result.data);
        setMeta(result.meta);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [page, search, searchKey, defaultPageSize, resource],
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function resetForm() {
    setValues({});
    setSaveError(null);
  }

  function openCreate() {
    resetForm();
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: T) {
    resetForm();
    setEditing(row);
    const base = toFormValues ? toFormValues(row) : (row as Record<string, unknown>);
    setValues(base);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setSaveError(null);

    try {
      const payload = toPayload
        ? toPayload(values, editing)
        : values;

      if (editing && resource.update) {
        await resource.update(rowKey(editing), payload);
      } else if (resource.create) {
        await resource.create(payload);
      }

      setModalOpen(false);
      await load(page, search);
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting || !resource.remove) return;

    setDeleteBusy(true);

    try {
      await resource.remove(rowKey(deleting));
      setDeleting(null);
      await load(page, search);
    } catch (err) {
      setError(err);
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  const actions = (
    <>
      {canCreate && resource.create && (
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {createTitle}
        </Button>
      )}
    </>
  );

  const content = (
    <div>
      <PageHeader title={title} description={description} actions={actions} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              void load(1, e.target.value);
            }}
            placeholder="Search…"
            className="pl-9"
          />
        </div>
        {actions}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {error ? (
          <ErrorState error={error} onRetry={() => void load()} />
        ) : (
          <DataTable
            columns={[
              ...columns,
              ...(canUpdate || canDelete
                ? [
                    {
                      key: "actions",
                      header: "Actions",
                      headerClassName: "text-right",
                      cellClassName: "text-right",
                      render: (row: T) => (
                        <div className="flex justify-end gap-1">
                          {canUpdate && resource.update && (
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && resource.remove && (
                            <button
                              type="button"
                              onClick={() => setDeleting(row)}
                              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
            rows={rows}
            loading={loading}
            rowKey={rowKey}
            meta={meta}
            onPageChange={setPage}
            emptyTitle={emptyTitle ?? "Nothing here yet"}
            emptyDescription={emptyDescription}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? editTitle : createTitle}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void handleSubmit()}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        {saveError ? (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {getErrorMessage(saveError)}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const value = values[field.name] ?? "";

            return (
              <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                <Field label={field.label} hint={field.hint}>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={String(value ?? "")}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [field.name]: e.target.value }))
                      }
                      rows={3}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={String(value ?? "")}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [field.name]: e.target.value }))
                      }
                    >
                      <option value="">
                        {field.placeholder ?? "Select…"}
                      </option>
                      {(selectOptions?.[field.name] ?? field.options)?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      type={field.type ?? "text"}
                      value={String(value ?? "")}
                      required={field.required}
                      step={field.step}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [field.name]: e.target.value }))
                      }
                    />
                  )}
                </Field>
              </div>
            );
          })}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Delete this record?"
        description="This action cannot be undone."
        loading={deleteBusy}
      />
    </div>
  );

  return role ? (
    <DashboardShell role={role}>{content}</DashboardShell>
  ) : (
    content
  );
}