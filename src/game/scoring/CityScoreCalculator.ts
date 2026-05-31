import { PlacedBuildingRegistry } from "../../world/city/PlacedBuildingRegistry";
import { PlacedBuildingScoreRegistry } from "./PlacedBuildingScoreRegistry";
import type { CityScore, FamilyCounts } from "./CityScore";

export class CityScoreCalculator {
  public calculate(
    buildingRegistry: PlacedBuildingRegistry,
    scoreRegistry: PlacedBuildingScoreRegistry,
    globalPopulationModifier: number = 0
  ): CityScore {
    const instances = buildingRegistry.getAll();
    const contributions = scoreRegistry.getAll();

    const familyCounts: FamilyCounts = {
      residential: 0,
      industry: 0,
      infrastructure: 0,
      civic: 0,
      culture: 0,
    };

    for (const instance of instances) {
      familyCounts[instance.building.family]++;
    }

    const basePopulation = contributions.reduce(
      (total, contribution) => total + contribution.basePopulation,
      0
    );

    const baseAttraction = contributions.reduce(
      (total, contribution) => total + contribution.baseAttraction,
      0
    );

    const populationCapacity = contributions.reduce(
      (total, contribution) => total + contribution.populationCapacity,
      0
    );

    const rawPopulation = contributions.reduce(
      (total, contribution) => total + contribution.finalPopulation,
      0
    );

    const finalPopulation = Math.max(
      0,
      rawPopulation + globalPopulationModifier
    );

    const availablePopulationCapacity = Math.max(
      0,
      populationCapacity - finalPopulation
    );

    const wastedPopulation = contributions.reduce(
      (total, contribution) => total + contribution.wastedPopulation,
      0
    );

    const synergyPopulationBonus = contributions.reduce(
      (total, contribution) => total + contribution.synergyPopulationBonus,
      0
    );

    const synergyAttractionBonus = contributions.reduce(
      (total, contribution) => total + contribution.synergyAttractionBonus,
      0
    );

    const finalAttraction = contributions.reduce(
      (total, contribution) => total + contribution.finalAttraction,
      0
    );

    const synergyEffects = contributions.flatMap(
      (contribution) => contribution.synergyEffects
    );

    return {
      basePopulation,
      baseAttraction,

      populationCapacity,
      availablePopulationCapacity,
      wastedPopulation,

      synergyPopulationBonus,
      synergyAttractionBonus,
      synergyEffects,

      globalPopulationModifier,

      finalPopulation,
      finalAttraction,

      buildingCount: instances.length,
      familyCounts,
    };
  }
}