"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  Gavel,
  RefreshCw,
  Info,
  Check,
  ArrowRight,
} from "lucide-react";
import { copyToForecloserList } from "@/src/api/listing/realEstateListing";
import { toast } from "react-toastify";

interface ForecloserCsvUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForecloserCsvUploadModal({
  open,
  onClose,
  onSuccess,
}: ForecloserCsvUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [parsedIds, setParsedIds] = useState<string[]>([]);
  const [duplicateInFileIds, setDuplicateInFileIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [open]);

  // Reset state on close / open
  useEffect(() => {
    if (!open) {
      setFile(null);
      setRawText("");
      setParsedIds([]);
      setDuplicateInFileIds([]);
      setIsProcessing(false);
      setImportResult(null);
    }
  }, [open]);

  // Comprehensive check for column headers (singular, plural, abbreviations, punctuation)
  const isHeaderWord = (word: any): boolean => {
    if (word === null || word === undefined) return false;
    if (typeof word === "number") return false;
    const clean = String(word).toLowerCase().trim().replace(/^["'`]|["'`]$/g, "");
    if (!clean) return false;

    // Normalized without spaces, underscores, dashes, dots, hashes, colons, parentheses
    const normalized = clean.replace(/[\s_\-#.:()]+/g, "");

    const exactHeaders = new Set([
      "mslid", "mslids", "msl",
      "mlsid", "mlsids", "mls", "mlsnumber", "mlsnumbers", "mlsno", "mlsnos", "mlsnum", "mlsnums",
      "listingid", "listingids", "listing", "listings", "listingkey", "listingkeys", "listingnumber", "listingnumbers", "listingno", "listingnos", "listingnum", "listingnums",
      "documentid", "documentids", "docid", "docids",
      "propertyid", "propertyids", "propid", "propids", "property", "properties",
      "id", "ids", "identifier", "identifiers", "header", "headers", "key", "keys", "number", "numbers", "no"
    ]);

    if (exactHeaders.has(normalized)) return true;

    // Regex check for any combinations like "listing ids", "listing id", "mls #", "mls id", "document ids"
    if (
      /^(msl|mls|listing|listings|document|doc|property|prop)([\s_\-#.:()]*(id|ids|key|keys|number|numbers|num|nums|no|nos))?$/i.test(clean) ||
      /^(id|ids|identifier|identifiers)$/i.test(clean)
    ) {
      return true;
    }

    // Also check if text has "listing" / "mls" / "msl" combined with "id" / "key" / "num" / "no"
    if (
      (clean.includes("listing") || clean.includes("mls") || clean.includes("msl")) &&
      (clean.includes("id") || clean.includes("key") || clean.includes("num") || clean.includes("no") || clean.includes("code"))
    ) {
      return true;
    }

    return false;
  };

  // Helper to extract clean listing / MLS IDs from text and detect duplicates
  // Supports files BOTH with and without headings
  const extractListingIdsFromText = (
    text: string,
  ): { uniqueIds: string[]; duplicates: string[]; totalRows: number } => {
    if (!text || typeof text !== "string") {
      return { uniqueIds: [], duplicates: [], totalRows: 0 };
    }

    const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return { uniqueIds: [], duplicates: [], totalRows: 0 };
    }

    const uniqueIds: string[] = [];
    const duplicates: string[] = [];
    const seen = new Set<string>();
    let totalRows = 0;

    // Check if the first line is a header row
    const firstLineTokens = lines[0]
      .split(/[,;\t]+/)
      .map((t) => t.trim().replace(/^["'`]|["'`]$/g, ""));

    let targetColIndex = -1;
    let hasHeaderRow = false;

    if (firstLineTokens.length > 1) {
      for (let c = 0; c < firstLineTokens.length; c++) {
        if (isHeaderWord(firstLineTokens[c])) {
          targetColIndex = c;
          hasHeaderRow = true;
          break;
        }
      }
    } else if (firstLineTokens.length === 1 && isHeaderWord(firstLineTokens[0])) {
      hasHeaderRow = true;
    }

    const startIndex = hasHeaderRow ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const tokens = line.split(/[,;\t]+/);

      let candidateTokens: string[] = [];
      if (targetColIndex >= 0 && targetColIndex < tokens.length) {
        candidateTokens = [tokens[targetColIndex]];
      } else {
        candidateTokens = tokens;
      }

      for (const token of candidateTokens) {
        const clean = token.trim().replace(/^["'`]|["'`]$/g, "");
        if (!clean) continue;
        if (isHeaderWord(clean)) continue; // skip any header keyword

        totalRows++;
        const lower = clean.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          uniqueIds.push(clean);
        } else {
          duplicates.push(clean);
        }
      }
    }

    return { uniqueIds, duplicates, totalRows };
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { uniqueIds, duplicates } = extractListingIdsFromText(content);
      setParsedIds(uniqueIds);
      setDuplicateInFileIds(duplicates);

      if (uniqueIds.length === 0) {
        toast.warn("No valid listing IDs found in the selected file.");
      }
    };
    reader.readAsText(selectedFile);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle Raw Text Change
  const handleTextChange = (val: string) => {
    setRawText(val);
    setImportResult(null);
    const { uniqueIds, duplicates } = extractListingIdsFromText(val);
    setParsedIds(uniqueIds);
    setDuplicateInFileIds(duplicates);
  };

  // Submit copy to foreclosure
  const handleSubmit = async () => {
    if (parsedIds.length === 0) {
      toast.error("Please provide at least one listing or MLS ID.");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await copyToForecloserList(parsedIds);
      setImportResult(res);

      if (res?.summary) {
        const { copied, alreadyExists, notFound, failed } = res.summary;
        if (copied > 0) {
          toast.success(
            `Successfully copied ${copied} ${
              copied === 1 ? "property" : "properties"
            } to foreclosure list!`,
          );
        } else if (alreadyExists > 0 && notFound === 0 && failed === 0) {
          toast.info(
            `All ${alreadyExists} properties are already in the foreclosure list.`,
          );
        } else if (notFound > 0) {
          toast.warn(
            `${notFound} properties were not found in the Real Estate Board and were skipped.`,
          );
        }
      } else {
        toast.success("Properties processed successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(
        error.message || "Failed to copy properties to foreclosure list",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  const totalDuplicatesSkipped =
    importResult?.summary?.duplicatesSkipped ?? duplicateInFileIds.length;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[88vh] overscroll-contain select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-xs">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Import Properties to Foreclosure
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Match by MLS / Listing ID from Real Estate Board
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto overscroll-contain no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Mode Switcher Tabs */}
          {!importResult && (
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload");
                  if (file) processFile(file);
                  else {
                    setParsedIds([]);
                    setDuplicateInFileIds([]);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UploadCloud className="w-4 h-4 text-amber-600" />
                <span>Upload CSV File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("paste");
                  if (rawText) handleTextChange(rawText);
                  else {
                    setParsedIds([]);
                    setDuplicateInFileIds([]);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "paste"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Paste MLS / Listing IDs</span>
              </button>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD ZONE */}
          {!importResult && activeTab === "upload" && (
            <div className="space-y-3">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-amber-500/80 bg-slate-50/60 hover:bg-amber-50/30 rounded-3xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {file ? file.name : "Click to upload or drag & drop CSV"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB • CSV loaded`
                      : "Supports CSV or TXT with header 'msl id', 'mls id', or 'listing_id'"}
                  </p>
                </div>

                {file && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {parsedIds.length} unique {parsedIds.length === 1 ? "ID" : "IDs"} found
                    </span>
                    {duplicateInFileIds.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                        {duplicateInFileIds.length} duplicate {duplicateInFileIds.length === 1 ? "row" : "rows"} in file skipped
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Format details:
                </p>
                <p>
                  Column header can be named <code>msl id</code>, <code>mls id</code>, <code>listing_id</code>, or <code>listing id</code>. Duplicate IDs in the file, already existing foreclosures, and unmatched IDs will be automatically skipped.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TEXT ZONE */}
          {!importResult && activeTab === "paste" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Paste Listing IDs or MLS numbers:
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={`msl id\n1051149\n1051055\n20248\n1051152\nR3170903`}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-y"
                />
              </div>

              {parsedIds.length > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-600 bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-900">
                      Detected <strong>{parsedIds.length}</strong> unique IDs
                    </span>
                    {duplicateInFileIds.length > 0 && (
                      <span className="text-slate-500 font-medium text-[11px]">
                        ({duplicateInFileIds.length} duplicate {duplicateInFileIds.length === 1 ? "entry" : "entries"} skipped)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTextChange("")}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PREVIEW OF PARSED IDS (BEFORE SUBMITTING) */}
          {!importResult && parsedIds.length > 0 && (
            <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Ready to Copy ({parsedIds.length} unique properties)
                </span>
                <span className="text-[11px] text-slate-400">
                  Preview (first 10)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {parsedIds.slice(0, 10).map((id, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                  >
                    {id}
                  </span>
                ))}
                {parsedIds.length > 10 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/80 text-slate-600">
                    +{parsedIds.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* RESULT BREAKDOWN VIEW (AFTER SUBMISSION) */}
          {importResult && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Summary Stats Grid */}
              <div
                className={`grid gap-2.5 ${
                  totalDuplicatesSkipped > 0
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}
              >
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Copied
                  </span>
                  <span className="text-xl font-black text-emerald-700">
                    {importResult.summary?.copied ?? 0}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Already in Foreclosure
                  </span>
                  <span className="text-xl font-black text-amber-700">
                    {importResult.summary?.alreadyExists ?? 0}
                  </span>
                </div>

                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Not Found (Skipped)
                  </span>
                  <span className="text-xl font-black text-slate-700">
                    {importResult.summary?.notFound ?? 0}
                  </span>
                </div>

                {totalDuplicatesSkipped > 0 ? (
                  <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-center">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                      Duplicates in File
                    </span>
                    <span className="text-xl font-black text-sky-700">
                      {totalDuplicatesSkipped}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                      Failed
                    </span>
                    <span className="text-xl font-black text-rose-700">
                      {importResult.summary?.failed ?? 0}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-slate-800">
                  {importResult.message || "Import process completed."}
                </p>
              </div>

              {/* Breakdown Details List */}
              <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 max-h-56 overflow-y-auto">
                <p className="text-xs font-bold text-slate-700 mb-1">
                  Item Details Breakdown:
                </p>

                {/* Copied Items */}
                {Array.isArray(importResult.data) &&
                  importResult.data.map((item: any, idx: number) => (
                    <div
                      key={`copied-${idx}`}
                      className="p-2 bg-white rounded-xl border border-emerald-100 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="truncate min-w-0">
                        <span className="font-mono font-bold text-slate-900">
                          {item.identifier || item.copiedFromListingId || item.listing_id}
                        </span>
                        {item.address && (
                          <span className="text-slate-500 ml-2 truncate">
                            • {item.address} {item.city ? `(${item.city})` : ""}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Copied
                      </span>
                    </div>
                  ))}

                {/* Already Exists */}
                {Array.isArray(importResult.alreadyExists) &&
                  importResult.alreadyExists.map((item: any, idx: number) => (
                    <div
                      key={`exists-${idx}`}
                      className="p-2 bg-white rounded-xl border border-amber-100 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="truncate min-w-0">
                        <span className="font-mono font-bold text-slate-900">
                          {item.identifier || item.listing_id}
                        </span>
                        {item.address && (
                          <span className="text-slate-500 ml-2 truncate">
                            • {item.address} {item.city ? `(${item.city})` : ""}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-100 text-amber-800 shrink-0">
                        Already in Foreclosure
                      </span>
                    </div>
                  ))}

                {/* Not Found / Skipped */}
                {Array.isArray(importResult.notFound) &&
                  importResult.notFound.map((item: any, idx: number) => (
                    <div
                      key={`notfound-${idx}`}
                      className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs gap-2"
                    >
                      <span className="font-mono font-bold text-slate-700 truncate">
                        {item.identifier}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 text-slate-600 shrink-0">
                        Skipped (Not Found)
                      </span>
                    </div>
                  ))}

                {/* Duplicates in file skipped */}
                {(Array.isArray(importResult.duplicatesSkipped)
                  ? importResult.duplicatesSkipped
                  : duplicateInFileIds
                ).map((dupId: string, idx: number) => (
                  <div
                    key={`dup-${idx}`}
                    className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs gap-2"
                  >
                    <span className="font-mono font-bold text-slate-600 truncate">
                      {dupId}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-700 shrink-0">
                      Skipped (Duplicate in File)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-t border-gray-100 shrink-0">
          <div>
            {!importResult && parsedIds.length > 0 && (
              <span className="text-xs text-slate-500">
                <strong>{parsedIds.length}</strong> unique {parsedIds.length === 1 ? "ID" : "IDs"} ready
                {duplicateInFileIds.length > 0 && (
                  <span className="text-slate-400 ml-1">
                    ({duplicateInFileIds.length} duplicate skipped)
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!importResult ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing || parsedIds.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Copying to Foreclosure...</span>
                    </>
                  ) : (
                    <>
                      <Gavel className="w-3.5 h-3.5" />
                      <span>
                        Copy {parsedIds.length > 0 ? `(${parsedIds.length})` : ""} to Foreclosure
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Done</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
