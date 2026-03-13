"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { getPresetOptionEmoji, getWidgetSystemEmoji, normalizeWidgetEmoji, resolveBookingWidget } from "@/lib/booking-widget";
import type { SiteContent } from "@/types/site";

type FloatingReservationWidgetProps = {
  content: SiteContent;
  isLocalEnvironment?: boolean;
};

type WidgetMode = "chat" | "action";

export function FloatingReservationWidget({ content, isLocalEnvironment = false }: FloatingReservationWidgetProps) {
  const widgetCopy = useMemo(() => resolveBookingWidget(content), [content]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<WidgetMode>("chat");
  const [selectedPlanId, setSelectedPlanId] = useState(widgetCopy.options[0]?.id || "");
  const [guestName, setGuestName] = useState("");
  const [scheduleValue, setScheduleValue] = useState("");
  const [quantityValue, setQuantityValue] = useState(widgetCopy.quantityOptions[0] || "1");
  const [notes, setNotes] = useState("");
  const panelTitleId = useId();
  const cleanWhatsappNumber = String(content.contact.whatsappNumber || "").replace(/[^\d]/g, "");

  useEffect(() => {
    if (!widgetCopy.options.find((option) => option.id === selectedPlanId)) {
      setSelectedPlanId(widgetCopy.options[0]?.id || "");
    }
  }, [selectedPlanId, widgetCopy.options]);

  useEffect(() => {
    if (!widgetCopy.quantityOptions.includes(quantityValue)) {
      setQuantityValue(widgetCopy.quantityOptions[0] || "1");
    }
  }, [quantityValue, widgetCopy.quantityOptions]);

  if (!cleanWhatsappNumber || !widgetCopy.options.length) {
    return null;
  }

  const selectedPlan = widgetCopy.options.find((option) => option.id === selectedPlanId) || widgetCopy.options[0];
  const directChatHref = buildChatHref(cleanWhatsappNumber, content.brand.name, widgetCopy);
  const directWhatsappHref = buildDirectWhatsappHref(cleanWhatsappNumber, content.brand.name, widgetCopy);
  const actionHref = buildActionHref({
    whatsappNumber: cleanWhatsappNumber,
    brandName: content.brand.name,
    widgetCopy,
    option: selectedPlan,
    guestName,
    scheduleValue,
    quantityValue,
    notes,
  });
  const triggerIcon = open ? "x" : getWidgetSystemEmoji("spark");
  const closedTriggerLabel = widgetCopy.bookingCtaLabel || widgetCopy.triggerActionLabel || "Reservar";
  const closedTriggerHint = widgetCopy.triggerActionHint || widgetCopy.directWhatsappHint || "Disponibilidad y tarifas";

  return (
    <div className={`floating-live-widget${open ? " is-open" : ""}${isLocalEnvironment ? " is-local-env" : ""}`}>
      <button
        aria-controls="floating-live-widget-panel"
        aria-expanded={open}
        aria-label={open ? "Cerrar widget flotante" : "Abrir widget flotante"}
        className="floating-live-widget-trigger"
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }

          setMode("action");
          setOpen(true);
        }}
      >
        <span className="floating-live-widget-trigger-icon" aria-hidden="true">
          {triggerIcon}
        </span>
        <span className="floating-live-widget-trigger-copy">
          <strong>{open ? "Cerrar" : closedTriggerLabel}</strong>
          <span>{open ? "Volver al sitio" : closedTriggerHint}</span>
        </span>
      </button>

      <section aria-labelledby={panelTitleId} className="floating-live-widget-panel" id="floating-live-widget-panel">
        <div className="floating-live-widget-header">
          <div className="floating-live-widget-admin">
            <span className="floating-live-widget-dot" aria-hidden="true" />
            <div>
              <p>{widgetCopy.adminLabel}</p>
              <strong>{widgetCopy.adminRole}</strong>
            </div>
          </div>
          <span className="floating-live-widget-status">{widgetCopy.adminStatus}</span>
        </div>

        <div className="floating-live-widget-copy">
          <h3 id={panelTitleId}>{widgetCopy.title}</h3>
          <p>{widgetCopy.description}</p>
        </div>

        <div className="floating-live-widget-tabs" role="tablist" aria-label="Opciones del widget">
          <button aria-selected={mode === "chat"} className={mode === "chat" ? "is-active" : ""} onClick={() => setMode("chat")} role="tab" type="button">
            {widgetCopy.tabChatLabel}
          </button>
          <button aria-selected={mode === "action"} className={mode === "action" ? "is-active" : ""} onClick={() => setMode("action")} role="tab" type="button">
            {widgetCopy.tabActionLabel}
          </button>
        </div>

        {mode === "chat" ? (
          <div className="floating-live-widget-body floating-live-widget-body--chat">
            <div className="floating-live-widget-action-grid">
              <a className="floating-live-widget-action primary" href={directChatHref} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">{getWidgetSystemEmoji("chat")}</span>
                <strong>{widgetCopy.chatCtaLabel}</strong>
                <small>{widgetCopy.chatCtaHint}</small>
              </a>
              <a className="floating-live-widget-action secondary" href={directWhatsappHref} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">{getWidgetSystemEmoji("whatsapp")}</span>
                <strong>{widgetCopy.directWhatsappLabel}</strong>
                <small>{widgetCopy.directWhatsappHint}</small>
              </a>
            </div>

            <div className="floating-live-widget-summary">
              <span>{widgetCopy.summaryLabel}</span>
              <p>{widgetCopy.summaryText}</p>
            </div>
          </div>
        ) : (
          <div className="floating-live-widget-body floating-live-widget-body--reserve">
            <div className="floating-live-widget-plan-grid">
              {widgetCopy.options.map((option) => (
                <button
                  className={`floating-live-widget-plan${selectedPlan?.id === option.id ? " is-selected" : ""}${option.highlighted ? " is-highlighted" : ""}`}
                  key={option.id}
                  onClick={() => setSelectedPlanId(option.id)}
                  type="button"
                >
                  <div className="floating-live-widget-plan-topline">
                    <span>{normalizeWidgetEmoji(option.emoji, getPresetOptionEmoji(widgetCopy.preset))}</span>
                    {option.badge ? <small>{option.badge}</small> : null}
                  </div>
                  <strong>{option.label}</strong>
                  <p>{option.summary}</p>
                  <div className="floating-live-widget-price">
                    <b>{option.price}</b>
                    <span>{option.rateLabel}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="floating-live-widget-form">
              <label>
                {widgetCopy.formNameLabel}
                <input onChange={(event) => setGuestName(event.target.value)} placeholder={widgetCopy.formNamePlaceholder} type="text" value={guestName} />
              </label>

              <div className="floating-live-widget-form-row">
                <label>
                  {widgetCopy.scheduleLabel}
                  <input
                    onChange={(event) => setScheduleValue(event.target.value)}
                    placeholder={widgetCopy.scheduleInputType === "text" ? widgetCopy.schedulePlaceholder : undefined}
                    type={widgetCopy.scheduleInputType}
                    value={scheduleValue}
                  />
                </label>

                <label>
                  {widgetCopy.quantityLabel}
                  <select onChange={(event) => setQuantityValue(event.target.value)} value={quantityValue}>
                    {widgetCopy.quantityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                {widgetCopy.notesLabel}
                <textarea onChange={(event) => setNotes(event.target.value)} placeholder={widgetCopy.notesPlaceholder} rows={3} value={notes} />
              </label>
            </div>

            {selectedPlan ? (
              <div className="floating-live-widget-plan-summary">
                <div>
                  <span>{widgetCopy.selectionTitle}</span>
                  <strong>{selectedPlan.label}</strong>
                </div>
                <div>
                  <span>{widgetCopy.priceLabel}</span>
                  <strong>{selectedPlan.price}</strong>
                </div>
                <div>
                  <span>{widgetCopy.timelineLabel}</span>
                  <strong>{selectedPlan.stayLabel}</strong>
                </div>
              </div>
            ) : null}

            <a className="floating-live-widget-reserve-button" href={actionHref} target="_blank" rel="noopener noreferrer">
              <span aria-hidden="true">{getWidgetSystemEmoji("spark")}</span>
              {widgetCopy.bookingCtaLabel}
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

function buildChatHref(whatsappNumber: string, brandName: string, widgetCopy: ReturnType<typeof resolveBookingWidget>) {
  const wave = getWidgetSystemEmoji("wave");
  const message = [
    `Hola ${wave}`,
    "",
    `Quiero hablar con ${widgetCopy.adminRole.toLowerCase()} de ${brandName}.`,
    "",
    `${getWidgetSystemEmoji("chat")} Necesito ayuda para ${widgetCopy.tabActionLabel.toLowerCase()}.`,
    widgetCopy.summaryText,
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildDirectWhatsappHref(whatsappNumber: string, brandName: string, widgetCopy: ReturnType<typeof resolveBookingWidget>) {
  const wave = getWidgetSystemEmoji("wave");
  const message = [
    `Hola ${wave}`,
    "",
    `Me interesa ${widgetCopy.actionVerb} con ${brandName}.`,
    "",
    `${getWidgetSystemEmoji("whatsapp")} ${widgetCopy.directWhatsappHint}`,
    "Quedo atento(a) para el siguiente paso.",
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildActionHref({
  whatsappNumber,
  brandName,
  widgetCopy,
  option,
  guestName,
  scheduleValue,
  quantityValue,
  notes,
}: {
  whatsappNumber: string;
  brandName: string;
  widgetCopy: ReturnType<typeof resolveBookingWidget>;
  option: ReturnType<typeof resolveBookingWidget>["options"][number] | undefined;
  guestName: string;
  scheduleValue: string;
  quantityValue: string;
  notes: string;
}) {
  const optionEmoji = normalizeWidgetEmoji(option?.emoji, getPresetOptionEmoji(widgetCopy.preset));
  const lines = [
    `Hola ${getWidgetSystemEmoji("wave")}`,
    "",
    `Soy ${guestName.trim() || "un cliente interesado(a)"}.`,
    `Quiero ${widgetCopy.actionVerb} con ${brandName}.`,
    "",
    `${getWidgetSystemEmoji("selection")} ${widgetCopy.selectionTitle.toUpperCase()}`,
    `${optionEmoji} ${option?.label || "Por confirmar"}`,
    `${getWidgetSystemEmoji("detail")} ${widgetCopy.detailLabel}: ${option?.roomType || "Por confirmar"}`,
    `${getWidgetSystemEmoji("price")} ${widgetCopy.priceLabel}: ${[option?.price || "Consultar", option?.rateLabel || ""].join(" ").trim()}`,
    `${getWidgetSystemEmoji("timeline")} ${widgetCopy.timelineLabel}: ${option?.stayLabel || "Por confirmar"}`,
    `${getWidgetSystemEmoji("schedule")} ${widgetCopy.scheduleLabel}: ${scheduleValue || "Por confirmar"}`,
    `${getWidgetSystemEmoji("quantity")} ${widgetCopy.quantityLabel}: ${quantityValue || widgetCopy.quantityOptions[0] || "1"}`,
    `${getWidgetSystemEmoji("perks")} Incluye: ${option?.perks?.join(", ") || "Consulta personalizada"}`,
    notes.trim() ? `${getWidgetSystemEmoji("notes")} ${widgetCopy.notesLabel}: ${notes.trim()}` : "",
    "",
    "Quedo atento(a) para confirmar. Gracias.",
  ].filter(Boolean);

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
