"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  RotateCcw,
  RotateCw,
  Code,
  Eye,
  RemoveFormatting,
  ChevronDown,
  Check,
} from "lucide-react";
import { decodeHtmlEntities } from "@/src/api/blogs/blogsApi";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FORMAT_OPTIONS = [
  { value: "p", label: "Paragraph", desc: "Normal text" },
  { value: "h2", label: "Heading 2 (H2)", desc: "Main section" },
  { value: "h3", label: "Heading 3 (H3)", desc: "Subsection" },
  { value: "h4", label: "Heading 4 (H4)", desc: "Minor header" },
  { value: "blockquote", label: "Quote", desc: "Blockquote callout" },
  { value: "pre", label: "Code Block", desc: "Monospaced code" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your blog content here...",
  minHeight = "280px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentFormat, setCurrentFormat] = useState("p");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize and sync content with external value
  useEffect(() => {
    const decoded = decodeHtmlEntities(value || "");
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== decoded) {
        editorRef.current.innerHTML = decoded;
      }
    }
    setHtmlSource(decoded);
    updateCounts(decoded);
  }, [value, isSourceMode]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const updateCounts = (textOrHtml: string) => {
    // Strip tags to count real text
    const text = textOrHtml ? textOrHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
    setCharCount(text.length);
    setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setHtmlSource(html);
      updateCounts(html);
    }
  }, [onChange]);

  const exec = (command: string, val: string | undefined = undefined) => {
    if (isSourceMode) return;
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleSelectFormat = (tag: string) => {
    if (isSourceMode) return;
    if (tag === "p") {
      exec("formatBlock", "<p>");
    } else {
      exec("formatBlock", `<${tag}>`);
    }
    setCurrentFormat(tag);
    setIsDropdownOpen(false);
  };

  const handleAddLink = () => {
    if (isSourceMode) return;
    const url = prompt("Enter the link URL (https://...):");
    if (url) {
      exec("createLink", url);
    }
  };

  const handleAddImage = () => {
    if (isSourceMode) return;
    const url = prompt("Enter Image URL (https://...):");
    if (url) {
      exec("insertImage", url);
    }
  };

  const handleToggleSource = () => {
    if (isSourceMode) {
      // Switching from Code to Visual
      const decoded = decodeHtmlEntities(htmlSource);
      if (editorRef.current) {
        editorRef.current.innerHTML = decoded;
      }
      setHtmlSource(decoded);
      onChange(decoded);
      setIsSourceMode(false);
    } else {
      // Switching from Visual to Code
      if (editorRef.current) {
        setHtmlSource(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlSource(val);
    onChange(val);
    updateCounts(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  };

  const activeOption = FORMAT_OPTIONS.find((o) => o.value === currentFormat) || FORMAT_OPTIONS[0];

  return (
    <div className="w-full rounded-2xl bg-white border border-zinc-200/90 overflow-hidden shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-50/90 border-b border-zinc-200/80 text-zinc-600 select-none">
        {/* Left Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Custom Styled Block Format Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSourceMode}
              className={`px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100/80 border ${
                isDropdownOpen
                  ? "border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-700 font-bold"
                  : "border-zinc-200/90 text-zinc-800 font-semibold shadow-2xs"
              } text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span>{activeOption.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-emerald-600" : ""
                }`}
              />
            </button>

            {/* Custom Green/White Dropdown Popover */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 z-50 w-56 rounded-2xl bg-white border border-zinc-200 p-1.5 shadow-xl shadow-zinc-900/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {FORMAT_OPTIONS.map((opt) => {
                  const isSelected = opt.value === currentFormat;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectFormat(opt.value)}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#199250] text-white font-bold shadow-xs"
                          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{opt.label}</div>
                        <div className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-zinc-400"}`}>
                          {opt.desc}
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-zinc-200 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => exec("bold")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("italic")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("underline")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("strikeThrough")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-zinc-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => exec("insertUnorderedList")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertOrderedList")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("formatBlock", "<blockquote>")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Quote Block"
          >
            <Quote className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-zinc-200 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => exec("justifyLeft")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("justifyCenter")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("justifyRight")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-zinc-200 mx-1" />

          {/* Media & Inserts */}
          <button
            type="button"
            onClick={handleAddLink}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleAddImage}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Insert Image by URL"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("insertHorizontalRule")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Horizontal Divider"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("removeFormat")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-zinc-200 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => exec("undo")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => exec("redo")}
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Visual vs HTML Mode Switcher */}
        <div className="flex items-center bg-zinc-200/70 p-0.5 rounded-xl border border-zinc-200">
          <button
            type="button"
            onClick={() => {
              if (isSourceMode) handleToggleSource();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              !isSourceMode
                ? "bg-[#199250] text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            title="Switch to Visual WYSIWYG Mode"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isSourceMode) handleToggleSource();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSourceMode
                ? "bg-[#199250] text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            title="Switch to HTML Source Code Mode"
          >
            <Code className="h-3.5 w-3.5" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isSourceMode ? (
        <textarea
          value={htmlSource}
          onChange={handleSourceChange}
          placeholder="Edit raw HTML source code here..."
          className="w-full p-5 bg-white text-zinc-800 font-mono text-xs sm:text-sm focus:outline-none resize-y leading-relaxed selection:bg-emerald-100 selection:text-emerald-900 placeholder:text-zinc-400"
          style={{ minHeight }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          className="p-5 bg-white text-zinc-900 text-sm focus:outline-none overflow-y-auto leading-relaxed max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-zinc-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-zinc-900 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:text-zinc-800 [&_p]:mb-3 [&_p]:text-zinc-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:text-zinc-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:text-zinc-700 [&_blockquote]:border-l-4 [&_blockquote]:border-[#199250] [&_blockquote]:bg-emerald-50/60 [&_blockquote]:rounded-r-xl [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-700 [&_blockquote]:my-3 [&_pre]:bg-zinc-50 [&_pre]:border [&_pre]:border-zinc-200 [&_pre]:text-emerald-800 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-3 [&_a]:text-[#199250] [&_a]:underline [&_a]:font-medium [&_a:hover]:text-[#055027] [&_img]:rounded-xl [&_img]:max-h-72 [&_img]:my-3 [&_img]:border [&_img]:border-zinc-200 [&_hr]:border-zinc-200 [&_hr]:my-4"
          style={{ minHeight }}
        />
      )}

      {/* Editor Footer Status */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/90 border-t border-zinc-200/80 text-[11px] text-zinc-500 font-['Manrope']">
        <div className="flex items-center gap-3">
          <span>
            <strong className="text-zinc-800 font-semibold">{wordCount}</strong> words
          </span>
          <span>•</span>
          <span>
            <strong className="text-zinc-800 font-semibold">{charCount}</strong> characters
          </span>
        </div>
        <div>
          <span className="text-zinc-600 font-mono text-[10px] bg-zinc-200/70 px-2.5 py-0.5 rounded-md font-medium">
            {isSourceMode ? "HTML Source Mode" : "WYSIWYG Visual Mode"}
          </span>
        </div>
      </div>
    </div>
  );
}
