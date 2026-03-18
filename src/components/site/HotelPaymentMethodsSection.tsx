import { renderBalancedSectionTitle } from "./headline-balance";
import { HotelBrandLogo } from "./HotelBrandLogo";
import type { HotelLocale } from "@/lib/hotel-experience";

type HotelPaymentMethodsSectionProps = {
  locale: HotelLocale;
};

export function HotelPaymentMethodsSection({ locale }: HotelPaymentMethodsSectionProps) {
  const copy =
    locale === "en"
      ? {
          heading: "Payment Methods",
          accountLabel: "BCP checking account in soles",
          cciLabel: "CCI",
          legalNameLabel: "Legal name",
          rucLabel: "RUC",
        }
      : {
          heading: "M\u00e9todos de Pago",
          accountLabel: "CTA CORRIENTE BCP SOLES",
          cciLabel: "CCI",
          legalNameLabel: "RAZ\u00d3N SOCIAL",
          rucLabel: "RUC",
        };

  return (
    <section className="scene hotel-payment-methods-section" id="metodos-pago">
      <div className="hotel-reference-section-heading hotel-payment-methods-heading">
        <span className="scene-chip">{copy.heading}</span>
        <h2>{renderBalancedSectionTitle(copy.heading)}</h2>
      </div>

      <article className="hotel-payment-method-card">
        <header className="hotel-payment-method-brand">
          <HotelBrandLogo className="hotel-payment-brand-logo" />
        </header>

        <div className="hotel-payment-method-body">
          <p>
            <strong>{copy.rucLabel}:</strong> 20601633966
          </p>
          <p>
            <strong>{copy.legalNameLabel}:</strong> Rio hotels Tarapoto S.A.C
          </p>
          <p className="hotel-payment-bank-tag">BCP</p>
          <p>
            <strong>{copy.accountLabel}:</strong> 550 - 2377781 - 0 - 43
          </p>
          <p>
            <strong>{copy.cciLabel}:</strong> 002 - 550 - 002377781043 - 25
          </p>
        </div>
      </article>

      <style jsx global>{`
        .hotel-payment-methods-section {
          width: min(100%, 1320px);
          margin-inline: auto;
          padding-inline: clamp(16px, 3vw, 24px);
          padding-block: clamp(16px, 3vw, 28px) clamp(28px, 4vw, 40px);
        }

        .hotel-payment-methods-heading {
          margin-bottom: clamp(16px, 2.2vw, 22px);
        }

        .hotel-payment-method-card {
          margin: 0;
          padding: clamp(18px, 2.4vw, 24px);
          border-radius: 24px;
          background: #ececec;
          box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
        }

        .hotel-payment-method-brand {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .hotel-payment-brand-logo {
          width: clamp(148px, 20vw, 190px);
          max-width: 100%;
        }

        .hotel-payment-method-body {
          display: grid;
          gap: 10px;
          text-align: center;
          color: #111827;
        }

        .hotel-payment-method-body p {
          margin: 0;
          font-size: clamp(1rem, 1.4vw, 1.15rem);
          line-height: 1.45;
        }

        .hotel-payment-method-body strong {
          font-weight: 900;
          letter-spacing: 0.01em;
        }

        .hotel-payment-bank-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          margin: 4px auto;
          padding: 4px 12px;
          border-radius: 999px;
          background: #1557c0;
          color: #fff;
          font-size: 0.96rem;
          font-weight: 900;
          letter-spacing: 0.04em;
        }
      `}</style>
    </section>
  );
}
