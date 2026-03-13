import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { BriefData } from "@/types/site";

type StarterKit = {
  key: string;
  label: string;
  match?: {
    projectTypes?: string[];
    keywords?: string[];
  };
  theme?: {
    mode?: string;
    visualStyle?: string;
    layoutMode?: string;
    shellMode?: string;
    textAlign?: string;
    buttonShape?: string;
    primaryColor?: string;
    secondaryColor?: string;
    visualSignature?: string;
  };
  designSystem?: {
    typography?: string;
    density?: string;
    motion?: string;
    surface?: string;
  };
  brand?: {
    heroTag?: string;
    brandThesis?: string;
    positioning?: string;
    proofAngle?: string;
    ctaStrategy?: string;
    artDirection?: string;
  };
  sections?: {
    pricing?: string;
    team?: string;
    timeline?: string;
  };
  scorecardTargets?: {
    visual?: number;
    conversion?: number;
    trust?: number;
    responsive?: number;
    content?: number;
  };
};

let cachedStarterKits: StarterKit[] | null = null;

export function getStarterKits(): StarterKit[] {
  if (cachedStarterKits) {
    return cachedStarterKits;
  }

  const filePath = path.join(process.cwd(), "config", "starter-kits.json");
  try {
    const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw);
    cachedStarterKits = Array.isArray(parsed.kits) ? parsed.kits : [];
  } catch {
    cachedStarterKits = [];
  }

  return cachedStarterKits ?? [];
}

export function getStarterKitForBrief(brief: BriefData): StarterKit | null {
  if (brief.brand.starterKit) {
    const exact = getStarterKits().find((kit) => kit.key === brief.brand.starterKit);
    if (exact) {
      return exact;
    }
  }

  const source = [brief.industry, brief.mainOffer, brief.businessDescription, brief.targetAudience, brief.businessName]
    .join(" ")
    .toLowerCase();
  let best: StarterKit | null = null;
  let bestScore = -1;

  for (const kit of getStarterKits()) {
    let score = 0;
    if (kit.match?.projectTypes?.includes(brief.projectType)) {
      score += 4;
    }

    for (const keyword of kit.match?.keywords || []) {
      if (source.includes(String(keyword).toLowerCase())) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = kit;
    }
  }

  return best;
}

export function buildStarterKitEnhancements(brief: BriefData) {
  const starterKit = getStarterKitForBrief(brief);
  if (!starterKit) {
    return {
      starterKit,
      pricing: { title: "", description: "", tiers: [] },
      team: { title: "", description: "", members: [] },
      timeline: { title: "", description: "", items: [] },
    };
  }

  return {
    starterKit,
    pricing: buildPricingFromKit(brief, starterKit),
    team: buildTeamFromKit(brief, starterKit),
    timeline: buildTimelineFromKit(brief, starterKit),
  };
}

function buildPricingFromKit(brief: BriefData, starterKit: StarterKit) {
  const label = starterKit.sections?.pricing || "";
  switch (label) {
    case "stay-packages":
      return {
        title: "Paquetes destacados",
        description: "Escenarios base para presentar estadias, reservas y experiencias.",
        tiers: [
          { name: "Essentials", price: "S/ 139", period: "por noche", description: "Estadia clara y funcional.", features: ["Habitacion preparada", "WiFi", "Reserva directa"], highlighted: false },
          { name: "Signature", price: "S/ 189", period: "por noche", description: "Experiencia premium con mejor percepcion de valor.", features: ["Desayuno", "Late checkout", "Amenidades"], highlighted: true },
          { name: "Private", price: "Consultar", period: "", description: "Reserva personalizada para grupos o experiencias especiales.", features: ["Atencion directa", "Condiciones flexibles", "Soporte"], highlighted: false },
        ],
      };
    case "consultation-plans":
      return {
        title: "Entradas claras para convertir",
        description: "Bloques comerciales que reducen friccion antes del contacto.",
        tiers: [
          { name: "Consulta inicial", price: "Desde consulta", description: "Primer contacto ordenado.", features: ["Diagnostico", "Alcance", "Siguiente paso"], highlighted: false },
          { name: "Plan recomendado", price: "Personalizado", description: "Ruta principal segun el caso.", features: ["Prioridades", "Proceso", "Seguimiento"], highlighted: true },
          { name: "Atencion extendida", price: "A medida", description: "Acompañamiento o solucion de mayor alcance.", features: ["Soporte", "Implementacion", "Continuidad"], highlighted: false },
        ],
      };
    case "signature-menu":
      return {
        title: "Experiencias destacadas",
        description: "Estructura base para vender platos, carta o experiencias gastronomicas.",
        tiers: [
          { name: "Degustacion", price: "Consultar", description: "Entrada editorial a la experiencia.", features: ["Reserva", "Menu curado", "Atencion"], highlighted: false },
          { name: "Signature", price: "Plato estrella", description: "Lo que debe vender la pagina con mas fuerza.", features: ["Visibilidad hero", "Prueba social", "CTA"], highlighted: true },
          { name: "Mesa privada", price: "A medida", description: "Experiencia premium para grupos o eventos.", features: ["Atencion directa", "Personalizacion", "Reserva"], highlighted: false },
        ],
      };
    case "saas-plans":
    case "ai-plans":
    case "creator-plans":
      return {
        title: "Planes listos para escalar",
        description: "Starter kit de pricing para productos digitales con CTA claros.",
        tiers: [
          { name: "Starter", price: "$29", period: "/mes", description: "Entrada clara para probar el producto.", features: ["1 workspace", "Core features", "Support"], highlighted: false },
          { name: "Growth", price: "$99", period: "/mes", description: "Plan principal para equipos con mayor uso.", features: ["Automation", "Analytics", "Priority support"], highlighted: true },
          { name: "Enterprise", price: "Custom", period: "", description: "Ventas consultivas para equipos grandes.", features: ["SSO", "Security review", "Dedicated support"], highlighted: false },
        ],
      };
    case "signature-services":
      return {
        title: "Servicios estrella",
        description: "Bloques premium para presentar ofertas con mas claridad y deseo.",
        tiers: [
          { name: "Core", price: "Consultar", description: "Entrada principal al servicio.", features: ["Diagnostico", "Propuesta", "CTA"], highlighted: false },
          { name: "Signature", price: "Premium", description: "Oferta principal con mejor margen y percepcion.", features: ["Servicio estrella", "Experiencia", "Seguimiento"], highlighted: true },
          { name: "Private", price: "A medida", description: "Ruta personalizada para necesidades especiales.", features: ["Atencion dedicada", "Ajustes", "Soporte"], highlighted: false },
        ],
      };
    default:
      return { title: "", description: "", tiers: [] };
  }
}

function buildTeamFromKit(brief: BriefData, starterKit: StarterKit) {
  const label = starterKit.sections?.team || "";
  if (!label) {
    return { title: "", description: "", members: [] };
  }

  const membersByLabel: Record<string, Array<{ name: string; role: string; bio: string }>> = {
    hospitality: [
      { name: "Front Desk Lead", role: "Experiencia y reservas", bio: "Coordina reservas, dudas y soporte al huesped." },
      { name: "Guest Experience", role: "Atencion premium", bio: "Cuida detalles para que la experiencia se sienta superior." },
    ],
    specialists: [
      { name: "Especialista principal", role: "Atencion y evaluacion", bio: "Explica procesos con claridad y foco en confianza." },
      { name: "Coordinacion clinica", role: "Seguimiento", bio: "Ordena agenda, contacto y continuidad del paciente." },
    ],
    "chef-crew": [
      { name: "Chef Signature", role: "Direccion culinaria", bio: "Sostiene la propuesta y los platos de mayor impacto." },
      { name: "Floor Host", role: "Experiencia del servicio", bio: "Convierte reserva, atencion y ambiente en parte de la marca." },
    ],
    partners: [
      { name: "Socio principal", role: "Direccion legal", bio: "Aporta autoridad y claridad de especialidad." },
      { name: "Coordinacion de casos", role: "Operacion", bio: "Da seguimiento ordenado y baja friccion antes del contacto." },
    ],
    stylists: [
      { name: "Stylist Lead", role: "Servicio estrella", bio: "Representa el resultado principal que la pagina debe vender." },
      { name: "Guest Care", role: "Agenda y seguimiento", bio: "Cuida la reserva, la experiencia y la recurrencia." },
    ],
    "product-ops": [
      { name: "Product Lead", role: "Flujo principal", bio: "Sintetiza propuesta, beneficio y direccion del producto." },
      { name: "Ops Architect", role: "Implementacion", bio: "Convierte complejidad en workflow claro y creible." },
    ],
    concierge: [
      { name: "Concierge Lead", role: "Atencion premium", bio: "Hace visible el componente humano del servicio." },
      { name: "Delivery Director", role: "Experiencia", bio: "Conecta proceso, detalle y resultado final." },
    ],
    "risk-team": [
      { name: "Risk & Compliance", role: "Seguridad", bio: "Refuerza confianza y criterios de control." },
      { name: "Customer Success", role: "Onboarding", bio: "Hace creible la adopcion y el siguiente paso." },
    ],
    "creative-team": [
      { name: "Creative Lead", role: "Direccion", bio: "Aporta criterio, sistema y resultado visual." },
      { name: "Workflow Designer", role: "Operacion", bio: "Explica como el producto encaja en el proceso creativo." },
    ],
    builders: [
      { name: "AI Product Lead", role: "Vision y producto", bio: "Conecta tecnologia, utilidad y diferenciacion." },
      { name: "Implementation Lead", role: "Activacion", bio: "Hace tangible el camino desde la prueba hasta el valor real." },
    ],
  };

  return {
    title: "Equipo y criterio",
    description: `La seccion de equipo ayuda a que ${brief.businessName} se sienta mas real y confiable.`,
    members: membersByLabel[label] || [],
  };
}

function buildTimelineFromKit(brief: BriefData, starterKit: StarterKit) {
  const label = starterKit.sections?.timeline || "";
  const timelineByLabel: Record<string, Array<{ year: string; title: string; description: string }>> = {
    "guest-journey": [
      { year: "01", title: "Explora", description: "La pagina vende ubicacion, habitaciones y confianza visual." },
      { year: "02", title: "Consulta", description: "El CTA lleva directo a disponibilidad y reservas." },
      { year: "03", title: "Reserva", description: "El flujo cierra con menos friccion y mejor percepcion." },
    ],
    "care-path": [
      { year: "01", title: "Evalua", description: "La propuesta baja ansiedad y clarifica el primer paso." },
      { year: "02", title: "Confirma", description: "Servicios, equipo y FAQ resuelven dudas clave." },
      { year: "03", title: "Actua", description: "El contacto se siente seguro y facil de completar." },
    ],
    "dining-experience": [
      { year: "01", title: "Descubre", description: "La carta o experiencia se vuelve mas deseable." },
      { year: "02", title: "Reserva", description: "La accion principal se hace evidente y rapida." },
      { year: "03", title: "Regresa", description: "La marca deja memoria y repeticion." },
    ],
    "case-flow": [
      { year: "01", title: "Consulta", description: "La especialidad se entiende sin ruido." },
      { year: "02", title: "Estrategia", description: "El proceso genera confianza y orden." },
      { year: "03", title: "Seguimiento", description: "La relacion se percibe profesional y sostenida." },
    ],
    "appointment-flow": [
      { year: "01", title: "Explora", description: "Servicios y resultados crean deseo inmediato." },
      { year: "02", title: "Agenda", description: "La reserva se vuelve clara y comoda." },
      { year: "03", title: "Vuelve", description: "La marca sostiene recurrencia y valor." },
    ],
    "implementation-steps": [
      { year: "01", title: "Diagnostica", description: "Problema y sistema se entienden rapido." },
      { year: "02", title: "Implementa", description: "El workflow muestra valor sin ruido extra." },
      { year: "03", title: "Escala", description: "La interfaz deja claro el siguiente nivel." },
    ],
    "white-glove-process": [
      { year: "01", title: "Consulta", description: "El servicio premium se presenta con calma y criterio." },
      { year: "02", title: "Curacion", description: "La propuesta se personaliza y gana valor percibido." },
      { year: "03", title: "Entrega", description: "La experiencia final se siente elevada y cuidada." },
    ],
    "activation-flow": [
      { year: "01", title: "Prueba", description: "La promesa se vuelve tangible desde el primer uso." },
      { year: "02", title: "Integra", description: "Producto, seguridad y soporte se ven creibles." },
      { year: "03", title: "Expande", description: "La adopcion se convierte en crecimiento o retencion." },
    ],
    "workflow-steps": [
      { year: "01", title: "Inspira", description: "La pagina vende criterio y resultado." },
      { year: "02", title: "Produce", description: "La herramienta muestra fluidez de trabajo." },
      { year: "03", title: "Publica", description: "El usuario visualiza el output final." },
    ],
  };

  const items = timelineByLabel[label] || [];
  return {
    title: items.length > 0 ? "Flujo recomendado" : "",
    description: items.length > 0 ? `La pagina de ${brief.businessName} debe narrar una progresion clara.` : "",
    items,
  };
}
