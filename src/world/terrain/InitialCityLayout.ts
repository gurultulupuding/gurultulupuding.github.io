import { GridModel } from "../grid/GridModel";

export type InitialCitySide = "player" | "ai";

export type InitialTownHallCell = {
  row: number;
  col: number;
};

export function getInitialTownHallCells(
  grid: GridModel,
  side: InitialCitySide = "player"
): InitialTownHallCell[] {
  const centerRow = Math.floor(grid.rows / 2) - 1;
  const startCol = side === "player" ? 6 : 14;

  return [
    { row: centerRow, col: startCol },
    { row: centerRow, col: startCol + 1 },
    { row: centerRow + 1, col: startCol },
    { row: centerRow + 1, col: startCol + 1 },
  ];
}

export function applyInitialCityLayout(
  grid: GridModel,
  side: InitialCitySide = "player"
): void {
  const initialTownHallCells = getInitialTownHallCells(grid, side);

  for (const cell of initialTownHallCells) {
    grid.setOccupied(cell.row, cell.col, true, {
      family: "monument",
      tags: ["monument"],
    });
  }
}