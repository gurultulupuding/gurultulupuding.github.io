import { PlacedBuildingRegistry } from "../../world/city/PlacedBuildingRegistry";
import type { PlacedBuildingInstance } from "../../world/city/PlacedBuildingInstance";
import { SynergyScoreCalculator } from "./synergy/SynergyScoreCalculator";
import type { PlacedBuildingScoreContribution } from "./PlacedBuildingScoreContribution";
import { PlacedBuildingScoreRegistry } from "./PlacedBuildingScoreRegistry";
import { ResidentialCapacityCalculator } from "./capacity/ResidentialCapacityCalculator";

export class PlacedBuildingScoreContributionFactory {
  private readonly synergyScoreCalculator: SynergyScoreCalculator;
  private readonly residentialCapacityCalculator: ResidentialCapacityCalculator;

  constructor(synergyScoreCalculator: SynergyScoreCalculator) {
    this.synergyScoreCalculator = synergyScoreCalculator;
    this.residentialCapacityCalculator =
      new ResidentialCapacityCalculator(2, 2);
  }

  public createForInstance(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry,
    scoreRegistry?: PlacedBuildingScoreRegistry,
    globalPopulationModifier: number = 0
  ): PlacedBuildingScoreContribution {
    const synergyScore =
      this.synergyScoreCalculator.calculateForInstance(instance, registry);

    const baseAttraction = instance.building.baseAttraction;
    const finalAttraction = baseAttraction + synergyScore.attractionBonus;

    if (instance.building.family === "residential") {
      const capacityBreakdown =
        this.residentialCapacityCalculator.calculateForPlacedInstance(
          instance,
          registry
        );

      return {
        instanceId: instance.id,

        basePopulation: 0,
        baseAttraction,

        populationCapacity: capacityBreakdown.effectiveCapacity,
        wastedPopulation: 0,

        synergyPopulationBonus: 0,
        synergyAttractionBonus: synergyScore.attractionBonus,

        finalPopulation: 0,
        finalAttraction,

        synergyEffects: synergyScore.effects,
      };
    }

    if (instance.building.family === "industry") {
      const basePopulationPotential = Math.max(
        0,
        instance.building.basePopulation
      );

      const synergyPopulationPotential = Math.max(
        0,
        synergyScore.populationBonus
      );

      const totalPopulationPotential =
        basePopulationPotential + synergyPopulationPotential;

      const availableCapacity =
        this.calculateAvailablePopulationCapacity(
          scoreRegistry,
          globalPopulationModifier
        );

      const realizedPopulation = Math.min(
        totalPopulationPotential,
        availableCapacity
      );

      const realizedBasePopulation = Math.min(
        basePopulationPotential,
        realizedPopulation
      );

      const realizedSynergyPopulation =
        realizedPopulation - realizedBasePopulation;

      const wastedPopulation =
        totalPopulationPotential - realizedPopulation;

      return {
        instanceId: instance.id,

        basePopulation: realizedBasePopulation,
        baseAttraction,

        populationCapacity: 0,
        wastedPopulation,

        synergyPopulationBonus: realizedSynergyPopulation,
        synergyAttractionBonus: synergyScore.attractionBonus,

        finalPopulation: realizedPopulation,
        finalAttraction,

        synergyEffects: synergyScore.effects,
      };
    }

    return {
      instanceId: instance.id,

      basePopulation: 0,
      baseAttraction,

      populationCapacity: 0,
      wastedPopulation: 0,

      synergyPopulationBonus: 0,
      synergyAttractionBonus: synergyScore.attractionBonus,

      finalPopulation: 0,
      finalAttraction,

      synergyEffects: synergyScore.effects,
    };
  }

  private calculateAvailablePopulationCapacity(
    scoreRegistry?: PlacedBuildingScoreRegistry,
    globalPopulationModifier: number = 0
  ): number {
    const contributions = scoreRegistry?.getAll() ?? [];

    const currentCapacity = contributions.reduce(
      (total, contribution) => total + contribution.populationCapacity,
      0
    );

    const currentBuildingPopulation = contributions.reduce(
      (total, contribution) => total + contribution.finalPopulation,
      0
    );

    const currentEffectivePopulation =
      currentBuildingPopulation + globalPopulationModifier;

    return Math.max(0, currentCapacity - currentEffectivePopulation);
  }
}