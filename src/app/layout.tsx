import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GuideDialog } from "@/components/GuideDialog";
import { StoreProvider } from "@/components/store";
import { TopBar } from "@/components/TopBar";
import { Watermark } from "@/components/Watermark";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://suiteandseat.vercel.app"),
  title: { default: "Suite & Seat", template: "%s · Suite & Seat" },
  openGraph: { siteName: "Suite & Seat", locale: "en_IN", type: "website" },
  twitter: { card: "summary_large_image", creator: "@pratik0227" },
  description:
    "Credit card reward points calculator by CA Pratik Bharda: Axis EDGE Miles, HDFC, Amex and HSBC transfer partners ranked by rupee value, with where-to-fly guides and a card picker.",
  applicationName: "Suite & Seat",
  // Google Search Console ownership check (public code, safe to commit)
  verification: { google: "98JxIFvSlK8eNpqWDmdXLyV4zj_7vfQJQqdVe_t1gys" },
  authors: [{ name: "CA Pratik Bharda", url: "https://x.com/pratik0227" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1769a8",
};

/**
 * Travelpayouts site script (account 597231): verifies the site for the
 * Travelpayouts partner account behind the fare lookup, and runs their
 * "Drive" affiliate features. It must be in the page HTML for verification.
 * Drive's features can be switched off in the Travelpayouts dashboard.
 */
const TRAVELPAYOUTS_SCRIPT = `(function () {
  var script = document.createElement("script");
  script.async = 1;
  script.setAttribute("data-cmp-ab","2");
  script.src = 'https://tp-em.com/NTk3MjMx.js?t=597231';
  document.head.appendChild(script);
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script data-cmp-ab="2" dangerouslySetInnerHTML={{ __html: TRAVELPAYOUTS_SCRIPT }} />
      </head>
      <body>
        <Watermark />
        <StoreProvider>
          <TopBar />
          {children}
          <GuideDialog />
        </StoreProvider>
        {/* Anonymous, cookie-free page-view counts (Vercel Web Analytics, free tier) */}
        <Analytics />
      </body>
    </html>
  );
}
