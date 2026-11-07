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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
