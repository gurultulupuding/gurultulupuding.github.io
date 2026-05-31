import type { StructureFamily } from "../packs/StructureFamily";
import type { SynergyEffect } from "./synergy/SynergyEffect";

export type FamilyCounts = Record<StructureFamily, number>;

export interface BaseCityScore {
  basePopulation: number;
  baseAttraction: number;
  buildingCount: number;
  familyCounts: FamilyCounts;
}

export interface CityScore {
  basePopulation: number;
  baseAttraction: number;

  populationCapacity: number;
  availablePopulationCapacity: number;
  wastedPopulation: number;

  synergyPopulationBonus: number;
  synergyAttractionBonus: number;
  synergyEffects: SynergyEffect[];

  globalPopulationModifier: number;

  finalPopulation: number;
  finalAttraction: number;

  buildingCount: number;
  familyCounts: FamilyCounts;
}