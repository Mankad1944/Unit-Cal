"use client";

import React, { useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { FinancialCategory } from "@/types/calculator";

interface FinancialTabsProps {
  activeTab: FinancialCategory;
  onSelectTab: (tab: FinancialCategory) => void;
}

export function FinancialTabs({ activeTab, onSelectTab }: FinancialTabsProps) {
  const { language, t, hasPermission, showToast } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs: { key: FinancialCategory; label: string; icon: string }[] = [
    { key: "sip", label: t.sip, icon: "📈" },
    { key: "fd", label: t.fd, icon: "🏦" },
    { key: "rd", label: t.rd, icon: "🔁" },
    { key: "ppf", label: t.ppf, icon: "🛡️" },
    { key: "nsc", label: t.nsc, icon: "📜" },
    { key: "loan", label: t.loan, icon: "📉" },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  const handleTabClick = (tabKey: FinancialCategory, label: string) => {
    const isAllowed = hasPermission("finCalc") && hasPermission(`fin_${tabKey}`);
    if (!isAllowed) {
      showToast(`Access to ${label} is restricted by Administrator.`);
      return;
    }
    onSelectTab(tabKey);
  };

  return (
    <div className="relative mx-auto mt-6 flex max-w-4xl items-center">
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition-all shadow-md cursor-pointer"
      >
        ‹
      </button>

      <div
        ref={scrollRef}
        className="no-scrollbar flex w-full gap-2 overflow-x-auto px-2 py-2"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isAllowed = hasPermission("finCalc") && hasPermission(`fin_${tab.key}`);

          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key, tab.label)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                !isAllowed
                  ? "border border-rose-500/20 bg-rose-500/10 text-rose-400 opacity-60 hover:opacity-100"
                  : isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400"
                  : "border border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/10 hover:text-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {!isAllowed && <span className="text-[10px]" title="Restricted by Admin">🔒</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition-all shadow-md"
      >
        ›
      </button>
    </div>
  );
}