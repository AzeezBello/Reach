# REACH Platform

Multi-tenant digital civic office platform. The first deployment is FKL Connect.

## Stack
Next.js, TypeScript, Tailwind CSS, Supabase.

## Modules
Requests, programmes, opportunities, project tracker, resident portal, WhatsApp integration, office dashboard.

## Supabase
Project ref: ginlqxripetocggfvshk
# Reach


### Next build phase

I recommend we implement these in this order:

1. **REACH public homepage**

   * Civic-service positioning
   * Find your jurisdiction
   * Programmes
   * Opportunities
   * Projects
   * Request help
   * WhatsApp

2. **Jurisdiction system**

   * State
   * LGA
   * LCDA
   * Constituency
   * Ward
   * Office
   * Organization/tenant switching

3. **Resident authentication**

   * Sign up / sign in
   * Resident profile
   * Location/jurisdiction
   * Dashboard

4. **Requests system**

   * Submit issue/request
   * Generate REACH reference number
   * Request timeline
   * Status updates
   * Staff assignment

5. **Programmes & opportunities**

   * Browse
   * Search/filter
   * Application
   * Application status

6. **Project transparency**

   * Project directory
   * Project details
   * Progress timeline
   * Photos/updates
   * Map/location

7. **Admin/Civic Office**

   * Requests
   * Residents
   * Programmes
   * Opportunities
   * Projects
   * Applications
   * Analytics

8. **WhatsApp**

   * Click-to-WhatsApp initially
   * Then WhatsApp Business API/webhooks
   * Automated request/application notifications

The important architectural principle remains:

**REACH is the platform. FKL Connect is simply the first tenant.**

So we won't hard-code FKL into the application.
