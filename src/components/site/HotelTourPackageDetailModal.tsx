"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { HotelRoomGalleryCarousel } from "./HotelRoomGalleryCarousel";
import { HOTEL_WHATSAPP_PHONE_DIGITS, type HotelLocale } from "@/lib/hotel-experience";
import type { HotelTourPackage } from "./HotelTourPackagesSection";

type HotelTourPackageDetailModalProps = {
  activePackage: HotelTourPackage | null;
  hotelName: string;
  locale: HotelLocale;
  onClose: () => void;
};

type TourPackageTab = "itinerary" | "includes" | "recommendations" | "details";

export function HotelTourPackageDetailModal({ activePackage, hotelName, locale, onClose }: HotelTourPackageDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TourPackageTab>("itinerary");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activePackage) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePackage, onClose]);

  useEffect(() => {
    if (activePackage) {
      setActiveTab("itinerary");
    }
  }, [activePackage]);

  if (!mounted || !activePackage) {
    return null;
  }

  const whatsappHref = buildTourPackageWhatsappHref({
    hotelName,
    locale,
    packageName: activePackage.title,
    price: activePackage.price,
    summary: activePackage.summary,
    duration: activePackage.duration,
  });

  const slides = activePackage.mediaFiles.map((file, index) => {
    const src = buildTourPackageImagePath(activePackage.mediaFolder, file);

    return {
      alt: `${activePackage.title} ${index + 1}`,
      id: `${activePackage.slug}-${index + 1}`,
      jpgSrc: src,
      role: "general" as const,
      webpSrc: src,
    };
  });

  return createPortal(
    <div
      className="hotel-tour-detail-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-labelledby="tour-package-title"
        aria-modal="true"
        className="hotel-tour-detail-modal"
        onPointerDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="hotel-tour-detail-titlebar">
          <span>{locale === "en" ? "Tour package" : "Paquete tur\u00edstico"}</span>
          <h3 id="tour-package-title">{activePackage.title}</h3>
        </div>

        <div className="hotel-tour-detail-shell">
          <div className="hotel-tour-detail-media-column">
            <div className="hotel-tour-detail-carousel-shell">
              <HotelRoomGalleryCarousel locale={locale} roomTitle={activePackage.title} slides={slides} />
            </div>

            <div className="hotel-tour-detail-thumb-note">
              <span>{locale === "en" ? "Gallery" : "Galería"}</span>
              <strong>
                {activePackage.mediaFiles.length} {locale === "en" ? "photos" : "fotos"}
              </strong>
            </div>
          </div>

          <aside className="hotel-tour-detail-panel">
            <div className="hotel-tour-detail-panel-head">
              <p>{activePackage.location}</p>
              <strong>{activePackage.price}</strong>
            </div>

            <div className="hotel-tour-detail-actions">
              <a className="hotel-tour-detail-primary" href={whatsappHref} rel="noreferrer" target="_blank">
                {locale === "en" ? "\uD83E\uDDFE Book now" : "\uD83E\uDDFE Reservar ahora"}
              </a>
              <a className="hotel-tour-detail-secondary" href={whatsappHref} rel="noreferrer" target="_blank">
                {locale === "en" ? "\uD83D\uDCAC Open WhatsApp" : "\uD83D\uDCAC Abrir WhatsApp"}
              </a>
              <button className="hotel-tour-detail-close" onClick={onClose} type="button">
                {locale === "en" ? "\u2715 Close details" : "\u2715 Cerrar detalle"}
              </button>
            </div>

            <div aria-label={activePackage.title} className="hotel-tour-detail-tabs" role="tablist">
              {(["itinerary", "includes", "recommendations", "details"] as TourPackageTab[]).map((tab) => (
                <button
                  aria-selected={tab === activeTab}
                  className={tab === activeTab ? "is-active" : undefined}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  type="button"
                >
                  {getTabLabel(tab, locale)}
                </button>
              ))}
            </div>

            <div className="hotel-tour-detail-content">
              {activeTab === "itinerary" ? <PackageTextBlock title={getTabLabel("itinerary", locale)} items={activePackage.schedule} /> : null}
              {activeTab === "includes" ? <PackageTextBlock title={getTabLabel("includes", locale)} items={activePackage.includes} /> : null}
              {activeTab === "recommendations" ? (
                <div className="hotel-tour-detail-block">
                  <PackageTextBlock title={getTabLabel("recommendations", locale)} items={activePackage.recommendations} />
                  {activePackage.optional?.length ? <PackageTextBlock title={locale === "en" ? "Optional" : "Opcional"} items={activePackage.optional} /> : null}
                </div>
              ) : null}
              {activeTab === "details" ? (
                <div className="hotel-tour-detail-details">
                  <p>{activePackage.summary}</p>
                  {activePackage.notes?.length ? <PackageTextBlock title={locale === "en" ? "Note" : "Nota"} items={activePackage.notes} /> : null}
                  <div className="hotel-tour-detail-price-card">
                    <span>{locale === "en" ? "Reference rate" : "Precio por persona"}</span>
                    <strong>{activePackage.price}</strong>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        <button className="hotel-tour-detail-floating-close" onClick={onClose} type="button">
          {locale === "en" ? "Close" : "Cerrar"}
        </button>
      </div>

      <style jsx global>{`
        .hotel-tour-detail-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          padding: clamp(16px, 3vw, 32px);
          background:
            radial-gradient(circle at top, rgba(33, 68, 122, 0.16), transparent 35%),
            linear-gradient(180deg, rgba(6, 8, 14, 0.84), rgba(6, 8, 14, 0.74));
          isolation: isolate;
          will-change: opacity;
        }

        .hotel-tour-detail-modal {
          position: relative;
          width: min(100%, 1180px);
          max-height: min(92vh, 980px);
          overflow: auto;
          border-radius: 28px;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          transform: translateZ(0);
        }

        .hotel-tour-detail-titlebar {
          display: grid;
          gap: 4px;
          place-items: center;
          padding: 14px 18px 16px;
          background: linear-gradient(180deg, #d6e5f5 0%, #c6daef 100%);
          border-bottom: 1px solid rgba(12, 39, 74, 0.12);
          text-align: center;
        }

        .hotel-tour-detail-titlebar span {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #0b355f;
        }

        .hotel-tour-detail-titlebar h3 {
          margin: 0;
          font-size: clamp(1.05rem, 2.3vw, 1.7rem);
          font-weight: 900;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #0d1726;
        }

        .hotel-tour-detail-shell {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
          gap: clamp(16px, 2vw, 24px);
          padding: clamp(16px, 2vw, 22px);
        }

        .hotel-tour-detail-media-column {
          display: grid;
          gap: 14px;
          min-width: 0;
        }

        .hotel-tour-detail-carousel-shell {
          border-radius: 26px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
        }

        .hotel-tour-detail-thumb-note {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 18px;
          background: #fff;
          color: #0d1726;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
        }

        .hotel-tour-detail-thumb-note span {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #0b355f;
        }

        .hotel-tour-detail-thumb-note strong {
          font-size: 0.92rem;
          font-weight: 800;
        }

        .hotel-tour-detail-panel {
          display: grid;
          gap: 16px;
          align-content: start;
          padding: 18px;
          border-radius: 24px;
          background: #ececec;
        }

        .hotel-tour-detail-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .hotel-tour-detail-panel-head p {
          margin: 0;
          color: #0d1726;
          font-size: 0.98rem;
          font-weight: 700;
        }

        .hotel-tour-detail-panel-head strong {
          color: #ff008d;
          font-size: clamp(1.6rem, 2.5vw, 2.55rem);
          font-weight: 900;
          line-height: 1;
        }

        .hotel-tour-detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .hotel-tour-detail-primary,
        .hotel-tour-detail-secondary,
        .hotel-tour-detail-close,
        .hotel-tour-detail-floating-close {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 999px;
          padding: 0 16px;
          font-size: 0.95rem;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .hotel-tour-detail-primary {
          background: #ffd400;
          color: #101828;
        }

        .hotel-tour-detail-secondary {
          background: #25d366;
          color: #fff;
        }

        .hotel-tour-detail-close,
        .hotel-tour-detail-floating-close {
          background: rgba(13, 23, 38, 0.1);
          color: #0d1726;
        }

        .hotel-tour-detail-floating-close {
          position: sticky;
          bottom: 14px;
          left: 100%;
          margin: 0 18px 18px auto;
        }

        .hotel-tour-detail-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .hotel-tour-detail-tabs button {
          min-height: 38px;
          border: 0;
          border-radius: 999px;
          padding: 0 14px;
          background: #0f5d52;
          color: #fff;
          font-size: 0.86rem;
          font-weight: 800;
          cursor: pointer;
        }

        .hotel-tour-detail-tabs button.is-active {
          background: #ffd400;
          color: #142033;
        }

        .hotel-tour-detail-content {
          padding: 18px;
          border-radius: 20px;
          background: #f8fafc;
          box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
        }

        .hotel-tour-detail-block,
        .hotel-tour-detail-details {
          display: grid;
          gap: 14px;
        }

        .hotel-tour-detail-details > p {
          margin: 0;
          color: #0d1726;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .hotel-tour-detail-price-card {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255, 212, 0, 0.15), rgba(255, 212, 0, 0.26));
        }

        .hotel-tour-detail-price-card span {
          color: #0d1726;
          font-size: 0.84rem;
          font-weight: 700;
        }

        .hotel-tour-detail-price-card strong {
          color: #ff008d;
          font-size: 1.5rem;
          font-weight: 900;
          line-height: 1;
        }

        .hotel-tour-detail-list {
          display: grid;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .hotel-tour-detail-list li {
          position: relative;
          padding-left: 18px;
          color: #0d1726;
          font-size: 0.93rem;
          line-height: 1.45;
        }

        .hotel-tour-detail-list li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #0f5d52;
        }

        .hotel-tour-detail-section-title {
          margin: 0 0 2px;
          color: #0d1726;
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        @media (min-width: 1024px) {
          .hotel-tour-detail-section-title {
            font-size: 0.78rem;
          }

          .hotel-tour-detail-list li {
            font-size: 0.88rem;
          }
        }

        @media (max-width: 1080px) {
          .hotel-tour-detail-shell {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 720px) {
          .hotel-tour-detail-panel {
            padding: 14px;
          }

          .hotel-tour-detail-content {
            padding: 14px;
          }

          .hotel-tour-detail-price-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .hotel-tour-detail-thumb-note {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}

function PackageTextBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <section>
      <h4 className="hotel-tour-detail-section-title">{title}</h4>
      <ul className="hotel-tour-detail-list">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function getTabLabel(tab: TourPackageTab, locale: HotelLocale) {
  const labels: Record<TourPackageTab, { es: string; en: string }> = {
    itinerary: { es: "Itinerario", en: "Itinerary" },
    includes: { es: "Incluye", en: "Includes" },
    recommendations: { es: "Recomendaciones", en: "Recommendations" },
    details: { es: "Detalle", en: "Details" },
  };

  return locale === "en" ? labels[tab].en : labels[tab].es;
}

function buildTourPackageWhatsappHref({
  hotelName,
  locale,
  packageName,
  price,
  summary,
  duration,
}: {
  hotelName: string;
  locale: HotelLocale;
  packageName: string;
  price: string;
  summary: string;
  duration: string;
}) {
  const message =
    locale === "en"
      ? [
          "Hello",
          `I want information and booking details for this tour package: ${packageName}.`,
          `Duration: ${duration}`,
          `Reference price: ${price}`,
          `Summary: ${summary}`,
          `Hotel: ${hotelName}`,
          "Please send availability and payment details.",
        ].join("\n")
      : [
          "Hola",
          `Quiero informacion y reservar este paquete turistico: ${packageName}.`,
          `Duracion: ${duration}`,
          `Precio referencial: ${price}`,
          `Resumen: ${summary}`,
          `Hotel: ${hotelName}`,
          "Por favor, comparteme disponibilidad y forma de pago.",
        ].join("\n");

  return `https://api.whatsapp.com/send/?phone=${HOTEL_WHATSAPP_PHONE_DIGITS}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}
function buildTourPackageImagePath(folder: string, file: string) {
  return `/${["assets", "gallery", "Paquete tur\u00edstico", folder, file].map((part) => encodeURIComponent(part)).join("/")}`;
}
