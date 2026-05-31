import type { BuildingFootprint } from "./Footprint";

export interface GridPosition {
  row: number;
  col: number;
}

export function getFootprintCellsAt(
  footprint: BuildingFootprint,
  anchorRow: number,
  anchorCol: number
): GridPosition[] {
  return footprint.cells.map((cell) => ({
    row: anchorRow + cell.rowOffset,
    col: anchorCol + cell.colOffset,
  }));
}