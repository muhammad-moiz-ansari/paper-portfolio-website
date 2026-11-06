"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { PaperInput, PaperTextarea } from "./paper-input";
import { PaperButton } from "./paper-button";

const emptyForm = { name: "", email: "", message: "" };
type Field = keyof typeof emptyForm;
type FieldErrors = Partial<Record<Field, string>>;

export function ContactForm() {
  const id = useId();
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const pending = useRef(false);

  function updateField(field: Field, value: string) {
    setFormData(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;

    const form = event.currentTarget;
    const fields = new FormData(form);
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const values = {
      name: String(fields.get("name") ?? ""),
      email: email.value,
      message: String(fields.get("message") ?? ""),
    };
    const name = values.name.trim();
    const address = values.email.trim();
    const message = values.message.trim();
    const nextErrors: FieldErrors = {};

    // EDIT: CONTACT FORM FEEDBACK — validation and delivery messages for the contact form
    if (!name) nextErrors.name = "Enter your name.";
    if (!address) nextErrors.email = "Enter your email address.";
    else if (email.validity.typeMismatch) nextErrors.email = "Enter a valid email address, such as jane@example.com.";
    if (!message) nextErrors.message = "Write a message.";

    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      // Render the associated error before moving focus so it can be announced.
      flushSync(() => {
        setFormData(values);
        setErrors(nextErrors);
        setStatus("idle");
      });
      const field = form.elements.namedItem(firstError) as HTMLElement | null;
      field?.focus({ preventScroll: true });
      field?.scrollIntoView({ block: "nearest", behavior: "instant" });
      return;
    }

    pending.current = true;
    setFormData(values);
    setErrors({});
    setStatus("sending");

    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: name,
          from_email: address,
          subject: `Message from ${name}`,
          message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setFormData(emptyForm);
      setStatus("sent");
    } catch {
      setStatus("failed");
    } finally {
      pending.current = false;
    }
  }

  const isSubmitting = status === "sending";
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div>
      <form noValidate onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-6">
        {/* EDIT: CONTACT FORM LABELS — field labels and placeholder text for the contact form */}
        <PaperInput
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          label="Your Name"
          placeholder="Jane Doe"
          required
          value={formData.name}
          error={errors.name}
          onChange={event => updateField("name", event.target.value)}
          disabled={isSubmitting}
        />
        <PaperInput
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          label="Email"
          placeholder="jane@example.com"
          required
          value={formData.email}
          error={errors.email}
          onChange={event => updateField("email", event.target.value)}
          disabled={isSubmitting}
        />
        <PaperTextarea
          id={`${id}-message`}
          name="message"
          label="Message"
          placeholder="Write something..."
          required
          value={formData.message}
          error={errors.message}
          onChange={event => updateField("message", event.target.value)}
          disabled={isSubmitting}
        />
        {/* EDIT: CONTACT SUBMIT BUTTON — text shown on the form submit button */}
        <PaperButton variant="primary" pressStyle="press" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : status === "sent" ? "Message Sent! ✓" : "Send Note ✉"}
        </PaperButton>
      </form>
      <p role="status" className="sr-only">
        {isSubmitting && "Sending your message."}
        {status === "sent" && "Your message was sent."}
        {hasErrors && "Check the fields with errors and try again."}
      </p>
      <p role="alert" className="contact-error text-sm not-empty:mt-3">
        {status === "failed" ? "Failed to send message. Please try again or email directly." : ""}
      </p>
    </div>
  );
}
