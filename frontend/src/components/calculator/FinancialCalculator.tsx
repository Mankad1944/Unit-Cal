"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  calculateSIP,
  calculateFD,
  calculateRD,
  calculatePPF,
  calculateNSC,
  calculateLoan,
} from "@/lib/calculators/financial";
import type {
  FinancialCategory,
  LoanType,
  RepayFrequency,
  PrepayMode,
  NSCInvestMode,
  NSCMaturityAction,
  NSCYearlyAddition,
  NSCOneTimeAddition,
} from "@/types/calculator";

interface FinancialCalculatorProps {
  activeTab?: FinancialCategory;
}

export function FinancialCalculator({
  activeTab = "sip",
}: FinancialCalculatorProps) {
  const { language, addHistory, showToast, t, hasPermission } = useApp();

  // Common Inputs
  const [amount, setAmount] = useState<number>(5000);
  const [rate, setRate] = useState<number>(12);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [tenureMonths, setTenureMonths] = useState<number>(0);

  // Additional options accordion toggle
  const [showAdditional, setShowAdditional] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // SIP specific
  const [sipType, setSipType] = useState<"sip" | "lumpsum">("sip");
  const [sipStepUp, setSipStepUp] = useState<number>(0);

  // FD & RD specific
  const [fdFreq, setFdFreq] = useState<"monthly" | "quarterly" | "halfyearly" | "yearly">("quarterly");
  const [rdFreq, setRdFreq] = useState<"monthly" | "quarterly">("quarterly");

  // PPF specific
  const [ppfExtend, setPpfExtend] = useState<"no" | "yes">("no");

  // NSC specific
  const [nscCycles, setNscCycles] = useState<number>(1);
  const [nscStartYear, setNscStartYear] = useState<number>(new Date().getFullYear());
  const [nscInvestMode, setNscInvestMode] = useState<NSCInvestMode>("onetime");
  const [nscMaturityAction, setNscMaturityAction] = useState<NSCMaturityAction>("reinvestAll");
  const [nscYearlyAdditions, setNscYearlyAdditions] = useState<NSCYearlyAddition[]>([]);
  const [nscOneTimeAdditions, setNscOneTimeAdditions] = useState<NSCOneTimeAddition[]>([]);

  // Loan / EMI specific
  const [loanType, setLoanType] = useState<LoanType>("vehicle");
  const [downpayment, setDownpayment] = useState<number>(0);
  const [exchangeVal, setExchangeVal] = useState<number>(0);
  const [procFee, setProcFee] = useState<number>(0);
  const [repayFreq, setRepayFreq] = useState<RepayFrequency>("monthly");
  const [prepayAmt, setPrepayAmt] = useState<number>(0);
  const [prepayMode, setPrepayMode] = useState<PrepayMode>("tenure");
  const [moratorium, setMoratorium] = useState<number>(0);

  // Format INR Helper
  const formatINR = (val: number) => {
    return "₹ " + (Math.round(val) || 0).toLocaleString("en-IN");
  };

  // NSC Dynamic Additions Handlers
  const addYearlyAddition = () => {
    const nextStart = nscStartYear + 1;
    setNscYearlyAdditions((prev) => [
      ...prev,
      {
        id: "ya_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        amt: 50000,
        start: nextStart,
        end: nextStart + 4,
      },
    ]);
  };

  const removeYearlyAddition = (id: string) => {
    setNscYearlyAdditions((prev) => prev.filter((item) => item.id !== id));
  };

  const updateYearlyAddition = (id: string, field: keyof NSCYearlyAddition, val: number) => {
    setNscYearlyAdditions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const addOneTimeAddition = () => {
    const targetYear = nscStartYear + 2;
    setNscOneTimeAdditions((prev) => [
      ...prev,
      {
        id: "ot_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        amt: 50000,
        years: [targetYear],
        yearsStr: targetYear.toString(),
      },
    ]);
  };

  const removeOneTimeAddition = (id: string) => {
    setNscOneTimeAdditions((prev) => prev.filter((item) => item.id !== id));
  };

  const updateOneTimeAdditionYears = (id: string, text: string) => {
    const parsedYears = text
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    setNscOneTimeAdditions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, yearsStr: text, years: parsedYears } : item
      )
    );
  };

  const updateOneTimeAdditionAmt = (id: string, val: number) => {
    setNscOneTimeAdditions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amt: val } : item))
    );
  };

  // Compute Results
  const totalMonths = Math.max(1, tenureYears * 12 + tenureMonths);

  const sipResult = useMemo(() => {
    return calculateSIP({
      monthlySip: amount,
      rate,
      tenureMonths: totalMonths,
      sipType,
      sipStepUp: sipType === "sip" ? sipStepUp : 0,
    });
  }, [amount, rate, totalMonths, sipType, sipStepUp]);

  const fdResult = useMemo(() => {
    return calculateFD(amount, rate, totalMonths, fdFreq);
  }, [amount, rate, totalMonths, fdFreq]);

  const rdResult = useMemo(() => {
    return calculateRD(amount, rate, totalMonths, rdFreq);
  }, [amount, rate, totalMonths, rdFreq]);

  const ppfResult = useMemo(() => {
    return calculatePPF(amount, rate, tenureYears, ppfExtend);
  }, [amount, rate, tenureYears, ppfExtend]);

  const nscResult = useMemo(() => {
    return calculateNSC(
      amount,
      rate,
      nscStartYear,
      nscCycles,
      nscInvestMode,
      nscMaturityAction,
      nscYearlyAdditions,
      nscOneTimeAdditions
    );
  }, [
    amount,
    rate,
    nscStartYear,
    nscCycles,
    nscInvestMode,
    nscMaturityAction,
    nscYearlyAdditions,
    nscOneTimeAdditions,
  ]);

  const loanResult = useMemo(() => {
    return calculateLoan(
      amount,
      rate,
      totalMonths,
      loanType,
      downpayment,
      exchangeVal,
      procFee,
      repayFreq,
      prepayAmt,
      prepayMode,
      moratorium
    );
  }, [
    amount,
    rate,
    totalMonths,
    loanType,
    downpayment,
    exchangeVal,
    procFee,
    repayFreq,
    prepayAmt,
    prepayMode,
    moratorium,
  ]);

  // Unified summary numbers
  const summaryNumbers = useMemo(() => {
    switch (activeTab) {
      case "sip":
        return {
          invested: sipResult.totalInvestment,
          interest: sipResult.totalInterest,
          total: sipResult.maturityValue,
        };
      case "fd":
        return {
          invested: fdResult.totalInvestment,
          interest: fdResult.totalInterest,
          total: fdResult.maturityValue,
        };
      case "rd":
        return {
          invested: rdResult.totalInvestment,
          interest: rdResult.totalInterest,
          total: rdResult.maturityValue,
        };
      case "ppf":
        return {
          invested: ppfResult.totalInvestment,
          interest: ppfResult.totalInterest,
          total: ppfResult.maturityValue,
        };
      case "nsc":
        return {
          invested: nscResult.totalInvestment,
          interest: nscResult.totalInterest,
          total: nscResult.totalReturns,
        };
      case "loan":
        return {
          invested: loanResult.loanAmount,
          interest: loanResult.totalInterest,
          total: loanResult.totalPayment,
          emi: loanResult.emi,
        };
      default:
        return { invested: 0, interest: 0, total: 0 };
    }
  }, [activeTab, sipResult, fdResult, rdResult, ppfResult, nscResult, loanResult]);

  // Donut chart calculations
  const totalVal = Math.max(1, summaryNumbers.invested + summaryNumbers.interest);
  const investPct = Math.min(100, Math.max(0, (summaryNumbers.invested / totalVal) * 100));
  const interestPct = Math.min(100, Math.max(0, (summaryNumbers.interest / totalVal) * 100));

  const circ = 251.32;
  const strokeInvest = (investPct / 100) * circ;
  const strokeInterest = (interestPct / 100) * circ;

  const handleCopySummary = () => {
    let text = "";
    if (activeTab === "nsc") {
      text = `NSC (${nscCycles} Cycle${nscCycles > 1 ? "s" : ""} - ${nscCycles * 5} Years): Invested: ${formatINR(
        nscResult.totalInvestment
      )}, Returns: ${formatINR(nscResult.totalReturns)}, Maturity: ${formatINR(
        nscResult.maturityValue
      )}`;
    } else if (activeTab === "loan") {
      text = `Loan (${loanType.toUpperCase()}): Principal: ${formatINR(
        loanResult.loanAmount
      )}, EMI: ${formatINR(loanResult.emi)}, Interest: ${formatINR(
        loanResult.totalInterest
      )}, Total Payment: ${formatINR(loanResult.totalPayment)}`;
    } else {
      text = `${activeTab.toUpperCase()}: Invested: ${formatINR(
        summaryNumbers.invested
      )}, Interest: ${formatINR(summaryNumbers.interest)}, Maturity Value: ${formatINR(
        summaryNumbers.total
      )}`;
    }

    navigator.clipboard.writeText(text);
    showToast("Financial summary copied to clipboard!");
    addHistory({
      category: "financial",
      title: `${activeTab.toUpperCase()} Calculator`,
      expression: `${formatINR(amount)} @ ${rate}%`,
      result: `Total: ${formatINR(summaryNumbers.total)}`,
    });
  };

  const isAllowed = hasPermission("finCalc") && hasPermission(`fin_${activeTab}`);
  if (!isAllowed) {
    return (
      <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-rose-500/30 bg-slate-900/80 p-8 text-center backdrop-blur-xl animate-fade-in shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl text-rose-400 mb-4 border border-rose-500/30">
          🔒
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Access Restricted by Administrator</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Access to the <strong className="text-amber-300 uppercase">{activeTab}</strong> financial tool has been locked by Administrator for your account tier.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-5xl rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr]">
        {/* LEFT COLUMN: PARAMETERS & ADDITIONAL OPTIONS */}
        <div className="flex flex-col gap-5">
          {/* SIP Type Toggle */}
          {activeTab === "sip" && (
            <div className="flex rounded-full border border-white/10 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setSipType("sip")}
                className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
                  sipType === "sip"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly SIP
              </button>
              <button
                type="button"
                onClick={() => setSipType("lumpsum")}
                className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
                  sipType === "lumpsum"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                One-Time Mutual Fund
              </button>
            </div>
          )}

          {/* Loan Type Selector */}
          {activeTab === "loan" && (
            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-slate-950 p-1.5">
              {(
                [
                  { type: "vehicle", label: "Vehicle Loan", icon: "🚗" },
                  { type: "home", label: "Home Loan", icon: "🏠" },
                  { type: "personal", label: "Personal Loan", icon: "👤" },
                  { type: "education", label: "Education Loan", icon: "🎓" },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setLoanType(item.type)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                    loanType === item.type
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* NSC Mode & Maturity Selectors */}
          {activeTab === "nsc" && (
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              {/* Investment Mode */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
                  Investment Mode
                </label>
                <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1">
                  <button
                    type="button"
                    onClick={() => setNscInvestMode("onetime")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      nscInvestMode === "onetime"
                        ? "bg-amber-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    One-Time Investment
                  </button>
                  <button
                    type="button"
                    onClick={() => setNscInvestMode("everyyear")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      nscInvestMode === "everyyear"
                        ? "bg-amber-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Invest Fresh Every Year
                  </button>
                </div>
              </div>

              {/* At Maturity Action */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
                  At Maturity (End of each 5-Yr Cycle)
                </label>
                <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1">
                  <button
                    type="button"
                    onClick={() => setNscMaturityAction("reinvestAll")}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-all ${
                      nscMaturityAction === "reinvestAll"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Reinvest P + I
                  </button>
                  <button
                    type="button"
                    onClick={() => setNscMaturityAction("renewP")}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-all ${
                      nscMaturityAction === "renewP"
                        ? "bg-cyan-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Renew P, Credit I
                  </button>
                  <button
                    type="button"
                    onClick={() => setNscMaturityAction("withdraw")}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-all ${
                      nscMaturityAction === "withdraw"
                        ? "bg-rose-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Withdraw All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Amount Input */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
              <label htmlFor="fin-main-amount">
                {activeTab === "loan"
                  ? "Total Loan Amount"
                  : activeTab === "fd" || activeTab === "nsc"
                  ? "Investment Principal"
                  : activeTab === "ppf"
                  ? "Yearly Deposit (Max ₹1.5L)"
                  : sipType === "lumpsum"
                  ? "Lumpsum Investment"
                  : "Monthly Investment"}
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1">
                <span className="text-xs text-slate-400">₹</span>
                <input
                  id="fin-main-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 text-right font-mono text-sm font-bold text-emerald-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={activeTab === "loan" ? 10000 : activeTab === "ppf" ? 500 : 500}
              max={
                activeTab === "loan"
                  ? 10000000
                  : activeTab === "ppf"
                  ? 150000
                  : activeTab === "fd" || activeTab === "nsc"
                  ? 5000000
                  : 1000000
              }
              step={activeTab === "loan" ? 10000 : 500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="accent-emerald-500 cursor-pointer w-full mt-2"
            />
          </div>

          {/* Interest Rate Input */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
              <label htmlFor="fin-rate">Expected Return / Interest Rate (p.a)</label>
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1">
                <input
                  id="fin-rate"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="40"
                  value={rate}
                  onChange={(e) => setRate(Math.max(0.1, Number(e.target.value) || 0))}
                  className="w-16 text-right font-mono text-sm font-bold text-cyan-400 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={activeTab === "loan" ? 25 : 30}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="accent-cyan-500 cursor-pointer w-full mt-2"
            />
          </div>

          {/* TENURE INPUTS */}
          {activeTab === "nsc" ? (
            /* NSC 5-Year Fixed Cycle Parameters */
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    NSC 5-Year Fixed Cycles
                  </div>
                  <p className="text-[11px] text-amber-400/90 mt-0.5">
                    NSC has a 5-year fixed maturity period for 1 cycle ({nscCycles * 5} Total Years)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNscCycles(Math.max(1, nscCycles - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-sm font-bold text-slate-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-amber-300 min-w-[20px] text-center">
                    {nscCycles}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNscCycles(nscCycles + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-sm font-bold text-slate-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Start Year Input */}
              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                <label htmlFor="nsc-start-year" className="text-slate-400">
                  Year to Start
                </label>
                <input
                  id="nsc-start-year"
                  type="number"
                  min="2000"
                  max="2050"
                  value={nscStartYear}
                  onChange={(e) => setNscStartYear(Number(e.target.value) || new Date().getFullYear())}
                  className="w-20 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-right font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          ) : activeTab === "ppf" ? (
            /* PPF Duration (Min 15 Years) */
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                <label htmlFor="fin-ppf-tenure">Investment Duration (Min 15 Years)</label>
                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1">
                  <input
                    id="fin-ppf-tenure"
                    type="number"
                    min="15"
                    max="50"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Math.max(15, Number(e.target.value) || 15))}
                    className="w-16 text-right font-mono text-sm font-bold text-violet-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">Yr</span>
                </div>
              </div>
              <input
                type="range"
                min={15}
                max={35}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="accent-violet-500 cursor-pointer w-full mt-2"
              />
            </div>
          ) : (
            /* Dual Input (Years + Months) for SIP, FD, RD, Loan */
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tenure / Time Period
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Years Cell */}
                <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/80 p-2.5">
                  <span className="text-[11px] font-semibold text-slate-400">Years</span>
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      min="0"
                      max={activeTab === "loan" ? 35 : 40}
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-left font-mono text-sm font-bold text-violet-400 bg-transparent focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-semibold">Yrs</span>
                  </div>
                </div>

                {/* Months Cell */}
                <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/80 p-2.5">
                  <span className="text-[11px] font-semibold text-slate-400">Months</span>
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={tenureMonths}
                      onChange={(e) =>
                        setTenureMonths(Math.min(11, Math.max(0, Number(e.target.value) || 0)))
                      }
                      className="w-full text-left font-mono text-sm font-bold text-violet-400 bg-transparent focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-semibold">Mo</span>
                  </div>
                </div>
              </div>

              {/* Slider for Years */}
              <input
                type="range"
                min={0}
                max={activeTab === "loan" ? 30 : 35}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="accent-violet-500 cursor-pointer w-full mt-1"
              />
            </div>
          )}

          {/* ADDITIONAL OPTIONS ACCORDION */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <button
              type="button"
              onClick={() => setShowAdditional(!showAdditional)}
              className="flex w-full items-center justify-between text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>⚙️</span>
                <span>Additional Options & Custom Parameters</span>
              </div>
              <span className="text-sm font-mono">{showAdditional ? "▲" : "▼"}</span>
            </button>

            {showAdditional && (
              <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 animate-fade-in">
                {/* SIP Additional: Annual Step-Up */}
                {activeTab === "sip" && (
                  <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">Annual Step-Up (%)</span>
                      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-0.5">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={sipStepUp}
                          onChange={(e) => setSipStepUp(Math.max(0, Number(e.target.value) || 0))}
                          className="w-12 text-right font-mono text-xs font-bold text-amber-400 bg-transparent focus:outline-none"
                        />
                        <span className="text-xs text-slate-400">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={sipStepUp}
                      onChange={(e) => setSipStepUp(Number(e.target.value))}
                      className="accent-amber-500 cursor-pointer w-full"
                    />
                  </div>
                )}

                {/* FD Additional: Compounding Frequency */}
                {activeTab === "fd" && (
                  <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                    <label className="text-xs font-semibold text-slate-300">
                      Compounding Frequency
                    </label>
                    <select
                      value={fdFreq}
                      onChange={(e: any) => setFdFreq(e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="quarterly">Quarterly (Standard)</option>
                      <option value="monthly">Monthly</option>
                      <option value="halfyearly">Half-Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}

                {/* RD Additional: Compounding Frequency */}
                {activeTab === "rd" && (
                  <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                    <label className="text-xs font-semibold text-slate-300">
                      Compounding Method
                    </label>
                    <select
                      value={rdFreq}
                      onChange={(e: any) => setRdFreq(e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="quarterly">Quarterly (Indian Banking Standard)</option>
                      <option value="monthly">Monthly Compounding</option>
                    </select>
                  </div>
                )}

                {/* PPF Additional: 5-Year Block Extension */}
                {activeTab === "ppf" && (
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-300">Extend by 5-Year Block</div>
                      <p className="text-[11px] text-slate-400">Adds 5 years after minimum 15 years</p>
                    </div>
                    <div className="flex rounded-lg border border-white/10 bg-slate-950 p-0.5">
                      <button
                        type="button"
                        onClick={() => setPpfExtend("no")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md ${
                          ppfExtend === "no" ? "bg-slate-700 text-white" : "text-slate-400"
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setPpfExtend("yes")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md ${
                          ppfExtend === "yes" ? "bg-emerald-600 text-white" : "text-slate-400"
                        }`}
                      >
                        Yes (+5 Yrs)
                      </button>
                    </div>
                  </div>
                )}

                {/* NSC Additional: Dynamic Yearly & One-Time Additions */}
                {activeTab === "nsc" && (
                  <div className="flex flex-col gap-4">
                    {/* Yearly Additions Group */}
                    <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-300">
                          Yearly Investment Additions
                        </span>
                        <button
                          type="button"
                          onClick={addYearlyAddition}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition-all"
                        >
                          + Add More Yearly
                        </button>
                      </div>

                      {nscYearlyAdditions.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No yearly additions configured.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {nscYearlyAdditions.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-2 rounded-lg border border-white/5 bg-slate-950 p-2 text-xs"
                            >
                              <div>
                                <label className="text-[10px] text-slate-400 block">Amount (₹)</label>
                                <input
                                  type="number"
                                  value={item.amt}
                                  onChange={(e) =>
                                    updateYearlyAddition(item.id, "amt", Number(e.target.value) || 0)
                                  }
                                  className="w-full bg-slate-900 px-2 py-1 rounded text-white font-mono focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 block">Start Year</label>
                                <input
                                  type="number"
                                  value={item.start}
                                  onChange={(e) =>
                                    updateYearlyAddition(item.id, "start", Number(e.target.value) || 0)
                                  }
                                  className="w-full bg-slate-900 px-2 py-1 rounded text-white font-mono focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 block">End Year</label>
                                <input
                                  type="number"
                                  value={item.end}
                                  onChange={(e) =>
                                    updateYearlyAddition(item.id, "end", Number(e.target.value) || 0)
                                  }
                                  className="w-full bg-slate-900 px-2 py-1 rounded text-white font-mono focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeYearlyAddition(item.id)}
                                className="mt-3 sm:mt-0 text-rose-400 hover:text-rose-300 font-bold p-1 text-center"
                                title="Remove addition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* One-Time Additions Group */}
                    <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-300">
                          One-Time Investment Additions
                        </span>
                        <button
                          type="button"
                          onClick={addOneTimeAddition}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition-all"
                        >
                          + Add More One-Time
                        </button>
                      </div>

                      {nscOneTimeAdditions.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No one-time additions configured.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {nscOneTimeAdditions.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.5fr_auto] items-center gap-2 rounded-lg border border-white/5 bg-slate-950 p-2 text-xs"
                            >
                              <div>
                                <label className="text-[10px] text-slate-400 block">Years (e.g. 2027, 2030)</label>
                                <input
                                  type="text"
                                  value={item.yearsStr || item.years.join(", ")}
                                  onChange={(e) => updateOneTimeAdditionYears(item.id, e.target.value)}
                                  className="w-full bg-slate-900 px-2 py-1 rounded text-white font-mono focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 block">Amount (₹)</label>
                                <input
                                  type="number"
                                  value={item.amt}
                                  onChange={(e) =>
                                    updateOneTimeAdditionAmt(item.id, Number(e.target.value) || 0)
                                  }
                                  className="w-full bg-slate-900 px-2 py-1 rounded text-white font-mono focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOneTimeAddition(item.id)}
                                className="mt-3 sm:mt-0 text-rose-400 hover:text-rose-300 font-bold p-1 text-center"
                                title="Remove addition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Loan Additional Sub-Sections */}
                {activeTab === "loan" && (
                  <div className="flex flex-col gap-3">
                    {/* Down Payment & Exchange Value (Vehicle / Home) */}
                    {(loanType === "vehicle" || loanType === "home") && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <label className="text-[11px] font-semibold text-slate-300">
                            Down Payment (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={amount}
                            value={downpayment}
                            onChange={(e) => setDownpayment(Math.max(0, Number(e.target.value) || 0))}
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                          />
                        </div>

                        {loanType === "vehicle" && (
                          <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                            <label className="text-[11px] font-semibold text-slate-300">
                              Exchange Vehicle Value (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={amount}
                              value={exchangeVal}
                              onChange={(e) => setExchangeVal(Math.max(0, Number(e.target.value) || 0))}
                              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Education Loan Moratorium Period */}
                    {loanType === "education" && (
                      <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Course Moratorium Grace Period (Months)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="72"
                          value={moratorium}
                          onChange={(e) => setMoratorium(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Processing Fee & Repayment Frequency */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Processing Fee (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={procFee}
                          onChange={(e) => setProcFee(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Repayment Frequency
                        </label>
                        <select
                          value={repayFreq}
                          onChange={(e: any) => setRepayFreq(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="halfyearly">Half-Yearly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>

                    {/* Prepayment & Impact Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Prepayment Lumpsum (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={amount}
                          value={prepayAmt}
                          onChange={(e) => setPrepayAmt(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-slate-900/60 p-3">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Prepayment Impact Mode
                        </label>
                        <select
                          value={prepayMode}
                          onChange={(e: any) => setPrepayMode(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none"
                        >
                          <option value="tenure">Reduce Loan Tenure</option>
                          <option value="emi">Reduce Monthly EMI</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DONUT CHART, BREAKDOWN CARDS & ACTIONS */}
        <div className="flex flex-col items-center justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl">
          {/* Radial Donut Visualization */}
          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-500 transition-all duration-500"
                strokeWidth="12"
                strokeDasharray={`${strokeInvest} ${circ}`}
                strokeDashoffset="0"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-cyan-400 transition-all duration-500"
                strokeWidth="12"
                strokeDasharray={`${strokeInterest} ${circ}`}
                strokeDashoffset={`-${strokeInvest}`}
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {activeTab === "loan" ? "Total Payment" : "Total Returns"}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white">
                {formatINR(summaryNumbers.total)}
              </span>
            </div>
          </div>

          {/* Cards Breakdown */}
          <div className="mt-6 flex w-full flex-col gap-2.5">
            {/* Invested / Principal Card */}
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-300">
                  {activeTab === "loan" ? "Net Loan Principal" : "Total Investment"}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                {formatINR(summaryNumbers.invested)}
              </span>
            </div>

            {/* Interest Card */}
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 p-3.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-400"></span>
                <span className="text-xs font-semibold text-slate-300">
                  {activeTab === "loan" ? "Total Interest Payable" : "Est. Return Gains"}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-cyan-400">
                {formatINR(summaryNumbers.interest)}
              </span>
            </div>

            {/* Loan EMI Card */}
            {activeTab === "loan" && (
              <div className="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3.5">
                <span className="text-xs font-semibold text-indigo-300">
                  Installment ({repayFreq})
                </span>
                <span className="font-mono text-base font-bold text-indigo-300">
                  {formatINR(loanResult.emi)}
                </span>
              </div>
            )}

            {/* Loan Prepayment Savings Display */}
            {activeTab === "loan" && loanResult.prepayInfo && (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs">
                {prepayMode === "tenure" ? (
                  <>
                    <span className="text-emerald-300 font-semibold">Tenure Saved:</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {loanResult.prepayInfo.savedPeriods} periods (New: {loanResult.prepayInfo.newTenure})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-300 font-semibold">New Reduced EMI:</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {formatINR(loanResult.prepayInfo.newEmi || 0)} (Saved: {formatINR(loanResult.prepayInfo.emiSaved || 0)})
                    </span>
                  </>
                )}
              </div>
            )}

            {/* NSC Mode & Action Badges */}
            {activeTab === "nsc" && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block">Mode</span>
                  <span className="font-bold text-amber-300 capitalize text-[11px]">
                    {nscInvestMode === "everyyear" ? "Every Year" : "One-Time"}
                  </span>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block">At Maturity</span>
                  <span className="font-bold text-amber-300 capitalize text-[11px]">
                    {nscMaturityAction === "reinvestAll"
                      ? "Reinvest P+I"
                      : nscMaturityAction === "renewP"
                      ? "Renew P, Credit I"
                      : "Withdraw All"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex w-full gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-95"
            >
              Copy Summary
            </button>
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              {showSchedule ? "Hide Schedule" : "View Schedule"}
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED AMORTIZATION & SCHEDULE TABLE */}
      {showSchedule && (
        <div className="mt-8 border-t border-white/10 pt-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white">
              {activeTab === "nsc"
                ? "NSC Year-by-Year Schedule (5-Year Fixed Period Cycles)"
                : activeTab === "loan"
                ? "Loan Amortization & Repayment Timeline"
                : "Investment Breakdown & Compounding Schedule"}
            </h4>
            <span className="text-xs text-slate-400">
              {activeTab === "nsc"
                ? `${nscResult.schedule.length} Timeline Years`
                : activeTab === "loan"
                ? `${loanResult.schedule.length} Repayment Periods`
                : `${totalMonths} Compounding Months`}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60">
            {activeTab === "nsc" ? (
              /* NSC Custom Year-by-Year Table */
              <table className="w-full text-right text-xs font-mono">
                <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="p-3 text-center">Year</th>
                    <th className="p-3">Fresh Invest</th>
                    <th className="p-3">Reinvested</th>
                    <th className="p-3">Withdrawn / Int.</th>
                    <th className="p-3">Final Maturity</th>
                    <th className="p-3">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {nscResult.schedule.map((row) => {
                    const isMatured = row.matured > 0;
                    return (
                      <tr
                        key={row.year}
                        className={`hover:bg-white/5 ${
                          isMatured ? "bg-emerald-500/10 font-semibold" : ""
                        }`}
                      >
                        <td className="p-3 text-center font-bold text-amber-400">{row.year}</td>
                        <td className="p-3">{row.invested > 0 ? formatINR(row.invested) : "—"}</td>
                        <td className="p-3">{row.reinvested > 0 ? formatINR(row.reinvested) : "—"}</td>
                        <td className="p-3 text-cyan-400">
                          {row.withdrawn > 0 ? formatINR(row.withdrawn) : "—"}
                        </td>
                        <td className="p-3 text-emerald-400 font-bold">
                          {row.matured > 0 ? formatINR(row.matured) : "—"}
                        </td>
                        <td className="p-3 font-bold text-white">{formatINR(row.balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : activeTab === "loan" ? (
              /* Loan Amortization Table */
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Installment</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Interest</th>
                    <th className="p-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {loanResult.schedule.map((row) => (
                    <tr key={row.period} className="hover:bg-white/5">
                      <td className="p-3">{row.period}</td>
                      <td className="p-3 font-semibold text-white">{formatINR(row.installment)}</td>
                      <td className="p-3 text-indigo-300">{formatINR(row.principal)}</td>
                      <td className="p-3 text-rose-400">{formatINR(row.interest)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {formatINR(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Standard SIP / FD / RD / PPF Table */
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="p-3">{activeTab === "ppf" ? "Year" : "Period (Month)"}</th>
                    <th className="p-3">Deposited</th>
                    <th className="p-3">Interest Earned</th>
                    <th className="p-3 text-right">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {(activeTab === "sip"
                    ? sipResult.schedule
                    : activeTab === "fd"
                    ? fdResult.schedule
                    : activeTab === "rd"
                    ? rdResult.schedule
                    : ppfResult.schedule
                  ).map((row) => (
                    <tr key={row.period} className="hover:bg-white/5">
                      <td className="p-3">{row.period}</td>
                      <td className="p-3">{formatINR(row.deposited || 0)}</td>
                      <td className="p-3 text-cyan-400">+{formatINR(row.interestEarned)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {formatINR(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialCalculator;
