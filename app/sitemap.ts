import type { MetadataRoute } from "next";

import { getLeaders } from "@/lib/leaders";
import { SITE_URL, getPublicData } from "@/lib/reach";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/programmes",
    "/opportunities",
    "/projects",
    "/events",
    "/leadership",
    "/requests",
    "/requests/new",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const leaders = await getLeaders();

  const leaderRoutes = leaders.map((leader) => ({
    url: `${SITE_URL}/leadership/${leader.slug}`,
    lastModified: new Date(),
  }));

  try {
    const { programmes, opportunities, projects, events } = await getPublicData();

    const contentRoutes = [
      ...programmes.map((item) => `/programmes/${item.slug}`),
      ...opportunities.map((item) => `/opportunities/${item.slug}`),
      ...projects.map((item) => `/projects/${item.slug}`),
      ...events.map((item) => `/events/${item.slug}`),
    ].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    }));

    return [...staticRoutes, ...leaderRoutes, ...contentRoutes];
  } catch {
    return [...staticRoutes, ...leaderRoutes];
  }
}
