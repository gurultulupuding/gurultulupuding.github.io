import type { SynergyEffect } from "./synergy/SynergyEffect";

export interface PlacedBuildingScoreContribution {
  instanceId: string;

  basePopulation: number;
  baseAttraction: number;

  populationCapacity: number;
  wastedPopulation: number;

  synergyPopulationBonus: number;
  synergyAttractionBonus: number;

  finalPopulation: number;
  finalAttraction: number;

  synergyEffects: SynergyEffect[];
}