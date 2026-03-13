import type { BookingWidgetPreset, ClientProfile, SiteContent } from "@/types/site";

const PRESET_VALUES: BookingWidgetPreset[] = [
  "hotel",
  "restaurant",
  "education",
  "course",
  "service",
  "maintenance",
  "construction",
  "sales",
  "ecommerce",
];

function cp(...values: number[]) {
  return String.fromCodePoint(...values);
}

const EMOJI_BY_KEY: Record<string, string> = {
  wave: cp(0x1F44B),
  chat: cp(0x1F4AC),
  whatsapp: cp(0x1F4F2),
  spark: cp(0x2728),
  hotel: cp(0x1F6CF, 0xFE0F),
  travel: cp(0x1F9F3),
  sun: cp(0x2600, 0xFE0F),
  restaurant: cp(0x1F37D, 0xFE0F),
  food: cp(0x1F372),
  education: cp(0x1F393),
  course: cp(0x1F4D8),
  maintenance: cp(0x1F527),
  construction: cp(0x1F3D7, 0xFE0F),
  sales: cp(0x1F4E6),
  ecommerce: cp(0x1F6D2),
  selection: cp(0x1F4CB),
  detail: cp(0x1F3F7, 0xFE0F),
  price: cp(0x1F4B5),
  timeline: cp(0x23F1, 0xFE0F),
  schedule: cp(0x1F4C5),
  quantity: cp(0x1F465),
  perks: cp(0x2728),
  notes: cp(0x1F4DD),
};

export const BOOKING_WIDGET_PRESET_OPTIONS: Array<{ value: BookingWidgetPreset; label: string }> = [
  { value: "hotel", label: "Hotel" },
  { value: "restaurant", label: "Restaurante" },
  { value: "education", label: "Educacion" },
  { value: "course", label: "Curso" },
  { value: "service", label: "Servicios" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "construction", label: "Obras" },
  { value: "sales", label: "Ventas" },
  { value: "ecommerce", label: "Ecommerce" },
];

type ResolvedBookingWidgetOption = NonNullable<SiteContent["bookingWidget"]>["options"][number];

type ResolvedBookingWidget = {
  preset: BookingWidgetPreset;
  title: string;
  description: string;
  adminLabel: string;
  adminRole: string;
  adminStatus: string;
  actionVerb: string;
  triggerChatLabel: string;
  triggerChatHint: string;
  triggerActionLabel: string;
  triggerActionHint: string;
  tabChatLabel: string;
  tabActionLabel: string;
  chatCtaLabel: string;
  chatCtaHint: string;
  directWhatsappLabel: string;
  directWhatsappHint: string;
  bookingCtaLabel: string;
  summaryLabel: string;
  summaryText: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  scheduleLabel: string;
  schedulePlaceholder: string;
  scheduleInputType: "date" | "text";
  quantityLabel: string;
  quantityOptions: string[];
  notesLabel: string;
  notesPlaceholder: string;
  selectionTitle: string;
  detailLabel: string;
  priceLabel: string;
  timelineLabel: string;
  options: ResolvedBookingWidgetOption[];
};

type PresetCopy = Omit<ResolvedBookingWidget, "preset" | "options">;

function isPresetValue(value: unknown): value is BookingWidgetPreset {
  return typeof value === "string" && PRESET_VALUES.includes(value as BookingWidgetPreset);
}

function pickText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function pickArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const nextValue = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 8);

  return nextValue.length ? nextValue : fallback;
}

function getBusinessName(content: SiteContent) {
  return pickText(content.brand?.name, "Tu negocio");
}

function getTeamName(content: SiteContent) {
  return getBusinessName(content).split(/\s+/).slice(0, 2).join(" ");
}

function getHighlights(content: SiteContent) {
  const values = (content.highlights || []).map((item) => item.trim()).filter(Boolean);
  return values.length ? values.slice(0, 4) : ["Atencion rapida", "WhatsApp directo", "Seguimiento", "Respuesta clara"];
}

function getOfferTitles(content: SiteContent) {
  const services = (content.services || []).map((item) => item.title?.trim() || "").filter(Boolean);
  const products = (content.products || []).map((item) => item.name?.trim() || "").filter(Boolean);
  return [...services, ...products];
}

function getTitleAt(source: string[], index: number, fallback: string) {
  return source[index]?.trim() || fallback;
}

function buildOption(
  id: string,
  label: string,
  roomType: string,
  price: string,
  rateLabel: string,
  stayLabel: string,
  summary: string,
  perks: string[],
  emoji: string,
  badge: string,
  highlighted: boolean,
) {
  return { id, label, roomType, price, rateLabel, stayLabel, summary, perks, emoji, badge, highlighted };
}

function getPresetCopy(preset: BookingWidgetPreset, content: SiteContent): PresetCopy {
  const businessName = getBusinessName(content);
  const teamName = getTeamName(content);

  switch (preset) {
    case "restaurant":
      return {
        title: "Pedidos y reservas por WhatsApp",
        description: `Habla con ${businessName} para pedir, reservar mesa o confirmar promociones sin salir del chat.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Atencion y pedidos",
        adminStatus: "En linea para responder rapido",
        actionVerb: "hacer un pedido",
        triggerChatLabel: "Chatear ahora",
        triggerChatHint: "Menu y reservas",
        triggerActionLabel: "Pedir ahora",
        triggerActionHint: "Delivery o mesa",
        tabChatLabel: "Chat",
        tabActionLabel: "Pedido",
        chatCtaLabel: "Hablar con el local",
        chatCtaHint: "Resuelve menu, horario o mesa",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Consulta promos o delivery",
        bookingCtaLabel: "Enviar pedido",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con carta, promociones, delivery, recojo y reserva de mesa.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Como te llamas?",
        scheduleLabel: "Hora estimada",
        schedulePlaceholder: "Ejemplo: hoy 8:30 pm",
        scheduleInputType: "text",
        quantityLabel: "Personas o combos",
        quantityOptions: ["1", "2", "3-4", "5+"],
        notesLabel: "Detalle adicional",
        notesPlaceholder: "Ejemplo: sin picante, delivery, reserva para aniversario...",
        selectionTitle: "Opcion elegida",
        detailLabel: "Tipo de pedido",
        priceLabel: "Ticket",
        timelineLabel: "Entrega",
      };
    case "education":
      return {
        title: "Informes y admision por WhatsApp",
        description: `Habla con ${businessName} para pedir vacantes, costos y requisitos segun el nivel o sede.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Asesoria academica",
        adminStatus: "Disponible para orientarte",
        actionVerb: "solicitar una vacante",
        triggerChatLabel: "Pedir informes",
        triggerChatHint: "Costos y requisitos",
        triggerActionLabel: "Solicitar vacante",
        triggerActionHint: "Admision guiada",
        tabChatLabel: "Chat",
        tabActionLabel: "Admision",
        chatCtaLabel: "Hablar con asesoria",
        chatCtaHint: "Resuelve dudas academicas",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Consulta cupos y horarios",
        bookingCtaLabel: "Enviar solicitud",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con vacantes, costos, requisitos, sedes y modalidades.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Nombre del tutor o postulante",
        scheduleLabel: "Inicio preferido",
        schedulePlaceholder: "Ejemplo: abril 2026",
        scheduleInputType: "text",
        quantityLabel: "Nivel o grado",
        quantityOptions: ["Inicial", "Primaria", "Secundaria", "Superior"],
        notesLabel: "Consulta adicional",
        notesPlaceholder: "Ejemplo: sede, edad del alumno, turno o modalidad...",
        selectionTitle: "Ruta elegida",
        detailLabel: "Modalidad",
        priceLabel: "Inversion",
        timelineLabel: "Inicio",
      };
    case "course":
      return {
        title: "Inscripcion y consulta por WhatsApp",
        description: `Habla con ${businessName} para ver temario, modalidad, certificacion y fechas de inicio.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Asesoria del curso",
        adminStatus: "En linea para ayudarte",
        actionVerb: "inscribirme",
        triggerChatLabel: "Pedir info",
        triggerChatHint: "Temario y horarios",
        triggerActionLabel: "Inscribirme",
        triggerActionHint: "Reserva tu cupo",
        tabChatLabel: "Chat",
        tabActionLabel: "Inscripcion",
        chatCtaLabel: "Hablar con asesoria",
        chatCtaHint: "Consulta temario y nivel",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Revisa fechas y precios",
        bookingCtaLabel: "Enviar inscripcion",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con temario, horarios, modalidad, certificado y medios de pago.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Como te llamas?",
        scheduleLabel: "Inicio preferido",
        schedulePlaceholder: "Ejemplo: proxima semana",
        scheduleInputType: "text",
        quantityLabel: "Nivel o modalidad",
        quantityOptions: ["Basico", "Intermedio", "Avanzado", "Corporativo"],
        notesLabel: "Meta o consulta",
        notesPlaceholder: "Ejemplo: deseo certificado, necesito horario nocturno...",
        selectionTitle: "Programa elegido",
        detailLabel: "Modalidad",
        priceLabel: "Inversion",
        timelineLabel: "Duracion",
      };
    case "maintenance":
      return {
        title: "Agenda soporte y mantenimiento",
        description: `Habla con ${businessName} para reportar una falla o coordinar una visita tecnica por WhatsApp.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Soporte tecnico",
        adminStatus: "Disponible para coordinar visitas",
        actionVerb: "agendar una visita tecnica",
        triggerChatLabel: "Reportar ahora",
        triggerChatHint: "Diagnostico rapido",
        triggerActionLabel: "Agendar visita",
        triggerActionHint: "Soporte tecnico",
        tabChatLabel: "Chat",
        tabActionLabel: "Visita",
        chatCtaLabel: "Hablar con soporte",
        chatCtaHint: "Describe la falla actual",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Consulta tiempos y cobertura",
        bookingCtaLabel: "Enviar solicitud",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con diagnostico, tiempos de visita, urgencias y planes preventivos.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Nombre de contacto",
        scheduleLabel: "Fecha o turno",
        schedulePlaceholder: "Ejemplo: manana en la tarde",
        scheduleInputType: "text",
        quantityLabel: "Urgencia",
        quantityOptions: ["Hoy", "24 horas", "Esta semana", "Plan programado"],
        notesLabel: "Detalle tecnico",
        notesPlaceholder: "Ejemplo: equipo, falla detectada, direccion o fotos disponibles...",
        selectionTitle: "Servicio elegido",
        detailLabel: "Tipo de atencion",
        priceLabel: "Costo",
        timelineLabel: "Tiempo",
      };
    case "construction":
      return {
        title: "Cotiza tu obra por WhatsApp",
        description: `Habla con ${businessName} para coordinar una visita tecnica y recibir una propuesta clara.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Asesoria de proyectos",
        adminStatus: "Disponible para evaluar tu proyecto",
        actionVerb: "solicitar una cotizacion",
        triggerChatLabel: "Cotizar ahora",
        triggerChatHint: "Proyecto y presupuesto",
        triggerActionLabel: "Solicitar visita",
        triggerActionHint: "Evaluacion tecnica",
        tabChatLabel: "Chat",
        tabActionLabel: "Cotizacion",
        chatCtaLabel: "Hablar con proyectos",
        chatCtaHint: "Cuadra alcance y tiempos",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Consulta presupuesto base",
        bookingCtaLabel: "Enviar solicitud",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con metrados, alcance, visita tecnica, cronograma y propuesta economica.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Nombre del contacto",
        scheduleLabel: "Fecha de visita",
        schedulePlaceholder: "Ejemplo: viernes 10 am",
        scheduleInputType: "text",
        quantityLabel: "Tipo de proyecto",
        quantityOptions: ["Remodelacion", "Obra nueva", "Acabados", "Supervision"],
        notesLabel: "Detalle del proyecto",
        notesPlaceholder: "Ejemplo: metros cuadrados, distrito, estado actual o plazo...",
        selectionTitle: "Ruta elegida",
        detailLabel: "Servicio",
        priceLabel: "Presupuesto",
        timelineLabel: "Plazo",
      };
    case "sales":
      return {
        title: "Habla con ventas por WhatsApp",
        description: `Habla con ${businessName} para resolver stock, precios, demos o una propuesta comercial.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Ventas consultivas",
        adminStatus: "En linea para cerrar rapido",
        actionVerb: "recibir una propuesta",
        triggerChatLabel: "Hablar ahora",
        triggerChatHint: "Stock y precios",
        triggerActionLabel: "Pedir propuesta",
        triggerActionHint: "Atencion comercial",
        tabChatLabel: "Chat",
        tabActionLabel: "Venta",
        chatCtaLabel: "Hablar con ventas",
        chatCtaHint: "Consulta producto o demo",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Recibe una propuesta",
        bookingCtaLabel: "Enviar interes",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con precios, stock, packs, propuestas y cierre comercial.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Como te llamas?",
        scheduleLabel: "Momento ideal",
        schedulePlaceholder: "Ejemplo: hoy por la tarde",
        scheduleInputType: "text",
        quantityLabel: "Volumen",
        quantityOptions: ["1 unidad", "2-5", "6-20", "Mayorista"],
        notesLabel: "Consulta comercial",
        notesPlaceholder: "Ejemplo: necesito demo, factura, stock o entrega...",
        selectionTitle: "Opcion elegida",
        detailLabel: "Categoria",
        priceLabel: "Precio",
        timelineLabel: "Entrega",
      };
    case "ecommerce":
      return {
        title: "Compra y coordina por WhatsApp",
        description: `Habla con ${businessName} para confirmar stock, pago, envio o un pedido personalizado.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Atencion ecommerce",
        adminStatus: "Disponible para confirmar tu compra",
        actionVerb: "comprar",
        triggerChatLabel: "Consultar ahora",
        triggerChatHint: "Stock y envio",
        triggerActionLabel: "Comprar ahora",
        triggerActionHint: "Pedido rapido",
        tabChatLabel: "Chat",
        tabActionLabel: "Compra",
        chatCtaLabel: "Hablar con tienda",
        chatCtaHint: "Consulta stock y medios de pago",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Coordina envio o recojo",
        bookingCtaLabel: "Enviar compra",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con stock, pago, delivery, cambios y pedidos especiales.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Como te llamas?",
        scheduleLabel: "Entrega estimada",
        schedulePlaceholder: "Ejemplo: esta semana",
        scheduleInputType: "text",
        quantityLabel: "Cantidad",
        quantityOptions: ["1", "2", "3", "4+"],
        notesLabel: "Detalle del pedido",
        notesPlaceholder: "Ejemplo: talla, color, direccion o metodo de pago...",
        selectionTitle: "Producto elegido",
        detailLabel: "Variante",
        priceLabel: "Precio",
        timelineLabel: "Envio",
      };
    case "service":
      return {
        title: "Solicita tu servicio por WhatsApp",
        description: `Habla con ${businessName} para explicar tu caso y recibir orientacion o una propuesta rapida.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Atencion de servicios",
        adminStatus: "En linea para evaluar tu caso",
        actionVerb: "solicitar el servicio",
        triggerChatLabel: "Hablar ahora",
        triggerChatHint: "Consulta inicial",
        triggerActionLabel: "Solicitar servicio",
        triggerActionHint: "Atencion guiada",
        tabChatLabel: "Chat",
        tabActionLabel: "Solicitud",
        chatCtaLabel: "Hablar con el equipo",
        chatCtaHint: "Cuadra alcance y tiempos",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Consulta precios y agenda",
        bookingCtaLabel: "Enviar solicitud",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con alcance, precios, tiempos, modalidad y disponibilidad.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Como te llamas?",
        scheduleLabel: "Fecha estimada",
        schedulePlaceholder: "Ejemplo: proxima semana",
        scheduleInputType: "text",
        quantityLabel: "Prioridad",
        quantityOptions: ["Baja", "Media", "Alta", "Urgente"],
        notesLabel: "Detalle del caso",
        notesPlaceholder: "Ejemplo: necesidad puntual, objetivo, plazo o ubicacion...",
        selectionTitle: "Servicio elegido",
        detailLabel: "Tipo de servicio",
        priceLabel: "Precio",
        timelineLabel: "Tiempo",
      };
    case "hotel":
    default:
      return {
        title: "Chat en vivo y reserva directa",
        description: `Habla con ${businessName} o envia una reserva ordenada por WhatsApp con el plan preseleccionado.`,
        adminLabel: `Equipo ${teamName}`,
        adminRole: "Administrador de reservas",
        adminStatus: "En linea para responder rapido",
        actionVerb: "reservar",
        triggerChatLabel: "Chatear ahora",
        triggerChatHint: "Chat y WhatsApp",
        triggerActionLabel: "Reservar",
        triggerActionHint: "Reserva directa",
        tabChatLabel: "Chat",
        tabActionLabel: "Reserva",
        chatCtaLabel: "Hablar con el admin",
        chatCtaHint: "Disponibilidad y ayuda rapida",
        directWhatsappLabel: "WhatsApp directo",
        directWhatsappHint: "Tarifas y habitaciones",
        bookingCtaLabel: "Confirmar y enviar",
        summaryLabel: "Respuesta sugerida",
        summaryText: "Te ayudamos con disponibilidad, habitaciones, horario de llegada y reserva directa.",
        formNameLabel: "Nombre",
        formNamePlaceholder: "Como te llamas?",
        scheduleLabel: "Fecha estimada",
        schedulePlaceholder: "",
        scheduleInputType: "date",
        quantityLabel: "Huespedes",
        quantityOptions: ["1", "2", "3", "4", "5+"],
        notesLabel: "Nota adicional",
        notesPlaceholder: "Ejemplo: llego temprano, deseo cama extra o viajo por trabajo...",
        selectionTitle: "Plan elegido",
        detailLabel: "Tipo de habitacion",
        priceLabel: "Precio",
        timelineLabel: "Duracion",
      };
  }
}

function getDefaultOptions(preset: BookingWidgetPreset, content: SiteContent) {
  const titles = getOfferTitles(content);
  const perks = getHighlights(content);

  switch (preset) {
    case "restaurant":
      return [
        buildOption("menu-ejecutivo", getTitleAt(titles, 0, "Menu ejecutivo"), "Consumo en salon o delivery", "S/ 39", "ticket promedio", "Hoy", "Pide una opcion rapida con entrega o atencion en mesa.", [perks[0], "Delivery", "Pago facil", "Promociones"], "\u{1F37D}", "Mas pedido", true),
        buildOption("combo-compartir", getTitleAt(titles, 1, "Combo para compartir"), "Mesa o recojo", "S/ 69", "combo", "45 min", "Ideal para pareja, familia corta o reunion casual.", [perks[1] || "Sabor destacado", "Bebida incluida", "Recojo rapido", "WhatsApp"], "\u{1F372}", "Grupo", false),
        buildOption("reserva-mesa", getTitleAt(titles, 2, "Reserva de mesa"), "Atencion en local", "S/ 0", "sin costo", "Horario a coordinar", "Agenda una mesa y coordina consumo o evento breve.", [perks[2] || "Mesa lista", "Confirmacion rapida", "Atencion directa", "Horarios"], "\u{1F374}", "Reserva", false),
      ];
    case "education":
      return [
        buildOption("matricula-general", getTitleAt(titles, 0, "Matricula abierta"), "Admision y orientacion", "Consultar", "cupos", "Inicio proximo", "Solicita vacante, costos y requisitos para el siguiente periodo.", [perks[0], "Orientacion", "Informacion clara", "Contacto directo"], "\u{1F393}", "Admision", true),
        buildOption("visita-guiada", getTitleAt(titles, 1, "Visita guiada"), "Recorrido o reunion informativa", "Consultar", "agendamiento", "Segun agenda", "Coordina una visita para conocer la propuesta educativa.", [perks[1] || "Campus", "Agenda flexible", "Asesoria", "WhatsApp"], "\u{1F3EB}", "Visita", false),
        buildOption("asesoria-academica", getTitleAt(titles, 2, "Asesoria academica"), "Programa y acompanamiento", "Consultar", "informacion", "Respuesta rapida", "Recibe apoyo para elegir el nivel o la sede adecuada.", [perks[2] || "Modalidades", "Horarios", "Costos", "Seguimiento"], "\u{1F4DA}", "Orientacion", false),
      ];
    case "course":
      return [
        buildOption("curso-intensivo", getTitleAt(titles, 0, "Curso intensivo"), "Modalidad principal", "S/ 249", "por programa", "4 semanas", "Inscribete en la version mas directa para avanzar rapido.", [perks[0], "Material incluido", "Clases guiadas", "Soporte"], "\u{1F4D8}", "Mas elegido", true),
        buildOption("programa-certificado", getTitleAt(titles, 1, "Programa certificado"), "Ruta completa", "S/ 490", "por programa", "8 semanas", "Opcion mas completa para certificarte y profundizar.", [perks[1] || "Certificado", "Mentoria", "Clases grabadas", "Comunidad"], "\u{1F4BB}", "Certificado", false),
        buildOption("clase-demo", getTitleAt(titles, 2, "Clase demo"), "Sesion introductoria", "S/ 0", "acceso", "1 clase", "Prueba la metodologia antes de inscribirte.", [perks[2] || "Demo", "Sin riesgo", "Explicacion clara", "Inscripcion facil"], "\u{1F3A5}", "Prueba", false),
      ];
    case "maintenance":
      return [
        buildOption("inspeccion-preventiva", getTitleAt(titles, 0, "Inspeccion preventiva"), "Revision inicial", "Consultar", "servicio", "24 a 48 horas", "Solicita diagnostico preventivo para evitar fallas mayores.", [perks[0], "Tecnico experto", "Agenda rapida", "Informe claro"], "\u{1F527}", "Preventivo", true),
        buildOption("visita-correctiva", getTitleAt(titles, 1, "Visita correctiva"), "Atencion puntual", "Consultar", "servicio", "Segun urgencia", "Coordina una visita para resolver una falla actual.", [perks[1] || "Respuesta rapida", "Cotizacion", "Atencion directa", "WhatsApp"], "\u{1F6E0}", "Urgente", false),
        buildOption("plan-programado", getTitleAt(titles, 2, "Plan de mantenimiento"), "Servicio recurrente", "Consultar", "plan", "Mensual", "Arma un plan recurrente para equipos, local o infraestructura.", [perks[2] || "Seguimiento", "Recordatorios", "Agenda fija", "Soporte"], "\u{1F4C5}", "Recurrente", false),
      ];
    case "construction":
      return [
        buildOption("visita-tecnica", getTitleAt(titles, 0, "Visita tecnica"), "Evaluacion inicial", "Consultar", "visita", "Segun agenda", "Agenda una visita para levantar requerimientos y alcance.", [perks[0], "Revision en sitio", "Diagnostico", "Asesoria"], "\u{1F3D7}", "Inicio", true),
        buildOption("cotizacion-obra", getTitleAt(titles, 1, "Cotizacion de obra"), "Presupuesto preliminar", "Consultar", "cotizacion", "3 a 5 dias", "Solicita una propuesta economica segun metraje o necesidad.", [perks[1] || "Presupuesto", "Cronograma", "Materiales", "WhatsApp"], "\u{1F4D0}", "Cotiza", false),
        buildOption("proyecto-llave", getTitleAt(titles, 2, "Proyecto llave en mano"), "Gestion integral", "Consultar", "proyecto", "Por etapas", "Coordina una solucion integral desde diseno hasta ejecucion.", [perks[2] || "Ejecucion", "Supervision", "Equipo tecnico", "Seguimiento"], "\u{1F3E2}", "Integral", false),
      ];
    case "sales":
      return [
        buildOption("producto-destacado", getTitleAt(titles, 0, "Producto destacado"), "Consulta comercial", "Consultar", "precio", "Entrega rapida", "Habla con ventas para recibir precio, stock y condiciones.", [perks[0], "Asesoria", "Stock", "WhatsApp"], "\u{1F4E6}", "Top", true),
        buildOption("pack-recomendado", getTitleAt(titles, 1, "Pack recomendado"), "Opcion combinada", "Consultar", "pack", "Segun disponibilidad", "Revisa la combinacion mas conveniente para comprar mejor.", [perks[1] || "Ahorro", "Recomendado", "Cotizacion", "Seguimiento"], "\u{1F381}", "Pack", false),
        buildOption("reunion-comercial", getTitleAt(titles, 2, "Reunion comercial"), "Llamada o reunion", "S/ 0", "agenda", "Hoy o manana", "Agenda una reunion corta para resolver dudas antes de comprar.", [perks[2] || "Demo", "Llamada", "Precios", "Cierre rapido"], "\u{1F4DE}", "Reunion", false),
      ];
    case "ecommerce":
      return [
        buildOption("compra-rapida", getTitleAt(titles, 0, "Compra rapida"), "Pedido directo", "Consultar", "item", "24 a 72 horas", "Haz tu pedido directo y coordina pago o envio por WhatsApp.", [perks[0], "Pago facil", "Envio", "Seguimiento"], "\u{1F6D2}", "Compra", true),
        buildOption("combo-ahorro", getTitleAt(titles, 1, "Combo ahorro"), "Pack de productos", "Consultar", "pack", "24 a 72 horas", "Aprovecha una combinacion con mejor ticket y mas valor.", [perks[1] || "Oferta", "Descuento", "Envio", "Stock"], "\u{1F381}", "Oferta", false),
        buildOption("pedido-personalizado", getTitleAt(titles, 2, "Pedido personalizado"), "Consulta especial", "Consultar", "pedido", "Segun stock", "Solicita una combinacion especial o variacion del producto.", [perks[2] || "Variante", "Atencion directa", "Confirmacion", "WhatsApp"], "\u{1F4E6}", "Personalizado", false),
      ];
    case "service":
      return [
        buildOption("diagnostico-inicial", getTitleAt(titles, 0, "Diagnostico inicial"), "Revision del caso", "Consultar", "sesion", "24 horas", "Explica tu necesidad y recibe una orientacion inicial.", [perks[0], "Respuesta clara", "Agenda rapida", "WhatsApp"], "\u{1F50E}", "Inicio", true),
        buildOption("servicio-principal", getTitleAt(titles, 1, "Servicio principal"), "Atencion puntual", "Consultar", "servicio", "Segun agenda", "Solicita el servicio principal con alcance y tiempos claros.", [perks[1] || "Proceso claro", "Costos", "Soporte", "Seguimiento"], "\u{1F4BC}", "Mas pedido", false),
        buildOption("plan-recurrente", getTitleAt(titles, 2, "Plan recurrente"), "Atencion continua", "Consultar", "plan", "Mensual", "Arma una solucion recurrente si necesitas continuidad.", [perks[2] || "Mensual", "Seguimiento", "Prioridad", "WhatsApp"], "\u{1F4CA}", "Continuo", false),
      ];
    case "hotel":
    default:
      return [
        buildOption("matrimonial-deluxe", getTitleAt(titles, 0, "Habitacion matrimonial"), getTitleAt(titles, 0, "Habitacion matrimonial"), "S/ 139", "por noche", "24 horas", "Ideal para pareja o descanso ejecutivo con desayuno incluido.", [perks[0], perks[1] || "Piscina", "WiFi", "Aire acondicionado"], "\u{1F6CF}\u{FE0F}", "Mas elegida", true),
        buildOption("doble-ejecutiva", getTitleAt(titles, 1, "Habitacion doble"), getTitleAt(titles, 1, "Habitacion doble"), "S/ 169", "por noche", "24 horas", "Comoda para amigos, familia pequena o viaje de trabajo.", [perks[0], "Dos camas", "Ducha moderna", "WiFi"], "\u{1F6CE}\u{FE0F}", "Trabajo o familia", false),
        buildOption("day-use-relax", getTitleAt(titles, 2, "Day use"), getTitleAt(titles, 2, "Day use"), "S/ 89", "por 6 horas", "6 horas", "Entrada corta para descansar, ducharte o esperar con comodidad.", [perks[1] || "Piscina", "Toallas", "WiFi", "Atencion rapida"], "\u{2600}\u{FE0F}", "Escapada corta", false),
      ];
  }
}

function normalizeOption(
  option: Partial<ResolvedBookingWidget["options"][number]> | undefined,
  fallback: ResolvedBookingWidget["options"][number],
) {
  return {
    id: pickText(option?.id, fallback.id),
    label: pickText(option?.label, fallback.label),
    roomType: pickText(option?.roomType, fallback.roomType),
    price: pickText(option?.price, fallback.price),
    rateLabel: pickText(option?.rateLabel, fallback.rateLabel),
    stayLabel: pickText(option?.stayLabel, fallback.stayLabel),
    summary: pickText(option?.summary, fallback.summary),
    perks: pickArray(option?.perks, fallback.perks),
    emoji: normalizeWidgetEmoji(option?.emoji, fallback.emoji || getPresetOptionEmoji("service")),
    badge: pickText(option?.badge, fallback.badge || ""),
    highlighted: Boolean(option?.highlighted ?? fallback.highlighted),
  };
}

export function getWidgetSystemEmoji(key: keyof typeof EMOJI_BY_KEY) {
  return EMOJI_BY_KEY[key];
}

export function getPresetOptionEmoji(preset: BookingWidgetPreset) {
  switch (preset) {
    case "hotel":
      return EMOJI_BY_KEY.hotel;
    case "restaurant":
      return EMOJI_BY_KEY.restaurant;
    case "education":
      return EMOJI_BY_KEY.education;
    case "course":
      return EMOJI_BY_KEY.course;
    case "maintenance":
      return EMOJI_BY_KEY.maintenance;
    case "construction":
      return EMOJI_BY_KEY.construction;
    case "sales":
      return EMOJI_BY_KEY.sales;
    case "ecommerce":
      return EMOJI_BY_KEY.ecommerce;
    case "service":
    default:
      return EMOJI_BY_KEY.spark;
  }
}

export function normalizeWidgetEmoji(value: unknown, fallback = EMOJI_BY_KEY.spark) {
  const rawValue = typeof value === "string" ? value.trim() : "";
  if (!rawValue) {
    return fallback;
  }

  const rawLower = rawValue.toLowerCase();

  const normalizedKey = rawValue
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w-]/g, "");

  const aliasMap: Record<string, string> = {
    room: EMOJI_BY_KEY.hotel,
    hotel: EMOJI_BY_KEY.hotel,
    bed: EMOJI_BY_KEY.hotel,
    travel: EMOJI_BY_KEY.travel,
    trip: EMOJI_BY_KEY.travel,
    bag: EMOJI_BY_KEY.travel,
    sun: EMOJI_BY_KEY.sun,
    dayuse: EMOJI_BY_KEY.sun,
    relax: EMOJI_BY_KEY.sun,
    restaurant: EMOJI_BY_KEY.restaurant,
    menu: EMOJI_BY_KEY.restaurant,
    food: EMOJI_BY_KEY.food,
    school: EMOJI_BY_KEY.education,
    education: EMOJI_BY_KEY.education,
    course: EMOJI_BY_KEY.course,
    study: EMOJI_BY_KEY.course,
    maintenance: EMOJI_BY_KEY.maintenance,
    repair: EMOJI_BY_KEY.maintenance,
    tool: EMOJI_BY_KEY.maintenance,
    construction: EMOJI_BY_KEY.construction,
    works: EMOJI_BY_KEY.construction,
    sales: EMOJI_BY_KEY.sales,
    box: EMOJI_BY_KEY.sales,
    ecommerce: EMOJI_BY_KEY.ecommerce,
    cart: EMOJI_BY_KEY.ecommerce,
    ok: EMOJI_BY_KEY.spark,
  };

  if (aliasMap[normalizedKey]) {
    return aliasMap[normalizedKey];
  }

  const mojibakeMap: Record<string, string> = {
    "ðÿœ¿": cp(0x1F33F),
    "ðÿ§³": EMOJI_BY_KEY.travel,
    "â˜ï¸": EMOJI_BY_KEY.sun,
    "â˜ï¸": EMOJI_BY_KEY.sun,
    "ðÿ’¬": EMOJI_BY_KEY.chat,
    "ðÿ“²": EMOJI_BY_KEY.whatsapp,
    "âœ…": cp(0x2705),
    "ã—": "x",
  };

  if (mojibakeMap[rawLower]) {
    return mojibakeMap[rawLower];
  }

  if (rawValue.includes("�") || rawValue.includes("ð") || rawValue.includes("â")) {
    return fallback;
  }

  return rawValue;
}

export function detectBookingWidgetPreset(profile?: Partial<ClientProfile> | null, content?: Partial<SiteContent> | null): BookingWidgetPreset {
  const source = [
    profile?.industry,
    profile?.projectType,
    profile?.businessName,
    profile?.folderName,
    content?.bookingWidget?.preset,
    content?.brand?.name,
    content?.brand?.headline,
    content?.brand?.description,
    ...(content?.services || []).flatMap((item) => [item.title, item.description]),
    ...(content?.products || []).flatMap((item) => [item.name, item.description]),
    ...(content?.pages || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(hotel|hostal|hostel|resort|hosped|habitacion|alojamiento|turismo|day use)/.test(source)) return "hotel";
  if (/(restaurante|restaurant|carta|delivery|menu|mesa|comida|cafeteria)/.test(source)) return "restaurant";
  if (/(curso|bootcamp|capacitacion|taller|certificacion|masterclass)/.test(source)) return "course";
  if (/(colegio|escuela|instituto|universidad|educacion|admis|vacante|academ)/.test(source)) return "education";
  if (/(mantenimiento|soporte tecnico|reparacion|preventivo|correctivo|falla)/.test(source)) return "maintenance";
  if (/(obra|obras|construccion|remodelacion|arquitect|ingenier|acabados|metros)/.test(source)) return "construction";
  if (/(ecommerce|tienda online|shop|carrito|checkout|envio)/.test(source)) return "ecommerce";
  if (/(ventas|comercial|distribucion|catalogo|proveedor|stock)/.test(source)) return "sales";
  if (/(servicio|consultoria|asesoria|agencia|estudio|legal|marketing|contable)/.test(source)) return "service";

  return "service";
}

export function buildBookingWidgetFromPreset(preset: BookingWidgetPreset, content: SiteContent): ResolvedBookingWidget {
  return {
    preset,
    ...getPresetCopy(preset, content),
    options: getDefaultOptions(preset, content),
  };
}

export function resolveBookingWidget(content: SiteContent, profile?: Partial<ClientProfile> | null): ResolvedBookingWidget {
  const preset = isPresetValue(content.bookingWidget?.preset) ? content.bookingWidget.preset : detectBookingWidgetPreset(profile, content);
  const defaults = buildBookingWidgetFromPreset(preset, content);
  const current = content.bookingWidget;

  return {
    preset,
    title: pickText(current?.title, defaults.title),
    description: pickText(current?.description, defaults.description),
    adminLabel: pickText(current?.adminLabel, defaults.adminLabel),
    adminRole: pickText(current?.adminRole, defaults.adminRole),
    adminStatus: pickText(current?.adminStatus, defaults.adminStatus),
    actionVerb: pickText(current?.actionVerb, defaults.actionVerb),
    triggerChatLabel: pickText(current?.triggerChatLabel, defaults.triggerChatLabel),
    triggerChatHint: pickText(current?.triggerChatHint, defaults.triggerChatHint),
    triggerActionLabel: pickText(current?.triggerActionLabel, defaults.triggerActionLabel),
    triggerActionHint: pickText(current?.triggerActionHint, defaults.triggerActionHint),
    tabChatLabel: pickText(current?.tabChatLabel, defaults.tabChatLabel),
    tabActionLabel: pickText(current?.tabActionLabel, defaults.tabActionLabel),
    chatCtaLabel: pickText(current?.chatCtaLabel, defaults.chatCtaLabel),
    chatCtaHint: pickText(current?.chatCtaHint, defaults.chatCtaHint),
    directWhatsappLabel: pickText(current?.directWhatsappLabel, defaults.directWhatsappLabel),
    directWhatsappHint: pickText(current?.directWhatsappHint, defaults.directWhatsappHint),
    bookingCtaLabel: pickText(current?.bookingCtaLabel, defaults.bookingCtaLabel),
    summaryLabel: pickText(current?.summaryLabel, defaults.summaryLabel),
    summaryText: pickText(current?.summaryText, defaults.summaryText),
    formNameLabel: pickText(current?.formNameLabel, defaults.formNameLabel),
    formNamePlaceholder: pickText(current?.formNamePlaceholder, defaults.formNamePlaceholder),
    scheduleLabel: pickText(current?.scheduleLabel, defaults.scheduleLabel),
    schedulePlaceholder: pickText(current?.schedulePlaceholder, defaults.schedulePlaceholder),
    scheduleInputType: current?.scheduleInputType === "date" || current?.scheduleInputType === "text" ? current.scheduleInputType : defaults.scheduleInputType,
    quantityLabel: pickText(current?.quantityLabel, defaults.quantityLabel),
    quantityOptions: pickArray(current?.quantityOptions, defaults.quantityOptions),
    notesLabel: pickText(current?.notesLabel, defaults.notesLabel),
    notesPlaceholder: pickText(current?.notesPlaceholder, defaults.notesPlaceholder),
    selectionTitle: pickText(current?.selectionTitle, defaults.selectionTitle),
    detailLabel: pickText(current?.detailLabel, defaults.detailLabel),
    priceLabel: pickText(current?.priceLabel, defaults.priceLabel),
    timelineLabel: pickText(current?.timelineLabel, defaults.timelineLabel),
    options: current?.options?.length
      ? current.options.map((option, index) => normalizeOption(option, defaults.options[index] || defaults.options[0]))
      : defaults.options,
  };
}
