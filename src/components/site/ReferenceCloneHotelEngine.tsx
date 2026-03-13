import type { ClientProfile, SiteContent } from "@/types/site";
import { ContactForm } from "./ContactForm";
import { HotelBookingBar } from "./HotelBookingBar";
import { HotelFloatingCta } from "./HotelFloatingCta";
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
  const tripadvisorHref = "https://www.tripadvisor.es/Hotel_Review-g658384-d12839312-Reviews-Rio_Hotels_Tarapoto-Tarapoto_San_Martin_Region.html";
  const activePage = normalizeHotelPageSlug(pageSlug);
  const pages = HOTEL_NAV_ITEMS;
  const galleryItems = getGalleryItems(content, profile.industry);
  const services = getVisibleServices(content);
  const faqs = sanitizeHotelFaqs(getVisibleFaqs(content).slice(0, 4), content);
  const testimonials = getVisibleTestimonials(content).slice(0, 3);
  const bookingWidget = resolveBookingWidget(content, profile);
  const bookingOptions = bookingWidget.options?.slice(0, 3) ?? [];
  const heroImage = content.brand.heroImageSrc || galleryItems[0]?.imageSrc || "";
  const heroImagePosition = content.brand.heroImagePosition || galleryItems[0]?.imagePosition;
  const heroSlides = buildHeroSlides(content, services, galleryItems, heroImage, heroImagePosition);
  const roomGallery = [galleryItems[0], ...galleryItems.slice(1, 4)].filter(Boolean);
  const mainRoom = roomGallery[0];
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
  const introSectionTitle = content.narrative.title || "Habitaciones, ubicacion y reserva directa en un solo recorrido.";
  const introSectionCopy = content.brand.description || subtitle;
  const bookingCtaLabel = bookingWidget.bookingCtaLabel || content.brand.primaryCtaLabel || "Reservar";
  const heroUploading = editorMode && editorImageControls?.uploadingField === "hero";
  const galleryUploading = editorMode && editorImageControls?.uploadingField === "galeria 1";

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
          <InlineTextField as="h1" controls={editorTextControls} enabled fieldKey="narrative.title" label="Titulo principal hotel" section="story" value={introSectionTitle} />
        ) : (
          <h1>{introSectionTitle}</h1>
        )}
        {editorMode ? (
          <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.description" label="Descripcion principal hotel" minRows={3} multiline section="story" value={introSectionCopy} />
        ) : (
          <p>{introSectionCopy}</p>
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
          <div className="hotel-reference-tab-sidebar">
            <article className="hotel-reference-tab-intro">
              <span className="scene-chip">Estancia curada</span>
              <h3>Explora la estancia correcta segun tu viaje y reserva sin friccion.</h3>
              <p>Este bloque ordena la decision: habitacion principal, opcion flexible y beneficio de reservar directo, todo antes de llegar al formulario final.</p>
            </article>

            <div className="hotel-reference-tab-list" role="tablist" aria-label="Categorias de estancia">
              <label className="hotel-reference-tab-trigger" htmlFor="hotel-tab-1">Suite principal</label>
              <label className="hotel-reference-tab-trigger" htmlFor="hotel-tab-2">Estadia flexible</label>
              <label className="hotel-reference-tab-trigger" htmlFor="hotel-tab-3">Reserva directa</label>
            </div>

            <details className="hotel-reference-inline-modal">
              <summary className="hotel-reference-inline-summary">
                <span>Detalle rapido</span>
                <strong>Ver mas</strong>
              </summary>
              <div className="hotel-reference-inline-panel">
                <div className="hotel-reference-inline-panel-content">
                  <span className="scene-chip">Popup</span>
                  <h3>Resumen rapido antes de dar el siguiente paso.</h3>
                  <p>Aqui puedes reforzar politica de llegada, horarios, ayuda por WhatsApp o beneficios de reservar directo sin saturar la vista principal.</p>
                  <a className="primary-button" href={reservationHref}>Reservar ahora</a>
                </div>
              </div>
            </details>
          </div>

          <div className="hotel-reference-tab-panels">
            <article className="hotel-reference-tab-panel hotel-reference-tab-panel-1">
              <div className="hotel-reference-tab-panel-head">
                <span className="scene-chip">Habitacion</span>
                <span className="hotel-reference-tab-kicker">Suite amplia</span>
              </div>
              <h3>Una suite comoda para descansar con mas calma en Tarapoto.</h3>
              <p>Ideal para quien prioriza amplitud, descanso y una reserva clara desde el primer contacto con el hotel.</p>
              <div className="hotel-reference-tab-content">
                <ul className="hotel-reference-tab-points">
                  <li>Cama amplia y ambiente tranquilo</li>
                  <li>WiFi, aire acondicionado y desayuno</li>
                  <li>Confirmacion directa por WhatsApp</li>
                </ul>
                <div className="hotel-reference-tab-note">
                  <strong>Ideal para</strong>
                  <span>Parejas, viajeros de descanso o quienes quieren una habitacion principal con mejor contexto antes de reservar.</span>
                </div>
              </div>
              <div className="hotel-reference-tab-actions">
                <a className="primary-button" href={reservationHref}>Reservar</a>
                <a className="hotel-reference-tab-link" href={detailsHref}>Ver detalles de la habitacion</a>
              </div>
            </article>
            <article className="hotel-reference-tab-panel hotel-reference-tab-panel-2">
              <div className="hotel-reference-tab-panel-head">
                <span className="scene-chip">Flexible</span>
                <span className="hotel-reference-tab-kicker">Flexible</span>
              </div>
              <h3>Una opcion flexible para estancias cortas o llegadas practicas.</h3>
              <p>Pensada para viajeros de paso, escalas o visitas cortas que buscan descansar sin complicar la reserva.</p>
              <div className="hotel-reference-tab-content">
                <ul className="hotel-reference-tab-points">
                  <li>Ingreso agil y coordinacion rapida</li>
                  <li>Uso por horas o noche completa</li>
                  <li>Upgrade sujeto a disponibilidad</li>
                </ul>
                <div className="hotel-reference-tab-note">
                  <strong>Ideal para</strong>
                  <span>Viajeros de trabajo, escalas o llegadas fuera de horario que necesitan una opcion simple y directa.</span>
                </div>
              </div>
              <div className="hotel-reference-tab-actions">
                <a className="primary-button" href={reservationHref}>Consultar disponibilidad</a>
                <a className="hotel-reference-tab-link" href={detailsHref}>Explorar beneficios</a>
              </div>
            </article>
            <article className="hotel-reference-tab-panel hotel-reference-tab-panel-3">
              <div className="hotel-reference-tab-panel-head">
                <span className="scene-chip">Directo</span>
                <span className="hotel-reference-tab-kicker">Reserva directa</span>
              </div>
              <h3>Reserva directo con el hotel y resuelve dudas antes de confirmar.</h3>
              <p>Este panel refuerza la atencion humana, la claridad de tarifa y la ventaja de escribir sin intermediarios.</p>
              <div className="hotel-reference-tab-content">
                <ul className="hotel-reference-tab-points">
                  <li>Confirmacion rapida de fechas</li>
                  <li>Atencion directa del hotel</li>
                  <li>Coordinacion clara de llegada</li>
                </ul>
                <div className="hotel-reference-tab-note">
                  <strong>Ideal para</strong>
                  <span>Huespedes que quieren validar disponibilidad, tarifa y ubicacion sin salir de la pagina.</span>
                </div>
              </div>
              <div className="hotel-reference-tab-actions">
                <a className="primary-button" href={reservationHref}>Reservar directo</a>
                <a className="hotel-reference-tab-link" href={detailsHref}>Revisar condiciones</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {testimonials.length ? (
        <section className="scene hotel-reference-proof" data-animate data-animate-delay="125">
          <div className="hotel-reference-section-heading">
            {editorMode ? (
              <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.testimonialsChip" label="Chip testimonios hotel" section="testimonials" value={content.uiText?.testimonialsChip || "Verificado"} />
            ) : (
              <span className="scene-chip">{content.uiText?.testimonialsChip || "Verificado"}</span>
            )}
            {editorMode ? (
              <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="uiText.testimonialsTitle" label="Titulo testimonios hotel" minRows={3} multiline section="testimonials" value={content.uiText?.testimonialsTitle || "Datos reales antes de reservar."} />
            ) : (
              <h2>{content.uiText?.testimonialsTitle || "Datos reales antes de reservar."}</h2>
            )}
          </div>

          <div className="hotel-reference-proof-layout">
            <article className="hotel-reference-proof-summary">
              <div className="hotel-reference-proof-brand">
                <span className="hotel-reference-proof-brand-mark" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <div>
                  <strong>Tripadvisor</strong>
                  <span>Resenas reales de clientes</span>
                </div>
              </div>
              <div className="hotel-reference-proof-score">
                <strong>4,3</strong>
                <span>/ 5</span>
              </div>
              <div className="hotel-reference-proof-stars" aria-label="Valoracion general 4,3 de 5">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span className="is-muted">★</span>
              </div>
              <p>Basado en 6 opiniones publicas de la ficha real del hotel. La lectura se centra en limpieza, atencion del personal y cercania al aeropuerto.</p>
              <a className="hotel-reference-proof-link" href={tripadvisorHref} target="_blank" rel="noopener noreferrer">
                Ver ficha completa
              </a>
            </article>

            <div className="hotel-reference-proof-grid">
            {testimonials.map((testimonial, index) => (
              <article className="quote-card hotel-reference-proof-card" key={testimonial.name}>
                <div className="hotel-reference-proof-card-top">
                  <span className="hotel-reference-proof-card-source">Tripadvisor</span>
                  <span className="hotel-reference-proof-card-divider" aria-hidden="true" />
                  {editorMode ? (
                    <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.role`} label={`Rol testimonio hotel ${index + 1}`} section="testimonials" value={testimonial.role} />
                  ) : (
                    <span>{testimonial.role}</span>
                  )}
                </div>
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
                  <p>{testimonial.quote}</p>
                )}
              </article>
            ))}
            </div>
          </div>
        </section>
      ) : null}

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
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label="Chip de habitaciones relacionadas" section="services" value={content.uiText?.supportLabel || "Habitaciones destacadas"} />
          ) : (
            <span className="scene-chip">{content.uiText?.supportLabel || "Habitaciones destacadas"}</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="uiText.storyTitle" label="Titulo de habitaciones relacionadas" minRows={3} multiline section="services" value={content.uiText?.storyTitle || "Conoce habitaciones y opciones pensadas para distintos tipos de viaje."} />
          ) : (
            <h2>{content.uiText?.storyTitle || "Conoce habitaciones y opciones pensadas para distintos tipos de viaje."}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Descripcion de habitaciones relacionadas" minRows={3} multiline section="services" value={content.narrative.goal || "Selecciona la habitacion que mejor encaja con tu estadia y pasa a reserva directa sin perder claridad."} />
          ) : (
            <p>{content.narrative.goal || "Selecciona la habitacion que mejor encaja con tu estadia y pasa a reserva directa sin perder claridad."}</p>
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
                  Ver habitacion
                </a>
                <a className="primary-button" href={reservationHref}>
                  Reservar ahora
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

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
          mediaItems={locationMedia}
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

      <HotelFloatingCta href={reservationHref} label="Consultar ahora" note="Disponibilidad y tarifas" />
    </>
  );
}

function buildAmenityItems(content: SiteContent): AmenityItem[] {
  const amenities = [
    ...content.bookingWidget?.options?.flatMap((option) => option.perks) ?? [],
    ...content.highlights.filter(isHotelBenefit),
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

function isHotelBenefit(value: string) {
  const text = value.trim().toLowerCase();
  if (!text) {
    return false;
  }

  const invalidPatterns = [
    "conservar ",
    "mantener ",
    "paleta",
    "branding",
    "tipografico",
    "layout",
    "referencia",
    "widgets",
    "cta-group",
    "popup",
    "form x",
  ];

  return !invalidPatterns.some((pattern) => text.includes(pattern));
}

function sanitizeHotelFaqs(items: SiteContent["faqs"], content: SiteContent) {
  const validItems = items.filter((item) => {
    const text = `${item.question} ${item.answer}`.toLowerCase();
    return !["clonarse", "tabs detectadas", "modal", "referencia"].some((pattern) => text.includes(pattern));
  });

  if (validItems.length) {
    return validItems;
  }

  return [
    {
      question: "Como puedo consultar disponibilidad?",
      answer: "Puedes escribir por WhatsApp desde la web y confirmar fechas, tipo de habitacion y tarifa disponible.",
    },
    {
      question: "La recepcion atiende todo el dia?",
      answer: "Si. El hotel comunica recepcion 24 horas para facilitar llegadas, consultas y coordinacion de reserva.",
    },
    {
      question: "Donde esta ubicado el hotel?",
      answer: `La ubicacion mostrada es ${content.location?.address || "Tarapoto"}, con acceso directo a Google Maps desde la pagina.`,
    },
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
