import type { Metadata } from "next";
import type { ClientProfile, SiteContent } from "@/types/site";

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

function buildJsonLd(profile: ClientProfile, content: SiteContent) {
  const niche = getNicheSlug(profile.industry);
  const category = NICHE_CATEGORIES[niche] ?? "LocalBusiness";

  const base = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: content.brand.name,
    description: content.brand.description || content.brand.subheadline,
    telephone: content.contact.whatsappNumber || profile.brandConfig.whatsappNumber,
    email: content.contact.email || profile.brandConfig.email,
    "@id": "",
    url: "",
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
  const title = content.brand.name
    ? `${content.brand.name} | ${content.brand.headline || profile.industry}`
    : "Sitio Web";

  const description =
    content.brand.description ||
    content.brand.subheadline ||
    profile.brandConfig.businessDescription ||
    "Bienvenido a nuestro sitio.";

  return {
    title,
    description,
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
      locale: "es_LA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
