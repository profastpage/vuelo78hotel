import { Mail, MapPinned, Phone } from "lucide-react";
import type { ImagePosition, LocationInfo } from "@/types/site";
import type { EditorTextControls } from "./editor-text-types";
import { renderBalancedSectionTitle } from "./headline-balance";
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
  reservationHref?: string;
  editorMode?: boolean;
  editorTextControls?: EditorTextControls;
  mediaItems?: LocationMediaItem[];
};

export function LocationBlock({
  location,
  contactEmail,
  contactPhone,
  reservationHref,
  editorMode = false,
  editorTextControls,
  mediaItems = [],
}: LocationBlockProps) {
  if (!location?.address) return null;

  const locationQuery = encodeURIComponent([location.address, location.city].filter(Boolean).join(", "));
  const mapsSearchUrl = location.mapsLink || `https://www.google.com/maps?q=${locationQuery}`;
  const mapsEmbedUrl = location.mapsEmbedUrl || `https://www.google.com/maps?q=${locationQuery}&output=embed`;
  const featuredMedia = mediaItems.find((item) => item?.imageSrc);
  const primaryHref = reservationHref || mapsSearchUrl;

  return (
      <section className="scene scene-location hotel-home-location" id="ubicacion" data-animate data-editor-section="location">
      <div className="hotel-home-location-heading">
        <h2>{renderBalancedSectionTitle("Ubicacion y llegada")}</h2>
      </div>

      <div className="hotel-home-location-grid">
        <div className="hotel-home-location-map-shell" data-animate data-animate-delay="120">
          <iframe
            src={mapsEmbedUrl}
            title="Mapa de ubicacion"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="hotel-home-location-iframe"
          />
        </div>

        <div className="hotel-home-location-card" data-animate>
          <div className="hotel-home-location-copy">
            <h3>Ubicacion</h3>
            {editorMode ? (
              <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.address" label="Direccion" section="contact" value={location.address} />
            ) : (
              <p>{location.address}</p>
            )}
            {location.city ? (
              editorMode ? (
                <InlineTextField as="p" controls={editorTextControls} enabled fieldKey="location.city" label="Ciudad" section="contact" value={location.city} />
              ) : (
                <p>{location.city}</p>
              )
            ) : null}
          </div>

          <div className="hotel-home-location-details">
            <div className="hotel-home-location-row">
              <span className="hotel-home-location-icon" aria-hidden="true">
                <MapPinned size={16} strokeWidth={1.8} />
              </span>
              <div>
                <strong>Direccion</strong>
                <p>{location.address}</p>
              </div>
            </div>

            {contactPhone ? (
              <div className="hotel-home-location-row">
                <span className="hotel-home-location-icon" aria-hidden="true">
                  <Phone size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Telefono</strong>
                  <a href={`tel:${contactPhone.replace(/\D/g, "")}`}>{contactPhone}</a>
                </div>
              </div>
            ) : null}

            {contactEmail ? (
              <div className="hotel-home-location-row">
                <span className="hotel-home-location-icon" aria-hidden="true">
                  <Mail size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </div>
              </div>
            ) : null}
          </div>

          <a
            className="primary-button hotel-home-location-button"
            href={primaryHref}
            rel={primaryHref === mapsSearchUrl ? "noopener noreferrer" : undefined}
            target={primaryHref === mapsSearchUrl ? "_blank" : undefined}
          >
            Reservar por WhatsApp
          </a>

          <a className="hotel-home-location-directions" href={mapsSearchUrl} target="_blank" rel="noopener noreferrer">
            Ver ruta en Google Maps
          </a>
        </div>
      </div>

      {featuredMedia ? (
        <article className="hotel-home-location-support">
          <div
            className={`hotel-home-location-support-media ${featuredMedia.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
            style={getMediaStyle(featuredMedia.imageSrc, "0.08", featuredMedia.imagePosition)}
          />
          <div className="hotel-home-location-support-copy">
            <strong>{featuredMedia.title}</strong>
            {featuredMedia.subtitle ? <span>{featuredMedia.subtitle}</span> : null}
          </div>
        </article>
      ) : null}
    </section>
  );
}
