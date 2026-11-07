"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export function UserDashboard() {
  const { user, dashboardOpen, setDashboardOpen, history, clearHistory, logout, showToast, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState<"history" | "privileges">("history");
  const [filter, setFilter] = useState("all");

  if (!dashboardOpen || !user) return null;

  const filteredHistory = filter === "all" ? history : history.filter((h) => h.category === filter);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const toolCategories = [
    {
      group: "🛠️ Top-Level Tools",
      items: [
        { key: "unitCalc", label: "Unit Calc Suite (Master)", icon: "📐" },
        { key: "pdfToolkit", label: "PDF Toolkit & Merger", icon: "📄", isCore: true },
        { key: "compiler", label: "Online Code Compiler", icon: "💻", isCore: true },
        { key: "colorViewer", label: "Color Studio & Viewer", icon: "🎨", isCore: true },
        { key: "qrConnect", label: "QR Connect Hub", icon: "📱", isCore: true },
        { key: "history", label: "Cloud History Sync", icon: "☁️" },
      ],
    },
    {
      group: "📑 Functional Sections",
      items: [
        { key: "sec_unit", label: "Unit Calculator Section", icon: "⚖️" },
        { key: "sec_fin", label: "Financial Calculator Section", icon: "💰" },
        { key: "sec_basic", label: "Basic Calculator Section", icon: "🔢" },
      ],
    },
    {
      group: "📏 Unit Converter Sub-sections",
      items: [
        { key: "unit_length", label: "Length Units", icon: "📏" },
        { key: "unit_height", label: "Height Comparison", icon: "🧍" },
        { key: "unit_area", label: "Area & Gujarati Land", icon: "🔲" },
        { key: "unit_weight", label: "Weight & Mass", icon: "⚖️" },
        { key: "unit_volume", label: "Volume & Liquid", icon: "🧪" },
        { key: "unit_wv", label: "Weight ⟷ Volume", icon: "⚖️🧪" },
        { key: "unit_temperature", label: "Temperature", icon: "🌡️" },
        { key: "unit_speed", label: "Speed & Velocity", icon: "💨" },
        { key: "unit_time", label: "Time Periods", icon: "⏱️" },
        { key: "unit_digital", label: "Digital Storage", icon: "💾" },
      ],
    },
    {
      group: "📈 Financial Calculator Sub-sections",
      items: [
        { key: "fin_sip", label: "SIP / Mutual Fund", icon: "📈" },
        { key: "fin_fd", label: "Fixed Deposit (FD)", icon: "🏦" },
        { key: "fin_rd", label: "Recurring Deposit (RD)", icon: "🔁" },
        { key: "fin_ppf", label: "Public Provident Fund", icon: "🛡️" },
        { key: "fin_nsc", label: "NSC 5-Year Cycles", icon: "📜" },
        { key: "fin_loan", label: "Loan / EMI Amortization", icon: "📉" },
      ],
    },
    {
      group: "📄 PDF Toolkit Sub-sections",
      items: [
        { key: "pdf_merge", label: "Merge PDFs Utility", icon: "📑" },
        { key: "pdf_split", label: "Split / Extract PDF Utility", icon: "✂️" },
      ],
    },
    {
      group: "📱 QR Connect Hub Sub-sections",
      items: [
        { key: "qr_website", label: "Website URL QR", icon: "🌐" },
        { key: "qr_upi", label: "UPI Payment QR", icon: "💸" },
        { key: "qr_contact", label: "Contact Card (vCard) QR", icon: "📇" },
        { key: "qr_email", label: "Email Direct QR", icon: "✉️" },
        { key: "qr_whatsapp", label: "WhatsApp Direct QR", icon: "💬" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-xl font-bold text-white shadow-lg">
              {(user.name || "User").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user.name || "User Profile"}</h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
                  {user.role || "user"}
                </span>
                {user.role === "superadmin" || user.role === "admin" ? (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    👑 Full Admin Privileges
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400">{user.email || ""}</p>
            </div>
          </div>
          <button
            onClick={() => setDashboardOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="my-4 flex gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📋 Calculation History ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privileges")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "privileges"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🛡️ My Tool Access & Privileges
          </button>
        </div>

        {activeTab === "history" ? (
          <>
            {/* History Filter Bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-400">Filter History</span>
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="unit">Units</option>
                  <option value="financial">Financial</option>
                  <option value="basic">Basic Calculator</option>
                </select>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <span className="text-3xl mb-2">📋</span>
                  <p className="text-sm">No calculations recorded yet</p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id || item._id || Math.random()}
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/40 p-3 hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300">{item.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.timestamp || item.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {item.expression && (
                        <div className="text-xs text-slate-400 font-mono">{item.expression}</div>
                      )}
                      <div className="text-sm font-bold text-indigo-400 font-mono">{item.result}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.result)}
                      className="rounded-lg border border-white/10 bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-300 opacity-80 group-hover:opacity-100 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Privileges & Access Rights Sub-View */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 animate-fade-in">
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
              {user.role === "superadmin" || user.role === "admin" ? (
                <p className="text-amber-300 font-semibold">
                  👑 As an Administrator, your account has complete, unrestricted access to all tools, sections, and sub-sections.
                </p>
              ) : (
                <p>
                  Access rights assigned to your account tier. Administrators control access and blockage for individual tools and sub-sections.
                </p>
              )}
            </div>

            {toolCategories.map((cat) => (
              <div key={cat.group} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{cat.group}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.items.map((tool) => {
                    const isGranted = hasPermission(tool.key);
                    return (
                      <div
                        key={tool.key}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                          isGranted
                            ? "border-emerald-500/20 bg-slate-950/60"
                            : "border-rose-500/20 bg-rose-500/5 opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{tool.icon}</span>
                          <span className="font-semibold text-white">{tool.label}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            (tool as any).isCore
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : isGranted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {(tool as any).isCore ? "🔒 Core Tool" : isGranted ? "Granted" : "Blocked"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={logout}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            Log Out
          </button>
          <button
            onClick={() => setDashboardOpen(false)}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
