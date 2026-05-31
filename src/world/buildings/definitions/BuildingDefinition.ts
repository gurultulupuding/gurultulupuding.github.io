import type { BuildingFootprint } from "../footprint/Footprint";
import type { StructureFamily } from "../../../game/packs/StructureFamily";

export type BuildingTag =
  | "housing"
  | "road"
  | "infrastructure"
  | "civic"
  | "mobility"
  | "public-space"
  | "green"
  | "service"
  | "administration"
  | "industry"
  | "production"
  | "pollution"
  | "culture"
  | "landmark"
  | "education"
  | "commerce";

export interface BuildingDefinition {
  id: string;
  name: string;
  family: StructureFamily;
  footprint: BuildingFootprint;

  basePopulation: number;
  baseAttraction: number;

  tags: BuildingTag[];

  description?: string;
}