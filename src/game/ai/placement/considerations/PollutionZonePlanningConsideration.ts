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

export class PollutionZonePlanningConsideration
  implements AIPlacementConsideration
{
  public readonly id = "pollution-zone-planning";

  private readonly radius: number;
  private readonly lateGameStartTurn: number;

  private readonly pollutionClusterBonus: number;
  private readonly industryClusterBonus: number;
  private readonly earlyIsolationBonus: number;

  private readonly sensitivePenaltyAtDistance1: number;
  private readonly sensitivePenaltyAtDistance2: number;
  private readonly sensitivePenaltyAtDistance3: number;

  private readonly lateGamePenaltyMultiplier: number;

  private readonly globalSafeDistance: number;
  private readonly globalDangerDistance: number;
  private readonly globalIsolationBonus: number;
  private readonly globalClosenessPenalty: number;

  constructor(
    radius: number = 3,
    lateGameStartTurn: number = 12,

    pollutionClusterBonus: number = 8,
    industryClusterBonus: number = 5,
    earlyIsolationBonus: number = 8,

    sensitivePenaltyAtDistance1: number = 20,
    sensitivePenaltyAtDistance2: number = 14,
    sensitivePenaltyAtDistance3: number = 8,

    lateGamePenaltyMultiplier: number = 0.4,

    globalSafeDistance: number = 6,
    globalDangerDistance: number = 4,
    globalIsolationBonus: number = 10,
    globalClosenessPenalty: number = 18
  ) {
    this.radius = radius;
    this.lateGameStartTurn = lateGameStartTurn;

    this.pollutionClusterBonus = pollutionClusterBonus;
    this.industryClusterBonus = industryClusterBonus;
    this.earlyIsolationBonus = earlyIsolationBonus;

    this.sensitivePenaltyAtDistance1 = sensitivePenaltyAtDistance1;
    this.sensitivePenaltyAtDistance2 = sensitivePenaltyAtDistance2;
    this.sensitivePenaltyAtDistance3 = sensitivePenaltyAtDistance3;

    this.lateGamePenaltyMultiplier = lateGamePenaltyMultiplier;

    this.globalSafeDistance = globalSafeDistance;
    this.globalDangerDistance = globalDangerDistance;
    this.globalIsolationBonus = globalIsolationBonus;
    this.globalClosenessPenalty = globalClosenessPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (!building.tags.includes("pollution")) {
      return {
        score: 0,
        reason: `${this.id}: not pollution building = 0`,
      };
    }

    const allInstances = context.registry.getAll();

    const nearbyInstances =
      context.registry.getInstancesWithinManhattanRadius(
        context.plan.cells,
        this.radius
      );

    const nearbyPollution = nearbyInstances.filter((instance) =>
      instance.building.tags.includes("pollution")
    );

    const nearbyIndustry = nearbyInstances.filter(
      (instance) => instance.building.family === "industry"
    );

    const nearbySensitive = nearbyInstances.filter((instance) =>
      this.isPollutionSensitive(instance)
    );

    const allSensitive = allInstances.filter((instance) =>
      this.isPollutionSensitive(instance)
    );

    const isLateGame = context.currentTurn >= this.lateGameStartTurn;

    const lateGameMultiplier = isLateGame
      ? this.lateGamePenaltyMultiplier
      : 1;

    let score = 0;
    const reasons: string[] = [];

    if (nearbyPollution.length > 0) {
      const clusterScore =
        nearbyPollution.length * this.pollutionClusterBonus;

      score += clusterScore;

      reasons.push(
        `${nearbyPollution.length} nearby pollution source(s) ` +
          `× +${this.pollutionClusterBonus} = +${clusterScore}`
      );
    } else if (nearbyIndustry.length > 0) {
      const industryScore =
        nearbyIndustry.length * this.industryClusterBonus;

      score += industryScore;

      reasons.push(
        `${nearbyIndustry.length} nearby industry building(s) ` +
          `× +${this.industryClusterBonus} = +${industryScore}`
      );
    }

    if (nearbySensitive.length === 0 && !isLateGame) {
      score += this.earlyIsolationBonus;

      reasons.push(
        `no nearby sensitive building within radius ${this.radius}, ` +
          `early isolation=+${this.earlyIsolationBonus}`
      );
    }

    if (nearbySensitive.length > 0) {
      let localSensitivePenalty = 0;

      for (const sensitiveInstance of nearbySensitive) {
        const distance = this.getMinimumManhattanDistanceBetweenCells(
          context.plan.cells,
          sensitiveInstance.cells
        );

        localSensitivePenalty += this.getSensitivePenaltyForDistance(distance);
      }

      const adjustedPenalty = Math.round(
        localSensitivePenalty * lateGameMultiplier
      );

      score -= adjustedPenalty;

      reasons.push(
        `${nearbySensitive.length} nearby sensitive building(s), ` +
          `local raw penalty=-${localSensitivePenalty}, ` +
          `lateGameMultiplier=${lateGameMultiplier}, ` +
          `local final penalty=-${adjustedPenalty}`
      );
    }

    if (allSensitive.length > 0) {
      const globalIsolationResult =
        this.evaluateGlobalSensitiveIsolation(
          context.plan.cells,
          allSensitive,
          lateGameMultiplier,
          isLateGame
        );

      score += globalIsolationResult.score;
      reasons.push(globalIsolationResult.reason);
    } else if (!isLateGame) {
      score += this.globalIsolationBonus;

      reasons.push(
        `no sensitive buildings in city yet, pollution can start isolated zone ` +
          `= +${this.globalIsolationBonus}`
      );
    }

    if (reasons.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: neutral pollution placement = 0`,
      };
    }

    return {
      score,
      reason: `${this.id}: ${reasons.join(", ")}, total=${score}`,
    };
  }

  private evaluateGlobalSensitiveIsolation(
    planCells: GridCell[],
    sensitiveInstances: PlacedBuildingInstance[],
    lateGameMultiplier: number,
    isLateGame: boolean
  ): AIPlacementConsiderationResult {
    const distances = sensitiveInstances.map((instance) =>
      this.getMinimumManhattanDistanceBetweenCells(
        planCells,
        instance.cells
      )
    );

    const minimumDistance = Math.min(...distances);

    const averageDistance =
      distances.reduce((total, distance) => total + distance, 0) /
      distances.length;

    if (minimumDistance <= this.globalDangerDistance) {
      const rawPenalty =
        (this.globalDangerDistance - minimumDistance + 1) *
        this.globalClosenessPenalty;

      const adjustedPenalty = Math.round(rawPenalty * lateGameMultiplier);

      return {
        score: -adjustedPenalty,
        reason:
          `global sensitive isolation: closest sensitive distance=${minimumDistance}, ` +
          `danger threshold=${this.globalDangerDistance}, ` +
          `raw penalty=-${rawPenalty}, ` +
          `lateGameMultiplier=${lateGameMultiplier}, ` +
          `final=-${adjustedPenalty}`,
      };
    }

    if (!isLateGame && averageDistance >= this.globalSafeDistance) {
      return {
        score: this.globalIsolationBonus,
        reason:
          `global sensitive isolation: average sensitive distance=` +
          `${averageDistance.toFixed(2)} >= safe distance ${this.globalSafeDistance}, ` +
          `bonus=+${this.globalIsolationBonus}`,
      };
    }

    return {
      score: 0,
      reason:
        `global sensitive isolation: closest=${minimumDistance}, ` +
        `average=${averageDistance.toFixed(2)}, neutral=0`,
    };
  }

  private isPollutionSensitive(instance: PlacedBuildingInstance): boolean {
    return (
      instance.building.family === "residential" ||
      instance.building.family === "culture"
    );
  }

  private getSensitivePenaltyForDistance(distance: number): number {
    if (distance <= 1) {
      return this.sensitivePenaltyAtDistance1;
    }

    if (distance === 2) {
      return this.sensitivePenaltyAtDistance2;
    }

    return this.sensitivePenaltyAtDistance3;
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