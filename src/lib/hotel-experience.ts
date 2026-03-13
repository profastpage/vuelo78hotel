import type { SiteContent } from "@/types/site";

export type HotelLocale = "es" | "en";

export const HOTEL_LOCALE_STORAGE_KEY = "vuelo78hotel-locale";
export const HOTEL_WHATSAPP_PHONE_DISPLAY = "+51 903 011 285";
export const HOTEL_WHATSAPP_PHONE_DIGITS = "51903011285";

type HotelUiCopy = {
  sectionLinks: Array<{ label: string; href: string }>;
  header: {
    navAria: string;
    localeButton: string;
    localeAria: string;
    ctaSuffix: string;
    mobileWhatsapp: string;
    mobileMenuAria: string;
  };
  hero: {
    directKicker: string;
    subtitlePrefix: string;
    primaryCta: string;
    secondaryCta: string;
    bookingKicker: string;
    bookingDescription: string;
    benefits: string[];
  };
  experience: {
    chip: string;
    title: string;
    description: string;
  };
  rooms: {
    eyebrow: string;
    reserveNow: string;
    benefitsAriaPrefix: string;
    perNight: string;
  };
  testimonials: {
    eyebrow: string;
    verifiedGuest: string;
    starsLabel: string;
  };
  amenities: {
    title: string;
    listAria: string;
  };
  location: {
    title: string;
    cardTitle: string;
    mapTitle: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    reserveWhatsapp: string;
    googleMaps: string;
    supportPhoto: string;
    supportArrival: string;
  };
  bookingCta: {
    chip: string;
    button: string;
  };
  floating: {
    label: string;
    note: string;
    chip: string;
    title: string;
    description: string;
    close: string;
  };
  contact: {
    eyebrow: string;
    whatsappTitle: string;
    whatsappSubtitle: string;
    shellKicker: string;
    shellDescription: string;
    response: string;
    responseValue: string;
    responseDescription: string;
    directChannel: string;
    directValue: string;
    directDescription: string;
    estimatedTime: string;
    estimatedValue: string;
    format: string;
    formatValue: string;
    availability: string;
    availabilityValue: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    required: string;
    optional: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    note: string;
    success: string;
    error: string;
    validations: {
      name: string;
      email: string;
      message: string;
    };
  };
  subpage: {
    confirmAvailability: string;
    viewMap: string;
    moreInfo: string;
    beforeBooking: string;
    beforeBookingDescription: string;
    openDetail: string;
    infoChip: string;
    reserve: string;
    writeHotel: string;
    gallery: string;
    location: string;
    openMap: string;
    routeMaps: string;
    hotelPhoto: string;
    arrivalPhoto: string;
    direction: string;
    city: string;
    reception: string;
    mapFallback: string;
  };
  faq: {
    labelPrefix: string;
  };
  roomBadges: Record<string, string>;
};

type HotelWhatsappIntent =
  | "header"
  | "hero"
  | "location"
  | "booking-cta"
  | "room"
  | "contact"
  | "subpage"
  | "widget";

type HotelWhatsappParams = {
  locale: HotelLocale;
  hotelName: string;
  intent: HotelWhatsappIntent;
  sourceLabel: string;
  roomLabel?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  price?: string;
  rateLabel?: string;
  nights?: number;
  notes?: string;
};

export function resolveHotelLocale(value?: string | null): HotelLocale {
  return value === "en" ? "en" : "es";
}

export function toggleHotelLocale(locale: HotelLocale): HotelLocale {
  return locale === "es" ? "en" : "es";
}

export function t(locale: HotelLocale, es: string, en: string) {
  return locale === "en" ? en : es;
}

export function getHotelUi(locale: HotelLocale): HotelUiCopy {
  if (locale === "en") {
    return {
      sectionLinks: [
        { label: "Experience", href: "#experiencia" },
        { label: "Rooms", href: "#habitaciones" },
        { label: "Services", href: "#servicios" },
        { label: "Location", href: "#ubicacion" },
      ],
      header: {
        navAria: "Main sections",
        localeButton: "EN / ES",
        localeAria: "Switch language between English and Spanish",
        ctaSuffix: "via WhatsApp",
        mobileWhatsapp: "WhatsApp",
        mobileMenuAria: "Open menu",
      },
      hero: {
        directKicker: "Direct booking with no middlemen",
        subtitlePrefix: "Your retreat in",
        primaryCta: "Book via WhatsApp",
        secondaryCta: "View rooms",
        bookingKicker: "Direct booking",
        bookingDescription: "Check availability and get a direct reply from the hotel.",
        benefits: ["Breakfast included", "Free WiFi", "Air conditioning", "24h reception"],
      },
      experience: {
        chip: "Hotel experience",
        title: "Spaces designed for rest",
        description: "Pool, rooms and calm spaces presented with a cleaner editorial rhythm.",
      },
      rooms: {
        eyebrow: "Our rooms",
        reserveNow: "Book now",
        benefitsAriaPrefix: "Benefits for",
        perNight: "per night",
      },
      testimonials: {
        eyebrow: "Real reviews",
        verifiedGuest: "Verified guest",
        starsLabel: "stars",
      },
      amenities: {
        title: "Essential services",
        listAria: "Hotel services",
      },
      location: {
        title: "Location and arrival",
        cardTitle: "Location",
        mapTitle: "Location map",
        address: "Address",
        city: "City",
        phone: "Phone",
        email: "Email",
        reserveWhatsapp: "Book via WhatsApp",
        googleMaps: "Open route in Google Maps",
        supportPhoto: "Hotel photo",
        supportArrival: "Arrival and front entrance",
      },
      bookingCta: {
        chip: "Direct booking",
        button: "Book via WhatsApp",
      },
      floating: {
        label: "Reserve",
        note: "Availability and rates",
        chip: "Quick booking",
        title: "Confirm your stay",
        description: "Choose room, check-in, check-out and guests. WhatsApp will open with your summary ready.",
        close: "Close quick booking",
      },
      contact: {
        eyebrow: "Direct bookings",
        whatsappTitle: "Chat on WhatsApp",
        whatsappSubtitle: "Direct channel to confirm availability",
        shellKicker: "Booking request",
        shellDescription: "Share your dates and preferred room. The hotel replies with availability and rates.",
        response: "Response",
        responseValue: "Priority assistance",
        responseDescription: "Ideal to confirm rooms, rates and any special request before arrival.",
        directChannel: "Direct channel",
        directValue: "Book with no middlemen",
        directDescription: "Write on WhatsApp or leave your request to receive a clear reply from the hotel.",
        estimatedTime: "Estimated time",
        estimatedValue: "Under 30 min",
        format: "Format",
        formatValue: "Guided booking",
        availability: "Availability",
        availabilityValue: "Every day",
        name: "Name",
        email: "Email",
        phone: "Phone",
        message: "Message",
        required: "*",
        optional: "(optional)",
        namePlaceholder: "Your full name",
        emailPlaceholder: "Your email",
        phonePlaceholder: "Your phone number",
        messagePlaceholder: "Tell us your dates, room type and any important detail for your booking.",
        send: "Send inquiry",
        sending: "Sending...",
        note: "Recommended for availability, rates and personalized reservations.",
        success: "Message sent. We will reply shortly.",
        error: "Unexpected error. Please try again.",
        validations: {
          name: "Enter your full name (minimum 2 characters).",
          email: "Enter a valid email address.",
          message: "Your message must be at least 10 characters long.",
        },
      },
      subpage: {
        confirmAvailability: "Confirm availability",
        viewMap: "View map",
        moreInfo: "More information",
        beforeBooking: "Before booking",
        beforeBookingDescription: "Review schedules, policies and services with a cleaner summary.",
        openDetail: "Open detail",
        infoChip: "Information",
        reserve: "Book",
        writeHotel: "Write to the hotel",
        gallery: "Gallery",
        location: "Location",
        openMap: "Open map",
        routeMaps: "View in Google Maps",
        hotelPhoto: "Hotel photo",
        arrivalPhoto: "Arrival and hotel facade",
        direction: "Address",
        city: "City",
        reception: "Reception",
        mapFallback: "View in Google Maps",
      },
      faq: {
        labelPrefix: "FAQ",
      },
      roomBadges: {
        Principal: "Main",
        Superior: "Superior",
        Flexible: "Flexible",
        Familiar: "Family",
      },
    };
  }

  return {
    sectionLinks: [
      { label: "Experiencia", href: "#experiencia" },
      { label: "Habitaciones", href: "#habitaciones" },
      { label: "Servicios", href: "#servicios" },
      { label: "Ubicacion", href: "#ubicacion" },
    ],
    header: {
      navAria: "Secciones principales",
      localeButton: "EN / ES",
      localeAria: "Cambiar idioma entre ingles y espanol",
      ctaSuffix: "por WhatsApp",
      mobileWhatsapp: "WhatsApp",
      mobileMenuAria: "Abrir menu",
    },
    hero: {
      directKicker: "Reserva directa sin intermediarios",
      subtitlePrefix: "Tu refugio en",
      primaryCta: "Reservar por WhatsApp",
      secondaryCta: "Ver habitaciones",
      bookingKicker: "Reserva directa",
      bookingDescription: "Consulta disponibilidad y recibe respuesta directa del hotel.",
      benefits: ["Desayuno incluido", "WiFi gratis", "Aire acondicionado", "Recepcion 24h"],
    },
    experience: {
      chip: "Experiencia del hotel",
      title: "Espacios pensados para descansar",
      description: "Piscina, habitaciones y ambientes serenos presentados con una lectura mas limpia.",
    },
    rooms: {
      eyebrow: "Nuestras habitaciones",
      reserveNow: "Reservar ahora",
      benefitsAriaPrefix: "Beneficios de",
      perNight: "por noche",
    },
    testimonials: {
      eyebrow: "Opiniones reales",
      verifiedGuest: "Huesped verificado",
      starsLabel: "estrellas",
    },
    amenities: {
      title: "Servicios esenciales",
      listAria: "Servicios del hotel",
    },
    location: {
      title: "Ubicacion y llegada",
      cardTitle: "Ubicacion",
      mapTitle: "Mapa de ubicacion",
      address: "Direccion",
      city: "Ciudad",
      phone: "Telefono",
      email: "Email",
      reserveWhatsapp: "Reservar por WhatsApp",
      googleMaps: "Ver ruta en Google Maps",
      supportPhoto: "Foto del hotel",
      supportArrival: "Llegada y fachada del hotel",
    },
    bookingCta: {
      chip: "Reserva directa",
      button: "Reservar por WhatsApp",
    },
    floating: {
      label: "Reservar",
      note: "Disponibilidad y tarifas",
      chip: "Reserva rapida",
      title: "Confirma tu estadia",
      description: "Selecciona habitacion, fechas y huespedes. Al reservar se abrira WhatsApp con el resumen listo.",
      close: "Cerrar reserva rapida",
    },
    contact: {
      eyebrow: "Reservas directas",
      whatsappTitle: "Escribir por WhatsApp",
      whatsappSubtitle: "Canal directo para confirmar disponibilidad",
      shellKicker: "Consulta de reserva",
      shellDescription: "Comparte tus fechas y el tipo de habitacion que buscas. El hotel te responde con disponibilidad y tarifa.",
      response: "Respuesta",
      responseValue: "Atencion prioritaria",
      responseDescription: "Ideal para confirmar habitaciones, tarifas y cualquier solicitud especial antes de tu llegada.",
      directChannel: "Canal directo",
      directValue: "Reserva sin intermediarios",
      directDescription: "Escribe por WhatsApp o deja tu consulta para recibir una respuesta clara del hotel.",
      estimatedTime: "Tiempo estimado",
      estimatedValue: "Menos de 30 min",
      format: "Formato",
      formatValue: "Reserva guiada",
      availability: "Disponibilidad",
      availabilityValue: "Todos los dias",
      name: "Nombre",
      email: "Email",
      phone: "Telefono",
      message: "Mensaje",
      required: "*",
      optional: "(opcional)",
      namePlaceholder: "Tu nombre completo",
      emailPlaceholder: "Tu correo",
      phonePlaceholder: "Tu telefono",
      messagePlaceholder: "Indicanos tus fechas, tipo de habitacion y cualquier detalle importante para tu reserva.",
      send: "Enviar consulta",
      sending: "Enviando...",
      note: "Canal recomendado para consultas de disponibilidad, tarifas y reservas personalizadas.",
      success: "Mensaje enviado. Te responderemos a la brevedad.",
      error: "Error inesperado. Intenta nuevamente.",
      validations: {
        name: "Ingresa tu nombre completo (minimo 2 caracteres).",
        email: "Ingresa un correo electronico valido.",
        message: "El mensaje debe tener al menos 10 caracteres.",
      },
    },
    subpage: {
      confirmAvailability: "Confirmar disponibilidad",
      viewMap: "Ver mapa",
      moreInfo: "Mas informacion",
      beforeBooking: "Antes de reservar",
      beforeBookingDescription: "Resuelve horarios, condiciones y servicios con una lectura mas directa.",
      openDetail: "Abrir detalle",
      infoChip: "Informacion",
      reserve: "Reservar",
      writeHotel: "Escribir al hotel",
      gallery: "Galeria",
      location: "Ubicacion",
      openMap: "Abrir mapa",
      routeMaps: "Ver en Google Maps",
      hotelPhoto: "Foto del hotel",
      arrivalPhoto: "Llegada y fachada del hotel",
      direction: "Direccion",
      city: "Ciudad",
      reception: "Recepcion",
      mapFallback: "Ver en Google Maps",
    },
    faq: {
      labelPrefix: "FAQ",
    },
    roomBadges: {
      Principal: "Principal",
      Superior: "Superior",
      Flexible: "Flexible",
      Familiar: "Familiar",
    },
  };
}

export function localizeHotelContent(content: SiteContent, locale: HotelLocale): SiteContent {
  const withPhone: SiteContent = {
    ...content,
    brand: {
      ...content.brand,
      primaryCtaHref: "",
    },
    contact: {
      ...content.contact,
      whatsappNumber: HOTEL_WHATSAPP_PHONE_DISPLAY,
    },
  };

  if (locale === "es") {
    return withPhone;
  }

  const ui = getHotelUi(locale);

  return {
    ...withPhone,
    brand: {
      ...withPhone.brand,
      headline: "Rest with direct booking",
      description: "Stay near the airport with comfortable rooms, a pool and breakfast included.",
      subheadline: "Comfortable rooms, pool and 24-hour assistance.",
      primaryCtaLabel: "Reserve",
      secondaryCtaLabel: "View rooms",
      heroTag: "HOTEL IN TARAPOTO",
    },
    narrative: {
      title: "Direct booking and calm rest",
      body: "Rooms, services and a clear experience to book with more confidence.",
      goal: "Generate direct WhatsApp bookings and availability inquiries",
    },
    uiText: {
      ...withPhone.uiText,
      heroLabel: "Hotel and rest",
      supportLabel: "Featured rooms",
      proofLabel: "Real guests",
      storyChip: "Featured room",
      storyTitle: "Choose your ideal room",
      testimonialsChip: "Verified reviews",
      testimonialsTitle: "What our guests say",
      faqChip: "Frequently asked questions",
      faqTitle: "Before you book",
    },
    stats: [
      { label: "Destination", value: "Tarapoto" },
      { label: "Reception", value: "24 hours" },
      { label: "Booking", value: "Direct" },
    ],
    services: [
      {
        ...withPhone.services[0],
        title: "Main suite with natural view",
        description: "Spacious room with a comfortable bed, good lighting and a calm atmosphere for better rest.",
      },
      {
        ...withPhone.services[1],
        title: "Superior double room",
        description: "A comfortable option for couples or business travel, with practical space and reliable rest.",
      },
      {
        ...withPhone.services[2],
        title: "Flexible executive stay",
        description: "Ideal for a short stay, a practical arrival or one restful night before continuing your trip.",
      },
      {
        ...withPhone.services[3],
        title: "Hotel gallery and experience",
        description: "Hotel spaces to explore the pool, common areas and the overall stay atmosphere.",
      },
      {
        ...withPhone.services[4],
        title: "Direct booking and assistance",
        description: "Direct channel to check availability, dates and room type through WhatsApp.",
      },
    ],
    highlights: [
      "Clean and comfortable rooms for rest or a short stay.",
      "Reception available to support your arrival.",
      "Direct WhatsApp booking with a fast reply.",
      "Practical location near the airport and main access roads.",
      "A calm atmosphere for more confident rest.",
    ],
    testimonials: [
      {
        ...withPhone.testimonials[0],
        role: "2 weeks ago",
        quote: "Highlights the pool and the team's friendly service. Also mentions a calm atmosphere even during a short visit.",
        segment: "Pool and friendly service",
      },
      {
        ...withPhone.testimonials[1],
        role: "11 months ago",
        quote: "Recommends the hotel for its airport proximity, pickup service, distinctive pool, breakfast and attentive staff.",
        segment: "Airport, breakfast and pool",
      },
      {
        ...withPhone.testimonials[2],
        role: "8 months ago",
        quote: "Mentions spacious and very clean rooms, good service, tasty food and a safe location close to the airport.",
        segment: "Spacious rooms and safety",
      },
      {
        ...withPhone.testimonials[3],
        role: "8 months ago",
        quote: "Describes a comfortable family stay with a pool and A1 service supported by a very friendly team.",
        segment: "Family atmosphere and A1 service",
      },
    ],
    pages: ["Hotel", "Offers", "Experiences", "Rooms", "Services", "Restaurant", "Events", "Gallery", "Map"],
    galleryItems: [
      {
        ...withPhone.galleryItems?.[0],
        title: "Main suite with natural view",
        subtitle: "Vuelo 78 Hotel Tarapoto",
      },
      {
        ...withPhone.galleryItems?.[1],
        title: "Superior double room",
        subtitle: "Direct booking and premium stay",
      },
      {
        ...withPhone.galleryItems?.[2],
        title: "Flexible executive stay",
        subtitle: "Views and tropical calm",
      },
      {
        ...withPhone.galleryItems?.[3],
        title: "Hotel gallery and experience",
        subtitle: "Rooms and immediate rest",
      },
      {
        ...withPhone.galleryItems?.[4],
        title: "Direct booking and assistance",
        subtitle: "Fast support on WhatsApp",
      },
    ],
    contact: {
      ...withPhone.contact,
      title: "Confirm your dates and get booking assistance",
      description: "Share your dates, room type and number of guests. The hotel replies on WhatsApp with availability and direct rates.",
    },
    bookingWidget: withPhone.bookingWidget
      ? {
          ...withPhone.bookingWidget,
          title: "Direct booking and fast assistance",
          description: "Check availability, room type and arrival details from a simple bar designed for faster booking.",
          adminLabel: "Reservations team",
          adminRole: "Bookings and guest assistance",
          adminStatus: "Online for a fast reply",
          actionVerb: "book",
          triggerChatLabel: "Ask now",
          triggerChatHint: "Availability and rates",
          triggerActionLabel: "Reserve",
          triggerActionHint: "Direct booking",
          tabChatLabel: "Chat",
          tabActionLabel: "Booking",
          chatCtaLabel: "Talk to reservations",
          chatCtaHint: "Confirm room and arrival",
          directWhatsappLabel: "WhatsApp",
          directWhatsappHint: "Rates and details",
          bookingCtaLabel: "Reserve",
          summaryLabel: "Promo code",
          summaryText: "Optional",
          formNameLabel: "Name",
          formNamePlaceholder: "What is your name?",
          scheduleLabel: "Check-in",
          schedulePlaceholder: "Flexible",
          quantityLabel: "Guests",
          notesLabel: "Special request",
          notesPlaceholder: "Extra bed, early check-in, breakfast, transfer...",
          selectionTitle: "Room",
          detailLabel: "Room",
          priceLabel: "Rate",
          timelineLabel: "Check-out",
          options: withPhone.bookingWidget.options.map((option) => ({
            ...option,
            label:
              option.id === "suite-principal"
                ? "Main suite"
                : option.id === "habitacion-superior"
                  ? "Superior room"
                  : option.id === "escapada-corta"
                    ? "Flexible stay"
                    : "Family suite",
            roomType:
              option.id === "suite-principal"
                ? "Main suite"
                : option.id === "habitacion-superior"
                  ? "Superior room"
                  : option.id === "escapada-corta"
                    ? "Flexible stay"
                    : "Family suite",
            rateLabel: option.id === "escapada-corta" ? "per stay" : "per night",
            stayLabel:
              option.id === "escapada-corta"
                ? "6 hours"
                : option.id === "suite-familiar"
                  ? "2 nights"
                  : "1 night",
            summary:
              option.id === "suite-principal"
                ? "Spacious room, comfortable bed and an ideal option for peaceful rest."
                : option.id === "habitacion-superior"
                  ? "Designed for couples or business travel, with comfort and direct hotel support."
                  : option.id === "escapada-corta"
                    ? "Short-stay option to rest, wait for a flight or enjoy a few comfortable hours."
                    : "More space for family or small groups with an easy direct booking process.",
            perks:
              option.id === "suite-principal"
                ? ["Breakfast", "WiFi", "Air conditioning", "Direct booking"]
                : option.id === "habitacion-superior"
                  ? ["WiFi", "Private bathroom", "Fast assistance", "Late check-out subject to availability"]
                  : option.id === "escapada-corta"
                    ? ["WiFi", "Fast check-in", "Towels", "Direct assistance"]
                    : ["Breakfast", "WiFi", "Late check-out subject to availability", "Priority assistance"],
            badge: ui.roomBadges[option.badge || ""] || option.badge,
          })),
        }
      : withPhone.bookingWidget,
    location: {
      ...withPhone.location,
      address: withPhone.location?.address || "Tarapoto, Peru",
      city: "Tarapoto, San Martin, Peru",
      hours: "24-hour reception and one block from the airport",
    },
  };
}

export function buildHotelWhatsAppHref({
  locale,
  hotelName,
  intent,
  sourceLabel,
  roomLabel,
  checkIn = "",
  checkOut = "",
  guests,
  price,
  rateLabel,
  nights = 0,
  notes,
}: HotelWhatsappParams) {
  const resolvedHotelName = `*${hotelName.trim() || "Vuelo 78 Hotel"}*`;
  const cleanLines =
    locale === "en"
      ? [
          "Hello 👋",
          "",
          `I would like assistance from ${resolvedHotelName}.`,
          "",
          `✨ Selected CTA: ${sourceLabel}`,
          `🏨 Request type: ${getIntentLabel(intent, locale)}`,
          roomLabel ? `🛏️ Room: ${roomLabel}` : null,
          checkIn ? `📅 Check-in: ${formatHotelHumanDate(checkIn, locale)}` : null,
          checkOut ? `🌙 Check-out: ${formatHotelHumanDate(checkOut, locale)}` : null,
          typeof nights === "number" && nights > 0 ? `🛎️ Stay: ${nights} ${nights === 1 ? "night" : "nights"}` : null,
          guests ? `👥 Guests: ${guests}` : null,
          price ? `💵 Reference rate: ${price}${rateLabel ? ` ${rateLabel}` : ""}` : null,
          notes ? `📝 Special request: ${notes}` : null,
          "",
          "Thank you. I would appreciate help with availability, conditions and booking confirmation.",
        ]
      : [
          "Hola 👋",
          "",
          `Quiero recibir atencion de ${resolvedHotelName}.`,
          "",
          `✨ CTA seleccionado: ${sourceLabel}`,
          `🏨 Tipo de solicitud: ${getIntentLabel(intent, locale)}`,
          roomLabel ? `🛏️ Habitacion: ${roomLabel}` : null,
          checkIn ? `📅 Entrada: ${formatHotelHumanDate(checkIn, locale)}` : null,
          checkOut ? `🌙 Salida: ${formatHotelHumanDate(checkOut, locale)}` : null,
          typeof nights === "number" && nights > 0 ? `🛎️ Estadia: ${nights} ${nights === 1 ? "noche" : "noches"}` : null,
          guests ? `👥 Huespedes: ${guests}` : null,
          price ? `💵 Tarifa referencial: ${price}${rateLabel ? ` ${rateLabel}` : ""}` : null,
          notes ? `📝 Solicitud especial: ${notes}` : null,
          "",
          "Gracias. Agradecere su apoyo con disponibilidad, condiciones y confirmacion de la reserva.",
        ];

  return `https://wa.me/${HOTEL_WHATSAPP_PHONE_DIGITS}?text=${encodeURIComponent(cleanLines.filter(Boolean).join("\n"))}`;
  const lines =
    locale === "en"
      ? [
          "Hello 👋",
          "",
          `I would like to contact ${resolvedHotelName}.`,
          "",
          `✨ Selected CTA: ${sourceLabel}`,
          `🏨 Request type: ${getIntentLabel(intent, locale)}`,
          roomLabel ? `🛏️ Room: ${roomLabel}` : null,
          checkIn ? `📅 Check-in: ${formatHotelHumanDate(checkIn, locale)}` : null,
          checkOut ? `🌙 Check-out: ${formatHotelHumanDate(checkOut, locale)}` : null,
          typeof nights === "number" && nights > 0 ? `🛎️ Stay: ${nights} ${nights === 1 ? "night" : "nights"}` : null,
          guests ? `👥 Guests: ${guests}` : null,
          price ? `💵 Reference rate: ${price}${rateLabel ? ` ${rateLabel}` : ""}` : null,
          notes ? `📝 Special request: ${notes}` : null,
          "",
          "I would appreciate your help with availability, conditions and confirmation. Thank you.",
        ]
      : [
          "Hola 👋",
          "",
          `Quiero contactarme con ${resolvedHotelName}.`,
          "",
          `✨ CTA seleccionado: ${sourceLabel}`,
          `🏨 Tipo de solicitud: ${getIntentLabel(intent, locale)}`,
          roomLabel ? `🛏️ Habitacion: ${roomLabel}` : null,
          checkIn ? `📅 Entrada: ${formatHotelHumanDate(checkIn, locale)}` : null,
          checkOut ? `🌙 Salida: ${formatHotelHumanDate(checkOut, locale)}` : null,
          typeof nights === "number" && nights > 0 ? `🛎️ Estadia: ${nights} ${nights === 1 ? "noche" : "noches"}` : null,
          guests ? `👥 Huespedes: ${guests}` : null,
          price ? `💵 Tarifa referencial: ${price}${rateLabel ? ` ${rateLabel}` : ""}` : null,
          notes ? `📝 Solicitud especial: ${notes}` : null,
          "",
          "Agradecere su apoyo con disponibilidad, condiciones y confirmacion. Muchas gracias.",
        ];

  return `https://wa.me/${HOTEL_WHATSAPP_PHONE_DIGITS}?text=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
}

export function formatHotelHumanDate(value: string, locale: HotelLocale) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(locale === "en" ? "en-US" : "es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getIntentLabel(intent: HotelWhatsappIntent, locale: HotelLocale) {
  const labels: Record<HotelWhatsappIntent, { es: string; en: string }> = {
    header: { es: "Reserva directa desde el menu superior", en: "Direct booking from the top menu" },
    hero: { es: "Reserva directa desde el hero", en: "Direct booking from the hero" },
    location: { es: "Reserva y ubicacion", en: "Booking and location" },
    "booking-cta": { es: "Reserva desde el CTA final", en: "Booking from the final CTA" },
    room: { es: "Reserva de habitacion", en: "Room booking" },
    contact: { es: "Consulta directa desde la web", en: "Direct inquiry from the website" },
    subpage: { es: "Reserva desde pagina interna", en: "Booking from an internal page" },
    widget: { es: "Reserva guiada desde el widget", en: "Guided booking from the widget" },
  };

  return locale === "en" ? labels[intent].en : labels[intent].es;
}
