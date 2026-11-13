// Copies the map libraries the BC Nearby frame needs from node_modules into public/bcnearby/vendor.
// Run after upgrading leaflet / maplibre-gl:  node scripts/copy-bcnearby-vendor.mjs
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const out = "public/bcnearby/vendor";
mkdirSync(join(out, "images"), { recursive: true });
const files = [
  ["node_modules/leaflet/dist/leaflet.js", "leaflet.js"],
  ["node_modules/leaflet/dist/leaflet.css", "leaflet.css"],
  ["node_modules/maplibre-gl/dist/maplibre-gl.mjs", "maplibre-gl.mjs"],
  ["node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "maplibre-gl-worker.mjs"],
  ["node_modules/maplibre-gl/dist/maplibre-gl.css", "maplibre-gl.css"],
  ["node_modules/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js", "leaflet-maplibre-gl.js"],
];
for (const [from, to] of files) copyFileSync(from, join(out, to));
for (const f of readdirSync("node_modules/leaflet/dist/images")) copyFileSync(join("node_modules/leaflet/dist/images", f), join(out, "images", f));
console.log("BC Nearby vendor files copied to", out);
