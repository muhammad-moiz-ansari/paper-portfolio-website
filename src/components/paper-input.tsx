"use client";

/**
 * PaperInput — Form inputs styled as fill-in-the-blank lines on ruled paper
 *
 * Text input: underline-style input, not a boxed input, sitting on a
 * ruled paper line. The label appears as a handwritten prompt.
 *
 * Textarea: a ruled notepad block with repeating horizontal lines.
 *
 * States: default (empty line), focused (line darkens, label shrinks up),
 * filled (text sits on the line naturally).
 */

import React, { useState } from "react";
import { useTheme } from "@/lib/theme-context";

interface PaperInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  className?: string;
  /** Force a visual state for the style guide demo */
  forceState?: "default" | "focused" | "filled";
}

export function PaperInput({
  label,
  placeholder = "",
  value: controlledValue,
  className = "",
  forceState,
}: PaperInputProps) {
  const [internalValue, setInternalValue] = useState(
    forceState === "filled" ? (controlledValue || "Sample answer text") : (controlledValue || "")
  );
  const [isFocused, setIsFocused] = useState(forceState === "focused");
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  const value = internalValue;
  const hasValue = value.length > 0;
  const showFocus = forceState === "focused" || (isFocused && !forceState);
  const lineColor = showFocus
    ? (isChalkboard ? "var(--color-chalk-white)" : "var(--color-ink)")
    : (isChalkboard ? "var(--color-chalk-line)" : "var(--color-ink-light)");

  return (
    <div className={`relative ${className}`}>
      {/* Label — handwritten style, floats up when focused/filled */}
      <label
        className={`
          absolute left-0 transition-all duration-200 font-[family-name:var(--font-hand)]
          pointer-events-none
          ${showFocus || hasValue
            ? "text-xs -top-4"
            : "text-base top-2"
          }
          ${isChalkboard ? "text-[var(--text-secondary)]" : "text-[var(--color-ink)]"}
        `}
      >
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={showFocus ? placeholder : ""}
        onChange={(e) => !forceState && setInternalValue(e.target.value)}
        onFocus={() => !forceState && setIsFocused(true)}
        onBlur={() => !forceState && setIsFocused(false)}
        className={`
          w-full bg-transparent border-0 border-b-2 py-2 px-0
          text-base font-[family-name:var(--font-hand)]
          text-[var(--text)] placeholder:text-[var(--text-faint)]
          outline-none transition-colors duration-200
        `}
        style={{ borderBottomColor: lineColor }}
        readOnly={!!forceState}
      />
    </div>
  );
}

interface PaperTextareaProps {
  label: string;
  placeholder?: string;
  value?: string;
  rows?: number;
  className?: string;
  forceState?: "default" | "focused" | "filled";
}

export function PaperTextarea({
  label,
  placeholder = "",
  value: controlledValue,
  rows = 4,
  className = "",
  forceState,
}: PaperTextareaProps) {
  const [internalValue, setInternalValue] = useState(
    forceState === "filled"
      ? (controlledValue || "This is some sample text that sits on the ruled lines of the notepad, showing how longer-form content looks in this input style.")
      : (controlledValue || "")
  );
  const [isFocused, setIsFocused] = useState(forceState === "focused");
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  const value = internalValue;
  const showFocus = forceState === "focused" || (isFocused && !forceState);

  /* Ruled lines behind the textarea */
  const lineColorCss = isChalkboard ? "rgba(240,237,229,0.12)" : "rgba(97, 87, 76, 0.25)";
  const ruledBg = `repeating-linear-gradient(transparent, transparent 29px, ${lineColorCss} 29px, ${lineColorCss} 30px)`;

  return (
    <div className={`relative ${className}`}>
      <label className={`block text-sm font-[family-name:var(--font-hand)] mb-1 ${
        isChalkboard ? "text-[var(--text-secondary)]" : "text-[var(--color-ink)]"
      }`}>
        {label}
      </label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => !forceState && setInternalValue(e.target.value)}
        onFocus={() => !forceState && setIsFocused(true)}
        onBlur={() => !forceState && setIsFocused(false)}
        className={`
          w-full bg-transparent px-3 pb-3 pt-2 rounded-sm
          text-base font-[family-name:var(--font-hand)] leading-[30px]
          text-[var(--text)] placeholder:text-[var(--text-faint)]
          outline-none resize-y transition-all duration-200
          border-2
          ${showFocus
            ? (isChalkboard ? "border-[var(--color-chalk-white)]" : "border-[var(--color-ink)]")
            : (isChalkboard ? "border-[var(--color-chalk-line)]" : "border-[var(--color-ink-light)]")
          }
        `}
        style={{ backgroundImage: ruledBg, backgroundSize: "100% 30px" }}
        readOnly={!!forceState}
      />
    </div>
  );
}
