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
              <span className="location-icon" aria-hidden="true">M</span>
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
                <span className="location-icon" aria-hidden="true">H</span>
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
                <span className="location-icon" aria-hidden="true">T</span>
                <div>
                  <a href={`tel:${contactPhone.replace(/\D/g, "")}`}>{contactPhone}</a>
                </div>
              </div>
            ) : null}
            {contactEmail ? (
              <div className="location-row">
                <span className="location-icon" aria-hidden="true">@</span>
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
                <span className="location-map-icon" aria-hidden="true">M</span>
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
