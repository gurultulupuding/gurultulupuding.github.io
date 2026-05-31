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

export class ResidentialCivicDistanceConsideration
  implements AIPlacementConsideration
{
  public readonly id = "residential-civic-distance";

  private readonly minimumDistance: number;
  private readonly idealDistance: number;
  private readonly tooClosePenalty: number;
  private readonly idealBonus: number;
  private readonly farPenalty: number;

  public constructor(
    minimumDistance: number = 2,
    idealDistance: number = 3,
    tooClosePenalty: number = 10,
    idealBonus: number = 6,
    farPenalty: number = 2
  ) {
    this.minimumDistance = minimumDistance;
    this.idealDistance = idealDistance;
    this.tooClosePenalty = tooClosePenalty;
    this.idealBonus = idealBonus;
    this.farPenalty = farPenalty;
  }

  public evaluate(
    context: AIPlacementEvaluationContext
  ): AIPlacementConsiderationResult {
    const building = context.plan.building;

    if (building.family !== "residential") {
      return {
        score: 0,
        reason: `${this.id}: not residential = 0`,
      };
    }

    const civicInstances = this.getCivicInstances(context);

    if (civicInstances.length === 0) {
      return {
        score: 0,
        reason: `${this.id}: no civic/service buildings yet = 0`,
      };
    }

    const closestDistance = this.getClosestDistanceToInstances(
      context.plan.cells,
      civicInstances
    );

    if (closestDistance < this.minimumDistance) {
      return {
        score: -this.tooClosePenalty,
        reason:
          `${this.id}: residential too close to civic/service, ` +
          `distance=${closestDistance}, minimum=${this.minimumDistance}, ` +
          `penalty=-${this.tooClosePenalty}`,
      };
    }

    if (closestDistance === this.idealDistance) {
      return {
        score: this.idealBonus,
        reason:
          `${this.id}: residential at healthy civic distance ` +
          `${this.idealDistance}, bonus=+${this.idealBonus}`,
      };
    }

    if (closestDistance > this.idealDistance + 4) {
      return {
        score: -this.farPenalty,
        reason:
          `${this.id}: residential far from civic/service, ` +
          `distance=${closestDistance}, small penalty=-${this.farPenalty}`,
      };
    }

    return {
      score: Math.floor(this.idealBonus / 2),
      reason:
        `${this.id}: residential has acceptable civic distance, ` +
        `distance=${closestDistance}, bonus=+${Math.floor(
          this.idealBonus / 2
        )}`,
    };
  }

  private getCivicInstances(
    context: AIPlacementEvaluationContext
  ): PlacedBuildingInstance[] {
    return context.registry.getAll().filter((instance) => {
      if (instance.owner !== "ai") {
        return false;
      }

      return this.isCivicLike(instance);
    });
  }

  private isCivicLike(instance: PlacedBuildingInstance): boolean {
    return (
      instance.building.family === "civic" ||
      instance.building.tags.includes("service") ||
      instance.building.tags.includes("administration")
    );
  }

  private getClosestDistanceToInstances(
    planCells: GridCell[],
    instances: PlacedBuildingInstance[]
  ): number {
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const planCell of planCells) {
      for (const instance of instances) {
        for (const instanceCell of instance.cells) {
          const distance =
            Math.abs(planCell.row - instanceCell.row) +
            Math.abs(planCell.col - instanceCell.col);

          if (distance < bestDistance) {
            bestDistance = distance;
          }
        }
      }
    }

    return bestDistance;
  }
}