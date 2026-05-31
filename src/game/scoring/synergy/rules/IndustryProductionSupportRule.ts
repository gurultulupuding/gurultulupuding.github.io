import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

type IndustrySupportType = "strong" | "weak";

export class IndustryProductionSupportRule implements SynergyRule {
  public readonly id = "industry-production-support";

  private readonly strongPopulationBonusBySourceIndex: number[];
  private readonly weakPopulationBonusBySourceIndex: number[];

  constructor(
    strongPopulationBonusBySourceIndex: number[] = [2, 1],
    weakPopulationBonusBySourceIndex: number[] = [1]
  ) {
    this.strongPopulationBonusBySourceIndex =
      strongPopulationBonusBySourceIndex;
    this.weakPopulationBonusBySourceIndex =
      weakPopulationBonusBySourceIndex;
  }

  public evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[] {
    if (instance.building.family !== "industry") {
      return [];
    }

    const supportSources = registry
      .getNeighborsOf(instance)
      .filter((nearby) => this.getSupportType(nearby) !== null);

    if (supportSources.length === 0) {
      return [];
    }

    const strongSources = supportSources.filter(
      (source) => this.getSupportType(source) === "strong"
    );

    const weakSources = supportSources.filter(
      (source) => this.getSupportType(source) === "weak"
    );

    const effects: SynergyEffect[] = [];

    effects.push(
      ...strongSources
        .slice(0, this.strongPopulationBonusBySourceIndex.length)
        .map((supportSource, index) =>
          this.createEffect(
            instance,
            supportSource,
            this.strongPopulationBonusBySourceIndex[index],
            "strong infrastructure/road production support"
          )
        )
    );

    effects.push(
      ...weakSources
        .slice(0, this.weakPopulationBonusBySourceIndex.length)
        .map((supportSource, index) =>
          this.createEffect(
            instance,
            supportSource,
            this.weakPopulationBonusBySourceIndex[index],
            "weak civic/service production support"
          )
        )
    );

    return effects;
  }

  private createEffect(
    industryInstance: PlacedBuildingInstance,
    supportSource: PlacedBuildingInstance,
    populationBonus: number,
    supportLabel: string
  ): SynergyEffect {
    return {
      ruleId: this.id,

      sourceInstanceId: industryInstance.id,
      sourceBuildingName: industryInstance.building.name,

      targetInstanceId: supportSource.id,
      targetBuildingName: supportSource.building.name,

      populationDelta: populationBonus,
      attractionDelta: 0,

      type: "positive",
      reason:
        `${industryInstance.building.name} gains +${populationBonus} production population ` +
        `from ${supportLabel} provided by ${supportSource.building.name}.`,
    };
  }

  private getSupportType(
    instance: PlacedBuildingInstance
  ): IndustrySupportType | null {
    const building = instance.building;

    if (
      building.family === "infrastructure" ||
      building.tags.includes("road") ||
      building.tags.includes("mobility")
    ) {
      return "strong";
    }

    if (
      building.family === "civic" ||
      building.tags.includes("service")
    ) {
      return "weak";
    }

    return null;
  }
}