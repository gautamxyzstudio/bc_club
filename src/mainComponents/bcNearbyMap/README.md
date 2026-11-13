# Map search (Commute & Nearby, Nov 13 AA) on our API

`/map-search` now shows the designer's Commute & Nearby map (package `commute-dev-package-Nov13AA`),
fed by our Strapi API instead of sample homes. The old map (`openStreetMap/v5`) is untouched; to switch back,
change the import in `src/app/map-search/page.tsx` back to `OpenStreetMapV5Wrapper`.

## How it fits together

| Piece | What it is |
|---|---|
| `public/bcnearby/index.html` | The map page. Runs in a same-origin iframe, so its CSS/JS can't affect the site (checklist "way A"). Opened on its own it runs the original demo. |
| `public/bcnearby/bcnearby.js` | The designer's engine (PART 4-19) with small patches for live data (see `scripts/bcnearby/patch_engine.py`). |
| `public/bcnearby/bcnearby-data.js` | SkyTrain, buses, places, schools, flood (from the demo's D4 block, offline tiles removed). |
| `public/bcnearby/bcnearby-basemap.js` | Same MapLibre "positron" basemap as the rest of the site; falls back to OSM raster tiles. |
| `public/bcnearby/vendor/` | Leaflet + MapLibre copied from `node_modules` (`node scripts/copy-bcnearby-vendor.mjs`). |
| `BCNearbyMap.tsx` | Sets `window.BCNearbyConfig` (theme + hooks) and renders the iframe under the site header. |
| `bcNearbyApi.ts` | Turns map views/filters into API calls and API answers into map data. |

## What uses which endpoint

| Map feature | Endpoint |
|---|---|
| Price tags + cluster bubbles (for sale, price drops) | `GET /real-estate-board/map-zoom-clusters` |
| Sold / Expired (sign-in required, as before) | same, `status=closed` / `status=expired` |
| Foreclosures / foreclosures sold | `GET /forecloser-properties/map-zoom-with-clusters` (`status=Active` / `Closed`) |
| Filters (price, beds+, baths+, type, living area, lot, tax, features, city, neighbourhood) | query params on the two calls above (`minBeds` / `minBaths` are new) |
| Neighbourhood list in Filters | `GET /real-estate-board/neighborhoods?city=` |
| Search box: homes | `POST /real-estate-board/search-by-address` (now also returns lat/lng/price/status) |
| Search box: properties not for sale | `GET /property-assignment-lists?address=` then `/property-assignment-lists/:id` |
| Lot card (zoom 16+): value, PID, plan, outline | `GET /property-assignment-lists/map-zoom` + `GET /parcels/findGeoJSON` |
| Lot card: history + official land size | `GET /property-assignment-lists/:id` |
| Lot lines switch | the same parcels GeoJSON, as a Leaflet layer |
| Heart / Save | `add-favorite` / `remove-favorite` (signed in; else the site's login opens) |
| "Own this home? Get a free home value report" | `POST /home-evaluation-requests` |
| Tap the card photo | `/property-info/:id`, `/sold-property-info/:id`, `/forecloser-property-info/:id` |
| "What's my home worth?" | `/home-estimation?address=` |

Not on the API yet, so hidden in Filters: strata fee, price per sq ft, open houses.
To turn one on later, add it to the API, map it in `toApiParams`, and remove it from `hideRanges` / `openHouses: false` in `BCNearbyMap.tsx`.

## Page address options

`/map-search?lat=49.26&lng=-123.12&zoom=16` or `/map-search?city=Surrey` opens there.
Without them the map starts in Vancouver and moves to the visitor's location if they allow it.
Shared links: `/map-search#home=lat,lng` opens that home.

## When the designer sends a new version

    python scripts/bcnearby/build_from_demo.py path/to/commute-final.html

It rebuilds `public/bcnearby` (styles, data, engine, page) and re-applies our patches. If a patch rule no longer matches,
it stops and prints the line it was looking for: update that rule in `patch_engine.py`. Bump `VER` in
`build_from_demo.py` so browsers fetch the new files. `bcnearby-live.css` and `bcnearby-basemap.js` are ours and are not overwritten.

## Hosting notes

- If the server (nginx) sends `X-Frame-Options`, it must be `SAMEORIGIN`, not `DENY`, or the map frame stays blank.
- `next.config.ts` caches `public/bcnearby/vendor/*` and `bcnearby-data.js` for 7 days. The data file is ~4.3 MB raw, about 1 MB gzipped.
