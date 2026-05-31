import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../../world/city/PlacedBuildingRegistry";
import type { SynergyEffect } from "../SynergyEffect";
import type { SynergyRule } from "../SynergyRule";

type GridCell = {
  row: number;
  col: number;
};

export class InfrastructureCultureAccessRule implements SynergyRule {
  public readonly id = "infrastructure-culture-access";

  private readonly attractionBonusBySourceIndex: number[];

  constructor(attractionBonusBySourceIndex: number[] = [1]) {
    this.attractionBonusBySourceIndex = attractionBonusBySourceIndex;
  }

  public evaluate(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): SynergyEffect[] {
    if (instance.building.family !== "culture") {
      return [];
    }

    const accessSources = registry
      .getNeighborsOf(instance)
      .filter((nearby) => this.isAccessSource(nearby));

    if (accessSources.length === 0) {
      return [];
    }

    const sortedAccessSources = this.sortSourcesByDistanceThenId(
      instance.cells,
      accessSources
    );

    return sortedAccessSources
      .slice(0, this.attractionBonusBySourceIndex.length)
      .map((accessSource, index) => {
        const attractionBonus = this.attractionBonusBySourceIndex[index];

        return {
          ruleId: this.id,

          sourceInstanceId: instance.id,
          sourceBuildingName: instance.building.name,

          targetInstanceId: accessSource.id,
          targetBuildingName: accessSource.building.name,

          populationDelta: 0,
          attractionDelta: attractionBonus,

          type: "positive",
          reason:
            `${instance.building.name} gains +${attractionBonus} attraction ` +
            `from direct road/mobility access provided by ${accessSource.building.name}.`,
        };
      });
  }

  private isAccessSource(instance: PlacedBuildingInstance): boolean {
    return (
      instance.building.tags.includes("road") ||
      instance.building.tags.includes("mobility")
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