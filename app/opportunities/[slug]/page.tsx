const { data: opportunity } = await supabase
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
    image_url,
    organization_id
  `)
  .eq("slug", slug)
  .eq("organization_id", tenant.id)
  .eq("status", "active")
  .single();