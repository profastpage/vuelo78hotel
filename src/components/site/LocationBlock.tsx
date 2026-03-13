import type { LocationInfo } from "@/types/site";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";

type LocationBlockProps = {
  location: LocationInfo;
  contactEmail?: string;
  contactPhone?: string;
  editorMode?: boolean;
  editorTextControls?: EditorTextControls;
};

export function LocationBlock({ location, contactEmail, contactPhone, editorMode = false, editorTextControls }: LocationBlockProps) {
  if (!location?.address) return null;

  const mapsSearchUrl =
    location.mapsLink ?? `https://maps.google.com/?q=${encodeURIComponent([location.address, location.city].filter(Boolean).join(", "))}`;

  return (
    <section className="scene scene-location" id="ubicacion" data-animate data-editor-section="location">
      <div className="location-grid">
        <div className="location-info" data-animate>
          <span className="scene-chip">Ubicacion</span>
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
            {location.hours ? (
              <div className="location-row">
                <span className="location-icon" aria-hidden="true">H</span>
                <div>
                  <strong>Horarios</strong>
                  {editorMode ? (
                    <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.hours" label="Horarios" section="contact" value={location.hours} />
                  ) : (
                    <p>{location.hours}</p>
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

        <div className="location-map" data-animate data-animate-delay="120">
          {location.mapsEmbedUrl ? (
            <iframe
              src={location.mapsEmbedUrl}
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
      </div>
    </section>
  );
}
