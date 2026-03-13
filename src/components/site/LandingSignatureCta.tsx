import type { ClientProfile, SiteContent } from "@/types/site";
import { renderBalancedSectionTitle } from "./headline-balance";

type LandingSignatureCtaProps = {
  profile: ClientProfile;
  content: SiteContent;
  dataAnimateDelay?: number;
};

export function LandingSignatureCta({ profile, content, dataAnimateDelay }: LandingSignatureCtaProps) {
  return (
    <section
      className="landing-signature-shell"
      data-editor-section="contact"
      id="servicios"
      data-animate
      data-animate-delay={String(dataAnimateDelay ?? 300)}
    >
      <div className="landing-signature-banner">
        <span className="scene-chip">Cierre visual</span>
        <h2 className="section-title">{renderBalancedSectionTitle(getLandingCtaTitle(profile, content))}</h2>
        <p>{content.contact.description}</p>
        <div className="scene-actions">
          <a className="primary-button" href={content.brand.primaryCtaHref}>
            {content.brand.primaryCtaLabel}
          </a>
          <a className="secondary-button" href={content.brand.secondaryCtaHref}>
            {content.brand.secondaryCtaLabel}
          </a>
        </div>
      </div>

      <div className="landing-signature-meta">
        <article className="landing-signature-activity">
          <span className="landing-live-dot" aria-hidden="true" />
          <div>
            <strong>{profile.businessName}</strong>
            <p>{profile.brandConfig.offerSummary}</p>
          </div>
          <span>{profile.projectType}</span>
        </article>

        <nav aria-label="Secciones del sitio" className="landing-signature-nav">
          {content.pages.slice(0, 6).map((page) => (
            <span key={page}>{page}</span>
          ))}
        </nav>
      </div>
    </section>
  );
}

function getLandingCtaTitle(profile: ClientProfile, content: SiteContent) {
  const primary = content.brand.primaryCtaLabel.toLowerCase();

  switch (profile.industry.toLowerCase()) {
    case "inmobiliaria":
      return "Patrimonio, confianza y visitas mejor filtradas.";
    case "restaurante":
      return "Convierte hambre en reservas memorables.";
    case "clinica":
      return "Confianza visible y agenda mas clara.";
    case "tecnologia":
      return "Producto claro y demo como siguiente paso.";
    default:
      return `Una landing mas solida para llevar a ${primary}.`;
  }
}
