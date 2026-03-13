import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configDir = path.join(root, "config");
const contentDir = path.join(root, "content");
const profilePath = path.join(configDir, "client-profile.json");
const siteContentPath = path.join(configDir, "site-content.json");
const localEditorPath = path.join(configDir, "local-editor-content.json");
const briefPath = path.join(contentDir, "brief.yaml");

function normalizeProjectType(projectType) {
  return projectType === "Website" ? "Web Site" : projectType;
}

function asString(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasMeaningfulValue(value) {
  const normalized = asString(value).toLowerCase();
  return Boolean(normalized) && !["sin preset", "auto", "undefined", "null"].includes(normalized);
}

function preferMeaningful(existingValue, fallbackValue) {
  return hasMeaningfulValue(existingValue) ? existingValue : fallbackValue;
}

function isReferenceDrivenBrief(brief) {
  return Boolean(brief.reference?.enabled && asString(brief.reference?.website));
}

function isHospitalityBrief(brief) {
  return /(hotel|hoteler|hostal|hostel|resort|alojamiento|turismo|hospitality|habitacion|suite)/i.test(
    [asString(brief.industry), asString(brief.businessName), asString(brief.mainOffer), asString(brief.hero?.headline), asString(brief.reference?.website)].join(" "),
  );
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function readBrief() {
  const raw = await fs.readFile(briefPath, "utf8");
  return YAML.parse(raw);
}

function buildPrimaryCtaHref(brief) {
  const cleanNumber = asString(brief.contact?.whatsapp).replace(/[^\d]/g, "");
  if (!cleanNumber) {
    return "#contacto";
  }

  const message = encodeURIComponent(
    isSpanishBrief(brief)
      ? `Hola, quiero más información sobre ${brief.businessName}.`
      : `Hi, I want to know more about ${brief.businessName}.`,
  );
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

function buildStats(brief) {
  const spanish = isSpanishBrief(brief);
  const hospitality = isHospitalityBrief(brief);

  if (brief.projectType === "E-commerce") {
    return [
      { label: spanish ? "Catalogo" : "Catalog", value: `${Math.max((brief.products || []).length, 4)}+` },
      { label: spanish ? "Foco" : "Focus", value: "Conversion" },
      { label: spanish ? "Contacto" : "Support", value: brief.contact?.whatsapp ? "WhatsApp" : (spanish ? "Correo" : "Email") },
    ];
  }

  if (hospitality) {
    const locationLabel = asString(brief.location).split(",")[0] || (spanish ? "Hotel" : "Hotel");
    return [
      { label: spanish ? "Destino" : "Destination", value: locationLabel },
      { label: spanish ? "Habitaciones" : "Rooms", value: `${Math.max((brief.services || []).length, 3)}` },
      { label: spanish ? "Reserva" : "Booking", value: brief.contact?.whatsapp ? "WhatsApp" : (spanish ? "Directa" : "Direct") },
    ];
  }

  return [
    { label: spanish ? "Oferta" : "Offer", value: asString(brief.mainOffer).split(" ").slice(0, 3).join(" ") },
    { label: spanish ? "Bloques" : "Services", value: `${Math.max((brief.services || []).length, 3)}` },
    { label: spanish ? "Objetivo" : "Goal", value: asString(brief.primaryGoal).split(" ").slice(0, 3).join(" ") },
  ];
}

function buildUiText(brief) {
  const spanish = isSpanishBrief(brief);
  const educationIndustry = /education|educacion/i.test(asString(brief.industry));
  const hospitality = isHospitalityBrief(brief);

  if (spanish && hospitality) {
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

  if (hospitality) {
    return {
      heroLabel: "Hotel stay",
      supportLabel: "Rooms and services",
      proofLabel: "Guests and trust",
      storyChip: "Suite",
      storyTitle: "Comfort and amenities before booking",
      testimonialsChip: "Testimonials",
      testimonialsTitle: "Signals guests need before booking",
      faqChip: "FAQ",
      faqTitle: "Questions before confirming the stay",
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

function preserveImageItems(generated, existing) {
  return generated.map((item, index) => ({
    ...item,
    imageSrc: existing?.[index]?.imageSrc || item.imageSrc || "",
    imagePosition: existing?.[index]?.imagePosition ?? item.imagePosition,
  }));
}

function preserveTestimonials(generated, existing, brief) {
  return generated.map((item, index) => ({
    ...item,
    avatarSrc: existing?.[index]?.avatarSrc || item.avatarSrc || "",
    location: asString(brief.location) || existing?.[index]?.location || "",
    segment: asString(brief.mainOffer) || existing?.[index]?.segment || "",
    rating: existing?.[index]?.rating || item.rating || 5,
  }));
}

function mergeBookingWidget(generated, existing) {
  if (!generated) {
    return undefined;
  }

  if (!isObject(existing)) {
    return generated;
  }

  return {
    ...generated,
    ...existing,
    options: Array.isArray(existing.options) && existing.options.length ? existing.options : generated.options,
  };
}

function buildHospitalityBookingWidget(brief, existing, services) {
  const spanish = isSpanishBrief(brief);
  const serviceNames = services.map((service) => service.title).filter(Boolean);
  const roomTypeA = serviceNames[0] || (spanish ? "Suite principal" : "Main suite");
  const roomTypeB = serviceNames[1] || (spanish ? "Habitacion superior" : "Superior room");
  const roomTypeC = serviceNames[2] || (spanish ? "Escapada corta" : "Short stay");
  const baseWidget = {
    preset: "hotel",
    title: spanish ? "Reserva directa y asistencia rapida" : "Direct booking and fast assistance",
    description: spanish
      ? "Coordina disponibilidad, tipo de habitacion y llegada desde una barra clara inspirada en el hotel de referencia."
      : "Check availability, room type, and arrival details from a clear booking bar inspired by the reference hotel.",
    adminLabel: spanish ? "Equipo de reservas" : "Reservations team",
    adminRole: spanish ? "Reservas y atencion" : "Reservations and front desk",
    adminStatus: spanish ? "En linea para responder rapido" : "Online for fast replies",
    actionVerb: spanish ? "reservar" : "book",
    triggerChatLabel: spanish ? "Consultar ahora" : "Check now",
    triggerChatHint: spanish ? "Disponibilidad y tarifas" : "Availability and rates",
    triggerActionLabel: spanish ? "Reservar" : "Book now",
    triggerActionHint: spanish ? "Reserva directa" : "Direct booking",
    tabChatLabel: spanish ? "Chat" : "Chat",
    tabActionLabel: spanish ? "Reserva" : "Booking",
    chatCtaLabel: spanish ? "Hablar con reservas" : "Talk to reservations",
    chatCtaHint: spanish ? "Confirma habitacion y llegada" : "Confirm room type and arrival",
    directWhatsappLabel: "WhatsApp",
    directWhatsappHint: spanish ? "Tarifas y detalles" : "Rates and details",
    bookingCtaLabel: spanish ? "Reservar" : "Book now",
    summaryLabel: spanish ? "Codigo promocional" : "Promo code",
    summaryText: spanish ? "Opcional" : "Optional",
    formNameLabel: spanish ? "Nombre" : "Name",
    formNamePlaceholder: spanish ? "Como te llamas?" : "Your name",
    scheduleLabel: spanish ? "Entrada" : "Check-in",
    schedulePlaceholder: spanish ? "Flexible" : "Flexible",
    scheduleInputType: "date",
    quantityLabel: spanish ? "Huespedes" : "Guests",
    quantityOptions: ["1", "2", "3", "4", "5+"],
    notesLabel: spanish ? "Solicitud especial" : "Special request",
    notesPlaceholder: spanish ? "Cama extra, early check-in, desayuno, traslado..." : "Extra bed, early check-in, breakfast, transfer...",
    selectionTitle: spanish ? "Habitacion" : "Room",
    detailLabel: spanish ? "Habitacion" : "Room",
    priceLabel: spanish ? "Tarifa" : "Rate",
    timelineLabel: spanish ? "Salida" : "Check-out",
    options: [
      {
        id: "suite-principal",
        label: roomTypeA,
        roomType: roomTypeA,
        price: "S/ 249",
        rateLabel: spanish ? "por noche" : "per night",
        stayLabel: spanish ? "1 noche" : "1 night",
        summary: spanish ? "Vista destacada, cama amplia y una entrada hotelera clara desde el primer scroll." : "Featured view, large bed, and a clear hotel booking flow from the first scroll.",
        perks: [spanish ? "Desayuno" : "Breakfast", "WiFi", spanish ? "Aire acondicionado" : "Air conditioning", spanish ? "Reserva directa" : "Direct booking"],
        badge: spanish ? "Principal" : "Primary",
        highlighted: true,
      },
      {
        id: "habitacion-superior",
        label: roomTypeB,
        roomType: roomTypeB,
        price: "S/ 289",
        rateLabel: spanish ? "por noche" : "per night",
        stayLabel: spanish ? "1 noche" : "1 night",
        summary: spanish ? "Pensada para viajes de pareja o trabajo con ritmo visual premium." : "Built for couple or work stays with a premium visual rhythm.",
        perks: ["WiFi", spanish ? "Bano privado" : "Private bathroom", spanish ? "Atencion rapida" : "Fast service", spanish ? "Late check-out sujeto" : "Late check-out subject to availability"],
        badge: spanish ? "Superior" : "Superior",
        highlighted: false,
      },
      {
        id: "escapada-corta",
        label: roomTypeC,
        roomType: roomTypeC,
        price: "S/ 179",
        rateLabel: spanish ? "por estadia" : "per stay",
        stayLabel: spanish ? "6 horas" : "6 hours",
        summary: spanish ? "Opcion corta para descansar, esperar un vuelo o usar la experiencia del hotel por menos tiempo." : "Short stay option for resting, waiting for a flight, or using the hotel experience for less time.",
        perks: ["WiFi", spanish ? "Ingreso agil" : "Fast access", spanish ? "Toallas" : "Towels", spanish ? "Atencion directa" : "Direct support"],
        badge: spanish ? "Flexible" : "Flexible",
        highlighted: false,
      },
    ],
  };

  return mergeBookingWidget(baseWidget, existing);
}

function buildGalleryItems(brief, services, existing, referenceDriven) {
  const spanish = isSpanishBrief(brief);
  const seeds = services.length
    ? services.map((service) => service.title)
    : [brief.hero.headline, ...(brief.pages || []), brief.mainOffer].filter(Boolean);
  const generated = seeds.slice(0, 5).map((seed, index) => ({
    title: seed,
    subtitle: index === 0
      ? brief.businessName
      : spanish
        ? "Layout hotel editable"
        : "Editable hotel layout",
    imageSrc: "",
    imagePosition: { x: 50, y: 50 },
  }));

  if (referenceDriven || !Array.isArray(existing) || !existing.length) {
    return preserveImageItems(generated, existing);
  }

  return existing;
}

function buildGeneratedSiteContent(brief, existing) {
  const referenceDriven = isReferenceDrivenBrief(brief);
  const hospitality = isHospitalityBrief(brief);
  const generatedTheme = {
    mode: brief.brand.themeMode,
    visualStyle: brief.brand.visualStyle,
    layoutMode: brief.brand.layoutMode,
    shellMode: brief.brand.shellMode,
    textAlign: brief.brand.textAlign,
    buttonShape: brief.brand.buttonShape,
    accentColor: brief.brand.primaryColor,
    accentAltColor: brief.brand.secondaryColor,
  };
  const services = preserveImageItems(
    (brief.services || []).map((service) => ({
      title: service.title,
      description: service.description,
      imageSrc: "",
      imagePosition: { x: 50, y: 50 },
    })),
    existing.services,
  );
  const generated = {
    brand: {
      name: existing.brand?.name || brief.businessName,
      headline: brief.hero.headline,
      description: brief.businessDescription,
      subheadline: brief.hero.subtitle,
      primaryCtaLabel: brief.cta.primaryLabel,
      primaryCtaHref: buildPrimaryCtaHref(brief),
      secondaryCtaLabel: brief.cta.secondaryLabel,
      secondaryCtaHref: hospitality ? "#habitaciones" : "#servicios",
      heroTag: brief.hero.tag,
      heroImageSrc: existing.brand?.heroImageSrc || "",
      heroImagePosition: existing.brand?.heroImagePosition || { x: 50, y: 50 },
    },
    narrative: {
      title: buildNarrativeTitle(brief),
      body: brief.businessDescription,
      goal: brief.primaryGoal,
    },
    theme: referenceDriven
      ? generatedTheme
      : {
          mode: preferMeaningful(existing.theme?.mode, brief.brand.themeMode),
          visualStyle: preferMeaningful(existing.theme?.visualStyle, brief.brand.visualStyle),
          layoutMode: preferMeaningful(existing.theme?.layoutMode, brief.brand.layoutMode),
          shellMode: preferMeaningful(existing.theme?.shellMode, brief.brand.shellMode),
          textAlign: preferMeaningful(existing.theme?.textAlign, brief.brand.textAlign),
          buttonShape: preferMeaningful(existing.theme?.buttonShape, brief.brand.buttonShape),
          accentColor: hasMeaningfulValue(existing.theme?.accentColor) ? existing.theme.accentColor : brief.brand.primaryColor,
          accentAltColor: hasMeaningfulValue(existing.theme?.accentAltColor) ? existing.theme.accentAltColor : brief.brand.secondaryColor,
    },
    uiText: buildUiText(brief),
    visibility: existing.visibility || {},
    stats: buildStats(brief),
    services,
    highlights: brief.benefits || [],
    testimonials: preserveTestimonials(
      (brief.testimonials || []).map((item) => ({
        name: item.name,
        role: item.role,
        quote: item.quote,
        avatarSrc: "",
        location: asString(brief.location),
        segment: asString(brief.mainOffer),
        rating: 5,
      })),
      existing.testimonials,
      brief,
    ),
    faqs: (brief.faq || []).map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
    pages: brief.pages || existing.pages || [],
    products: preserveImageItems(
      (brief.products || []).map((product) => ({
        name: product.name,
        price: product.price,
        description: product.description,
        imageSrc: "",
        imagePosition: { x: 50, y: 50 },
      })),
      existing.products,
    ),
    galleryKeywords: brief.keywords || existing.galleryKeywords || [],
    galleryItems: buildGalleryItems(brief, services, existing.galleryItems, referenceDriven),
    contact: {
      title: brief.cta.contactTitle,
      description: brief.cta.contactDescription,
      whatsappNumber: asString(brief.contact?.whatsapp),
      email: asString(brief.contact?.email),
    },
    bookingWidget: hospitality ? buildHospitalityBookingWidget(brief, existing.bookingWidget, services) : undefined,
    pricing: existing.pricing || { title: "", description: "", tiers: [] },
    team: existing.team || { title: "", description: "", members: [] },
    timeline: existing.timeline || { title: "", description: "", items: [] },
    location: {
      address: asString(brief.location),
      city: asString(brief.location),
      hours: existing.location?.hours || "",
      mapsEmbedUrl: existing.location?.mapsEmbedUrl || "",
      mapsLink: existing.location?.mapsLink || "",
    },
  };

  return generated;
}

function buildNextProfile(existing, brief) {
  const existingBrandConfig = existing.brandConfig || {};
  const referenceDriven = isReferenceDrivenBrief(brief);
  const hospitality = isHospitalityBrief(brief);
  return {
    ...existing,
    businessName: preferMeaningful(existing.businessName, brief.businessName),
    clientName: preferMeaningful(existing.clientName, brief.businessName),
    projectType: referenceDriven ? normalizeProjectType(brief.projectType) : preferMeaningful(existing.projectType, normalizeProjectType(brief.projectType)),
    industry: referenceDriven ? brief.industry : preferMeaningful(existing.industry, brief.industry),
    reference: brief.reference
      ? {
          enabled: Boolean(brief.reference.enabled && brief.reference.website),
          website: brief.reference.website,
          captureMode: brief.reference.captureMode || "layout-text-widgets",
        }
      : existing.reference,
    modules: {
      ...(existing.modules || {}),
      whatsappCTA: existing.modules?.whatsappCTA ?? Boolean(asString(brief.contact?.whatsapp)),
      leadForm: existing.modules?.leadForm ?? brief.projectType !== "E-commerce",
      booking: hospitality,
      auth: existing.modules?.auth ?? brief.projectType === "E-commerce",
      cart: existing.modules?.cart ?? brief.projectType === "E-commerce",
      payments: existing.modules?.payments ?? brief.projectType === "E-commerce",
      blog: existing.modules?.blog ?? false,
      multiTenant: existing.modules?.multiTenant ?? false,
    },
    brandConfig: {
      ...existingBrandConfig,
      businessDescription: brief.businessDescription,
      offerSummary: brief.mainOffer,
      primaryGoal: brief.primaryGoal,
      specialty: brief.services?.[0]?.title || brief.mainOffer,
      copyStyle: brief.brand.copyStyle,
      whatsappNumber: preferMeaningful(existingBrandConfig.whatsappNumber, asString(brief.contact?.whatsapp)),
      email: preferMeaningful(existingBrandConfig.email, asString(brief.contact?.email)),
      themeMode: referenceDriven ? brief.brand.themeMode : preferMeaningful(existingBrandConfig.themeMode, brief.brand.themeMode),
      visualStyle: referenceDriven ? brief.brand.visualStyle : preferMeaningful(existingBrandConfig.visualStyle, brief.brand.visualStyle),
      layoutMode: referenceDriven ? brief.brand.layoutMode : preferMeaningful(existingBrandConfig.layoutMode, brief.brand.layoutMode),
      shellMode: referenceDriven ? brief.brand.shellMode : preferMeaningful(existingBrandConfig.shellMode, brief.brand.shellMode),
      textAlign: referenceDriven ? brief.brand.textAlign : preferMeaningful(existingBrandConfig.textAlign, brief.brand.textAlign),
      buttonShape: referenceDriven ? brief.brand.buttonShape : preferMeaningful(existingBrandConfig.buttonShape, brief.brand.buttonShape),
      visualConcept: referenceDriven ? brief.brand.visualConcept : preferMeaningful(existingBrandConfig.visualConcept, brief.brand.visualConcept),
      layoutMood: referenceDriven ? brief.brand.layoutMood : preferMeaningful(existingBrandConfig.layoutMood, brief.brand.layoutMood),
      visualSignature: referenceDriven ? brief.brand.visualSignature : preferMeaningful(existingBrandConfig.visualSignature, brief.brand.visualSignature),
      accentColor: referenceDriven ? brief.brand.primaryColor : (hasMeaningfulValue(existingBrandConfig.accentColor) ? existingBrandConfig.accentColor : brief.brand.primaryColor),
      accentAltColor: referenceDriven ? brief.brand.secondaryColor : (hasMeaningfulValue(existingBrandConfig.accentAltColor) ? existingBrandConfig.accentAltColor : brief.brand.secondaryColor),
    },
  };
}

function buildNarrativeTitle(brief) {
  const spanish = isSpanishBrief(brief);
  const educationIndustry = /education|educacion/i.test(asString(brief.industry));
  const hospitality = isHospitalityBrief(brief);

  if (spanish && hospitality) {
    return "Una experiencia hotelera mas cercana al referente visual";
  }

  if (hospitality) {
    return "A hotel experience aligned with the captured visual reference";
  }

  if (spanish && brief.projectType === "Landing Page") {
    return "Una propuesta clara desde el primer vistazo";
  }

  if (spanish && brief.projectType === "E-commerce") {
    return "Una compra mas clara desde el primer clic";
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

function isSpanishBrief(brief) {
  const sample = [
    asString(brief.businessDescription),
    asString(brief.mainOffer),
    asString(brief.primaryGoal),
    asString(brief.targetAudience),
    asString(brief.hero?.headline),
    asString(brief.hero?.subtitle),
    asString(brief.cta?.contactTitle),
    asString(brief.cta?.contactDescription),
  ]
    .join(" ")
    .toLowerCase();

  return /[áéíóúñ¿¡]/i.test(sample) || /\b(el|la|los|las|para|con|que|educacion|servicios|contacto|matriculas|familias|colegio|institucion)\b/i.test(sample);
}

async function main() {
  const [brief, existingProfile, existingContent] = await Promise.all([
    readBrief(),
    readJson(profilePath, {}),
    readJson(siteContentPath, {}),
  ]);

  const nextProfile = buildNextProfile(existingProfile, brief);
  const nextContent = buildGeneratedSiteContent(brief, existingContent);

  await fs.mkdir(configDir, { recursive: true });
  await Promise.all([
    fs.writeFile(profilePath, `${JSON.stringify(nextProfile, null, 2)}\n`, "utf8"),
    fs.writeFile(siteContentPath, `${JSON.stringify(nextContent, null, 2)}\n`, "utf8"),
    fs.writeFile(localEditorPath, "{}\n", "utf8"),
  ]);

  console.log("Applied brief to config/site-content.json");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
