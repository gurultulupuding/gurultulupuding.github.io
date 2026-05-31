import type { BuildingDefinition } from "../../world/buildings/definitions/BuildingDefinition";
import type { StructureFamily } from "./StructureFamily";

export interface PackDefinition {
  id: string;
  family: StructureFamily;
  title: string;
  description: string;

  contentDescription?: string;

  offeredBuildings?: BuildingDefinition[];
}