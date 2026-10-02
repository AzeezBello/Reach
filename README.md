
# REACH

### Residents Engagement, Access, Communication & Help

**REACH** is a digital civic office platform that connects residents with public-service offices, programmes, opportunities, community projects, and service-request workflows through a single digital experience.

REACH is designed as a **multi-tenant platform**. A single codebase can power multiple civic offices, constituencies, jurisdictions, agencies, or community organizations while keeping their data and branding logically separated.

---

## Overview

REACH transforms the traditional physical constituency/public office into a digital service platform.

Residents can:

* Discover available programmes
* Find scholarships, jobs, training, grants, and other opportunities
* Submit community and service requests
* Track submitted requests
* View public/community projects
* Access their digital civic office
* Create an account and securely sign in
* Use a personal dashboard to follow requests, applications and notifications
* Receive future communications through WhatsApp and other channels

Administrators and staff can manage:

* Residents
* Service requests
* Programmes
* Opportunities
* Community projects
* Office staff
* Jurisdictions
* Notifications
* Operational activity and audit records

---

# Product Architecture

```text
REACH
│
├── Platform
│   ├── Organizations
│   ├── Jurisdictions
│   ├── Offices
│   └── Users / Roles
│
├── Civic Services
│   ├── Requests
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
│   └── Requests
│
└── Administration
    ├── Office Dashboard
    ├── Staff
    ├── Requests
    ├── Programmes
    ├── Projects
    ├── Opportunities
    └── Analytics
```

---

# Core Concepts

## Organization

An organization represents the entity operating a REACH deployment.

Examples:

* Civic office
* Constituency office
* Public agency
* Community organization
* Local government office

Each organization can have its own:

* Name
* Logo
* Description
* Brand colors
* Contact information
* WhatsApp number
* Website

---

## Jurisdiction

A jurisdiction defines the geographic or administrative area served by an office.

Supported jurisdiction types include:

* State
* Senatorial District
* Federal Constituency
* State Constituency
* LGA
* LCDA
* Ward
* Community

Jurisdictions can have parent/child relationships, allowing REACH to model government and community structures.

---

## Office

An organization can operate one or more offices.

Supported office types include:

* Governor
* Senator
* House of Representatives
* House of Assembly
* LGA
* LCDA
* Councillor
* Public Agency
* Community Office
* Other

---

# Current Features

## Public Civic Portal

The public-facing REACH application provides:

* Organization branding
* Jurisdiction information
* Programme discovery
* Opportunity discovery
* Project discovery
* Service-request entry points
* Resident authentication
* Breadcrumbs, canonical URLs, Open Graph share images and JSON-LD structured data on every page
* `sitemap.xml`, `robots.txt` and `llms.txt` generated from live content

---

## Brand & Media

The app is branded **REACH** in the header, footer, page titles and share image; the tenant (FKL Connect) is named in the footer, metadata and structured data. The identity uses a leaf-green primary, a gold accent and a deep green-black "ink" for dark sections. The palette lives in `app/globals.css` as Tailwind theme tokens (`brand-*`, `gold-*`, `ink`).

Brand assets live in `public/brand/`:

```text
public/brand/logo.svg          Horizontal logo for light backgrounds
public/brand/logo-white.svg    Horizontal logo for dark backgrounds
public/brand/logo-mark.svg     Square mark (also used as the favicon via app/icon.svg)
```

Photos and videos in `public/images` and `public/videos` keep their original export names. `lib/media.ts` assigns each one a role and alt text, so pages never reference raw filenames. Videos only download when a resident taps play; the hero clip auto-plays muted on larger screens unless the visitor prefers reduced motion or reduced data.

The social share image is generated at build time from `app/opengraph-image.tsx`.

---

## Resident Dashboard

Signed-in residents have a dashboard at `/dashboard` showing:

* Request statistics (submitted, open, resolved)
* Recent requests with links to a per-request page (`/requests/[id]`) that shows the status timeline from `request_updates`
* Programme applications
* Events the resident has RSVPed to
* Notifications sent to the resident
* An editable profile (full name and phone number)

---

## Superadmin Console

Platform administrators manage every tenant from `/superadmin`:

The platform console uses its own responsive administration shell, separate from the resident and office dashboard navigation.

| Page | What it does |
| --- | --- |
| `/superadmin` | Platform-wide counts and the latest requests |
| `/superadmin/organizations` | List, create, activate and deactivate organizations; edit branding and contact details |
| `/superadmin/jurisdictions` | List and create jurisdictions, including parent/child nesting |
| `/superadmin/offices` | List, create, activate and deactivate offices |
| `/superadmin/staff` | Attach resident accounts to offices as staff or admin |
| `/superadmin/members` | Assign existing accounts to organizations, update membership roles and remove memberships |
| `/superadmin/leader-accounts` | Link existing REACH accounts to leadership profiles and remove those links; does not create or invite users |
| `/superadmin/leaders` | Create leadership profiles and link them to programmes, opportunities, projects and events as lead or collaboration partner |
| `/superadmin/requests` | Update request status, post a note to the resident's timeline and keep internal staff notes |

Access is granted to accounts whose `profiles.role` is `admin` or `superadmin`. Every page and server action re-checks the role; row-level security must also allow these operations for the role.

---

## Events

Offices publish dated activities such as **Acada Carnival**, community fitness days and town halls.

Event records contain:

* Title, slug, summary, description, category
* Venue and location
* Start and end time
* Registration URL and capacity
* Status (`draft`, `published`, `cancelled`)
* Image and a featured flag

Signed-in residents can RSVP from the event page; the attendee count is shown publicly without exposing who is attending. Events appear on the homepage, at `/events`, in the sitemap, in `llms.txt`, and on the resident dashboard.

---

## Leadership Profiles & Collaborations

Public office holders connected to the community have profile pages at `/leadership/[slug]` with biography, public-service record and official reference sources.

Profiles live in the `leaders` table and are grouped by level (`federal`, `state`, `local`). Until that table is migrated and seeded, the site falls back to the built-in profiles in `lib/data/leaders.json` (ten office holders across the federal, Lagos State and local levels).

Programmes, opportunities, projects and events are linked to leaders through `content_leaders`:

```text
content_type   programme | opportunity | project | event
content_id     the item's id
leader_id      the leader
role           lead | partner
```

An item with a single `lead` is an individual initiative. An item with a `lead` plus one or more `partner` rows is a **joint collaboration**. Detail pages show a "Led by" or "Joint collaboration" panel, and each leader's profile lists everything they are involved in.

---

## Programmes

Organizations can publish programmes and initiatives.

Programme information includes:

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

Supported programme statuses:

```text
draft
open
ongoing
completed
archived
```

---

## Opportunities

REACH provides an opportunities hub for residents.

Opportunity categories include:

* Scholarships
* Jobs
* Training
* Grants
* Internships
* Business support
* Other

Opportunity records can contain:

* Title
* Organization
* Type
* Summary
* Description
* Application URL
* Deadline
* Location
* Status

---

## Community Projects

Public projects can be published and tracked through REACH.

Project information includes:

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

Future versions will extend this into a full project-tracking system with:

* Project timelines
* Milestones
* Progress updates
* Project photos
* Geographic mapping
* Beneficiary information
* Completion reporting

---

# Civic Requests

Residents can submit requests to the appropriate civic office.

Example categories include:

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

Each request contains:

* Reference number
* Resident
* Organization
* Jurisdiction
* Category
* Subject
* Description
* Status
* Staff notes
* Created date
* Updated date

Request statuses:

```text
submitted
under_review
in_progress
resolved
closed
```

---

# Resident Authentication

REACH uses Supabase Authentication.

Residents can:

* Create an account
* Sign in
* Maintain their profile
* Submit requests
* View their requests
* Apply for programmes
* Receive future notifications

Authentication uses the Supabase SSR integration for Next.js.

---

# Multi-Tenant Architecture

REACH is designed around tenant isolation.

```text
Organization
      │
      ├── Offices
      │      │
      │      └── Jurisdiction
      │
      ├── Programmes
      │
      ├── Opportunities
      │
      ├── Projects
      │
      └── Requests
```

Content is associated with an organization through:

```text
organization_id
```

Geographic responsibility is associated through:

```text
jurisdiction_id
```

This allows the platform to eventually support:

```text
reach.example.com
```

or tenant-specific deployments such as:

```text
fkl.reach.example.com
office.reach.example.com
lagos.reach.example.com
```

without requiring a separate application for every organization.

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React

## Backend

* Next.js App Router
* Next.js Route Handlers
* Supabase

## Database

* PostgreSQL
* Supabase Row Level Security
* Supabase Auth

## Deployment

* Vercel

## Repository

GitHub:

```text
https://github.com/AzeezBello/Reach
```

---

# Project Structure

```text
reach/
│
├── app/
│   ├── api/tenant/route.ts          Public tenant JSON endpoint
│   ├── auth/signout/route.ts        Sign-out handler
│   ├── dashboard/                   Resident dashboard + profile action
│   ├── events/                      Events index, detail and RSVP action
│   ├── leadership/                  Leadership index and profiles
│   ├── llms.txt/route.ts            llms.txt for AI crawlers
│   ├── login/                       Sign in / create account
│   ├── opportunities/               Opportunities index and detail
│   ├── programmes/                  Programmes index and detail
│   ├── projects/                    Projects index and detail
│   ├── requests/                    My requests, new request, request detail
│   ├── superadmin/                  Platform console + server actions
│   ├── error.tsx · not-found.tsx    Error and 404 pages
│   ├── icon.svg                     Favicon
│   ├── opengraph-image.tsx          Generated social share image
│   ├── robots.ts · sitemap.ts       Crawler files
│   ├── layout.tsx · page.tsx        Root layout and homepage
│   └── globals.css                  Tailwind theme tokens
│
├── components/
│   ├── header.tsx · nav.tsx · footer.tsx
│   ├── page-hero.tsx · breadcrumbs.tsx · json-ld.tsx
│   ├── content-card.tsx · detail.tsx · media.tsx · video-player.tsx
│   ├── leaders-panel.tsx            "Led by" / joint collaboration credits
│   ├── request-form.tsx · auth-form.tsx · action-form.tsx
│   ├── admin.tsx · admin-nav.tsx    Dashboard and console building blocks
│   └── ui.tsx                       Buttons, badges, section headers
│
├── lib/
│   ├── reach.ts                     Public data access (tenant, content, session)
│   ├── admin.ts                     Dashboard and superadmin data access + guards
│   ├── leaders.ts                   Leadership profiles and collaborations (with static fallback)
│   ├── seo.ts                       Canonical URLs and JSON-LD schemas
│   ├── media.ts                     Curated photos, videos and alt text
│   ├── data/leaders.json            Built-in leadership profiles (source for seed.sql)
│   ├── format.ts · navigation.ts · config.ts · types.ts · leadership.ts
│   └── supabase/                    Browser and server clients
│
├── proxy.ts                         Session refresh on navigation
├── supabase/
│   ├── migrations/                  Versioned schema and policies
│   ├── seed.sql                     Leaders, collaborations and events for FKL Connect
│   └── config.toml
├── public/
│   ├── brand/                       Logo files
│   ├── images/                      Community photos (+ images/leaders/ portraits)
│   └── videos/                      Community videos
│
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

# Environment Variables

The application requires the following public Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

`NEXT_PUBLIC_SITE_URL` is the public origin (for example `https://reach-eta-two.vercel.app`) used for canonical URLs, the sitemap and share images. These values should be configured through the deployment environment.

For Vercel:

```text
Project
→ Settings
→ Environment Variables
```

Do **not** expose Supabase service-role or secret keys in browser/client code.

---

# Supabase Database

## Migrations

The schema is versioned in `supabase/migrations/` and applied with the Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push                       # applies every migration
supabase db execute --file supabase/seed.sql   # leaders, collaborations and events for FKL Connect
```

| File | Contents |
| --- | --- |
| `20260930000001_baseline.sql` | All core tables, the profile trigger on `auth.users`, request reference numbers (`REACH-000001`), indexes |
| `20260930000002_leaders.sql` | `leaders` and `content_leaders` |
| `20260930000003_policies.sql` | Row-level security for every table, plus the `is_platform_admin()` and `is_office_staff()` helpers |
| `20260930000004_events.sql` | `events`, `event_rsvps`, the public `event_rsvp_count()` function and event policies |

Every statement is idempotent (`create table if not exists`, `drop policy if exists`), so the files can be applied to the existing project without touching data that is already there.

The current database includes the following major entities:

```text
profiles
requests
programmes
programme_applications
opportunities
projects
events
event_rsvps
leaders
content_leaders

organizations
jurisdictions
offices
office_members

request_updates
project_updates
notifications
audit_logs
```

---

# Database Relationships

Conceptually:

```text
organizations
      │
      ├──────────────┐
      │              │
      ▼              ▼
   offices       programmes
      │
      ▼
jurisdictions

organizations
      │
      ├── opportunities
      ├── projects
      └── requests
              │
              ▼
           profiles
```

---

# Roles

The current application defines:

```text
resident
staff
admin
```

Accounts with the `admin` (or `superadmin`) role in `profiles.role` can open the platform console at `/superadmin`.

### Resident

Residents can:

* Manage their account
* Submit requests
* Track their requests
* Apply for programmes

### Staff

Staff members can eventually:

* Review requests
* Update request statuses
* Add internal notes
* Manage programmes
* Manage opportunities
* Manage projects
* Communicate with residents

### Admin

Administrators can manage:

* Organization settings
* Offices
* Jurisdictions
* Staff
* Programmes
* Opportunities
* Projects
* Requests
* System activity

---

# Security

REACH uses Supabase Row Level Security (RLS).

Security principles include:

* Residents can access their own profile
* Residents can access their own requests
* Residents can access their own applications
* Public users can access published public content
* Administrative records should remain restricted
* Tenant-specific records should be isolated by organization
* Service-role credentials must never be exposed to the browser

The platform should always use ownership and organization predicates when implementing protected data access.

---

# Local Development

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

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Production Build

Type-check, then build:

```bash
npm run typecheck
npm run build
```

Then:

```bash
npm start
```

---

# Deployment

REACH is designed for Vercel.

Production deployment flow:

```text
GitHub
   │
   ▼
Vercel
   │
   ▼
Next.js
   │
   ▼
Supabase
```

Push changes to `main`:

```bash
git add .
git commit -m "your commit message"
git push origin main
```

Vercel can automatically build and deploy the new commit.

---

# Current Deployment

The current REACH deployment is:

```text
https://reach-eta-two.vercel.app/
```

---

# Current Tenant

The initial REACH tenant is:

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

This deployment serves as the initial implementation of the broader REACH platform.

---

# Next Steps

Work that is ready in the codebase but still needs an action on the Supabase project or from the team.

## 1. Apply the database migrations and seed data

The `events`, `event_rsvps`, `leaders` and `content_leaders` tables and the row-level security policies live in `supabase/migrations/` but have not been applied to the hosted project yet. Until they are, the site falls back to the built-in leadership profiles and shows no events.

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase db execute --file supabase/seed.sql
```

The seed loads the ten leadership profiles (federal, Lagos State and local government), their collaborations, and three published events (Acada Carnival 2026, FKL Sports Community Fitness Day, Constituency Town Hall). It is safe to run more than once.

## 2. Create the first platform administrator

The superadmin console at `/superadmin` is gated on `profiles.role`. Set the role for your own account in the Supabase table editor or with SQL:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Then sign in and open `/superadmin`. The resident dashboard at `/dashboard` works for any signed-in account.

## 3. Add the remaining leader photos

Portraits exist for eight leaders in `public/images/leaders/`. Hon. Prince Muiz Dosunmu and Hon. Akeem Olayiwola AbdulRahman show an initials avatar until a photo is added. Drop a portrait into `public/images/leaders/<slug>.jpg`, then set `image_url` on the leader from `/superadmin/leaders` (or in `supabase/seed.sql` and `lib/leadership.ts`).

## 4. Supply the official logo

The SVG logos in `public/brand/` were designed from the brand colours in the photos. If an official REACH or FKL Connect logo exists, replace `logo.svg`, `logo-white.svg`, `logo-mark.svg` and `app/icon.svg` with the same file names and sizes; nothing else needs to change.

## 5. Check content that is not scoped to the tenant

Two older programmes ("Summer with FKL" and "FKL Skills Development Programme") are published but do not appear on the site because their `organization_id` is not the FKL Connect organisation. Update them in Supabase or from the office's content tools.

## 6. Set the production environment

On Vercel, add `NEXT_PUBLIC_SITE_URL` alongside the two Supabase variables so canonical URLs, the sitemap and the share image use the real domain.

## 7. Verify before each release

```bash
npm run typecheck
npm run build
```

Both must pass. The build fails on any TypeScript error, and no browser source maps are emitted in production.

---

# Product Roadmap

## Phase 1 — Foundation

* [x] Next.js application
* [x] REACH public homepage
* [x] Supabase integration
* [x] Organization model
* [x] Jurisdiction model
* [x] Office model
* [x] Resident authentication
* [x] Programme discovery
* [x] Opportunity discovery
* [x] Project discovery
* [x] Civic request submission
* [x] Multi-tenant data model
* [x] Supabase RLS foundation
* [x] Vercel deployment

---

## Phase 2 — Resident Experience

* [x] Resident dashboard
* [x] Request history
* [x] Request detail pages
* [x] Request status timeline
* [ ] Programme application workflow
* [ ] Opportunity application tracking
* [x] Events with RSVP
* [x] Leadership profiles with collaborations
* [x] Resident profile
* [ ] Notifications
* [ ] Email notifications
* [ ] WhatsApp notifications

---

## Phase 3 — Civic Office Administration

* [x] Platform (superadmin) console
* [ ] Staff dashboard
* [x] Staff management
* [x] Request status management
* [ ] Request assignment
* [ ] Internal notes
* [x] Request status workflow
* [ ] Programme management
* [ ] Opportunity management
* [ ] Project management
* [ ] Media uploads
* [x] Organization settings

---

## Phase 4 — Project Tracking

* [ ] Project detail pages
* [ ] Project milestones
* [ ] Project updates
* [ ] Progress indicators
* [ ] Project photo gallery
* [ ] Location mapping
* [ ] Beneficiary reporting
* [ ] Completion reports

---

## Phase 5 — REACH Intelligence

### Who Handles This?

A routing engine that determines which office or jurisdiction should handle a resident's request.

Example:

```text
Resident submits:

"My street has been flooded."

          │
          ▼

REACH classifies request

          │
          ▼

Category:
Drainage / Infrastructure

          │
          ▼

Determine jurisdiction

          │
          ▼

Identify responsible office

          │
          ▼

Route request
```

This is intended to reduce the common problem of residents not knowing which government or public-service office is responsible for a particular issue.

---

# Future REACH Network

The long-term platform can provide a unified civic-service directory.

```text
                 REACH NETWORK
                       │
       ┌───────────────┼───────────────┐
       │               │               │
     State           LGA          Constituency
       │               │               │
      Ward          Community       Public Office
       │               │               │
       └───────────────┼───────────────┘
                       │
                    Resident
```

A resident could identify their location or jurisdiction and discover:

* Relevant public offices
* Available programmes
* Opportunities
* Community projects
* Service-request channels
* Contact information

---

# WhatsApp Integration

A future REACH communication layer will integrate WhatsApp for resident communication.

Potential workflows:

```text
Resident
   │
   ▼
WhatsApp
   │
   ▼
REACH
   │
   ├── Create request
   ├── Check request status
   ├── Discover programmes
   ├── Find opportunities
   └── Receive notifications
```

The platform should preserve the same authorization and tenant boundaries across WhatsApp and the web application.

---

# Notifications

The notification system is designed to support:

* Request received
* Request status changed
* Request resolved
* Programme application updates
* Opportunity deadlines
* Programme announcements
* Project updates

Future channels:

```text
In-app
Email
WhatsApp
SMS
```

---

# Analytics

Future administrative analytics will include:

### Requests

* Requests received
* Requests by category
* Requests by jurisdiction
* Requests by status
* Average resolution time
* Open vs resolved requests

### Programmes

* Programme registrations
* Applications
* Approval rates
* Programme participation

### Opportunities

* Published opportunities
* Application activity
* Upcoming deadlines

### Projects

* Active projects
* Completed projects
* Project locations
* Beneficiary counts

---

# Design Principles

REACH follows several core product principles:

### 1. Service First

The platform focuses on helping residents access information and services.

### 2. Simple

Residents should not need to understand government structures before requesting help.

### 3. Transparent

Where appropriate, requests and projects should provide clear status and progress information.

### 4. Accessible

The platform should work effectively across:

* Mobile phones
* Tablets
* Desktop computers
* Low-bandwidth environments

### 5. Multi-Tenant

Organizations should be able to operate independently on the same platform architecture.

### 6. Secure

Resident data and administrative records must be protected through authentication, authorization, RLS, and tenant isolation.

---

# Development Standards

When adding new functionality:

1. Use TypeScript.
2. Keep components modular.
3. Keep Supabase queries server-side where appropriate.
4. Never expose service-role credentials.
5. Apply RLS to new protected tables.
6. Scope tenant data using `organization_id`.
7. Scope geographic data using `jurisdiction_id`.
8. Validate authenticated users before creating resident-owned records.
9. Use meaningful commit messages.
10. Run the production build before pushing.

Recommended workflow:

```bash
npm install
npm run build
git status
git add .
git commit -m "feat: description"
git push origin main
```

---

# Contributing

1. Create a feature branch.

```bash
git checkout -b feature/my-feature
```

2. Implement the feature.

3. Test locally.

```bash
npm run build
```

4. Commit changes.

```bash
git add .
git commit -m "feat: add my feature"
```

5. Push the branch.

```bash
git push origin feature/my-feature
```

6. Open a pull request.

---

# License

The license for REACH should be defined by the project owner before public redistribution or commercial reuse.

---

# REACH

**Residents Engagement, Access, Communication & Help**

A digital platform for connecting communities with public-service offices, programmes, opportunities, projects, and civic support.

```text
Discover → Engage → Track → Connect
```

