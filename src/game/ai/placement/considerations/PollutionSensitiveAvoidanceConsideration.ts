import type {
  AIPlacementConsideration,
  AIPlacementConsiderationResult,
} from "../AIPlacementConsideration";
import type { AIPlacementEvaluationContext } from "../AIPlacementEvaluationContext";
import type { PlacedBuildingInstance } from "../../../../world/city/PlacedBuildingInstance";

type GridCell = {
  row: number;
  col: number;
};

export class PollutionSensitiveAvoidanceConsideration
  implements AIPlacementConsideration
{
  public readonly id = "pollution-sensitive-avoidance";

  private readonly radius: number;

  private readonly residentialPenaltyAtDistance1: number;
  private readonly residentialPenaltyAtDistance2: number;
  private readonly residentialPenaltyAtDistance3: number;

  private readonly culturePenaltyAtDistance1: number;
  private readonly culturePenaltyAtDistance2: number;
  private readonly culturePenaltyAtDistance3: number;

  private readonly globalDangerDistance: number;
  private readonly globalSafeDistance: number;
  private readonly residentialGlobalPenalty: number;
  private readonly cultureGlobalPenalty: number;
  private readonly safeDistanceBonus: number;

  constructor(
    radius: number = 3,

    residentialPenaltyAtDistance1: number = 16,
    residentialPenaltyAtDistance2: number = 10,
    residentialPenaltyAtDistance3: number = 5,

    culturePenaltyAtDistance1: number = 14,
    culturePenaltyAtDistance2: number = 9,
    culturePenaltyAtDistance3: number = 5,

    globalDangerDistance: number = 5,
    globalSafeDistance: number = 7,
    residentialGlobalPenalty: number = 12,
    cultureGlobalPenalty: number = 9,
    safeDistanceBonus: number = 6
  ) {
    this.radius = radius;

    this.residentialPenaltyAtDistance1 = residentialPenaltyAtDistance1;
    this.residentialPenaltyAtDistance2 = residentialPenaltyAtDistance2;
    this.residentialPenaltyAtDistance3 = residentialPenaltyAtDistance3;

    this.culturePenaltyAtDistance1 = culturePenaltyAtDistance1;
    this.culturePenaltyAtDistance2 = culturePenaltyAtDistance2;
    this.culturePenaltyAtDistance3 = culturePenaltyAtDistance3;

    this.globalDangerDistance = globalDangerDistance;
    this.globalSafeDistance = globalSafeDistance;
    this.residentialGlobalPenalty = residentialGlobalPenalty;
    this.cultureGlobalPenalty = cultureGlobalPenalty;
    this.safeDistanceBonus = safeDistanceBonus;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family !== "residential" && building.family !== "culture") {
      return {
        score: 0,
        reason: `${this.id}: not pollution-sensitive = 0`,
      };
    }

    const allPollutionSources = context.registry
      .getAll()
      .filter((instance) => instance.building.tags.includes("pollution"));

    if (allPollutionSources.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: no pollution in city = 0`,
      };
    }

    const nearbyPollutionSources = allPollutionSources.filter((pollutionSource) => {
      const distance = this.getMinimumManhattanDistanceBetweenCells(
        context.plan.cells,
        pollutionSource.cells
      );

      return distance <= this.radius;
    });

    let score = 0;
    const reasons: string[] = [];

    if (nearbyPollutionSources.length > 0) {
      let localPenalty = 0;

      for (const pollutionSource of nearbyPollutionSources) {
        const distance = this.getMinimumManhattanDistanceBetweenCells(
          context.plan.cells,
          pollutionSource.cells
        );

        localPenalty += this.getLocalPenaltyForDistance(
          building.family,
          distance
        );
      }

      score -= localPenalty;

      reasons.push(
        `${nearbyPollutionSources.length} nearby pollution source(s) ` +
          `within radius ${this.radius}, local penalty=-${localPenalty}`
      );
    }

    const closestPollutionDistance =
      this.getClosestDistanceToPollution(
        context.plan.cells,
        allPollutionSources
      );

    if (closestPollutionDistance <= this.globalDangerDistance) {
      const globalPenalty =
        building.family === "residential"
          ? this.residentialGlobalPenalty
          : this.cultureGlobalPenalty;

      score -= globalPenalty;

      reasons.push(
        `closest pollution distance=${closestPollutionDistance}, ` +
          `danger threshold=${this.globalDangerDistance}, ` +
          `global penalty=-${globalPenalty}`
      );
    } else if (closestPollutionDistance >= this.globalSafeDistance) {
      score += this.safeDistanceBonus;

      reasons.push(
        `closest pollution distance=${closestPollutionDistance}, ` +
          `safe distance=${this.globalSafeDistance}, ` +
          `safe placement bonus=+${this.safeDistanceBonus}`
      );
    } else {
      reasons.push(
        `closest pollution distance=${closestPollutionDistance}, neutral global distance=0`
      );
    }

    return {
      score,
      reason: `${this.id}: ${reasons.join(", ")}, total=${score}`,
    };
  }

  private getLocalPenaltyForDistance(
    family: string,
    distance: number
  ): number {
    if (family === "residential") {
      if (distance <= 1) {
        return this.residentialPenaltyAtDistance1;
      }

      if (distance === 2) {
        return this.residentialPenaltyAtDistance2;
      }

      return this.residentialPenaltyAtDistance3;
    }

    if (distance <= 1) {
      return this.culturePenaltyAtDistance1;
    }

    if (distance === 2) {
      return this.culturePenaltyAtDistance2;
    }

    return this.culturePenaltyAtDistance3;
  }

  private getClosestDistanceToPollution(
    planCells: GridCell[],
    pollutionSources: PlacedBuildingInstance[]
  ): number {
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const pollutionSource of pollutionSources) {
      const distance = this.getMinimumManhattanDistanceBetweenCells(
        planCells,
        pollutionSource.cells
      );

      if (distance < closestDistance) {
        closestDistance = distance;
      }
    }

    return closestDistance;
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