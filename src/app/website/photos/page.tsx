"use client";

import { FormEvent, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, ComboboxField } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { formToObject } from "@/lib/api-client";
import { readJsonResponse } from "@/lib/upload-response";
import { marketingMediaUrl } from "@/lib/marketing-media-url";

type MediaRow = {
  id: number;
  title: string;
  alt: string;
  category: string;
  storedName: string;
  mimeType: string;
  sortOrder: number;
  published: boolean;
};

const emptyForm = (): Partial<MediaRow> => ({
  title: "",
  alt: "",
  category: "gallery",
  sortOrder: 0,
  published: true,
});

export default function WebsitePhotosPage() {
  const { rows, message, update, setMessage, reload } = useCrud<MediaRow>("marketing-media");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<MediaRow>>(emptyForm());
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  function load(row: MediaRow) {
    setEditId(row.id);
    setForm(row);
    setMessage({ type: "ok", text: `Editing ${row.title || `Photo #${row.id}`}` });
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm());
    if (uploadRef.current) uploadRef.current.value = "";
  }

  async function uploadPhoto(e: FormEvent) {
    e.preventDefault();
    const file = uploadRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "err", text: "Choose a file first" });
      return;
    }
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", String(form.title ?? ""));
      fd.append("alt", String(form.alt ?? form.title ?? ""));
      fd.append("category", String(form.category ?? "gallery"));
      fd.append("sortOrder", String(form.sortOrder ?? 0));
      fd.append("published", form.published === false ? "false" : "true");
      const res = await fetch("/api/marketing-media", { method: "POST", body: fd });
      const data = await readJsonResponse<{ id?: number; error?: string }>(res);
      if (!res.ok || !data.id) throw new Error(data.error || "Upload failed");
      if (uploadRef.current) uploadRef.current.value = "";
      resetForm();
      await reload();
      setMessage({ type: "ok", text: "Photo uploaded to website" });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploadBusy(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editId) return;
    const raw = { ...form, ...formToObject(e.currentTarget) };
    const publishedRaw = (raw as Record<string, unknown>).published;
    const body = {
      ...raw,
      sortOrder: Number(raw.sortOrder) || 0,
      published:
        publishedRaw === true ||
        publishedRaw === "true" ||
        publishedRaw === "on" ||
        String(publishedRaw ?? "").startsWith("Published") ||
        publishedRaw === "Visible",
    };
    const saved = await update(editId, body);
    if (saved) resetForm();
  }

  async function deletePhoto(row: MediaRow) {
    if (!confirm(`Delete photo #${row.id}?`)) return;
    try {
      const res = await fetch(`/api/marketing-media/${row.id}`, { method: "DELETE" });
      const data = await readJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await reload();
      setMessage({ type: "ok", text: "Photo deleted" });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Delete failed" });
    }
  }

  return (
    <>
      <PageHeader
        title="Website Photos & Gallery"
        subtitle="Upload photos for public gallery, blog covers and banners"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Photos & Gallery" }]}
      />
      <Flash message={message} />

      <AdminForm onSubmit={uploadPhoto}>
        <FormCard title="Upload new photo">
          <TwoCol>
            <div>
              <InputField
                label="Title / caption"
                name="title"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <InputField
                label="Alt text (SEO)"
                name="alt"
                value={form.alt ?? ""}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
              />
              <ComboboxField
                label="Use on"
                value={form.category ?? "gallery"}
                onChange={(category) => setForm({ ...form, category })}
                options={["gallery", "blog-cover", "banner", "client-logo"]}
                placeholder="Select use"
              />
            </div>
            <div>
              <InputField
                label="Sort order"
                name="sortOrder"
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
              />
              <ComboboxField
                label="Show on website"
                value={form.published === false ? "Hidden" : "Published (visible)"}
                onChange={(v) => setForm({ ...form, published: v.startsWith("Published") })}
                options={["Published (visible)", "Hidden"]}
                placeholder="Select"
              />
              <ImageUploadField
                label="Picture"
                required
                inputRef={uploadRef}
                disabled={uploadBusy}
                showUrl={false}
              />
            </div>
          </TwoCol>
          <Button type="submit" disabled={uploadBusy} className="mt-4">
            {uploadBusy ? "Uploading…" : "Upload photo"}
          </Button>
        </FormCard>
      </AdminForm>

      {editId ? (
        <AdminForm onSubmit={onSubmit} className="mt-6">
          <FormCard title={`Edit photo #${editId}`}>
            <TwoCol>
              <InputField label="Title" name="title" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <InputField label="Alt text" name="alt" value={form.alt ?? ""} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
              <ComboboxField label="Category" value={form.category ?? "gallery"} onChange={(category) => setForm({ ...form, category })} options={["gallery", "blog-cover", "banner", "client-logo"]} placeholder="Select" />
              <InputField label="Sort order" name="sortOrder" type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} />
              <ComboboxField label="Published" value={form.published ? "Visible" : "Hidden"} onChange={(v) => setForm({ ...form, published: v === "Visible" })} options={["Visible", "Hidden"]} placeholder="Select" />
            </TwoCol>
            <div className="mt-4 flex gap-2">
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </FormCard>
        </AdminForm>
      ) : null}

      <DataTable
        rows={rows}
        searchKeys={["title", "category"]}
        columns={[
          { key: "edit", header: "Edit", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Edit</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => deletePhoto(row)}>Delete</Button> },
          {
            key: "id",
            header: "Preview",
            render: (row) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={marketingMediaUrl(row.id)} alt={row.alt || row.title} className="h-12 w-12 rounded object-cover" />
            ),
          },
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          {
            key: "published",
            header: "Status",
            render: (row) => (row.published ? "Live" : "Hidden"),
          },
          { key: "sortOrder", header: "Order" },
        ]}
      />
    </>
  );
}
