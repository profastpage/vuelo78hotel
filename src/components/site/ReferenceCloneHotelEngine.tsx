"use client";

import { useEffect, useState } from "react";
import type { ClientProfile, SiteContent } from "@/types/site";
import { HotelFloatingCta } from "./HotelFloatingCta";
import { HotelPremiumAmenities } from "./HotelPremiumAmenities";
import { HotelPremiumExperienceGallery } from "./HotelPremiumExperienceGallery";
import { HotelPremiumFooter } from "./HotelPremiumFooter";
import { HotelPremiumHeader } from "./HotelPremiumHeader";
import { HotelPremiumHero } from "./HotelPremiumHero";
import { HotelPremiumTestimonials } from "./HotelPremiumTestimonials";
import { HotelPaymentMethodsSection } from "./HotelPaymentMethodsSection";
import { HotelReferenceSubpage } from "./HotelReferenceSubpage";
import { HotelRoomGallerySection } from "./HotelRoomGallerySection";
import { HotelSocialLinksSection } from "./HotelSocialLinksSection";
import { HotelTourPackagesSection } from "./HotelTourPackagesSection";
import { LocationBlock } from "./LocationBlock";
import type { HotelHeroSlide } from "./HotelHeroShowcase";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { getGalleryItems, getVisibleServices, getVisibleTestimonials } from "./rendering";
import { resolveBookingWidget } from "@/lib/booking-widget";
import {
  HOTEL_LOCALE_STORAGE_KEY,
  HOTEL_WHATSAPP_PHONE_DISPLAY,
  buildHotelWhatsAppHrefV2,
  getHotelUi,
  localizeHotelContent,
  resolveHotelLocale,
  t,
  toggleHotelLocale,
  type HotelLocale,
} from "@/lib/hotel-experience";
import { HOTEL_VISIBLE_NAV_ITEMS, normalizeHotelPageSlug } from "@/lib/hotel-pages";
import { getHotelExperienceGallery } from "@/lib/hotel-experience-gallery";
import { getHotelRoomGallery, type HotelRoomGalleryEntry } from "@/lib/hotel-room-gallery";

type ReferenceCloneHotelEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  pageSlug?: string;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

export function ReferenceCloneHotelEngine({
  profile,
  content,
  pageSlug,
  editorMode = false,
  editorImageControls,
  editorTextControls,
}: ReferenceCloneHotelEngineProps) {
  const [locale, setLocale] = useState<HotelLocale>(() => {
    if (typeof window === "undefined") {
      return "es";
    }

    return resolveHotelLocale(window.localStorage.getItem(HOTEL_LOCALE_STORAGE_KEY));
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(HOTEL_LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "en" ? "en" : "es";
  }, [locale]);

  const activePage = normalizeHotelPageSlug(pageSlug);
  const localizedContent = localizeHotelContent(content, locale);
  const ui = getHotelUi(locale);
  const pages = HOTEL_VISIBLE_NAV_ITEMS;
  const curatedRooms = getHotelRoomGallery(locale);
  const bookingWidget = syncBookingWidgetWithRooms(resolveBookingWidget(localizedContent, profile), curatedRooms, locale);
  const [selectedBookingRoomId, setSelectedBookingRoomId] = useState(bookingWidget.options[0]?.id || "");
  const [isFloatingBookingOpen, setIsFloatingBookingOpen] = useState(false);

  useEffect(() => {
    if (!selectedBookingRoomId && bookingWidget.options[0]?.id) {
      setSelectedBookingRoomId(bookingWidget.options[0].id);
      return;
    }

    if (selectedBookingRoomId && bookingWidget.options.some((option) => option.id === selectedBookingRoomId)) {
      return;
    }

    setSelectedBookingRoomId(bookingWidget.options[0]?.id || "");
  }, [bookingWidget.options, selectedBookingRoomId]);

  useEffect(() => {
    if (typeof window === "undefined" || activePage !== "hotel") {
      return;
    }

    const nextUrl = `${window.location.pathname}${window.location.search}`;
    if (window.location.hash) {
      window.history.replaceState(null, "", nextUrl);
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [activePage]);

  if (activePage !== "hotel") {
    return (
      <HotelReferenceSubpage
        content={localizedContent}
        editorImageControls={editorImageControls}
        editorMode={editorMode}
        editorTextControls={editorTextControls}
        locale={locale}
        onLocaleToggle={() => setLocale((current) => toggleHotelLocale(current))}
        pageSlug={activePage}
        profile={profile}
      />
    );
  }

  const galleryItems = getGalleryItems(localizedContent, profile.industry);
  const services = getVisibleServices(localizedContent);
  const testimonials = getVisibleTestimonials(localizedContent).slice(0, 3);
  const curatedHeroSlides = buildCuratedHeroSlides(localizedContent);
  const heroImage =
    curatedHeroSlides[0]?.imageSrc || localizedContent.brand.heroImageSrc || galleryItems[0]?.imageSrc || services[0]?.imageSrc || "";
  const heroImagePosition =
    curatedHeroSlides[0]?.imagePosition ||
    localizedContent.brand.heroImagePosition ||
    galleryItems[0]?.imagePosition ||
    services[0]?.imagePosition;
  const heroSlides =
    curatedHeroSlides.length > 0
      ? curatedHeroSlides
      : buildHeroSlides(localizedContent, services, galleryItems, heroImage, heroImagePosition);
  const contactPhone = normalizeHotelPhone(localizedContent.contact.whatsappNumber || profile.brandConfig.whatsappNumber);
  const cityLabel = getCityLabel(localizedContent.location?.city);
  const displayBrandName = getDisplayBrandName(localizedContent.brand.name);
  const detailsHref = localizedContent.brand.secondaryCtaHref || "#habitaciones";
  const bookingCtaLabel = bookingWidget.bookingCtaLabel || localizedContent.brand.primaryCtaLabel || ui.floating.label;
  const headerReservationHref = buildHotelWhatsAppHrefV2({
    locale,
    hotelName: displayBrandName,
    intent: "header",
    sourceLabel: locale === "en" ? "Top menu" : "Menu superior",
  });
  const heroReservationHref = buildHotelWhatsAppHrefV2({
    locale,
    hotelName: displayBrandName,
    intent: "hero",
    sourceLabel: locale === "en" ? "Hero main CTA" : "Hero principal",
  });
  const locationReservationHref = buildHotelWhatsAppHrefV2({
    locale,
    hotelName: displayBrandName,
    intent: "location",
    sourceLabel: ui.location.title,
  });
  const curatedRoomsWithLinks = curatedRooms.map((room) => ({
    ...room,
    reservationHref: buildHotelWhatsAppHrefV2({
      locale,
      hotelName: displayBrandName,
      intent: "room",
      sourceLabel: room.title,
      roomLabel: room.title,
    }),
  }));
  const benefitIcons: Array<"breakfast" | "wifi" | "pool" | "air" | "workspace" | "parking" | "dining" | "restobar" | "reception"> = [
    "breakfast",
    "wifi",
    "pool",
    "air",
    "workspace",
    "parking",
    "dining",
    "restobar",
    "reception",
  ];
  const benefits = ui.hero.benefits.map((label, index) => ({
    icon: benefitIcons[index] || "reception",
    label,
  }));
  const experienceGalleryItems = getHotelExperienceGallery(locale);
  const amenities = buildAmenities(localizedContent);
  const locationMedia = [
    {
      title: ui.location.supportPhoto,
      subtitle: ui.location.supportArrival,
      imageSrc: heroImage,
      imagePosition: heroImagePosition,
    },
    ...galleryItems.slice(0, 2).map((item, index) => ({
      title: index === 0 ? t(locale, "Entorno y acceso", "Surroundings and access") : item.title,
      subtitle: index === 0 ? t(locale, "Vista de llegada al hotel", "Arrival view of the hotel") : item.subtitle,
      imageSrc: item.imageSrc,
      imagePosition: item.imagePosition,
    })),
  ].filter((item) => item.imageSrc);

  const focusRoomFromWidget = (roomId: string) => {
    setSelectedBookingRoomId(roomId);

    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      const roomSection = document.getElementById(roomId);
      if (!roomSection) {
        return;
      }

      const headerOffset = window.matchMedia("(max-width: 860px)").matches ? 92 : 104;
      const targetTop = roomSection.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
    });
  };

  const handleReserveRoom = (room: HotelRoomGalleryEntry) => {
    setSelectedBookingRoomId(room.slug);
    setIsFloatingBookingOpen(true);
  };

  return (
    <>
      <div className="hotel-deluxe-shell">
        <HotelPremiumHeader
          bookingCtaLabel={bookingCtaLabel}
          brandName={displayBrandName}
          brandTag={localizedContent.brand.heroTag || t(locale, "Hotel en Tarapoto", "Hotel in Tarapoto")}
          locale={locale}
          onLocaleToggle={() => setLocale((current) => toggleHotelLocale(current))}
          pages={pages}
          reservationHref={headerReservationHref}
          sectionLinks={ui.sectionLinks}
        />

        <HotelPremiumHero
          benefits={benefits}
          bookingWidget={bookingWidget}
          brandName={displayBrandName}
          contactPhone={contactPhone}
          detailsHref={detailsHref}
          heroDescription={buildHeroDescription(localizedContent, cityLabel)}
          heroHeadline={localizedContent.brand.headline || t(locale, "Bienvenido a Vuelo 78 Hotel", "Welcome to Vuelo 78 Hotel")}
          heroTag={localizedContent.brand.heroTag || t(locale, "Hotel en Tarapoto", "Hotel in Tarapoto")}
          locale={locale}
          reservationHref={heroReservationHref}
          slides={heroSlides}
        />

        <HotelPremiumExperienceGallery items={experienceGalleryItems} locale={locale} />

        <HotelRoomGallerySection
          eyebrow={ui.rooms.eyebrow}
          locale={locale}
          onReserveRoom={handleReserveRoom}
          rooms={curatedRoomsWithLinks}
          sectionId="habitaciones"
          summary={t(
            locale,
            "Espacios cómodos, tranquilos y pensados para una estancia placentera.",
            "Comfortable, calm spaces designed for a pleasant stay.",
          )}
          title={t(
            locale,
            "Habitaciones diseñadas para descansar",
            "Rooms designed for rest",
          )}
        />

        <HotelTourPackagesSection hotelName={displayBrandName} locale={locale} />

        {testimonials.length ? (
          <HotelPremiumTestimonials
            items={testimonials.map((item, index) => ({
              imageSrc: item.avatarSrc || galleryItems[index + 1]?.imageSrc || services[index]?.imageSrc || heroImage,
              location: item.location,
              name: item.name,
              quote: item.quote,
              role: item.role,
              segment: item.segment,
              rating: item.rating ?? 5,
            }))}
            locale={locale}
            subtitle={t(
              locale,
              "Opiniones breves sobre descanso, ubicacion y buena atencion.",
              "Short reviews about rest, location and attentive service.",
            )}
            title={t(locale, "Lo que dicen nuestros huespedes", "What our guests say")}
          />
        ) : null}

        <HotelPremiumAmenities items={amenities} locale={locale} />

        {localizedContent.location?.address ? (
          <LocationBlock
            contactEmail={localizedContent.contact.email}
            contactPhone={contactPhone}
            editorMode={editorMode}
            editorTextControls={editorTextControls}
            locale={locale}
            location={localizedContent.location}
            mediaItems={locationMedia}
            reservationHref={locationReservationHref}
          />
        ) : null}

        <HotelSocialLinksSection locale={locale} />
        <HotelPaymentMethodsSection locale={locale} />

        <HotelPremiumFooter
          address={localizedContent.location?.address || "Tarapoto, Peru"}
          brandName={displayBrandName}
          city={localizedContent.location?.city}
          email={localizedContent.contact.email}
          phone={contactPhone}
        />
      </div>

      <HotelFloatingCta
        bookingWidget={bookingWidget}
        brandName={displayBrandName}
        contactPhone={contactPhone}
        isOpen={isFloatingBookingOpen}
        label={ui.floating.label}
        locale={locale}
        note={ui.floating.note}
        onOpenChange={setIsFloatingBookingOpen}
        onSelectedRoomChange={focusRoomFromWidget}
        selectedRoomId={selectedBookingRoomId}
      />
    </>
  );
}

function buildAmenities(content: SiteContent) {
  const baseItems = [
    { title: "Desayuno incluido", icon: "breakfast", description: "Empieza la manana con mas comodidad antes de salir por la ciudad." },
    { title: "WiFi gratis", icon: "wifi", description: "Conexion estable para descansar, trabajar o coordinar tu viaje." },
    { title: "Piscina", icon: "pool", description: "Un espacio de descanso que acompana la experiencia del hotel." },
    { title: "Aire acondicionado", icon: "air", description: "Confort termico para descansar mejor en cualquier horario." },
    { title: "Zona de trabajo", icon: "workspace", description: "Un punto comodo para revisar pendientes o planificar el dia." },
    { title: "Estacionamiento privado", icon: "parking", description: "Acceso seguro para dejar tu vehiculo durante toda tu estancia." },
    { title: "Comedor", icon: "dining", description: "Espacio practico para disfrutar cada comida dentro del hotel." },
    { title: "Restobar", icon: "restobar", description: "Bebidas y momentos de pausa con una atmosfera mas relajada." },
    { title: "Recepcion 24h", icon: "reception", description: "Asistencia continua para llegadas, consultas y apoyo en cualquier momento." },
  ];

  return baseItems.map((item, index) => ({
    ...item,
    description: content.highlights[index] || item.description,
  }));
}

function buildHeroDescription(content: SiteContent, cityLabel: string) {
  return content.brand.description || `Descansa en ${cityLabel} con habitaciones comodas y reserva directa por WhatsApp.`;
}

function syncBookingWidgetWithRooms(
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>,
  rooms: HotelRoomGalleryEntry[],
  locale: HotelLocale,
): NonNullable<SiteContent["bookingWidget"]> {
  const fallbackRateLabel = locale === "en" ? "per night" : "por noche";
  const fallbackStayLabel = locale === "en" ? "Flexible stay" : "Estadia flexible";
  const fallbackPrice = locale === "en" ? "Direct rate" : "Tarifa directa";
  const fallbackBadge = locale === "en" ? "Selected room" : "Habitacion elegida";

  return {
    ...bookingWidget,
    options: rooms.map((room, index) => ({
      id: room.slug,
      label: room.title,
      roomType: room.title,
      price: room.details.price || fallbackPrice,
      rateLabel: fallbackRateLabel,
      stayLabel: fallbackStayLabel,
      summary: room.summary,
      perks: room.details.features.slice(0, 4),
      badge: room.signatureWords[0] || fallbackBadge,
      highlighted: index === 0,
    })),
  };
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

function buildCuratedHeroSlides(content: SiteContent): HotelHeroSlide[] {
  const fallbackDescription = content.brand.description;

  return [
    {
      title: "Lobby principal",
      subtitle: "Llegada serena con una lectura limpia del hotel",
      imageSrc: "/assets/hero/hero-premium-1.webp",
      fallbackSrc: "/assets/hero/hero-premium-1.jpg",
      mobileImageSrc: "/assets/hero/hero-premium-1-mobile.webp",
      mobileFallbackSrc: "/assets/hero/hero-premium-1-mobile.jpg",
      imagePosition: { x: 52, y: 50 },
      mobileImagePosition: { x: 56, y: 44 },
    },
    {
      title: "Habitacion principal",
      subtitle: "Descanso comodo con una lectura clara del espacio",
      imageSrc: "/assets/hero/hero-premium-2.webp",
      fallbackSrc: "/assets/hero/hero-premium-2.jpg",
      mobileImageSrc: "/assets/hero/hero-premium-2-mobile.webp",
      mobileFallbackSrc: "/assets/hero/hero-premium-2-mobile.jpg",
      imagePosition: { x: 56, y: 48 },
      mobileImagePosition: { x: 68, y: 48 },
    },
    {
      title: "Piscina",
      subtitle: "Un momento de pausa con color y frescura",
      imageSrc: "/assets/hero/hero-premium-3.webp",
      fallbackSrc: "/assets/hero/hero-premium-3.jpg",
      mobileImageSrc: "/assets/hero/hero-premium-3-mobile.webp",
      mobileFallbackSrc: "/assets/hero/hero-premium-3-mobile.jpg",
      imagePosition: { x: 38, y: 42 },
      mobileImagePosition: { x: 50, y: 42 },
    },
    {
      title: content.brand.name,
      subtitle: fallbackDescription,
      imageSrc: "/assets/hero/hero-premium-4.webp",
      fallbackSrc: "/assets/hero/hero-premium-4.jpg",
      mobileImageSrc: "/assets/hero/hero-premium-4-mobile.webp",
      mobileFallbackSrc: "/assets/hero/hero-premium-4-mobile.jpg",
      imagePosition: { x: 56, y: 44 },
      mobileImagePosition: { x: 68, y: 42 },
    },
  ];
}

function getCityLabel(value?: string) {
  return (value || "Tarapoto").split(",")[0]?.trim() || "Tarapoto";
}

function getDisplayBrandName(value: string) {
  return value.replace(/\s+Tarapoto$/i, "").trim() || value;
}

function normalizeHotelPhone(value?: string) {
  void value;
  return HOTEL_WHATSAPP_PHONE_DISPLAY;
}

function truncateText(value: string, maxLength: number) {
  const cleanValue = value.trim();
  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, maxLength - 3).trimEnd()}...`;
}
