import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBaseSiteContent, mergeSiteContent } from "@/lib/site-config";
import type { ClientProfile, SiteContent } from "@/types/site";

const execFileAsync = promisify(execFile);

const imagePositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const galleryItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(120),
  imageSrc: z.string().trim().max(480).optional().or(z.literal("")),
  imagePosition: imagePositionSchema.optional(),
});

const serviceSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(480),
  imageSrc: z.string().trim().max(480).optional().or(z.literal("")),
  imagePosition: imagePositionSchema.optional(),
});

const bookingOptionSchema = z.object({
  id: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(120),
  roomType: z.string().trim().min(1).max(120),
  price: z.string().trim().min(1).max(80),
  rateLabel: z.string().trim().min(1).max(80),
  stayLabel: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(220),
  perks: z.array(z.string().trim().min(1).max(80)).max(8),
  emoji: z.string().trim().max(8).optional().or(z.literal("")),
  badge: z.string().trim().max(80).optional().or(z.literal("")),
  highlighted: z.boolean().optional(),
});

const localEditorSchema = z.object({
  brand: z.object({
    name: z.string().trim().min(1).max(120),
    heroTag: z.string().trim().min(1).max(120),
    headline: z.string().trim().min(1).max(320),
    subheadline: z.string().trim().min(1).max(360),
    description: z.string().trim().min(1).max(360),
    primaryCtaLabel: z.string().trim().min(1).max(60),
    primaryCtaHref: z.string().trim().min(1).max(480),
    secondaryCtaLabel: z.string().trim().min(1).max(60),
    secondaryCtaHref: z.string().trim().min(1).max(480),
    heroImageSrc: z.string().trim().max(480).optional().or(z.literal("")),
    heroImagePosition: imagePositionSchema.optional(),
  }),
  narrative: z.object({
    title: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(640),
    goal: z.string().trim().min(1).max(260),
  }),
  stats: z.array(
    z.object({
      label: z.string().trim().min(1).max(60),
      value: z.string().trim().min(1).max(120),
    }),
  ).max(6),
  theme: z.object({
    mode: z.enum(["Dark", "Light"]),
    visualStyle: z.string().trim().min(1).max(80),
    layoutMode: z.string().trim().min(1).max(40).optional(),
    shellMode: z.string().trim().min(1).max(40).optional(),
    textAlign: z.enum(["left", "center"]).optional(),
    buttonShape: z.enum(["rounded", "square"]).optional(),
    accentColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
    accentAltColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
  uiText: z.object({
    heroLabel: z.string().trim().min(1).max(120),
    supportLabel: z.string().trim().min(1).max(120),
    proofLabel: z.string().trim().min(1).max(120),
    storyChip: z.string().trim().min(1).max(120),
    storyTitle: z.string().trim().min(1).max(260),
    testimonialsChip: z.string().trim().min(1).max(120),
    testimonialsTitle: z.string().trim().min(1).max(260),
    faqChip: z.string().trim().min(1).max(120),
    faqTitle: z.string().trim().min(1).max(260),
  }),
  visibility: z
    .object({
      highlights: z.array(z.boolean()).max(8).optional(),
      galleryItems: z.array(z.boolean()).max(8).optional(),
      services: z.array(z.boolean()).max(8).optional(),
      products: z.array(z.boolean()).max(8).optional(),
      testimonials: z.array(z.boolean()).max(20).optional(),
      faqs: z.array(z.boolean()).max(10).optional(),
    })
    .optional(),
  contact: z.object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(640),
    whatsappNumber: z.string().trim().min(6).max(40),
    email: z.email(),
  }),
  location: z.object({
    address: z.string().trim().max(180),
    city: z.string().trim().max(180),
    hours: z.string().trim().max(180),
    mapsEmbedUrl: z.string().trim().max(600).optional().or(z.literal("")),
    mapsLink: z.string().trim().max(600).optional().or(z.literal("")),
  }).optional(),
  bookingWidget: z.object({
    preset: z.enum(["hotel", "restaurant", "education", "course", "service", "maintenance", "construction", "sales", "ecommerce"]).optional(),
    title: z.string().trim().max(200).optional().or(z.literal("")),
    description: z.string().trim().max(640).optional().or(z.literal("")),
    adminLabel: z.string().trim().max(120).optional().or(z.literal("")),
    adminRole: z.string().trim().max(120).optional().or(z.literal("")),
    adminStatus: z.string().trim().max(120).optional().or(z.literal("")),
    actionVerb: z.string().trim().max(120).optional().or(z.literal("")),
    triggerChatLabel: z.string().trim().max(80).optional().or(z.literal("")),
    triggerChatHint: z.string().trim().max(120).optional().or(z.literal("")),
    triggerActionLabel: z.string().trim().max(80).optional().or(z.literal("")),
    triggerActionHint: z.string().trim().max(120).optional().or(z.literal("")),
    tabChatLabel: z.string().trim().max(80).optional().or(z.literal("")),
    tabActionLabel: z.string().trim().max(80).optional().or(z.literal("")),
    chatCtaLabel: z.string().trim().max(80).optional().or(z.literal("")),
    chatCtaHint: z.string().trim().max(160).optional().or(z.literal("")),
    directWhatsappLabel: z.string().trim().max(120).optional().or(z.literal("")),
    directWhatsappHint: z.string().trim().max(160).optional().or(z.literal("")),
    bookingCtaLabel: z.string().trim().max(80).optional().or(z.literal("")),
    summaryLabel: z.string().trim().max(120).optional().or(z.literal("")),
    summaryText: z.string().trim().max(320).optional().or(z.literal("")),
    formNameLabel: z.string().trim().max(80).optional().or(z.literal("")),
    formNamePlaceholder: z.string().trim().max(120).optional().or(z.literal("")),
    scheduleLabel: z.string().trim().max(80).optional().or(z.literal("")),
    schedulePlaceholder: z.string().trim().max(120).optional().or(z.literal("")),
    scheduleInputType: z.enum(["date", "text"]).optional(),
    quantityLabel: z.string().trim().max(80).optional().or(z.literal("")),
    quantityOptions: z.array(z.string().trim().min(1).max(60)).max(8).optional(),
    notesLabel: z.string().trim().max(80).optional().or(z.literal("")),
    notesPlaceholder: z.string().trim().max(160).optional().or(z.literal("")),
    selectionTitle: z.string().trim().max(120).optional().or(z.literal("")),
    detailLabel: z.string().trim().max(80).optional().or(z.literal("")),
    priceLabel: z.string().trim().max(80).optional().or(z.literal("")),
    timelineLabel: z.string().trim().max(80).optional().or(z.literal("")),
    options: z.array(bookingOptionSchema).max(8),
  }).optional(),
  pages: z.array(z.string().trim().min(1).max(60)).max(7),
  highlights: z.array(z.string().trim().min(1).max(140)).max(8),
  galleryItems: z.array(galleryItemSchema).max(8),
  services: z.array(serviceSchema).max(8),
  products: z.array(
    z.object({
      name: z.string().trim().min(1).max(120),
      price: z.string().trim().min(1).max(80),
      description: z.string().trim().min(1).max(480),
      imageSrc: z.string().trim().max(480).optional().or(z.literal("")),
      imagePosition: imagePositionSchema.optional(),
    }),
  ).max(8),
  testimonials: z.array(
    z.object({
      name: z.string().trim().min(1).max(120),
      role: z.string().trim().min(1).max(120),
          quote: z.string().trim().min(1).max(640),
          avatarSrc: z.string().trim().max(480).optional().or(z.literal("")),
          location: z.string().trim().max(160).optional().or(z.literal("")),
          segment: z.string().trim().max(160).optional().or(z.literal("")),
      rating: z.number().int().min(1).max(5).optional(),
    }),
  ).max(20),
  faqs: z.array(
    z.object({
          question: z.string().trim().min(1).max(260),
          answer: z.string().trim().min(1).max(640),
    }),
  ).max(10),
});

function editorEnabled() {
  return process.env.NODE_ENV === "development" || process.env.ALLOW_LOCAL_EDITOR === "true";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(value: unknown) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidHexColor(value: unknown) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}

function normalizeThemeMode(value: unknown, fallback: SiteContent["theme"]["mode"]) {
  if (value === "Dark" || value === "Light") {
    return value;
  }

  return fallback === "Dark" ? "Dark" : "Light";
}

function normalizeWhatsappDisplay(value: unknown) {
  return String(value || "")
    .replace(/[^\d+\s()-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildWhatsappLeadHref(whatsappNumber: string, brandName: string) {
  const cleanNumber = whatsappNumber.replace(/[^\d]/g, "");
  if (!cleanNumber) {
    return "#contacto";
  }

  const message = [
    "Hola \u{1F44B}",
    "",
    `Me interesa reservar en ${brandName}.`,
    "",
    "\u{1F3E8} Quiero informacion sobre disponibilidad",
    "\u{1F6CF}\u{FE0F} Tipos de habitacion y tarifas",
    "\u{1F4C5} Opciones de fecha para mi estadia",
    "",
    "Muchas gracias.",
  ].join("\n");

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

function normalizeLocalEditorPayload(payload: unknown, baseContent: SiteContent) {
  if (!isPlainObject(payload)) {
    return payload;
  }

  const themeInput = isPlainObject(payload.theme) ? payload.theme : {};
  const contactInput = isPlainObject(payload.contact) ? payload.contact : {};
  const fallbackThemeMode = baseContent.theme.mode === "Dark" ? "Dark" : "Light";
  const fallbackAccentColor = isValidHexColor(baseContent.theme.accentColor) ? baseContent.theme.accentColor : "#2563EE";
  const fallbackAccentAltColor = isValidHexColor(baseContent.theme.accentAltColor) ? baseContent.theme.accentAltColor : "#0F172A";
  const fallbackEmail = isValidEmail(baseContent.contact.email) ? baseContent.contact.email : "editor@local.dev";
  const fallbackWhatsapp = normalizeWhatsappDisplay(baseContent.contact.whatsappNumber) || "51999999999";

  return {
    ...payload,
    theme: {
      ...themeInput,
      mode: normalizeThemeMode(themeInput.mode, fallbackThemeMode),
      visualStyle: typeof themeInput.visualStyle === "string" && themeInput.visualStyle.trim()
        ? themeInput.visualStyle.trim()
        : baseContent.theme.visualStyle || "editorial",
      accentColor: isValidHexColor(themeInput.accentColor) ? String(themeInput.accentColor).trim() : fallbackAccentColor,
      accentAltColor: isValidHexColor(themeInput.accentAltColor) ? String(themeInput.accentAltColor).trim() : fallbackAccentAltColor,
    },
    contact: {
      ...contactInput,
      whatsappNumber: typeof contactInput.whatsappNumber === "string" && contactInput.whatsappNumber.trim().length >= 6
        ? normalizeWhatsappDisplay(contactInput.whatsappNumber)
        : fallbackWhatsapp,
      email: isValidEmail(contactInput.email) ? String(contactInput.email).trim() : fallbackEmail,
    },
  };
}

async function syncClientContentFiles() {
  const syncScriptPath = path.join(process.cwd(), "scripts", "sync-content-from-config.mjs");

  try {
    await fs.access(syncScriptPath);
  } catch {
    return;
  }

  try {
    await execFileAsync(process.execPath, [syncScriptPath, "--force-brief"], {
      cwd: process.cwd(),
    });
  } catch {
    // Si la sincronizacion falla, no debemos romper el editor local.
    // Los cambios ya quedaron guardados en config/site-content.json.
    return;
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!editorEnabled()) {
    return NextResponse.json({ ok: false, message: "Editor local deshabilitado." }, { status: 403 });
  }

  let payload: unknown;
  const baseContent = getBaseSiteContent();

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body JSON invalido." }, { status: 400 });
  }

  const parsed = localEditorSchema.safeParse(normalizeLocalEditorPayload(payload, baseContent));
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Contenido local invalido.",
        fields: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const configDir = path.join(process.cwd(), "config");
  const profilePath = path.join(configDir, "client-profile.json");
  const siteContentPath = path.join(configDir, "site-content.json");
  const localEditorPath = path.join(configDir, "local-editor-content.json");
  const nextSiteContent = mergeSiteContent(baseContent, parsed.data);
  const cleanWhatsappDisplay = normalizeWhatsappDisplay(nextSiteContent.contact.whatsappNumber);
  nextSiteContent.contact.whatsappNumber = cleanWhatsappDisplay;

  const primaryHref = String(nextSiteContent.brand.primaryCtaHref || "");
  const primaryLabel = String(nextSiteContent.brand.primaryCtaLabel || "");
  if (primaryHref.includes("wa.me/") || primaryHref.includes("api.whatsapp.com/") || /whatsapp/i.test(primaryLabel)) {
    nextSiteContent.brand.primaryCtaHref = buildWhatsappLeadHref(cleanWhatsappDisplay, nextSiteContent.brand.name);
  }

  await fs.mkdir(configDir, { recursive: true });
  let nextProfile: ClientProfile | null = null;

  try {
    const profileRaw = await fs.readFile(profilePath, "utf8");
    const parsedProfile = JSON.parse(profileRaw) as ClientProfile;
    nextProfile = {
      ...parsedProfile,
      brandConfig: {
        ...parsedProfile.brandConfig,
        whatsappNumber: cleanWhatsappDisplay,
        email: nextSiteContent.contact.email,
      },
    };
  } catch {
    nextProfile = null;
  }

  if (nextProfile) {
    await fs.writeFile(profilePath, `${JSON.stringify(nextProfile, null, 2)}\n`, "utf8");
  }
  await fs.writeFile(siteContentPath, `${JSON.stringify(nextSiteContent, null, 2)}\n`, "utf8");
  await fs.writeFile(localEditorPath, "{}\n", "utf8");
  await syncClientContentFiles();

  return NextResponse.json({
    ok: true,
    message: "Cambios guardados en config/site-content.json",
  });
}
