"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

const TAILWIND_PALETTES: Record<string, Record<number, string>> = {
  slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", 950: "#020617" },
  gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827", 950: "#030712" },
  red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a" },
  orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12", 950: "#431407" },
  amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" },
  yellow: { 50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047", 400: "#facc15", 500: "#eab308", 600: "#ca8a04", 700: "#a16207", 800: "#854d0e", 900: "#713f12", 950: "#422006" },
  lime: { 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d", 700: "#4d7c0f", 800: "#3f6212", 900: "#365314", 950: "#1a2e05" },
  green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16" },
  emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a", 950: "#042f2e" },
  cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63", 950: "#083344" },
  sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e", 950: "#082f49" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" },
  indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81", 950: "#1e1b4b" },
  violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065" },
  purple: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87", 950: "#3b0764" },
  fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 300: "#f0abfc", 400: "#e879f9", 500: "#d946ef", 600: "#c026d3", 700: "#a21caf", 800: "#86198f", 900: "#701a75", 950: "#4a044e" },
  pink: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843", 950: "#500724" },
  rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" },
};

export default function ColorViewerPage() {
  const { showToast } = useApp();
  const [hex, setHex] = useState("#6366f1");
  const [selectedPalette, setSelectedPalette] = useState("indigo");

  // Hex to RGB
  const hexToRgb = (h: string) => {
    let clean = h.replace("#", "");
    if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 99, g: 102, b: 241 };
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  const { r, g, b } = hexToRgb(hex);

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const { h, s, l } = rgbToHsl(r, g, b);

  // RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number) => {
    const r1 = r / 255, g1 = g / 255, b1 = b / 255;
    const k = 1 - Math.max(r1, g1, b1);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = Math.round(((1 - r1 - k) / (1 - k)) * 100);
    const m = Math.round(((1 - g1 - k) / (1 - k)) * 100);
    const y = Math.round(((1 - b1 - k) / (1 - k)) * 100);
    return { c, m, y, k: Math.round(k * 100) };
  };

  const cmyk = rgbToCmyk(r, g, b);

  // Contrast calculation
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum = getLuminance(r, g, b);
  const contrastWhite = (1.05 / (lum + 0.05)).toFixed(2);
  const contrastBlack = ((lum + 0.05) / 0.05).toFixed(2);

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast(`Copied ${val}`);
  };

  // Random color generator
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    setHex(color);
    showToast(`Generated random color ${color}`);
  };

  // EyeDropper API handler
  const handleEyeDropper = async () => {
    if (typeof window !== "undefined" && (window as any).EyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res && res.sRGBHex) {
          setHex(res.sRGBHex);
          showToast(`Sampled color ${res.sRGBHex}`);
        }
      } catch (e) {
        // cancelled or not permitted
      }
    } else {
      showToast("EyeDropper is not supported on this browser");
    }
  };

  // Find closest Tailwind match
  const findClosestTailwind = () => {
    let closestName = "indigo-500";
    let minDiff = Infinity;
    Object.entries(TAILWIND_PALETTES).forEach(([palette, shades]) => {
      Object.entries(shades).forEach(([shade, hexVal]) => {
        const rgb2 = hexToRgb(hexVal);
        const diff = Math.sqrt(
          Math.pow(r - rgb2.r, 2) + Math.pow(g - rgb2.g, 2) + Math.pow(b - rgb2.b, 2)
        );
        if (diff < minDiff) {
          minDiff = diff;
          closestName = `${palette}-${shade}`;
        }
      });
    });
    return closestName;
  };

  const closestTw = findClosestTailwind();

  // Dynamic Shades (50 to 950)
  const shadesLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold text-pink-300">
          <span>🎨</span> Palette & Format Inspector
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Color Studio & Tailwind Palette
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Interactive color picker, random generator, TailwindCSS palette presets, and WCAG contrast analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Preview & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
          {/* Main Color Swatch Card */}
          <div
            className="h-56 w-full rounded-2xl shadow-inner transition-colors duration-300 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: hex }}
          >
            <span
              className="text-xl font-bold font-mono px-4 py-1.5 rounded-xl backdrop-blur-md shadow-md"
              style={{ color: parseFloat(contrastWhite) > 4.5 ? "#ffffff" : "#000000" }}
            >
              {hex.toUpperCase()}
            </span>
            <span
              className="mt-2 text-xs font-semibold px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm"
              style={{ color: parseFloat(contrastWhite) > 4.5 ? "#ffffff" : "#000000" }}
            >
              Tailwind match: bg-{closestTw}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={generateRandomColor}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all"
            >
              <span>🎲</span> Random Color
            </button>
            <button
              type="button"
              onClick={handleEyeDropper}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              <span>💧</span> Eyedropper
            </button>
          </div>

          {/* Input Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Select / Enter Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 font-mono text-sm text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Swatches */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 mb-2 block">Quick Swatches</span>
              <div className="flex flex-wrap gap-2">
                {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4", "#ef4444", "#14b8a6"].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHex(c)}
                      style={{ backgroundColor: c }}
                      className="h-7 w-7 rounded-full border border-white/20 shadow-md transition-transform hover:scale-110"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Format Conversions & Contrast */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Format values */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Color Representations</h3>
            <div className="space-y-2">
              {[
                { name: "HEX", val: hex.toUpperCase() },
                { name: "RGB", val: `rgb(${r}, ${g}, ${b})` },
                { name: "HSL", val: `hsl(${h}, ${s}%, ${l}%)` },
                { name: "CMYK", val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
                { name: "Tailwind Classes", val: `bg-${closestTw} text-${closestTw}` },
                { name: "CSS Variable", val: `--color-primary: ${hex};` },
              ].map((fmt) => (
                <div
                  key={fmt.name}
                  onClick={() => copyVal(fmt.val)}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-800/40 p-3 hover:border-pink-500/40 hover:bg-slate-800/70 transition-all"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{fmt.name}</span>
                    <div className="font-mono text-xs font-semibold text-pink-300">{fmt.val}</div>
                  </div>
                  <span className="text-xs text-slate-500 opacity-60 group-hover:opacity-100 group-hover:text-white">
                    Copy
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contrast & Accessibility */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">On White Text</span>
              <div className="text-xl font-bold text-white mt-1">{contrastWhite} : 1</div>
              <span
                className={`text-[10px] font-semibold mt-1 inline-block ${
                  parseFloat(contrastWhite) >= 4.5 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {parseFloat(contrastWhite) >= 7 ? "AAA Pass" : parseFloat(contrastWhite) >= 4.5 ? "AA Pass" : "Fail"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">On Black Text</span>
              <div className="text-xl font-bold text-white mt-1">{contrastBlack} : 1</div>
              <span
                className={`text-[10px] font-semibold mt-1 inline-block ${
                  parseFloat(contrastBlack) >= 4.5 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {parseFloat(contrastBlack) >= 7 ? "AAA Pass" : parseFloat(contrastBlack) >= 4.5 ? "AA Pass" : "Fail"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind Color Palette Presets */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-200">Tailwind Color Palette Presets</h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(TAILWIND_PALETTES).map((pal) => (
              <button
                key={pal}
                type="button"
                onClick={() => setSelectedPalette(pal)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                  selectedPalette === pal
                    ? "bg-pink-600 text-white shadow-md"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {pal}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Palette Shades Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5">
          {shadesLevels.map((lvl) => {
            const shadeHex = TAILWIND_PALETTES[selectedPalette]?.[lvl] || "#6366f1";
            return (
              <div
                key={lvl}
                onClick={() => {
                  setHex(shadeHex);
                  copyVal(shadeHex);
                }}
                className="group flex flex-col items-center gap-1.5 cursor-pointer rounded-xl border border-white/5 bg-slate-800/30 p-2 hover:border-pink-500/40 hover:bg-slate-800/60 transition-all"
              >
                <div
                  className="h-10 w-full rounded-lg shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: shadeHex }}
                />
                <span className="text-[11px] font-semibold text-slate-300">{lvl}</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">{shadeHex}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
