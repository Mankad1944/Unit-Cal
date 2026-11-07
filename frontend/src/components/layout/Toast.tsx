"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce">
      <div className="flex items-center gap-2 rounded-full border border-indigo-500/40 bg-slate-900/95 px-5 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
