"use client";

import type { ClientProfile, SiteContent } from "@/types/site";
import { HotelFloatingCta } from "./HotelFloatingCta";
import { HotelPremiumAmenities } from "./HotelPremiumAmenities";
import { HotelPremiumBookingCta } from "./HotelPremiumBookingCta";
import { HotelPremiumFooter } from "./HotelPremiumFooter";
import { HotelPremiumHeader } from "./HotelPremiumHeader";
import { HotelPremiumHero } from "./HotelPremiumHero";
import { HotelPremiumRoomsSection } from "./HotelPremiumRoomsSection";
import { HotelPremiumTestimonials } from "./HotelPremiumTestimonials";
import { HotelReferenceSubpage } from "./HotelReferenceSubpage";
import { LocationBlock } from "./LocationBlock";
import type { HotelHeroSlide } from "./HotelHeroShowcase";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { getGalleryItems, getVisibleServices, getVisibleTestimonials } from "./rendering";
import { resolveBookingWidget } from "@/lib/booking-widget";
import { HOTEL_VISIBLE_NAV_ITEMS, normalizeHotelPageSlug } from "@/lib/hotel-pages";

type ReferenceCloneHotelEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  pageSlug?: string;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

const SECTION_LINKS = [
  { label: "Hotel", href: "#inicio" },
  { label: "Habitaciones", href: "#habitaciones" },
  { label: "Opiniones", href: "#opiniones" },
  { label: "Servicios", href: "#servicios" },
  { label: "Ubicacion", href: "#ubicacion" },
] as const;

export function ReferenceCloneHotelEngine({
  profile,
  content,
  pageSlug,
  editorMode = false,
  editorImageControls,
  editorTextControls,
}: ReferenceCloneHotelEngineProps) {
  const activePage = normalizeHotelPageSlug(pageSlug);
  const pages = HOTEL_VISIBLE_NAV_ITEMS;

  if (activePage !== "hotel") {
    return (
      <HotelReferenceSubpage
        content={content}
        editorImageControls={editorImageControls}
        editorMode={editorMode}
        editorTextControls={editorTextControls}
        pageSlug={activePage}
        profile={profile}
      />
    );
  }

  const galleryItems = getGalleryItems(content, profile.industry);
  const services = getVisibleServices(content);
  const testimonials = getVisibleTestimonials(content).slice(0, 3);
  const bookingWidget = resolveBookingWidget(content, profile);
  const bookingOptions = bookingWidget.options?.slice(0, 3) ?? [];
  const heroImage = content.brand.heroImageSrc || galleryItems[0]?.imageSrc || services[0]?.imageSrc || "";
  const heroImagePosition = content.brand.heroImagePosition || galleryItems[0]?.imagePosition || services[0]?.imagePosition;
  const heroSlides = buildHeroSlides(content, services, galleryItems, heroImage, heroImagePosition);
  const contactPhone = content.contact.whatsappNumber || profile.brandConfig.whatsappNumber;
  const cityLabel = getCityLabel(content.location?.city);
  const reservationHref = content.brand.primaryCtaHref || buildReservationHref(contactPhone, content.brand.name);
  const detailsHref = content.brand.secondaryCtaHref || "#habitaciones";
  const bookingCtaLabel = bookingWidget.bookingCtaLabel || content.brand.primaryCtaLabel || "Reservar";
  const roomCards = bookingOptions.map((option, index) => ({
    benefits: option.perks.slice(0, 3),
    description: getRoomDescription(option.summary, services[index]?.description),
    imagePosition: services[index]?.imagePosition || galleryItems[index]?.imagePosition || heroImagePosition,
    imageSrc: services[index]?.imageSrc || galleryItems[index]?.imageSrc || heroImage,
    price: option.price,
    rateLabel: option.rateLabel,
    reservationHref: buildReservationHref(contactPhone, content.brand.name, option.label),
    title: option.label,
  }));
  const benefits = [
    { label: "Desayuno incluido", value: "01" },
    { label: "WiFi gratis", value: "02" },
    { label: "Aire acondicionado", value: "03" },
    { label: "Recepcion 24h", value: "04" },
  ];
  const amenities = buildAmenities(content);
  const locationMedia = [
    {
      title: "Foto del hotel",
      subtitle: "Fachada y llegada principal",
      imageSrc: heroImage,
      imagePosition: heroImagePosition,
    },
    ...galleryItems.slice(0, 2).map((item, index) => ({
      title: index === 0 ? "Entorno y acceso" : item.title,
      subtitle: index === 0 ? "Referencia visual para reconocer la llegada" : item.subtitle,
      imageSrc: item.imageSrc,
      imagePosition: item.imagePosition,
    })),
  ].filter((item) => item.imageSrc);

  return (
    <>
      <div className="hotel-deluxe-shell">
        <HotelPremiumHeader
          bookingCtaLabel={bookingCtaLabel}
          brandName={content.brand.name}
          brandTag={content.brand.heroTag || "Hotel en Tarapoto"}
          pages={pages}
          reservationHref={reservationHref}
          sectionLinks={SECTION_LINKS}
        />

        <HotelPremiumHero
          benefits={benefits}
          bookingWidget={bookingWidget}
          brandName={content.brand.name}
          cityLabel={cityLabel}
          contactPhone={contactPhone}
          detailsHref={detailsHref}
          heroDescription={buildHeroDescription(content, cityLabel)}
          heroTag={content.brand.heroTag || "Hotel boutique en Tarapoto"}
          reservationHref={reservationHref}
          slides={heroSlides}
        />

        <HotelPremiumRoomsSection
          eyebrow="Nuestras habitaciones"
          rooms={roomCards}
          subtitle="Categorias claras, beneficios visibles y una ruta directa para consultar disponibilidad por WhatsApp."
          title="Habitaciones disenadas para descansar mejor y reservar sin friccion."
        />

        {testimonials.length ? (
          <HotelPremiumTestimonials
            items={testimonials.map((item) => ({
              name: item.name,
              quote: item.quote,
              role: item.role,
              segment: item.segment,
              rating: item.rating ?? 5,
            }))}
            subtitle="Solo tres resenas visibles, faciles de escanear y conectadas con confianza real."
            title="Lo que valoran los huespedes despues de su estancia."
          />
        ) : null}

        <HotelPremiumAmenities items={amenities} />

        {content.location?.address ? (
          <LocationBlock
            contactEmail={content.contact.email}
            contactPhone={content.contact.whatsappNumber}
            editorMode={editorMode}
            editorTextControls={editorTextControls}
            location={content.location}
            mediaItems={locationMedia}
          />
        ) : null}

        <HotelPremiumBookingCta
          description="Consulta disponibilidad, tarifas y tipo de habitacion. El equipo responde rapido y te ayuda a cerrar tu reserva sin intermediarios."
          href={reservationHref}
          title="Reserva directa por WhatsApp y recibe respuesta clara en minutos."
        />

        <HotelPremiumFooter
          address={content.location?.address || "Tarapoto, Peru"}
          brandName={content.brand.name}
          city={content.location?.city}
          email={content.contact.email}
          phone={content.contact.whatsappNumber}
        />
      </div>

      <HotelFloatingCta href={reservationHref} label="Consultar ahora" note="Disponibilidad y tarifas" />
    </>
  );
}

function buildAmenities(content: SiteContent) {
  const baseItems = [
    { title: "Desayuno buffet", icon: "☕", description: "Empieza el dia con una estancia mas comoda y una salida mas simple." },
    { title: "WiFi gratis", icon: "Wi", description: "Conexion estable para descanso, trabajo o coordinacion de viaje." },
    { title: "Piscina", icon: "✦", description: "Un diferencial visual del hotel que acompana la experiencia premium." },
    { title: "Aire acondicionado", icon: "AC", description: "Confort termico para descansar mejor en cualquier horario." },
    { title: "Traslado aeropuerto", icon: "✈", description: "Cercania y apoyo de llegada para una reserva mas confiable." },
  ];

  return baseItems.map((item, index) => ({
    ...item,
    description: content.highlights[index] || item.description,
  }));
}

function buildHeroDescription(content: SiteContent, cityLabel: string) {
  const base = content.brand.description || content.narrative.body;
  return `Reserva directa sin intermediarios en ${cityLabel}. ${base}`;
}

function buildHeroSlides(
  content: SiteContent,
  services: SiteContent["services"],
  galleryItems: ReturnType<typeof getGalleryItems>,
  heroImage: string,
  heroImagePosition: SiteContent["brand"]["heroImagePosition"],
): HotelHeroSlide[] {
  const candidates: HotelHeroSlide[] = [
    {
      title: content.brand.name,
      subtitle: content.brand.description,
      imageSrc: heroImage,
      imagePosition: heroImagePosition,
    },
    ...galleryItems.map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
      imageSrc: item.imageSrc || "",
      imagePosition: item.imagePosition,
    })),
    ...services.map((service) => ({
      title: service.title,
      subtitle: service.description,
      imageSrc: service.imageSrc || "",
      imagePosition: service.imagePosition,
    })),
  ].filter((item) => Boolean(item.imageSrc));

  return Array.from(new Map(candidates.map((item) => [item.imageSrc, item])).values()).slice(0, 4);
}

function buildReservationHref(phone: string, brandName: string, roomLabel?: string) {
  const cleanPhone = String(phone || "").replace(/[^\d]/g, "");
  if (!cleanPhone) {
    return "#cta-final";
  }

  const lines = [
    `Hola, quiero reservar en ${brandName}.`,
    roomLabel ? `Me interesa la habitacion ${roomLabel}.` : "Quiero confirmar disponibilidad y tarifas.",
    "Quedo atento a opciones por WhatsApp.",
  ];

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function getCityLabel(value?: string) {
  return (value || "Tarapoto").split(",")[0]?.trim() || "Tarapoto";
}

function getRoomDescription(summary: string, fallback?: string) {
  const source = fallback || summary;
  const cleanSource = source.trim();

  if (cleanSource.length <= 120) {
    return cleanSource;
  }

  return `${cleanSource.slice(0, 117).trimEnd()}...`;
}
