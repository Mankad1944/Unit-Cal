"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  SUBSTANCES,
  MASS_UNITS,
  VOLUME_UNITS,
  convertWeightToVolume,
  convertVolumeToWeight,
} from "@/lib/calculators/weightVolume";

export function WeightVolumeConverter() {
  const { unitCategory, language, addHistory, showToast, hasPermission } = useApp();

  const isAllowed = hasPermission("unitCalc") && hasPermission("unit_wv");
  if (!isAllowed) {
    return (
      <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-rose-500/30 bg-slate-900/80 p-8 text-center backdrop-blur-xl animate-fade-in shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl text-rose-400 mb-4 border border-rose-500/30">
          🔒
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Access Restricted by Administrator</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Access to the <strong className="text-amber-300 uppercase">Weight ⟷ Volume</strong> tool has been locked by Administrator for your account tier.
        </p>
      </div>
    );
  }

  const [selectedSubstanceKey, setSelectedSubstanceKey] = useState<string>("water");
  const [customDensity, setCustomDensity] = useState<number>(1.0);
  const [direction, setDirection] = useState<"w2v" | "v2w">("w2v");
  const [inputValue, setInputValue] = useState<number>(1);
  const [massUnit, setMassUnit] = useState<string>("kg");
  const [volUnit, setVolUnit] = useState<string>("L");

  // Determine active density in kg/L
  const currentDensityKgPerL = useMemo(() => {
    if (selectedSubstanceKey === "custom") {
      return customDensity > 0 ? customDensity : 1.0;
    }
    const sub = SUBSTANCES.find((s) => s.key === selectedSubstanceKey);
    return sub ? sub.density / 1000 : 1.0;
  }, [selectedSubstanceKey, customDensity]);

  // Compute conversion
  const { resultDisplay, formulaDisplay } = useMemo(() => {
    if (direction === "w2v") {
      const { result, formula } = convertWeightToVolume(
        inputValue,
        massUnit,
        volUnit,
        currentDensityKgPerL
      );
      return {
        resultDisplay: `${Number(result.toFixed(4))} ${volUnit}`,
        formulaDisplay: formula,
      };
    } else {
      const { result, formula } = convertVolumeToWeight(
        inputValue,
        volUnit,
        massUnit,
        currentDensityKgPerL
      );
      return {
        resultDisplay: `${Number(result.toFixed(4))} ${massUnit}`,
        formulaDisplay: formula,
      };
    }
  }, [inputValue, massUnit, volUnit, direction, currentDensityKgPerL]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formulaDisplay);
    showToast("Conversion copied!");
    addHistory({
      category: "wv",
      title: `Weight ⟷ Volume (${selectedSubstanceKey})`,
      expression: `${inputValue} ${direction === "w2v" ? massUnit : volUnit}`,
      result: resultDisplay,
    });
  };

  if (unitCategory !== "wv") return null;

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
          ⚖️ Mass ⟷ 🧪 Volume
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {language === "gu"
            ? "વજન ⟷ કદ રૂપાંતરણ અને સરખામણી"
            : "Weight ⟷ Volume Converter & Comparison"}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Convert based on substance density (e.g., 1 kg = ? Litre)
        </p>
      </div>

      {/* Substance Selector */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Substance / Material
          </label>
          <select
            value={selectedSubstanceKey}
            onChange={(e) => setSelectedSubstanceKey(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            {SUBSTANCES.map((sub) => (
              <option key={sub.key} value={sub.key}>
                {sub.icon} {language === "gu" ? sub.nameGu : sub.nameEn} — {(sub.density / 1000).toFixed(3)} kg/L
              </option>
            ))}
            <option value="custom">⚙️ Custom Density</option>
          </select>
        </div>

        {selectedSubstanceKey === "custom" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Custom Density (kg/L)
            </label>
            <input
              type="number"
              step="0.001"
              value={customDensity}
              onChange={(e) => setCustomDensity(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Direction Switcher */}
      <div className="mt-6 flex justify-center">
        <div className="flex rounded-full border border-white/10 bg-slate-950/80 p-1">
          <button
            onClick={() => setDirection("w2v")}
            className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              direction === "w2v"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚖️ Weight ➔ 🧪 Volume (kg to L)
          </button>
          <button
            onClick={() => setDirection("v2w")}
            className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              direction === "v2w"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🧪 Volume ➔ ⚖️ Weight (L to kg)
          </button>
        </div>
      </div>

      {/* Interactive Controls Panel */}
      <div className="mt-6 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* Source Panel */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-inner">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {direction === "w2v" ? "Weight (Mass)" : "Volume (Capacity)"}
          </label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-lg font-semibold text-white focus:border-cyan-500 focus:outline-none"
          />
          <select
            value={direction === "w2v" ? massUnit : volUnit}
            onChange={(e) =>
              direction === "w2v" ? setMassUnit(e.target.value) : setVolUnit(e.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200"
          >
            {direction === "w2v"
              ? MASS_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {language === "gu" ? u.labelGu : u.labelEn}
                  </option>
                ))
              : VOLUME_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {language === "gu" ? u.labelGu : u.labelEn}
                  </option>
                ))}
          </select>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center">
          <button
            onClick={() => setDirection(direction === "w2v" ? "v2w" : "w2v")}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:scale-110 active:scale-95 transition-transform"
          >
            ⇄
          </button>
        </div>

        {/* Target Panel */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-inner">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {direction === "w2v" ? "Volume (Capacity)" : "Weight (Mass)"}
          </label>
          <div className="flex min-h-[52px] items-center rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xl font-bold text-cyan-300">
            {resultDisplay}
          </div>
          <select
            value={direction === "w2v" ? volUnit : massUnit}
            onChange={(e) =>
              direction === "w2v" ? setVolUnit(e.target.value) : setMassUnit(e.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200"
          >
            {direction === "w2v"
              ? VOLUME_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {language === "gu" ? u.labelGu : u.labelEn}
                  </option>
                ))
              : MASS_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {language === "gu" ? u.labelGu : u.labelEn}
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* Result Card & Formula */}
      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-center">
        <div className="text-xl font-bold text-white">{resultDisplay}</div>
        <div className="mt-1 text-xs text-cyan-300 font-mono">{formulaDisplay}</div>
        <button
          onClick={handleCopy}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition-all"
        >
          📋 Copy Calculation
        </button>
      </div>

      {/* 1 kg = ??? Litres Comparison Matrix */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          📊 Common Substances: 1 kg = ? Litres
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {SUBSTANCES.map((sub) => {
            const litres = 1 / (sub.density / 1000);
            return (
              <div
                key={sub.key}
                onClick={() => setSelectedSubstanceKey(sub.key)}
                className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                  selectedSubstanceKey === sub.key
                    ? "border-cyan-500 bg-cyan-500/20 shadow-md"
                    : "border-white/5 bg-slate-950/40 hover:border-white/10"
                }`}
              >
                <div className="text-2xl">{sub.icon}</div>
                <div className="mt-1 text-xs font-semibold text-slate-200 truncate">
                  {sub.nameEn.split(" ")[0]}
                </div>
                <div className="mt-0.5 text-xs font-bold text-cyan-400">
                  {litres.toFixed(3)} L
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}