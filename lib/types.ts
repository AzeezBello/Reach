export type Tenant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  whatsapp_number: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
};

export type Jurisdiction = {
  id: string;
  name: string;
  slug: string | null;
  type: string | null;
  state: string | null;
  lga: string | null;
  lcda: string | null;
  ward: string | null;
};

export type Programme = {
  id: string;
  attribution?: ContentAttribution;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  status: string | null;
  capacity: number | null;
  image_url: string | null;
};

export type Opportunity = {
  id: string;
  attribution?: ContentAttribution;
  title: string;
  slug: string;
  organization: string | null;
  type: string | null;
  summary: string | null;
  description: string | null;
  application_url: string | null;
  deadline: string | null;
  location: string | null;
  status: string | null;
  image_url: string | null;
};

export type Project = {
  id: string;
  attribution?: ContentAttribution;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  location: string | null;
  status: string | null;
  start_date: string | null;
  completion_date: string | null;
  beneficiary_count: number | null;
  image_url: string | null;
};

export type ResidentRequest = {
  id: string;
  reference_no: string | null;
  category: string | null;
  subject: string;
  description: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

/* ------------------------------------------------------------------ */
/* Resident dashboard                                                  */
/* ------------------------------------------------------------------ */

export type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  /** Home area chosen by the resident (jurisdictions.id). */
  jurisdiction_id: string | null;
  area: string | null;
  address: string | null;
  created_at: string | null;
};

export type RequestUpdate = {
  id: string;
  request_id: string;
  status: string | null;
  message: string | null;
  author_id: string | null;
  created_at: string;
};

export type ProgrammeApplication = {
  id: string;
  programme_id: string;
  status: string | null;
  notes: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  title: string | null;
  message: string | null;
  created_at: string;
  sent_at: string | null;
};

/* ------------------------------------------------------------------ */
/* Platform administration                                             */
/* ------------------------------------------------------------------ */

export type Organization = Tenant & {
  is_active: boolean;
  created_at: string;
};

export type JurisdictionRecord = Jurisdiction & {
  parent_id: string | null;
};

export type Office = {
  id: string;
  name: string;
  type: string | null;
  organization_id: string;
  jurisdiction_id: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
};

export type OfficeMember = {
  office_id: string;
  user_id: string;
  role: string | null;
  created_at: string;
};

export type AdminRequest = ResidentRequest & {
  resident_id: string;
  organization_id: string;
  jurisdiction_id: string | null;
  assigned_office_id: string | null;
  staff_notes: string | null;
};

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export type Event = {
  id: string;
  attribution?: ContentAttribution;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  venue: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  registration_url: string | null;
  capacity: number | null;
  status: string | null;
  image_url: string | null;
  is_featured: boolean;
};

/* ------------------------------------------------------------------ */
/* Leaders & collaborations                                            */
/* ------------------------------------------------------------------ */

export type LeaderSource = { label: string; url: string };

export type LeadershipLevel = "federal" | "state" | "local";

export type Leader = {
  /** Null for the built-in fallback profiles used before the migration runs. */
  id: string | null;
  slug: string;
  name: string;
  role: string;
  level: LeadershipLevel | null;
  level_label: string | null;
  office: string | null;
  jurisdiction: string | null;
  constituency: string | null;
  summary: string | null;
  biography: string[];
  service: string[];
  sources: LeaderSource[];
  image_url: string | null;
  is_active?: boolean;
  sort_order?: number;
};

export type ContentType = "programme" | "opportunity" | "project" | "event";

export type CollaborationRole = "lead" | "partner";

export type ContentLeader = {
  content_type: ContentType;
  content_id: string;
  leader_id: string;
  role: CollaborationRole;
};

export type LeaderCredit = { leader: Leader; role: CollaborationRole };

/* ------------------------------------------------------------------ */
/* Content attribution: Organization → Jurisdiction → Office → Leaders */
/* ------------------------------------------------------------------ */

export type ContentOrganization = Pick<Tenant, "id" | "name" | "slug" | "logo_url">;

export type ContentOffice = {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

/** The leader fields needed to credit someone on a piece of content. */
export type ContentLeaderRef = {
  id: string;
  slug: string;
  name: string;
  role: string;
  level: LeadershipLevel | null;
  level_label: string | null;
  office: string | null;
  constituency: string | null;
  image_url: string | null;
  summary: string | null;
};

export type ContentCredit = { role: CollaborationRole; leader: ContentLeaderRef };

/**
 * Who is responsible for an item. Leaders come only from explicit
 * content_leaders rows, never from rank or organization membership.
 */
export type ContentAttribution = {
  organization: ContentOrganization | null;
  jurisdiction: Jurisdiction | null;
  office: ContentOffice | null;
  leaders: ContentCredit[];
};
