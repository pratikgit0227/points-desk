import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Points Desk",
  description:
    "Credit card reward points calculator by CA Pratik Bharda: Axis EDGE Miles, HDFC, Amex and HSBC transfer partners ranked by rupee value, with where-to-fly guides and a card picker.",
  applicationName: "Points Desk",
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
      <body>{children}</body>
    </html>
  );
}
