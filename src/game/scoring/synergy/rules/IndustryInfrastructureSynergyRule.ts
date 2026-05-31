import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

type GridCell = {
  row: number;
  col: number;
};

type IndustrySupportType = "strong" | "weak";

export class IndustryInfrastructureSynergyRule implements SynergyRule {
  public readonly id = "industry-infrastructure-synergy";

  private readonly radius: number;
  private readonly strongPopulationBonusBySourceIndex: number[];
  private readonly weakPopulationBonusBySourceIndex: number[];

  constructor(
    radius: number = 2,
    strongPopulationBonusBySourceIndex: number[] = [2, 1],
    weakPopulationBonusBySourceIndex: number[] = [1]
  ) {
    this.radius = radius;
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

    const sortedSupportSources = this.sortSourcesByDistanceThenId(
      instance.cells,
      supportSources
    );

    const strongSources = sortedSupportSources.filter(
      (source) => this.getSupportType(source) === "strong"
    );

    const weakSources = sortedSupportSources.filter(
      (source) => this.getSupportType(source) === "weak"
    );

    const effects: SynergyEffect[] = [];

    effects.push(
      ...strongSources
        .slice(0, this.strongPopulationBonusBySourceIndex.length)
        .map((supportSource, index) => {
          const populationBonus =
            this.strongPopulationBonusBySourceIndex[index];

          return this.createEffect(
            instance,
            supportSource,
            populationBonus,
            "strong road/infrastructure"
          );
        })
    );

    effects.push(
      ...weakSources
        .slice(0, this.weakPopulationBonusBySourceIndex.length)
        .map((supportSource, index) => {
          const populationBonus =
            this.weakPopulationBonusBySourceIndex[index];

          return this.createEffect(
            instance,
            supportSource,
            populationBonus,
            "weak civic/service"
          );
        })
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
        `${industryInstance.building.name} gains +${populationBonus} population ` +
        `from ${supportLabel} support provided by ${supportSource.building.name}.`,
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

  private sortSourcesByDistanceThenId(
    sourceCells: GridCell[],
    sources: PlacedBuildingInstance[]
  ): PlacedBuildingInstance[] {
    return [...sources].sort((a, b) => {
      const distanceA = this.getMinimumManhattanDistanceBetweenCells(
        sourceCells,
        a.cells
      );

      const distanceB = this.getMinimumManhattanDistanceBetweenCells(
        sourceCells,
        b.cells
      );

      if (distanceA !== distanceB) {
        return distanceA - distanceB;
      }

      return a.id.localeCompare(b.id);
    });
  }

  private getMinimumManhattanDistanceBetweenCells(
    firstCells: GridCell[],
    secondCells: GridCell[]
  ): number {
    let minimumDistance = Number.POSITIVE_INFINITY;

    for (const firstCell of firstCells) {
      for (const secondCell of secondCells) {
        const distance =
          Math.abs(firstCell.row - secondCell.row) +
          Math.abs(firstCell.col - secondCell.col);

        if (distance < minimumDistance) {
          minimumDistance = distance;
        }
      }
    }

    return minimumDistance;
  }
}