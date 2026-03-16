import Image from "next/image";
import type { TemplateSiteConfig } from "@/types/template-site";
import { TemplateIcon } from "./TemplateIcon";
import { TemplateSectionHeader } from "./TemplateSectionHeader";
import styles from "./TemplateSite.module.css";

type TemplateServicesProps = {
  services: TemplateSiteConfig["services"];
};

export function TemplateServices({ services }: TemplateServicesProps) {
  return (
    <section className={styles.section} id="services">
      <TemplateSectionHeader eyebrow={services.eyebrow} title={services.title} description={services.description} />

      <div className={styles.servicesGrid}>
        {services.items.map((item) => (
          <article className={styles.serviceCard} key={item.name}>
            {item.imageSrc ? (
              <div className={styles.mediaFrame}>
                <Image
                  alt={item.name}
                  className={styles.image}
                  fill
                  loading="lazy"
                  quality={86}
                  sizes="(max-width: 1100px) 100vw, 30vw"
                  src={item.imageSrc}
                />
              </div>
            ) : null}

            <div className={styles.serviceBody}>
              <span className={styles.serviceIcon} aria-hidden="true">
                <TemplateIcon name={item.icon || "sparkles"} size={20} strokeWidth={1.8} />
              </span>
              <h3 className={styles.serviceName}>{item.name}</h3>
              <p className={styles.serviceDescription}>{item.description}</p>

              {item.meta || item.price ? (
                <div className={styles.serviceTagRow}>
                  {item.meta ? <span className={styles.serviceTag}>{item.meta}</span> : null}
                  {item.price ? <span className={styles.serviceTag}>{item.price}</span> : null}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
