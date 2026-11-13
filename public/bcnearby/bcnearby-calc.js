/* BC Nearby · "what's near this home" without a map (listing details page).
   Same data and the same rules as the map (bcnearby.js PART 8): load bcnearby-data.js first, then
   BCNearbyCalc.nearbyFor(lat, lng) -> { walk, transit, sky, bus, grocery, park, health, flood, schools }.
   (c) BC Real Estate Market. */
(function () {
  "use strict";
  // bcnearby-data.js declares these as top-level consts (shared by every classic script on the page)
  /* global DATA, AMEN, SCHOOLS, FLOOD */
  var D = typeof DATA !== "undefined" ? DATA : null, A = typeof AMEN !== "undefined" ? AMEN : null, SC = typeof SCHOOLS !== "undefined" ? SCHOOLS : null, FL = typeof FLOOD !== "undefined" ? FLOOD : null;
  if (!D || !A || !SC) { console.warn("[BCNearbyCalc] bcnearby-data.js is not loaded"); return; }

  var WALK_M = 80;
  var walkMin = function (m) { return Math.max(2, Math.ceil(m * 1.3 / WALK_M) + 1); };
  var driveMin = function (m) { return m <= 20000 ? Math.max(2, Math.round(m * 1.35 / 550) + 2) : Math.round(20000 * 1.35 / 550 + 2 + (m - 20000) * 1.25 / 1333); };
  var decode = function (str) { var pts = [], i = 0, la = 0, lo = 0; while (i < str.length) { for (var k = 0; k < 2; k++) { var r = 0, sh = 0, b;
      do { b = str.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); var d = r & 1 ? ~(r >> 1) : r >> 1; if (k) lo += d; else la += d; } pts.push([la / 1e5, lo / 1e5]); } return pts; };
  var inRing = function (y, x, R) { var c = false; for (var i = 0, j = R.length - 1; i < R.length; j = i++) { var yi = R[i][0], xi = R[i][1], yj = R[j][0], xj = R[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  var bbox = function (rr) { var s = 90, n = -90, w = 180, e = -180; rr.forEach(function (R) { R.forEach(function (p) { if (p[0] < s) s = p[0]; if (p[0] > n) n = p[0]; if (p[1] < w) w = p[1]; if (p[1] > e) e = p[1]; }); }); return { s: s, n: n, w: w, e: e }; };

  var stations = D.stations.features.map(function (f) { return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], name: f.properties.station, label: f.properties.label, lines: f.properties.lines }; });
  var stops = D.stops.features.map(function (f) { var p = f.properties; return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], label: p.label, weekday: p.weekday,
    routes: String(p.routes || "").split(";").filter(Boolean).map(function (x) { var a = x.split("|"); return { r: a[0], w: +a[1] || 0 }; }) }; });
  var places = (A.pts || []).map(function (r) { return { cat: r[0], sub: r[1], name: r[2], lat: r[3], lon: r[4], addr: r[5], note: r[6] }; });
  var schoolList = (SC.schools || []).map(function (r) { return { lvl: r[0], name: r[1], lat: r[2], lon: r[3], rating: r[4], rank: r[5], of: r[6], stype: r[7], city: r[8], year: r[9] }; });
  var catchments = null, parks = null, floods = null;
  var getCatch = function () { return catchments || (catchments = (SC.catch || []).map(function (c) { var rr = c[3].map(decode), b = bbox(rr); return { lv: c[0], prog: c[1], ids: c[2], rr: rr, s: b.s, n: b.n, w: b.w, e: b.e }; })); };
  var getParks = function () { return parks || (parks = (A.parks || []).map(function (p) { var rr = p[4].map(decode), b = bbox(rr); return { name: p[0], lat: p[1], lon: p[2], ha: p[3], rr: rr, s: b.s, n: b.n, w: b.w, e: b.e }; })); };
  var getFlood = function () { return floods || (floods = ((FL && FL.z) || []).map(function (z) { var rr = z[4].map(decode), b = bbox(rr); return { hz: z[0], rr: rr, s: b.s, n: b.n, w: b.w, e: b.e }; })); };
  var HZ = { fp: "Mapped floodplain (200-year)", f20: "Frequent flood area (20-year)", cst: "Coastal flood / sea-level-rise area", tsu: "Tsunami planning zone", deb: "Debris-flow / alluvial-fan area", drn: "Drainage / overland flood area" };

  function nearbyFor(lat, lon) {
    var kx = 111320 * Math.cos(lat * Math.PI / 180), dd = function (y, x) { return Math.hypot((x - lon) * kx, (y - lat) * 110540); };
    var nearest = function (list, test) { var best = null; for (var i = 0; i < list.length; i++) { var p = list[i]; if (test && !test(p)) continue; var d = dd(p.lat, p.lon); if (!best || d < best.d) best = { p: p, d: d }; } return best; };
    var nearestPark = function (minHa) { var cand = getParks().filter(function (pk) { return pk.ha >= minHa; }).map(function (pk) { return [pk, dd(pk.lat, pk.lon)]; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, 12), best = null;
      cand.forEach(function (c) { var pk = c[0], d = Infinity; if (pk.rr.some(function (R) { return inRing(lat, lon, R); })) d = 0; else pk.rr.forEach(function (R) { R.forEach(function (q) { var x = dd(q[0], q[1]); if (x < d) d = x; }); });
        if (!best || d < best.d) best = { p: pk, d: d }; }); return best; };
    var time = function (d) { return d <= 1600 ? { walk: walkMin(d) } : { drive: driveMin(d) }; };

    // scores: same weights and fading as the map (full points within 400 m, none at 2 km)
    var fade = function (d) { return d == null ? 0 : d <= 400 ? 1 : d >= 2000 ? 0 : 1 - (d - 400) / 1600; };
    var nd = function (cat) { if (cat === "park") { var pk = nearestPark(1); return pk ? pk.d : null; } var n = nearest(places, function (p) { return p.cat === cat; }); return n ? n.d : null; };
    var groc1k = 0; places.forEach(function (p) { if (p.cat === "grocery" && Math.abs(p.lat - lat) < .012 && Math.abs(p.lon - lon) < .018 && dd(p.lat, p.lon) <= 1000) groc1k++; });
    var st = nearest(stations), routes = {}, busBest = null;
    stops.forEach(function (s) { if (!(s.weekday > 0) || Math.abs(s.lat - lat) > .012 || Math.abs(s.lon - lon) > .018) return; var d = dd(s.lat, s.lon); if (d > 1200) return;
      if (!busBest || d < busBest.d) busBest = { p: s, d: d };
      s.routes.forEach(function (r) { if (!r.w || r.w > 30) return; var c = routes[r.r]; if (!c || d < c.d) routes[r.r] = { d: d, f: r.w }; }); });
    var parts = { grocery: fade(nd("grocery")), choice: Math.min(groc1k, 4) / 4, park: fade(nd("park")), transit: fade(Math.min(st ? st.d : 1e9, busBest ? busBest.d : 1e9)),
      health: fade(nd("health")), rec: fade(nd("rec")), worship: fade(nd("worship")), outdoors: Math.max(fade(nd("beach")), fade(nd("dog_park"))) };
    var W = { grocery: 25, choice: 15, park: 15, transit: 15, health: 10, rec: 10, worship: 5, outdoors: 5 }, walk = 0; for (var k in W) walk += W[k] * parts[k];
    var v = 0; for (var r in routes) { var o = routes[r]; v += (60 / o.f) * (o.d <= 400 ? 1 : Math.max(0, 1 - (o.d - 400) / 800)); }
    if (st) v += 30 * (st.d <= 500 ? 1 : Math.max(0, 1 - (st.d - 500) / 1000));
    var out = { walk: Math.round(walk), transit: Math.round(100 * (1 - Math.exp(-v / 22))) };

    // the closest of each (no distance limit, like the map: far ones show a drive time)
    if (st && st.d <= 60000) out.sky = Object.assign({ name: st.p.label || st.p.name }, time(st.d));
    var bus = nearest(stops, function (s) { return s.weekday > 0; });
    if (bus) { var best = bus.p.routes.filter(function (x) { return x.w; }).sort(function (a, b) { return a.w - b.w; })[0];
      out.bus = Object.assign({ name: (best ? (/^\d/.test(best.r) ? "Bus " : "") + best.r + " · every " + best.w + " min" : bus.p.label) }, time(bus.d)); }
    var gro = nearest(places, function (p) { return p.cat === "grocery" && p.sub === "supermarket"; }) || nearest(places, function (p) { return p.cat === "grocery"; });
    if (gro) out.grocery = Object.assign({ name: gro.p.name }, time(gro.d));
    var pk = nearestPark(1); if (pk) out.park = Object.assign({ name: pk.p.name }, time(pk.d));
    var er = nearest(places, function (p) { return p.cat === "health" && p.sub === "hospital"; }), hc = nearest(places, function (p) { return p.cat === "health"; });
    var h = hc && er && hc.d < er.d * .6 ? hc : er || hc;
    if (h) out.health = { name: h.p.name + (h.p.note ? " (" + h.p.note.replace("Emergency 24/7", "ER 24/7") + ")" : ""), drive: driveMin(h.d) };
    var fl = getFlood().filter(function (z) { return lat >= z.s && lat <= z.n && lon >= z.w && lon <= z.e && z.rr.some(function (R) { return inRing(lat, lon, R); }); });
    out.flood = fl.length > 0; if (fl.length) out.floodTypes = fl.map(function (z) { return HZ[z.hz] || z.hz; }).filter(function (x, i, a) { return a.indexOf(x) === i; });

    // schools: catchment school when we know it, otherwise the closest public school (then "closest")
    var catchSchool = function (lv) { var hits = getCatch().filter(function (c) { return c.lv === lv && lat >= c.s && lat <= c.n && lon >= c.w && lon <= c.e && c.rr.some(function (R) { return inRing(lat, lon, R); }); })
        .sort(function (a, b) { return (a.prog === "Regular" ? 0 : 1) - (b.prog === "Regular" ? 0 : 1); });
      for (var i = 0; i < hits.length; i++) { var ss = hits[i].ids.map(function (j) { return schoolList[j]; }).filter(Boolean).sort(function (a, b) { return dd(a.lat, a.lon) - dd(b.lat, b.lon); }); if (ss.length) return { p: ss[0], shared: ss.length }; } return null; };
    var school = function (lv) { var c = catchSchool(lv), p, inCatch = !!c; if (c) p = c.p; else { var n = nearest(schoolList, function (s) { return s.lvl === lv && s.stype !== "Independent"; }); p = n && n.p; }
      if (!p) return null; var d = dd(p.lat, p.lon); return Object.assign({ name: p.name, rating: p.rating == null ? null : +(+p.rating).toFixed(1), grades: lv === "E" ? "K–7" : "8–12", inCatch: inCatch, shared: c ? c.shared > 1 : false }, time(d)); };
    var elem = school("E"), sec = school("S");
    var taken = [elem && elem.name, sec && sec.name];
    var others = schoolList.map(function (s) { return { s: s, d: dd(s.lat, s.lon) }; }).filter(function (x) { return x.d <= 2500 && taken.indexOf(x.s.name) < 0; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 5)
      .map(function (x) { return { name: x.s.name, type: x.s.stype === "Independent" ? "Independent" : "Public", rating: x.s.rating == null ? null : +(+x.s.rating).toFixed(1), km: +(x.d / 1000).toFixed(1) }; });
    if (elem || sec) out.schools = { elem: elem, sec: sec, others: others };
    return out;
  }

  window.BCNearbyCalc = { nearbyFor: nearbyFor, walkMin: walkMin, driveMin: driveMin };
})();
