"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { parseFeetInch, formatFeetInch } from "@/lib/calculators/units";

interface HeightComparisonProps {
  onClose?: () => void;
}

export function HeightComparision({ onClose }: HeightComparisonProps) {
  const { hasPermission } = useApp();
  const [inputA, setInputA] = useState<string>("5'10\"");
  const [inputB, setInputB] = useState<string>("6'2\"");

  const parseHeight = (val: string): number => {
    const feetInch = parseFeetInch(val);
    if (feetInch !== null) return feetInch * 100; // in cm
    const numeric = parseFloat(val);
    if (!isNaN(numeric) && numeric > 0) {
      // If user typed cm (e.g. 175) or feet decimal (e.g. 5.8)
      return numeric < 10 ? numeric * 30.48 : numeric;
    }
    return 170; // fallback
  };

  const heightAcm = useMemo(() => parseHeight(inputA), [inputA]);
  const heightBcm = useMemo(() => parseHeight(inputB), [inputB]);

  const maxScaleCm = 220; // 220 cm scale top

  const pctA = Math.min(100, Math.max(10, (heightAcm / maxScaleCm) * 100));
  const pctB = Math.min(100, Math.max(10, (heightBcm / maxScaleCm) * 100));

  const diffCm = Math.abs(heightAcm - heightBcm);
  const diffInch = (diffCm / 2.54).toFixed(1);

  const isAllowed = hasPermission("unitCalc") && hasPermission("unit_height");
  if (!isAllowed) {
    return (
      <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-rose-500/30 bg-slate-900/80 p-8 text-center backdrop-blur-xl animate-fade-in shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl text-rose-400 mb-4 border border-rose-500/30">
          🔒
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Access Restricted by Administrator</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Access to the <strong className="text-amber-300 uppercase">Height Comparison Visualizer</strong> has been locked by Administrator for your account tier.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧍</span>
          <div>
            <h3 className="text-lg font-bold text-white">Visual Height Comparison</h3>
            <p className="text-xs text-slate-400">
              Interactive scale comparison between two individuals
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="mt-6 grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Person A Height
          </label>
          <input
            type="text"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            placeholder="e.g. 5'10 or 175 cm"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none"
          />
          <div className="text-xs text-slate-400">
            {heightAcm.toFixed(1)} cm &middot; {formatFeetInch(heightAcm / 100)}
          </div>
        </div>

        <div className="flex items-center justify-center font-bold text-slate-500 text-sm">
          VS
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-pink-400">
            Person B Height
          </label>
          <input
            type="text"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            placeholder="e.g. 6'2 or 188 cm"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white focus:border-pink-500 focus:outline-none"
          />
          <div className="text-xs text-slate-400">
            {heightBcm.toFixed(1)} cm &middot; {formatFeetInch(heightBcm / 100)}
          </div>
        </div>
      </div>

      {/* Delta Difference Badge */}
      <div className="mt-4 flex justify-center">
        <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-200">
          {heightAcm === heightBcm ? (
            "Both are exactly the same height!"
          ) : (
            <>
              <strong>{heightAcm > heightBcm ? "Person A" : "Person B"}</strong> is{" "}
              <span className="text-emerald-400 font-bold">{diffCm.toFixed(1)} cm</span> (
              {diffInch} inches) taller
            </>
          )}
        </div>
      </div>

      {/* Visual Canvas Comparison */}
      <div className="relative mt-8 flex h-72 w-full items-end justify-center rounded-2xl border border-white/10 bg-slate-950/80 px-8 pb-4 pt-10 overflow-hidden">
        {/* Ticks and horizontal guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
          <div className="w-full border-b border-dashed border-white"></div>
          <div className="w-full border-b border-dashed border-white"></div>
          <div className="w-full border-b border-dashed border-white"></div>
          <div className="w-full border-b border-dashed border-white"></div>
        </div>

        {/* Side scale indicators */}
        <div className="absolute left-3 top-3 text-[10px] text-slate-500">220 cm (7&apos;2&quot;)</div>
        <div className="absolute left-3 bottom-3 text-[10px] text-slate-500">0 cm</div>

        {/* Figures Container */}
        <div className="flex h-full items-end justify-center gap-16 sm:gap-24 z-10">
          {/* Person A Figure */}
          <div
            className="flex flex-col items-center justify-end transition-all duration-300"
            style={{ height: `${pctA}%` }}
          >
            <div className="mb-1 text-center text-xs font-bold text-indigo-400 whitespace-nowrap">
              {heightAcm.toFixed(0)} cm
            </div>
            <svg
              viewBox="0 0 100 280"
              preserveAspectRatio="none"
              className="h-full w-12 sm:w-16 fill-indigo-500 hover:fill-indigo-400 transition-colors drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            >
              <circle cx="50" cy="25" r="18" />
              <path d="M25 60 C20 60 20 70 25 70 L35 70 L35 280 C35 290 45 290 45 280 L45 160 L55 160 L55 280 C55 290 65 290 65 280 L65 70 L75 70 C80 70 80 60 75 60 Z" />
            </svg>
            <div className="mt-1 text-xs font-semibold text-slate-300">Person A</div>
          </div>

          {/* Person B Figure */}
          <div
            className="flex flex-col items-center justify-end transition-all duration-300"
            style={{ height: `${pctB}%` }}
          >
            <div className="mb-1 text-center text-xs font-bold text-pink-400 whitespace-nowrap">
              {heightBcm.toFixed(0)} cm
            </div>
            <svg
              viewBox="0 0 100 280"
              preserveAspectRatio="none"
              className="h-full w-12 sm:w-16 fill-pink-500 hover:fill-pink-400 transition-colors drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]"
            >
              <circle cx="50" cy="25" r="18" />
              <path d="M25 60 C20 60 20 70 25 70 L35 70 L35 280 C35 290 45 290 45 280 L45 160 L55 160 L55 280 C55 290 65 290 65 280 L65 70 L75 70 C80 70 80 60 75 60 Z" />
            </svg>
            <div className="mt-1 text-xs font-semibold text-slate-300">Person B</div>
          </div>
        </div>
      </div>
    </div>
  );
}