import { GridModel } from "../../grid/GridModel";
import type { BuildingDefinition } from "../definitions/BuildingDefinition";

export interface GridPosition {
  row: number;
  col: number;
}

export function isFootprintEdgeAdjacentToOccupied(
  grid: GridModel,
  cells: GridPosition[]
): boolean {
  for (const cell of cells) {
    const neighbors = getOrthogonalNeighbors(cell.row, cell.col);

    for (const neighbor of neighbors) {
      const neighborCell = grid.getCell(neighbor.row, neighbor.col);

      if (!neighborCell) {
        continue;
      }

      if (neighborCell.occupied) {
        return true;
      }
    }
  }

  return false;
}

export function satisfiesRoadConnectionRule(
  grid: GridModel,
  cells: GridPosition[],
  building: BuildingDefinition
): boolean {
  if (!isRoadLikeBuilding(building)) {
    return true;
  }

  for (const cell of cells) {
    const neighbors = getOrthogonalNeighbors(cell.row, cell.col);

    for (const neighbor of neighbors) {
      const neighborCell = grid.getCell(neighbor.row, neighbor.col);

      if (!neighborCell?.occupied || !neighborCell.occupant) {
        continue;
      }

      if (isValidRoadAnchor(neighborCell.occupant)) {
        return true;
      }
    }
  }

  return false;
}

function isRoadLikeBuilding(building: BuildingDefinition): boolean {
  return (
    building.family === "infrastructure" &&
    (
      building.tags.includes("road") ||
      building.tags.includes("mobility")
    )
  );
}

function isValidRoadAnchor(occupant: {
  family: string;
  tags: string[];
}): boolean {
  return (
    occupant.family === "monument" ||
    occupant.tags.includes("monument") ||

    occupant.family === "civic" ||
    occupant.tags.includes("civic") ||
    occupant.tags.includes("service") ||

    occupant.tags.includes("road") ||
    occupant.tags.includes("mobility")
  );
}

function getOrthogonalNeighbors(row: number, col: number): GridPosition[] {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];
}