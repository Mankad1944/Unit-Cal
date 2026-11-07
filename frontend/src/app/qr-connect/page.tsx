"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

type QrType = "url" | "upi" | "vcard" | "email" | "whatsapp";

export default function QrConnectPage() {
  const { showToast, hasPermission } = useApp();
  const [qrType, setQrType] = useState<QrType>("url");

  const permMap: Record<QrType, string> = {
    url: "qr_website",
    upi: "qr_upi",
    vcard: "qr_contact",
    email: "qr_email",
    whatsapp: "qr_whatsapp",
  };

  const isCurrentAllowed = hasPermission(permMap[qrType]);

  // Form states
  const [urlVal, setUrlVal] = useState("https://unitcalc.io");
  
  // UPI
  const [upiVpa, setUpiVpa] = useState("");
  const [upiName, setUpiName] = useState("");
  const [upiAmount, setUpiAmount] = useState("");

  // Contact (vCard)
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");

  // Email
  const [emailTo, setEmailTo] = useState("");
  const [emailSub, setEmailSub] = useState("");

  // WhatsApp
  const [waPhone, setWaPhone] = useState("");
  const [waMsg, setWaMsg] = useState("");

  // Styling states
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(256);

  // Compute payload exactly as in vanilla
  const getQrPayload = () => {
    switch (qrType) {
      case "upi": {
        const vpa = upiVpa.trim();
        const name = encodeURIComponent(upiName.trim() || "Payee");
        const amt = upiAmount.trim();
        let uri = `upi://pay?pa=${vpa}&pn=${name}&cu=INR`;
        if (amt) uri += `&am=${amt}`;
        return uri;
      }
      case "vcard": {
        const name = vcardName.trim() || "John Doe";
        const phone = vcardPhone.trim();
        const email = vcardEmail.trim();
        return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
      }
      case "email": {
        const to = emailTo.trim();
        const sub = encodeURIComponent(emailSub.trim());
        return `mailto:${to}?subject=${sub}`;
      }
      case "whatsapp": {
        const phone = waPhone.trim().replace(/[^0-9]/g, "");
        const msg = encodeURIComponent(waMsg.trim());
        return `https://wa.me/${phone}?text=${msg}`;
      }
      case "url":
      default:
        return urlVal.trim() || "https://unitcalc.io";
    }
  };

  const payload = getQrPayload();
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(
    payload
  )}&color=${fgColor.replace("#", "")}&bgcolor=${bgColor.replace("#", "")}&margin=10`;

  const downloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode_${qrType}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("QR code downloaded successfully!");
    } catch {
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
          <span>📱</span> QR Hub & Generator
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          QR Connect & Code Creator
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Generate custom styled QR codes for URLs, UPI payments, Contact Cards (vCard), Email, and WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Controls Column */}
        <div className="md:col-span-7 space-y-5 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
          {/* QR Type Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block">Choose QR Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { key: "url", label: "Website", icon: "🌐", permKey: "qr_website" },
                { key: "upi", label: "UPI Pay", icon: "💸", permKey: "qr_upi" },
                { key: "vcard", label: "Contact", icon: "📇", permKey: "qr_contact" },
                { key: "email", label: "Email", icon: "✉️", permKey: "qr_email" },
                { key: "whatsapp", label: "WhatsApp", icon: "💬", permKey: "qr_whatsapp" },
              ].map((item) => {
                const isCatAllowed = hasPermission(item.permKey);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (!isCatAllowed) {
                        showToast(`${item.label} QR sub-section is currently restricted by administrator.`);
                      }
                      setQrType(item.key as QrType);
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-medium transition-all ${
                      !isCatAllowed
                        ? "opacity-60 border-rose-500/20 bg-rose-500/5 text-slate-400"
                        : qrType === item.key
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-200 shadow-md ring-1 ring-cyan-500/40"
                        : "border-white/5 bg-slate-800/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {!isCatAllowed && (
                      <span className="absolute top-1 right-1 text-[10px] text-rose-400">🔒</span>
                    )}
                    <span className="text-base mb-1">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!isCurrentAllowed && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
              <span className="text-3xl block mb-2">🔒</span>
              <h4 className="text-sm font-bold text-white">QR Sub-section Restricted</h4>
              <p className="mt-1 text-xs text-rose-300">
                This QR generator category is currently restricted by the administrator.
              </p>
            </div>
          )}

          {/* Form: URL */}
          {qrType === "url" && (
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Target Website URL</label>
              <input
                type="url"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          {/* Form: UPI */}
          {qrType === "upi" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">UPI ID (VPA)</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="merchant@okaxis"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 block">Payee Name</label>
                  <input
                    type="text"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    placeholder="Merchant Name"
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form: Contact Card (vCard) */}
          {qrType === "vcard" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Form: Email */}
          {qrType === "email" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Recipient Email</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Email Subject</label>
                <input
                  type="text"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="Inquiry about..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Form: WhatsApp */}
          {qrType === "whatsapp" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">
                  WhatsApp Number (with Country Code)
                </label>
                <input
                  type="tel"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="919876543210"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Pre-filled Message</label>
                <textarea
                  rows={2}
                  value={waMsg}
                  onChange={(e) => setWaMsg(e.target.value)}
                  placeholder="Hello, I would like to get more information..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Color styling */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Foreground Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded-lg bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded-lg bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Preview & Download Column */}
        <div className="md:col-span-5 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl">
          <div className="rounded-2xl border border-white/10 bg-white p-4 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt="Generated QR Code"
              width={220}
              height={220}
              className="rounded-lg object-contain"
            />
          </div>

          <p className="mt-4 text-xs font-mono text-slate-400 text-center max-w-[240px] truncate">
            {payload}
          </p>

          <button
            type="button"
            onClick={downloadQr}
            disabled={!isCurrentAllowed}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>📥</span> Download QR Code (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}
