import { createClient } from "@/lib/supabase/server";

export const PLATFORM_NAME = "REACH";
export const DEFAULT_TENANT_SLUG = "fkl-connect";

export async function getPublicData(
  slug = DEFAULT_TENANT_SLUG
) {
  const supabase = await createClient();

  // --------------------------------------------------
  // Organization / Tenant
  // --------------------------------------------------

  const { data: tenant, error: tenantError } = await supabase
    .from("organizations")
    .select(`
      id,
      name,
      slug,
      description,
      logo_url,
      primary_color,
      secondary_color,
      whatsapp_number,
      email,
      phone,
      website
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (tenantError) {
    throw new Error(tenantError.message);
  }

  // --------------------------------------------------
  // Jurisdiction
  // --------------------------------------------------

  const { data: office, error: officeError } = await supabase
    .from("offices")
    .select("jurisdiction_id")
    .eq("organization_id", tenant.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (officeError) {
    throw new Error(officeError.message);
  }

  let jurisdiction = null;

  if (office?.jurisdiction_id) {
    const { data, error } = await supabase
      .from("jurisdictions")
      .select(`
        id,
        name,
        slug,
        type,
        state,
        lga,
        lcda,
        ward
      `)
      .eq("id", office.jurisdiction_id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    jurisdiction = data;
  }

  // --------------------------------------------------
  // Programmes
  // --------------------------------------------------

  const programmesQuery = supabase
    .from("programmes")
    .select(`
      id,
      title,
      slug,
      summary,
      description,
      category,
      location,
      start_date,
      end_date,
      registration_deadline,
      status,
      capacity,
      image_url
    `)
    .eq("organization_id", tenant.id)
    .in("status", ["open", "ongoing"])
    .order("created_at", {
      ascending: false,
    });

  // --------------------------------------------------
  // Opportunities
  // --------------------------------------------------

  const opportunitiesQuery = supabase
  .from("opportunities")
  .select(`
    id,
    title,
    slug,
    organization,
    type,
    summary,
    description,
    application_url,
    deadline,
    location,
    status,
    image_url
  `)
  .eq("organization_id", tenant.id)
  .eq("status", "active")
  .order("created_at", { ascending: false });

  // --------------------------------------------------
  // Projects
  // --------------------------------------------------

  const projectsQuery = supabase
    .from("projects")
    .select(`
      id,
      title,
      slug,
      category,
      description,
      location,
      status,
      start_date,
      completion_date,
      beneficiary_count,
      image_url
    `)
    .eq("organization_id", tenant.id)
    .order("created_at", {
      ascending: false,
    });

  const [
    { data: programmes, error: programmesError },
    { data: opportunities, error: opportunitiesError },
    { data: projects, error: projectsError },
  ] = await Promise.all([
    programmesQuery,
    opportunitiesQuery,
    projectsQuery,
  ]);

  if (programmesError) {
    throw new Error(programmesError.message);
  }

  if (opportunitiesError) {
    throw new Error(opportunitiesError.message);
  }

  if (projectsError) {
    throw new Error(projectsError.message);
  }

  return {
      platform: PLATFORM_NAME,
    tenant,
    jurisdiction,
    programmes: programmes ?? [],
    opportunities: opportunities ?? [],
    projects: projects ?? [],
  };
}