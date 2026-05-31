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

export class CivicSeparationConsideration
  implements AIPlacementConsideration
{
  public readonly id = "civic-separation";

  private readonly minimumDistance: number;
  private readonly idealDistance: number;
  private readonly tooClosePenalty: number;
  private readonly idealBonus: number;
  private readonly farPenalty: number;

  public constructor(
    minimumDistance: number = 3,
    idealDistance: number = 4,
    tooClosePenalty: number = 14,
    idealBonus: number = 8,
    farPenalty: number = 3
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

    if (building.family !== "civic") {
      return {
        score: 0,
        reason: `${this.id}: not civic = 0`,
      };
    }

    const civicInstances = this.getCivicInstances(context);

    if (civicInstances.length === 0) {
      return {
        score: this.idealBonus,
        reason:
          `${this.id}: first civic/service placement, ` +
          `bonus=+${this.idealBonus}`,
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
          `${this.id}: civic too close to another civic/service, ` +
          `distance=${closestDistance}, minimum=${this.minimumDistance}, ` +
          `penalty=-${this.tooClosePenalty}`,
      };
    }

    if (closestDistance === this.idealDistance) {
      return {
        score: this.idealBonus,
        reason:
          `${this.id}: civic at ideal separation distance ` +
          `${this.idealDistance}, bonus=+${this.idealBonus}`,
      };
    }

    if (closestDistance > this.idealDistance + 3) {
      return {
        score: -this.farPenalty,
        reason:
          `${this.id}: civic too isolated from service network, ` +
          `distance=${closestDistance}, penalty=-${this.farPenalty}`,
      };
    }

    return {
      score: Math.floor(this.idealBonus / 2),
      reason:
        `${this.id}: civic has acceptable separation, ` +
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