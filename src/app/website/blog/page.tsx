"use client";

import { FormEvent, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard, TwoCol } from "@/components/ui/FormCard";
import { InputField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { AdminForm } from "@/components/ui/AdminForm";
import { useCrud } from "@/hooks/useCrud";
import { formToObject } from "@/lib/api-client";
import { jsonToParagraphs, paragraphsToJson, slugifyTitle } from "@/lib/blog-content";
import { todayIso } from "@/lib/dates";
import { readJsonResponse } from "@/lib/upload-response";

type BlogPostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  category: string;
  coverPath: string;
  publishedAt: string;
  readTime: string;
  author: string;
  contentJson: string;
  published: boolean;
};

const emptyForm = (): Partial<BlogPostRow> => ({
  slug: "",
  title: "",
  excerpt: "",
  seoDescription: "",
  category: "General",
  coverPath: "",
  publishedAt: todayIso().slice(0, 10),
  readTime: "5 min",
  author: "DPR Logistics Team",
  contentJson: "[]",
  published: false,
});

export default function WebsiteBlogPage() {
  const { rows, message, create, update, remove, setMessage, saving } = useCrud<BlogPostRow>("blog-posts");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<BlogPostRow>>(emptyForm());
  const [contentText, setContentText] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  function load(row: BlogPostRow) {
    setEditId(row.id);
    setForm(row);
    setContentText(jsonToParagraphs(row.contentJson));
    setMessage({ type: "ok", text: `Editing ${row.title}` });
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm());
    setContentText("");
  }

  async function uploadCover() {
    const file = uploadRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "err", text: "Choose a cover image first" });
      return;
    }
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", String(form.title || "Blog cover"));
      fd.append("category", "blog-cover");
      fd.append("published", "true");
      const res = await fetch("/api/marketing-media", { method: "POST", body: fd });
      const data = await readJsonResponse<{ id?: number; error?: string }>(res);
      if (!res.ok || !data.id) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, coverPath: `/api/marketing-media/${data.id}` }));
      if (uploadRef.current) uploadRef.current.value = "";
      setMessage({ type: "ok", text: "Cover image uploaded" });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploadBusy(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    const raw = { ...form, ...formToObject(e.currentTarget) };
    const title = String(raw.title ?? "").trim();
    if (!title) {
      setMessage({ type: "err", text: "Title is required" });
      return;
    }

    const slug = String(raw.slug ?? "").trim() || slugifyTitle(title);
    const publishedRaw = (raw as Record<string, unknown>).published;
    const body = {
      ...raw,
      slug,
      title,
      contentJson: paragraphsToJson(contentText),
      published:
        publishedRaw === true ||
        publishedRaw === "true" ||
        publishedRaw === "on" ||
        String(publishedRaw ?? "").startsWith("Published"),
    };

    if (editId) {
      const saved = await update(editId, body);
      if (saved) resetForm();
      return;
    }

    resetForm();
    await create(body);
  }

  return (
    <>
      <PageHeader
        title="Website Blog Posts"
        subtitle="Create and publish articles on dprlogistics.in/blog"
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Blog Posts" }]}
      />
      <Flash message={message} />

      <AdminForm onSubmit={onSubmit}>
        <FormCard>
          <TwoCol>
            <div>
              <InputField
                label="Title"
                name="title"
                value={form.title ?? ""}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: f.slug || slugifyTitle(title),
                  }));
                }}
                required
              />
              <InputField
                label="URL Slug"
                name="slug"
                value={form.slug ?? ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="how-to-track-gc-lr-online"
              />
              <InputField
                label="Category"
                name="category"
                value={form.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <TextAreaField
                label="Short excerpt"
                name="excerpt"
                value={form.excerpt ?? ""}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
              />
              <TextAreaField
                label="SEO description"
                name="seoDescription"
                value={form.seoDescription ?? ""}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <ImageUploadField
                label="Cover picture"
                required
                inputRef={uploadRef}
                disabled={uploadBusy}
                urlValue={form.coverPath ?? ""}
                onUrlChange={(value) => setForm({ ...form, coverPath: value })}
                urlPlaceholder="/marketing/blog/example.jpg or https://..."
              />
              <div className="mb-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={uploadBusy} onClick={uploadCover}>
                  {uploadBusy ? "Uploading…" : "Upload chosen file as cover"}
                </Button>
              </div>
              {form.coverPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverPath} alt="Cover preview" className="mb-4 max-h-40 rounded border object-cover" />
              ) : null}
              <InputField
                label="Publish date"
                name="publishedAt"
                type="date"
                value={form.publishedAt ?? ""}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
              />
              <InputField
                label="Read time"
                name="readTime"
                value={form.readTime ?? ""}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
              />
              <InputField
                label="Author"
                name="author"
                value={form.author ?? ""}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
              <SelectField
                label="Published on website"
                name="published"
                value={form.published ? "Published (live)" : "Draft (hidden)"}
                onChange={(e) => setForm({ ...form, published: e.target.value.startsWith("Published") })}
                options={["Draft (hidden)", "Published (live)"]}
              />
            </div>
          </TwoCol>
          <TextAreaField
            label="Article content (blank line between paragraphs)"
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            rows={12}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {editId ? "Update post" : "Save post"}
            </Button>
            {editId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel edit
              </Button>
            ) : null}
          </div>
        </FormCard>
      </AdminForm>

      <DataTable
        rows={rows}
        searchKeys={["title", "slug", "category"]}
        columns={[
          { key: "edit", header: "Edit", render: (row) => <Button type="button" size="sm" variant="teal" onClick={() => load(row)}>Edit</Button> },
          { key: "delete", header: "Delete", render: (row) => <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>Delete</Button> },
          { key: "title", header: "Title" },
          { key: "slug", header: "Slug" },
          { key: "category", header: "Category" },
          {
            key: "published",
            header: "Status",
            render: (row) => (row.published ? "Published" : "Draft"),
          },
          { key: "publishedAt", header: "Date" },
        ]}
      />
    </>
  );
}
