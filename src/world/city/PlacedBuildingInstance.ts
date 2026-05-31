import type { BuildingDefinition } from "../buildings/definitions/BuildingDefinition";
import type { FootprintRotation } from "../buildings/footprint/FootprintRotation";
import type { CityOwner } from "./CityOwner";

export interface GridPosition {
  row: number;
  col: number;
}

export interface PlacedBuildingInstance {
  id: string;
  owner: CityOwner;
  building: BuildingDefinition;
  anchor: GridPosition;
  rotation: FootprintRotation;
  cells: GridPosition[];
  placedTurn: number;
}