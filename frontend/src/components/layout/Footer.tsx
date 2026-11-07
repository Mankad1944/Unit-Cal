"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export function Footer() {
  const { language } = useApp();

  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/60 py-10 text-center text-xs text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span>Made with ❤️ for Gujarat & the World</span>
          <span>&middot;</span>
          <span className="font-semibold text-slate-200">
            {language === "gu" ? "એકમ કેલ્ક્યુલેટર" : "Unit Calculator"}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <Link href="/pdf-merger" className="hover:text-purple-400 transition-colors">
            PDF Toolkit
          </Link>
          <Link href="/compiler" className="hover:text-emerald-400 transition-colors">
            Compiler
          </Link>
          <Link href="/color-viewer" className="hover:text-pink-400 transition-colors">
            Color Viewer
          </Link>
          <Link href="/qr-connect" className="hover:text-cyan-400 transition-colors">
            QR Connect
          </Link>
          <Link href="/admin" className="hover:text-amber-400 font-semibold transition-colors">
            🔒 Super Admin
          </Link>
        </div>

        <div>&copy; 2026 Unit Calc MERN. All rights reserved.</div>
      </div>
    </footer>
  );
}