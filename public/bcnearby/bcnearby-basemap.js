/* BC Nearby · basemap. Uses the same MapLibre vector style as the rest of bcrealestatemarket.com
   (BCNearbyConfig.basemap.style), and falls back to raster tiles if WebGL or the style can't load. */
(function () {
  function loadScript(src) {
    return new Promise(function (ok, bad) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  }
  window.BCNearbyBasemap = function (map, attr) {
    var C = window.BCNearbyConfig || {}, bm = C.basemap || {}, done = false, base = bm.vendor || "./vendor/";
    function raster() {
      if (done) return; done = true;
      L.tileLayer(bm.rasterUrl || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxNativeZoom: bm.rasterMaxNativeZoom || 19, maxZoom: 20, attribution: attr }).addTo(map);
    }
    if (!bm.style) { raster(); return; }
    var t = setTimeout(raster, 9000);
    import(new URL(base + "maplibre-gl.mjs", location.href).href).then(function (mod) {
      var ml = mod.default || mod; window.maplibregl = ml;
      if (ml.setWorkerUrl) ml.setWorkerUrl(new URL(base + "maplibre-gl-worker.mjs", location.href).href);
      return loadScript(base + "leaflet-maplibre-gl.js");
    }).then(function () {
      if (done) return; clearTimeout(t); done = true;
      var layer = L.maplibreGL({ style: bm.style, attribution: attr, maxZoom: 21, minZoom: 6 });
      layer.addTo(map);
      var gl = layer.getMaplibreMap && layer.getMaplibreMap();
      if (gl && gl.on) gl.on("error", function (e) { if (e && e.error && /style|webgl/i.test(String(e.error.message || ""))) { map.removeLayer(layer); done = false; raster(); } });
    }).catch(function (e) { console.warn("[BCNearby] vector basemap unavailable, using raster tiles", e); clearTimeout(t); raster(); });
  };
})();
