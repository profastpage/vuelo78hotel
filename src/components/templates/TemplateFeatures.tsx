import type { TemplateSiteConfig } from "@/types/template-site";
import { TemplateIcon } from "./TemplateIcon";
import { TemplateSectionHeader } from "./TemplateSectionHeader";
import styles from "./TemplateSite.module.css";

type TemplateFeaturesProps = {
  features: TemplateSiteConfig["features"];
};

export function TemplateFeatures({ features }: TemplateFeaturesProps) {
  return (
    <section className={styles.section} id="features">
      <TemplateSectionHeader eyebrow={features.eyebrow} title={features.title} description={features.description} />

      <div className={styles.featuresGrid}>
        {features.items.map((item) => (
          <article className={styles.featureCard} key={item.title}>
            <span className={styles.featureIcon} aria-hidden="true">
              <TemplateIcon name={item.icon} size={22} strokeWidth={1.8} />
            </span>
            <h3 className={styles.featureTitle}>{item.title}</h3>
            <p className={styles.featureDescription}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
