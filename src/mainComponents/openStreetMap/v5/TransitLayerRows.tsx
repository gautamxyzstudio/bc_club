"use client";

/*
 * "SkyTrain nearby" and "Frequent buses" rows for the Map layers sheet.
 * Rendered by React (so re-renders never wipe them) and drives ./transitLayers.js,
 * which draws the circles, dots, labels and popups on the Leaflet map.
 * No sign-in needed: these layers are open to every visitor.
 */

import React, { useEffect, useState } from "react";
import {
  CITIES,
  type TransitBusMode,
  type TransitCounts,
  type TransitLayers,
} from "./transitLayers";

const SKY = "#0D9488";
const WALK: Record<number, number> = { 200: 3, 400: 5, 600: 8, 800: 10, 1200: 15 };
const metres = (d: number) => (d < 1000 ? `${d} m` : `${(d / 1000).toLocaleString()} km`);
const WHEN: Record<TransitBusMode, string> = {
  weekday: "on weekdays (7 a.m. to 7 p.m.)",
  weekend: "on weekends (10 a.m. to 6 p.m.)",
  all_week: "every day of the week",
};

export const TRANSIT_NOTE =
  "Based on published TransLink and BC Transit schedules; real buses can run late. Walk times are straight-line estimates.";

export interface TransitActive {
  sky: boolean;
  bus: boolean;
}

function Seg<T extends string | number>({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: T;
  options: Array<{ v: T; text: string; title?: string }>;
  onPick: (v: T) => void;
}) {
  return (
    <>
      <p className="bc-dl">{label}</p>
      <div className="bc-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            role="radio"
            aria-checked={o.v === value}
            className={o.v === value ? "on" : ""}
            title={o.title}
            onClick={() => onPick(o.v)}
          >
            {o.text}
          </button>
        ))}
      </div>
    </>
  );
}

export default function TransitLayerRows({
  transit,
  onActiveChange,
  onToast,
}: {
  transit: TransitLayers | null;
  onActiveChange?: (active: TransitActive) => void;
  onToast?: (msg: string) => void;
}) {
  const [sky, setSky] = useState(false);
  const [bus, setBus] = useState(false);
  const [skyPick, setSkyPick] = useState<400 | 800 | 1200>(800);
  const [level, setLevel] = useState<15 | 30>(30);
  const [mode, setMode] = useState<TransitBusMode>("weekday");
  const [walkPick, setWalkPick] = useState<200 | 400 | 600>(400);
  const [city, setCity] = useState<string | null>(null);
  const [counts, setCounts] = useState<TransitCounts>({ sky: null, bus15: null, bus30: null });

  // Push settings to the map layer whenever they change (also re-applies after the map is recreated)
  useEffect(() => {
    if (!transit) return;
    transit.setSkyDistance(skyPick);
    transit.setLevel(level);
    transit.setBusMode(mode);
    transit.setBusDistance(walkPick);
    transit.setSkyTrain(sky);
    transit.setBus(bus);
  }, [transit, sky, bus, skyPick, level, mode, walkPick]);

  useEffect(() => (transit ? transit.subscribe(setCounts) : undefined), [transit]);

  useEffect(() => {
    onActiveChange?.({ sky, bus });
  }, [sky, bus, onActiveChange]);

  const toggleSky = () => {
    onToast?.(`SkyTrain nearby ${!sky ? "on" : "off"}`);
    setSky(!sky);
  };
  const toggleBus = () => {
    onToast?.(`Frequent buses ${!bus ? "on" : "off"}`);
    setBus(!bus);
  };

  const skyDs = [400, 800, 1200].filter((d) => d <= skyPick);
  const darker = (ds: number[]) =>
    ds.length > 1
      ? ` Darker: within ${ds.slice(0, -1).map((d) => WALK[d]).join(" or ")} min (${ds
          .slice(0, -1)
          .map(metres)
          .join(" or ")}).`
      : "";
  const fmt = (n: number | null) => (n == null ? "–" : n.toLocaleString());

  return (
    <>
      <div className="bc-intro">
        <b>Commuting?</b> See how far SkyTrain is and how often buses come. Turn a layer on to start.
      </div>

      {/* SkyTrain nearby */}
      <div className="v5-lrow">
        <div className="v5-swatch">
          <svg width="46" height="22" aria-hidden="true">
            <circle cx="23" cy="11" r="10" fill="rgb(220,241,239)" />
            <circle cx="23" cy="11" r="6.5" fill="rgb(169,221,216)" />
            <circle cx="23" cy="11" r="3.2" fill="#fff" stroke={SKY} strokeWidth="2" />
          </svg>
        </div>
        <div className="v5-lt">
          <b>
            SkyTrain nearby<span className="bc-new">New</span>
          </b>
          <small>Shaded areas are a short walk from a station</small>
        </div>
        <button
          type="button"
          onClick={toggleSky}
          className={`v5-switch ${sky ? "on" : ""}`}
          aria-label="Show SkyTrain nearby"
          aria-pressed={sky}
        />
      </div>
      {sky && (
        <>
          <Seg
            label="Walk to station"
            value={skyPick}
            onPick={setSkyPick}
            options={[
              { v: 400, text: "5 min", title: "About 400 m" },
              { v: 800, text: "10 min", title: "About 800 m" },
              { v: 1200, text: "15 min", title: "About 1.2 km" },
            ]}
          />
          <div className="bc-note" aria-live="polite">
            <b>Showing:</b> areas within a {WALK[skyPick]}-min walk ({metres(skyPick)}) of a SkyTrain station.
            {darker(skyDs)}
          </div>
        </>
      )}

      {/* Frequent buses */}
      <div className="v5-lrow">
        <div className="v5-swatch">
          <svg width="46" height="22" aria-hidden="true">
            <rect x="4" y="3" width="38" height="16" rx="3" fill="rgba(101,163,13,.08)" stroke="#4D7C0F" strokeWidth="1.3" />
          </svg>
        </div>
        <div className="v5-lt">
          <b>
            Frequent buses<span className="bc-new">New</span>
          </b>
          <small>Shaded areas are a short walk from a stop with frequent buses</small>
        </div>
        <button
          type="button"
          onClick={toggleBus}
          className={`v5-switch ${bus ? "on" : ""}`}
          aria-label="Show frequent buses"
          aria-pressed={bus}
        />
      </div>
      {bus && (
        <>
          <Seg
            label="Bus comes"
            value={level}
            onPick={setLevel}
            options={[
              { v: 15, text: "Every 15 min", title: "A bus at least every 15 minutes" },
              { v: 30, text: "Every 30 min", title: "A bus at least every 30 minutes" },
            ]}
          />
          <Seg
            label="When"
            value={mode}
            onPick={setMode}
            options={[
              { v: "weekday", text: "Weekdays" },
              { v: "weekend", text: "Weekends" },
              { v: "all_week", text: "Every day" },
            ]}
          />
          <Seg
            label="Walk to stop"
            value={walkPick}
            onPick={setWalkPick}
            options={[
              { v: 200, text: "3 min", title: "About 200 m" },
              { v: 400, text: "5 min", title: "About 400 m" },
              { v: 600, text: "8 min", title: "About 600 m" },
            ]}
          />
          <div className="bc-note" aria-live="polite">
            <b>Showing:</b> areas within a {WALK[walkPick]}-min walk ({metres(walkPick)}) of a stop with a bus at
            least every {level} min, {WHEN[mode]}.{level === 30 ? " Darker green: a bus every 15 min." : ""}
          </div>
        </>
      )}

      {/* Cities + live counts */}
      <div className="v5-lrow" style={{ display: "block" }}>
        <p className="bc-sec">Jump to a city</p>
        <div className="bc-cities" role="group" aria-label="Jump to a city">
          {CITIES.map(([name]) => (
            <button
              key={name}
              type="button"
              className="bc-city"
              aria-pressed={city === name}
              onClick={() => {
                setCity(name);
                transit?.flyToCity(name);
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <p className="bc-sec">On the map now</p>
        <div className="bc-stats" aria-live="polite">
          <div className="bc-stat s">
            <b>{fmt(counts.sky)}</b>
            <small>SkyTrain stations</small>
          </div>
          <div className="bc-stat b15">
            <b>{fmt(counts.bus15)}</b>
            <small>Stops with a bus every 15 min</small>
          </div>
          <div className="bc-stat b30">
            <b>{fmt(counts.bus30)}</b>
            <small>Stops with a bus every 30 min</small>
          </div>
        </div>
      </div>
    </>
  );
}
