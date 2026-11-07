"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const {
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    user,
    setAuthModalOpen,
    setDashboardOpen,
    setAdminDashboardOpen,
    t,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/pdf-merger",
      label: t.pdfToolkit,
      icon: "📄",
      accent: "text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
      href: "/compiler",
      label: t.compiler,
      icon: "💻",
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    {
      href: "/color-viewer",
      label: t.colorViewer,
      icon: "🎨",
      accent: "text-pink-400 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20",
    },
    {
      href: "/qr-connect",
      label: t.qrConnect,
      icon: "📱",
      accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-xl shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            ⚖️
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300">
              Unit Calc
            </div>
            <div className="text-xs font-medium text-slate-400">
              એકમ કેલ્ક્યુલેટર
            </div>
          </div>
        </Link>

        {/* Desktop Nav Tools */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  link.accent
                } ${isActive ? "ring-2 ring-indigo-400 shadow-md" : ""}`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Auth / Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              {(user.role === "superadmin" || user.role === "admin") && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all shadow-sm"
                >
                  <span>👑</span>
                  <span className="hidden sm:inline">Admin Portal</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => setDashboardOpen(true)}
                className="flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all"
              >
                <span>👤</span>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition-all"
              >
                <span>👤</span>
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title="Toggle Language (English / ગુજરાતી)"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 transition-all"
          >
            <span>{language === "en" ? "🇮🇳 ગુજરાતી" : "🌐 English"}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-slate-200 hover:bg-white/10 transition-all"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 md:hidden"
            aria-label="Toggle menu"
          >
            <span className="text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-slate-900/95 px-4 py-4 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-2.5">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200"
            >
              <span>⚖️</span>
              <span>Unit & Financial Calculators</span>
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${link.accent}`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {user?.role === "superadmin" || user?.role === "admin" ? (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-300"
              >
                <span>👑</span>
                <span>Super Admin Portal</span>
              </Link>
            ) : !user ? (
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-center text-xs font-bold text-white shadow-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-center text-xs font-bold text-white"
                >
                  Register
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}