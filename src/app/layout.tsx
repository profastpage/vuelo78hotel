import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { getClientProfile, getSiteContent } from "@/lib/site-config";
import { buildSiteMetadata, buildJsonLdScript } from "@/lib/seo";
import { AnimationsProvider } from "@/components/site/AnimationsProvider";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = getClientProfile();
  const content = getSiteContent();
  return buildSiteMetadata(profile, content);
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = getClientProfile();
  const content = getSiteContent();
  const jsonLd = buildJsonLdScript(profile, content);

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body className={`${sans.variable} ${serif.variable}`}>
        <AnimationsProvider>{children}</AnimationsProvider>
      </body>
    </html>
  );
}
