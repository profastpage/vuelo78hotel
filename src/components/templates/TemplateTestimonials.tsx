import Image from "next/image";
import { Star } from "lucide-react";
import type { TemplateSiteConfig } from "@/types/template-site";
import { TemplateSectionHeader } from "./TemplateSectionHeader";
import styles from "./TemplateSite.module.css";

type TemplateTestimonialsProps = {
  testimonials: TemplateSiteConfig["testimonials"];
};

export function TemplateTestimonials({ testimonials }: TemplateTestimonialsProps) {
  return (
    <section className={styles.section} id="testimonials">
      <TemplateSectionHeader eyebrow={testimonials.eyebrow} title={testimonials.title} description={testimonials.description} />

      <div className={styles.testimonialsGrid}>
        {testimonials.items.map((item) => (
          <article className={styles.testimonialCard} key={`${item.name}-${item.location}`}>
            {item.avatarSrc ? (
              <div className={styles.testimonialMedia}>
                <Image
                  alt={item.name}
                  className={styles.testimonialAvatar}
                  fill
                  loading="lazy"
                  quality={84}
                  sizes="(max-width: 1100px) 100vw, 30vw"
                  src={item.avatarSrc}
                />
              </div>
            ) : null}

            <div className={styles.testimonialBody}>
              <div className={styles.stars} aria-label={`${item.rating} de 5 estrellas`}>
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star key={`${item.name}-star-${index}`} fill="currentColor" size={16} strokeWidth={1.8} />
                ))}
              </div>

              <p className={styles.quote}>"{item.quote}"</p>
              <div>
                <h3 className={styles.testimonialName}>{item.name}</h3>
                <p className={styles.testimonialLocation}>{item.location}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
