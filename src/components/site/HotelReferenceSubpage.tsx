import type { ClientProfile, SiteContent } from "@/types/site";
import { ContactForm } from "./ContactForm";
import { HotelMobileMenu } from "./HotelMobileMenu";
import { LandingFaqAccordion } from "./LandingFaqAccordion";
import { HOTEL_NAV_ITEMS, type HotelPageSlug, getHotelPageHref, getHotelPageLabel } from "@/lib/hotel-pages";
import { getGalleryItems, getMediaStyle, getVisibleFaqs, getVisibleServices } from "./rendering";
import { resolveBookingWidget } from "@/lib/booking-widget";

type Props = {
  profile: ClientProfile;
  content: SiteContent;
  pageSlug: Exclude<HotelPageSlug, "hotel">;
};

type Data = {
  kicker: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  story: { chip: string; title: string; body: string };
  cards: Array<{ eyebrow: string; title: string; description: string }>;
  modals: Array<{ title: string; body: string }>;
  railTitle: string;
  railDescription: string;
  faqTitle: string;
  contactDescription: string;
};

export function HotelReferenceSubpage({ profile, content, pageSlug }: Props) {
  const services = getVisibleServices(content);
  const faqs = getVisibleFaqs(content).slice(0, 4);
  const galleryItems = getGalleryItems(content, content.brand.name);
  const bookingWidget = resolveBookingWidget(content, profile);
  const heroImage = content.brand.heroImageSrc || galleryItems[0]?.imageSrc || services[0]?.imageSrc || "";
  const heroImagePosition = content.brand.heroImagePosition || galleryItems[0]?.imagePosition || services[0]?.imagePosition;
  const reservationHref = content.brand.primaryCtaHref || "#contacto";
  const mapHref = content.location?.mapsLink || reservationHref;
  const data = getPageData(pageSlug, content, services, bookingWidget.options?.slice(0, 1)?.[0]?.price || "S/ 249");
  const rail = [...galleryItems, ...services]
    .slice(0, 5)
    .map((item, index) => ({
      title: item.title,
      subtitle: index === 0 ? getHotelPageLabel(pageSlug) : "Vuelo 78",
      imageSrc: item.imageSrc || heroImage,
      imagePosition: item.imagePosition || heroImagePosition,
      description: getRailCopy(pageSlug, index),
    }));

  return (
    <>
      <section className="hotel-reference-shell hotel-reference-page-shell" id="inicio">
        <div
          className={`hotel-reference-hero hotel-reference-hero-alt ${heroImage ? "has-media-image" : "media-fallback-hotel"}`}
          style={getMediaStyle(heroImage, "0.22", heroImagePosition)}
        >
          <div className="hotel-reference-hero-overlay" aria-hidden="true" />
          <header className="hotel-reference-header">
            <a className="hotel-reference-brand" href="/" aria-label={`Ir al inicio de ${content.brand.name}`}>
              <span className="hotel-reference-brand-mark" aria-hidden="true">v</span>
              <span className="hotel-reference-brand-copy">
                <strong>{content.brand.name}</strong>
                <small>{content.brand.heroTag || "Hotel urbano en Tarapoto"}</small>
              </span>
            </a>
            <nav className="hotel-reference-nav" aria-label="Secciones principales">
              {HOTEL_NAV_ITEMS.map((item) => (
                <a className={item.slug === pageSlug ? "is-active" : undefined} href={item.href} key={item.slug}>
                  {item.label}
                </a>
              ))}
            </nav>
            <a className="hotel-reference-header-cta" href={reservationHref}>
              {content.brand.primaryCtaLabel || "Reservar"}
            </a>
            <HotelMobileMenu activeSlug={pageSlug} bookingCtaLabel={content.brand.primaryCtaLabel || "Reservar"} pages={HOTEL_NAV_ITEMS} reservationHref={reservationHref} />
          </header>

          <div className="hotel-reference-hero-copy hotel-reference-hero-copy-wide">
            <span className="hotel-reference-kicker">{data.kicker}</span>
            <h1>{data.title}</h1>
            <p>{data.description}</p>
            <div className="hotel-reference-room-actions">
              <a className="primary-button" href={reservationHref}>Reservar</a>
              <a className="secondary-button" href={pageSlug === "mapa" ? mapHref : getHotelPageHref("habitaciones")}>
                {pageSlug === "mapa" ? "Abrir mapa" : "Ver habitaciones"}
              </a>
            </div>
          </div>
        </div>

        <div className="hotel-reference-hero-metrics">
          {data.metrics.map((metric) => (
            <article className="hotel-reference-hero-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="scene hotel-reference-story-split" data-animate data-animate-delay="50">
        <article className="hotel-reference-story-copy">
          <span className="scene-chip">{data.story.chip}</span>
          <h2>{data.story.title}</h2>
          <p>{data.story.body}</p>
          <div className="hotel-reference-story-links">
            <a className="primary-button" href={reservationHref}>Confirmar disponibilidad</a>
            <a className="secondary-button" href={getHotelPageHref("mapa")}>Ver mapa</a>
          </div>
        </article>
        <div
          className={`hotel-reference-story-media ${rail[0]?.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
          style={getMediaStyle(rail[0]?.imageSrc || heroImage, "0.12", rail[0]?.imagePosition || heroImagePosition)}
        />
      </section>

      <section className="scene hotel-reference-related" data-animate data-animate-delay="90">
        <div className="hotel-reference-section-heading">
          <span className="scene-chip">{getHotelPageLabel(pageSlug)}</span>
          <h2>{data.story.title}</h2>
          <p>{data.story.body}</p>
        </div>
        <div className="hotel-reference-related-grid">
          {data.cards.map((card) => (
            <article className="hotel-reference-room-card hotel-reference-card-tight" key={card.title}>
              <div className="hotel-reference-room-card-copy">
                <span className="scene-chip scene-chip-inline">{card.eyebrow}</span>
                <strong>{card.title}</strong>
                <p>{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="scene hotel-reference-modal-grid" data-animate data-animate-delay="130">
        <div className="hotel-reference-section-heading">
          <span className="scene-chip">Popup / detalle</span>
          <h2>Capas de apoyo para ampliar informacion sin ensuciar la pagina.</h2>
          <p>Replican el patron de popup del referente con contenido nuevo, copy propio y CTA directo.</p>
        </div>
        <div className="hotel-reference-modal-cards">
          {data.modals.map((modal) => (
            <details className="hotel-reference-modal-card" key={modal.title}>
              <summary className="hotel-reference-modal-summary">
                <span>{modal.title}</span>
                <strong>Abrir detalle</strong>
              </summary>
              <div className="hotel-reference-modal-panel" role="dialog" aria-label={modal.title}>
                <div className="hotel-reference-modal-content">
                  <span className="scene-chip">Detalle</span>
                  <h3>{modal.title}</h3>
                  <p>{modal.body}</p>
                  <div className="hotel-reference-room-actions">
                    <a className="primary-button" href={reservationHref}>Reservar</a>
                    <a className="secondary-button" href="#contacto">Escribir al hotel</a>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="scene hotel-reference-rail-shell" data-animate data-animate-delay="170">
        <div className="hotel-reference-section-heading">
          <span className="scene-chip">Slider / rail</span>
          <h2>{data.railTitle}</h2>
          <p>{data.railDescription}</p>
        </div>
        <div className="hotel-reference-rail" role="list" aria-label={data.railTitle}>
          {rail.map((item) => (
            <article className="hotel-reference-rail-card" key={`${item.title}-${item.subtitle}`} role="listitem">
              <div
                className={`hotel-reference-rail-media ${item.imageSrc ? "has-media-image" : "media-fallback-hotel"}`}
                style={getMediaStyle(item.imageSrc, "0.08", item.imagePosition)}
              />
              <div className="hotel-reference-rail-copy">
                <span>{item.subtitle}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {pageSlug === "mapa" ? (
        <section className="scene hotel-reference-map-layout" data-animate data-animate-delay="210">
          <article className="hotel-reference-map-card">
            <span className="scene-chip">Ubicacion</span>
            <h2>{content.location?.city || "Tarapoto, Peru"}</h2>
            <p>{content.location?.address || "Tarapoto, Peru"}. El bloque esta listo para incrustar mapa real, puntos cercanos y tiempos de traslado.</p>
            <div className="hotel-reference-facts-grid">
              <article><span>Aeropuerto</span><strong>12 min</strong></article>
              <article><span>Centro</span><strong>6 min</strong></article>
              <article><span>Check-in</span><strong>24/7</strong></article>
            </div>
            <div className="hotel-reference-room-actions">
              <a className="primary-button" href={mapHref}>Abrir mapa</a>
              <a className="secondary-button" href={reservationHref}>Reservar</a>
            </div>
          </article>
          <div className="hotel-reference-map-visual" aria-hidden="true">
            <div className="hotel-reference-map-pin"><span /></div>
            <div className="hotel-reference-map-route hotel-reference-map-route-a" />
            <div className="hotel-reference-map-route hotel-reference-map-route-b" />
          </div>
        </section>
      ) : null}

      {faqs.length ? <LandingFaqAccordion items={faqs} label={`FAQ ${getHotelPageLabel(pageSlug)}`} title={data.faqTitle} /> : null}

      <ContactForm
        description={data.contactDescription}
        title={content.contact.title || "Confirma disponibilidad y reserva con claridad"}
        whatsappNumber={content.contact.whatsappNumber}
      />

      <footer className="scene hotel-reference-footer">
        <div className="hotel-reference-footer-brand">
          <span className="scene-chip">{getHotelPageLabel(pageSlug)}</span>
          <strong>{content.brand.name}</strong>
          <p>{data.contactDescription}</p>
        </div>
        <div className="hotel-reference-footer-links">
          {HOTEL_NAV_ITEMS.map((item) => (
            <a className={item.slug === pageSlug ? "is-active" : undefined} href={item.href} key={item.slug}>
              {item.label}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

function getPageData(pageSlug: Exclude<HotelPageSlug, "hotel">, content: SiteContent, services: SiteContent["services"], leadPrice: string): Data {
  const city = content.location?.city || "Tarapoto";
  const firstServices = services.slice(0, 3);
  const sharedCards = firstServices.length
    ? firstServices.map((service, index) => ({
        eyebrow: index === 0 ? "Destacado" : "Bloque",
        title: service.title,
        description: service.description,
      }))
    : [
        { eyebrow: "Bloque", title: "Habitacion premium", description: "Placeholder listo para editar." },
        { eyebrow: "Bloque", title: "Experiencia directa", description: "Placeholder listo para editar." },
        { eyebrow: "Bloque", title: "Reserva clara", description: "Placeholder listo para editar." },
      ];

  const map: Record<Exclude<HotelPageSlug, "hotel">, Data> = {
    ofertas: {
      kicker: "Ofertas y promos",
      title: "Ofertas pensadas para cerrar la reserva rapido.",
      description: "Pagina premium para campañas, pauta y consultas por WhatsApp con beneficios claros.",
      metrics: [{ label: "Planes", value: "03" }, { label: "Destino", value: city }, { label: "Reserva", value: "Directa" }],
      story: { chip: "Ofertas", title: "Promociones con orden visual y CTA temprano.", body: "Mantiene el ritmo del referente: hero dominante, bloques editoriales, popup y rail horizontal." },
      cards: sharedCards,
      modals: [{ title: "Promo fin de semana", body: "Capa lista para condiciones, vigencia y beneficio principal." }, { title: "Escapada flexible", body: "Espacio para day use, late check-out o mejora de categoria." }, { title: "Plan corporativo", body: "Ideal para trabajo, estadias cortas o convenio de empresa." }],
      railTitle: "Un rail para upgrades, perks y visuales de campana.",
      railDescription: "Se desplaza bien en celular y sostiene el tono premium del sitio.",
      faqTitle: "Preguntas frecuentes sobre ofertas y reservas",
      contactDescription: "Usa esta pagina para anuncios, campañas y consultas de disponibilidad con menos friccion.",
    },
    experiencias: {
      kicker: "Estancia y atmosfera",
      title: "Experiencias que convierten una noche en una estancia completa.",
      description: "Ideal para contar llegada, descanso, trabajo ligero y pequenos rituales del hotel.",
      metrics: [{ label: "Atencion", value: "24/7" }, { label: "Entorno", value: "Urbano" }, { label: "Mood", value: "Premium" }],
      story: { chip: "Experiencias", title: "Narrativa hotelera con imagen grande y copy breve.", body: "Sirve para vender sensacion, calma, pequenos momentos y valor mas alla del cuarto." },
      cards: sharedCards,
      modals: [{ title: "Llegada sin friccion", body: "Panel para check-in, bienvenida y soporte de llegada." }, { title: "Momentos del hotel", body: "Bloque para lounge, descanso o day use con lenguaje mas editorial." }, { title: "Estadia flexible", body: "Espacio para upgrades o solicitudes antes de llegar." }],
      railTitle: "Escenas visuales para sostener una narrativa mas hotelera.",
      railDescription: "Buen formato para materiales, texturas, amenities y detalles sin sobrecargar la pagina.",
      faqTitle: "Preguntas frecuentes sobre la experiencia y la estancia",
      contactDescription: "La pagina queda preparada para vender sensaciones y diferenciales sin caer en texto plano.",
    },
    habitaciones: {
      kicker: "Suites y categorias",
      title: "Habitaciones con detalle amplio y decision clara.",
      description: `Compara categorias, muestra visuales y deja visible la tarifa desde ${leadPrice}.`,
      metrics: [{ label: "Categorias", value: `${Math.max(services.length, 3)}` }, { label: "Tarifa", value: leadPrice }, { label: "Canal", value: "WhatsApp" }],
      story: { chip: "Habitaciones", title: "La misma direccion del referente convertida en sistema reutilizable.", body: "Pagina ideal para suites, dobles, familiares o day use con imagen dominante y acciones visibles." },
      cards: sharedCards,
      modals: [{ title: "Amenidades incluidas", body: "Detalle de WiFi, desayuno, aire, smart TV y otros perks." }, { title: "Politica de reserva", body: "Horario, anticipos, cancelacion y condiciones de estadia." }, { title: "Upgrade o pedido especial", body: "Bloque para cama extra, decoracion o asistencia previa." }],
      railTitle: "Slider editorial para reforzar atmosfera y materialidad.",
      railDescription: "Se usa para angulos del cuarto, detalles y pequenos momentos de la estancia.",
      faqTitle: "Preguntas frecuentes sobre habitaciones, tarifas y check-in",
      contactDescription: "La pagina de habitaciones queda lista para fotos reales, descripciones finas y una reserva directa mas clara.",
    },
    servicios: {
      kicker: "Amenities y soporte",
      title: "Servicios visibles, ordenados y faciles de escanear.",
      description: "Una pagina para explicar beneficios del hotel sin convertir todo en una lista tecnica.",
      metrics: [{ label: "Amenities", value: "Premium" }, { label: "Atencion", value: "Humana" }, { label: "Apoyo", value: "Directo" }],
      story: { chip: "Servicios", title: "Los servicios se traducen en valor percibido.", body: "La composicion usa tarjetas grandes y superficies limpias para vender soporte, desayuno, conectividad y asistencia." },
      cards: sharedCards,
      modals: [{ title: "Desayuno y horarios", body: "Espacio para horarios, formato y detalles del servicio." }, { title: "Apoyo antes de llegar", body: "Panel para traslado, indicaciones y check-in tardio." }, { title: "Servicios a medida", body: "Perfecto para lavanderia, decoracion o pedidos especiales." }],
      railTitle: "Rail para amenities sin caer en una ficha tecnica.",
      railDescription: "Combina fotografia, microcopy y senales rapidas de valor.",
      faqTitle: "Preguntas frecuentes sobre servicios y asistencia",
      contactDescription: "Esta pagina ayuda a sostener la promesa premium del hotel con una lectura mucho mas clara.",
    },
    restaurante: {
      kicker: "Desayuno y gastronomia",
      title: "Una pagina para restaurante o desayunos con tono editorial.",
      description: "Lista para mostrar carta breve, horarios, ambiente y reservas dentro del ecosistema del hotel.",
      metrics: [{ label: "Servicio", value: "Desayuno" }, { label: "Ambiente", value: "Calmo" }, { label: "Reserva", value: "Simple" }],
      story: { chip: "Restaurante", title: "Imagen dominante, texto corto y capas de detalle.", body: "Funciona para desayuno, brunch, lounge o bar con una estetica coherente con el hotel." },
      cards: sharedCards,
      modals: [{ title: "Menu destacado", body: "Espacio para platos firma, bebidas o propuesta del dia." }, { title: "Horario de servicio", body: "Ideal para explicar desayuno incluido o modalidad a la carta." }, { title: "Cena privada", body: "Bloque para reservar mesa o experiencia gastronomica especial." }],
      railTitle: "Un rail horizontal para platos, escenas y pequenos momentos.",
      railDescription: "Muy util para trafico de redes y para mantener la pagina mas visual.",
      faqTitle: "Preguntas frecuentes sobre restaurante, desayunos y reservas",
      contactDescription: "La pagina queda lista para integrar carta real, fotos propias y reserva de mesa.",
    },
    eventos: {
      kicker: "Social y corporativo",
      title: "Eventos con una presentacion sobria y preparada para cotizar rapido.",
      description: "Ordena espacios, montajes y contacto para clientes corporativos o celebraciones privadas.",
      metrics: [{ label: "Formato", value: "Flexible" }, { label: "Montajes", value: "03+" }, { label: "Respuesta", value: "Rapida" }],
      story: { chip: "Eventos", title: "Jerarquia limpia para vender salones, reuniones y celebraciones.", body: "La direccion visual evita verse como folleto PDF y acerca la consulta comercial." },
      cards: sharedCards,
      modals: [{ title: "Solicitar cotizacion", body: "Bloque para rango de aforo, respuesta y datos basicos." }, { title: "Montajes disponibles", body: "Espacio para directorio, auditorio, banquete o coctel." }, { title: "Catering y soporte", body: "Panel para cafe, menu, audiovisuales y coordinacion." }],
      railTitle: "Carrusel para salones, montajes y escenas de uso.",
      railDescription: "Refuerza visualmente el espacio antes del contacto o la cotizacion.",
      faqTitle: "Preguntas frecuentes sobre aforos, cotizaciones y montajes",
      contactDescription: "La pagina de eventos queda lista para captar leads mas calificados y mostrar espacios con mejor jerarquia.",
    },
    galeria: {
      kicker: "Media y atmosfera",
      title: "Una galeria con mas caracter editorial y menos sensacion de plantilla.",
      description: "Pensada para reemplazar con fotos reales del hotel, manteniendo orden en movil y desktop.",
      metrics: [{ label: "Imagenes", value: `${Math.max(services.length + 2, 6)}` }, { label: "Formato", value: "Editorial" }, { label: "Uso", value: "Responsive" }],
      story: { chip: "Galeria", title: "La imagen manda, pero con control compositivo.", body: "Usa modulos amplios, rail horizontal y bloques curados para evitar una grilla generica." },
      cards: sharedCards,
      modals: [{ title: "Coleccion habitaciones", body: "Abre una serie visual mas enfocada del inventario." }, { title: "Ambientes del hotel", body: "Agrupa lobby, zonas comunes y atmosfera general." }, { title: "Experiencias y detalles", body: "Ideal para close-ups, texturas y pequenos momentos." }],
      railTitle: "Slider visual listo para reemplazar con imagenes reales.",
      railDescription: "Da una experiencia cercana al referente: visual, limpia y facil de recorrer.",
      faqTitle: "Preguntas frecuentes sobre imagenes y colecciones",
      contactDescription: "La galeria queda estructurada para crecer con material propio sin perder ritmo ni legibilidad.",
    },
    mapa: {
      kicker: "Ubicacion y llegada",
      title: "Una pagina de mapa que orienta, tranquiliza y acerca la reserva.",
      description: "Muestra ubicacion, referencias, tiempos de traslado y puntos cercanos sin verse tecnica ni fria.",
      metrics: [{ label: "Ciudad", value: city }, { label: "Acceso", value: "Facil" }, { label: "Canal", value: "Directo" }],
      story: { chip: "Mapa", title: "La ubicacion tambien vende confianza.", body: "Se combina mapa visual, textos cortos y CTA de reserva para que la llegada se sienta sencilla." },
      cards: sharedCards,
      modals: [{ title: "Como llegar", body: "Espacio para aeropuerto, terminal, taxis y referencias simples." }, { title: "Entorno del hotel", body: "Bloque para restaurantes cercanos, plazas y puntos utiles." }, { title: "Check-in y contacto", body: "Panel para horarios, confirmaciones y soporte directo." }],
      railTitle: "Recorrido visual para reforzar contexto y llegada.",
      railDescription: "Sirve para fachada, calles cercanas, lobby o puntos de acceso.",
      faqTitle: "Preguntas frecuentes sobre ubicacion, acceso y llegada",
      contactDescription: "La pagina de mapa deja lista una capa de confianza logistica que ayuda a convertir mejor.",
    },
  };

  return map[pageSlug];
}

function getRailCopy(pageSlug: Exclude<HotelPageSlug, "hotel">, index: number) {
  const text: Record<Exclude<HotelPageSlug, "hotel">, string[]> = {
    ofertas: ["Upgrade, promo o paquete con lectura clara.", "Beneficio clave y CTA visible.", "Pieza util para pauta y temporada alta.", "Visual corto con sentido comercial.", "Bloque horizontal muy usable en celular."],
    experiencias: ["Escena para llegada o descanso.", "Ayuda a construir deseo.", "Sirve para materiales y detalles.", "Sostiene narrativa sin mucho texto.", "Tambien funciona para day use."],
    habitaciones: ["Panel listo para fotos reales.", "Muestra cama, bano o escritorio.", "Refuerza amplitud antes del detalle.", "Permite comparar angulos sin ruido.", "Se integra bien con reserva directa."],
    servicios: ["Amenity convertido en valor percibido.", "Ideal para desayuno o conectividad.", "Ordena beneficios con mejor tono.", "Mantiene ritmo visual limpio.", "Puede cambiarse por senales de confianza."],
    restaurante: ["Perfecto para platos o escenas suaves.", "Aporta deseo sin romper la linea.", "Sirve para brunch, bar o desayuno.", "Muy util si llega trafico de redes.", "Se desplaza bien en movil."],
    eventos: ["Espacio para salones y montajes.", "Puede mostrar directorio o coctel.", "Funciona como resumen visual.", "Deja imaginar el uso rapidamente.", "Se adapta a corporativo y privado."],
    galeria: ["Tarjeta preparada para foto grande.", "Ordena imagenes sin collage caotico.", "Ideal para arquitectura y servicio.", "Sostiene tono premium con placeholders.", "Puede crecer sin rehacer la pagina."],
    mapa: ["Escena de llegada o fachada.", "Sirve para accesos y referencias.", "Tranquiliza antes de la reserva.", "Puede usarse con imagenes del barrio.", "Cierra mejor la promesa logistica."],
  };
  return text[pageSlug][index % text[pageSlug].length];
}
