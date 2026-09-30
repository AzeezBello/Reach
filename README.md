
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
│   ├── api/
│   │   └── tenant/
│   │       └── route.ts
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── opportunities/
│   │   └── page.tsx
│   │
│   ├── programmes/
│   │   └── page.tsx
│   │
│   ├── projects/
│   │   └── page.tsx
│   │
│   ├── requests/
│   │   └── new/
│   │       └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   └── header.tsx
│
├── lib/
│   ├── reach.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
│
├── proxy.ts
│
├── public/
│
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
```

These values should be configured through the deployment environment.

For Vercel:

```text
Project
→ Settings
→ Environment Variables
```

Do **not** expose Supabase service-role or secret keys in browser/client code.

---

# Supabase Database

The current database includes the following major entities:

```text
profiles
requests
programmes
programme_applications
opportunities
projects

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

Run:

```bash
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

* [ ] Resident dashboard
* [ ] Request history
* [ ] Request detail pages
* [ ] Request status timeline
* [ ] Programme application workflow
* [ ] Opportunity application tracking
* [ ] Resident profile
* [ ] Notifications
* [ ] Email notifications
* [ ] WhatsApp notifications

---

## Phase 3 — Civic Office Administration

* [ ] Admin dashboard
* [ ] Staff dashboard
* [ ] Staff management
* [ ] Request management
* [ ] Request assignment
* [ ] Internal notes
* [ ] Request status workflow
* [ ] Programme management
* [ ] Opportunity management
* [ ] Project management
* [ ] Media uploads
* [ ] Organization settings

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

