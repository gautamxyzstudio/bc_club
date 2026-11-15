/**
 * Server only: "what's near this home" (schools, SkyTrain, bus, flood) worked out on the server,
 * with the same data and rules as the map and the listing page (public/bcnearby/bcnearby-data.js + bcnearby-calc.js).
 * Loaded once per server process (about 4 MB of data, under a second), then every call is instant.
 * Used for the listing page questions (FAQ) so Google sees them in the first HTML.
 */
import { readFile } from "fs/promises";
import path from "path";
import vm from "vm";

type Calc = { nearbyFor: (lat: number, lng: number) => any };
let calcPromise: Promise<Calc | null> | null = null;

function loadCalc(): Promise<Calc | null> {
  if (!calcPromise) {
    calcPromise = (async () => {
      const dir = path.join(process.cwd(), "public", "bcnearby");
      const [data, calc] = await Promise.all([
        readFile(path.join(dir, "bcnearby-data.js"), "utf8"),
        readFile(path.join(dir, "bcnearby-calc.js"), "utf8"),
      ]);
      // both files are classic browser scripts that share top-level consts, so run them as one script
      const ctx: any = { window: {} };
      ctx.self = ctx.window;
      vm.createContext(ctx);
      vm.runInContext(`${data}\n;${calc}`, ctx, { timeout: 10000 });
      return (ctx.window.BCNearbyCalc as Calc) || null;
    })().catch((e) => {
      console.warn("[listing seo] nearby data could not load:", e?.message);
      calcPromise = null; // try again on the next request
      return null;
    });
  }
  return calcPromise;
}

export async function nearbyOnServer(lat?: number, lng?: number) {
  if (!lat || !lng) return undefined;
  try {
    const calc = await loadCalc();
    return calc?.nearbyFor(lat, lng) || undefined;
  } catch {
    return undefined;
  }
}
