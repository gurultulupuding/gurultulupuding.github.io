import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

type GridCell = {
  row: number;
  col: number;
};

export class ResidentialGreenSynergyRule implements SynergyRule {
  public readonly id = "residential-green-synergy";

  private readonly radius: number;
  private readonly populationBonusBySourceIndex: number[];

  constructor(
    radius: number = 2,
    populationBonusBySourceIndex: number[] = [1, 1]
  ) {
    this.radius = radius;
    this.populationBonusBySourceIndex = populationBonusBySourceIndex;
  }

  public evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[] {
    if (instance.building.family !== "residential") {
      return [];
    }

    const greenSources = registry
      .getInstancesWithinManhattanRadius(
        instance.cells,
        this.radius,
        instance.id
      )
      .filter((nearby) => nearby.building.tags.includes("green"));

    if (greenSources.length === 0) {
      return [];
    }

    const sortedGreenSources = this.sortSourcesByDistanceThenId(
      instance.cells,
      greenSources
    );

    return sortedGreenSources
      .slice(0, this.populationBonusBySourceIndex.length)
      .map((greenSource, index) => {
        const populationBonus = this.populationBonusBySourceIndex[index];

        return {
          ruleId: this.id,

          sourceInstanceId: instance.id,
          sourceBuildingName: instance.building.name,

          targetInstanceId: greenSource.id,
          targetBuildingName: greenSource.building.name,

          populationDelta: populationBonus,
          attractionDelta: 0,

          type: "positive",
          reason:
            `${instance.building.name} gains +${populationBonus} population ` +
            `from nearby green space provided by ${greenSource.building.name}.`,
        };
      });
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