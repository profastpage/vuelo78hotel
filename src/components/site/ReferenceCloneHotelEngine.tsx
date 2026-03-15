"use client";

import { useEffect, useState } from "react";
import type { ClientProfile, SiteContent } from "@/types/site";
import { HotelFloatingCta } from "./HotelFloatingCta";
import { HotelPremiumAmenities } from "./HotelPremiumAmenities";
import { HotelPremiumBookingCta } from "./HotelPremiumBookingCta";
import { HotelPremiumExperienceGallery } from "./HotelPremiumExperienceGallery";
import { HotelPremiumFooter } from "./HotelPremiumFooter";
import { HotelPremiumHeader } from "./HotelPremiumHeader";
import { HotelPremiumHero } from "./HotelPremiumHero";
import { HotelPremiumTestimonials } from "./HotelPremiumTestimonials";
import { HotelReferenceSubpage } from "./HotelReferenceSubpage";
import { HotelRoomGallerySection } from "./HotelRoomGallerySection";
import { HotelSocialLinksSection } from "./HotelSocialLinksSection";
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
import { getHotelRoomGallery } from "@/lib/hotel-room-gallery";

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
  const bookingWidget = resolveBookingWidget(localizedContent, profile);
  const heroImage = localizedContent.brand.heroImageSrc || galleryItems[0]?.imageSrc || services[0]?.imageSrc || "";
  const heroImagePosition =
    localizedContent.brand.heroImagePosition || galleryItems[0]?.imagePosition || services[0]?.imagePosition;
  const heroSlides = buildHeroSlides(localizedContent, services, galleryItems, heroImage, heroImagePosition);
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
  const bookingSectionHref = buildHotelWhatsAppHrefV2({
    locale,
    hotelName: displayBrandName,
    intent: "booking-cta",
    sourceLabel: locale === "en" ? "Final booking block" : "Bloque final de reserva",
  });
  const curatedRooms = getHotelRoomGallery(locale).map((room) => ({
    ...room,
    reservationHref: buildHotelWhatsAppHrefV2({
      locale,
      hotelName: displayBrandName,
      intent: "room",
      sourceLabel: room.title,
      roomLabel: room.title,
    }),
  }));
  const benefitIcons: Array<"breakfast" | "wifi" | "air" | "reception"> = ["breakfast", "wifi", "air", "reception"];
  const benefits = ui.hero.benefits.map((label, index) => ({
    icon: benefitIcons[index] || "reception",
    label,
  }));
  const experienceGalleryItems = buildExperienceGalleryItems(services, galleryItems, heroImage, heroImagePosition);
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
          cityLabel={cityLabel}
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
          rooms={curatedRooms}
          sectionId="habitaciones"
          summary={t(
            locale,
            "Recorre las categorias reales del hotel con fotos curadas, ficha visual y reserva directa desde cada habitacion.",
            "Browse the hotel's real room categories with curated photos, a visual info card and direct booking from each room.",
          )}
          title={t(
            locale,
            "Nuestras habitaciones con fotos reales y mejor lectura visual",
            "Our rooms with real photos and clearer visual storytelling",
          )}
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

        <HotelPremiumBookingCta
          description={t(
            locale,
            "Consulta disponibilidad y recibe confirmacion rapida por WhatsApp.",
            "Check availability and receive a fast confirmation on WhatsApp.",
          )}
          href={bookingSectionHref}
          locale={locale}
          title={t(locale, "Reserva directa por WhatsApp", "Direct booking via WhatsApp")}
        />

        <HotelSocialLinksSection locale={locale} />

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
        label={ui.floating.label}
        locale={locale}
        note={ui.floating.note}
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
      title: "Desayuno y mananas con mas calma",
      subtitle: "Desayuno",
      imageSrc: services[3]?.imageSrc || galleryItems[3]?.imageSrc || services[2]?.imageSrc || heroImage,
      imagePosition: services[3]?.imagePosition || galleryItems[3]?.imagePosition || services[2]?.imagePosition || heroImagePosition,
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
