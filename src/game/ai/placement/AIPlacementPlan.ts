import type { BuildingDefinition } from "../../../world/buildings/definitions/BuildingDefinition";
import type { FootprintRotation } from "../../../world/buildings/footprint/FootprintRotation";

export interface AIPlacementPlan {
  building: BuildingDefinition;
  row: number;
  col: number;
  rotation: FootprintRotation;
  cells: { row: number; col: number }[];
}