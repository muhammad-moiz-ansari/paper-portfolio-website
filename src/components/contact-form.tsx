"use client";

import React, { useState } from "react";
import { PaperInput, PaperTextarea } from "./paper-input";
import { PaperButton } from "./paper-button";

export function ContactForm() {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const { default: emailjs } = await import("@emailjs/browser");
      // Send email using EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: `Message from ${formData.name}`,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      // Success
      setIsSuccess(true);
      setFormData({ name: "", email: "", message: "" });

      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("EmailJS error:", error);
      setIsError(true);

      // Reset error state after 3 seconds
      setTimeout(() => {
        setIsError(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EDIT: CONTACT FORM LABELS — field labels and placeholder text for the contact form */}
            <PaperInput
              label="Your Name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
            />
            <PaperInput
              label="Email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isSubmitting}
            />
            <PaperTextarea
              label="Message"
              placeholder="Write something..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              disabled={isSubmitting}
            />
            {/* EDIT: CONTACT SUBMIT BUTTON — text shown on the form submit button */}
            <PaperButton
              variant="primary"
              pressStyle="press"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting
                ? "Sending..."
                : isSuccess
                  ? "Message Sent! ✓"
                  : "Send Note ✉"}
            </PaperButton>
            {/* Error message */}
            {isError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to send message. Please try again or email directly.
              </p>
            )}
          </form>
  );
}
