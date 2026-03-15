import curations from "../../config/room-gallery-curation.json";
import { normalizeHotelSpanishText, type HotelLocale } from "./hotel-experience";

type CurationLocaleValue = {
  es: string;
  en: string;
};

type CurationSlide = {
  source: string;
  role: "general" | "main" | "bath" | "detail" | "alternate";
  alt: CurationLocaleValue;
};

type CurationRoom = {
  folder: string;
  slug: string;
  title: CurationLocaleValue;
  summary: CurationLocaleValue;
  descriptiveSource: string;
  selected: CurationSlide[];
};

export type HotelRoomGallerySlide = {
  alt: string;
  id: string;
  jpgSrc: string;
  role: CurationSlide["role"];
  webpSrc: string;
};

export type HotelRoomGalleryEntry = {
  ficha: {
    alt: string;
    jpgSrc: string;
    webpSrc: string;
  };
  folder: string;
  slug: string;
  slides: HotelRoomGallerySlide[];
  summary: string;
  title: string;
};

const ROOM_CURATIONS = curations.rooms as CurationRoom[];

function toPublicAssetPath(...parts: string[]) {
  return `/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
}

function localize(locale: HotelLocale, value: CurationLocaleValue) {
  const selected = locale === "en" ? value.en : normalizeHotelSpanishText(value.es);
  return selected;
}

export function getHotelRoomGallery(locale: HotelLocale): HotelRoomGalleryEntry[] {
  return ROOM_CURATIONS.map((room) => ({
    ficha: {
      alt: locale === "en" ? `${room.title.en} information card` : `Ficha descriptiva de ${normalizeHotelSpanishText(room.title.es)}`,
      jpgSrc: toPublicAssetPath("assets", "gallery", "Nuestras habitaciones", room.folder, `${room.slug}-ficha.jpg`),
      webpSrc: toPublicAssetPath("assets", "gallery", "Nuestras habitaciones", room.folder, `${room.slug}-ficha.webp`),
    },
    folder: room.folder,
    slug: room.slug,
    slides: room.selected.map((slide, index) => {
      const sequence = String(index + 1).padStart(2, "0");
      return {
        alt: localize(locale, slide.alt),
        id: `${room.slug}-${sequence}`,
        jpgSrc: toPublicAssetPath("assets", "gallery", "Nuestras habitaciones", room.folder, `${room.slug}-${sequence}.jpg`),
        role: slide.role,
        webpSrc: toPublicAssetPath("assets", "gallery", "Nuestras habitaciones", room.folder, `${room.slug}-${sequence}.webp`),
      };
    }),
    summary: localize(locale, room.summary),
    title: localize(locale, room.title),
  }));
}
