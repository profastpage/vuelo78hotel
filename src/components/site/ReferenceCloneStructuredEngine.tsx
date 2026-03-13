import type { ClientProfile, ReferenceSnapshot, SiteContent } from "@/types/site";
import { ContactForm } from "./ContactForm";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { InlineImageField } from "./InlineImageField";
import { InlineTextField } from "./InlineTextField";
import { LandingFaqAccordion } from "./LandingFaqAccordion";
import { getGalleryItems, getMediaStyle, getPageHref, getVisibleFaqs, getVisibleHighlights, getVisibleServices, getVisibleTestimonials } from "./rendering";

type ReferenceCloneStructuredEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  snapshot: ReferenceSnapshot;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

export function ReferenceCloneStructuredEngine({ profile, content, snapshot, editorMode = false, editorImageControls, editorTextControls }: ReferenceCloneStructuredEngineProps) {
  const pages = content.pages.slice(0, 7);
  const galleryItems = getGalleryItems(content, profile.industry);
  const services = getVisibleServices(content);
  const highlights = getVisibleHighlights(content);
  const testimonials = getVisibleTestimonials(content);
  const faqs = getVisibleFaqs(content).slice(0, 4);
  const mainImage = content.brand.heroImageSrc || galleryItems[0]?.imageSrc || "";
  const mainImagePosition = content.brand.heroImagePosition || galleryItems[0]?.imagePosition;
  const visibleSections = snapshot.sections.filter((section) => !["navbar", "footer", "popup"].includes(section.type));
  const heroSection = visibleSections.find((section) => section.type === "hero");
  const contentSections = visibleSections.filter((section) => section !== heroSection);
  const popupSection = snapshot.sections.find((section) => section.type === "popup");
  const heroUploading = editorMode && editorImageControls?.uploadingField === "hero";

  return (
    <>
      <section className="reference-structured-shell" id="inicio">
        <InlineImageField enabled={editorMode} fieldKey="hero" label="Hero estructurado" onChange={editorMode ? editorImageControls?.onHeroImageChange : undefined} uploading={heroUploading}>
          <div
            className={`reference-structured-hero ${mainImage ? "has-media-image" : "media-fallback-generic"}`}
            style={getMediaStyle(mainImage, "0.24", mainImagePosition)}
          >
          <div className="reference-structured-overlay" aria-hidden="true" />

          <header className="reference-structured-header">
            <div className="reference-structured-brand">
              {editorMode ? (
                <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Chip hero estructurado" section="hero" value={content.brand.heroTag || profile.industry} />
              ) : (
                <span className="scene-chip">{content.brand.heroTag || profile.industry}</span>
              )}
              {editorMode ? (
                <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre estructurado" section="hero" value={content.brand.name} />
              ) : (
                <strong>{content.brand.name}</strong>
              )}
            </div>

            <nav className="reference-structured-nav" aria-label="Navegacion principal">
              {pages.map((page, index) => (
                <a href={getPageHref(page)} key={`${page}-${index}`}>
                  {editorMode ? (
                    <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${index}`} label={`Link estructurado ${index + 1}`} section="hero" showTrigger={false} value={page} />
                  ) : (
                    page
                  )}
                </a>
              ))}
            </nav>

            <a className="reference-structured-header-cta" href={content.brand.primaryCtaHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.primaryCtaLabel" label="CTA hero estructurado" section="hero" showTrigger={false} value={content.brand.primaryCtaLabel} />
              ) : (
                content.brand.primaryCtaLabel
              )}
            </a>
          </header>

          <div className="reference-structured-copy">
            {editorMode ? (
              <InlineTextField as="span" className="reference-structured-kicker" controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Kicker estructurado" section="hero" value={heroSection?.headings?.[0] || snapshot.meta?.title || content.brand.heroTag} />
            ) : (
              <span className="reference-structured-kicker">{heroSection?.headings?.[0] || snapshot.meta?.title || content.brand.heroTag}</span>
            )}
            {editorMode ? (
              <InlineTextField as="h1" controls={editorTextControls} enabled fieldKey="brand.headline" label="Titular estructurado" minRows={4} multiline section="hero" value={content.brand.headline} />
            ) : (
              <h1>{content.brand.headline}</h1>
            )}
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.subheadline" label="Subtitulo estructurado" minRows={3} multiline section="hero" value={content.brand.subheadline} />
            ) : (
              <p>{content.brand.subheadline}</p>
            )}
            <div className="reference-structured-actions">
              <a className="primary-button" href={content.brand.primaryCtaHref}>
                {editorMode ? (
                  <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.primaryCtaLabel" label="CTA principal estructurado" section="hero" showTrigger={false} value={content.brand.primaryCtaLabel} />
                ) : (
                  content.brand.primaryCtaLabel
                )}
              </a>
              <a className="secondary-button" href={content.brand.secondaryCtaHref}>
                {editorMode ? (
                  <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.secondaryCtaLabel" label="CTA secundario estructurado" section="hero" showTrigger={false} value={content.brand.secondaryCtaLabel} />
                ) : (
                  content.brand.secondaryCtaLabel
                )}
              </a>
            </div>
          </div>

          <div className="reference-structured-metrics">
            {content.stats.slice(0, 3).map((stat, index) => (
              <article className="reference-structured-metric" key={`${stat.label}-${stat.value}`}>
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`stats.${index}.label`} label={`Metrica estructurada ${index + 1}`} section="story" value={stat.label} />
                ) : (
                  <span>{stat.label}</span>
                )}
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`stats.${index}.value`} label={`Valor metrica estructurada ${index + 1}`} section="story" value={stat.value} />
                ) : (
                  <strong>{stat.value}</strong>
                )}
              </article>
            ))}
          </div>
          </div>
        </InlineImageField>
      </section>

      {popupSection ? (
        <section className="scene reference-structured-popup-preview" data-animate data-animate-delay="60">
          <div className="reference-structured-section-heading">
            <span className="scene-chip">Popup / widget</span>
            <h2>{popupSection.headings?.[0] || "Patron interactivo detectado en la referencia"}</h2>
            <p>La web de referencia incluye un patron emergente o de conversion que se conserva dentro del nuevo sistema.</p>
          </div>
          <div className="reference-structured-popup-shell">
            <div className="reference-structured-popup-card">
              {editorMode ? (
                <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="contact.title" label="Titulo popup estructurado" section="contact" value={content.contact.title} />
              ) : (
                <strong>{content.contact.title}</strong>
              )}
              {editorMode ? (
                <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="contact.description" label="Descripcion popup estructurado" minRows={3} multiline section="contact" value={content.contact.description} />
              ) : (
                <p>{content.contact.description}</p>
              )}
              <div className="reference-structured-actions">
                <a className="primary-button" href={content.brand.primaryCtaHref}>
                  {editorMode ? (
                    <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.primaryCtaLabel" label="CTA popup estructurado" section="contact" showTrigger={false} value={content.brand.primaryCtaLabel} />
                  ) : (
                    content.brand.primaryCtaLabel
                  )}
                </a>
                <a className="secondary-button" href={content.brand.secondaryCtaHref}>
                  {editorMode ? (
                    <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.secondaryCtaLabel" label="CTA secundario popup estructurado" section="contact" showTrigger={false} value={content.brand.secondaryCtaLabel} />
                  ) : (
                    content.brand.secondaryCtaLabel
                  )}
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {contentSections.map((section, index) => renderStructuredSection({
        section,
        index,
        content,
        editorImageControls,
        editorMode,
        editorTextControls,
        profile,
        galleryItems,
        services,
        highlights,
        testimonials,
        faqs,
      }))}

      <ContactForm
        description={content.contact.description}
        editorMode={editorMode}
        editorTextControls={editorTextControls}
        title={content.contact.title}
        whatsappNumber={content.contact.whatsappNumber}
      />

      <footer className="scene reference-structured-footer">
        <div className="reference-structured-footer-brand">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Chip footer estructurado" section="contact" value={profile.industry} />
          ) : (
            <span className="scene-chip">{profile.industry}</span>
          )}
          {editorMode ? (
            <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre footer estructurado" section="contact" value={content.brand.name} />
          ) : (
            <strong>{content.brand.name}</strong>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="brand.description" label="Descripcion footer estructurado" minRows={3} multiline section="contact" value={content.brand.description} />
          ) : (
            <p>{content.brand.description}</p>
          )}
        </div>
        <div className="reference-structured-footer-links">
          {pages.map((page, index) => (
            <a href={getPageHref(page)} key={`${page}-${index}`}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${index}`} label={`Link footer estructurado ${index + 1}`} section="contact" showTrigger={false} value={page} />
              ) : (
                page
              )}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

function renderStructuredSection({
  section,
  index,
  content,
  editorImageControls,
  editorMode,
  editorTextControls,
  profile,
  galleryItems,
  services,
  highlights,
  testimonials,
  faqs,
}: {
  section: ReferenceSnapshot["sections"][number];
  index: number;
  content: SiteContent;
  editorImageControls?: EditorImageControls;
  editorMode: boolean;
  editorTextControls?: EditorTextControls;
  profile: ClientProfile;
  galleryItems: ReturnType<typeof getGalleryItems>;
  services: SiteContent["services"];
  highlights: string[];
  testimonials: SiteContent["testimonials"];
  faqs: SiteContent["faqs"];
}) {
  const title = section.headings?.[0] || section.label;
  const description = section.headings?.[1] || content.narrative.body || content.brand.description;
  const delay = 90 + index * 35;

  if (section.type === "services" || section.type === "cards") {
    const items = services.length ? services : highlights.map((highlight) => ({ title: highlight, description: content.narrative.goal }));

    return (
      <section className="scene reference-structured-grid-scene" data-animate data-animate-delay={String(delay)} id={getSectionId(section.type, index)}>
        <div className="reference-structured-section-heading">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label={`Chip ${section.label}`} section="services" value={section.label} />
          ) : (
            <span className="scene-chip">{section.label}</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="uiText.storyTitle" label={`Titulo ${section.label}`} minRows={3} multiline section="services" value={title} />
          ) : (
            <h2>{title}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label={`Descripcion ${section.label}`} minRows={3} multiline section="services" value={description} />
          ) : (
            <p>{description}</p>
          )}
        </div>
        <div className={`reference-structured-card-grid cols-${getGridColumns(section.cardCount)}`}>
          {items.slice(0, Math.max(3, Math.min(section.cardCount || 3, 6))).map((item, itemIndex) => (
            <article className="reference-structured-card" key={`${item.title}-${itemIndex}`}>
              <span>{String(itemIndex + 1).padStart(2, "0")}</span>
              {editorMode ? (
                <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`services.${itemIndex}.title`} label={`Titulo card ${itemIndex + 1}`} section="services" value={item.title} />
              ) : (
                <strong>{item.title}</strong>
              )}
              {editorMode ? (
                <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`services.${itemIndex}.description`} label={`Descripcion card ${itemIndex + 1}`} minRows={3} multiline section="services" value={item.description} />
              ) : (
                <p>{item.description}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "gallery") {
    return (
      <section className="scene reference-structured-gallery-scene" data-animate data-animate-delay={String(delay)} id={getSectionId(section.type, index)}>
        <div className="reference-structured-section-heading">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label={`Chip galeria ${section.label}`} section="gallery" value={section.label} />
          ) : (
            <span className="scene-chip">{section.label}</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="uiText.storyTitle" label={`Titulo galeria ${section.label}`} minRows={3} multiline section="gallery" value={title} />
          ) : (
            <h2>{title}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.body" label={`Descripcion galeria ${section.label}`} minRows={3} multiline section="gallery" value={description} />
          ) : (
            <p>{description}</p>
          )}
        </div>
        <div className={`reference-structured-gallery-grid cols-${getGridColumns(section.cardCount || galleryItems.length || 3)}`}>
          {galleryItems.slice(0, Math.max(3, Math.min(section.cardCount || 3, 6))).map((item, itemIndex) => (
            <article className="reference-structured-gallery-card" key={item.key}>
                <InlineImageField enabled={editorMode} fieldKey={`galeria-${itemIndex + 1}`} label={`Galeria estructurada ${itemIndex + 1}`} onChange={editorMode ? ((event) => editorImageControls?.onGalleryImageChange(itemIndex, event)) : undefined} uploading={editorMode && editorImageControls?.uploadingField === `galeria ${itemIndex + 1}`}>
                <div
                  className={`reference-structured-gallery-media ${item.imageSrc ? "has-media-image" : "media-fallback-generic"}`}
                  style={getMediaStyle(item.imageSrc, "0.18", item.imagePosition)}
                />
              </InlineImageField>
              <div className="reference-structured-gallery-copy">
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`galleryItems.${itemIndex}.subtitle`} label={`Subtitulo galeria ${itemIndex + 1}`} section="gallery" value={item.subtitle} />
                ) : (
                  <span>{item.subtitle}</span>
                )}
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`galleryItems.${itemIndex}.title`} label={`Titulo galeria ${itemIndex + 1}`} section="gallery" value={item.title} />
                ) : (
                  <strong>{item.title}</strong>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "testimonials") {
    return (
      <section className="scene reference-structured-proof-scene" data-animate data-animate-delay={String(delay)} id={getSectionId(section.type, index)}>
        <div className="reference-structured-section-heading">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.testimonialsChip" label={`Chip testimonios ${section.label}`} section="testimonials" value={section.label} />
          ) : (
            <span className="scene-chip">{section.label}</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="uiText.testimonialsTitle" label={`Titulo testimonios ${section.label}`} minRows={3} multiline section="testimonials" value={title} />
          ) : (
            <h2>{title}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label={`Descripcion testimonios ${section.label}`} minRows={3} multiline section="testimonials" value={description} />
          ) : (
            <p>{description}</p>
          )}
        </div>
        <div className={`reference-structured-proof-grid cols-${getGridColumns(testimonials.length || 3)}`}>
          {testimonials.slice(0, Math.max(3, Math.min(section.cardCount || 3, 6))).map((testimonial, itemIndex) => (
            <article className="quote-card reference-structured-proof-card" key={`${testimonial.name}-${itemIndex}`}>
              {editorMode ? (
                <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`testimonials.${itemIndex}.name`} label={`Nombre testimonio ${itemIndex + 1}`} section="testimonials" value={testimonial.name} />
              ) : (
                <strong>{testimonial.name}</strong>
              )}
              {editorMode ? (
                <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${itemIndex}.role`} label={`Rol testimonio ${itemIndex + 1}`} section="testimonials" value={testimonial.location || testimonial.role} />
              ) : (
                <span>{testimonial.location || testimonial.role}</span>
              )}
              {editorMode ? (
                <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${itemIndex}.quote`} label={`Cita testimonio ${itemIndex + 1}`} minRows={3} multiline section="testimonials" value={testimonial.quote} />
              ) : (
                <p>"{testimonial.quote}"</p>
              )}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "faq") {
    return <LandingFaqAccordion dataAnimateDelay={delay} editorMode={editorMode} editorTextControls={editorTextControls} items={faqs.slice(0, 4)} label={content.uiText?.faqChip || section.label} title={content.uiText?.faqTitle || title} />;
  }

  if (section.type === "contact" || section.type === "newsletter") {
    return (
      <section className="scene reference-structured-cta-scene" data-animate data-animate-delay={String(delay)} id={getSectionId(section.type, index)}>
        <div className="reference-structured-cta-shell">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label={`Chip CTA ${section.label}`} section="contact" value={section.label} />
          ) : (
            <span className="scene-chip">{section.label}</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="contact.title" label="Titulo CTA estructurado" minRows={3} multiline section="contact" value={content.contact.title} />
          ) : (
            <h2>{content.contact.title}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="contact.description" label="Descripcion CTA estructurado" minRows={3} multiline section="contact" value={content.contact.description} />
          ) : (
            <p>{content.contact.description}</p>
          )}
          <div className="reference-structured-actions">
            <a className="primary-button" href={content.brand.primaryCtaHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.primaryCtaLabel" label="CTA principal CTA estructurado" section="contact" showTrigger={false} value={content.brand.primaryCtaLabel} />
              ) : (
                content.brand.primaryCtaLabel
              )}
            </a>
            <a className="secondary-button" href={content.brand.secondaryCtaHref}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey="brand.secondaryCtaLabel" label="CTA secundario CTA estructurado" section="contact" showTrigger={false} value={content.brand.secondaryCtaLabel} />
              ) : (
                content.brand.secondaryCtaLabel
              )}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="scene reference-structured-story-scene" data-animate data-animate-delay={String(delay)} id={getSectionId(section.type, index)}>
      <div className={`reference-structured-story-grid ${section.hasMedia ? "has-media" : ""}`}>
        <div className="reference-structured-story-copy">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.storyChip" label={`Chip historia ${section.label}`} section="story" value={section.label} />
          ) : (
            <span className="scene-chip">{section.label}</span>
          )}
          {editorMode ? (
            <InlineTextField as="h2" controls={editorTextControls} enabled fieldKey="narrative.title" label={`Titulo historia ${section.label}`} minRows={3} multiline section="story" value={title} />
          ) : (
            <h2>{title}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.body" label={`Descripcion historia ${section.label}`} minRows={3} multiline section="story" value={description} />
          ) : (
            <p>{description}</p>
          )}
          <div className="reference-structured-widget-tags">
            {section.widgets.slice(0, 4).map((widget) => (
              <span key={widget}>{widget}</span>
            ))}
          </div>
        </div>
        {section.hasMedia ? (
          <InlineImageField enabled={editorMode} fieldKey="galeria-1" label="Media de historia" onChange={editorMode ? ((event) => editorImageControls?.onGalleryImageChange(0, event)) : undefined} uploading={editorMode && editorImageControls?.uploadingField === "galeria 1"}>
            <div
              className={`reference-structured-story-media ${galleryItems[0]?.imageSrc ? "has-media-image" : "media-fallback-generic"}`}
              style={getMediaStyle(galleryItems[0]?.imageSrc || content.brand.heroImageSrc, "0.16", galleryItems[0]?.imagePosition || content.brand.heroImagePosition)}
            />
          </InlineImageField>
        ) : null}
      </div>
    </section>
  );
}

function getGridColumns(cardCount: number) {
  if (cardCount >= 4) {
    return 4;
  }

  if (cardCount === 2) {
    return 2;
  }

  return 3;
}

function getSectionId(type: string, index: number) {
  const slug = String(type || "section")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "section"}-${index + 1}`;
}
