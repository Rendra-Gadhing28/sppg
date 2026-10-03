"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck } from "@phosphor-icons/react";
import { ClayButton } from "../ui/ClayButton";

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroEl = document.getElementById("beranda");
      const kontakEl = document.getElementById("kontak");

      const heroPassed = heroEl ? scrollY > (heroEl.offsetTop + heroEl.offsetHeight * 0.6) : scrollY > 400;

      let kontakInView = false;
      if (kontakEl) {
        const rect = kontakEl.getBoundingClientRect();
        kontakInView = rect.top < window.innerHeight && rect.bottom > 0;
      }

      setIsVisible(heroPassed && !kontakInView);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-4 inset-x-4 z-40 pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-5 duration-200">
      <ClayButton
        href="#kontak"
        size="lg"
        variant="primary"
        tone="daun"
        className="w-full shadow-2xl text-base py-3"
      >
        <CalendarCheck size={20} weight="bold" className="mr-2" />
        Jadwalkan demo operasional
      </ClayButton>
    </div>
  );
}
