import Link from "next/link";
import { ExternalLink, ImageIcon, Trash2 } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import {
  CheckboxField,
  Field,
  Panel,
  SelectField,
  TextareaField,
  inputClasses,
  selectClasses,
} from "@/components/admin";
import { Photo } from "@/components/media";
import {
  CONTENT_KINDS,
  hasSummary,
  toLagosInput,
  type ContentKind,
  type ContentRow,
  type FieldDef,
} from "@/lib/content-admin";
import { humanize } from "@/lib/format";
import type { Leader, Organization, JurisdictionRecord } from "@/lib/types";

import { deleteContent, saveContent } from "@/app/(superadmin)/superadmin/content/actions";

type Props = {
  kind: ContentKind;
  item: ContentRow | null;
  organizations: Organization[];
  jurisdictions: JurisdictionRecord[];
  leaders: Leader[];
  credits: Map<string, string>;
  defaultOrganizationId?: string | null;
};

function defaultFor(item: ContentRow | null, field: FieldDef) {
  if (!item) return "";
  const value = item[field.name];
  if (value === null || value === undefined) return "";
  if (field.type === "datetime") return toLagosInput(String(value));
  return String(value);
}

function DynamicField({ field, item }: { field: FieldDef; item: ContentRow | null }) {
  const value = defaultFor(item, field);

  if (field.type === "checkbox") {
    return (
      <CheckboxField
        label={field.label}
        name={field.name}
        defaultChecked={Boolean(item?.[field.name])}
        hint={field.hint}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectField
        label={field.label}
        name={field.name}
        required={field.required}
        options={field.options ?? []}
        defaultValue={value}
        placeholder="Select…"
        hint={field.hint}
      />
    );
  }

  if (field.type === "datetime") {
    return (
      <div>
        <label htmlFor={field.name} className="mb-1.5 block text-sm font-bold text-ink">
          {field.label}
          {field.required && <span className="text-red-600"> *</span>}
        </label>
        <input
          id={field.name}
          name={field.name}
          type="datetime-local"
          required={field.required}
          defaultValue={value}
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-slate-500">{field.hint ?? "West Africa Time (Lagos)."}</p>
      </div>
    );
  }

  return (
    <Field
      label={field.label}
      name={field.name}
      type={field.type === "number" ? "number" : field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
      required={field.required}
      defaultValue={value}
      placeholder={field.placeholder}
      hint={field.hint}
    />
  );
}

/**
 * One editor for every content kind. Field lists come from CONTENT_KINDS so
 * the programme, opportunity, project and event forms stay consistent.
 */
export function ContentEditor({
  kind,
  item,
  organizations,
  jurisdictions,
  leaders,
  credits,
  defaultOrganizationId,
}: Props) {
  const config = CONTENT_KINDS[kind];
  const isPublished = item ? config.publishedStatuses.includes(item.status ?? "") : false;
  const publicUrl = item ? `${config.publicPath}/${item.slug}` : null;

  return (
    <div className="space-y-6">
      <ActionForm
        action={saveContent}
        submitLabel={item ? `Save ${config.label.toLowerCase()}` : `Create ${config.label.toLowerCase()}`}
        pendingLabel="Saving…"
      >
        <input type="hidden" name="kind" value={kind} />
        {item && <input type="hidden" name="id" value={item.id} />}

        <Panel title="Details" text="What residents will see on the listing and detail page.">
          <div className="grid gap-5">
            <Field label="Title" name="title" required defaultValue={item?.title ?? ""} />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Slug"
                name="slug"
                defaultValue={item?.slug ?? ""}
                placeholder="Generated from the title if left empty"
                hint={item ? "Changing the slug changes the public URL." : undefined}
              />
              <SelectField
                label="Status"
                name="status"
                required
                defaultValue={item?.status ?? config.statuses[0]}
                options={config.statuses.map((value) => ({ value, label: humanize(value) }))}
                hint={`Visible to residents when: ${config.publishedStatuses.map((value) => humanize(value)).join(", ")}.`}
              />
            </div>

            {hasSummary(kind) && (
              <TextareaField
                label="Summary"
                name="summary"
                rows={2}
                defaultValue={(item?.summary as string | null) ?? ""}
                hint="One or two sentences shown on cards and in search results."
              />
            )}

            <TextareaField
              label="Description"
              name="description"
              rows={8}
              defaultValue={item?.description ?? ""}
              hint="Full details. Blank lines start new paragraphs."
            />
          </div>
        </Panel>

        <Panel title={`${config.label} information`}>
          <div className="grid gap-5 sm:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.full ? "sm:col-span-2" : undefined}>
                <DynamicField field={field} item={item} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Ownership"
          text="Every item belongs to one organization and, where relevant, the jurisdiction it serves."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Organization"
              name="organization_id"
              required
              defaultValue={item?.organization_id ?? defaultOrganizationId ?? ""}
              placeholder="Select an organization"
              options={organizations.map((org) => ({ value: org.id, label: org.name }))}
            />
            <SelectField
              label="Jurisdiction"
              name="jurisdiction_id"
              defaultValue={item?.jurisdiction_id ?? ""}
              placeholder="Not specific to one area"
              options={jurisdictions.map((j) => ({
                value: j.id,
                label: `${j.name}${j.type ? ` · ${humanize(j.type)}` : ""}`,
              }))}
            />
          </div>
        </Panel>

        <Panel title="Image" text="Shown on cards and at the top of the detail page.">
          <div className="grid gap-5 sm:grid-cols-[200px_1fr] sm:items-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
              {item?.image_url ? (
                <Photo src={item.image_url} alt={item.title} sizes="200px" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <ImageIcon size={28} />
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <label htmlFor="image_file" className="mb-1.5 block text-sm font-bold text-ink">
                  Upload a new image
                </label>
                <input
                  id="image_file"
                  name="image_file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-brand-800 hover:file:bg-brand-100"
                />
                <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP or GIF up to 10 MB. Landscape images work best.</p>
              </div>

              <Field
                label="Or use an image URL"
                name="image_url"
                defaultValue={item?.image_url ?? ""}
                placeholder="/images/… or https://…"
                hint="Ignored when a file is uploaded."
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Leaders"
          text="One lead makes this an individual initiative; adding partners makes it a joint collaboration."
        >
          {leaders.length === 0 ? (
            <p className="text-sm text-slate-600">No leadership profiles yet. Create them under Leaders first.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {leaders.map((leader) => {
                const current = leader.id ? credits.get(leader.id) ?? "" : "";

                return (
                  <li key={leader.slug} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">{leader.name}</span>
                      <span className="block truncate text-xs text-slate-500">{leader.role}</span>
                    </span>
                    <select
                      name="leaders"
                      aria-label={`Role for ${leader.name}`}
                      defaultValue={current ? `${leader.id}:${current}` : ""}
                      className={`${selectClasses} w-auto min-w-[9rem]`}
                    >
                      <option value="">Not involved</option>
                      <option value={`${leader.id}:lead`}>Lead</option>
                      <option value={`${leader.id}:partner`}>Partner</option>
                    </select>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </ActionForm>

      {item && (
        <Panel title="Preview & danger zone">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              {isPublished ? (
                <Link
                  href={publicUrl!}
                  target="_blank"
                  className="inline-flex items-center gap-2 font-bold text-brand-700 hover:text-brand-900"
                >
                  Open the public page <ExternalLink size={15} />
                </Link>
              ) : (
                <span>
                  This {config.label.toLowerCase()} is not visible to residents. Set the status to{" "}
                  <strong>{humanize(config.publishStatus)}</strong> and save to publish it.
                </span>
              )}
            </div>

            <ActionForm
              action={deleteContent}
              inline
              variant="outline"
              submitLabel="Delete permanently"
              pendingLabel="Deleting…"
            >
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="id" value={item.id} />
              <Trash2 size={16} className="text-red-600" aria-hidden="true" />
            </ActionForm>
          </div>
        </Panel>
      )}
    </div>
  );
}
