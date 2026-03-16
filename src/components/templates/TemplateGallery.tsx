import Image from "next/image";
import type { TemplateSiteConfig } from "@/types/template-site";
import { TemplateSectionHeader } from "./TemplateSectionHeader";
import styles from "./TemplateSite.module.css";

type TemplateGalleryProps = {
  gallery: TemplateSiteConfig["gallery"];
};

export function TemplateGallery({ gallery }: TemplateGalleryProps) {
  const [lead, ...rail] = gallery.items;

  return (
    <section className={styles.section} id="gallery">
      <TemplateSectionHeader eyebrow={gallery.eyebrow} title={gallery.title} description={gallery.description} />

      <div className={styles.galleryGrid}>
        <article className={styles.galleryLead}>
          <div className={styles.mediaFrame}>
            <Image
              alt={lead.imageAlt || lead.title}
              className={styles.image}
              fill
              priority
              quality={88}
              sizes="(max-width: 1100px) 100vw, 42vw"
              src={lead.imageSrc}
            />
          </div>
          <div className={styles.galleryMeta}>
            <h3 className={styles.featureTitle}>{lead.title}</h3>
            <p className={styles.featureDescription}>{lead.description}</p>
          </div>
        </article>

        <div className={styles.galleryRail}>
          {rail.map((item) => (
            <article className={styles.galleryCard} key={item.title}>
              <div className={styles.mediaFrame}>
                <Image
                  alt={item.imageAlt || item.title}
                  className={styles.image}
                  fill
                  loading="lazy"
                  quality={86}
                  sizes="(max-width: 1100px) 100vw, 28vw"
                  src={item.imageSrc}
                />
              </div>
              <div className={styles.galleryMeta}>
                <h3 className={styles.featureTitle}>{item.title}</h3>
                <p className={styles.featureDescription}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
