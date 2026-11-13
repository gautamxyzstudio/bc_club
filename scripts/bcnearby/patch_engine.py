"""Patch the Nov 13 AA demo engine so it runs on the live site with the site's own API.
Every change is an exact text replacement that must match once."""
import sys, re

src = open(sys.argv[1], encoding="utf-8").read()


def rep(old, new, count=1):
    global src
    n = src.count(old)
    if n != count:
        raise SystemExit(f"expected {count} match(es), found {n}:\n{old[:200]}")
    src = src.replace(old, new)


def rep_re(pat, new):
    global src
    m = list(re.finditer(pat, src, flags=re.S))
    if len(m) != 1:
        raise SystemExit(f"regex expected 1 match, found {len(m)}: {pat[:120]}")
    src = src[: m[0].start()] + new + src[m[0].end():]


# ---------------------------------------------------------------- D5: basemap
rep_re(r"  // ===== DEMO START \(D5\): offline map images \(basemap\).*?  // ===== DEMO END \(D5\) =====\n",
       "  // (D5 removed) basemap comes from BCNearbyConfig.basemap / bcnearby-basemap.js\n")
rep('const map = L.map("map", { zoomControl: false, minZoom: 10, maxZoom: 17 });',
    'const map = L.map("map", { zoomControl: false, minZoom: (window.BCNearbyConfig || {}).minZoom || 8, maxZoom: (window.BCNearbyConfig || {}).maxZoom || 20 });')
rep_re(r"  // DEMO \(D5\): the line below adds the offline basemap\. Live site: your tile layer instead\n  new Embedded\(\{[^\n]*\}\)\.addTo\(map\);\n",
       "  { const ATTR = 'Map data &copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors · Places: Gov. of BC open data';\n"
       "    if (typeof window.BCNearbyBasemap === \"function\") window.BCNearbyBasemap(map, ATTR);\n"
       "    else L.tileLayer(\"https://tile.openstreetmap.org/{z}/{x}/{y}.png\", { maxNativeZoom: 19, maxZoom: 20, attribution: ATTR }).addTo(map); }\n")

# ---------------------------------------------------------------- start view from config
rep("  const start = [49.2620, -123.0715];\n  map.setView(map.unproject(map.project(start, 15).add([innerWidth > 720 ? 182 : 0, innerWidth > 720 ? 0 : 140]), 15), 15, { animate: false });",
    "  const START = (window.BCNearbyConfig || {}).start, start = START ? [START.lat, START.lng] : [49.2620, -123.0715];\n"
    "  if (START) map.setView(start, START.zoom || 13, { animate: false });\n"
    "  else map.setView(map.unproject(map.project(start, 15).add([innerWidth > 720 ? 182 : 0, innerWidth > 720 ? 0 : 140]), 15), 15, { animate: false });")

# ---------------------------------------------------------------- sold / expired need sign-in (same rule as the old map)
rep("  function lstPick(b) { const gOf = () => { for (const k of S.lstShow) return LGRP(k); return \"sale\"; }, was = gOf();\n",
    "  function lstPick(b) { const gOf = () => { for (const k of S.lstShow) return LGRP(k); return \"sale\"; }, was = gOf();\n"
    "    { const C0 = window.BCNearbyConfig || {}, want = b.dataset.lgrp || LGRP(b.dataset.lonly || b.dataset.lst || \"active\");\n"
    "      if (want !== \"sale\" && want !== was && typeof C0.canSeeSold === \"function\" && !C0.canSeeSold()) {\n"
    "        if (typeof C0.onSignIn === \"function\") C0.onSignIn(); toast(want === \"exp\" ? \"Sign in free to see expired listings\" : \"Sign in free to see sold prices\"); return; } }\n")

# ---------------------------------------------------------------- setListings: keep unchanged tags, clusters, totals, open a searched listing
rep_re(r"  window\.BCNearby\.setListings = list => \{ lstLayer\.clearLayers\(\);.*?    if \(typeof fApply === \"function\"\) fApply\(\); \};\n",
r'''  // live: the site calls setListings(list, { clusters, total }); each home: { lat, lng, priceText, kind: active|drop|sold|fc|fcs|exp, status: "Active" (label), ... }
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
''')

# cluster bubble style is added in bcnearby-live.css

# ---------------------------------------------------------------- address search: the site's own listings first, then BC addresses
rep('''    sDD.innerHTML = (head ? `<div class="sdh">${head}</div>` : "") + list.map((r, i) => `<button type="button" class="sdi" role="option" data-i="${i}"><span class="sdp">${r.recent ? "&#8635;" : PIN_SVG}</span><span class="sdt"><b>${esc(r.main)}</b><small>${esc(r.sub || "")}</small></span></button>`).join("")''',
    '''    let lastG = null; sDD.innerHTML = (head ? `<div class="sdh">${head}</div>` : "") + list.map((r, i) => { const gh = r.grp && r.grp !== lastG ? `<div class="sdh sdg">${esc(r.grp)}</div>` : ""; lastG = r.grp || lastG;
      return gh + `<button type="button" class="sdi${r.kind ? " sd-" + r.kind : ""}" role="option" data-i="${i}"><span class="sdp">${r.recent ? "&#8635;" : r.tag ? `<em class="sdtag ${esc(r.tagCls || "")}">${esc(r.tag)}</em>` : PIN_SVG}</span><span class="sdt"><b>${esc(r.main)}</b><small>${esc(r.sub || "")}</small></span></button>`; }).join("")''')
rep('''      + `<div class="sdf">${foot || "Address search &middot; Gov. of BC"}</div>`;''',
    '''      + `<div class="sdf">${foot || (list.some(r => r.kind) ? "Listings: BC Real Estate Market &middot; Addresses: Gov. of BC" : "Address search &middot; Gov. of BC")}</div>`;''')
rep('''  sIn.addEventListener("input", () => { const q = sIn.value.trim(); sX.hidden = !sIn.value; clearTimeout(sTimer);
    if (q.length < 3) { if (!q && RECENT.length) sShow(recentList(), "Recent searches"); else sShow([]); return; }
    sTimer = setTimeout(async () => { const my = ++sSeq; sLastQ = q;
      try { const list = await bcGeo(q); if (my !== sSeq) return; sShow(list, list.length ? "" : `<span class="sdn">No match yet &middot; keep typing, or press Enter</span>`); }
      catch (e) { if (my !== sSeq) return; sShow([], `<span class="sdn">Press Enter to search</span>`); } }, 280); });''',
    '''  // fast search: saved hits (kept on this device for a day), instant matches from earlier hits while typing,
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
      bcGeo(q, ac.signal).then(l => { geo = l; geoOk = true; }).catch(() => { geo = []; }).then(show); }, 150); });''')
rep('''  async function bcGeo(q) {''', '''  async function bcGeo(q, signal) {''')
rep('''    const r = await fetch(u, CFG.geocoderKey ? { headers: { apikey: CFG.geocoderKey } } : {}); if (!r.ok) throw new Error("geo " + r.status); const j = await r.json();''',
    '''    const r = await fetch(u, Object.assign({ signal }, CFG.geocoderKey ? { headers: { apikey: CFG.geocoderKey } } : {})); if (!r.ok) throw new Error("geo " + r.status); const j = await r.json();''')
rep('''    let list = []; try { list = await bcGeo(q); } catch (err) {} if (!list.length) { try { list = await osmGeo(q); } catch (err) {} }''',
    '''    let list = await ownSearch(q); try { list = list.concat(await bcGeo(q)); } catch (err) {} if (!list.length) { try { list = await osmGeo(q); } catch (err) {} }''')
rep('''  function recentList() {''',
    '''  // the site's own search (BCNearbyConfig.searchListings(q, { signal }) -> [{ kind: "listing" | "lot", main, sub, lat, lon, tag, id }])
  async function ownSearch(q, signal) { const C0 = window.BCNearbyConfig || {}; if (typeof C0.searchListings !== "function") return [];
    try { const l = await C0.searchListings(q, { signal }); return (l || []).filter(r => r && r.main).map(r => ({ grp: r.kind === "lot" ? "Properties (not for sale)" : "Homes on the map", ...r, full: r.full || r.main + (r.sub ? ", " + r.sub : "") })); } catch (e) { return []; } }
  function recentList() {''')
rep('''  function pickResult(r) {
    if (!r) return;''',
    '''  function pickResult(r) {
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
      S.pendingOpen = { lat: r.lat, lon: r.lon, t: Date.now() }; S.notifyQuery(true); return; }''')

# ---------------------------------------------------------------- lot card: fill in the full assessment (history, land size) once it arrives
rep('''    placeMode({ label: d.address, sub: d.sub, exact: true, lot: d }); S.lstLL = [d.c[0], d.c[1]]; S.cardClosed = false; S.seenLine = ""; S.onListing = true; check(d.c[0], d.c[1]); S.onListing = false; setTimeout(() => S.peekHome && S.peekHome(), 160); }''',
    '''    placeMode({ label: d.address, sub: d.sub, exact: true, lot: d }); S.lstLL = [d.c[0], d.c[1]]; S.cardClosed = false; S.seenLine = ""; S.onListing = true; check(d.c[0], d.c[1]); S.onListing = false; setTimeout(() => S.peekHome && S.peekHome(), 160);
    if (typeof CFG.loadLotDetails === "function") { const tok = S.lotTok = Date.now(); Promise.resolve(CFG.loadLotDetails(d)).then(more => { if (!more || S.lotTok !== tok || !S.place || S.place.lot !== d) return;
        Object.assign(d, more); placeMode(S.place); if (S.tapped) check(...S.tapped); }).catch(() => {}); } }''')

# ---------------------------------------------------------------- unsave also tells the site
rep('''  S.toggleSave = (la, lo) => { const k = seenKey(la, lo); if (SAVED[k]) { delete SAVED[k]; toast("Removed from your saved homes"); }''',
    '''  S.toggleSave = (la, lo) => { const k = seenKey(la, lo); if (SAVED[k]) { delete SAVED[k]; toast("Removed from your saved homes"); if (typeof CFG.onUnsave === "function") CFG.onUnsave(la, lo); }''')
rep('''  S.isSaved = k => !!SAVED[k]; S.savedAll = () => SAVED;''',
    '''  S.isSaved = k => !!SAVED[k]; S.savedAll = () => SAVED;
  window.BCNearby.setSaved = pts => { for (const [la, lo] of pts || []) { const k = seenKey(+la, +lo); if (!SAVED[k]) SAVED[k] = Date.now(); } LS.set("bcNearby.saved.v1", SAVED); savedMark(); };''')

# ---------------------------------------------------------------- filters: server does the filtering when the site says so
rep('''  const RANGES = [   // [id, label, min key, max key, steps (first = no min, last = no max), label for a value]''',
    '''  const SRV = !!CFG.serverFilters, OH_ON = CFG.openHouses !== false;   // live: the API filters; open houses only when the data has them
  const RANGES = [   // [id, label, min key, max key, steps (first = no min, last = no max), label for a value]''')
rep('''    ["tax", "Property tax", "tmin", "tmax", [0, 1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 25000, 50000], v => "$" + v.toLocaleString() + "/yr"]];''',
    '''    ["tax", "Property tax", "tmin", "tmax", [0, 1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 25000, 50000], v => "$" + v.toLocaleString() + "/yr"]].filter(r => !(CFG.hideRanges || []).includes(r[0]));''')
rep('''  if (!Array.isArray(FL.types)) FL.types = []; if (!Array.isArray(FL.feats)) FL.feats = [];''',
    '''  if (!Array.isArray(FL.types)) FL.types = []; if (!Array.isArray(FL.feats)) FL.feats = [];
  if (CFG.openHouses === false) FL.oh = 0; for (const r0 of CFG.hideRanges || []) { const kk = { fee: ["fmin", "fmax"], ppsf: ["smin", "smax"], lot: ["lmin", "lmax"], area: ["amin", "amax"], tax: ["tmin", "tmax"] }[r0]; if (kk) { FL[kk[0]] = 0; FL[kk[1]] = 0; } }''')
rep('''  const fPass = k => { const i = fInfo(k), pr''',
    '''  const fPass = k => { if (SRV) return !(FL.oh && curGrp() === "sale") || !!ohNext(fInfo(k), FL.oh); const i = fInfo(k), pr''')
rep('''    const c = fCount(); fN.hidden = !c;''',
    '''    if (SRV && S.apiCount != null) { const allKinds = LST_KINDS.filter(([kk]) => GRP(kk) === curGrp()).every(([kk]) => S.lstShow.has(kk)); if (allKinds || S.apiClusters) n = Math.max(n, S.apiCount); }
    if (S.notifyQuery) S.notifyQuery();
    const c = fCount(); fN.hidden = !c;''')
rep('''      ${g !== "sale" ? "" : `<section id="f-oh">''', '''      ${g !== "sale" || !OH_ON ? "" : `<section id="f-oh">''')
rep('''${g !== "sale" ? "" : `<button type="button" data-fo="oh"''', '''${g !== "sale" || !OH_ON ? "" : `<button type="button" data-fo="oh"''')
rep('''    if (s.dataset.loc === "city") { FL.city = s.value; FL.hood = ""; const c = F_CITIES.find(x => x[0] === FL.city); if (c) map.setView([c[1], c[2]], 13); }''',
    '''    if (s.dataset.loc === "city") { FL.city = s.value; FL.hood = ""; const c = F_CITIES.find(x => x[0] === FL.city); if (c) map.setView([c[1], c[2]], 13);
      const city = FL.city; if (city && !HOODS[city] && typeof CFG.loadNeighbourhoods === "function") Promise.resolve(CFG.loadNeighbourhoods(city)).then(l => { if (!l || !l.length) return; HOODS[city] = l; if (!fSh.hidden && FL.city === city) keepScroll(fRender); }).catch(() => {}); }''')

# ---------------------------------------------------------------- listing card subtitle: no "sample" words on the live site
src = src.replace('''const LSM0 = document.querySelector("#lcard .lsm").innerHTML;''', '''const LSM0 = (window.BCNearbyConfig || {}).demo === false ? "" : document.querySelector("#lcard .lsm").innerHTML;''')



# ---------------------------------------------------------------- open houses: BC time, only upcoming dates, real "this weekend"
rep_re(r"  function ohNext\(info, mode\) \{.*?return list\.find\(o => !o\.date \|\| \(o\.date >= first && o\.date <= last\)\) \|\| null; \}\n",
r"""  // dates are in BC time (America/Vancouver), whatever the visitor's own time zone is
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
""")

# ---------------------------------------------------------------- inside the site's frame: links go to the real page, not the frame
rep('const url = location.href.split("#")[0] + "#home=" + lat.toFixed(5) + "," + lon.toFixed(5);',
    'const url = typeof CFG.shareUrl === "function" ? CFG.shareUrl(lat, lon) : location.href.split("#")[0] + "#home=" + lat.toFixed(5) + "," + lon.toFixed(5);')
rep('if (u) location.href = u + (u.includes("?")', 'if (u) (window.top || window).location.href = u + (u.includes("?")')


# ---------------------------------------------------------------- inside a frame: never scroll the site page (that pushed the map's top row under the site header)
rep('el.scrollIntoView({ block: "start" })', '(() => { const bd = fSh.querySelector(".fbody"); if (bd) bd.scrollTop += el.getBoundingClientRect().top - bd.getBoundingClientRect().top; })()')
src = src.replace(".focus()", ".focus({ preventScroll: true })")


# ---------------------------------------------------------------- no floating "N hidden · Show" button: hidden homes are under Lists -> Hidden homes
rep('hidChip.hidden = !n; hidChip.innerHTML', 'hidChip.hidden = true; hidChip.innerHTML')

# ---------------------------------------------------------------- ready: hand the API to the site, ask for the first homes
src = src.rstrip()
assert src.endswith("})();"), src[-50:]
src = src[:-5] + '''  // live: tell the site we are ready, then load the first homes for this view
  try { const C0 = window.BCNearbyConfig || {}; if (typeof C0.onReady === "function") C0.onReady(window.BCNearby, map); } catch (e) { console.error(e); }
  setTimeout(() => S.notifyQuery(true), 50);
})();
'''

open(sys.argv[2], "w", encoding="utf-8").write(src)
print("patched OK", len(src))
