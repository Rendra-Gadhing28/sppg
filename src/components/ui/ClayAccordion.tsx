"use client";

import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "@phosphor-icons/react";

export interface AccordionItemData {
  id: string;
  title: string;
  content: string | React.ReactNode;
}

export interface ClayAccordionProps {
  items: AccordionItemData[];
  type?: "single" | "multiple";
  className?: string;
}

export function ClayAccordion({ items, className = "" }: ClayAccordionProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      className={`w-full divide-y divide-ink-900/10 ${className}`}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          className="py-4 sm:py-5 group"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-2 text-left font-display font-bold text-lg sm:text-xl text-ink-900 transition-all hover:text-daun-700 outline-none focus-visible:ring-2 focus-visible:ring-daun-700 rounded-lg group-data-[state=open]:text-daun-700">
              <span className="pr-4">{item.title}</span>
              <span className="shrink-0 w-8 h-8 rounded-full clay-sm flex items-center justify-center transition-transform duration-200 group-data-[state=open]:rotate-45">
                <Plus size={18} weight="bold" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pt-2 pb-4 text-base sm:text-lg text-ink-600 font-sans leading-relaxed">
              {item.content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
