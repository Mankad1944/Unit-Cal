"use client";

import React, { useState } from "react";
import { FinancialTabs } from "./FinancialTabs";
import { FinancialCalculator } from "./FinancialCalculator";
import type { FinancialCategory } from "@/types/calculator";

export function FinancialSection() {
  const [activeTab, setActiveTab] = useState<FinancialCategory>("sip");

  return (
    <section id="financial-calculator" className="mt-12">
      <FinancialTabs activeTab={activeTab} onSelectTab={setActiveTab} />
      <FinancialCalculator activeTab={activeTab} />
    </section>
  );
}

export default FinancialSection;
