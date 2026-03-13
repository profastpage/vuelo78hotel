"use client";

import { FormEvent, useState } from "react";
import type { EditorTextControls } from "./editor-text-types";
import { renderBalancedSectionTitle } from "./headline-balance";
import { InlineTextField } from "./InlineTextField";

type ContactFormProps = {
  title: string;
  description: string;
  whatsappNumber?: string;
  editorMode?: boolean;
  editorTextControls?: EditorTextControls;
};

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

function validateForm(data: FormData): FieldErrors {
  const errors: FieldErrors = {};

  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (name.length < 2) {
    errors.name = "Ingresa tu nombre completo (minimo 2 caracteres).";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Ingresa un correo electronico valido.";
  }

  if (message.length < 10) {
    errors.message = "El mensaje debe tener al menos 10 caracteres.";
  }

  return errors;
}

export function ContactForm({ title, description, whatsappNumber, editorMode = false, editorTextControls }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const errors = validateForm(formData);
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
      setMessage("Mensaje enviado. Te responderemos a la brevedad.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Error inesperado. Intenta nuevamente.");
    }
  }

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, me contacto desde su sitio web.")}`
    : null;

  return (
    <section className="contact-panel contact-panel-deluxe" data-editor-section="contact" id="contacto" data-animate>
      <div className="contact-panel-copy" data-animate>
        <span className="eyebrow">Reservas directas</span>
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
            <span>Respuesta</span>
            <strong>Atencion prioritaria</strong>
            <p>Ideal para confirmar habitaciones, tarifas y cualquier solicitud especial antes de tu llegada.</p>
          </article>
          <article className="contact-signal-card">
            <span>Canal directo</span>
            <strong>Reserva sin intermediarios</strong>
            <p>Escribe por WhatsApp o deja tu consulta para recibir una respuesta clara del hotel.</p>
          </article>
        </div>

        <div className="contact-panel-facts" aria-label="Datos de confianza">
          <div>
            <span>Tiempo estimado</span>
            <strong>Menos de 30 min</strong>
          </div>
          <div>
            <span>Formato</span>
            <strong>Reserva guiada</strong>
          </div>
          <div>
            <span>Disponibilidad</span>
            <strong>Todos los dias</strong>
          </div>
        </div>

        {whatsappHref ? (
          <a
            className="whatsapp-link"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            <span className="whatsapp-link-icon" aria-hidden="true">
              <span />
            </span>
            <span className="whatsapp-link-copy">
              <strong>Escribir por WhatsApp</strong>
              <small>Canal directo para confirmar disponibilidad</small>
            </span>
          </a>
        ) : null}
      </div>

      <div className="contact-form-shell" data-animate data-animate-delay="80">
        <div className="contact-form-shell-top">
          <span className="contact-form-shell-kicker">Consulta de reserva</span>
          <p>Comparte tus fechas y el tipo de habitacion que buscas. El hotel te responde con disponibilidad y tarifa.</p>
        </div>

        <form className="contact-form contact-form-deluxe" onSubmit={handleSubmit} noValidate>
          <div className="contact-form-inline">
            <label className={fieldErrors.name ? "has-error" : ""}>
              Nombre <span className="field-required" aria-hidden="true">*</span>
              <input
                name="name"
                placeholder="Tu nombre completo"
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
              Email <span className="field-required" aria-hidden="true">*</span>
              <input
                name="email"
                placeholder="Tu correo"
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
            Telefono <span className="field-optional">(opcional)</span>
            <input
              name="phone"
              placeholder="Tu telefono"
              type="tel"
              autoComplete="tel"
            />
          </label>

          <label className={fieldErrors.message ? "has-error" : ""}>
            Mensaje <span className="field-required" aria-hidden="true">*</span>
            <textarea
              name="message"
              placeholder="Indicanos tus fechas, tipo de habitacion y cualquier detalle importante para tu reserva."
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
              {status === "loading" ? "Enviando..." : "Enviar consulta"}
            </button>
            <p className="contact-form-note">Canal recomendado para consultas de disponibilidad, tarifas y reservas personalizadas.</p>
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
