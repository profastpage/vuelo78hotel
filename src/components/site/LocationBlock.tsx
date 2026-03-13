import type { ImagePosition, LocationInfo } from "@/types/site";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";
import { getMediaStyle } from "./rendering";

type LocationMediaItem = {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imagePosition?: ImagePosition;
};

type LocationBlockProps = {
  location: LocationInfo;
  contactEmail?: string;
  contactPhone?: string;
  editorMode?: boolean;
  editorTextControls?: EditorTextControls;
  mediaItems?: LocationMediaItem[];
};

export function LocationBlock({ location, contactEmail, contactPhone, editorMode = false, editorTextControls, mediaItems = [] }: LocationBlockProps) {
  if (!location?.address) return null;

  const locationQuery = encodeURIComponent([location.address, location.city].filter(Boolean).join(", "));
  const mapsSearchUrl = `https://www.google.com/maps?q=${locationQuery}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${locationQuery}&output=embed`;
  const visibleMedia = mediaItems.filter((item) => item?.imageSrc).slice(0, 2);
  const normalizedHours = location.hours?.includes("24 horas") ? "Recepcion 24 horas" : location.hours;

  return (
    <section className="scene scene-location" id="ubicacion" data-animate data-editor-section="location">
      <div className="location-grid">
        <div className="location-info" data-animate>
          <span className="scene-chip">Ubicacion</span>
          <div className="location-heading">
            <h2>{location.address}</h2>
            {location.city ? <p>{location.city}</p> : null}
          </div>
          <div className="location-details">
            <div className="location-row">
              <span className="location-icon" aria-hidden="true">{renderLocationIcon("map")}</span>
              <div>
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey="location.address" label="Direccion" section="contact" value={location.address} />
                ) : (
                  <strong>{location.address}</strong>
                )}
                {location.city ? (
                  editorMode ? (
                    <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.city" label="Ciudad" section="contact" value={location.city} />
                  ) : (
                    <p>{location.city}</p>
                  )
                ) : null}
              </div>
            </div>
            {normalizedHours ? (
              <div className="location-row">
                <span className="location-icon" aria-hidden="true">{renderLocationIcon("clock")}</span>
                <div>
                  <strong>Horarios</strong>
                  {editorMode ? (
                    <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.hours" label="Horarios" section="contact" value={normalizedHours} />
                  ) : (
                    <p>{normalizedHours}</p>
                  )}
                </div>
              </div>
            ) : null}
            {contactPhone ? (
              <div className="location-row">
                <span className="location-icon" aria-hidden="true">{renderLocationIcon("phone")}</span>
                <div>
                  <a href={`tel:${contactPhone.replace(/\D/g, "")}`}>{contactPhone}</a>
                </div>
              </div>
            ) : null}
            {contactEmail ? (
              <div className="location-row">
                <span className="location-icon" aria-hidden="true">{renderLocationIcon("mail")}</span>
                <div>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </div>
              </div>
            ) : null}
          </div>
          <a className="secondary-button" href={mapsSearchUrl} target="_blank" rel="noopener noreferrer">
            Ver en Google Maps
          </a>
        </div>

        <div className="location-stage" data-animate data-animate-delay="120">
          <div className="location-map">
            {mapsEmbedUrl ? (
              <iframe
                src={mapsEmbedUrl}
                title="Mapa de ubicacion"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="location-iframe"
              />
            ) : (
              <a
                className="location-map-placeholder"
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir en Google Maps"
              >
                <span className="location-map-icon" aria-hidden="true">{renderLocationIcon("map")}</span>
                <span>Ver en Google Maps</span>
              </a>
            )}
          </div>

          {visibleMedia.length ? (
            <div className="location-photo-grid">
              {visibleMedia.map((item) => (
                <article className="location-photo-card" key={`${item.title}-${item.subtitle || ""}`}>
                  <div
                    className={`location-photo-media ${item.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
                    style={getMediaStyle(item.imageSrc, "0.08", item.imagePosition)}
                  />
                  <div className="location-photo-copy">
                    <strong>{item.title}</strong>
                    {item.subtitle ? <span>{item.subtitle}</span> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function renderLocationIcon(type: "clock" | "mail" | "map" | "phone") {
  const commonProps = {
    fill: "none",
    height: 18,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
    width: 18,
  };

  switch (type) {
    case "map":
      return (
        <svg {...commonProps}>
          <path d="M9 18 3.5 20V6L9 4l6 2 5.5-2v14L15 20l-6-2Z" />
          <path d="M9 4v14" />
          <path d="M15 6v14" />
        </svg>
      );
    case "clock":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
    case "phone":
      return (
        <svg {...commonProps}>
          <path d="M7.5 5.5c.6-.6 1.5-.7 2.2-.2l1.7 1.1c.7.5 1 1.4.7 2.2l-.5 1.2c1.2 2 2.9 3.7 4.9 4.9l1.2-.5c.8-.3 1.7 0 2.2.7l1.1 1.7c.5.7.4 1.6-.2 2.2l-1 1c-.7.7-1.7 1-2.6.8C10.9 21 3 13.1 2.2 7.1c-.2-.9.1-1.9.8-2.6l1-1Z" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M4 7h16v10H4z" />
          <path d="m4 8 8 6 8-6" />
        </svg>
      );
  }
}
