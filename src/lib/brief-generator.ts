import "server-only";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { BriefData, ClientProfile, SiteContent } from "@/types/site";
import { buildStarterKitEnhancements, getStarterKitForBrief } from "./starter-kits";

type YamlModule = {
  parse: (source: string) => unknown;
};

function getYamlModule(): YamlModule | null {
  try {
    return require("yaml") as YamlModule;
  } catch {
    return null;
  }
}

const briefSchema = z.object({
  businessName: z.string().trim().min(1),
  projectType: z.enum(["Landing Page", "Website", "E-commerce"]),
  industry: z.string().trim().min(1),
  businessDescription: z.string().trim().min(1),
  mainOffer: z.string().trim().min(1),
  primaryGoal: z.string().trim().min(1),
  targetAudience: z.string().trim().min(1),
  location: z.string().trim().default(""),
  contact: z.object({
    whatsapp: z.string().trim().default(""),
    email: z.string().trim().default(""),
  }),
  brand: z.object({
    themeMode: z.enum(["Light", "Dark"]).default("Light"),
    visualStyle: z.string().trim().min(1).default("premium"),
    layoutMode: z.string().trim().min(1).default("soft"),
    shellMode: z.string().trim().min(1).default("framed"),
    textAlign: z.enum(["left", "center"]).default("left"),
    buttonShape: z.enum(["rounded", "square"]).default("rounded"),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#C96B3B"),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#14304A"),
    copyStyle: z.string().trim().default("professional"),
    visualConcept: z.string().trim().default("reusable website system"),
    layoutMood: z.string().trim().default("structured"),
    visualSignature: z.string().trim().default("signature-lumen"),
    starterKit: z.string().trim().default(""),
  }),
  reference: z.object({
    enabled: z.boolean().default(false),
    website: z.string().trim().default(""),
    captureMode: z.string().trim().default("none"),
  }).optional(),
  hero: z.object({
    tag: z.string().trim().default("Business website"),
    headline: z.string().trim().min(1),
    subtitle: z.string().trim().min(1),
  }),
  services: z.array(
    z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
    }),
  ).default([]),
  benefits: z.array(z.string().trim().min(1)).default([]),
  faq: z.array(
    z.object({
      question: z.string().trim().min(1),
      answer: z.string().trim().min(1),
    }),
  ).default([]),
  testimonials: z.array(
    z.object({
      name: z.string().trim().min(1),
      role: z.string().trim().min(1),
      quote: z.string().trim().min(1),
    }),
  ).default([]),
  cta: z.object({
    primaryLabel: z.string().trim().min(1),
    secondaryLabel: z.string().trim().min(1),
    contactTitle: z.string().trim().min(1),
    contactDescription: z.string().trim().min(1),
  }),
  products: z.array(
    z.object({
      name: z.string().trim().min(1),
      price: z.string().trim().min(1),
      description: z.string().trim().min(1),
    }),
  ).default([]),
  keywords: z.array(z.string().trim().min(1)).default([]),
  pages: z.array(z.string().trim().min(1)).default([]),
  strategy: z.object({
    starterKit: z.string().trim().default(""),
    starterKitLabel: z.string().trim().default(""),
    brandThesis: z.string().trim().default(""),
    positioning: z.string().trim().default(""),
    proofAngle: z.string().trim().default(""),
    ctaStrategy: z.string().trim().default(""),
    artDirection: z.string().trim().default(""),
    recommendedSkillSequence: z.array(z.string().trim().min(1)).default([]),
  }).optional(),
  designSystem: z.object({
    starterKit: z.string().trim().default(""),
    typographySystem: z.string().trim().default(""),
    densityProfile: z.string().trim().default(""),
    motionProfile: z.string().trim().default(""),
    surfaceProfile: z.string().trim().default(""),
  }).optional(),
  scorecardTargets: z.object({
    visual: z.number().int().min(0).max(100).default(88),
    conversion: z.number().int().min(0).max(100).default(86),
    trust: z.number().int().min(0).max(100).default(88),
    responsive: z.number().int().min(0).max(100).default(94),
    content: z.number().int().min(0).max(100).default(88),
  }).optional(),
});

function getBriefPath() {
  return path.join(process.cwd(), "content", "brief.yaml");
}

export function getWebsiteBrief(): BriefData | null {
  const filePath = getBriefPath();
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const yaml = getYamlModule();
  if (!yaml) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = yaml.parse(raw);
    return briefSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function buildClientProfileFromBrief(brief: BriefData): ClientProfile {
  const projectType = normalizeProjectType(brief.projectType);
  const folderName = slugify(brief.businessName);
  const hospitality = isHospitalityBrief(brief);
  const starterKit = getStarterKitForBrief(brief);

  return {
    clientCode: folderName.slice(0, 12).toUpperCase() || "CLIENT",
    clientName: brief.businessName,
    businessName: brief.businessName,
    folderName,
    projectType,
    industry: brief.industry,
    createdAt: new Date().toISOString().slice(0, 10),
    templateVersion: "2026.03.10",
    reference: brief.reference
      ? {
          enabled: Boolean(brief.reference.enabled && brief.reference.website),
          website: brief.reference.website,
          captureMode: brief.reference.captureMode || "none",
        }
      : undefined,
    modules: {
      whatsappCTA: Boolean(brief.contact.whatsapp),
      leadForm: brief.projectType !== "E-commerce",
      booking: hospitality,
      blog: false,
      auth: brief.projectType === "E-commerce",
      cart: brief.projectType === "E-commerce",
      payments: brief.projectType === "E-commerce",
      multiTenant: false,
    },
    brandConfig: {
      businessDescription: brief.businessDescription,
      offerSummary: brief.mainOffer,
      primaryGoal: brief.primaryGoal,
      specialty: brief.services[0]?.title || brief.mainOffer,
      copyStyle: brief.brand.copyStyle,
      whatsappNumber: brief.contact.whatsapp,
      email: brief.contact.email,
      themeMode: brief.brand.themeMode,
      visualStyle: brief.brand.visualStyle,
      layoutMode: brief.brand.layoutMode,
      shellMode: brief.brand.shellMode,
      textAlign: brief.brand.textAlign,
      buttonShape: brief.brand.buttonShape,
      starterKit: brief.brand.starterKit || starterKit?.key || "",
      artDirection: brief.strategy?.artDirection || starterKit?.brand?.artDirection || "",
      positioningMode: brief.strategy?.positioning || starterKit?.brand?.positioning || "",
      visualConcept: brief.brand.visualConcept,
      layoutMood: brief.brand.layoutMood,
      visualSignature: brief.brand.visualSignature,
      accentColor: brief.brand.primaryColor,
      accentAltColor: brief.brand.secondaryColor,
    },
  };
}

export function buildSiteContentFromBrief(brief: BriefData): SiteContent {
  const starterKit = getStarterKitForBrief(brief);
  const starterEnhancements = buildStarterKitEnhancements(brief);
  const primaryHref = buildPrimaryCtaHref(brief);
  const hospitalityTheme = isHospitalityThemeBrief(brief);
  const secondaryHref = hospitalityTheme ? "#habitaciones" : "#servicios";
  const stats = buildStats(brief);
  const hospitality = isHospitalityBrief(brief);

  return {
    brand: {
      name: brief.businessName,
      headline: brief.hero.headline,
      description: brief.businessDescription,
      subheadline: brief.hero.subtitle,
      primaryCtaLabel: brief.cta.primaryLabel,
      primaryCtaHref: primaryHref,
      secondaryCtaLabel: brief.cta.secondaryLabel,
      secondaryCtaHref: secondaryHref,
      heroTag: brief.hero.tag,
      heroImageSrc: "",
      heroImagePosition: { x: 50, y: 50 },
    },
    narrative: {
      title: buildNarrativeTitle(brief),
      body: brief.businessDescription,
      goal: brief.primaryGoal,
    },
    theme: {
      mode: brief.brand.themeMode || starterKit?.theme?.mode || "Light",
      visualStyle: brief.brand.visualStyle || starterKit?.theme?.visualStyle || "premium",
      layoutMode: brief.brand.layoutMode || starterKit?.theme?.layoutMode || "soft",
      shellMode: brief.brand.shellMode || starterKit?.theme?.shellMode || "framed",
      textAlign: brief.brand.textAlign || starterKit?.theme?.textAlign || "left",
      buttonShape: brief.brand.buttonShape || starterKit?.theme?.buttonShape || "rounded",
      starterKit: brief.brand.starterKit || starterKit?.key || "",
      accentColor: brief.brand.primaryColor || starterKit?.theme?.primaryColor || "#C96B3B",
      accentAltColor: brief.brand.secondaryColor || starterKit?.theme?.secondaryColor || "#14304A",
    },
    uiText: buildUiText(brief),
    stats,
    services: brief.services.map((service) => ({
      title: service.title,
      description: service.description,
      imageSrc: "",
      imagePosition: { x: 50, y: 50 },
    })),
    highlights: brief.benefits,
    testimonials: brief.testimonials.map((item) => ({
      name: item.name,
      role: item.role,
      quote: item.quote,
      avatarSrc: "",
      location: brief.location,
      segment: brief.mainOffer,
      rating: 5,
    })),
    faqs: brief.faq.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
    pages: brief.pages.length ? brief.pages : getDefaultPages(brief.projectType, brief.industry),
    products: brief.products.map((product) => ({
      name: product.name,
      price: product.price,
      description: product.description,
      imageSrc: "",
      imagePosition: { x: 50, y: 50 },
    })),
    galleryKeywords: brief.keywords.length ? brief.keywords : [brief.mainOffer, brief.industry, brief.targetAudience],
    galleryItems: [],
    contact: {
      title: brief.cta.contactTitle,
      description: brief.cta.contactDescription,
      whatsappNumber: brief.contact.whatsapp,
      email: brief.contact.email,
    },
    bookingWidget: hospitality ? buildHospitalityBookingWidget(brief) : undefined,
    pricing: starterEnhancements.pricing,
    team: starterEnhancements.team,
    timeline: starterEnhancements.timeline,
    location: {
      address: brief.location,
      city: brief.location,
      hours: "",
      mapsEmbedUrl: "",
      mapsLink: "",
    },
  };
}

function normalizeProjectType(projectType: BriefData["projectType"]) {
  return projectType === "Website" ? "Web Site" : projectType;
}

function buildPrimaryCtaHref(brief: BriefData) {
  const cleanNumber = brief.contact.whatsapp.replace(/[^\d]/g, "");
  if (!cleanNumber) {
    return "#contacto";
  }

  const message = encodeURIComponent(
    isSpanishContent(brief)
      ? [
        "Hola 👋",
        "",
        `Me interesa reservar en ${brief.businessName}.`,
        "",
        "🏨 Quiero informacion sobre disponibilidad",
        "🛏️ Tipos de habitacion y tarifas",
        "📅 Opciones de fecha para mi estadia",
        "",
        "Muchas gracias.",
      ].join("\n")
      : [
        "Hi 👋",
        "",
        `I am interested in booking at ${brief.businessName}.`,
        "",
        "🏨 I would like availability information",
        "🛏️ Room types and rates",
        "📅 Date options for my stay",
        "",
        "Thank you.",
      ].join("\n"),
  );
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

function buildStats(brief: BriefData) {
  const spanish = isSpanishContent(brief);

  if (brief.projectType === "E-commerce") {
    return [
      { label: spanish ? "Catalogo" : "Catalog", value: `${Math.max(brief.products.length, 4)}+` },
      { label: spanish ? "Foco" : "Focus", value: spanish ? "Conversion" : "Conversion" },
      { label: spanish ? "Contacto" : "Support", value: brief.contact.whatsapp ? "WhatsApp" : (spanish ? "Correo" : "Email") },
    ];
  }

  return [
    { label: spanish ? "Oferta" : "Offer", value: brief.mainOffer.split(" ").slice(0, 3).join(" ") },
    { label: spanish ? "Bloques" : "Services", value: `${Math.max(brief.services.length, 3)}` },
    { label: spanish ? "Objetivo" : "Goal", value: brief.primaryGoal.split(" ").slice(0, 3).join(" ") },
  ];
}

function buildUiText(brief: BriefData): NonNullable<SiteContent["uiText"]> {
  const spanish = isSpanishContent(brief);
  const educationIndustry = /education|educacion/i.test(brief.industry);
  const hospitality = isHospitalityBrief(brief);
  const hospitalityTheme = isHospitalityThemeBrief(brief);

  if (spanish && hospitalityTheme) {
    return {
      heroLabel: "Hotel y descanso",
      supportLabel: "Habitaciones y servicios",
      proofLabel: "Huespedes y confianza",
      storyChip: "Suite",
      storyTitle: "Comodidad y servicios antes de reservar",
      testimonialsChip: "Testimonios",
      testimonialsTitle: "Senales reales antes de reservar",
      faqChip: "Preguntas frecuentes",
      faqTitle: "Dudas comunes antes de confirmar la reserva",
    };
  }

  if (spanish && hospitality && brief.projectType === "Landing Page") {
    return {
      heroLabel: "Hotel y descanso",
      supportLabel: "Habitaciones y servicios",
      proofLabel: "Huespedes y confianza",
      storyChip: "Experiencia",
      storyTitle: "Por que los viajeros lo eligen",
      testimonialsChip: "Testimonios",
      testimonialsTitle: "Senales reales antes de reservar",
      faqChip: "Preguntas frecuentes",
      faqTitle: "Lo que suelen preguntar antes de escribirnos",
    };
  }

  if (spanish && brief.projectType === "Landing Page") {
    return {
      heroLabel: "Oferta principal",
      supportLabel: "Beneficios y solucion",
      proofLabel: "Prueba y confianza",
      storyChip: "Proceso",
      storyTitle: "Una pagina clara para convertir mejor",
      testimonialsChip: "Testimonios",
      testimonialsTitle: "Señales reales de confianza antes del contacto",
      faqChip: "Preguntas frecuentes",
      faqTitle: "Lo que suelen preguntar antes de escribirnos",
    };
  }

  if (spanish && brief.projectType === "E-commerce") {
    return {
      heroLabel: "Coleccion destacada",
      supportLabel: "Categorias y beneficios",
      proofLabel: "Reseñas y confianza",
      storyChip: "Compra",
      storyTitle: "Una compra mas clara desde el primer clic",
      testimonialsChip: "Reseñas",
      testimonialsTitle: "Lo que valoran quienes ya compraron",
      faqChip: "Preguntas frecuentes",
      faqTitle: "Respuestas claras antes de comprar",
    };
  }

  if (spanish && educationIndustry) {
    return {
      heroLabel: "Propuesta educativa",
      supportLabel: "Niveles",
      proofLabel: "Confianza",
      storyChip: "Institucion",
      storyTitle: "Una propuesta educativa que inspira confianza",
      testimonialsChip: "Testimonios",
      testimonialsTitle: "Lo que destacan las familias",
      faqChip: "Preguntas frecuentes",
      faqTitle: "Lo que suelen preguntar antes de contactarnos",
    };
  }

  if (spanish) {
    return {
      heroLabel: "Propuesta principal",
      supportLabel: "Servicios",
      proofLabel: "Confianza",
      storyChip: "Propuesta",
      storyTitle: "Una presentacion clara que ayuda a confiar",
      testimonialsChip: "Testimonios",
      testimonialsTitle: "Lo que dicen despues de conocer la propuesta",
      faqChip: "Preguntas frecuentes",
      faqTitle: "Respuestas claras antes del contacto",
    };
  }

  if (brief.projectType === "Landing Page") {
    return {
      heroLabel: "Primary offer",
      supportLabel: "Benefits and solution",
      proofLabel: "Trust and proof",
      storyChip: "How it works",
      storyTitle: "A clear path to conversion",
      testimonialsChip: "Testimonials",
      testimonialsTitle: "What clients say after launch",
      faqChip: "FAQ",
      faqTitle: "Questions before contact",
    };
  }

  if (brief.projectType === "E-commerce") {
    return {
      heroLabel: "Featured collection",
      supportLabel: "Shopping benefits",
      proofLabel: "Reviews and trust",
      storyChip: "Catalog flow",
      storyTitle: "Browse and buy with clarity",
      testimonialsChip: "Reviews",
      testimonialsTitle: "Why customers keep buying",
      faqChip: "Purchase FAQ",
      faqTitle: "Questions before checkout",
    };
  }

  return {
    heroLabel: "Business website",
    supportLabel: "Services",
    proofLabel: "Trust and proof",
    storyChip: "Process",
    storyTitle: "A clearer website system",
    testimonialsChip: "Testimonials",
    testimonialsTitle: "Proof that the message lands faster",
    faqChip: "FAQ",
    faqTitle: "Questions before getting in touch",
  };
}

function isHospitalityBrief(brief: BriefData) {
  const source = [
    brief.industry,
    brief.mainOffer,
    brief.businessDescription,
    brief.hero.tag,
    brief.targetAudience,
  ]
    .join(" ")
    .toLowerCase();

  return /(hotel|hoteler|hostal|hostel|resort|alojamiento|alojar|hosped|habitacion|turism|turismo|apart hotel|hospit)/i.test(source);
}

function buildHospitalityBookingWidget(brief: BriefData): NonNullable<SiteContent["bookingWidget"]> {
  const spanish = isSpanishContent(brief);
  const serviceNames = brief.services.map((service) => service.title).filter(Boolean);
  const roomTypeA = serviceNames[0] || (spanish ? "Habitacion Matrimonial" : "Couple Room");
  const roomTypeB = serviceNames[1] || (spanish ? "Habitacion Doble" : "Double Room");
  const roomTypeC = serviceNames[2] || (spanish ? "Day Use Relax" : "Day Use");
  const teamName = brief.businessName.split(" ").slice(0, 2).join(" ") || brief.businessName;

  if (spanish) {
    return {
      title: "Chat en vivo y reserva directa",
      description: "Habla con el administrador o envia una reserva ordenada por WhatsApp con el plan preseleccionado.",
      adminLabel: `Equipo ${teamName}`,
      adminRole: "Administrador de reservas",
      adminStatus: "En linea para responder rapido",
      chatCtaLabel: "Hablar con el admin",
      directWhatsappLabel: "Ir a WhatsApp",
      bookingCtaLabel: "Confirmar y enviar",
      options: [
        {
          id: "matrimonial-deluxe",
          label: roomTypeA,
          roomType: roomTypeA,
          price: "S/ 139",
          rateLabel: "por noche",
          stayLabel: "24 horas",
          summary: "Ideal para pareja o descanso ejecutivo con desayuno incluido.",
          perks: ["Desayuno incluido", "WiFi", "Aire acondicionado", "Atencion rapida"],
          emoji: "🌿",
          badge: "Mas elegida",
          highlighted: true,
        },
        {
          id: "doble-ejecutiva",
          label: roomTypeB,
          roomType: roomTypeB,
          price: "S/ 169",
          rateLabel: "por noche",
          stayLabel: "24 horas",
          summary: "Comoda para amigos, familia pequena o viaje de trabajo.",
          perks: ["Dos camas", "WiFi", "Desayuno", "Ingreso agil"],
          emoji: "🧳",
          badge: "Trabajo o familia",
          highlighted: false,
        },
        {
          id: "day-use-relax",
          label: roomTypeC,
          roomType: roomTypeC,
          price: "S/ 89",
          rateLabel: "por 6 horas",
          stayLabel: "6 horas",
          summary: "Entrada corta para descansar, ducharte o esperar con comodidad.",
          perks: ["Ingreso rapido", "Toallas", "WiFi", "Descanso express"],
          emoji: "☀️",
          badge: "Escapada corta",
          highlighted: false,
        },
      ],
    };
  }

  return {
    title: "Live chat and direct booking",
    description: "Talk to the manager or send a structured WhatsApp booking with a preselected plan.",
    adminLabel: `${teamName} Team`,
    adminRole: "Reservations manager",
    adminStatus: "Online for fast responses",
    chatCtaLabel: "Chat now",
    directWhatsappLabel: "Open WhatsApp",
    bookingCtaLabel: "Confirm and send",
    options: [
      {
        id: "couple-stay",
        label: roomTypeA,
        roomType: roomTypeA,
        price: "$39",
        rateLabel: "per night",
        stayLabel: "24 hours",
        summary: "Best for couples or a comfortable executive stay.",
        perks: ["Breakfast", "WiFi", "Air conditioning", "Fast check-in"],
        emoji: "🌿",
        badge: "Most chosen",
        highlighted: true,
      },
      {
        id: "double-stay",
        label: roomTypeB,
        roomType: roomTypeB,
        price: "$49",
        rateLabel: "per night",
        stayLabel: "24 hours",
        summary: "Good fit for friends, small families, or work trips.",
        perks: ["Two beds", "WiFi", "Breakfast", "Quick access"],
        emoji: "🧳",
        badge: "Work or family",
        highlighted: false,
      },
      {
        id: "day-use",
        label: roomTypeC,
        roomType: roomTypeC,
        price: "$25",
        rateLabel: "for 6 hours",
        stayLabel: "6 hours",
        summary: "Short stay option to rest, freshen up, or wait comfortably.",
        perks: ["Quick access", "Towels", "WiFi", "Short stay"],
        emoji: "☀️",
        badge: "Short stay",
        highlighted: false,
      },
    ],
  };
}

function buildNarrativeTitle(brief: BriefData) {
  const spanish = isSpanishContent(brief);
  const educationIndustry = /education|educacion/i.test(brief.industry);
  const hospitalityTheme = isHospitalityThemeBrief(brief);

  if (spanish && hospitalityTheme) {
    return "Una experiencia mas cercana al look de un hotel premium real";
  }

  if (spanish && brief.projectType === "Landing Page") {
    return "Una propuesta clara desde el primer vistazo";
  }

  if (spanish && brief.projectType === "E-commerce") {
    return "Una experiencia pensada para comprar con mas confianza";
  }

  if (spanish && educationIndustry) {
    return "Formacion integral con enfoque claro";
  }

  if (spanish) {
    return "Una propuesta que inspira confianza desde el inicio";
  }

  if (brief.projectType === "Landing Page") {
    return "A clear offer from the first scroll";
  }

  if (brief.projectType === "E-commerce") {
    return "A shopping flow built for confident decisions";
  }

  return `Why ${brief.businessName}`;
}

function getDefaultPages(projectType: BriefData["projectType"], industry?: string) {
  if (/(hotel|hoteler|hostal|hostel|resort|alojamiento|turismo|hospitality)/i.test(String(industry || ""))) {
    return ["Hotel", "Ofertas", "Habitaciones", "Servicios", "Galeria", "Reserva", "Mapa"];
  }

  if (projectType === "Landing Page") {
    return ["Home", "Benefits", "Services", "Testimonials", "FAQ", "Contact"];
  }

  if (projectType === "E-commerce") {
    return ["Home", "Categories", "Products", "Reviews", "FAQ", "Contact"];
  }

  return ["Home", "About", "Services", "Process", "Projects", "FAQ", "Contact"];
}

function isHospitalityThemeBrief(brief: BriefData) {
  return isHospitalityBrief(brief);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isSpanishContent(brief: BriefData) {
  const sample = [
    brief.businessDescription,
    brief.mainOffer,
    brief.primaryGoal,
    brief.targetAudience,
    brief.hero.headline,
    brief.hero.subtitle,
    brief.cta.contactTitle,
    brief.cta.contactDescription,
  ]
    .join(" ")
    .toLowerCase();

  return /[áéíóúñ¿¡]/i.test(sample) || /\b(el|la|los|las|para|con|que|educacion|servicios|contacto|matriculas|familias|colegio|institucion)\b/i.test(sample);
}
