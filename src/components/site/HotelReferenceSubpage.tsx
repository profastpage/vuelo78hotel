import type { ClientProfile, SiteContent } from "@/types/site";
import { ContactForm } from "./ContactForm";
import { HotelMobileMenu } from "./HotelMobileMenu";
import { HotelRoomGallerySection } from "./HotelRoomGallerySection";
import { InlineImageField } from "./InlineImageField";
import { InlineTextField } from "./InlineTextField";
import { LandingFaqAccordion } from "./LandingFaqAccordion";
import { renderBalancedSectionTitle } from "./headline-balance";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { HOTEL_NAV_ITEMS, HOTEL_VISIBLE_NAV_ITEMS, type HotelPageSlug, getHotelPageHref, getHotelPageIndex, getHotelPageLabel } from "@/lib/hotel-pages";
import { getGalleryItems, getMediaStyle, getVisibleFaqs, getVisibleServices } from "./rendering";
import { resolveBookingWidget } from "@/lib/booking-widget";
import { HOTEL_WHATSAPP_PHONE_DISPLAY, buildHotelWhatsAppHrefV2, getHotelUi, normalizeHotelSpanishText, normalizeHotelSpanishValue, t, type HotelLocale } from "@/lib/hotel-experience";
import { getHotelRoomGallery } from "@/lib/hotel-room-gallery";

type Props = {
  profile: ClientProfile;
  content: SiteContent;
  pageSlug: Exclude<HotelPageSlug, "hotel">;
  locale: HotelLocale;
  onLocaleToggle: () => void;
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

export function HotelReferenceSubpage({
  profile,
  content,
  pageSlug,
  locale,
  onLocaleToggle,
  editorMode = false,
  editorImageControls,
  editorTextControls,
}: Props) {
  const ui = getHotelUi(locale);
  const services = getVisibleServices(content);
  const faqs = buildHotelReferenceFaqs(getVisibleFaqs(content).slice(0, 4), content, locale);
  const galleryItems = getGalleryItems(content, content.brand.name);
  const bookingWidget = resolveBookingWidget(content, profile);
  const contactPhone = normalizeHotelPhone(content.contact.whatsappNumber);
  const heroImage = content.brand.heroImageSrc || galleryItems[0]?.imageSrc || services[0]?.imageSrc || "";
  const heroImagePosition = content.brand.heroImagePosition || galleryItems[0]?.imagePosition || services[0]?.imagePosition;
  const reservationHref = buildHotelWhatsAppHrefV2({
    locale,
    hotelName: content.brand.name,
    intent: "subpage",
    sourceLabel: getHotelPageLabel(pageSlug),
  });
  const locationQuery = encodeURIComponent([content.location?.address, content.location?.city].filter(Boolean).join(", "));
  const mapHref = locationQuery ? `https://www.google.com/maps?q=${locationQuery}` : reservationHref;
  const mapEmbedHref = locationQuery ? `https://www.google.com/maps?q=${locationQuery}&output=embed` : "";
  const normalizedHours = content.location?.hours?.includes("24 horas")
    ? t(locale, "Recepción 24 horas", "24-hour reception")
    : content.location?.hours;
  const data = getPageData(pageSlug, content, services, bookingWidget.options?.slice(0, 1)?.[0]?.price || "S/ 249", locale);
  const curatedRooms =
    pageSlug === "habitaciones"
      ? getHotelRoomGallery(locale).map((room) => ({
          ...room,
          reservationHref: buildHotelWhatsAppHrefV2({
            locale,
            hotelName: content.brand.name,
            intent: "room",
            roomLabel: room.title,
            sourceLabel: room.title,
          }),
        }))
      : [];
  const pageIndex = HOTEL_NAV_ITEMS.findIndex((item) => item.slug === pageSlug);
  const currentPageLabel = content.pages[pageIndex] || getHotelPageLabel(pageSlug);
  const visiblePages = HOTEL_VISIBLE_NAV_ITEMS;
  const metrics = data.metrics.slice(0, 3).map((metric, index) => ({
    label: content.stats[index]?.label || metric.label,
    value: content.stats[index]?.value || metric.value,
  }));
  if (pageSlug === "habitaciones" && curatedRooms.length) {
    metrics[0] = {
      label: locale === "en" ? "Categories" : "Categorias",
      value: String(curatedRooms.length),
    };
  }
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
      subtitle: index === 0 ? currentPageLabel : item.subtitle || "Vuelo 78",
      imageSrc: item.imageSrc || heroImage,
      imagePosition: item.imagePosition || heroImagePosition,
      description: getHotelReferenceRailCopy(pageSlug, index, locale),
      sourceType: "gallery" as const,
      sourceIndex: index,
    })),
    ...services.map((item, index) => ({
      title: item.title,
      subtitle: currentPageLabel,
      imageSrc: item.imageSrc || heroImage,
      imagePosition: item.imagePosition || heroImagePosition,
      description: getHotelReferenceRailCopy(pageSlug, index + galleryItems.length, locale),
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
  const bookingCtaLabel = bookingWidget.bookingCtaLabel || content.brand.primaryCtaLabel || ui.subpage.reserve;
  const leadPrice = bookingWidget.options?.[0]?.price || "Tarifa directa";
  const heroUploading = editorMode && editorImageControls?.uploadingField === "hero";

  return (
    <>
      <section className="hotel-reference-shell hotel-reference-page-shell" id="inicio" data-editor-section="hero">
        <InlineImageField enabled={editorMode} fieldKey="hero" label={`Hero ${getHotelPageLabel(pageSlug)}`} onChange={editorMode ? editorImageControls?.onHeroImageChange : undefined} uploading={heroUploading}>
          <div className={`hotel-reference-hero hotel-reference-hero-alt ${heroImage ? "has-media-image" : "media-fallback-hotel"}`} style={getMediaStyle(heroImage, "0.22", heroImagePosition)}>
            <div className="hotel-reference-hero-overlay" aria-hidden="true" />
            <header className="hotel-reference-header">
              <a className="hotel-reference-brand" href="/" aria-label={t(locale, `Ir al inicio de ${content.brand.name}`, `Go to ${content.brand.name} home`)}>
                <span className="hotel-reference-brand-mark" aria-hidden="true">v</span>
                <span className="hotel-reference-brand-copy">
                  {editorMode ? <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre del hotel" section="hero" value={content.brand.name} /> : <strong>{content.brand.name}</strong>}
                  {editorMode ? <InlineTextField as="span" className="hotel-reference-brand-small" controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Tag del hotel" section="hero" value={content.brand.heroTag || t(locale, "Hotel urbano en Tarapoto", "Urban hotel in Tarapoto")} /> : <small>{content.brand.heroTag || t(locale, "Hotel urbano en Tarapoto", "Urban hotel in Tarapoto")}</small>}
                </span>
              </a>
              <nav className="hotel-reference-nav" aria-label={ui.header.navAria}>
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
              <button className="hotel-reference-header-locale" onClick={onLocaleToggle} type="button">
                {ui.header.localeButton}
              </button>
              <HotelMobileMenu activeSlug={pageSlug} bookingCtaLabel={bookingCtaLabel} locale={locale} onLocaleToggle={onLocaleToggle} pages={visiblePages} reservationHref={reservationHref} />
            </header>

            <div className="hotel-reference-hero-copy hotel-reference-hero-copy-wide">
              {editorMode ? <InlineTextField as="span" className="hotel-reference-kicker" controls={editorTextControls} enabled fieldKey="brand.heroTag" label={`Kicker ${getHotelPageLabel(pageSlug)}`} section="hero" value={data.kicker} /> : <span className="hotel-reference-kicker">{data.kicker}</span>}
              {editorMode ? <InlineTextField as="h1" controls={editorTextControls} enabled fieldKey="brand.headline" label={`Titulo ${getHotelPageLabel(pageSlug)}`} minRows={4} multiline section="hero" value={data.title} /> : <h1>{data.title}</h1>}
              {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.subheadline" label={`Descripcion ${getHotelPageLabel(pageSlug)}`} minRows={4} multiline section="hero" value={data.description} /> : <p>{data.description}</p>}
              <div className="hotel-reference-room-actions">
                <a className="primary-button" href={reservationHref}>{editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="bookingWidget.bookingCtaLabel" label="CTA reservar" section="hero" showTrigger={false} value={bookingCtaLabel} /> : ui.subpage.reserve}</a>
                <a className="secondary-button" href={pageSlug === "mapa" ? mapHref : getHotelPageHref("habitaciones")}>{pageSlug === "mapa" ? ui.subpage.openMap : t(locale, "Ver habitaciones", "View rooms")}</a>
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
            <a className="primary-button" href={reservationHref}>{ui.subpage.confirmAvailability}</a>
            <a className="secondary-button" href={getHotelPageHref("mapa")}>{ui.subpage.viewMap}</a>
          </div>
        </article>
        <InlineImageField enabled={editorMode && Boolean(storyMedia)} fieldKey={`story-media-${storyMedia?.sourceType || "gallery"}-${storyMedia?.sourceIndex ?? 0}`} label={`Imagen narrativa ${getHotelPageLabel(pageSlug)}`} onChange={editorMode && storyMedia ? storyMedia.sourceType === "gallery" ? (event) => editorImageControls?.onGalleryImageChange(storyMedia.sourceIndex, event) : (event) => editorImageControls?.onServiceImageChange(storyMedia.sourceIndex, event) : undefined} uploading={editorMode && storyMedia ? editorImageControls?.uploadingField === `${storyMedia.sourceType === "gallery" ? "galeria" : "servicio"} ${storyMedia.sourceIndex + 1}` : false}>
          <div className={`hotel-reference-story-media ${(storyMedia?.imageSrc || heroImage) ? "has-media-image" : "media-fallback-hotel"}`} style={getMediaStyle(storyMedia?.imageSrc || heroImage, "0.12", storyMedia?.imagePosition || heroImagePosition)} />
        </InlineImageField>
      </section>

      {pageSlug === "habitaciones" ? (
        <HotelRoomGallerySection locale={locale} rooms={curatedRooms} />
      ) : (
        <section className="scene hotel-reference-related" data-animate data-animate-delay="90" data-editor-section="services">
          <div className="hotel-reference-section-heading">
            {editorMode ? <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey={`pages.${pageIndex}`} label="Chip de pagina hotel" section="services" value={currentPageLabel} /> : <span className="scene-chip">{currentPageLabel}</span>}
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
      )}

      <section className="scene hotel-reference-modal-grid" data-animate data-animate-delay="130" data-editor-section="faqs">
        <div className="hotel-reference-section-heading">
          <span className="scene-chip">{ui.subpage.moreInfo}</span>
          <h2>{renderBalancedSectionTitle(ui.subpage.beforeBooking)}</h2>
          <p>{ui.subpage.beforeBookingDescription}</p>
        </div>
        <div className="hotel-reference-modal-cards">
          {modalItems.map((modal, index) => (
            <details className="hotel-reference-modal-card" key={`${modal.title}-${index}`}>
              <summary className="hotel-reference-modal-summary">
                {editorMode ? <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`faqs.${index}.question`} label={`Titulo popup ${index + 1}`} section="faqs" showTrigger={false} value={modal.title} /> : <span>{modal.title}</span>}
                <strong>{ui.subpage.openDetail}</strong>
              </summary>
              <div className="hotel-reference-modal-panel" role="dialog" aria-label={modal.title}>
                <div className="hotel-reference-modal-content">
                  <span className="scene-chip">{ui.subpage.infoChip}</span>
                  {editorMode ? <InlineTextField as="h3" controls={editorTextControls} enabled fieldKey={`faqs.${index}.question`} label={`Cabecera popup ${index + 1}`} section="faqs" value={modal.title} /> : <h3>{modal.title}</h3>}
                  {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`faqs.${index}.answer`} label={`Contenido popup ${index + 1}`} minRows={4} multiline section="faqs" value={modal.body} /> : <p>{modal.body}</p>}
                  <div className="hotel-reference-room-actions">
                    <a className="primary-button" href={reservationHref}>{ui.subpage.reserve}</a>
                    <a className="secondary-button" href="#contacto">{ui.subpage.writeHotel}</a>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {pageSlug !== "habitaciones" ? (
        <section className="scene hotel-reference-rail-shell" data-animate data-animate-delay="170" data-editor-section="gallery">
          <div className="hotel-reference-section-heading">
            <span className="scene-chip">{ui.subpage.gallery}</span>
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
      ) : null}

      {pageSlug === "mapa" ? (
        <section className="scene hotel-reference-map-layout" data-animate data-animate-delay="210" data-editor-section="contact">
          <article className="hotel-reference-map-card">
            <span className="scene-chip">{ui.subpage.location}</span>
            {editorMode ? <InlineTextField as="h2" controls={editorTextControls} displayValue={renderBalancedSectionTitle(content.location?.city || "Tarapoto, Peru")} enabled fieldKey="location.city" label="Ciudad del hotel" section="contact" value={content.location?.city || "Tarapoto, Peru"} /> : <h2>{renderBalancedSectionTitle(content.location?.city || "Tarapoto, Peru")}</h2>}
            {editorMode ? <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.address" label="Direccion del hotel" minRows={3} multiline section="contact" value={`${content.location?.address || "Tarapoto, Peru"}. ${t(locale, "Aqui puedes revisar el mapa, la direccion exacta y una vista de llegada antes de reservar.", "Here you can review the map, the exact address and the arrival view before booking.")}`} /> : <p>{content.location?.address || "Tarapoto, Peru"}. {t(locale, "Aqui puedes revisar el mapa, la direccion exacta y una vista de llegada antes de reservar.", "Here you can review the map, the exact address and the arrival view before booking.")}</p>}
            <div className="hotel-reference-facts-grid">
              <article><span>{ui.subpage.direction}</span><strong>{content.location?.address || "Tarapoto"}</strong></article>
              <article><span>{ui.subpage.city}</span><strong>{content.location?.city || "Tarapoto, Peru"}</strong></article>
              <article><span>{ui.subpage.reception}</span><strong>{normalizedHours || (locale === "en" ? "24 hours" : "24 horas")}</strong></article>
            </div>
            <div className="hotel-reference-room-actions">
              <a className="primary-button" href={mapHref}>{ui.subpage.openMap}</a>
              <a className="secondary-button" href={reservationHref}>{ui.subpage.reserve}</a>
            </div>
          </article>
          <div className="hotel-reference-map-visual">
            <div className="hotel-reference-map-frame">
              {mapEmbedHref ? (
                <iframe
                  src={mapEmbedHref}
                  title={locale === "en" ? `Google Maps for ${content.brand.name}` : `Google Maps de ${content.brand.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="hotel-reference-map-iframe"
                />
              ) : (
                <a className="hotel-reference-map-placeholder" href={mapHref}>
                  {ui.subpage.mapFallback}
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
                    <strong>{index === 0 ? ui.subpage.hotelPhoto : item.title}</strong>
                    <span>{index === 0 ? ui.subpage.arrivalPhoto : item.description}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {faqs.length ? <LandingFaqAccordion editorMode={editorMode} editorTextControls={editorTextControls} items={faqs} label={`${ui.faq.labelPrefix} ${currentPageLabel}`} title={content.uiText?.faqTitle || data.faqTitle} /> : null}

      <ContactForm
        brandName={content.brand.name}
        description={content.contact.description || data.contactDescription}
        editorMode={editorMode}
        editorTextControls={editorTextControls}
        locale={locale}
        title={content.contact.title || t(locale, "Confirma disponibilidad y reserva con claridad", "Confirm availability and book with clarity")}
        whatsappNumber={contactPhone}
      />

      <footer className="scene hotel-reference-footer">
        <div className="hotel-reference-footer-brand">
          {editorMode ? <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey={`pages.${pageIndex}`} label="Chip footer hotel" section="contact" value={currentPageLabel} /> : <span className="scene-chip">{currentPageLabel}</span>}
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

function getPageData(pageSlug: Exclude<HotelPageSlug, "hotel">, content: SiteContent, services: SiteContent["services"], leadPrice: string, locale: HotelLocale): Data {
  const city = content.location?.city || "Tarapoto";
  const firstServices = services.slice(0, 3);
  const sharedCards = firstServices.length
    ? firstServices.map((service, index) => ({
        eyebrow: index === 0 ? (locale === "en" ? "Featured" : "Destacado") : locale === "en" ? "Service" : "Servicio",
        title: service.title,
        description: service.description,
      }))
    : [
        {
          eyebrow: locale === "en" ? "Featured" : "Destacado",
          title: locale === "en" ? "Main room" : "Habitacion principal",
          description: locale === "en" ? "A comfortable option to rest with direct booking." : "Una opcion comoda para descansar con reserva directa.",
        },
        {
          eyebrow: locale === "en" ? "Service" : "Servicio",
          title: locale === "en" ? "Hotel spaces" : "Espacios del hotel",
          description: locale === "en" ? "Pool, common areas and a smooth arrival." : "Piscina, zonas comunes y una llegada simple.",
        },
        {
          eyebrow: locale === "en" ? "Booking" : "Reserva",
          title: locale === "en" ? "Direct assistance" : "Atencion directa",
          description: locale === "en" ? "Check availability and confirm your stay on WhatsApp." : "Consulta disponibilidad y confirma tu estadia por WhatsApp.",
        },
      ];

  const map: Record<Exclude<HotelPageSlug, "hotel">, Data> = {
    ofertas: {
      kicker: locale === "en" ? "Offers and promos" : "Ofertas y promos",
      title: locale === "en" ? "Direct offers" : "Ofertas directas",
      description: locale === "en" ? "Clear promotions to book better." : "Promociones claras para reservar mejor.",
      metrics: [{ label: "Planes", value: "03" }, { label: "Destino", value: city }, { label: "Reserva", value: "Directa" }],
      story: {
        chip: locale === "en" ? "Offers" : "Ofertas",
        title: locale === "en" ? "Offers to book better" : "Ofertas para reservar mejor",
        body: locale === "en" ? "Check packages, weekend plans and special rates with a clean, fast read." : "Consulta paquetes, fines de semana y tarifas especiales con una lectura clara y rapida.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "Weekend offer" : "Promo fin de semana",
          body: locale === "en" ? "Check dates, room type and included benefit before booking." : "Consulta vigencia, tipo de habitacion y beneficio incluido antes de reservar.",
        },
        {
          title: locale === "en" ? "Flexible getaway" : "Escapada flexible",
          body: locale === "en" ? "Ideal for day use, late check-out or a restful night near the airport." : "Ideal para day use, late check-out o una noche de descanso cerca del aeropuerto.",
        },
        {
          title: locale === "en" ? "Corporate plan" : "Plan corporativo",
          body: locale === "en" ? "Practical options for business trips, transfers and short stays." : "Opciones practicas para viajes de trabajo, traslados y estadias cortas.",
        },
      ],
      railTitle: locale === "en" ? "Offers and hotel scenes" : "Ofertas y escenas del hotel",
      railDescription: locale === "en" ? "A light gallery to reinforce benefits without overloading the page." : "Una galeria ligera para reforzar beneficios sin saturar la pagina.",
      faqTitle: locale === "en" ? "Offers and bookings" : "Ofertas y reservas",
      contactDescription: locale === "en" ? "Ask about availability, current offers and booking conditions directly." : "Consulta disponibilidad, promociones vigentes y condiciones de reserva de forma directa.",
    },
    experiencias: {
      kicker: locale === "en" ? "Stay and atmosphere" : "Estancia y atmosfera",
      title: locale === "en" ? "Memorable moments" : "Momentos memorables",
      description: locale === "en" ? "Details that elevate every stay." : "Detalles que elevan cada estancia.",
      metrics: [{ label: "Atencion", value: "24/7" }, { label: "Entorno", value: "Urbano" }, { label: "Mood", value: "Premium" }],
      story: {
        chip: locale === "en" ? "Experiences" : "Experiencias",
        title: locale === "en" ? "Moments to disconnect" : "Momentos para desconectar",
        body: locale === "en" ? "A short read to show the pool, arrival, breakfast and the hotel's small details." : "Una lectura breve para mostrar piscina, llegada, desayuno y pequenos detalles del hotel.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "Smooth arrival" : "Llegada tranquila",
          body: locale === "en" ? "Useful details for check-in, welcome and coordination before arrival." : "Informacion util para check-in, bienvenida y coordinacion antes de llegar.",
        },
        {
          title: locale === "en" ? "Hotel moments" : "Momentos del hotel",
          body: locale === "en" ? "A short layer for the pool, rest and common areas." : "Una capa breve para piscina, descanso o espacios comunes.",
        },
        {
          title: locale === "en" ? "Flexible stay" : "Estadia flexible",
          body: locale === "en" ? "Options for special requests or changes before the trip." : "Opciones para pedidos especiales o ajustes antes del viaje.",
        },
      ],
      railTitle: locale === "en" ? "Scenes for rest" : "Escenas para descansar",
      railDescription: locale === "en" ? "Ideal for showing the pool, rooms, details and atmosphere without too much text." : "Ideal para mostrar piscina, habitaciones, detalles y ambiente sin exceso de texto.",
      faqTitle: locale === "en" ? "Your stay" : "Tu estancia",
      contactDescription: locale === "en" ? "Ask about availability, services and stay details before booking." : "Consulta por disponibilidad, servicios y detalles de tu estadia antes de reservar.",
    },
    habitaciones: {
      kicker: locale === "en" ? "Suites and categories" : "Suites y categorias",
      title: locale === "en" ? "Suites and rooms" : "Suites y habitaciones",
      description: locale === "en" ? `Clear categories from ${leadPrice}.` : `Categorias claras desde ${leadPrice}.`,
      metrics: [{ label: "Categorias", value: `${Math.max(services.length, 3)}` }, { label: "Tarifa", value: leadPrice }, { label: "Canal", value: "WhatsApp" }],
      story: {
        chip: locale === "en" ? "Rooms" : "Habitaciones",
        title: locale === "en" ? "Choose your best stay" : "Elige tu mejor estancia",
        body: locale === "en" ? "Compare options, review benefits and book directly with the hotel." : "Compara opciones, revisa beneficios y reserva directo con el hotel.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "Included amenities" : "Amenidades incluidas",
          body: locale === "en" ? "Check WiFi, breakfast, air conditioning and details for each category." : "Consulta WiFi, desayuno, aire acondicionado y detalles de cada categoria.",
        },
        {
          title: locale === "en" ? "Booking policy" : "Politica de reserva",
          body: locale === "en" ? "Review schedules, deposits, cancellations and stay conditions." : "Revisa horarios, anticipos, cancelaciones y condiciones de estadia.",
        },
        {
          title: locale === "en" ? "Special request" : "Pedido especial",
          body: locale === "en" ? "Space for an extra bed, decoration or arrangements before arrival." : "Espacio para cama extra, decoracion o coordinaciones previas a tu llegada.",
        },
      ],
      railTitle: locale === "en" ? "Rooms and details" : "Habitaciones y detalles",
      railDescription: locale === "en" ? "Show bed, bathroom, desk or spaciousness while keeping a clear read." : "Muestra cama, bano, escritorio o amplitud sin perder una lectura clara.",
      faqTitle: locale === "en" ? "Rooms and rates" : "Habitaciones y tarifas",
      contactDescription: locale === "en" ? "Write to confirm rate, room type and availability for your dates." : "Escribe para confirmar tarifa, tipo de habitacion y disponibilidad en tus fechas.",
    },
    servicios: {
      kicker: locale === "en" ? "Amenities and support" : "Amenities y soporte",
      title: locale === "en" ? "Essential services" : "Servicios esenciales",
      description: locale === "en" ? "Visible benefits for a smooth stay." : "Beneficios visibles para una estancia fluida.",
      metrics: [
        { label: locale === "en" ? "Amenities" : "Amenities", value: "Premium" },
        { label: locale === "en" ? "Service" : "Atencion", value: locale === "en" ? "Human" : "Humana" },
        { label: locale === "en" ? "Support" : "Apoyo", value: locale === "en" ? "Direct" : "Directo" },
      ],
      story: {
        chip: locale === "en" ? "Services" : "Servicios",
        title: locale === "en" ? "Services for your stay" : "Servicios para tu estancia",
        body: locale === "en" ? "This section sums up breakfast, connectivity, assistance and support during arrival." : "Aqui se resumen desayuno, conectividad, asistencia y apoyo durante tu llegada.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "Breakfast and schedule" : "Desayuno y horarios",
          body: locale === "en" ? "Check breakfast times, format and service details." : "Consulta horarios, formato del desayuno y detalles del servicio.",
        },
        {
          title: locale === "en" ? "Support before arrival" : "Apoyo antes de llegar",
          body: locale === "en" ? "Information about transfers, directions and late check-in." : "Informacion sobre traslado, indicaciones y check-in tardio.",
        },
        {
          title: locale === "en" ? "Tailored services" : "Servicios a medida",
          body: locale === "en" ? "Space for laundry, decoration or special requests." : "Espacio para lavanderia, decoracion o pedidos especiales.",
        },
      ],
      railTitle: locale === "en" ? "Hotel services" : "Servicios del hotel",
      railDescription: locale === "en" ? "A clean way to show benefits without turning the page into a spec sheet." : "Una forma limpia de mostrar beneficios sin convertir la pagina en una ficha tecnica.",
      faqTitle: locale === "en" ? "Services and assistance" : "Servicios y asistencia",
      contactDescription: locale === "en" ? "Ask about available services, schedules and details before confirming your booking." : "Consulta servicios disponibles, horarios y detalles antes de confirmar tu reserva.",
    },
    restaurante: {
      kicker: locale === "en" ? "Breakfast and cuisine" : "Desayuno y gastronomia",
      title: locale === "en" ? "Cuisine and breakfast" : "Cocina y desayuno",
      description: locale === "en" ? "A concise and carefully presented offer." : "Propuesta cuidada, breve y bien presentada.",
      metrics: [
        { label: locale === "en" ? "Service" : "Servicio", value: locale === "en" ? "Breakfast" : "Desayuno" },
        { label: locale === "en" ? "Atmosphere" : "Ambiente", value: locale === "en" ? "Calm" : "Calmo" },
        { label: locale === "en" ? "Booking" : "Reserva", value: locale === "en" ? "Simple" : "Simple" },
      ],
      story: {
        chip: locale === "en" ? "Restaurant" : "Restaurante",
        title: locale === "en" ? "Breakfast with better presence" : "Desayuno con mejor presencia",
        body: locale === "en" ? "Useful to show the atmosphere, service and dining experience inside the hotel." : "Sirve para mostrar el ambiente, el servicio y la experiencia de comer dentro del hotel.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "Featured menu" : "Menu destacado",
          body: locale === "en" ? "Check dishes, drinks or daily recommendations." : "Consulta platos, bebidas o sugerencias del dia.",
        },
        {
          title: locale === "en" ? "Service hours" : "Horario de servicio",
          body: locale === "en" ? "Confirm included breakfast and restaurant opening times." : "Confirma desayuno incluido y horarios del restaurante.",
        },
        {
          title: locale === "en" ? "Private dinner" : "Cena privada",
          body: locale === "en" ? "Space to ask about a table or a special service." : "Espacio para consultar una mesa o una atencion especial.",
        },
      ],
      railTitle: locale === "en" ? "Breakfast and restaurant" : "Desayuno y restaurante",
      railDescription: locale === "en" ? "Helps present atmosphere and service with a more elegant read." : "Ayuda a mostrar ambiente y servicio con una lectura mas elegante.",
      faqTitle: locale === "en" ? "Restaurant and breakfast" : "Restaurante y desayunos",
      contactDescription: locale === "en" ? "This page is ready to integrate a real menu, original photos and table booking." : "La pagina queda lista para integrar carta real, fotos propias y reserva de mesa.",
    },
    eventos: {
      kicker: locale === "en" ? "Social and corporate" : "Social y corporativo",
      title: locale === "en" ? "Corporate events" : "Eventos corporativos",
      description: locale === "en" ? "Spaces ready for meetings and celebrations." : "Espacios listos para reuniones y celebraciones.",
      metrics: [
        { label: locale === "en" ? "Format" : "Formato", value: locale === "en" ? "Flexible" : "Flexible" },
        { label: locale === "en" ? "Setups" : "Montajes", value: "03+" },
        { label: locale === "en" ? "Reply" : "Respuesta", value: locale === "en" ? "Fast" : "Rapida" },
      ],
      story: {
        chip: locale === "en" ? "Events" : "Eventos",
        title: locale === "en" ? "Spaces ready for events" : "Espacios listos para eventos",
        body: locale === "en" ? "A short read to present the room, setup and contact channel." : "Una lectura breve para presentar el salon, el montaje y el canal de contacto.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "Request a quote" : "Solicitar cotizacion",
          body: locale === "en" ? "Share estimated capacity, date and requirements to receive a proposal." : "Comparte aforo estimado, fecha y requerimientos para recibir una propuesta.",
        },
        {
          title: locale === "en" ? "Available setups" : "Montajes disponibles",
          body: locale === "en" ? "Check boardroom, auditorium, banquet or cocktail formats." : "Consulta formatos como directorio, auditorio, banquete o coctel.",
        },
        {
          title: locale === "en" ? "Catering and support" : "Catering y soporte",
          body: locale === "en" ? "Review coffee break, menu, audiovisual and coordination options." : "Revisa opciones de cafe, menu, audiovisuales y coordinacion.",
        },
      ],
      railTitle: locale === "en" ? "Rooms and setups" : "Salones y montajes",
      railDescription: locale === "en" ? "Reinforces the space before contact or a final quote." : "Refuerza el espacio antes del contacto o de la cotizacion final.",
      faqTitle: locale === "en" ? "Events and setups" : "Eventos y montajes",
      contactDescription: locale === "en" ? "The events page is ready to capture more qualified leads and present spaces with better hierarchy." : "La pagina de eventos queda lista para captar leads mas calificados y mostrar espacios con mejor jerarquia.",
    },
    galeria: {
      kicker: locale === "en" ? "Media and atmosphere" : "Media y atmosfera",
      title: locale === "en" ? "Hotel gallery" : "Galeria del hotel",
      description: locale === "en" ? "Curated images to explore the hotel." : "Imagenes curadas para recorrer el hotel.",
      metrics: [
        { label: locale === "en" ? "Images" : "Imagenes", value: `${Math.max(services.length + 2, 6)}` },
        { label: locale === "en" ? "Format" : "Formato", value: "Editorial" },
        { label: locale === "en" ? "Use" : "Uso", value: "Responsive" },
      ],
      story: {
        chip: locale === "en" ? "Gallery" : "Galeria",
        title: locale === "en" ? "Tour the hotel in images" : "Recorre el hotel en imagenes",
        body: locale === "en" ? "A visual selection to discover rooms, the pool and common areas." : "Una seleccion visual para conocer habitaciones, piscina y espacios comunes.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "Room collection" : "Coleccion habitaciones",
          body: locale === "en" ? "A more focused view of the hotel's main room categories." : "Una vista mas enfocada de las principales categorias del hotel.",
        },
        {
          title: locale === "en" ? "Hotel spaces" : "Ambientes del hotel",
          body: locale === "en" ? "Common areas, lobby and the overall atmosphere of the stay." : "Espacios comunes, lobby y atmosfera general de la estancia.",
        },
        {
          title: locale === "en" ? "Experiences and details" : "Experiencias y detalles",
          body: locale === "en" ? "Small moments that help imagine the complete experience." : "Pequenos momentos que ayudan a imaginar la experiencia completa.",
        },
      ],
      railTitle: locale === "en" ? "Hotel gallery" : "Galeria del hotel",
      railDescription: locale === "en" ? "Large, clean images to present the hotel with stronger presence." : "Imagenes grandes y limpias para mostrar el hotel con mejor presencia.",
      faqTitle: locale === "en" ? "Gallery and images" : "Galeria e imagenes",
      contactDescription: locale === "en" ? "The gallery is structured to grow with original material while keeping rhythm and legibility." : "La galeria queda estructurada para crecer con material propio sin perder ritmo ni legibilidad.",
    },
    mapa: {
      kicker: locale === "en" ? "Location and arrival" : "Ubicacion y llegada",
      title: locale === "en" ? "Precise location" : "Ubicacion precisa",
      description: locale === "en" ? "Easy access, clear references and a safe arrival." : "Acceso simple, referencias claras y llegada segura.",
      metrics: [{ label: locale === "en" ? "City" : "Ciudad", value: city }, { label: locale === "en" ? "Access" : "Acceso", value: locale === "en" ? "Easy" : "Facil" }, { label: locale === "en" ? "Channel" : "Canal", value: locale === "en" ? "Direct" : "Directo" }],
      story: {
        chip: locale === "en" ? "Map" : "Mapa",
        title: locale === "en" ? "A location that inspires confidence" : "Ubicacion que da confianza",
        body: locale === "en" ? "Map, address and clear references so arrival feels simple from the first glance." : "Mapa, direccion y referencias claras para que la llegada se sienta simple desde el primer vistazo.",
      },
      cards: sharedCards,
      modals: [
        {
          title: locale === "en" ? "How to arrive" : "Como llegar",
          body: locale === "en" ? "Check airport access, taxis and simple arrival references." : "Consulta aeropuerto, taxis, accesos y referencias simples.",
        },
        {
          title: locale === "en" ? "Around the hotel" : "Entorno del hotel",
          body: locale === "en" ? "Nearby places and useful points to orient yourself better." : "Lugares cercanos y puntos utiles para orientarte mejor.",
        },
        {
          title: locale === "en" ? "Check-in and contact" : "Check-in y contacto",
          body: locale === "en" ? "Schedules, confirmations and direct support before arrival." : "Horarios, confirmaciones y apoyo directo antes de tu llegada.",
        },
      ],
      railTitle: locale === "en" ? "Arrival and surroundings" : "Llegada y entorno",
      railDescription: locale === "en" ? "A simple help layer to locate the hotel with more confidence." : "Una ayuda simple para ubicar el hotel con mayor confianza.",
      faqTitle: locale === "en" ? "Location and arrival" : "Ubicacion y llegada",
      contactDescription: locale === "en" ? "The map page adds a logistical trust layer that helps conversion." : "La pagina de mapa deja lista una capa de confianza logistica que ayuda a convertir mejor.",
    },
  };

  return locale === "es" ? normalizeHotelSpanishValue(map[pageSlug]) : map[pageSlug];
}

function getHotelReferenceRailCopy(pageSlug: Exclude<HotelPageSlug, "hotel">, index: number, locale: HotelLocale) {
  const text: Record<Exclude<HotelPageSlug, "hotel">, string[]> =
    locale === "en"
      ? {
          ofertas: ["Visible promotion, easy to review.", "Clear benefit before booking.", "Ideal for seasons and quick getaways.", "A visual help to decide faster.", "Easy to browse on mobile too."],
          experiencias: ["Arrival or rest scene.", "Helps imagine the stay.", "Useful for details and hotel moments.", "Keeps the reading brief and pleasant.", "Also works for day-use references."],
          habitaciones: ["General room view.", "Shows bed, bathroom or desk.", "Reinforces spaciousness and comfort.", "Makes comparing angles easier without noise.", "Integrates well with direct booking."],
          servicios: ["A visible benefit from the first glance.", "Ideal for breakfast or connectivity.", "Summarizes value without too much text.", "Maintains a clean visual rhythm.", "Can alternate with trust signals."],
          restaurante: ["Soft service scene.", "Helps present atmosphere and flavor.", "Useful for breakfast, brunch or bar.", "Also supports social media traffic.", "Scrolls well on mobile."],
          eventos: ["Space for rooms and setups.", "Can show boardroom or cocktail formats.", "Works as a visual summary.", "Helps imagine the use quickly.", "Fits both corporate and private events."],
          galeria: ["Wide image of the hotel.", "Organizes photos with better rhythm.", "Ideal for architecture and service.", "Keeps the premium tone of the site.", "Can grow without rebuilding the page."],
          mapa: ["Arrival or facade scene.", "Useful for access and references.", "Gives more confidence before booking.", "Can be combined with area images.", "Closes the location promise better."],
        }
      : {
          ofertas: ["Promocion visible y facil de consultar.", "Beneficio claro antes de reservar.", "Ideal para temporadas y escapadas.", "Una ayuda visual para decidir rapido.", "Se recorre bien tambien en celular."],
          experiencias: ["Escena de llegada o descanso.", "Ayuda a imaginar la estadia.", "Sirve para detalles y momentos del hotel.", "Mantiene una lectura breve y agradable.", "Tambien funciona para day use."],
          habitaciones: ["Vista general de la habitacion.", "Muestra cama, bano o escritorio.", "Refuerza amplitud y comodidad.", "Permite comparar angulos sin ruido.", "Se integra bien con reserva directa."],
          servicios: ["Un beneficio visible desde el primer vistazo.", "Ideal para desayuno o conectividad.", "Resume valor sin texto excesivo.", "Mantiene ritmo visual limpio.", "Puede alternarse con senales de confianza."],
          restaurante: ["Escena suave del servicio.", "Ayuda a mostrar ambiente y sabor.", "Sirve para desayuno, brunch o bar.", "Tambien apoya trafico de redes.", "Se desplaza bien en movil."],
          eventos: ["Espacio para salones y montajes.", "Puede mostrar directorio o coctel.", "Funciona como resumen visual.", "Ayuda a imaginar el uso rapidamente.", "Se adapta a corporativo y privado."],
          galeria: ["Imagen amplia del hotel.", "Ordena las fotos con mejor ritmo.", "Ideal para arquitectura y servicio.", "Mantiene el tono premium del sitio.", "Puede crecer sin rehacer la pagina."],
          mapa: ["Escena de llegada o fachada.", "Sirve para accesos y referencias.", "Da mas tranquilidad antes de reservar.", "Puede usarse con imagenes del entorno.", "Cierra mejor la promesa de ubicacion."],
        };
  const selected = text[pageSlug][index % text[pageSlug].length];
  return locale === "es" ? normalizeHotelSpanishText(selected) : selected;
}

function buildHotelReferenceFaqs(items: SiteContent["faqs"], content: SiteContent, locale: HotelLocale) {
  const validItems = items.filter((item) => {
    const text = `${item.question} ${item.answer}`.toLowerCase();
    return !/(tripadvisor|rio hotels tarapoto|rio hotel|trip advisor|referencia|clonarse|tabs detectadas|popup|modal)/i.test(text);
  });

  if (validItems.length > 0) {
    return locale === "es" ? normalizeHotelSpanishValue(validItems) : validItems;
  }

  const hotelName = content.brand.name || "el hotel";
  const checkInWindow = content.location?.hours || (locale === "en" ? "24 hours" : "24 horas");

  const fallbackItems = [
    {
      question: locale === "en" ? "How do I book directly with the hotel?" : "Como reservo directamente con el hotel?",
      answer:
        locale === "en"
          ? `You can write on WhatsApp or use the form to confirm availability, rate and conditions directly with ${hotelName}.`
          : `Puedes escribir por WhatsApp o usar el formulario para confirmar disponibilidad, tarifa y condiciones directamente con ${hotelName}.`,
    },
    {
      question: locale === "en" ? "What reception schedule do you have?" : "Que horario maneja recepcion?",
      answer:
        locale === "en"
          ? `Reception is available ${checkInWindow}. If you arrive late, you can notify the hotel on WhatsApp to keep your booking coordinated.`
          : `La recepcion atiende ${checkInWindow}. Si llegas tarde, puedes avisar por WhatsApp para dejar tu reserva coordinada.`,
    },
    {
      question: locale === "en" ? "Can I ask before paying?" : "Puedo consultar antes de pagar?",
      answer:
        locale === "en"
          ? "Yes. You can check dates, rates and conditions before confirming your booking with the hotel."
          : "Si. Puedes consultar fechas, tarifas y condiciones antes de confirmar tu reserva con el hotel.",
    },
  ];

  return locale === "es" ? normalizeHotelSpanishValue(fallbackItems) : fallbackItems;
}

function normalizeHotelPhone(value?: string) {
  return HOTEL_WHATSAPP_PHONE_DISPLAY;
}


