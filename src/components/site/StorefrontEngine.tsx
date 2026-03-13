import type { ClientProfile, SiteContent } from "@/types/site";
import type { ReactNode } from "react";
import { EditorRemovable } from "./EditorRemovable";
import { renderBalancedHeroHeadline, renderBalancedSectionTitle, splitHeroHeadline } from "./headline-balance";
import { InlineImageField } from "./InlineImageField";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorItemControls } from "./editor-item-types";
import type { EditorTextControls } from "./editor-text-types";
import { FaqAccordionList } from "./FaqAccordionList";
import { InlineTextField } from "./InlineTextField";
import {
  formatModuleLabel,
  getActiveModules,
  getGalleryItems,
  getMediaStyle,
  getPageHref,
  getProductHref,
  getStoryLabels,
  getVisibleFaqs,
  getVisibleServices,
  getVisibleTestimonials,
  normalizeVisualStyle,
} from "./rendering";

type StorefrontEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorItemControls?: EditorItemControls;
  editorTextControls?: EditorTextControls;
};

type StorefrontChromeProps = {
  profile: ClientProfile;
  content: SiteContent;
  editorMode: boolean;
  editorTextControls?: EditorTextControls;
  children: ReactNode;
};

type StorefrontHeroCopyProps = {
  profile: ClientProfile;
  content: SiteContent;
  editorMode: boolean;
  editorTextControls?: EditorTextControls;
  className?: string;
};

function indexOfCategory(categories: SiteContent["services"], title: string) {
  return Math.max(
    0,
    categories.findIndex((item) => item.title === title),
  );
}

function StorefrontChrome({ profile, content, editorMode, editorTextControls, children }: StorefrontChromeProps) {
  return (
    <section
      className="scene scene-store-shell"
      data-editor-section="hero visual story services"
      id="inicio"
      data-animate
      data-animate-delay="0"
    >
      <div className="store-topline">
        {editorMode ? (
          <InlineTextField
            as="span"
            compact
            controls={editorTextControls}
            enabled
            fieldKey="brand.name"
            label="Nombre visible"
            section="hero"
            value={content.brand.name}
          />
        ) : (
          <span>{content.brand.name}</span>
        )}
        <div className="topline-nav store-inline-links">
          {content.pages.slice(0, 3).map((page, index) => (
            <a href={getPageHref(page)} key={`${page}-${index}`}>
              {editorMode ? (
                <InlineTextField as="span" compact controls={editorTextControls} enabled fieldKey={`pages.${index}`} label={`Link ${index + 1}`} section="hero" showTrigger={false} value={page} />
              ) : (
                page
              )}
            </a>
          ))}
        </div>
      </div>

      <header className="store-headbar">
        <div className="store-branding">
          <span className="store-mark" />
          <div>
            {editorMode ? (
              <InlineTextField
                as="strong"
                controls={editorTextControls}
                enabled
                fieldKey="brand.name"
                label="Nombre visible"
                section="hero"
                value={content.brand.name}
              />
            ) : (
              <strong>{content.brand.name}</strong>
            )}
            <p>{profile.industry}</p>
          </div>
        </div>
        <div className="store-search-shell">
          <input aria-label="Buscar productos" placeholder="Buscar productos..." readOnly value="" />
          <span>Buscar</span>
        </div>
        <div className="store-inline-links">
          <a href={getPageHref("Cuenta")}>Cuenta</a>
          <a href={getPageHref("Colecciones")}>Favoritos</a>
        </div>
      </header>

      {children}
    </section>
  );
}

function StorefrontHeroCopy({ profile, content, editorMode, editorTextControls, className }: StorefrontHeroCopyProps) {
  const heroHeadlineLines = splitHeroHeadline(content.brand.headline);

  return (
    <div className={`hero-copy store-hero-copy ${className || ""}`.trim()}>
      {editorMode ? (
        <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="brand.heroTag" label="Hero tag" section="hero" value={content.brand.heroTag || profile.projectType} />
      ) : (
        <span className="scene-chip">{content.brand.heroTag || profile.projectType}</span>
      )}
      {editorMode ? (
        <InlineTextField
          as="h1"
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
        <h1 className="hero-title" data-line-count={heroHeadlineLines.length}>
          {renderBalancedHeroHeadline(content.brand.headline)}
        </h1>
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
  );
}

export function StorefrontEngine({ profile, content, editorImageControls, editorItemControls, editorMode = false, editorTextControls }: StorefrontEngineProps) {
  const galleryItems = getGalleryItems(content, profile.industry).slice(0, 4);
  const categories = getVisibleServices(content).slice(0, 4);
  const products = content.products.slice(0, 4);
  const testimonials = getVisibleTestimonials(content).slice(0, 8);
  const faqs = getVisibleFaqs(content).slice(0, 8);
  const activeModules = getActiveModules(profile.modules);
  const labels = getStoryLabels(profile, content);
  const visualStyle = normalizeVisualStyle(content.theme.visualStyle);

  if (visualStyle === "bento") {
    return (
      <>
        <StorefrontChrome content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile}>
          <div className="storefront-bento-hero" id="nosotros">
            <StorefrontHeroCopy content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile} />
            <article
              className={`media-panel media-panel-store storefront-bento-hero-media ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-d"}`}
              style={getMediaStyle(content.brand.heroImageSrc, "0.22", content.brand.heroImagePosition)}
            >
              <div className="media-copy store-hero-media-copy">
                <span>{labels.heroLabel}</span>
                <strong>{content.narrative.goal}</strong>
              </div>
            </article>
            <article className="storefront-bento-tile storefront-bento-tile-intro">
              <span>Drop actual</span>
              <strong>{categories[0]?.title || content.narrative.title}</strong>
              <p>{categories[0]?.description || content.narrative.body}</p>
            </article>
            <article className="storefront-bento-tile storefront-bento-tile-product">
              <span>{products[0]?.price || "Catalogo"}</span>
              <strong>{products[0]?.name || content.narrative.goal}</strong>
              <p>{products[0]?.description || content.brand.description}</p>
            </article>
          </div>
        </StorefrontChrome>

        <section className="scene storefront-bento-grid" data-editor-section="gallery services" id="servicios" data-animate data-animate-delay="90">
          <div className="section-copy">
            <span className="scene-chip">Colecciones</span>
            <h2 className="section-title">{renderBalancedSectionTitle("Sistema bento para ordenar coleccion y compra.")}</h2>
          </div>
          <div className="storefront-bento-grid-cards">
            {galleryItems.map((item, index) => (
              <EditorRemovable editorMode={editorMode} key={item.key} label={`coleccion ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("galleryItems", index) : undefined}>
                <article className={`collection-card storefront-bento-card storefront-bento-card-${index + 1}`}>
                  <div
                    className={`media-panel media-panel-collection store-collection-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                    style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)}
                  />
                  <div className="mosaic-copy store-collection-copy">
                    <span>{item.subtitle}</span>
                    <strong>{item.title}</strong>
                  </div>
                </article>
              </EditorRemovable>
            ))}
          </div>
          <div className="storefront-bento-products">
            {products.map((product, index) => (
              <EditorRemovable editorMode={editorMode} key={product.name} label={`producto ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("products", index) : undefined}>
              <article className="product-card store-product-card">
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`producto-${index + 1}`}
                    label={`Producto ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onProductImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `producto ${index + 1}`}
                  >
                    <div
                      className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                      style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                    />
                  </InlineImageField>
                ) : (
                  <div
                    className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                    style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                  />
                )}
                <div className="product-copy store-product-copy">
                  <span>{product.price}</span>
                  <strong>{product.name}</strong>
                  <p>{product.description}</p>
                </div>
                <a className="primary-button product-link" href={getProductHref(product.name, content)}>
                  Ver producto
                </a>
              </article>
              </EditorRemovable>
            ))}
          </div>
        </section>

        <section className="scene storefront-bento-support" data-editor-section="contact testimonials faqs" id="contacto" data-animate data-animate-delay="170">
          <div className="storefront-bento-proof" data-editor-section="testimonials">
            {testimonials.map((testimonial, index) => (
              <EditorRemovable editorMode={editorMode} key={testimonial.name} label={`testimonio ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("testimonials", index) : undefined}>
              <article className="quote-card store-review-card">
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`testimonio-${index + 1}`}
                    label={`Testimonio ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onTestimonialImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `testimonio ${index + 1}`}
                  >
                    <div
                      className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                      style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                    />
                  </InlineImageField>
                ) : (
                  <div
                    className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                    style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                  />
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
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${index}.quote`} label={`Cita testimonio ${index + 1}`} multiline minRows={3} section="testimonials" value={testimonial.quote} />
                ) : (
                  <p>"{testimonial.quote}"</p>
                )}
                <a className="secondary-button" href={`https://wa.me/${content.contact.whatsappNumber.replace(/\D/g, "")}`}>
                  Contactar
                </a>
              </article>
              </EditorRemovable>
            ))}
          </div>
          <aside className="storefront-bento-utility" data-editor-section="faqs">
            <span className="scene-chip">Modulos activos</span>
            <div className="tag-cloud">
              {activeModules.length > 0 ? activeModules.map(([key]) => <span key={key}>{formatModuleLabel(key)}</span>) : <span>Base limpia</span>}
            </div>
            <FaqAccordionList
              editorMode={editorMode}
              editorTextControls={editorTextControls}
              items={faqs}
              onRemoveItem={editorMode && editorItemControls?.onRemoveItem ? (index) => editorItemControls.onRemoveItem?.("faqs", index) : undefined}
            />
          </aside>
        </section>
      </>
    );
  }

  if (visualStyle === "editorial") {
    return (
      <>
        <StorefrontChrome content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile}>
          <div className="storefront-editorial-hero" id="nosotros">
            <aside className="storefront-editorial-aside">
              <span className="scene-chip">Curaduria</span>
              {categories.slice(0, 3).map((category) => (
                <EditorRemovable editorMode={editorMode} key={category.title} label={`servicio ${category.title}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("services", indexOfCategory(categories, category.title)) : undefined}>
                  <article className="category-card store-category-card">
                    <strong>{category.title}</strong>
                    <p>{category.description}</p>
                  </article>
                </EditorRemovable>
              ))}
            </aside>

            <StorefrontHeroCopy className="storefront-editorial-copy" content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile} />

            <article
              className={`media-panel media-panel-store storefront-editorial-media ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-d"}`}
              style={getMediaStyle(content.brand.heroImageSrc, "0.22", content.brand.heroImagePosition)}
            >
              <div className="media-copy store-hero-media-copy">
                <span>{labels.heroLabel}</span>
                <strong>{content.narrative.goal}</strong>
              </div>
            </article>
          </div>
        </StorefrontChrome>

        <section className="scene storefront-editorial-catalog" data-editor-section="gallery services" id="servicios" data-animate data-animate-delay="100">
          <div className="section-copy">
            <span className="scene-chip">Catalogo editorial</span>
            <h2 className="section-title">{renderBalancedSectionTitle("Composicion asimetrica para destacar producto.")}</h2>
          </div>
          <div className="storefront-editorial-grid">
            {products.map((product, index) => (
              <EditorRemovable editorMode={editorMode} key={product.name} label={`producto ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("products", index) : undefined}>
              <article className={`product-card store-product-card storefront-editorial-product storefront-editorial-product-${index + 1}`}>
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`producto-${index + 1}`}
                    label={`Producto ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onProductImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `producto ${index + 1}`}
                  >
                    <div
                      className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                      style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                    />
                  </InlineImageField>
                ) : (
                  <div
                    className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                    style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                  />
                )}
                <div className="product-copy store-product-copy">
                  <span>{product.price}</span>
                  <strong>{product.name}</strong>
                  <p>{product.description}</p>
                </div>
                <a className="primary-button product-link" href={getProductHref(product.name, content)}>
                  Ver producto
                </a>
              </article>
              </EditorRemovable>
            ))}
            {galleryItems.slice(0, 2).map((item, index) => (
              <EditorRemovable editorMode={editorMode} key={item.key} label={`coleccion ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("galleryItems", index) : undefined}>
              <article className={`collection-card storefront-editorial-collection storefront-editorial-collection-${index + 1}`}>
                <div
                  className={`media-panel media-panel-collection store-collection-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                  style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)}
                />
                <div className="mosaic-copy store-collection-copy">
                  <span>{item.subtitle}</span>
                  <strong>{item.title}</strong>
                </div>
              </article>
              </EditorRemovable>
            ))}
          </div>
        </section>

        <section className="scene storefront-editorial-proof" data-editor-section="contact testimonials faqs" id="contacto" data-animate data-animate-delay="170">
          <div className="storefront-editorial-reviews" data-editor-section="testimonials">
            {testimonials.map((testimonial, index) => (
              <EditorRemovable editorMode={editorMode} key={testimonial.name} label={`testimonio ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("testimonials", index) : undefined}>
              <article className="quote-card store-review-card">
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`testimonio-${index + 1}`}
                    label={`Testimonio ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onTestimonialImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `testimonio ${index + 1}`}
                  >
                    <div
                      className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                      style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                    />
                  </InlineImageField>
                ) : (
                  <div
                    className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                    style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                  />
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
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${index}.quote`} label={`Cita testimonio ${index + 1}`} multiline minRows={3} section="testimonials" value={testimonial.quote} />
                ) : (
                  <p>"{testimonial.quote}"</p>
                )}
                <a className="secondary-button" href={`https://wa.me/${content.contact.whatsappNumber.replace(/\D/g, "")}`}>
                  Contactar
                </a>
              </article>
              </EditorRemovable>
            ))}
          </div>
          <aside className="storefront-editorial-faqs" data-editor-section="faqs">
            <span className="scene-chip">Respuestas</span>
            <FaqAccordionList
              editorMode={editorMode}
              editorTextControls={editorTextControls}
              items={faqs}
              onRemoveItem={editorMode && editorItemControls?.onRemoveItem ? (index) => editorItemControls.onRemoveItem?.("faqs", index) : undefined}
            />
            <div className="tag-cloud">
              {activeModules.length > 0 ? activeModules.map(([key]) => <span key={key}>{formatModuleLabel(key)}</span>) : <span>Base limpia</span>}
            </div>
          </aside>
        </section>
      </>
    );
  }

  if (visualStyle === "immersive") {
    return (
      <>
        <StorefrontChrome content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile}>
          <article
            className={`storefront-immersive-hero ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-d"}`}
            id="nosotros"
            style={getMediaStyle(content.brand.heroImageSrc, "0.2", content.brand.heroImagePosition)}
          >
            <div className="storefront-immersive-overlay" aria-hidden="true" />
            <StorefrontHeroCopy className="storefront-immersive-copy" content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile} />
            <div className="storefront-immersive-modules">
              {activeModules.length > 0 ? activeModules.slice(0, 5).map(([key]) => <span key={key}>{formatModuleLabel(key)}</span>) : <span>Base limpia</span>}
            </div>
          </article>
        </StorefrontChrome>

        <section className="scene storefront-immersive-catalog" data-editor-section="gallery services" id="servicios" data-animate data-animate-delay="100">
          <div className="section-copy">
            <span className="scene-chip">Colecciones</span>
            <h2 className="section-title">{renderBalancedSectionTitle("Escenas grandes y ruta directa a compra.")}</h2>
          </div>
          <div className="storefront-immersive-gallery">
            {galleryItems.map((item, index) => (
              <EditorRemovable editorMode={editorMode} key={item.key} label={`coleccion ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("galleryItems", index) : undefined}>
              <article className="collection-card storefront-immersive-collection">
                <div
                  className={`media-panel media-panel-collection store-collection-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                  style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)}
                />
                <div className="mosaic-copy store-collection-copy">
                  <span>{item.subtitle}</span>
                  <strong>{item.title}</strong>
                </div>
              </article>
              </EditorRemovable>
            ))}
          </div>
          <div className="storefront-immersive-products">
            {products.map((product, index) => (
              <EditorRemovable editorMode={editorMode} key={product.name} label={`producto ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("products", index) : undefined}>
              <article className="product-card storefront-immersive-product">
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`producto-${index + 1}`}
                    label={`Producto ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onProductImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `producto ${index + 1}`}
                  >
                    <div
                      className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                      style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                    />
                  </InlineImageField>
                ) : (
                  <div
                    className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                    style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                  />
                )}
                <div className="product-copy store-product-copy">
                  <span>{product.price}</span>
                  <strong>{product.name}</strong>
                  <p>{product.description}</p>
                </div>
                <a className="primary-button product-link" href={getProductHref(product.name, content)}>
                  Ver producto
                </a>
              </article>
              </EditorRemovable>
            ))}
          </div>
        </section>

        <section className="scene storefront-immersive-proof" data-editor-section="contact testimonials faqs" id="contacto" data-animate data-animate-delay="170">
          <div className="storefront-immersive-reviews" data-editor-section="testimonials">
            {testimonials.map((testimonial, index) => (
              <EditorRemovable editorMode={editorMode} key={testimonial.name} label={`testimonio ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("testimonials", index) : undefined}>
              <article className="quote-card store-review-card">
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`testimonio-${index + 1}`}
                    label={`Testimonio ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onTestimonialImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `testimonio ${index + 1}`}
                  >
                    <div
                      className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                      style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                    />
                  </InlineImageField>
                ) : (
                  <div
                    className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                    style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                  />
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
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${index}.quote`} label={`Cita testimonio ${index + 1}`} multiline minRows={3} section="testimonials" value={testimonial.quote} />
                ) : (
                  <p>"{testimonial.quote}"</p>
                )}
                <a className="secondary-button" href={`https://wa.me/${content.contact.whatsappNumber.replace(/\D/g, "")}`}>
                  Contactar
                </a>
              </article>
              </EditorRemovable>
            ))}
          </div>
          <div className="storefront-immersive-faqs" data-editor-section="faqs">
            <FaqAccordionList
              editorMode={editorMode}
              editorTextControls={editorTextControls}
              items={faqs}
              onRemoveItem={editorMode && editorItemControls?.onRemoveItem ? (index) => editorItemControls.onRemoveItem?.("faqs", index) : undefined}
            />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <StorefrontChrome content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile}>
        <div className="store-hero-frame" id="nosotros">
          <aside className="category-column store-category-column">
            <span className="scene-chip">{"Curaduria"}</span>
            {categories.map((category) => (
              <EditorRemovable editorMode={editorMode} key={category.title} label={`servicio ${category.title}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("services", indexOfCategory(categories, category.title)) : undefined}>
                <article className="category-card store-category-card">
                  <strong>{category.title}</strong>
                  <p>{category.description}</p>
                </article>
              </EditorRemovable>
            ))}
          </aside>

          <article className="store-hero-stage">
            <StorefrontHeroCopy content={content} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile} />

            <div
              className={`media-panel media-panel-store store-hero-media ${content.brand.heroImageSrc ? "has-media-image" : "media-fallback-d"}`}
              style={getMediaStyle(content.brand.heroImageSrc, "0.22", content.brand.heroImagePosition)}
            >
              <div className="media-copy store-hero-media-copy">
                <span>{labels.heroLabel}</span>
                {editorMode ? (
                  <InlineTextField
                    as="strong"
                    controls={editorTextControls}
                    enabled
                    fieldKey="narrative.goal"
                    label="Objetivo"
                    minRows={2}
                    multiline
                    section="story"
                    value={content.narrative.goal}
                  />
                ) : (
                  <strong>{content.narrative.goal}</strong>
                )}
              </div>
            </div>
          </article>
        </div>
      </StorefrontChrome>

      <section
        className="scene scene-gallery"
        data-editor-section="gallery"
        id="servicios"
        data-animate
        data-animate-delay="100"
      >
        <div className="section-copy">
          <span className="scene-chip">Colecciones</span>
          <h2 className="section-title">{renderBalancedSectionTitle("La navegacion parte de la coleccion.")}</h2>
        </div>
        <div className="scroll-gallery collection-rail store-collection-rail">
          {galleryItems.map((item, index) => (
            <EditorRemovable editorMode={editorMode} key={item.key} label={`coleccion ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("galleryItems", index) : undefined}>
            <article className="collection-card store-collection-card">
              <div
                className={`media-panel media-panel-collection store-collection-media ${item.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(97 + (index % 4))}`}`}
                style={getMediaStyle(item.imageSrc, "0.28", item.imagePosition)}
              />
              <div className="mosaic-copy store-collection-copy">
                <span>{item.subtitle}</span>
                <strong>{item.title}</strong>
              </div>
            </article>
            </EditorRemovable>
          ))}
        </div>
      </section>

      <section
        className="scene scene-products"
        data-editor-section="gallery services"
        id="trabajos"
        data-animate
        data-animate-delay="160"
      >
        <div className="section-copy">
          <span className="scene-chip">{"Catalogo"}</span>
          <h2 className="section-title">{renderBalancedSectionTitle("Producto protagonista, imagen grande y CTA real.")}</h2>
        </div>
        <div className="product-grid store-products-grid">
          {products.map((product, index) => (
            <EditorRemovable editorMode={editorMode} key={product.name} label={`producto ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("products", index) : undefined}>
            <article className="product-card store-product-card">
              {editorMode ? (
                <InlineImageField
                  enabled={editorMode}
                  fieldKey={`producto-${index + 1}`}
                  label={`Producto ${index + 1}`}
                  onChange={editorMode ? (event) => editorImageControls?.onProductImageChange(index, event) : undefined}
                  uploading={editorMode && editorImageControls?.uploadingField === `producto ${index + 1}`}
                >
                  <div
                    className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                    style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                  />
                </InlineImageField>
              ) : (
                <div
                  className={`media-panel media-panel-product store-product-media ${product.imageSrc ? "has-media-image" : `media-fallback-${String.fromCharCode(98 + (index % 3))}`}`}
                  style={getMediaStyle(product.imageSrc, "0.18", product.imagePosition)}
                />
              )}
              <div className="product-copy store-product-copy">
                <span>{product.price}</span>
                <strong>{product.name}</strong>
                <p>{product.description}</p>
              </div>
              <a className="primary-button product-link" href={getProductHref(product.name, content)}>
                Ver producto
              </a>
            </article>
            </EditorRemovable>
          ))}
        </div>
      </section>

      <section
        className="scene scene-store-support"
        data-editor-section="contact testimonials faqs"
        id="contacto"
        data-animate
        data-animate-delay="220"
      >
        <div className="store-support-main" data-editor-section="testimonials">
          <div className="section-copy">
            <span className="scene-chip">{"Acompanamiento"}</span>
            <h2 className="section-title">{renderBalancedSectionTitle("El storefront tambien vende confianza y accion.")}</h2>
          </div>
          <div className="scroll-gallery quote-gallery store-quote-rail store-review-rail">
            {testimonials.map((testimonial, index) => (
              <EditorRemovable editorMode={editorMode} key={testimonial.name} label={`testimonio ${index + 1}`} onRemove={editorItemControls?.onRemoveItem ? () => editorItemControls.onRemoveItem?.("testimonials", index) : undefined}>
              <article className="quote-card store-review-card">
                {editorMode ? (
                  <InlineImageField
                    enabled={editorMode}
                    fieldKey={`testimonio-${index + 1}`}
                    label={`Testimonio ${index + 1}`}
                    onChange={editorMode ? (event) => editorImageControls?.onTestimonialImageChange(index, event) : undefined}
                    uploading={editorMode && editorImageControls?.uploadingField === `testimonio ${index + 1}`}
                  >
                    <div
                      className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                      style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                    />
                  </InlineImageField>
                ) : (
                  <div
                    className={`media-panel media-panel-avatar store-review-media ${(testimonial.avatarSrc || galleryItems[index]?.imageSrc) ? "has-media-image" : `media-fallback-${String.fromCharCode(99 + (index % 3))}`}`}
                    style={getMediaStyle(testimonial.avatarSrc || galleryItems[index]?.imageSrc, "0.3", galleryItems[index]?.imagePosition)}
                  />
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
                {editorMode ? (
                  <InlineTextField as="p" controls={editorTextControls} displayValue={`"${testimonial.quote}"`} enabled fieldKey={`testimonials.${index}.quote`} label={`Cita testimonio ${index + 1}`} multiline minRows={3} section="testimonials" value={testimonial.quote} />
                ) : (
                  <p>"{testimonial.quote}"</p>
                )}
                <a className="secondary-button" href={`https://wa.me/${content.contact.whatsappNumber.replace(/\D/g, "")}`}>
                  Contactar
                </a>
              </article>
              </EditorRemovable>
            ))}
          </div>
        </div>

        <aside className="utility-column store-support-aside" data-editor-section="faqs">
          <span className="scene-chip">{"Modulos activos"}</span>
          <div className="tag-cloud">
            {activeModules.length > 0 ? activeModules.map(([key]) => <span key={key}>{formatModuleLabel(key)}</span>) : <span>Base limpia</span>}
          </div>
          <FaqAccordionList
            editorMode={editorMode}
            editorTextControls={editorTextControls}
            items={faqs}
            onRemoveItem={editorMode && editorItemControls?.onRemoveItem ? (index) => editorItemControls.onRemoveItem?.("faqs", index) : undefined}
          />
        </aside>
      </section>
    </>
  );
}
