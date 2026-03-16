"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";
import type { TemplateSiteConfig } from "@/types/template-site";
import { TemplateIcon } from "./TemplateIcon";
import styles from "./TemplateSite.module.css";

type TemplateHeroProps = {
  hero: TemplateSiteConfig["hero"];
};

export function TemplateHero({ hero }: TemplateHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const totalSlides = hero.slides.length;

  const tick = useEffectEvent(() => {
    setActiveIndex((current) => (current + 1) % totalSlides);
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 860px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);

    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (totalSlides < 2) {
      return;
    }

    const intervalId = window.setInterval(() => tick(), 5200);
    return () => window.clearInterval(intervalId);
  }, [tick, totalSlides]);

  return (
    <section className={styles.hero} id="inicio">
      <div className={styles.heroMedia} aria-hidden="true">
        {hero.slides.map((slide, index) => {
          const imageSrc = isMobile && slide.mobileImageSrc ? slide.mobileImageSrc : slide.imageSrc;
          const objectPosition = isMobile ? slide.mobilePosition || slide.position : slide.position;

          return (
            <div
              className={`${styles.heroSlide}${index === activeIndex ? ` ${styles.heroSlideActive}` : ""}`}
              key={`${slide.title}-${index}`}
            >
              <Image
                alt={slide.title}
                className={styles.heroSlideImage}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                quality={92}
                sizes="100vw"
                src={imageSrc}
                style={{
                  objectPosition: `${objectPosition?.x ?? 50}% ${objectPosition?.y ?? 50}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{hero.eyebrow}</span>
          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <p className={styles.heroDescription}>{hero.description}</p>

          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </a>
            {hero.secondaryCta ? (
              <a className={styles.secondaryButton} href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.heroBenefits}>
          {hero.benefits.map((benefit) => (
            <span className={styles.benefitChip} key={benefit.label}>
              <TemplateIcon name={benefit.icon} size={16} strokeWidth={1.8} />
              <span>{benefit.label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
