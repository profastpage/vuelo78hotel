import { renderBalancedSectionTitle } from "./headline-balance";
import { HOTEL_WHATSAPP_PHONE_DIGITS, type HotelLocale } from "@/lib/hotel-experience";

type HotelTourPackagesSectionProps = {
  locale: HotelLocale;
  hotelName: string;
};

type TourPackage = {
  badge: string;
  duration: string;
  imagePosition?: { x?: number; y?: number };
  imageSrc: string;
  location: string;
  price: string;
  title: string;
};

export function HotelTourPackagesSection({ locale, hotelName }: HotelTourPackagesSectionProps) {
  const copy =
    locale === "en"
      ? {
          badgeLabels: ["Groups", "New", "Featured", "Top sale", "Recommended", "Hot"],
          detailsLabel: "VIEW MORE",
          heading: "Tour Packages",
          location: "Peru, Tarapoto",
          sectionSummary: "Visual plans with direct WhatsApp booking, clear pricing and fast access to details.",
          starsLabel: "stars",
          whatsappLabel: "Open WhatsApp",
        }
      : {
          badgeLabels: ["Grupos", "Nuevo", "Destacado", "Top venta", "Recomendado", "Popular"],
          detailsLabel: "VER M\u00c1S",
          heading: "Paquetes Tur\u00edsticos",
          location: "Peru, Tarapoto",
          sectionSummary: "Planes visuales con reserva directa por WhatsApp, precio claro y acceso rapido a mas informacion.",
          starsLabel: "estrellas",
          whatsappLabel: "Abrir WhatsApp",
        };

  const packages = getTourPackages(copy.location, copy.badgeLabels);

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
          });

          return (
            <article className="hotel-tour-package-card" key={`${item.title}-${index + 1}`}>
              <div className="hotel-tour-package-media" style={getPackageMediaStyle(item.imageSrc, item.imagePosition)}>
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
                      <a className="hotel-tour-package-more" href={`/ofertas?paquete=${encodeURIComponent(item.title)}`}>
                        {copy.detailsLabel}
                      </a>
                    </div>

                    <strong className="hotel-tour-package-price">{item.price}</strong>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

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
          display: flex;
          align-items: flex-end;
          justify-content: stretch;
          background-repeat: no-repeat;
          background-size: cover;
          box-shadow: 0 24px 40px rgba(4, 8, 15, 0.2);
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
          gap: 10px;
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
          font-size: 1.04rem;
          font-weight: 800;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          text-decoration: none;
        }

        .hotel-tour-package-price {
          flex: none;
          color: #f8fafc;
          font-size: clamp(1.35rem, 1.9vw, 2rem);
          font-weight: 900;
          letter-spacing: 0.01em;
          text-align: right;
          text-shadow: 0 6px 14px rgba(0, 0, 0, 0.34);
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

function getTourPackages(location: string, badgeLabels: string[]): TourPackage[] {
  return [
    {
      title: "CATARATA DE AHUASHIYACU",
      duration: "01D",
      location,
      badge: badgeLabels[0],
      price: "S/ 999.00",
      imageSrc: buildTourPackageImagePath("1 CATARATA DE AHUASHIYACU", "1 catarata de ahuashiyacu.jpg"),
      imagePosition: { x: 52, y: 45 },
    },
    {
      title: "LAMAS NATIVA",
      duration: "01D",
      location,
      badge: badgeLabels[1],
      price: "S/ 1,100.00",
      imageSrc: buildTourPackageImagePath("2 LAMAS NATIVA", "1 lamas nativa.jpg"),
      imagePosition: { x: 56, y: 48 },
    },
    {
      title: "LAGUNA AZUL",
      duration: "01D",
      location,
      badge: badgeLabels[2],
      price: "S/ 940.00",
      imageSrc: buildTourPackageImagePath("3 LAGUNA AZUL", "1 laguna azul.jpg"),
      imagePosition: { x: 48, y: 46 },
    },
    {
      title: "CASCADAS DE PISHURAYACU",
      duration: "01D",
      location,
      badge: badgeLabels[3],
      price: "S/ 660.00",
      imageSrc: buildTourPackageImagePath("4 CASCADAS DE PISHURAYACU", "1 CASCADAS DE PISHURAYACU.jpg"),
      imagePosition: { x: 50, y: 45 },
    },
    {
      title: "ALTOMAYO",
      duration: "01D",
      location,
      badge: badgeLabels[4],
      price: "S/ 760.00",
      imageSrc: buildTourPackageImagePath("5 ALTOMAYO", "1 altomayo.jpg"),
      imagePosition: { x: 50, y: 46 },
    },
    {
      title: "CASCADA SALTO DE LA BRUJA",
      duration: "01D",
      location,
      badge: badgeLabels[5],
      price: "S/ 100.00",
      imageSrc: buildTourPackageImagePath("6 CASCADA SALTO DE LA BRUJA", "1 CASCADA SALTO DE LA BRUJA.jpg"),
      imagePosition: { x: 50, y: 50 },
    },
    {
      title: "SANTA ELENA Y LAS CUEVAS",
      duration: "01D",
      location,
      badge: badgeLabels[0],
      price: "S/ 580.00",
      imageSrc: buildTourPackageImagePath("7 SANTA ELENA Y LAS CUEVAS", "1 SANTA ELENA Y LAS CUEVAS.jpg"),
      imagePosition: { x: 50, y: 50 },
    },
    {
      title: "CANOAJE EN EL RIO MAYO",
      duration: "01D",
      location,
      badge: badgeLabels[1],
      price: "S/ 1,320.00",
      imageSrc: buildTourPackageImagePath("8 CANOTAJE EN EL RIO MAYO", "1 CANOTAJE EN EL RIO MAYO.jpg"),
      imagePosition: { x: 50, y: 50 },
    },
    {
      title: "TARAPOTO CITY TOUR",
      duration: "01D",
      location,
      badge: badgeLabels[2],
      price: "S/ 420.00",
      imageSrc: buildTourPackageImagePath("9 TARAPOTO CITY TOUR", "1 TARAPOTO CITY TOUR.jpg"),
      imagePosition: { x: 50, y: 48 },
    },
    {
      title: "CATARATA DE HUACAMAILLO",
      duration: "01D",
      location,
      badge: badgeLabels[3],
      price: "S/ 980.00",
      imageSrc: buildTourPackageImagePath("10 CATARATA DE HUACAMAILLO", "1 CATARATA DE HUACAMAILLO.jpg"),
      imagePosition: { x: 50, y: 48 },
    },
    {
      title: "CASCADAS PUCAYAQUILLO",
      duration: "01D",
      location,
      badge: badgeLabels[4],
      price: "S/ 700.00",
      imageSrc: buildTourPackageImagePath("11 CASCADAS PUCAYAQUILLO", "1 CASCADA PUCAYAQUILLO.jpg"),
      imagePosition: { x: 50, y: 56 },
    },
    {
      title: "MIRADOR TAYTAMAKI",
      duration: "01D",
      location,
      badge: badgeLabels[5],
      price: "S/ 1,060.00",
      imageSrc: buildTourPackageImagePath("12 MIRADOR TAYTAMAKI", "1 MIRADOR TAYTAMAKI.jpg"),
      imagePosition: { x: 50, y: 48 },
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
}: {
  hotelName: string;
  locale: HotelLocale;
  packageName: string;
  price: string;
}) {
  const message =
    locale === "en"
      ? [
          "Hello!",
          `I want information about the tour package: ${packageName}.`,
          `Reference price: ${price}`,
          `Hotel: ${hotelName}`,
        ].join("\n")
      : [
          "Hola!",
          `Quiero informacion sobre el paquete turistico: ${packageName}.`,
          `Precio referencial: ${price}`,
          `Hotel: ${hotelName}`,
        ].join("\n");

  return `https://api.whatsapp.com/send/?phone=${HOTEL_WHATSAPP_PHONE_DIGITS}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}

function getPackageMediaStyle(imageSrc: string, position?: { x?: number; y?: number }) {
  const x = typeof position?.x === "number" ? position.x : 50;
  const y = typeof position?.y === "number" ? position.y : 50;

  return {
    backgroundImage: `linear-gradient(180deg, rgba(7, 15, 26, 0.06) 14%, rgba(3, 8, 16, 0.46) 56%, rgba(2, 5, 10, 0.92) 100%), url("${imageSrc}")`,
    backgroundPosition: `${x}% ${y}%`,
  };
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
