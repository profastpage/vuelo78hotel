import type { TemplateSiteConfig } from "@/types/template-site";
import { TemplateIcon } from "./TemplateIcon";
import { TemplateSectionHeader } from "./TemplateSectionHeader";
import styles from "./TemplateSite.module.css";

type TemplateContactProps = {
  contact: TemplateSiteConfig["contact"];
};

export function TemplateContact({ contact }: TemplateContactProps) {
  const whatsappValue = getWhatsappLabel(contact.whatsappHref);

  return (
    <section className={styles.section} id="contact">
      <TemplateSectionHeader eyebrow={contact.eyebrow} title={contact.title} description={contact.description} />

      <div className={styles.contactGrid}>
        <article className={styles.contactCard}>
          <div className={styles.contactFacts}>
            <div className={styles.contactFact}>
              <strong>{contact.whatsappLabel}</strong>
              <p className={styles.contactText}>{whatsappValue}</p>
            </div>
            <div className={styles.contactFact}>
              <strong>Email</strong>
              <p className={styles.contactText}>{contact.emailLabel}</p>
            </div>
            <div className={styles.contactFact}>
              <strong>Direccion</strong>
              <p className={styles.contactText}>{contact.address}</p>
            </div>
            {contact.hours ? (
              <div className={styles.contactFact}>
                <strong>Horario o atencion</strong>
                <p className={styles.contactText}>{contact.hours}</p>
              </div>
            ) : null}
          </div>

          <div className={styles.contactActions}>
            <a className={styles.contactButton} href={contact.whatsappHref}>
              {contact.whatsappLabel}
            </a>
            <a className={styles.secondaryButton} href={`mailto:${contact.emailLabel}`}>
              {contact.emailLabel}
            </a>
          </div>

          {contact.socialLinks?.length ? (
            <div className={styles.socialLinks}>
              {contact.socialLinks.map((item) => (
                <a className={styles.socialLink} href={item.href} key={item.label} rel="noreferrer" target="_blank">
                  <TemplateIcon name={item.icon} size={16} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          ) : null}
        </article>

        <article className={styles.mapCard}>
          {contact.mapEmbedUrl ? (
            <div className={styles.mapFrame}>
              <iframe
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={contact.mapEmbedUrl}
                title={contact.title}
              />
            </div>
          ) : (
            <div className={styles.contactBody}>
              <h3 className={styles.contactTitle}>Direccion</h3>
              <p className={styles.contactText}>{contact.address}</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function getWhatsappLabel(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.hostname.includes("wa.me")) {
      return `+${parsed.pathname.replace(/\//g, "")}`;
    }
  } catch {
    return value;
  }

  return value;
}
