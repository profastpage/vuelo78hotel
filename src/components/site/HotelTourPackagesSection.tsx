"use client";

import Image from "next/image";
import { useState } from "react";
import { renderBalancedSectionTitle } from "./headline-balance";
import { HOTEL_WHATSAPP_PHONE_DIGITS, type HotelLocale } from "@/lib/hotel-experience";
import { HotelTourPackageDetailModal } from "./HotelTourPackageDetailModal";

type HotelTourPackagesSectionProps = {
  locale: HotelLocale;
  hotelName: string;
};

export type HotelTourPackage = {
  badge: string;
  duration: string;
  imagePosition?: { x?: number; y?: number };
  location: string;
  coverImageSrc?: string;
  includes: string[];
  mediaFiles: string[];
  mediaFolder: string;
  notes?: string[];
  optional?: string[];
  price: string;
  recommendations: string[];
  schedule: string[];
  slug: string;
  summary: string;
  title: string;
};

export function HotelTourPackagesSection({ locale, hotelName }: HotelTourPackagesSectionProps) {
  const copy =
    locale === "en"
      ? {
          badgeLabels: ["Groups", "New", "Featured", "Top sale", "Recommended", "Hot"],
          detailsLabel: "🔎 VIEW MORE",
          heading: "Tour Packages",
          location: "Peru, Tarapoto",
          sectionSummary: "Visual plans with direct WhatsApp booking, clear pricing and fast access to details.",
          starsLabel: "stars",
          whatsappLabel: "Open WhatsApp",
        }
      : {
          badgeLabels: ["Grupos", "Nuevo", "Destacado", "Top venta", "Recomendado", "Popular"],
          detailsLabel: "🔎 VER M\u00c1S",
          heading: "Paquetes Tur\u00edsticos",
          location: "Peru, Tarapoto",
          sectionSummary: "Planes visuales con reserva directa por WhatsApp, precio claro y acceso rapido a mas informacion.",
          starsLabel: "estrellas",
          whatsappLabel: "Abrir WhatsApp",
        };

  const packages = getTourPackages(copy.location, copy.badgeLabels);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [brokenCoverImages, setBrokenCoverImages] = useState<Record<string, boolean>>({});
  const activePackage = packages.find((item) => item.slug === activeSlug) || null;

  return (
    <section className="scene hotel-tour-packages-section" id="paquetes-turisticos">
      <div className="hotel-reference-section-heading hotel-tour-packages-heading">
        <span className="scene-chip">{copy.heading}</span>
        <h2>{renderBalancedSectionTitle(copy.heading)}</h2>
        <p>{copy.sectionSummary}</p>
      </div>

      <div className="hotel-tour-packages-grid">
        {packages.map((item, index) => {
          const whatsappHref = buildTourPackageWhatsappHref({
            locale,
            hotelName,
            packageName: item.title,
            price: item.price,
            summary: item.summary,
            duration: item.duration,
          });
          const coverImageSrc = brokenCoverImages[item.slug]
            ? buildTourPackageImagePath(item.mediaFolder, item.mediaFiles[0] || "")
            : item.coverImageSrc || getTourPackageCoverImageSrc(item.slug);

          return (
            <article className="hotel-tour-package-card" key={`${item.title}-${index + 1}`}>
              <div className="hotel-tour-package-media">
                <Image
                  alt={item.title}
                  className="hotel-tour-package-image"
                  fill
                  priority={index < 2}
                  sizes="(max-width: 680px) 92vw, (max-width: 1260px) 31vw, 24vw"
                  onError={() =>
                    setBrokenCoverImages((current) =>
                      current[item.slug]
                        ? current
                        : {
                            ...current,
                            [item.slug]: true,
                          },
                    )
                  }
                  src={coverImageSrc}
                  style={getPackageImageStyle(item.imagePosition)}
                />
                <div className="hotel-tour-package-media-overlay" />
                <span className="hotel-tour-package-badge">{item.badge}</span>

                <div className="hotel-tour-package-overlay">
                  <div aria-label={`5 ${copy.starsLabel}`} className="hotel-tour-package-stars">
                    <span>{"\u2605"}</span>
                    <span>{"\u2605"}</span>
                    <span>{"\u2605"}</span>
                    <span>{"\u2605"}</span>
                    <span>{"\u2605"}</span>
                  </div>

                  <h3>
                    {item.title}
                    <small>{item.duration}</small>
                  </h3>

                  <p className="hotel-tour-package-location">
                    <MapPinGlyph />
                    <span>{item.location}</span>
                  </p>

                  <div className="hotel-tour-package-footer">
                    <div className="hotel-tour-package-actions">
                      <a aria-label={copy.whatsappLabel} className="hotel-tour-package-whatsapp" href={whatsappHref} rel="noreferrer" target="_blank">
                        <WhatsAppGlyph />
                      </a>
                      <button className="hotel-tour-package-more" onClick={() => setActiveSlug(item.slug)} type="button">
                        {copy.detailsLabel}
                      </button>
                    </div>

                    <strong className="hotel-tour-package-price">{item.price}</strong>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <HotelTourPackageDetailModal
        activePackage={activePackage}
        hotelName={hotelName}
        locale={locale}
        onClose={() => setActiveSlug(null)}
      />

      <style jsx global>{`
        .hotel-tour-packages-section {
          width: min(100%, 1320px);
          padding-inline: clamp(16px, 3vw, 24px);
          padding-block: clamp(26px, 4.5vw, 44px);
          margin-inline: auto;
        }

        .hotel-tour-packages-heading {
          margin-bottom: clamp(18px, 3vw, 28px);
        }

        .hotel-tour-packages-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(14px, 1.8vw, 20px);
          width: 100%;
          max-width: 100%;
        }

        .hotel-tour-package-card {
          min-width: 0;
        }

        .hotel-tour-package-media {
          position: relative;
          min-height: clamp(300px, 28vw, 350px);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 24px 40px rgba(4, 8, 15, 0.2);
        }

        .hotel-tour-package-image {
          object-fit: cover;
        }

        .hotel-tour-package-media-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(4, 8, 15, 0.1) 10%, rgba(4, 8, 15, 0.36) 46%, rgba(4, 8, 15, 0.92) 100%),
            linear-gradient(90deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.03));
        }

        .hotel-tour-package-badge {
          position: absolute;
          left: 0;
          top: 18px;
          min-width: 120px;
          padding: 6px 14px;
          border-radius: 0 9px 9px 0;
          background: linear-gradient(180deg, #ffe42d 0%, #f9d90f 100%);
          color: #0f172a;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.01em;
          text-align: center;
          text-transform: capitalize;
        }

        .hotel-tour-package-overlay {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 8px;
          width: 100%;
          padding: 18px 16px 16px;
        }

        .hotel-tour-package-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #ffd447;
          font-size: 0.8rem;
          line-height: 1;
        }

        .hotel-tour-package-overlay h3 {
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
          color: #f8fafc;
          font-size: clamp(1.08rem, 1.5vw, 1.7rem);
          font-weight: 800;
          letter-spacing: 0.01em;
          text-transform: uppercase;
        }

        .hotel-tour-package-overlay h3 small {
          color: #f8fafc;
          font-size: 0.94em;
          font-weight: 800;
          letter-spacing: 0.01em;
        }

        .hotel-tour-package-location {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.96);
          font-size: 0.92rem;
          font-weight: 600;
        }

        .hotel-tour-package-location svg {
          flex: none;
          width: 16px;
          height: 16px;
          color: #ffd22f;
        }

        .hotel-tour-package-footer {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .hotel-tour-package-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .hotel-tour-package-whatsapp {
          flex: none;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 32% 26%, #43e068 0%, #12a732 100%);
          color: #f8fafc;
          box-shadow: 0 8px 20px rgba(18, 167, 50, 0.42);
        }

        .hotel-tour-package-whatsapp svg {
          width: 17px;
          height: 17px;
        }

        .hotel-tour-package-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 0 18px;
          border-radius: 10px;
          background: linear-gradient(180deg, #ffea38 0%, #f7d80f 100%);
          color: #0f172a;
          font-size: 0.98rem;
          font-weight: 800;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          text-decoration: none;
        }

        .hotel-tour-package-price {
          flex: none;
          color: #f8fafc;
          font-size: clamp(1.12rem, 1.5vw, 1.55rem);
          font-weight: 900;
          letter-spacing: 0.01em;
          text-align: right;
          text-shadow: 0 6px 14px rgba(0, 0, 0, 0.34);
        }

        @media (min-width: 1024px) {
          .hotel-tour-package-overlay h3 {
            font-size: clamp(0.94rem, 1.25vw, 1.28rem);
            line-height: 1.06;
          }

          .hotel-tour-package-overlay h3 small {
            font-size: 0.84em;
          }

          .hotel-tour-package-price {
            font-size: clamp(0.98rem, 1.1vw, 1.25rem);
          }
        }

        @media (max-width: 1260px) {
          .hotel-tour-packages-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 940px) {
          .hotel-tour-packages-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .hotel-tour-packages-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .hotel-tour-package-media {
            min-height: clamp(300px, 82vw, 360px);
          }

          .hotel-tour-package-badge {
            top: 14px;
          }

          .hotel-tour-package-overlay {
            padding: 16px 14px 14px;
          }
        }
      `}</style>
    </section>
  );
}

function getTourPackages(location: string, badgeLabels: string[]): HotelTourPackage[] {
  return [
    {
      slug: "catarata-de-ahuashiyacu",
      title: "CATARATA DE AHUASHIYACU",
      duration: "01D",
      location,
      badge: badgeLabels[0],
      price: "S/ 50.00",
      mediaFolder: "1 CATARATA DE AHUASHIYACU",
      mediaFiles: ["1 catarata de ahuashiyacu.jpg", "2 catarata de ahuashiyacu.jpg", "3 catarata de ahuashiyacu.jpg", "4 catarata de ahuashiyacu.jpg"],
      imagePosition: { x: 52, y: 45 },
      schedule: ["Salida Turno 01", "01: 8:00 am", "02: 10:30 am", "Salida Turno 02", "02: 10:30 am", "02: 01:30 pm"],
      recommendations: ["Protección solar y repelente para mosquitos.", "Cuidar la naturaleza."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ENTRADA AL CASTILLO LAMAS.", "COMUNIDAD NATIVA WAYKU LAMAS."],
      summary: "Catarata de dia completo con salida coordinada y apoyo directo.",
    },
    {
      slug: "lamas-nativa",
      title: "LAMAS NATIVA",
      duration: "01D",
      location,
      badge: badgeLabels[1],
      price: "S/ 50.00",
      mediaFolder: "2 LAMAS NATIVA",
      mediaFiles: ["1 lamas nativa.jpg", "2 lamas nativa.jpg", "3 lamas nativa.jpg", "4 lamas nativa.jpg"],
      imagePosition: { x: 56, y: 48 },
      schedule: ["Salida Turno 01", "03:00 PM", "Salida Turno 02"],
      recommendations: ["Protección solar y repelente para mosquitos.", "Cuidar la naturaleza."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ENTRADA AL CASTILLO LAMAS.", "COMUNIDAD NATIVA WAYKU LAMAS."],
      summary: "Experiencia en Lamas con apoyo guiado y transporte incluido.",
    },
    {
      slug: "laguna-azul",
      title: "LAGUNA AZUL",
      duration: "01D",
      location,
      badge: badgeLabels[2],
      price: "S/ 100.00",
      mediaFolder: "3 LAGUNA AZUL",
      mediaFiles: ["1 laguna azul.jpg", "2 laguna azul.jpg", "3 laguna azul.jpg", "4 laguna azul.jpg"],
      imagePosition: { x: 48, y: 46 },
      schedule: ["Salida Turno 01", "8:00 AM", "Salida Turno 02"],
      recommendations: ["Protección solar y repelente para mosquitos.", "Cuidar la naturaleza."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "DEGUSTACION DE TRAGOS.", "ALMUERZO CON PLATOS A LA CARTA REGINONAL.", "PASEO EN BOTE Y CABALLO"],
      optional: ["BAÑOS EN BARRO NEGRO (50 SOLES)", "MIRADOR PUNTA DEL GALLINAZO (5 SOLES)"],
      summary: "Ruta acuática con degustación, almuerzo y vistas abiertas.",
    },
    {
      slug: "cascadas-de-pishurayacu",
      title: "CASCADAS DE PISHURAYACU",
      duration: "01D",
      location,
      badge: badgeLabels[3],
      price: "S/ 100.00",
      mediaFolder: "4 CASCADAS DE PISHURAYACU",
      mediaFiles: ["1 CASCADAS DE PISHURAYACU.jpg", "2 CASCADAS DE PISHURAYACU.jpg", "3 CASCADAS DE PISHURAYACU.jpg", "4 CASCADAS DE PISHURAYACU.jpg", "5 CASCADAS DE PISHURAYACU.jpg"],
      imagePosition: { x: 50, y: 45 },
      schedule: ["Salida Turno 01", "8:30 am", "Salida Turno 02"],
      recommendations: ["Protección solar y repelente para mosquitos.", "Cuidar la naturaleza."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ENTRADA A LAS CASCADAS.", "ALMUERZO.", "TREKKING DE 40 MINUTOS POR LA SELVA OBSERVANDO TODO EL PAISAJE"],
      summary: "Cascadas con caminata corta y almuerzo incluido.",
    },
    {
      slug: "altomayo",
      title: "ALTOMAYO",
      duration: "01D",
      location,
      badge: badgeLabels[4],
      price: "S/ 100.00",
      mediaFolder: "5 ALTOMAYO",
      mediaFiles: ["1 altomayo.jpg", "2 altomayo.jpg", "3 altomayo.jpg", "4 ALTOMAYO.jpg"],
      imagePosition: { x: 50, y: 46 },
      schedule: ["Salida Turno 01", "8:00 am", "Salida Turno 02"],
      recommendations: ["Protección solar y repelente para mosquitos.", "Cuidar la naturaleza.", "Llevar ropa de baño."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "CHACRA VIEJA.", "ENTRADA AL ORQUIDEARIO", "ENTRADA A LA NACIENTE DEL TIO YACU.", "ENTRADA A LOS BAÑOS TERMALES.", "DEGUSTACION DE TRAGOS REGIONALES.", "DEGUSTACION DE CAFE DEL ALTOMAYO.", "ALMUERZO A LA CARTA"],
      summary: "Ruta de naturaleza, café, termales y degustación regional.",
    },
    {
      slug: "cascada-salto-de-la-bruja",
      title: "CASCADA SALTO DE LA BRUJA",
      duration: "01D",
      location,
      badge: badgeLabels[5],
      price: "S/ 100.00",
      mediaFolder: "6 CASCADA SALTO DE LA BRUJA",
      mediaFiles: ["1 CASCADA SALTO DE LA BRUJA.jpg", "2 CASCADA SALTO DE LA BRUJA.jpg", "3 CASCADA SALTO DE LA BRUJA.jpg", "4 CASCADA SALTO DE LA BRUJA.jpg"],
      imagePosition: { x: 50, y: 50 },
      schedule: ["Salida Turno 01", "8:30 am", "Salida Turno 02"],
      recommendations: ["Cuidar la naturaleza.", "Protección solar y repelente para mosquitos.", "Llevar ropa de baño."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ENTRADA A LAS CASCADAS", "ALMUERZO.", "TREKKING DE 40 MINUTOS POR LA SELVA OBSERVANDO TODO EL PAISAJE."],
      summary: "Una ruta natural con caminata, almuerzo y apoyo guiado.",
    },
    {
      slug: "santa-elena-y-las-cuevas",
      title: "SANTA ELENA Y LAS CUEVAS",
      duration: "01D",
      location,
      badge: badgeLabels[0],
      price: "S/ 300.00",
      mediaFolder: "7 SANTA ELENA Y LAS CUEVAS",
      mediaFiles: ["1 SANTA ELENA Y LAS CUEVAS.jpg", "2 SANTA ELENA Y LAS CUEVAS.jpg", "3 SANTA ELENA Y LAS CUEVAS.jpg", "4 SANTA ELENA Y LAS CUEVAS.jpg"],
      imagePosition: { x: 50, y: 50 },
      schedule: ["Salida Turno 01", "3:00 pm", "5:00 pm", "Salida Turno 02"],
      recommendations: ["Cuidar la naturaleza.", "Protección solar y repelente para mosquitos.", "Llevar ropa de cambio."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "DESAYUNO REGIONAL.", "ENTRADA A LA RESERVA.", "PASEO EN BOTE.", "ENTRADA A LA CUEVA Y EQUIPOS DE SEGURIDAD.", "ALMUERZO REGIONAL."],
      summary: "Tour con desayuno, cueva, bote y almuerzo regional.",
    },
    {
      slug: "canotaje-en-el-rio-mayo",
      title: "CANOTAJE EN EL RIO MAYO",
      duration: "01D",
      location,
      badge: badgeLabels[1],
      price: "S/ 90.00",
      mediaFolder: "8 CANOTAJE EN EL RIO MAYO",
      mediaFiles: ["1 CANOTAJE EN EL RIO MAYO.jpg", "2 CANOTAJE EN EL RIO MAYO.jpg", "3 CANOTAJE EN EL RIO MAYO.jpg", "4 CANOTAJE EN EL RIO MAYO.jpg"],
      imagePosition: { x: 50, y: 50 },
      schedule: ["Salida Turno 01", "10:00 am", "1:00 pm", "Salida Turno 02", "03:00 pm", "06:00 pm"],
      recommendations: ["Cuidar la naturaleza.", "Protección solar y repelente para mosquitos.", "Llevar ropa de cambio."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ACTIVIDAD DE FLOTIN EN EL AGUA.", "OPCIONAR:", "ACTIVIDAD DE SALTAR DEL PUENTE"],
      summary: "Experiencia acuática con turnos dobles y opción extra.",
    },
    {
      slug: "tarapoto-city-tour",
      title: "TARAPOTO CITY TOUR",
      duration: "01D",
      location,
      badge: badgeLabels[2],
      price: "S/ 80.00",
      mediaFolder: "9 TARAPOTO CITY TOUR",
      mediaFiles: ["1 TARAPOTO CITY TOUR.jpg", "2 TARAPOTO CITY TOUR.jpg", "3 TARAPOTO CITY TOUR.jpg", "4 TARAPOTO CITY TOUR.jpg", "5 TARAPOTO CITY TOUR.jpg"],
      imagePosition: { x: 50, y: 48 },
      schedule: ["Salida Turno 01", "10:00 am", "1:00 pm", "Salida Turno 02", "03:00 pm", "06:00 pm"],
      recommendations: ["Cuidar la naturaleza.", "Protección solar y repelente para mosquitos."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "INGRESO A LA FABRICA DE CHOCOLATES.", "INGRESO A LA TABACALERA DEL ORIENTE.", "OPCIONAR:"],
      summary: "Tour urbano con horarios dobles y recorrido por fábricas.",
    },
    {
      slug: "catarata-de-huacamallo",
      title: "CATARATA DE HUACAMAILLO",
      duration: "01D",
      location,
      badge: badgeLabels[3],
      price: "S/ 130.00",
      mediaFolder: "10 CATARATA DE HUACAMAILLO",
      mediaFiles: ["1 CATARATA DE HUACAMAILLO.jpg", "2 CATARATA DE HUACAMAILLO.jpg", "3 CATARATA DE HUACAMAILLO.jpg", "4 CATARATA DE HUACAMAILLO.jpg"],
      imagePosition: { x: 50, y: 48 },
      schedule: ["Salida Turno 01", "8:30 am", "4:00 pm", "Salida Turno 02"],
      recommendations: ["Cuidar la naturaleza.", "Protección solar y repelente para mosquitos.", "Llevar ropa de cambio."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ENTRADA A LAS CATARATAS.", "ALMUERZO REGIONAL"],
      notes: ["Caminata de aproximadamente 2 horas, cruzaremos ríos bajos, en medio de la hermosa selva."],
      summary: "Caminata de selva con cataratas y almuerzo regional.",
    },
    {
      slug: "cascadas-pucayaquillo",
      title: "CASCADAS PUCAYAQUILLO",
      duration: "01D",
      location,
      badge: badgeLabels[4],
      price: "S/ 80.00",
      mediaFolder: "11 CASCADAS PUCAYAQUILLO",
      mediaFiles: ["1 CASCADA PUCAYAQUILLO.jpg", "2 CASCADA PUCAYAQUILLO.jpg", "3 CASCADA PUCAYAQUILLO.jpg", "4 CASCADA PUCAYAQUILLO.jpg"],
      imagePosition: { x: 50, y: 56 },
      schedule: ["Salida Turno 01", "8:30 am", "4:00 pm", "Salida Turno 02"],
      recommendations: ["Cuidar la naturaleza.", "Protección solar y repelente para mosquitos.", "Llevar ropa de cambio."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ENTRADAS A LAS CATARATAS.", "ALMUERZO REGIONAL.", "OPCIONAR:"],
      summary: "Ruta natural con cataratas y almuerzo regional.",
    },
    {
      slug: "mirador-taytamaki",
      title: "MIRADOR TAYTAMAKI",
      duration: "01D",
      location,
      badge: badgeLabels[5],
      price: "S/ 80.00",
      mediaFolder: "12 MIRADOR TAYTAMAKI",
      mediaFiles: ["1 MIRADOR TAYTAMAKI.jpg", "2 MIRADOR TAYTAMAKI.jpg", "3 MIRADOR TAYTAMAKI.jpg", "4 MIRADOR TAYTAMAKI.jpg"],
      imagePosition: { x: 50, y: 48 },
      schedule: ["Salida Turno 01", "9:00 am", "12:00 pm", "Salida Turno 02", "3:00 pm", "5:00 pm"],
      recommendations: ["Cuidar la naturaleza.", "Protección solar y repelente para mosquitos.", "Llevar ropa de cambio."],
      includes: ["GUIA TURISTICO OFICIAL.", "TRANSPORTE IDA Y VUELTA EN VEHICULO.", "ENTRADAS AL ATRACTIVO.", "OPCIONAR:"],
      summary: "Mirador con horarios dobles, transporte y acceso al atractivo.",
    },
  ];
}

function buildTourPackageImagePath(folder: string, file: string) {
  return `/${["assets", "gallery", "Paquete turístico", folder, file].map((part) => encodeURIComponent(part)).join("/")}`;
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
          "Hello 👋",
          "I want information and booking details for this tour package:",
          `📌 ${packageName} • ${duration}`,
          `💰 Reference price: ${price}`,
          `🧭 ${summary}`,
          `🏨 Hotel: ${hotelName}`,
          "Please send availability and payment details. 🙏",
        ].join("\n")
      : [
          "Hola 👋",
          "Quiero información y reservar este paquete turístico:",
          `📌 ${packageName} • ${duration}`,
          `💰 Precio referencial: ${price}`,
          `🧭 ${summary}`,
          `🏨 Hotel: ${hotelName}`,
          "Por favor, compárteme disponibilidad y forma de pago. 🙏",
        ].join("\n");

  return `https://api.whatsapp.com/send/?phone=${HOTEL_WHATSAPP_PHONE_DIGITS}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}

function getPackageImageStyle(position?: { x?: number; y?: number }) {
  const x = typeof position?.x === "number" ? position.x : 50;
  const y = typeof position?.y === "number" ? position.y : 50;

  return {
    objectPosition: `${x}% ${y}%`,
  };
}

function getTourPackageCoverImageSrc(slug: string) {
  const coverImages: Record<string, string> = {
    "catarata-de-ahuashiyacu": "https://img.freepik.com/free-photo/godafoss-waterfall-sunset-winter-iceland-guy-red-jacket-looks-godafoss-waterfall_335224-673.jpg",
    "lamas-nativa": "https://images.unsplash.com/photo-1531169628939-e84f860fa5d6?auto=format&fit=crop&w=1600&q=80",
    "laguna-azul": "https://img.freepik.com/free-photo/pileh-blue-lagoon-phi-phi-island-thailand_231208-1487.jpg",
    "cascadas-de-pishurayacu": "https://cdn.pixabay.com/photo/2019/12/29/04/06/waterfall-4726196_1280.jpg",
    altomayo: "https://img.freepik.com/free-photo/beautiful-mountains-ratchaprapha-dam-khao-sok-national-park-surat-thani-province-thailand_335224-851.jpg",
    "cascada-salto-de-la-bruja": "https://images.unsplash.com/photo-1565804539920-d31056364f3f?auto=format&fit=crop&w=1600&q=80",
    "santa-elena-y-las-cuevas": "https://cdn.pixabay.com/photo/2017/08/14/21/03/cliffs-of-moher-2641965_1280.jpg",
    "canotaje-en-el-rio-mayo": "https://images.unsplash.com/photo-1510798409623-003ec307428c?auto=format&fit=crop&w=1600&q=80",
    "tarapoto-city-tour": "https://images.unsplash.com/photo-1544390099-31827259a011?auto=format&fit=crop&w=1600&q=80",
    "catarata-de-huacamallo": "https://img.freepik.com/free-photo/godafoss-waterfall-sunset-winter-iceland-guy-red-jacket-looks-godafoss-waterfall_335224-673.jpg",
    "cascadas-pucayaquillo": "https://cdn.pixabay.com/photo/2021/07/11/11/30/waterfall-6403521_960_720.jpg",
    "mirador-taytamaki": "https://images.unsplash.com/photo-1490604001847-b712b0c2f967?auto=format&fit=crop&w=1600&q=80",
  };

  return coverImages[slug] || coverImages["mirador-taytamaki"];
}

function MapPinGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 2.25a7.25 7.25 0 0 0-7.25 7.25c0 5.2 5.88 11.62 6.13 11.9a1.5 1.5 0 0 0 2.24 0c.25-.28 6.13-6.7 6.13-11.9A7.25 7.25 0 0 0 12 2.25Zm0 9.6a2.35 2.35 0 1 1 0-4.7 2.35 2.35 0 0 1 0 4.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M20.52 3.5A11.7 11.7 0 0 0 2.84 18.16L1.5 22.5l4.48-1.3a11.7 11.7 0 0 0 5.95 1.62h.01A11.7 11.7 0 0 0 20.52 3.5Zm-8.58 17.3h-.01a9.71 9.71 0 0 1-4.95-1.35l-.35-.21-2.66.77.8-2.6-.23-.36a9.74 9.74 0 1 1 7.4 3.75Zm5.34-7.27c-.29-.15-1.74-.86-2.01-.95-.27-.1-.47-.15-.67.14-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.08-.29-.15-1.24-.46-2.35-1.47-.87-.78-1.46-1.75-1.63-2.05-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.51.07-.78.37-.27.29-1.03 1.01-1.03 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.07 3.16 5.02 4.44.7.3 1.24.48 1.67.62.7.22 1.33.19 1.83.12.56-.08 1.74-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34Z"
        fill="currentColor"
      />
    </svg>
  );
}
