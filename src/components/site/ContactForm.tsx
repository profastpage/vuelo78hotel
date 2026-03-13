"use client";

import { FormEvent, useState } from "react";
import type { EditorTextControls } from "./editor-text-types";
import { renderBalancedSectionTitle } from "./headline-balance";
import { InlineTextField } from "./InlineTextField";
import { buildHotelWhatsAppHref, getHotelUi, type HotelLocale } from "@/lib/hotel-experience";

type ContactFormProps = {
  title: string;
  description: string;
  brandName?: string;
  locale?: HotelLocale;
  whatsappNumber?: string;
  editorMode?: boolean;
  editorTextControls?: EditorTextControls;
};

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

function validateForm(data: FormData, locale: HotelLocale): FieldErrors {
  const ui = getHotelUi(locale);
  const errors: FieldErrors = {};

  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (name.length < 2) {
    errors.name = ui.contact.validations.name;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ui.contact.validations.email;
  }

  if (message.length < 10) {
    errors.message = ui.contact.validations.message;
  }

  return errors;
}

export function ContactForm({ title, description, brandName = "Vuelo 78 Hotel", locale = "es", whatsappNumber, editorMode = false, editorTextControls }: ContactFormProps) {
  const ui = getHotelUi(locale);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const errors = validateForm(formData, locale);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el formulario.");
      }

      setStatus("success");
      setMessage(ui.contact.success);
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : ui.contact.error);
    }
  }

  const whatsappHref = whatsappNumber
    ? buildHotelWhatsAppHref({
        locale,
        hotelName: brandName,
        intent: "contact",
        sourceLabel: ui.contact.whatsappTitle,
      })
    : null;

  return (
    <section className="contact-panel contact-panel-deluxe" data-editor-section="contact" id="contacto" data-animate>
      <div className="contact-panel-copy" data-animate>
        <span className="eyebrow">{ui.contact.eyebrow}</span>
        {editorMode ? (
          <InlineTextField
            as="h2"
            className="section-title"
            controls={editorTextControls}
            displayValue={renderBalancedSectionTitle(title)}
            enabled
            fieldKey="contact.title"
            label="Titulo de contacto"
            minRows={3}
            multiline
            section="contact"
            value={title}
          />
        ) : (
          <h2 className="section-title">{renderBalancedSectionTitle(title)}</h2>
        )}
        {editorMode ? (
          <InlineTextField
            as="p"
            controls={editorTextControls}
            enabled
            fieldKey="contact.description"
            label="Descripcion de contacto"
            minRows={3}
            multiline
            section="contact"
            value={description}
          />
        ) : (
          <p>{description}</p>
        )}

        <div className="contact-panel-signals" aria-label="Beneficios de contacto">
          <article className="contact-signal-card">
            <span>{ui.contact.response}</span>
            <strong>{ui.contact.responseValue}</strong>
            <p>{ui.contact.responseDescription}</p>
          </article>
          <article className="contact-signal-card">
            <span>{ui.contact.directChannel}</span>
            <strong>{ui.contact.directValue}</strong>
            <p>{ui.contact.directDescription}</p>
          </article>
        </div>

        <div className="contact-panel-facts" aria-label="Datos de confianza">
          <div>
            <span>{ui.contact.estimatedTime}</span>
            <strong>{ui.contact.estimatedValue}</strong>
          </div>
          <div>
            <span>{ui.contact.format}</span>
            <strong>{ui.contact.formatValue}</strong>
          </div>
          <div>
            <span>{ui.contact.availability}</span>
            <strong>{ui.contact.availabilityValue}</strong>
          </div>
        </div>

        {whatsappHref ? (
          <a
            className="whatsapp-link"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={locale === "en" ? "Contact on WhatsApp" : "Contactar por WhatsApp"}
          >
            <span className="whatsapp-link-icon" aria-hidden="true">
              <span />
            </span>
            <span className="whatsapp-link-copy">
              <strong>{ui.contact.whatsappTitle}</strong>
              <small>{ui.contact.whatsappSubtitle}</small>
            </span>
          </a>
        ) : null}
      </div>

      <div className="contact-form-shell" data-animate data-animate-delay="80">
        <div className="contact-form-shell-top">
          <span className="contact-form-shell-kicker">{ui.contact.shellKicker}</span>
          <p>{ui.contact.shellDescription}</p>
        </div>

        <form className="contact-form contact-form-deluxe" onSubmit={handleSubmit} noValidate>
          <div className="contact-form-inline">
            <label className={fieldErrors.name ? "has-error" : ""}>
              {ui.contact.name} <span className="field-required" aria-hidden="true">{ui.contact.required}</span>
              <input
                name="name"
                placeholder={ui.contact.namePlaceholder}
                required
                type="text"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? "error-name" : undefined}
                autoComplete="name"
              />
              {fieldErrors.name ? (
                <span className="field-error" id="error-name" role="alert">
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>

            <label className={fieldErrors.email ? "has-error" : ""}>
              {ui.contact.email} <span className="field-required" aria-hidden="true">{ui.contact.required}</span>
              <input
                name="email"
                placeholder={ui.contact.emailPlaceholder}
                required
                type="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "error-email" : undefined}
                autoComplete="email"
              />
              {fieldErrors.email ? (
                <span className="field-error" id="error-email" role="alert">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>
          </div>

          <label>
            {ui.contact.phone} <span className="field-optional">{ui.contact.optional}</span>
            <input
              name="phone"
              placeholder={ui.contact.phonePlaceholder}
              type="tel"
              autoComplete="tel"
            />
          </label>

          <label className={fieldErrors.message ? "has-error" : ""}>
            {ui.contact.message} <span className="field-required" aria-hidden="true">{ui.contact.required}</span>
            <textarea
              name="message"
              placeholder={ui.contact.messagePlaceholder}
              required
              rows={6}
              aria-invalid={!!fieldErrors.message}
              aria-describedby={fieldErrors.message ? "error-message" : undefined}
            />
            {fieldErrors.message ? (
              <span className="field-error" id="error-message" role="alert">
                {fieldErrors.message}
              </span>
            ) : null}
          </label>

          <div className="contact-form-actions">
            <button disabled={status === "loading"} type="submit" aria-busy={status === "loading"}>
              {status === "loading" ? ui.contact.sending : ui.contact.send}
            </button>
            <p className="contact-form-note">{ui.contact.note}</p>
          </div>

          {message ? (
            <p className={`form-status ${status}`} role="status" aria-live="polite">
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
