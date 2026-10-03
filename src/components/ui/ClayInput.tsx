"use client";

import React, { useId } from "react";

export interface ClayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const ClayInput = React.forwardRef<HTMLInputElement, ClayInputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        <label
          htmlFor={inputId}
          className="font-display font-bold text-sm text-ink-900 tracking-wide"
        >
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-[52px] px-4 rounded-[20px] clay-inset font-sans text-ink-900 placeholder:text-ink-600/60 text-base transition-all outline-none focus:ring-2 focus:ring-daun-700 focus:scale-[1.005] ${
              error ? "ring-2 ring-cabai-400" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-semibold text-cabai-400 mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-600 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
ClayInput.displayName = "ClayInput";

export interface ClaySelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const ClaySelect = React.forwardRef<HTMLSelectElement, ClaySelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        <label
          htmlFor={selectId}
          className="font-display font-bold text-sm text-ink-900 tracking-wide"
        >
          {label}
        </label>
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-[52px] pl-4 pr-11 rounded-[20px] clay-inset font-sans text-ink-900 text-base transition-all outline-none focus:ring-2 focus:ring-daun-700 appearance-none cursor-pointer ${
              error ? "ring-2 ring-cabai-400" : ""
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-padi-50 text-ink-900">
                {opt.label}
              </option>
            ))}
          </select>
          {/* Caret icon — pointer-events-none agar tidak menghalangi klik select */}
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink-900/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
        {error && <p className="text-xs font-semibold text-cabai-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);
ClaySelect.displayName = "ClaySelect";

export interface ClayTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const ClayTextarea = React.forwardRef<HTMLTextAreaElement, ClayTextareaProps>(
  ({ label, error, className = "", id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        <label
          htmlFor={textareaId}
          className="font-display font-bold text-sm text-ink-900 tracking-wide"
        >
          {label}
        </label>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full p-4 rounded-[20px] clay-inset font-sans text-ink-900 placeholder:text-ink-600/60 text-base transition-all outline-none focus:ring-2 focus:ring-daun-700 resize-none ${
            error ? "ring-2 ring-cabai-400" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs font-semibold text-cabai-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);
ClayTextarea.displayName = "ClayTextarea";
