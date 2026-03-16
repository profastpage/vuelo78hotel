"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { TemplateSiteConfig } from "@/types/template-site";
import { TemplateContact } from "./TemplateContact";
import { TemplateFeatures } from "./TemplateFeatures";
import { TemplateGallery } from "./TemplateGallery";
import { TemplateHero } from "./TemplateHero";
import { TemplateServices } from "./TemplateServices";
import { TemplateTestimonials } from "./TemplateTestimonials";
import styles from "./TemplateSite.module.css";

type TemplatePageEngineProps = {
  config: TemplateSiteConfig;
};

export function TemplatePageEngine({ config }: TemplatePageEngineProps) {
  const pageStyle = {
    "--template-accent": config.theme.accentColor,
    "--template-accent-alt": config.theme.accentAltColor,
    "--template-background": config.theme.backgroundColor,
    "--template-surface": config.theme.surfaceColor,
    "--template-text": config.theme.textColor,
    "--template-muted": config.theme.mutedColor,
  } as CSSProperties;

  return (
    <main className={styles.page} style={pageStyle}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#inicio">
            <span className={styles.brandMark} aria-hidden="true">
              {config.brand.logoSrc ? (
                <Image alt={config.brand.logoAlt || config.brand.name} height={56} src={config.brand.logoSrc} width={56} />
              ) : (
                <span className={styles.brandFallback}>{config.brand.name.slice(0, 1)}</span>
              )}
            </span>

            <span className={styles.brandCopy}>
              <strong className={styles.brandName}>{config.brand.name}</strong>
              <span className={styles.brandTagline}>{config.brand.tagline}</span>
            </span>
          </a>

          <nav className={styles.nav} aria-label="Navegacion principal">
            {config.navigation.map((item) => (
              <a className={styles.navLink} href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className={styles.headerCta} href={config.hero.primaryCta.href}>
            {config.hero.primaryCta.label}
          </a>
        </div>
      </header>

      <div className={styles.pageInner}>
        <TemplateHero hero={config.hero} />
        <TemplateFeatures features={config.features} />
        <TemplateGallery gallery={config.gallery} />
        <TemplateServices services={config.services} />
        <TemplateTestimonials testimonials={config.testimonials} />
        <TemplateContact contact={config.contact} />

        <footer className={styles.footer}>
          <p>{config.footer.copyright}</p>
          {config.footer.note ? <p className={styles.footerNote}>{config.footer.note}</p> : null}
        </footer>
      </div>
    </main>
  );
}
