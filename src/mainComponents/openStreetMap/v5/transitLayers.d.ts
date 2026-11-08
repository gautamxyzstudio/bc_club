import type * as Leaflet from "leaflet";

export type TransitBusMode = "weekday" | "weekend" | "all_week";

export interface TransitCounts {
  /** SkyTrain stations in view (null when the layer is off or still loading) */
  sky: number | null;
  /** Stops in view with a bus every 15 min */
  bus15: number | null;
  /** Stops in view with a bus every 30 min or better */
  bus30: number | null;
}

export interface TransitState {
  sky: boolean;
  bus: boolean;
  mode: TransitBusMode;
  skyPick: 400 | 800 | 1200;
  walkPick: 200 | 400 | 600;
  levelPick: 15 | 30;
}

export interface TransitLayers {
  /** Loads the data now (it otherwise loads the first time a layer is turned on) */
  load(): Promise<void>;
  state: TransitState;
  getCounts(): TransitCounts;
  /** Calls fn now and after every redraw/move; returns an unsubscribe function */
  subscribe(fn: (counts: TransitCounts) => void): () => void;
  setSkyTrain(on: boolean): void;
  setBus(on: boolean): void;
  setBusMode(mode: TransitBusMode): void;
  setLevel(level: 15 | 30): void;
  setSkyDistance(metres: 400 | 800 | 1200): void;
  setBusDistance(metres: 200 | 400 | 600): void;
  flyToCity(name: string, zoom?: number): void;
  destroy(): void;
}

export const CITIES: Array<[string, [number, number]]>;

export function addTransitLayers(
  map: Leaflet.Map,
  options?: {
    dataUrl?: string;
    panel?: HTMLElement | null;
    after?: RegExp;
    cities?: boolean;
    L?: typeof Leaflet;
    avoid?: (() => HTMLElement | null) | null;
    onChange?: ((counts: TransitCounts) => void) | null;
  }
): TransitLayers;
