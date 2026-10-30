"use client";

import React, { useState, useEffect } from "react";
import {
  FiNavigation,
  FiLayers,
  FiMap,
} from "react-icons/fi";
import { TbRulerMeasure } from "react-icons/tb";

export interface MapLayerState {
  listings: boolean;
  drops: boolean;
  sold: boolean;
  lots: boolean;
  schools: boolean;
  flood: boolean;
}

export interface SchoolFilterState {
  elementary: boolean;
  secondary: boolean;
}

interface DisclaimerConfig {
  title: string;
  color: string;
  bg: string;
  text: string;
  check: string;
  note: string;
}

const DISC: Record<"lots" | "flood" | "schools", DisclaimerConfig> = {
  lots: {
    title: "Mapped lot lines",
    color: "#64748B",
    bg: "#F1F5F9",
    text: "Lot lines are based on available public data and are for general information only. They are not a legal survey and may not show exact property boundaries, dimensions or area. Only a BC Land Surveyor can confirm property lines.",
    check: "I understand lot lines are not a survey.",
    note: "Mapped lot lines · not a survey",
  },
  flood: {
    title: "Approximate floodplain areas",
    color: "#3B82F6",
    bg: "#DBEAFE",
    text: "Floodplain areas are based on available public data and are for general information only. They may be outdated or incomplete and do not indicate whether a specific property has flooded or will flood. Confirm with the local municipality and a qualified professional before relying on them.",
    check: "I understand this map is approximate and for general information only.",
    note: "Approximate floodplain · general information only",
  },
  schools: {
    title: "Approximate school catchments",
    color: "#7C3AED",
    bg: "#EDE9FE",
    text: "Catchment boundaries are based on available public data and are for general information only. Catchments change and do not guarantee enrolment. Please confirm with the local school board.",
    check: "I understand catchments are approximate and must be confirmed with the school board.",
    note: "Approximate catchments · confirm with school board",
  },
};

const ACK_KEY = "bcrem_map_ack_v1";

export default function OpenStreetMapV5Controls({
  layerState,
  onToggleLayer,
  onResetDisclaimers,
  handleGeolocation,
  toastMessage,
  showNotes = true,
  schoolFilters,
  onToggleSchoolFilter,
  isSatellite = false,
  toggleMapStyle,
  measureMode = false,
  handleMeasure,
}: {
  layerState: MapLayerState;
  onToggleLayer: (key: keyof MapLayerState, value: boolean) => void;
  onResetDisclaimers: () => void;
  handleGeolocation: () => void;
  toastMessage: string | null;
  showNotes?: boolean;
  schoolFilters?: SchoolFilterState;
  onToggleSchoolFilter?: (type: "elementary" | "secondary") => void;
  isSatellite?: boolean;
  toggleMapStyle?: () => void;
  measureMode?: boolean;
  handleMeasure?: () => void;
}) {
  const [layersSheetOpen, setLayersSheetOpen] = useState(false);
  const [pendingDisclaimer, setPendingDisclaimer] = useState<
    "lots" | "flood" | "schools" | null
  >(null);
  const [ackChecked, setAckChecked] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const [internalSchoolFilters, setInternalSchoolFilters] =
    useState<SchoolFilterState>({
      elementary: true,
      secondary: true,
    });

  const activeSchoolFilters = schoolFilters ?? internalSchoolFilters;

  const handleToggleSchool = (type: "elementary" | "secondary") => {
    if (onToggleSchoolFilter) {
      onToggleSchoolFilter(type);
    } else {
      setInternalSchoolFilters((prev) => ({
        ...prev,
        [type]: !prev[type],
      }));
    }
  };

  // Auto-dismiss hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Compute active layers count for the badge
  const activeCount = Object.values(layerState).filter(Boolean).length;

  // Handle layer toggle with disclaimer check
  const handleLayerSwitch = (key: keyof MapLayerState) => {
    const nextVal = !layerState[key];

    // If turning ON and requires legal disclaimer and not acknowledged yet
    if (nextVal && (key === "lots" || key === "flood" || key === "schools")) {
      try {
        const stored = JSON.parse(localStorage.getItem(ACK_KEY) || "{}");
        if (!stored[key]) {
          setPendingDisclaimer(key);
          setAckChecked(false);
          return;
        }
      } catch {
        setPendingDisclaimer(key);
        setAckChecked(false);
        return;
      }
    }

    onToggleLayer(key, nextVal);
  };

  const confirmDisclaimer = () => {
    if (!pendingDisclaimer) return;
    try {
      const stored = JSON.parse(localStorage.getItem(ACK_KEY) || "{}");
      stored[pendingDisclaimer] = true;
      localStorage.setItem(ACK_KEY, JSON.stringify(stored));
    } catch { }

    onToggleLayer(pendingDisclaimer, true);
    setPendingDisclaimer(null);
    setAckChecked(false);
  };

  const cancelDisclaimer = () => {
    if (pendingDisclaimer) {
      onToggleLayer(pendingDisclaimer, false);
    }
    setPendingDisclaimer(null);
    setAckChecked(false);
  };

  const activeNotes: Array<{ key: string; color: string; label: string }> = [];
  if (layerState.lots) {
    activeNotes.push({
      key: "lots",
      color: "#AFB7C3",
      label: DISC.lots.note,
    });
  }
  if (layerState.flood) {
    activeNotes.push({
      key: "flood",
      color: "#3B82F6",
      label: DISC.flood.note,
    });
  }
  if (layerState.schools) {
    activeNotes.push({
      key: "schools",
      color: "#7C3AED",
      label: DISC.schools.note,
    });
  }

  return (
    <>
      {/* Toast Notification */}
      <div className={`v5-toast ${toastMessage ? "show" : ""}`}>
        {toastMessage}
      </div>

      {/* Floating Hint bubble */}
      <div
        className={`v5-hint ${!showHint ? "hide" : ""}`}
        onClick={() => setShowHint(false)}
      >
        Lot lines, floodplain &amp; schools are in <b>Layers</b>. Tap any home for details.
      </div>

      {/* Persistent Notes (Bottom-Left) */}
      {showNotes && activeNotes.length > 0 && (
        <div className="v5-notes">
          {activeNotes.map((n) => (
            <div key={n.key} className="v5-note">
              <span
                className="v5-note-dot"
                style={{ background: n.color }}
              />
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Controller Buttons (.ctrls) */}
      <div className="v5-ctrls">
        {/* Layers Button */}
        <button
          type="button"
          onClick={() => {
            setShowHint(false);
            setLayersSheetOpen((prev) => !prev);
          }}
          className={`v5-fab ${layersSheetOpen ? "on" : ""}`}
          title="Map Layers"
          aria-label="Map Layers"
        >
          <FiLayers size={20} />
          {activeCount > 0 && <span className="v5-fab-badge">{activeCount}</span>}
        </button>

        {/* Map Style FAB: Vector map vs Satellite imagery toggle */}
        {toggleMapStyle && (
          <button
            type="button"
            onClick={toggleMapStyle}
            className={`v5-fab ${isSatellite ? "on" : ""}`}
            title={isSatellite ? "Switch to Vector Map" : "Switch to Satellite Imagery"}
            aria-label="Map Style (Vector / Satellite)"
          >
            <FiMap size={19} />
          </button>
        )}

        {/* Measure Tool: Interactive ruler for measuring distance between map points */}
        {handleMeasure && (
          <button
            type="button"
            onClick={handleMeasure}
            className={`v5-fab ${measureMode ? "on" : ""}`}
            title={measureMode ? "Exit Measure Tool" : "Measure Distance"}
            aria-label="Measure Distance"
          >
            <TbRulerMeasure size={20} />
          </button>
        )}

        {/* Location Button */}
        <button
          type="button"
          onClick={() => {
            setShowHint(false);
            handleGeolocation();
          }}
          className="v5-fab"
          title="My Location"
          aria-label="My Location"
        >
          <FiNavigation size={18} />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`v5-backdrop ${layersSheetOpen || pendingDisclaimer ? "open" : ""}`}
        onClick={() => {
          if (pendingDisclaimer) {
            cancelDisclaimer();
          } else {
            setLayersSheetOpen(false);
          }
        }}
      />

      {/* Layers Sheet (.lsheet) */}
      <div className={`v5-lsheet ${layersSheetOpen ? "open" : ""}`}>
        <div className="v5-sheet-handle" />
        <div className="flex items-center justify-between mb-1">
          <h3>Map layers</h3>
          <button
            type="button"
            onClick={() => setLayersSheetOpen(false)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold md:hidden"
          >
            ✕
          </button>
        </div>
        <p className="sub">Keep it simple: turn on only what you need.</p>

        {/* Layer Rows */}
        <div className="space-y-1">
          {/* 1. Active Listings */}
          <div className="v5-lrow">
            <div className="v5-swatch">
              <svg width="46" height="22">
                <rect x="2" y="2" width="42" height="18" rx="9" fill="#1E4E8C" />
                <text x="23" y="14.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">
                  $1.2M
                </text>
              </svg>
            </div>
            <div className="v5-lt">
              <b>Active listings</b>
              <small>Price tags in brand navy</small>
            </div>
            <button
              type="button"
              onClick={() => handleLayerSwitch("listings")}
              className={`v5-switch ${layerState.listings ? "on" : ""}`}
              aria-label="Toggle active listings"
            />
          </div>

          {/* 2. Price Drops */}
          <div className="v5-lrow">
            <div className="v5-swatch">
              <svg width="46" height="22">
                <rect x="2" y="2" width="42" height="18" rx="9" fill="#EA580C" />
                <text x="23" y="14.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">
                  ↓ $1.4M
                </text>
              </svg>
            </div>
            <div className="v5-lt">
              <b>Price drops</b>
              <small>Orange, so deals stand out</small>
            </div>
            <button
              type="button"
              onClick={() => handleLayerSwitch("drops")}
              className={`v5-switch ${layerState.drops ? "on" : ""}`}
              aria-label="Toggle price drops"
            />
          </div>

          {/* 3. Sold Listings */}
          <div className="v5-lrow">
            <div className="v5-swatch">
              <svg width="46" height="22">
                <rect x="2" y="2" width="42" height="18" rx="9" fill="#9F1239" />
                <text x="23" y="14.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">
                  Sold
                </text>
              </svg>
            </div>
            <div className="v5-lt">
              <b>Sold – last 12 months</b>
              <small>Dark red · prices after free sign-in</small>
            </div>
            <button
              type="button"
              onClick={() => handleLayerSwitch("sold")}
              className={`v5-switch ${layerState.sold ? "on" : ""}`}
              aria-label="Toggle sold listings"
            />
          </div>

          {/* 4. Lot Lines */}
          <div className="v5-lrow">
            <div className="v5-swatch">
              <svg width="46" height="22">
                <rect x="4" y="3" width="18" height="16" fill="none" stroke="#AFB7C3" strokeWidth="1.2" />
                <rect x="22" y="3" width="18" height="16" fill="none" stroke="#AFB7C3" strokeWidth="1.2" />
              </svg>
            </div>
            <div className="v5-lt">
              <b>Lot lines</b>
              <small>Based on public data · not a survey</small>
            </div>
            <button
              type="button"
              onClick={() => handleLayerSwitch("lots")}
              className={`v5-switch ${layerState.lots ? "on" : ""}`}
              aria-label="Toggle lot lines"
            />
          </div>

          {/* 5. Schools & Catchments */}
          <div className="v5-lrow">
            <div className="v5-swatch">
              <svg width="46" height="22">
                <circle cx="15" cy="11" r="8" fill="#7C3AED" />
                <rect
                  x="23"
                  y="4"
                  width="20"
                  height="13"
                  rx="3"
                  fill="rgba(124,58,237,.08)"
                  stroke="#7C3AED"
                  strokeDasharray="3 2"
                />
              </svg>
            </div>
            <div className="v5-lt">
              <b>Schools</b>
              <small>Confirm catchments with the school board</small>
            </div>
            <button
              type="button"
              onClick={() => handleLayerSwitch("schools")}
              className={`v5-switch ${layerState.schools ? "on" : ""}`}
              aria-label="Toggle schools"
            />
          </div>

          {/* Expanded school category checkboxes */}
          {layerState.schools && (
            <div className="v5-sub-options">
              <label
                className={`v5-checkbox-label ${activeSchoolFilters.elementary ? "active" : ""
                  }`}
              >
                <input
                  type="checkbox"
                  checked={activeSchoolFilters.elementary}
                  onChange={() => handleToggleSchool("elementary")}
                />
                <span>Elementary</span>
              </label>
              <label
                className={`v5-checkbox-label ${activeSchoolFilters.secondary ? "active" : ""
                  }`}
              >
                <input
                  type="checkbox"
                  checked={activeSchoolFilters.secondary}
                  onChange={() => handleToggleSchool("secondary")}
                />
                <span>Secondary</span>
              </label>
            </div>
          )}

          {/* 6. Floodplain */}
          <div className="v5-lrow">
            <div className="v5-swatch">
              <svg width="46" height="22">
                <defs>
                  <pattern
                    id="hatchPattern"
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="6" height="6" fill="rgba(59,130,246,.15)" />
                    <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(59,130,246,.5)" strokeWidth="1.4" />
                  </pattern>
                </defs>
                <rect
                  x="4"
                  y="3"
                  width="38"
                  height="16"
                  rx="3"
                  fill="url(#hatchPattern)"
                  stroke="#3B82F6"
                  strokeDasharray="4 3"
                  strokeWidth="1.3"
                />
              </svg>
            </div>
            <div className="v5-lt">
              <b>Floodplain (approx.)</b>
              <small>Based on public data · general info</small>
            </div>
            <button
              type="button"
              onClick={() => handleLayerSwitch("flood")}
              className={`v5-switch ${layerState.flood ? "on" : ""}`}
              aria-label="Toggle floodplain"
            />
          </div>
        </div>

        {/* Reset disclaimers button */}
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(ACK_KEY);
            } catch { }
            setInternalSchoolFilters({ elementary: true, secondary: true });
            onResetDisclaimers();
            setLayersSheetOpen(false);
          }}
          className="v5-reset-link"
        >
          Reset layer disclaimers
        </button>
      </div>

      {/* Disclaimer Sheet / Modal (.dsheet) */}
      {pendingDisclaimer && (
        <div className="v5-dsheet open">
          <div className="v5-sheet-handle" />
          <div
            className="v5-dico"
            style={{
              background: DISC[pendingDisclaimer].bg,
              color: DISC[pendingDisclaimer].color,
            }}
          >
            {pendingDisclaimer === "lots" && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="1" />
                <path d="M4 12h16M12 4v16" strokeDasharray="2 2" />
              </svg>
            )}
            {pendingDisclaimer === "flood" && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5S5 10.2 5 14.5a7 7 0 0 0 14 0C19 10.2 12 2.5 12 2.5Z" />
              </svg>
            )}
            {pendingDisclaimer === "schools" && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3Zm-6 9.6V16c0 1.7 2.7 3.5 6 3.5s6-1.8 6-3.5v-3.4l-6 3.3-6-3.3Z" />
              </svg>
            )}
          </div>

          <h3>{DISC[pendingDisclaimer].title}</h3>
          <p>{DISC[pendingDisclaimer].text}</p>

          <label className={`v5-ack ${ackChecked ? "on" : ""}`}>
            <input
              type="checkbox"
              checked={ackChecked}
              onChange={(e) => setAckChecked(e.target.checked)}
            />
            <span>{DISC[pendingDisclaimer].check}</span>
          </label>

          <div className="v5-cbtns">
            <button
              type="button"
              onClick={cancelDisclaimer}
              className="v5-btn sec"
            >
              Not now
            </button>
            <button
              type="button"
              disabled={!ackChecked}
              onClick={confirmDisclaimer}
              className="v5-btn"
            >
              Show on map
            </button>
          </div>
        </div>
      )}
    </>
  );
}
