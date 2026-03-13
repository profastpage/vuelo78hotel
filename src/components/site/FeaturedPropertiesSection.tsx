import type { SiteContent } from "@/types/site";
import { renderBalancedSectionTitle } from "./headline-balance";
import { InlineImageField } from "./InlineImageField";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";
import { getGalleryItems, getMediaStyle, getVisibleHighlights, getVisibleServices } from "./rendering";

type FeaturedPropertiesSectionProps = {
  content: SiteContent;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
  dataAnimateDelay?: number;
};

type PropertyCard = {
  index: number;
  key: string;
  title: string;
  subtitle: string;
  description: string;
  imageSrc?: string;
  imagePosition?: NonNullable<SiteContent["galleryItems"]>[number]["imagePosition"];
  chips: string[];
};

function buildPropertyCards(content: SiteContent): PropertyCard[] {
  const galleryItems = getGalleryItems(content, "Coleccion privada").slice(0, 3);
  const services = getVisibleServices(content);
  const highlights = getVisibleHighlights(content);

  return galleryItems.map((item, index) => {
    const service = services[index];
    const chips = [
      highlights[index],
      content.stats[index] ? `${content.stats[index].label}: ${content.stats[index].value}` : "",
    ].filter(Boolean);

    return {
      index,
      key: item.key,
      title: item.title,
      subtitle: item.subtitle,
      description: service?.description || highlights[index] || content.brand.description,
      imageSrc: item.imageSrc,
      imagePosition: item.imagePosition,
      chips,
    };
  });
}

export function FeaturedPropertiesSection({ content, editorMode = false, editorImageControls, editorTextControls, dataAnimateDelay }: FeaturedPropertiesSectionProps) {
  const propertyCards = buildPropertyCards(content);

  if (propertyCards.length === 0) {
    return null;
  }

  const [mainProperty, ...secondaryProperties] = propertyCards;
  const leadHighlights = getVisibleHighlights(content).slice(0, 3);
  const stats = content.stats.slice(0, 3);

  return (
    <section
      className="scene scene-featured-properties"
      data-editor-section="gallery services"
      id="propiedades"
      data-animate
      data-animate-delay={String(dataAnimateDelay ?? 180)}
    >
      <div className="featured-properties-heading">
        <div className="section-copy">
          <span className="scene-chip">Propiedades destacadas</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Seleccion curada para compradores serios.")}</h2>
          {editorMode ? (
            <InlineTextField
              as="p"
              controls={editorTextControls}
              enabled
              fieldKey="brand.subheadline"
              label="Subtitular"
              minRows={2}
              multiline
              section="hero"
              value={content.brand.subheadline}
            />
          ) : (
            <p>{content.brand.subheadline}</p>
          )}
        </div>

        <div className="property-highlight-cloud" aria-label="Razones para destacar propiedades">
          {leadHighlights.map((highlight) => (
            <span key={highlight}>{highlight}</span>
          ))}
        </div>
      </div>

      <div className="featured-properties-layout">
        <article className="property-overview-card">
          {editorMode ? (
            <InlineTextField
              as="span"
              className="property-kicker"
              compact
              controls={editorTextControls}
              enabled
              fieldKey="narrative.title"
              label="Titulo de narrativa"
              section="story"
              value={content.narrative.title}
            />
          ) : (
            <span className="property-kicker">{content.narrative.title}</span>
          )}
          {editorMode ? (
            <InlineTextField
              as="strong"
              controls={editorTextControls}
              enabled
              fieldKey="narrative.goal"
              label="Objetivo"
              minRows={3}
              multiline
              section="story"
              value={content.narrative.goal}
            />
          ) : (
            <strong>{content.narrative.goal}</strong>
          )}
          {editorMode ? (
            <InlineTextField
              as="p"
              controls={editorTextControls}
              enabled
              fieldKey="narrative.body"
              label="Cuerpo"
              minRows={3}
              multiline
              section="story"
              value={content.narrative.body}
            />
          ) : (
            <p>{content.narrative.body}</p>
          )}

          <div className="property-stat-stack">
            {stats.map((metric) => (
              <div className="property-stat-row" key={`${metric.label}-${metric.value}`}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>

          <div className="scene-actions">
            <a className="primary-button" href={content.brand.primaryCtaHref}>
              {content.brand.primaryCtaLabel}
            </a>
            <a className="secondary-button" href={content.brand.secondaryCtaHref}>
              {content.brand.secondaryCtaLabel}
            </a>
          </div>
        </article>

        {editorMode ? (
          <InlineImageField
            enabled={editorMode}
            fieldKey={`galeria-${mainProperty.index + 1}`}
            label={`Propiedad ${mainProperty.index + 1}`}
            onChange={editorMode ? (event) => editorImageControls?.onGalleryImageChange(mainProperty.index, event) : undefined}
            uploading={editorMode && editorImageControls?.uploadingField === `galeria ${mainProperty.index + 1}`}
          >
            <article
              className={`property-card property-card-main ${mainProperty.imageSrc ? "has-media-image" : "media-fallback-a"}`}
              style={getMediaStyle(mainProperty.imageSrc, "0.24", mainProperty.imagePosition)}
            >
              <div className="property-card-pane">
                {editorMode ? (
                  <InlineTextField
                    as="span"
                    compact
                    controls={editorTextControls}
                    enabled
                    fieldKey={`galleryItems.${mainProperty.index}.subtitle`}
                    label={`Subtitulo propiedad ${mainProperty.index + 1}`}
                    section="gallery"
                    value={mainProperty.subtitle}
                  />
                ) : (
                  <span>{mainProperty.subtitle}</span>
                )}
                {editorMode ? (
                  <InlineTextField
                    as="strong"
                    controls={editorTextControls}
                    enabled
                    fieldKey={`galleryItems.${mainProperty.index}.title`}
                    label={`Titulo propiedad ${mainProperty.index + 1}`}
                    section="gallery"
                    value={mainProperty.title}
                  />
                ) : (
                  <strong>{mainProperty.title}</strong>
                )}
                {editorMode ? (
                  <InlineTextField
                    as="p"
                    controls={editorTextControls}
                    enabled
                    fieldKey={`services.${mainProperty.index}.description`}
                    label={`Descripcion propiedad ${mainProperty.index + 1}`}
                    minRows={3}
                    multiline
                    section="services"
                    value={mainProperty.description}
                  />
                ) : (
                  <p>{mainProperty.description}</p>
                )}
                <div className="property-chip-row">
                  {mainProperty.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              </div>
            </article>
          </InlineImageField>
        ) : (
          <article
            className={`property-card property-card-main ${mainProperty.imageSrc ? "has-media-image" : "media-fallback-a"}`}
            style={getMediaStyle(mainProperty.imageSrc, "0.24", mainProperty.imagePosition)}
          >
            <div className="property-card-pane">
              <span>{mainProperty.subtitle}</span>
              <strong>{mainProperty.title}</strong>
              <p>{mainProperty.description}</p>
              <div className="property-chip-row">
                {mainProperty.chips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </div>
          </article>
        )}

        <div className="property-side-stack">
          {secondaryProperties.map((property, index) => (
            editorMode ? (
              <InlineImageField
                enabled={editorMode}
                fieldKey={`galeria-${property.index + 1}`}
                key={property.key}
                label={`Propiedad ${property.index + 1}`}
                onChange={editorMode ? (event) => editorImageControls?.onGalleryImageChange(property.index, event) : undefined}
                uploading={editorMode && editorImageControls?.uploadingField === `galeria ${property.index + 1}`}
              >
                <article
                  className={`property-card property-card-compact property-card-offset-${index + 1} ${
                    property.imageSrc ? "has-media-image" : `media-fallback-${index % 2 === 0 ? "b" : "c"}`
                  }`}
                  style={getMediaStyle(property.imageSrc, "0.28", property.imagePosition)}
                >
                  <div className="property-card-pane">
                    {editorMode ? (
                      <InlineTextField
                        as="span"
                        compact
                        controls={editorTextControls}
                        enabled
                        fieldKey={`galleryItems.${property.index}.subtitle`}
                        label={`Subtitulo propiedad ${property.index + 1}`}
                        section="gallery"
                        value={property.subtitle}
                      />
                    ) : (
                      <span>{property.subtitle}</span>
                    )}
                    {editorMode ? (
                      <InlineTextField
                        as="strong"
                        controls={editorTextControls}
                        enabled
                        fieldKey={`galleryItems.${property.index}.title`}
                        label={`Titulo propiedad ${property.index + 1}`}
                        section="gallery"
                        value={property.title}
                      />
                    ) : (
                      <strong>{property.title}</strong>
                    )}
                    {editorMode ? (
                      <InlineTextField
                        as="p"
                        controls={editorTextControls}
                        enabled
                        fieldKey={`services.${property.index}.description`}
                        label={`Descripcion propiedad ${property.index + 1}`}
                        minRows={2}
                        multiline
                        section="services"
                        value={property.description}
                      />
                    ) : (
                      <p>{property.description}</p>
                    )}
                  </div>
                </article>
              </InlineImageField>
            ) : (
              <article
                className={`property-card property-card-compact property-card-offset-${index + 1} ${
                  property.imageSrc ? "has-media-image" : `media-fallback-${index % 2 === 0 ? "b" : "c"}`
                }`}
                key={property.key}
                style={getMediaStyle(property.imageSrc, "0.28", property.imagePosition)}
              >
                <div className="property-card-pane">
                  <span>{property.subtitle}</span>
                  <strong>{property.title}</strong>
                  <p>{property.description}</p>
                </div>
              </article>
            )
          ))}

          <article className="property-market-card">
            <span className="property-kicker">Ruta de cierre</span>
            {editorMode ? (
              <InlineTextField
                as="strong"
                controls={editorTextControls}
                enabled
                fieldKey="contact.title"
                label="Titulo de contacto"
                section="contact"
                value={content.contact.title}
              />
            ) : (
              <strong>{content.contact.title}</strong>
            )}
            {editorMode ? (
              <InlineTextField
                as="p"
                controls={editorTextControls}
                enabled
                fieldKey="contact.description"
                label="Descripcion de contacto"
                minRows={3}
                multiline
                section="contact"
                value={content.contact.description}
              />
            ) : (
              <p>{content.contact.description}</p>
            )}
            <div className="property-chip-row">
              {leadHighlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
