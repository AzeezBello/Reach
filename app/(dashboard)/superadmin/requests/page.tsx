import type { Metadata } from "next";

import { ActionForm } from "@/components/action-form";
import {
  AdminHeader,
  Panel,
  StatusBadge,
  inputClasses,
  labelOptions,
  selectClasses,
} from "@/components/admin";
import {
  REQUEST_STATUSES,
  getAllRequests,
  getOrganizations,
  getProfilesByIds,
  requireSuperadmin,
} from "@/lib/admin";
import { formatDate } from "@/lib/format";

import { updateRequestStatus } from "../actions";

export const metadata: Metadata = { title: "Requests" };

export default async function AdminRequestsPage() {
  await requireSuperadmin();

  const [requests, organizations] = await Promise.all([
    getAllRequests(100),
    getOrganizations(),
  ]);

  const residents = await getProfilesByIds([...new Set(requests.map((r) => r.resident_id))]);
  const organizationNames = new Map(organizations.map((o) => [o.id, o.name]));

  const statusOptions = labelOptions(REQUEST_STATUSES);

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Service desk"
        title="Resident requests"
        text="Update a request's status and leave a note. Notes are shown to the resident on their request timeline; staff notes stay internal."
      />

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No requests have been submitted yet, or your role cannot read them.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const resident = residents.get(request.resident_id);

            return (
              <Panel
                key={request.id}
                title={request.subject}
                text={[
                  request.reference_no,
                  request.category,
                  organizationNames.get(request.organization_id),
                  `Submitted ${formatDate(request.created_at)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                action={<StatusBadge status={request.status} fallback="Submitted" />}
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Resident
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink">
                      {resident?.full_name || "Unnamed account"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {[resident?.email, resident?.phone].filter(Boolean).join(" · ") || request.resident_id}
                    </p>

                    {request.description && (
                      <>
                        <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Description
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                          {request.description}
                        </p>
                      </>
                    )}

                    {request.staff_notes && (
                      <>
                        <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Staff notes
                        </p>
                        <p className="mt-1 whitespace-pre-line rounded-xl bg-gold-100/60 p-3 text-sm leading-6 text-gold-700">
                          {request.staff_notes}
                        </p>
                      </>
                    )}
                  </div>

                  <ActionForm
                    action={updateRequestStatus}
                    submitLabel="Update request"
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <input type="hidden" name="id" value={request.id} />

                    <div>
                      <label htmlFor={`status-${request.id}`} className="mb-1.5 block text-sm font-bold text-ink">
                        Status
                      </label>
                      <select
                        id={`status-${request.id}`}
                        name="status"
                        defaultValue={request.status ?? "submitted"}
                        className={selectClasses}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`message-${request.id}`} className="mb-1.5 block text-sm font-bold text-ink">
                        Note to resident
                      </label>
                      <textarea
                        id={`message-${request.id}`}
                        name="message"
                        rows={3}
                        placeholder="Visible on the resident's request timeline."
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label htmlFor={`staff-${request.id}`} className="mb-1.5 block text-sm font-bold text-ink">
                        Staff notes (internal)
                      </label>
                      <textarea
                        id={`staff-${request.id}`}
                        name="staff_notes"
                        rows={2}
                        defaultValue={request.staff_notes ?? ""}
                        className={inputClasses}
                      />
                    </div>
                  </ActionForm>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
