"use client";

import type { ClientProfile, SiteContent } from "@/types/site";
import { HotelFloatingCta } from "./HotelFloatingCta";
import { HotelPremiumAmenities } from "./HotelPremiumAmenities";
import { HotelPremiumBookingCta } from "./HotelPremiumBookingCta";
import { HotelPremiumExperienceGallery } from "./HotelPremiumExperienceGallery";
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
  { label: "Experiencia", href: "#experiencia" },
  { label: "Habitaciones", href: "#habitaciones" },
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
  const contactPhone = normalizeHotelPhone(content.contact.whatsappNumber || profile.brandConfig.whatsappNumber);
  const cityLabel = getCityLabel(content.location?.city);
  const displayBrandName = getDisplayBrandName(content.brand.name);
  const reservationHref = normalizeReservationHref(content.brand.primaryCtaHref, contactPhone, content.brand.name);
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
    { icon: "breakfast" as const, label: "Desayuno incluido" },
    { icon: "wifi" as const, label: "WiFi gratis" },
    { icon: "air" as const, label: "Aire acondicionado" },
    { icon: "reception" as const, label: "Recepcion 24h" },
  ];
  const experienceGalleryItems = buildExperienceGalleryItems(services, galleryItems, heroImage, heroImagePosition);
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
      subtitle: index === 0 ? "Vista de llegada al hotel" : item.subtitle,
      imageSrc: item.imageSrc,
      imagePosition: item.imagePosition,
    })),
  ].filter((item) => item.imageSrc);

  return (
    <>
      <div className="hotel-deluxe-shell">
        <HotelPremiumHeader
          bookingCtaLabel={bookingCtaLabel}
          brandName={displayBrandName}
          brandTag={content.brand.heroTag || "Hotel en Tarapoto"}
          pages={pages}
          reservationHref={reservationHref}
          sectionLinks={SECTION_LINKS}
        />

        <HotelPremiumHero
          benefits={benefits}
          bookingWidget={bookingWidget}
          brandName={displayBrandName}
          cityLabel={cityLabel}
          contactPhone={contactPhone}
          detailsHref={detailsHref}
          heroDescription={buildHeroDescription(content, cityLabel)}
          heroHeadline={content.brand.headline || "Bienvenido a Vuelo 78 Hotel"}
          heroTag={content.brand.heroTag || "Hotel en Tarapoto"}
          reservationHref={reservationHref}
          slides={heroSlides}
        />

        <HotelPremiumExperienceGallery items={experienceGalleryItems} />

        <HotelPremiumRoomsSection
          eyebrow="Nuestras habitaciones"
          rooms={roomCards}
          subtitle="Opciones comodas para pareja, familia o viaje de trabajo con reserva directa."
          title="Habitaciones disenadas para tu descanso"
        />

        {testimonials.length ? (
          <HotelPremiumTestimonials
            items={testimonials.map((item, index) => ({
              imagePosition: galleryItems[index + 1]?.imagePosition || services[index]?.imagePosition || heroImagePosition,
              imageSrc: galleryItems[index + 1]?.imageSrc || services[index]?.imageSrc || heroImage,
              name: item.name,
              quote: truncateText(item.quote, 132),
              role: item.role,
              segment: item.segment,
              rating: item.rating ?? 5,
            }))}
            subtitle="Opiniones breves sobre descanso, ubicacion y buena atencion."
            title="Lo que dicen nuestros huespedes"
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
            reservationHref={reservationHref}
          />
        ) : null}

        <HotelPremiumBookingCta
          description="Consulta disponibilidad y recibe confirmacion rapida por WhatsApp."
          href={reservationHref}
          title="Reserva directa por WhatsApp"
        />

        <HotelPremiumFooter
          address={content.location?.address || "Tarapoto, Peru"}
          brandName={displayBrandName}
          city={content.location?.city}
          email={content.contact.email}
          phone={contactPhone}
        />
      </div>

      <HotelFloatingCta
        bookingWidget={bookingWidget}
        brandName={displayBrandName}
        contactPhone={contactPhone}
        label="Reservar"
        note="Disponibilidad y tarifas"
      />
    </>
  );
}

function buildAmenities(content: SiteContent) {
  const baseItems = [
    { title: "Desayuno incluido", icon: "breakfast", description: "Empieza la maniana con mas comodidad antes de salir por la ciudad." },
    { title: "WiFi gratis", icon: "wifi", description: "Conexion estable para descansar, trabajar o coordinar tu viaje." },
    { title: "Piscina", icon: "pool", description: "Un espacio de descanso que acompana la experiencia del hotel." },
    { title: "Aire acondicionado", icon: "air", description: "Confort termico para descansar mejor en cualquier horario." },
    { title: "Atencion 24/7", icon: "hospitality", description: "Recepcion y asistencia para confirmar tu llegada con tranquilidad." },
  ];

  return baseItems.map((item, index) => ({
    ...item,
    description: content.highlights[index] || item.description,
  }));
}

function buildExperienceGalleryItems(
  services: SiteContent["services"],
  galleryItems: ReturnType<typeof getGalleryItems>,
  heroImage: string,
  heroImagePosition: SiteContent["brand"]["heroImagePosition"],
) {
  const candidates = [
    {
      title: "Piscina y descanso tropical",
      subtitle: "Piscina",
      imageSrc: galleryItems[2]?.imageSrc || services[1]?.imageSrc || heroImage,
      imagePosition: galleryItems[2]?.imagePosition || services[1]?.imagePosition || heroImagePosition,
    },
    {
      title: "Habitaciones listas para desconectar",
      subtitle: "Habitacion",
      imageSrc: services[0]?.imageSrc || galleryItems[1]?.imageSrc || heroImage,
      imagePosition: services[0]?.imagePosition || galleryItems[1]?.imagePosition || heroImagePosition,
    },
    {
      title: "Lobby y llegada con ambiente tranquilo",
      subtitle: "Lobby",
      imageSrc: heroImage || galleryItems[0]?.imageSrc,
      imagePosition: heroImagePosition || galleryItems[0]?.imagePosition,
    },
    {
      title: "Desayuno, servicio y momentos del hotel",
      subtitle: "Restaurante",
      imageSrc: galleryItems[3]?.imageSrc || services[2]?.imageSrc || heroImage,
      imagePosition: galleryItems[3]?.imagePosition || services[2]?.imagePosition || heroImagePosition,
    },
  ];

  return candidates.filter((item) => item.imageSrc);
}

function buildHeroDescription(content: SiteContent, cityLabel: string) {
  return content.brand.description || `Descansa en ${cityLabel} con habitaciones comodas y reserva directa por WhatsApp.`;
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

function getDisplayBrandName(value: string) {
  return value.replace(/\s+Tarapoto$/i, "").trim() || value;
}

function normalizeHotelPhone(value?: string) {
  const digits = value?.replace(/\D/g, "");
  if (!digits || digits === "51987654321") {
    return "+51979180559";
  }

  return value!;
}

function normalizeReservationHref(value: string | undefined, phone: string, brandName: string) {
  if (!value) {
    return buildReservationHref(phone, brandName);
  }

  if (/51987654321/.test(value)) {
    return buildReservationHref(phone, brandName);
  }

  return value;
}

function getRoomDescription(summary: string, fallback?: string) {
  const source = fallback || summary;
  const cleanSource = source.trim();

  if (cleanSource.length <= 120) {
    return cleanSource;
  }

  return `${cleanSource.slice(0, 117).trimEnd()}...`;
}

function truncateText(value: string, maxLength: number) {
  const cleanValue = value.trim();
  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, maxLength - 3).trimEnd()}...`;
}
