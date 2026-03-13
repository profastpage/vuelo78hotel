import { Clock3, Mail, MapPinned, Navigation, Phone } from "lucide-react";
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
  const mapsSearchUrl = location.mapsLink || `https://www.google.com/maps?q=${locationQuery}`;
  const mapsEmbedUrl = location.mapsEmbedUrl || `https://www.google.com/maps?q=${locationQuery}&output=embed`;
  const featuredMedia = mediaItems.find((item) => item?.imageSrc);
  const normalizedHours = location.hours?.includes("24 horas") ? "Recepcion 24 horas" : location.hours;

  return (
    <section className="scene scene-location hotel-deluxe-location" id="ubicacion" data-animate data-editor-section="location">
      <div className="hotel-deluxe-section-heading hotel-deluxe-location-heading">
        <span className="scene-chip">Ubicacion</span>
        <h2>Llega con confianza y ubica el hotel antes de reservar.</h2>
        <p>Mapa visible, direccion clara y acceso directo a Google Maps para reforzar confianza y facilitar la llegada.</p>
      </div>

      <div className="location-grid hotel-deluxe-location-grid">
        <div className="location-info hotel-deluxe-location-info" data-animate>
          <div className="location-heading hotel-deluxe-location-card-head">
            <span className="hotel-deluxe-location-eyebrow">Tarapoto</span>
            <h2>{location.address}</h2>
            {location.city ? <p>{location.city}</p> : null}
          </div>

          <div className="location-details hotel-deluxe-location-details">
            <div className="location-row hotel-deluxe-location-row">
              <span className="location-icon hotel-deluxe-location-icon" aria-hidden="true">
                <MapPinned size={18} strokeWidth={1.8} />
              </span>
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
              <div className="location-row hotel-deluxe-location-row">
                <span className="location-icon hotel-deluxe-location-icon" aria-hidden="true">
                  <Clock3 size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Horario</strong>
                  {editorMode ? (
                    <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.hours" label="Horarios" section="contact" value={normalizedHours} />
                  ) : (
                    <p>{normalizedHours}</p>
                  )}
                </div>
              </div>
            ) : null}

            {contactPhone ? (
              <div className="location-row hotel-deluxe-location-row">
                <span className="location-icon hotel-deluxe-location-icon" aria-hidden="true">
                  <Phone size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Telefono</strong>
                  <a href={`tel:${contactPhone.replace(/\D/g, "")}`}>{contactPhone}</a>
                </div>
              </div>
            ) : null}

            {contactEmail ? (
              <div className="location-row hotel-deluxe-location-row">
                <span className="location-icon hotel-deluxe-location-icon" aria-hidden="true">
                  <Mail size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </div>
              </div>
            ) : null}
          </div>

          <div className="hotel-deluxe-location-actions">
            <a className="primary-button hotel-deluxe-location-button" href={mapsSearchUrl} target="_blank" rel="noopener noreferrer">
              <Navigation size={16} strokeWidth={1.8} />
              Abrir en Google Maps
            </a>
          </div>

          {featuredMedia ? (
            <article className="hotel-deluxe-location-photo">
              <div
                className={`hotel-deluxe-location-photo-media ${featuredMedia.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
                style={getMediaStyle(featuredMedia.imageSrc, "0.08", featuredMedia.imagePosition)}
              />
              <div className="hotel-deluxe-location-photo-copy">
                <strong>{featuredMedia.title}</strong>
                {featuredMedia.subtitle ? <span>{featuredMedia.subtitle}</span> : null}
              </div>
            </article>
          ) : null}
        </div>

        <div className="location-stage hotel-deluxe-location-stage" data-animate data-animate-delay="120">
          <div className="location-map hotel-deluxe-location-map">
            <iframe
              src={mapsEmbedUrl}
              title="Mapa de ubicacion"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="location-iframe hotel-deluxe-location-iframe"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
