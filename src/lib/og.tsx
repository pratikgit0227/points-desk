import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Share image for X, WhatsApp and LinkedIn previews, in the site's colours.
 * Uses the font bundled with next/og (it has the ₹ sign), so nothing is downloaded.
 */
export function shareImage({ eyebrow, title, big, sub }: { eyebrow: string; title: string; big: string; sub: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(160deg, #eaf3fb 0%, #ffffff 60%)",
          color: "#111827",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 28, color: "#1769a8", textTransform: "uppercase", letterSpacing: 2 }}>{eyebrow}</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 56, color: "#0f3d63" }}>{big}</div>
          <div style={{ fontSize: 30, color: "#4b5563" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
          <div style={{ display: "flex" }}>
            <span style={{ fontWeight: 700 }}>Points&nbsp;</span>
            <span style={{ fontWeight: 700, color: "#0b6e3d" }}>Desk</span>
            <span style={{ color: "#6b7280" }}>&nbsp;· by CA Pratik Bharda</span>
          </div>
          <div style={{ color: "#6b7280" }}>suiteandseat.vercel.app</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
