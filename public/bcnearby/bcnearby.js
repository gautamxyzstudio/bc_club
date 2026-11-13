(() => {
  // ######## PART 4: MAIN CODE starts here. Search the word PART to jump between sections, DEMO START to find demo-only pieces ########
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const TIER_EDGE = [null, "rgba(132,176,80,.55)", "rgba(86,160,74,.6)", "rgba(46,140,118,.65)", "rgba(15,111,105,.75)"];
  const TIER = [null, { name: "Fair", c: css("--bcn-t1") }, { name: "Good", c: css("--bcn-t2") }, { name: "Very good", c: css("--bcn-t3") }, { name: "Excellent", c: css("--bcn-t4") }];
  const WALK_M = 80;                       // metres per minute
  const STREET = 1.3;                       // streets aren't straight: real walk/drive ~30% longer than a straight line
  const walkMin = m => Math.max(2, Math.ceil(m * 1.3 / WALK_M) + 1);   // padded: +30% for streets, +1 min for crossings and lights
  const driveMin = m => m <= 20000 ? Math.max(2, Math.round(m * 1.35 / 550) + 2) : Math.round(20000 * 1.35 / 550 + 2 + (m - 20000) * 1.25 / 1333);
  const durNum = n => n < 60 ? `${n}` : `${Math.floor(n / 60)} h ${n % 60}`;   // 150 -> "2 h 30", then " min" is added after   // ~33 km/h average in town, +2 min to park
  const fmtD = m => m < 950 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(m < 9950 ? 1 : 0)} km`;
  function WD2(m) { const w = walkMin(m), c = durNum(driveMin(m)); return (w <= 45 ? `<span class="wdt">${WALK_SVG}${w} min</span>` : "") + `<span class="wdt">${CAR_SVG}${c} min</span>`; }
  const howFar = m => `<span class="nw">${fmtD(m)} away</span> · ${WD2(m)}`, howFar0 = m => m <= 1600 ? `<span class="nw">${fmtD(m)} away</span> · <span class="walk nw">about ${walkMin(m)} min walk</span>` : `<span class="nw">${fmtD(m)} away</span> · <span class="walk nw">about ${"\u2248 " + durNum(driveMin(m))} min by car</span>`;
  const PARK_RIDE = new Set(["Scott Road Station", "Coquitlam Central Station", "Moody Centre Station", "Burquitlam Station", "Bridgeport Station", "Lincoln Station", "Lafarge Lake-Douglas Station", "Templeton Station"]);
  const WALK20 = 19 * WALK_M / 1.3;          // ~20 min with the same padding
  const WALK10 = 9 * WALK_M / 1.3;          // metres you can cover in ~10 min with our padded walk times
  const busName = rs => (rs.length > 1 ? "Buses " : "Bus ") + rs.join(", ");
  const S = { dview: "places", distOrder: [], mainOrder: [], subOrder: [], lstLL: null, view: "tap", mode: "weekday", tapped: null, lines: true, dist: true, w10: true, w20: false, openGrp: new Set(), mapCats: new Set(), mapGroc: new Set(), mapFaith: new Set(), cats: new Set(["health", "grocery", "park"]), faith: new Set(["sikh", "hindu", "muslim", "christian", "buddhist", "jewish"]), groc: new Set(["supermarket", "south_asian", "chinese"]) };

  // (D5 removed) basemap comes from BCNearbyConfig.basemap / bcnearby-basemap.js
  // ---- theme: colours and font come from BCNearbyConfig.theme (one place), else the defaults in :root
  (function applyTheme() { const th = (window.BCNearbyConfig || {}).theme || {}, r = document.documentElement.style, set = (k, v) => { if (v) r.setProperty(k, v); };
    set("--bcn-navy", th.brand); set("--bcn-orange", th.accent); set("--bcn-ink", th.text); set("--bcn-text", th.text); set("--bcn-muted", th.muted); set("--bcn-line", th.line); set("--bcn-accent-soft", th.accentSoft);
    if (th.font) set("--bcn-font", th.font + ', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    if (th.fontUrl) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = th.fontUrl; document.head.appendChild(l); } })();
  const BRAND = () => getComputedStyle(document.documentElement).getPropertyValue("--bcn-navy").trim() || "#1e4e8c";
  const map = L.map("map", { zoomControl: false, minZoom: (window.BCNearbyConfig || {}).minZoom || 8, maxZoom: (window.BCNearbyConfig || {}).maxZoom || 20 }); window._bcmap = map; window._bcS = S;
  { const ATTR = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · Places: Gov. of BC open data';
    if (typeof window.BCNearbyBasemap === "function") window.BCNearbyBasemap(map, ATTR);
    else L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxNativeZoom: 19, maxZoom: 20, attribution: ATTR }).addTo(map); }
  L.control.zoom({ position: "bottomleft" }).addTo(map);
  for (const [n, z] of [["shade", 380], ["lots", 405], ["parks", 400], ["lines", 450], ["pv", 580], ["dots", 585], ["amen", 595], ["labels", 590], ["pin", 620]]) { const p = map.createPane(n); p.style.zIndex = z; if (n === "shade" || n === "labels") p.style.pointerEvents = "none"; }

  // ---- data + spatial index (buckets about 1.3 km square)
  const BLAT = .012, BLON = .018, bk = (lat, lon) => Math.floor(lat / BLAT) + ":" + Math.floor(lon / BLON);
  const index = items => { const m = new Map(); for (const it of items) { const k = bk(it.lat, it.lon); (m.get(k) || m.set(k, []).get(k)).push(it); } return m; };
  const near = (idx, lat, lon, maxM, test) => {               // all items within maxM metres, nearest first
    const out = [], by = Math.floor(lat / BLAT), bx = Math.floor(lon / BLON), kx = 111320 * Math.cos(lat * Math.PI / 180);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const it of idx.get((by + i) + ":" + (bx + j)) || []) {
      if (test && !test(it)) continue; const dx = (it.lon - lon) * kx, dy = (it.lat - lat) * 110540, d = Math.hypot(dx, dy);
      if (d <= maxM) out.push({ it, d }); }
    return out.sort((a, b) => a.d - b.d);
  };
  const nearest1 = (idx, lat, lon, maxM, test) => {             // nearest distance only (fast path for the score grid)
    let best = Infinity; const by = Math.floor(lat / BLAT), bx = Math.floor(lon / BLON), kx = 111320 * Math.cos(lat * Math.PI / 180);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const it of idx.get((by + i) + ":" + (bx + j)) || []) {
      if (test && !test(it)) continue; const d = Math.hypot((it.lon - lon) * kx, (it.lat - lat) * 110540); if (d < best) best = d; }
    return best <= maxM ? best : Infinity;
  };
  const stations = DATA.stations.features.map(f => ({ lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], name: f.properties.station, label: f.properties.label, lines: f.properties.lines }));
  const stops = DATA.stops.features.map(f => { const p = f.properties; return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], label: p.label, area: p.area, dir: p.direction,
    lv: { weekday: p.weekday, weekend: p.weekend, all_week: p.all_week },
    routes: p.routes.split(";").filter(Boolean).map(x => { const [r, w, sa, su] = x.split("|"); return { r, w: +w || 0, sa: +sa || 0, su: +su || 0 }; }) }; });
  const sIdx = index(stations), bIdx = index(stops);

  // ---- tiering
  const tierAt = (lat, lon) => {
    const dSky = nearest1(sIdx, lat, lon, 800);
    if (dSky <= 400) return 4;
    const d15 = nearest1(bIdx, lat, lon, 400, s => s.lv[S.mode] === 15);
    if (dSky <= 800 || d15 <= 200) return 3;
    if (d15 <= 400) return 2;
    const d30 = nearest1(bIdx, lat, lon, 400, s => s.lv[S.mode] > 0);
    return d30 <= 400 ? 1 : 0;
  };

  // ---- canvas layer: hex score grid or the current-style shading
  const mpp = () => 40075016.686 * Math.cos(map.getCenter().lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8);
  const Shade = L.Layer.extend({
    onAdd(m) { this._c = L.DomUtil.create("canvas", "leaflet-zoom-hide"); this._c.style.position = "absolute"; m.getPane("shade").appendChild(this._c);
      m.on("moveend zoomend resize", this.redraw, this); this.redraw(); },
    onRemove(m) { this._c.remove(); m.off("moveend zoomend resize", this.redraw, this); },
    redraw() {
      if (!this._map) return; const m = this._map, sz = m.getSize(), c = this._c, dpr = devicePixelRatio || 1;
      c.width = sz.x * dpr; c.height = sz.y * dpr; c.style.width = sz.x + "px"; c.style.height = sz.y + "px";
      L.DomUtil.setPosition(c, m.containerPointToLayerPoint([0, 0]));
      const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, sz.x, sz.y);
      if (S.view === "score") drawHexes(g, m, sz); else if (S.view === "areas") drawAreas(g, m, sz);
    }
  });
  const K_LAT = 110540, K_LON = 111320 * Math.cos(49.5 * Math.PI / 180), LAT0 = 48, LON0 = -125;   // fixed grid, so hexes don't jump while panning
  function drawHexes(g, m, sz) {
    const z = m.getZoom(), s = z >= 16 ? 90 : z >= 15 ? 120 : z >= 14 ? 170 : z >= 13 ? 240 : z >= 12 ? 380 : 650;   // hex size in metres
    const b = m.getBounds().pad(.1), w = Math.sqrt(3) * s, h = 1.5 * s, rpx = s / mpp();
    const y0 = Math.floor(((b.getSouth() - LAT0) * K_LAT) / h), y1 = Math.ceil(((b.getNorth() - LAT0) * K_LAT) / h);
    const x0 = Math.floor(((b.getWest() - LON0) * K_LON) / w) - 1, x1 = Math.ceil(((b.getEast() - LON0) * K_LON) / w) + 1;
    const corners = [...Array(6)].map((_, i) => { const a = Math.PI / 180 * (60 * i - 30); return [Math.cos(a), Math.sin(a)]; });
    const byTier = [[], [], [], [], []], tiers = new Map();
    for (let r = y0 - 1; r <= y1 + 1; r++) for (let q = x0 - 1; q <= x1 + 1; q++) {
      const mx = q * w + (r & 1 ? w / 2 : 0), my = r * h, lat = LAT0 + my / K_LAT, lon = LON0 + mx / K_LON;
      const t = tierAt(lat, lon); tiers.set(q + "," + r, t);
      if (t && r >= y0 && r <= y1 && q >= x0 && q <= x1) byTier[t].push({ q, r, p: m.latLngToContainerPoint([lat, lon]) });
    }
    const rr = rpx + .4;                                                  // hexes touch: no gaps, no grid lines
    const pathHex = (p) => { g.moveTo(p.x + corners[0][0] * rr, p.y + corners[0][1] * rr); for (let i = 1; i < 6; i++) g.lineTo(p.x + corners[i][0] * rr, p.y + corners[i][1] * rr); g.closePath(); };
    g.globalAlpha = .22;                                                   // light inside
    for (let t = 1; t <= 4; t++) { if (!byTier[t].length) continue; g.beginPath(); byTier[t].forEach(h => pathHex(h.p)); g.fillStyle = TIER[t].c; g.fill(); }
    g.globalAlpha = 1;
    // outline only where the zone changes: an edge is drawn when the neighbour on that side has a lower score
    const nb = (q, r, e) => { const odd = r & 1;                          // edges 0..5: E, SE, SW, W, NW, NE (screen y points south)
      return [[q + 1, r], [odd ? q + 1 : q, r - 1], [odd ? q : q - 1, r - 1], [q - 1, r], [odd ? q : q - 1, r + 1], [odd ? q + 1 : q, r + 1]][e]; };
    const rs = rpx;
    for (let t = 1; t <= 4; t++) { if (!byTier[t].length) continue; g.beginPath();
      for (const { q, r, p } of byTier[t]) for (let e = 0; e < 6; e++) { const [nq, nr] = nb(q, r, e); if ((tiers.get(nq + "," + nr) || 0) >= t) continue;
        const a = corners[e], b = corners[(e + 1) % 6]; g.moveTo(p.x + a[0] * rs, p.y + a[1] * rs); g.lineTo(p.x + b[0] * rs, p.y + b[1] * rs); }
      g.strokeStyle = TIER_EDGE[t]; g.lineWidth = 1.1; g.lineJoin = "round"; g.stroke(); }
  }
  function drawAreas(g, m, sz) {                                          // light fill + darker outline around the outside only
    const b = m.getBounds().pad(.25), k = 1 / mpp(), px = it => m.latLngToContainerPoint([it.lat, it.lon]), inV = it => b.contains([it.lat, it.lon]);
    const off = document.createElement("canvas"), dpr = devicePixelRatio || 1; off.width = sz.x * dpr; off.height = sz.y * dpr; const o = off.getContext("2d"); o.setTransform(dpr, 0, 0, dpr, 0, 0);
    const path = (ctx, pts, r) => { ctx.beginPath(); for (const p of pts) { ctx.moveTo(p.x + r, p.y); ctx.arc(p.x, p.y, r, 0, 7); } };
    const layer = (pts, r, fill, edge) => { if (!pts.length) return;
      path(g, pts, r); g.fillStyle = fill; g.fill();
      o.clearRect(0, 0, sz.x, sz.y); path(o, pts, r); o.strokeStyle = edge; o.lineWidth = 2.6; o.stroke();
      o.globalCompositeOperation = "destination-out"; path(o, pts, r); o.fillStyle = "#000"; o.fill(); o.globalCompositeOperation = "source-over";
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(off, 0, 0); g.restore(); };
    const p30 = stops.filter(s => s.lv[S.mode] > 0 && inV(s)).map(px), p15 = stops.filter(s => s.lv[S.mode] === 15 && inV(s)).map(px);
    layer(p30, 400 * k, "rgba(132,168,58,.07)", "rgba(77,124,15,.75)");
    if (p15.length) { path(g, p15, 400 * k); g.fillStyle = "rgba(101,163,13,.07)"; g.fill(); }
    const ps = stations.filter(inV).map(px); layer(ps, 800 * k, "rgba(13,148,136,.10)", "rgba(15,118,110,.8)");
  }
  const shade = new Shade().addTo(map);
  const sheetEl = document.getElementById("sheet");
  L.DomEvent.disableClickPropagation(sheetEl); L.DomEvent.disableScrollPropagation(sheetEl);   // taps on the panel stay in the panel

  // ---- transit lines (SkyTrain + frequent buses) and stop dots
  const decode = str => { const pts = []; let i = 0, la = 0, lo = 0; while (i < str.length) { for (const k of [0, 1]) { let r = 0, sh = 0, b;
      do { b = str.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); const d = r & 1 ? ~(r >> 1) : r >> 1; if (k) lo += d; else la += d; } pts.push([la / 1e5, lo / 1e5]); } return pts; };
  const routeData = ROUTES.map(r => ({ ...r, ll: r.lines.map(decode) }));
  const linesR = L.canvas({ pane: "lines", padding: .3 });
  const lineLayer = L.layerGroup(), stopDots = L.layerGroup(), routeLabels = L.layerGroup();
  const BUS_INK = "#4d6b1f";
  function showSky() { return S.dview === "transit" && S.tSky !== false; }   // transit lines only while transit is on
  function showBus() { return S.dview === "transit" && S.tBus !== false; }
  function drawLines() {
    lineLayer.clearLayers();
    if (!S.lines) return;
    for (const r of routeData) { const lv = r[S.mode]; if (!lv || r.rail || !showBus()) continue;
      L.polyline(r.ll, { renderer: linesR, color: BUS_INK, weight: lv === 15 ? 2.2 : 1.4, opacity: lv === 15 ? .5 : .32, interactive: false, lineJoin: "round" }).addTo(lineLayer); }
    for (const r of routeData) { if (!r.rail || !showSky()) continue;                    // SkyTrain on top: white casing + dark line
      L.polyline(r.ll, { renderer: linesR, color: "#fff", weight: 7, opacity: .9, interactive: false }).addTo(lineLayer);
      L.polyline(r.ll, { renderer: linesR, color: css("--bcn-sky-ink"), weight: 4, opacity: .9, interactive: false }).addTo(lineLayer); }
  }
  function drawStops() {                                                  // stop dots and route numbers, only for the visible area
    stopDots.clearLayers(); routeLabels.clearLayers();
    if (!S.lines) return;
    const z = map.getZoom(), b = map.getBounds().pad(.1);
    if (z >= 15 && showBus()) for (const s of stops) { if (!s.lv[S.mode] || !b.contains([s.lat, s.lon])) continue;
      L.circleMarker([s.lat, s.lon], { renderer: linesR, radius: z >= 16 ? 3.5 : 2.6, weight: 1.4, color: BUS_INK, fillColor: "#fff", fillOpacity: 1, interactive: false }).addTo(stopDots); }
    if (z >= 14 && showBus()) { const c = map.getCenter(), inner = map.getBounds().pad(-.08);
      for (const r of routeData) { if (r.rail || !r[S.mode]) continue; let best = null, bd = Infinity;
        for (const line of r.ll) for (let i = 0; i < line.length - 1; i++) { const a = line[i], q = line[i + 1], m = [(a[0] + q[0]) / 2, (a[1] + q[1]) / 2];
          if (!inner.contains(m)) continue; const d = (m[0] - c.lat) ** 2 + (m[1] - c.lng) ** 2; if (d < bd) { bd = d; best = m; } }
        if (best) routeLabels.addLayer(label(best, (/^\d/.test(r.r) ? "Bus " : "") + r.r, "rt", 10 + (r[S.mode] === 15 ? 5 : 0))); } }
  }
  function refreshLines() { drawLines(); drawStops();
    if (typeof stationLayer !== "undefined") { if (showSky()) { stationLayer.addTo(map); if (map.getZoom() >= 12) stationLabels.addTo(map); } else { map.removeLayer(stationLayer); map.removeLayer(stationLabels); } }
    requestAnimationFrame(declutter); }
  map.on("moveend zoomend", () => { drawStops(); requestAnimationFrame(declutter); });

  // ---- nearby places (official BC data + OpenStreetMap)
  const SVG = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const CATS = {
    health:  { name: "Health care", c: "#dc2626", z: 12, ico: SVG('<path d="M12 5v14M5 12h14"/>') },
    grocery: { name: "Grocery", c: "#475569", z: 14, ico: SVG('<path d="M3 4h2l2.4 11h10.2L20 8H7"/><circle cx="9.5" cy="19.5" r="1"/><circle cx="17" cy="19.5" r="1"/>') },
    park:    { name: "Parks", c: "#16a34a", z: 12, ico: SVG('<path d="M12 21v-6"/><path d="M8 15.5a4.5 4.5 0 0 1-1-8.4 5 5 0 0 1 9.6-.6A4.4 4.4 0 0 1 16 15.5z"/>') },
    dog_park:{ name: "Dog parks", c: "#4d7c0f", z: 13, ico: SVG('<circle cx="7" cy="9" r="1.6"/><circle cx="12" cy="6.5" r="1.6"/><circle cx="17" cy="9" r="1.6"/><path d="M8.5 16c0-2.5 1.6-4 3.5-4s3.5 1.5 3.5 4c0 1.6-1.4 2.4-3.5 2.4S8.5 17.6 8.5 16z"/>') },
    beach:   { name: "Beaches", c: "#0284c7", z: 12, ico: SVG('<path d="M3 16c2 0 2-1.5 4.5-1.5S9.5 16 12 16s2.5-1.5 4.5-1.5S19 16 21 16M3 20c2 0 2-1.5 4.5-1.5S9.5 20 12 20s2.5-1.5 4.5-1.5S19 20 21 20"/><circle cx="16" cy="7" r="3"/>') },
    rec:     { name: "Recreation centres", c: "#db2777", z: 12, ico: SVG('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>') },
    school:  { name: "Schools", c: BRAND(), z: 13, ico: SVG('<path d="M3 9.5 12 5l9 4.5-9 4.5z"/><path d="M7 11.5v4.2c0 1.2 2.2 2.3 5 2.3s5-1.1 5-2.3v-4.2M21 9.5v5"/>') },
    worship: { name: "Places of worship", c: "#a16207", z: 14, ico: SVG('<path d="M12 3v4M10 5h4M5 21V11l7-4 7 4v10M9.5 21v-5h5v5"/>') },
  };
  const GROC = { supermarket: ["Supermarkets (Save-On, Safeway, Superstore, FreshCo, Walmart, T&T)", "supermarket"], south_asian: ["South Asian (Fruiticana, Sabzi Mandi…)", "South Asian"], chinese: ["Chinese (PriceSmart, Sungiven…)", "Chinese"], korean_japanese: ["Korean & Japanese (H Mart…)", "Korean / Japanese"],
    filipino_sea: ["Filipino, Vietnamese & other Asian", "Asian"],
    middle_eastern: ["Middle Eastern & halal", "Middle Eastern / halal"], produce: ["Produce & farm markets", "produce"], international: ["European, Latin & African", "community store"], local: ["Local & other grocers", "local"] };
  const GCOL = { supermarket: "#475569", south_asian: "#b45309", chinese: "#b91c1c", korean_japanese: "#4338ca", filipino_sea: "#0e7490", middle_eastern: "#047857", produce: "#65a30d", international: "#7c2d12", local: "#78716c" };
  const FCOL = { sikh: ["#f59e0b", "#1e3a8a"], hindu: ["#9a3412", "#fff"], muslim: ["#15803d", "#fff"], christian: ["#57534e", "#fff"], buddhist: ["#ca8a04", "#7f1d1d"], jewish: ["#1d4ed8", "#fff"] };
  const LONG = { school: "Elementary and secondary, coloured by Fraser rating, with catchments", health: "Hospitals with 24/7 emergency, and urgent care centres", grocery: "Pick the kinds of stores you shop at", park: "City and regional parks, shown as green areas", dog_park: "Off-leash areas for dogs", beach: "Ocean and lake beaches", rec: "Pools, arenas and community centres", worship: "Pick your place of worship" };
  const DESC = { school: "Elementary & secondary, ratings and catchments", health: "Hospitals with ER, urgent care", grocery: "Supermarkets & community stores", park: "Parks and green space", dog_park: "Off-leash areas",
    beach: "Lakes and ocean beaches", rec: "Pools, community centres, arenas", worship: "Gurdwaras, mandirs, mosques, churches…" };
  const REL = { sikh: ['<svg class="fsym" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M12 2.5l1.3 3.2-.3 11.3L12 19l-1-2-.3-11.3z" fill="currentColor" stroke="none"/><circle cx="12" cy="12.6" r="4.8" stroke-width="1.8"/><path d="M7.4 6.4C3.6 9.6 4.2 15.9 9.2 19.1M16.6 6.4c3.8 3.2 3.2 9.5-1.8 12.7" stroke-width="1.7"/><path d="M9.6 20.3h4.8" stroke-width="1.8"/></svg>', "Gurdwara"], hindu: ["ॐ", "Hindu temple"], muslim: ["☪", "Mosque"], christian: ["✝", "Church"], buddhist: ['<svg class="fsym" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M12 4v5.8M12 14.2V20M4 12h5.8M14.2 12H20M6.3 6.3l4.1 4.1M13.6 13.6l4.1 4.1M17.7 6.3l-4.1 4.1M10.4 13.6l-4.1 4.1"/></svg>', "Buddhist temple"], jewish: ["✡", "Synagogue"] };
  const colorFor = p => p.cat === "bus" ? ["#fff", "#4d6b1f", "#4d6b1f"] : p.cat === "sky" ? ["#fff", "#0f766e", "#0f766e"] : p.cat === "school" ? band(p.rating) : p.cat === "health" ? (p.sub === "urgent" ? ["#fff", "#7c3aed", "#7c3aed"] : ["#fff", "#dc2626", "#dc2626"]) : p.cat === "grocery" && GCOL[p.sub] ? [GCOL[p.sub], "#fff"]
    : p.cat === "worship" && FCOL[p.sub] ? [FCOL[p.sub][0], FCOL[p.sub][1]] : [CATS[p.cat].c, "#fff"];
  const dotStyle = p => { const [bg, fg, bd] = colorFor(p); return `background:${bg};color:${fg};${bd ? `border-color:${bd};` : ""}`; };
  const icoFor = p => p.cat === "school" && p.name ? `<span class="scap"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4 1.5 9 12 14l8.5-4.05V16h1.5V9.2z"/><path d="M6 12.6v3.2c0 1.4 2.7 3 6 3s6-1.6 6-3v-3.2L12 15.6z"/></svg></span><span class="srate">${p.rating == null ? "N/R" : rTxt(p.rating)}</span>` : p.cat === "worship" && REL[p.sub] ? `<span class="sym">${REL[p.sub][0]}</span>` : CATS[p.cat].ico;
  // store brands: names only (we don't copy logos). The site can pass licensed logo images: BCNearbyConfig.brandLogo(name) -> image URL
  const BRANDS = [["Real Canadian Superstore", "Superstore"], ["Superstore", "Superstore"], ["Save-On", "Save-On"], ["Save On", "Save-On"], ["Safeway", "Safeway"], ["FreshCo", "FreshCo"], ["Walmart", "Walmart"], ["T&T", "T&T"], ["T & T", "T&T"], ["No Frills", "No Frills"], ["Costco", "Costco"], ["IGA", "IGA"], ["Whole Foods", "Whole Foods"], ["Urban Fare", "Urban Fare"], ["Thrifty", "Thrifty Foods"], ["Nesters", "Nesters"], ["Choices", "Choices"], ["Fruiticana", "Fruiticana"], ["Sabzi Mandi", "Sabzi Mandi"], ["Everything Wholesale", "Everything Wholesale"], ["Punjab Food", "Punjab Foods"], ["PriceSmart", "PriceSmart"], ["Sungiven", "Sungiven"], ["H Mart", "H Mart"], ["H-Mart", "H Mart"], ["Kin's", "Kin's"], ["Buy-Low", "Buy-Low"], ["Buy Low", "Buy-Low"], ["Quality Foods", "Quality Foods"], ["Persia Foods", "Persia Foods"], ["Osaka", "Osaka"], ["99 Ranch", "99 Ranch"], ["Hannam", "Hannam"]];
  const brandOf = n => { if (!n) return ""; const l = n.toLowerCase(); for (const [k, v] of BRANDS) if (l.includes(k.toLowerCase())) return v; return ""; };
  const brandLogo = n => { try { if (typeof CFG.brandLogo === "function") return CFG.brandLogo(brandOf(n) || n, n) || ""; } catch (e) {} return ""; };
  const SUBNAME = { hospital: "Hospital", urgent: "Urgent & primary care", arena: "Arena", rec: "Recreation centre" };
  const places = (AMEN.pts || []).map(r => ({ cat: r[0], sub: r[1], name: r[2], lat: r[3], lon: r[4], addr: r[5], note: r[6] }));
  // schools: Fraser Institute rating + catchments
  const schoolList = (SCHOOLS.schools || []).map(r => ({ cat: "school", sub: r[0] === "E" ? "elem" : "sec", lvl: r[0], name: r[1], lat: r[2], lon: r[3], rating: r[4], rank: r[5], of: r[6], stype: r[7], city: r[8], year: r[9] }));
  places.push(...schoolList);
  let catchments = null;
  const getCatch = () => catchments || (catchments = (SCHOOLS.catch || []).map(([lv, prog, ids, rings, dist, date]) => { const rr = rings.map(decode); let s0 = 90, n0 = -90, w0 = 180, e0 = -180;
    for (const Rg of rr) for (const [y, x] of Rg) { if (y < s0) s0 = y; if (y > n0) n0 = y; if (x < w0) w0 = x; if (x > e0) e0 = x; } return { lv, prog, ids, rr, dist, date, s: s0, n: n0, w: w0, e: e0 }; }));
  // ######## PART 5: FLOOD AREAS ########
  // ===== mapped flood & hazard areas (city + provincial maps). A guide only; never part of the score.
  const HZ = { fp: ["Mapped floodplain (200-year)", "#2563eb"], f20: ["Frequent flood area (20-year)", "#1e3a8a"], cst: ["Coastal flood / sea-level-rise area", "#0891b2"],
    tsu: ["Tsunami planning zone", "#7c3aed"], deb: ["Debris-flow / alluvial-fan area", "#92400e"], drn: ["Drainage / overland flood area", "#0ea5e9"] };
  let floodZ = null;
  const getFlood = () => floodZ || (floodZ = (FLOOD.z || []).map(([hz, si, approx, zone, rings]) => { const rr = rings.map(decode); let s0 = 90, n0 = -90, w0 = 180, e0 = -180;
    for (const Rg of rr) for (const [y, x] of Rg) { if (y < s0) s0 = y; if (y > n0) n0 = y; if (x < w0) w0 = x; if (x > e0) e0 = x; } return { hz, src: (FLOOD.src || [])[si] || ["", "", ""], approx, zone, rr, s: s0, n: n0, w: w0, e: e0 }; }));
  function floodAt(lat, lon) { const hit = getFlood().filter(z => lat >= z.s && lat <= z.n && lon >= z.w && lon <= z.e && z.rr.some(Rg => inRing(lat, lon, Rg)));
    const seen = new Set(); return hit.filter(z => !seen.has(z.hz) && seen.add(z.hz)); }
  const floodR = L.canvas({ pane: "shade", padding: .3 }), floodLayer = L.layerGroup();
  // one-time "I understand" before the flood layer is shown (remembered on this device)
  const ACKS = {
    flood: { key: "bcNearby.floodAck.v1", k: '<i class="fico"></i>Flood risk areas', ok: "Show flood risk areas",
      b: "<p>Flood risk areas are compiled from <b>publicly available</b> city and provincial maps. This is general information only, not advice, and does not tell you whether a property will or will not flood. Check with the city, your insurer or a qualified professional.</p>" },
    school: { key: "bcNearby.schoolAck.v1", k: '<i class="sk2"></i>Schools &amp; catchments', ok: "Show schools",
      b: "<p>School ratings (Fraser Institute Report Card) and catchments (school district maps) are <b>publicly available</b> information. Catchments change and some schools fill up. Confirm an address with the school board before relying on it.</p>" } };
  const ackOK = kind => { try { return localStorage.getItem(ACKS[kind].key) === "1"; } catch (e) { return !!(S.ackMem || {})[kind]; } };
  const floodOK = () => ackOK("flood");
  function askAck(kind, done) { const A = ACKS[kind], box = document.getElementById("fack"), c = document.getElementById("fack-c"), ok = document.getElementById("fack-ok");
    document.getElementById("fack-k").innerHTML = A.k; document.getElementById("fack-b").innerHTML = A.b; ok.textContent = A.ok;
    c.checked = false; ok.disabled = true; box.hidden = false; c.focus({ preventScroll: true });
    c.onchange = () => { ok.disabled = !c.checked; };
    ok.onclick = e => { e.stopPropagation(); try { localStorage.setItem(A.key, "1"); } catch (er) { (S.ackMem = S.ackMem || {})[kind] = true; } box.hidden = true; done(); };
    document.getElementById("fack-x").onclick = e => { e.stopPropagation(); box.hidden = true; }; }
  const askFlood = done => askAck("flood", done);
  function mainGuard(k) { if (k === "school" && !(S.dview === "places" && S.cats.has("school")) && !ackOK("school")) { askAck("school", () => toggleMain("school")); return; } toggleMain(k); }
  function drawFlood() { floodLayer.clearLayers(); if (!S.flood) { map.removeLayer(floodLayer); return; }
    if (PHONE && (S.cats.size || S.dview === "transit" || S.mapCats.size || S.mapGroc.size || S.mapFaith.size)) { S.cats.clear(); S.mainOrder = []; S.subOrder = []; S.groc.clear(); S.faith.clear(); S.mapCats.clear(); S.mapGroc.clear(); S.mapFaith.clear(); S.dview = "places"; S._dist = false; S.skyMap = S.busMap = false;
      toast("Flood risk areas on their own · other layers turned off"); setTimeout(() => { renderChips(); syncTransitBtns(); refreshLines(); drawPlaces(); if (S.tapped) check(...S.tapped); }, 0); }
    for (const z of getFlood()) for (const Rg of z.rr) L.polygon(Rg, { renderer: floodR, color: HZ[z.hz][1], weight: 1, opacity: .55, fillColor: HZ[z.hz][1], fillOpacity: z.hz === "f20" ? .26 : .16, interactive: false }).addTo(floodLayer);
    floodLayer.addTo(map); }
  const band = r => r == null ? ["#94a3b8", "#fff"] : r >= 7.6 ? ["#2e8a4e", "#fff"] : r >= 6 ? ["#c9a514", "#1d1a05"] : r >= 4.1 ? ["#e07b24", "#fff"] : ["#c4322b", "#fff"];
  const rTxt = r => r == null ? "n/r" : r.toFixed(1);
  // the school(s) whose catchment holds this spot, for one level ("E" or "S"); regular program first
  function catchSchool(lat, lon, lv) { const hits = getCatch().filter(c => c.lv === lv && lat >= c.s && lat <= c.n && lon >= c.w && lon <= c.e && c.rr.some(Rg => inRing(lat, lon, Rg)))
      .sort((a, b) => (a.prog === "Regular" ? 0 : 1) - (b.prog === "Regular" ? 0 : 1));
    const kx = 111320 * Math.cos(lat * Math.PI / 180), dd = (y, x) => Math.hypot((x - lon) * kx, (y - lat) * 110540);
    for (const c of hits) { const ss = c.ids.map(i => schoolList[i]).filter(Boolean).sort((a, b) => dd(a.lat, a.lon) - dd(b.lat, b.lon)); if (ss.length) return { p: ss[0], c, shared: ss.length }; } return null; }
  // best school for this home: the catchment school if we know it, otherwise the closest public school of that level
  function schoolFor(lat, lon, lv) { const kx = 111320 * Math.cos(lat * Math.PI / 180), dd = (y, x) => Math.hypot((x - lon) * kx, (y - lat) * 110540);
    const cs = catchSchool(lat, lon, lv); if (cs) return { p: cs.p, d: dd(cs.p.lat, cs.p.lon), inCatch: true, c: cs.c, shared: cs.shared };
    if (lv === "M") return null;                       // middle schools only where a district has them (Kelowna, Abbotsford)
    const want = lv === "E" ? (p => p.lvl === "E") : (p => p.lvl === "S");
    const n = nearestPlace("school", lat, lon, p => want(p) && p.stype !== "Independent"); return n ? { ...n, inCatch: false } : null; }
  let parks = null;                                                       // decoded on first use
  const getParks = () => parks || (parks = (AMEN.parks || []).map(([name, lat, lon, ha, rings]) => { const rr = rings.map(decode); let s = 90, n = -90, w = 180, e = -180;
    for (const R of rr) for (const [y, x] of R) { if (y < s) s = y; if (y > n) n = y; if (x < w) w = x; if (x > e) e = x; } return { name, lat, lon, ha, rr, s, n, w, e }; }));
  const parkR = L.canvas({ pane: "parks", padding: .3 });
  const amenLayer = L.layerGroup().addTo(map), parkLayer = L.layerGroup().addTo(map), amenLabels = L.layerGroup().addTo(map);
  function drawPlaces() {
    amenLayer.clearLayers(); parkLayer.clearLayers(); amenLabels.clearLayers();
    if (S.dview === "transit" || (!S.mapCats.size && !S.mapGroc.size && !S.mapFaith.size && !S.cats.size)) return;   // place icons never mix with transit
    const z = map.getZoom(), b = map.getBounds().pad(.15);
    const parkOn = S.mapCats.has("park") || (S.dview === "places" && S.cats.has("park"));
    if ((parkOn && z >= 12) || (!parkOn && z >= 14 && S.dview !== "transit")) for (const pk of getParks()) {   // Parks off: still tappable from zoom 14, drawn invisible until tapped
      if (pk.n < b.getSouth() || pk.s > b.getNorth() || pk.e < b.getWest() || pk.w > b.getEast()) continue;
      if ((z === 12 && pk.ha < 8) || (z === 13 && pk.ha < 2)) continue;
      const base = parkOn ? { weight: 1, opacity: .5, fillOpacity: .12 } : { weight: 0, opacity: 0, fillOpacity: 0 };
      const pg = L.polygon(pk.rr, Object.assign({ renderer: parkR, color: "#15803d", fillColor: "#22c55e", interactive: true, bubblingMouseEvents: false }, base)).addTo(parkLayer); pg._base = base;
      pg.on("mouseover", e => { if (byMouse()) parkTip(pk, pg, e.latlng); }); pg.on("mouseout", amTipOut); pg.on("click", e => { L.DomEvent.stopPropagation(e); parkTip(pk, pg, e.latlng, true); });
      if (parkOn && ((z >= 14 && pk.ha >= 1.5) || (z >= 15 && pk.ha >= .4) || z >= 16)) { const nm = L.marker([pk.lat, pk.lon], { pane: "amen", interactive: true, keyboard: false, icon: L.divIcon({ className: "", html: `<div class="pkn">${esc(pk.name.length > 26 ? pk.name.slice(0, 25) + "…" : pk.name)}</div>`, iconSize: [0, 0] }) }).addTo(amenLabels);
        nm.on("click", e => { L.DomEvent.stopPropagation(e); parkTip(pk, pg, L.latLng(pk.lat, pk.lon), true); }); nm.on("mouseover", e => { if (byMouse()) parkTip(pk, pg, L.latLng(pk.lat, pk.lon)); }); nm.on("mouseout", amTipOut); }
    }
    const grocOn = S.mapGroc.size || (S.dview === "places" && S.cats.has("grocery") && S.groc.size);
    for (const p of places) { if (p.cat === "park") continue;
      const dOn = S.dview === "places" && S.cats.has(p.cat), vis = p.cat === "school" && !lvOn(p.lvl) ? false : p.cat === "health" && !hOk(p) ? false : p.cat === "worship" ? S.mapFaith.has(p.sub) || (dOn && S.faith.has(p.sub)) : p.cat === "grocery" ? S.mapGroc.has(p.sub) || (dOn && S.groc.has(p.sub)) : S.mapCats.has(p.cat) || dOn;
      if (!vis) { if (grocOn && p.cat === "grocery" && z >= 14 && b.contains([p.lat, p.lon])) {   // other grocers: quiet grey dots, tap to see which store
          const q = L.marker([p.lat, p.lon], { pane: "amen", interactive: true, keyboard: false, title: "", icon: L.divIcon({ className: "", html: `<div class="am q">${CATS.grocery.ico}${(() => { const nm = (z >= 16 || (z >= 15 && S.tapped && driveMin(map.distance(S.tapped, [p.lat, p.lon])) <= 15)) ? (brandOf(p.name) || (p.name.length > 20 ? p.name.slice(0, 19).trim() + "…" : p.name)) : ""; return nm ? `<span class="amb">${esc(nm)}</span>` : ""; })()}</div>`, iconSize: [0, 0] }) }).addTo(amenLayer);
          q.on("mouseover", () => { if (byMouse()) amTip(p); }); q.on("mouseout", amTipOut); q.on("click", e => { L.DomEvent.stopPropagation(e); amTip(p, true); }); }
        continue; }
      const cz = p.cat === "worship" ? (p.sub === "christian" ? 14 : 12) : CATS[p.cat].z - (p.cat === "health" && p.sub === "hospital" ? 1 : 0);
      if (z < cz || !b.contains([p.lat, p.lon])) continue;
      if (p.cat === "school") { const i = schoolList.indexOf(p), open = S.openCatch && S.openCatch.has(i);
        if (S.tapped && !S._hsK) { S._hsK = S.tapped.join(); S._hs = new Set(["E", "M", "S"].map(lv => { const n = schoolFor(S.tapped[0], S.tapped[1], lv); return n && n.p; }).filter(Boolean)); }
        if (S.tapped && S._hsK !== S.tapped.join()) { S._hsK = null; S._hs = new Set(["E", "M", "S"].map(lv => { const n = schoolFor(S.tapped[0], S.tapped[1], lv); return n && n.p; }).filter(Boolean)); S._hsK = S.tapped.join(); }
        const sdim = S.tapped && S._hs && !S._hs.has(p) && !open;   // a home is open: its own schools stay bright, the rest step back
        const mk = L.marker([p.lat, p.lon], { pane: "amen", interactive: true, keyboard: true, title: p.name + " · tap to " + (open ? "hide" : "show") + " catchment", icon: L.divIcon({ className: "", html: `<div class="am tapme${open ? " open" : ""}${sdim ? " sdim" : ""}" style="${dotStyle(p)}">${icoFor(p)}</div>`, iconSize: [0, 0] }) }).addTo(amenLayer);
        mk.on("click", e => { L.DomEvent.stopPropagation(e); toggleCatch(i); amTip(p, true); }); mk.on("mouseover", () => { if (byMouse()) amTip(p); }); mk.on("mouseout", amTipOut); continue; }
      const home = S.tapped, near15 = home && z >= 14 && driveMin(map.distance(home, [p.lat, p.lon])) <= 15;   // names written for places within a 15-min drive of the home
      const bl = p.cat === "grocery" && brandLogo(p.name), bn = (p.cat === "grocery" && z >= 15 && brandOf(p.name)) || (near15 && (brandOf(p.name) || (p.name.length > 22 ? p.name.slice(0, 21).trim() + "…" : p.name)));
      const mk2 = L.marker([p.lat, p.lon], { pane: "amen", interactive: true, keyboard: false, title: "", icon: L.divIcon({ className: "", html: `<div class="am soft${bl ? " logo" : ""}" style="--bcn-c:${colorFor(p)[0] === "#fff" ? colorFor(p)[1] : colorFor(p)[0]}">${bl ? `<img src="${esc(bl)}" alt="">` : icoFor(p)}${bn ? `<span class="amb">${esc(bn)}</span>` : ""}</div>`, iconSize: [0, 0] }) }).addTo(amenLayer);
      mk2.on("mouseover", () => { if (byMouse()) amTip(p); }); mk2.on("mouseout", amTipOut); mk2.on("click", e => { L.DomEvent.stopPropagation(e); amTip(p, true); });
    }
  }
  // hover (mouse) or tap (finger) any place icon: a small tag with its name and distance from the home; goes away on mouse-out, after a few seconds, or when the map moves
  let lastTouch = 0; document.addEventListener("touchstart", () => { lastTouch = Date.now(); }, { capture: true, passive: true });
  const byMouse = () => Date.now() - lastTouch > 900;   // hover only for a real mouse
  const amTipEl = document.createElement("div"); amTipEl.className = "amtip"; amTipEl.hidden = true; map.getContainer().appendChild(amTipEl); let amTipT = 0, amTipP = null;
  let amTouchAt = 0; const amTipOut = () => { if (Date.now() - amTouchAt > 4000) amTipHide(); };   // a finger tap also fires mouse-out: keep the tag for its few seconds
  const pvLayer = L.layerGroup().addTo(map); let pvKey = "", pvPark = null, pvAnim = null;
  let lockT = 0; function lockHint() { if (cardTapMsg()) return; if (Date.now() - lockT < 15000) return; lockT = Date.now(); if (window.BCNearby && BCNearby._pointLock && BCNearby._pointLock()) return; toast(S.lstLL ? "This home stays selected · tap ✕ Close at the bottom to pick another" : "This spot stays selected · tap ✕ Close at the bottom to pick another"); }
  function amTipHide() { clearTimeout(amTipT); amTipEl.hidden = true; amTipP = null; pvKey = ""; if (pvAnim) { pvAnim.cancel(); pvAnim = null; } pvLayer.clearLayers();
    if (pvPark) { pvPark.setStyle(pvPark._base || { weight: 1, opacity: .5, fillOpacity: .12 }); pvPark = null; } }
  function amPreview(p, home) {   // a light line drawn from the place back to the home, with a soft dot flowing home-wards; sits under the selected lines
    const key = p.lat + "," + p.lon; if (key === pvKey) return; pvKey = key; if (pvAnim) { pvAnim.cancel(); pvAnim = null; } pvLayer.clearLayers();
    const A = [home[0], home[1]], B = [p.lat, p.lon], [bg, , bd] = colorFor(p), col = bd || bg;
    const ls = [L.polyline([B, A], { pane: "pv", color: "#fff", weight: 4.5, opacity: .7, interactive: false }).addTo(pvLayer),
      L.polyline([B, A], { pane: "pv", color: col, weight: 2, opacity: .6, dashArray: "2 7", lineCap: "round", interactive: false, className: "pvl" }).addTo(pvLayer)];
    if (STILL()) return; growLine(ls, B, A, 400);
    const dot = L.polyline([B, A], { pane: "pv", color: col, weight: 4, opacity: .75, lineCap: "round", interactive: false, className: "flowdot" }).addTo(pvLayer);
    setTimeout(() => { const el = dot._path; if (!el || !dot._map || pvKey !== key) return; const L0 = el.getTotalLength(); if (L0 < 30) return; el.style.strokeDasharray = `0 ${L0 * 2}`;
      pvAnim = el.animate([{ strokeDashoffset: 0, opacity: 0 }, { strokeDashoffset: -L0 * .06, opacity: .8, offset: .08 }, { strokeDashoffset: -L0 * .94, opacity: .8, offset: .6 }, { strokeDashoffset: -L0, opacity: 0, offset: .68 }, { strokeDashoffset: -L0, opacity: 0 }],
        { duration: Math.max(1800, Math.min(3000, 1200 + L0 * 2.5)), iterations: Infinity }); }, 420); }
  function placeTip(anchor) {   // put the tag where it covers none of the selected labels, icons, house tag or buttons
    const mr = map.getContainer().getBoundingClientRect(), W = mr.width, H = mr.height, w = amTipEl.offsetWidth, h = amTipEl.offsetHeight, g = 16;
    const obs = [...document.querySelectorAll(".ll, .bc-co .co, .am.sel, .am.tapme, .lp.on, .pin, #fab, .nearme, .srch, .sbar, .srch-dd:not([hidden]), .samplechip, #lcard:not([hidden]), .cap, .ringsvg text")].map(e => e.getBoundingClientRect()).filter(r => r.width && r.height)
      .map(r => ({ l: r.left - mr.left - 3, t: r.top - mr.top - 3, r: r.right - mr.left + 3, b: r.bottom - mr.top + 3 }));
    const cover = (x, y) => obs.reduce((s, o) => s + Math.max(0, Math.min(x + w, o.r) - Math.max(x, o.l)) * Math.max(0, Math.min(y + h, o.b) - Math.max(y, o.t)), 0);
    const cl = (x, y) => [Math.max(6, Math.min(W - w - 6, x)), Math.max(6, Math.min(H - h - 6, y))];
    const spots = [[anchor.x - w / 2, anchor.y - h - g], [anchor.x - w / 2, anchor.y + g], [anchor.x + g, anchor.y - h / 2], [anchor.x - w - g, anchor.y - h / 2],
      [anchor.x + g, anchor.y - h - g / 2], [anchor.x - w - g, anchor.y - h - g / 2], [anchor.x + g, anchor.y + g / 2], [anchor.x - w - g, anchor.y + g / 2]].map(([x, y]) => cl(x, y));
    let best = spots[0], bc = Infinity; for (const [x, y] of spots) { const c = cover(x, y) + (Math.hypot(x + w / 2 - anchor.x, y + h / 2 - anchor.y) > 200 ? 1e5 : 0); if (c < bc) { bc = c; best = [x, y]; } if (c === 0) break; }
    amTipEl.style.left = best[0] + "px"; amTipEl.style.top = best[1] + "px"; }
  function amTip(p, touch, at) { if (!touch && S.noTipUntil && Date.now() < S.noTipUntil) return;
    const home = S.tapped || S.lstLL; let dTxt = "";
    if (home) { amPreview(p, home); const kx = 111320 * Math.cos(home[0] * Math.PI / 180), d = Math.hypot((p.lon - home[1]) * kx, (p.lat - home[0]) * 110540), q = tm(d);
      if (d < 15) dTxt = `<span class="amd">The home is right here</span>`; else if (q) dTxt = `<span class="amd">${fmtD(d)} &middot; ${q.n} min ${q.w}</span>`; }
    const kind = p.kind ? p.kind : p.cat === "school" ? (p.rating == null ? "School &middot; not ranked" : "School &middot; Fraser " + rTxt(p.rating) + "/10") : p.cat === "health" ? (p.sub === "urgent" ? "Urgent care" : p.note === "Emergency 24/7" ? "Hospital &middot; ER 24/7" : "Hospital")
      : p.cat === "rec" ? (p.sub === "arena" ? "Arena" : "Recreation centre") : p.cat === "grocery" ? (p.sub === "supermarket" ? "Supermarket" : GROC[p.sub] ? GROC[p.sub][1] + " grocery" : "Grocery") : p.cat === "worship" ? (FN2[p.sub] || "Place of worship")
      : p.cat === "park" && p.ha ? (p.ha >= 10 ? "Large park" : p.ha >= 2 ? "Neighbourhood park" : "Small park") : ({ park: "Park", dog_park: "Dog park", beach: "Beach" })[p.cat] || "";
    amTipEl.innerHTML = `<b>${esc(short(p.name || kind, 38))}</b><small>${kind}</small>${dTxt}`; amTipEl.hidden = false; amTipP = p;
    placeTip(map.latLngToContainerPoint(at || [p.lat, p.lon]));
    clearTimeout(amTipT); if (touch) { amTouchAt = Date.now(); amTipT = setTimeout(amTipHide, 4000); } }
  function parkTip(pk, pg, at, touch) {   // parks: light up the park, measure to its nearest edge (where you'd walk in), tag at the finger / mouse
    if (pvPark && pvPark !== pg) pvPark.setStyle(pvPark._base || { weight: 1, opacity: .5, fillOpacity: .12 }); pvPark = pg; pg.setStyle({ weight: 2.2, opacity: .95, fillOpacity: .28 }); pg.bringToFront();
    const home = S.tapped || S.lstLL; let e = [pk.lat, pk.lon];
    if (home) { const kx = 111320 * Math.cos(home[0] * Math.PI / 180), dd = (y, x) => Math.hypot((x - home[1]) * kx, (y - home[0]) * 110540);
      if (pk.rr.some(R => inRing(home[0], home[1], R))) e = [home[0], home[1]]; else { let d = Infinity; for (const R of pk.rr) for (const [y, x] of R) { const q = dd(y, x); if (q < d) { d = q; e = [y, x]; } } } }
    amTip({ cat: "park", name: pk.name || "Park", lat: e[0], lon: e[1], ha: pk.ha }, touch, at); }
  map.on("movestart zoomstart", amTipHide); map.on("click", () => { if (Date.now() - amTouchAt > 700) amTipHide(); });
  // tap a school icon to show / hide its catchment (catchments stay off until asked for)
  const catchLayer = L.layerGroup().addTo(map); S.openCatch = new Set();
  function drawCatch() { catchLayer.clearLayers(); if (S.dview === "transit") return;
    for (const i of S.openCatch) { const sc = schoolList[i]; if (!sc) continue; const cc = band(sc.rating)[0];
      for (const c of getCatch()) if (c.ids.includes(i)) for (const Rg of c.rr) L.polygon(Rg, { pane: "shade", color: cc, weight: 2.6, opacity: .95, fillColor: cc, fillOpacity: sc.lvl === "E" ? .2 : .1, dashArray: sc.lvl === "E" ? null : "8 5", interactive: false }).addTo(catchLayer); } }
  function toggleCatch(i) { const sc = schoolList[i]; if (!sc) return; const has = getCatch().some(c => c.ids.includes(i));
    if (!has) { toast(`${sc.name}: no catchment map for this school`); return; }
    if (S.openCatch.has(i)) { S.openCatch.delete(i); toast("Catchment hidden"); } else { if (PHONE) S.openCatch.clear(); S.openCatch.add(i); toast(`${sc.name} catchment · confirm with the school board`); if (window.BCNearby && BCNearby._catchOffer) BCNearby._catchOffer(i); }
    drawCatch(); drawPlaces(); }
  map.on("moveend zoomend", () => { drawPlaces(); requestAnimationFrame(declutter); requestAnimationFrame(nameDeclutter); });
  function nameDeclutter() {   // place names: keep the ones that fit, drop the ones that would cover another name, a price tag or the card
    const keep = [...document.querySelectorAll(".lp, .ll, .lcard:not([hidden]), .sbar, .bstack > :not([hidden]), .pkn")].map(e => e.getBoundingClientRect());
    for (const el of document.querySelectorAll(".amb")) { el.style.visibility = ""; const r = el.getBoundingClientRect();
      if (keep.some(q => r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top)) { el.style.visibility = "hidden"; continue; } keep.push(r); } }
  const inRing = (y, x, R) => { let c = false; for (let i = 0, j = R.length - 1; i < R.length; j = i++) { const [yi, xi] = R[i], [yj, xj] = R[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  function nearestPlace(cat, lat, lon, test) {
    const kx = 111320 * Math.cos(lat * Math.PI / 180), dd = (y, x) => Math.hypot((x - lon) * kx, (y - lat) * 110540);
    if (cat === "park") { let best = null;
      const cand = getParks().filter(pk => pk.ha >= 1).map(pk => [pk, dd(pk.lat, pk.lon)]).sort((a, b) => a[1] - b[1]).slice(0, 12).map(x => x[0]);   // closest few by centre, then exact
      for (const pk of cand) {
        let d = Infinity, at = null; if (pk.rr.some(R => inRing(lat, lon, R))) { d = 0; at = [lat, lon]; }
        else for (const R of pk.rr) for (const [y, x] of R) { const q = dd(y, x); if (q < d) { d = q; at = [y, x]; } }
        if (!best || d < best.d) best = { p: { cat, name: pk.name, lat: at[0], lon: at[1] }, d }; }
      return best; }
    let best = null; for (const p of places) { if (p.cat !== cat || (test && !test(p))) continue;   // no distance limit: a beach 200 km away is still shown
      const d = dd(p.lat, p.lon); if (!best || d < best.d) best = { p, d }; }
    return best;
  }
  const chipBox = document.getElementById("chips"), grocBox = document.getElementById("grocs"), faithBox = document.getElementById("faiths");
  const FNAME = { sikh: "Gurdwaras", hindu: "Hindu temples", muslim: "Mosques", christian: "Churches", buddhist: "Buddhist", jewish: "Synagogues" };
  const redraw = () => { renderRefine(); drawPlaces(); if (S.tapped) check(...S.tapped); requestAnimationFrame(declutter); };
  for (const [k, c] of Object.entries(CATS)) {
    const row = document.createElement("div"); row.className = "vrow";
    const sample = k === "grocery" ? { cat: k, sub: "south_asian" } : k === "worship" ? { cat: k, sub: "sikh" } : { cat: k };
    row.innerHTML = `<div class="vsw"><div class="am" style="position:static;transform:none;${dotStyle(sample)}">${k === "worship" ? icoFor(sample) : c.ico}</div></div>
      <div class="vt"><b>${c.name}</b><small>${DESC[k]}</small></div>`;
    row.classList.add("tgrow");
    const tgs = document.createElement("div"); tgs.className = "tgs";
    const eye = document.createElement("button"); eye.type = "button"; eye.className = "tg eye"; eye.title = "Show all " + c.name.toLowerCase() + " on the map";
    eye.setAttribute("aria-pressed", S.mapCats.has(k)); eye.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></svg>On map';
    const b = document.createElement("button"); b.type = "button"; b.className = "tg bcn-chip"; b.dataset.k = k; b.title = "Show how far the closest one is when you tap";
    b.setAttribute("aria-pressed", S.cats.has(k)); b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="6" r="2.2"/><path d="M7 16.5 17 7.5" stroke-dasharray="2.5 3"/></svg>Distance';
    eye.onclick = e => { e.stopPropagation(); const on = !S.mapCats.has(k); on ? S.mapCats.add(k) : S.mapCats.delete(k); eye.setAttribute("aria-pressed", on);
      if (k === "grocery") S.mapGroc = on ? new Set(Object.keys(GROC)) : new Set(); if (k === "worship") S.mapFaith = on ? new Set(Object.keys(REL)) : new Set();
      if (on && map.getZoom() < (k === "park" ? 12 : CATS[k].z)) map.setZoom(k === "park" ? 13 : CATS[k].z);
      syncSubs(); redraw(); };
    b.onclick = e => { e.stopPropagation(); S.cats.has(k) ? S.cats.delete(k) : S.cats.add(k); b.setAttribute("aria-pressed", S.cats.has(k)); syncSubs(); syncAll(); redraw(); };
    tgs.append(eye, b); row.appendChild(tgs);
    chipBox.appendChild(row);
    if (k === "grocery") chipBox.appendChild(grocBox); if (k === "worship") chipBox.appendChild(faithBox); }
  const subChip = (box, set, key, label, dot) => { const b = document.createElement("button"); b.type = "button"; b.className = "fchip"; b.innerHTML = `${dot}${label}`;
    b.setAttribute("aria-pressed", set.has(key)); b.onclick = () => { set.has(key) ? set.delete(key) : set.add(key); b.setAttribute("aria-pressed", set.has(key)); redraw(); }; box.appendChild(b); };
  for (const [g, [full]] of Object.entries(GROC)) subChip(grocBox, S.groc, g, full.replace(/ \(.*\)$/, ""), `<i style="background:${GCOL[g]}"></i>`);
  for (const [f, [sym]] of Object.entries(REL)) subChip(faithBox, S.faith, f, FNAME[f], `<span style="display:inline-grid;place-items:center;width:16px;height:16px;border-radius:50%;font-size:10px;background:${FCOL[f][0]};color:${FCOL[f][1]}">${sym}</span>`);
  L.DomEvent.disableClickPropagation(chipBox);
  const syncSubs = () => { faithBox.hidden = !(S.cats.has("worship") || S.mapCats.has("worship")); grocBox.hidden = !(S.cats.has("grocery") || S.mapCats.has("grocery")); };
  const syncFaith = syncSubs;
  syncSubs();
  const allBtn = document.getElementById("allbtn"), ALL = Object.keys(CATS);
  const syncAll = () => { allBtn.textContent = ALL.every(k => S.cats.has(k)) ? "All distances off" : "All distances on"; };
  allBtn.onclick = () => { const on = !ALL.every(k => S.cats.has(k)); ALL.forEach(k => on ? S.cats.add(k) : S.cats.delete(k));
    chipBox.querySelectorAll(".bcn-chip").forEach(b => b.setAttribute("aria-pressed", S.cats.has(b.dataset.k))); syncSubs(); syncAll();
    drawPlaces(); if (S.tapped) check(...S.tapped); requestAnimationFrame(declutter); };
  syncAll();
  S.slv = new Set(innerWidth <= 720 ? ["E"] : ["E", "S"]);   // school levels: E = elementary, S = middle & secondary
  const lvOn = lv => S.slv.has(lv === "M" ? "S" : lv);
  S.hlv = new Set(innerWidth <= 720 ? ["er"] : ["er", "uc"]);   // health: er = hospital with 24/7 emergency, uc = urgent & primary care centre
  const isER = p => p.note === "Emergency 24/7", hOk = p => p.sub === "urgent" ? S.hlv.has("uc") : isER(p) && S.hlv.has("er");
  const ucHrs = p => { const m = /Mon (\d\d):(\d\d) - (\d\d):(\d\d)/.exec(p.note || ""); if (!m) return "not open 24/7"; const f = (h, mi) => { h = +h; const s = h >= 12 ? "pm" : "am", hh = h % 12 || 12; return hh + (mi !== "00" ? ":" + mi : "") + " " + s; }; return "Mon\u2013Thu " + f(m[1], m[2]) + "\u2013" + f(m[3], m[4]) + " \u00b7 check hours"; };
  S.tSky = true; S.tBus = true; S.skyMap = false; S.busMap = false;   // transit lines hide while places are on, show when transit is on
  Object.defineProperty(S, "lines", { configurable: true, get() { return S.skyMap || S.busMap; }, set(v) { S.skyMap = S.busMap = v; } });
  const swL = { setAttribute() {} }, swD = { setAttribute() {} };
  S._dist = true; Object.defineProperty(S, "dist", { get() { return S._dist && S.dview === "transit"; }, set(v) { S._dist = v; } });
  const PRESETS = {
    everyday: { dist: ["health", "grocery"], map: [], groc: ["supermarket"] },
    commuter: { dist: ["grocery", "health"], map: [], groc: ["supermarket"], transit: true },
    family:   { dist: ["health", "park", "rec", "grocery"], map: ["park"], groc: ["supermarket", "produce"] },
    faith:    { dist: ["worship", "grocery"], map: ["worship"], groc: ["south_asian", "chinese", "filipino_sea", "middle_eastern"], mapFaith: ["sikh", "hindu", "muslim", "christian", "buddhist", "jewish"] },
    pet:      { dist: ["dog_park", "park", "beach"], map: ["dog_park"], groc: ["supermarket"] },
  };
  const preBox = document.getElementById("presets");
  // "Your choices": the active places, each with its specific types (Gurdwaras, Churches, Fruiticana-type stores…)
  function syncButtons() {
    chipBox.querySelectorAll(".tg.bcn-chip").forEach(b => b.setAttribute("aria-pressed", S.cats.has(b.dataset.k)));
    grocBox.querySelectorAll(".fchip").forEach((b, i) => b.setAttribute("aria-pressed", S.groc.has(Object.keys(GROC)[i])));
    faithBox.querySelectorAll(".fchip").forEach((b, i) => b.setAttribute("aria-pressed", S.faith.has(Object.keys(REL)[i])));
    syncSubs(); syncAll();
  }
  const PHONE = innerWidth <= 720;
  // ######## PART 6: LAYERS / WHAT GETS A DISTANCE LINE ########
  // ===== chip bar: what gets a distance line (max 2 categories, max 2 store/faith types; transit never mixes with places)
  const CHIPS = ["sky", "bus", "health", "grocery", "park", "dog_park", "beach", "rec", "worship"];
  const GSHORT = { supermarket: "Supermarkets", south_asian: "South Asian", chinese: "Chinese", korean_japanese: "Korean & Japanese", filipino_sea: "Filipino & Asian", middle_eastern: "Middle Eastern", produce: "Produce", international: "Euro, Latin, African", local: "Local grocers" };
  const FN2 = { sikh: "Gurdwara", hindu: "Mandir", muslim: "Mosque", christian: "Church", buddhist: "Buddhist temple", jewish: "Synagogue" };
  const CHIPNAME = { school: "Schools", health: "Health care", grocery: "Grocery", park: "Parks", dog_park: "Dog parks", beach: "Beaches", rec: "Recreation centres", worship: "Worship" };
  function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; const lm = document.getElementById("lymenu"); t.classList.toggle("low", !!lm && !lm.hidden); t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 3200); }
  function syncTransitBtns() { const t = S.dview === "transit", set = (id, v) => { const b = document.getElementById(id); if (b) b.setAttribute("aria-pressed", v); };
    set("dist-sky", t && S.tSky); set("dist-bus", t && S.tBus); set("map-sky", S.skyMap); set("map-bus", S.busMap);
    const w = document.getElementById("when-wrap"); if (w) w.classList.toggle("dim", t && !S.tBus); }
  const SAVE_KEY = "bcNearby.choices";
  function saveChoices() { if (!S.saveOn) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, dview: S.dview, cats: [...S.cats], groc: [...S.groc], faith: [...S.faith],
    mapCats: [...S.mapCats], mapGroc: [...S.mapGroc], mapFaith: [...S.mapFaith], tSky: S.tSky, tBus: S.tBus, w10: S.w10, w20: S.w20, flood: !!S.flood, slv: [...S.slv], hlv: [...S.hlv], lots: !!S.lots, scoreMap: !!S.scoreMap, lymode: S.lymode || "dist" })); } catch (e) {} }
  function floodOffForPhone() { if (PHONE && S.flood) { S.flood = false; drawFlood(); } }
  function sync2() { saveChoices(); if (S.openCatch && !(S.dview === "places" && (S.cats.has("school") || S.mapCats.has("school")))) { S.openCatch.clear(); drawCatch(); } renderChips(); syncButtons(); syncTransitBtns(); refreshLines(); redraw(); }
  function setTransit(on) { if (on) floodOffForPhone(); const had = S.dview === "places" && S.cats.size; S.dview = on ? "transit" : "places"; S._dist = on; S.skyMap = S.busMap = on;
    if (on && had) toast("Transit on its own · places turned off"); sync2(); }
  const nearSky = () => { const c = map.getCenter(), kx = 111320 * Math.cos(c.lat * Math.PI / 180); return stations.some(st => Math.hypot((st.lon - c.lng) * kx, (st.lat - c.lat) * 110540) < 30000); };
  function toggleTransit(k) {                     // k = "sky" | "bus"; one at a time, places never
    const key = k === "sky" ? "tSky" : "tBus", other = k === "sky" ? "tBus" : "tSky";
    if (k === "sky" && !nearSky() && !(S.dview === "transit" && S.tSky)) { toast("No SkyTrain in this area · try Buses"); return; }
    if (S.dview !== "transit") { S[key] = true; S[other] = false; setTransit(true); return; }
    if (S[key]) { S[key] = false; if (!S[other]) { setTransit(false); return; } } else { S[key] = true; S[other] = false; }   // one service at a time on every screen
    sync2(); }
  function dropMain(k) { S.cats.delete(k); S.mainOrder = S.mainOrder.filter(x => x !== k);
    if (k === "grocery") { S.subOrder = S.subOrder.filter(x => !x.startsWith("g:")); S.groc.clear(); }
    if (k === "worship") { S.subOrder = S.subOrder.filter(x => !x.startsWith("f:")); S.faith.clear(); } }
  function addMain(k) { floodOffForPhone(); if (S.dview === "transit") { toast("Places on · transit turned off"); S.skyMap = S.busMap = false; }
    // schools show on their own (catchments are busy): schools on -> other places off, another place on -> schools off
    if (k === "school") { const others = [...S.cats].filter(x => x !== "school"); if (others.length) { others.forEach(dropMain); toast("Schools on their own · other places turned off"); } }
    else if (S.cats.has("school")) { dropMain("school"); toast("Schools turned off"); }
    S.dview = "places"; S.cats.add(k); S.mainOrder = S.mainOrder.filter(x => x !== k); S.mainOrder.push(k);
    while (S.mainOrder.length > (PHONE ? 1 : 2)) { const d = S.mainOrder[0]; dropMain(d); toast(PHONE ? `One at a time on phone · ${CHIPNAME[d]} turned off` : `2 at a time keeps the map clean · ${CHIPNAME[d]} turned off`); } }
  function addSub(kind, key) { const set = kind === "g" ? S.groc : S.faith, id = kind + ":" + key; set.add(key); S.subOrder = S.subOrder.filter(x => x !== id); S.subOrder.push(id);
    while (S.subOrder.length > (PHONE ? 1 : 2)) { const d = S.subOrder.shift(), [dk, dkey] = d.split(":"), dset = dk === "g" ? S.groc : S.faith; dset.delete(dkey);
      toast(`${PHONE ? "One type at a time" : "Up to 2 types at a time"} · ${dk === "g" ? GSHORT[dkey] : FN2[dkey]} turned off`);
      const dcat = dk === "g" ? "grocery" : "worship"; if (!dset.size && dcat !== (kind === "g" ? "grocery" : "worship")) dropMain(dcat); } }
  function toggleMain(k) { if (S.dview === "places" && S.cats.has(k)) dropMain(k); else { addMain(k); if (k === "grocery" && !S.groc.size) addSub("g", "supermarket"); } sync2(); }
  function toggleSub(kind, key) { const cat = kind === "g" ? "grocery" : "worship", set = kind === "g" ? S.groc : S.faith;
    if (S.dview !== "places" || !S.cats.has(cat)) addMain(cat);
    if (set.has(key)) { set.delete(key); S.subOrder = S.subOrder.filter(x => x !== kind + ":" + key); } else addSub(kind, key); sync2(); }
  function renderChips() { const bar = document.getElementById("chipbar"); if (!bar) return; let h = "";
    const TICO = { sky: `<i style="background:#0f766e"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 20l-2 2M15 20l2 2"/></svg></i>`,
      bus: `<i style="background:#4d6b1f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3"/><circle cx="8" cy="14.5" r=".6"/><circle cx="16" cy="14.5" r=".6"/></svg></i>` };
    const skyOK = nearSky();
    for (const k of CHIPS) { if (TICO[k]) { const on = S.dview === "transit" && (k === "sky" ? S.tSky : S.tBus), na = k === "sky" && !skyOK && !on;
        h += `<button type="button" class="mc t${na ? " na" : ""}" data-k="${k}" aria-pressed="${on}" title="${na ? "No SkyTrain in this area" : ""}">${TICO[k]}<span>${k === "sky" ? "SkyTrain" : "Buses"}</span></button>${k === "bus" ? '<span class="csep" aria-hidden="true"></span>' : ""}`; continue; }
      const on = S.dview === "places" && S.cats.has(k);
      let label = CHIPNAME[k];
      if (on && k === "grocery" && S.groc.size) label = [...S.groc].map(g => GSHORT[g]).join(" + ");
      if (on && k === "worship" && S.faith.size) label = [...S.faith].map(f => FN2[f]).join(" + ");
      const ico = k === "worship" && on && S.faith.size === 1 ? `<i style="background:${FCOL[[...S.faith][0]][0]};color:${FCOL[[...S.faith][0]][1]};font-size:12px">${REL[[...S.faith][0]][0]}</i>`
        : `<i style="${k === "health" ? "background:#fff;color:#dc2626;border:1.5px solid #dc2626" : "background:" + (k === "grocery" ? (on && S.groc.size === 1 ? GCOL[[...S.groc][0]] : "#475569") : CATS[k].c)}">${CATS[k].ico}</i>`;
      h += `<button type="button" class="mc" data-k="${k}" aria-pressed="${on}">${ico}<span>${label}</span>${k === "grocery" || k === "worship" ? '<b class="cv">▾</b>' : ""}</button>`; }
    bar.innerHTML = h; if (S.lyReady) renderLayers(); }
  function closeDD() { const dd = document.getElementById("dd"); dd.hidden = true; S.ddK = null; }
  function openDD(k) { const dd = document.getElementById("dd"), bar = document.getElementById("chipbar"), chip = bar.querySelector(`[data-k="${k}"]`); S.ddK = k;
    const items = k === "grocery" ? Object.keys(GROC).map(g => ["g", g, GSHORT[g], `<i class="dot" style="background:${GCOL[g]}"></i>`, S.groc.has(g)])
      : Object.keys(REL).map(f => ["f", f, FN2[f], `<i class="dot" style="background:${FCOL[f][0]};color:${FCOL[f][1]}">${REL[f][0]}</i>`, S.faith.has(f)]);
    dd.innerHTML = `<p class="ddh">${k === "grocery" ? "Which stores?" : "Which place of worship?"}<span>select up to 2</span></p>`
      + items.map(([kind, key, nm, dot, on]) => `<button type="button" class="ddi" data-s="${kind}:${key}" aria-pressed="${on}">${dot}${nm}<b class="ck">${on ? "✓" : ""}</b></button>`).join("")
      + `<div class="ddf"><button type="button" class="ddoff" data-off="${k}">Turn off</button><button type="button" class="dddone">Done</button></div>`;
    dd.hidden = false; const mr = map.getContainer().getBoundingClientRect(), cr = chip.getBoundingClientRect();
    dd.style.left = Math.max(8, Math.min(mr.width - dd.offsetWidth - 8, cr.left - mr.left)) + "px"; dd.style.top = (cr.bottom - mr.top + 6) + "px"; }
  document.getElementById("chipbar").addEventListener("click", e => { e.stopPropagation(); const b = e.target.closest(".mc"); if (!b) return; const k = b.dataset.k;
    if (k === "sky" || k === "bus") { closeDD(); toggleTransit(k); return; }
    if (k === "grocery" || k === "worship") { if (S.ddK === k) { closeDD(); return; } const on = S.dview === "places" && S.cats.has(k);
      if (!on) { addMain(k); if (k === "grocery" && !S.groc.size) addSub("g", "supermarket"); sync2(); } openDD(k); return; }
    closeDD(); toggleMain(k); });
  document.getElementById("dd").addEventListener("click", e => { e.stopPropagation(); const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.s) { const [kind, key] = b.dataset.s.split(":"); toggleSub(kind, key); openDD(S.ddK); return; }
    if (b.dataset.off) { dropMain(b.dataset.off); closeDD(); sync2(); return; }
    closeDD(); });
  ["chipbar", "dd", "toast"].forEach(id => { const el = document.getElementById(id); L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el); });
  map.on("click", closeDD);

  function renderRefine() {
    const box = document.getElementById("refine"); if (!box) return;
    const FN = { sikh: "Gurdwaras", hindu: "Hindu temples", muslim: "Mosques", christian: "Churches", buddhist: "Buddhist temples", jewish: "Synagogues" };
    const pills = (kind, key, onMap, onDist) => `<div class="tgs"><button type="button" class="tg" data-m="${kind}:${key}" aria-pressed="${onMap}" title="Show every one on the map"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></svg>On map</button><button type="button" class="tg" data-d="${kind}:${key}" aria-pressed="${onDist}" title="Show how far the closest one is when you tap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="6" r="2.2"/><path d="M7 16.5 17 7.5" stroke-dasharray="2.5 3"/></svg>Distance</button></div>`;
    const dot = (style, inner) => `<span class="am" style="${style}">${inner}</span>`;
    let h = "";
    for (const k of Object.keys(CATS)) {
      const sample = k === "grocery" ? { cat: k, sub: "south_asian" } : k === "worship" ? { cat: k, sub: "sikh" } : { cat: k };
      if (k === "grocery" || k === "worship") {
        const nOn = k === "grocery" ? Object.keys(GROC).filter(g => S.mapGroc.has(g) || (S.cats.has(k) && S.groc.has(g))).length : Object.keys(REL).filter(f => S.mapFaith.has(f) || (S.cats.has(k) && S.faith.has(f))).length;
        const shut = PHONE && !S.openGrp.has(k);
        h += `<div class="rg${shut ? " shut" : ""}"><div class="rh" data-grp="${k}" role="button" tabindex="0" aria-expanded="${!shut}">${dot(dotStyle(sample), k === "worship" ? icoFor(sample) : CATS[k].ico)}<span><b class="rhn">${CATS[k].name}</b><small class="rd">${LONG[k]}</small></span>${PHONE ? `<span class="cnt">${nOn ? nOn + " on" : "Off"} <i>${shut ? "▾" : "▴"}</i></span>` : ""}</div><div class="rsub">`;
        if (k === "grocery") for (const [g, [full]] of Object.entries(GROC)) h += `<div class="rrow"><i class="sw2" style="background:${GCOL[g]}"></i><span class="rn">${({ filipino_sea: "Filipino & other Asian", middle_eastern: "Middle Eastern", produce: "Produce markets", international: "Euro, Latin, African", korean_japanese: "Korean & Japanese" })[g] || full.replace(/ \(.*\)$/, "")}</span>${pills("g", g, S.mapGroc.has(g), S.cats.has("grocery") && S.groc.has(g))}</div>`;
        if (k === "worship") for (const [f, [sym]] of Object.entries(REL)) h += `<div class="rrow"><i class="sw2" style="background:${FCOL[f][0]};color:${FCOL[f][1]}">${sym}</i><span class="rn">${FN[f]}</span>${pills("f", f, S.mapFaith.has(f), S.cats.has("worship") && S.faith.has(f))}</div>`;
        h += `</div></div>`;
      } else {
        h += `<div class="rg"><div class="rrow solo">${dot(dotStyle(sample), CATS[k].ico)}<span class="rn"><b>${CATS[k].name}</b><small class="rd">${LONG[k]}</small></span>${pills("c", k, S.mapCats.has(k), S.cats.has(k))}</div></div>`;
      }
    }
    box.innerHTML = h;
    const on = [];
    for (const k of Object.keys(CATS)) { if (k === "grocery" || k === "worship") { const n = (k === "grocery" ? Object.keys(GROC).filter(g => S.mapGroc.has(g) || (S.cats.has(k) && S.groc.has(g))) : Object.keys(REL).filter(f => S.mapFaith.has(f) || (S.cats.has(k) && S.faith.has(f)))).length;
        if (n) on.push(`${CATS[k].name} (${n})`); } else if (S.cats.has(k) || S.mapCats.has(k)) on.push(CATS[k].name); }
    const sh = document.getElementById("showing"); if (sh) sh.innerHTML = S.dview === "transit" ? `<b>Distance to:</b> SkyTrain &amp; buses` : `<b>Distance to:</b> ${on.join(", ") || "nothing yet"}`;
  }
  document.getElementById("refine").addEventListener("click", e => {
    const g0 = e.target.closest("[data-grp]"); if (g0 && !e.target.closest("button")) { e.stopPropagation(); const k = g0.dataset.grp; S.openGrp.has(k) ? S.openGrp.delete(k) : S.openGrp.add(k); renderRefine(); return; }
    const b = e.target.closest("button"); if (!b) return; e.stopPropagation();
    if (b.dataset.d) { const [kind, key] = b.dataset.d.split(":"); if (kind === "c") toggleMain(key); else toggleSub(kind, key); return; }
    const flip = (set, key) => { set.has(key) ? set.delete(key) : set.add(key); return set.has(key); };
    if (b.dataset.rk) { const k = b.dataset.rk; S.cats.delete(k); S.mapCats.delete(k); if (k === "grocery") S.mapGroc.clear(); if (k === "worship") S.mapFaith.clear(); }
    if (b.dataset.m) { const [kind, key] = b.dataset.m.split(":");
      if (kind === "c") flip(S.mapCats, key);
      if (kind === "g") { flip(S.mapGroc, key); if (map.getZoom() < 13) map.setZoom(13); }
      if (kind === "f") { flip(S.mapFaith, key); if (map.getZoom() < 12) map.setZoom(12); }
      if (kind === "c" && S.mapCats.has(key) && map.getZoom() < (key === "park" ? 12 : CATS[key].z)) map.setZoom(key === "park" ? 13 : CATS[key].z); }
    if (b.dataset.d) { const [kind, key] = b.dataset.d.split(":"); S.lastD = b.dataset.d;
      if (kind === "c") flip(S.cats, key);
      if (kind === "g") { if (!S.cats.has("grocery")) { S.cats.add("grocery"); S.groc = new Set([key]); } else flip(S.groc, key); }
      if (kind === "f") { if (!S.cats.has("worship")) { S.cats.add("worship"); S.faith = new Set([key]); } else flip(S.faith, key); } }
    if (b.dataset.d) enforceLimit(b.dataset.d);
    chipBox.querySelectorAll(".tgrow").forEach(r => { const e2 = r.querySelector(".tg.eye"), k2 = r.querySelector(".tg.bcn-chip")?.dataset.k;
      if (e2 && k2) e2.setAttribute("aria-pressed", S.mapCats.has(k2) || (k2 === "grocery" && S.mapGroc.size > 0) || (k2 === "worship" && S.mapFaith.size > 0)); });
    syncButtons(); redraw();
  });
  L.DomEvent.disableClickPropagation(document.getElementById("refine"));
  // Distance lines: at most 2 on phones, 3 on larger screens; the oldest switches off when one more is added
  const LIMIT = innerWidth <= 720 ? 2 : 3;
  const distUnits = () => { const u = [];
    for (const k of Object.keys(CATS)) { if (!S.cats.has(k)) continue;
      if (k === "grocery") S.groc.forEach(g => u.push("g:" + g)); else if (k === "worship") S.faith.forEach(f => u.push("f:" + f)); else u.push("c:" + k); } return u; };
  const unitOff = key => { const [kind, k] = key.split(":");
    if (kind === "c") S.cats.delete(k);
    if (kind === "g") { S.groc.delete(k); if (!S.groc.size) S.cats.delete("grocery"); }
    if (kind === "f") { S.faith.delete(k); if (!S.faith.size) S.cats.delete("worship"); } };
  function enforceLimit(justTurned) {
    const on = distUnits(); S.distOrder = S.distOrder.filter(x => on.includes(x)); on.forEach(x => { if (!S.distOrder.includes(x)) S.distOrder.push(x); });
    if (justTurned && on.includes(justTurned)) { S.distOrder = S.distOrder.filter(x => x !== justTurned); S.distOrder.push(justTurned); }
    const note = document.getElementById("limitnote"); let dropped = false;
    while (S.distOrder.length > LIMIT) { unitOff(S.distOrder.shift()); dropped = true; }
    if (dropped) { note.textContent = `Showing your latest ${LIMIT} distance lines to keep the map clean. Turn one off to swap.`; note.hidden = false; clearTimeout(note._t); note._t = setTimeout(() => note.hidden = true, 5000); }
  }
  function applyPreset(name) {
    const P = PRESETS[name]; S.preset = name;
    S.cats = new Set(P.dist); S.mapCats = new Set(P.map); S.groc = new Set(P.groc); S.mapGroc = new Set(P.mapGroc || []); S.mapFaith = new Set(P.mapFaith || []);
    S.faith = new Set(Object.keys(REL));
    if (P.transit) { S.lines = true; S.dist = true; S.tSky = S.tBus = true; swL.setAttribute("aria-pressed", true); swD.setAttribute("aria-pressed", true); refreshLines(); }
    chipBox.querySelectorAll(".tg.bcn-chip").forEach(b => b.setAttribute("aria-pressed", S.cats.has(b.dataset.k)));
    chipBox.querySelectorAll(".tgrow").forEach(r => { const e = r.querySelector(".tg.eye"), k = r.querySelector(".tg.bcn-chip")?.dataset.k; if (e && k) e.setAttribute("aria-pressed", S.mapCats.has(k)); });
    grocBox.querySelectorAll(".fchip").forEach((b, i) => b.setAttribute("aria-pressed", S.groc.has(Object.keys(GROC)[i])));
    preBox.querySelectorAll(".pre").forEach(b => b.setAttribute("aria-pressed", b.dataset.p === name));
    syncSubs(); syncAll(); redraw();
  }
  preBox.querySelectorAll(".pre").forEach(b => b.onclick = () => applyPreset(b.dataset.p));
  L.DomEvent.disableClickPropagation(preBox);
  // any manual change in Customize clears the highlighted lifestyle
  document.getElementById("custom").addEventListener("click", e => { if (e.target.closest("button")) preBox.querySelectorAll(".pre").forEach(b => b.setAttribute("aria-pressed", false)); });

  // ---- stations: dots + names
  const label = (ll, text, kind, pr) => { const mk = L.marker(ll, { pane: "labels", interactive: false, keyboard: false,
    icon: L.divIcon({ className: "bc-lbl " + kind, html: `<span>${esc(text)}</span>`, iconSize: [0, 0] }) }); mk._pr = pr; return mk; };
  const stationLayer = L.layerGroup().addTo(map), stationLabels = L.layerGroup().addTo(map);
  for (const s of stations) {
    L.circleMarker([s.lat, s.lon], { pane: "dots", radius: 4, weight: 2, color: css("--bcn-sky"), fillColor: "#fff", fillOpacity: 1, interactive: false }).addTo(stationLayer);
    stationLabels.addLayer(label([s.lat, s.lon], s.label, "sky", 1e6));
  }
  const tapLayer = L.layerGroup().addTo(map);
  lineLayer.addTo(map); stopDots.addTo(map); routeLabels.addTo(map);
  function declutter() {
    const items = [stationLabels, routeLabels, amenLabels, tapLayer].flatMap(gp => gp.getLayers()).filter(mk => mk._icon && mk._pr);
    items.forEach(mk => mk._icon.classList.remove("bc-hide")); items.sort((a, b) => b._pr - a._pr);
    const placed = [], v = map.getContainer().getBoundingClientRect(), sh = document.getElementById("sheet").getBoundingClientRect(); placed.push(sh);
    for (const mk of items) { const r = mk._icon.firstElementChild.getBoundingClientRect();
      if (r.right < v.left || r.left > v.right || r.bottom < v.top || r.top > v.bottom) continue;
      if (placed.some(p => r.left < p.right + 4 && r.right + 4 > p.left && r.top < p.bottom + 2 && r.bottom + 2 > p.top)) mk._icon.classList.add("bc-hide"); else placed.push(r); }
  }
  map.on("zoomend", () => { showSky() && map.getZoom() >= 12 ? stationLabels.addTo(map) : map.removeLayer(stationLabels); });
  map.on("moveend zoomend", () => requestAnimationFrame(declutter));

  // ---- tap to check
  const icoSky = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 20l-2 2M15 20l2 2M8.5 16v.01M15.5 16v.01"/></svg>';
  const icoBus = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 18v3M16 18v3M8 14.5v.01M16 14.5v.01"/></svg>';
  const freqOf = r => S.mode === "weekday" ? r.w : S.mode === "weekend" ? Math.max(r.sa, r.su) || 0 : (r.w && r.sa && r.su ? Math.max(r.w, r.sa, r.su) : 0);
  const WHEN_TXT = { weekday: "weekdays", weekend: "weekends", all_week: "every day" };
  // Callouts on the map: placed beside their point, trying right / left / above / below so they don't overlap
  const callouts = [];
  function placeCallouts() {
    const placed = []; const sh = document.getElementById("sheet"); if (!sh.classList.contains("closed")) placed.push(sh.getBoundingClientRect());
    const pt = ll => { const q = map.latLngToContainerPoint(ll), r0 = map.getContainer().getBoundingClientRect(); return { left: r0.left + q.x - 7, top: r0.top + q.y - 7, right: r0.left + q.x + 7, bottom: r0.top + q.y + 7 }; };
    callouts.forEach(c => placed.push(pt(c.mk.getLatLng())));
    document.querySelectorAll(".pin, .srpin, .am.sel, .nearbox.on, .cap, .lp.on, #lcard:not([hidden]), #chipbar, .nearme").forEach(e => { const r = e.getBoundingClientRect(); placed.push({ left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 }); });
    const mb = map.getContainer().getBoundingClientRect();
    for (const c of callouts) {
      const el = c.mk._icon && c.mk._icon.querySelector(".co"); if (!el) continue;
      const w = el.offsetWidth, h = el.offsetHeight, o = c.gap;
      const R = [o, -h / 2], Lf = [-w - o, -h / 2], U = [-w / 2, -h - o], D = [-w / 2, o];
      const UR = [o * .6, -h - o * .6], DR = [o * .6, o * .6], UL = [-w - o * .6, -h - o * .6], DL = [-w - o * .6, o * .6];
      const far = k => [[o + k, -h / 2 - k], [o + k, -h / 2 + k], [-w - o - k, -h / 2 - k], [-w - o - k, -h / 2 + k]];
      const tries = (c.prefer === "up" ? [U, UR, UL, R, Lf, D] : [R, Lf, UR, DR, UL, DL, U, D]).concat(far(26), far(52));
      const base = c.mk._icon.getBoundingClientRect(); let ok = tries[0], bestCost = Infinity;
      for (const t of tries) { const r = { left: base.left + t[0], top: base.top + t[1], right: base.left + t[0] + w, bottom: base.top + t[1] + h };
        let cost = 0;
        cost += Math.max(0, mb.left + 4 - r.left) * h + Math.max(0, r.right - mb.right + 4) * h + Math.max(0, mb.top + 4 - r.top) * w + Math.max(0, r.bottom - mb.bottom + 4) * w;
        for (const q of placed) cost += Math.max(0, Math.min(r.right + 4, q.right) - Math.max(r.left - 4, q.left)) * Math.max(0, Math.min(r.bottom + 4, q.bottom) - Math.max(r.top - 4, q.top));
        cost += tries.indexOf(t) * .01;                                     // prefer earlier positions on ties
        if (cost < bestCost) { bestCost = cost; ok = t; if (cost < 1) break; } }
      { // always fully on screen, even when the station / stop is far away off-screen: slide to the nearest visible edge
        const lc = document.getElementById("lcard"), lcr = lc && !lc.hidden ? lc.getBoundingClientRect() : null, fb = document.getElementById("fab").getBoundingClientRect();
        const scB = Math.max(...[...document.querySelectorAll(".samplechip, .nearme, .srch, .sbar")].map(e => e.getBoundingClientRect().bottom)), top = Math.max(mb.top + 8, scB + 6), bot = (lcr && innerWidth <= 720 ? lcr.top : mb.bottom) - 8;
        const nx = Math.min(Math.max(ok[0], mb.left + 6 - base.left), mb.right - 6 - w - base.left);
        let ny = Math.min(Math.max(ok[1], top - base.top), bot - h - base.top);
        if (base.left + nx + w > fb.left - 4 && base.top + ny < fb.bottom + 4) ny = fb.bottom + 6 - base.top;     // stay clear of the yellow button
        const off = base.left < mb.left || base.left > mb.right || base.top < top || base.top > bot;
        el.classList.toggle("edge", off);
        if (off && !el.querySelector(".ar")) { const dx = base.left - (mb.left + mb.width / 2), dy = base.top - (mb.top + mb.height / 2); const i = document.createElement("i"); i.className = "ar"; i.textContent = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"][Math.round(((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360 / 45) % 8]; (el.querySelector(".rv") || el).appendChild(i); }
        ok = [nx, ny]; }
      el.style.transform = `translate(${ok[0]}px, ${ok[1]}px)`;
      // thin leader line from the point to the callout when it had to move away
      const ln = c.ln._icon && c.ln._icon.firstElementChild; const tx = Math.max(ok[0], Math.min(0, ok[0] + w)), ty = Math.max(ok[1], Math.min(0, ok[1] + h)), len = Math.hypot(tx, ty);
      if (ln) { const show = len > o + 8 && c.cls !== "pinlbl"; ln.style.display = show ? "" : "none";
        if (show) { ln.style.width = len + "px"; ln.style.transform = `rotate(${Math.atan2(ty, tx)}rad)`; } }
      const rb = el.getBoundingClientRect(); placed.push(rb);
    }
    // hide map name labels sitting under a callout (the callout already names the place)
    const boxes = [...document.querySelectorAll(".bc-co .co")].map(e => e.getBoundingClientRect());
    document.querySelectorAll(".bc-lbl:not(.bc-co)").forEach(l => { const sp = l.firstElementChild; if (!sp) return; const r = sp.getBoundingClientRect();
      l.classList.toggle("bc-under", (S.skyLabel && sp.textContent === S.skyLabel) || boxes.some(b => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top)); });
  }
  const addCallout = (ll, html, cls, prefer, gap = 10) => {
    const mk = L.marker(ll, { pane: "pin", interactive: false, keyboard: false, icon: L.divIcon({ className: "bc-lbl bc-co", html: `<div class="co ${cls}"><div class="rv" style="animation-delay:${120 + callouts.length * 90}ms">${html}</div></div>`, iconSize: [0, 0] }) }).addTo(tapLayer);
    const ln = L.marker(ll, { pane: "pin", interactive: false, keyboard: false, icon: L.divIcon({ className: "bc-ln", html: '<i class="ln" style="display:none"></i>', iconSize: [0, 0] }) }).addTo(tapLayer);
    callouts.push({ mk, ln, prefer, gap, cls });
  };
  const range = a => { const lo = Math.min(...a), hi = Math.max(...a); return lo === hi ? `${lo}` : `${lo}–${hi}`; };

  // tap a row in the "closest" card: draw the trip on the map and frame it
  const focusLayer = L.layerGroup().addTo(map);
  function focusPlace(i) {
    const f = S.finds && S.finds[i]; if (!f || !S.tapped) return; const [k, n] = f; const pp = n.p.cat ? n.p : { cat: k }; const [bg, , bd] = colorFor(pp); const col = bd || bg;
    focusLayer.clearLayers(); document.querySelectorAll(".nr.on").forEach(e => e.classList.remove("on")); document.querySelectorAll(`.nr[data-i="${i}"]`).forEach(e => e.classList.add("on"));
    const a = S.tapped, b = [n.p.lat, n.p.lon];
    L.polyline([a, b], { pane: "dots", color: "#fff", weight: 6, opacity: .9, interactive: false }).addTo(focusLayer);
    L.polyline([a, b], { pane: "dots", color: col, weight: 3, dashArray: "6 6", interactive: false }).addTo(focusLayer);
    L.marker(b, { pane: "amen", interactive: false, icon: L.divIcon({ className: "", html: `<div class="am sel" style="${dotStyle(pp)};--bcn-ring:${col}">${icoFor(pp)}</div>`, iconSize: [0, 0] }) }).addTo(focusLayer);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    L.marker(b, { pane: "pin", interactive: false, icon: L.divIcon({ className: "bc-trip", html: `<div class="trip"><b>${esc(n.p.name)}</b>${n.d === 0 ? "you&rsquo;re in it" : howFar(n.d)}</div>`, iconSize: [0, 0] }) }).addTo(focusLayer);
    const nbx = document.getElementById("nearbox");
    if (innerWidth <= 720 && nbx.classList.contains("on")) { nbx.classList.add("mini");
      if (!nbx.querySelector(".backall")) { const bk = document.createElement("button"); bk.type = "button"; bk.className = "backall"; bk.textContent = "← Back to all nearby places";
        bk.onclick = ev => { ev.stopPropagation(); nbx.classList.remove("mini"); focusLayer.clearLayers(); }; nbx.appendChild(bk); } }
    const sh = document.getElementById("sheet"), open = !sh.classList.contains("closed") && innerWidth > 720;
    map.fitBounds(L.latLngBounds([a, b]).pad(.35), { paddingTopLeft: [40, innerWidth <= 720 ? 130 : 60], paddingBottomRight: [open ? sh.offsetWidth + 40 : 40, innerWidth <= 720 ? 200 : 60], maxZoom: 16 });
  }
  document.addEventListener("click", e => { const r = e.target.closest(".nr[data-i]"); if (r) { e.stopPropagation(); focusPlace(+r.dataset.i); } }, true);
  document.addEventListener("keydown", e => { const r = e.target.closest && e.target.closest(".nr[data-i]"); if (r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); focusPlace(+r.dataset.i); } });
  function showRoutes(names, stop) {                                       // draw just these routes, the ones that pass this stop
    const kx = 111320 * Math.cos(stop.lat * Math.PI / 180);
    for (const r of routeData) { if (r.rail || !names.includes(r.r)) continue;
      const passes = r.ll.some(line => line.some(([y, x]) => Math.hypot((x - stop.lon) * kx, (y - stop.lat) * 110540) < 600)); if (!passes) continue;
      L.polyline(r.ll, { renderer: linesR, color: "#fff", weight: 6, opacity: .8, interactive: false }).addTo(tapLayer);
      L.polyline(r.ll, { renderer: linesR, color: BUS_INK, weight: 3, opacity: .75, interactive: false }).addTo(tapLayer); }
  }
  // curved labels around a walking ring: name along the top, distance along the bottom
  // ---- living lines: a line draws itself from the home to the place, then a soft dot travels along it every few seconds ----
  const STILL = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let liveSeen = new Set(), liveNow = new Set(); const flows = [];
  function growLine(lines, A, B, ms) {   // grow polylines from A to B (draw-in)
    const t0 = performance.now(), step = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3), P = [A[0] + (B[0] - A[0]) * e, A[1] + (B[1] - A[1]) * e];
      for (const l of lines) if (l._map) l.setLatLngs([A, P]); if (k < 1 && lines.some(l => l._map)) requestAnimationFrame(step); };
    for (const l of lines) l.setLatLngs([A, A]); requestAnimationFrame(step); }
  function flowLen(f) { const el = f.l._path; if (!el || !f.l._map) return; const L0 = el.getTotalLength(); if (L0 < 30) { el.style.opacity = 0; return; }
    if (f.a) f.a.cancel(); el.style.strokeDasharray = `0 ${L0 * 2}`;
    f.a = el.animate([{ strokeDashoffset: 0, opacity: 0 }, { strokeDashoffset: -L0 * .06, opacity: 1, offset: .06 }, { strokeDashoffset: -L0 * .94, opacity: 1, offset: .5 }, { strokeDashoffset: -L0, opacity: 0, offset: .56 }, { strokeDashoffset: -L0, opacity: 0 }],
      { duration: Math.max(2600, Math.min(4200, 1800 + L0 * 3)), iterations: Infinity, delay: f.delay || 0, easing: "linear" }); }
  function liveLine(A, B, col, lines) {   // lines = the halo + dotted polylines already added for this trip
    const key = A.join() + ">" + B.join(); liveNow.add(key);
    if (STILL()) return;
    if (!liveSeen.has(key)) growLine(lines, A, B, 520);
    for (const [w, c] of [[7.5, "#fff"], [4.5, col]]) { const l = L.polyline([A, B], { pane: "dots", color: c, weight: w, opacity: 1, lineCap: "round", interactive: false, className: "flowdot" }).addTo(tapLayer), f = { l, delay: liveSeen.has(key) ? 0 : 600 }; flows.push(f); flowLen(f); } }
  map.on("zoomend viewreset", () => { for (let i = flows.length - 1; i >= 0; i--) { if (!flows[i].l._map) { flows[i].a && flows[i].a.cancel(); flows.splice(i, 1); } else flowLen(flows[i]); } });
  const liveBegin = () => { for (const f of flows) f.a && f.a.cancel(); flows.length = 0; liveNow = new Set(); }, liveEnd = () => { liveSeen = liveNow; };
  const ringLbls = [];
  const aboutM = m => m < 1000 ? `about ${Math.round(m / 50) * 50} m` : `about ${(m / 1000).toFixed(1)} km`;
  const ringIcon = (lat, m, top, cls) => { const r = m / (40075016.686 * Math.cos(lat * Math.PI / 180) / Math.pow(2, map.getZoom() + 8)), pad = 18, W = 2 * (r + pad), c = r + pad, id = "rp" + Math.random().toString(36).slice(2, 8);
    // top label sways slowly along the top of the ring; the distance sits under the ring, always upright
    const arcT = `M ${c - r} ${c} A ${r} ${r} 0 0 1 ${c + r} ${c}`, arcB = `M ${c - r} ${c} A ${r} ${r} 0 0 0 ${c + r} ${c}`;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches, dur = cls === "w20" ? 26 : 18;
    const sway = (a, b) => still ? "" : `<animate attributeName="startOffset" values="${a}%;${b}%;${a}%" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
    const html = `<svg class="ringsvg ${cls}" width="${W}" height="${W}" style="position:absolute;left:${-c}px;top:${-c}px;overflow:visible"><defs><path id="${id}t" d="${arcT}"/><path id="${id}b" d="${arcB}"/></defs>
      <text dy="-5"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${top}${sway(30, 70)}</textPath></text>
      <text dy="13"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${aboutM(m)}${sway(62, 38)}</textPath></text></svg>`;
    return L.divIcon({ className: "", html, iconSize: [0, 0] }); };
  function ringLabel(lat, lon, m, top, cls) { const mk = L.marker([lat, lon], { pane: "labels", interactive: false, keyboard: false, icon: ringIcon(lat, m, top, cls) }).addTo(tapLayer); mk._ring = [lat, m, top, cls]; ringLbls.push(mk); }
  map.on("zoomend", () => { for (const mk of ringLbls) if (mk._map) mk.setIcon(ringIcon(...mk._ring)); });
  // labels for the distance lines: next to the place when it's on screen, otherwise slid along the line to just inside the screen edge
  const lblBox = document.createElement("div"); lblBox.className = "lineLbls"; map.getContainer().appendChild(lblBox);
  const ARROWS = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
  function renderLineLabels(fresh) {
    lblBox.innerHTML = ""; if (!S.tapped || !S.lineLbls || !S.lineLbls.length) return;
    const sz = map.getSize(), m = 10, mr = map.getContainer().getBoundingClientRect(), sh = document.getElementById("sheet");
    let R = { l: m, t: m, r: sz.x - m, b: sz.y - m };
    if (sh && !sh.classList.contains("closed") && sh.offsetParent !== null) { const q = sh.getBoundingClientRect(); if (innerWidth > 720) R.r = Math.min(R.r, q.left - mr.left - m); else R.b = Math.min(R.b, q.top - mr.top - m); }
    const cb = document.getElementById("chipbar"); if (cb) { const q = cb.getBoundingClientRect(); R.t = Math.max(R.t, q.bottom - mr.top + 4); }

    const lcd = document.getElementById("lcard"); if (lcd && !lcd.hidden) { const q = lcd.getBoundingClientRect(); if (innerWidth <= 720) R.b = Math.min(R.b, q.top - mr.top - 6); }
    const A = map.latLngToContainerPoint(S.tapped);
    const placed = [...document.querySelectorAll(".bc-co .co, .cap, .pin, .lp, .lcard:not([hidden]), .nearme, .srch, .sbar, .samplechip, .am.sel, .am.tapme, .lp.on, .srpin, #fab")].map(e => { const q = e.getBoundingClientRect(); return { l: q.left - mr.left, t: q.top - mr.top, r: q.right - mr.left, b: q.bottom - mr.top }; });
    const hit = b => placed.some(p => b.l < p.r + 4 && b.r + 4 > p.l && b.t < p.b + 3 && b.b + 3 > p.t);
    for (const L0 of S.lineLbls) {
      const B = map.latLngToContainerPoint(L0.ll), inside = B.x >= R.l && B.x <= R.r && B.y >= R.t && B.y <= R.b;
      let anchor = B, arrow = "";
      if (!inside) { // where the line leaves the visible area
        const dx = B.x - A.x, dy = B.y - A.y; let t = 1;
        for (const [p, q] of [[-dx, A.x - R.l], [dx, R.r - A.x], [-dy, A.y - R.t], [dy, R.b - A.y]]) if (p > 0) t = Math.min(t, q / p);
        t = Math.max(0, t); anchor = { x: A.x + dx * t, y: A.y + dy * t };
        arrow = ARROWS[Math.round(((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360 / 45) % 8]; }
      const el = document.createElement("div"); el.className = "ll" + (inside ? "" : " edge"); el.style.setProperty("--bcn-c", L0.col);
      el.innerHTML = (arrow && anchor.x < A.x ? `<i class="ar">${arrow}</i>` : "") + L0.html + (arrow && anchor.x >= A.x ? `<i class="ar">${arrow}</i>` : "");
      if (fresh) el.style.animationDelay = L0.delay + "ms"; else el.style.animation = "none";
      lblBox.appendChild(el); const w = el.offsetWidth, h = el.offsetHeight;
      // try beside the anchor, then nudge up/down until free, always kept inside the screen
      const sideR = anchor.x <= (R.l + R.r) / 2, gap = inside ? 16 : 6;
      const clampB = (x, y) => { x = Math.max(R.l, Math.min(R.r - w, x)); y = Math.max(R.t, Math.min(R.b - h, y)); return { l: x, t: y, r: x + w, b: y + h }; };
      let x0 = sideR ? anchor.x + gap : anchor.x - gap - w, y0 = anchor.y - h / 2, box = clampB(x0, y0);
      for (let k = 1; k < 26 && hit(box); k++) { const off = Math.ceil(k / 2) * (h + 4) * (k % 2 ? 1 : -1); box = clampB(x0, y0 + off); if (k === 13) x0 = sideR ? anchor.x - gap - w : anchor.x + gap; }
      el.style.left = box.l + "px"; el.style.top = box.t + "px"; placed.push(box);
    }
  }
  map.on("move zoom resize", () => renderLineLabels(false));
  function check(lat, lon) { setTimeout(() => { drawPlaces(); requestAnimationFrame(nameDeclutter); }, 60);
    S.tapped = [lat, lon]; liveBegin(); tapLayer.clearLayers(); ringLbls.length = 0; focusLayer.clearLayers(); callouts.length = 0; S.skyLabel = null;
    document.getElementById("hint").classList.add("gone");
    if (S.w20) { L.circle([lat, lon], { radius: WALK20, pane: "parks", color: "#fff", weight: 4.6, opacity: .9, dashArray: "8 6", fill: false, interactive: false, className: "walkc w2 spin s20" }).addTo(tapLayer);
      L.circle([lat, lon], { radius: WALK20, pane: "parks", color: BRAND(), weight: 2.4, opacity: .9, dashArray: "8 6", fillColor: BRAND(), fillOpacity: .035, interactive: false, className: "walkc w2 spin s20" }).addTo(tapLayer);
      ringLabel(lat, lon, WALK20, "20-min walk", "w20"); }
    if (S.w10) { L.circle([lat, lon], { radius: WALK10, pane: "parks", color: "#fff", weight: 4.8, opacity: .9, dashArray: "7 6", fill: false, interactive: false, className: "walkc spin s10" }).addTo(tapLayer);
      L.circle([lat, lon], { radius: WALK10, pane: "parks", color: BRAND(), weight: 2.6, opacity: 1, dashArray: "7 6", fillColor: BRAND(), fillOpacity: .05, interactive: false, className: "walkc spin s10" }).addTo(tapLayer);
      ringLabel(lat, lon, WALK10, "10-min walk", "w10r"); }
    if (!S.onListing && !(S.lstLL && Math.abs(S.lstLL[0] - lat) < 1e-7 && Math.abs(S.lstLL[1] - lon) < 1e-7)) L.marker([lat, lon], { pane: "pin", interactive: false, icon: L.divIcon({ className: "", html: '<div class="pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(tapLayer);
    const sky = near(sIdx, lat, lon, 1300)[0];
    const busNear = near(bIdx, lat, lon, 650, s => s.lv[S.mode] > 0);
    const byRoute = new Map();
    for (const { it, d } of busNear) for (const r of it.routes) { const f = freqOf(r); if (!f || f > 30) continue;
      const cur = byRoute.get(r.r); if (!cur || d < cur.d) byRoute.set(r.r, { r: r.r, f, d, stop: it }); }
    const best = [...byRoute.values()].sort((a, b) => a.f - b.f || a.d - b.d).slice(0, 5);
    const byStop = new Map(); for (const x of best) { const g = byStop.get(x.stop) || byStop.set(x.stop, { stop: x.stop, d: x.d, routes: [] }).get(x.stop); g.routes.push(x); }
    const groups = [...byStop.values()].sort((a, b) => a.d - b.d).slice(0, 1);   // one selected stop; other stops are touch/hover-able

    const car = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path d="M5 17h14M6 17l1.5-5.5A2 2 0 0 1 9.4 10h5.2a2 2 0 0 1 1.9 1.5L18 17M5 17v2M19 17v2"/></svg>';
    const pr = st => PARK_RIDE.has(st.name) ? "Park &amp; Ride · " : "";
    const lines = st => `<span class="lnm">${esc(st.lines.replace(/ Line/g, ""))} · </span>`;
    if (S.dist && S.tSky && sky) {
      S.skyLabel = sky.it.label;
      liveLine([lat, lon], [sky.it.lat, sky.it.lon], "#0f766e", [L.polyline([[lat, lon], [sky.it.lat, sky.it.lon]], { pane: "dots", color: "#fff", weight: 6, opacity: .9, interactive: false }).addTo(tapLayer),
      L.polyline([[lat, lon], [sky.it.lat, sky.it.lon]], { pane: "dots", color: "#0f766e", weight: 3, dashArray: "1 6", lineCap: "round", interactive: false, className: "pl" }).addTo(tapLayer)]);
      L.marker([sky.it.lat, sky.it.lon], { pane: "pin", interactive: false, icon: L.divIcon({ className: "", html: '<div class="am sel tstop" style="background:#0f766e;--bcn-ring:#0f766e"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 20l-2 2M15 20l2 2"/></svg></div>', iconSize: [0, 0] }) }).addTo(tapLayer);
      addCallout([sky.it.lat, sky.it.lon], `<span class="ctag sk">SkyTrain station</span><b>${esc(sky.it.label)}</b> ${lines(sky.it)}${pr(sky.it)}<span class="walk">${WD2(sky.d)}</span>`, "sky", "right", 9);
    }
    for (const gq of (S.dist && S.tBus ? groups : [])) {
      const st = gq.stop;
      liveLine([lat, lon], [st.lat, st.lon], "#4d6b1f", [L.polyline([[lat, lon], [st.lat, st.lon]], { pane: "dots", color: "#fff", weight: 6, opacity: .9, interactive: false }).addTo(tapLayer),
      L.polyline([[lat, lon], [st.lat, st.lon]], { pane: "dots", color: "#4d6b1f", weight: 3, dashArray: "1 6", lineCap: "round", interactive: false, className: "pl" }).addTo(tapLayer)]);
      L.marker([st.lat, st.lon], { pane: "pin", interactive: false, icon: L.divIcon({ className: "", html: '<div class="am sel tstop" style="background:#4d6b1f;--bcn-ring:#4d6b1f"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8 20v-3M16 20v-3"/></svg></div>', iconSize: [0, 0] }) }).addTo(tapLayer);
      const fr = gq.routes.map(x => x.f);
      addCallout([st.lat, st.lon], `<span class="ctag bs">Bus stop</span><span class="nums">${esc(busName(gq.routes.map(x => x.r)))}</span> · every ${range(fr)} min<br><span class="stopn">${esc(st.label)} · </span><span class="walk">${WD2(gq.d)}</span>`, "bus", "right", 8);
      showRoutes(gq.routes.map(x => x.r), st);
    }
    { const quiet = (it, cat, kind) => { const p = { cat, name: it.label, lat: it.lat, lon: it.lon, kind };
        const mk = L.marker([it.lat, it.lon], { pane: "amen", keyboard: false, icon: L.divIcon({ className: "", html: `<div class="am tq ${cat}">${cat === "bus" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8 20v-3M16 20v-3"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 20l-2 2M15 20l2 2"/></svg>'}</div>`, iconSize: [0, 0] }) }).addTo(tapLayer);
        mk.on("mouseover", () => { if (byMouse()) amTip(p); }); mk.on("mouseout", amTipOut); mk.on("click", e => { L.DomEvent.stopPropagation(e); amTip(p, true); }); };
      if (S.dist && S.tBus && groups.length) { const sel = groups[0].stop, seenS = new Set([sel]);
        for (const { it } of near(bIdx, lat, lon, 900, s => s.lv[S.mode] > 0)) { if (seenS.has(it)) continue; seenS.add(it); const rs = it.routes.filter(r => { const f = freqOf(r); return f && f <= 60; }); if (!rs.length) continue;
          const fr = rs.map(freqOf); quiet(it, "bus", `Bus stop &middot; ${esc(busName(rs.slice(0, 3).map(r => r.r)))} &middot; every ${range(fr.slice(0, 3))} min`); if (seenS.size > 12) break; } }
      if (S.dist && S.tSky && sky) { let n = 0; for (const { it } of near(sIdx, lat, lon, 4000)) { if (it === sky.it) continue; quiet(it, "sky", `SkyTrain station &middot; ${esc(it.lines.replace(/ Line/g, ""))}`); if (++n >= 4) break; } } }
    // nothing within walking distance: show the drive to the nearest SkyTrain / frequent bus
    let driveTxt = "";
    const kx0 = 111320 * Math.cos(lat * Math.PI / 180), dd0 = (y, x) => Math.hypot((x - lon) * kx0, (y - lat) * 110540);
    if (S.dist && S.tSky && !sky) { let bs = null;
      for (const st of stations) { const d = dd0(st.lat, st.lon); if (!bs || d < bs.d) bs = { st, d }; }
      if (bs && bs.d <= 60000) { liveLine([lat, lon], [bs.st.lat, bs.st.lon], "#0f766e", [L.polyline([[lat, lon], [bs.st.lat, bs.st.lon]], { pane: "dots", color: "#64748b", weight: 1.5, dashArray: "2 6", interactive: false }).addTo(tapLayer)]);
        addCallout([bs.st.lat, bs.st.lon], `<span class="ctag sk">Closest SkyTrain station</span><b>${esc(bs.st.label)}</b>${lines(bs.st)}${pr(bs.st)}<br>${fmtD(bs.d)} · <span class="walk">${WD2(bs.d)}</span>`, "sky car", "right", 9);
        driveTxt += `Nearest SkyTrain ${bs.st.name}, about ${driveMin(bs.d)} minutes by car. `; } }
    if (S.dist && S.tBus && !groups.length) { let bb = null;
      for (const st of stops) { if (!st.lv[S.mode] || Math.abs(st.lat - lat) > .1 || Math.abs(st.lon - lon) > .15) continue; const d = dd0(st.lat, st.lon); if (!bb || d < bb.d) bb = { st, d }; }
      if (bb) { const rs = bb.st.routes.filter(r => { const f = freqOf(r); return f && f <= 30; }).sort((a, b) => freqOf(a) - freqOf(b)).slice(0, 3);
        if (rs.length) {
          liveLine([lat, lon], [bb.st.lat, bb.st.lon], "#4d6b1f", [L.polyline([[lat, lon], [bb.st.lat, bb.st.lon]], { pane: "dots", color: "#64748b", weight: 1.5, dashArray: "2 6", interactive: false }).addTo(tapLayer)]);
          L.circleMarker([bb.st.lat, bb.st.lon], { pane: "dots", radius: 4.5, weight: 1.5, color: "#fff", fillColor: css("--bcn-bus"), fillOpacity: 1, interactive: false }).addTo(tapLayer);
          showRoutes(rs.map(r => r.r), bb.st);
          addCallout([bb.st.lat, bb.st.lon], `<span class="ctag bs">Closest frequent bus stop</span><span class="nums">${esc(busName(rs.map(r => r.r)))}</span> · every ${range(rs.map(freqOf))} min<br><span class="stopn">${esc(bb.st.label)} · </span>${bb.d > 1600 ? car : ""}${howFar(bb.d)}`, bb.d > 1600 ? "bus car" : "bus", "right", 8);
          driveTxt += `Nearest frequent bus ${rs.map(r => r.r).join(", ")}, ${fmtD(bb.d)} away. `; } } }
    // nearby places: one compact card at the pin, plus a ring on each place found
    const rows = [];
    if (S.dist && (S.tSky ? !sky : true) && (S.tBus ? !groups.length : true)) rows.push(`<div class="nr" style="color:#0f172a;font-weight:700">No ${S.tSky && S.tBus ? "frequent bus or SkyTrain" : S.tSky ? "SkyTrain" : "frequent bus"} within a 10-min walk</div>`);
    const finds = [];
    for (const k of Object.keys(CATS)) { if (!S.cats.has(k) || S.dview !== "places") continue;
      if (k === "health") { const er = S.hlv.has("er") ? nearestPlace(k, lat, lon, isER) : null, uc = S.hlv.has("uc") ? nearestPlace(k, lat, lon, p => p.sub === "urgent") : null;
        if (er) finds.push([k, er, '<span class="er">ER 24/7</span>']); if (uc) finds.push([k, uc, '<span class="ctag uct">Urgent care</span>']); continue; }
      if (k === "school") { for (const lv of ["E", "M", "S"]) { if (!lvOn(lv)) continue; const n = schoolFor(lat, lon, lv); if (!n) continue;
          finds.push([k, n, `${n.inCatch ? `<span class="ctag">${n.shared > 1 ? "Shared catchment" : "In catchment"}</span>` : `<span class="ctag far">Closest school</span>`}` + ` <span class="stopn">${({ E: "Elementary", M: "Middle", S: "Secondary" })[lv]} &middot; ${rTxt(n.p.rating)}${n.inCatch ? (n.shared > 1 ? " &middot; shared catchment" : " &middot; in catchment") : ""}</span>`]);
          if (false && n.inCatch && n.c) { const cc = band(n.p.rating)[0];          // catchment in the school's rating colour, same as the live school map
            for (const Rg of n.c.rr) L.polygon(Rg, { pane: "shade", color: cc, weight: 2.6, opacity: .95, fillColor: cc, fillOpacity: lv === "E" ? .2 : .1, dashArray: lv === "E" ? null : "8 5", interactive: false }).addTo(tapLayer); } } continue; }
      if (k === "worship") { for (const f of Object.keys(REL)) { if (!S.faith.has(f)) continue; const n = nearestPlace(k, lat, lon, p => p.sub === f);
          if (n) finds.push([k, n, ` <span class="stopn">${REL[f][1]}</span>`]); } continue; }
      if (k === "grocery") { for (const g of Object.keys(GROC)) { if (!S.groc.has(g)) continue; const n = nearestPlace(k, lat, lon, p => p.sub === g);
          if (n) finds.push([k, n, g === "supermarket" ? "" : ` <span class="stopn">${GROC[g][1]}</span>`]); } continue; }
      const n = nearestPlace(k, lat, lon); if (n) finds.push([k, n, ""]); }
    S.finds = finds; focusLayer.clearLayers(); S.lineLbls = [];
    for (const [i, [k, n, extra]] of finds.entries()) {
      const pp = n.p.cat ? n.p : { cat: k }; const [bg, , bd] = colorFor(pp); const col = bd || bg;
      const B = [n.p.lat, n.p.lon];
      if (n.d > 0) {
        liveLine([lat, lon], B, col, [L.polyline([[lat, lon], B], { pane: "dots", color: "#fff", weight: 5, opacity: .85, interactive: false, className: "pl" }).addTo(tapLayer),
        L.polyline([[lat, lon], B], { pane: "dots", color: col, weight: 2.4, opacity: .9, dashArray: "1 6", lineCap: "round", interactive: false, className: "pl" }).addTo(tapLayer)]); }
      { const si = pp.cat === "school" ? schoolList.indexOf(n.p) : -1, mk = L.marker(B, { pane: "amen", interactive: si >= 0, icon: L.divIcon({ className: "", html: `<div class="am sel${si >= 0 ? " tapme" : ""}${si >= 0 && S.openCatch.has(si) ? " open" : ""}" style="${dotStyle(pp)};--bcn-ring:${col}">${icoFor(pp)}</div>`, iconSize: [0, 0] }) }).addTo(tapLayer);
        if (si >= 0) mk.on("click", e => { L.DomEvent.stopPropagation(e); toggleCatch(si); check(...S.tapped); }); }
      const how = n.d === 0 ? "you&rsquo;re in it" : `<b class="t">${WD2(n.d)}</b>`;
      const nm = n.p.name.length > 26 ? n.p.name.slice(0, 24).trim() + "…" : n.p.name;
      const tg = (extra.match(/^<span class="ctag[^>]*>[^<]*<\/span>/) || [""])[0]; S.lineLbls.push({ ll: B, col, html: `${tg}<b class="n">${esc(nm)}</b>${extra.slice(tg.length)} · ${how}`, delay: 250 + i * 110 });
    }
    liveEnd();
    const nb = document.getElementById("nearbox"), phone = innerWidth <= 720;
    // one-line answers: what's inside each walking ring (the 20-min line lists only what's beyond the 10-min ring)
    const kxW = 111320 * Math.cos(lat * Math.PI / 180), dW = (y, x) => Math.hypot((x - lon) * kxW, (y - lat) * 110540);
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const NOUN = { school: ["school", "schools"], grocery: ["grocery store", "grocery stores"], health: ["clinic or hospital", "clinics & hospitals"], dog_park: ["dog park", "dog parks"], beach: ["beach", "beaches"], rec: ["rec centre", "rec centres"], worship: ["place of worship", "places of worship"] };
    const ring = (r0, r1) => { const inB = (y, x) => { const d = dW(y, x); return d > r0 && d <= r1; }, parts = [];
      if (S.dist && S.tSky && sky && sky.d > r0 && sky.d <= r1) parts.push(`${esc(sky.it.label)} SkyTrain`);
      if (S.dist && S.tBus) { const seen10 = new Set(r0 ? near(bIdx, lat, lon, r0, x => x.lv[S.mode] > 0).flatMap(({ it }) => it.routes.filter(q => { const f = freqOf(q); return f && f <= 30; }).map(q => q.r)) : []);
        const rs = [...new Set(near(bIdx, lat, lon, Math.min(r1, 1300), x => x.lv[S.mode] > 0).filter(({ d }) => d > r0).flatMap(({ it }) => it.routes.filter(q => { const f = freqOf(q); return f && f <= 30; }).map(q => q.r)))].filter(r => !seen10.has(r));
        if (rs.length) parts.push(esc(busName(rs.slice(0, 4)))); }
      for (const k of Object.keys(CATS)) { if (S.dview !== "places" || !S.cats.has(k)) continue;
        if (k === "park") { const n = getParks().filter(pk => pk.ha >= .5 && Math.abs(pk.lat - lat) < .025 && !pk.rr.some(R => R.some(([y, x]) => dW(y, x) <= r0)) && pk.rr.some(R => R.some(([y, x]) => inB(y, x)))).length; if (n) parts.push(plural(n, "park", "parks")); continue; }
        const n = places.filter(p => p.cat === k && (k !== "grocery" || S.groc.has(p.sub)) && (k !== "worship" || S.faith.has(p.sub)) && Math.abs(p.lat - lat) < .02 && inB(p.lat, p.lon)).length;
        if (n) parts.push((r0 ? "" : "") + plural(n, ...NOUN[k])); }
      return parts; };
    const p10 = S.w10 || !S.w20 ? ring(0, WALK10) : [], p20 = S.w20 ? ring(S.w10 ? WALK10 : 0, WALK20) : [];
    const summary = (p10.length ? `<div class="wsum"><b>Within a 10-min walk</b>${p10.join(" · ")}</div>` : "")
      + (p20.length ? `<div class="wsum"><b>${S.w10 ? "Within a 20-min walk, also" : "Within a 20-min walk"}</b>${p20.join(" · ")}</div>` : "");
    const cap = (p10.length ? `<div><b>10-min walk:</b> ${p10.join(" · ")}</div>` : "") + (p20.length ? `<div><b>${S.w10 ? "20-min walk, also:" : "20-min walk:"}</b> ${p20.join(" · ")}</div>` : "");
    const onL = S.lstLL && S.lstLL[0] === lat && S.lstLL[1] === lon, fromL = onL && !S.cardClosed, lc = document.getElementById("lcard");   // the site keeps its own listing card; we only add a bubble on the map
    S.lastSummary = (p10.length ? "10-min walk: " + p10.join(", ") : "").replace(/<[^>]+>/g, "");
    if (fromL) { lc.classList.toggle("haslh", onLst() && !S.place); lc.hidden = false; lc.classList.toggle("islot", !!(S.place && S.place.lot)); document.getElementById("wn").innerHTML = S.place && S.place.lot && S.lotTab !== "near" ? lotInfoHTML(S.place.lot) : whatsNear(lat, lon); wfInit(document.getElementById("wn")); if (S.box) { S.box.innerHTML = whatsNear(lat, lon); wfInit(S.box); } if (false) document.getElementById("lnear").innerHTML = cap || `<div class="muted">${S.dview === "transit" ? `No ${S.tSky && S.tBus ? "frequent SkyTrain or bus" : S.tSky ? "SkyTrain station" : "frequent bus"} within a 10-min walk.` : "Tap the yellow layers button to see what&rsquo;s near this home."}</div>`;
      if (!S.lcShown) { lc.classList.remove("pop"); void lc.offsetWidth; lc.classList.add("pop"); S.lcShown = true; }
      if (innerWidth <= 720) { const sh = document.getElementById("sheet"); lc.style.bottom = (sh.offsetHeight + 10) + "px"; } }
    else { lc.hidden = true; S.lcShown = false; const sc0 = scoresFor(lat, lon), scH = !S.scoreMap ? "" : `<div class="capsc"><span><i>${sc0.walk}</i><em class="evd">Everyday walkability</em><em class="evm">Walkability</em></span><span><i class="t">${sc0.transit}</i>Transit</span></div>`; const capH = scH + (cap || (onL && !S.cats.size && S.dview !== "transit" ? `<div>Tap the yellow layers button to see what&rsquo;s near</div>` : "")); if (capH) L.marker([lat, lon], { pane: "pin", interactive: false, icon: L.divIcon({ className: "bc-cap", html: `<div class="cap">${capH}</div>`, iconSize: [0, 0] }) }).addTo(tapLayer); }
    nb.classList.remove("on"); nb.innerHTML = "";
    renderLineLabels(true);
    requestAnimationFrame(() => { placeCallouts(); declutter(); renderLineLabels(true); });
    // short text for screen readers
    document.getElementById("card").textContent = driveTxt + (sky ? `Nearest SkyTrain ${sky.it.name}, ${walkMin(sky.d)} minute walk. ` : "")
      + (best.length ? "Buses: " + best.map(x => `${x.r} every ${x.f} minutes, ${walkMin(x.d)} minute walk`).join("; ") : "No frequent buses nearby.");
  }
  map.on("zoomend moveend", () => requestAnimationFrame(placeCallouts));
  map.on("click", e => { if (S.measuring) return; if (S.noMapTapUntil && Date.now() < S.noMapTapUntil) { S.lockHit = true; return; } S.lockHit = !!(S.lstLL || S.tapped); if (S.lockHit) { lockHint(); return; } check(e.latlng.lat, e.latlng.lng); setTimeout(() => { if (!S.measuring && !S.lstLL) openSpot(e.latlng.lat, e.latlng.lng); }, 40); });

  // ---- panel
  const EXPLAIN = {
    tap: "<b>Tap any home or spot on the map.</b> We show the closest SkyTrain, buses and places, and how far each one is.",
    areas: "<b>Shaded areas</b> show where frequent transit is a short walk away. Tap any spot for details.",
  };
  const pick = (box, key, cb) => document.getElementById(box).querySelectorAll("button").forEach(b => b.onclick = () => { S[key] = b.dataset.v; cb && cb(); sync(); });
  pick("view", "view", () => { if (S.tapped) check(...S.tapped); });
  pick("when", "mode", () => { refreshLines(); if (S.tapped) check(...S.tapped); });
  const sw10 = document.getElementById("w10-sw"), sw20 = document.getElementById("w20-sw");
  sw10.onclick = () => { S.w10 = !S.w10; sw10.setAttribute("aria-pressed", S.w10); if (S.tapped) check(...S.tapped); };
  sw20.onclick = () => { S.w20 = !S.w20; sw20.setAttribute("aria-pressed", S.w20); if (S.tapped) { check(...S.tapped); if (S.w20 && map.getZoom() > 15) map.setZoom(15); } };
  document.getElementById("dist-sky").onclick = () => toggleTransit("sky");
  document.getElementById("dist-bus").onclick = () => toggleTransit("bus");
  document.getElementById("map-sky").onclick = () => { S.skyMap = !S.skyMap; syncTransitBtns(); refreshLines(); };
  document.getElementById("map-bus").onclick = () => { S.busMap = !S.busMap; syncTransitBtns(); refreshLines(); };
  map.on("moveend", () => { const b = document.querySelector('.mc[data-k="sky"]'); if (b && b.classList.contains("na") === nearSky()) renderChips(); });
  syncTransitBtns();
  function sync() {
    ["view", "when"].forEach(id => document.getElementById(id).querySelectorAll("button").forEach(b => { const on = b.dataset.v === S[id === "view" ? "view" : "mode"];
      b.classList.toggle("on", on); b.setAttribute("role", "radio"); b.setAttribute("aria-checked", on); }));
    document.getElementById("explain").innerHTML = EXPLAIN[S.view];
    document.getElementById("legend-wrap").hidden = S.view !== "areas";
    shade.redraw();
  }

  const CITIES = [["Vancouver", [49.2627, -123.0950], 14], ["Burnaby", [49.2470, -122.9900], 13], ["Surrey", [49.1890, -122.8480], 13], ["Richmond", [49.1720, -123.1360], 13],
    ["Victoria", [48.4300, -123.3650], 13], ["Kelowna", [49.8880, -119.4800], 13], ["Kamloops", [50.6700, -120.3500], 13], ["Nanaimo", [49.1900, -123.9900], 13]];
  const fly = (ll, z) => { const sh = document.getElementById("sheet").getBoundingClientRect(), mb = map.getContainer().getBoundingClientRect();
    const dx = sh.width < mb.width * .8 ? (sh.width + 24) / 2 : 0, dy = sh.width < mb.width * .8 ? 0 : (mb.bottom - sh.top) / 2;
    map.flyTo(map.unproject(map.project(ll, z).add([dx, dy]), z), z, { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : .9 }); };
  const cb = document.getElementById("cities");
  CITIES.forEach(([n, ll, z]) => { const b = document.createElement("button"); b.type = "button"; b.className = "city"; b.textContent = n; b.onclick = () => fly(ll, z); cb.appendChild(b); });

  // welcome card: shown once per visitor
  const wl = document.getElementById("welcome"); let seen = false; try { seen = localStorage.getItem("bcrem-commute-welcome") === "1"; } catch (e) {}
  if (seen) wl.hidden = true;
  const closeWl = () => { wl.hidden = true; try { localStorage.setItem("bcrem-commute-welcome", "1"); } catch (e) {} };
  document.getElementById("wl-go").onclick = closeWl; document.getElementById("wl-x").onclick = e => { e.stopPropagation(); closeWl(); }; map.once("click dragstart", () => { if (!wl.hidden && !wl.classList.contains("gone")) closeWl(); }); L.DomEvent.disableClickPropagation(wl);
  map.on("click", closeWl);

  // phones: the panel starts as a small bar so the map has room; tap it to open
  if (innerWidth <= 720) { sheetEl.classList.add("peek");
    sheetEl.addEventListener("click", e => { if (sheetEl.classList.contains("peek")) { e.stopPropagation(); e.preventDefault(); sheetEl.classList.replace("peek", "full"); } }, true);
    map.on("click", () => { sheetEl.classList.remove("full"); sheetEl.classList.add("peek"); }); }
  // hide / reopen the panel
  const sheetBox = document.getElementById("sheet"), reopen = document.getElementById("reopen");
  document.getElementById("hide").onclick = () => { sheetBox.classList.add("closed"); reopen.hidden = false; requestAnimationFrame(() => { placeCallouts(); declutter(); renderLineLabels(false); }); };
  reopen.onclick = () => { sheetBox.classList.remove("closed"); reopen.hidden = true; requestAnimationFrame(() => { placeCallouts(); declutter(); renderLineLabels(false); }); };

  // start on Commercial-Broadway with a sample check already shown, so the first view explains itself
  const START = (window.BCNearbyConfig || {}).start, start = START ? [START.lat, START.lng] : [49.2620, -123.0715];
  if (START) map.setView(start, START.zoom || 13, { animate: false });
  else map.setView(map.unproject(map.project(start, 15).add([innerWidth > 720 ? 182 : 0, innerWidth > 720 ? 0 : 140]), 15), 15, { animate: false });
  // distance view: Places or SkyTrain & buses (never both at once)
  const dv = document.getElementById("dview");
  const syncDv = () => dv.querySelectorAll("button").forEach(b => { const on = b.dataset.v === S.dview; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
  dv.querySelectorAll("button").forEach(b => b.onclick = () => { S.dview = b.dataset.v; syncDv(); renderRefine(); if (S.tapped) { S.onListing = !!lstOn; check(...S.tapped); S.onListing = false; } });
  L.DomEvent.disableClickPropagation(dv); syncDv();

  // ===== DEMO START (D6): about 240 made-up sample homes
  // ===== Live site: BCNearby.setListings([...]) with your real homes; also set demo:false
  // sample listings, styled like the live site's price tags (not real homes)
  // ~240 sample homes placed near real streets (beside bus stops), with made-up round prices. Not real listings.
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const BASE = { Vancouver: [1.1, 2.6], Burnaby: [0.7, 1.8], Richmond: [0.75, 2.0], Surrey: [0.55, 1.6], Coquitlam: [0.65, 1.7], default: [0.6, 1.5] };
  const pool = stops.filter(st => st.area === "Metro Vancouver" && st.lat > 49.0 && st.lat < 49.35 && st.lon > -123.25 && st.lon < -122.65);
  const SAMPLE = [[49.2585, -123.0700, "$1.38M"]];
  const fmtP = v => v >= 1 ? `$${v.toFixed(v >= 10 ? 0 : 2).replace(/0$/, "")}M` : `$${Math.round(v * 100) * 10}K`;
  for (let i = 0; i < 240 && pool.length; i++) { const st = pool[Math.floor(rnd() * pool.length)];
    const city = st.lon < -123.02 && st.lat > 49.2 ? "Vancouver" : st.lon < -122.9 && st.lat > 49.2 ? "Burnaby" : st.lat < 49.2 && st.lon < -123.0 ? "Richmond" : st.lat < 49.21 ? "Surrey" : "Coquitlam";
    const [lo, hi] = BASE[city] || BASE.default, v = lo + rnd() * (hi - lo);
    const a = rnd() * Math.PI * 2, dm = 60 + rnd() * 140;
    SAMPLE.push([st.lat + Math.sin(a) * dm / 110540, st.lon + Math.cos(a) * dm / 73000, fmtP(Math.round(v * 20) / 20), rnd() < .15 ? 1 : 0, city]); }
  // more sample homes: some in every BC city we cover, so tapping anywhere shows that city's homes (made up, not real)
  const SCITY = [["Vancouver", 49.2827, -123.1207, 1.0, 2.8, 20], ["North Vancouver", 49.3200, -123.0724, 0.8, 2.6, 28], ["West Vancouver", 49.3286, -123.1602, 1.6, 4.5, 22], ["New Westminster", 49.2057, -122.9110, 0.6, 1.6, 26], ["Burnaby", 49.2488, -122.9805, 0.7, 2.0, 10],
    ["Richmond", 49.1666, -123.1336, 0.7, 2.2, 10], ["Surrey", 49.1913, -122.8490, 0.6, 1.9, 24], ["South Surrey", 49.0480, -122.7930, 0.9, 2.6, 22], ["White Rock", 49.0253, -122.8026, 0.7, 2.2, 18], ["Delta", 49.0847, -123.0586, 0.8, 2.0, 24], ["Tsawwassen", 49.0170, -123.0820, 0.8, 2.0, 16],
    ["Langley", 49.1044, -122.6600, 0.6, 1.8, 26], ["Coquitlam", 49.2838, -122.7932, 0.7, 2.0, 18], ["Port Coquitlam", 49.2625, -122.7811, 0.6, 1.6, 22], ["Port Moody", 49.2849, -122.8678, 0.7, 1.9, 20], ["Maple Ridge", 49.2193, -122.5984, 0.6, 1.6, 26], ["Pitt Meadows", 49.2210, -122.6890, 0.6, 1.5, 16],
    ["Abbotsford", 49.0504, -122.3045, 0.5, 1.5, 30], ["Mission", 49.1330, -122.3090, 0.5, 1.3, 20], ["Chilliwack", 49.1579, -121.9515, 0.45, 1.2, 28], ["Squamish", 49.7016, -123.1558, 0.7, 1.8, 18], ["Whistler", 50.1163, -122.9574, 1.0, 4.0, 18], ["Sechelt", 49.4742, -123.7545, 0.6, 1.5, 16],
    ["Victoria", 48.4284, -123.3656, 0.6, 1.9, 30], ["Saanich", 48.4840, -123.3810, 0.8, 1.9, 26], ["Langford", 48.4506, -123.5058, 0.6, 1.4, 24], ["Nanaimo", 49.1659, -123.9401, 0.5, 1.3, 28], ["Courtenay", 49.6841, -124.9904, 0.5, 1.2, 20], ["Campbell River", 50.0244, -125.2475, 0.45, 1.1, 18],
    ["Kelowna", 49.8880, -119.4960, 0.6, 1.8, 30], ["West Kelowna", 49.8625, -119.5833, 0.6, 1.5, 18], ["Vernon", 50.2671, -119.2720, 0.45, 1.2, 20], ["Penticton", 49.4991, -119.5937, 0.45, 1.2, 20], ["Kamloops", 50.6745, -120.3273, 0.45, 1.2, 28], ["Prince George", 53.9171, -122.7497, 0.35, 0.9, 24], ["Prince Rupert", 54.3150, -130.3208, 0.3, 0.75, 12]];
  seed = 2026;
  for (const [city, cla, clo, lo0, hi0, n] of SCITY) { const kx0 = 111320 * Math.cos(cla * Math.PI / 180), near = stops.filter(st => Math.abs(st.lat - cla) < .045 && Math.abs(st.lon - clo) < .065 && Math.hypot((st.lon - clo) * kx0, (st.lat - cla) * 110540) < 4500);
    for (let i = 0; i < n; i++) { let la, lo; if (near.length) { const st = near[Math.floor(rnd() * near.length)], a = rnd() * Math.PI * 2, dm = 50 + rnd() * 160; la = st.lat + Math.sin(a) * dm / 110540; lo = st.lon + Math.cos(a) * dm / kx0; }
      else { const a = rnd() * Math.PI * 2, dm = 300 + rnd() * 2600; la = cla + Math.sin(a) * dm / 110540; lo = clo + Math.cos(a) * dm / kx0; }
      const v = lo0 + rnd() * (hi0 - lo0); SAMPLE.push([la, lo, fmtP(Math.round(v * 20) / 20), rnd() < .15 ? 1 : 0, city]); } }
  // ===== DEMO END (D6) =====
  // ---- remembered on this phone only: one-time hints, homes already seen ----
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const HINTS = LS.get("bcNearby.hints.v1", {}), hintShown = {};
  function hintOnce(k) { if (HINTS[k] && !hintShown[k]) return false; if (!hintShown[k]) { hintShown[k] = 1; HINTS[k] = Date.now(); LS.set("bcNearby.hints.v1", HINTS); setTimeout(() => { hintShown[k] = 0; HINTS[k] = 1; }, 6000); } return true; }
  const HIDDEN = LS.get("bcNearby.hidden.v1", {});
  const SEENLINE = {}, SEEN = LS.get("bcNearby.seen.v1", {}), seenKey = (la, lo) => la.toFixed(5) + "," + lo.toFixed(5);
  const onLst = () => S.lstLL && S.tapped && S.lstLL[0] === S.tapped[0] && S.lstLL[1] === S.tapped[1];
  function ago(ts) { const m = (Date.now() - ts) / 60000; if (m < 60) return "earlier today"; const h = m / 60, d = Math.floor(h / 24);
    if (d < 1) return new Date(ts).toDateString() === new Date().toDateString() ? "earlier today" : "yesterday"; if (d === 1) return "yesterday"; if (d < 7) return d + " days ago"; if (d < 14) return "last week"; if (d < 60) return Math.round(d / 7) + " weeks ago"; return Math.round(d / 30) + " months ago"; }
  const pNum = s => { const m = /([\d.]+)\s*([MK])/.exec(String(s).replace(/&[a-z]+;/g, "")); return m ? +m[1] * (m[2] === "M" ? 1e6 : 1e3) : 0; };
  function markSeen(la, lo, price) {   // returns the "you viewed this..." line for the card, then remembers this visit
    const k = seenKey(la, lo), prev = SEEN[k]; let line = "";
    if (prev && Date.now() - prev.t <= 5 * 60000) return SEENLINE[k] || "";   // opened again within a few minutes: same visit, keep its line
    if (prev && Date.now() - prev.t > 5 * 60000) { line = `<i>&#10003;</i> You viewed this home ${ago(prev.t)}`;
      const a = pNum(prev.p), b = pNum(price); if (a && b && a !== b) { const dlt = Math.abs(b - a), f = dlt >= 1e6 ? "$" + (dlt / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M" : "$" + Math.round(dlt / 1e3) + "K";
        line += ` &middot; <b class="${b < a ? "pdn" : "pup"}">${b < a ? "&darr;" : "&uarr;"} ${f}</b> since then`; } }
    SEENLINE[k] = line; const others = Object.keys(SEEN).filter(x => x !== k).length; SEEN[k] = { t: prev && Date.now() - prev.t <= 5 * 60000 ? prev.t : Date.now(), p: price }; LS.set("bcNearby.seen.v1", SEEN);
    if (others && hintOnce("seen")) setTimeout(() => toast("✓ marks homes you’ve already seen"), 900);
    return line; }
  function tickRemind(la, lo, el) {   // opening a home that already has the tick: say so, at most once every 15 minutes
    const prev = SEEN[seenKey(la, lo)]; if (!prev || !el || !el.classList.contains("seen")) return; const last = LS.get("bcNearby.tickMsg", 0); if (Date.now() - last < 15 * 60000) return;
    LS.set("bcNearby.tickMsg", Date.now()); const m = (Date.now() - prev.t) / 60000; setTimeout(() => toast(`✓ Already seen · you opened this home ${m < 2 ? "a moment ago" : m < 60 ? Math.round(m) + " min ago" : ago(prev.t)}`), 350); }
  async function shareHome() {
    const ll = S.tapped; if (!ll) return; const [lat, lon] = ll, sc = scoresFor(lat, lon), L2 = [];
    const g = nearestPlace("grocery", lat, lon, p => p.sub === "supermarket"), sE = schoolFor ? schoolFor(lat, lon, "E") : null, sS = schoolFor ? schoolFor(lat, lon, "S") : null, pk = nearestPlace("park", lat, lon);
    let sb = null; const kx = 111320 * Math.cos(lat * Math.PI / 180); for (const st of stations) { const d = Math.hypot((st.lon - lon) * kx, (st.lat - lat) * 110540); if (!sb || d < sb.d) sb = { st, d }; }
    const tt = d => { const v = WDV(d); return (v.w != null && v.w <= 45 ? v.w + " min walk, " : "") + durNum(v.c) + " min drive"; };
    const info = onLst() && !S.place ? listingInfo(lat, lon) : null, price = info ? (info.price || document.getElementById("lpr").textContent.trim()) : "";
    L2.push(info ? `\u{1F3E0} ${price}${info.beds ? " · " + info.beds + " bed" : ""}${info.baths ? " · " + info.baths + " bath" : ""}${info.sqft ? " · " + (+info.sqft).toLocaleString() + " sq ft" : ""}` : `\u{1F4CD} ${S.place ? "Near " + S.place.label : "This location"}`);
    L2.push(`• Walkability ${sc.walk}/100 · Transit ${sc.transit}/100`);
    if (sE && sE.p) L2.push(`• School: ${sE.p.name}${sE.p.rating != null ? " (" + rTxt(sE.p.rating) + "/10)" : ""} · ${tt(sE.d)}`);
    if (sS && sS.p) L2.push(`• High school: ${sS.p.name}${sS.p.rating != null ? " (" + rTxt(sS.p.rating) + "/10)" : ""} · ${tt(sS.d)}`);
    if (g) L2.push(`• Grocery: ${g.p.name} · ${tt(g.d)}`); if (pk) L2.push(`• Park: ${pk.p.name} · ${tt(pk.d)}`);
    if (sb && sb.d < 15000) L2.push(`• SkyTrain: ${sb.st.label} · ${tt(sb.d)}`);
    const text = L2.join("\n");
    const url = typeof CFG.shareUrl === "function" ? CFG.shareUrl(lat, lon) : location.href.split("#")[0] + "#home=" + lat.toFixed(5) + "," + lon.toFixed(5);
    if (navigator.share && PHONE) { try { await navigator.share({ title: "A home on BC Real Estate Market", text, url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
    const all = text + "\n" + url; let ok = false;
    try { await navigator.clipboard.writeText(all); ok = true; } catch (e) { const ta = document.createElement("textarea"); ta.value = all; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove(); }
    toast(ok ? "Link copied — paste it in a text, email or WhatsApp" : "Couldn’t copy — try again"); }
  const lstPane = map.createPane("lst"); lstPane.style.zIndex = 600;
  const lstLayer = L.layerGroup().addTo(map); let lstOn = null;
  const LSTBY = {};
  // ######## PART 7: LISTINGS: price tags, kinds (for sale / sold / foreclosure), setListings ########
  // listing status (demo: made up; live site: from your data). active · drop · sold · fc (foreclosure) · fcs (foreclosure sold)
  try { const v = JSON.parse(localStorage.getItem("bcNearby.lst.v1") || "null"); if (Array.isArray(v) && v.length) S.lstShow = new Set(v); } catch (e) {}
  const LST_SOLD = new Set(["sold", "fcs"]);
  const LGRP = k => k === "exp" ? "exp" : LST_SOLD.has(k) ? "sold" : "sale", LGDEF = { sale: ["active", "drop"], sold: ["sold", "fcs"], exp: ["exp"] };
  function lstPick(b) { const gOf = () => { for (const k of S.lstShow) return LGRP(k); return "sale"; }, was = gOf();
    { const C0 = window.BCNearbyConfig || {}, want = b.dataset.lgrp || LGRP(b.dataset.lonly || b.dataset.lst || "active");
      if (want !== "sale" && want !== was && typeof C0.canSeeSold === "function" && !C0.canSeeSold()) {
        if (typeof C0.onSignIn === "function") C0.onSignIn(); toast(want === "exp" ? "Sign in free to see expired listings" : "Sign in free to see sold prices"); return; } }
    if (b.dataset.lgrp) S.lstShow = new Set(LGDEF[b.dataset.lgrp] || LGDEF.sale);
    else if (b.dataset.lonly) S.lstShow = new Set([b.dataset.lonly]);
    else { const k = b.dataset.lst; if (S.lstShow.has(k)) S.lstShow.delete(k); else S.lstShow.add(k);
      for (const x of [...S.lstShow]) if (LGRP(x) !== LGRP(k)) S.lstShow.delete(x);
      if (!S.lstShow.size) { S.lstShow.add(k); toast("At least one kind stays on"); } }
    const now = gOf(); if (now !== was) toast(({ sale: "Showing homes for sale", sold: "Showing sold homes · for-sale homes hidden", exp: "Showing expired listings · for-sale homes hidden" })[now]);
    lstApply(); try { localStorage.setItem("bcNearby.lst.v1", JSON.stringify([...S.lstShow])); } catch (e) {} if (window.BCNearby && window.BCNearby._fRender) window.BCNearby._fRender(); }
  const STATUS = {}, LST_KINDS = [["active", "Active listings", "Price tags in navy"], ["drop", "Price drops", "Orange, so deals stand out"], ["sold", "Sold", "Dark red · prices after free sign-in"], ["fc", "Foreclosures", "Purple, marked F · court-ordered sales"], ["fcs", "Foreclosures sold", "Grey-purple · prices after free sign-in"], ["exp", "Expired", "Grey · ended without selling"]];
  if (!S.lstShow) S.lstShow = new Set(["active", "drop"]);
  function lstApply() { for (const k in LSTBY) { const el = LSTBY[k]._icon && LSTBY[k]._icon.firstElementChild; if (el) el.classList.toggle("lsoff", !S.lstShow.has(STATUS[k] || "active")); } }
  // one price tag on the map. The live site calls BCNearby.setListings([...]) with its own homes (see README).
  const LDATA = {}, DEMO_T = (window.BCNearbyConfig || {}).demo !== false;
  function addListing(la, lo, price, stt) { const drop = stt === "drop"; STATUS[seenKey(la, lo)] = stt;
    const sk = seenKey(la, lo), mk = L.marker([la, lo], { pane: "lst", keyboard: true, title: (DEMO_T ? "Sample listing " : "Listing ") + price, icon: L.divIcon({ className: "", html: `<div class="lp${drop ? " drop" : ""}${stt === "sold" ? " sold" : ""}${stt === "fc" ? " fc" : ""}${stt === "fcs" ? " fcs" : ""}${stt === "exp" ? " exp" : ""}${!S.lstShow.has(stt) ? " lsoff" : ""}${SEEN[sk] ? " seen" : ""}">${drop ? "&darr; " : ""}${stt === "fc" || stt === "fcs" ? "<b class=\"fcb\">F</b>" : ""}${stt === "sold" || stt === "fcs" ? "Sold " : ""}${price}</div>`, iconSize: [0, 0] }) }).addTo(lstLayer);
    LSTBY[sk] = mk;
    mk.on("click", e => { L.DomEvent.stopPropagation(e); tickRemind(la, lo, mk._icon && mk._icon.firstElementChild); if (lstOn) lstOn.classList.remove("on"); lstOn = mk._icon.firstElementChild; lstOn.classList.add("on"); placeMode(null); window.BCNearby && BCNearby._onListing && BCNearby._onListing(); S.asOpen = false; S.seenLine = markSeen(la, lo, price); window.BCNearby && window.BCNearby.homeViewed && window.BCNearby.homeViewed(); lstOn.classList.add("seen"); S.lstLL = [la, lo]; S.cardClosed = false; setTimeout(() => S.peekHome && S.peekHome(), 160); document.getElementById("lpr").innerHTML = (drop ? "&darr; " : "") + price; closeDD(); S.onListing = true; check(la, lo); S.onListing = false; });
  }
  const DEMO = (window.BCNearbyConfig || {}).demo !== false;   // demo: false -> no sample homes, lots, photo or addresses
  if (DEMO) for (const [la, lo, price, drop0] of SAMPLE) { let hh = 0; for (const ch of seenKey(la, lo)) hh = (hh * 33 + ch.charCodeAt(0)) >>> 0; const rr = hh % 100;
    addListing(la, lo, price, drop0 ? "drop" : rr < 12 ? "sold" : rr < 16 ? "fc" : rr < 19 ? "fcs" : rr < 23 ? "exp" : "active"); }
  window.BCNearby = window.BCNearby || {};
  // live: the site calls setListings(list, { clusters, total }); each home: { lat, lng, priceText, kind: active|drop|sold|fc|fcs|exp, status: "Active" (label), ... }
  // live: the site calls setListings(list, { clusters, total }) after every map move or filter change.
  // Tags that did not change stay on the map (no flicker); the open home always stays.
  const clusterLayer = L.layerGroup().addTo(map);
  const isSel = k => !!(LSTBY[k] && lstOn && LSTBY[k]._icon && LSTBY[k]._icon.firstElementChild === lstOn);
  window.BCNearby.setListings = (list, opt) => { opt = opt || {}; const keep = new Set();
    for (const h of list || []) { const la = +h.lat, lo = +h.lng; if (!isFinite(la) || !isFinite(lo) || (!la && !lo)) continue;
      const sk = seenKey(la, lo), old = LDATA[sk], pt = h.priceText || h.price || "", st = h.kind || h.status || "active"; keep.add(sk); LDATA[sk] = h;
      if (LSTBY[sk] && old && (old.priceText || old.price || "") === pt && (old.kind || old.status || "active") === st) continue;
      if (LSTBY[sk]) { if (isSel(sk)) continue; lstLayer.removeLayer(LSTBY[sk]); delete LSTBY[sk]; }
      addListing(la, lo, pt, st); }
    for (const k in LSTBY) if (!keep.has(k) && !isSel(k)) { lstLayer.removeLayer(LSTBY[k]); delete LSTBY[k]; delete LDATA[k]; delete STATUS[k]; }
    for (const k in FINFO) delete FINFO[k];
    clusterLayer.clearLayers();
    for (const c of opt.clusters || []) { const la = +c.lat, lo = +c.lng; if (!isFinite(la) || !isFinite(lo)) continue; const n = +c.count || 0;
      const mk = L.marker([la, lo], { pane: "lst", keyboard: true, title: n + " homes", icon: L.divIcon({ className: "", html: `<div class="lpc${n >= 100 ? " big" : ""}${c.kind ? " " + c.kind : ""}">${esc(c.label || (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : n))}</div>`, iconSize: [0, 0] }) }).addTo(clusterLayer);
      mk.on("click", e => { L.DomEvent.stopPropagation(e); map.flyTo([la, lo], Math.max(map.getZoom() + 1, Math.min(+c.zoom || map.getZoom() + 2, map.getMaxZoom()))); }); }
    S.apiCount = typeof opt.total === "number" ? opt.total : null; S.apiClusters = (opt.clusters || []).length;
    try { lstApply(); savedMark(); hideApply(); if (AREA) areaApply(); } catch (e) {}
    if (typeof fApply === "function") fApply();
    const P = S.pendingOpen; if (P && Date.now() - P.t < 20000) { let best = null, bd = 30; for (const k in LSTBY) { const d = map.distance(LSTBY[k].getLatLng(), [P.lat, P.lon]); if (d < bd) { bd = d; best = LSTBY[k]; } }
      if (best) { S.pendingOpen = null; setTimeout(() => best.fire("click"), 60); } } };
  window.BCNearby.getListing = (lat, lng) => LDATA[seenKey(+lat, +lng)] || null;
  window.BCNearby.map = () => map;
  // tell the site what to load: map box + filters + which kinds, after a move or a filter change (one call per real change)
  let qT = 0, qLast = "";
  S.notifyQuery = force => { clearTimeout(qT); qT = setTimeout(() => { const C0 = window.BCNearbyConfig || {}; if (typeof C0.onViewChange !== "function") return;
      const b = map.getBounds(), z = Math.round(map.getZoom()), r5 = v => +v.toFixed(5);
      let flt = {}, grp = "sale"; try { flt = JSON.parse(JSON.stringify(FL)); grp = curGrp(); } catch (e) {}
      let ohr = null; try { if (flt.oh && grp === "sale") ohr = ohRange(flt.oh); } catch (e) {}
      const q = { north: r5(b.getNorth()), south: r5(b.getSouth()), east: r5(b.getEast()), west: r5(b.getWest()), zoom: z, filters: flt, kinds: [...S.lstShow], group: grp, openHouse: ohr ? { from: ohr[0], to: ohr[1] } : null };
      const key = JSON.stringify(q); if (key === qLast && !force) return; qLast = key; try { C0.onViewChange(q); } catch (e) { console.error(e); } }, 220); };
  window.BCNearby.refresh = () => S.notifyQuery(true);
  map.on("moveend", () => S.notifyQuery());
  map.on("click", () => { if (S.lockHit) return; if (lstOn) { lstOn.classList.remove("on"); lstOn = null; } S.lstLL = null; });
  { const m = /#home=(-?[\d.]+),(-?[\d.]+)/.exec(location.hash);   // opened from a shared link: open that home with its lines
    if (m) setTimeout(() => { const la = +m[1], lo = +m[2], mk = LSTBY[seenKey(la, lo)]; try { localStorage.setItem("bcrem-commute-welcome", "1"); } catch (e) {} const wl = document.getElementById("welcome"); if (wl) wl.hidden = true;
      map.setView([la, lo], 15); if (mk) mk.fire("click"); else check(la, lo);
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }, 400); }   // then tidy the address, so copying it later shares the plain map
  document.getElementById("lx").onclick = e => { e.stopPropagation(); document.getElementById("lcard").hidden = true; if (lstOn) { lstOn.classList.remove("on"); lstOn = null; }
    S.lstLL = null; S.tapped = null; liveBegin(); liveEnd(); tapLayer.clearLayers(); S.lineLbls = []; renderLineLabels(); };
  L.DomEvent.disableClickPropagation(document.getElementById("lcard"));
  L.DomEvent.disableScrollPropagation(document.getElementById("lcard"));   // the mouse wheel / finger slides the card, not the map
  // ######## PART 8: WHAT'S NEAR + WALKABILITY AND TRANSIT SCORES ########
  // ===== "What's near": one line per kind of place, with the closest one and the time from this home
  const WALK_SVG = '<svg class="ico-w" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>';
  const CAR_SVG = '<svg class="ico-c" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>';
  const tm = d => d == null ? null : d <= 1600 ? { n: walkMin(d), w: "walk", car: false } : { n: "\u2248 " + durNum(driveMin(d)), w: "drive", car: true };
  const short = (t, n = 30) => t.length > n ? t.slice(0, n - 1).trim() + "…" : t;
  // ===== Walkability and Transit scores (0-100), from the places we have. Not affiliated with Walk Score(R).
  // walk: each daily need earns full points within 400 m, fading to none at 2 km (straight line)
  const fade = d => d == null ? 0 : d <= 400 ? 1 : d >= 2000 ? 0 : 1 - (d - 400) / 1600;
  const WEIGHTS = { grocery: 25, choice: 15, park: 15, transit: 15, health: 10, rec: 10, worship: 5, outdoors: 5 };
  function scoresFor(lat, lon) {
    const kx = 111320 * Math.cos(lat * Math.PI / 180), dd = (y, x) => Math.hypot((x - lon) * kx, (y - lat) * 110540);
    const nd = (k, t) => { const n = nearestPlace(k, lat, lon, t); return n ? n.d : null; };
    let groc1k = 0; for (const p of places) if (p.cat === "grocery" && Math.abs(p.lat - lat) < .012 && Math.abs(p.lon - lon) < .018 && dd(p.lat, p.lon) <= 1000) groc1k++;
    let st = null; for (const x of stations) { const d = dd(x.lat, x.lon); if (st == null || d < st) st = d; }
    let routes = new Map(), bus = null;
    for (const { it, d } of near(bIdx, lat, lon, 1200, x => x.lv.weekday > 0)) { if (bus == null || d < bus) bus = d;
      for (const r of it.routes) { const f = r.w; if (!f || f > 30) continue; const c = routes.get(r.r); if (c == null || d < c.d) routes.set(r.r, { d, f }); } }
    const parts = { grocery: fade(nd("grocery")), choice: Math.min(groc1k, 4) / 4, park: fade(nd("park")), transit: fade(Math.min(st ?? 1e9, bus ?? 1e9)),
      health: fade(nd("health")), rec: fade(nd("rec")), worship: fade(nd("worship")), outdoors: Math.max(fade(nd("beach")), fade(nd("dog_park"))) };
    let walk = 0; for (const k in WEIGHTS) walk += WEIGHTS[k] * parts[k];
    // transit: buses per hour within a 10-min walk (fading out to 1.2 km), plus SkyTrain
    let v = 0; for (const { d, f } of routes.values()) v += (60 / f) * (d <= 400 ? 1 : Math.max(0, 1 - (d - 400) / 800));
    if (st != null) v += 30 * (st <= 500 ? 1 : Math.max(0, 1 - (st - 500) / 1000));
    const transit = Math.round(100 * (1 - Math.exp(-v / 22)));
    return { walk: Math.round(walk), transit, parts, groc1k };
  }
  window._scores = scoresFor;
  const scoreWord = (n, t) => t ? (n >= 90 ? "Excellent transit" : n >= 70 ? "Very good transit" : n >= 50 ? "Good transit" : n >= 25 ? "Some transit" : "Little transit")
    : (n >= 90 ? "Daily errands on foot" : n >= 70 ? "Most errands on foot" : n >= 50 ? "Some errands on foot" : n >= 25 ? "Most errands need a car" : "Errands need a car");
  function wfInit(root) {   // the row of places swipes sideways: arrows + soft edges show there is more, and it nudges once so people notice
    if (!root) return; const ws = [...root.querySelectorAll(".wfwrap")]; if (!ws.length) return;
    for (const w of ws) { const r = w.querySelector(".wfaith"), L0 = w.querySelector(".wfar.l"), R0 = w.querySelector(".wfar.r");
      const upd = () => { const more = r.scrollWidth - r.clientWidth > 4, atS = r.scrollLeft < 4, atE = r.scrollLeft > r.scrollWidth - r.clientWidth - 4;
        w.classList.toggle("fl", more && !atS); w.classList.toggle("fr", more && !atE); L0.hidden = !more || atS; R0.hidden = !more || atE; };
      r.addEventListener("scroll", upd, { passive: true }); upd(); setTimeout(upd, 60); }
    const r = ws[0].querySelector(".wfaith");
    if (r.scrollWidth - r.clientWidth > 4 && !root.querySelector(".mhint") && hintOnce("wfnudge") && !STILL()) setTimeout(() => { r.scrollTo({ left: 56, behavior: "smooth" }); setTimeout(() => r.scrollTo({ left: 0, behavior: "smooth" }), 650); }, 900); }
  // walk + drive, side by side: the same everywhere (card rows, pills, map labels, tags)
  const WDV = d => { const w = walkMin(d), c = driveMin(d); return { w: w <= 90 ? w : null, c }; };
  const WDcells = d => { const v = WDV(d); return `<span class="wdw">${WALK_SVG}<b>${v.w != null ? v.w : "&mdash;"}</b><i>${v.w != null ? "min" : ""}</i></span><span class="wdc">${CAR_SVG}<b>${durNum(v.c)}</b><i>min</i></span>`; };
  const WDinline = d => { const v = WDV(d); return `<span class="wdi">${WALK_SVG}${v.w != null ? v.w + "<small>min</small>" : "&mdash;"}</span><span class="wdi">${CAR_SVG}${durNum(v.c)}<small>min</small></span>`; };
  // ---- the small listing card head (photo, facts, price): the site passes its own data through getListingInfo
  // ===== DEMO START (D7): sample house photo
  // ===== Live site: the photo comes from your listing data (photo field)
  // one real photo for every sample listing (free Unsplash License, photo by Chelaxy Designs). The live site passes each home's own photo.
  const SAMPLE_PHOTO = "https://images.unsplash.com/photo-1675583102865-4d9314267cc4?w=900&q=70&auto=format&fit=crop";
  // ===== DEMO END (D7) =====
  const HERO_SVG = `<svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3f6"/><stop offset="1" stop-color="#eef5fb"/></linearGradient></defs><rect width="320" height="150" fill="url(#hsk)"/><circle cx="262" cy="34" r="14" fill="#fde7b0"/><rect y="118" width="320" height="32" fill="#cfe5c3"/><ellipse cx="40" cy="112" rx="34" ry="24" fill="#9cc79a"/><ellipse cx="292" cy="112" rx="30" ry="22" fill="#a9cf9f"/><path d="M92 120V72l68-40 68 40v48z" fill="#f8f4ee"/><path d="M80 76l80-48 80 48" fill="none" stroke="#7b8796" stroke-width="9" stroke-linejoin="round"/><rect x="146" y="88" width="28" height="32" rx="2" fill="#8a6f55"/><rect x="108" y="82" width="26" height="20" rx="2" fill="#bcd6ea"/><rect x="186" y="82" width="26" height="20" rx="2" fill="#bcd6ea"/><rect x="150" y="52" width="20" height="16" rx="2" fill="#bcd6ea"/><rect x="88" y="118" width="144" height="5" fill="#e3ddd3"/></svg>`;
  function cardHead(lat, lon) {
    const info = listingInfo(lat, lon), k = seenKey(lat, lon), ck = cmpHas(lat, lon), n = CMP.length, as = assessFor(lat, lon), sv = !!(S.isSaved && S.isSaved(k));
    const seen = (S.seenLine || "").replace(/<i>[^<]*<\/i>\s*/, "");
    const fact = (v, l) => v ? `<span><b>${v}</b><small>${l}</small></span>` : "";
    const facts = fact(info.beds, "Beds") + fact(info.baths, "Baths") + fact(info.sqft ? (+info.sqft).toLocaleString() : "", "sq ft") + fact(info.year, "Built") + fact(info.lot ? (+info.lot).toLocaleString() : "", "sq ft lot");
    const photo = HERO_SVG + (info.photo ? `<img src="${esc(info.photo)}" alt="Photo of the home" loading="lazy" decoding="async" onerror="this.remove()">` : "");
    let h = `<div class="lhero"><button type="button" class="lphoto" data-act="details" aria-label="See the listing details">${photo}</button>${seen ? `<span class="lseen"><i>&#10003;</i>${seen}</span>` : ""}<span class="lsamp">Tap for listing details</span>`
      + `<span class="lhb"><button type="button" class="lhi${sv ? " on" : ""}" data-act="save" aria-pressed="${sv}" aria-label="${sv ? "Saved. Tap to remove" : "Save this home"}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg></button>`
      + `<button type="button" class="lhi" data-act="share" aria-label="Share this home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg></button></span>`
      + `${info.photos ? `<span class="lcnt">1/${info.photos}</span>` : ""}</div>`;
    if (facts) h += `<div class="lfacts">${facts}</div>`;
    h += `<div class="lprow"><span class="lpbig"><b>${esc(info.price || document.getElementById("lpr").textContent.trim())}</b><small><i class="ldot"></i>${esc(info.status || "Active")}${info.listed ? " &middot; " + esc(info.listed) : ""}</small></span>`
      + `<button type="button" class="wcmp" data-act="cmp" aria-pressed="${ck}" title="Add to compare"><span class="cbx"></span>Compare</button><button type="button" class="lpx" data-act="close" aria-label="Close this home">&#10005;</button></div>`;
    { const oh = ohNext(info, 2) || ((info.openHouses || [])[0]); if (oh && !/sold/i.test(info.status || "")) h += `<div class="loh"><i aria-hidden="true"></i>Open house ${ohTxt(oh)}</div>`; }
    if (n >= 2 && ck) h += `<button type="button" class="wcmpgo" data-act="cmpgo">See ${n} homes side by side &rarr;</button>`;
    if (as) h += `<button type="button" class="lasx ${as.cls}" data-act="asx" aria-expanded="${!!S.asOpen}"><b>${as.near ? "About the same" : (as.d > 0 ? "+" : "−") + as.pctTxt}</b> ${as.near ? "as" : "vs"} assessed <span>(${as.dTxt})</span><i>?</i></button>`
      + (S.asOpen ? `<ul class="wasx"><li>Asking price: <b>${as.askTxt}</b></li><li>BC Assessment ${as.year || ""}: <b>${as.valTxt}</b></li>${as.land ? `<li>Land <b>${money(as.land)}</b> &middot; Building <b>${money(as.bldg || as.val - as.land)}</b></li>` : ""}${as.hist && as.hist.length ? `<li>Past years: ${as.hist.slice(0, 3).map(h => `${h[0]} <b>${money(h[1])}</b>`).join(" &middot; ")}</li>` : ""}<li>Difference: <b>${as.dTxt}</b> (${as.near ? "within 1%" : as.pctTxt + " " + as.word} assessed)</li><li>Assessed values are set for July 1 of the year before, so they often lag the market. Not an appraisal.${as.sample ? " <i>Sample numbers.</i>" : ""}</li></ul>` : "");
    return `<div class="lhead">${h}</div>`; }
  function whatsNear(lat, lon) {
    const kx = 111320 * Math.cos(lat * Math.PI / 180), dd = (y, x) => Math.hypot((x - lon) * kx, (y - lat) * 110540);
    const isT = S.dview === "transit", onP = k => !isT && S.cats.has(k), sc = scoresFor(lat, lon);
    const row = (act, pressed, ico, name, sub, d) => d == null ? "" : `<button type="button" class="wr2" data-act="${act}" aria-pressed="${pressed}">${ico}<span class="wrn"><b>${esc(short(name, 40))}</b>${sub ? `<small>${sub}</small>` : ""}</span>${WDcells(d)}</button>`;
    const sec = (ico, title, cols = true) => `<div class="nsec"><span>${title}</span>${cols ? `<em title="Walk">Walk</em><em title="Drive">Drive</em>` : ""}</div>`;
    const soft = (bg, fg, inner) => `<i class="sft" style="--bcn-sbg:${bg};--bcn-sfg:${fg}">${inner}</i>`;
    // score tabs: the scores ARE the tabs
    if (S.tabTried == null) S.tabTried = LS.get("bcNearby.tabTried", 0); if (!S.tabTried && !S.tabT) S.tabT = setTimeout(() => { S.tabTried = 1; }, 9000);
    let h = (onLst() && !S.place ? cardHead(lat, lon) : "") + `<div class="stabs" role="tablist"><button type="button" role="tab" class="stab w" data-act="places" aria-selected="${!isT}" title="Everyday walkability ${sc.walk}/100 · ${scoreWord(sc.walk)}"><b>${sc.walk}</b><span><strong>Walkability</strong><small>${!isT ? "Showing &#9662;" : "Tap to see"}</small></span></button>`
      + `<button type="button" role="tab" class="stab t${!isT && !S.tabTried ? " nudge" : ""}" data-act="transit" aria-selected="${isT}" title="Transit ${sc.transit}/100 · ${scoreWord(sc.transit, 1)}"><b>${sc.transit}</b><span><strong>Transit</strong><small>${isT ? "Showing &#9662;" : "Tap to see"}</small></span></button><button type="button" class="scq" data-act="info" aria-label="What do these mean?">?</button></div>`;
    h += `<ul class="scinfo" ${S.scInfo ? "" : "hidden"}>
      <li><b>Walkability (out of 100):</b> how many everyday needs are close by, such as groceries, parks, frequent transit, health care, recreation centres, places of worship, beaches and dog parks. Full points within 400 m, fewer up to 2 km.</li>
      <li><b>Transit (out of 100):</b> buses per hour within a short walk, plus SkyTrain.</li>
      <li><b>Walk / Drive:</b> minutes from this home. Walks add 30% to the straight-line distance to allow for streets. Drives are estimates; bridges, water and traffic can make them longer.</li>
      <li><b>Schools:</b> rating out of 10 from the Fraser Institute; &ldquo;N/R&rdquo; = not ranked. Catchments come from school districts and cities and change: always confirm with the district.</li>
      <li><b>Flood areas:</b> public maps from cities and the Province, some old. A guide only: check with the city or your insurer.</li>
      <li>Shops and restaurants are not counted. Not affiliated with Walk Score&reg;.</li></ul>`;
    let sb = null; for (const st of stations) { const d = dd(st.lat, st.lon); if (!sb || d < sb.d) sb = { st, d }; }
    let bb = null; for (const st of stops) { if (!st.lv[S.mode] || Math.abs(st.lat - lat) > .03 || Math.abs(st.lon - lon) > .045) continue; const d = dd(st.lat, st.lon); if (!bb || d < bb.d) bb = { st, d }; }
    const brs = bb ? bb.st.routes.filter(r => { const f = freqOf(r); return f && f <= 30; }).sort((a, b) => freqOf(a) - freqOf(b)) : [];
    const g = nearestPlace("grocery", lat, lon, p => p.sub === "supermarket"), pk = nearestPlace("park", lat, lon), er = nearestPlace("health", lat, lon, isER), uc = nearestPlace("health", lat, lon, p => p.sub === "urgent");
    const fz = floodAt(lat, lon);
    if (fz.length) h += `<button type="button" class="wflood" data-act="flood" title="${esc(fz.map(z => HZ[z.hz][0] + " · " + z.src[0] + (z.src[2] ? " (" + z.src[2] + ")" : "")).join("; "))}"><i>!</i><span><b>In a mapped flood risk area</b><small>${fz.map(z => HZ[z.hz][0]).filter((v, i, a) => a.indexOf(v) === i).join(" · ")} &middot; ${S.flood ? "tap to hide on map" : "tap to see on map"}</small></span></button>`;
    h += `<div class="wbody">`;
    if (isT) {
      h += sec(soft("#e6f4f1", "#0f766e", SVG('<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 20l-2 2M15 20l2 2"/>')), "SkyTrain &amp; buses");
      if (sb && sb.d < 15000) h += row("sky", S.tSky, soft("#e6f4f1", "#0f766e", SVG('<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 20l-2 2M15 20l2 2"/>')), sb.st.label + " Station", "SkyTrain &middot; " + esc(sb.st.lines.replace(/ Line/g, "")), sb.d);
      if (bb && brs.length) h += row("bus", S.tBus, soft("#eef4e6", "#4d6b1f", SVG('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8 20v-3M16 20v-3"/>')), busName(brs.slice(0, 3).map(r => r.r)), "every " + range(brs.slice(0, 3).map(freqOf)) + " min &middot; " + esc(short(bb.st.label, 30)), bb.d);
    } else {
      const sch = ["E", "M", "S"].map(lv => { const n = schoolFor(lat, lon, lv); if (!n) return ""; const [bg, fg] = band(n.p.rating), r = n.p.rating == null ? "N/R" : rTxt(n.p.rating);
        const grades = lv === "E" ? "K&ndash;7" : lv === "M" ? "Middle" : "8&ndash;12";
        return row("s:" + (lv === "E" ? "E" : "S"), onP("school") && lvOn(lv), `<i class="sft srt" style="background:${bg};color:${fg}" title="${n.p.rating == null ? "Not ranked by the Fraser Institute" : "Fraser rating " + r + " out of 10"}">${r}</i>`, n.p.name, n.inCatch ? "In catchment" : n.shared ? "Shared catchment" : "Closest school", n.d); }).join("");
      if (sch) h += sec(soft("#eef2fb", BRAND(), SVG('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>')), "Catchment schools") + sch;
      h += sec(soft("#fff4e0", "#b45309", SVG('<path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>')), "Everyday places");
      if (g) h += row("c:grocery", onP("grocery") && S.groc.has("supermarket"), soft("#fff4e0", "#b45309", CATS.grocery.ico), g.p.name, "Supermarket", g.d);
      if (pk) h += row("c:park", onP("park"), soft("#e8f5e9", "#2e7d32", CATS.park.ico), pk.p.name, "Park", pk.d);
      if (er) h += row("h:er", onP("health") && S.hlv.has("er"), soft("#fdecec", "#c62828", CATS.health.ico), er.p.name, "Hospital, ER open 24/7", er.d);
      if (uc) h += row("h:uc", onP("health") && S.hlv.has("uc"), soft("#f3edfd", "#6d28d9", CATS.health.ico), uc.p.name, "Urgent care", uc.d);
    }
    h += `</div>`;
    const info = {}; let firstF = null;
    const pill = (act, pressed, ico, n, kind) => { if (!n) return ""; const t = tm(n.d); info[act] = { kind, name: n.p.name, t, ico, d: n.d };
      return `\u0001${pressed ? 1 : 0}<button type="button" class="wf${S.wnSel === act ? " sel" : ""}" data-act="${act}" aria-pressed="${pressed}" title="${kind}: ${esc(n.p.name)}">${ico}<span class="wfk">${kind === "Buddhist temple" ? "Buddhist" : kind}</span>${WDinline(n.d)}</button>`; };
    if (!isT) {
      let w = ""; for (const f of Object.keys(REL)) { const n = nearestPlace("worship", lat, lon, p => p.sub === f); if (n && (!firstF || n.d < firstF.d)) firstF = { act: "f:" + f, d: n.d };
        w += pill("f:" + f, onP("worship") && S.faith.has(f), `<i class="sft sm" style="--bcn-sbg:${FCOL[f][0]}33;--bcn-sfg:${FCOL[f][0]}">${REL[f][0]}</i>`, n, FN2[f]); }
      let o = ""; for (const k of ["beach", "rec", "dog_park"]) o += pill("c:" + k, onP(k), `<i class="sft sm" style="--bcn-sbg:${CATS[k].c}22;--bcn-sfg:${CATS[k].c}">${CATS[k].ico}</i>`, nearestPlace(k, lat, lon), ({ beach: "Beach", rec: "Recreation centre", dog_park: "Dog park" })[k]);
      for (const x of [...S.groc].filter(x => x !== "supermarket")) o += pill("g:" + x, onP("grocery") && S.groc.has(x), `<i class="sft sm" style="--bcn-sbg:${GCOL[x]}22;--bcn-sfg:${GCOL[x]}">${CATS.grocery.ico}</i>`, nearestPlace("grocery", lat, lon, p => p.sub === x), GSHORT[x] + " grocery");
      const wrap = inner => `<div class="wfwrap"><button type="button" class="wfar l" data-act="wfl" aria-label="More, left" hidden>&lsaquo;</button><div class="wfaith">${inner}</div><button type="button" class="wfar r" data-act="wfr" aria-label="More, right">&rsaquo;</button></div>`;
      if (w || o) h += `<div class="nsec"><span>${soft("#f3e8ff", "#7e22ce", SVG('<path d="M12 3l3 4H9z"/><path d="M6 21V10h12v11M10 21v-5h4v5"/>'))}More places nearby<i class="nsdn" aria-hidden="true">&darr;</i><small class="nsh">Tap to see on map</small></span></div><p class="nsub">Worship, Beaches, Recreation, Dog Parks &middot; <b>Swipe <span class="nsar">&rarr;</span></b> For Times</p>\u0002` + wrap((w + o).split("\u0001").filter(Boolean).map((s, i) => [s[0] === "1" ? 0 : 1, i, s.slice(1)]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2]).join(""));
    }
    const sel = info[S.wnSel] ? S.wnSel : null, I = sel && info[sel];
    const det = I ? `<div class="wdet ndet" id="ndet">${I.ico}<span><b>${esc(short(I.name, 40))}</b><small>${I.kind}</small></span>${WDcells(I.d)}</div>` : "";
    h = h.includes("\u0002") ? h.replace("\u0002", det) : h + det;   // the chosen place shows ABOVE the pills, never behind the bottom buttons
    h += `<div class="wfoot2"><button type="button" class="wshare" data-act="share" aria-label="Share this home">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>'}<span>Share</span></button>`
      + `${onLst() && !S.place ? `<button type="button" class="whide" data-act="hide" title="${HIDDEN[seenKey(lat, lon)] ? "Show this home on the map again" : "Not interested: hide it from your map"}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c5.5 0 9 5.5 9 7a12 12 0 0 1-2.6 3.4M6.3 6.3C4.2 7.7 3 10.3 3 12c0 1.5 3.5 7 9 7a9 9 0 0 0 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg><span>${HIDDEN[seenKey(lat, lon)] ? "Unhide" : "Hide"}</span></button>` : ""}`
      + `<button type="button" class="wdetail2" id="wdetail"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c-4.1 0-7.5 3.2-7.5 7.3 0 5.4 7.5 11.7 7.5 11.7s7.5-6.3 7.5-11.7c0-4.1-3.4-7.3-7.5-7.3zm0 10a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z"/></svg>Show on map</button>${hintOnce("map") ? `<i class="mhint" aria-hidden="true">See it all on the map</i>` : ""}</div>`;
    return h; }
  function wnClick(e) { e.stopPropagation(); const bb0 = e.target.closest("button"); if (bb0 && bb0.dataset.act && !/^(info|flood)$/.test(bb0.dataset.act) && S.lymode === "map") { S.lymode = "dist"; S.mapCats.clear(); S.mapGroc.clear(); S.mapFaith.clear(); } const b = e.target.closest("button"); if (!b) return;
    if (b.id === "wdetail") { window.BCNearby._afterShow && window.BCNearby._afterShow(); setTimeout(() => window.BCNearby._signinTry && window.BCNearby._signinTry(), 4000); S.cardClosed = true; document.getElementById("lcard").hidden = true; openLy(true); if (S.tapped) check(...S.tapped); return; }   // card closes, the map and lines take over
    const a = b.dataset.act; if (!a) return;
    if (a === "share") { shareHome(); return; }
    if (a === "cmp") { cmpToggle(S.tapped[0], S.tapped[1]); return; }
    if (a === "cmpgo") { cmpOpen(); return; }
    if (a === "hide") { hideToggle(S.tapped[0], S.tapped[1]); return; }
    if (a === "asx") { S.asOpen = !S.asOpen; if (S.tapped) check(...S.tapped); return; }
    if (a === "details") { if (S.lstLL) lstDetails(S.lstLL[0], S.lstLL[1]); return; }
    if (a === "save") { if (S.lstLL && S.toggleSave) S.toggleSave(S.lstLL[0], S.lstLL[1]); return; }
    if (a === "close") { document.getElementById("lx").click(); return; }
    if (a === "wfl" || a === "wfr") { const r = b.parentElement.querySelector(".wfaith"); r.scrollBy({ left: (a === "wfr" ? 1 : -1) * r.clientWidth * .7, behavior: "smooth" }); return; }
    if (a === "info") { S.scInfo = !S.scInfo; const p = (e.currentTarget.querySelector ? e.currentTarget : document).querySelector(".scinfo"); if (p) p.hidden = !S.scInfo; return; }
    if (a === "flood") { if (!S.flood && !floodOK()) { askFlood(() => { S.flood = true; drawFlood(); saveChoices(); if (S.tapped) check(...S.tapped); }); return; } S.flood = !S.flood; drawFlood(); saveChoices(); if (S.tapped) check(...S.tapped); if (S.box && S.lstLL) S.box.innerHTML = whatsNear(...S.lstLL); return; }
    if (a === "transit" || a === "places") { S.tabTried = 1; LS.set("bcNearby.tabTried", 1); }
    if (a === "transit") { if (S.dview === "transit") return; S.tSky = true; S.tBus = false; setTransit(true); return; }
    if (a === "places") { if (S.dview === "places") return; setTransit(false); if (!S.cats.size) { addMain("grocery"); addSub("g", "supermarket"); addMain("park"); } sync2(); return; }
    if (a === "sky" || a === "bus") { if (S[a === "sky" ? "tSky" : "tBus"] && S.dview === "transit") return; toggleTransit(a); return; }
    if (b.classList.contains("wf")) { S.wnSel = a; S.wnJust = Date.now(); }
    if (b.classList.contains("nchip") && a.startsWith("f:") && S.dview === "places" && S.cats.has("worship")) { toggleMain("worship"); return; }
    if (a.startsWith("s:")) { const v = a.slice(2), go = () => { if (PHONE) S.slv = new Set([v]); else S.slv.add(v); if (!(S.dview === "places" && S.cats.has("school"))) toggleMain("school"); else sync2(); };
      if (!(S.dview === "places" && S.cats.has("school")) && !ackOK("school")) { askAck("school", go); return; } go(); return; }
    if (a.startsWith("h:")) { const v = a.slice(2); if (PHONE) S.hlv = new Set([v]); else S.hlv.add(v); if (!(S.dview === "places" && S.cats.has("health"))) toggleMain("health"); else sync2(); return; }
    const [kind, key] = a.split(":");
    if (kind === "c") { if (key === "grocery") { if (S.dview === "places" && S.cats.has("grocery") && S.groc.has("supermarket")) toggleSub("g", "supermarket"); else { if (!(S.dview === "places" && S.cats.has("grocery"))) addMain("grocery"); toggleSub("g", "supermarket"); } return; }
      mainGuard(key); return; }
    toggleSub(kind, key); }
  document.getElementById("wn").addEventListener("click", wnClick);
  // ######## PART 9: BCNearby.show / clear (the hook your listing click calls) ########
  // ===== the only hook the live site needs: call this from its existing listing click handler
  window.BCNearby = Object.assign(window.BCNearby || {}, {
    show(lat, lon, box) { S.lstLL = [lat, lon]; S.onListing = true; check(lat, lon); S.onListing = false;   // draws the lines; with a box (an empty div under the site's listing card) also fills the "What's near" list
      if (box) { S.box = box; box.innerHTML = whatsNear(lat, lon); wfInit(box); if (!box._wn) { box.addEventListener("click", wnClick); box._wn = true; } } return S.lastSummary || ""; },   // draws lines + bubble, returns e.g. "10-min walk: 3 parks, 1 grocery store"
    clear() { S.lstLL = null; S.tapped = null; liveBegin(); liveEnd(); tapLayer.clearLayers(); S.lineLbls = []; renderLineLabels(); }
  });
  // listing card sits right above the price tag you tapped (below it if there is no room), with a pointer to it
  function placeLcard(pan) { return; const lc = document.getElementById("lcard"); if (lc.hidden || !S.lstLL) return;
    const sz = map.getSize(), p = map.latLngToContainerPoint(S.lstLL), w = lc.offsetWidth, h = lc.offsetHeight, phone = innerWidth <= 720;
    const sh = document.getElementById("sheet"), shR = sh && !sh.hidden ? sh.getBoundingClientRect() : null, mr = map.getContainer().getBoundingClientRect();
    const xMax = (!phone && shR && shR.width ? shR.left - mr.left - 10 : sz.x - 8) - w, yMax = (phone && shR ? shR.top - mr.top - 8 : sz.y - 8);
    const top0 = phone ? 62 : 8, gap = 24;
    if (pan) { const need = top0 - (p.y - h - gap); if (need > 0 && p.y + h + gap + 10 > yMax) { map.panBy([0, -need], { animate: false }); return placeLcard(false); } }
    let y = p.y - h - gap, below = false; if (y < top0) { y = p.y + gap - 4; below = true; }
    y = Math.min(y, yMax - h);
    const x = Math.max(8, Math.min(xMax, p.x - w / 2));
    lc.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; lc.classList.toggle("below", below);
    lc.style.setProperty("--bcn-ax", Math.max(18, Math.min(w - 18, p.x - x)) + "px"); }
  map.on("move zoom viewreset resize", () => placeLcard(false));
  // phone: slide the map so the home and the top of its walking circle peek out above the card
  function peekHome() { if (!PHONE || !S.lstLL) return; const lc = document.getElementById("lcard"); if (lc.hidden) return;
    const mr = map.getContainer().getBoundingClientRect(), cTop = lc.getBoundingClientRect().top - mr.top, sb = document.getElementById("sbar"), sTop = sb ? sb.getBoundingClientRect().bottom - mr.top + 8 : 60;
    if (cTop - sTop < 60) return; const p = map.latLngToContainerPoint(S.lstLL), want = sTop + (cTop - sTop) * .62, dy = p.y - want;
    if (Math.abs(dy) > 8) map.panBy([0, dy], { animate: !matchMedia("(prefers-reduced-motion: reduce)").matches, duration: .45 }); }
  S.peekHome = peekHome;
  // ######## PART 10: LAYERS BUTTON AND CHECKLIST ########
  // ===== layers button: one yellow button opens a checklist (replaces the chip bar)
  const LAY_SVG = document.getElementById("fab").querySelector("svg").outerHTML;
  const fab = document.getElementById("fab"), lym = document.getElementById("lymenu"), hint = document.getElementById("fabhint");
  const hideHint = () => hint.classList.add("gone");
  setTimeout(() => fab.classList.add("ping"), 900); setTimeout(hideHint, 9000);
  const LYICO = k => k === "sky" ? `<i style="background:#0f766e">${SVG('<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 11h14M9 20l-2 2M15 20l2 2"/>')}</i>`
    : k === "bus" ? `<i style="background:#4d6b1f">${SVG('<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3"/>')}</i>`
    : `<i style="${k === "health" ? "background:#fff;color:#dc2626;border:1.5px solid #dc2626" : "background:" + CATS[k].c}">${CATS[k].ico}</i>`;
  function renderLayers() {
    const t = S.dview === "transit", onP = k => !t && S.cats.has(k);
    const eye = (id, on, nm) => `<button type="button" class="lyeye" data-eye="${id}" aria-pressed="${on}" aria-label="${on ? "Hide" : "Show"} all ${nm} on the map" title="${on ? "Showing locations on the map (no distance)" : "Show on map: locations only, no distance"}">${on ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7c2 0 3.7.7 5.1 1.6M22 12s-3.6 7-10 7c-2 0-3.7-.7-5.1-1.6"/><path d="M3 3l18 18"/></svg>'}</button>`;
    const mapOn = k => k === "sky" ? S.skyMap : k === "bus" ? S.busMap : k === "grocery" ? S.mapGroc.size > 0 : k === "worship" ? S.mapFaith.size > 0 : S.mapCats.has(k);
    const row = (k, nm, on, extra = "") => `<div class="lyw"><button type="button" class="lyr" data-k="${k}" aria-pressed="${S.lymode === "map" && k !== "sky" && k !== "bus" ? mapOn(k) : on}"><span class="cb"></span>${LYICO(k)}<span class="nm">${nm}</span>${extra}</button>${k === "sky" || k === "bus" ? "" : eye(k, mapOn(k), nm)}</div>`;
    const subs = (kind, keys, names, col, set, mset) => `<div class="lysub">` + keys.map(x => `<div class="lyw"><button type="button" class="lyr" data-s="${kind}:${x}" aria-pressed="${S.lymode === "map" ? mset.has(x) : set.has(x)}"><span class="cb"></span><span class="dot" style="background:${col(x)}"></span><span class="nm">${names[x]}</span></button>${eye(kind + ":" + x, mset.has(x), names[x])}</div>`).join("") + `</div>`;
    let h = `<div class="lyh"><b>Choose what to see</b><span>then tap a home</span></div><div class="lymode" role="radiogroup" aria-label="How to show"><button type="button" data-lymode="dist" aria-pressed="${S.lymode !== "map"}"><b>Distance</b><small>${PHONE ? "line + time" : "line + walk time"}</small></button><button type="button" data-lymode="map" aria-pressed="${S.lymode === "map"}"><b>On map</b><small>${PHONE ? "icons only" : "locations only"}</small></button></div>`;
    h += `<div class="lyring"><span>Walking circles</span><button type="button" class="lyrb" data-ring="10" aria-pressed="${S.w10}">10 min</button><button type="button" class="lyrb" data-ring="20" aria-pressed="${S.w20}">20 min</button></div>`;
    h += `<p class="lys">Scores</p><div class="lyw"><button type="button" class="lyr" data-score="1" aria-pressed="${!!S.scoreMap}"><span class="cb"></span><i class="sico">86</i><span class="nm">Walkability on map</span></button></div>`;
    h += `<p class="lys">Flood risk</p><div class="lyw"><button type="button" class="lyr" data-flood="1" aria-pressed="${!!S.flood}"><span class="cb"></span><i class="fico"></i><span class="nm">Flood risk areas</span><span class="lyx fx">guide only</span></button>${S.flood ? `<div class="lyleg">${[["fp", "200-year"], ["f20", "20-year"], ["cst", "Coastal"], ["tsu", "Tsunami"], ["deb", "Debris flow"], ["drn", "Drainage"]].map(([k, n]) => `<span><i style="background:${HZ[k][1]}"></i>${n}</span>`).join("")}</div>` : ""}</div>`
      + `<p class="lys">Property</p><div class="lyw"><button type="button" class="lyr" data-lots="1" aria-pressed="${!!S.lots}"><span class="cb"></span><i class="lico"></i><span class="nm">Lot lines</span><span class="lyx fx">not a survey</span></button></div>`

      ;
    h += `<p class="lys">Transit</p>` + row("sky", "SkyTrain", t && S.tSky, nearSky() ? "" : `<span class="lyx">not in this area</span>`) + row("bus", "Buses", t && S.tBus) + `<div class="lyw"><button type="button" class="lyr" data-areas="1" aria-pressed="${S.view === "areas"}"><span class="cb"></span><i class="aico"></i><span class="nm">Transit areas (shading)</span></button></div>` + `<div class="lyseg">${[["weekday", PHONE ? "Weekday" : "Weekdays"], ["weekend", PHONE ? "Weekend" : "Weekends"], ["all_week", PHONE ? "Daily" : "Every day"]].map(([v, n]) => `<button type="button" data-mode="${v}" aria-pressed="${S.mode === v}">${n}</button>`).join("")}</div>`;
    h += `<p class="lys">Places &middot; ${PHONE ? "one at a time" : "up to 2"}</p>`;
    for (const k of ["school", "health", "grocery", "park", "dog_park", "beach", "rec", "worship"]) {
      const nm = k === "worship" ? "Places of worship" : CHIPNAME[k];
      h += row(k, nm, onP(k), k === "grocery" || k === "worship" ? (PHONE ? "" : `<span class="lyx">${onP(k) ? "select up to 2" : "&#9662;"}</span>`) : "");
      if (k === "school" && (onP(k) || S.mapCats.has("school"))) h += `<div class="lysub">` + [["E", "Elementary"], ["S", "Middle &amp; secondary"]].map(([v, n]) => `<div class="lyw"><button type="button" class="lyr" data-slv="${v}" aria-pressed="${S.slv.has(v)}"><span class="cb"></span><span class="nm">${n}</span></button></div>`).join("") + `</div>`;
      if (k === "health" && (onP(k) || S.mapCats.has("health"))) h += `<div class="lysub">` + [["er", "Hospital &middot; ER 24/7"], ["uc", "Urgent care"]].map(([v, n]) => `<div class="lyw"><button type="button" class="lyr" data-hlv="${v}" aria-pressed="${S.hlv.has(v)}"><span class="cb"></span><span class="dot" style="background:${v === "er" ? "#dc2626" : "#7c3aed"}"></span><span class="nm">${n}</span></button></div>`).join("") + `</div>`;
      if (k === "grocery" && (onP(k) || S.mapGroc.size)) h += subs("g", Object.keys(GROC), GSHORT, x => GCOL[x], onP(k) ? S.groc : new Set(), S.mapGroc);
      if (k === "worship" && (onP(k) || S.mapFaith.size)) h += subs("f", Object.keys(REL), FN2, x => FCOL[x][0], onP(k) ? S.faith : new Set(), S.mapFaith); }
    h += `<p class="lynote">${S.lymode === "map" ? "On map: shows every location of that kind as an icon, no lines." : "Distance: a line and walk time to the closest one. Transit, schools and flood show on their own."}</p><button type="button" class="lydone" id="lydone">Done</button><p class="lyver">Version Nov 13 · AA</p>`;
    { const k = h.lastIndexOf('<p class="lynote">'); const body = k >= 0 ? h.slice(0, k) : h, foot = k >= 0 ? h.slice(k) : "";
      const old = lym.querySelector(".lyscroll"), sc = old ? old.scrollTop : 0;
      lym.innerHTML = `<button type="button" class="lyx2" id="lyx2" aria-label="Close">&times;</button><div class="lyscroll">${body}</div><div class="lyfoot">${foot}</div>`;
      lym.querySelector(".lyscroll").scrollTop = sc; }
    const n = t ? (S.tSky ? 1 : 0) + (S.tBus ? 1 : 0) : S.cats.size; document.getElementById("fbadge").textContent = n ? n : "";
    const nmOn = t ? [S.tSky && "SkyTrain", S.tBus && "Buses"].filter(Boolean) : [...S.cats].map(k => k === "grocery" && S.groc.size ? [...S.groc].map(g => GSHORT[g]).join(" + ") : k === "worship" && S.faith.size ? [...S.faith].map(f => FN2[f]).join(" + ") : CHIPNAME[k]);
    fab.title = nmOn.length ? "Showing: " + nmOn.join(", ") + " · tap to change" : "Choose what to show"; fab.setAttribute("aria-label", fab.title); }
  const rL0 = renderLayers; renderLayers = function () { const sc = lym.querySelector(".lyscroll"), had = new Set(sc ? [...sc.querySelectorAll(".lysub")].map(s => s.previousElementSibling && s.previousElementSibling.querySelector("[data-c],[data-main],button") ? s.previousElementSibling.textContent.trim() : "") : []), top = sc ? sc.scrollTop : 0;
    rL0.apply(this, arguments); const sc2 = lym.querySelector(".lyscroll"); if (!sc2) return; sc2.scrollTop = top;
    const fresh = [...sc2.querySelectorAll(".lysub")].find(s => s.previousElementSibling && !had.has(s.previousElementSibling.textContent.trim()));
    if (fresh) { const head = fresh.previousElementSibling, r0 = sc2.getBoundingClientRect(), rh = head.getBoundingClientRect(), rs = fresh.getBoundingClientRect();
      if (rs.bottom > r0.bottom - 4) sc2.scrollTo({ top: sc2.scrollTop + Math.min(rh.top - r0.top - 6, rs.bottom - r0.bottom + 12), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } };
  const openLy = v => { lym.hidden = !v; fab.setAttribute("aria-expanded", v); document.body.classList.toggle("lyopen", !!v); if (v) { hideHint(); fab.classList.remove("ping"); closeDD(); renderLayers(); } };
  fab.addEventListener("click", e => { e.stopPropagation(); openLy(lym.hidden); });
  lym.addEventListener("click", e => { e.stopPropagation(); const b = e.target.closest("button"); if (!b) return;
    if (b.id === "lydone" || b.id === "lyx2") { openLy(false); return; }
    if (b.dataset.hlv) { const v = b.dataset.hlv; if (PHONE) { if (!S.hlv.has(v)) { S.hlv = new Set([v]); toast(v === "er" ? "Hospitals (ER) only · one at a time on phone" : "Urgent care only · one at a time on phone"); sync2(); } return; } if (S.hlv.has(v)) { if (S.hlv.size === 1) { toast("Keep at least one"); return; } S.hlv.delete(v); } else S.hlv.add(v); sync2(); return; }
    if (b.dataset.slv) { const v = b.dataset.slv; if (PHONE) { if (!S.slv.has(v)) { S.slv = new Set([v]); toast(v === "E" ? "Elementary only · one at a time on phone" : "Middle & secondary only · one at a time on phone"); sync2(); } return; } if (S.slv.has(v)) { if (S.slv.size === 1) { toast("Keep at least one school level"); return; } S.slv.delete(v); } else S.slv.add(v); sync2(); return; }
    if (b.dataset.mode) { S.mode = b.dataset.mode; try { sync(); } catch (er) {} refreshLines(); if (S.tapped) check(...S.tapped); renderLayers(); return; }
    if (b.dataset.areas) { S.view = S.view === "areas" ? "tap" : "areas"; try { sync(); } catch (er) {} if (S.tapped) check(...S.tapped); toast(S.view === "areas" ? "Shading shows where frequent transit is a short walk away · a guide only" : "Transit areas hidden"); renderLayers(); return; }
    if (b.dataset.score) { S.scoreMap = !S.scoreMap; saveChoices(); renderLayers(); if (S.tapped) check(...S.tapped); return; }
    if (b.dataset.lst || b.dataset.lonly || b.dataset.lgrp) { lstPick(b); renderLayers(); return; }
    if (false) { const was = [...S.lstShow].some(k => LST_SOLD.has(k));
      if (b.dataset.lgrp) S.lstShow = new Set(b.dataset.lgrp === "sold" ? ["sold", "fcs"] : ["active", "drop"]);
      else if (b.dataset.lonly) S.lstShow = new Set([b.dataset.lonly]);
      else { const k = b.dataset.lst; if (S.lstShow.has(k)) S.lstShow.delete(k); else S.lstShow.add(k);
        for (const x of [...S.lstShow]) if (LST_SOLD.has(x) !== LST_SOLD.has(k)) S.lstShow.delete(x);   // for sale and sold never mix
        if (!S.lstShow.size) { S.lstShow.add(k); toast("At least one kind stays on"); } }
      const now = [...S.lstShow].some(k => LST_SOLD.has(k)); if (now !== was) toast(now ? "Showing sold homes · for-sale homes hidden" : "Showing homes for sale · sold homes hidden");
      lstApply(); try { localStorage.setItem("bcNearby.lst.v1", JSON.stringify([...S.lstShow])); } catch (e) {} renderLayers(); return; }
    if (b.dataset.measure) { openLy(false); measureStart(); return; }
    if (b.dataset.lots) { S.lots = !S.lots; lotsApply(true); saveChoices(); renderLayers(); return; }
    if (b.dataset.flood) { if (!S.flood && !floodOK()) { askFlood(() => { S.flood = true; drawFlood(); saveChoices(); renderLayers(); if (S.tapped) check(...S.tapped); }); return; } S.flood = !S.flood; drawFlood(); toast(S.flood ? "Showing flood risk areas · public info" : "Flood risk areas hidden"); saveChoices(); renderLayers(); if (S.tapped) check(...S.tapped); return; }
    if (b.dataset.ring) { const k = b.dataset.ring === "10" ? "w10" : "w20"; S[k] = !S[k]; document.getElementById(k + "-sw").setAttribute("aria-pressed", S[k]);
      if (S.tapped) { check(...S.tapped); if (k === "w20" && S.w20 && map.getZoom() > 15) map.setZoom(15); } saveChoices(); renderLayers(); return; }
    if (b.dataset.lymode) { const m = b.dataset.lymode; if (S.lymode === m || (m === "dist" && !S.lymode)) return; S.lymode = m;
      if (m === "map") { S.cats.clear(); S.mainOrder = []; S.subOrder = []; S.groc.clear(); S.faith.clear(); if (S.dview === "transit") { S.dview = "places"; S._dist = false; } toast("On map: tap a place to see all its locations"); }
      else { S.mapCats.clear(); S.mapGroc.clear(); S.mapFaith.clear(); toast("Distance: tap a place for a line with walk and drive times"); }
      sync2(); return; }
    const eyeId = b.dataset.eye || (S.lymode === "map" && b.classList.contains("lyr") && ((b.dataset.k && b.dataset.k !== "sky" && b.dataset.k !== "bus") ? b.dataset.k : b.dataset.s ? b.dataset.s.replace(/^g:/, "g:").replace(/^f:/, "f:") : null));
    if (eyeId && S.dview === "transit") { S.dview = "places"; S._dist = false; toast("Places on · transit turned off"); }
    if (eyeId) { floodOffForPhone(); const id = eyeId, flip = (set, v) => set.has(v) ? (set.delete(v), false) : (set.add(v), true); let on = false, zmin = 0;
      if (PHONE && id !== "sky" && id !== "bus") {          // phone: one "on map" layer at a time
        const cur = id.includes(":") ? (id[0] === "g" ? "grocery" : "worship") : id, wasOn = id.includes(":") ? (id[0] === "g" ? S.mapGroc : S.mapFaith).has(id.slice(2)) : (id === "grocery" ? S.mapGroc.size > 0 : id === "worship" ? S.mapFaith.size > 0 : S.mapCats.has(id));
        if (id.includes(":")) { const st = id[0] === "g" ? S.mapGroc : S.mapFaith; if (st.size > 1) { st.clear(); } }
        if (!wasOn || (id.includes(":") && !(id[0] === "g" ? S.mapGroc : S.mapFaith).has(id.slice(2)))) { const others = [...S.mapCats].filter(k => k !== cur); for (const k of others) S.mapCats.delete(k); if (cur !== "grocery") S.mapGroc.clear(); if (cur !== "worship") S.mapFaith.clear();
          if (id.includes(":")) (id[0] === "g" ? S.mapGroc : S.mapFaith).clear(); } }
      if (id === "sky") { S.skyMap = !S.skyMap; on = S.skyMap; }
      else if (id === "bus") { S.busMap = !S.busMap; on = S.busMap; }
      else if (id === "grocery" || id === "worship") { const set = id === "grocery" ? S.mapGroc : S.mapFaith, all = Object.keys(id === "grocery" ? GROC : REL);
        on = !set.size; set.clear(); if (on) all.forEach(x => set.add(x)); if (on) S.mapCats.add(id); else S.mapCats.delete(id); zmin = id === "grocery" ? 13 : 12; }
      else if (id.includes(":")) { const [kind, key] = id.split(":"), set = kind === "g" ? S.mapGroc : S.mapFaith, cat = kind === "g" ? "grocery" : "worship";
        on = flip(set, key); if (set.size) S.mapCats.add(cat); else S.mapCats.delete(cat); zmin = kind === "g" ? 13 : 12; }
      else { on = flip(S.mapCats, id); zmin = id === "park" ? 13 : CATS[id].z; }
      if (on && zmin && map.getZoom() < zmin) map.setZoom(zmin);
      sync2();
      if (on) { // make sure something is actually visible: if none in view, zoom out to the closest few
        const want = id === "sky" || id === "bus" ? null : id.includes(":") ? (p => p.cat === (id[0] === "g" ? "grocery" : "worship") && p.sub === id.slice(2)) : id === "grocery" ? (p => p.cat === "grocery") : id === "worship" ? (p => p.cat === "worship") : (p => p.cat === id);
        let n = 0;
        if (want && id !== "park") { const bb = map.getBounds(); const list = places.filter(want); n = list.filter(p => bb.contains([p.lat, p.lon])).length;
          if (!n && list.length) { const c = S.tapped ? L.latLng(S.tapped) : map.getCenter(); const near3 = list.map(p => [p, c.distanceTo([p.lat, p.lon])]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(x => [x[0].lat, x[0].lon]);
            map.fitBounds(L.latLngBounds([c, ...near3]).pad(.25), { maxZoom: zmin || 15 }); toast("None in view · zoomed out to the closest ones"); return; } }
        toast(want && id !== "park" ? `Showing ${n} on the map · no distance lines` : "Showing on the map · no distance lines"); }
      else toast("Hidden from the map"); return; }
    if (b.dataset.s) { const [kind, key] = b.dataset.s.split(":"); toggleSub(kind, key); return; }
    const k = b.dataset.k; if (k === "sky" || k === "bus") { if (S.lymode === "map") { S.lymode = "dist"; S.mapCats.clear(); S.mapGroc.clear(); S.mapFaith.clear(); } toggleTransit(k); return; }
    mainGuard(k); });
  ["fab", "lymenu", "fack"].forEach(id => { const el = document.getElementById(id); L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el); });
  map.on("click", () => openLy(false));
  S.lyReady = true; renderLayers();
  // Near me: asks permission, then centres the map on the visitor
  const meLayer = L.layerGroup().addTo(map);
  document.getElementById("nearme").onclick = e => { e.stopPropagation(); if (S.lstLL) { if (lstOn) { lstOn.classList.remove("on"); lstOn = null; } S.lstLL = null; S.cardClosed = false; document.getElementById("lcard").hidden = true; }
    if (!navigator.geolocation) { toast("Location isn't available on this device"); return; }
    navigator.geolocation.getCurrentPosition(pos => { const ll = [pos.coords.latitude, pos.coords.longitude]; meLayer.clearLayers();
      L.circleMarker(ll, { radius: 7, weight: 3, color: "#fff", fillColor: "#2563eb", fillOpacity: 1, interactive: false }).addTo(meLayer); map.setView(ll, 15); toast("Showing homes near you"); },
      () => toast("Location not shared · search an address instead"), { timeout: 8000 }); };
  L.DomEvent.disableClickPropagation(document.getElementById("nearme"));
  map.on("zoomend", () => { map.getZoom() >= 13 ? lstLayer.addTo(map) : map.removeLayer(lstLayer); });
  // ######## PART 11: SETTINGS (BCNearbyConfig) AND ADDRESS SEARCH ########
  // ================= settings the site can pass in (window.BCNearbyConfig) =================
  const CFG = Object.assign({ geocoderKey: "", homeValueUrl: "", onSignIn: null }, window.BCNearbyConfig || {});
  // ================= address search: BC Geocoder (suggest as you type) + OpenStreetMap backup (on Enter) =================
  const sIn = document.getElementById("srchIn"), sDD = document.getElementById("srchDD"), sX = document.getElementById("srchX"), sBar = document.getElementById("srch");
  L.DomEvent.disableClickPropagation(sBar); L.DomEvent.disableClickPropagation(sDD); L.DomEvent.disableScrollPropagation(sDD);
  const sBtn = document.getElementById("srchBtn"), nmB = document.getElementById("nearme"); L.DomEvent.disableClickPropagation(sBtn);
  const placeSBtn = () => { sBtn.style.left = (nmB.offsetLeft + nmB.offsetWidth + 8) + "px"; sBtn.style.top = nmB.offsetTop + "px"; };   // sits right next to Near me, which stays as it was
  placeSBtn(); addEventListener("resize", placeSBtn); if (document.fonts) document.fonts.ready.then(placeSBtn);
  function sOpen() { if (!document.getElementById("lymenu").hidden) openLy(false); sBar.hidden = false; sBtn.hidden = true; sIn.focus({ preventScroll: true }); }
  function sClose() { sShow([]); sBar.hidden = true; sBtn.hidden = false; sBtn.classList.toggle("has", !!sIn.value.trim()); sIn.blur(); }
  sBtn.onclick = sOpen; document.getElementById("srchClose").onclick = sClose;
  const RECENT = LS.get("bcNearby.recent.v1", []), searchLayer = L.layerGroup().addTo(map);
  let sRes = [], sSel = -1, sTimer = 0, sSeq = 0, sLastQ = "";
  const PIN_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c-4.1 0-7.5 3.2-7.5 7.3 0 5.4 7.5 11.7 7.5 11.7s7.5-6.3 7.5-11.7c0-4.1-3.4-7.3-7.5-7.3z" fill="currentColor"/><path d="M8.6 10.6 12 7.8l3.4 2.8v3.6H8.6z" fill="#fff"/></svg>';
  function sShow(list, head, foot) {
    sRes = list; sSel = -1; if (!list.length && !head) { sDD.hidden = true; sIn.setAttribute("aria-expanded", "false"); return; }
    let lastG = null; sDD.innerHTML = (head ? `<div class="sdh">${head}</div>` : "") + list.map((r, i) => { const gh = r.grp && r.grp !== lastG ? `<div class="sdh sdg">${esc(r.grp)}</div>` : ""; lastG = r.grp || lastG;
      return gh + `<button type="button" class="sdi${r.kind ? " sd-" + r.kind : ""}" role="option" data-i="${i}"><span class="sdp">${r.recent ? "&#8635;" : r.tag ? `<em class="sdtag ${esc(r.tagCls || "")}">${esc(r.tag)}</em>` : PIN_SVG}</span><span class="sdt"><b>${esc(r.main)}</b><small>${esc(r.sub || "")}</small></span></button>`; }).join("")
      + `<div class="sdf">${foot || (list.some(r => r.kind) ? "Listings: BC Real Estate Market &middot; Addresses: Gov. of BC" : "Address search &middot; Gov. of BC")}</div>`;
    sDD.hidden = false; sIn.setAttribute("aria-expanded", "true"); }
  const splitAddr = s => { const i = s.indexOf(","); return i > 0 ? { main: s.slice(0, i).trim(), sub: s.slice(i + 1).replace(/,?\s*BC\s*$/i, "").trim() } : { main: s, sub: "" }; };
  async function bcGeo(q, signal) {
    const u = "https://geocoder.api.gov.bc.ca/addresses.json?addressString=" + encodeURIComponent(q) + "&autoComplete=true&maxResults=6&brief=true&minScore=55&echo=false";
    const r = await fetch(u, Object.assign({ signal }, CFG.geocoderKey ? { headers: { apikey: CFG.geocoderKey } } : {})); if (!r.ok) throw new Error("geo " + r.status); const j = await r.json();
    return (j.features || []).filter(f => f.geometry && f.properties && f.properties.matchPrecision !== "PROVINCE" && f.properties.fullAddress)
      .map(f => ({ ...splitAddr(f.properties.fullAddress), lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], full: f.properties.fullAddress, exact: /CIVIC_NUMBER|BLOCK/.test(f.properties.matchPrecision) })); }
  async function osmGeo(q) {
    const u = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=ca&viewbox=-139.1,60.0,-114.0,48.2&bounded=1&q=" + encodeURIComponent(q);
    const r = await fetch(u, { headers: { "Accept-Language": "en" } }); if (!r.ok) throw new Error("osm " + r.status); const j = await r.json();
    return j.map(x => ({ ...splitAddr(x.display_name.replace(/, Canada$/, "").replace(/, British Columbia/, "")), lat: +x.lat, lon: +x.lon, full: x.display_name, exact: x.addresstype === "building" || x.type === "house" })); }
  // the site's own search (BCNearbyConfig.searchListings(q, { signal }) -> [{ kind: "listing" | "lot", main, sub, lat, lon, tag, id }])
  async function ownSearch(q, signal) { const C0 = window.BCNearbyConfig || {}; if (typeof C0.searchListings !== "function") return [];
    try { const l = await C0.searchListings(q, { signal }); return (l || []).filter(r => r && r.main).map(r => ({ grp: r.kind === "lot" ? "Properties (not for sale)" : "Homes on the map", ...r, full: r.full || r.main + (r.sub ? ", " + r.sub : "") })); } catch (e) { return []; } }
  function recentList() { return RECENT.slice(0, 5).map(r => ({ ...r, recent: true })); }
  sIn.addEventListener("focus", () => { const fh = document.getElementById("fabhint"); if (fh) fh.style.display = "none"; if (!sIn.value.trim() && RECENT.length) sShow(recentList(), "Recent searches"); });
  // fast search: saved hits (kept on this device for a day), instant matches from earlier hits while typing,
  // and each source (our homes, BC addresses) shown the moment it answers. Older requests are cancelled.
  const SC_KEY = "bcNearby.scache.v1", SC_TTL = 864e5;
  const SC = new Map(Object.entries(LS.get(SC_KEY, {})).filter(([, v]) => v && Date.now() - v.t < SC_TTL));
  const nq = q => String(q || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), words = q => nq(q).split(" ").filter(Boolean);
  const hitMatch = (r, ws) => { const t = nq(r.main + " " + (r.sub || "") + " " + (r.full || "")); return ws.every(w => t.includes(w)); };
  let scT = 0; const scSave = () => { clearTimeout(scT); scT = setTimeout(() => { const o = {};
      [...SC.entries()].sort((x, y) => y[1].t - x[1].t).slice(0, 80).forEach(([k, v]) => { o[k] = { t: v.t, own: (v.own || []).map(({ resolve, ...r }) => r), geo: v.geo || [], geoFail: !!v.geoFail }; }); LS.set(SC_KEY, o); }, 500); };
  function fromCache(q) { const k = nq(q), ex = SC.get(k); if (ex) return { exact: !ex.geoFail, own: ex.own || [], geo: ex.geo || [] };   // BC address search failed last time: show what we have, ask again
    let best = null; for (const [kk, v] of SC) if (k.startsWith(kk) && (!best || kk.length > best[0].length)) best = [kk, v];
    const ws = words(q), rec = RECENT.filter(r => hitMatch(r, ws)).map(r => ({ ...r, recent: true, grp: "Recent" }));
    if (!best) return rec.length ? { exact: false, own: rec, geo: [] } : null;
    const seen = new Set(rec.map(r => r.full));
    return { exact: false, own: rec.concat((best[1].own || []).filter(r => hitMatch(r, ws) && !seen.has(r.full))), geo: (best[1].geo || []).filter(r => hitMatch(r, ws) && !seen.has(r.full)) }; }
  function sRender(own, geo, busy) { const g = (geo || []).map(r => ({ ...r, grp: own.length ? "Addresses" : null })), list = own.concat(g);
    if (list.length) { sShow(list, "", busy ? "Searching&hellip;" : ""); return; }
    sShow([], busy ? `<span class="sdn">Searching&hellip;</span>` : geo === null ? `<span class="sdn">Press Enter to search</span>` : `<span class="sdn">No match yet &middot; keep typing, or press Enter</span>`); }
  let sAbort = null;
  sIn.addEventListener("input", () => { const q = sIn.value.trim(); sX.hidden = !sIn.value; clearTimeout(sTimer);
    if (q.length < 3) { ++sSeq; if (sAbort) sAbort.abort(); if (!q) { if (RECENT.length) sShow(recentList(), "Recent searches"); else sShow([]); return; }
      const rm = RECENT.filter(r => hitMatch(r, words(q))).slice(0, 5).map(r => ({ ...r, recent: true })); if (rm.length) sShow(rm, "Recent searches"); else sShow([]); return; }
    const c = fromCache(q); if (c) sRender(c.own, c.geo, !c.exact); else sShow([], `<span class="sdn">Searching&hellip;</span>`);
    if (c && c.exact) { ++sSeq; return; }                                   // saved hit: instant, no request
    sTimer = setTimeout(() => { const my = ++sSeq, k = nq(q); sLastQ = q; if (sAbort) sAbort.abort(); const ac = sAbort = new AbortController();
      let own = null, geo = null, geoOk = false;
      const show = () => { if (my !== sSeq) return; const busy = own === null || geo === null;
        if (!busy) { SC.set(k, { t: Date.now(), own, geo, geoFail: !geoOk }); scSave(); }
        sRender(own || (c ? c.own : []), geo === null ? (c ? c.geo : []) : geo, busy); };
      ownSearch(q, ac.signal).then(l => { own = l; show(); });
      bcGeo(q, ac.signal).then(l => { geo = l; geoOk = true; }).catch(() => { geo = []; }).then(show); }, 150); });
  sIn.addEventListener("keydown", async e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { if (!sRes.length) return; e.preventDefault(); sSel = (sSel + (e.key === "ArrowDown" ? 1 : -1) + sRes.length) % sRes.length;
      sDD.querySelectorAll(".sdi").forEach((b, i) => b.classList.toggle("on", i === sSel)); return; }
    if (e.key === "Escape") { sClose(); return; }
    if (e.key !== "Enter") return; e.preventDefault(); const q = sIn.value.trim(); if (!q) return;
    if (sRes.length) { pickResult(sRes[Math.max(0, sSel)]); return; }
    const my = ++sSeq; sShow([], `<span class="sdn">Searching&hellip;</span>`);
    let list = await ownSearch(q); try { list = list.concat(await bcGeo(q)); } catch (err) {} if (!list.length) { try { list = await osmGeo(q); } catch (err) {} }
    if (my !== sSeq) return; if (list.length === 1) pickResult(list[0]); else if (list.length) sShow(list, "Pick one", list[0] && list[0].full && !/Gov/.test(list[0].full) ? "Address search &middot; Gov. of BC &middot; &copy; OpenStreetMap" : "");
    else sShow([], `<span class="sdn">No BC address found &middot; check the spelling</span>`); });
  sDD.addEventListener("click", e => { const b = e.target.closest(".sdi"); if (b) pickResult(sRes[+b.dataset.i]); });
  sX.onclick = () => { sIn.value = ""; sX.hidden = true; sBtn.classList.remove("has"); sShow([]); searchLayer.clearLayers(); if (S.place) { document.getElementById("lx").click(); } sIn.focus({ preventScroll: true }); };
  document.addEventListener("pointerdown", e => { if (!sBar.hidden && !sBar.contains(e.target) && !sDD.contains(e.target) && e.target !== sBtn && !sBtn.contains(e.target)) sClose(); });
  function pickResult(r) {
    if (!r) return;
    if (r.kind && (r.lat == null || r.lon == null)) { sShow([], `<span class="sdn">Finding it on the map&hellip;</span>`);
      (typeof r.resolve === "function" ? Promise.resolve(r.resolve()) : typeof CFG.resolveResult === "function" ? Promise.resolve(CFG.resolveResult(r)) : Promise.resolve(null)).then(x => x && x.lat != null ? x : bcGeo(r.full).then(l => l && l[0] ? { lat: l[0].lat, lon: l[0].lon } : null))
        .then(x => { if (x && x.lat != null) pickResult({ ...r, ...x, resolve: null, exact: true }); else { sShow([]); toast("Couldn't find this one on the map"); } }).catch(() => { sShow([]); toast("Couldn't find this one on the map"); }); return; }
    if (r.kind === "listing") { const rk = RECENT.findIndex(x => x.full === r.full); if (rk >= 0) RECENT.splice(rk, 1);
      RECENT.unshift({ kind: r.kind, id: r.id, main: r.main, sub: r.sub, lat: r.lat, lon: r.lon, full: r.full, tag: r.tag, tagCls: r.tagCls }); RECENT.length = Math.min(RECENT.length, 8); LS.set("bcNearby.recent.v1", RECENT);
      S.noTipUntil = Date.now() + 700; if (!document.getElementById("lymenu").hidden) openLy(false); sShow([]); sIn.value = r.main; sX.hidden = false; sClose(); searchLayer.clearLayers();
      try { const C0 = window.BCNearbyConfig || {}; if (typeof C0.onSearchPick === "function") C0.onSearchPick(r); } catch (e) {}
      let hit = null, bd = 30; for (const k2 in LSTBY) { const d = map.distance(LSTBY[k2].getLatLng(), [r.lat, r.lon]); if (d < bd) { bd = d; hit = LSTBY[k2]; } }
      map.setView([r.lat, r.lon], Math.max(map.getZoom(), 18)); if (hit) { hit.fire("click"); return; }
      S.pendingOpen = { lat: r.lat, lon: r.lon, t: Date.now() }; S.notifyQuery(true); return; } S.noTipUntil = Date.now() + 700; if (!document.getElementById("lymenu").hidden) openLy(false); sShow([]); sIn.value = r.main + (r.sub ? ", " + r.sub : ""); sX.hidden = false; sClose();
    const rec = { main: r.main, sub: r.sub, lat: r.lat, lon: r.lon, full: r.full, exact: r.exact }; const k = RECENT.findIndex(x => x.full === r.full); if (k >= 0) RECENT.splice(k, 1); RECENT.unshift(rec); RECENT.length = Math.min(RECENT.length, 8); LS.set("bcNearby.recent.v1", RECENT);
    // the address is one of the homes for sale: open that listing instead
    let hit = null, bd = 25; for (const k2 in LSTBY) { const ll = LSTBY[k2].getLatLng(), d = map.distance(ll, [r.lat, r.lon]); if (d < bd) { bd = d; hit = LSTBY[k2]; } }
    map.setView([r.lat, r.lon], Math.max(map.getZoom(), r.exact ? 16 : 15));
    if (hit) { searchLayer.clearLayers(); hit.fire("click"); return; }
    if (r.exact && window.BCNearby._lotAt) { const lt = window.BCNearby._lotAt(r.lat, r.lon, r.main); if (lt) { searchLayer.clearLayers(); setTimeout(() => window.BCNearby._openLot(lt), 60); return; } }
    searchLayer.clearLayers(); L.marker([r.lat, r.lon], { pane: "lst", interactive: false, keyboard: false, icon: L.divIcon({ className: "", html: `<div class="srpin">${PIN_SVG}</div>`, iconSize: [0, 0] }) }).addTo(searchLayer);
    if (lstOn) { lstOn.classList.remove("on"); lstOn = null; }
    placeMode({ label: r.main, sub: r.sub, exact: r.exact }); S.lstLL = [r.lat, r.lon]; S.cardClosed = false; S.seenLine = ""; S.onListing = true; check(r.lat, r.lon); S.onListing = false; }
  const LSM0 = (window.BCNearbyConfig || {}).demo === false ? "" : document.querySelector("#lcard .lsm").innerHTML;
  function placeMode(pl) {   // the card for a searched address (not for sale): address, nearby info, and two next steps
    S.place = pl; const lp = document.getElementById("lplace"), lsm = document.querySelector("#lcard .lsm"), lpr = document.getElementById("lpr");
    document.getElementById("lcard").classList.toggle("isplace", !!pl);
    if (!pl) { lp.hidden = true; lp.innerHTML = ""; lsm.innerHTML = LSM0; return; }
    lpr.innerHTML = `<span class="lpin">${PIN_SVG}</span>${esc(pl.label)}`; lsm.innerHTML = pl.spot ? `${pl.sub || ""}` : `${esc(pl.sub || "")}${pl.sub ? " &middot; " : ""}<b class="nfs">Not for sale</b>${pl.exact ? "" : " &middot; approximate spot"}`;
    if (pl.lot) { const L0 = pl.lot; lsm.innerHTML = `<b class="nfs">Not for sale</b>${L0.sample ? " &middot; sample numbers" : ""}`;
      lp.innerHTML = `<div class="ltabs" role="tablist"><button type="button" role="tab" data-pact="linfo" aria-selected="${S.lotTab !== "near"}"><b>Lot info</b><small>${S.lotTab !== "near" ? "Showing &#9662;" : "Tap to see"}</small></button><button type="button" role="tab" data-pact="lnear" aria-selected="${S.lotTab === "near"}"><b>What&rsquo;s nearby</b><small>${S.lotTab === "near" ? "Showing &#9662;" : "Tap to see"}</small></button><button type="button" class="lmeas" data-pact="lmeas" aria-label="Measure this lot" title="Measure this lot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4"/></svg><small>Measure</small></button></div>`; lp.hidden = false; return; }
    lp.innerHTML = `<button type="button" class="pvbtn" data-pact="value">What&rsquo;s my home worth?</button><button type="button" class="pnbtn" data-pact="near">Homes for sale near here</button>`; lp.hidden = false; }
  document.getElementById("lplace").addEventListener("click", e => { const b = e.target.closest("[data-pact]"); if (!b || !S.place) return; e.stopPropagation();
    if (b.dataset.pact === "linfo" || b.dataset.pact === "lnear") { S.lotTab = b.dataset.pact === "lnear" ? "near" : "info"; placeMode(S.place); if (S.tapped) check(...S.tapped); return; }
    if (b.dataset.pact === "lmeas") { if (S.place.lot.ll) measureLot(S.place.lot.ll); else { document.getElementById("lx").click(); measureStart(); } return; }
    if (b.dataset.pact === "value") { const u = CFG.homeValueUrl; if (!u && typeof CFG.onSellerLead === "function") { CFG.onSellerLead({ address: S.place.label.replace(/^Near /, ""), lat: S.lstLL[0], lng: S.lstLL[1], source: "spot card" }); return; } if (u) (window.top || window).location.href = u + (u.includes("?") ? "&" : "?") + "address=" + encodeURIComponent(S.place.label + (S.place.sub ? ", " + S.place.sub : "")); else toast("On your site this opens your Home value page"); return; }
    const ll = S.lstLL; document.getElementById("lcard").hidden = true; S.cardClosed = true; map.setView(ll, 14); toast("Homes for sale around this address"); });
  map.on("click", () => { if (S.lockHit) return; if (S.place) placeMode(null); });
  new MutationObserver(() => { if (lcEl.hidden && S.lotSelLay) { S.lotSelLay.remove(); S.lotSelLay = null; } }).observe(document.getElementById("lcard"), { attributes: true, attributeFilter: ["hidden"] });
  const lx0 = document.getElementById("lx").onclick; document.getElementById("lx").onclick = e => { if (S.place) placeMode(null); lx0(e); setTimeout(signinTry, 4000); };

  // ######## PART 12: SIGN-IN REMINDER ########
  // ================= sign-in reminder: at most once per visit, never locks the site =================
  const SV = LS.get("bcNearby.visits.v1", { n: 0, last: 0, closes: 0, pause: 0, signed: 0 }), vStart = Date.now(); let vHomes = 0, vShown = false;
  if (Date.now() - SV.last > 30 * 60000) { SV.n++; SV.prevLast = SV.last; } SV.last = Date.now(); LS.set("bcNearby.visits.v1", SV);
  setInterval(() => { SV.last = Date.now(); LS.set("bcNearby.visits.v1", SV); }, 60000);
  function signinDue() { if (SV.signed || vShown || Date.now() < SV.pause) return false; const mins = (Date.now() - vStart) / 60000;
    return SV.n >= 2 ? (vHomes >= 5 || mins >= 10) : (mins >= 10 && vHomes >= 8); }
  function signinTry() {   // wait for a calm moment: no card, no checklist, no welcome box, nothing typed
    if (!signinDue()) return; const busy = !document.getElementById("lcard").hidden || !document.getElementById("lymenu").hidden || (document.getElementById("welcome") && !document.getElementById("welcome").hidden) || document.activeElement === sIn;
    if (busy) return; vShown = true; SV.closes++; if (SV.closes >= 3) { SV.pause = Date.now() + 7 * 864e5; SV.closes = 0; } LS.set("bcNearby.visits.v1", SV);
    if (typeof CFG.onSignIn === "function") { CFG.onSignIn(); return; } demoSignin(); }
  // ===== DEMO START (D8): stand-in sign-in card
  // ===== Live site: your own sign-in, through onSignIn in BCNearbyConfig
  function demoSignin() {   // demo stand-in: on the real site CFG.onSignIn opens the site's own sign-in card
    let el = document.getElementById("sgn"); if (!el) { el = document.createElement("div"); el.id = "sgn"; el.className = "sgn"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Sign in");
      el.innerHTML = `<div class="sgc"><button type="button" class="sgx" aria-label="Close">&times;</button><b class="sgt">Keep the homes you like</b><ul><li>Saved homes on every device</li><li>Price-drop alerts</li><li>Homes you&rsquo;ve viewed</li></ul><button type="button" class="sgb">Sign in &middot; it&rsquo;s free</button><button type="button" class="sgn2">Not now</button><small>Demo &middot; on your site this opens your own sign-in card</small></div>`;
      document.body.appendChild(el); const close = () => { el.classList.remove("on"); setTimeout(() => el.hidden = true, 250); };
      el.addEventListener("click", e => { if (e.target === el || e.target.closest(".sgx, .sgn2")) close(); if (e.target.closest(".sgb")) { close(); toast("On your site this opens your sign-in"); } }); }
    el.hidden = false; requestAnimationFrame(() => el.classList.add("on")); }
  // ===== DEMO END (D8) =====
  setInterval(signinTry, 20000);
  Object.assign(window.BCNearby, {
    search(q) { sIn.value = q; sIn.dispatchEvent(new Event("input")); },
    signedIn() { SV.signed = 1; LS.set("bcNearby.visits.v1", SV); },   // the site calls this after a visitor signs in: no more reminders
    homeViewed() { vHomes++; setTimeout(signinTry, 1500); },
    _onListing() { if (sIn.value) { sIn.value = ""; sX.hidden = true; searchLayer.clearLayers(); sBtn.classList.remove("has"); } },
    _signinTry: signinTry });

  // ######## PART 13: COMPARE HOMES ########
  // ================= compare homes (2 on phones, 3 on laptops) =================
  // Real data: the site passes window.BCNearbyConfig.getListingInfo = (lat, lon) => ({ price, beds, baths, sqft, type, year, address, photo, url }).
  // Without it, the demo makes up clearly-marked sample facts.
  const CMP = LS.get("bcNearby.compare.v1", []), CMAX = () => innerWidth <= 720 ? 2 : 3;
  const cmpKey = (la, lo) => seenKey(la, lo), cmpHas = (la, lo) => CMP.some(c => c.k === cmpKey(la, lo));
  // ===== DEMO START (D9): made-up facts for sample homes (beds, baths, assessment...)
  // ===== Live site: your real facts through setListings or getListingInfo
  function sampleInfo(la, lo) {   // stable made-up facts for the demo's sample homes
    let h = 0; const k = cmpKey(la, lo); for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const r = n => { h = (h * 1103515245 + 12345) >>> 0; return h % n; };
    const s = SAMPLE.find(x => cmpKey(x[0], x[1]) === k) || [], v = pNum(s[2] || ""), type = v < 9e5 ? ["Condo", "Townhouse"][r(2)] : v < 1.6e6 ? ["Townhouse", "House", "Half-duplex"][r(3)] : "House";
    const beds = type === "Condo" ? 1 + r(3) : type === "Townhouse" ? 2 + r(3) : 3 + r(4), baths = Math.max(1, beds - r(2) + (type === "House" ? 1 : 0));
    const sqft = type === "Condo" ? 550 + r(700) : type === "House" ? 1600 + r(2200) : 1150 + r(900);
    const asd = v ? Math.round(v * (0.82 + r(30) / 100) / 1000) * 1000 : 0;
    const lot = type === "Condo" ? 0 : type === "House" ? 3600 + r(60) * 100 : 0, hrs = r(200), listed = hrs < 24 ? (hrs < 2 ? "1 hour ago" : hrs + " hours ago") : Math.round(hrs / 24) + (hrs < 48 ? " day ago" : " days ago");
    return { assessed: asd, assessYear: 2026, price: s[2] ? s[2].replace(/&[a-z]+;\s*/g, "") : "", beds, baths, sqft: Math.round(sqft / 10) * 10, type, year: 1965 + r(59), lot, tax: asd ? Math.round(asd * 0.0031 / 10) * 10 : 0, status: ({ active: "Active", drop: "Active · price reduced", sold: "Sold", fc: "Foreclosure · court-ordered sale", fcs: "Foreclosure · sold" })[STATUS[seenKey(la, lo)]] || "Active", listed, photos: 12 + r(20), address: "Sample home · " + (s[4] || "Vancouver"), photo: SAMPLE_PHOTO, sample: true }; }
  // ===== DEMO END (D9) =====
  // asking price vs BC Assessment: the site passes assessed (number) and assessYear in getListingInfo
  const money = v => { const a = Math.abs(v); return a >= 1e6 ? "$" + (a / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M" : "$" + Math.round(a / 1e3) + "K"; };
  function assessFor(la, lo) {
    const info = listingInfo(la, lo), ask = pNum(info.price) || +info.priceNum || 0, val = +info.assessed || 0; if (!ask || !val) return null;
    const d = ask - val, pct = d / val * 100, ap = Math.abs(pct), near = ap < 1;
    let land = +info.assessLand || 0, bldg = +info.assessBuilding || 0, hist = Array.isArray(info.assessHistory) ? info.assessHistory : null;
    if (info.sample && !land) { land = Math.round(val * .68 / 1e3) * 1e3; bldg = val - land; hist = [[2025, Math.round(val / 1.03 / 1e3) * 1e3], [2024, Math.round(val / 1.01 / 1e3) * 1e3], [2023, Math.round(val / 1.06 / 1e3) * 1e3]]; }
    return { ask, val, d, pct, near, year: info.assessYear, sample: !!info.sample, land, bldg, hist, askTxt: money(ask), valTxt: money(val),
      pctTxt: near ? "About" : (ap < 10 ? ap.toFixed(1).replace(/\.0$/, "") : Math.round(ap)) + "%", word: near ? "the same as" : d > 0 ? "above" : "below",
      dTxt: near ? "within 1%" : (d > 0 ? "+" : "−") + money(d), cls: near ? "aseq" : d > 0 ? "asup" : "asdn" }; }
  const listingInfo = (la, lo) => { const own = LDATA[seenKey(la, lo)]; if (own) return own; try { if (typeof CFG.getListingInfo === "function") { const x = CFG.getListingInfo(la, lo); if (x) return x; } } catch (e) {} return demoOH(sampleInfo(la, lo), la, lo); };
  // ---- open houses: listing.openHouses = [{ date: "2026-11-15", day: "Sat, Nov 15", time: "2:00 to 4:00 pm" }]
  const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  // dates are in BC time (America/Vancouver), whatever the visitor's own time zone is
  const bcToday = () => { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch (e) { return ymd(new Date()); } };
  const addDays = (d, n) => { const t = new Date(d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  const bcNowHM = () => { try { return new Intl.DateTimeFormat("en-GB", { timeZone: "America/Vancouver", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()); } catch (e) { return "00:00"; } };
  // mode 1 = this weekend (the coming Sat + Sun, or the rest of it when it is already the weekend) · mode 2 = today and the next 6 days
  function ohRange(mode) { const today = bcToday(), dow = new Date(today + "T12:00:00Z").getUTCDay();
    if (mode === 1) return dow === 6 || dow === 0 ? [today, dow === 6 ? addDays(today, 1) : today] : [addDays(today, 6 - dow), addDays(today, 7 - dow)];
    return [today, addDays(today, 6)]; }
  window.BCNearby = window.BCNearby || {}; window.BCNearby.ohRange = ohRange;
  function ohNext(info, mode) { const list = ((info && info.openHouses) || []).filter(o => o && o.date).slice().sort((a, b) => (a.date + (a.start || "")).localeCompare(b.date + (b.start || "")));
    if (!list.length) return null; const [first, last] = ohRange(mode || 2), today = bcToday(), now = bcNowHM();
    return list.find(o => o.date >= first && o.date <= last && !(o.date === today && o.end && o.end <= now)) || null; }
  const ohTxt = o => o ? `${o.day || o.date || ""}${o.time ? " &middot; " + esc(o.time) : ""}` : "";
  // ===== DEMO START (D12): made-up open houses on about 1 in 6 sample homes (this coming Saturday or Sunday)
  function demoOH(info, la, lo) { if (!info || !info.sample || info.openHouses) return info; let h = 7;
    { let g = 11; for (const ch of seenKey(la, lo)) g = (g * 41 + ch.charCodeAt(0)) >>> 0; info.city = (info.address || "").split("· ")[1] || "";
      const hl = (CFG.neighbourhoods || {})[info.city] || ({ Vancouver: ["Mount Pleasant", "Grandview-Woodland", "Kitsilano", "Renfrew-Collingwood", "Hastings-Sunrise", "Kensington-Cedar Cottage"], Burnaby: ["Metrotown", "Brentwood", "Edmonds", "Burnaby Heights"], Surrey: ["Fleetwood", "Newton", "Guildford", "Cloverdale"], Richmond: ["Brighouse", "Steveston", "Broadmoor"], Coquitlam: ["Burke Mountain", "Maillardville", "Coquitlam West"] })[info.city] || [];
      if (hl.length) info.area = hl[g % hl.length]; if (/condo|town/i.test(info.type)) info.maintenance = 220 + (g >> 3) % 520;
      info.features = ["View", "Fireplace", "Suite", "Waterfront", "Pool", "Workshop"].filter((x, i) => ((g >> (i * 2 + 4)) & 3) === 0 && !(x === "Suite" && /condo/i.test(info.type))); } for (const ch of seenKey(la, lo)) h = (h * 37 + ch.charCodeAt(0)) >>> 0; const st = STATUS[seenKey(la, lo)] || "active";
    if (h % 6 || !(st === "active" || st === "drop")) { info.openHouses = []; return info; }
    const d = new Date(), dw = d.getDay(); d.setDate(d.getDate() + (dw === 6 ? 0 : 6 - dw) + (h % 12 < 6 ? 0 : 1));
    info.openHouses = [{ date: ymd(d), day: d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" }), time: h % 2 ? "2:00 to 4:00 pm" : "1:00 to 3:00 pm" }]; return info; }
  // ===== DEMO END (D12) =====
  function cmpSave() { LS.set("bcNearby.compare.v1", CMP); cmpBar(); }
  function cmpToggle(la, lo) {
    const k = cmpKey(la, lo), i = CMP.findIndex(c => c.k === k);
    if (i >= 0) { CMP.splice(i, 1); toast("Removed from compare"); }
    else { if (CMP.length >= CMAX()) { toast(innerWidth <= 720 ? "You can compare 2 homes on a phone — remove one first" : "You can compare up to 3 homes — remove one first"); return; }
      CMP.push({ k, la, lo }); toast(CMP.length === 1 ? "Added · now pick another home to compare" : "Added · tap “Compare” below to see them side by side"); }
    cmpSave(); if (S.tapped) check(...S.tapped); }
  // the bottom bar: shows once 1+ homes are picked, sits clear of the card and the site's own bottom buttons
  const bStack = document.createElement("div"); bStack.className = "bstack"; map.getContainer().appendChild(bStack); L.DomEvent.disableClickPropagation(bStack); L.DomEvent.disableScrollPropagation(bStack);
  const cBar = document.createElement("div"); cBar.className = "cmpbar"; cBar.hidden = true; bStack.appendChild(cBar);
  function cmpBar() {
    const lcOpen = !document.getElementById("lcard").hidden; cBar.hidden = !CMP.length || lcOpen || !!document.querySelector(".cmpv:not([hidden])");
    if (cBar.hidden) return; const ready = CMP.length >= 2;
    cBar.innerHTML = `<span class="cbn">${CMP.map(c => `<i>${esc(listingInfo(c.la, c.lo).price || "Home")}</i>`).join("")}</span><button type="button" class="cbgo" ${ready ? "" : "disabled"}>${ready ? `Compare ${CMP.length} homes` : "Pick 1 more home"}</button><button type="button" class="cbx2" aria-label="Clear compare">&times;</button>`; }
  cBar.addEventListener("click", e => { if (e.target.closest(".cbgo")) cmpOpen(); if (e.target.closest(".cbx2")) { CMP.length = 0; cmpSave(); toast("Compare cleared"); if (S.tapped) check(...S.tapped); } });
  new MutationObserver(cmpBar).observe(document.getElementById("lcard"), { attributes: true, attributeFilter: ["hidden"] });
  // the comparison itself
  function cmpFacts(c) {
    const { la, lo } = c, info = listingInfo(la, lo), sc = scoresFor(la, lo), t2 = d => { const q = tm(d); return q ? `${q.n} min ${q.car ? "drive" : "walk"}` : "—"; };
    const sE = schoolFor(la, lo, "E"), sS = schoolFor(la, lo, "S"), g = nearestPlace("grocery", la, lo, p => p.sub === "supermarket"), pk = nearestPlace("park", la, lo),
      er = nearestPlace("health", la, lo, isER), uc = nearestPlace("health", la, lo, p => p.sub === "urgent"), fz = floodAt(la, lo);
    let sb = null; const kx = 111320 * Math.cos(la * Math.PI / 180); for (const st of stations) { const d = Math.hypot((st.lon - lo) * kx, (st.lat - la) * 110540); if (!sb || d < sb.d) sb = { st, d }; }
    const sch = s => s && s.p ? { v: s.p.rating == null ? -1 : s.p.rating, t: `<b>${s.p.rating == null ? "N/R" : rTxt(s.p.rating) + "/10"}</b><small>${esc(s.p.name)}${s.inCatch ? " &middot; in catchment" : ""}</small>` } : { v: null, t: "—" };
    const plc = n => n ? { v: -n.d, t: `<b>${t2(n.d)}</b><small>${fmtD(n.d)} &middot; ${esc(n.p.name)}</small>` } : { v: null, t: "—" };
    return { info, rows: {
      price: { v: pNum(info.price) ? -pNum(info.price) : null, t: `<b>${esc(info.price || "—")}</b>` },
      assess: (() => { const a = assessFor(la, lo); return a ? { v: -a.pct, t: `<b class="${a.cls}">${a.near ? "About the same" : a.pctTxt + " " + a.word}</b><small>Assessed ${a.valTxt} &middot; ${a.dTxt}</small>` } : { v: null, t: "—" }; })(), beds: { v: +info.beds || null, t: info.beds ?? "—" }, baths: { v: +info.baths || null, t: info.baths ?? "—" },
      sqft: { v: +info.sqft || null, t: info.sqft ? (+info.sqft).toLocaleString() + " sq ft" : "—" },
      lot: { v: +info.lot || null, t: info.lot ? (+info.lot).toLocaleString() + " sq ft" : `<span class="cvna">${info.type === "Condo" ? "Condo: no lot" : "—"}</span>` },
      ppsf: (() => { const pr = pNum(info.price), sf = +info.sqft; return pr && sf ? { v: -pr / sf, t: "$" + Math.round(pr / sf).toLocaleString() + " / sq ft" } : { v: null, t: "—" }; })(),
      tax: { v: info.tax ? -info.tax : null, t: info.tax ? "$" + (+info.tax).toLocaleString() + " / year" : "—" },
      listed: { v: null, t: esc(info.listed || "—") }, type: { v: null, t: esc(info.type || "—") }, year: { v: +info.year || null, t: info.year || "—" },
      walk: { v: sc.walk, t: `<b>${sc.walk}<span class="u">/100</span></b>` }, transit: { v: sc.transit, t: `<b>${sc.transit}<span class="u">/100</span></b>` },
      sE: sch(sE), sS: sch(sS), groc: plc(g), park: plc(pk), er: plc(er), uc: plc(uc),
      sky: sb ? { v: -sb.d, t: `<b>${t2(sb.d)}</b><small>${fmtD(sb.d)} &middot; ${esc(sb.st.label || sb.st.name)}</small>` } : { v: null, t: "—" },
      flood: { v: fz.length ? 0 : 1, t: fz.length ? `<b class="cfy">Yes</b><small>mapped flood risk area</small>` : `<b>No</b>` } } }; }
  const CROWS = [["The home", [["price", "Asking price", "Lowest price"], ["assess", "Price vs BC Assessment", "Lowest vs assessed"], ["ppsf", "Price per sq ft", "Lowest per sq ft"], ["tax", "Property tax", "Lowest tax"], ["beds", "Bedrooms", "Most bedrooms"], ["baths", "Bathrooms", "Most bathrooms"], ["sqft", "Home size", "Biggest home"], ["lot", "Lot size", "Biggest lot"], ["type", "Type"], ["year", "Year built", "Newest"], ["listed", "On the market"]]],
    ["Everyday life", [["walk", "Walkability", "Most walkable"], ["transit", "Transit", "Best transit"], ["groc", "Supermarket", "Closest"], ["park", "Park", "Closest"], ["sky", "SkyTrain", "Closest"]]],
    ["Schools", [["sE", "Elementary", "Higher rated"], ["sS", "Secondary", "Higher rated"]]],
    ["Health & safety", [["er", "Hospital (ER)", "Closest"], ["uc", "Urgent care", "Closest"], ["flood", "Flood risk area", "Not in one"]]]];
  const HOUSE_SVG = '<svg viewBox="0 0 64 40" aria-hidden="true"><path d="M8 22 32 6l24 16v16H8z" fill="#fff" opacity=".95"/><path d="M26 38V27h12v11" fill="#c7d4e6"/><path d="M4 23 32 4l28 19" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const cV = document.createElement("div"); cV.className = "cmpv"; cV.hidden = true; cV.setAttribute("role", "dialog"); cV.setAttribute("aria-label", "Compare homes"); document.body.appendChild(cV);
  function cmpOpen() {
    if (CMP.length < 2) { toast("Pick 2 homes to compare"); return; }
    const F = CMP.map(cmpFacts), n = F.length;
    const best = key => { const vs = F.map(f => f.rows[key].v); if (vs.some(v => v == null)) return -1; const mx = Math.max(...vs); return vs.filter(v => v === mx).length === 1 ? vs.indexOf(mx) : -1; };
    let h = `<div class="cvw" style="--bcn-n:${n}"><div class="cvh"><b>Compare homes</b><button type="button" class="cvx" aria-label="Close">&times;</button></div><div class="cvs"><p class="cvhow">Look across each line. A <b>&#10003;</b> tells you which home is ahead, and why.</p>`;
    h += `<div class="cvgrid cvtop"><div class="cvl"></div>` + F.map((f, i) => `<div class="cvc"><div class="cvph" style="${f.info.photo ? `background-image:url('${String(f.info.photo).replace(/'/g, "%27")}')` : ""}">${f.info.photo ? "" : HOUSE_SVG}${f.info.sample ? `<em>Sample</em>` : ""}<button type="button" class="cvrm" data-i="${i}" aria-label="Remove">&times;</button></div><span class="cvtag">Home ${"ABC"[i]}</span><b class="cvp">${esc(f.info.price || "")}</b><small>${esc(short(f.info.address || "", 34))}</small><button type="button" class="cvmap" data-i="${i}">Show on map</button></div>`).join("") + `</div>`;
    for (const [sec, rows] of CROWS) { h += `<div class="cvsec">${sec}</div>`;
      for (const [key, label, bestTxt] of rows) { const bi = !bestTxt ? -1 : best(key), same = bestTxt && bi < 0 && F.every(f => f.rows[key].v != null) && new Set(F.map(f => f.rows[key].v)).size === 1;
        h += `<div class="cvgrid cvrow"><div class="cvl">${label}</div>` + F.map((f, i) => `<div class="cvc${i === bi ? " win" : ""}">${f.rows[key].t}${i === bi ? `<span class="cvwin">&#10003; ${bestTxt}</span>` : same ? `<span class="cvsame">Same</span>` : ""}</div>`).join("") + `</div>`; } }
    // ---- the summary, in plain words, then what to check before buying
    const WHY = { price: "lower price", assess: "better price compared with its BC Assessment", ppsf: "less per square foot", tax: "lower property tax", beds: "more bedrooms", baths: "more bathrooms", sqft: "more living space", lot: "bigger lot", year: "newer",
      walk: "easier to walk to everyday places", transit: "better transit", groc: "closer to a supermarket", park: "closer to a park", sky: "closer to SkyTrain", sE: "better-rated elementary school", sS: "better-rated high school", er: "closer to a hospital", uc: "closer to urgent care", flood: "not in a mapped flood area" };
    const wins = F.map(() => []); for (const [, rows] of CROWS) for (const [key, , bt] of rows) { if (!bt) continue; const bi = best(key); if (bi >= 0 && WHY[key]) wins[bi].push(key); }
    const nm = i => `<b>Home ${"ABC"[i]}</b> (${esc(F[i].info.price || "")})`;
    const GROUPS = [["Your budget", ["price", "ppsf", "tax", "assess"]], ["More space", ["sqft", "beds", "baths", "lot"]], ["Life without a car", ["walk", "transit", "sky", "groc"]], ["Schools", ["sE", "sS"]], ["A newer home", ["year"]], ["Health care close by", ["er", "uc"]]];
    const pick = keys => { const n = F.map((_, i) => wins[i].filter(k => keys.includes(k)).length), mx = Math.max(...n); if (!mx) return null; const top = n.map((v, i) => v === mx ? i : -1).filter(i => i >= 0); return top.length === 1 ? top[0] : -1; };
    h += `<div class="cvsum"><b class="cvst">The short version</b><ul>` + F.map((f, i) => `<li>${nm(i)}: ${wins[i].length ? wins[i].map(k => WHY[k]).join(", ").replace(/, ([^,]*)$/, " and $1") + "." : "no clear wins on the lines above; it may still be the right home for you."}</li>`).join("") + `</ul>`
      + `<b class="cvst">If what matters most to you is&hellip;</b><div class="cvpick">` + GROUPS.map(([g, keys]) => { const w = pick(keys); return w === null ? "" : `<div><span>${g}</span><em>${w >= 0 ? "Home " + "ABC"[w] : "About even"}</em></div>`; }).join("") + `</div>`
      + (F.some(f => f.rows.flood.v === 0) ? `<p class="cvwarn"><b>Heads up:</b> ${F.map((f, i) => f.rows.flood.v === 0 ? "Home " + "ABC"[i] : "").filter(Boolean).join(" and ")} ${F.filter(f => f.rows.flood.v === 0).length > 1 ? "are" : "is"} in a mapped flood risk area. Ask the city and your insurer what that means for insurance and building rules.</p>` : "")
      + `</div>`;
    h += `<div class="cvdisc"><b class="cvst">Before you decide: please check with professionals</b><ul>
      <li><b>Get a home inspection.</b> A licensed inspector can find problems you can&rsquo;t see in a showing: leaks, mould, rot, old wiring or plumbing, roof or foundation issues, pests. Some defects are hidden (&ldquo;latent&rdquo;) and only show up later.</li>
      <li><b>Read the Property Disclosure Statement</b> and ask the seller&rsquo;s agent about past repairs, insurance claims, renovations and permits.</li>
      <li><b>Condo or townhouse?</b> Read the strata documents: minutes, depreciation report, contingency fund, special levies and bylaws (pets, rentals).</li>
      <li><b>Ask the city</b> about zoning, permits, flood areas and any work done without a permit.</li>
      <li><b>Talk to your lender</b> before you make an offer, and to a <b>lawyer or notary</b> before you sign or remove conditions.</li>
      <li><b>Visit at different times</b>: rush hour, school drop-off, evenings. Walk and drive times here are estimates.</li></ul>
      <p>This comparison uses listing details and public information. It may be incomplete or out of date. It is a starting point, not professional, legal or financial advice, and not an appraisal.</p></div>`;
    h += `<p class="cvnote">&#10003; shows which home is ahead on that line, in plain words. Nothing marked = a tie or not comparable. Times are estimates (&asymp; for drives). School ratings: Fraser Institute; check catchments with the school board. Flood areas: public information.${F.some(f => f.info.sample) ? " Home facts here are <b>sample data</b>." : ""}</p></div></div>`;
    cV.innerHTML = h; cV.hidden = false; cmpBar(); requestAnimationFrame(() => cV.classList.add("on")); document.body.classList.add("cmpopen"); cV.querySelector(".cvx").focus({ preventScroll: true }); }
  function cmpClose() { cV.classList.remove("on"); document.body.classList.remove("cmpopen"); setTimeout(() => { cV.hidden = true; cmpBar(); }, 200); }
  cV.addEventListener("click", e => {
    if (e.target === cV || e.target.closest(".cvx")) { cmpClose(); return; }
    const rm = e.target.closest(".cvrm"); if (rm) { CMP.splice(+rm.dataset.i, 1); cmpSave(); if (CMP.length >= 2) cmpOpen(); else { cmpClose(); toast("Pick another home to compare"); } if (S.tapped) check(...S.tapped); return; }
    const mp = e.target.closest(".cvmap"); if (mp) { const c = CMP[+mp.dataset.i]; cmpClose(); map.setView([c.la, c.lo], 15); const mk = LSTBY[c.k]; if (mk) setTimeout(() => mk.fire("click"), 250); } });
  addEventListener("keydown", e => { if (e.key === "Escape" && !cV.hidden) cmpClose(); });
  Object.assign(window.BCNearby, { compareAdd(lat, lon) { if (!cmpHas(lat, lon)) cmpToggle(lat, lon); }, compareOpen: cmpOpen });
  cmpBar();

  // ######## PART 14: BACK TO LISTING, SAVE, HIDE HOMES, SEARCH BY AREA ########
  // ================= back to listing · keep this home? · welcome back · calm map =================
  const lcEl = document.getElementById("lcard"), lymEl = document.getElementById("lymenu");
  // 1. "← $1.38M listing": after Show on map closes the card, one tap brings it back
  const backB = document.createElement("div"); backB.className = "backlst"; backB.hidden = true; bStack.appendChild(backB);
  function backSync() { const spot = !!(!S.lstLL && S.tapped && lymEl.hidden && cV.hidden && dOv.hidden), show = spot || !!(S.lstLL && S.cardClosed && lcEl.hidden && lymEl.hidden && cV.hidden); if (backB.hidden !== !show) backB.hidden = !show;
    if (spot) { if (backB.dataset.lab !== "spot") { backB.dataset.lab = "spot"; backB.innerHTML = `<span class="blb blspot"><span aria-hidden="true">&#128205;</span> This spot</span><button type="button" class="blx" aria-label="Close this spot">&#10005; Close</button>`; } return; }
    if (show) { const lab = `Back to ${S.place ? esc(short(S.place.label, 22)) : esc(document.getElementById("lpr").textContent.trim()) + " listing"}`; if (backB.dataset.lab !== lab) { backB.dataset.lab = lab; backB.innerHTML = `<button type="button" class="blb"><span aria-hidden="true">&larr;</span> ${lab}</button><button type="button" class="blx" aria-label="Close this home">&#10005; Close</button>`; } } }
  backB.onclick = e => { if (e.target.closest(".blx")) { selClear(); return; } if (!S.lstLL) return; S.cardClosed = false; const ll = S.lstLL; map.panTo(ll); S.onListing = true; check(ll[0], ll[1]); S.onListing = false; backSync(); };
  function selClear() {   // the only way out of a selected home: ✕ Close
    if (lstOn) { lstOn.classList.remove("on"); lstOn = null; } S.lstLL = null; S.cardClosed = false; S.seenLine = ""; if (S.place) placeMode(null);
    searchLayer.clearLayers(); sIn.value = ""; sX.hidden = true; lcEl.hidden = true; window.BCNearby.clear(); backSync(); lpFade(); toast("Closed · tap any home or spot on the map"); }
  const moBS = new MutationObserver(() => { backSync(); lpFade(); }); moBS.observe(lcEl, { attributes: true, attributeFilter: ["hidden"] }); moBS.observe(lymEl, { attributes: true, attributeFilter: ["hidden"] });
  map.on("click", () => setTimeout(() => { backSync(); lpFade(); }, 0));
  // 2. "Keep this home?": when a listing card is closed after a real look (10 s+), once per home, stops after 2 "Not now" this visit
  const SAVED = LS.get("bcNearby.saved.v1", {}); let openedAt = 0, openedK = "", keepNo = 0; const keepAsked = new Set();
  const savedMark = () => { for (const k in LSTBY) { const el = LSTBY[k]._icon && LSTBY[k]._icon.firstElementChild; if (el) el.classList.toggle("saved", !!SAVED[k]); } };
  map.on("zoomend moveend", savedMark); setTimeout(savedMark, 500);
  const keepB = document.createElement("div"); keepB.className = "keepbar"; keepB.hidden = true; keepB.setAttribute("role", "status"); bStack.appendChild(keepB); let keepT = 0;
  function keepAsk(k, price) {
    if (SAVED[k] || keepAsked.has(k) || keepNo >= 2) return; keepAsked.add(k);
    keepB.innerHTML = `<span class="kbh">&#9825;</span><span class="kbt"><b>Keep this home?</b><small>See price changes in your records</small></span><button type="button" class="kbs">Save</button><button type="button" class="kbh2">Hide</button><button type="button" class="kbn">Not now</button>`;
    keepB.dataset.k = k; keepB.hidden = false; clearTimeout(keepT); keepT = setTimeout(() => keepB.hidden = true, 9000); }
  S.isSaved = k => !!SAVED[k]; S.savedAll = () => SAVED;
  window.BCNearby.setSaved = pts => { for (const [la, lo] of pts || []) { const k = seenKey(+la, +lo); if (!SAVED[k]) SAVED[k] = Date.now(); } LS.set("bcNearby.saved.v1", SAVED); savedMark(); };
  S.toggleSave = (la, lo) => { const k = seenKey(la, lo); if (SAVED[k]) { delete SAVED[k]; toast("Removed from your saved homes"); if (typeof CFG.onUnsave === "function") CFG.onUnsave(la, lo); } else { SAVED[k] = Date.now(); keepB.hidden = true;
      if (typeof CFG.onSave === "function") CFG.onSave(la, lo); msgBox("Saved ♥", ["This home is in your saved list.", "Find it under <b>Lists</b> on the right.", "We’ll keep the price changes for you."]); }
    LS.set("bcNearby.saved.v1", SAVED); savedMark(); if (S.tapped) check(...S.tapped); };
  keepB.addEventListener("click", e => { const k = keepB.dataset.k; if (e.target.closest(".kbs")) { SAVED[k] = Date.now(); LS.set("bcNearby.saved.v1", SAVED); savedMark(); keepB.hidden = true;
      const ll = k.split(",").map(Number); if (typeof CFG.onSave === "function") CFG.onSave(ll[0], ll[1]); else toast("Saved ♥ · on your site this uses your heart button"); }
    if (e.target.closest(".kbh2")) { keepB.hidden = true; const ll = k.split(",").map(Number); hideToggle(ll[0], ll[1]); }
    if (e.target.closest(".kbn")) { keepNo++; keepB.hidden = true; } });
  new MutationObserver(() => { if (lcEl.hidden) return; if (S.lstLL && !S.place) { openedAt = Date.now(); openedK = seenKey(S.lstLL[0], S.lstLL[1]); } else openedK = ""; }).observe(lcEl, { attributes: true, attributeFilter: ["hidden"] });
  const lxPrev = document.getElementById("lx").onclick; document.getElementById("lx").onclick = e => { const k = openedK, long = Date.now() - openedAt >= 10000, pr = document.getElementById("lpr").textContent.trim(); lxPrev(e); if (k && long) setTimeout(() => keepAsk(k, pr), 500); };
  // 3. "Welcome back · You viewed 6 homes": once, at the start of a return visit
  setTimeout(() => { const seenN = Object.keys(SEEN).filter(k => !HIDDEN[k]).length; if (SV.n < 2 || seenN < 2 || sessionStorage.getItem("bcNearby.wb")) return; try { sessionStorage.setItem("bcNearby.wb", "1"); } catch (e) {}
    const w = document.createElement("div"); w.className = "wbk"; w.setAttribute("role", "status");
    w.innerHTML = `<b>Welcome back</b><span>You viewed ${seenN} homes</span><button type="button" class="wbs">See them</button><button type="button" class="wbx" aria-label="Close">&times;</button>`;
    map.getContainer().appendChild(w); L.DomEvent.disableClickPropagation(w); const bye = () => { w.classList.add("out"); setTimeout(() => w.remove(), 300); }; const tt = setTimeout(bye, 10000);
    w.addEventListener("click", e => { if (e.target.closest(".wbs")) { const pts = Object.keys(SEEN).filter(k => !HIDDEN[k]).map(k => k.split(",").map(Number)); if (lcEl && !lcEl.hidden) document.getElementById("lx").click();
        if (window.BCNearby.clear) window.BCNearby.clear(); map.fitBounds(L.latLngBounds(pts).pad(.25), { maxZoom: 15 }); setTimeout(() => { const els = pts.map(q => LSTBY[seenKey(q[0], q[1])]).filter(Boolean).map(m => m._icon && m._icon.firstElementChild).filter(Boolean); els.forEach(e0 => { e0.classList.remove("wbpulse"); void e0.offsetWidth; e0.classList.add("wbpulse"); });
          msgBox("Homes you’ve seen", ["A <b>&#10003; tick</b> on a price tag means you opened that home before.", "Tap one to open it again.", "Hidden homes are not shown."], { aim: els[0] }); }, 700); clearTimeout(tt); bye(); }
      if (e.target.closest(".wbx")) { clearTimeout(tt); bye(); } }); }, 1800);
  // 4. calm map: while a home's lines are showing, the other price tags fade back (still tappable)
  function lpFade() { map.getContainer().classList.toggle("lpfade", !!(S.tapped && (S.lstLL || S.place) && (!lcEl.hidden || S.cardClosed))); }
  const ck0 = window.BCNearby.clear; window.BCNearby.clear = () => { ck0(); lpFade(); backSync(); };
  setInterval(() => { backSync(); lpFade(); nameDeclutter(); }, 1500);

  // ================= hide homes: "not for me" (no sign-in needed; remembered on this phone) =================
  let showHidden = false;
  const hidChip = document.createElement("button"); hidChip.type = "button"; hidChip.className = "hidchip"; hidChip.hidden = true; map.getContainer().appendChild(hidChip); L.DomEvent.disableClickPropagation(hidChip);
  function hideApply() { const n = Object.keys(HIDDEN).length;
    for (const k in LSTBY) { const el = LSTBY[k]._icon && LSTBY[k]._icon.firstElementChild; if (!el) continue; const h = !!HIDDEN[k]; el.classList.toggle("hid", h && !showHidden); el.classList.toggle("hidshow", h && showHidden); }
    hidChip.hidden = true; hidChip.innerHTML = showHidden ? `Hide ${n} again` : `${n} hidden &middot; <b>Show</b>`; }
  hidChip.onclick = () => { showHidden = !showHidden; hideApply(); toast(showHidden ? "Hidden homes shown faded · open one to unhide it" : "Hidden homes tucked away again"); };
  map.on("zoomend moveend", hideApply); setTimeout(hideApply, 600);
  const undoB = document.createElement("div"); undoB.className = "undobar"; undoB.hidden = true; bStack.appendChild(undoB); let undoT = 0;
  function hideToggle(la, lo) {
    const k = seenKey(la, lo), was = !!HIDDEN[k];
    if (was) { delete HIDDEN[k]; LS.set("bcNearby.hidden.v1", HIDDEN); hideApply(); toast("Home is back on your map"); if (typeof CFG.onHide === "function") CFG.onHide(la, lo, false); if (S.tapped) check(...S.tapped); return; }
    HIDDEN[k] = Date.now(); LS.set("bcNearby.hidden.v1", HIDDEN); keepAsked.add(k);
    const ci = CMP.findIndex(c => c.k === k); if (ci >= 0) { CMP.splice(ci, 1); cmpSave(); }
    if (typeof CFG.onHide === "function") CFG.onHide(la, lo, true);
    if (!lcEl.hidden && S.lstLL && seenKey(S.lstLL[0], S.lstLL[1]) === k) { document.getElementById("lx").click(); }
    if ((S.hideMsgN = (S.hideMsgN || LS.get("bcNearby.hidemsg", 0)) + 1) <= 2) { LS.set("bcNearby.hidemsg", S.hideMsgN); msgBox("Home hidden", ["You won’t see this home on the map anymore.", "To see it again: <b>Lists</b> (right side) &rarr; Hidden homes &rarr; Unhide.", "Changed your mind now? Tap <b>Undo</b> at the bottom."], { aim: "#sbarDraw" }); }
    hideApply(); undoB.innerHTML = `<span>Home hidden</span><button type="button">Undo</button>`; undoB.hidden = false; clearTimeout(undoT); undoT = setTimeout(() => { undoB.hidden = true; hideNudge(); }, 6000);
    undoB.querySelector("button").onclick = () => { delete HIDDEN[k]; LS.set("bcNearby.hidden.v1", HIDDEN); hideApply(); undoB.hidden = true; clearTimeout(undoT); toast("Home is back on your map"); if (typeof CFG.onHide === "function") CFG.onHide(la, lo, false); }; }
  function hideNudge() {   // after 3 hides, once: a gentle reason to sign in (never required)
    if (Object.keys(HIDDEN).length < 3 || SV.signed || !hintOnce("hide3")) return; const nb = document.createElement("div"); nb.className = "keepbar hidnudge";
    nb.innerHTML = `<span class="kbt"><b>Keep your hidden &amp; saved homes</b><small>on all your devices</small></span><button type="button" class="kbs">Sign in</button><button type="button" class="kbn" aria-label="Close">&times;</button>`; bStack.appendChild(nb);
    const bye = () => nb.remove(); const tt = setTimeout(bye, 10000);
    nb.addEventListener("click", e => { if (e.target.closest(".kbs")) { clearTimeout(tt); bye(); if (typeof CFG.onSignIn === "function") CFG.onSignIn(); else demoSignin(); } if (e.target.closest(".kbn")) { clearTimeout(tt); bye(); } }); }

  // ================= search by area: draw, tap corners, school catchment, near SkyTrain · save · alerts =================
  // The site only adds (optional) onSaveArea(area, name) and onAlert(area, name). An "area" is GeoJSON (Polygon / MultiPolygon).
  const dBtn = document.getElementById("drawBtn"); L.DomEvent.disableClickPropagation(dBtn);
  const placeDBtn = () => { dBtn.style.left = (sBtn.offsetLeft + sBtn.offsetWidth + 8) + "px"; dBtn.style.top = sBtn.offsetTop + "px"; }; placeDBtn(); addEventListener("resize", placeDBtn); if (document.fonts) document.fonts.ready.then(placeDBtn);
  new MutationObserver(() => { dBtn.hidden = sBtn.hidden; placeDBtn(); }).observe(sBtn, { attributes: true, attributeFilter: ["hidden", "style"] });
  const AREAS = LS.get("bcNearby.areas.v1", []), areaLayer = L.layerGroup().addTo(map); let AREA = null;
  const toGeo = rings => rings.length === 1 ? { type: "Polygon", coordinates: [rings[0].map(([y, x]) => [x, y]).concat([[rings[0][0][1], rings[0][0][0]]])] }
    : { type: "MultiPolygon", coordinates: rings.map(R0 => [R0.map(([y, x]) => [x, y]).concat([[R0[0][1], R0[0][0]]])]) };
  const inArea = (la, lo) => !AREA || AREA.rings.some(R0 => inRing(la, lo, R0));
  function areaApply() {
    let n = 0; for (const k in LSTBY) { const ll = LSTBY[k].getLatLng(), inside = inArea(ll.lat, ll.lng); if (inside && !HIDDEN[k]) n++; const el = LSTBY[k]._icon && LSTBY[k]._icon.firstElementChild; if (el) el.classList.toggle("out", !inside); }
    map.getContainer().classList.toggle("hasarea", !!AREA); return n; }
  map.on("zoomend moveend", () => { if (AREA) areaApply(); });
  const aBar = document.createElement("div"); aBar.className = "areabar"; aBar.hidden = true; bStack.appendChild(aBar);
  function setArea(rings, name, kind) {
    AREA = { rings, name: name || "", kind: kind || "draw" }; areaLayer.clearLayers();
    L.polygon(rings, kind === "draw" ? { color: BRAND(), weight: 2.5, dashArray: "8 6", fillColor: BRAND(), fillOpacity: .06, interactive: false, className: "areapoly" } : { color: kind === "sky" ? "#0f766e" : BRAND(), weight: 1.2, opacity: .5, fillColor: kind === "sky" ? "#14b8a6" : BRAND(), fillOpacity: .14, interactive: false, className: "areapoly" }).addTo(areaLayer);
    const n = areaApply(); map.fitBounds(L.latLngBounds(rings.flat()).pad(.08), { maxZoom: 16 }); areaBarShow(n); }
  function areaBarShow(n) {
    const saved = AREA && AREAS.some(a => a.name === AREA.name && JSON.stringify(a.rings) === JSON.stringify(AREA.rings));
    aBar.innerHTML = `<span class="abt"><b>${n} ${n === 1 ? "home" : "homes"}</b> in ${AREA.name ? esc(AREA.name) : "your area"}</span>${saved ? `<button type="button" class="abl" data-a="alert">&#128276; Alerts</button>` : `<button type="button" class="abs" data-a="save">Save</button>`}${AREA.kind === "draw" ? `<button type="button" class="abg" data-a="redraw">Redraw</button>` : ""}<button type="button" class="abx" data-a="clear" aria-label="Clear area">&times;</button>`;
    aBar.hidden = false; }
  function clearArea() { AREA = null; areaLayer.clearLayers(); areaApply(); aBar.hidden = true; }
  aBar.addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a;
    if (a === "clear") { clearArea(); toast("Area cleared · all homes back"); }
    if (a === "redraw") { clearArea(); drawStart(); }
    if (a === "save") { const nm = AREA.name || ("My area " + (AREAS.length + 1)); AREA.name = nm; AREAS.unshift({ name: nm, rings: AREA.rings, kind: AREA.kind, t: Date.now() }); AREAS.length = Math.min(AREAS.length, 6); LS.set("bcNearby.areas.v1", AREAS);
      if (typeof CFG.onSaveArea === "function") CFG.onSaveArea(toGeo(AREA.rings), nm); toast(`Saved “${nm}” · find it under Lists`); areaBarShow(areaApply()); }
    if (a === "alert") { if (typeof CFG.onAlert === "function") CFG.onAlert(toGeo(AREA.rings), AREA.name); else { toast("Alerts need a free sign-in · on your site this opens your sign-in"); demoSignin(); } } });
  // drawing: finger / mouse loop, or tap the corners (easier for some people)
  const dOv = document.createElement("div"); dOv.className = "drawov"; dOv.hidden = true; map.getContainer().appendChild(dOv); L.DomEvent.disableClickPropagation(dOv);
  const dTop = document.createElement("div"); dTop.className = "drawtop"; dTop.hidden = true; map.getContainer().appendChild(dTop); L.DomEvent.disableClickPropagation(dTop);
  let dMode = "free", dPts = [], dLine = null, dDown = false;
  function drawTop() { dTop.innerHTML = dMode === "free" ? `<span><b>Draw around the area</b> with your finger</span><button type="button" data-d="tap">Tap corners instead</button><button type="button" data-d="cancel">Cancel</button>`
      : `<span><b>Tap the corners</b> of your area${dPts.length ? ` &middot; ${dPts.length} so far` : ""}</span>${dPts.length >= 3 ? `<button type="button" class="dok" data-d="done">Done</button>` : ""}<button type="button" data-d="undo" ${dPts.length ? "" : "disabled"}>Undo</button><button type="button" data-d="cancel">Cancel</button>`; }
  function drawStart(mode) { dMode = mode || "free"; dPts = []; if (dLine) { dLine.remove(); dLine = null; } amTipHide(); clearArea(); if (!lcEl.hidden) document.getElementById("lx").click(); if (window.BCNearby.clear) window.BCNearby.clear();
    map.dragging.disable(); map.doubleClickZoom.disable(); dOv.hidden = false; dTop.hidden = false; drawTop(); map.getContainer().classList.add("drawing"); }
  function drawEnd() { S.noMapTapUntil = Date.now() + 600; map.dragging.enable(); map.doubleClickZoom.enable(); dOv.hidden = true; dTop.hidden = true; map.getContainer().classList.remove("drawing"); if (dLine) { dLine.remove(); dLine = null; } }
  function drawFinish() { let pts = dPts; if (pts.length < 3) { toast("Draw a bigger loop, or tap at least 3 corners"); return; }
    if (dMode === "free") { const px = pts.map(ll => map.latLngToLayerPoint(ll)); pts = L.LineUtil.simplify(px, 4).map(q => map.layerPointToLatLng(q)); }
    const ring = pts.map(ll => [ll.lat, ll.lng]); drawEnd(); if (ring.length < 3) { toast("Draw a bigger loop"); return; } setArea([ring], "", "draw"); }
  const ptAt = e => map.mouseEventToLatLng(e);
  dOv.addEventListener("pointerdown", e => { e.preventDefault(); const ll = ptAt(e);
    if (dMode === "tap") { dPts.push(ll); if (!dLine) dLine = L.polygon([], { color: BRAND(), weight: 2.5, fillOpacity: .06, interactive: false }).addTo(map); dLine.setLatLngs(dPts); drawTop(); return; }
    dDown = true; dPts = [ll]; try { dOv.setPointerCapture(e.pointerId); } catch (er) {} if (dLine) dLine.remove(); dLine = L.polyline([ll], { color: BRAND(), weight: 3, interactive: false }).addTo(map); });
  dOv.addEventListener("pointermove", e => { if (!dDown || dMode !== "free") return; const ll = ptAt(e), last = dPts[dPts.length - 1]; if (map.latLngToContainerPoint(last).distanceTo(map.latLngToContainerPoint(ll)) < 4) return; dPts.push(ll); dLine.addLatLng(ll); });
  dOv.addEventListener("pointerup", () => { if (!dDown) return; dDown = false; drawFinish(); });
  dTop.addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (!b) return; const d = b.dataset.d;
    if (d === "cancel") drawEnd(); if (d === "tap") { dMode = "tap"; dPts = []; if (dLine) { dLine.remove(); dLine = null; } drawTop(); }
    if (d === "undo") { dPts.pop(); if (dLine) dLine.setLatLngs(dPts); drawTop(); } if (d === "done") drawFinish(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !dOv.hidden) drawEnd(); });
  // the pencil button: a short menu (draw · tap corners · near SkyTrain · saved areas)
  const dMenu = document.createElement("div"); dMenu.className = "drawmenu"; dMenu.hidden = true; map.getContainer().appendChild(dMenu); L.DomEvent.disableClickPropagation(dMenu); L.DomEvent.disableScrollPropagation(dMenu);
  dBtn.onclick = () => { if (!dMenu.hidden) { dMenu.hidden = true; return; }
    dMenu.innerHTML = `<button type="button" data-m="free"><i>&#9998;</i>Draw an area</button><button type="button" data-m="tap"><i>&#9670;</i>Tap corners</button><button type="button" data-m="sky"><i class="sk">&#128646;</i>Within a 10-min walk of SkyTrain</button>`
      + (AREAS.length ? `<div class="dmh">Saved areas</div>` + AREAS.map((a, i) => `<div class="dmr"><button type="button" data-m="a${i}"><i>&#9733;</i>${esc(a.name)}</button><button type="button" class="dmx" data-m="x${i}" aria-label="Delete ${esc(a.name)}">&times;</button></div>`).join("") : "")
      + (() => { const sv = Object.keys(S.savedAll ? S.savedAll() : {}), hd = Object.keys(HIDDEN), nm = k => { const ll = k.split(",").map(Number), i = listingInfo(ll[0], ll[1]); return esc(i.price || "Home") + (i.address ? ` <small>${esc(short(i.address.replace(/^Sample home · /, ""), 22))}</small>` : ""); };
          return `<div class="dmh">My lists</div><button type="button" data-m="ls" class="dml"><i class="hv">&#9829;</i>Saved homes <em>${sv.length}</em></button>`
            + (S.dmOpen === "ls" ? (sv.length ? sv.map(k => `<button type="button" class="dmi" data-m="go${k}">${nm(k)}</button>`).join("") : `<p class="dme">Tap the &#9825; on a home card to save it.</p>`) : "")
            + `<button type="button" data-m="lh" class="dml"><i>&#8856;</i>Hidden homes <em>${hd.length}</em></button>`
            + (S.dmOpen === "lh" ? (hd.length ? hd.map(k => `<div class="dmr"><span class="dmi">${nm(k)}</span><button type="button" class="dmu" data-m="un${k}">Unhide</button></div>`).join("") + (hd.length > 1 ? `<button type="button" class="dmua" data-m="unall">Unhide all ${hd.length}</button>` : "") : `<p class="dme">Tap <b>Hide</b> on a home you don’t like. It leaves your map until you unhide it here.</p>`) : ""); })()
      + `<div class="dmh">Help</div><button type="button" data-m="hints" class="dml"><i>&#128161;</i>Tips <em>${window.BCNearby._hintsOn && window.BCNearby._hintsOn() ? "On" : "Off"}</em></button>`
      + `<p>Draw a shape and only homes inside it stay on the map.</p>`;
    dMenu.hidden = false; const W0 = map.getContainer().clientWidth; dMenu.style.left = Math.max(10, Math.min(dBtn.offsetLeft, W0 - dMenu.offsetWidth - 10)) + "px"; dMenu.style.top = (dBtn.offsetTop + dBtn.offsetHeight + 8) + "px"; };
  dMenu.addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b) return; const m = b.dataset.m;
    const reopen = () => { const l = dMenu.style.left, tp = dMenu.style.top; dMenu.hidden = true; dBtn.onclick(); dMenu.style.left = l; dMenu.style.top = tp; };
    if (m === "hints") { window.BCNearby._hints(!window.BCNearby._hintsOn()); reopen(); return; }
    if (m === "ls" || m === "lh") { S.dmOpen = S.dmOpen === m ? "" : m; reopen(); return; }
    if (m.startsWith("un")) { if (m === "unall") { for (const k in HIDDEN) { delete HIDDEN[k]; const ll = k.split(",").map(Number); if (typeof CFG.onHide === "function") CFG.onHide(ll[0], ll[1], false); } toast("All hidden homes are back on your map"); }
      else { const k = m.slice(2); delete HIDDEN[k]; const ll = k.split(",").map(Number); if (typeof CFG.onHide === "function") CFG.onHide(ll[0], ll[1], false); toast("Home is back on your map"); }
      LS.set("bcNearby.hidden.v1", HIDDEN); hideApply(); reopen(); return; }
    dMenu.hidden = true;
    if (m.startsWith("go")) { const ll = m.slice(2).split(",").map(Number), mk = LSTBY[m.slice(2)]; map.setView(ll, Math.max(map.getZoom(), 15)); if (mk) setTimeout(() => mk.fire("click"), 450); return; }
    if (m === "free" || m === "tap") drawStart(m);
    if (m === "sky") { const c = map.getCenter(), kx = 111320 * Math.cos(c.lat * Math.PI / 180), near0 = stations.filter(st => Math.hypot((st.lon - c.lng) * kx, (st.lat - c.lat) * 110540) < 7000);
      if (!near0.length) { toast("No SkyTrain stations near here"); return; }
      const ring = (st) => { const out = []; for (let a = 0; a < 360; a += 15) { const r0 = a * Math.PI / 180; out.push([st.lat + Math.sin(r0) * WALK10 / 110540, st.lon + Math.cos(r0) * WALK10 / (111320 * Math.cos(st.lat * Math.PI / 180))]); } return out; };
      setArea(near0.map(ring), "10-min walk of SkyTrain", "sky"); }
    if (m[0] === "a") { const a = AREAS[+m.slice(1)]; if (a) setArea(a.rings, a.name, a.kind); }
    if (m[0] === "x") { const i = +m.slice(1), a = AREAS[i]; AREAS.splice(i, 1); LS.set("bcNearby.areas.v1", AREAS); toast(`Deleted “${a.name}”`); } });
  document.addEventListener("pointerdown", e => { if (!dMenu.hidden && !dMenu.contains(e.target) && !dBtn.contains(e.target)) dMenu.hidden = true; });
  // school catchment opened: one tap to see only the homes inside it
  const cOffer = document.createElement("div"); cOffer.className = "catchoffer"; cOffer.hidden = true; bStack.appendChild(cOffer); let cOfT = 0;
  window.BCNearby._catchOffer = i => { const sc = schoolList[i], c = getCatch().find(c0 => c0.ids.includes(i)); if (!c || !sc) return;
    cOffer.innerHTML = `<button type="button">Show homes in ${esc(short(sc.name, 26))} catchment</button>`; cOffer.hidden = false; clearTimeout(cOfT); cOfT = setTimeout(() => cOffer.hidden = true, 8000);
    cOffer.querySelector("button").onclick = () => { cOffer.hidden = true; setArea(c.rr.map(R0 => R0.map(([y, x]) => [y, x])), sc.name + " catchment", "catch"); }; };
  Object.assign(window.BCNearby, { inArea, area: () => AREA && { name: AREA.name, geojson: toGeo(AREA.rings) }, clearArea, savedAreas: () => AREAS.map(a => ({ name: a.name, geojson: toGeo(a.rings) })) });

  // ================= calmer screen: one search bar · one bottom bar at a time · hints take turns =================
  const sbar = document.getElementById("sbar"), sbarTxt = document.getElementById("sbarTxt"); L.DomEvent.disableClickPropagation(sbar);
  document.getElementById("sbarMain").onclick = () => sBtn.onclick();
  document.getElementById("sbarDraw").onclick = () => { dBtn.onclick(); if (!dMenu.hidden) { const W0 = map.getContainer().clientWidth, r = document.getElementById("sbarDraw").getBoundingClientRect(), m = map.getContainer().getBoundingClientRect(), H0 = map.getContainer().clientHeight;
      dMenu.style.left = Math.max(10, r.left - m.left - dMenu.offsetWidth - 8) + "px"; dMenu.style.top = Math.max(10, Math.min(r.top - m.top - 8, H0 - dMenu.offsetHeight - 10)) + "px"; } };
  const sbarSync = () => { if (sbar.hidden !== !sBar.hidden) sbar.hidden = !sBar.hidden; const v = sIn.value.trim(), tx = v || "Search an address"; if (sbarTxt.textContent !== tx) sbarTxt.textContent = tx; sbar.classList.toggle("has", !!v); sbar.classList.toggle("area", !!AREA); };
  new MutationObserver(sbarSync).observe(sBar, { attributes: true, attributeFilter: ["hidden"] }); sbarSync(); setInterval(sbarSync, 1200);
  // ---- 1b. bottom: only the newest bar shows; the others wait their turn ----
  function bsync() { const kids = [...bStack.children], vis = kids.filter(k => !k.hidden);
    for (const k of vis) if (!k.dataset.ts) k.dataset.ts = String(Date.now() + Math.random());
    for (const k of kids) if (k.hidden) delete k.dataset.ts;
    const top = vis.reduce((a, k) => !a || +k.dataset.ts > +a.dataset.ts ? k : a, null); for (const k of kids) k.classList.toggle("bwait", !!top && k !== top); }
  new MutationObserver(ms => { if (ms.some(m => m.type === "childList" || (m.attributeName === "hidden" && m.target.parentElement === bStack))) bsync(); }).observe(bStack, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"] }); bsync();
  // ---- 2. hints take turns: the layers-button hint waits for a calm moment, shows once, never over other buttons ----
  const fh = document.getElementById("fabhint");
  function fabHintTry() { if (HINTS.fab || hintShown.fab) return; const calm = lcEl.hidden && lymEl.hidden && sBar.hidden && dMenu.hidden && dOv.hidden && !document.querySelector(".wbk") && !(document.getElementById("welcome") && !document.getElementById("welcome").hidden);
    if (!calm) return; if (!hintOnce("fab")) return; fh.classList.remove("gone"); setTimeout(() => fh.classList.add("gone"), 6000); }
  setInterval(fabHintTry, 1500);

  // ######## PART 15: LOT LINES, TIPS, LISTING DETAILS ########
  // ================= lot lines: the site's own lot-line layer, switched from our checklist =================
  // Settings: lotLinesLayer = an existing Leaflet layer (we add/remove it), or onLotLines(on) = the site's own switch.
  function lotsApply(user) {
    const lay = CFG.lotLinesLayer;
    if (lay && typeof lay.addTo === "function") { if (S.lots) lay.addTo(map); else map.removeLayer(lay); }
    else if (typeof CFG.onLotLines === "function") CFG.onLotLines(!!S.lots);
    else if (user) { toast(S.lots ? "On your site this shows your lot lines · public data, not a survey" : "Lot lines off"); return; }
    if (user && S.lots && map.getZoom() < 16) toast("Lot lines on · zoom in close to see them (public data, not a survey)");
    else if (user) toast(S.lots ? "Lot lines on · public data, not a survey" : "Lot lines off"); }
  setTimeout(() => lotsApply(false), 800);

  // ================= guiding: point at the right button · one-time "what am I looking at" notes =================
  const ptr = document.createElement("div"); ptr.className = "ptr"; ptr.hidden = true; ptr.setAttribute("role", "status"); map.getContainer().appendChild(ptr); let ptrT = 0;
  function pointAt(el, html, ms) {   // a small bubble with an arrow, right above (or below) the button to tap; the button glows
    if (!el || !el.getBoundingClientRect().width) return false; const m = map.getContainer().getBoundingClientRect(), r = el.getBoundingClientRect();
    ptr.innerHTML = html; ptr.hidden = false; ptr.classList.remove("below"); const w = ptr.offsetWidth, h = ptr.offsetHeight;
    let x = Math.max(8, Math.min(m.width - w - 8, r.left - m.left + r.width / 2 - w / 2)), y = r.top - m.top - h - 12; if (y < 8) { y = r.bottom - m.top + 12; ptr.classList.add("below"); }
    ptr.style.left = x + "px"; ptr.style.top = y + "px"; ptr.style.setProperty("--bcn-ax", Math.max(14, Math.min(w - 14, r.left - m.left + r.width / 2 - x)) + "px");
    document.querySelectorAll(".glow").forEach(e => e.classList.remove("glow")); el.classList.add("glow"); clearTimeout(ptrT);
    ptrT = setTimeout(() => { ptr.hidden = true; el.classList.remove("glow"); }, ms || 4500); return true; }
  map.on("movestart", () => { ptr.hidden = true; document.querySelectorAll(".glow").forEach(e => e.classList.remove("glow")); });
  window.BCNearby._pointLock = () => {
    if (!lcEl.hidden) { const sm = document.getElementById("wdetail"); document.getElementById("lx").classList.add("glow");
      return pointAt(sm, `<b>Tap &ldquo;Show on map&rdquo;</b> to see everything around this home &middot; or <b>Close &#10005;</b> at the top to pick another spot`, 5000); }
    const bx = backB.querySelector(".blx"); if (bx && !backB.hidden && !backB.classList.contains("bwait")) return pointAt(bx, S.lstLL ? `This home stays selected &middot; <b>tap &#10005; Close</b> to pick another spot` : `This spot stays selected &middot; <b>tap &#10005; Close</b> to pick another`, 4500);
    return false; };
  // one-time notes: the first time each kind of place (or transit) is shown, say what it is and how to explore
  const GUIDED = LS.get("bcNearby.guided.v1", {}); const gd = document.createElement("div"); gd.className = "guide"; gd.hidden = true; gd.setAttribute("role", "status"); map.getContainer().appendChild(gd); L.DomEvent.disableClickPropagation(gd); let gdT = 0;
  const GTXT = {
    grocery: () => `<b>Supermarkets</b> shows the big stores only: Save-On-Foods, Safeway, Superstore, FreshCo, Walmart and T&amp;T. For South Asian, Chinese, Korean, local and other stores, open the <b>layers button</b> &rarr; Grocery types. Coloured icons are those big stores; <b>grey icons are other grocers</b>: tap any icon for its name and its walk and drive times.`,
    school: () => `<b>Schools</b>: the closest elementary and secondary, with Fraser ratings. <b>Tap a school icon</b> to see its catchment (public info &middot; confirm with the school board).`,
    park: () => `<b>Parks</b>: the line goes to the closest one. Park names are written on the parks. <b>Tap any green park</b> for its size, walk and drive time.`,
    health: () => `<b>Health care</b>: the closest hospital with a 24/7 ER, or urgent care. Switch between them in the layers button. Drive times are estimates (&asymp;).`,
    worship: () => `<b>Places of worship</b>: pick one faith at a time. <b>Tap any icon</b> for its name and its walk and drive times from this home.`,
    beach: () => `<b>Beaches</b>: the closest beach. Tap any beach icon for its name and its walk and drive times.`, rec: () => `<b>Recreation centres</b>: pools and community centres. Tap any icon for its name and its walk and drive times.`,
    dog_park: () => `<b>Dog parks</b>: the closest off-leash area. Tap any icon for its name and its walk and drive times.`,
    sky: () => `<b>SkyTrain</b>: the line goes to the closest station. Other stations show as small icons &middot; <b>tap one</b> for its walk and drive times.`,
    bus: () => `<b>Buses</b>: the closest stop with regular buses and how often they come. Other stops show as small icons &middot; <b>tap one</b> for its routes and walk time.` };
  const GTITLE = { grocery: "Supermarkets", school: "Schools", park: "Parks", health: "Health care", worship: "Places of worship", beach: "Beaches", rec: "Recreation centres", dog_park: "Dog parks", sky: "SkyTrain", bus: "Buses" };
  function guideShow(k) { const f = GTXT[k]; if (!f || typeof guide !== "function") return; guide("n_" + k, GTITLE[k] || "Tip", [f().replace(/^<b>[^<]*<\/b>:\s*/, "")]); }
  let gPrev = new Set();
  function guideCheck() {   // runs after every redraw: a kind that just turned on, and was never explained, gets its note (one at a time)
    const on = new Set(); if (S.dview === "transit") { if (S.tSky) on.add("sky"); if (S.tBus) on.add("bus"); } else { for (const k of (S.cats || [])) on.add(k); for (const k of (S.mapCats || [])) on.add(k); }
    const fresh = [...on].filter(k => !gPrev.has(k) && !(typeof GD !== "undefined" && GD["n_" + k])); gPrev = on; if (!fresh.length || !gd.hidden || (typeof gEl !== "undefined" && !gEl.hidden) || (typeof GD !== "undefined" && GD._off) || !document.getElementById("lymenu").hidden) return; if (document.querySelector(".fabhint:not(.gone)") || !dOv.hidden || (document.getElementById("welcome") && !document.getElementById("welcome").hidden) || (!lcEl.hidden && lcEl.querySelector(".mhint"))) { gPrev = new Set([...gPrev].filter(k => !fresh.includes(k))); return; } guideShow(fresh[0]); }
  setInterval(guideCheck, 900);
  // taps on the card, bars and menus never reach the map (even when the button re-draws itself mid-tap)
  for (const el of [lcEl, bStack, sbar, sBar, sDD, dMenu, dTop, hidChip, lymEl, gd, ptr]) if (el) el.addEventListener("click", e => e.stopPropagation());
  // hidden homes stay out of "welcome back" and the seen counts
  Object.assign(window.BCNearby, { hidden: () => Object.keys(HIDDEN), unhideAll() { for (const k in HIDDEN) delete HIDDEN[k]; LS.set("bcNearby.hidden.v1", HIDDEN); hideApply(); } });


  sync(); refreshLines();
  S.dview = "places"; S.cats = new Set(PHONE ? ["grocery"] : ["health", "grocery"]); S.mainOrder = PHONE ? ["grocery"] : ["health", "grocery"]; S.groc = new Set(["supermarket"]); S.faith = new Set(); S.subOrder = ["g:supermarket"];
  S.mapCats = new Set(); S.mapGroc = new Set(); S.mapFaith = new Set();
  // remembered choices from this visitor's last visit (stays on their own phone / computer only)
  try { const v = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); if (v && v.v === 1) {
    S.dview = v.dview === "transit" ? "transit" : "places"; S._dist = S.dview === "transit";
    const ok = (a, keys) => (Array.isArray(a) ? a : []).filter(x => keys.includes(x));
    S.cats = new Set(ok(v.cats, Object.keys(CATS)).slice(0, PHONE ? 1 : 2)); if (S.tSky && S.tBus) S.tBus = false; S.mainOrder = [...S.cats];
    S.groc = new Set(ok(v.groc, Object.keys(GROC)).slice(0, 2)); S.faith = new Set(ok(v.faith, Object.keys(REL)).slice(0, 2));
    S.subOrder = [...[...S.groc].map(x => "g:" + x), ...[...S.faith].map(x => "f:" + x)].slice(0, 2);
    S.mapCats = new Set(ok(v.mapCats, Object.keys(CATS))); S.mapGroc = new Set(ok(v.mapGroc, Object.keys(GROC))); S.mapFaith = new Set(ok(v.mapFaith, Object.keys(REL)));
    S.tSky = v.tSky !== false; S.tBus = v.tBus !== false; S.skyMap = S.busMap = S.dview === "transit";
    S.w10 = v.w10 !== false; S.w20 = !!v.w20; S.flood = false; S.lots = !!v.lots; if (Array.isArray(v.slv)) { const l = v.slv.filter(x => x === "E" || x === "S"); if (l.length) S.slv = new Set(PHONE ? l.slice(0, 1) : l); } if (Array.isArray(v.hlv)) { const l = v.hlv.filter(x => x === "er" || x === "uc"); if (l.length) S.hlv = new Set(PHONE ? l.slice(0, 1) : l); } S.scoreMap = false; S.lymode = v.lymode === "map" ? "map" : "dist"; S.restored = true;
    document.getElementById("w10-sw").setAttribute("aria-pressed", S.w10); document.getElementById("w20-sw").setAttribute("aria-pressed", S.w20); } } catch (e) {}
  S.saveOn = true; syncTransitBtns(); refreshLines(); drawFlood();
  renderChips(); syncButtons(); renderRefine(); drawPlaces();
  // the map opens plain: no home is picked until the visitor taps one
  requestAnimationFrame(declutter);

  // ================= listing details: tap the photo =================
  // On the live site set BCNearbyConfig.onListingDetails(lat, lng) to open your own listing page; the demo shows a simple sheet.
  const ldv = document.createElement("div"); ldv.className = "ldv"; ldv.hidden = true; ldv.setAttribute("role", "dialog"); ldv.setAttribute("aria-label", "Listing details"); document.body.appendChild(ldv);
  function lstDetails(la, lo) {
    if (typeof CFG.onListingDetails === "function") { CFG.onListingDetails(la, lo); return; }
    const i = listingInfo(la, lo), as = assessFor(la, lo), row = (l, v) => v ? `<div><dt>${l}</dt><dd>${v}</dd></div>` : "";
    ldv.innerHTML = `<div class="ldw"><div class="ldph">${HERO_SVG}${i.photo ? `<img src="${esc(i.photo)}" alt="Photo of the home" onerror="this.remove()">` : ""}<button type="button" class="ldx" aria-label="Close">&#10005;</button></div>
      <div class="ldb"><b class="ldp">${esc(i.price || "")}</b><p class="lda">${esc(i.address || "")}</p><p class="lds"><i class="ldot"></i>${esc(i.status || "Active")}${i.listed ? " &middot; listed " + esc(i.listed) : ""}</p>
      <dl class="ldf">${row("Open house", (i.openHouses || []).map(ohTxt).join("<br>"))}${row("Type", esc(i.type || ""))}${row("Bedrooms", i.beds)}${row("Bathrooms", i.baths)}${row("Home size", i.sqft ? (+i.sqft).toLocaleString() + " sq ft" : "")}${row("Lot size", i.lot ? (+i.lot).toLocaleString() + " sq ft" : "")}${row("Year built", i.year)}${row("Property tax", i.tax ? "$" + (+i.tax).toLocaleString() + " / year" : "")}${row("BC Assessment", as ? as.valTxt + (as.year ? " (" + as.year + ")" : "") : "")}${row("Price vs assessed", as ? (as.near ? "About the same" : as.pctTxt + " " + as.word) + " (" + as.dTxt + ")" : "")}</dl>
      ${i.sample ? `<p class="ldn">Sample listing, not a real home. On your site this opens the full listing: all photos, description, MLS&reg; history and sold prices.</p>` : ""}
      <div class="ldbtn"><button type="button" class="ldback">Back to the card</button><button type="button" class="ldmap">Show nearby on map</button></div></div></div>`;
    ldv.hidden = false; requestAnimationFrame(() => ldv.classList.add("on")); }
  const ldClose = () => { ldv.classList.remove("on"); setTimeout(() => ldv.hidden = true, 180); };
  ldv.addEventListener("click", e => { if (e.target === ldv || e.target.closest(".ldx, .ldback")) { ldClose(); return; } if (e.target.closest(".ldmap")) { ldClose(); const b = document.getElementById("wdetail"); if (b) b.click(); } });
  addEventListener("keydown", e => { if (e.key === "Escape" && !ldv.hidden) ldClose(); });

  // ================= hints on / off (under Lists), and a rare "need help?" =================
  window.BCNearby._hints = on => { if (on) { for (const k in GD) if (k[0] !== "_") delete GD[k]; for (const k in GUIDED) delete GUIDED[k]; LS.set("bcNearby.guided.v1", GUIDED); GD._on = Date.now(); delete GD._off; toast("Tips on · short tips will show as you go"); }
    else { GD._off = Date.now(); delete GD._on; gQ.length = 0; gClose(); gd.hidden = true; toast("Tips off · turn them on again under Lists"); } LS.set("bcNearby.guide.v1", GD); };
  window.BCNearby._hintsOn = () => guideOn();
  setTimeout(() => { if (guideOn() || GD._no >= 2 || SV.n < 8 || Date.now() - (GD._asked || 0) < 30 * 864e5) return; GD._asked = Date.now(); LS.set("bcNearby.guide.v1", GD);
    msgBox("Finding your way around?", ["Tips are short notes that explain the map as you use it.", "You can turn them on or off anytime under <b>Lists</b>."], { ok: "Turn on tips", onOk: () => window.BCNearby._hints(true), alt: "No thanks", onAlt: () => { GD._no = (GD._no || 0) + 1; LS.set("bcNearby.guide.v1", GD); }, ms: 15000 }); }, 40000);

  // ######## PART 16: MEASURE A LOT (odd shapes, curved sides) ########
  // ================= Measure a lot: tap corners -> every side with its direction, perimeter, area in sq ft / acres / m²
  // Accuracy: lengths use WGS84 metres-per-degree at the lot's latitude (error well under 0.1% at lot size). What limits accuracy is
  // where the finger lands: zoom to the closest level (the tool does this) and, with lot lines on, corners snap to the lot-line corners.
  const MS = { pts: [], closed: false, lay: L.layerGroup(), mk: [] }, mBar = document.createElement("div"), mBox = document.createElement("div");
  mBar.className = "msbar"; mBar.hidden = true; mBox.className = "msbox"; mBox.hidden = true; map.getContainer().append(mBar, mBox);
  for (const el of [mBar, mBox]) { L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el); el.addEventListener("click", e => e.stopPropagation()); }
  const mPerDeg = la => { const f = la * Math.PI / 180; return [111132.92 - 559.82 * Math.cos(2 * f) + 1.175 * Math.cos(4 * f), 111412.84 * Math.cos(f) - 93.5 * Math.cos(3 * f)]; };
  const mXY = (p, o) => { const [ky, kx] = mPerDeg(o[0]); return [(p[1] - o[1]) * kx, (p[0] - o[0]) * ky]; };
  const mLen = (a, b) => { const m = mPerDeg((a[0] + b[0]) / 2); return Math.hypot((b[1] - a[1]) * m[1], (b[0] - a[0]) * m[0]); };
  const DIR8 = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"], DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const dIdx = deg => Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  const bear = (a, b) => { const [x, y] = mXY(b, a); return Math.atan2(x, y) * 180 / Math.PI; };
  const ft = m => m * 3.28084, f1 = n => n.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 }), f0 = n => Math.round(n).toLocaleString();
  function mArea() { const o = MS.pts[0]; let a = 0; const q = MS.pts.map(p => mXY(p, o)); for (let i = 0; i < q.length; i++) { const [x1, y1] = q[i], [x2, y2] = q[(i + 1) % q.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; }
  function mCentroid() { const n = MS.pts.length, o = MS.pts[0], [ky, kx] = mPerDeg(o[0]), q = MS.pts.map(p => mXY(p, o)); let A = 0, cx = 0, cy = 0;   // true centre of the shape (not the average of corners, which leans toward curves)
    for (let i = 0; i < n; i++) { const [x1, y1] = q[i], [x2, y2] = q[(i + 1) % n], f = x1 * y2 - x2 * y1; A += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f; }
    if (Math.abs(A) < 1e-9) return MS.pts.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]); cx /= 3 * A; cy /= 3 * A; return [o[0] + cy / ky, o[1] + cx / kx]; }
  function mSides() { const n = MS.pts.length, out = []; if (n < 2) return out; const segs = MS.closed ? n : n - 1;
    const c = MS.closed ? mCentroid() : null;
    for (let i = 0; i < segs; i++) { const a = MS.pts[i], b = MS.pts[(i + 1) % n], len = mLen(a, b), br = bear(a, b);
      let side = ""; if (c) { const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; side = DIR8[dIdx(bear(c, mid))] + " side"; }
      out.push({ i, a, b, len, br, side, runs: DIRS[dIdx(br)] + " " + Math.round(((br % 360) + 360) % 360) + "°" }); }
    const res = MS.closed && c ? mCurves(out, c) : out;
    if (MS.closed) { const cnt = {}, k = {}; res.forEach(s => cnt[s.side] = (cnt[s.side] || 0) + 1); res.forEach(s => { if (cnt[s.side] > 1) { k[s.side] = (k[s.side] || 0) + 1; s.side = s.side.replace(" side", " side, part " + k[s.side]); } }); }   // odd shapes: two edges can face the same way
    return res; }
  // a curved front (cul-de-sac, corner lot) comes from the parcel data as many tiny straight pieces: join runs of short pieces that bend gently into one "curved side"
  function mCurves(out, c) { if (out.length < 6) return out; const k0 = out.findIndex(s => s.len >= 8); if (k0 < 0) return out;
    const seq = out.slice(k0).concat(out.slice(0, k0)), M = [];
    for (const s of seq) { const p = M[M.length - 1], turn = p ? Math.abs(((s.br - p.lastBr) % 360 + 540) % 360 - 180) : 999;
      if (p && s.len < 8 && p.lastLen < 8 && turn < 35) { p.len += s.len; p.b = s.b; p.lastBr = s.br; p.lastLen = s.len; p.pts.push(s.b); }
      else M.push(Object.assign({}, s, { lastBr: s.br, lastLen: s.len, pts: [s.a, s.b] })); }
    return M.map(g => { if (g.pts.length < 4) return g; const mid = g.pts[Math.floor(g.pts.length / 2)];
      return Object.assign(g, { mid, side: DIR8[dIdx(bear(c, mid))] + " side (curved)", runs: "curved" }); }); }
  function lotCorners() { const pts = []; const lay = CFG.lotLinesLayer; if (!S.lots || !lay || typeof lay.eachLayer !== "function") return pts;
    const walk = ll => { if (!ll) return; if (Array.isArray(ll)) ll.forEach(walk); else if (ll.lat != null) pts.push(ll); };
    lay.eachLayer(l => { if (l.getLatLngs) walk(l.getLatLngs()); else if (l.eachLayer) l.eachLayer(m => m.getLatLngs && walk(m.getLatLngs())); }); return pts; }
  function mSnap(ll) { const p = map.latLngToContainerPoint(ll); let best = null, bd = 16;
    for (const q of lotCorners()) { const d = p.distanceTo(map.latLngToContainerPoint(q)); if (d < bd) { bd = d; best = q; } }
    if (MS.pts.length > 2 && !MS.closed) { const d = p.distanceTo(map.latLngToContainerPoint(MS.pts[0])); if (d < 22) return "close"; }
    return best ? [best.lat, best.lng] : [ll.lat, ll.lng]; }
  function mDraw() { MS.lay.clearLayers(); const n = MS.pts.length, sides = mSides();
    if (n >= 2) (MS.closed ? L.polygon(MS.pts, { pane: "pin", color: BRAND(), weight: 2.5, fillColor: BRAND(), fillOpacity: .10, interactive: false }) : L.polyline(MS.pts, { pane: "pin", color: BRAND(), weight: 2.5, interactive: false })).addTo(MS.lay);
    for (const s of sides) { const mid = s.mid || [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2];
      let off = ""; if (MS.closed) { const c = MS.pts.reduce((q, p) => [q[0] + p[0] / n, q[1] + p[1] / n], [0, 0]), pm = map.latLngToContainerPoint(mid), pc = map.latLngToContainerPoint(c), dx = pm.x - pc.x, dy = pm.y - pc.y, d = Math.hypot(dx, dy) || 1; off = `style="margin-left:${Math.round(dx / d * 30)}px;margin-top:${Math.round(dy / d * 16)}px"`; }
      L.marker(mid, { pane: "pin", interactive: false, icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="mslbl" ${off}>${f1(s.len)} m · ${f1(ft(s.len))} ft</div>` }) }).addTo(MS.lay); }
    const mini = i => { if (!MS.closed || n < 6) return false; const pv = MS.pts[(i - 1 + n) % n], p = MS.pts[i], nx = MS.pts[(i + 1) % n];   // points along a curve get a small dot so the curve stays readable
      if (mLen(pv, p) >= 8 || mLen(p, nx) >= 8) return false; return Math.abs(((bear(p, nx) - bear(pv, p)) % 360 + 540) % 360 - 180) < 35; };
    MS.pts.forEach((p, i) => { const m = L.marker(p, { pane: "pin", draggable: true, keyboard: false, icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="msdot${i === 0 && n > 2 && !MS.closed ? " first" : ""}${mini(i) ? " mini" : ""}"></div>` }) }).addTo(MS.lay);
      m.on("drag", e => { MS.pts[i] = [e.latlng.lat, e.latlng.lng]; mDrawLight(); }); m.on("dragend", () => { mDraw(); });
      m.on("click", e => { L.DomEvent.stopPropagation(e); if (i === 0 && n > 2 && !MS.closed) { MS.closed = true; mDraw(); } }); });
    if (MS.closed && n > 2) { const c = mCentroid(), a = mArea();
      L.marker(c, { pane: "pin", interactive: false, icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="msarea"><b>${f0(a * 10.7639)} sq ft</b><span>${(a / 4046.8564224).toFixed(3)} acres</span></div>` }) }).addTo(MS.lay); }
    mPanel(); }
  let mT = 0; function mDrawLight() { clearTimeout(mT); mT = setTimeout(mDraw, 30); }
  function mPanel() { const n = MS.pts.length, sides = mSides(), per = sides.reduce((s, x) => s + x.len, 0);
    mBar.innerHTML = `<b>${n === 0 ? "Tap the first corner of the lot" : !MS.closed ? (n < 3 ? "Tap the next corner" : "Tap the next corner, or the first dot to close") : "Done: drag any dot to adjust"}</b><span class="msbtns"><button type="button" data-m="undo" ${n ? "" : "disabled"}>Undo</button><button type="button" data-m="clear" ${n ? "" : "disabled"}>Clear</button><button type="button" data-m="done" class="go">Done</button></span>`;
    if (n < 2) { mBox.hidden = true; return; }
    const a = MS.closed && n > 2 ? mArea() : 0;
    mBox.hidden = false; mBox.innerHTML = `<div class="msline"><span>${a ? `<b>${f0(a * 10.7639)} sq ft</b> · ${(a / 4046.8564224).toFixed(3)} acres` : `<b>${f1(per)} m</b> · ${f1(ft(per))} ft`}</span><button type="button" data-m="sides" aria-expanded="${!!MS.open}">Sides ${MS.open ? "&#9652;" : "&#9662;"}</button></div><p class="msnote">${MS.closed ? "" : "Tap the first dot to close and get the area · "}Map measurement, not a survey</p>`
      + (!MS.open ? "" : `<table class="mstab"><thead><tr><th>${MS.closed ? "Side" : "Line"}</th><th>Metres</th><th>Feet</th><th>Runs</th></tr></thead><tbody>${sides.map((s, k) => `<tr><td>${MS.closed ? s.side : "Line " + (k + 1)}</td><td>${f1(s.len)}</td><td>${f1(ft(s.len))}</td><td>${s.runs}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td>${MS.closed ? "Perimeter" : "Total"}</td><td>${f1(per)}</td><td>${f1(ft(per))}</td><td></td></tr></tfoot></table>${a ? `<p class="msnote">${f0(a)} m² · usually within about 1 m when zoomed in</p>` : ""}`); }
  function measureStart(noZoom) { if (!lcEl.hidden) document.getElementById("lx").click(); S.measuring = true; MS.pts = []; MS.closed = false; MS.lay.addTo(map);
    map.setMaxZoom(19); if (!noZoom && map.getZoom() < 18) map.setZoom(18); map.getContainer().classList.add("measuring"); mBar.hidden = false; mDraw();
    if (typeof guide === "function") guide("measure", "Measure a lot", ["Tap each corner of the lot.", "Tap the first dot again to close it and get the area.", "Drag a dot to adjust it."]); }
  function measureEnd() { S.measuring = false; MS.lay.remove(); mBar.hidden = mBox.hidden = true; map.getContainer().classList.remove("measuring"); if (map.getZoom() > 17) map.setZoom(17); map.setMaxZoom(17); }
  map.on("zoomend", () => { if (S.measuring) mDraw(); });
  map.on("click", e => { if (!S.measuring || MS.closed) return; const s = mSnap(e.latlng); if (s === "close") MS.closed = true; else MS.pts.push(s); mDraw(); });
  const mAct = e => { const b = e.target.closest("[data-m]"); if (!b) return; const m = b.dataset.m;
    if (m === "sides") { MS.open = !MS.open; mPanel(); return; }
    if (m === "undo") { if (MS.closed) MS.closed = false; else MS.pts.pop(); mDraw(); }
    if (m === "clear") { MS.pts = []; MS.closed = false; mDraw(); }
    if (m === "done") measureEnd();
    if (m === "copy") { const sides = mSides(), a = mArea(), txt = ["Lot measurement (from the map, not a survey)", ...sides.map(s => `${s.side}: ${f1(s.len)} m / ${f1(ft(s.len))} ft (runs ${s.runs})`), `Area: ${f0(a * 10.7639)} sq ft · ${(a / 4046.8564224).toFixed(3)} acres · ${f0(a)} m²`].join("\n");
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast("Measurements copied"), () => toast("Couldn’t copy on this browser")); } };
  mBar.addEventListener("click", mAct); mBox.addEventListener("click", mAct);
  window.BCNearby.measure = measureStart; window.BCNearby.measureEnd = measureEnd;

  // after picking a place in "More places nearby", make sure its details and the pills sit fully above the bottom buttons
  new MutationObserver(() => { if (!S.wnJust || Date.now() - S.wnJust > 1500) return; requestAnimationFrame(() => {
    const d = document.getElementById("ndet"), row = d && d.nextElementSibling, ft = lcEl.querySelector(".wfoot2"); if (!d || !ft) return;
    const top = d.getBoundingClientRect().top, bot = (row || d).getBoundingClientRect().bottom, lim = ft.getBoundingClientRect().top - 8, cTop = lcEl.getBoundingClientRect().top + 8;
    if (bot > lim) lcEl.scrollBy({ top: Math.min(bot - lim, top - cTop), behavior: "smooth" }); }); }).observe(document.getElementById("wn"), { childList: true });
  // ######## PART 17: FILTERS ########
  // ================= Filters: one button on phones (Price, Beds, For sale... inside); chips too on wide screens
  // ---- Filters: every option the live site has (status, location, property type, price / fee / living area / lot / price per sq ft / tax sliders, beds, baths, features) + open houses
  const FL0 = () => ({ pmin: 0, pmax: 0, fmin: 0, fmax: 0, amin: 0, amax: 0, lmin: 0, lmax: 0, smin: 0, smax: 0, tmin: 0, tmax: 0, beds: 0, baths: 0, types: [], feats: [], city: "", hood: "", oh: 0 });
  const FL = Object.assign(FL0(), (o => o && typeof o === "object" ? o : {})(LS.get("bcNearby.flt.v2", null)));
  if (!Array.isArray(FL.types)) FL.types = []; if (!Array.isArray(FL.feats)) FL.feats = [];
  if (CFG.openHouses === false) FL.oh = 0; for (const r0 of CFG.hideRanges || []) { const kk = { fee: ["fmin", "fmax"], ppsf: ["smin", "smax"], lot: ["lmin", "lmax"], area: ["amin", "amax"], tax: ["tmin", "tmax"] }[r0]; if (kk) { FL[kk[0]] = 0; FL[kk[1]] = 0; } }
  const fBtn = document.getElementById("fltBtn"), fN = document.getElementById("fltN"), fSh = document.createElement("div"), fChips = document.createElement("div");
  fSh.className = "fsheet"; fSh.hidden = true; fSh.setAttribute("role", "dialog"); fSh.setAttribute("aria-label", "Filters"); fChips.className = "fchips"; map.getContainer().append(fSh, fChips);
  for (const el of [fSh, fChips, fBtn]) { L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el); el.addEventListener("click", e => e.stopPropagation()); }
  const pTxt = v => !v ? "Any" : v >= 1e6 ? "$" + (v / 1e6).toFixed(v % 1e6 ? 2 : 0).replace(/\.?0+$/, "") + "M" : "$" + v / 1e3 + "K";
  const acre = v => v >= 43560 ? (v / 43560).toString().replace(/(\.\d)\d+/, "$1") + (v > 43560 ? " acres" : " acre") : v.toLocaleString() + " sq ft";
  const SRV = !!CFG.serverFilters, OH_ON = CFG.openHouses !== false;   // live: the API filters; open houses only when the data has them
  const RANGES = [   // [id, label, min key, max key, steps (first = no min, last = no max), label for a value]
    ["price", "Price", "pmin", "pmax", [0, 200e3, 300e3, 400e3, 500e3, 600e3, 700e3, 800e3, 900e3, 1e6, 1.25e6, 1.5e6, 1.75e6, 2e6, 2.5e6, 3e6, 4e6, 5e6, 7.5e6, 10e6, 20e6, 100e6], pTxt],
    ["lot", "Lot size", "lmin", "lmax", [0, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000, 10000, 15000, 21780, 43560, 87120, 217800, 435600], acre],
    ["area", "Living area", "amin", "amax", [0, 400, 500, 600, 700, 800, 1000, 1200, 1500, 1750, 2000, 2500, 3000, 4000, 5000, 7500, 15000], v => v.toLocaleString() + " sq ft"],
    ["fee", "Strata / maintenance fee", "fmin", "fmax", [0, 100, 200, 300, 400, 500, 600, 700, 800, 1000, 1250, 1500, 2000, 3000], v => "$" + v.toLocaleString() + "/mo"],
    ["ppsf", "Price per sq ft", "smin", "smax", [0, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000, 3000, 5000, 25000], v => "$" + v.toLocaleString()],
    ["tax", "Property tax", "tmin", "tmax", [0, 1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 25000, 50000], v => "$" + v.toLocaleString() + "/yr"]].filter(r => !(CFG.hideRanges || []).includes(r[0]));
  const TYPES = [["townhouse", "Townhouse", /town|row/i], ["duplex", "Duplex", /duplex/i], ["apartment", "Apartment / Condo", /apart|condo/i], ["multi", "Multi-family", /multi|triplex|fourplex|plex/i], ["land", "Vacant land", /land|lot only/i],
    ["office", "Office", /office/i], ["business", "Business", /business/i], ["agri", "Agriculture", /agri|farm/i], ["industrial", "Industrial", /industr/i], ["detached", "Detached", /house|detached|single/i]];
  const TYPE_ORDER = ["detached", "townhouse", "duplex", "apartment", "multi", "land", "office", "business", "agri", "industrial"];
  const typeKey = t => { for (const [k, , re] of TYPES) if (re.test(t || "")) return k; return ""; };
  const FEATS = ["View", "Fireplace", "Suite", "Waterfront", "Pool", "Workshop"];
  const F_CITIES = CFG.cities || [["Vancouver", 49.2627, -123.1207], ["Burnaby", 49.2488, -122.9805], ["Surrey", 49.1913, -122.849], ["Richmond", 49.1666, -123.1336], ["New Westminster", 49.2057, -122.911], ["Coquitlam", 49.2838, -122.7932], ["North Vancouver", 49.32, -123.0724],
    ["Langley", 49.1044, -122.6604], ["Abbotsford", 49.0504, -122.3045], ["Victoria", 48.4284, -123.3656], ["Nanaimo", 49.1659, -123.9401], ["Kelowna", 49.888, -119.496], ["Kamloops", 50.6745, -120.3273], ["Prince George", 53.9171, -122.7497]];
  const HOODS = CFG.neighbourhoods || (DEMO ? { Vancouver: ["Mount Pleasant", "Grandview-Woodland", "Kitsilano", "Renfrew-Collingwood", "Hastings-Sunrise", "Kensington-Cedar Cottage"], Burnaby: ["Metrotown", "Brentwood", "Edmonds", "Burnaby Heights"],
    Surrey: ["Fleetwood", "Newton", "Guildford", "Cloverdale"], Richmond: ["Brighouse", "Steveston", "Broadmoor"], Coquitlam: ["Burke Mountain", "Maillardville", "Coquitlam West"] } : {});
  const GRP = k => k === "exp" ? "exp" : LST_SOLD.has(k) ? "sold" : "sale", curGrp = () => { for (const k of S.lstShow) return GRP(k); return "sale"; };
  const FINFO = {}; const fInfo = k => FINFO[k] || (FINFO[k] = (() => { const ll = k.split(",").map(Number); return listingInfo(ll[0], ll[1]); })());
  const inR = (v, a, b) => (!a || v >= a) && (!b || v <= b);
  const fPass = k => { if (SRV) return !(FL.oh && curGrp() === "sale") || !!ohNext(fInfo(k), FL.oh); const i = fInfo(k), pr = pNum(i.price || "") || +i.priceNum || 0, sq = +i.sqft || 0, lot = +i.lot || 0;
    if (!inR(pr, FL.pmin, FL.pmax)) return false;
    if ((FL.fmin || FL.fmax) && !inR(+i.maintenance || 0, FL.fmin, FL.fmax)) return false;
    if ((FL.amin || FL.amax) && (!sq || !inR(sq, FL.amin, FL.amax))) return false;
    if ((FL.lmin || FL.lmax) && (!lot || !inR(lot, FL.lmin, FL.lmax))) return false;
    if ((FL.smin || FL.smax) && (!sq || !pr || !inR(pr / sq, FL.smin, FL.smax))) return false;
    if ((FL.tmin || FL.tmax) && !inR(+i.tax || 0, FL.tmin, FL.tmax)) return false;
    if (FL.beds && (+i.beds || 0) < FL.beds) return false; if (FL.baths && (+i.baths || 0) < FL.baths) return false;
    if (FL.types.length && !FL.types.includes(typeKey(i.type))) return false;
    if (FL.feats.length) { const f = (i.features || []).map(x => String(x).toLowerCase()); if (!FL.feats.every(x => f.includes(x.toLowerCase()))) return false; }
    if (FL.city && String(i.city || "").toLowerCase() !== FL.city.toLowerCase()) return false;
    if (FL.hood && String(i.area || "").toLowerCase() !== FL.hood.toLowerCase()) return false;
    if (FL.oh && curGrp() === "sale" && !ohNext(i, FL.oh)) return false; return true; };
  const fCount = () => RANGES.filter(r => FL[r[2]] || FL[r[3]]).length + (FL.beds ? 1 : 0) + (FL.baths ? 1 : 0) + (FL.types.length ? 1 : 0) + (FL.feats.length ? 1 : 0) + (FL.city ? 1 : 0) + (FL.oh ? 1 : 0) + (curGrp() !== "sale" ? 1 : 0);
  function fApply() { let n = 0; for (const k in LSTBY) { const el = LSTBY[k]._icon && LSTBY[k]._icon.firstElementChild, ok = fPass(k); if (el) { el.classList.toggle("fltoff", !ok); const st = STATUS[k] || "active"; el.classList.toggle("oh", (st === "active" || st === "drop") && !!ohNext(fInfo(k), 2)); } if (ok && S.lstShow.has(STATUS[k] || "active")) n++; }
    if (SRV && S.apiCount != null) { const allKinds = LST_KINDS.filter(([kk]) => GRP(kk) === curGrp()).every(([kk]) => S.lstShow.has(kk)); if (allKinds || S.apiClusters) n = Math.max(n, S.apiCount); }
    if (S.notifyQuery) S.notifyQuery();
    const c = fCount(); fN.hidden = !c; fN.textContent = c; fBtn.classList.toggle("on", !!c); LS.set("bcNearby.flt.v2", FL); fChipsR();
    const ohOn = FL.oh && curGrp() === "sale"; ohBar.hidden = !ohOn;
    if (ohOn) ohBar.innerHTML = `<button type="button" class="ohb-t" data-ohb="open"><i class="ohdot"></i><b>Open houses ${FL.oh === 1 ? "this weekend" : "next 7 days"}</b><span>${n.toLocaleString()}</span></button><button type="button" class="ohb-x" data-ohb="off" aria-label="Show all homes again">&#10005;</button>`;
    const go = fSh.querySelector(".fgo"); if (go) go.textContent = n ? `Show ${n.toLocaleString()} ${n === 1 ? "home" : "homes"}` : "No homes match · try fewer filters";
    return n; }
  const ohBar = document.createElement("div"); ohBar.className = "ohbar"; ohBar.hidden = true; map.getContainer().append(ohBar);
  L.DomEvent.disableClickPropagation(ohBar); ohBar.addEventListener("click", e => { const b = e.target.closest("[data-ohb]"); if (!b) return; e.stopPropagation();
    if (b.dataset.ohb === "off") { FL.oh = 0; if (!fSh.hidden) fRender(); else fApply(); toast("Showing all homes again"); } else fOpen("oh"); });
  const seg = (key, vals, lab) => `<div class="fseg">${vals.map(v => `<button type="button" data-f="${key}" data-v="${v}" aria-pressed="${FL[key] === v}">${v ? lab(v) : "Any"}</button>`).join("")}</div>`;
  const rIdx = (steps, v, hi) => { if (!v) return hi ? steps.length - 1 : 0; let i = steps.findIndex(s => s >= v); return i < 0 ? steps.length - 1 : i; };
  const fRT = r => { const [, , a, b, , fmt] = r; return !FL[a] && !FL[b] ? "Any" : (FL[a] ? fmt(FL[a]) : "No min") + " – " + (FL[b] ? fmt(FL[b]) : "No max"); };
  const rangeHTML = r => { const [id, label, a, b, steps] = r, lo = rIdx(steps, FL[a]), hi = rIdx(steps, FL[b], 1), n = steps.length - 1;
    return `<section id="f-${id}" class="frange"><div class="frh"><h4>${label}</h4><b data-rv="${id}">${fRT(r)}</b></div><div class="fsl"><i class="ftrack"><u data-ru="${id}" class="${FL[a] || FL[b] ? "on" : ""}" style="left:${lo / n * 100}%;right:${100 - hi / n * 100}%"></u></i>
      <input type="range" min="0" max="${n}" step="1" value="${lo}" data-rl="${id}" aria-label="${label}, lowest"><input type="range" min="0" max="${n}" step="1" value="${hi}" data-rh="${id}" aria-label="${label}, highest"></div></section>`; };
  function fRender(focus) { const g = curGrp(), n = fApply(), hoods = FL.city ? (HOODS[FL.city] || []) : [];
    const GN = { sale: "For sale", sold: "Sold", exp: "Expired" };
    fSh.innerHTML = `<div class="fhd"><b>Filters</b><button type="button" class="fx" data-f="close" aria-label="Close">&#10005;</button></div><div class="fbody">
      <section id="f-show"><h4>Show</h4><div class="lyseg three">${["sale", "sold", "exp"].map(k => `<button type="button" data-lgrp="${k}" aria-pressed="${g === k}"><b>${GN[k]}</b><small>${g === k ? "Showing &#9662;" : "Tap to see"}</small></button>`).join("")}</div>
        ${LST_KINDS.filter(([k]) => GRP(k) === g).length > 1 ? LST_KINDS.filter(([k]) => GRP(k) === g).map(([k, nm]) => `<div class="fkind"><button type="button" class="fk" data-lst="${k}" aria-pressed="${S.lstShow.has(k)}"><span class="cb"></span><i class="lsw ${k}">${k === "fc" || k === "fcs" ? "<b>F</b>" : ""}${k === "sold" || k === "fcs" ? "Sold" : k === "drop" ? "&darr;$1.4M" : k === "exp" ? "Exp" : "$1.2M"}</i>${nm}</button><button type="button" class="lyonlyb" data-lonly="${k}">Only</button></div>`).join("") : `<p class="fnote">${g === "exp" ? "Listings that ended without selling. Prices after free sign-in." : ""}</p>`}</section>
      ${g !== "sale" || !OH_ON ? "" : `<section id="f-oh"><button type="button" class="ohsw" data-ohsw="1" aria-pressed="${!!FL.oh}"><i class="ohdot"></i><span><b>Only open houses</b><small>${FL.oh ? "Showing open houses only" : "Hide homes without an open house"}</small></span><em class="sw" aria-hidden="true"></em></button>
        ${FL.oh ? `<div class="fseg ohwhen">${[1, 2].map(v => `<button type="button" data-f="oh" data-v="${v}" aria-pressed="${FL.oh === v}">${v === 1 ? "This weekend" : "Next 7 days"}</button>`).join("")}</div>` : ""}<p class="fnote"><i class="ohdot"></i>An orange dot on a price means an open house in the next 7 days.</p></section>`}
      <section id="f-loc"><h4>Location</h4><div class="floc"><label>City<select data-loc="city"><option value="">All locations</option>${F_CITIES.map(c => `<option ${FL.city === c[0] ? "selected" : ""}>${esc(c[0])}</option>`).join("")}</select></label>
        <label>Neighbourhood<select data-loc="hood" ${hoods.length ? "" : "disabled"}><option value="">${FL.city ? (hoods.length ? "All of " + esc(FL.city) : "No list for this city yet") : "Pick a city first"}</option>${hoods.map(h => `<option ${FL.hood === h ? "selected" : ""}>${esc(h)}</option>`).join("")}</select></label></div></section>
      <section id="f-type"><h4>Property type</h4><div class="fseg wrap">${TYPE_ORDER.map(k => `<button type="button" data-ft="${k}" aria-pressed="${FL.types.includes(k)}">${TYPES.find(t => t[0] === k)[1]}</button>`).join("")}</div></section>
      ${rangeHTML(RANGES[0])}
      <section id="f-beds"><h4>Bedrooms</h4>${seg("beds", [0, 1, 2, 3, 4, 5], v => v + "+")}<h4>Bathrooms</h4>${seg("baths", [0, 1, 2, 3, 4], v => v + "+")}</section>
      ${RANGES.slice(1).map(rangeHTML).join("")}
      <section id="f-feat"><h4>Features</h4><div class="fseg wrap">${FEATS.map(x => `<button type="button" data-ff="${x}" aria-pressed="${FL.feats.includes(x)}">${x}</button>`).join("")}</div></section></div>
      <div class="fft"><button type="button" class="fclr" data-f="clear">Clear all</button><button type="button" class="fgo" data-f="close">Show ${n.toLocaleString()} homes</button></div>`;
    fApply(); if (focus) { const el = fSh.querySelector("#f-" + focus); if (el) (() => { const bd = fSh.querySelector(".fbody"); if (bd) bd.scrollTop += el.getBoundingClientRect().top - bd.getBoundingClientRect().top; })(); } }
  function fOpen(focus) { if (!lcEl.hidden) document.getElementById("lx").click(); if (typeof openLy === "function") openLy(false); fSh.hidden = false; document.body.classList.add("fopen"); fRender(focus); }
  const fClose = () => { fSh.hidden = true; document.body.classList.remove("fopen"); };
  const keepScroll = fn => { const bd = fSh.querySelector(".fbody"), top = bd ? bd.scrollTop : 0; fn(); const b2 = fSh.querySelector(".fbody"); if (b2) b2.scrollTop = top; };
  fBtn.onclick = () => fSh.hidden ? fOpen() : fClose();
  fSh.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.lst || b.dataset.lonly || b.dataset.lgrp) { lstPick(b); keepScroll(fRender); return; }
    if (b.dataset.ohsw) { FL.oh = FL.oh ? 0 : 2; keepScroll(fRender); return; }
    if (b.dataset.ft) { const v = b.dataset.ft; FL.types = FL.types.includes(v) ? FL.types.filter(x => x !== v) : [...FL.types, v]; keepScroll(fRender); return; }
    if (b.dataset.ff) { const v = b.dataset.ff; FL.feats = FL.feats.includes(v) ? FL.feats.filter(x => x !== v) : [...FL.feats, v]; keepScroll(fRender); return; }
    const f = b.dataset.f; if (!f) return; if (f === "close") { fClose(); return; }
    if (f === "clear") { Object.assign(FL, FL0()); S.lstShow = new Set(["active", "drop"]); lstApply(); try { localStorage.setItem("bcNearby.lst.v1", JSON.stringify([...S.lstShow])); } catch (e2) {} keepScroll(fRender); return; }
    FL[f] = +b.dataset.v; keepScroll(fRender); });
  fSh.addEventListener("change", e => { const s = e.target.closest("select[data-loc]"); if (!s) return;
    if (s.dataset.loc === "city") { FL.city = s.value; FL.hood = ""; const c = F_CITIES.find(x => x[0] === FL.city); if (c) map.setView([c[1], c[2]], 13);
      const city = FL.city; if (city && !HOODS[city] && typeof CFG.loadNeighbourhoods === "function") Promise.resolve(CFG.loadNeighbourhoods(city)).then(l => { if (!l || !l.length) return; HOODS[city] = l; if (!fSh.hidden && FL.city === city) keepScroll(fRender); }).catch(() => {}); }
    else FL.hood = s.value; keepScroll(fRender); });
  let fT = 0;
  fSh.addEventListener("input", e => { const el = e.target, id = el.dataset.rl || el.dataset.rh; if (!id) return; const r = RANGES.find(x => x[0] === id), [, , a, b, steps] = r, n = steps.length - 1;
    const lo = fSh.querySelector(`[data-rl="${id}"]`), hi = fSh.querySelector(`[data-rh="${id}"]`); let l = +lo.value, h = +hi.value;
    if (l > h) { if (el === lo) { h = l; hi.value = h; } else { l = h; lo.value = l; } }
    FL[a] = l ? steps[l] : 0; FL[b] = h < n ? steps[h] : 0;
    fSh.querySelector(`[data-rv="${id}"]`).textContent = fRT(r); const u = fSh.querySelector(`[data-ru="${id}"]`); u.style.left = l / n * 100 + "%"; u.style.right = 100 - h / n * 100 + "%"; u.classList.toggle("on", !!(FL[a] || FL[b]));
    clearTimeout(fT); fT = setTimeout(fApply, 60); });
  function fChipsR() { const g = curGrp(), pr = FL.pmin || FL.pmax ? (FL.pmin ? pTxt(FL.pmin) : "Any") + "–" + (FL.pmax ? pTxt(FL.pmax) : "Any") : "Price";
    fChips.innerHTML = `<button type="button" data-fo="price" class="${FL.pmin || FL.pmax ? "on" : ""}">${pr} &#9662;</button><button type="button" data-fo="beds" class="${FL.beds ? "on" : ""}">${FL.beds ? FL.beds + "+ beds" : "Beds"} &#9662;</button><button type="button" data-fo="type" class="${FL.types.length ? "on" : ""}">${FL.types.length ? FL.types.length === 1 ? TYPES.find(t => t[0] === FL.types[0])[1] : FL.types.length + " types" : "Type"} &#9662;</button><button type="button" data-fo="show" class="${g !== "sale" ? "on" : ""}">${({ sale: "For sale", sold: "Sold", exp: "Expired" })[g]} &#9662;</button>${g !== "sale" || !OH_ON ? "" : `<button type="button" data-fo="oh" class="${FL.oh ? "on" : ""}">${FL.oh ? "Open houses only" : "Open houses"} &#9662;</button>`}`; }
  fChips.addEventListener("click", e => { const b = e.target.closest("[data-fo]"); if (b) fOpen(b.dataset.fo); });
  window.BCNearby._fRender = () => { if (!fSh.hidden) fRender(); else fApply(); };
  setTimeout(fApply, 700); map.on("zoomend moveend", () => setTimeout(fApply, 30));
  document.getElementById("measBtn").onclick = e => { e.stopPropagation(); fClose(); if (S.measuring) measureEnd(); else measureStart(); };
  for (const id of ["measBtn", "rcol"]) L.DomEvent.disableClickPropagation(document.getElementById(id));

  // ######## PART 18: LOT CARD, SELLER FORM, SPOT CARD ########
  // ================= Lots: tap a lot (Lot lines on) -> a short lot card: Lot info | What's nearby | Measure
  // Live site: give CFG.lotLinesLayer (a Leaflet layer whose features have their own lot data) or CFG.getLotInfo(lat, lng, latlngs) -> { address, sub, roll, pid, plan, total, land, building, year, history: [[2026, 1663000], ...], fullUrl }.
  // The demo draws made-up lots (a simple street grid) so the card can be tried anywhere.
  // ===== DEMO START (D10): made-up street grid of lots
  // ===== Live site: your lot lines (lotLinesLayer) and getLotInfo; demo:false turns this off
  const demoLots = L.layerGroup(); let dlT = 0;
  const DL = { w: 15.24, d: 36.6, st: 20, per: 12 };   // 50 ft x 120 ft lots, 20 m streets, 12 lots per block
  const STREETS = ["Oak", "Maple", "Cedar", "Birch", "Willow", "Elm", "Spruce", "Alder", "Laurel", "Hemlock"];
  // ===== DEMO END (D10) =====
  function lotArea(ll) { const o = ll[0], m = mPerDeg(o[0]); let a = 0; const q = ll.map(p => [(p[1] - o[1]) * m[1], (p[0] - o[0]) * m[0]]); for (let i = 0; i < q.length; i++) { const [x1, y1] = q[i], [x2, y2] = q[(i + 1) % q.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; }
  // ===== DEMO START (D10b): draws the made-up grid while lot lines are on
  // ===== Live site: your lotLinesLayer is used instead automatically
  function drawDemoLots() { demoLots.clearLayers(); if (!DEMO || !S.lots || CFG.lotLinesLayer || map.getZoom() < 16) return;
    const b = map.getBounds(), o = [49.0, -123.3], m = mPerDeg(49.2), bw = DL.w * DL.per + DL.st, bd = DL.d * 2 + DL.st;
    const x0 = (b.getWest() - o[1]) * m[1], x1 = (b.getEast() - o[1]) * m[1], y0 = (b.getSouth() - o[0]) * m[0], y1 = (b.getNorth() - o[0]) * m[0]; let n = 0;
    for (let by = Math.floor(y0 / bd); by * bd < y1; by++) for (let bx = Math.floor(x0 / bw); bx * bw < x1; bx++) for (let r = 0; r < 2; r++) for (let c = 0; c < DL.per; c++) {
      const xa = bx * bw + c * DL.w, ya = by * bd + r * DL.d; if (xa > x1 || xa + DL.w < x0 || ya > y1 || ya + DL.d < y0) continue; if (++n > 1600) return;
      const ll = [[ya, xa], [ya, xa + DL.w], [ya + DL.d, xa + DL.w], [ya + DL.d, xa]].map(([y, x]) => [o[0] + y / m[0], o[1] + x / m[1]]);
      const num = 1000 + ((bx * DL.per + c) % 500) * 2 + (r ? 1 : 0) * 0, street = (STREETS[((by % 10) + 10) % 10]) + (r ? " Ave" : " St");
      const pg = L.polygon(ll, { pane: "lots", color: "#94a3b8", weight: 1, fillColor: BRAND(), fillOpacity: 0, interactive: true, bubblingMouseEvents: false }).addTo(demoLots);
      pg.lot = { ll, address: `${(Math.abs(num) % 9000) + 1000} ${street}`, key: `${by}:${bx}:${r}:${c}`, sample: true }; pg.on("click", lotClick); } }
  map.on("moveend zoomend", () => { clearTimeout(dlT); dlT = setTimeout(drawDemoLots, 80); });
  const lotsApply0 = lotsApply; lotsApply = user => { if (CFG.lotLinesLayer || typeof CFG.onLotLines === "function") lotsApply0(user); else if (user && !S.lots) toast("Lot lines off"); if (S.lots && !CFG.lotLinesLayer) { demoLots.addTo(map); drawDemoLots(); if (user && map.getZoom() < 16) toast("Lot lines on · zoom in close to see the lots, then tap one"); } else demoLots.remove(); };
  // ===== DEMO END (D10b) =====
  function lotData(lot) { const c = lot.ll ? lot.ll.reduce((s, p) => [s[0] + p[0] / lot.ll.length, s[1] + p[1] / lot.ll.length], [0, 0]) : lot.c;
    let d = lot.own ? Object.assign({}, lot.own) : typeof CFG.getLotInfo === "function" ? CFG.getLotInfo(c[0], c[1], lot.ll) : null;
    if (!d) { let h = 0; for (const ch of lot.key || lot.address) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const r = n => { h = (h * 1103515245 + 12345) >>> 0; return h % n; };
      const tot = 950e3 + r(150) * 1e4, landPct = .62 + r(20) / 100, hist = [tot]; for (let i = 0; i < 4; i++) hist.push(Math.round(hist[hist.length - 1] / (1 + (r(20) - 7) / 100) / 1e3) * 1e3);
      d = { address: lot.address, sub: "Sample lot · not a real property", roll: `${10 + r(80)}-${100 + r(800)}-${1000 + r(8000)}-${10000 + r(80000)}-${r(9)}`, pid: `0${10 + r(80)}-${100 + r(800)}-${100 + r(800)}`, plan: "NWP" + (10000 + r(80000)),
        total: tot, land: Math.round(tot * landPct / 1e3) * 1e3, year: 2026, history: hist.map((v, i) => [2026 - i, v]), sample: true }; d.building = d.total - d.land; }
    d.ll = lot.ll; d.c = c; if (lot.ll) { const a = lotArea(lot.ll); d.sqft = a * 10.7639; d.acres = a / 4046.8564224; d.m2 = a; }
    if (d.sample && lot.ll) d.landSqft = Math.round(d.sqft / 50) * 50 + ((lot.key || "").length % 3 === 0 ? 120 : 0);   // demo: an 'official' size close to the map outline
    if (lot.ll && lot.ll.length === 4) { const s = [0, 1].map(i => mLen(lot.ll[i], lot.ll[i + 1]) * 3.28084); d.dims = `${Math.round(Math.min(...s))} × ${Math.round(Math.max(...s))} ft`; }
    return d; }
  // which lot is at this point? Live: CFG.getLotInfo(lat, lng) (with an outline if you have one). Demo: the made-up street grid (roads and gaps -> none).
  function lotAt(lat, lon, addr) { if (typeof CFG.getLotInfo === "function") { const d = CFG.getLotInfo(lat, lon); if (!d) return null; return { ll: d.outline || null, address: d.address || addr || "This property", key: d.pid || d.roll || (lat.toFixed(5) + lon.toFixed(5)), own: d, c: [lat, lon] }; }
    if (!DEMO) return null; const o = [49.0, -123.3], m = mPerDeg(49.2), bw = DL.w * DL.per + DL.st, bd = DL.d * 2 + DL.st, x = (lon - o[1]) * m[1], y = (lat - o[0]) * m[0];
    const bx = Math.floor(x / bw), by = Math.floor(y / bd), cx = x - bx * bw, cy = y - by * bd; if (cx > DL.w * DL.per || cy > DL.d * 2) return null;   // on a street
    const c = Math.floor(cx / DL.w), r = cy > DL.d ? 1 : 0, xa = bx * bw + c * DL.w, ya = by * bd + r * DL.d;
    const ll = [[ya, xa], [ya, xa + DL.w], [ya + DL.d, xa + DL.w], [ya + DL.d, xa]].map(([yy, xx]) => [o[0] + yy / m[0], o[1] + xx / m[1]]);
    return { ll, address: addr && /\d/.test(addr) ? addr : `${(Math.abs(1000 + ((bx * DL.per + c) % 500) * 2) % 9000) + 1000} ${STREETS[((by % 10) + 10) % 10]}${r ? " Ave" : " St"}`, key: `${by}:${bx}:${r}:${c}`, sample: true }; }
  window.BCNearby._lotAt = lotAt; window.BCNearby._openLot = lot => openLot(lot);
  function lotClick(e) { if (S.measuring) { map.fire("click", { latlng: e.latlng }); return; } L.DomEvent.stopPropagation(e); openLot(e.target.lot); }
  function openLot(lot) { const d = lotData(lot);
    for (const k in LSTBY) { const ll = LSTBY[k].getLatLng(); if (map.distance(ll, d.c) < 22) { LSTBY[k].fire("click"); return; } }   // the lot is for sale: open its listing
    if (S.lotSelLay) S.lotSelLay.remove(); S.lotSelLay = !d.ll ? null : L.polygon(d.ll, { pane: "pin", color: BRAND(), weight: 3, fillColor: BRAND(), fillOpacity: .14, interactive: false }).addTo(map);
    if (lstOn) { lstOn.classList.remove("on"); lstOn = null; } searchLayer.clearLayers(); S.lotTab = "info"; S.lotMore = false;
    placeMode({ label: d.address, sub: d.sub, exact: true, lot: d }); S.lstLL = [d.c[0], d.c[1]]; S.cardClosed = false; S.seenLine = ""; S.onListing = true; check(d.c[0], d.c[1]); S.onListing = false; setTimeout(() => S.peekHome && S.peekHome(), 160);
    if (typeof CFG.loadLotDetails === "function") { const tok = S.lotTok = Date.now(); Promise.resolve(CFG.loadLotDetails(d)).then(more => { if (!more || S.lotTok !== tok || !S.place || S.place.lot !== d) return;
        Object.assign(d, more); placeMode(S.place); if (S.tapped) check(...S.tapped); }).catch(() => {}); } }
  const mny = v => "$" + Math.round(v).toLocaleString();
  function lotInfoHTML(d) { const h = d.history || [], prev = h[1] && h[1][1], ch = prev ? (d.total - prev) / prev * 100 : null, lp = Math.round(d.land / d.total * 100);
    let s = `<div class="lotv"><b>${mny(d.total)}</b>${ch != null ? `<span class="${ch < 0 ? "dn" : "up"}">${ch < 0 ? "&darr;" : "&uarr;"} ${Math.abs(ch).toFixed(0)}% vs ${h[1][0]}</span>` : ""}</div><p class="lotl">Assessment ${d.year} &middot; total value</p>`
      + (() => { const off = +d.landSqft || 0, map0 = +d.sqft || 0, main = off || map0; if (!main) return "";
          const diff = off && map0 ? Math.abs(off - map0) / off : 0;
          return `<div class="lots2"><div><small>Lot size${off ? " (assessment)" : " (map outline)"}</small><b>${f0(main)} sq ft</b><span> &middot; ${(main / 43560).toFixed(3)} acres</span>${off && map0 ? `<small class="lotmap">Map outline: ${f0(map0)} sq ft${diff > .08 ? " &middot; outline may be off here, go by the assessment" : ""}</small>` : ""}</div>${d.dims ? `<small>&asymp; ${d.dims}</small>` : ""}</div>`; })();
    const pts = h.slice().reverse(), vs = pts.map(p => p[1]), mn = Math.min(...vs), mx = Math.max(...vs), X = i => 4 + i * (54 / Math.max(1, pts.length - 1)), Y = v => mx === mn ? 10 : 17 - (v - mn) / (mx - mn) * 14;
    s += `<div class="lotf"><button type="button" class="lotfb" data-lot="hist" aria-expanded="${S.lotMore === "hist"}">History <svg viewBox="0 0 62 20"><polyline points="${pts.map((p, i) => X(i) + "," + Y(p[1])).join(" ")}" fill="none" style="stroke:var(--bcn-navy)" stroke-width="2"/></svg>${S.lotMore === "hist" ? "&#9652;" : "&#9662;"}</button><button type="button" class="lotfb" data-lot="split" aria-expanded="${S.lotMore === "split"}">Breakdown ${S.lotMore === "split" ? "&#9652;" : "&#9662;"}</button><button type="button" class="lotfb" data-lot="legal" aria-expanded="${S.lotMore === "legal"}">Legal ${S.lotMore === "legal" ? "&#9652;" : "&#9662;"}</button></div>`;
    if (S.lotMore === "split") s += `<div class="lotbar"><i style="width:${lp}%"></i><i></i></div><div class="lotleg"><span><i></i>Land ${mny(d.land)}</span><span><i class="b"></i>Building ${mny(d.building)}</span></div>`;
    if (S.lotMore === "hist") { const W = 300, Hh = 70, XX = i => 10 + i * ((W - 20) / Math.max(1, pts.length - 1)), YY = v => mx === mn ? Hh / 2 : Hh - 12 - (v - mn) / (mx - mn) * (Hh - 24);
      s += `<div class="lothist"><svg viewBox="0 0 ${W} ${Hh + 14}"><polyline points="${pts.map((p, i) => XX(i) + "," + YY(p[1])).join(" ")}" fill="none" style="stroke:var(--bcn-navy)" stroke-width="2.2"/>${pts.map((p, i) => `<circle cx="${XX(i)}" cy="${YY(p[1])}" r="${i === pts.length - 1 ? 4.5 : 3.2}" fill="${i === pts.length - 1 ? "#f5a20a" : BRAND()}"/><text x="${XX(i)}" y="${Hh + 12}" text-anchor="middle">${p[0]}</text>`).join("")}</svg>
        <table>${h.map((p, i) => { const pv = h[i + 1] && h[i + 1][1], c = pv ? (p[1] - pv) / pv * 100 : null; return `<tr><td>${p[0]}</td><td>${mny(p[1])}</td><td class="${c == null ? "" : c < 0 ? "dn" : "up"}">${c == null ? "&mdash;" : (c > 0 ? "+" : "&minus;") + Math.abs(c).toFixed(0) + "%"}</td></tr>`; }).join("")}</table></div>`; }
    if (S.lotMore === "legal") s += `<div class="lotlegal"><div><small>Roll</small><b>${esc(d.roll || "—")}</b></div><div><small>PID</small><b>${esc(d.pid || "—")}</b></div><div><small>Plan</small><b>${esc(d.plan || "—")}</b></div></div>`;
    s += S.lotMore === "own" ? `<div class="lotown2"><b>Free home value report</b><small>For ${esc(d.address)}. A local agent prepares it from recent sales nearby. No obligation.</small><input type="text" id="slName" placeholder="Your name" autocomplete="name"><input type="text" id="slCon" placeholder="Phone or email" autocomplete="email"><div><button type="button" class="lotsend" data-lot="send">Send me the report</button><button type="button" class="lotcan" data-lot="own">Cancel</button></div></div>`
      : `<button type="button" class="lotown" data-lot="own">Own this home? <b>Get a free home value report</b></button>`;
    s += `<a class="lotfull" ${d.fullUrl ? `href="${esc(d.fullUrl)}" target="_blank" rel="noopener"` : `href="#" data-lot="full"`}>View full assessment &rarr;</a><p class="lotn">Assessment public data &middot; lot size from mapped lines, not a survey</p>`;
    return `<div class="lotc">${s}</div>`; }
  document.getElementById("wn").addEventListener("click", e => { const b = e.target.closest("[data-lot]"); if (!b || !S.place || !S.place.lot) return; e.preventDefault(); e.stopPropagation();
    const k = b.dataset.lot;
    if (k === "send") { const nm = (document.getElementById("slName") || {}).value || "", con = ((document.getElementById("slCon") || {}).value || "").trim(), d = S.place.lot;
      if (!/\S+@\S+\.\S+/.test(con) && con.replace(/\D/g, "").length < 10) { toast("Add a phone number or email so we can send it"); (document.getElementById("slCon") || {}).focus && document.getElementById("slCon").focus({ preventScroll: true }); return; }
      const lead = { address: d.address, roll: d.roll || "", pid: d.pid || "", lat: d.c[0], lng: d.c[1], assessed: d.total || null, name: nm.trim(), contact: con, source: "lot card" };
      if (typeof CFG.onSellerLead === "function") { try { CFG.onSellerLead(lead); } catch (er) {} toast("Thanks. Your report request was sent"); } else toast("Sent (demo). On your site this goes to your inbox or CRM");
      S.lotMore = false; if (S.tapped) check(...S.tapped); return; }
    if (k === "full") { toast("On your site this opens the full BC Assessment page"); return; } S.lotMore = S.lotMore === k ? false : k; if (S.tapped) check(...S.tapped); }, true);
  function measureLot(ll) { if (!lcEl.hidden) document.getElementById("lx").click(); measureStart(true); MS.pts = ll.map(p => [p[0], p[1]]); MS.closed = true; map.stop(); map.fitBounds(L.latLngBounds(ll).pad(.6), { maxZoom: 19, animate: false, paddingBottomRight: [0, Math.round(map.getSize().y * .35)] }); mDraw(); }   // fit the lot above the measure panel
  // a tap on the map (no listing, no lot): say roughly where it is. Own lots first, then the BC Geocoder (needs geocoderKey).
  // a tap anywhere that isn't a listing or a lot: open the spot card right away, then fill in the address
  // ===== DEMO START (D11): made-up addresses for the demo grid
  // ===== Live site: getAddressAt (your own addresses), then BC Geocoder as fallback
  function gridAddr(lat, lon) { const o = [49.0, -123.3], m = mPerDeg(49.2), bw = DL.w * DL.per + DL.st, bd = DL.d * 2 + DL.st, x = (lon - o[1]) * m[1], y = (lat - o[0]) * m[0];
    const bx = Math.floor(x / bw), by = Math.floor(y / bd), c = Math.max(0, Math.min(DL.per - 1, Math.floor((x - bx * bw) / DL.w))), r = (y - by * bd) > DL.d ? 1 : 0;
    return `${(Math.abs(1000 + ((bx * DL.per + c) % 500) * 2) % 9000) + 1000} ${STREETS[((by % 10) + 10) % 10]}${r ? " Ave" : " St"}`; }
  // ===== DEMO END (D11) =====
  function openSpot(lat, lon) { const lt = map.getZoom() >= 16 ? lotAt(lat, lon) : null; if (lt) { openLot(lt); return; }   // a house lot opens its lot card (lot lines on or off); roads, parks, zoomed-out taps get the spot card
    if (lstOn) { lstOn.classList.remove("on"); lstOn = null; } searchLayer.clearLayers(); const tok = S.spotTok = Date.now();
    placeMode({ label: "This spot", sub: "Finding the address&hellip;", exact: false, spot: true }); S.lstLL = [lat, lon]; S.cardClosed = false; S.seenLine = ""; S.onListing = true; check(lat, lon); S.onListing = false;
    setTimeout(() => S.peekHome && S.peekHome(), 160);
    nearAddr(lat, lon).then(a => { if (S.spotTok !== tok || !S.place || !S.place.spot) return;
      placeMode({ label: a ? "Near " + a.addr : "This spot", sub: a ? (a.sample ? "Sample address" : a.city || "") : "Address not found here", exact: false, spot: true }); }); }
  async function nearAddr(lat, lon) { if (typeof CFG.getAddressAt === "function") { try { const a = await CFG.getAddressAt(lat, lon); if (a) return typeof a === "string" ? { addr: a } : a; } catch (e) {} }
    if (CFG.geocoderKey) { try { const r = await fetch(`https://geocoder.api.gov.bc.ca/sites/nearest.json?point=${lon},${lat}&maxDistance=80&outputSRS=4326`, { headers: { apikey: CFG.geocoderKey } }); const j = await r.json(), p = j && j.properties;
      if (p && p.fullAddress) { const parts = p.fullAddress.replace(/, BC$/, "").split(", "); return { addr: parts[0], city: parts.slice(1).join(", ") }; } } catch (e) {} return null; }
    return DEMO ? { addr: gridAddr(lat, lon), sample: true } : null; }   // demo only: a made-up address so the card can be tried

  // ######## PART 19: TIP MESSAGES (plain-word notes) ########
  // ================= guide messages: short, one at a time, in plain words =================
  // Shown on a visitor's first 5 visits, and again for 3 visits after 30+ days away. Each one shows once.
  const GD = LS.get("bcNearby.guide.v1", {}), AWAY = SV.n > 1 && SV.prevLast && Date.now() - SV.prevLast > 30 * 864e5;
  if (AWAY && !GD._reset || (AWAY && GD._reset < SV.prevLast)) { for (const k in GD) delete GD[k]; GD._reset = Date.now(); GD._until = SV.n + 2; LS.set("bcNearby.guide.v1", GD); }
  const guideOn = () => !!GD._on || (!GD._off && (SV.n <= 5 || SV.n <= (GD._until || 0)));
  const gEl = document.createElement("div"); gEl.className = "gmsg"; gEl.hidden = true; gEl.setAttribute("role", "dialog"); map.getContainer().appendChild(gEl); L.DomEvent.disableClickPropagation(gEl); L.DomEvent.disableScrollPropagation(gEl);
  const gPt = document.createElement("div"); gPt.className = "gpoint"; gPt.hidden = true; gPt.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; document.body.appendChild(gPt);
  let gQ = [], gT = 0, gAim = null, gCur = null;
  function gPoint(el) { gAim = el; if (!el || !el.isConnected || !el.getClientRects().length) { gPt.hidden = true; return; } const r = el.getBoundingClientRect(), up = r.top > innerHeight * .5;
    gPt.hidden = false; gPt.classList.toggle("dn", up); gPt.style.left = Math.round(r.left + Math.min(r.width / 2, 60) - 17) + "px"; gPt.style.top = Math.round(up ? r.top - 44 : r.bottom + 6) + "px"; el.classList.add("gattn"); }
  function gClose() { gCur = null; gEl.hidden = true; gPt.hidden = true; if (gAim) gAim.classList.remove("gattn"); gAim = null; clearTimeout(gT); const n = gQ.shift(); if (n) setTimeout(() => msgBox(...n), 350); }
  function msgBox(title, items, o = {}) {   // a small card: title, a short list, "Got it" (and an optional second button)
    if (o.now && !gEl.hidden && gCur && gCur[2].sticky) gQ.unshift(gCur);
    if ((!gEl.hidden || !gd.hidden) && !o.now) { if (gQ.length < 3) gQ.push([title, items, o]); if (gEl.hidden) setTimeout(() => { if (gEl.hidden && gd.hidden) { const n = gQ.shift(); if (n) msgBox(...n); } }, 4000); return; }
    if (o.now) { gd.hidden = true; ptr.hidden = true; }
    clearTimeout(gT); if (gAim) gAim.classList.remove("gattn");
    gCur = [title, items, o];
    gEl.innerHTML = `<b class="gt">${title}</b><ul>${items.map(i => `<li>${i}</li>`).join("")}</ul><div class="gb">${o.alt ? `<button type="button" class="galt">${o.alt}</button>` : ""}<button type="button" class="gok">${o.ok || "Got it"}</button></div>`;
    gEl.hidden = false; gEl.classList.toggle("gtop", !lcEl.hidden && PHONE); gEl.classList.remove("in"); void gEl.offsetWidth; gEl.classList.add("in");
    gEl.querySelector(".gok").onclick = e => { e.stopPropagation(); gClose(); o.onOk && o.onOk(); };
    if (o.alt) gEl.querySelector(".galt").onclick = e => { e.stopPropagation(); gClose(); o.onAlt && o.onAlt(); };
    if (o.aim) setTimeout(() => gPoint(typeof o.aim === "string" ? document.querySelector(o.aim) : o.aim), 120);
    if (!o.sticky) gT = setTimeout(gClose, o.ms || 14000); }
  const GCORE = ["card", "map2", "lists", "n_grocery", "n_sky"];   // once these are all read, tips switch themselves off
  function gRead(k) { if (!k || GD[k]) return; GD[k] = Date.now(); LS.set("bcNearby.guide.v1", GD);
    if (!GD._on && GCORE.every(c => GD[c])) { GD._off = Date.now(); LS.set("bcNearby.guide.v1", GD); setTimeout(() => toast("You’ve seen all the tips · turn them on again under Lists"), 600); } }
  function guide(k, title, items, o = {}) { if (!guideOn() || GD[k]) return false; if (gCur && gCur[2] && gCur[2].k === k) return true; if (gQ.some(q => q[2] && q[2].k === k)) return true;
    msgBox(title, items, Object.assign({}, o, { k, sticky: true, ok: "Got it", onOk: () => gRead(k), alt: "Turn off tips", onAlt: () => window.BCNearby._hints(false) })); return true; }
  addEventListener("resize", () => { if (!gPt.hidden && gAim) gPoint(gAim); });
  document.getElementById("wn").addEventListener("scroll", () => { if (!gPt.hidden && gAim) gPoint(gAim); }, { passive: true });
  lcEl.addEventListener("scroll", () => { if (!gPt.hidden && gAim) gPoint(gAim); }, { passive: true });
  new MutationObserver(() => { if (lcEl.hidden && gAim && lcEl.contains(gAim)) { gPt.hidden = true; } }).observe(lcEl, { attributes: true, attributeFilter: ["hidden"] });
  // a tap on the map while a card is open: say what to do, point at Show on map
  let ctT = 0; function cardTapMsg() { if (lcEl.hidden) return false; if (Date.now() - ctT < 6000) return true; ctT = Date.now();
    msgBox(S.lstLL && !S.place ? "This home is still open" : "This spot is still open", ["To see everything on the map, tap <b>Show on map</b>.", "To pick another home or spot, close this one first."], { aim: "#wdetail", ok: "OK", alt: "Close it", onAlt: () => document.getElementById("lx").click(), ms: 9000, now: true }); return true; }
  // the first card: what am I looking at?
  new MutationObserver(() => { if (lcEl.hidden) return; setTimeout(() => {
      if (S.lstLL && !S.place) guide("card", "This is the home card", ["Tap <b>Walkability</b> or <b>Transit</b> to switch.", "Each place shows its walk and drive time.", "<b>Show on map</b> draws a line to each place."], { aim: "#wdetail" });
      else if (S.place) guide("spot", "Your address", ["Not a listing: it shows what’s near this address.", "<b>Show on map</b> draws a line to each place."], { aim: "#wdetail" });
    }, 700); }).observe(lcEl, { attributes: true, attributeFilter: ["hidden"] });
  // after Show on map, explain the map once, then supermarkets
  window.BCNearby._afterShow = () => { let n = 0; const w = () => { if (++n > 90) return; if (!lymEl.hidden || !gEl.hidden || document.querySelector(".guide:not([hidden])")) { setTimeout(w, 800); return; }   // wait: one message at a time
      guide("map2", "Everything on the map", ["Each line shows walk and drive time.", "Tap any icon to see its name.", "<b>Back to listing</b> brings the card back."]); }; setTimeout(w, 900); };
  // new: the pencil now says what it does, and points out "my lists" once
  setTimeout(() => guide("lists", "Lists", ["Draw an area to see only the homes inside it.", "Your saved and hidden homes are here too."], { aim: "#sbarDraw", ms: 10000 }), 25000);
  // live: tell the site we are ready, then load the first homes for this view
  try { const C0 = window.BCNearbyConfig || {}; if (typeof C0.onReady === "function") C0.onReady(window.BCNearby, map); } catch (e) { console.error(e); }
  setTimeout(() => S.notifyQuery(true), 50);
})();
