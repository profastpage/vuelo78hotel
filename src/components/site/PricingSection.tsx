import type { PricingTier } from "@/types/site";
import { renderBalancedSectionTitle } from "./headline-balance";

type PricingSectionProps = {
  title?: string;
  description?: string;
  tiers: PricingTier[];
};

export function PricingSection({ title, description, tiers }: PricingSectionProps) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <section
      className="scene scene-pricing"
      id="planes"
      data-animate
      data-editor-section="pricing"
    >
      <div className="section-copy" data-animate data-animate-delay="0">
        <span className="scene-chip">Planes y precios</span>
        {title ? <h2 className="section-title">{renderBalancedSectionTitle(title)}</h2> : null}
        {description ? <p>{description}</p> : null}
      </div>

      <div className="pricing-grid">
        {tiers.map((tier, index) => (
          <article
            className={`pricing-card${tier.highlighted ? " pricing-card-featured" : ""}`}
            key={tier.name}
            data-animate
            data-animate-delay={String(index * 80)}
          >
            {tier.highlighted ? (
              <span className="pricing-badge">Más popular</span>
            ) : null}
            <div className="pricing-header">
              <strong className="pricing-name">{tier.name}</strong>
              <div className="pricing-amount">
                <span className="pricing-price">{tier.price}</span>
                {tier.period ? (
                  <span className="pricing-period">/{tier.period}</span>
                ) : null}
              </div>
              {tier.description ? (
                <p className="pricing-desc">{tier.description}</p>
              ) : null}
            </div>
            <ul className="pricing-features">
              {tier.features.map((feature) => (
                <li key={feature}>
                  <span className="pricing-check" aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              className={tier.highlighted ? "primary-button" : "secondary-button"}
              href={tier.ctaHref ?? "#contacto"}
            >
              {tier.ctaLabel ?? "Comenzar"}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
