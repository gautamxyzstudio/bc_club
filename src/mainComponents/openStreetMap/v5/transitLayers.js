/*
 * Transit layers for the bcrealestatemarket.com map search (Leaflet 1.9)  ·  v2, Nov 2026
 *
 * Adds to the existing "Map layers" panel (.v5-lsheet), using the panel's own classes
 * (.v5-lrow, .v5-swatch, .v5-lt, .v5-switch):
 *   - City            buttons that fly to a city + live "in view" counts (optional)
 *   - SkyTrain nearby  Walk to station: 5 / 10 / 15 min (one choice; closer rings shade in)
 *   - Frequent buses  Bus comes: every 15 / 30 min · When: weekdays / weekends / every day ·
 *                     Walk to stop: 3 / 5 / 8 min (each row is one choice)
 * Station names always show; bus stop names show at street zoom. Overlapping names hide.
 * Tapping a stop shows every route's average time between buses and the exact location.
 *
 * Built for buyers who commute: how close the SkyTrain is, and how often the bus comes.
 *
 * Colours avoid what the map already uses (listings navy, price drops orange, sold red,
 * schools purple, floodplain blue): SkyTrain teal #0D9488, buses green #65A30D.
 * Circles are drawn on a canvas from the stop/station points (exact metres, merged
 * where they overlap), so no polygon files are needed.
 *
 * Usage, after the Leaflet map is created:
 *   import { addTransitLayers } from "./transit-layers.js";
 *   const transit = addTransitLayers(map, { dataUrl: "/layers/" });
 *
 * Data files (in dataUrl): skytrain_stations.geojson, bc_bus_stops.geojson
 * React: call once in the effect that creates the map; call transit.destroy() in cleanup.
 * If React renders the panel itself, pass `panel: null` and drive the layers with the
 * returned functions (setSkyTrain, setBus, setBusMode, setLevel, setSkyDistance,
 * setBusDistance, flyToCity) from your own controls.
 */

const C = { sky: "#0D9488", skyInk: "#0F766E", bus: "#65A30D", bus15Edge: "#4D7C0F", bus30Edge: "#84A83A" };
const SKY_D = [400, 800, 1200];
const BUS_D = [200, 400, 600];
const SKY_SHADE = { 400: .27, 800: .15, 1200: .09 };
const BUS_SHADE = { 15: { 600: .15, 400: .21, 200: .29 }, 30: { 600: .06, 400: .09, 200: .13 } };
const NOTES = {
  weekday: "Counted Monday to Friday, 7 a.m. to 7 p.m.",
  weekend: "Counted Saturday and Sunday, 10 a.m. to 6 p.m.",
  all_week: "The same route runs this often every day of the week.",
};
export const CITIES = [
  ["Vancouver", [49.2610, -123.1140]], ["Burnaby", [49.2470, -122.9800]], ["Surrey", [49.1890, -122.8480]],
  ["Richmond", [49.1720, -123.1360]], ["New Westminster", [49.2060, -122.9110]], ["Coquitlam", [49.2790, -122.8100]],
  ["North Vancouver", [49.3150, -123.0750]], ["Langley", [49.1040, -122.6600]], ["Abbotsford", [49.0500, -122.3100]],
  ["Victoria", [48.4380, -123.3650]], ["Nanaimo", [49.1900, -123.9900]], ["Kelowna", [49.8880, -119.4800]],
  ["Kamloops", [50.6700, -120.3500]], ["Prince George", [53.9100, -122.7700]],
];

const CSS = `
.bc-intro{font-size:12.5px;line-height:1.45;color:var(--v5-slate,#475569);background:#f0fdfa;border:1px solid #ccfbf1;border-radius:10px;padding:9px 11px;margin:6px 0}
.bc-intro b{color:${C.skyInk}}
.bc-new{display:inline-block;vertical-align:1px;margin-left:4px;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:var(--v5-orange,#f5a20a);padding:2px 6px;border-radius:999px}
.bc-hint{font-weight:600;text-transform:none;letter-spacing:0;color:#94a3b8;margin-left:4px}
.bc-pop .best{font-size:12.5px;color:#3f6212;background:#f3f8ea;border-radius:8px;padding:6px 8px;margin:2px 0 8px}.bc-pop .best b{display:inline;font-size:inherit;color:inherit}
.bc-sec{margin:4px 0 6px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--v5-muted,#64748b)}
.bc-cities{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 8px;margin:0 -2px;scrollbar-width:thin}
.bc-city{flex:none;height:32px;padding:0 12px;border-radius:16px;border:1px solid var(--v5-line,#e2e8f0);background:#fff;font:inherit;font-size:12.5px;font-weight:600;color:var(--v5-ink,#0f172a);cursor:pointer;white-space:nowrap}
.bc-city:hover{background:#f8fafc;border-color:#cbd5e1}
.bc-city[aria-pressed="true"]{background:var(--v5-navy,#1e4e8c);border-color:var(--v5-navy,#1e4e8c);color:#fff}
.bc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:2px 0 10px}
.bc-stat{background:#f8fafc;border:1px solid #f1f5f9;border-radius:10px;padding:8px 10px}
.bc-stat b{display:block;font-size:18px;font-weight:800;font-variant-numeric:tabular-nums}
.bc-stat small{font-size:11px;color:var(--v5-muted,#64748b)}
.bc-stat.s b{color:${C.skyInk}}.bc-stat.b15 b{color:#3f6212}.bc-stat.b30 b{color:#6b8e23}
.bc-dl{margin:0 0 4px 58px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--v5-muted,#64748b)}
.bc-chips{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 10px 58px}
.bc-chip{height:28px;padding:0 9px 0 7px;border-radius:14px;border:1px solid var(--v5-line,#e2e8f0);background:#fff;font:inherit;font-size:11.5px;font-weight:700;color:var(--v5-muted,#64748b);cursor:pointer;display:flex;align-items:center;gap:6px;font-variant-numeric:tabular-nums}
.bc-chip i{width:10px;height:10px;border-radius:50%;opacity:.3;box-sizing:border-box}
.bc-chip.lv i{width:13px;height:13px;border-radius:4px}
.bc-chip b{font-weight:800}.bc-chip{font-weight:600}.bc-chip.on{color:var(--v5-ink,#0f172a);border-color:#cbd5e1;background:#f8fafc}.bc-chip.on i{opacity:1}
.bc-seg{display:flex;margin:0 0 6px 58px;border:1px solid var(--v5-line,#e2e8f0);border-radius:18px;padding:3px;gap:2px;background:#fff}
.bc-seg button{flex:1;border:0;background:none;font:inherit;font-size:12px;font-weight:600;color:var(--v5-slate,#475569);padding:5px 11px;border-radius:14px;cursor:pointer;white-space:nowrap}
.bc-seg button.on{background:var(--v5-ink,#0f172a);color:#fff}
.bc-note{background:#f8fafc;border-radius:8px;padding:7px 9px;margin:0 0 10px 58px;font-size:11.5px;line-height:1.4;color:var(--v5-muted,#64748b)}.bc-note b{color:var(--v5-ink,#0f172a)}
.bc-city:focus-visible,.bc-chip:focus-visible,.bc-seg button:focus-visible{outline:2px solid var(--v5-navy,#1e4e8c);outline-offset:2px}
.bc-lbl{background:none;border:0}
.bc-lbl span{position:absolute;left:0;top:0;transform:translate(6px,-50%);white-space:nowrap;font-family:inherit;font-size:10px;font-weight:600;letter-spacing:.01em;color:#475569;pointer-events:none;
  text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff,0 0 4px #fff}
.bc-lbl.sky span{font-size:11px;font-weight:700;color:${C.skyInk};transform:translate(8px,-50%)}
.bc-lbl.bc-hide{display:none}
.bc-pop b{display:block;font-size:13.5px;color:var(--v5-ink,#0f172a)}
.bc-pop small{display:block;color:var(--v5-muted,#64748b);margin-bottom:6px}
.bc-pop .lines{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 4px}
.bc-pop .lines span{font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;background:#f0fdfa;color:${C.skyInk};border:1px solid #ccfbf1}
.bc-pop table{border-collapse:collapse;width:100%;font-size:12px;font-variant-numeric:tabular-nums}
.bc-pop th{text-align:left;font-weight:600;color:var(--v5-muted,#64748b);font-size:11px;padding:0 6px 3px 0}
.bc-pop td{padding:3px 6px 3px 0;border-top:1px solid #f1f5f9;white-space:nowrap}
.bc-pop td.r{font-weight:700}.bc-pop td.g15{color:#3f6212;font-weight:700}.bc-pop td.g30{color:#6b7280}
.bc-pop .cap{font-size:11px;color:var(--v5-muted,#64748b);margin-top:6px}
.bc-pop .where{margin-top:8px;padding-top:8px;border-top:1px solid var(--v5-line,#e2e8f0);font-size:11.5px;color:var(--v5-muted,#64748b)}
.bc-pop .where a{color:var(--v5-navy,#1e4e8c);font-weight:700;text-decoration:none}`;

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tint = (hex, a) => { const n = parseInt(hex.slice(1), 16), m = v => Math.round(255 + (v - 255) * Math.min(1, a)); return `rgb(${m(n >> 16)},${m((n >> 8) & 255)},${m(n & 255)})`; };
const WALK = { 200: 3, 400: 5, 600: 8, 800: 10, 1200: 15 };   // minutes on foot at about 80 m/min, straight line
const dlabel = d => `<b>${WALK[d]} min</b>&nbsp;${d < 1000 ? d + " m" : "1 km"}`;

export function addTransitLayers(map, { dataUrl = "/layers/", panel = document.querySelector(".v5-lsheet"), after = /Floodplain/, cities = true, L: Lopt, avoid = null, onChange = null } = {}) {
  // bc_club: pass Leaflet in (L option) instead of relying on window.L; `avoid` returns an element
  // (the React layers sheet) that labels should not sit under; onChange(counts) fires after every redraw.
  const L = Lopt || window.L;
  // One choice per row. skyPick: walk to station (m); walkPick: walk to stop (m);
  // levelPick: 15 = only every-15-min stops, 30 = every-30-min stops with every-15-min shown darker.
  const S = { sky: false, bus: false, mode: "weekday", skyPick: 800, walkPick: 400, levelPick: 30 };
  Object.defineProperties(S, {
    skyD: { get: () => Object.fromEntries(SKY_D.map(d => [d, d <= S.skyPick])) },          // closer rings shade in automatically
    busD: { get: () => Object.fromEntries(BUS_D.map(d => [d, d === S.walkPick])) },
    levels: { get: () => ({ 15: true, 30: S.levelPick === 30 }) },
  });
  const STOP_ZOOM = 15, STOP_LABEL_ZOOM = 16, STATION_LABEL_ZOOM = 12;

  // Panes: circles under the overlay pane (floodplain, schools at 400); dots and labels just under listing markers (600).
  for (const [n, z] of [["bcBus", 370], ["bcSky", 380], ["bcDots", 585], ["bcLabels", 590]]) {
    if (!map.getPane(n)) { const p = map.createPane(n); p.style.zIndex = z; if (n !== "bcDots") p.style.pointerEvents = "none"; }
  }
  if (!document.getElementById("bc-transit-css")) document.head.appendChild(Object.assign(document.createElement("style"), { id: "bc-transit-css", textContent: CSS }));

  // ---- canvas circles
  const mpp = () => 40075016.686 * Math.cos(map.getCenter().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8);
  const Circles = L.Layer.extend({
    initialize(pane, draw, opacity) { this._pane = pane; this._draw = draw; this._op = opacity; },
    onAdd(m) { this._c = L.DomUtil.create("canvas", "leaflet-zoom-hide"); this._c.style.position = "absolute"; this._c.style.opacity = this._op;
      m.getPane(this._pane).appendChild(this._c); m.on("moveend zoomend resize", this.redraw, this); this.redraw(); },
    onRemove(m) { this._c.remove(); m.off("moveend zoomend resize", this.redraw, this); },
    redraw() { if (!this._map) return; const m = this._map, sz = m.getSize(), c = this._c, dpr = window.devicePixelRatio || 1;
      c.width = sz.x * dpr; c.height = sz.y * dpr; c.style.width = sz.x + "px"; c.style.height = sz.y + "px";
      L.DomUtil.setPosition(c, m.containerPointToLayerPoint([0, 0]));
      const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, sz.x, sz.y);
      const b = m.getBounds().pad(.25), k = 1 / mpp();
      this._draw(g, ll => b.contains(ll), ll => m.latLngToContainerPoint(ll), metres => metres * k); }
  });
  const discs = (g, pts, r, fill, edge) => {
    if (!pts.length) return;
    g.beginPath(); for (const p of pts) { g.moveTo(p.x + r + 1, p.y); g.arc(p.x, p.y, r + 1, 0, 7); } g.fillStyle = edge; g.fill();
    g.beginPath(); for (const p of pts) { g.moveTo(p.x + r, p.y); g.arc(p.x, p.y, r, 0, 7); } g.fillStyle = fill; g.fill();
  };

  const where = (lat, lon) => `<div class="where">Location ${lat.toFixed(5)}, ${lon.toFixed(5)} · <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" rel="noopener">Open in Google Maps</a></div>`;
  const label = (ll, text, kind, pr) => { const m = L.marker(ll, { pane: "bcLabels", interactive: false, keyboard: false,
    icon: L.divIcon({ className: "bc-lbl " + kind, html: `<span>${esc(text)}</span>`, iconSize: [0, 0] }) }); m._pr = pr; return m; };
  const parseRoutes = s => (s || "").split(";").filter(Boolean).map(x => { const [r, w, sa, su] = x.split("|"); return { r, w: +w || 0, sa: +sa || 0, su: +su || 0 }; });
  const cell = m => m ? `<td class="${m <= 15 ? "g15" : m <= 30 ? "g30" : ""}">${m} min</td>` : `<td class="g30">–</td>`;

  const sky = L.layerGroup(), stationLabels = L.layerGroup(), stationPts = [];
  const stopDots = {}, stopLabels = {}, stopPts = {}, stopLabelLayer = L.layerGroup();
  const visibleLevel = lv => (S.levels[15] && lv === 15) || (S.levels[30] && lv > 0 && lv <= 30);

  const skyCircles = new Circles("bcSky", (g, inView, px, m2px) => {
    const pts = stationPts.filter(inView).map(px);
    SKY_D.filter(d => S.skyD[d]).sort((a, b) => b - a).forEach(d => discs(g, pts, m2px(d), tint(C.sky, SKY_SHADE[d]), tint(C.sky, SKY_SHADE[d] + .22)));
  }, .72);

  // Soft area: light fill for the merged circles, one thin outline around the outer edge
  const stripes = (g, fill, line) => { const t = document.createElement("canvas"); t.width = t.height = 8; const x = t.getContext("2d");
    x.fillStyle = fill; x.fillRect(0, 0, 8, 8); x.strokeStyle = line; x.lineWidth = 1.4; x.lineCap = "square";
    x.beginPath(); x.moveTo(-2, 2); x.lineTo(2, -2); x.moveTo(0, 8); x.lineTo(8, 0); x.moveTo(6, 10); x.lineTo(10, 6); x.stroke();
    return g.createPattern(t, "repeat"); };
  let _off = null;
  const hatchArea = (g, pts, r, style) => {
    if (!pts.length) return;
    const cv = g.canvas, dpr = cv.width / parseFloat(cv.style.width || cv.width);
    const ring = (ctx, rr) => { ctx.beginPath(); for (const p of pts) { ctx.moveTo(p.x + rr, p.y); ctx.arc(p.x, p.y, rr, 0, 7); } };
    ring(g, r); g.fillStyle = style.fill; g.fill();                                              // one fill = union, no double shading
    if (!style.edge) return;                                                                      // inner areas: fill only, no extra lines
    if (!_off) _off = document.createElement("canvas");
    if (_off.width !== cv.width || _off.height !== cv.height) { _off.width = cv.width; _off.height = cv.height; }
    const o = _off.getContext("2d"); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, _off.width, _off.height); o.setTransform(dpr, 0, 0, dpr, 0, 0);
    o.globalCompositeOperation = "source-over"; ring(o, r + style.edgeW); o.fillStyle = style.edge; o.fill();
    o.globalCompositeOperation = "destination-out"; ring(o, r); o.fillStyle = "#000"; o.fill();   // cut the inside out fully, leaving only the outline o.globalCompositeOperation = "source-over";
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(_off, 0, 0); g.restore();
  };
  const BUS_STYLE = {
    15: { fill: "rgba(101,163,13,.07)" },
    30: { fill: "rgba(132,168,58,.035)" },
    edge: "rgba(77,124,15,.7)", edgeW: 1.3,                                // one thin outline, outer edge only
  };
  const busCircles = new Circles("bcBus", (g, inView, px, m2px) => {
    const on = BUS_D.filter(d => S.busD[d]).sort((a, b) => b - a);
    let outlined = false;                                                   // outline drawn once, around the outermost area
    for (const level of [30, 15]) {
      if (!S.levels[level] || !stopPts[S.mode]) continue;
      const pts = stopPts[S.mode].filter(p => (level === 15 ? p.lv === 15 : p.lv > 0) && inView(p.ll)).map(p => px(p.ll));
      on.forEach(d => { hatchArea(g, pts, m2px(d), outlined ? BUS_STYLE[level] : { ...BUS_STYLE[level], edge: BUS_STYLE.edge, edgeW: BUS_STYLE.edgeW }); outlined = true; });   // nearer distances stack = darker
    }
  }, 1);
  sky.addLayer(skyCircles);

  const get = f => fetch(dataUrl + f).then(r => { if (!r.ok) throw new Error(f); return r.json(); });
  let dead = false;
  const subs = new Set();
  const subscribe = fn => { subs.add(fn); fn(getCounts()); return () => subs.delete(fn); };
  let ready = null;   // data (about 3 MB) loads the first time a transit layer is turned on
  const load = () => ready || (ready = Promise.all([get("skytrain_stations.geojson"), get("bc_bus_stops.geojson")]).then(([stations, stops]) => {
    if (dead) return;
    L.geoJSON(stations, { pane: "bcDots",
      pointToLayer: (f, ll) => { stationPts.push(ll); stationLabels.addLayer(label(ll, f.properties.label, "sky", 1e6));
        return L.circleMarker(ll, { pane: "bcDots", radius: 4, weight: 2, color: C.sky, fillColor: "#fff", fillOpacity: 1 }); },
      onEachFeature: (f, l) => { const [lon, lat] = f.geometry.coordinates, p = f.properties;
        l.bindPopup(`<div class="bc-pop"><b>${esc(p.station)}</b><small>SkyTrain station</small><div class="lines">${(p.lines || "").split(", ").map(x => `<span>${esc(x)}</span>`).join("")}</div>${where(lat, lon)}</div>`); }
    }).addTo(sky);
    for (const mode of ["weekday", "weekend", "all_week"]) {
      stopLabels[mode] = []; stopPts[mode] = [];
      stopDots[mode] = L.geoJSON(stops, { pane: "bcDots", filter: f => f.properties[mode] > 0,
        pointToLayer: (f, ll) => { const lv = f.properties[mode], first = parseRoutes(f.properties.routes)[0];
          stopPts[mode].push({ ll, lv });
          const m = label(ll, f.properties.label, "bus", (lv === 15 ? 2000 : 1000) - (first ? first.w : 99)); m._lv = lv; stopLabels[mode].push(m);
          const mk = L.circleMarker(ll, { pane: "bcDots", radius: lv === 15 ? 3 : 2.5, weight: lv === 15 ? 1 : 1.2, color: lv === 15 ? "#fff" : C.bus30Edge,
            fillColor: lv === 15 ? C.bus : "#fff", fillOpacity: 1 }); mk._lv = lv; return mk; },
        onEachFeature: (f, l) => { const p = f.properties, [lon, lat] = f.geometry.coordinates, rs = parseRoutes(p.routes);
          l.bindPopup(`<div class="bc-pop"><b>${esc(p.label)}</b><small>${esc(p.area)}${p.direction ? " · " + esc(p.direction) : ""}${p.stop_code ? " · Stop #" + esc(p.stop_code) : ""}</small>
            ${rs[0] && rs[0].w ? `<div class="best">Best here: <b>route ${esc(rs[0].r)}, every ${rs[0].w} min</b> on weekdays</div>` : ""}
            <table><tr><th>Route</th><th>Weekdays</th><th>Sat</th><th>Sun</th></tr>${rs.map(x => `<tr><td class="r">${esc(x.r)}</td>${cell(x.w)}${cell(x.sa)}${cell(x.su)}</tr>`).join("")}</table>
            <div class="cap">Average time between buses, from the published schedule.</div>${where(lat, lon)}</div>`); } });
    }
    render();
  }).catch(err => { ready = null; throw err; }));

  // ---- labels: on-screen only, overlapping ones hidden (stations first, then the most frequent stops)
  function refreshStopLabels() {
    if (!map.hasLayer(stopLabelLayer) || !stopLabels[S.mode]) return;
    const b = map.getBounds().pad(.15), want = new Set(stopLabels[S.mode].filter(m => visibleLevel(m._lv) && b.contains(m.getLatLng())));
    stopLabelLayer.eachLayer(m => { if (!want.has(m)) stopLabelLayer.removeLayer(m); });
    want.forEach(m => { if (!stopLabelLayer.hasLayer(m)) stopLabelLayer.addLayer(m); });
  }
  function declutter() {
    const items = [stationLabels, stopLabelLayer].filter(g => map.hasLayer(g)).flatMap(g => g.getLayers()).filter(m => m._icon);
    items.forEach(m => m._icon.classList.remove("bc-hide"));
    items.sort((a, b) => b._pr - a._pr);
    const placed = [], v = map.getContainer().getBoundingClientRect();
    if (panel && panel.offsetParent && panel.classList.contains("open")) placed.push(panel.getBoundingClientRect());
    const av = avoid && avoid(); if (av && av.offsetParent && av.classList.contains("open")) placed.push(av.getBoundingClientRect());
    for (const m of items) {
      const r = m._icon.firstElementChild.getBoundingClientRect();
      if (r.right < v.left || r.left > v.right || r.bottom < v.top || r.top > v.bottom) continue;
      if (placed.some(p => r.left < p.right + 4 && r.right + 4 > p.left && r.top < p.bottom + 2 && r.bottom + 2 > p.top)) m._icon.classList.add("bc-hide"); else placed.push(r);
    }
  }
  function getCounts() {
    const b = map.getBounds(), inv = S.bus && stopPts[S.mode] ? stopPts[S.mode].filter(p => b.contains(p.ll)) : null;
    return { sky: S.sky && stationPts.length ? stationPts.filter(p => b.contains(p)).length : null,
      bus15: inv ? inv.filter(p => p.lv === 15).length : null, bus30: inv ? inv.length : null };
  }
  function counts() {
    if (onChange || subs.size) { const c = getCounts(); for (const f of [onChange, ...subs]) if (f) { try { f(c); } catch (e) { console.error(e); } } }
    if (!ui) return; const b = map.getBounds();
    const inv = S.bus && stopPts[S.mode] ? stopPts[S.mode].filter(p => b.contains(p.ll)) : null;
    ui.nSky.textContent = S.sky ? stationPts.filter(p => b.contains(p)).length : "–";
    ui.n15.textContent = inv ? inv.filter(p => p.lv === 15).length : "–";
    ui.n30.textContent = inv ? inv.length : "–";
  }
  function render() {
    const z = map.getZoom();
    if (S.sky) { sky.addTo(map); skyCircles.redraw(); } else map.removeLayer(sky);
    (S.sky && z >= STATION_LABEL_ZOOM) ? stationLabels.addTo(map) : map.removeLayer(stationLabels);
    Object.values(stopDots).forEach(l => map.removeLayer(l)); map.removeLayer(stopLabelLayer);
    if (S.bus) {
      map.hasLayer(busCircles) ? busCircles.redraw() : busCircles.addTo(map);
      const g = stopDots[S.mode];
      if (g && z >= STOP_ZOOM) { g.eachLayer(mk => { const v = visibleLevel(mk._lv); mk.setStyle({ opacity: v ? 1 : 0, fillOpacity: v ? 1 : 0 }); }); g.addTo(map); }
      if (z >= STOP_LABEL_ZOOM) { stopLabelLayer.addTo(map); refreshStopLabels(); }
    } else map.removeLayer(busCircles);
    sync(); counts(); requestAnimationFrame(declutter);
  }
  const onZoom = () => render(), onMove = () => { refreshStopLabels(); counts(); requestAnimationFrame(declutter); };
  map.on("zoomend", onZoom); map.on("moveend", onMove);

  // ---- panel rows (site classes)
  let ui = null, rows = [];
  if (panel) {
    const chip = (d, color, key) => `<button type="button" class="bc-chip" data-k="${key}" data-d="${d}" title="Within about a ${WALK[d]}-minute walk (${d} m)"><i style="background:${color}"></i>${dlabel(d)}</button>`;
    const html = `
<div class="bc-intro bc-transit"><b>Commuting?</b> See how far SkyTrain is and how often buses come. Turn a layer on to start.</div>
<div class="v5-lrow bc-transit">
  <div class="v5-swatch"><svg width="46" height="22" aria-hidden="true"><circle cx="23" cy="11" r="10" fill="${tint(C.sky, .16)}"/><circle cx="23" cy="11" r="6.5" fill="${tint(C.sky, .36)}"/><circle cx="23" cy="11" r="3.2" fill="#fff" stroke="${C.sky}" stroke-width="2"/></svg></div>
  <div class="v5-lt"><b>SkyTrain nearby<span class="bc-new">New</span></b><small>Shaded areas are a short walk from a station</small></div>
  <button type="button" class="v5-switch" data-bc="sky" aria-label="Show SkyTrain nearby" aria-pressed="false"></button>
</div>
<p class="bc-dl bc-transit" data-bc="sky-x" hidden>Walk to station</p>
<div class="bc-seg bc-transit" data-bc="sky-x" data-pick="skyPick" hidden role="radiogroup" aria-label="Walk to station">
  <button type="button" data-v="400" title="About 400 m">5 min</button><button type="button" data-v="800" title="About 800 m">10 min</button><button type="button" data-v="1200" title="About 1.2 km">15 min</button></div>
<div class="bc-note bc-transit" data-bc="sky-x" hidden aria-live="polite"></div>
<div class="v5-lrow bc-transit">
  <div class="v5-swatch"><svg width="46" height="22" aria-hidden="true"><rect x="4" y="3" width="38" height="16" rx="3" fill="rgba(101,163,13,.08)" stroke="${C.bus15Edge}" stroke-width="1.3"/></svg></div>
  <div class="v5-lt"><b>Frequent buses<span class="bc-new">New</span></b><small>Shaded areas are a short walk from a stop with frequent buses</small></div>
  <button type="button" class="v5-switch" data-bc="bus" aria-label="Show frequent buses" aria-pressed="false"></button>
</div>
<p class="bc-dl bc-transit" data-bc="bus-x" hidden>Bus comes</p>
<div class="bc-seg bc-transit" data-bc="bus-x" data-pick="levelPick" hidden role="radiogroup" aria-label="Bus comes">
  <button type="button" data-v="15" title="A bus at least every 15 minutes">Every 15 min</button><button type="button" data-v="30" title="A bus at least every 30 minutes">Every 30 min</button></div>
<p class="bc-dl bc-transit" data-bc="bus-x" hidden>When</p>
<div class="bc-seg bc-transit" data-bc="bus-x" data-pick="mode" hidden role="radiogroup" aria-label="When">
  <button type="button" data-v="weekday">Weekdays</button><button type="button" data-v="weekend">Weekends</button><button type="button" data-v="all_week">Every day</button></div>
<p class="bc-dl bc-transit" data-bc="bus-x" hidden>Walk to stop</p>
<div class="bc-seg bc-transit" data-bc="bus-x" data-pick="walkPick" hidden role="radiogroup" aria-label="Walk to stop">
  <button type="button" data-v="200" title="About 200 m">3 min</button><button type="button" data-v="400" title="About 400 m">5 min</button><button type="button" data-v="600" title="About 600 m">8 min</button></div>
<div class="bc-note bc-transit" data-bc="bus-x" hidden></div>
${cities ? `<div class="v5-lrow bc-transit" style="display:block">
  <p class="bc-sec">Jump to a city</p><div class="bc-cities" data-bc="cities" role="group" aria-label="Jump to a city">${CITIES.map(([n]) => `<button type="button" class="bc-city" data-city="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join("")}</div>
  <p class="bc-sec">On the map now</p>
  <div class="bc-stats" aria-live="polite"><div class="bc-stat s"><b data-bc="n-sky">–</b><small>SkyTrain stations</small></div>
  <div class="bc-stat b15"><b data-bc="n-15">–</b><small>Stops with a bus every 15 min</small></div><div class="bc-stat b30"><b data-bc="n-30">–</b><small>Stops with a bus every 30 min</small></div></div>
</div>` : ""}`;
    const tpl = document.createElement("template"); tpl.innerHTML = html.trim(); rows = [...tpl.content.children];
    const anchor = [...panel.querySelectorAll(".v5-lrow")].find(r => after.test(r.textContent));
    anchor ? anchor.after(...rows) : panel.append(...rows);
    const q = s => panel.querySelector(`[data-bc="${s}"]`), qa = s => [...panel.querySelectorAll(`[data-bc="${s}"]`)];
    ui = { nSky: q("n-sky") || {}, n15: q("n-15") || {}, n30: q("n-30") || {}, skySw: q("sky"), busSw: q("bus"), skyX: qa("sky-x"), busX: qa("bus-x") };
    ui.skySw.onclick = () => setSkyTrain(!S.sky);
    ui.busSw.onclick = () => setBus(!S.bus);
    panel.querySelectorAll(".bc-seg[data-pick]").forEach(box => box.querySelectorAll("button").forEach(b => b.onclick = () => {
      const k = box.dataset.pick; S[k] = k === "mode" ? b.dataset.v : +b.dataset.v; render();
    }));
    panel.querySelectorAll(".bc-city").forEach(b => b.onclick = () => flyToCity(b.dataset.city));
  }
  function sync() {
    if (!ui) return;
    ui.skySw.classList.toggle("on", S.sky); ui.skySw.setAttribute("aria-pressed", S.sky); ui.skyX.forEach(e => e.hidden = !S.sky);
    ui.busSw.classList.toggle("on", S.bus); ui.busSw.setAttribute("aria-pressed", S.bus); ui.busX.forEach(e => e.hidden = !S.bus);
    panel.querySelectorAll(".bc-seg[data-pick]").forEach(box => box.querySelectorAll("button").forEach(b => {
      const on = String(S[box.dataset.pick]) === b.dataset.v; b.classList.toggle("on", on); b.setAttribute("role", "radio"); b.setAttribute("aria-checked", on); }));
    const notes = panel.querySelectorAll(".bc-note"); notes[0].innerHTML = skySummary(); notes[1].innerHTML = busSummary();
  }


  // Plain-English summary of what the shading means right now
  const orList = a => a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " or " + a[a.length - 1];
  const mlabel = d => (d < 1000 ? d + " m" : (d / 1000).toLocaleString() + " km");
  const picked = obj => Object.keys(obj).filter(d => obj[d]).map(Number).sort((a, b) => a - b);
  const darkerWalk = ds => ds.length > 1 ? ` Darker: within ${orList(ds.slice(0, -1).map(d => WALK[d]))} min (${orList(ds.slice(0, -1).map(mlabel))}).` : "";
  const WHEN = { weekday: "on weekdays (7 a.m. to 7 p.m.)", weekend: "on weekends (10 a.m. to 6 p.m.)", all_week: "every day of the week" };
  const busSummary = () => {
    const ds = picked(S.busD), far = ds[ds.length - 1];
    const how = S.levels[30] ? "at least every 30 min" : "at least every 15 min";
    const darkerBus = S.levels[15] && S.levels[30] ? " Darker green: a bus every 15 min." : "";
    return `<b>Showing:</b> areas within a ${WALK[far]}-min walk (${mlabel(far)}) of a stop with a bus ${how}, ${WHEN[S.mode]}.${darkerBus}${darkerWalk(ds)}`; };
  const skySummary = () => { const ds = picked(S.skyD), far = ds[ds.length - 1];
    return `<b>Showing:</b> areas within a ${WALK[far]}-min walk (${mlabel(far)}) of a SkyTrain station.${darkerWalk(ds)}`; };

  // ---- public API
  function setSkyTrain(on) { S.sky = !!on; if (S.sky) load().catch(e => console.error("Transit data failed to load", e)); render(); }
  function setBus(on) { S.bus = !!on; if (S.bus) load().catch(e => console.error("Transit data failed to load", e)); render(); }
  function setBusMode(mode) { if (NOTES[mode]) { S.mode = mode; render(); } }
  function setLevel(level) { if (level === 15 || level === 30) { S.levelPick = level; render(); } }          // 15 or 30
  function setSkyDistance(d) { if (SKY_D.includes(d)) { S.skyPick = d; render(); } }                       // 400, 800 or 1200 m
  function setBusDistance(d) { if (BUS_D.includes(d)) { S.walkPick = d; render(); } }                      // 200, 400 or 600 m
  function flyToCity(name, zoom = 13) {
    const c = CITIES.find(([n]) => n === name); if (!c) return;
    if (panel) panel.querySelectorAll(".bc-city").forEach(b => b.setAttribute("aria-pressed", b.dataset.city === name));
    map.flyTo(c[1], zoom, { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : .9 });
  }
  function destroy() {
    dead = true;
    subs.clear();
    map.off("zoomend", onZoom); map.off("moveend", onMove);
    [sky, stationLabels, busCircles, stopLabelLayer, ...Object.values(stopDots)].forEach(l => map.removeLayer(l));
    rows.forEach(e => e.remove());
  }
  sync();
  return { load, state: S, getCounts, subscribe, setSkyTrain, setBus, setBusMode, setLevel, setSkyDistance, setBusDistance, flyToCity, destroy };
}
