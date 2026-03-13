import type { ClientProfile, SiteContent } from "@/types/site";
import { ContactForm } from "./ContactForm";
import { HotelBookingBar } from "./HotelBookingBar";
import { HotelHeroShowcase, type HotelHeroSlide } from "./HotelHeroShowcase";
import { HotelMobileMenu } from "./HotelMobileMenu";
import { HotelReferenceSubpage } from "./HotelReferenceSubpage";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { InlineImageField } from "./InlineImageField";
import { InlineTextField } from "./InlineTextField";
import { LandingFaqAccordion } from "./LandingFaqAccordion";
import { LocationBlock } from "./LocationBlock";
import { getGalleryItems, getMediaStyle, getVisibleFaqs, getVisibleServices, getVisibleTestimonials } from "./rendering";
import { resolveBookingWidget } from "@/lib/booking-widget";
import { HOTEL_NAV_ITEMS, normalizeHotelPageSlug } from "@/lib/hotel-pages";

type ReferenceCloneHotelEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  pageSlug?: string;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

type AmenityItem = {
  icon: string;
  label: string;
};

const DEFAULT_AMENITY_ICONS = ["wi-fi", "aire", "seguridad", "ducha", "tv", "desayuno"];

export function ReferenceCloneHotelEngine({ profile, content, pageSlug, editorMode = false, editorImageControls, editorTextControls }: ReferenceCloneHotelEngineProps) {
  const activePage = normalizeHotelPageSlug(pageSlug);
  const pages = HOTEL_NAV_ITEMS;
  const galleryItems = getGalleryItems(content, profile.industry);
  const services = getVisibleServices(content);
  const faqs = getVisibleFaqs(content).slice(0, 4);
  const testimonials = getVisibleTestimonials(content).slice(0, 3);
  const bookingWidget = resolveBookingWidget(content, profile);
  const bookingOptions = bookingWidget.options?.slice(0, 3) ?? [];
  const heroImage = content.brand.heroImageSrc || galleryItems[0]?.imageSrc || "";
  const heroImagePosition = content.brand.heroImagePosition || galleryItems[0]?.imagePosition;
  const heroSlides = buildHeroSlides(content, services, galleryItems, heroImage, heroImagePosition);
  const roomGallery = [galleryItems[0], ...galleryItems.slice(1, 4)].filter(Boolean);
  const mainRoom = roomGallery[0];
  const relatedRooms = services.slice(0, 3).map((service, index) => ({
    title: service.title,
    description: service.description,
    imageSrc: service.imageSrc || galleryItems[index + 1]?.imageSrc || heroImage,
    imagePosition: service.imagePosition || galleryItems[index + 1]?.imagePosition || heroImagePosition,
  }));
  const amenities = buildAmenityItems(content);
  const contactPhone = content.contact.whatsappNumber || profile.brandConfig.whatsappNumber;
  const reservationHref = content.brand.primaryCtaHref || buildWhatsappHref(contactPhone, content.brand.name, bookingOptions[0]?.label);
  const detailsHref = content.brand.secondaryCtaHref || "#habitaciones";
  const mainTitle = content.brand.name;
  const subtitle = content.brand.subheadline || content.narrative.body;
  const introTitle = content.brand.headline;
  const introCopy = content.narrative.body || content.brand.description;
  const bookingCtaLabel = bookingWidget.bookingCtaLabel || content.brand.primaryCtaLabel || "Reservar";
  const heroUploading = editorMode && editorImageControls?.uploadingField === "hero";
  const galleryUploading = editorMode && editorImageControls?.uploadingField === "galeria 1";

  if (activePage !== "hotel") {
    return (
      <HotelReferenceSubpage
        content={content}
        pageSlug={activePage}
        profile={profile}
      />
    );
  }

  return (
      <>
      <section className="hotel-reference-shell" id="inicio" data-editor-section="hero">
        <InlineImageField enabled={editorMode} fieldKey="hero" label="Hero hotel" onChange={editorMode ? editorImageControls?.onHeroImageChange : undefined} uploading={heroUploading}>
          <div className={`hotel-reference-hero ${heroImage ? "has-media-image" : "media-fallback-hotel"}`}>
            <HotelHeroShowcase slides={heroSlides} />
            <div className="hotel-reference-hero-overlay" aria-hidden="true" />

            <header className="hotel-reference-header">
              <a className="hotel-reference-brand" href="/" aria-label={`Ir al inicio de ${mainTitle}`}>
                <span className="hotel-reference-brand-mark" aria-hidden="true">
                  v
                </span>
                <span className="hotel-reference-brand-copy">
                  {editorMode ? (
                    <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre del hotel" section="hero" value={mainTitle} />
                  ) : (
                    <strong>{mainTitle}</strong>
                  )}
                  {editorMode ? (
                    <InlineTextField as="span" className="hotel-reference-brand-small" controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Tag del hero" section="hero" value={content.brand.heroTag || profile.industry} />
                  ) : (
                    <small>{content.brand.heroTag || profile.industry}</small>
                  )}
                </span>
              </a>

              <nav className="hotel-reference-nav" aria-label="Secciones principales">
                {pages.map((page, index) => (
                  <a href={page.href} key={`${page.label}-${index}`}>
                    {editorMode ? (
                      <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${index}`} label={`Link hotel ${index + 1}`} section="hero" showTrigger={false} value={page.label} />
                    ) : (
                      page.label
                    )}
                  </a>
                ))}
              </nav>

              <a className="hotel-reference-header-cta" href={reservationHref}>
                {editorMode ? (
                  <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="bookingWidget.bookingCtaLabel" label="CTA header hotel" section="hero" showTrigger={false} value={bookingCtaLabel} />
                ) : (
                  bookingCtaLabel
                )}
              </a>
              <HotelMobileMenu activeSlug={activePage} bookingCtaLabel={bookingCtaLabel} pages={pages} reservationHref={reservationHref} />
            </header>

            <div className="hotel-reference-hero-copy">
              {editorMode ? (
                <InlineTextField as="span" className="hotel-reference-kicker" controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Kicker hero hotel" section="hero" value={content.brand.heroTag || "Habitacion destacada"} />
              ) : (
                <span className="hotel-reference-kicker">{content.brand.heroTag || "Habitacion destacada"}</span>
              )}
              {editorMode ? (
                <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="brand.headline" label="Titular hero hotel" minRows={4} multiline section="hero" value={introTitle} />
              ) : (
                <h2>{introTitle}</h2>
              )}
              {editorMode ? (
                <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.subheadline" label="Subtitulo hero hotel" minRows={3} multiline section="hero" value={subtitle} />
              ) : (
                <p>{subtitle}</p>
              )}
            </div>
          </div>
        </InlineImageField>

        <HotelBookingBar brandName={content.brand.name} bookingWidget={bookingWidget} contactPhone={contactPhone} />
      </section>

      <section className="scene hotel-reference-intro" id="habitaciones" data-animate data-animate-delay="60">
        <nav className="hotel-reference-breadcrumbs" aria-label="Breadcrumb">
          <a href="#inicio">Home</a>
          <span>/</span>
          <a href="#habitaciones">Habitaciones</a>
          <span>/</span>
          {editorMode ? (
            <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre en breadcrumbs" section="story" value={mainTitle} />
          ) : (
            <strong>{mainTitle}</strong>
          )}
        </nav>
        {editorMode ? (
          <InlineTextField as="h1" controls={editorTextControls} enabled fieldKey="brand.name" label="Titulo principal hotel" section="story" value={mainTitle} />
        ) : (
          <h1>{mainTitle}</h1>
        )}
        {editorMode ? (
          <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.subheadline" label="Descripcion principal hotel" minRows={3} multiline section="story" value={subtitle} />
        ) : (
          <p>{subtitle}</p>
        )}
      </section>

      <section className="scene hotel-reference-gallery" data-animate data-animate-delay="90">
        <InlineImageField enabled={editorMode} fieldKey="galeria-1" label="Galeria principal hotel" onChange={editorMode ? ((event) => editorImageControls?.onGalleryImageChange(0, event)) : undefined} uploading={galleryUploading}>
          <div
            className={`hotel-reference-gallery-media ${mainRoom?.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
            style={getMediaStyle(mainRoom?.imageSrc || heroImage, "0.08", mainRoom?.imagePosition || heroImagePosition)}
          />
        </InlineImageField>
        <div className="hotel-reference-gallery-dots" aria-hidden="true">
          <span className="is-active" />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="scene hotel-reference-tabs" data-animate data-animate-delay="110">
        <input className="hotel-reference-tab-input" defaultChecked id="hotel-tab-1" name="hotel-tabs" type="radio" />
        <input className="hotel-reference-tab-input" id="hotel-tab-2" name="hotel-tabs" type="radio" />
        <input className="hotel-reference-tab-input" id="hotel-tab-3" name="hotel-tabs" type="radio" />

        <div className="hotel-reference-tab-shell">
          <div className="hotel-reference-tab-list" role="tablist" aria-label="Categorias de estancia">
            <label className="hotel-reference-tab-trigger" htmlFor="hotel-tab-1">Suite signature</label>
            <label className="hotel-reference-tab-trigger" htmlFor="hotel-tab-2">Escapada flexible</label>
            <label className="hotel-reference-tab-trigger" htmlFor="hotel-tab-3">Reserva directa</label>
          </div>

          <div className="hotel-reference-tab-panels">
            <article className="hotel-reference-tab-panel hotel-reference-tab-panel-1">
              <span className="scene-chip">Tab / panel</span>
              <h3>Una ficha amplia para vender la habitacion destacada.</h3>
              <p>Replica la sensacion del bloque tabulado del referente: texto corto, beneficios visibles y un CTA que llega antes del siguiente scroll.</p>
              <ul className="hotel-reference-tab-points">
                <li>Cama amplia y luz calmada</li>
                <li>Desayuno y WiFi visibles</li>
                <li>Reserva directa por WhatsApp</li>
              </ul>
            </article>
            <article className="hotel-reference-tab-panel hotel-reference-tab-panel-2">
              <span className="scene-chip">Tab / panel</span>
              <h3>Un panel para day use, late check-out o estadias cortas.</h3>
              <p>Permite cambiar contenido sin tocar la composicion principal y mantener opciones de estancia listas para campana o temporada.</p>
              <ul className="hotel-reference-tab-points">
                <li>Ingreso agil</li>
                <li>Uso por horas o noche</li>
                <li>Upgrade segun disponibilidad</li>
              </ul>
            </article>
            <article className="hotel-reference-tab-panel hotel-reference-tab-panel-3">
              <span className="scene-chip">Tab / panel</span>
              <h3>Un panel final para objeciones, tarifas y accion.</h3>
              <p>Sirve para reforzar politica de reserva, soporte humano y beneficios de evitar intermediarios.</p>
              <ul className="hotel-reference-tab-points">
                <li>Confirmacion mas clara</li>
                <li>Atencion directa del hotel</li>
                <li>Condiciones editables</li>
              </ul>
            </article>
          </div>

          <details className="hotel-reference-inline-modal">
            <summary className="hotel-reference-inline-summary">
              <span>Popup / apoyo</span>
              <strong>Ver detalle</strong>
            </summary>
            <div className="hotel-reference-inline-panel">
              <span className="scene-chip">Popup</span>
              <h3>Una capa emergente para ampliar beneficios o condiciones.</h3>
              <p>Este patron imita el comportamiento de popup del referente sin copiar textos ni estructura propietaria. Aqui puedes mostrar upgrade, politicas o un mini brief de reserva.</p>
              <a className="primary-button" href={reservationHref}>Reservar ahora</a>
            </div>
          </details>
        </div>
      </section>

      <section className="scene hotel-reference-details" data-animate data-animate-delay="130">
        <div className="hotel-reference-amenities">
          {amenities.map((amenity, index) => (
            <article className="hotel-reference-amenity" key={`${amenity.label}-${index}`}>
              <span className={`hotel-reference-amenity-icon icon-${DEFAULT_AMENITY_ICONS[index % DEFAULT_AMENITY_ICONS.length]}`} aria-hidden="true" />
              {editorMode && index < content.highlights.length ? (
                <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`highlights.${index}`} label={`Amenidad ${index + 1}`} section="services" value={amenity.label} />
              ) : (
                <strong>{amenity.label}</strong>
              )}
            </article>
          ))}
        </div>

        <article className="hotel-reference-room-copy">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.storyChip" label="Chip de suite" section="story" value={content.uiText?.storyChip || "Suite"} />
          ) : (
            <span className="scene-chip">Suite</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="brand.headline" label="Titulo de habitacion" minRows={3} multiline section="story" value={introTitle} />
          ) : (
            <h2>{introTitle}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.body" label="Cuerpo de habitacion" minRows={4} multiline section="story" value={introCopy} />
          ) : (
            <p>{introCopy}</p>
          )}

          <div className="hotel-reference-room-actions">
            <a className="primary-button" href={reservationHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="bookingWidget.bookingCtaLabel" label="CTA principal habitacion" section="story" showTrigger={false} value={bookingCtaLabel} />
              ) : (
                bookingCtaLabel
              )}
            </a>
            <a className="secondary-button" href={detailsHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.secondaryCtaLabel" label="CTA secundario habitacion" section="story" showTrigger={false} value={content.brand.secondaryCtaLabel || "Ver detalles"} />
              ) : (
                "Ver detalles"
              )}
            </a>
          </div>

          {bookingOptions.length ? (
            <div className="hotel-reference-rate-grid">
              {bookingOptions.map((option) => (
                <article className={`hotel-reference-rate-card${option.highlighted ? " is-highlighted" : ""}`} key={option.id}>
                  <span>{option.badge || option.roomType}</span>
                  <strong>{option.label}</strong>
                  <p>{option.summary}</p>
                  <b>{option.price}</b>
                </article>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <section className="scene hotel-reference-related" data-animate data-animate-delay="170" id="servicios">
        <div className="hotel-reference-section-heading">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label="Chip de habitaciones relacionadas" section="services" value={content.uiText?.supportLabel || "Otras habitaciones"} />
          ) : (
            <span className="scene-chip">Otras habitaciones</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="uiText.storyTitle" label="Titulo de habitaciones relacionadas" minRows={3} multiline section="services" value={content.uiText?.storyTitle || "Explora habitaciones con la misma linea visual del hotel."} />
          ) : (
            <h2>Explora habitaciones con la misma linea visual del hotel.</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Descripcion de habitaciones relacionadas" minRows={3} multiline section="services" value={content.narrative.goal || "Bloques, radios, espacios y ritmo editorial ajustados para acercarse al layout de referencia."} />
          ) : (
            <p>Bloques, radios, espacios y ritmo editorial ajustados para acercarse al layout de referencia.</p>
          )}
        </div>

        <div className="hotel-reference-related-grid">
          {relatedRooms.map((room, index) => (
            <article className="hotel-reference-room-card" key={room.title}>
              <InlineImageField enabled={editorMode} fieldKey={`servicio-${index + 1}`} label={`Habitacion ${index + 1}`} onChange={editorMode ? ((event) => editorImageControls?.onServiceImageChange(index, event)) : undefined} uploading={editorMode && editorImageControls?.uploadingField === `servicio ${index + 1}`}>
                <div
                  className={`hotel-reference-room-card-media ${room.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
                  style={getMediaStyle(room.imageSrc, "0.08", room.imagePosition)}
                />
              </InlineImageField>
              <div className="hotel-reference-room-card-copy">
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`services.${index}.title`} label={`Titulo de habitacion ${index + 1}`} section="services" value={room.title} />
                ) : (
                  <strong>{room.title}</strong>
                )}
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`services.${index}.description`} label={`Descripcion de habitacion ${index + 1}`} minRows={3} multiline section="services" value={room.description} />
                ) : (
                  <p>{room.description}</p>
                )}
              </div>
              <div className="hotel-reference-room-card-actions">
                <a className="secondary-button" href="#habitaciones">
                  Ver mas
                </a>
                <a className="primary-button" href={reservationHref}>
                  Reserva ahora
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {testimonials.length ? (
        <section className="scene hotel-reference-proof" data-animate data-animate-delay="210">
          <div className="hotel-reference-section-heading">
            {editorMode ? (
              <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.testimonialsChip" label="Chip testimonios hotel" section="testimonials" value={content.uiText?.testimonialsChip || "Resenas"} />
            ) : (
              <span className="scene-chip">Resenas</span>
            )}
            {editorMode ? (
              <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="uiText.testimonialsTitle" label="Titulo testimonios hotel" minRows={3} multiline section="testimonials" value={content.uiText?.testimonialsTitle || "Prueba social visible antes del cierre de reserva."} />
            ) : (
              <h2>Prueba social visible antes del cierre de reserva.</h2>
            )}
          </div>

          <div className="hotel-reference-proof-grid">
            {testimonials.map((testimonial, index) => (
              <article className="quote-card hotel-reference-proof-card" key={testimonial.name}>
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.name`} label={`Nombre testimonio hotel ${index + 1}`} section="testimonials" value={testimonial.name} />
                ) : (
                  <strong>{testimonial.name}</strong>
                )}
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.role`} label={`Rol testimonio hotel ${index + 1}`} section="testimonials" value={testimonial.location || testimonial.role} />
                ) : (
                  <span>{testimonial.location || testimonial.role}</span>
                )}
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${index}.quote`} label={`Cita testimonio hotel ${index + 1}`} minRows={3} multiline section="testimonials" value={testimonial.quote} />
                ) : (
                  <p>"{testimonial.quote}"</p>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {faqs.length ? (
        <LandingFaqAccordion
          editorMode={editorMode}
          editorTextControls={editorTextControls}
          items={faqs}
          label={content.uiText?.faqChip || "Preguntas frecuentes"}
          title={content.uiText?.faqTitle || "Dudas comunes antes de reservar"}
        />
      ) : null}

      {content.location?.address ? (
        <LocationBlock
          contactEmail={content.contact.email}
          contactPhone={content.contact.whatsappNumber}
          editorMode={editorMode}
          editorTextControls={editorTextControls}
          location={content.location}
        />
      ) : null}

      <ContactForm
        description={content.contact.description}
        editorMode={editorMode}
        editorTextControls={editorTextControls}
        title={content.contact.title}
        whatsappNumber={content.contact.whatsappNumber}
      />

      <footer className="scene hotel-reference-footer">
        <div className="hotel-reference-footer-brand">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Chip footer hotel" section="contact" value={profile.industry} />
          ) : (
            <span className="scene-chip">{profile.industry}</span>
          )}
          {editorMode ? (
            <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre footer hotel" section="contact" value={mainTitle} />
          ) : (
            <strong>{mainTitle}</strong>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.description" label="Descripcion footer hotel" minRows={3} multiline section="contact" value={content.brand.description} />
          ) : (
            <p>{content.brand.description}</p>
          )}
        </div>
        <div className="hotel-reference-footer-links">
          {pages.map((page, index) => (
            <a href={page.href} key={`${page.label}-${index}`}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${index}`} label={`Link footer hotel ${index + 1}`} section="contact" showTrigger={false} value={page.label} />
              ) : (
                page.label
              )}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

function buildAmenityItems(content: SiteContent): AmenityItem[] {
  const amenities = [
    ...content.highlights,
    ...content.bookingWidget?.options?.flatMap((option) => option.perks) ?? [],
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  const uniqueAmenities = Array.from(new Set(amenities)).slice(0, 6);
  if (uniqueAmenities.length) {
    return uniqueAmenities.map((label, index) => ({
      icon: DEFAULT_AMENITY_ICONS[index % DEFAULT_AMENITY_ICONS.length],
      label,
    }));
  }

  return [
    { icon: "wi-fi", label: "WiFi rapido" },
    { icon: "aire", label: "Aire acondicionado" },
    { icon: "seguridad", label: "Caja de seguridad" },
    { icon: "ducha", label: "Bano completo" },
    { icon: "tv", label: "TV por cable" },
    { icon: "desayuno", label: "Desayuno incluido" },
  ];
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
      title: content.brand.heroTag || "Reserva directa",
      subtitle: content.brand.subheadline || content.narrative.goal,
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

function buildWhatsappHref(phone: string, brandName: string, planLabel?: string) {
  const cleanPhone = String(phone || "").replace(/[^\d]/g, "");
  if (!cleanPhone) {
    return "#contacto";
  }

  const lines = [
    "Hola",
    "",
    `Quiero reservar en ${brandName}.`,
    planLabel ? `Me interesa la opcion ${planLabel}.` : "Quiero conocer habitaciones y tarifas.",
  ];

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
