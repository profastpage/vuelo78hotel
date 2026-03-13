import type { Metadata } from "next";
import type { ClientProfile, SiteContent } from "@/types/site";

const DEFAULT_SITE_URL = "https://vuelo78hotel.vercel.app";

const NICHE_CATEGORIES: Record<string, string> = {
  restaurante: "Restaurant",
  peluqueria: "Beauty Salon",
  inmobiliaria: "Real Estate Agency",
  clinica: "Medical Clinic",
  tecnologia: "Technology Company",
  servicios: "Professional Services",
  fitness: "Fitness & Wellness",
  educacion: "Education & Training",
  legal: "Legal Services",
  moda: "Fashion & Apparel",
  generic: "Business",
};

function getNicheSlug(industry: string) {
  const key = industry.toLowerCase();
  if (NICHE_CATEGORIES[key]) return key;
  return "generic";
}

function resolveSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    DEFAULT_SITE_URL;

  const normalized = candidate.startsWith("http") ? candidate : `https://${candidate}`;
  return normalized.replace(/\/+$/, "");
}

function resolveShareImage(content: SiteContent) {
  const candidate =
    content.services.find((service) => service.imageSrc)?.imageSrc ||
    content.galleryItems?.find((item) => item.imageSrc)?.imageSrc ||
    content.brand.heroImageSrc ||
    "/assets/uploads/hotel-deluxe-wide.jpg";

  return candidate.startsWith("/") ? candidate : `/${candidate}`;
}

function resolvePrimaryLocation(content: SiteContent) {
  const rawLocation = content.location?.city?.trim() || "Tarapoto";
  return rawLocation.split(",")[0]?.trim() || "Tarapoto";
}

function buildReservationTitle(profile: ClientProfile, content: SiteContent) {
  if (!content.brand.name) {
    return "Sitio Web";
  }

  const trimmedHeadline = content.brand.headline?.trim();
  if (trimmedHeadline && trimmedHeadline.toLowerCase() !== content.brand.name.trim().toLowerCase()) {
    return `${content.brand.name} | ${trimmedHeadline}`;
  }

  const city = resolvePrimaryLocation(content);
  return `${content.brand.name} | Reserva directa en ${city}`;
}

function buildReservationDescription(profile: ClientProfile, content: SiteContent) {
  const city = resolvePrimaryLocation(content);
  const offer =
    profile.brandConfig.offerSummary?.trim() ||
    content.brand.subheadline?.trim() ||
    "habitaciones comodas y atencion directa";

  return `Reserva directo en ${content.brand.name} y confirma tu estadia en ${city} por WhatsApp con una experiencia clara, ${offer.toLowerCase()}.`;
}

function buildJsonLd(profile: ClientProfile, content: SiteContent) {
  const niche = getNicheSlug(profile.industry);
  const category = NICHE_CATEGORIES[niche] ?? "LocalBusiness";
  const siteUrl = resolveSiteUrl();

  const base = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: content.brand.name,
    description: content.brand.description || content.brand.subheadline,
    telephone: content.contact.whatsappNumber || profile.brandConfig.whatsappNumber,
    email: content.contact.email || profile.brandConfig.email,
    "@id": siteUrl,
    url: siteUrl,
    priceRange: "$$",
    ...(content.location?.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: content.location.address,
            addressLocality: content.location.city ?? "",
          },
        }
      : {}),
    ...(content.location?.hours
      ? {
          openingHours: content.location.hours,
        }
      : {}),
  };

  // Override type based on niche for richer schema
  const typeMap: Record<string, string> = {
    restaurante: "Restaurant",
    peluqueria: "HairSalon",
    clinica: "MedicalClinic",
    inmobiliaria: "RealEstateAgent",
  };

  if (typeMap[niche]) {
    return { ...base, "@type": typeMap[niche] };
  }

  return { ...base, "@type": category };
}

export function buildSiteMetadata(
  profile: ClientProfile,
  content: SiteContent
): Metadata {
  const siteUrl = resolveSiteUrl();
  const title = buildReservationTitle(profile, content);

  const description =
    buildReservationDescription(profile, content) ||
    content.brand.description ||
    content.brand.subheadline ||
    profile.brandConfig.businessDescription ||
    "Bienvenido a nuestro sitio.";
  const shareImage = resolveShareImage(content);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: "/",
    },
    keywords: [
      content.brand.name,
      profile.industry,
      profile.brandConfig.specialty,
      content.brand.heroTag,
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: content.brand.name,
      locale: "es_LA",
      type: "website",
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${content.brand.name} | Reserva directa en Tarapoto`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildJsonLdScript(
  profile: ClientProfile,
  content: SiteContent
): string {
  return JSON.stringify(buildJsonLd(profile, content));
}
