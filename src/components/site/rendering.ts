import type { ClientModules, ClientProfile, ImagePosition, SiteContent } from "@/types/site";

export type EngineKind = "landing" | "brand" | "storefront" | "agency";
export type EngineVariant =
  | "campaign"
  | "luxury"
  | "launch"
  | "editorial"
  | "corporate"
  | "studio"
  | "personal-brand"
  | "results"
  | "studio-pro"
  | "fashion"
  | "sports"
  | "catalog-light";
export type VisualSignature =
  | "signature-aura"
  | "signature-axis"
  | "signature-cascade"
  | "signature-drift"
  | "signature-forge"
  | "signature-lumen";
export const VISUAL_STYLE_OPTIONS = [
  "auto",
  "normal",
  "luxury",
  "minimalista",
  "bento",
  "editorial",
  "immersive",
  "saas-modern-ui",
  "glassmorphism",
  "minimal-business",
  "web-visual-imagenes-grandes",
  "interactive-motion-ui",
  "tecnologico",
  "espacial",
  "moderno",
  "editor",
  "premium",
  "pro",
  "3d",
  "9bit",
] as const;
export type VisualStyleKind = (typeof VISUAL_STYLE_OPTIONS)[number];
export const LAYOUT_MODE_OPTIONS = ["soft", "block", "fluid", "mixed"] as const;
export type LayoutModeKind = (typeof LAYOUT_MODE_OPTIONS)[number];
export const SHELL_MODE_OPTIONS = ["framed", "framed-seamless", "full-bleed", "seamless"] as const;
export type ShellModeKind = (typeof SHELL_MODE_OPTIONS)[number];
export type LandingReviewItem = SiteContent["testimonials"][number] & {
  avatarSrc?: string;
  location?: string;
  segment?: string;
  rating: 4 | 5;
};

function normalizeImagePosition(position?: ImagePosition) {
  const x = typeof position?.x === "number" ? Math.min(100, Math.max(0, position.x)) : 50;
  const y = typeof position?.y === "number" ? Math.min(100, Math.max(0, position.y)) : 50;

  return { x, y };
}

export function normalizeVisualStyle(value: string | undefined): VisualStyleKind {
  const style = (value || "").trim().toLowerCase();

  switch (style) {
    case "normal":
      return "normal";
    case "luxury":
    case "elegante":
      return "luxury";
    case "minimalista":
      return "minimalista";
    case "bento":
      return "bento";
    case "editorial":
      return "editorial";
    case "immersive":
      return "immersive";
    case "saas modern ui":
    case "saas-modern-ui":
      return "saas-modern-ui";
    case "glassmorphism":
      return "glassmorphism";
    case "minimal business":
    case "minimal-business":
      return "minimal-business";
    case "web visual con imagenes grandes":
    case "web visual con imágenes grandes":
    case "web-visual-imagenes-grandes":
      return "web-visual-imagenes-grandes";
    case "interactive motion ui":
    case "interactive motion ui (ultra moderno)":
    case "interactive-motion-ui":
      return "interactive-motion-ui";
    case "tecnologico":
    case "tecnologia":
      return "tecnologico";
    case "espacial":
      return "espacial";
    case "editor":
      return "editor";
    case "moderno":
      return "moderno";
    case "premium":
      return "premium";
    case "pro":
      return "pro";
    case "3d":
    case "tridimensional":
      return "3d";
    case "9bit":
    case "pixel":
      return "9bit";
    default:
      return "auto";
  }
}

export function getVisualStyleClass(value: string | undefined) {
  return `style-${normalizeVisualStyle(value)}`;
}

export function normalizeLayoutMode(value: string | undefined): LayoutModeKind {
  const mode = (value || "").trim().toLowerCase();

  switch (mode) {
    case "block":
    case "bloques":
    case "con bloques":
      return "block";
    case "bento":
    case "bento modular":
      return "block";
    case "inmersivo":
    case "immersive":
    case "fluido":
    case "fluid":
    case "sin bloques":
    case "blockless":
      return "fluid";
    case "asimetrico":
    case "asymmetric":
    case "mixed":
    case "mixto":
      return "mixed";
    case "soft":
    case "split":
    case "split limpio":
    case "soft shell":
      return "soft";
    default:
      return "soft";
  }
}

export function getLayoutModeClass(value: string | undefined) {
  return `layout-${normalizeLayoutMode(value)}`;
}

export function normalizeShellMode(value: string | undefined): ShellModeKind {
  const mode = (value || "").trim().toLowerCase();

  switch (mode) {
    case "framed seamless":
    case "framed-seamless":
    case "centrado sin bloques":
    case "caja sin bloques":
      return "framed-seamless";
    case "full":
    case "full bleed":
    case "full-bleed":
    case "fullwidth":
    case "full width":
      return "full-bleed";
    case "seamless":
    case "continuo":
    case "sin separaciones":
    case "sin bloques":
      return "seamless";
    default:
      return "framed";
  }
}

export function getShellModeClass(value: string | undefined) {
  return `shell-${normalizeShellMode(value)}`;
}

export function getSignatureForStyle(value: string | undefined): VisualSignature | null {
  switch (normalizeVisualStyle(value)) {
    case "minimalista":
      return "signature-forge";
    case "bento":
      return "signature-axis";
    case "editorial":
      return "signature-cascade";
    case "immersive":
      return "signature-forge";
    case "saas-modern-ui":
      return "signature-axis";
    case "glassmorphism":
      return "signature-aura";
    case "minimal-business":
      return "signature-lumen";
    case "web-visual-imagenes-grandes":
      return "signature-cascade";
    case "interactive-motion-ui":
      return "signature-drift";
    case "luxury":
      return "signature-aura";
    case "editor":
      return "signature-cascade";
    case "moderno":
      return "signature-drift";
    case "premium":
    case "pro":
    case "3d":
      return "signature-axis";
    case "tecnologico":
    case "espacial":
      return "signature-lumen";
    case "9bit":
      return "signature-forge";
    default:
      return null;
  }
}

export function getEngineKind(profile: ClientProfile): EngineKind {
  const projectType = profile.projectType.toLowerCase();
  const niche = getNicheSlug(profile.industry);

  if (projectType === "landing page") {
    return "landing";
  }

  if (projectType === "web site" || projectType === "website") {
    if (niche === "servicios") {
      return "agency";
    }

    return "brand";
  }

  if (projectType === "e-commerce") {
    return "storefront";
  }

  if (profile.modules.cart || profile.modules.payments) {
    return "storefront";
  }

  if (profile.modules.whatsappCTA || profile.modules.leadForm) {
    return "landing";
  }

  return "brand";
}

export function getEngineVariant(profile: ClientProfile, styleOverride?: string): EngineVariant {
  const engine = getEngineKind(profile);
  const style = normalizeVisualStyle(styleOverride ?? profile.brandConfig.visualStyle);
  const niche = getNicheSlug(profile.industry);

  if (engine === "landing") {
    if (style === "luxury" || style === "premium" || style === "glassmorphism" || niche === "inmobiliaria") {
      return "luxury";
    }

    if (
      style === "editor" ||
      style === "editorial" ||
      style === "moderno" ||
      style === "tecnologico" ||
      style === "espacial" ||
      style === "saas-modern-ui" ||
      style === "immersive" ||
      style === "interactive-motion-ui" ||
      niche === "tecnologia"
    ) {
      return "launch";
    }

    return "campaign";
  }

  if (engine === "brand") {
    if (
      style === "editor" ||
      style === "editorial" ||
      style === "immersive" ||
      style === "web-visual-imagenes-grandes" ||
      niche === "peluqueria"
    ) {
      return "editorial";
    }

    if (
      style === "luxury" ||
      style === "premium" ||
      style === "pro" ||
      style === "minimal-business" ||
      niche === "inmobiliaria" ||
      niche === "clinica"
    ) {
      return "corporate";
    }

    return "studio";
  }

  if (engine === "agency") {
    if (
      style === "editor" ||
      style === "editorial" ||
      style === "immersive" ||
      style === "luxury" ||
      style === "web-visual-imagenes-grandes"
    ) {
      return "personal-brand";
    }

    if (
      style === "premium" ||
      style === "minimalista" ||
      style === "pro" ||
      style === "bento" ||
      style === "saas-modern-ui" ||
      style === "minimal-business" ||
      niche === "servicios"
    ) {
      return "studio-pro";
    }

    return "results";
  }

  if (style === "editor" || style === "editorial" || style === "immersive" || style === "luxury" || niche === "peluqueria") {
    return "fashion";
  }

  if (
    style === "bento" ||
    style === "moderno" ||
    style === "tecnologico" ||
    style === "3d" ||
    style === "espacial" ||
    style === "saas-modern-ui" ||
    style === "glassmorphism" ||
    style === "interactive-motion-ui" ||
    niche === "tecnologia"
  ) {
    return "catalog-light";
  }

  return "sports";
}

export function getNicheSlug(industry: string) {
  switch (industry.toLowerCase()) {
    case "restaurante":
      return "restaurante";
    case "peluqueria":
      return "peluqueria";
    case "inmobiliaria":
      return "inmobiliaria";
    case "clinica":
      return "clinica";
    case "tecnologia":
      return "tecnologia";
    case "servicios":
      return "servicios";
    case "fitness":
    case "gimnasio":
    case "gym":
      return "fitness";
    case "educacion":
    case "educaci\u00f3n":
    case "academia":
      return "educacion";
    case "legal":
    case "abogado":
    case "abogados":
    case "notar\u00eda":
    case "notar\u00eda":
      return "legal";
    case "moda":
    case "ropa":
    case "fashion":
      return "moda";
    default:
      return "generic";
  }
}

export function getVisualSignature(profile: ClientProfile, styleOverride?: string): VisualSignature {
  const styleSignature = getSignatureForStyle(styleOverride);
  if (styleSignature) {
    return styleSignature;
  }

  const manualSignature = profile.brandConfig.visualSignature as VisualSignature | undefined;
  const validSignatures: VisualSignature[] = [
    "signature-aura",
    "signature-axis",
    "signature-cascade",
    "signature-drift",
    "signature-forge",
    "signature-lumen",
  ];

  if (manualSignature && validSignatures.includes(manualSignature)) {
    return manualSignature;
  }

  const source = [
    profile.clientCode,
    profile.businessName,
    profile.industry,
    profile.projectType,
    styleOverride ?? profile.brandConfig.visualStyle,
  ]
    .join("|")
    .toLowerCase();

  let hash = 0;
  for (const char of source) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }

  return validSignatures[hash % validSignatures.length];
}

export function getLandingTestimonials(profile: ClientProfile, content: SiteContent, count = 20): LandingReviewItem[] {
  const niche = getNicheSlug(profile.industry);
  const style = normalizeVisualStyle(content.theme.visualStyle || profile.brandConfig.visualStyle);
  const mediaPool = [
    content.brand.heroImageSrc,
    ...(content.galleryItems?.map((item) => item.imageSrc) ?? []),
    ...content.services.map((item) => item.imageSrc),
    ...content.products.map((item) => item.imageSrc),
  ].filter((value): value is string => Boolean(value && value.trim()));
  const locations = getLandingLocations(niche);
  const segments = getLandingSegments(niche, content);
  const names = getLandingNames();
  const baseRating = getLandingRating(style);
  const existing = content.testimonials
    .filter((_, index) => content.visibility?.testimonials?.[index] !== false)
    .map((testimonial, index) => ({
    ...testimonial,
    avatarSrc: testimonial.avatarSrc || mediaPool[index % Math.max(mediaPool.length, 1)],
    location: testimonial.location || locations[index % locations.length],
    segment: testimonial.segment || segments[index % segments.length],
    rating: clampLandingRating(testimonial.rating ?? (baseRating - (index % 4 === 0 && baseRating === 5 ? 1 : 0))),
    }));

  if (content.testimonials.length > 0) {
    return existing.slice(0, Math.min(count, 8));
  }

  const reviews = [...existing];
  while (reviews.length < count) {
    const index = reviews.length;
    const service = segments[index % segments.length];
    const location = locations[index % locations.length];
    const name = names[index % names.length];
    const quote = getLandingQuote(niche, service, content, index);
    reviews.push({
      name,
      role: getLandingRole(niche, index),
      quote,
      avatarSrc: mediaPool[index % Math.max(mediaPool.length, 1)],
      location,
      segment: service,
      rating: clampLandingRating(baseRating - (index % 5 === 0 && baseRating === 5 ? 1 : 0)),
    });
  }

  return reviews.slice(0, Math.min(count, 5));
}

export function getLandingFaqs(profile: ClientProfile, content: SiteContent, count = 5) {
  const niche = getNicheSlug(profile.industry);
  const base = content.faqs.filter((_, index) => content.visibility?.faqs?.[index] !== false);

  if (content.faqs.length > 0) {
    const uniqueBase: typeof base = [];

    for (const faq of base) {
      if (!uniqueBase.some((item) => item.question.trim().toLowerCase() === faq.question.trim().toLowerCase())) {
        uniqueBase.push(faq);
      }
    }

    return uniqueBase.slice(0, count);
  }

  const generated = getLandingFaqTemplates(niche, content);
  const combined: typeof base = [];

  for (const faq of generated) {
    if (!combined.some((item) => item.question.trim().toLowerCase() === faq.question.trim().toLowerCase())) {
      combined.push(faq);
    }
  }

  return combined.slice(0, count);
}

export function getGalleryItems(content: SiteContent, fallbackSubtitle: string) {
  if (content.galleryItems?.length) {
    return content.galleryItems
      .filter((_, index) => content.visibility?.galleryItems?.[index] !== false)
      .slice(0, 5)
      .map((item, index) => ({
      title: item.title,
      subtitle: item.subtitle || fallbackSubtitle,
      imageSrc: item.imageSrc ?? "",
      imagePosition: item.imagePosition,
      key: `${item.title}-${index}`,
      }));
  }

  return content.galleryKeywords.slice(0, 5).map((keyword, index) => ({
    title: keyword,
    subtitle: fallbackSubtitle,
    imageSrc: "",
    imagePosition: undefined,
    key: `${keyword}-${index}`,
  }));
}

export function getVisibleServices(content: SiteContent) {
  return content.services.filter((_, index) => content.visibility?.services?.[index] !== false);
}

export function getVisibleHighlights(content: SiteContent) {
  return content.highlights.filter((_, index) => content.visibility?.highlights?.[index] !== false);
}

export function getVisibleTestimonials(content: SiteContent) {
  return content.testimonials.filter((_, index) => content.visibility?.testimonials?.[index] !== false);
}

export function getVisibleFaqs(content: SiteContent) {
  return content.faqs.filter((_, index) => content.visibility?.faqs?.[index] !== false);
}

export function getActiveModules(modules: ClientModules) {
  return Object.entries(modules).filter(([, value]) => value);
}

export function slugifySectionLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPageHref(page: string) {
  const slug = slugifySectionLabel(page);

  if (slug === "inicio" || slug === "home") {
    return "#inicio";
  }

  if (slug.includes("nosotros") || slug.includes("acerca") || slug.includes("about") || slug.includes("process") || slug.includes("how-it-works")) {
    return "#nosotros";
  }

  if (slug.includes("benefits") || slug.includes("beneficios") || slug.includes("trust") || slug.includes("confianza")) {
    return "#confianza";
  }

  if (
    slug.includes("servicios") ||
    slug.includes("soluciones") ||
    slug.includes("catalogo") ||
    slug.includes("colecciones") ||
    slug.includes("services") ||
    slug.includes("solution") ||
    slug.includes("products") ||
    slug.includes("categories") ||
    slug.includes("haircare") ||
    slug.includes("kits")
  ) {
    return "#servicios";
  }

  if (
    slug.includes("casos") ||
    slug.includes("trabajos") ||
    slug.includes("portafolio") ||
    slug.includes("proyectos") ||
    slug.includes("projects") ||
    slug.includes("testimonials") ||
    slug.includes("reviews")
  ) {
    return "#trabajos";
  }

  if (slug.includes("contacto") || slug.includes("faq") || slug.includes("soporte")) {
    return "#contacto";
  }

  if (slug.includes("cuenta") || slug.includes("pedidos")) {
    return "#contacto";
  }

  return `#${slug || "inicio"}`;
}

export function formatModuleLabel(key: string) {
  switch (key) {
    case "whatsappCTA":
      return "WhatsApp";
    case "leadForm":
      return "Formulario";
    case "booking":
      return "Reservas";
    case "blog":
      return "Blog";
    case "auth":
      return "Auth";
    case "cart":
      return "Carrito";
    case "payments":
      return "Pagos";
    case "multiTenant":
      return "Multi-tenant";
    default:
      return key;
  }
}

export function getProductHref(productName: string, content: SiteContent) {
  const encodedMessage = encodeURIComponent(`Hola, quiero informacion sobre ${productName}.`);
  const cleanNumber = (content.contact.whatsappNumber || "").replace(/[^\d]/g, "");

  if (cleanNumber) {
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }

  return content.brand.primaryCtaHref || "#contacto";
}

export function getMediaStyle(imageSrc?: string, overlay = "0.46", imagePosition?: ImagePosition) {
  if (!imageSrc) {
    return undefined;
  }

  const position = normalizeImagePosition(imagePosition);
  const mobileX = typeof imagePosition?.mobileX === "number" ? imagePosition.mobileX : position.x;
  const mobileY = typeof imagePosition?.mobileY === "number" ? imagePosition.mobileY : position.y;

  return {
    ["--media-image-position" as const]: `${position.x}% ${position.y}%`,
    ["--media-image-position-mobile" as const]: `${mobileX}% ${mobileY}%`,
    backgroundImage: `linear-gradient(180deg, rgba(4, 8, 16, 0.05), rgba(4, 8, 16, ${overlay})), url(${imageSrc})`,
  };
}

export function getStoryLabels(profile: ClientProfile, content: SiteContent) {
  const niche = getNicheSlug(profile.industry);
  const baseLabels = (() => {
    switch (niche) {
      case "restaurante":
        return {
          heroLabel: "Experiencia culinaria",
          supportLabel: "Servicio estrella",
          proofLabel: "Rese\u00f1as y confianza",
          ctaLabel: "Reservas y pedidos",
        };
      case "inmobiliaria":
        return {
          heroLabel: "Coleccion de propiedades",
          supportLabel: "Activos destacados",
          proofLabel: "Clientes e inversion",
          ctaLabel: "Agenda una visita",
        };
      case "clinica":
        return {
          heroLabel: "Atencion y claridad",
          supportLabel: "Servicios medicos",
          proofLabel: "Pacientes y tranquilidad",
          ctaLabel: "Agendar evaluacion",
        };
      case "tecnologia":
        return {
          heroLabel: "Sistema digital",
          supportLabel: "Producto y stack",
          proofLabel: "Resultados y adopcion",
          ctaLabel: "Solicitar demo",
        };
      case "peluqueria":
        return {
          heroLabel: "Beauty concept",
          supportLabel: "Rituales y colecciones",
          proofLabel: "Clientes y looks",
          ctaLabel: "Reservar experiencia",
        };
      case "fitness":
        return {
          heroLabel: "Entrenamiento y energia",
          supportLabel: "Programas y coaches",
          proofLabel: "Miembros y progreso",
          ctaLabel: "Probar una clase",
        };
      case "educacion":
        return {
          heroLabel: "Aprendizaje guiado",
          supportLabel: "Programas y metodologia",
          proofLabel: "Alumnos y confianza",
          ctaLabel: "Solicitar informacion",
        };
      case "legal":
        return {
          heroLabel: "Despacho y autoridad",
          supportLabel: "Areas de practica",
          proofLabel: "Casos y credibilidad",
          ctaLabel: "Agendar consulta",
        };
      case "moda":
        return {
          heroLabel: "Coleccion y lookbook",
          supportLabel: "Drops y narrativa visual",
          proofLabel: "Clientes y comunidad",
          ctaLabel: "Explorar coleccion",
        };
      default:
        return {
          heroLabel: content.theme.visualStyle || "Direccion visual",
          supportLabel: "Oferta principal",
          proofLabel: "Prueba social",
          ctaLabel: content.brand.primaryCtaLabel || "Contactar",
        };
    }
  })();

  return {
    ...baseLabels,
    heroLabel: content.uiText?.heroLabel?.trim() || baseLabels.heroLabel,
    supportLabel: content.uiText?.supportLabel?.trim() || baseLabels.supportLabel,
    proofLabel: content.uiText?.proofLabel?.trim() || baseLabels.proofLabel,
  };
}

function getLandingRating(style: VisualStyleKind): 4 | 5 {
  switch (style) {
    case "premium":
    case "luxury":
    case "moderno":
    case "pro":
    case "3d":
      return 5;
    default:
      return 4;
  }
}

function clampLandingRating(value: number): 4 | 5 {
  return value >= 5 ? 5 : 4;
}

function getLandingNames() {
  return [
    "Valeria M.",
    "Diego R.",
    "Camila T.",
    "Javier P.",
    "Luciana G.",
    "Mauricio C.",
    "Sofia N.",
    "Andrea V.",
    "Renato L.",
    "Paola D.",
    "Fernando A.",
    "Daniela Q.",
    "Rodrigo S.",
    "Anais H.",
    "Martin E.",
    "Carla U.",
    "Josefina B.",
    "Leonardo F.",
    "Mariana K.",
    "Alonso Z.",
  ];
}

function getLandingLocations(niche: string) {
  switch (niche) {
    case "inmobiliaria":
      return ["Miraflores, Lima", "Barranco, Lima", "San Isidro, Lima", "La Molina, Lima", "Surco, Lima"];
    case "restaurante":
      return ["Lima Centro", "San Isidro", "Barranco", "Piura", "Arequipa"];
    case "clinica":
      return ["Lima", "Trujillo", "Cusco", "Arequipa", "Chiclayo"];
    case "tecnologia":
      return ["Lima", "Bogota", "Santiago", "Quito", "Ciudad de Mexico"];
    case "peluqueria":
      return ["Miraflores", "Barranco", "San Borja", "Surco", "La Molina"];
    case "fitness":
      return ["Miraflores", "San Miguel", "Surquillo", "San Isidro", "Magdalena"];
    case "educacion":
      return ["Lima", "Piura", "Trujillo", "Cusco", "Arequipa"];
    case "legal":
      return ["Lima", "San Isidro", "Jes\u00fas Mar\u00eda", "Miraflores", "Arequipa"];
    case "moda":
      return ["Lima", "Bogota", "Santiago", "Medellin", "Quito"];
    default:
      return ["Lima", "Chiclayo", "Piura", "Arequipa", "Bogota"];
  }
}

function getLandingSegments(niche: string, content: SiteContent) {
  const dynamic = [
    ...content.services.map((item) => item.title),
    ...content.products.map((item) => item.name),
    ...content.galleryItems?.map((item) => item.title) ?? [],
    ...content.highlights,
  ]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  if (dynamic.length >= 4) {
    return Array.from(new Set(dynamic)).slice(0, 8);
  }

  switch (niche) {
    case "inmobiliaria":
      return ["Visita privada", "Lead filtrado", "Propiedad premium", "Asesoria de inversion"];
    case "restaurante":
      return ["Reserva directa", "Carta destacada", "Chef table", "Experiencia premium"];
    case "clinica":
      return ["Agenda medica", "Especialidad clave", "Atencion guiada", "Chequeo preventivo"];
    case "tecnologia":
      return ["Demo del producto", "Implementacion rapida", "Dashboard central", "Automatizacion"];
    case "peluqueria":
      return ["Reserva de cita", "Color signature", "Ritual premium", "Look editorial"];
    case "fitness":
      return ["Clase de prueba", "Plan personalizado", "Programa intensivo", "Comunidad activa"];
    case "educacion":
      return ["Matricula", "Clase muestra", "Programa intensivo", "Acompanamiento"];
    case "legal":
      return ["Consulta inicial", "Defensa clara", "Revision de caso", "Asesoria corporativa"];
    case "moda":
      return ["Coleccion clave", "Drops semanales", "Compra rapida", "Lookbook premium"];
    default:
      return ["Oferta principal", "Ruta directa", "Caso destacado", "Contacto filtrado"];
  }
}

function getLandingRole(niche: string, index: number) {
  const rolesByNiche: Record<string, string[]> = {
    inmobiliaria: ["Compradora", "Inversionista", "Propietario", "Lead filtrado"],
    restaurante: ["Comensal frecuente", "Reserva corporativa", "Cliente premium", "Foodie local"],
    clinica: ["Paciente", "Familiar", "Paciente recurrente", "Consulta privada"],
    tecnologia: ["Founder", "COO", "Head of Growth", "Gerente de operaciones"],
    peluqueria: ["Cliente frecuente", "Novia", "Ejecutiva", "Beauty client"],
    fitness: ["Alumno activo", "Coach", "Miembro premium", "Cliente nuevo"],
    educacion: ["Padre de familia", "Alumno", "Coordinadora", "Directora academica"],
    legal: ["Cliente particular", "Gerente general", "Area legal", "Socia fundadora"],
    moda: ["Compradora", "Cliente VIP", "Fashion lead", "Fundadora de marca"],
    generic: ["Cliente ideal", "Prospecto", "Contacto comercial", "Cuenta clave"],
  };

  const roles = rolesByNiche[niche] ?? rolesByNiche.generic;
  return roles[index % roles.length];
}

function getLandingQuote(niche: string, segment: string, content: SiteContent, index: number) {
  const outcomes = getLandingOutcomes(niche);
  const service = segment || content.brand.primaryCtaLabel || "la propuesta";
  const businessName = content.brand.name;
  const outcome = outcomes[index % outcomes.length];

  return `Con ${service.toLowerCase()} se entendio mejor la oferta de ${businessName} y ${outcome}.`;
}

function getLandingOutcomes(niche: string) {
  switch (niche) {
    case "inmobiliaria":
      return [
        "agendamos la visita mucho mas rapido",
        "llegaron consultas mejor filtradas",
        "la propiedad se percibio mas seria desde mobile",
        "subio la calidad de las conversaciones comerciales",
      ];
    case "restaurante":
      return [
        "se movieron mas reservas en horas clave",
        "el menu se vio mas apetitoso y directo",
        "la gente paso de mirar a reservar",
        "subio el interes por experiencias premium",
      ];
    case "clinica":
      return [
        "la agenda se entendio sin friccion",
        "se redujeron dudas antes de escribir",
        "la confianza mejoro desde el primer scroll",
        "la especialidad quedo mucho mas clara",
      ];
    case "tecnologia":
      return [
        "la demo cerro mejor la propuesta",
        "los leads llegaron con mejor contexto",
        "el producto se entendio en segundos",
        "el equipo comercial recibio contactos mas calificados",
      ];
    case "peluqueria":
      return [
        "la agenda se movio mas rapido",
        "el servicio premium gano mas valor percibido",
        "la decision de reservar fue mas simple",
        "las clientas llegaron con expectativas mejor alineadas",
      ];
    case "fitness":
      return [
        "la prueba de ingreso se sintio mas directa",
        "las matriculas llegaron con mejor contexto",
        "el programa se entendio mucho mas rapido",
        "subio la percepcion premium del estudio",
      ];
    case "educacion":
      return [
        "la matricula se entendio sin friccion",
        "los programas ganaron mas claridad",
        "la institucion se vio mas confiable desde mobile",
        "los leads llegaron mejor informados",
      ];
    case "legal":
      return [
        "la consulta inicial se percibio mas seria",
        "la firma gano mucha mas credibilidad visual",
        "las areas de practica se entendieron al instante",
        "subio la calidad de las consultas entrantes",
      ];
    case "moda":
      return [
        "la coleccion se vio mucho mas deseable",
        "la marca gano ritmo editorial real",
        "la compra se sintio mas directa desde mobile",
        "los drops destacaron mejor sin saturar la pagina",
      ];
    default:
      return [
        "la propuesta se entendio en menos tiempo",
        "la conversion se sintio mas directa",
        "la experiencia se vio mucho mas profesional",
        "el siguiente paso quedo clarisimo",
      ];
  }
}

function getLandingFaqTemplates(niche: string, content: SiteContent) {
  const primaryCta = content.brand.primaryCtaLabel || "contactar";
  const service = content.services[0]?.title || content.products[0]?.name || "la propuesta principal";

  switch (niche) {
    case "inmobiliaria":
      return [
        { question: "Como filtran a los interesados antes de agendar?", answer: "La landing prioriza activos clave, prueba visual y CTA directo para atraer consultas con mejor intencion." },
        { question: "Se pueden mostrar pocas propiedades sin que se vea vacio?", answer: "Si. La estructura esta pensada para destacar una seleccion corta sin perder ritmo visual ni claridad." },
        { question: "Puedo conectar WhatsApp del asesor principal?", answer: `Si. El CTA principal puede llevar directo a ${primaryCta.toLowerCase()} con mensaje prellenado.` },
        { question: "Se adapta a zonas, proyectos y tipos de activo?", answer: "Si. Puedes cambiar propiedades, zonas, precios, narrativa y medios sin rehacer la interfaz." },
        { question: "Sirve para captar visitas o inversionistas?", answer: "Si. El layout puede enfocarse en visitas filtradas, patrimonio, rentabilidad o captacion de propietarios." },
      ];
    case "restaurante":
      return [
        { question: "Se puede empujar reserva directa desde la landing?", answer: "Si. La estructura esta armada para reducir pasos y llevar a reserva, llamada o WhatsApp sin friccion." },
        { question: "Puedo cambiar menu, platos y horarios facilmente?", answer: "Si. Los bloques estan pensados para actualizar carta, promociones, turnos y experiencias destacadas." },
        { question: "Funciona bien para mobile cuando la gente viene de Instagram?", answer: "Si. La jerarquia esta optimizada para lectura rapida, fotos grandes y CTA visible desde el primer scroll." },
        { question: "Sirve para eventos privados o chef table?", answer: "Si. Puedes dedicar secciones a experiencias premium, ticket medio alto y reservas especiales." },
        { question: "Se puede conectar WhatsApp o formulario de reserva?", answer: "Si. Ambos flujos estan preparados y se pueden usar juntos segun el negocio." },
      ];
    case "clinica":
      return [
        { question: "Se puede ordenar la informacion medica sin saturar?", answer: "Si. La base reparte especialidades, confianza y llamada a la accion en una ruta mucho mas clara." },
        { question: "Puedo mostrar medicos, sedes y servicios?", answer: "Si. La landing puede crecer con equipo medico, sedes, FAQs y bloques de especialidades." },
        { question: "Sirve para agenda por WhatsApp o formulario?", answer: "Si. El CTA principal y el formulario quedan listos para captar consultas y primeras evaluaciones." },
        { question: "La experiencia transmite confianza desde mobile?", answer: "Si. Tipografia, espacios y contraste estan cuidados para verse profesional y tranquila." },
        { question: "Puedo adaptar esta landing a una especialidad concreta?", answer: `Si. Se puede orientar por completo a ${service.toLowerCase()} o a cualquier especialidad principal.` },
      ];
    case "tecnologia":
      return [
        { question: "Se puede enfocar en demo y no en demasiado texto?", answer: "Si. La landing prioriza producto visible, beneficio claro y CTA de demo o contacto desde arriba." },
        { question: "Sirve para SaaS, software a medida o automatizacion?", answer: "Si. La estructura soporta producto, servicios, integraciones y casos de uso." },
        { question: "Puedo mostrar dashboard, stack y prueba social?", answer: "Si. Hay espacio para UI, resultados, testimonios y FAQs sin perder velocidad visual." },
        { question: "Funciona bien para trafico de ads y outreach?", answer: "Si. La narrativa corta y el CTA directo ayudan a convertir visitas frias en conversaciones mejor filtradas." },
        { question: "Se puede adaptar a varios ICP o segmentos?", answer: "Si. Puedes duplicar versiones o ajustar bloques segun vertical, ticket o tipo de cliente." },
      ];
    case "fitness":
      return [
        { question: "Se puede llevar a clase de prueba o matricula sin pasos extra?", answer: "Si. La estructura esta pensada para reducir friccion y llevar al usuario a prueba, WhatsApp o pago." },
        { question: "Puedo mostrar coaches, horarios y planes?", answer: "Si. La landing puede combinar programas, entrenadores, horarios y testimonios sin perder ritmo visual." },
        { question: "Funciona para ads y trafico frio?", answer: "Si. La propuesta se entiende rapido y los CTA quedan visibles desde el primer bloque." },
        { question: "Sirve para gimnasio premium o estudio boutique?", answer: "Si. El tono y la composicion pueden ir desde rendimiento duro hasta lifestyle premium." },
        { question: "Se adapta a memberships y promociones?", answer: "Si. Puedes destacar membresias, promos de ingreso o sesiones de prueba sin rehacer el layout." },
      ];
    case "educacion":
      return [
        { question: "Se puede explicar un programa sin saturar de texto?", answer: "Si. La estructura reparte propuesta, metodologia, confianza y CTA de una forma mucho mas clara." },
        { question: "Puedo mostrar docentes, programa y salida laboral?", answer: "Si. Los bloques soportan programa, equipo, resultados y preguntas frecuentes en una sola ruta." },
        { question: "Funciona para academia, colegio o instituto?", answer: "Si. La base es flexible y puede adaptarse al nivel educativo y al tono de la institucion." },
        { question: "Se puede llevar a matricula o solicitud de informacion?", answer: "Si. El CTA principal puede apuntar a formulario, WhatsApp o inscripcion directa." },
        { question: "Sirve para campa\u00f1as de captacion?", answer: "Si. Esta pensada para trafico de ads, referrals y redes sin perder claridad academica." },
      ];
    case "legal":
      return [
        { question: "La landing puede verse seria sin parecer fria?", answer: "Si. La direccion visual busca autoridad y claridad sin caer en una presencia plana o anticuada." },
        { question: "Puedo destacar areas de practica y equipo?", answer: "Si. Puedes organizar servicios legales, abogados, casos y CTA de consulta con muy buena jerarquia." },
        { question: "Funciona para captar consultas iniciales?", answer: "Si. El recorrido esta pensado para llevar de interes a una primera consulta mejor filtrada." },
        { question: "Se puede adaptar a estudio boutique o firma corporativa?", answer: "Si. Cambian tono, composicion y narrativa segun el perfil del despacho." },
        { question: "Sirve tambien para derecho corporativo o litigio?", answer: "Si. El sistema se puede orientar por especialidad sin reconstruir la experiencia completa." },
      ];
    case "moda":
      return [
        { question: "Se puede vender la coleccion sin que parezca una tienda generica?", answer: "Si. La estructura prioriza lookbook, narrativa visual y seleccion curada antes que una grilla plana." },
        { question: "Puedo destacar drops, favoritos o piezas clave?", answer: "Si. Puedes organizar capsules, destacados y CTA de compra o reserva segun la marca." },
        { question: "Funciona bien para trafico de Instagram y TikTok?", answer: "Si. La composicion visual y los bloques cortos estan pensados para captura rapida desde mobile." },
        { question: "Se adapta a marca personal o marca de autor?", answer: "Si. Puedes llevarla a una direccion mas editorial o mas comercial sin romper el sistema." },
        { question: "Sirve para venta directa o solo branding?", answer: "Sirve para ambos. Puede enfocarse en marca, lookbook, drop o conversion directa a compra." },
      ];
    default:
      return [
        { question: "Se puede personalizar al negocio real sin rehacer todo?", answer: "Si. La base esta pensada para reemplazar copy, medios, CTA y secciones sin romper la composicion." },
        { question: "Funciona bien en mobile y desktop?", answer: "Si. La estructura se ajusta para mantener lectura clara, ritmo visual y accion visible en ambos formatos." },
        { question: "Puedo conectar WhatsApp, formulario o agenda?", answer: `Si. El flujo principal puede llevar a ${primaryCta.toLowerCase()} y convivir con formulario o agenda.` },
        { question: "Sirve si solo quiero mostrar una oferta principal?", answer: "Si. La landing esta pensada justo para concentrar atencion en una accion y evitar ruido innecesario." },
        { question: "Se puede adaptar por rubro y por estilo visual?", answer: "Si. Cambian colores, direccion visual, tono y bloques segun el negocio y el estilo seleccionado." },
      ];
  }
}
