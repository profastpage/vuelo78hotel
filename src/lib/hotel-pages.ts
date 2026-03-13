export const HOTEL_NAV_ITEMS = [
  { slug: "hotel", label: "Hotel", href: "/" },
  { slug: "ofertas", label: "Ofertas", href: "/ofertas" },
  { slug: "experiencias", label: "Experiencias", href: "/experiencias" },
  { slug: "habitaciones", label: "Habitaciones", href: "/habitaciones" },
  { slug: "servicios", label: "Servicios", href: "/servicios" },
  { slug: "restaurante", label: "Restaurante", href: "/restaurante" },
  { slug: "eventos", label: "Eventos", href: "/eventos" },
  { slug: "galeria", label: "Galeria", href: "/galeria" },
  { slug: "mapa", label: "Mapa", href: "/mapa" },
] as const;

export type HotelPageSlug = (typeof HOTEL_NAV_ITEMS)[number]["slug"];

const HIDDEN_HOTEL_NAV_SLUGS = new Set<HotelPageSlug>(["restaurante", "eventos", "galeria"]);

export const HOTEL_VISIBLE_NAV_ITEMS = HOTEL_NAV_ITEMS.filter((item) => !HIDDEN_HOTEL_NAV_SLUGS.has(item.slug));

const HOTEL_PAGE_SLUGS = new Set<string>(HOTEL_NAV_ITEMS.map((item) => item.slug));

export function isHotelPageSlug(value: string | undefined | null): value is HotelPageSlug {
  return Boolean(value && HOTEL_PAGE_SLUGS.has(value));
}

export function normalizeHotelPageSlug(value?: string | null): HotelPageSlug {
  return isHotelPageSlug(value) ? value : "hotel";
}

export function getHotelPageHref(slug: HotelPageSlug) {
  return HOTEL_NAV_ITEMS.find((item) => item.slug === slug)?.href || "/";
}

export function getHotelPageLabel(slug: HotelPageSlug) {
  return HOTEL_NAV_ITEMS.find((item) => item.slug === slug)?.label || "Hotel";
}

export function getHotelPageIndex(slug: HotelPageSlug) {
  return HOTEL_NAV_ITEMS.findIndex((item) => item.slug === slug);
}
