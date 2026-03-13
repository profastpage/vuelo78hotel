import type { ClientProfile, SiteContent } from "@/types/site";
import { ContactForm } from "./ContactForm";
import { HotelMobileMenu } from "./HotelMobileMenu";
import { InlineImageField } from "./InlineImageField";
import { InlineTextField } from "./InlineTextField";
import { LandingFaqAccordion } from "./LandingFaqAccordion";
import { renderBalancedSectionTitle } from "./headline-balance";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { HOTEL_NAV_ITEMS, HOTEL_VISIBLE_NAV_ITEMS, type HotelPageSlug, getHotelPageHref, getHotelPageIndex, getHotelPageLabel } from "@/lib/hotel-pages";
import { getGalleryItems, getMediaStyle, getVisibleFaqs, getVisibleServices } from "./rendering";
import { resolveBookingWidget } from "@/lib/booking-widget";

type Props = {
  profile: ClientProfile;
  content: SiteContent;
  pageSlug: Exclude<HotelPageSlug, "hotel">;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

type Data = {
  kicker: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  story: { chip: string; title: string; body: string };
  cards: Array<{ eyebrow: string; title: string; description: string }>;
  modals: Array<{ title: string; body: string }>;
  railTitle: string;
  railDescription: string;
  faqTitle: string;
  contactDescription: string;
};

type RailItem = {
  title: string;
  subtitle: string;
  imageSrc: string;
  imagePosition: { x?: number; y?: number } | undefined;
  description: string;
  sourceType: "gallery" | "service";
  sourceIndex: number;
};

export function HotelReferenceSubpage({ profile, content, pageSlug, editorMode = false, editorImageControls, editorTextControls }: Props) {
  const services = getVisibleServices(content);
  const faqs = buildHotelReferenceFaqs(getVisibleFaqs(content).slice(0, 4), content);
  const galleryItems = getGalleryItems(content, content.brand.name);
  const bookingWidget = resolveBookingWidget(content, profile);
  const contactPhone = normalizeHotelPhone(content.contact.whatsappNumber);
  const heroImage = content.brand.heroImageSrc || galleryItems[0]?.imageSrc || services[0]?.imageSrc || "";
  const heroImagePosition = content.brand.heroImagePosition || galleryItems[0]?.imagePosition || services[0]?.imagePosition;
  const reservationHref = normalizeReservationHref(content.brand.primaryCtaHref, contactPhone, content.brand.name);
  const locationQuery = encodeURIComponent([content.location?.address, content.location?.city].filter(Boolean).join(", "));
  const mapHref = locationQuery ? `https://www.google.com/maps?q=${locationQuery}` : reservationHref;
  const mapEmbedHref = locationQuery ? `https://www.google.com/maps?q=${locationQuery}&output=embed` : "";
  const normalizedHours = content.location?.hours?.includes("24 horas") ? "Recepcion 24 horas" : content.location?.hours;
  const data = getPageData(pageSlug, content, services, bookingWidget.options?.slice(0, 1)?.[0]?.price || "S/ 249");
  const pageIndex = HOTEL_NAV_ITEMS.findIndex((item) => item.slug === pageSlug);
  const visiblePages = HOTEL_VISIBLE_NAV_ITEMS;
  const metrics = data.metrics.slice(0, 3).map((metric, index) => ({
    label: content.stats[index]?.label || metric.label,
    value: content.stats[index]?.value || metric.value,
  }));
  const cards = data.cards.slice(0, 3).map((card, index) => ({
    eyebrow: content.highlights[index] || card.eyebrow,
    title: services[index]?.title || card.title,
    description: services[index]?.description || card.description,
  }));
  const modalItems = data.modals.slice(0, 3).map((modal, index) => ({
    title: faqs[index]?.question || modal.title,
    body: faqs[index]?.answer || modal.body,
  }));
  const rail: RailItem[] = [
    ...galleryItems.map((item, index) => ({
      title: item.title,
      subtitle: index === 0 ? getHotelPageLabel(pageSlug) : item.subtitle || "Vuelo 78",
      imageSrc: item.imageSrc || heroImage,
      imagePosition: item.imagePosition || heroImagePosition,
      description: getHotelReferenceRailCopy(pageSlug, index),
      sourceType: "gallery" as const,
      sourceIndex: index,
    })),
    ...services.map((item, index) => ({
      title: item.title,
      subtitle: getHotelPageLabel(pageSlug),
      imageSrc: item.imageSrc || heroImage,
      imagePosition: item.imagePosition || heroImagePosition,
      description: getHotelReferenceRailCopy(pageSlug, index + galleryItems.length),
      sourceType: "service" as const,
      sourceIndex: index,
    })),
  ].slice(0, 5);
  const storyMedia = rail[0];
  const storyChip = data.story.chip;
  const storyTitle = data.story.title;
  const storyBody = data.story.body;
  const railTitle = data.railTitle;
  const railDescription = data.railDescription;
  const bookingCtaLabel = bookingWidget.bookingCtaLabel || content.brand.primaryCtaLabel || "Reservar";
  const leadPrice = bookingWidget.options?.[0]?.price || "Tarifa directa";
  const heroUploading = editorMode && editorImageControls?.uploadingField === "hero";

  return (
    <>
      <section className="hotel-reference-shell hotel-reference-page-shell" id="inicio" data-editor-section="hero">
        <InlineImageField enabled={editorMode} fieldKey="hero" label={`Hero ${getHotelPageLabel(pageSlug)}`} onChange={editorMode ? editorImageControls?.onHeroImageChange : undefined} uploading={heroUploading}>
          <div className={`hotel-reference-hero hotel-reference-hero-alt ${heroImage ? "has-media-image" : "media-fallback-hotel"}`} style={getMediaStyle(heroImage, "0.22", heroImagePosition)}>
            <div className="hotel-reference-hero-overlay" aria-hidden="true" />
            <header className="hotel-reference-header">
              <a className="hotel-reference-brand" href="/" aria-label={`Ir al inicio de ${content.brand.name}`}>
                <span className="hotel-reference-brand-mark" aria-hidden="true">v</span>
                <span className="hotel-reference-brand-copy">
                  {editorMode ? <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre del hotel" section="hero" value={content.brand.name} /> : <strong>{content.brand.name}</strong>}
                  {editorMode ? <InlineTextField as="span" className="hotel-reference-brand-small" controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Tag del hotel" section="hero" value={content.brand.heroTag || "Hotel urbano en Tarapoto"} /> : <small>{content.brand.heroTag || "Hotel urbano en Tarapoto"}</small>}
                </span>
              </a>
              <nav className="hotel-reference-nav" aria-label="Secciones principales">
                {visiblePages.map((item) => {
                  const navIndex = getHotelPageIndex(item.slug);
                  const navLabel = content.pages[navIndex] || item.label;

                  return (
                  <a className={item.slug === pageSlug ? "is-active" : undefined} href={item.href} key={item.slug}>
                    {editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${navIndex}`} label={`Link hotel ${navIndex + 1}`} section="hero" showTrigger={false} value={navLabel} /> : navLabel}
                  </a>
                  );
                })}
              </nav>
              <a className="hotel-reference-header-cta" href={reservationHref}>
                {editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="bookingWidget.bookingCtaLabel" label="CTA principal hotel" section="hero" showTrigger={false} value={bookingCtaLabel} /> : bookingCtaLabel}
              </a>
              <HotelMobileMenu activeSlug={pageSlug} bookingCtaLabel={bookingCtaLabel} pages={visiblePages} reservationHref={reservationHref} />
            </header>

            <div className="hotel-reference-hero-copy hotel-reference-hero-copy-wide">
              {editorMode ? <InlineTextField as="span" className="hotel-reference-kicker" controls={editorTextControls} enabled fieldKey="brand.heroTag" label={`Kicker ${getHotelPageLabel(pageSlug)}`} section="hero" value={data.kicker} /> : <span className="hotel-reference-kicker">{data.kicker}</span>}
              {editorMode ? <InlineTextField as="h1" controls={editorTextControls} enabled fieldKey="brand.headline" label={`Titulo ${getHotelPageLabel(pageSlug)}`} minRows={4} multiline section="hero" value={data.title} /> : <h1>{data.title}</h1>}
              {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.subheadline" label={`Descripcion ${getHotelPageLabel(pageSlug)}`} minRows={4} multiline section="hero" value={data.description} /> : <p>{data.description}</p>}
              <div className="hotel-reference-room-actions">
                <a className="primary-button" href={reservationHref}>{editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="bookingWidget.bookingCtaLabel" label="CTA reservar" section="hero" showTrigger={false} value={bookingCtaLabel} /> : "Reservar"}</a>
                <a className="secondary-button" href={pageSlug === "mapa" ? mapHref : getHotelPageHref("habitaciones")}>{pageSlug === "mapa" ? "Abrir mapa" : "Ver habitaciones"}</a>
              </div>
            </div>
          </div>
        </InlineImageField>

        <div className="hotel-reference-hero-metrics">
          {metrics.map((metric, index) => (
            <article className="hotel-reference-hero-metric" key={`${metric.label}-${index}`}>
              {editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`stats.${index}.label`} label={`Metrica ${index + 1} label`} section="story" value={metric.label} /> : <span>{metric.label}</span>}
              {editorMode ? <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`stats.${index}.value`} label={`Metrica ${index + 1} valor`} section="story" value={metric.value} /> : <strong>{metric.value}</strong>}
            </article>
          ))}
        </div>
      </section>

      <section className="scene hotel-reference-story-split" data-animate data-animate-delay="50" data-editor-section="story">
        <article className="hotel-reference-story-copy">
          {editorMode ? <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.storyChip" label="Chip narrativa" section="story" value={storyChip} /> : <span className="scene-chip">{storyChip}</span>}
          {editorMode ? <InlineTextField as="h2" controls={editorTextControls} displayValue={renderBalancedSectionTitle(storyTitle)} enabled fieldKey="uiText.storyTitle" label="Titulo narrativa" minRows={3} multiline section="story" value={storyTitle} /> : <h2>{renderBalancedSectionTitle(storyTitle)}</h2>}
          {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Descripcion narrativa" minRows={4} multiline section="story" value={storyBody} /> : <p>{storyBody}</p>}
          <div className="hotel-reference-story-links">
            <a className="primary-button" href={reservationHref}>Confirmar disponibilidad</a>
            <a className="secondary-button" href={getHotelPageHref("mapa")}>Ver mapa</a>
          </div>
        </article>
        <InlineImageField enabled={editorMode && Boolean(storyMedia)} fieldKey={`story-media-${storyMedia?.sourceType || "gallery"}-${storyMedia?.sourceIndex ?? 0}`} label={`Imagen narrativa ${getHotelPageLabel(pageSlug)}`} onChange={editorMode && storyMedia ? storyMedia.sourceType === "gallery" ? (event) => editorImageControls?.onGalleryImageChange(storyMedia.sourceIndex, event) : (event) => editorImageControls?.onServiceImageChange(storyMedia.sourceIndex, event) : undefined} uploading={editorMode && storyMedia ? editorImageControls?.uploadingField === `${storyMedia.sourceType === "gallery" ? "galeria" : "servicio"} ${storyMedia.sourceIndex + 1}` : false}>
          <div className={`hotel-reference-story-media ${(storyMedia?.imageSrc || heroImage) ? "has-media-image" : "media-fallback-hotel"}`} style={getMediaStyle(storyMedia?.imageSrc || heroImage, "0.12", storyMedia?.imagePosition || heroImagePosition)} />
        </InlineImageField>
      </section>

      <section className="scene hotel-reference-related" data-animate data-animate-delay="90" data-editor-section="services">
        <div className="hotel-reference-section-heading">
          {editorMode ? <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey={`pages.${pageIndex}`} label="Chip de pagina hotel" section="services" value={getHotelPageLabel(pageSlug)} /> : <span className="scene-chip">{getHotelPageLabel(pageSlug)}</span>}
          {editorMode ? <InlineTextField as="h2" controls={editorTextControls} displayValue={renderBalancedSectionTitle(storyTitle)} enabled fieldKey="uiText.storyTitle" label="Titulo bloque servicios" minRows={3} multiline section="services" value={storyTitle} /> : <h2>{renderBalancedSectionTitle(storyTitle)}</h2>}
          {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Descripcion bloque servicios" minRows={3} multiline section="services" value={storyBody} /> : <p>{storyBody}</p>}
        </div>
        <div className="hotel-reference-related-grid">
          {cards.map((card, index) => (
            <article className="hotel-reference-room-card hotel-reference-card-tight" key={`${card.title}-${index}`}>
              <div className="hotel-reference-room-card-copy">
                {editorMode ? <InlineTextField as="span" className="scene-chip scene-chip-inline" compact controls={editorTextControls} enabled fieldKey={`highlights.${index}`} label={`Eyebrow bloque ${index + 1}`} section="services" value={card.eyebrow} /> : <span className="scene-chip scene-chip-inline">{card.eyebrow}</span>}
                {editorMode ? <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`services.${index}.title`} label={`Titulo bloque ${index + 1}`} section="services" value={card.title} /> : <strong>{card.title}</strong>}
                {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`services.${index}.description`} label={`Descripcion bloque ${index + 1}`} minRows={3} multiline section="services" value={card.description} /> : <p>{card.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="scene hotel-reference-modal-grid" data-animate data-animate-delay="130" data-editor-section="faqs">
        <div className="hotel-reference-section-heading">
          <span className="scene-chip">Mas informacion</span>
          <h2>{renderBalancedSectionTitle("Antes de reservar")}</h2>
          <p>Resuelve horarios, condiciones y servicios con una lectura mas directa.</p>
        </div>
        <div className="hotel-reference-modal-cards">
          {modalItems.map((modal, index) => (
            <details className="hotel-reference-modal-card" key={`${modal.title}-${index}`}>
              <summary className="hotel-reference-modal-summary">
                {editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`faqs.${index}.question`} label={`Titulo popup ${index + 1}`} section="faqs" showTrigger={false} value={modal.title} /> : <span>{modal.title}</span>}
                <strong>Abrir detalle</strong>
              </summary>
              <div className="hotel-reference-modal-panel" role="dialog" aria-label={modal.title}>
                <div className="hotel-reference-modal-content">
                  <span className="scene-chip">Informacion</span>
                  {editorMode ? <InlineTextField as="h3" controls={editorTextControls} enabled fieldKey={`faqs.${index}.question`} label={`Cabecera popup ${index + 1}`} section="faqs" value={modal.title} /> : <h3>{modal.title}</h3>}
                  {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`faqs.${index}.answer`} label={`Contenido popup ${index + 1}`} minRows={4} multiline section="faqs" value={modal.body} /> : <p>{modal.body}</p>}
                  <div className="hotel-reference-room-actions">
                    <a className="primary-button" href={reservationHref}>Reservar</a>
                    <a className="secondary-button" href="#contacto">Escribir al hotel</a>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="scene hotel-reference-rail-shell" data-animate data-animate-delay="170" data-editor-section="gallery">
        <div className="hotel-reference-section-heading">
          <span className="scene-chip">Galeria</span>
          {editorMode ? <InlineTextField as="h2" controls={editorTextControls} displayValue={renderBalancedSectionTitle(railTitle)} enabled fieldKey="uiText.storyTitle" label="Titulo rail" minRows={3} multiline section="gallery" value={railTitle} /> : <h2>{renderBalancedSectionTitle(railTitle)}</h2>}
          {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Descripcion rail" minRows={3} multiline section="gallery" value={railDescription} /> : <p>{railDescription}</p>}
        </div>
        <div className="hotel-reference-rail" role="list" aria-label={railTitle}>
          {rail.map((item, index) => (
            <article className="hotel-reference-rail-card" key={`${item.title}-${item.subtitle}-${index}`} role="listitem">
              <InlineImageField enabled={editorMode} fieldKey={`rail-${item.sourceType}-${item.sourceIndex}`} label={`Imagen rail ${index + 1}`} onChange={editorMode ? item.sourceType === "gallery" ? (event) => editorImageControls?.onGalleryImageChange(item.sourceIndex, event) : (event) => editorImageControls?.onServiceImageChange(item.sourceIndex, event) : undefined} uploading={editorMode && editorImageControls?.uploadingField === `${item.sourceType === "gallery" ? "galeria" : "servicio"} ${item.sourceIndex + 1}`}>
                <div className={`hotel-reference-rail-media ${item.imageSrc ? "has-media-image" : "media-fallback-hotel"}`} style={getMediaStyle(item.imageSrc, "0.08", item.imagePosition)} />
              </InlineImageField>
              <div className="hotel-reference-rail-copy">
                {editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={item.sourceType === "gallery" ? `galleryItems.${item.sourceIndex}.subtitle` : `highlights.${Math.min(item.sourceIndex, 2)}`} label={`Subtitulo rail ${index + 1}`} section="gallery" value={item.subtitle} /> : <span>{item.subtitle}</span>}
                {editorMode ? <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={item.sourceType === "gallery" ? `galleryItems.${item.sourceIndex}.title` : `services.${item.sourceIndex}.title`} label={`Titulo rail ${index + 1}`} section="gallery" value={item.title} /> : <strong>{item.title}</strong>}
                {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={item.sourceType === "gallery" ? `galleryItems.${item.sourceIndex}.subtitle` : `services.${item.sourceIndex}.description`} label={`Descripcion rail ${index + 1}`} minRows={3} multiline section="gallery" value={item.description} /> : <p>{item.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {pageSlug === "mapa" ? (
        <section className="scene hotel-reference-map-layout" data-animate data-animate-delay="210" data-editor-section="contact">
          <article className="hotel-reference-map-card">
            <span className="scene-chip">Ubicacion</span>
            {editorMode ? <InlineTextField as="h2" controls={editorTextControls} displayValue={renderBalancedSectionTitle(content.location?.city || "Tarapoto, Peru")} enabled fieldKey="location.city" label="Ciudad del hotel" section="contact" value={content.location?.city || "Tarapoto, Peru"} /> : <h2>{renderBalancedSectionTitle(content.location?.city || "Tarapoto, Peru")}</h2>}
            {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.address" label="Direccion del hotel" minRows={3} multiline section="contact" value={`${content.location?.address || "Tarapoto, Peru"}. Aqui puedes revisar el mapa, la direccion exacta y una vista de llegada antes de reservar.`} /> : <p>{content.location?.address || "Tarapoto, Peru"}. Aqui puedes revisar el mapa, la direccion exacta y una vista de llegada antes de reservar.</p>}
            <div className="hotel-reference-facts-grid">
              <article><span>Direccion</span><strong>{content.location?.address || "Tarapoto"}</strong></article>
              <article><span>Ciudad</span><strong>{content.location?.city || "Tarapoto, Peru"}</strong></article>
              <article><span>Recepcion</span><strong>{normalizedHours || "24 horas"}</strong></article>
            </div>
            <div className="hotel-reference-room-actions">
              <a className="primary-button" href={mapHref}>Abrir mapa</a>
              <a className="secondary-button" href={reservationHref}>Reservar</a>
            </div>
          </article>
          <div className="hotel-reference-map-visual">
            <div className="hotel-reference-map-frame">
              {mapEmbedHref ? (
                <iframe
                  src={mapEmbedHref}
                  title="Google Maps Hotel Vuelo 78"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="hotel-reference-map-iframe"
                />
              ) : (
                <a className="hotel-reference-map-placeholder" href={mapHref}>
                  Ver en Google Maps
                </a>
              )}
            </div>
            <div className="hotel-reference-map-gallery">
              {rail.slice(0, 2).map((item, index) => (
                <article className="hotel-reference-map-gallery-card" key={`${item.title}-${index}`}>
                  <div
                    className={`hotel-reference-map-gallery-media ${item.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
                    style={getMediaStyle(item.imageSrc || heroImage, "0.1", item.imagePosition || heroImagePosition)}
                  />
                  <div className="hotel-reference-map-gallery-copy">
                    <strong>{index === 0 ? "Foto del hotel" : item.title}</strong>
                    <span>{index === 0 ? "Llegada y fachada del hotel" : item.description}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {faqs.length ? <LandingFaqAccordion editorMode={editorMode} editorTextControls={editorTextControls} items={faqs} label={`FAQ ${getHotelPageLabel(pageSlug)}`} title={content.uiText?.faqTitle || data.faqTitle} /> : null}

      <ContactForm
        description={content.contact.description || data.contactDescription}
        editorMode={editorMode}
        editorTextControls={editorTextControls}
        title={content.contact.title || "Confirma disponibilidad y reserva con claridad"}
        whatsappNumber={contactPhone}
      />

      <footer className="scene hotel-reference-footer">
        <div className="hotel-reference-footer-brand">
          {editorMode ? <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey={`pages.${pageIndex}`} label="Chip footer hotel" section="contact" value={getHotelPageLabel(pageSlug)} /> : <span className="scene-chip">{getHotelPageLabel(pageSlug)}</span>}
          {editorMode ? <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre footer" section="contact" value={content.brand.name} /> : <strong>{content.brand.name}</strong>}
          {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="contact.description" label="Descripcion footer" minRows={3} multiline section="contact" value={content.contact.description || data.contactDescription} /> : <p>{content.contact.description || data.contactDescription}</p>}
        </div>
        <div className="hotel-reference-footer-links">
          {visiblePages.map((item) => {
              const navIndex = getHotelPageIndex(item.slug);
              const navLabel = content.pages[navIndex] || item.label;

              return (
              <a className={item.slug === pageSlug ? "is-active" : undefined} href={item.href} key={item.slug}>
              {editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${navIndex}`} label={`Link footer ${navIndex + 1}`} section="contact" showTrigger={false} value={navLabel} /> : navLabel}
              </a>
              );
            })}
        </div>
      </footer>
    </>
  );
}

function getPageData(pageSlug: Exclude<HotelPageSlug, "hotel">, content: SiteContent, services: SiteContent["services"], leadPrice: string): Data {
  const city = content.location?.city || "Tarapoto";
  const firstServices = services.slice(0, 3);
  const sharedCards = firstServices.length
    ? firstServices.map((service, index) => ({
        eyebrow: index === 0 ? "Destacado" : "Servicio",
        title: service.title,
        description: service.description,
      }))
    : [
        { eyebrow: "Destacado", title: "Habitacion principal", description: "Una opcion comoda para descansar con reserva directa." },
        { eyebrow: "Servicio", title: "Espacios del hotel", description: "Piscina, zonas comunes y una llegada simple." },
        { eyebrow: "Reserva", title: "Atencion directa", description: "Consulta disponibilidad y confirma tu estadia por WhatsApp." },
      ];

  const map: Record<Exclude<HotelPageSlug, "hotel">, Data> = {
    ofertas: {
      kicker: "Ofertas y promos",
      title: "Ofertas directas",
      description: "Promociones claras para reservar mejor.",
      metrics: [{ label: "Planes", value: "03" }, { label: "Destino", value: city }, { label: "Reserva", value: "Directa" }],
      story: { chip: "Ofertas", title: "Ofertas para reservar mejor", body: "Consulta paquetes, fines de semana y tarifas especiales con una lectura clara y rapida." },
      cards: sharedCards,
      modals: [{ title: "Promo fin de semana", body: "Consulta vigencia, tipo de habitacion y beneficio incluido antes de reservar." }, { title: "Escapada flexible", body: "Ideal para day use, late check-out o una noche de descanso cerca del aeropuerto." }, { title: "Plan corporativo", body: "Opciones practicas para viajes de trabajo, traslados y estadias cortas." }],
      railTitle: "Ofertas y escenas del hotel",
      railDescription: "Una galeria ligera para reforzar beneficios sin saturar la pagina.",
      faqTitle: "Ofertas y reservas",
      contactDescription: "Consulta disponibilidad, promociones vigentes y condiciones de reserva de forma directa.",
    },
    experiencias: {
      kicker: "Estancia y atmosfera",
      title: "Momentos memorables",
      description: "Detalles que elevan cada estancia.",
      metrics: [{ label: "Atencion", value: "24/7" }, { label: "Entorno", value: "Urbano" }, { label: "Mood", value: "Premium" }],
      story: { chip: "Experiencias", title: "Momentos para desconectar", body: "Una lectura breve para mostrar piscina, llegada, desayuno y pequenos detalles del hotel." },
      cards: sharedCards,
      modals: [{ title: "Llegada tranquila", body: "Informacion util para check-in, bienvenida y coordinacion antes de llegar." }, { title: "Momentos del hotel", body: "Una capa breve para piscina, descanso o espacios comunes." }, { title: "Estadia flexible", body: "Opciones para pedidos especiales o ajustes antes del viaje." }],
      railTitle: "Escenas para descansar",
      railDescription: "Ideal para mostrar piscina, habitaciones, detalles y ambiente sin exceso de texto.",
      faqTitle: "Tu estancia",
      contactDescription: "Consulta por disponibilidad, servicios y detalles de tu estadia antes de reservar.",
    },
    habitaciones: {
      kicker: "Suites y categorias",
      title: "Suites y habitaciones",
      description: `Categorias claras desde ${leadPrice}.`,
      metrics: [{ label: "Categorias", value: `${Math.max(services.length, 3)}` }, { label: "Tarifa", value: leadPrice }, { label: "Canal", value: "WhatsApp" }],
      story: { chip: "Habitaciones", title: "Elige tu mejor estancia", body: "Compara opciones, revisa beneficios y reserva directo con el hotel." },
      cards: sharedCards,
      modals: [{ title: "Amenidades incluidas", body: "Consulta WiFi, desayuno, aire acondicionado y detalles de cada categoria." }, { title: "Politica de reserva", body: "Revisa horarios, anticipos, cancelaciones y condiciones de estadia." }, { title: "Pedido especial", body: "Espacio para cama extra, decoracion o coordinaciones previas a tu llegada." }],
      railTitle: "Habitaciones y detalles",
      railDescription: "Muestra cama, bano, escritorio o amplitud sin perder una lectura clara.",
      faqTitle: "Habitaciones y tarifas",
      contactDescription: "Escribe para confirmar tarifa, tipo de habitacion y disponibilidad en tus fechas.",
    },
    servicios: {
      kicker: "Amenities y soporte",
      title: "Servicios esenciales",
      description: "Beneficios visibles para una estancia fluida.",
      metrics: [{ label: "Amenities", value: "Premium" }, { label: "Atencion", value: "Humana" }, { label: "Apoyo", value: "Directo" }],
      story: { chip: "Servicios", title: "Servicios para tu estancia", body: "Aqui se resumen desayuno, conectividad, asistencia y apoyo durante tu llegada." },
      cards: sharedCards,
      modals: [{ title: "Desayuno y horarios", body: "Consulta horarios, formato del desayuno y detalles del servicio." }, { title: "Apoyo antes de llegar", body: "Informacion sobre traslado, indicaciones y check-in tardio." }, { title: "Servicios a medida", body: "Espacio para lavanderia, decoracion o pedidos especiales." }],
      railTitle: "Servicios del hotel",
      railDescription: "Una forma limpia de mostrar beneficios sin convertir la pagina en una ficha tecnica.",
      faqTitle: "Servicios y asistencia",
      contactDescription: "Consulta servicios disponibles, horarios y detalles antes de confirmar tu reserva.",
    },
    restaurante: {
      kicker: "Desayuno y gastronomia",
      title: "Cocina y desayuno",
      description: "Propuesta cuidada, breve y bien presentada.",
      metrics: [{ label: "Servicio", value: "Desayuno" }, { label: "Ambiente", value: "Calmo" }, { label: "Reserva", value: "Simple" }],
      story: { chip: "Restaurante", title: "Desayuno con mejor presencia", body: "Sirve para mostrar el ambiente, el servicio y la experiencia de comer dentro del hotel." },
      cards: sharedCards,
      modals: [{ title: "Menu destacado", body: "Consulta platos, bebidas o sugerencias del dia." }, { title: "Horario de servicio", body: "Confirma desayuno incluido y horarios del restaurante." }, { title: "Cena privada", body: "Espacio para consultar una mesa o una atencion especial." }],
      railTitle: "Desayuno y restaurante",
      railDescription: "Ayuda a mostrar ambiente y servicio con una lectura mas elegante.",
      faqTitle: "Restaurante y desayunos",
      contactDescription: "La pagina queda lista para integrar carta real, fotos propias y reserva de mesa.",
    },
    eventos: {
      kicker: "Social y corporativo",
      title: "Eventos corporativos",
      description: "Espacios listos para reuniones y celebraciones.",
      metrics: [{ label: "Formato", value: "Flexible" }, { label: "Montajes", value: "03+" }, { label: "Respuesta", value: "Rapida" }],
      story: { chip: "Eventos", title: "Espacios listos para eventos", body: "Una lectura breve para presentar el salon, el montaje y el canal de contacto." },
      cards: sharedCards,
      modals: [{ title: "Solicitar cotizacion", body: "Comparte aforo estimado, fecha y requerimientos para recibir una propuesta." }, { title: "Montajes disponibles", body: "Consulta formatos como directorio, auditorio, banquete o coctel." }, { title: "Catering y soporte", body: "Revisa opciones de cafe, menu, audiovisuales y coordinacion." }],
      railTitle: "Salones y montajes",
      railDescription: "Refuerza el espacio antes del contacto o de la cotizacion final.",
      faqTitle: "Eventos y montajes",
      contactDescription: "La pagina de eventos queda lista para captar leads mas calificados y mostrar espacios con mejor jerarquia.",
    },
    galeria: {
      kicker: "Media y atmosfera",
      title: "Galeria del hotel",
      description: "Imagenes curadas para recorrer el hotel.",
      metrics: [{ label: "Imagenes", value: `${Math.max(services.length + 2, 6)}` }, { label: "Formato", value: "Editorial" }, { label: "Uso", value: "Responsive" }],
      story: { chip: "Galeria", title: "Recorre el hotel en imagenes", body: "Una seleccion visual para conocer habitaciones, piscina y espacios comunes." },
      cards: sharedCards,
      modals: [{ title: "Coleccion habitaciones", body: "Una vista mas enfocada de las principales categorias del hotel." }, { title: "Ambientes del hotel", body: "Espacios comunes, lobby y atmosfera general de la estancia." }, { title: "Experiencias y detalles", body: "Pequenos momentos que ayudan a imaginar la experiencia completa." }],
      railTitle: "Galeria del hotel",
      railDescription: "Imagenes grandes y limpias para mostrar el hotel con mejor presencia.",
      faqTitle: "Galeria e imagenes",
      contactDescription: "La galeria queda estructurada para crecer con material propio sin perder ritmo ni legibilidad.",
    },
    mapa: {
      kicker: "Ubicacion y llegada",
      title: "Ubicacion precisa",
      description: "Acceso simple, referencias claras y llegada segura.",
      metrics: [{ label: "Ciudad", value: city }, { label: "Acceso", value: "Facil" }, { label: "Canal", value: "Directo" }],
      story: { chip: "Mapa", title: "Ubicacion que da confianza", body: "Mapa, direccion y referencias claras para que la llegada se sienta simple desde el primer vistazo." },
      cards: sharedCards,
      modals: [{ title: "Como llegar", body: "Consulta aeropuerto, taxis, accesos y referencias simples." }, { title: "Entorno del hotel", body: "Lugares cercanos y puntos utiles para orientarte mejor." }, { title: "Check-in y contacto", body: "Horarios, confirmaciones y apoyo directo antes de tu llegada." }],
      railTitle: "Llegada y entorno",
      railDescription: "Una ayuda simple para ubicar el hotel con mayor confianza.",
      faqTitle: "Ubicacion y llegada",
      contactDescription: "La pagina de mapa deja lista una capa de confianza logistica que ayuda a convertir mejor.",
    },
  };

  return map[pageSlug];
}

function getHotelReferenceRailCopy(pageSlug: Exclude<HotelPageSlug, "hotel">, index: number) {
  const text: Record<Exclude<HotelPageSlug, "hotel">, string[]> = {
    ofertas: ["Promocion visible y facil de consultar.", "Beneficio claro antes de reservar.", "Ideal para temporadas y escapadas.", "Una ayuda visual para decidir rapido.", "Se recorre bien tambien en celular."],
    experiencias: ["Escena de llegada o descanso.", "Ayuda a imaginar la estadia.", "Sirve para detalles y momentos del hotel.", "Mantiene una lectura breve y agradable.", "Tambien funciona para day use."],
    habitaciones: ["Vista general de la habitacion.", "Muestra cama, bano o escritorio.", "Refuerza amplitud y comodidad.", "Permite comparar angulos sin ruido.", "Se integra bien con reserva directa."],
    servicios: ["Un beneficio visible desde el primer vistazo.", "Ideal para desayuno o conectividad.", "Resume valor sin texto excesivo.", "Mantiene ritmo visual limpio.", "Puede alternarse con senales de confianza."],
    restaurante: ["Escena suave del servicio.", "Ayuda a mostrar ambiente y sabor.", "Sirve para desayuno, brunch o bar.", "Tambien apoya trafico de redes.", "Se desplaza bien en movil."],
    eventos: ["Espacio para salones y montajes.", "Puede mostrar directorio o coctel.", "Funciona como resumen visual.", "Ayuda a imaginar el uso rapidamente.", "Se adapta a corporativo y privado."],
    galeria: ["Imagen amplia del hotel.", "Ordena las fotos con mejor ritmo.", "Ideal para arquitectura y servicio.", "Mantiene el tono premium del sitio.", "Puede crecer sin rehacer la pagina."],
    mapa: ["Escena de llegada o fachada.", "Sirve para accesos y referencias.", "Da mas tranquilidad antes de reservar.", "Puede usarse con imagenes del entorno.", "Cierra mejor la promesa de ubicacion."],
  };
  return text[pageSlug][index % text[pageSlug].length];
}

function buildHotelReferenceFaqs(items: SiteContent["faqs"], content: SiteContent) {
  const validItems = items.filter((item) => {
    const text = `${item.question} ${item.answer}`.toLowerCase();
    return !/(tripadvisor|rio hotels tarapoto|rio hotel|trip advisor|referencia|clonarse|tabs detectadas|popup|modal)/i.test(text);
  });

  if (validItems.length > 0) {
    return validItems;
  }

  const hotelName = content.brand.name || "el hotel";
  const checkInWindow = content.location?.hours || "24 horas";

  return [
    {
      question: "Como reservo directamente con el hotel?",
      answer: `Puedes escribir por WhatsApp o usar el formulario para confirmar disponibilidad, tarifa y condiciones directamente con ${hotelName}.`,
    },
    {
      question: "Que horario maneja recepcion?",
      answer: `La recepcion atiende ${checkInWindow}. Si llegas tarde, puedes avisar por WhatsApp para dejar tu reserva coordinada.`,
    },
    {
      question: "Puedo consultar antes de pagar?",
      answer: "Si. Puedes consultar fechas, tarifas y condiciones antes de confirmar tu reserva con el hotel.",
    },
  ];
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
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola, quiero reservar en ${brandName}.`)}` : "#contacto";
  }

  if (/51987654321/.test(value)) {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola, quiero reservar en ${brandName}.`)}` : "#contacto";
  }

  return value;
}


