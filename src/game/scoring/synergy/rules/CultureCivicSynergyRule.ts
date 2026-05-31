import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

type GridCell = {
  row: number;
  col: number;
};

export class CultureCivicSynergyRule implements SynergyRule {
  public readonly id = "culture-civic-synergy";

  private readonly radius: number;
  private readonly attractionBonusBySourceIndex: number[];

  constructor(
    radius: number = 2,
    attractionBonusBySourceIndex: number[] = [2, 1]
  ) {
    this.radius = radius;
    this.attractionBonusBySourceIndex = attractionBonusBySourceIndex;
  }

  public evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[] {
    if (instance.building.family !== "culture") {
      return [];
    }

    const civicSources = registry
      .getInstancesWithinManhattanRadius(
        instance.cells,
        this.radius,
        instance.id
      )
      .filter((nearby) => this.isCivicSupportSource(nearby));

    if (civicSources.length === 0) {
      return [];
    }

    const sortedCivicSources = this.sortSourcesByDistanceThenId(
      instance.cells,
      civicSources
    );

    return sortedCivicSources
      .slice(0, this.attractionBonusBySourceIndex.length)
      .map((civicSource, index) => {
        const attractionBonus = this.attractionBonusBySourceIndex[index];

        return {
          ruleId: this.id,

          sourceInstanceId: instance.id,
          sourceBuildingName: instance.building.name,

          targetInstanceId: civicSource.id,
          targetBuildingName: civicSource.building.name,

          populationDelta: 0,
          attractionDelta: attractionBonus,

          type: "positive",
          reason:
            `${instance.building.name} gains +${attractionBonus} attraction ` +
            `from nearby civic/service support provided by ${civicSource.building.name}.`,
        };
      });
  }

  private isCivicSupportSource(instance: PlacedBuildingInstance): boolean {
    return (
      instance.building.family === "civic" ||
      instance.building.tags.includes("service")
    );
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