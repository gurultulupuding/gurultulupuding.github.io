import { GridModel } from "../../grid/GridModel";
import type { BuildingDefinition } from "../definitions/BuildingDefinition";
import {
  isFootprintEdgeAdjacentToOccupied,
  satisfiesRoadConnectionRule,
} from "./PlacementRules";

export interface GridPosition {
  row: number;
  col: number;
}

export interface PlacementValidationResult {
  isValid: boolean;
  isInsideGrid: boolean;
  hasOverlap: boolean;
  hasOnlyBuildableCells: boolean;
  hasAdjacency: boolean;
  satisfiesRoadConnection: boolean;
}

export function validateFootprintPlacement(
  grid: GridModel,
  cells: GridPosition[],
  building?: BuildingDefinition
): PlacementValidationResult {
  const isInsideGrid = cells.every((cell) => {
    return grid.isInside(cell.row, cell.col);
  });

  const hasOverlap = cells.some((cell) => {
    const gridCell = grid.getCell(cell.row, cell.col);
    return gridCell?.occupied ?? false;
  });

  const hasOnlyBuildableCells = cells.every((cell) => {
    const gridCell = grid.getCell(cell.row, cell.col);
    return gridCell?.buildable ?? false;
  });

  const hasAdjacency = isFootprintEdgeAdjacentToOccupied(grid, cells);

  const satisfiesRoadConnection = building
    ? satisfiesRoadConnectionRule(grid, cells, building)
    : true;

  const isValid =
    isInsideGrid &&
    !hasOverlap &&
    hasOnlyBuildableCells &&
    hasAdjacency &&
    satisfiesRoadConnection;

  return {
    isValid,
    isInsideGrid,
    hasOverlap,
    hasOnlyBuildableCells,
    hasAdjacency,
    satisfiesRoadConnection,
  };
}