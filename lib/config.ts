/*
 * Environment-free constants. Safe to import from client components.
 */

export const PLATFORM_NAME = "REACH";

export const DEFAULT_TENANT_SLUG = "fkl-connect";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://reach-eta-two.vercel.app";
