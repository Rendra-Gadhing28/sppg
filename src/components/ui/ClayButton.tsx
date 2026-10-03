"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-display font-bold text-ink-900 transition-all duration-150 cursor-pointer select-none active:translate-y-0.5 disabled:opacity-55 disabled:pointer-events-none disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-700 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "clay-sm text-ink-900 hover:-translate-y-0.5",
        secondary: "clay-sm hover:-translate-y-0.5",
        outline:
          "border-2 border-ink-900/15 bg-transparent hover:bg-padi-200/50 active:bg-padi-200",
        ghost: "hover:bg-ink-900/5 active:bg-ink-900/10",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full gap-1.5",
        md: "h-12 px-6 text-base rounded-full gap-2",
        lg: "h-14 px-8 text-lg rounded-full gap-2.5",
      },
      tone: {
        default: "",
        navy: "data-[tone]:[--clay-bg:#071e49] data-[tone]:[--clay-shade:#030d22] text-white hover:text-white",
        brand: "data-[tone]:[--clay-bg:#071e49] data-[tone]:[--clay-shade:#030d22] text-white hover:text-white",
        pastel: "data-[tone]:[--clay-bg:#b4dfe9] data-[tone]:[--clay-shade:#4a8290] text-ink-900",
        green: "data-[tone]:[--clay-bg:#92d05d] data-[tone]:[--clay-shade:#4e8223] text-ink-900",
        gold: "data-[tone]:[--clay-bg:#d1b06c] data-[tone]:[--clay-shade:#785a22] text-ink-900",
        daun: "data-[tone]:[--clay-bg:#92d05d] data-[tone]:[--clay-shade:#4e8223] text-ink-900",
        wortel: "data-[tone]:[--clay-bg:#ffa24d] data-[tone]:[--clay-shade:#ba5f14] text-ink-900",
        telur: "data-[tone]:[--clay-bg:#d1b06c] data-[tone]:[--clay-shade:#785a22] text-ink-900",
        es: "data-[tone]:[--clay-bg:#b4dfe9] data-[tone]:[--clay-shade:#4a8290] text-ink-900",
        terung: "data-[tone]:[--clay-bg:#8f94fb] data-[tone]:[--clay-shade:#4c52ba] text-ink-900",
        padi: "data-[tone]:[--clay-bg:#ffffff] data-[tone]:[--clay-shade:#071e49] text-ink-900",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      tone: "navy",
    },
  }
);

export interface ClayButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  tone?:
    | "default"
    | "navy"
    | "brand"
    | "pastel"
    | "green"
    | "gold"
    | "daun"
    | "wortel"
    | "telur"
    | "es"
    | "terung"
    | "padi";
  loading?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export const ClayButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ClayButtonProps>(
  ({ className = "", variant, size, tone = "navy", loading, children, disabled, href, ...props }, ref) => {
    const toneAttr = variant === "primary" ? tone : variant === "secondary" ? "padi" : undefined;
    const computedClass = `${buttonVariants({ variant, size, tone: toneAttr })} ${className}`;

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          data-tone={toneAttr}
          className={computedClass}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        data-tone={toneAttr}
        disabled={disabled || loading}
        className={computedClass}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-ink-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Memproses...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

ClayButton.displayName = "ClayButton";
