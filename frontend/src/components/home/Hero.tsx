"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import type { AppMode } from "@/types/calculator";

export function Hero() {
  const { mode, setMode, language, t, hasPermission, showToast } = useApp();

  const modes: { key: AppMode; label: string; icon: string; permKey: string }[] = [
    { key: "unit", label: t.unitCalc, icon: "⚖️", permKey: "sec_unit" },
    { key: "fin", label: t.finCalc, icon: "💰", permKey: "sec_fin" },
    { key: "basic", label: t.basicCalc, icon: "🔢", permKey: "sec_basic" },
  ];

  return (
    <section className="relative flex flex-col items-center pt-8 pb-4 text-center">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/20 via-indigo-500/20 to-pink-500/20 blur-3xl"></div>

      {/* Hero Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 shadow-sm backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse"></span>
        <span>{t.heroBadge}</span>
      </div>

      {/* Hero Title */}
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
        <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
          {language === "gu" ? "સ્માર્ટ એકમ" : "Smart Unit"}
        </span>{" "}
        <span>{language === "gu" ? "કેલ્ક્યુલેટર" : "Calculator"}</span>
      </h1>

      {/* Hero Subtitle */}
      <p className="mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
        {t.heroSubtitle}
      </p>

      {/* Mode Switcher Tabs */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-900/60 p-1.5 shadow-xl backdrop-blur-xl">
        {modes.map((m) => {
          const isActive = mode === m.key;
          const isAllowed = hasPermission(m.permKey) && hasPermission("unitCalc");
          return (
            <button
              key={m.key}
              onClick={() => {
                if (!isAllowed) {
                  showToast(`${m.label} is currently restricted by system administrator.`);
                  return;
                }
                setMode(m.key);
              }}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                !isAllowed
                  ? "opacity-60 cursor-not-allowed text-slate-500 bg-slate-950/40"
                  : isActive
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {!isAllowed && <span className="text-xs text-rose-400">🔒</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}