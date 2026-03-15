import { normalizeHotelSpanishText, type HotelLocale } from "./hotel-experience";

type LocalizedCopy = {
  en: string;
  es: string;
};

type ExperienceGalleryDefinition = {
  alt: LocalizedCopy;
  areaKey: "areas" | "piscina" | "desayuno" | "almuerzo" | "restobar";
  areaLabel: LocalizedCopy;
  id: string;
  src: string;
  title: LocalizedCopy;
};

export type HotelExperienceGalleryItem = {
  alt: string;
  areaKey: ExperienceGalleryDefinition["areaKey"];
  areaLabel: string;
  id: string;
  src: string;
  title: string;
};

const EXPERIENCE_GALLERY_ITEMS: ExperienceGalleryDefinition[] = [
  {
    id: "areas-01",
    areaKey: "areas",
    areaLabel: { es: "Areas comunes", en: "Common areas" },
    title: { es: "Lobby listo para llegar sin apuro", en: "Lobby ready for a calm arrival" },
    alt: { es: "Lobby del hotel con recepcion y sofa", en: "Hotel lobby with reception and sofa" },
    src: "/assets/gallery/experiencia-curada/02-areas-lobby.jpg",
  },
  {
    id: "areas-02",
    areaKey: "areas",
    areaLabel: { es: "Areas comunes", en: "Common areas" },
    title: { es: "Recepcion con atencion directa", en: "Reception with direct assistance" },
    alt: { es: "Recepcion principal del hotel", en: "Main hotel reception" },
    src: "/assets/gallery/experiencia-curada/01-areas-recepcion.jpg",
  },
  {
    id: "areas-03",
    areaKey: "areas",
    areaLabel: { es: "Areas comunes", en: "Common areas" },
    title: { es: "Sala de espera tranquila", en: "Quiet waiting lounge" },
    alt: { es: "Sala de espera del hotel", en: "Hotel waiting lounge" },
    src: "/assets/gallery/experiencia-curada/03-areas-sala.jpg",
  },
  {
    id: "areas-04",
    areaKey: "areas",
    areaLabel: { es: "Areas comunes", en: "Common areas" },
    title: { es: "Ambientes comunes para una pausa breve", en: "Shared spaces for a short pause" },
    alt: { es: "Area comun interior del hotel", en: "Indoor common hotel area" },
    src: "/assets/gallery/experiencia-curada/04-areas-comunes.jpg",
  },
  {
    id: "piscina-01",
    areaKey: "piscina",
    areaLabel: { es: "Piscina", en: "Pool" },
    title: { es: "Descanso tropical junto al agua", en: "Tropical rest by the water" },
    alt: { es: "Descanso junto a la piscina del hotel", en: "Relaxing spot by the hotel pool" },
    src: "/assets/gallery/experiencia-curada/06-piscina-descanso.jpg",
  },
  {
    id: "piscina-02",
    areaKey: "piscina",
    areaLabel: { es: "Piscina", en: "Pool" },
    title: { es: "Piscina azul para bajar el ritmo", en: "Blue pool to slow the pace" },
    alt: { es: "Vista superior de la piscina del hotel", en: "Top view of the hotel pool" },
    src: "/assets/gallery/experiencia-curada/05-piscina-vista.jpg",
  },
  {
    id: "desayuno-01",
    areaKey: "desayuno",
    areaLabel: { es: "Desayuno", en: "Breakfast" },
    title: { es: "Mananas con mas calma", en: "Mornings with more calm" },
    alt: { es: "Bandeja de desayuno del hotel", en: "Hotel breakfast tray" },
    src: "/assets/gallery/experiencia-curada/10-desayuno-bandeja.jpg",
  },
  {
    id: "desayuno-02",
    areaKey: "desayuno",
    areaLabel: { es: "Desayuno", en: "Breakfast" },
    title: { es: "Buffet listo desde temprano", en: "Buffet ready from early on" },
    alt: { es: "Mesa de desayuno lista", en: "Breakfast table ready" },
    src: "/assets/gallery/experiencia-curada/11-desayuno-buffet.jpg",
  },
  {
    id: "desayuno-03",
    areaKey: "desayuno",
    areaLabel: { es: "Desayuno", en: "Breakfast" },
    title: { es: "Desayuno servido con calma", en: "Breakfast served at an easy pace" },
    alt: { es: "Servicio de desayuno en el hotel", en: "Breakfast service at the hotel" },
    src: "/assets/gallery/experiencia-curada/09-desayuno-servicio.jpg",
  },
  {
    id: "desayuno-04",
    areaKey: "desayuno",
    areaLabel: { es: "Desayuno", en: "Breakfast" },
    title: { es: "Salon para desayunar sin apuro", en: "Breakfast hall without the rush" },
    alt: { es: "Salon de desayuno del hotel", en: "Hotel breakfast hall" },
    src: "/assets/gallery/experiencia-curada/12-desayuno-salon.jpg",
  },
  {
    id: "almuerzo-01",
    areaKey: "almuerzo",
    areaLabel: { es: "Almuerzo", en: "Lunch" },
    title: { es: "Sabores regionales sin apuro", en: "Regional flavors without the rush" },
    alt: { es: "Plato de almuerzo del hotel", en: "Hotel lunch dish" },
    src: "/assets/gallery/experiencia-curada/15-almuerzo-plato.jpg",
  },
  {
    id: "almuerzo-02",
    areaKey: "almuerzo",
    areaLabel: { es: "Almuerzo", en: "Lunch" },
    title: { es: "Mesa lista para una pausa larga", en: "Table ready for a longer pause" },
    alt: { es: "Mesa de almuerzo dentro del hotel", en: "Lunch table inside the hotel" },
    src: "/assets/gallery/experiencia-curada/14-almuerzo-mesa.jpg",
  },
  {
    id: "almuerzo-03",
    areaKey: "almuerzo",
    areaLabel: { es: "Almuerzo", en: "Lunch" },
    title: { es: "Almuerzo con sabor regional", en: "Lunch with regional flavor" },
    alt: { es: "Huesped almorzando en el hotel", en: "Guest having lunch at the hotel" },
    src: "/assets/gallery/experiencia-curada/13-almuerzo-cliente.jpg",
  },
  {
    id: "almuerzo-04",
    areaKey: "almuerzo",
    areaLabel: { es: "Almuerzo", en: "Lunch" },
    title: { es: "Sabores frescos para compartir", en: "Fresh flavors to share" },
    alt: { es: "Entrada o piqueo del hotel", en: "Starter or snack at the hotel" },
    src: "/assets/gallery/experiencia-curada/16-almuerzo-sabores.jpg",
  },
  {
    id: "restobar-01",
    areaKey: "restobar",
    areaLabel: { es: "Restobar", en: "Restobar" },
    title: { es: "Cocteles para cerrar el dia", en: "Cocktails to close the day" },
    alt: { es: "Coctel del restobar del hotel", en: "Hotel restobar cocktail" },
    src: "/assets/gallery/experiencia-curada/17-restobar-coctel.jpg",
  },
  {
    id: "restobar-02",
    areaKey: "restobar",
    areaLabel: { es: "Restobar", en: "Restobar" },
    title: { es: "Brindis fresco en la noche", en: "Fresh toast at night" },
    alt: { es: "Bebidas del restobar del hotel", en: "Drinks at the hotel restobar" },
    src: "/assets/gallery/experiencia-curada/18-restobar-brindis.jpg",
  },
  {
    id: "restobar-03",
    areaKey: "restobar",
    areaLabel: { es: "Restobar", en: "Restobar" },
    title: { es: "Carta ligera junto a la piscina", en: "Light menu by the pool" },
    alt: { es: "Bebida del restobar junto a la piscina", en: "Restobar drink by the pool" },
    src: "/assets/gallery/experiencia-curada/19-restobar-carta.jpg",
  },
  {
    id: "restobar-04",
    areaKey: "restobar",
    areaLabel: { es: "Restobar", en: "Restobar" },
    title: { es: "Ambiente nocturno con restobar", en: "Night atmosphere with restobar" },
    alt: { es: "Restobar del hotel durante la noche", en: "Hotel restobar at night" },
    src: "/assets/gallery/experiencia-curada/20-restobar-noche.jpg",
  },
];

export function getHotelExperienceGallery(locale: HotelLocale): HotelExperienceGalleryItem[] {
  return EXPERIENCE_GALLERY_ITEMS.map((item) => ({
    alt: locale === "en" ? item.alt.en : normalizeHotelSpanishText(item.alt.es),
    areaKey: item.areaKey,
    areaLabel: locale === "en" ? item.areaLabel.en : normalizeHotelSpanishText(item.areaLabel.es),
    id: item.id,
    src: item.src,
    title: locale === "en" ? item.title.en : normalizeHotelSpanishText(item.title.es),
  }));
}
