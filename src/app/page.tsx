"use client";

import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { RoleMarquee } from "@/components/landing/RoleMarquee";
import { MasalahSection } from "@/components/landing/MasalahSection";
import { AlurSection } from "@/components/landing/AlurSection";
import { FiturSection } from "@/components/landing/FiturSection";
import { CerdasSection } from "@/components/landing/CerdasSection";
import { PeranSection } from "@/components/landing/PeranSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { TargetSection } from "@/components/landing/TargetSection";
import { KeamananSection } from "@/components/landing/KeamananSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { KontakSection } from "@/components/landing/KontakSection";
import { Footer } from "@/components/landing/Footer";
import { MobileStickyCta } from "@/components/landing/MobileStickyCta";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-brand-canvas text-brand-dark selection:bg-brand-pastel selection:text-brand-dark">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <RoleMarquee />
          <MasalahSection />
          <AlurSection />
          <FiturSection />
          <CerdasSection />
          <PeranSection />
          <RoadmapSection />
          <TargetSection />
          <KeamananSection />
          <FaqSection />
          <KontakSection />
        </main>
        <Footer />
        <MobileStickyCta />
      </div>
    </SmoothScroll>
  );
}
