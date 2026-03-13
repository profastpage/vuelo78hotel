import type { ClientProfile, SiteContent } from "@/types/site";
import { ContactForm } from "./ContactForm";
import { renderBalancedHeroHeadline, renderBalancedSectionTitle, splitHeroHeadline } from "./headline-balance";
import { InlineImageField } from "./InlineImageField";
import { LandingFaqAccordion } from "./LandingFaqAccordion";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";
import { getGalleryItems, getMediaStyle, getPageHref, getStoryLabels, getVisibleFaqs, getVisibleHighlights, getVisibleServices, getVisibleTestimonials } from "./rendering";

type ProfessionalWebsiteEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
  siteKind: "brand" | "agency";
};

export function ProfessionalWebsiteEngine({
  profile,
  content,
  editorMode = false,
  editorImageControls,
  editorTextControls,
  siteKind,
}: ProfessionalWebsiteEngineProps) {
  const labels = getStoryLabels(profile, content);
  const services = getVisibleServices(content).slice(0, 4);
  const galleryItems = getGalleryItems(content, profile.industry).slice(0, 4);
  const testimonials = getVisibleTestimonials(content).slice(0, 4);
  const faqs = getVisibleFaqs(content).slice(0, 5);
  const highlights = getVisibleHighlights(content).slice(0, 4);
  const stats = content.stats.slice(0, 4);
  const trustMetrics =
    stats.length > 0
      ? stats
      : [
          { label: "Proyecto", value: profile.projectType },
          { label: "Rubros", value: profile.industry },
          { label: "CTA", value: "Visible" },
        ];
  const aboutLead = content.narrative.title || content.brand.description;
  const aboutBody = content.narrative.body || content.brand.subheadline;
  const benefitCards =
    highlights.length > 0
      ? highlights.map((highlight, index) => ({
          title: highlight,
          body: services[index]?.description || content.narrative.goal,
        }))
      : services.map((service) => ({
          title: service.title,
          body: service.description,
        }));
  const ctaTitle =
    siteKind === "agency"
      ? "Cada bloque debe empujar a la siguiente accion."
      : "Mensaje, prueba y CTA en la misma direccion.";
  const heroHeadlineLines = splitHeroHeadline(content.brand.headline);

  return (
    <>
      <header
        className="scene scene-topline website-topline"
        data-editor-section="hero"
        id="inicio"
        data-animate
        data-animate-delay="0"
      >
        <div className="brand-lockup website-lockup">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Hero tag" section="hero" value={content.brand.heroTag || profile.industry} />
          ) : (
            <span className="scene-chip">{content.brand.heroTag || profile.industry}</span>
          )}
          {editorMode ? (
            <InlineTextField
              as="h1"
              controls={editorTextControls}
              enabled
              fieldKey="brand.name"
              label="Nombre visible"
              section="hero"
              value={content.brand.name}
            />
          ) : (
            <h1>{content.brand.name}</h1>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.description" label="Descripcion corta" minRows={3} multiline section="hero" value={content.brand.description} />
          ) : (
            <p>{content.brand.description}</p>
          )}
        </div>
        <nav className="topline-nav" aria-label="Secciones">
          {content.pages.slice(0, 5).map((page, index) => (
            <a href={getPageHref(page)} key={`${page}-${index}`}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${index}`} label={`Link ${index + 1}`} section="hero" showTrigger={false} value={page} />
              ) : (
                page
              )}
            </a>
          ))}
        </nav>
      </header>

      <section
        className="scene scene-website-hero"
        data-editor-section="hero visual story"
        id="nosotros"
        data-animate
        data-animate-delay="40"
      >
        <div className="website-hero-copy">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Hero tag" section="hero" value={content.brand.heroTag || profile.industry} />
          ) : (
            <span className="scene-chip">{content.brand.heroTag || content.theme.visualStyle || profile.brandConfig.visualStyle}</span>
          )}
          {editorMode ? (
            <InlineTextField
              as="h2"
              className="hero-title"
              controls={editorTextControls}
              displayValue={renderBalancedHeroHeadline(content.brand.headline)}
              enabled
              fieldKey="brand.headline"
              label="Titular principal"
              minRows={3}
              multiline
              section="hero"
              value={content.brand.headline}
            />
          ) : (
            <h2 className="hero-title" data-line-count={heroHeadlineLines.length}>
              {renderBalancedHeroHeadline(content.brand.headline)}
            </h2>
          )}
          {editorMode ? (
            <InlineTextField
              as="p"
              className="hero-lead"
              controls={editorTextControls}
              enabled
              fieldKey="brand.subheadline"
              label="Subtitular"
              minRows={3}
              multiline
              section="hero"
              value={content.brand.subheadline}
            />
          ) : (
            <p className="hero-lead">{content.brand.subheadline}</p>
          )}
          <div className="scene-actions">
            <a className="primary-button" href={content.brand.primaryCtaHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.primaryCtaLabel" label="CTA principal" section="hero" showTrigger={false} value={content.brand.primaryCtaLabel} />
              ) : (
                content.brand.primaryCtaLabel
              )}
            </a>
            <a className="secondary-button" href={content.brand.secondaryCtaHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.secondaryCtaLabel" label="CTA secundario" section="hero" showTrigger={false} value={content.brand.secondaryCtaLabel} />
              ) : (
                content.brand.secondaryCtaLabel
              )}
            </a>
          </div>
        </div>

        <div className="website-hero-stage">
          {editorMode ? (
            <InlineImageField
              enabled={editorMode}
              fieldKey="hero"
              label="Hero principal"
              onChange={editorMode ? editorImageControls?.onHeroImageChange : undefined}
              uploading={editorMode && editorImageControls?.uploadingField === "hero"}
            >
              <article
                className={`media-panel media-panel-main website-hero-media ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-a"}`}
                style={getMediaStyle(content.brand.heroImageSrc, "0.24", content.brand.heroImagePosition)}
              />
            </InlineImageField>
          ) : (
            <article
              className={`media-panel media-panel-main website-hero-media ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-a"}`}
              style={getMediaStyle(content.brand.heroImageSrc, "0.24", content.brand.heroImagePosition)}
            />
          )}
          <div className="website-trust-strip">
            {trustMetrics.slice(0, 3).map((metric, index) => (
              <article className="metric-ribbon website-trust-card" key={`${metric.label}-${metric.value}`}>
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`stats.${index}.label`} label={`Label metrica ${index + 1}`} section="story" value={metric.label} />
                ) : (
                  <span>{metric.label}</span>
                )}
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`stats.${index}.value`} label={`Valor metrica ${index + 1}`} section="story" value={metric.value} />
                ) : (
                  <strong>{metric.value}</strong>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scene scene-website-about" data-animate data-animate-delay="80">
        <div className="section-copy website-section-copy">
          <span className="scene-chip">About</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Contexto y autoridad para explicar mejor tu oferta.")}</h2>
          <p>{content.brand.description}</p>
        </div>
        <div className="website-about-grid">
          <article className="story-card website-about-card">
            {editorMode ? (
              <InlineTextField as="span" controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label="Label soporte" section="story" value={labels.supportLabel} />
            ) : (
              <span>{labels.supportLabel}</span>
            )}
            {editorMode ? (
              <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="narrative.title" label="Titulo narrativa" section="story" value={aboutLead} />
            ) : (
              <strong>{aboutLead}</strong>
            )}
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.body" label="Cuerpo narrativa" multiline minRows={3} section="story" value={aboutBody} />
            ) : (
              <p>{aboutBody}</p>
            )}
          </article>
          <article className="story-card website-about-card">
            {editorMode ? (
              <InlineTextField as="span" controls={editorTextControls} enabled fieldKey="uiText.heroLabel" label="Label hero" section="story" value={labels.heroLabel} />
            ) : (
              <span>{labels.heroLabel}</span>
            )}
            {editorMode ? (
              <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Objetivo" section="story" value={content.narrative.goal} />
            ) : (
              <strong>{content.narrative.goal}</strong>
            )}
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="contact.description" label="Descripcion de contacto" multiline minRows={3} section="contact" value={content.contact.description} />
            ) : (
              <p>{content.contact.description}</p>
            )}
          </article>
        </div>
      </section>

      <section className="scene scene-website-services" data-editor-section="services" id="servicios" data-animate data-animate-delay="120">
        <div className="section-copy website-section-copy">
          <span className="scene-chip">Services</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Servicios claros, jerarquia limpia y CTA directo.")}</h2>
        </div>
        <div className="website-services-grid">
          {services.map((service, index) => (
            <article className="collection-card website-service-card" key={service.title}>
              {editorMode ? (
                <InlineImageField
                  enabled={editorMode}
                  fieldKey={`servicio-${index + 1}`}
                  label={`Servicio ${index + 1}`}
                  onChange={editorMode ? (event) => editorImageControls?.onServiceImageChange(index, event) : undefined}
                  uploading={editorMode && editorImageControls?.uploadingField === `servicio ${index + 1}`}
                >
                  <div
                    className={`media-panel media-panel-collection website-service-media ${service.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                    style={getMediaStyle(service.imageSrc, "0.28", service.imagePosition)}
                  />
                </InlineImageField>
              ) : (
                <div
                  className={`media-panel media-panel-collection website-service-media ${service.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                  style={getMediaStyle(service.imageSrc, "0.28", service.imagePosition)}
                />
              )}
              <div className="website-card-copy">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`services.${index}.title`} label={`Titulo servicio ${index + 1}`} section="services" value={service.title} />
                ) : (
                  <strong>{service.title}</strong>
                )}
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`services.${index}.description`} label={`Descripcion servicio ${index + 1}`} multiline minRows={3} section="services" value={service.description} />
                ) : (
                  <p>{service.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="scene scene-website-portfolio" data-editor-section="gallery" id="trabajos" data-animate data-animate-delay="160">
        <div className="section-copy website-section-copy">
          <span className="scene-chip">Portfolio</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Casos visuales sin saturar el layout.")}</h2>
        </div>
        <div className="website-portfolio-grid">
          {galleryItems.map((item, index) => (
            <article className="collection-card website-portfolio-card" key={item.key}>
              {editorMode ? (
                <InlineImageField
                  enabled={editorMode}
                  fieldKey={`galeria-${index + 1}`}
                  label={`Galeria ${index + 1}`}
                  onChange={editorMode ? (event) => editorImageControls?.onGalleryImageChange(index, event) : undefined}
                  uploading={editorMode && editorImageControls?.uploadingField === `galeria ${index + 1}`}
                >
                  <div
                    className={`media-panel media-panel-collection website-portfolio-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                    style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)}
                  />
                </InlineImageField>
              ) : (
                <div
                  className={`media-panel media-panel-collection website-portfolio-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                  style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)}
                />
              )}
              <div className="website-card-copy">
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`galleryItems.${index}.subtitle`} label={`Subtitulo galeria ${index + 1}`} section="gallery" value={item.subtitle} />
                ) : (
                  <span>{item.subtitle}</span>
                )}
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`galleryItems.${index}.title`} label={`Titulo galeria ${index + 1}`} section="gallery" value={item.title} />
                ) : (
                  <strong>{item.title}</strong>
                )}
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`services.${Math.min(index, Math.max(services.length - 1, 0))}.description`} label={`Descripcion de apoyo ${index + 1}`} multiline minRows={3} section="services" value={services[index]?.description || content.brand.subheadline} />
                ) : (
                  <p>{services[index]?.description || content.brand.subheadline}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="scene scene-website-benefits" data-animate data-animate-delay="200">
        <div className="section-copy website-section-copy">
          <span className="scene-chip">Benefits</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Beneficios concretos para avanzar sin friccion.")}</h2>
        </div>
        <div className="website-benefits-grid">
          {benefitCards.slice(0, 4).map((benefit, index) => (
            <article className="note-card website-benefit-card" key={`${benefit.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {editorMode ? (
                <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`highlights.${index}`} label={`Highlight ${index + 1}`} section="story" value={benefit.title} />
              ) : (
                <strong>{benefit.title}</strong>
              )}
              {editorMode ? (
                <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`services.${Math.min(index, Math.max(services.length - 1, 0))}.description`} label={`Detalle beneficio ${index + 1}`} multiline minRows={3} section="services" value={benefit.body} />
              ) : (
                <p>{benefit.body}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="scene scene-website-testimonials" data-animate data-animate-delay="240">
        <div className="section-copy website-section-copy">
          <span className="scene-chip">Testimonials</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Prueba social clara y facil de escanear.")}</h2>
        </div>
        <div className="website-testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <article className="quote-card website-testimonial-card" key={`${testimonial.name}-${index}`}>
              <div className="website-testimonial-head">
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`testimonio-${index + 1}`}
                    label={`Testimonio ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onTestimonialImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `testimonio ${index + 1}`}
                  >
                    <div
                      aria-hidden="true"
                      className={`testimonial-avatar website-testimonial-avatar ${testimonial.avatarSrc ? "has-media-image" : "is-fallback"}`}
                      style={testimonial.avatarSrc ? { backgroundImage: `url(${testimonial.avatarSrc})` } : undefined}
                    >
                      {!testimonial.avatarSrc ? testimonial.name.slice(0, 1).toUpperCase() : null}
                    </div>
                  </InlineImageField>
                ) : (
                  <div
                    aria-hidden="true"
                    className={`testimonial-avatar website-testimonial-avatar ${testimonial.avatarSrc ? "has-media-image" : "is-fallback"}`}
                    style={testimonial.avatarSrc ? { backgroundImage: `url(${testimonial.avatarSrc})` } : undefined}
                  >
                    {!testimonial.avatarSrc ? testimonial.name.slice(0, 1).toUpperCase() : null}
                  </div>
                )}
                <div className="website-testimonial-person">
                  {editorMode ? (
                    <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.name`} label={`Nombre testimonio ${index + 1}`} section="testimonials" value={testimonial.name} />
                  ) : (
                    <strong>{testimonial.name}</strong>
                  )}
                  {editorMode ? (
                    <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.role`} label={`Rol testimonio ${index + 1}`} section="testimonials" value={testimonial.role} />
                  ) : (
                    <span>{testimonial.location || testimonial.role}</span>
                  )}
                </div>
              </div>
              {editorMode ? (
                <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${index}.quote`} label={`Cita testimonio ${index + 1}`} multiline minRows={3} section="testimonials" value={testimonial.quote} />
              ) : (
                <p>"{testimonial.quote}"</p>
              )}
              <div className="website-testimonial-foot">
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.segment`} label={`Segmento testimonio ${index + 1}`} section="testimonials" value={testimonial.segment || testimonial.role} />
                ) : (
                  <span>{testimonial.segment || testimonial.role}</span>
                )}
                <div aria-label={`${testimonial.rating || 5} estrellas`} className="testimonial-stars">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, starIndex) => (
                    <span key={starIndex}>{"\u2605"}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LandingFaqAccordion editorMode={editorMode} editorTextControls={editorTextControls} items={faqs} label="FAQ" title="Respuestas claras antes del contacto." dataAnimateDelay={280} />

      <section className="scene scene-website-cta" data-editor-section="contact" id="contacto" data-animate data-animate-delay="320">
        <div className="website-cta-shell">
          <div className="section-copy website-section-copy">
            <span className="scene-chip">CTA</span>
            <h2 className="section-title">{renderBalancedSectionTitle(ctaTitle)}</h2>
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="contact.description" label="Descripcion de contacto" multiline minRows={3} section="contact" value={content.contact.description} />
            ) : (
              <p>{content.contact.description}</p>
            )}
          </div>
          <div className="scene-actions">
            <a className="primary-button" href={content.brand.primaryCtaHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.primaryCtaLabel" label="CTA principal" section="contact" showTrigger={false} value={content.brand.primaryCtaLabel} />
              ) : (
                content.brand.primaryCtaLabel
              )}
            </a>
            <a className="secondary-button" href={content.brand.secondaryCtaHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.secondaryCtaLabel" label="CTA secundario" section="contact" showTrigger={false} value={content.brand.secondaryCtaLabel} />
              ) : (
                content.brand.secondaryCtaLabel
              )}
            </a>
          </div>
        </div>
      </section>

      <ContactForm description={content.contact.description} title={content.contact.title} whatsappNumber={content.contact.whatsappNumber} />

      <footer className="scene scene-footer website-footer">
        <div className="brand-lockup website-footer-lockup">
          <span className="scene-chip">{profile.industry}</span>
          <strong>{content.brand.name}</strong>
          <p>{content.brand.description}</p>
        </div>
        <nav className="topline-nav" aria-label="Enlaces del footer">
          {content.pages.slice(0, 5).map((page) => (
            <a href={getPageHref(page)} key={page}>
              {page}
            </a>
          ))}
        </nav>
      </footer>
    </>
  );
}
