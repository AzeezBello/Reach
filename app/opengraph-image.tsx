import { ImageResponse } from "next/og";

import { getTenant, PLATFORM_NAME } from "@/lib/reach";

export const alt = "FKL Connect, digital constituency office";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const { tenant, jurisdiction } = await getTenant().catch(() => ({
    tenant: { name: "FKL Connect", description: null },
    jurisdiction: null,
  }));

  const subtitle = jurisdiction
    ? `${jurisdiction.name}${jurisdiction.state ? `, ${jurisdiction.state}` : ""}`
    : "Digital constituency office";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #06130b 0%, #0b2013 55%, #14532d 100%)",
          color: "#ffffff",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "linear-gradient(135deg, #22c55e, #15803d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="72" height="72" viewBox="0 0 64 64">
              <path
                d="M15 40 L32 23 L49 40"
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 51 L32 41 L42 51"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.72"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="32" cy="13" r="4.5" fill="#facc15" />
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
              {tenant.name}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 4,
                color: "#86efac",
                textTransform: "uppercase",
              }}
            >
              Digital constituency office
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 74,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Your community. One digital office.
          </div>

          <div style={{ fontSize: 30, color: "#cbd5e1" }}>
            Programmes · Opportunities · Projects · Service requests
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#94a3b8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#facc15",
              }}
            />
            {subtitle}
          </div>
          <div>{`Powered by ${PLATFORM_NAME}`}</div>
        </div>
      </div>
    ),
    size
  );
}
