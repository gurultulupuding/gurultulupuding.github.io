import type { BuildingDefinition } from "../../../world/buildings/definitions/BuildingDefinition";
import type { PlacedBuildingInstance } from "../../../world/city/PlacedBuildingInstance";
import { PlacedBuildingRegistry } from "../../../world/city/PlacedBuildingRegistry";

type GridCell = {
  row: number;
  col: number;
};

export interface ResidentialCapacityBreakdown {
  baseCapacity: number;
  hasRoadAccess: boolean;
  roadMultiplier: number;
  capacityAfterRoadAccess: number;

  pollutionSources: PlacedBuildingInstance[];
  pollutionPenalty: number;

  effectiveCapacity: number;
}

export class ResidentialCapacityCalculator {
  private readonly pollutionRadius: number;
  private readonly capacityPenaltyPerPollutionSource: number;

  constructor(
    pollutionRadius: number = 2,
    capacityPenaltyPerPollutionSource: number = 2
  ) {
    this.pollutionRadius = pollutionRadius;
    this.capacityPenaltyPerPollutionSource =
      capacityPenaltyPerPollutionSource;
  }

  public calculateForPlacedInstance(
    instance: PlacedBuildingInstance,
    registry: PlacedBuildingRegistry
  ): ResidentialCapacityBreakdown {
    return this.calculate(
      instance.building,
      instance.cells,
      registry,
      instance.id
    );
  }

  public calculateForCandidate(
    building: BuildingDefinition,
    cells: GridCell[],
    registry: PlacedBuildingRegistry
  ): ResidentialCapacityBreakdown {
    return this.calculate(
      building,
      cells,
      registry,
      null
    );
  }

  private calculate(
    building: BuildingDefinition,
    cells: GridCell[],
    registry: PlacedBuildingRegistry,
    ignoredInstanceId: string | null
  ): ResidentialCapacityBreakdown {
    const baseCapacity =
      building.family === "residential"
        ? Math.max(0, building.basePopulation)
        : 0;

    if (baseCapacity === 0) {
      return {
        baseCapacity: 0,
        hasRoadAccess: false,
        roadMultiplier: 0.5,
        capacityAfterRoadAccess: 0,
        pollutionSources: [],
        pollutionPenalty: 0,
        effectiveCapacity: 0,
      };
    }

    const nearbyInstances = registry
      .getAll()
      .filter((instance) => instance.id !== ignoredInstanceId);

    const hasRoadAccess = nearbyInstances.some(
      (instance) =>
        instance.building.tags.includes("road") &&
        this.areCellsAdjacent(cells, instance.cells)
    );

    const roadMultiplier = hasRoadAccess ? 1 : 0.5;

    const capacityAfterRoadAccess = hasRoadAccess
      ? baseCapacity
      : Math.floor(baseCapacity * 0.5);

    const pollutionSources = nearbyInstances.filter(
      (instance) =>
        instance.building.tags.includes("pollution") &&
        this.isWithinManhattanRadius(
          cells,
          instance.cells,
          this.pollutionRadius
        )
    );

    const pollutionPenalty =
      pollutionSources.length * this.capacityPenaltyPerPollutionSource;

    const effectiveCapacity = Math.max(
      0,
      capacityAfterRoadAccess - pollutionPenalty
    );

    return {
      baseCapacity,
      hasRoadAccess,
      roadMultiplier,
      capacityAfterRoadAccess,
      pollutionSources,
      pollutionPenalty,
      effectiveCapacity,
    };
  }

  private areCellsAdjacent(
    firstCells: GridCell[],
    secondCells: GridCell[]
  ): boolean {
    for (const firstCell of firstCells) {
      for (const secondCell of secondCells) {
        const distance =
          Math.abs(firstCell.row - secondCell.row) +
          Math.abs(firstCell.col - secondCell.col);

        if (distance === 1) {
          return true;
        }
      }
    }

    return false;
  }

  private isWithinManhattanRadius(
    firstCells: GridCell[],
    secondCells: GridCell[],
    radius: number
  ): boolean {
    for (const firstCell of firstCells) {
      for (const secondCell of secondCells) {
        const distance =
          Math.abs(firstCell.row - secondCell.row) +
          Math.abs(firstCell.col - secondCell.col);

        if (distance <= radius) {
          return true;
        }
      }
    }

    return false;
  }
}