"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  UNITS,
  convert,
  convertAll,
  parseFeetInch,
  formatFeetInch,
} from "@/lib/calculators/units";
import type { UnitCategory } from "@/types/calculator";

interface UnitConverterProps {
  onToggleHeightCompare?: () => void;
  showHeightCompare?: boolean;
}

export function UnitConverter({
  onToggleHeightCompare,
  showHeightCompare,
}: UnitConverterProps) {
  const { unitCategory, language, addHistory, showToast, t, hasPermission } = useApp();

  // If "wv" or "height" category is selected, let their dedicated components render
  if (unitCategory === "wv" || unitCategory === "height") {
    return null;
  }

  const activeCategory = unitCategory as Exclude<UnitCategory, "wv" | "height">;
  const currentUnits = UNITS[activeCategory] || [];

  const defaultFrom = currentUnits[0]?.key || "";
  const defaultTo = currentUnits[1]?.key || currentUnits[0]?.key || "";

  const [fromUnit, setFromUnit] = useState<string>(defaultFrom);
  const [toUnit, setToUnit] = useState<string>(defaultTo);
  const [inputValue, setInputValue] = useState<string>("1");
  const [allEquivalentsOpen, setAllEquivalentsOpen] = useState(false);

  // Sync when category changes
  useEffect(() => {
    if (currentUnits.length > 0) {
      setFromUnit(currentUnits[0].key);
      setToUnit(currentUnits[1]?.key || currentUnits[0].key);
    }
  }, [unitCategory]);

  // Handle parsing & conversion
  const { numericFrom, resultValue, feetInchFormatted } = useMemo(() => {
    let num = Number(inputValue);
    let feetParsed: number | null = null;

    if (activeCategory === "length") {
      feetParsed = parseFeetInch(inputValue);
      if (feetParsed !== null) {
        // If parsed from feet-inch, it gives base metres
        num = feetParsed;
      }
    }

    if (isNaN(num)) {
      return { numericFrom: 0, resultValue: "—", feetInchFormatted: "" };
    }

    let calculated: number;
    if (feetParsed !== null) {
      // From base metres to target unit
      const targetUnitObj = currentUnits.find((u) => u.key === toUnit);
      calculated = targetUnitObj ? targetUnitObj.fromBase(num) : 0;
    } else {
      calculated = convert(num, fromUnit, toUnit, activeCategory);
    }

    // Format clean display
    let display = "—";
    if (Number.isFinite(calculated)) {
      display =
        Math.abs(calculated) < 1e-4 || Math.abs(calculated) > 1e7
          ? calculated.toExponential(4)
          : Number(calculated.toFixed(6)).toString();
    }

    // Feet-inch representation if length
    let fiDisplay = "";
    if (activeCategory === "length" && Number.isFinite(calculated)) {
      const toUnitObj = currentUnits.find((u) => u.key === toUnit);
      if (toUnitObj) {
        const inMetres = toUnitObj.toBase(calculated);
        fiDisplay = formatFeetInch(inMetres);
      }
    }

    return { numericFrom: num, resultValue: display, feetInchFormatted: fiDisplay };
  }, [inputValue, fromUnit, toUnit, activeCategory, currentUnits]);

  // All equivalents list
  const equivalents = useMemo(() => {
    if (isNaN(numericFrom) || !Number.isFinite(numericFrom)) return [];
    return convertAll(numericFrom, fromUnit, activeCategory);
  }, [numericFrom, fromUnit, activeCategory]);

  const handleSwap = () => {
    const prevFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(prevFrom);
  };

  const handleCopyResult = () => {
    if (resultValue !== "—") {
      navigator.clipboard.writeText(`${inputValue} ${fromUnit} = ${resultValue} ${toUnit}`);
      showToast("Copied to clipboard!");
      addHistory({
        category: "unit",
        title: `${fromUnit.toUpperCase()} to ${toUnit.toUpperCase()}`,
        expression: `${inputValue} ${fromUnit}`,
        result: `${resultValue} ${toUnit}`,
      });
    }
  };

  const handleCopyAll = () => {
    const text = equivalents
      .map((eq) => `${eq.labelEn}: ${Number(eq.result.toFixed(6))}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    showToast("All equivalents copied!");
  };

  const isAllowed = hasPermission("unitCalc") && hasPermission(`unit_${activeCategory}`);
  if (!isAllowed) {
    return (
      <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-rose-500/30 bg-slate-900/80 p-8 text-center backdrop-blur-xl animate-fade-in shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl text-rose-400 mb-4 border border-rose-500/30">
          🔒
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Access Restricted by Administrator</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Access to the <strong className="text-amber-300 uppercase">{activeCategory}</strong> unit conversion tool has been locked by Administrator for your account tier.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
      {/* Gujarati Units Badge & Height Compare Trigger */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
          <span>🏡</span>
          <span>{t.gujBadge}</span>
        </div>

        {activeCategory === "length" && onToggleHeightCompare && (
          <button
            onClick={onToggleHeightCompare}
            className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition-all"
          >
            <span>🧍</span>
            <span>
              {showHeightCompare ? "Hide Height Comparison" : t.compareHeights}
            </span>
          </button>
        )}
      </div>

      {/* Converter Panel Grid */}
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* FROM PANEL */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-inner">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.fromLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 5'10 or 100"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-lg font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {activeCategory === "length" && (
              <span className="mt-1 block text-[11px] text-slate-400">
                Hint: Supports <strong className="text-indigo-300">5&apos;10&quot;</strong> or{" "}
                <strong className="text-indigo-300">5ft 10in</strong>
              </span>
            )}
          </div>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {currentUnits.map((u) => (
              <option key={u.key} value={u.key}>
                {language === "gu" ? u.labelGu : u.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* SWAP BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            title={t.swapTitle}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* TO PANEL */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-inner">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.toLabel}
            </label>
            <button
              onClick={handleCopyResult}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              📋 Copy
            </button>
          </div>
          <div className="flex min-h-[52px] items-center rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xl font-bold tracking-tight text-indigo-300 select-all">
            {resultValue}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {currentUnits.map((u) => (
              <option key={u.key} value={u.key}>
                {language === "gu" ? u.labelGu : u.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feet-Inch Detailed Display (if length) */}
      {feetInchFormatted && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs text-indigo-200">
          <span className="text-lg">👟</span>
          <div>
            <div className="font-semibold text-slate-300">Foot-Inch Equivalent:</div>
            <div className="text-sm font-bold text-white">{feetInchFormatted}</div>
          </div>
        </div>
      )}

      {/* All Equivalents Accordion */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAllEquivalentsOpen(!allEquivalentsOpen)}
            className="flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white transition-colors"
          >
            <span>{allEquivalentsOpen ? "▼" : "▶"}</span>
            <span>{t.allLabel}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
              {equivalents.length}
            </span>
          </button>
          {allEquivalentsOpen && (
            <button
              onClick={handleCopyAll}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all"
            >
              {t.copyAll}
            </button>
          )}
        </div>

        {allEquivalentsOpen && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto pr-1">
            {equivalents.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-3 text-xs hover:border-white/10 transition-colors"
              >
                <span className="font-medium text-slate-400">
                  {language === "gu" ? item.labelGu : item.labelEn}
                </span>
                <span className="font-bold text-slate-100">
                  {Math.abs(item.result) < 1e-4 || Math.abs(item.result) > 1e7
                    ? item.result.toExponential(4)
                    : Number(item.result.toFixed(6)).toString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}