import type { BuildingFootprint } from "./Footprint";

export const FOOTPRINT_LIBRARY = {
  single1x1: {
    id: "single-1x1",
    cells: [{ rowOffset: 0, colOffset: 0 }],
  },

  line1x2: {
    id: "line-1x2",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
    ],
  },

  line1x3: {
    id: "line-1x3",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 0, colOffset: 2 },
    ],
  },

  square2x2: {
    id: "square-2x2",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 1, colOffset: 0 },
      { rowOffset: 1, colOffset: 1 },
    ],
  },

  lShape: {
    id: "l-shape",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 1, colOffset: 0 },
      { rowOffset: 2, colOffset: 0 },
      { rowOffset: 2, colOffset: 1 },
    ],
  },

  smallLShape: {
    id: "small-l-shape",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 1, colOffset: 1 },
    ],
  },

  zShape: {
    id: "z-shape",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 1, colOffset: 1 },
      { rowOffset: 1, colOffset: 2 },
    ],
  },

  tShape: {
    id: "t-shape",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 0, colOffset: 2 },
      { rowOffset: 1, colOffset: 1 },
    ],
  },

  uShape: {
    id: "u-shape",
    cells: [
      { rowOffset: 0, colOffset: 0 },
      { rowOffset: 0, colOffset: 2 },
      { rowOffset: 1, colOffset: 0 },
      { rowOffset: 1, colOffset: 1 },
      { rowOffset: 1, colOffset: 2 },
    ],
  },
} as const satisfies Record<string, BuildingFootprint>;