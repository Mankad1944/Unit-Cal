"use client";

import React, { useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { UnitCategory } from "@/types/calculator";

export function UnitTabs() {
  const { unitCategory, setUnitCategory, language, t, hasPermission, showToast } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories: { key: UnitCategory; labelEn: string; labelGu: string; icon: string }[] = [
    { key: "length", labelEn: "Length", labelGu: "લંબાઈ", icon: "📏" },
    { key: "height", labelEn: "Height Compare", labelGu: "ઊંચાઈ સરખામણી", icon: "🧍" },
    { key: "area", labelEn: "Area", labelGu: "ક્ષેત્રફળ", icon: "🔲" },
    { key: "weight", labelEn: "Weight", labelGu: "વજન", icon: "⚖️" },
    { key: "volume", labelEn: "Volume", labelGu: "જથ્થો", icon: "🧪" },
    { key: "wv", labelEn: "Weight ⟷ Volume", labelGu: "વજન ⟷ કદ", icon: "⚖️🧪" },
    { key: "temperature", labelEn: "Temperature", labelGu: "તાપમાન", icon: "🌡️" },
    { key: "speed", labelEn: "Speed", labelGu: "ઝડપ", icon: "💨" },
    { key: "time", labelEn: "Time", labelGu: "સમય", icon: "⏱️" },
    { key: "digital", labelEn: "Digital", labelGu: "ડિજિટલ", icon: "💾" },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (key: UnitCategory, label: string) => {
    const isAllowed = hasPermission("unitCalc") && hasPermission(`unit_${key}`);
    if (!isAllowed) {
      showToast(`Access to ${label} is restricted by Administrator.`);
      return;
    }
    setUnitCategory(key);
  };

  return (
    <div className="relative mx-auto mt-6 flex max-w-4xl items-center">
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition-all shadow-md cursor-pointer"
        aria-label="Previous categories"
      >
        ‹
      </button>

      <div
        ref={scrollRef}
        className="no-scrollbar flex w-full gap-2 overflow-x-auto px-2 py-2"
      >
        {categories.map((c) => {
          const isActive = unitCategory === c.key;
          const label = language === "gu" ? c.labelGu : c.labelEn;
          const isAllowed = hasPermission("unitCalc") && hasPermission(`unit_${c.key}`);

          return (
            <button
              key={c.key}
              onClick={() => handleCategoryClick(c.key, label)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                !isAllowed
                  ? "border border-rose-500/20 bg-rose-500/10 text-rose-400 opacity-60 hover:opacity-100"
                  : isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400"
                  : "border border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/10 hover:text-slate-200"
              }`}
            >
              <span>{c.icon}</span>
              <span>{label}</span>
              {!isAllowed && <span className="text-[10px]" title="Restricted by Admin">🔒</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white transition-all shadow-md cursor-pointer"
        aria-label="Next categories"
      >
        ›
      </button>
    </div>
  );
}