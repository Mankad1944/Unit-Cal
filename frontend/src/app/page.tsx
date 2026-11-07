"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Hero } from "@/components/home/Hero";
import { UnitTabs } from "@/components/calculator/UnitTabs";
import { UnitConverter } from "@/components/calculator/UnitConverter";
import { FinancialSection } from "@/components/calculator/FinancialSection";
import { BasicCalculator } from "@/components/calculator/BasicCalculator";
import { WeightVolumeConverter } from "@/components/calculator/WeightVolumeConverter";
import { HeightComparision } from "@/components/calculator/HeightComparision";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  const { mode, unitCategory } = useApp();

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Hero />

        {/* Section 1: Unit Calculator */}
        {mode === "unit" && (
          <section id="unit-calculator" className="mt-8 animate-fade-in">
            <UnitTabs />
            <div className="mt-6">
              {unitCategory === "height" ? (
                <HeightComparision />
              ) : unitCategory === "wv" ? (
                <WeightVolumeConverter />
              ) : (
                <UnitConverter />
              )}
            </div>
          </section>
        )}

        {/* Section 2: Financial Calculator */}
        {mode === "fin" && (
          <section id="financial-calculator" className="animate-fade-in">
            <FinancialSection />
          </section>
        )}

        {/* Section 3: Basic Calculator */}
        {mode === "basic" && (
          <section id="basic-calculator" className="mt-8 animate-fade-in">
            <BasicCalculator />
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
