"use client";

import React, { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { useApp } from "@/context/AppContext";

interface PdfItem {
  id: string;
  name: string;
  size: number;
  file: File;
  pageCount?: number;
}

declare global {
  interface Window {
    PDFLib?: any;
  }
}

export default function PdfToolkitPage() {
  const { showToast, hasPermission } = useApp();
  const [activeTab, setActiveTab] = useState<"merge" | "split">("merge");

  const canMerge = hasPermission("pdf_merge");
  const canSplit = hasPermission("pdf_split");
  const [files, setFiles] = useState<PdfItem[]>([]);
  const [splitFile, setSplitFile] = useState<PdfItem | null>(null);
  const [splitRange, setSplitRange] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfLibReady, setPdfLibReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.PDFLib) {
      setPdfLibReady(true);
    }
  }, []);

  const handleFilesAdded = async (fileList: FileList | null) => {
    if (!fileList) return;
    const newItems: PdfItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          file,
        });
      }
    }

    if (newItems.length === 0) {
      showToast("Please upload valid PDF files.");
      return;
    }

    setFiles((prev) => [...prev, ...newItems]);
    showToast(`Added ${newItems.length} PDF file(s)`);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFiles(updated);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      showToast("Please select at least 2 PDF files to merge.");
      return;
    }

    if (!window.PDFLib) {
      showToast("PDF engine is initializing, please wait a moment...");
      return;
    }

    setProcessing(true);
    setProgress(10);

    try {
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const arrayBuffer = await files[i].file.arrayBuffer();
        const donorPdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          donorPdf,
          donorPdf.getPageIndices()
        );
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
        setProgress(Math.round(((i + 1) / files.length) * 80) + 10);
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setProgress(100);
      showToast("PDFs merged and downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to merge PDFs: " + err.message);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const splitPdf = async () => {
    if (!splitFile) {
      showToast("Please choose a PDF to split.");
      return;
    }

    if (!window.PDFLib) {
      showToast("PDF engine is initializing, please wait a moment...");
      return;
    }

    setProcessing(true);
    setProgress(30);

    try {
      const { PDFDocument } = window.PDFLib;
      const arrayBuffer = await splitFile.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = srcDoc.getPageCount();

      // parse ranges, e.g. "1, 2-3"
      const ranges = splitRange.split(",").map((s) => s.trim());
      const pageIndicesToKeep: number[] = [];

      for (const r of ranges) {
        if (r.includes("-")) {
          const [start, end] = r.split("-").map((v) => parseInt(v.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
              pageIndicesToKeep.push(p - 1);
            }
          }
        } else {
          const p = parseInt(r);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            pageIndicesToKeep.push(p - 1);
          }
        }
      }

      const uniqueIndices = Array.from(new Set(pageIndicesToKeep)).sort((a, b) => a - b);

      if (uniqueIndices.length === 0) {
        throw new Error(`Invalid page range. This PDF has ${totalPages} pages.`);
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcDoc, uniqueIndices);
      copiedPages.forEach((page: any) => newPdf.addPage(page));

      setProgress(80);
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `extracted_pages_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setProgress(100);
      showToast(`Extracted ${uniqueIndices.length} page(s) successfully!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to split PDF");
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <Script
        src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"
        onLoad={() => setPdfLibReady(true)}
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
            <span>📄</span> In-Browser PDF Processing
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            PDF Toolkit & Merger
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Combine multiple PDF files or extract specific pages entirely on your device with zero upload to cloud.
          </p>
        </div>

        {/* Tab switch */}
        <div className="mx-auto mb-8 flex max-w-xs rounded-full border border-white/10 bg-slate-900/80 p-1 backdrop-blur-md">
          <button
            onClick={() => {
              if (!canMerge) {
                showToast("Merge PDFs sub-section is currently restricted by administrator.");
              }
              setActiveTab("merge");
            }}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeTab === "merge"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Merge PDFs</span>
            {!canMerge && <span className="text-[10px] text-rose-400">🔒</span>}
          </button>
          <button
            onClick={() => {
              if (!canSplit) {
                showToast("Split / Extract PDF sub-section is currently restricted by administrator.");
              }
              setActiveTab("split");
            }}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeTab === "split"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Split / Extract</span>
            {!canSplit && <span className="text-[10px] text-rose-400">🔒</span>}
          </button>
        </div>

        {/* Merge Tab */}
        {activeTab === "merge" && (
          !canMerge ? (
            <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-10 text-center backdrop-blur-xl">
              <span className="text-4xl block mb-3">🔒</span>
              <h3 className="text-base font-bold text-white">Merge PDFs Sub-section Restricted</h3>
              <p className="mt-1 text-xs text-slate-400">
                The Merge PDFs utility is currently restricted for your access tier by the system administrator.
              </p>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesAdded(e.dataTransfer.files);
              }}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-purple-500/30 bg-slate-900/40 p-8 text-center transition-all hover:border-purple-500 hover:bg-purple-500/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl text-purple-400">
                📄
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                Drop your PDF files here, or <span className="text-purple-400 underline">browse</span>
              </h3>
              <p className="mt-1 text-xs text-slate-400">Supports multiple PDF files</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Files to Merge ({files.length})
                  </h3>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/40 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-300">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white line-clamp-1">
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-400">{formatSize(file.size)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveFile(idx, "up")}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-20"
                        >
                          ↑
                        </button>
                        <button
                          disabled={idx === files.length - 1}
                          onClick={() => moveFile(idx, "down")}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-20"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merge Action */}
                <div className="mt-6">
                  {processing && (
                    <div className="mb-4 space-y-1">
                      <div className="flex justify-between text-xs text-purple-300">
                        <span>Merging files...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={mergePdfs}
                    disabled={processing || files.length < 2 || !pdfLibReady}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-95 disabled:opacity-40"
                  >
                    {processing
                      ? "Processing PDFs..."
                      : !pdfLibReady
                      ? "Loading PDF Engine..."
                      : `Merge & Download (${files.length} PDFs)`}
                  </button>
                </div>
              </div>
            )}
          </div>
          )
        )}

        {/* Split Tab */}
        {activeTab === "split" && (
          !canSplit ? (
            <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-10 text-center backdrop-blur-xl">
              <span className="text-4xl block mb-3">🔒</span>
              <h3 className="text-base font-bold text-white">Split / Extract PDF Sub-section Restricted</h3>
              <p className="mt-1 text-xs text-slate-400">
                The Split and Extract PDF utility is currently restricted for your access tier by the system administrator.
              </p>
            </div>
          ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
            {!splitFile ? (
              <div
                onClick={() => splitInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-purple-500/30 bg-slate-900/40 p-8 text-center transition-all hover:border-purple-500 hover:bg-purple-500/5"
              >
                <input
                  ref={splitInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSplitFile({
                        id: "split-1",
                        name: f.name,
                        size: f.size,
                        file: f,
                      });
                    }
                  }}
                />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl text-purple-400">
                  ✂️
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  Choose a PDF to Split or Extract Pages
                </h3>
                <p className="mt-1 text-xs text-slate-400">Upload one PDF file</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/40 p-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{splitFile.name}</div>
                    <div className="text-xs text-slate-400">{formatSize(splitFile.size)}</div>
                  </div>
                  <button
                    onClick={() => setSplitFile(null)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Change File
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">
                    Page Numbers to Extract (e.g., 1, 2-4, 7)
                  </label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="1, 3-5"
                    className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={splitPdf}
                  disabled={processing || !pdfLibReady}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-95 disabled:opacity-40"
                >
                  {processing ? "Extracting..." : "Extract Pages & Download"}
                </button>
              </div>
            )}
          </div>
          )
        )}
      </div>
    </>
  );
}
