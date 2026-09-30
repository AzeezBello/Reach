import { leaders } from "@/lib/leadership";
import { PLATFORM_NAME, SITE_URL, getPublicData, getTenant } from "@/lib/reach";
import { siteDescription } from "@/lib/seo";

/**
 * llms.txt: a plain-text overview of the site for AI crawlers,
 * following the llmstxt.org convention.
 */
export async function GET() {
  const lines: string[] = [];

  try {
    const { tenant, jurisdiction, programmes, opportunities, projects } =
      await getPublicData();

    lines.push(
      `# ${tenant.name}`,
      "",
      `> ${siteDescription(tenant, jurisdiction)}`,
      "",
      `${tenant.name} is a digital constituency office${
        jurisdiction ? ` serving ${jurisdiction.name}` : ""
      }. It is built on ${PLATFORM_NAME} (Residents Engagement, Access, Communication & Help), a multi-tenant civic service platform. Residents can discover programmes, find opportunities, follow community projects, and submit service requests that receive a reference number for tracking.`,
      "",
      "## Main pages",
      "",
      `- [Home](${SITE_URL}/): overview of services, community stories and quick links`,
      `- [Programmes](${SITE_URL}/programmes): education, skills, health and community programmes open to residents`,
      `- [Opportunities](${SITE_URL}/opportunities): scholarships, training, jobs, grants and business support`,
      `- [Projects](${SITE_URL}/projects): community infrastructure and public-space projects with status`,
      `- [Leadership](${SITE_URL}/leadership): public leadership profiles with official reference sources`,
      `- [Request assistance](${SITE_URL}/requests/new): submit a service request to the office`,
      `- [My requests](${SITE_URL}/requests): signed-in residents can track their requests`,
      ""
    );

    if (programmes.length > 0) {
      lines.push("## Programmes", "");
      for (const item of programmes) {
        lines.push(
          `- [${item.title}](${SITE_URL}/programmes/${item.slug})${
            item.summary ? `: ${item.summary}` : ""
          }`
        );
      }
      lines.push("");
    }

    if (opportunities.length > 0) {
      lines.push("## Opportunities", "");
      for (const item of opportunities) {
        lines.push(
          `- [${item.title}](${SITE_URL}/opportunities/${item.slug})${
            item.summary ? `: ${item.summary}` : ""
          }`
        );
      }
      lines.push("");
    }

    if (projects.length > 0) {
      lines.push("## Community projects", "");
      for (const item of projects) {
        lines.push(
          `- [${item.title}](${SITE_URL}/projects/${item.slug})${
            item.status ? ` (${item.status})` : ""
          }`
        );
      }
      lines.push("");
    }
  } catch {
    const { tenant, jurisdiction } = await getTenant().catch(() => ({
      tenant: { name: "FKL Connect", description: null },
      jurisdiction: null,
    }));

    lines.push(
      `# ${tenant.name}`,
      "",
      `> ${siteDescription(tenant, jurisdiction)}`,
      "",
      `- [Home](${SITE_URL}/)`,
      `- [Programmes](${SITE_URL}/programmes)`,
      `- [Opportunities](${SITE_URL}/opportunities)`,
      `- [Projects](${SITE_URL}/projects)`,
      `- [Leadership](${SITE_URL}/leadership)`,
      `- [Request assistance](${SITE_URL}/requests/new)`,
      ""
    );
  }

  lines.push("## Leadership profiles", "");
  for (const leader of leaders) {
    lines.push(
      `- [${leader.name}](${SITE_URL}/leadership/${leader.slug}): ${leader.role}, ${leader.office}`
    );
  }
  lines.push("", "## Optional", "", `- [Sitemap](${SITE_URL}/sitemap.xml)`, "");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
