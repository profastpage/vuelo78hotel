import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ClientProfile, ReferenceSnapshot, SiteContent } from "@/types/site";
import { buildClientProfileFromBrief, buildSiteContentFromBrief, getWebsiteBrief } from "./brief-generator";
import { readConfigJson } from "./local-editor-storage";

function readJsonFile<T>(fileName: string, fallback: T): T {
  return readConfigJson(fileName, fallback);
}

function readContentJsonFile<T>(fileName: string, fallback: T): T {
  const filePath = path.join(process.cwd(), "content", fileName);
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeDeep<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const merged: Record<string, unknown> = { ...base };

    for (const [key, value] of Object.entries(override)) {
      const currentValue = merged[key];

      if (Array.isArray(value)) {
        merged[key] = value;
        continue;
      }

      if (isPlainObject(currentValue) && isPlainObject(value)) {
        merged[key] = mergeDeep(currentValue, value);
        continue;
      }

      if (value !== undefined) {
        merged[key] = value;
      }
    }

    return merged as T;
  }

  return (override ?? base) as T;
}

function hasKeys(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && Object.keys(value).length > 0;
}

function preserveImageItems<T extends { imageSrc?: string; imagePosition?: unknown }>(generated: T[] = [], existing: T[] = []) {
  return generated.map((item, index) => ({
    ...item,
    imageSrc: existing[index]?.imageSrc || item.imageSrc || "",
    imagePosition: existing[index]?.imagePosition ?? item.imagePosition,
  }));
}

function preserveTestimonials(
  generated: SiteContent["testimonials"] = [],
  existing: SiteContent["testimonials"] = [],
): SiteContent["testimonials"] {
  return generated.map((item, index) => ({
    ...item,
    avatarSrc: existing[index]?.avatarSrc || item.avatarSrc || "",
    rating: existing[index]?.rating || item.rating || 5,
    location: item.location || existing[index]?.location || "",
    segment: item.segment || existing[index]?.segment || "",
  }));
}

function mergeGeneratedProfile(existing: ClientProfile, generated: ClientProfile): ClientProfile {
  return {
    ...generated,
    ...existing,
    clientName: existing.clientName || generated.clientName,
    businessName: existing.businessName || generated.businessName,
    projectType: existing.projectType || generated.projectType,
    industry: existing.industry || generated.industry,
    modules: hasKeys(existing.modules) ? existing.modules : generated.modules,
    brandConfig: {
      ...(generated.brandConfig || {}),
      ...(existing.brandConfig || {}),
      businessDescription: generated.brandConfig.businessDescription,
      offerSummary: generated.brandConfig.offerSummary,
      primaryGoal: generated.brandConfig.primaryGoal,
      specialty: generated.brandConfig.specialty,
      copyStyle: generated.brandConfig.copyStyle,
      whatsappNumber: existing.brandConfig?.whatsappNumber || generated.brandConfig.whatsappNumber,
      email: existing.brandConfig?.email || generated.brandConfig.email,
      themeMode: existing.brandConfig?.themeMode || generated.brandConfig.themeMode,
      visualStyle: existing.brandConfig?.visualStyle || generated.brandConfig.visualStyle,
      layoutMode: existing.brandConfig?.layoutMode || generated.brandConfig.layoutMode,
      shellMode: existing.brandConfig?.shellMode || generated.brandConfig.shellMode,
      textAlign: existing.brandConfig?.textAlign || generated.brandConfig.textAlign,
      buttonShape: existing.brandConfig?.buttonShape || generated.brandConfig.buttonShape,
      starterKit: existing.brandConfig?.starterKit || generated.brandConfig.starterKit,
      artDirection: existing.brandConfig?.artDirection || generated.brandConfig.artDirection,
      positioningMode: existing.brandConfig?.positioningMode || generated.brandConfig.positioningMode,
      visualConcept: existing.brandConfig?.visualConcept || generated.brandConfig.visualConcept,
      layoutMood: existing.brandConfig?.layoutMood || generated.brandConfig.layoutMood,
      visualSignature: existing.brandConfig?.visualSignature || generated.brandConfig.visualSignature,
      accentColor: existing.brandConfig?.accentColor || generated.brandConfig.accentColor,
      accentAltColor: existing.brandConfig?.accentAltColor || generated.brandConfig.accentAltColor,
    },
  };
}

function mergeGeneratedSiteContent(existing: SiteContent, generated: SiteContent): SiteContent {
  return {
    ...generated,
    ...existing,
    brand: {
      ...generated.brand,
      ...existing.brand,
      name: existing.brand?.name || generated.brand.name,
      heroImageSrc: existing.brand?.heroImageSrc || generated.brand.heroImageSrc || "",
      heroImagePosition: existing.brand?.heroImagePosition ?? generated.brand.heroImagePosition,
    },
    narrative: {
      ...generated.narrative,
      ...existing.narrative,
    },
    theme: {
      ...generated.theme,
      ...(hasKeys(existing.theme) ? existing.theme : {}),
    },
    uiText: {
      ...(generated.uiText || {}),
      ...(existing.uiText || {}),
    },
    visibility: existing.visibility ?? generated.visibility,
    stats: existing.stats?.length ? existing.stats : generated.stats,
    highlights: existing.highlights?.length ? existing.highlights : generated.highlights,
    pages: existing.pages?.length ? existing.pages : generated.pages,
    galleryKeywords: existing.galleryKeywords?.length ? existing.galleryKeywords : generated.galleryKeywords,
    services: existing.services?.length ? preserveImageItems(existing.services, generated.services) : preserveImageItems(generated.services, existing.services),
    products: existing.products?.length ? preserveImageItems(existing.products, generated.products) : preserveImageItems(generated.products, existing.products),
    testimonials: existing.testimonials?.length ? preserveTestimonials(existing.testimonials, generated.testimonials) : preserveTestimonials(generated.testimonials, existing.testimonials),
    faqs: existing.faqs?.length ? existing.faqs : generated.faqs,
    galleryItems: existing.galleryItems && existing.galleryItems.length > 0 ? existing.galleryItems : generated.galleryItems,
    contact: {
      ...generated.contact,
      ...existing.contact,
    },
    bookingWidget: existing.bookingWidget ?? generated.bookingWidget,
    pricing: existing.pricing ?? generated.pricing,
    team: existing.team ?? generated.team,
    timeline: existing.timeline ?? generated.timeline,
    location: {
      address: generated.location?.address || existing.location?.address || "",
      ...generated.location,
      ...existing.location,
      mapsEmbedUrl: existing.location?.mapsEmbedUrl || generated.location?.mapsEmbedUrl || "",
      mapsLink: existing.location?.mapsLink || generated.location?.mapsLink || "",
      hours: existing.location?.hours || generated.location?.hours || "",
    },
  };
}

export function getClientProfile(): ClientProfile {
  const baseProfile = readJsonFile<ClientProfile>("client-profile.json", {} as ClientProfile);
  const brief = getWebsiteBrief();

  if (!brief) {
    return baseProfile;
  }

  return mergeGeneratedProfile(baseProfile, buildClientProfileFromBrief(brief));
}

export function getBaseSiteContent(): SiteContent {
  const baseContent = readJsonFile<SiteContent>("site-content.json", {} as SiteContent);
  const brief = getWebsiteBrief();
  if (!brief) {
    return baseContent;
  }

  const generatedContent = buildSiteContentFromBrief(brief);
  return mergeGeneratedSiteContent(baseContent, generatedContent);
}

export function getSiteContent(): SiteContent {
  return getBaseSiteContent();
}

export function getReferenceSnapshot(): ReferenceSnapshot | null {
  const snapshot = readContentJsonFile<ReferenceSnapshot | null>("reference-snapshot.json", null);

  if (!snapshot || !Array.isArray(snapshot.sections) || !Array.isArray(snapshot.widgets)) {
    return null;
  }

  return snapshot;
}

export function mergeSiteContent<T>(base: T, override: unknown): T {
  return mergeDeep(base, override);
}

export function getRawBusinessInput() {
  const rawPath = path.join(process.cwd(), "content", "raw.txt");
  if (!fs.existsSync(rawPath)) {
    return "";
  }

  try {
    return fs.readFileSync(rawPath, "utf8");
  } catch {
    return "";
  }
}
