# REACH

## Residents Engagement, Access, Communication & Help

**REACH** is a multi-tenant digital civic-service platform that connects residents with public-service offices, programmes, opportunities, community projects, service requests, and digital constituency/office services.

REACH is designed to provide a common platform that can power multiple:

* Public offices
* Constituency offices
* Government jurisdictions
* Local government offices
* Community organizations
* Public agencies

The first deployment is **FKL Connect**, powered by the REACH platform.

---

# 1. Product Vision

REACH transforms the traditional physical public office into a digital service platform.

Instead of requiring residents to understand which government office handles a particular problem, REACH is designed around the resident's need:

```text
Resident
   │
   ▼
Describe a problem or need
   │
   ▼
REACH identifies the relevant service
   │
   ▼
REACH identifies the responsible office
   │
   ▼
Request is routed
   │
   ▼
Office processes request
   │
   ▼
Resident tracks progress
```

The long-term goal is a **REACH Network** connecting residents with relevant public-service organizations across multiple jurisdictions.

---

# 2. Product Architecture

```text
REACH
│
├── Platform
│   ├── Organizations
│   ├── Jurisdictions
│   ├── Offices
│   ├── Users
│   └── Roles
│
├── Civic Services
│   ├── Requests
│   ├── Request Routing
│   ├── Request Tracking
│   ├── Programmes
│   ├── Opportunities
│   └── Projects
│
├── Resident
│   ├── Account
│   ├── Profile
│   ├── Dashboard
│   ├── Applications
│   ├── Requests
│   └── Notifications
│
├── Leadership
│   ├── Public Profiles
│   ├── Service Records
│   ├── Content Credits
│   └── Account Provisioning
│
└── Administration
    ├── Platform Administration
    ├── Organization Administration
    ├── Office Dashboard
    ├── Staff
    ├── Requests
    ├── Programmes
    ├── Opportunities
    ├── Projects
    ├── Leadership
    └── Analytics
```

---

# 3. Core Concepts

## Organization

An organization represents the entity operating a REACH deployment.

Examples:

* Civic office
* Constituency office
* Public agency
* Local government
* Community organization

Organizations can have:

* Name
* Slug
* Logo
* Description
* Brand colors
* Contact information
* Website
* WhatsApp contact
* Active/inactive status

Every organization-owned record should be scoped using:

```text
organization_id
```

---

## Jurisdiction

A jurisdiction represents the geographic or administrative area served by an organization or office.

Supported jurisdiction types include:

```text
state
senatorial_district
federal_constituency
state_constituency
lga
lcda
ward
community
```

Jurisdictions can have parent/child relationships.

Example:

```text
Lagos State
    │
    └── Lagos Central Senatorial District
          │
          └── Surulere Federal Constituency
                │
                ├── Surulere LGA
                │
                └── Itire-Ikate LCDA
```

---

## Office

An office represents the operational service point responsible for residents or a jurisdiction.

Supported office types include:

```text
governor
senator
house_of_representatives
house_of_assembly
lga
lcda
councillor
public_agency
community_office
other
```

---

# 4. Current Features

## Public Civic Portal

The public REACH experience currently supports:

* Organization branding
* Jurisdiction information
* Programme discovery
* Opportunity discovery
* Project discovery
* Events
* Leadership profiles
* Civic request submission
* Resident authentication
* Request tracking
* Responsive mobile/desktop UI
* SEO metadata
* Canonical URLs
* Open Graph metadata
* JSON-LD structured data
* `sitemap.xml`
* `robots.txt`
* `llms.txt`

---

# 5. Homepage

The homepage is structured around the resident journey:

```text
Hero
  ↓
Quick Actions
  ↓
Service Discovery
  ↓
How REACH Works
  ↓
Community Media
  ↓
Programmes
  ↓
Opportunities
  ↓
Projects
  ↓
Events
  ↓
Leadership
  ↓
Request Help
```

The homepage is intentionally designed to prioritize **services and resident actions** rather than administrative information.

---

# 6. Civic Requests

Residents can submit requests to public-service offices.

Example request categories:

* Roads
* Drainage
* Street lighting
* Water
* Waste management
* Education
* Healthcare
* Employment
* Business
* Welfare
* Documentation
* Other

A request contains:

```text
reference_no
resident_id
organization_id
jurisdiction_id
assigned_office_id
category
subject
description
status
staff_notes
created_at
updated_at
```

Request statuses:

```text
submitted
under_review
in_progress
resolved
closed
```

---

# 7. Intelligent Request Routing

REACH contains the foundation for a service-routing system.

The intended flow is:

```text
Resident describes problem
          │
          ▼
Service directory
          │
          ▼
Problem classification
          │
          ▼
Jurisdiction detection
          │
          ▼
Responsible office
          │
          ▼
Request creation
          │
          ▼
Office workflow
```

The platform currently includes service directory and routing infrastructure.

The long-term objective is a **"Who Handles This?"** system that removes the need for residents to know which government level or office is responsible for their issue.

---

# 8. Request Status Workflow

Protected request status changes are handled through the database function:

```text
update_request_status()
```

The workflow atomically:

1. Validates the authenticated user.
2. Checks the user's role.
3. Checks office access where required.
4. Locks the request.
5. Updates the request status.
6. Updates `updated_at`.
7. Creates a `request_updates` timeline entry.

This prevents the application from separately updating the request and timeline in a way that could leave inconsistent state.

---

# 9. Resident Dashboard

Authenticated residents use:

```text
/dashboard
```

The dashboard provides:

* Request statistics
* Recent requests
* Request history
* Request status
* Request timelines
* Programme applications
* Events/RSVPs
* Notifications
* Profile information

Request detail pages provide the request timeline using:

```text
request_updates
```

---

# 10. Programmes

Organizations can publish programmes and initiatives.

Programme fields include:

* Title
* Slug
* Summary
* Description
* Category
* Location
* Start date
* End date
* Registration deadline
* Capacity
* Status
* Image

Supported statuses:

```text
draft
open
ongoing
completed
archived
```

Future programme functionality includes:

* Applications
* Eligibility requirements
* Application review
* Application status
* Applicant communication
* Capacity management
* Application analytics

---

# 11. Opportunities

The Opportunities Hub allows residents to discover opportunities such as:

* Scholarships
* Jobs
* Training
* Grants
* Internships
* Business support
* Other opportunities

Opportunity records contain:

```text
title
organization
type
summary
description
application_url
deadline
location
status
image_url
```

Future functionality will include:

* Application tracking
* Saved opportunities
* Deadline notifications
* Personalized opportunity discovery

---

# 12. Community Projects

REACH supports public/community project records.

Project fields include:

* Title
* Category
* Description
* Location
* Status
* Start date
* Completion date
* Beneficiary count
* Image

Supported statuses:

```text
planned
ongoing
completed
```

Planned project-tracking functionality includes:

* Milestones
* Progress updates
* Project galleries
* Geographic mapping
* Beneficiary information
* Completion reports
* Project timelines

---

# 13. Events

Organizations can publish community events.

Events contain:

* Title
* Slug
* Summary
* Description
* Category
* Venue
* Location
* Start time
* End time
* Registration URL
* Capacity
* Status
* Image
* Featured flag

Supported statuses:

```text
draft
published
cancelled
```

Residents can RSVP to published events.

---

# 14. Leadership

REACH supports public leadership profiles.

Leadership records include:

```text
id
organization_id
jurisdiction_id
office_id
slug
name
role
level
level_label
office
constituency
summary
biography
service
sources
image_url
is_active
sort_order
```

Leadership levels currently include:

```text
federal
state
local
```

Public leadership pages provide:

* Biography
* Office
* Jurisdiction
* Constituency
* Public-service information
* Source links
* Related programmes
* Related opportunities
* Related projects
* Related events

---

# 15. Leadership Content Collaboration

Leaders can be associated with public content through:

```text
content_leaders
```

Relationship structure:

```text
content_type
content_id
leader_id
role
```

Supported content types:

```text
programme
opportunity
project
event
```

Supported collaboration roles:

```text
lead
partner
```

This allows REACH to represent:

```text
Leader
   │
   ├── Programme
   ├── Opportunity
   ├── Project
   └── Event
```

and:

```text
Programme
   │
   ├── Lead Leader
   └── Partner Leader
```

---

# 16. Leader Account Provisioning

Leadership profiles and authentication accounts are intentionally separated.

The `leaders` table **does not contain `profile_id`**.

Instead, account linking uses:

```text
profiles.email
       │
       ▼
leader_account_provisioning.email
       │
       ▼
leader_account_provisioning.leader_id
       │
       ▼
leaders.id
```

This is important because a public leadership profile is not inherently an authentication account.

The provisioning table contains:

```text
leader_id
email
status
created_at
updated_at
```

Typical provisioning states include:

```text
pending
active
```

A leader receives dashboard access only when the provisioning record is associated with the authenticated account and has the appropriate active status.

The application does **not** create fake authentication users.

When real leader emails are available, the intended process is:

```text
Add verified email
        ↓
Update provisioning record
        ↓
Invite/authenticate account
        ↓
User creates password
        ↓
Account becomes active
        ↓
Leader dashboard access
```

Service-role credentials must remain server-side.

---

# 17. Authentication

REACH uses Supabase Authentication with the Next.js SSR integration.

Residents can:

* Register
* Sign in
* Sign out
* Maintain their profile
* Submit requests
* View requests
* Apply for programmes
* RSVP to events

Administrative and leadership access is separately protected.

---

# 18. Roles

The application/database role model supports:

```text
resident
staff
admin
superadmin
org_admin
office_admin
```

### Resident

Residents can:

* Manage their profile
* Submit requests
* View their own requests
* Track request progress
* Participate in available programmes/events

### Staff

Staff can operate within assigned offices and process resident requests.

### Office Admin

Office administrators manage operational activity within their office.

### Organization Admin

Organization administrators manage their organization's content and operational configuration.

### Admin

Platform administrators can manage broader platform operations.

### Superadmin

Superadmins have platform-level administration access.

Protected access should always be enforced at both:

```text
Application layer
+
Database/RLS layer
```

---

# 19. Administration

The platform administration area is available under:

```text
/superadmin
```

Current administration areas include:

```text
/superadmin                      Overview and platform stats
/superadmin/content              Programmes, opportunities, projects, events (CRUD)
/superadmin/content/[kind]/new   Create an item
/superadmin/content/[kind]/[id]  Edit, publish, unpublish, archive, delete, preview
/superadmin/events               Event list with RSVP counts and capacity
/superadmin/events/[id]          Attendee list, capacity, registration status, CSV export
/superadmin/leaders
/superadmin/leader-accounts
/superadmin/organizations
/superadmin/jurisdictions
/superadmin/offices
/superadmin/members              Organization members
/superadmin/staff                Office staff
/superadmin/requests
/superadmin/routing
/superadmin/whatsapp
```

## Signing in as a superadmin

1. Create a resident account at `/login` (or use an existing one).
2. Set the profile role in Supabase: `update public.profiles set role = 'superadmin' where email = 'you@example.com';`
   (`admin` also grants console access).
3. Sign in at `/login`; the console is at `/superadmin`. A non-admin account is sent to `/dashboard?denied=superadmin`.

The console checks the role in the application (`requireSuperadmin`) and then
reads and writes through the server-only service role (`SUPABASE_SERVICE_ROLE_KEY`),
so it works even before the database policies below are applied.

## Content management

Every content kind shares one editor (`components/content-editor.tsx`) driven by
`lib/content-admin.ts`, which defines the table, statuses and extra fields per kind:

| Kind | Published when | Unpublish | Archive |
| --- | --- | --- | --- |
| Programme | `open`, `ongoing` | `draft` | `archived` |
| Opportunity | `active` | `draft` | `archived` |
| Project | `planned`, `ongoing`, `completed` | – | – |
| Event | `published` | `draft` | `cancelled` |

Each item is assigned an organization (required), a jurisdiction (optional), an
image (uploaded to the public `media` storage bucket or referenced by URL) and
leader credits. One lead makes it an individual initiative; adding partners makes
it a joint collaboration. Saving revalidates the public listing, detail page,
homepage and sitemap.

Attendee exports are served by `GET /api/superadmin/events/[id]/attendees` as CSV
and require a signed-in admin.

## Sign-up data

Sign-up is two steps: name, email and password, then home area and residential
address. The form sends `full_name`, `jurisdiction_id` and `address` as user
metadata and the `handle_new_user` trigger copies them onto `profiles`, so the
values are stored even when email confirmation delays the first session.

## Database policies for admin sessions

`supabase/migrations/20261006000000_platform_admin_access.sql` adds an
`is_platform_admin()` helper and policies that let `admin`/`superadmin` sessions
read every profile and manage content, leaders, members and routing directly. It
also fixes the recursive `organization_members` policy and grants execute on
`event_rsvp_count` and `find_service_for_request`. Apply it from the Supabase SQL
editor or with `supabase db push`.

`supabase/migrations/20261006120000_security_hardening.sql` follows up on the
Supabase advisor: it limits `is_platform_admin()` to authenticated users,
replaces every policy on requests, offices and organizations with one
canonical set that evaluates `auth.uid()` once per statement (review that
block before applying if you added custom policies to those tables), updates the sign-up trigger to store the address, and adds indexes on
every foreign key the app filters by. `event_rsvp_count` and
`find_service_for_request` intentionally remain callable by anonymous users
because the public event page and request form use them.

The resident workspace is:

```text
/dashboard
```

The office workspace is:

```text
/office
```

The leadership workspace is:

```text
/leader
```

---

# 20. Multi-Tenant Architecture

REACH is designed as a multi-tenant platform.

Conceptually:

```text
REACH
 │
 ├── Organization A
 │     ├── Offices
 │     ├── Jurisdictions
 │     ├── Programmes
 │     ├── Opportunities
 │     ├── Projects
 │     └── Requests
 │
 ├── Organization B
 │     ├── Offices
 │     ├── Jurisdictions
 │     ├── Programmes
 │     ├── Opportunities
 │     ├── Projects
 │     └── Requests
 │
 └── Organization C
```

Tenant-owned data should be scoped using:

```text
organization_id
```

Geographic responsibility should be scoped using:

```text
jurisdiction_id
```

This allows multiple civic offices to operate on the same platform architecture.

---

# 21. FKL Connect

The first REACH deployment is:

```text
Organization:
FKL Connect

Slug:
fkl-connect

Jurisdiction:
Surulere Federal Constituency

Office:
FKL Connect Digital Constituency Office
```

REACH remains the underlying platform.

FKL Connect is the first tenant/deployment.

This distinction allows future organizations to use the same application without turning REACH into a single-office product.

---

# 22. Security & RLS

REACH uses Supabase PostgreSQL Row Level Security.

Security principles:

* Residents can access their own protected records.
* Staff can access records assigned to their authorized offices.
* Organization administrators are scoped to their organization.
* Platform administrators have broader access.
* Public content is readable only where appropriate.
* Tenant boundaries must be enforced through organization ownership.
* Service-role credentials must never reach client-side code.
* Protected server actions must authenticate the user.
* Database functions must use explicit authorization checks.
* Security-definer functions must use a controlled `search_path`.

Important protected database functions currently include:

```text
find_service_for_request()
create_routed_request()
update_request_status()
```

These functions are restricted from anonymous/public execution and are available to authenticated users where appropriate.

---

# 23. Database

REACH uses:

```text
PostgreSQL
+
Supabase
+
Supabase Auth
+
Row Level Security
```

Major entities include:

```text
profiles
organizations
jurisdictions
offices
office_members

requests
request_updates
service_directory
service_routes

programmes
programme_applications

opportunities

projects
project_updates

events
event_rsvps

leaders
content_leaders
leader_account_provisioning

notifications
audit_logs
```

---

# 24. Database Relationships

High-level relationship:

```text
organizations
      │
      ├── offices
      │      │
      │      └── office_members
      │
      ├── jurisdictions
      │
      ├── programmes
      │
      ├── opportunities
      │
      ├── projects
      │
      ├── events
      │
      ├── leaders
      │
      └── requests
              │
              └── profiles
```

Leadership:

```text
leaders
   │
   └── content_leaders
          │
          ├── programmes
          ├── opportunities
          ├── projects
          └── events
```

Leader authentication:

```text
profiles
   │
   │ email
   ▼
leader_account_provisioning
   │
   │ leader_id
   ▼
leaders
```

---

# 25. Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React

## Backend

* Next.js App Router
* Route Handlers
* Server Components
* Server Actions where appropriate

## Database

* PostgreSQL
* Supabase
* Supabase Auth
* Supabase RLS

## Deployment

* Vercel

## Repository

```text
https://github.com/AzeezBello/Reach
```

---

# 26. Project Structure

```text
reach/
│
├── app/
│   ├── (site)/
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── requests/
│   │   ├── programmes/
│   │   ├── opportunities/
│   │   ├── projects/
│   │   ├── events/
│   │   └── leadership/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── office/
│   │   └── superadmin/
│   │
│   ├── api/
│   │   ├── requests/
│   │   ├── service-directory/
│   │   └── tenant/
│   │
│   ├── auth/
│   ├── llms.txt/
│   ├── opengraph-image.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── icon.svg
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── header.tsx
│   ├── footer.tsx
│   ├── nav.tsx
│   ├── breadcrumbs.tsx
│   ├── page-hero.tsx
│   ├── content-card.tsx
│   ├── leaders-panel.tsx
│   ├── request-form.tsx
│   ├── jurisdiction-selector.tsx
│   ├── auth-form.tsx
│   ├── admin.tsx
│   ├── admin-nav.tsx
│   ├── dashboard-sidebar.tsx
│   └── ui.tsx
│
├── lib/
│   ├── reach.ts
│   ├── admin.ts
│   ├── leaders.ts
│   ├── leadership.ts
│   ├── navigation.ts
│   ├── seo.ts
│   ├── media.ts
│   ├── format.ts
│   ├── config.ts
│   ├── types.ts
│   └── supabase/
│       ├── server.ts
│       └── public.ts
│
├── public/
│   ├── brand/
│   ├── images/
│   │   └── leaders/
│   └── videos/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── proxy.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# 27. Environment Variables

Required public configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

For server-side administrative operations, a service-role/secret key may be required by specific trusted server workflows.

It must **never** be exposed through:

* Client components
* Browser JavaScript
* Public environment variables
* Git
* Source control
* API responses

For Vercel:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

---

# 28. Local Development

Clone the repository:

```bash
git clone https://github.com/AzeezBello/Reach.git
```

Enter the project:

```bash
cd Reach
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 29. Validation Before Deployment

Before pushing changes:

```bash
npm run typecheck
```

Then:

```bash
npm run build
```

Both should pass before deployment.

Recommended final check:

```bash
git status
git diff
```

Then:

```bash
git add .
git commit -m "fix: description"
git push origin main
```

---

# 30. Supabase Development

Link the project:

```bash
supabase link --project-ref <project-ref>
```

Apply migrations:

```bash
supabase db push
```

Run seed data where appropriate:

```bash
supabase db execute --file supabase/seed.sql
```

Always review migrations before applying destructive schema changes.

---

# 31. Current Production Deployment

Current deployment:

```text
https://reach-eta-two.vercel.app/
```

The production application uses:

```text
Vercel
    │
    ▼
Next.js
    │
    ▼
Supabase
    │
    ├── PostgreSQL
    ├── Auth
    └── RLS
```

---

# 32. Immediate Next Steps

The following work should be completed in this order.

## Step 1 — Deploy the latest leader-account fix

The current `lib/leaders.ts` must use:

```text
profiles.email
        ↓
leader_account_provisioning.email
        ↓
leader_account_provisioning.leader_id
        ↓
leaders.id
```

It must **not** query:

```text
leaders.profile_id
```

because that column does not exist.

After pushing:

```bash
npm run typecheck
npm run build
git add lib/leaders.ts README.md
git commit -m "fix: resolve leader accounts through provisioning"
git push origin main
```

Then verify the Vercel deployment.

---

# 33. Next Step — Verify Leader Account Provisioning

Before testing `/leader`, verify:

```sql
select
  leader_id,
  email,
  status
from public.leader_account_provisioning
order by created_at;
```

Pending records should remain pending until the corresponding real account/email is ready.

For an activated leader:

```text
status = active
```

Then verify:

```text
Supabase Auth user
        ↓
profiles.email
        ↓
leader_account_provisioning.email
        ↓
leaders.id
```

---

# 34. Next Step — Complete Staff & Office Access

The next major administration task is to make the office workspace fully operational.

Target workflow:

```text
Organization
      │
      ▼
Office
      │
      ▼
Office Member
      │
      ▼
Staff User
      │
      ▼
Assigned Requests
```

Implement:

* Office membership management
* Staff assignment
* Office-level permissions
* Organization-level permissions
* Request assignment
* Staff request queue
* Staff request detail
* Internal notes
* Status updates
* Request timeline

---

# 35. Next Step — Request Assignment

Implement a proper request assignment workflow.

Target:

```text
Request
   │
   ├── organization_id
   ├── jurisdiction_id
   ├── assigned_office_id
   └── assigned_staff_id
```

The office should see only requests that it is authorized to process.

Administrators should be able to:

* Assign request to office
* Reassign request
* Assign staff member
* Change priority
* Add internal notes
* Change status
* View timeline

---

# 36. Next Step — Service Directory

Expand the existing service directory into a complete routing engine.

Example:

```text
Resident:
"My street has serious flooding."

        ↓

Service Directory

Category:
Drainage

        ↓

Jurisdiction

Surulere

        ↓

Responsible Office

Matched Office

        ↓

Create Request
```

The service directory should eventually contain:

```text
service
category
description
keywords
responsible_office
jurisdiction_type
priority
routing_rules
```

---

# 37. Done — Content Administration

Programmes, opportunities, projects and events are managed from
`/superadmin/content` (see section 19). Each kind supports create, edit,
publish, unpublish, archive/cancel, delete, image upload, organization and
jurisdiction assignment, leader credits and a preview link to the public page.

Still to build for programmes:

* Eligibility rules
* Application review (approve/reject) from the console

Still to build for opportunities on the resident side:

```text
Save opportunity
Track opportunity
Application status
Deadline reminder
```

---

# 39. Next Step — Project Tracking

Expand projects into a transparent project tracker.

Target:

```text
Project
 │
 ├── Overview
 ├── Location
 ├── Status
 ├── Timeline
 ├── Milestones
 ├── Updates
 ├── Photos
 ├── Beneficiaries
 └── Completion Report
```

Future map integration can associate projects with geographic coordinates.

---

# 40. Next Step — Notifications

Build the notification infrastructure.

Supported notification types:

```text
request_received
request_status_changed
request_resolved
programme_application
programme_update
opportunity_deadline
event_reminder
project_update
```

Initial implementation:

```text
In-app notifications
```

Then:

```text
Email
WhatsApp
SMS
```

---

# 41. Next Step — WhatsApp Integration

The planned WhatsApp layer should expose the same REACH service functionality.

Example:

```text
Resident
   │
   ▼
WhatsApp
   │
   ▼
REACH
   │
   ├── Find service
   ├── Create request
   ├── Track request
   ├── Find programme
   ├── Find opportunity
   └── Receive notification
```

The WhatsApp integration must use the same tenant, authorization and request-routing rules as the web application.

---

# 42. Next Step — Analytics

Build the administrative analytics layer.

## Requests

```text
Total requests
Open requests
Resolved requests
Requests by category
Requests by jurisdiction
Average resolution time
```

## Programmes

```text
Programmes
Applications
Participation
Application status
```

## Opportunities

```text
Published opportunities
Applications
Upcoming deadlines
```

## Projects

```text
Active projects
Completed projects
Beneficiaries
Project locations
```

---

# 43. Next Step — Mobile Navigation & UX Cleanup

The desktop administration navigation is more complete than the current mobile navigation.

Bring the mobile navigation to parity with:

```text
Dashboard
Requests
Office
Leadership
Administration
Organizations
Jurisdictions
Offices
Leaders
Leader Accounts
Members
Routing
WhatsApp
```

Also verify:

* Mobile forms
* Request status workflow
* Empty states
* Loading states
* Error states
* Toasts
* Accessibility
* Keyboard navigation
* Touch targets

---

# 44. Done — Notifications Route

`/dashboard/notifications` lists every notification sent to the signed-in
resident, newest first, and is linked from the dashboard sidebar, the mobile
navigation and the dashboard notifications panel.

Still to build:

* Read/unread state and "mark all as read"
* Filtering by type
* Deep links to the related request, event or programme

---

# 45. Next Step — Production QA

Before calling the current phase complete, test the following flows end-to-end.

## Resident

```text
Register
  ↓
Login
  ↓
Profile
```
