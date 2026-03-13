import type { ClientProfile, SiteContent } from "@/types/site";
import type { CSSProperties } from "react";
import { ContactForm } from "./ContactForm";
import { renderBalancedHeroHeadline, renderBalancedSectionTitle, splitHeroHeadline } from "./headline-balance";
import { InlineImageField } from "./InlineImageField";
import { LandingFaqAccordion } from "./LandingFaqAccordion";
import { LandingSignatureCta } from "./LandingSignatureCta";
import { LandingTestimonialsRail } from "./LandingTestimonialsRail";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";
import { LocationBlock } from "./LocationBlock";
import { PricingSection } from "./PricingSection";
import { TeamSection } from "./TeamSection";
import { TimelineSection } from "./TimelineSection";
import { getGalleryItems, getLandingFaqs, getLandingTestimonials, getMediaStyle, getStoryLabels, getVisibleHighlights, getVisibleServices, normalizeVisualStyle } from "./rendering";

type LandingEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

export function LandingEngine({ profile, content, editorMode = false, editorImageControls, editorTextControls }: LandingEngineProps) {
  const galleryItems = getGalleryItems(content, profile.industry).slice(0, 4);
  const services = getVisibleServices(content).slice(0, 3);
  const highlights = getVisibleHighlights(content).slice(0, 4);
  const stats = content.stats.slice(0, 3);
  const labels = getStoryLabels(profile, content);
  const hasHeroImage = Boolean(content.brand.heroImageSrc);
  const heroSectionStyle = hasHeroImage
    ? ({
        ["--hero-bg-image" as keyof CSSProperties]: `url("${content.brand.heroImageSrc}")`,
        ["--hero-bg-position" as keyof CSSProperties]: `${content.brand.heroImagePosition?.x ?? 50}% ${content.brand.heroImagePosition?.y ?? 50}%`,
      } as CSSProperties)
    : undefined;
  const landingTestimonials = getLandingTestimonials(profile, content, 20);
  const landingFaqs = getLandingFaqs(profile, content, 5);
  const storyChip = content.uiText?.storyChip?.trim() || "Narrativa de conversion";
  const storyTitle = content.uiText?.storyTitle?.trim() || "Experiencia clara y lista para convertir.";
  const testimonialsChip = content.uiText?.testimonialsChip?.trim() || labels.proofLabel;
  const testimonialsTitle = content.uiText?.testimonialsTitle?.trim() || "Resultados reales y prueba social clara.";
  const faqChip = content.uiText?.faqChip?.trim() || "Preguntas frecuentes";
  const faqTitle = content.uiText?.faqTitle?.trim() || "Respuestas claras antes del contacto.";
  const visualStyle = normalizeVisualStyle(content.theme.visualStyle);
  const trustCards =
    stats.length > 0
      ? stats.map((metric) => ({
          label: metric.label,
          value: metric.value,
        }))
      : [
          { label: "Secciones listas", value: `${Math.max(content.pages.length, 6)}` },
          { label: "Modulos activos", value: `${Math.max(Object.values(profile.modules).filter(Boolean).length, 3)}` },
          { label: "CTA visible", value: "Hero + cierre" },
        ];
  const problemCards = [
    { title: "Mensaje poco claro", body: highlights[0] || content.brand.description },
    { title: "Friccion antes del CTA", body: highlights[1] || content.narrative.body },
    { title: "Poca confianza visible", body: landingTestimonials[0]?.quote || content.contact.description },
  ];
  const benefitCards = (
    highlights.length > 0
      ? highlights.map((highlight, index) => ({
          title: highlight,
          body: services[index]?.description || content.narrative.goal,
        }))
      : services.map((service) => ({
          title: service.title,
          body: service.description,
        }))
  ).slice(0, 4);
  const howItWorksSeeds =
    services.length > 0
      ? services.slice(0, 3).map((service) => ({
          title: service.title,
          body: service.description,
        }))
      : [
          {
            title: "Captar interes",
            body: content.brand.subheadline,
          },
          {
            title: "Ordenar confianza",
            body: content.narrative.body,
          },
          {
            title: "Llevar al CTA",
            body: content.contact.description,
          },
        ];
  const howItWorksSteps = howItWorksSeeds.map((step, index) => ({
    step: String(index + 1).padStart(2, "0"),
    title: step.title,
    body: step.body,
  }));
  const footerAnchors = [
    { label: content.pages[0] || "Inicio", href: "#inicio" },
    { label: content.pages[1] || "Confianza", href: "#confianza" },
    { label: content.pages[2] || "Oferta", href: "#oferta" },
    { label: content.pages[3] || "Prueba", href: "#trabajos" },
    { label: content.pages[4] || "Contacto", href: "#contacto" },
  ];
  const heroHeadlineLines = splitHeroHeadline(content.brand.headline);

  if (visualStyle === "immersive") {
    return (
      <>
        <section
          className={`scene scene-hero immersive-landing-shell ${hasHeroImage ? "hero-image-bg" : ""}`}
          data-editor-section="hero visual"
          id="inicio"
          data-animate
          data-animate-delay="0"
          style={heroSectionStyle}
        >
          {hasHeroImage ? <div className="hero-background" aria-hidden="true" /> : null}
          <div className="immersive-overlay" aria-hidden="true" />
          <div className="immersive-hero-copy">
            {editorMode ? (
              <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Hero tag" section="hero" value={content.brand.heroTag || profile.industry} />
            ) : (
              <span className="scene-chip">{content.brand.heroTag || profile.industry}</span>
            )}
            {editorMode ? (
              <InlineTextField as="p" className="scene-kicker" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre visible" section="hero" value={content.brand.name} />
            ) : (
              <p className="scene-kicker">{content.brand.name}</p>
            )}
            {editorMode ? (
              <InlineTextField as="h1" className="hero-title" controls={editorTextControls} displayValue={renderBalancedHeroHeadline(content.brand.headline)} enabled fieldKey="brand.headline" label="Titular principal" minRows={3} multiline section="hero" value={content.brand.headline} />
            ) : (
              <h1 className="hero-title" data-line-count={heroHeadlineLines.length}>
                {renderBalancedHeroHeadline(content.brand.headline)}
              </h1>
            )}
            {editorMode ? (
              <InlineTextField as="p" className="hero-lead" controls={editorTextControls} enabled fieldKey="brand.subheadline" label="Subtitular" minRows={3} multiline section="hero" value={content.brand.subheadline} />
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
          <div className="immersive-dock">
            {stats.slice(0, 3).map((metric, index) => (
              <article className="immersive-dock-card" key={`${metric.label}-${metric.value}`}>
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
        </section>

        <section className="scene immersive-story-shell" data-animate data-animate-delay="90" id="nosotros">
          <div className="immersive-story-lead">
            {editorMode ? (
              <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.storyChip" label="Chip narrativa" section="story" value={storyChip} />
            ) : (
              <span className="scene-chip">{storyChip}</span>
            )}
            {editorMode ? (
              <InlineTextField as="h2" className="section-title" controls={editorTextControls} displayValue={renderBalancedSectionTitle(storyTitle)} enabled fieldKey="uiText.storyTitle" label="Titulo narrativa" minRows={3} multiline section="story" value={storyTitle} />
            ) : (
              <h2 className="section-title">{renderBalancedSectionTitle(storyTitle)}</h2>
            )}
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.body" label="Cuerpo narrativa" minRows={3} multiline section="story" value={content.narrative.body} />
            ) : (
              <p>{content.narrative.body}</p>
            )}
          </div>
          <article className="immersive-story-card">
            {editorMode ? (
              <InlineTextField as="span" controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label="Label soporte" section="story" value={labels.supportLabel} />
            ) : (
              <span>{labels.supportLabel}</span>
            )}
            {editorMode ? (
              <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="narrative.title" label="Titulo narrativa" section="story" value={content.narrative.title} />
            ) : (
              <strong>{content.narrative.title}</strong>
            )}
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Objetivo" minRows={2} multiline section="story" value={content.narrative.goal} />
            ) : (
              <p>{content.narrative.goal}</p>
            )}
          </article>
        </section>

        <section className="scene immersive-gallery-shell" data-animate data-animate-delay="140" id="servicios">
          <article className="immersive-gallery-feature">
            <div
              className={`media-panel media-panel-main immersive-gallery-media ${galleryItems[0]?.imageSrc ? "has-media-image" : "media-fallback-a"}`}
              style={getMediaStyle(galleryItems[0]?.imageSrc || content.brand.heroImageSrc, "0.3", galleryItems[0]?.imagePosition || content.brand.heroImagePosition)}
            />
            <div className="immersive-gallery-copy">
              <span>{galleryItems[0]?.subtitle || "Escena principal"}</span>
              <strong>{galleryItems[0]?.title || content.narrative.goal}</strong>
            </div>
          </article>
          <div className="immersive-service-stack">
            {services.map((service, index) => (
              <article className={`immersive-service-card immersive-service-card-${index + 1}`} key={service.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{service.title}</strong>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="scene immersive-proof-shell" data-animate data-animate-delay="190">
          <div className="immersive-proof-quotes">
            {landingTestimonials.slice(0, 3).map((testimonial, index) => (
              <article className="quote-card immersive-quote-card" key={testimonial.name}>
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${index}.quote`} label={`Cita testimonio ${index + 1}`} multiline minRows={3} section="testimonials" value={testimonial.quote} />
                ) : (
                  <p>"{testimonial.quote}"</p>
                )}
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.name`} label={`Nombre testimonio ${index + 1}`} section="testimonials" value={testimonial.name} />
                ) : (
                  <strong>{testimonial.name}</strong>
                )}
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.role`} label={`Rol testimonio ${index + 1}`} section="testimonials" value={testimonial.role} />
                ) : (
                  <span>{testimonial.role}</span>
                )}
              </article>
            ))}
          </div>
          <div className="immersive-proof-faqs">
            {editorMode ? (
              <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.faqChip" label="Chip FAQ" section="faqs" value={faqChip} />
            ) : (
              <span className="scene-chip">{faqChip}</span>
            )}
            {editorMode ? (
              <InlineTextField as="h2" className="section-title" controls={editorTextControls} displayValue={renderBalancedSectionTitle(faqTitle)} enabled fieldKey="uiText.faqTitle" label="Titulo FAQ" minRows={3} multiline section="faqs" value={faqTitle} />
            ) : (
              <h2 className="section-title">{renderBalancedSectionTitle(faqTitle)}</h2>
            )}
            {landingFaqs.slice(0, 3).map((faq, index) => (
              <article className="faq-card immersive-faq-card" key={faq.question}>
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`faqs.${index}.question`} label={`Pregunta FAQ ${index + 1}`} multiline minRows={2} section="faqs" value={faq.question} />
                ) : (
                  <strong>{faq.question}</strong>
                )}
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} enabled fieldKey={`faqs.${index}.answer`} label={`Respuesta FAQ ${index + 1}`} multiline minRows={3} section="faqs" value={faq.answer} />
                ) : (
                  <p>{faq.answer}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <LandingSignatureCta content={content} profile={profile} dataAnimateDelay={240} />

        {content.pricing?.tiers?.length ? (
          <PricingSection title={content.pricing.title} description={content.pricing.description} tiers={content.pricing.tiers} />
        ) : null}

        {content.team?.members?.length ? (
          <TeamSection title={content.team.title} description={content.team.description} members={content.team.members} />
        ) : null}

        {content.timeline?.items?.length ? (
          <TimelineSection title={content.timeline.title} description={content.timeline.description} items={content.timeline.items} />
        ) : null}

        {content.location?.address ? (
          <LocationBlock location={content.location} contactEmail={content.contact.email} contactPhone={content.contact.whatsappNumber} />
        ) : null}

        {profile.modules.leadForm ? <ContactForm description={content.contact.description} title={content.contact.title} /> : null}
      </>
    );
  }

  return (
    <>
      <section
        className={`scene scene-hero scene-landing ${hasHeroImage ? "hero-image-bg" : ""}`}
        data-editor-section="hero visual"
        id="inicio"
        data-animate
        data-animate-delay="0"
        style={heroSectionStyle}
      >
        {hasHeroImage ? <div className="hero-background" aria-hidden="true" /> : null}
        <div className="hero-copy">
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Hero tag" section="hero" value={content.brand.heroTag || profile.industry} />
          ) : (
            <span className="scene-chip">{content.brand.heroTag || profile.industry}</span>
          )}
          {editorMode ? (
            <InlineTextField as="p" className="scene-kicker" controls={editorTextControls} enabled fieldKey="brand.name" label="Nombre visible" section="hero" value={content.brand.name} />
          ) : (
            <p className="scene-kicker">{content.brand.name}</p>
          )}
          {editorMode ? (
            <InlineTextField as="h1" className="hero-title" controls={editorTextControls} displayValue={renderBalancedHeroHeadline(content.brand.headline)} enabled fieldKey="brand.headline" label="Titular principal" minRows={3} multiline section="hero" value={content.brand.headline} />
          ) : (
            <h1 className="hero-title" data-line-count={heroHeadlineLines.length}>
              {renderBalancedHeroHeadline(content.brand.headline)}
            </h1>
          )}
          {editorMode ? (
            <InlineTextField as="p" className="hero-lead" controls={editorTextControls} enabled fieldKey="brand.subheadline" label="Subtitular" minRows={3} multiline section="hero" value={content.brand.subheadline} />
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

        <div className="hero-stage">
          {editorMode ? (
            <InlineImageField enabled={editorMode} fieldKey="hero" label="Hero principal" onChange={editorMode ? editorImageControls?.onHeroImageChange : undefined} uploading={editorMode && editorImageControls?.uploadingField === "hero"}>
              <article className={`media-panel media-panel-main ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-a"}`} style={getMediaStyle(content.brand.heroImageSrc, "0.28", content.brand.heroImagePosition)}>
                <div className="media-copy">
                  <span>{labels.heroLabel}</span>
                  <strong>{content.narrative.goal}</strong>
                  <p>{profile.brandConfig.offerSummary}</p>
                </div>
              </article>
            </InlineImageField>
          ) : (
            <article className={`media-panel media-panel-main ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-a"}`} style={getMediaStyle(content.brand.heroImageSrc, "0.28", content.brand.heroImagePosition)}>
              <div className="media-copy">
                <span>{labels.heroLabel}</span>
                <strong>{content.narrative.goal}</strong>
                <p>{profile.brandConfig.offerSummary}</p>
              </div>
            </article>
          )}

          <div className="hero-side-stack">
            {galleryItems.slice(0, 2).map((item, index) => (
              <article className="note-card" key={item.key}>
                {editorMode ? (
                  <InlineImageField enabled={editorMode} fieldKey={`galeria-${index + 1}`} label={`Galeria ${index + 1}`} onChange={editorMode ? (event) => editorImageControls?.onGalleryImageChange(index, event) : undefined} uploading={editorMode && editorImageControls?.uploadingField === `galeria ${index + 1}`}>
                    <div className={`media-panel media-panel-mini ${item.imageSrc ? "has-media-image" : `media-fallback-${index % 2 === 0 ? "b" : "c"}`}`} style={getMediaStyle(item.imageSrc, "0.34", item.imagePosition)} />
                  </InlineImageField>
                ) : (
                  <div className={`media-panel media-panel-mini ${item.imageSrc ? "has-media-image" : `media-fallback-${index % 2 === 0 ? "b" : "c"}`}`} style={getMediaStyle(item.imageSrc, "0.34", item.imagePosition)} />
                )}
                <div>
                  <span>{item.subtitle}</span>
                  <strong>{item.title}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="scene scene-trust saas-trust-shell" data-animate data-animate-delay="80" id="confianza">
        <div className="section-copy saas-section-copy">
          <span className="scene-chip">Trust</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Confianza y claridad desde el primer scroll.")}</h2>
          <p>Metricas, secciones conocidas y una lectura premium orientada a conversion.</p>
        </div>
        <div className="saas-trust-grid">
          {trustCards.map((metric, index) => (
            <article className="metric-ribbon saas-trust-card" key={`${metric.label}-${metric.value}`}>
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
          <article className="saas-trust-card saas-trust-card-logos">
            <span>Secciones clave</span>
            <div className="tag-cloud">
              {content.pages.slice(0, 4).map((page, index) => (
                <span key={`${page}-${index}`}>
                  {editorMode ? (
                    <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${index}`} label={`Link ${index + 1}`} section="hero" value={page} />
                  ) : (
                    page
                  )}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="scene scene-problem saas-problem-shell" data-animate data-animate-delay="110">
        <div className="section-copy saas-section-copy">
          <span className="scene-chip">Problem</span>
          <h2 className="section-title">{renderBalancedSectionTitle("La oferta existe, pero la web no la ordena.")}</h2>
          <p>{content.brand.description}</p>
        </div>
        <div className="saas-problem-grid">
          {problemCards.map((card) => (
            <article className="story-card saas-problem-card" key={card.title}>
              <span>Friccion</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="scene scene-solution saas-solution-shell" data-animate data-animate-delay="150" id="nosotros">
        <div className="section-copy saas-section-copy">
          <span className="scene-chip">Solution</span>
          {editorMode ? (
            <InlineTextField as="h2" className="section-title" controls={editorTextControls} displayValue={renderBalancedSectionTitle(storyTitle)} enabled fieldKey="uiText.storyTitle" label="Titulo narrativa" minRows={3} multiline section="story" value={storyTitle} />
          ) : (
            <h2 className="section-title">{renderBalancedSectionTitle(storyTitle)}</h2>
          )}
          {editorMode ? (
            <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.body" label="Cuerpo narrativa" multiline minRows={3} section="story" value={content.narrative.body} />
          ) : (
            <p>{content.narrative.body}</p>
          )}
        </div>
        <div className="saas-solution-stage">
          <article className="story-card saas-solution-card">
            {editorMode ? (
              <InlineTextField as="span" controls={editorTextControls} enabled fieldKey="uiText.supportLabel" label="Label soporte" section="story" value={labels.supportLabel} />
            ) : (
              <span>{labels.supportLabel}</span>
            )}
            {editorMode ? (
              <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="narrative.title" label="Titulo narrativa" section="story" value={content.narrative.title} />
            ) : (
              <strong>{content.narrative.title}</strong>
            )}
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="narrative.goal" label="Objetivo" minRows={2} multiline section="story" value={content.narrative.goal} />
            ) : (
              <p>{content.narrative.goal}</p>
            )}
          </article>
          {editorMode ? (
            <InlineImageField enabled={editorMode} fieldKey="galeria-1" label="Escena de solucion" onChange={editorMode ? (event) => editorImageControls?.onGalleryImageChange(0, event) : undefined} uploading={editorMode && editorImageControls?.uploadingField === "galeria 1"}>
              <article className={`media-panel media-panel-main saas-solution-media ${galleryItems[0]?.imageSrc ? "has-media-image" : "media-fallback-a"}`} style={getMediaStyle(galleryItems[0]?.imageSrc || content.brand.heroImageSrc, "0.24", galleryItems[0]?.imagePosition || content.brand.heroImagePosition)} />
            </InlineImageField>
          ) : (
            <article className={`media-panel media-panel-main saas-solution-media ${galleryItems[0]?.imageSrc ? "has-media-image" : "media-fallback-a"}`} style={getMediaStyle(galleryItems[0]?.imageSrc || content.brand.heroImageSrc, "0.24", galleryItems[0]?.imagePosition || content.brand.heroImagePosition)} />
          )}
        </div>
      </section>

      <section className="scene scene-benefits saas-benefits-shell" data-animate data-animate-delay="180">
        <div className="section-copy saas-section-copy">
          <span className="scene-chip">Benefits</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Beneficios visibles para avanzar mas rapido.")}</h2>
        </div>
        <div className="saas-benefits-grid">
          {benefitCards.map((benefit, index) => (
            <article className="note-card saas-benefit-card" key={`${benefit.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{benefit.title}</strong>
              <p>{benefit.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="scene scene-how saas-how-shell" data-animate data-animate-delay="210">
        <div className="section-copy saas-section-copy">
          <span className="scene-chip">How it works</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Tres pasos para pasar del interes a la accion.")}</h2>
        </div>
        <div className="saas-how-grid">
          {howItWorksSteps.map((step) => (
            <article className="service-spotlight saas-step-card" key={step.step}>
              <div className="service-spotlight-copy">
                <div className="service-spotlight-heading">
                  <span className="service-spotlight-index">{step.step}</span>
                  <strong className="service-spotlight-title">{step.title}</strong>
                </div>
                <p className="service-spotlight-text">{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="scene scene-showcase saas-showcase-shell" data-animate data-animate-delay="240" id="oferta">
        <div className="section-copy saas-section-copy">
          <span className="scene-chip">Showcase</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Oferta con mas jerarquia y menos ruido.")}</h2>
        </div>
        <div className="saas-showcase-grid">
          {galleryItems.map((item, index) => (
            <article className={`collection-card saas-showcase-card saas-showcase-card-${index + 1}`} key={item.key}>
              {editorMode ? (
                <InlineImageField enabled={editorMode} fieldKey={`galeria-${index + 1}`} label={`Showcase ${index + 1}`} onChange={editorMode ? (event) => editorImageControls?.onGalleryImageChange(index, event) : undefined} uploading={editorMode && editorImageControls?.uploadingField === `galeria ${index + 1}`}>
                  <div className={`media-panel media-panel-collection store-collection-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`} style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)} />
                </InlineImageField>
              ) : (
                <div className={`media-panel media-panel-collection store-collection-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`} style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)} />
              )}
              <div className="mosaic-copy store-collection-copy">
                <span>{item.subtitle}</span>
                <strong>{item.title}</strong>
                <p>{services[index]?.description || content.brand.subheadline}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LandingTestimonialsRail editorImageControls={editorImageControls} editorMode={editorMode} editorTextControls={editorTextControls} label={testimonialsChip} reviews={landingTestimonials} title={testimonialsTitle} dataAnimateDelay={290} />

      <LandingFaqAccordion editorMode={editorMode} editorTextControls={editorTextControls} items={landingFaqs} label={faqChip} title={faqTitle} dataAnimateDelay={320} />

      <LandingSignatureCta content={content} profile={profile} dataAnimateDelay={350} />

      <ContactForm description={content.contact.description} title={content.contact.title} whatsappNumber={content.contact.whatsappNumber} />

      <footer className="scene scene-footer saas-footer">
        <div className="brand-lockup">
          <span className="scene-chip">{profile.industry}</span>
          <strong>{content.brand.name}</strong>
          <p>{content.contact.description}</p>
        </div>
        <div className="topline-nav">
          {footerAnchors.map((page) => (
            <a href={page.href} key={page.label}>{page.label}</a>
          ))}
        </div>
      </footer>
    </>
  );
}

