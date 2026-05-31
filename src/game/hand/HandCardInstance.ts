import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";

export interface HandCardInstance {
  id: string;
  building: BuildingDefinition;
}