"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export function BasicCalculator() {
  const { addHistory, showToast } = useApp();
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [justEvaluated, setJustEvaluated] = useState(false);

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "⌫", "="],
  ];

  const handleBtn = (val: string) => {
    if (val === "C") {
      setDisplay("0");
      setExpression("");
      setJustEvaluated(false);
      return;
    }
    if (val === "⌫") {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      return;
    }
    if (val === "±") {
      setDisplay((prev) =>
        prev.startsWith("-") ? prev.slice(1) : prev === "0" ? "0" : "-" + prev
      );
      return;
    }
    if (val === "%") {
      const num = parseFloat(display);
      if (!isNaN(num)) setDisplay(String(num / 100));
      return;
    }
    if (val === "=") {
      try {
        const expr = (expression + display)
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-");
        // eslint-disable-next-line no-eval
        const result = Function('"use strict"; return (' + expr + ")")();
        const resultStr = String(
          Math.round(result * 1e10) / 1e10
        );
        addHistory({
          category: "basic",
          title: "Basic Calculation",
          expression: expression + display,
          result: resultStr,
        });
        setDisplay(resultStr);
        setExpression("");
        setJustEvaluated(true);
      } catch {
        setDisplay("Error");
        setExpression("");
        setJustEvaluated(true);
      }
      return;
    }
    const isOperator = ["÷", "×", "−", "+"].includes(val);
    if (isOperator) {
      setExpression(display + " " + val + " ");
      setDisplay("0");
      setJustEvaluated(false);
      return;
    }
    if (justEvaluated) {
      setDisplay(val === "." ? "0." : val);
      setJustEvaluated(false);
      return;
    }
    if (val === "." && display.includes(".")) return;
    setDisplay((prev) => (prev === "0" && val !== "." ? val : prev + val));
  };

  const operatorClass =
    "rounded-2xl border border-indigo-500/20 bg-indigo-600/25 text-indigo-300 font-bold text-lg hover:bg-indigo-600/40 transition-all active:scale-95 shadow-sm";
  const numberClass =
    "rounded-2xl border border-white/10 bg-slate-900/80 text-white font-semibold text-lg hover:bg-white/10 transition-all active:scale-95 shadow-sm";
  const funcClass =
    "rounded-2xl border border-white/10 bg-slate-800/80 text-slate-200 font-semibold text-sm hover:bg-white/10 transition-all active:scale-95";
  const equalClass =
    "rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-all active:scale-95";

  const getBtnClass = (val: string) => {
    if (val === "=") return equalClass;
    if (["÷", "×", "−", "+"].includes(val)) return operatorClass;
    if (["C", "±", "%", "⌫"].includes(val)) return funcClass;
    return numberClass;
  };

  return (
    <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-2xl">
      {/* Display */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 text-right shadow-inner">
        <div className="text-xs text-slate-500 font-mono min-h-[18px]">
          {expression || " "}
        </div>
        <div className="mt-1 overflow-hidden text-ellipsis text-3xl sm:text-4xl font-bold tracking-tight text-white select-all">
          {display}
        </div>
      </div>

      {/* Copy result button */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => {
            navigator.clipboard.writeText(display);
            showToast("Result copied!");
          }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          📋 Copy
        </button>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {buttons.flat().map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleBtn(btn)}
            className={`${getBtnClass(btn)} flex h-14 items-center justify-center ${
              btn === "0" ? "col-span-1" : ""
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}